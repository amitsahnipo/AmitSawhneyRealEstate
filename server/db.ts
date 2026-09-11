import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthUser, UserRole, UserStatus, ClientWorksheet, ClientInvitation, CashbackInquiry, CashbackDealStatus, CashbackConfig } from '../src/types.js';

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
      lockoutUntil: null
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

  public updateUserProfile(userId: string, updates: Partial<{ fullName: string; phone: string }>): AuthUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    if (updates.fullName) user.fullName = updates.fullName.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
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

  // Utility to strip passwordHash and security internals
  public sanitizeUser(user: UserRecord): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.fullName,
      phone: user.phone,
      assignedAgentId: user.assignedAgentId,
      licenseNumber: user.licenseNumber,
      brokerage: user.brokerage,
      createdAt: user.createdAt
    };
  }
}

export const db = new AuthDatabase();
