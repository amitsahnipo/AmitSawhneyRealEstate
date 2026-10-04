import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.js';
import { generateToken, requireAuth, requireRole, AuthenticatedRequest } from './authMiddleware.js';
import { AMIT_SAWHNEY } from '../src/data/agent.js';
import { affordabilityStore } from './affordabilityStore.js';

export const authRouter = express.Router();

// 1. POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    // Consistent generic error for user enumeration defense
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check account lockout
  if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
    const minsRemaining = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
    return res.status(423).json({
      error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minsRemaining} minute(s).`
    });
  }

  // Verify password with bcrypt
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    const { locked, minutesRemaining } = db.recordFailedAttempt(user);
    if (locked) {
      return res.status(423).json({
        error: `Account locked for ${minutesRemaining} minutes due to 5 consecutive failed attempts.`
      });
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check user status
  if (user.status === 'INVITED') {
    return res.status(403).json({
      error: 'Your account has been invited but not yet activated. Please use your activation link to establish your password.'
    });
  }

  if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
    return res.status(403).json({
      error: 'Account access is currently restricted. Please contact your brokerage agent.'
    });
  }

  // Reset failed login attempts on successful authentication
  db.resetFailedAttempts(user);

  const token = generateToken(user, !!rememberMe);
  const sanitized = db.sanitizeUser(user);

  res.json({
    success: true,
    user: sanitized,
    token,
    expiresIn: rememberMe ? '30 days' : '12 hours',
    message: `Welcome back, ${user.fullName}!`
  });
});

// 2. POST /api/auth/register (Client self-registration ONLY - no self-assigned Agent role)
authRouter.post('/register', async (req, res) => {
  const { email, password, fullName, phone } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  // Create client account (role is forced to CLIENT for safety)
  const newUser = db.createUser({
    email,
    password,
    fullName,
    phone: phone || '',
    role: 'CLIENT',
    status: 'ACTIVE',
    assignedAgentId: 'agent-amit-sawhney'
  });

  const token = generateToken(newUser);
  const sanitized = db.sanitizeUser(newUser);

  res.status(201).json({
    success: true,
    message: 'Client account registered successfully.',
    user: sanitized,
    token,
    expiresIn: '12 hours'
  });
});

// 3. GET /api/auth/me (Current session validation)
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user
  });
});

// 4. POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  // Stateless JWT logout - client discards stored token
  res.json({
    success: true,
    message: 'Successfully logged out.'
  });
});

// 5. POST /api/auth/invite-client (Agent only)
authRouter.post('/invite-client', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
  const { email, fullName, phone } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ error: 'Full name and email are required to invite a client.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing && existing.status === 'ACTIVE') {
    return res.status(409).json({ error: 'A client with this email is already registered and active.' });
  }

  const invitation = db.createInvitation({
    email,
    fullName,
    phone,
    agentId: req.user!.id
  });

  res.status(201).json({
    success: true,
    message: `Invitation generated for ${fullName} (${email}).`,
    invitation,
    activationLink: `?action=activate&token=${invitation.token}`
  });
});

// 6. POST /api/auth/activate (Invited client sets password to activate)
authRouter.post('/activate', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Activation token and new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const invitation = db.getInvitation(token);
  if (!invitation) {
    return res.status(404).json({ error: 'Invalid or expired invitation token.' });
  }

  if (invitation.used) {
    return res.status(400).json({ error: 'This invitation has already been used. Please log in directly.' });
  }

  if (new Date() > new Date(invitation.expiresAt)) {
    return res.status(400).json({ error: 'This invitation has expired. Please request a new invitation from your agent.' });
  }

  // Check if an existing stub user exists or create new active user
  let user = db.findUserByEmail(invitation.email);
  if (user) {
    db.updateUserPassword(user.id, password);
    user.status = 'ACTIVE';
  } else {
    user = db.createUser({
      email: invitation.email,
      password,
      fullName: invitation.fullName,
      phone: invitation.phone,
      role: 'CLIENT',
      status: 'ACTIVE',
      assignedAgentId: invitation.invitedByAgentId
    });
  }

  db.markInvitationUsed(token);

  const sessionToken = generateToken(user);
  const sanitized = db.sanitizeUser(user);

  res.json({
    success: true,
    message: 'Account activated successfully! You are now logged in.',
    user: sanitized,
    token: sessionToken
  });
});

// 7. POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const resetToken = db.createPasswordResetToken(email);

  // Return standard success response regardless of email existence to prevent user enumeration
  res.json({
    success: true,
    message: 'If an account exists for this email, password reset instructions have been generated.',
    // For local preview and testing, include the reset token if generated
    demoResetToken: resetToken || undefined
  });
});

// 8. POST /api/auth/reset-password
authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const resetRecord = db.verifyResetToken(token);
  if (!resetRecord) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }

  const success = db.updateUserPassword(resetRecord.userId, newPassword);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }

  db.markResetTokenUsed(token);

  res.json({
    success: true,
    message: 'Your password has been successfully updated. Please log in with your new credentials.'
  });
});

// --- Role-Protected Routes ---

// 9. GET /api/agent/overview (Agent only: VIP leads, registered clients, invitations)
authRouter.get('/agent/overview', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
  const clients = db.getAllClientsForAgent(req.user!.id);
  const invitations = db.getAllInvitationsForAgent(req.user!.id);
  const allWorksheets = db.getAllWorksheets();

  res.json({
    agent: req.user,
    totalClients: clients.length,
    clients,
    invitations,
    worksheets: allWorksheets
  });
});

// 10. GET /api/client/my-portfolio (Client only: isolated to requesting user)
authRouter.get(['/client/my-portfolio', '/client/portfolio'], requireAuth, requireRole('CLIENT'), (req: AuthenticatedRequest, res) => {
  const worksheets = db.getWorksheetsForClient(req.user!.id);

  res.json({
    client: req.user,
    worksheets,
    assignedAgent: {
      name: AMIT_SAWHNEY.name,
      phone: AMIT_SAWHNEY.phoneFormatted,
      email: AMIT_SAWHNEY.email,
      license: AMIT_SAWHNEY.license,
      brokerage: AMIT_SAWHNEY.brokerage,
      photo: AMIT_SAWHNEY.photo
    }
  });
});

// 11. POST /api/client/worksheets (Client only: creates worksheet attached to client id)
authRouter.post('/client/worksheets', requireAuth, requireRole('CLIENT'), (req: AuthenticatedRequest, res) => {
  const { projectId, projectName, unitChoice1, unitChoice2, floorPlanName, notes } = req.body;

  if (!projectName || !unitChoice1) {
    return res.status(400).json({ error: 'Project name and primary unit choice are required.' });
  }

  const newWs = db.createWorksheet({
    userId: req.user!.id,
    projectId: projectId || 'custom-project',
    projectName,
    unitChoice1,
    unitChoice2,
    floorPlanName,
    buyerName: req.user!.fullName,
    phone: req.user!.phone || '',
    email: req.user!.email,
    depositStatus: 'Pending Verification',
    status: 'Submitted to Builder',
    notes,
    coolingOffPeriodEnd: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Worksheet submitted to Amit Sawhney for Platinum VIP Builder allocation.',
    worksheet: newWs
  });
});

// 12. GET /api/client/profile - Retrieve full client profile, stored affordability calculation, and offers
authRouter.get('/client/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const storedProfile = user.buyerFinancialProfile || affordabilityStore.getProfile(user.id) || (user.email ? affordabilityStore.getProfile(user.email) : null);
  const storedAssessment = user.affordabilityAssessment || affordabilityStore.getAssessment(user.id) || (user.email ? affordabilityStore.getAssessment(user.email) : null);
  const worksheets = db.getWorksheetsForClient(user.id);
  
  // Find all offers matching user email or id
  const allOffers = affordabilityStore.getOffers();
  const clientOffers = allOffers.filter(
    o => (user.email && o.buyerInfo?.email?.toLowerCase() === user.email.toLowerCase()) ||
         (user.fullName && o.buyerInfo?.fullName?.toLowerCase() === user.fullName.toLowerCase())
  );

  res.json({
    success: true,
    user,
    financialProfile: storedProfile || null,
    affordabilityAssessment: storedAssessment || null,
    worksheets,
    offers: clientOffers,
    assignedAgent: {
      name: AMIT_SAWHNEY.name,
      phone: AMIT_SAWHNEY.phoneFormatted,
      email: AMIT_SAWHNEY.email,
      license: AMIT_SAWHNEY.license,
      brokerage: AMIT_SAWHNEY.brokerage,
      photo: AMIT_SAWHNEY.photo
    }
  });
});

// 13. PUT /api/client/profile - Update client profile fields
authRouter.put('/client/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const updates = req.body;

  if (updates.buyerFinancialProfile) {
    affordabilityStore.saveProfile({
      ...updates.buyerFinancialProfile,
      userId: user.id,
      email: user.email
    });
  }

  const updatedUser = db.updateUserProfile(user.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: updatedUser
  });
});

// 14. GET /api/client/offers - Retrieve all submitted offers and progress for client
authRouter.get('/client/offers', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const allOffers = affordabilityStore.getOffers();
  
  const clientOffers = allOffers.filter(
    o => o.buyerInfo?.email?.toLowerCase() === user.email?.toLowerCase() ||
         o.buyerInfo?.fullName?.toLowerCase() === user.fullName?.toLowerCase()
  );

  res.json({
    success: true,
    offers: clientOffers,
    totalCount: clientOffers.length
  });
});

// --- Pre-Construction Document Vault & Digital Signatures ---

// 15. GET /api/client/documents - Retrieve all pre-con documents for authenticated client
authRouter.get('/client/documents', requireAuth, requireRole('CLIENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const docs = db.ensureClientDocuments(user);

  const pendingSignatureCount = docs.filter(d => d.status === 'Pending Signature').length;
  const signedCount = docs.filter(d => d.status === 'Signed & Executed').length;

  // Find shortest cooling off period
  const activeCoolingOffDoc = docs.find(d => d.coolingOffPeriodEnd && new Date(d.coolingOffPeriodEnd).getTime() > Date.now());
  let coolingOffDaysRemaining: number | null = null;
  if (activeCoolingOffDoc && activeCoolingOffDoc.coolingOffPeriodEnd) {
    coolingOffDaysRemaining = Math.max(
      0,
      Math.ceil((new Date(activeCoolingOffDoc.coolingOffPeriodEnd).getTime() - Date.now()) / (1000 * 3600 * 24))
    );
  }

  res.json({
    success: true,
    documents: docs,
    metrics: {
      totalCount: docs.length,
      pendingSignatureCount,
      signedCount,
      coolingOffDaysRemaining,
      unitNumber: docs[0]?.unitNumber || 'Suite 404',
      projectName: docs[0]?.projectName || 'Brooklin Trails By Tribute Communities'
    }
  });
});

// 16. POST /api/client/documents/:id/sign - Digitally sign a pre-construction legal document
authRouter.post('/client/documents/:id/sign', requireAuth, requireRole('CLIENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const documentId = req.params.id;
  const { signatureDataUrl, signatureType = 'draw', signerName, typedFont, legalConsentText } = req.body;

  const doc = db.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ success: false, error: 'Document not found in vault.' });
  }

  if (doc.userId !== user.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized access to this confidential unit document.' });
  }

  // Generate SHA-256 digital verification hash and unique certificate ID
  const timestamp = new Date().toISOString();
  const hashPayload = `${documentId}|${user.id}|${user.email}|${signerName || user.fullName}|${timestamp}`;
  const verificationHash = 'SHA256:' + crypto.createHash('sha256').update(hashPayload).digest('hex');
  const certificateId = `CERT-ECA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const signed = db.signDocument(documentId, user.id, {
    signerName: signerName?.trim() || user.fullName,
    signerEmail: user.email,
    signedAt: timestamp,
    signatureDataUrl: signatureDataUrl || undefined,
    signatureType: signatureType === 'type' ? 'type' : 'draw',
    typedFont: typedFont || undefined,
    ipAddress: clientIp,
    verificationHash,
    certificateId,
    legalConsentText:
      legalConsentText ||
      'I consent to electronic signature execution under the Ontario Electronic Commerce Act (ECA, 2000) and RECO digital guidelines.'
  });

  if (!signed) {
    return res.status(500).json({ success: false, error: 'Failed to record electronic signature.' });
  }

  res.json({
    success: true,
    message: `Document "${doc.title}" successfully signed and legally executed.`,
    document: signed,
    certificateId,
    verificationHash
  });
});

