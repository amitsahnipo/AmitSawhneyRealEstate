import { ValuationEngineConfig } from './types.js';

export const DEFAULT_VALUATION_CONFIG: ValuationEngineConfig = {
  searchRadiusKm: 2.5,
  maxSearchRadiusKm: 12.0,
  lookbackDays: 90,
  maxLookbackDays: 365,
  minComparables: 3,
  maxComparables: 8,
  weights: {
    geographicProximity: 0.25, // 25%
    propertyType: 0.15, // 15%
    livingArea: 0.15, // 15%
    bedrooms: 0.10, // 10%
    bathrooms: 0.10, // 10%
    lotSize: 0.05, // 5%
    age: 0.05, // 5%
    garage: 0.05, // 5%
    basement: 0.05, // 5%
    saleRecency: 0.05 // 5%
  },
  marketAdjustmentAnnualPct: {
    Whitby: 2.4,
    Brooklin: 2.8,
    Oshawa: 1.9,
    Courtice: 2.1,
    Pickering: 2.2,
    Ajax: 2.0,
    Toronto: 0.8,
    Mississauga: 1.5,
    Markham: 2.5,
    Vancouver: 1.2,
    Calgary: 4.8,
    Montreal: 2.0
  },
  aiModel: 'gemini-3.8-flash',
  minimumDataQualityThreshold: 50,
  disclaimer:
    "This estimate is generated using available property and comparable-sales data and is provided for informational purposes only. It is not a formal appraisal, opinion of value, or guarantee of the property's sale price. Actual market value may vary based on property condition, renovations, location, market conditions, and other factors. For a more detailed valuation, request a personalized Comparative Market Analysis (CMA) from Amit Sawhney, Licensed Ontario REALTOR®.",
  leadFormConfig: {
    requirePhone: true,
    requireEmail: true,
    ctaHeadline: 'Want a More Accurate Home Valuation?',
    ctaSubtext: 'Get a comprehensive, in-person Comparative Market Analysis (CMA) prepared with professional precision by Amit Sawhney.'
  }
};
