import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { generateToken, requireAuth, requireRole, AuthenticatedRequest } from './authMiddleware.js';
import { AMIT_SAWHNEY } from '../src/data/agent.js';

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
