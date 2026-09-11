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
