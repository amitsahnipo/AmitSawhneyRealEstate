export type ProjectStatus = 
  | 'Platinum VIP Launch'
  | 'Selling Now'
  | 'Upcoming Registration'
  | 'Construction Phase'
  | 'Final Inventory'
  | 'New Release'
  | 'Limited Release'
  | 'Coming Soon'
  | 'Now Selling';

export type ResaleStatus =
  | 'New to Market'
  | 'Open House This Weekend'
  | 'Featured Listing'
  | 'Price Improvement'
  | 'Just Listed'
  | 'Exclusive';

export type PropertyType = 
  | 'High-Rise Condo'
  | 'Mid-Rise Condo'
  | 'Townhome'
  | 'Stacked Town'
  | 'Detached Home'
  | 'Semi-Detached'
  | 'Luxury Estate'
  | 'Mixed-Use Community';

export interface FloorPlan {
  id: string;
  name: string;
  type: string; // e.g. "1 Bed + Den", "2 Bed", "3 Bed Townhome"
  sqft: number;
  bathrooms: number;
  startingPrice: string;
  exposure?: string;
  pdfUrl?: string;
  features: string[];
}

export interface DepositMilestone {
  stage: string;
  percentage: number;
  timing: string;
  estimatedAmount?: string;
}

export interface Project {
  id: string;
  name: string;
  builder: string;
  builderLogo?: string;
  location: {
    address: string;
    city: string;
    region: string; // e.g. "Durham Region", "Peel Region", "Niagara Region", "Toronto", "York Region"
    lat: number;
    lng: number;
    intersection: string;
  };
  priceRange: {
    min: number;
    max: number;
    display: string; // e.g. "From $499,900"
  };
  propertyTypes: PropertyType[];
  status: ProjectStatus;
  occupancyYear: string;
  totalUnits: number;
  storeys?: number;
  image: string;
  galleryImages: string[];
  description: string;
  highlights: string[];
  vipIncentives: string[];
  depositStructure: DepositMilestone[];
  floorPlans: FloorPlan[];
  featured?: boolean;
}

export interface ResaleListing {
  id: string;
  title: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  price: number;
  priceDisplay: string;
  propertyType: 'Detached Home' | 'Semi-Detached' | 'Townhome' | 'High-Rise Condo' | 'Mid-Rise Condo' | 'Luxury Estate';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: string;
  garageSpaces: number;
  status: ResaleStatus;
  mlsNumber: string;
  annualTaxes: string;
  image: string;
  galleryImages: string[];
  description: string;
  features: string[];
  openHouse?: {
    date: string;
    time: string;
  };
  virtualTourUrl?: string;
  featured?: boolean;
  realtorCaUrl?: string;
  daysOnMarket?: number;
  latitude?: number;
  longitude?: number;
  walkScore?: number;
  transitScore?: number;
  brokerageName?: string;
  listingAgentName?: string;
  source?: string;
}

export type RealtorListing = ResaleListing;

