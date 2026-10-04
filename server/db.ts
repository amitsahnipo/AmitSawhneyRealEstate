import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthUser, UserRole, UserStatus, ClientWorksheet, ClientInvitation, CashbackInquiry, CashbackDealStatus, CashbackConfig, ClientVaultDocument, VaultDigitalSignature } from '../src/types.js';

export interface UserRecord extends AuthUser {
  passwordHash: string;
  failedLoginAttempts: number;
  lockoutUntil: number | null; // timestamp ms
  updatedAt: string;
}

export interface PasswordResetRecord {
  token: string;
  userId: string;
  email: string;
  expiresAt: number; // timestamp ms
  used: boolean;
}

// In-Memory Database with Pre-Seeded Accounts
class AuthDatabase {
  private users: Map<string, UserRecord> = new Map();
  private invitations: Map<string, ClientInvitation> = new Map();
  private resetTokens: Map<string, PasswordResetRecord> = new Map();
  private worksheets: Map<string, ClientWorksheet> = new Map();
  private cashbackInquiries: Map<string, CashbackInquiry> = new Map();
  private vaultDocuments: Map<string, ClientVaultDocument> = new Map();
  private cashbackConfig: CashbackConfig = {
    defaultCashbackPercent: 1.0,
    defaultCommissionRate: 2.5,
    minPurchasePrice: 300000,
    maxCashbackAmount: 50000,
    eligiblePropertyTypes: [
      'All Property Types',
      'High-Rise Condo',
      'Mid-Rise Condo',
      'Townhome',
      'Stacked Town',
      'Detached Home',
      'Semi-Detached'
    ],
    eligibleTransactionTypes: ['Pre-Construction', 'Resale'],
    requireRepresentationAgreement: true,
    disclaimer:
      'Potential cashback is provided through Amit Sawhney, Licensed REALTOR® with Blueprint Realty Brokerage Inc. on eligible pre-construction and resale purchase transactions. Actual cashback is subject to entering into a formal written Buyer Representation Agreement prior to submitting an offer or reservation, transaction eligibility, the co-operating commission actually received by the brokerage, completion of closing, and compliance with RECO regulations. Not intended to solicit buyers currently under an active representation agreement with another brokerage.'
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Pre-seeded Agent: truecondodeal@gmail.com / BlueprintVIP2026!
    const agentSalt = bcrypt.genSaltSync(10);
    const agentHash = bcrypt.hashSync('BlueprintVIP2026!', agentSalt);

    const agentUser: UserRecord = {
      id: 'agent-amit-sawhney',
      email: 'truecondodeal@gmail.com',
      passwordHash: agentHash,
      role: 'AGENT',
      status: 'ACTIVE',
      fullName: 'Amit Sawhney',
      phone: '(647) 895-3613',
      licenseNumber: 'RECO #4892105',
      brokerage: 'Blueprint Realty Brokerage Inc.',
      assignedAgentId: null,
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      lockoutUntil: null
    };

    this.users.set(agentUser.id, agentUser);

    // 2. Pre-seeded Client: david.m@example.com / ClientVIP2026!
    const clientSalt = bcrypt.genSaltSync(10);
    const clientHash = bcrypt.hashSync('ClientVIP2026!', clientSalt);

    const clientUser: UserRecord = {
      id: 'client-david-miller',
      email: 'david.m@example.com',
      passwordHash: clientHash,
      role: 'CLIENT',
      status: 'ACTIVE',
      fullName: 'David Miller',
      phone: '(416) 555-0192',
      assignedAgentId: 'agent-amit-sawhney',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      lockoutUntil: null,
      currentAddress: '128 Brock St E, Suite 305',
      city: 'Whitby',
      postalCode: 'L1N 2H4',
      buyerType: 'Move-Up Buyer',
      targetAreas: ['Whitby', 'Brooklin', 'Oshawa'],
      propertyTypePlanning: 'Pre-Construction Townhome',
      targetBudgetMin: 650000,
      targetBudgetMax: 850000,
      purchaseTimeline: '1-3 Months',
      coBuyerName: 'Sarah Miller',
      coBuyerEmail: 'sarah.miller@example.com',
      coBuyerPhone: '(416) 555-0193',
      coBuyerRelationship: 'Spouse',
      mortgagePreApprovalStatus: 'Fully Pre-Approved',
      preApprovalAmount: 800000,
      lenderOrBroker: 'RBC Royal Bank Mortgage Specialist',
      intendedDownPayment: 150000,
      downPaymentSource: 'Personal Savings & Investments',
      ownsExistingProperty: false,
      vipAccessTier: 'Platinum VIP Verified',
      representationAgreementStatus: 'Active (Signed with Amit Sawhney)',
      notes: 'Prefers 2+ bedroom pre-con townhomes in Whitby/Brooklin with parking and 9-foot ceilings.'
    };

    this.users.set(clientUser.id, clientUser);

    // 3. Pre-seeded Worksheet for Client David Miller
    const sampleWorksheet: ClientWorksheet = {
      id: 'ws-david-brooklin-01',
      userId: clientUser.id,
      projectId: 'brooklin-trails-tribute',
      projectName: 'Brooklin Trails By Tribute',
      unitChoice1: 'Suite 404 - The Oakdale 2-Bed Town (1,480 sq.ft)',
      unitChoice2: 'Suite 312 - The Pineview 3-Bed (1,620 sq.ft)',
      floorPlanName: 'The Oakdale 2-Bed Town',
      buyerName: 'David Miller',
      phone: '(416) 555-0192',
      email: 'david.m@example.com',
      depositStatus: '1st Milestone Received',
      status: 'Allocated',
      submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      coolingOffPeriodEnd: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
      notes: 'Requested builder capped development fees and assignment clause on 10-day review.'
    };

    this.worksheets.set(sampleWorksheet.id, sampleWorksheet);

    // 4. Sample pending invitation for testing activation workflow
    const sampleInviteToken = 'demo-activation-token-7789';
    const sampleInvitation: ClientInvitation = {
      id: 'inv-sample-priya',
      email: 'priya.sharma@example.ca',
      fullName: 'Priya Sharma',
      phone: '(647) 555-0482',
      role: 'CLIENT',
      invitedByAgentId: 'agent-amit-sawhney',
      token: sampleInviteToken,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(), // 48h
      used: false
    };

    this.invitations.set(sampleInviteToken, sampleInvitation);

    // 5. Seed Initial Cashback Deals
    const sampleCashback1: CashbackInquiry = {
      id: 'cb-david-brooklin',
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
      fullName: 'David Miller',
      email: 'david.m@example.com',
      phone: '(416) 555-0192',
      purchasePrice: 719469,
      propertyType: 'Townhome',
      transactionType: 'Pre-Construction',
      targetProjectOrArea: 'Brooklin Trails By Tribute',
      projectId: 'brooklin-trails-tribute',
      purchaseTimeframe: 'Immediate (1-3 months)',
      workingWithRealtor: false,
      notes: 'Interested in The Oakdale floor plan with VIP incentives and 1% cashback on closing.',
      estimatedCashback: 7195,
      confirmedCashbackAmount: 7195,
      commissionRate: 2.5,
      builderIncentivesEstimated: '$10,000 Signing Bonus + Free Assignment ($5,000 value) + Capped Levies',
      status: 'Eligibility Confirmed',
      userId: clientUser.id,
      closingDate: 'October 2027'
    };

    const sampleCashback2: CashbackInquiry = {
      id: 'cb-priya-resale',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.ca',
      phone: '(647) 555-0482',
      purchasePrice: 899000,
      propertyType: 'Semi-Detached',
      transactionType: 'Resale',
      targetProjectOrArea: 'Durham Region / Whitby',
      purchaseTimeframe: '3-6 months',
      workingWithRealtor: false,
      notes: 'First time buyer looking for professional offer representation and cashback toward closing costs.',
      estimatedCashback: 8990,
      commissionRate: 2.5,
      status: 'Inquiry'
    };

    this.cashbackInquiries.set(sampleCashback1.id, sampleCashback1);
    this.cashbackInquiries.set(sampleCashback2.id, sampleCashback2);

    // 6. Seed Pre-Construction Documents for Client David Miller (Unit 404 - Brooklin Trails)
    const seedDocs: ClientVaultDocument[] = [
      {
        id: 'doc-aps-brooklin-404',
        userId: clientUser.id,
        title: 'Agreement of Purchase and Sale (APS) — Unit 404',
        category: 'APS Agreement',
        description: 'Standard OREA & Tribute Communities Pre-Construction Agreement of Purchase and Sale for Unit 404, The Oakdale Elevation A.',
        projectName: 'Brooklin Trails By Tribute Communities',
        projectId: 'brooklin-trails-tribute',
        unitNumber: 'Suite 404',
        unitModel: 'The Oakdale Elevation A (1,480 sq.ft)',
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Pending Signature',
        fileSize: '2.4 MB',
        pageCount: 14,
        coolingOffPeriodEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        requiresSignature: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        tags: ['APS', 'Core Agreement', '10-Day Review', 'Condo Act'],
        documentContent: {
          summary: 'Formal Agreement of Purchase and Sale executed between Tribute Communities (Vendor) and David Miller (Purchaser) for Unit 404 at Brooklin Trails.',
          keyClauses: [
            {
              title: '10-Day Statutory Rescission Period (Cooling Off)',
              clause: 'Pursuant to Section 73 of the Ontario Condominium Act, 1998, the Purchaser has the statutory right to rescind this agreement within 10 days of receiving this signed copy and the disclosure statement.'
            },
            {
              title: 'Capped Municipal & Education Development Levies',
              clause: 'Development charges, educational levies, and municipal park dedication fees are guaranteed capped at a maximum of $7,500 + HST for this unit.'
            },
            {
              title: 'Assignment Rights Prior to Closing',
              clause: 'The Purchaser is permitted one (1) assignment of this Agreement to a qualified buyer after 90% of total deposit is received, with the standard builder assignment administrative fee of $5,000 waived.'
            },
            {
              title: 'Interim Occupancy & Lease Permission',
              clause: 'The Purchaser is granted the right to lease the unit during the interim occupancy period prior to final condominium title registration without penalty.'
            }
          ],
          depositMilestones: [
            { label: 'Initial Deposit with Offer', amount: 10000, dueDate: 'Paid Upon Signing', status: 'Paid' },
            { label: 'Balance to 5% (Day 30)', amount: 27495, dueDate: '30 Days from Acceptance', status: 'Scheduled' },
            { label: 'Second Installment (5% - Day 120)', amount: 37495, dueDate: '120 Days from Acceptance', status: 'Scheduled' },
            { label: 'Third Installment (5% - Day 270)', amount: 37495, dueDate: '270 Days from Acceptance', status: 'Scheduled' },
            { label: 'Final Deposit on Occupancy (5%)', amount: 37495, dueDate: 'Estimated Occupancy (Nov 2027)', status: 'Scheduled' }
          ],
          specifications: {
            'Property Type': '2-Storey Luxury Townhome with Built-in Garage',
            'Interior Living Area': '1,480 sq.ft + 120 sq.ft Private Deck',
            'Ceiling Height': '9-foot smooth ceilings on main level, 8-foot on second level',
            'Parking & Locker': '1 Private Single-Car Garage + 1 Private Driveway Parking Space Included',
            'Tentative Occupancy': 'November 15, 2027'
          }
        }
      },
      {
        id: 'doc-floorplan-oakdale-404',
        userId: clientUser.id,
        title: 'Architectural Floor Plan Addendum — The Oakdale A',
        category: 'Floor Plan Addendum',
        description: 'Certified builder architectural plan, dimension certifications, Schedule A electrical layout, and finishes schedule.',
        projectName: 'Brooklin Trails By Tribute Communities',
        projectId: 'brooklin-trails-tribute',
        unitNumber: 'Suite 404',
        unitModel: 'The Oakdale Elevation A',
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Pending Signature',
        fileSize: '1.8 MB',
        pageCount: 4,
        coolingOffPeriodEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        requiresSignature: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        tags: ['Floor Plan', 'Architecture', 'Finishes Schedule', 'Terrace'],
        documentContent: {
          summary: 'Schedule A architectural plan showing room dimensions, electrical layout, window placements, and premium finishes package for Unit 404.',
          keyClauses: [
            {
              title: 'Square Footage & Architectural Tolerances',
              clause: 'Gross floor area measured in accordance with Tarion Bulletin 22. Actual usable floor space may vary within standard architectural tolerances up to 2%.'
            },
            {
              title: 'Schedule A Finishes Specification',
              clause: 'Includes Caesarstone quartz countertops in kitchen and primary ensuite, engineered wide-plank hardwood flooring on main level, and 40-ounce plush broadloom in bedrooms.'
            },
            {
              title: 'Mechanical & HVAC Enclosures',
              clause: 'High-efficiency heat pump and energy recovery ventilator (ERV) system included with smart touchscreen programmable thermostat.'
            }
          ],
          specifications: {
            'Model Elevation': 'Elevation A Contemporary Brick & Stone Façade',
            'Primary Bedroom': '14\'6" x 12\'4" with 4-piece Ensuite & Walk-in Closet',
            'Bedroom 2': '11\'2" x 10\'8" with double closet',
            'Living / Dining': '18\'4" x 13\'6" Open Concept with walk-out to terrace',
            'Kitchen': '12\'0" x 9\'6" with Island and Breakfast Bar'
          }
        }
      },
      {
        id: 'doc-vip-incentives-404',
        userId: clientUser.id,
        title: 'Platinum VIP Buyer Incentive & Levy Rider',
        category: 'VIP Incentives & Levies',
        description: 'Signed Platinum VIP rider securing $10,000 decor credit, capped municipal levies, and free assignment rights negotiated by Amit Sawhney.',
        projectName: 'Brooklin Trails By Tribute Communities',
        projectId: 'brooklin-trails-tribute',
        unitNumber: 'Suite 404',
        unitModel: 'The Oakdale Elevation A',
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Signed & Executed',
        fileSize: '850 KB',
        pageCount: 3,
        requiresSignature: false,
        signature: {
          signerName: 'Amit Sawhney (REALTOR®) & Tribute Sales Director',
          signerEmail: 'truecondodeal@gmail.com',
          signedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          signatureType: 'type',
          verificationHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          certificateId: 'CERT-VIP-TRB-404',
          legalConsentText: 'Executed under Platinum VIP Brokerage Agency Agreement'
        },
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        tags: ['VIP Incentives', 'Capped Levies', 'Decor Dollars', 'Assignment Clause'],
        documentContent: {
          summary: 'Exclusive Platinum VIP Incentive Package rider attached to and forming part of the Agreement of Purchase and Sale for Unit 404.',
          keyClauses: [
            {
              title: '$10,000 Builder Decor Dollar Allowance',
              clause: 'Purchaser is credited $10,000 at the Tribute Décor Studio towards interior upgrades, cabinetry, tiles, and fixtures.'
            },
            {
              title: 'Capped Municipal Levies at $7,500',
              clause: 'Town of Whitby, Regional Municipality of Durham, and School Board development charges are capped at $7,500 total (saving estimated $15,000+).'
            },
            {
              title: 'Free Assignment Privilege',
              clause: 'Right to assign the agreement with standard builder fee waived (standard cost: $5,000 + $950 legal).'
            }
          ]
        }
      },
      {
        id: 'doc-tarion-critical-dates-404',
        userId: clientUser.id,
        title: 'Tarion Warranty Information & Statement of Critical Dates',
        category: 'Tarion Disclosure',
        description: 'Mandatory Ontario new home warranty disclosure detailing critical construction milestone dates and delayed closing protections.',
        projectName: 'Brooklin Trails By Tribute Communities',
        projectId: 'brooklin-trails-tribute',
        unitNumber: 'Suite 404',
        unitModel: 'The Oakdale Elevation A',
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Reference Only',
        fileSize: '1.2 MB',
        pageCount: 6,
        requiresSignature: false,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        tags: ['Tarion', 'Critical Dates', 'Ontario Warranty', 'Statutory Disclosure'],
        documentContent: {
          summary: 'Tarion Addendum setting out the firm and tentative occupancy dates and statutory warranty coverage for Unit 404.',
          keyClauses: [
            {
              title: 'First Tentative Occupancy Date',
              clause: 'Scheduled for November 15, 2027. Vendor may extend this date by up to 120 days by giving 90 days prior written notice.'
            },
            {
              title: 'Delayed Occupancy Compensation',
              clause: 'If occupancy is delayed beyond the Firm Occupancy Date without mutual agreement, Purchaser is entitled to $150/day up to a maximum of $7,500 plus living expenses.'
            },
            {
              title: 'Tarion Warranty Protection Coverage',
              clause: '7-Year Major Structural Defect Protection ($400,000 limit), 2-Year Water Penetration & Building Envelope Protection, 1-Year Comprehensive Workmanship Protection.'
            }
          ]
        }
      },
      {
        id: 'doc-deposit-receipt-10k-404',
        userId: clientUser.id,
        title: 'Trust Account Deposit Receipt — $10,000 Initial Draft',
        category: 'Deposit Receipt',
        description: 'Certified escrow trust account receipt confirming initial bank draft received and credited towards pre-construction unit purchase.',
        projectName: 'Brooklin Trails By Tribute Communities',
        projectId: 'brooklin-trails-tribute',
        unitNumber: 'Suite 404',
        unitModel: 'The Oakdale Elevation A',
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Signed & Executed',
        fileSize: '420 KB',
        pageCount: 1,
        requiresSignature: false,
        signature: {
          signerName: 'Tribute Communities Trust Escrow Dept.',
          signerEmail: 'trust@tributecommunities.com',
          signedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
          signatureType: 'type',
          verificationHash: 'SHA256:3a1b9487c0e5a8f420516d2146e492bbd29e7c5ff0efefd8717efd03ae7f6b98',
          certificateId: 'RECEIPT-TRB-404-01',
          legalConsentText: 'Official Escrow Trust Receipt under Real Estate and Business Brokers Act'
        },
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        tags: ['Deposit Receipt', 'Escrow Trust', 'Initial $10K', 'Verified'],
        documentContent: {
          summary: 'Trust deposit confirmation of $10,000.00 CAD received by certified bank draft in trust for Unit 404 at Brooklin Trails.',
          keyClauses: [
            {
              title: 'Insured Escrow Account',
              clause: 'Funds held in segregated interest-bearing trust account in accordance with Section 81 of the Ontario Condominium Act.'
            }
          ],
          depositMilestones: [
            { label: 'Initial Bank Draft (Received)', amount: 10000, dueDate: 'Confirmed Received', status: 'Paid' },
            { label: 'Balance to 5% (Day 30)', amount: 27495, dueDate: 'Within 30 Days of Acceptance', status: 'Upcoming' }
          ]
        }
      }
    ];

    seedDocs.forEach(d => this.vaultDocuments.set(d.id, d));
  }

