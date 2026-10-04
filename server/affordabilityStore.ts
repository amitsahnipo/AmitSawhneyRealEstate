import {
  BuyerFinancialProfile,
  MortgageQualificationRules,
  AffordabilityAssessment,
  ShowingBookingRequest,
  OfferPreparationDraft
} from '../src/types.js';
import { DEFAULT_MORTGAGE_RULES, calculateAffordability } from '../src/services/affordabilityService.js';

class AffordabilityStore {
  private rules: MortgageQualificationRules = { ...DEFAULT_MORTGAGE_RULES };
  private profiles: Map<string, BuyerFinancialProfile> = new Map();
  private assessments: Map<string, AffordabilityAssessment> = new Map();
  private showings: Map<string, ShowingBookingRequest> = new Map();
  private offers: Map<string, OfferPreparationDraft> = new Map();

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    // Seed a demo qualified profile
    const demoProfile: BuyerFinancialProfile = {
      userId: 'client-priya-sharma',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.ca',
      phone: '(647) 555-0482',
      currentAddress: '450 Simcoe St S, Oshawa, ON',
      grossAnnualIncome: 165000,
      isJointIncome: true,
      applicant1Income: 95000,
      applicant2Income: 70000,
      employmentStatus: 'Full-time',
      employmentDurationYears: 4,
      monthlyDebtObligations: 1200,
      debtBreakdown: {
        carLoans: 650,
        studentLoans: 350,
        creditCardsMin: 200
      },
      availableFunds: 120000,
      intendedDownPayment: 100000,
      downPaymentSource: 'Personal savings',
      ownsExistingProperty: false,
      creditProfileCategory: 'Excellent',
      propertyTypePlanning: 'Condo',
      mortgagePreApprovalStatus: 'In progress',
      financialProfileUpdatedDate: new Date(Date.now() - 3600000 * 24).toISOString()
    };

    this.profiles.set(demoProfile.userId!, demoProfile);
    const assessment = calculateAffordability(demoProfile, this.rules);
    this.assessments.set(demoProfile.userId!, assessment);

    // Seed demo showing request
    const demoShowing: ShowingBookingRequest = {
      id: 'show-demo-1',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      propertyId: 'resale-whitby-shores-executive',
      propertyTitle: 'Executive Waterfront Townhome | Whitby Shores',
      propertyAddress: '142 Waterbury Crescent, Whitby, ON',
      propertyPrice: 789000,
      isPrecon: false,
      preferredDate: '2026-09-24',
      preferredTime: '2:00 PM - 3:30 PM',
      alternativeTime: '4:00 PM - 5:30 PM',
      attendeesCount: 2,
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.ca',
      phone: '(647) 555-0482',
      notes: 'First time viewing with REALTOR Amit Sawhney. Looking forward to reviewing the status certificate & deposit structure.',
      isAssistanceShowing: false,
      status: 'Confirmed'
    };
    this.showings.set(demoShowing.id, demoShowing);

    // Seed demo offer draft
    const demoOffer: OfferPreparationDraft = {
      id: 'offer-demo-1',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      propertyId: 'resale-whitby-shores-executive',
      propertyTitle: 'Executive Waterfront Townhome | Whitby Shores',
      propertyAddress: '142 Waterbury Crescent, Whitby, ON',
      propertyPrice: 789000,
      propertyType: 'Townhome',
      buyerInfo: {
        fullName: 'Priya Sharma',
        coBuyerName: 'Arjun Sharma',
        email: 'priya.sharma@example.ca',
        phone: '(647) 555-0482',
        currentAddress: '450 Simcoe St S, Oshawa, ON'
      },
      financing: {
        downPaymentAvailable: 100000,
        mortgagePreApprovalStatus: 'In progress',
        mortgagePreApprovalAmount: 690000,
        lenderOrBroker: 'RBC Royal Bank Mortgage Specialist',
        estimatedMortgageAmount: 689000,
        requiresMortgageFinancing: true
      },
      purchaseTerms: {
        offerPrice: 780000,
        depositAmount: 35000,
        preferredClosingDate: '2026-11-15'
      },
      existingProperty: {
        ownsProperty: false,
        dependsOnSale: false
      },
      conditions: {
        financingCondition: true,
        homeInspectionCondition: true,
        statusCertificateCondition: true,
        saleOfPropertyCondition: false,
        lawyerReviewCondition: true,
        customConditionsNotes: 'Include 5 business days for financing approval and 3 business days for status certificate review by buyer lawyer.'
      },
      readinessChecklist: {
        buyerInfoComplete: true,
        financialInfoComplete: true,
        downPaymentConfirmed: true,
        propertySelected: true,
        offerPriceEntered: true,
        preApprovalConfirmed: false,
        conditionsIdentified: true
      },
      status: 'REALTOR Review Requested',
      realtorNotes: 'Under legal review with Amit Sawhney, Licensed REALTOR®. Preparing draft OREA Form 100 Agreement of Purchase and Sale.'
    };
    this.offers.set(demoOffer.id, demoOffer);