export interface RealtorApiResponse {
  success: boolean;
  source: string;
  sourceUrl: string;
  query: {
    city?: string;
    limit: number;
    page: number;
    sortBy?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  listings: RealtorListing[];
  availableCities: string[];
}

export interface CommunityInfo {
  id: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  avgPrice: string;
  avgPreconPrice: string;
  transitSummary: string;
  commuteToToronto: string;
  lifestyleTags: string[];
  topHighlights: string[];
  schools: string[];
  image: string;
  popularPropertyTypes: string[];
}

export interface VIPRegistration {
  id: string;
  createdAt: string;
  projectId?: string;
  projectName?: string;
  fullName: string;
  email: string;
  phone: string;
  buyerType: 'End User' | 'Investor' | 'First-Time Buyer' | 'Move-Up Buyer';
  desiredType: string;
  budgetRange: string;
  preferredTiming: string;
  comments?: string;
  realtorConsent: boolean;
}

export interface HomeValuationRequest {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  estimatedYearBuilt?: string;
  condition: 'Fully Renovated' | 'Well Maintained' | 'Needs Cosmetic Updates' | 'Major Renovation Needed';
  timeframeToSell: 'Immediate (1-3 months)' | '3-6 months' | '6-12 months' | 'Curious about market value';
  notes?: string;
}

export interface ConsultationBooking {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  topic: string;
  notes?: string;
  propertyInterest?: string;
}

export interface FilterState {
  category: 'all' | 'preconstruction' | 'resale' | 'invest' | 'sell';
  searchQuery: string;
  city: string;
  propertyType: string;
  status: string;
  minBeds: number;
  maxPrice: number;
  occupancyYear: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface VIPNewsletterSubscription {
  id: string;
  createdAt: string;
  email: string;
  firstName?: string;
  preferredRegion?: string;
  propertyInterest?: string;
  source: string;
}

export interface AgentInfo {
  name: string;
  title: string;
  license: string;
  jurisdiction: string;
  phone: string;
  phoneFormatted: string;
  email: string;
  brokerage: string;
  bio: string;
  specialties: string[];
  photo: string;
  recoRegistrationNumber: string;
  experienceYears: number;
}

export interface MarketMetric {
  label: string;
  value: string;
  subtext: string;
  trend: 'up' | 'down' | 'neutral';
  change?: string;
}

export interface RegionalSpotlight {
  regionName: string;
  headline: string;
  medianPrice: string;
  statusBadge: string;
  growthDrivers: string[];
  realtorInsight: string;
}

export interface PreConVsResaleComparison {
  factor: string;
  preConstruction: string;
  resale: string;
  recommendation: string;
}

export interface MarketTrendsData {
  region: string;
  buyerFocus: string;
  generatedAt: string;
  source: string;
  marketTemperature: {
    score: number; // 1 to 100
    label: string; // e.g. "Balanced Buyer Advantage"
    summary: string;
  };
  keyMetrics: MarketMetric[];
  regionalSpotlights: RegionalSpotlight[];
  preConVsResale: PreConVsResaleComparison[];
  rateImpactAnalysis: {
    title: string;
    bocSummary: string;
    buyerStrategy: string;
  };
  strategicTakeaways: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

// Authentication & Role-Based Access Types
export type UserRole = 'AGENT' | 'CLIENT';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  phone?: string;
  assignedAgentId?: string | null;
  licenseNumber?: string;
  brokerage?: string;
  createdAt: string;
  updatedAt?: string;
  // Extended Client Profile Information
  currentAddress?: string;
  city?: string;
  postalCode?: string;
  buyerType?: 'First-Time Buyer' | 'Move-Up Buyer' | 'Investor' | 'Downsizing';
  targetAreas?: string[];
  propertyTypePlanning?: string;
  targetBudgetMin?: number;
  targetBudgetMax?: number;
  purchaseTimeline?: string;
  coBuyerName?: string;
  coBuyerEmail?: string;
  coBuyerPhone?: string;
  coBuyerRelationship?: string;
  mortgagePreApprovalStatus?: string;
  preApprovalAmount?: number;
  lenderOrBroker?: string;
  intendedDownPayment?: number;
  downPaymentSource?: string;
  ownsExistingProperty?: boolean;
  dependsOnSaleOfCurrentHome?: boolean;
  notes?: string;
  vipAccessTier?: string;
  representationAgreementStatus?: string;
  affordabilityAssessment?: AffordabilityAssessment | null;
  buyerFinancialProfile?: BuyerFinancialProfile | null;
}

export interface AuthSessionResponse {
  user: AuthUser;
  token: string;
  expiresIn: string;
}

export interface ClientWorksheet {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  unitChoice1: string;
  unitChoice2?: string;
  floorPlanName?: string;
  buyerName: string;
  phone: string;
  email: string;
  depositStatus: 'Pending Verification' | '1st Milestone Received' | 'Firm Allocation';
  status: 'Draft' | 'Submitted to Builder' | 'Allocated' | 'Under Review';
  submittedAt: string;
  coolingOffPeriodEnd?: string;
  notes?: string;
}

export interface ClientInvitation {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CLIENT';
  invitedByAgentId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

// "Buy Smart, Save Big" Commission Cashback Program Types
export type CashbackDealStatus = 
  | 'Inquiry'
  | 'Eligibility Pending'
  | 'Eligibility Confirmed'
  | 'Agreement Signed'
  | 'Transaction in Progress'
  | 'Firm Closing Pending'
  | 'Cashback Processing'
  | 'Cashback Paid'
  | 'Ineligible';

export interface CashbackInquiry {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  purchasePrice: number;
  propertyType: string;
  transactionType: 'Pre-Construction' | 'Resale' | 'Undecided';
  targetProjectOrArea?: string;
  projectId?: string;
  purchaseTimeframe: 'Immediate (1-3 months)' | '3-6 months' | '6-12 months' | 'Just planning';
  workingWithRealtor: boolean; // Must be false to respect existing representation
  notes?: string;
  estimatedCashback: number;
  status: CashbackDealStatus;
  confirmedCashbackAmount?: number;
  commissionRate?: number;
  builderIncentivesEstimated?: string;
  closingDate?: string;
  paymentReference?: string;
  userId?: string;
  updatedAt?: string;
}

export interface CashbackConfig {
  defaultCashbackPercent: number; // e.g. 1.0 (means 1.0% of purchase price)
  defaultCommissionRate: number; // e.g. 2.5 (means 2.5% cooperating commission)
  minPurchasePrice: number; // e.g. 300000
  maxCashbackAmount: number; // e.g. 50000
  eligiblePropertyTypes: string[];
  eligibleTransactionTypes: ('Pre-Construction' | 'Resale')[];
  requireRepresentationAgreement: boolean;
  disclaimer: string;
}

// AI-Powered Real Estate Property Valuation Types
export type CanadianProvince =
  | 'ON' | 'BC' | 'AB' | 'QC' | 'MB' | 'SK' | 'NS' | 'NB' | 'NL' | 'PE';

export type ValuationPropertyType =
  | 'Detached Home'
  | 'Semi-Detached'
  | 'Townhouse'
  | 'Condo Apartment'
  | 'Condo Townhouse'
  | 'Freehold';

export type PropertyCondition =
  | 'Needs Work'
  | 'Average'
  | 'Good'
  | 'Excellent'
  | 'Fully Renovated';

export interface PropertyRenovations {
  kitchen?: boolean;
  bathrooms?: boolean;
  finishedBasement?: boolean;
  flooring?: boolean;
  windows?: boolean;
  roof?: boolean;
  furnaceHvac?: boolean;
  landscaping?: boolean;
  pool?: boolean;
  other?: boolean;
}

export interface SubjectPropertyInput {
  address: string;
  unit?: string;
  streetNumber?: string;
  streetName?: string;
  municipality: string;
  province: CanadianProvince;
  postalCode?: string;
  propertyType: ValuationPropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  garage: number;
  basement: 'Finished' | 'Unfinished' | 'Partially Finished' | 'None' | 'Separate Entrance Suite';
  condition: PropertyCondition;
  renovations: PropertyRenovations;
  stories?: number;
  propertyTaxes?: number;
  previousSaleDate?: string;
  previousSalePrice?: number;
  askingPrice?: number;
  lat?: number;
  lng?: number;
}

export interface ComparableSale {
  id: string;
  address: string;
  municipality: string;
  province: CanadianProvince;
  postalCode: string;
  soldPrice: number;
  soldDate: string;
  daysAgo: number;
  distanceKm: number;
  propertyType: ValuationPropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: string;
  yearBuilt?: number;
  pricePerSqft: number;
  similarityScore: number;
  selectionReason: string;
  aiExplanation?: string;
  garage: number;
  basement: string;
  condition: PropertyCondition;
  buildingName?: string;
  photoUrl?: string;
  adjustedPrice: number;
  adjustments: {
    sqftAdjustment: number;
    bedBathAdjustment: number;
    garageBasementAdjustment: number;
    conditionAdjustment: number;
    marketTrendAdjustment: number;
  };
}

export interface ValuationResponse {
  auditId: string;
  subjectProperty: SubjectPropertyInput;
  estimatedValue: number;
  lowValue: number;
  highValue: number;
  confidence: 'High' | 'Moderate' | 'Limited';
  confidencePercent: number;
  confidenceReason: string;
  comparablesCount: number;
  searchRadiusUsedKm: number;
  lookbackPeriodDaysUsed: number;
  dataThroughDate: string;
  valuationDate: string;
  subjectImpliedPricePerSqft: number;
  medianComparablePricePerSqft: number;
  comparablePricePerSqftRange: { min: number; max: number };
  marketTrendAdjustment: {
    appliedPct: number;
    description: string;
    localTrend: 'Appreciating' | 'Stable' | 'Softening';
  };
  statisticalSummary: {
    mean: number;
    median: number;
    standardDeviation: number;
    varianceCoefficient: number;
  };
  communityReport?: {
    sourceName: string;
    sourceUrl: string;
    municipality: string;
    communityName: string;
    propertyType: string;
    benchmarkRange: { low: number; high: number };
    medianDaysOnMarket: number;
    salesToNewListingsRatio: number;
    marketTemperature: string;
    monthsOfInventory: number;
    yoyPriceChangePct: number;
    avgPricePerSqft: number;
    reportPeriod: string;
  };
  comparables: ComparableSale[];
  comparablesUsed?: ComparableSale[];
  valuationRange?: { low: number; high: number };
  confidenceScore?: { rating: string; score: number; reason?: string };
  aiExplanation: string;
  disclaimer: string;
  potentialListingPriceGuidance: {
    recommendedLow: number;
    recommendedHigh: number;
    commentary: string;
  };
  buyerPerspective?: {
    askingPrice: number;
    estimatedMarketValue: number;
    differenceAmount: number;
    differencePercent: number;
    evaluation: 'Over Asking Market Range' | 'Fair Market Value' | 'Below Market Range';
    verdictMessage: string;
    suggestedBuyerQuestions: string[];
  };
  insufficientData?: boolean;
  insufficientDataReason?: string;
}

export interface ValuationLeadSubmission {
  id?: string;
  auditId?: string;
  createdAt?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  propertyAddress: string;
  municipality?: string;
  province?: string;
  estimatedValue?: number;
  valuationDate?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  intent?: 'seller_cma' | 'speak_with_realtor' | 'selling_strategy' | 'buyer_representation';
  consentToBeContacted?: boolean;
  notes?: string;
}

export interface ValuationEngineConfig {
  searchRadiusKm: number;
  maxSearchRadiusKm: number;
  lookbackDays: number;
  maxLookbackDays: number;
  minComparables: number;
  maxComparables: number;
  weights: {
    geographicProximity: number;
    propertyType: number;
    livingArea: number;
    bedrooms: number;
    bathrooms: number;
    lotSize: number;
    age: number;
    garage: number;
    basement: number;
    saleRecency: number;
  };
  marketAdjustmentAnnualPct: Record<string, number>;
  aiModel: string;
  minimumDataQualityThreshold: number;
  disclaimer: string;
  leadFormConfig: {
    requirePhone: boolean;
    requireEmail: boolean;
    ctaHeadline: string;
    ctaSubtext: string;
  };
}

export interface ValuationAnalytics {
  totalValuations: number;
  valuationsByCity: Record<string, number>;
  valuationsByProvince: Record<string, number>;
  averageEstimatedValue: number;
  leadConversionCount: number;
  leadConversionRate: number;
  buyerVsSellerRatio: {
    sellerCount: number;
    buyerCount: number;
  };
  insufficientDataCount: number;
  recentAudits: Array<{
    auditId: string;
    timestamp: string;
    subjectAddress: string;
    municipality: string;
    province: CanadianProvince;
    propertyType: string;
    estimatedValue: number;
    lowValue: number;
    highValue: number;
    confidence: string;
    comparablesCount: number;
    comparableIds: string[];
    modelVersion: string;
    aiPromptVersion: string;
    userAdjustedDetails: boolean;
    mode: 'seller' | 'buyer';
  }>;
}

// ============================================================================
// ENHANCED BUYER QUALIFICATION, AFFORDABILITY & OFFER WORKFLOW TYPES
// ============================================================================

export type CreditProfileCategory = 'Excellent' | 'Good' | 'Fair' | 'Needs improvement' | 'Not sure';
export type EmploymentStatusType = 'Full-time' | 'Part-time' | 'Self-employed' | 'Contract' | 'Other';
export type DownPaymentSourceType = 'Personal savings' | 'Gift' | 'Sale of existing property' | 'RRSP/Home Buyers\' Plan' | 'Other';
export type PropertyPlanningType = 'Condo' | 'Townhouse' | 'Semi-detached' | 'Detached' | 'Preconstruction' | 'Investment property' | 'Not sure';
export type MortgagePreApprovalStatus = 'Not started' | 'In progress' | 'Pre-approved' | 'Cash buyer';

export interface BuyerFinancialProfile {
  userId?: string;
  grossAnnualIncome: number;
  isJointIncome: boolean;
  applicant1Income: number;
  applicant2Income: number;
  employmentStatus: EmploymentStatusType;
  employmentDurationYears: number;
  isSelfEmployed?: boolean;
  selfEmployedYears?: number;
  selfEmployedAnnualIncome?: number;
  selfEmployedPreviousYearIncome?: number;
  monthlyDebtObligations: number;
  debtBreakdown?: {
    carLoans?: number;
    studentLoans?: number;
    creditCardsMin?: number;
    linesOfCredit?: number;
    personalLoans?: number;
    otherMonthlyDebt?: number;
  };
  availableFunds: number;
  intendedDownPayment: number;
  downPaymentSource: DownPaymentSourceType;
  ownsExistingProperty: boolean;
  existingPropertyDetails?: {
    estimatedValue: number;
    mortgageBalance: number;
    monthlyMortgagePayment: number;
    expectedSaleProceeds: number;
    sellingBeforePurchasing: boolean;
  };
  creditProfileCategory: CreditProfileCategory;
  propertyTypePlanning: PropertyPlanningType;
  preferredCities?: string[];
  preferredBedrooms?: string;
  preferredBathrooms?: string;
  targetTimeline?: string;
  purchaseGoal?: string;
  firstTimeHomebuyer?: boolean;
  mortgagePreApprovalStatus: MortgagePreApprovalStatus;
  mortgagePreApprovalAmount?: number;
  mortgageLenderOrBroker?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  currentAddress?: string;
  financialProfileUpdatedDate: string;
}

export interface MortgageQualificationRules {
  effectiveDate: string;
  ruleVersion: string;
  qualifyingRateFloor: number; // e.g. 5.25% Bank of Canada benchmark floor
  contractRate: number; // e.g. 4.69% 5-year fixed/variable market rate
  stressTestSpread: number; // e.g. 2.00%
  stressTestMethod: string;
  gdsLimit: number; // e.g. 0.39 (39%)
  gdsConservative: number; // e.g. 0.32 (32%)
  tdsLimit: number; // e.g. 0.44 (44%)
  tdsConservative: number; // e.g. 0.38 (38%)
  maxAmortizationInsuredYears: number; // 25
  maxAmortizationConventionalYears: number; // 30
  propertyTaxRateAnnual: number; // e.g. 0.009 (0.9% of purchase price / 12)
  heatingCostMonthly: number; // e.g. 125
  condoFeeMonthlyAssumption: number; // e.g. 400 (50% included in GDS/TDS)
  minimumDownPaymentRules: Array<{
    threshold: number;
    rate: number;
    description: string;
  }>;
  defaultInsuranceTiers: Array<{
    minDownPercent: number;
    maxDownPercent: number;
    premiumPercent: number;
  }>;
  disclaimer: string;
}

export interface AffordabilityAssessment {
  buyerId?: string;
  estimatedMortgageMin: number;
  estimatedMortgageMax: number;
  estimatedPurchasePriceMin: number;
  estimatedPurchasePriceMax: number;
  estimatedDownPayment: number;
  effectiveStressRate: number;
  contractRate: number;
  qualifyingGds: number;
  qualifyingTds: number;
  monthlyCarryingCostsEstimated: {
    mortgagePaymentMin: number;
    mortgagePaymentMax: number;
    propertyTax: number;
    heating: number;
    condoFees: number;
    totalMonthlyMin: number;
    totalMonthlyMax: number;
  };
  calculationDate: string;
  ruleVersion: string;
  disclaimer: string;
}

export type AffordabilityCategory = 'Within Estimated Range' | 'Above Estimated Range' | 'Assistance Recommended';

export interface PropertyAffordabilityAssessment {
  propertyId: string;
  propertyPrice: number;
  buyerUpperRange: number;
  priceToRangeRatio: number;
  category: AffordabilityCategory;
  isAboveRange: boolean;
  isAssistanceRecommended: boolean; // price > 1.20 * buyerUpperRange
  message: string;
}

export interface ShowingBookingRequest {
  id: string;
  createdAt: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  isPrecon: boolean;
  preferredDate: string;
  preferredTime: string;
  alternativeTime?: string;
  attendeesCount: number;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  isAssistanceShowing: boolean;
  buyerUpperRange?: number;
  priceToRangeRatio?: number;
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export type OfferDraftStatus =
  | 'Draft'
  | 'REALTOR Review Requested'
  | 'In Review by Amit Sawhney'
  | 'Approved for Signing'
  | 'Approved for OREA APS'
  | 'Changes Requested'
  | 'Submitted to Seller'
  | 'Accepted by Seller'
  | 'Rejected'
  | 'Submitted';

export interface OfferPreparationDraft {
  id: string;
  createdAt: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  propertyType: string;
  buyerInfo: {
    fullName: string;
    coBuyerName?: string;
    email: string;
    phone: string;
    currentAddress: string;
  };
  financing: {
    downPaymentAvailable: number;
    mortgagePreApprovalStatus: MortgagePreApprovalStatus;
    mortgagePreApprovalAmount?: number;
    lenderOrBroker?: string;
    estimatedMortgageAmount: number;
    requiresMortgageFinancing: boolean;
  };
  purchaseTerms: {
    offerPrice: number;
    depositAmount: number;
    preferredClosingDate: string;
  };
  existingProperty?: {
    ownsProperty: boolean;
    dependsOnSale: boolean;
    currentPropertyAddress?: string;
    existingMortgageBalance?: number;
  };
  conditions: {
    financingCondition: boolean;
    homeInspectionCondition: boolean;
    statusCertificateCondition: boolean;
    saleOfPropertyCondition: boolean;
    lawyerReviewCondition: boolean;
    customConditionsNotes?: string;
  };
  readinessChecklist: {
    buyerInfoComplete: boolean;
    financialInfoComplete: boolean;
    downPaymentConfirmed: boolean;
    propertySelected: boolean;
    offerPriceEntered: boolean;
    preApprovalConfirmed: boolean;
    conditionsIdentified: boolean;
  };
  status: OfferDraftStatus;
  realtorNotes?: string;
}

// --- Pre-Construction Document Vault & Digital Signature Types ---

export type VaultDocumentCategory = 
  | 'APS Agreement' 
  | 'Floor Plan Addendum' 
  | 'Tarion Disclosure' 
  | 'VIP Incentives & Levies' 
  | 'Deposit Receipt' 
  | 'Representation Agreement';

export type VaultDocumentStatus = 
  | 'Pending Signature' 
  | 'Signed & Executed' 
  | 'Under Lawyer Review' 
  | 'Reference Only';

export interface VaultDigitalSignature {
  signerName: string;
  signerEmail: string;
  signedAt: string; // ISO string
  signatureDataUrl?: string; // canvas draw base64 or SVG
  signatureType: 'draw' | 'type';
  typedFont?: string;
  ipAddress?: string;
  verificationHash: string; // Cryptographic SHA-like verification string
  certificateId: string;
  legalConsentText: string;
}

export interface VaultDocumentAttachment {
  fileName: string;
  fileType: string;
  fileSize: string;
  fileDataUrl?: string; // base64 Data URL
  fileExtension?: string; // 'pdf' | 'docx' | 'doc' | 'png' | 'jpg' | 'xlsx' | etc.
  uploadedAt: string;
}

export interface ClientVaultDocument {
  id: string;
  userId: string;
  title: string;
  category: VaultDocumentCategory;
  description: string;
  projectName: string;
  projectId: string;
  unitNumber: string;
  unitModel: string;
  purchasePrice: number;
  builderName: string;
  status: VaultDocumentStatus;
  fileSize: string;
  pageCount: number;
  coolingOffPeriodEnd?: string;
  requiresSignature: boolean;
  signature?: VaultDigitalSignature;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  attachment?: VaultDocumentAttachment;
  sourceType?: 'uploaded_file' | 'builder_template' | 'client_upload';
  documentContent?: {
    summary: string;
    keyClauses: Array<{ title: string; clause: string }>;
    depositMilestones?: Array<{ label: string; amount: number; dueDate: string; status: 'Paid' | 'Upcoming' | 'Scheduled' }>;
    specifications?: Record<string, string>;
  };
}