// 17. POST /api/client/documents/upload - Upload custom client document (e.g. proof of funds, lawyer waiver)
authRouter.post('/client/documents/upload', requireAuth, requireRole('CLIENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { title, category, description, unitNumber, projectName, fileSize = '1.2 MB', attachment, sourceType } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Document title is required.' });
  }

  const newDoc = db.createDocument({
    userId: user.id,
    title: title.trim(),
    category: category || 'APS Agreement',
    description: description || 'Client-uploaded document for pre-construction unit purchase file.',
    projectName: projectName || 'Brooklin Trails By Tribute Communities',
    projectId: 'brooklin-trails-tribute',
    unitNumber: unitNumber || 'Suite 404',
    unitModel: 'The Oakdale Elevation A',
    purchasePrice: 749900,
    builderName: 'Tribute Communities',
    status: 'Signed & Executed',
    fileSize: attachment?.fileSize || fileSize,
    pageCount: 2,
    requiresSignature: false,
    tags: ['Client Upload', 'Purchaser File', ...(attachment?.fileExtension ? [attachment.fileExtension.toUpperCase()] : [])],
    attachment: attachment ? {
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      fileDataUrl: attachment.fileDataUrl,
      fileExtension: attachment.fileExtension || attachment.fileName?.split('.').pop()?.toLowerCase() || '',
      uploadedAt: new Date().toISOString()
    } : undefined,
    sourceType: sourceType || (attachment ? 'uploaded_file' : 'client_upload'),
    documentContent: {
      summary: description || `Uploaded by ${user.fullName} to confidential pre-construction vault.`,
      keyClauses: []
    }
  });

  res.status(201).json({
    success: true,
    message: 'Document successfully deposited into your secure vault.',
    document: newDoc
  });
});