    // Seed offer draft for David Miller (david.m@example.com)
    const davidOffer: OfferPreparationDraft = {
      id: 'offer-david-brooklin-1',
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      propertyId: 'brooklin-trails-tribute',
      propertyTitle: 'The Oakdale 2-Bed Town | Brooklin Trails By Tribute',
      propertyAddress: 'Columbus Rd & Baldwin St N, Brooklin, Whitby, ON',
      propertyPrice: 719469,
      propertyType: 'Pre-Construction Townhome',
      buyerInfo: {
        fullName: 'David Miller',
        coBuyerName: 'Sarah Miller',
        email: 'david.m@example.com',
        phone: '(416) 555-0192',
        currentAddress: '128 Brock St E, Suite 305, Whitby, ON'
      },
      financing: {
        downPaymentAvailable: 150000,
        mortgagePreApprovalStatus: 'Pre-approved',
        mortgagePreApprovalAmount: 800000,
        lenderOrBroker: 'RBC Royal Bank Mortgage Specialist',
        estimatedMortgageAmount: 569469,
        requiresMortgageFinancing: true
      },
      purchaseTerms: {
        offerPrice: 719469,
        depositAmount: 70000,
        preferredClosingDate: '2027-04-30'
      },
      existingProperty: {
        ownsProperty: false,
        dependsOnSale: false
      },
      conditions: {
        financingCondition: true,
        homeInspectionCondition: false,
        statusCertificateCondition: false,
        saleOfPropertyCondition: false,
        lawyerReviewCondition: true,
        customConditionsNotes: '10-day statutory cooling-off period review with legal counsel. Capped development charges at $7,500 and free assignment clause.'
      },
      readinessChecklist: {
        buyerInfoComplete: true,
        financialInfoComplete: true,
        downPaymentConfirmed: true,
        propertySelected: true,
        offerPriceEntered: true,
        preApprovalConfirmed: true,
        conditionsIdentified: true
      },
      status: 'In Review by Amit Sawhney',
      realtorNotes: 'Amit Sawhney has reviewed the builder allocation worksheet and submitted the priority reservation to Tribute Communities sales desk.'
    };
    this.offers.set(davidOffer.id, davidOffer);

    // Seed financial profile for David Miller
    const davidProfile: BuyerFinancialProfile = {
      userId: 'client-david-miller',
      grossAnnualIncome: 145000,
      isJointIncome: true,
      applicant1Income: 95000,
      applicant2Income: 50000,
      employmentStatus: 'Full-time',
      employmentDurationYears: 5,
      isSelfEmployed: false,
      monthlyDebtObligations: 450,
      debtBreakdown: {
        carLoans: 350,
        studentLoans: 0,
        creditCardsMin: 100,
        linesOfCredit: 0,
        personalLoans: 0,
        otherMonthlyDebt: 0
      },
      availableFunds: 160000,
      intendedDownPayment: 150000,
      downPaymentSource: 'Personal savings',
      ownsExistingProperty: false,
      creditProfileCategory: 'Good',
      propertyTypePlanning: 'Townhouse',
      mortgagePreApprovalStatus: 'Pre-approved',
      financialProfileUpdatedDate: new Date().toISOString()
    };
    this.profiles.set(davidProfile.userId!, davidProfile);
    this.assessments.set(davidProfile.userId!, calculateAffordability(davidProfile, this.rules));
    this.profiles.set('david.m@example.com', davidProfile);
    this.assessments.set('david.m@example.com', calculateAffordability(davidProfile, this.rules));
  }

  public getRules(): MortgageQualificationRules {
    return { ...this.rules };
  }

  public updateRules(updates: Partial<MortgageQualificationRules>): MortgageQualificationRules {
    this.rules = {
      ...this.rules,
      ...updates,
      ruleVersion: `OSFI-CAN-UPDATE-${Date.now().toString().slice(-6)}`,
      effectiveDate: new Date().toISOString().split('T')[0]
    };
    return { ...this.rules };
  }

  public saveProfile(profile: BuyerFinancialProfile): { profile: BuyerFinancialProfile; assessment: AffordabilityAssessment } {
    const id = profile.userId || `buyer-${Date.now()}`;
    const cleanProfile: BuyerFinancialProfile = {
      ...profile,
      userId: id,
      financialProfileUpdatedDate: new Date().toISOString()
    };
    this.profiles.set(id, cleanProfile);

    const assessment = calculateAffordability(cleanProfile, this.rules);
    this.assessments.set(id, assessment);

    if (cleanProfile.email) {
      this.profiles.set(cleanProfile.email.toLowerCase(), cleanProfile);
      this.assessments.set(cleanProfile.email.toLowerCase(), assessment);
    }

    return { profile: cleanProfile, assessment };
  }

  public getProfile(userId: string): BuyerFinancialProfile | null {
    return this.profiles.get(userId) || null;
  }

  public getAssessment(userId: string): AffordabilityAssessment | null {
    return this.assessments.get(userId) || null;
  }

  public addShowingRequest(req: ShowingBookingRequest): ShowingBookingRequest {
    const clean: ShowingBookingRequest = {
      ...req,
      id: req.id || `show-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: req.createdAt || new Date().toISOString(),
      status: req.status || 'Requested'
    };
    this.showings.set(clean.id, clean);
    return clean;
  }

  public getShowings(): ShowingBookingRequest[] {
    return Array.from(this.showings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addOfferDraft(draft: OfferPreparationDraft): OfferPreparationDraft {
    const clean: OfferPreparationDraft = {
      ...draft,
      id: draft.id || `offer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: draft.createdAt || new Date().toISOString(),
      status: draft.status || 'Draft'
    };
    this.offers.set(clean.id, clean);
    return clean;
  }

  public getOffers(): OfferPreparationDraft[] {
    return Array.from(this.offers.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateOfferStatus(id: string, status: OfferPreparationDraft['status'], realtorNotes?: string): OfferPreparationDraft | null {
    const existing = this.offers.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      status,
      realtorNotes: realtorNotes !== undefined ? realtorNotes : existing.realtorNotes
    };
    this.offers.set(id, updated);
    return updated;
  }
}

export const affordabilityStore = new AffordabilityStore();