  // --- User Queries & Mutations ---
  public findUserByEmail(email: string): UserRecord | undefined {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase().trim() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  public getAllClientsForAgent(agentId: string): AuthUser[] {
    const clients: AuthUser[] = [];
    for (const u of this.users.values()) {
      if (u.role === 'CLIENT' && (u.assignedAgentId === agentId || !u.assignedAgentId)) {
        clients.push(this.sanitizeUser(u));
      }
    }
    return clients;
  }

  public createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    status?: UserStatus;
    assignedAgentId?: string | null;
  }): UserRecord {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);

    const newUser: UserRecord = {
      id: `usr_${userData.role.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      email: userData.email.toLowerCase().trim(),
      passwordHash,
      role: userData.role,
      status: userData.status || 'ACTIVE',
      fullName: userData.fullName.trim(),
      phone: userData.phone?.trim() || '',
      assignedAgentId: userData.assignedAgentId !== undefined ? userData.assignedAgentId : 'agent-amit-sawhney',
      licenseNumber: userData.role === 'AGENT' ? 'RECO Registered' : undefined,
      brokerage: userData.role === 'AGENT' ? 'Blueprint Realty Brokerage Inc.' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      lockoutUntil: null
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  public updateUserPassword(userId: string, newPassword: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    return true;
  }

  public updateUserProfile(userId: string, updates: Partial<AuthUser>): AuthUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.currentAddress !== undefined) user.currentAddress = updates.currentAddress;
    if (updates.city !== undefined) user.city = updates.city;
    if (updates.postalCode !== undefined) user.postalCode = updates.postalCode;
    if (updates.buyerType !== undefined) user.buyerType = updates.buyerType;
    if (updates.targetAreas !== undefined) user.targetAreas = updates.targetAreas;
    if (updates.propertyTypePlanning !== undefined) user.propertyTypePlanning = updates.propertyTypePlanning;
    if (updates.targetBudgetMin !== undefined) user.targetBudgetMin = Number(updates.targetBudgetMin);
    if (updates.targetBudgetMax !== undefined) user.targetBudgetMax = Number(updates.targetBudgetMax);
    if (updates.purchaseTimeline !== undefined) user.purchaseTimeline = updates.purchaseTimeline;
    if (updates.coBuyerName !== undefined) user.coBuyerName = updates.coBuyerName;
    if (updates.coBuyerEmail !== undefined) user.coBuyerEmail = updates.coBuyerEmail;
    if (updates.coBuyerPhone !== undefined) user.coBuyerPhone = updates.coBuyerPhone;
    if (updates.coBuyerRelationship !== undefined) user.coBuyerRelationship = updates.coBuyerRelationship;
    if (updates.mortgagePreApprovalStatus !== undefined) user.mortgagePreApprovalStatus = updates.mortgagePreApprovalStatus;
    if (updates.preApprovalAmount !== undefined) user.preApprovalAmount = Number(updates.preApprovalAmount);
    if (updates.lenderOrBroker !== undefined) user.lenderOrBroker = updates.lenderOrBroker;
    if (updates.intendedDownPayment !== undefined) user.intendedDownPayment = Number(updates.intendedDownPayment);
    if (updates.downPaymentSource !== undefined) user.downPaymentSource = updates.downPaymentSource;
    if (updates.ownsExistingProperty !== undefined) user.ownsExistingProperty = Boolean(updates.ownsExistingProperty);
    if (updates.dependsOnSaleOfCurrentHome !== undefined) user.dependsOnSaleOfCurrentHome = Boolean(updates.dependsOnSaleOfCurrentHome);
    if (updates.notes !== undefined) user.notes = updates.notes;
    if (updates.vipAccessTier !== undefined) user.vipAccessTier = updates.vipAccessTier;
    if (updates.representationAgreementStatus !== undefined) user.representationAgreementStatus = updates.representationAgreementStatus;
    if (updates.affordabilityAssessment !== undefined) user.affordabilityAssessment = updates.affordabilityAssessment;
    if (updates.buyerFinancialProfile !== undefined) user.buyerFinancialProfile = updates.buyerFinancialProfile;

    user.updatedAt = new Date().toISOString();
    return this.sanitizeUser(user);
  }

  public recordFailedAttempt(user: UserRecord): { locked: boolean; minutesRemaining?: number } {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      // Lock for 15 minutes
      user.lockoutUntil = Date.now() + 15 * 60 * 1000;
      return { locked: true, minutesRemaining: 15 };
    }
    return { locked: false };
  }

  public resetFailedAttempts(user: UserRecord): void {
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
  }

  // --- Invitation Methods ---
  public createInvitation(params: {
    email: string;
    fullName: string;
    phone?: string;
    agentId: string;
  }): ClientInvitation {
    const token = crypto.randomBytes(24).toString('hex');
    const invitation: ClientInvitation = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: params.email.toLowerCase().trim(),
      fullName: params.fullName.trim(),
      phone: params.phone?.trim() || '',
      role: 'CLIENT',
      invitedByAgentId: params.agentId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // 48 hours
      used: false
    };

    this.invitations.set(token, invitation);
    return invitation;
  }

  public getInvitation(token: string): ClientInvitation | undefined {
    return this.invitations.get(token);
  }

  public markInvitationUsed(token: string): void {
    const inv = this.invitations.get(token);
    if (inv) {
      inv.used = true;
    }
  }

  public getAllInvitationsForAgent(agentId: string): ClientInvitation[] {
    const list: ClientInvitation[] = [];
    for (const inv of this.invitations.values()) {
      if (inv.invitedByAgentId === agentId) {
        list.push(inv);
      }
    }
    return list;
  }

  // --- Password Reset Tokens ---
  public createPasswordResetToken(email: string): string | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;

    const token = crypto.randomBytes(24).toString('hex');
    const resetRecord: PasswordResetRecord = {
      token,
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      used: false
    };

    this.resetTokens.set(token, resetRecord);
    return token;
  }

  public verifyResetToken(token: string): PasswordResetRecord | null {
    const record = this.resetTokens.get(token);
    if (!record) return null;
    if (record.used) return null;
    if (Date.now() > record.expiresAt) return null;
    return record;
  }

  public markResetTokenUsed(token: string): void {
    const record = this.resetTokens.get(token);
    if (record) {
      record.used = true;
    }
  }

  // --- Worksheets & Client Data Isolation ---
  public getWorksheetsForClient(userId: string): ClientWorksheet[] {
    const results: ClientWorksheet[] = [];
    for (const ws of this.worksheets.values()) {
      if (ws.userId === userId) {
        results.push(ws);
      }
    }
    return results;
  }

  public getAllWorksheets(): ClientWorksheet[] {
    return Array.from(this.worksheets.values());
  }

  public createWorksheet(ws: Omit<ClientWorksheet, 'id' | 'submittedAt'>): ClientWorksheet {
    const newWs: ClientWorksheet = {
      ...ws,
      id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      submittedAt: new Date().toISOString()
    };
    this.worksheets.set(newWs.id, newWs);
    return newWs;
  }

  // --- Cashback Program Inquiries & Configuration ---
  public getCashbackConfig(): CashbackConfig {
    return { ...this.cashbackConfig };
  }

  public updateCashbackConfig(newConfig: Partial<CashbackConfig>): CashbackConfig {
    this.cashbackConfig = {
      ...this.cashbackConfig,
      ...newConfig
    };
    return { ...this.cashbackConfig };
  }

  public getAllCashbackInquiries(): CashbackInquiry[] {
    return Array.from(this.cashbackInquiries.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCashbackInquiriesForUser(userId: string, email?: string): CashbackInquiry[] {
    const list: CashbackInquiry[] = [];
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    for (const inq of this.cashbackInquiries.values()) {
      if (inq.userId === userId || (normalizedEmail && inq.email.toLowerCase().trim() === normalizedEmail)) {
        list.push(inq);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createCashbackInquiry(
    inquiry: Omit<CashbackInquiry, 'id' | 'createdAt' | 'status'> & { status?: CashbackDealStatus }
  ): CashbackInquiry {
    const id = `cb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();

    const newInquiry: CashbackInquiry = {
      ...inquiry,
      id,
      createdAt: now,
      status: inquiry.status || 'Inquiry',
      updatedAt: now
    };

    this.cashbackInquiries.set(id, newInquiry);
    return newInquiry;
  }

  public updateCashbackInquiry(id: string, updates: Partial<CashbackInquiry>): CashbackInquiry | null {
    const existing = this.cashbackInquiries.get(id);
    if (!existing) return null;

    const updated: CashbackInquiry = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      createdAt: existing.createdAt, // Immutable creation timestamp
      updatedAt: new Date().toISOString()
    };

    this.cashbackInquiries.set(id, updated);
    return updated;
  }

  // --- Pre-Construction Document Vault Operations ---
  public getDocumentsForClient(userId: string): ClientVaultDocument[] {
    const docs: ClientVaultDocument[] = [];
    for (const doc of this.vaultDocuments.values()) {
      if (doc.userId === userId) {
        docs.push(doc);
      }
    }

    // Sort: Pending signature first, then by updatedAt descending
    return docs.sort((a, b) => {
      if (a.status === 'Pending Signature' && b.status !== 'Pending Signature') return -1;
      if (b.status === 'Pending Signature' && a.status !== 'Pending Signature') return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  public getDocumentById(documentId: string): ClientVaultDocument | undefined {
    return this.vaultDocuments.get(documentId);
  }

  public signDocument(
    documentId: string,
    userId: string,
    signature: VaultDigitalSignature
  ): ClientVaultDocument | null {
    const doc = this.vaultDocuments.get(documentId);
    if (!doc || doc.userId !== userId) {
      return null;
    }

    const now = new Date().toISOString();
    const updatedDoc: ClientVaultDocument = {
      ...doc,
      status: 'Signed & Executed',
      requiresSignature: false,
      signature: {
        ...signature,
        signedAt: signature.signedAt || now
      },
      updatedAt: now
    };

    this.vaultDocuments.set(documentId, updatedDoc);
    return updatedDoc;
  }

  public createDocument(
    docData: Omit<ClientVaultDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): ClientVaultDocument {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    const newDoc: ClientVaultDocument = {
      ...docData,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.vaultDocuments.set(id, newDoc);
    return newDoc;
  }

  public getAllDocumentsForAgent(agentId: string): Array<ClientVaultDocument & { clientName?: string; clientEmail?: string; clientPhone?: string }> {
    const clients = this.getAllClientsForAgent(agentId);
    const clientMap = new Map<string, AuthUser>();
    clients.forEach(c => clientMap.set(c.id, c));

    // Also include other clients in case documents are linked to any registered user
    for (const u of this.users.values()) {
      if (u.role === 'CLIENT' && !clientMap.has(u.id)) {
        clientMap.set(u.id, this.sanitizeUser(u));
      }
    }

    const results: Array<ClientVaultDocument & { clientName?: string; clientEmail?: string; clientPhone?: string }> = [];
    for (const doc of this.vaultDocuments.values()) {
      const client = clientMap.get(doc.userId);
      results.push({
        ...doc,
        clientName: client?.fullName || 'VIP Purchaser',
        clientEmail: client?.email || '',
        clientPhone: client?.phone || ''
      });
    }

    // Sort by updatedAt descending
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public deleteDocument(documentId: string): boolean {
    return this.vaultDocuments.delete(documentId);
  }

  public updateDocument(documentId: string, updates: Partial<ClientVaultDocument>): ClientVaultDocument | null {
    const doc = this.vaultDocuments.get(documentId);
    if (!doc) return null;
    const updated: ClientVaultDocument = {
      ...doc,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.vaultDocuments.set(documentId, updated);
    return updated;
  }

  public ensureClientDocuments(user: AuthUser): ClientVaultDocument[] {
    const existing = this.getDocumentsForClient(user.id);
    if (existing.length > 0) {
      return existing;
    }

    // Look for any worksheet submitted by this client to customize unit info
    const worksheets = this.getWorksheetsForClient(user.id);
    const primaryWs = worksheets[0];

    const projectName = primaryWs?.projectName || 'Brooklin Trails By Tribute Communities';
    const projectId = primaryWs?.projectId || 'brooklin-trails-tribute';
    const unitNumber = primaryWs?.unitChoice1?.match(/Suite\s+\d+|Unit\s+\d+/i)?.[0] || 'Suite 404';
    const unitModel = primaryWs?.floorPlanName || 'The Oakdale Elevation A (1,480 sq.ft)';

    const userDocs: ClientVaultDocument[] = [
      {
        id: `doc-aps-${user.id.slice(-6)}`,
        userId: user.id,
        title: `Agreement of Purchase and Sale (APS) — ${unitNumber}`,
        category: 'APS Agreement',
        description: `Official OREA Pre-Construction Agreement of Purchase and Sale for ${unitNumber}, ${unitModel} at ${projectName}.`,
        projectName,
        projectId,
        unitNumber,
        unitModel,
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Pending Signature',
        fileSize: '2.4 MB',
        pageCount: 14,
        coolingOffPeriodEnd: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(),
        requiresSignature: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['APS', 'Core Agreement', '10-Day Review', 'Condo Act'],
        documentContent: {
          summary: `Formal Agreement of Purchase and Sale executed between Tribute Communities (Vendor) and ${user.fullName} (Purchaser) for ${unitNumber} at ${projectName}.`,
          keyClauses: [
            {
              title: '10-Day Statutory Rescission Period (Cooling Off)',
              clause: 'Pursuant to Section 73 of the Ontario Condominium Act, 1998, the Purchaser has the statutory right to rescind this agreement within 10 days of receiving this signed copy and the disclosure statement.'
            },
            {
              title: 'Capped Municipal & Education Development Levies',
              clause: 'Development charges, educational levies, and municipal park dedication fees are guaranteed capped at a maximum of $7,500 + HST for this unit.'
            },
            {
              title: 'Assignment Rights Prior to Closing',
              clause: 'The Purchaser is permitted one (1) assignment of this Agreement to a qualified buyer after 90% of total deposit is received, with the standard builder assignment administrative fee of $5,000 waived.'
            },
            {
              title: 'Interim Occupancy & Lease Permission',
              clause: 'The Purchaser is granted the right to lease the unit during the interim occupancy period prior to final condominium title registration without penalty.'
            }
          ],
          depositMilestones: [
            { label: 'Initial Deposit with Offer', amount: 10000, dueDate: 'Paid Upon Signing', status: 'Paid' },
            { label: 'Balance to 5% (Day 30)', amount: 27495, dueDate: '30 Days from Acceptance', status: 'Scheduled' },
            { label: 'Second Installment (5% - Day 120)', amount: 37495, dueDate: '120 Days from Acceptance', status: 'Scheduled' },
            { label: 'Third Installment (5% - Day 270)', amount: 37495, dueDate: '270 Days from Acceptance', status: 'Scheduled' },
            { label: 'Final Deposit on Occupancy (5%)', amount: 37495, dueDate: 'Estimated Occupancy (Nov 2027)', status: 'Scheduled' }
          ],
          specifications: {
            'Property Type': '2-Storey Luxury Townhome with Built-in Garage',
            'Interior Living Area': '1,480 sq.ft + 120 sq.ft Private Deck',
            'Ceiling Height': '9-foot smooth ceilings on main level, 8-foot on second level',
            'Parking & Locker': '1 Private Single-Car Garage + 1 Private Driveway Parking Space Included',
            'Tentative Occupancy': 'November 15, 2027'
          }
        }
      },
      {
        id: `doc-floorplan-${user.id.slice(-6)}`,
        userId: user.id,
        title: `Architectural Floor Plan Addendum — ${unitModel}`,
        category: 'Floor Plan Addendum',
        description: `Certified builder architectural plan, dimension certifications, Schedule A electrical layout, and finishes schedule.`,
        projectName,
        projectId,
        unitNumber,
        unitModel,
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Pending Signature',
        fileSize: '1.8 MB',
        pageCount: 4,
        coolingOffPeriodEnd: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(),
        requiresSignature: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Floor Plan', 'Architecture', 'Finishes Schedule', 'Terrace'],
        documentContent: {
          summary: `Schedule A architectural plan showing room dimensions, electrical layout, window placements, and premium finishes package for ${unitNumber}.`,
          keyClauses: [
            {
              title: 'Square Footage & Architectural Tolerances',
              clause: 'Gross floor area measured in accordance with Tarion Bulletin 22. Actual usable floor space may vary within standard architectural tolerances up to 2%.'
            },
            {
              title: 'Schedule A Finishes Specification',
              clause: 'Includes Caesarstone quartz countertops in kitchen and primary ensuite, engineered wide-plank hardwood flooring on main level, and 40-ounce plush broadloom in bedrooms.'
            }
          ],
          specifications: {
            'Model Elevation': 'Elevation A Contemporary Brick & Stone Façade',
            'Primary Bedroom': '14\'6" x 12\'4" with 4-piece Ensuite & Walk-in Closet',
            'Bedroom 2': '11\'2" x 10\'8" with double closet',
            'Living / Dining': '18\'4" x 13\'6" Open Concept with walk-out to terrace',
            'Kitchen': '12\'0" x 9\'6" with Island and Breakfast Bar'
          }
        }
      },
      {
        id: `doc-vip-incentives-${user.id.slice(-6)}`,
        userId: user.id,
        title: 'Platinum VIP Buyer Incentive & Levy Rider',
        category: 'VIP Incentives & Levies',
        description: 'Signed Platinum VIP rider securing $10,000 decor credit, capped municipal levies, and free assignment rights negotiated by Amit Sawhney.',
        projectName,
        projectId,
        unitNumber,
        unitModel,
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Signed & Executed',
        fileSize: '850 KB',
        pageCount: 3,
        requiresSignature: false,
        signature: {
          signerName: 'Amit Sawhney (REALTOR®) & Tribute Sales Director',
          signerEmail: 'truecondodeal@gmail.com',
          signedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          signatureType: 'type',
          verificationHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          certificateId: `CERT-VIP-TRB-${user.id.slice(-4)}`,
          legalConsentText: 'Executed under Platinum VIP Brokerage Agency Agreement'
        },
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        tags: ['VIP Incentives', 'Capped Levies', 'Decor Dollars', 'Assignment Clause'],
        documentContent: {
          summary: `Exclusive Platinum VIP Incentive Package rider attached to and forming part of the Agreement of Purchase and Sale for ${unitNumber}.`,
          keyClauses: [
            {
              title: '$10,000 Builder Decor Dollar Allowance',
              clause: 'Purchaser is credited $10,000 at the Tribute Décor Studio towards interior upgrades, cabinetry, tiles, and fixtures.'
            },
            {
              title: 'Capped Municipal Levies at $7,500',
              clause: 'Town of Whitby, Regional Municipality of Durham, and School Board development charges are capped at $7,500 total.'
            }
          ]
        }
      },
      {
        id: `doc-tarion-critical-dates-${user.id.slice(-6)}`,
        userId: user.id,
        title: 'Tarion Warranty Information & Statement of Critical Dates',
        category: 'Tarion Disclosure',
        description: 'Mandatory Ontario new home warranty disclosure detailing critical construction milestone dates and delayed closing protections.',
        projectName,
        projectId,
        unitNumber,
        unitModel,
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Reference Only',
        fileSize: '1.2 MB',
        pageCount: 6,
        requiresSignature: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Tarion', 'Critical Dates', 'Ontario Warranty', 'Statutory Disclosure'],
        documentContent: {
          summary: `Tarion Addendum setting out the firm and tentative occupancy dates and statutory warranty coverage for ${unitNumber}.`,
          keyClauses: [
            {
              title: 'First Tentative Occupancy Date',
              clause: 'Scheduled for November 15, 2027. Vendor may extend this date by up to 120 days by giving 90 days prior written notice.'
            },
            {
              title: 'Tarion Warranty Protection Coverage',
              clause: '7-Year Major Structural Defect Protection ($400,000 limit), 2-Year Water Penetration & Building Envelope Protection, 1-Year Comprehensive Workmanship Protection.'
            }
          ]
        }
      },
      {
        id: `doc-deposit-receipt-${user.id.slice(-6)}`,
        userId: user.id,
        title: 'Trust Account Deposit Receipt — $10,000 Initial Draft',
        category: 'Deposit Receipt',
        description: 'Certified escrow trust account receipt confirming initial bank draft received and credited towards pre-construction unit purchase.',
        projectName,
        projectId,
        unitNumber,
        unitModel,
        purchasePrice: 749900,
        builderName: 'Tribute Communities',
        status: 'Signed & Executed',
        fileSize: '420 KB',
        pageCount: 1,
        requiresSignature: false,
        signature: {
          signerName: 'Tribute Communities Trust Escrow Dept.',
          signerEmail: 'trust@tributecommunities.com',
          signedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          signatureType: 'type',
          verificationHash: 'SHA256:3a1b9487c0e5a8f420516d2146e492bbd29e7c5ff0efefd8717efd03ae7f6b98',
          certificateId: `RECEIPT-TRB-${user.id.slice(-4)}-01`,
          legalConsentText: 'Official Escrow Trust Receipt under Real Estate and Business Brokers Act'
        },
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        tags: ['Deposit Receipt', 'Escrow Trust', 'Initial $10K', 'Verified'],
        documentContent: {
          summary: `Trust deposit confirmation of $10,000.00 CAD received by certified bank draft in trust for ${unitNumber} at ${projectName}.`,
          keyClauses: [
            {
              title: 'Insured Escrow Account',
              clause: 'Funds held in segregated interest-bearing trust account in accordance with Section 81 of the Ontario Condominium Act.'
            }
          ],
          depositMilestones: [
            { label: 'Initial Bank Draft (Received)', amount: 10000, dueDate: 'Confirmed Received', status: 'Paid' },
            { label: 'Balance to 5% (Day 30)', amount: 27495, dueDate: 'Within 30 Days of Acceptance', status: 'Upcoming' }
          ]
        }
      }
    ];

    userDocs.forEach(d => this.vaultDocuments.set(d.id, d));
    return userDocs;
  }

  // Utility to strip passwordHash and security internals
  public sanitizeUser(user: UserRecord): AuthUser {
    const { passwordHash, failedLoginAttempts, lockoutUntil, ...sanitized } = user;
    return sanitized;
  }
}

export const db = new AuthDatabase();