// 18. GET /api/agent/documents - Retrieve all pre-con documents across all VIP clients
authRouter.get('/agent/documents', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
  const agent = req.user!;
  const clientId = req.query.clientId as string | undefined;

  let docs = db.getAllDocumentsForAgent(agent.id);

  if (clientId) {
    docs = docs.filter(d => d.userId === clientId);
  }

  const pendingSignatureCount = docs.filter(d => d.status === 'Pending Signature').length;
  const signedCount = docs.filter(d => d.status === 'Signed & Executed').length;
  const coolingOffCount = docs.filter(
    d => d.coolingOffPeriodEnd && new Date(d.coolingOffPeriodEnd).getTime() > Date.now()
  ).length;

  res.json({
    success: true,
    documents: docs,
    metrics: {
      totalDocuments: docs.length,
      pendingSignatureCount,
      signedCount,
      coolingOffCount
    }
  });
});

// 19. POST /api/agent/documents/share - Agent shares a builder contract, floor plan, or addendum directly to a client's vault
authRouter.post('/agent/documents/share', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
  const agent = req.user!;
  const {
    clientId,
    title,
    category = 'APS Agreement',
    description,
    projectName = 'Brooklin Trails By Tribute Communities',
    projectId = 'brooklin-trails-tribute',
    unitNumber = 'Suite 404',
    unitModel = 'The Oakdale Elevation A',
    purchasePrice = 749900,
    builderName = 'Tribute Communities',
    requiresSignature = true,
    coolingOffDays = 10,
    coolingOffPeriodEnd,
    fileSize = '2.4 MB',
    pageCount = 4,
    tags = [],
    keyClauses = [],
    specifications = {},
    depositMilestones = [],
    attachment,
    sourceType
  } = req.body;

  if (!clientId) {
    return res.status(400).json({ success: false, error: 'Target VIP client ID is required.' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Document title is required.' });
  }

  const clientUser = db.findUserById(clientId);
  if (!clientUser) {
    return res.status(404).json({ success: false, error: 'Target client not found in VIP registry.' });
  }

  // Calculate cooling off period end if signature required and not explicitly supplied
  let computedCoolingOff: string | undefined = coolingOffPeriodEnd;
  if (requiresSignature && !computedCoolingOff && coolingOffDays) {
    computedCoolingOff = new Date(Date.now() + Number(coolingOffDays) * 24 * 3600 * 1000).toISOString();
  }

  const initialStatus = requiresSignature ? 'Pending Signature' : 'Reference Only';

  const docTags = Array.isArray(tags) && tags.length > 0 ? [...tags] : ['Shared by Agent', category, unitNumber];
  if (attachment) {
    docTags.push('Attached File');
    if (attachment.fileExtension) {
      docTags.push(attachment.fileExtension.toUpperCase());
    }
  }

  const newDoc = db.createDocument({
    userId: clientUser.id,
    title: title.trim(),
    category,
    description: description?.trim() || `Official builder document prepared and shared by ${agent.fullName} for ${unitNumber}.`,
    projectName: projectName.trim(),
    projectId: projectId.trim(),
    unitNumber: unitNumber.trim(),
    unitModel: unitModel.trim(),
    purchasePrice: Number(purchasePrice) || 749900,
    builderName: builderName.trim(),
    status: initialStatus,
    fileSize: attachment?.fileSize || fileSize || '1.8 MB',
    pageCount: Number(pageCount) || (attachment ? 1 : 3),
    coolingOffPeriodEnd: computedCoolingOff,
    requiresSignature: Boolean(requiresSignature),
    tags: Array.from(new Set(docTags)),
    attachment: attachment ? {
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      fileDataUrl: attachment.fileDataUrl,
      fileExtension: attachment.fileExtension || attachment.fileName?.split('.').pop()?.toLowerCase() || '',
      uploadedAt: new Date().toISOString()
    } : undefined,
    sourceType: sourceType || (attachment ? 'uploaded_file' : 'builder_template'),
    documentContent: {
      summary: description?.trim() || `Confidential pre-construction documentation shared with ${clientUser.fullName} by ${agent.fullName}.`,
      keyClauses: Array.isArray(keyClauses) && keyClauses.length > 0 ? keyClauses : [
        {
          title: 'RECO & Ontario ECA Fiduciary Transmission',
          clause: `Shared securely by licensed REALTOR® ${agent.fullName} (${agent.licenseNumber || 'RECO Registered'}) via Blueprint Realty Document Vault.`
        }
      ],
      specifications: typeof specifications === 'object' ? specifications : undefined,
      depositMilestones: Array.isArray(depositMilestones) && depositMilestones.length > 0 ? depositMilestones : undefined
    }
  });

  res.status(201).json({
    success: true,
    message: `Document "${newDoc.title}" successfully shared to ${clientUser.fullName}'s Document Vault.`,
    document: {
      ...newDoc,
      clientName: clientUser.fullName,
      clientEmail: clientUser.email
    }
  });
});

// 20. DELETE /api/agent/documents/:id - Agent revokes or removes a document from client vault
authRouter.delete('/agent/documents/:id', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
  const documentId = req.params.id;
  const doc = db.getDocumentById(documentId);

  if (!doc) {
    return res.status(404).json({ success: false, error: 'Document not found in vault.' });
  }

  const success = db.deleteDocument(documentId);
  if (!success) {
    return res.status(500).json({ success: false, error: 'Failed to revoke document.' });
  }

  res.json({
    success: true,
    message: `Document "${doc.title}" has been successfully removed from the client vault.`
  });
});

// 21. PATCH /api/agent/documents/:id - Agent updates document metadata or status
authRouter.patch('/agent/documents/:id', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
  const documentId = req.params.id;
  const updates = req.body;

  const existing = db.getDocumentById(documentId);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Document not found in vault.' });
  }

  const updated = db.updateDocument(documentId, updates);
  res.json({
    success: true,
    message: 'Document details successfully updated.',
    document: updated
  });
});


