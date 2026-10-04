export type CanadianProvince =
  | 'ON' // Ontario
  | 'BC' // British Columbia
  | 'AB' // Alberta
  | 'QC' // Quebec
  | 'MB' // Manitoba
  | 'SK' // Saskatchewan
  | 'NS' // Nova Scotia
  | 'NB' // New Brunswick
  | 'NL' // Newfoundland and Labrador
  | 'PE'; // Prince Edward Island

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
  garage: number; // 0, 1, 2, 3+
  basement: 'Finished' | 'Unfinished' | 'Partially Finished' | 'None' | 'Separate Entrance Suite';
  condition: PropertyCondition;
  renovations: PropertyRenovations;
  stories?: number;
  propertyTaxes?: number;
  previousSaleDate?: string;
  previousSalePrice?: number;
  askingPrice?: number; // for buyer mode
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
  soldDate: string; // YYYY-MM-DD
  daysAgo: number;
  distanceKm: number;
  propertyType: ValuationPropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: string;
  yearBuilt?: number;
  pricePerSqft: number;
  similarityScore: number; // 0-100%
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

export interface ValuationEngineConfig {
  searchRadiusKm: number;
  maxSearchRadiusKm: number;
  lookbackDays: number;
  maxLookbackDays: number;
  minComparables: number;
  maxComparables: number;
  weights: {
    geographicProximity: number; // 25%
    propertyType: number; // 15%
    livingArea: number; // 15%
    bedrooms: number; // 10%
    bathrooms: number; // 10%
    lotSize: number; // 5%
    age: number; // 5%
    garage: number; // 5%
    basement: number; // 5%
    saleRecency: number; // 5%
  };
  marketAdjustmentAnnualPct: Record<string, number>;
  aiModel: string;
  minimumDataQualityThreshold: number; // e.g. 50%
  disclaimer: string;
  leadFormConfig: {
    requirePhone: boolean;
    requireEmail: boolean;
    ctaHeadline: string;
    ctaSubtext: string;
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
    differencePercent: number; // positive = overvalued, negative = undervalued
    evaluation: 'Over Asking Market Range' | 'Fair Market Value' | 'Below Market Range';
    verdictMessage: string;
    suggestedBuyerQuestions: string[];
  };
  insufficientData?: boolean;
  insufficientDataReason?: string;
}

export interface ValuationAuditRecord {
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
}

export interface ValuationAnalytics {
  totalValuations: number;
  valuationsByCity: Record<string, number>;
  valuationsByProvince: Record<string, number>;
  averageEstimatedValue: number;
  leadConversionCount: number;
  leadConversionRate: number; // percentage
  buyerVsSellerRatio: {
    sellerCount: number;
    buyerCount: number;
  };
  insufficientDataCount: number;
  recentAudits: ValuationAuditRecord[];
}

export interface ValuationLeadSubmission {
  id: string;
  auditId?: string;
  createdAt: string;
  firstName: string;
  lastName: string;
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
  intent: 'seller_cma' | 'speak_with_realtor' | 'selling_strategy' | 'buyer_representation';
  consentToBeContacted: boolean;
  notes?: string;
}
