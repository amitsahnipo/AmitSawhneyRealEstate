import {
  BuyerFinancialProfile,
  MortgageQualificationRules,
  AffordabilityAssessment,
  PropertyAffordabilityAssessment,
  AffordabilityCategory
} from '../types';

export const DEFAULT_MORTGAGE_RULES: MortgageQualificationRules = {
  effectiveDate: '2026-01-01',
  ruleVersion: 'OSFI-B20-CAN-2026.1',
  qualifyingRateFloor: 5.25, // Bank of Canada benchmark floor rate (%)
  contractRate: 4.69, // 5-Year Fixed / Variable market estimate (%)
  stressTestSpread: 2.0, // Stress test spread (+2.00%)
  stressTestMethod: 'Max(Benchmark Floor 5.25%, Contract Rate + 2.00%)',
  gdsLimit: 0.39, // Maximum Gross Debt Service Ratio (39%)
  gdsConservative: 0.32, // Comfortable Gross Debt Service Ratio (32%)
  tdsLimit: 0.44, // Maximum Total Debt Service Ratio (44%)
  tdsConservative: 0.38, // Comfortable Total Debt Service Ratio (38%)
  maxAmortizationInsuredYears: 25, // 25 years for insured (<20% down)
  maxAmortizationConventionalYears: 30, // 30 years for conventional / eligible new builds
  propertyTaxRateAnnual: 0.0085, // 0.85% annual estimated property tax
  heatingCostMonthly: 125, // $125/month standard utility heating assumption
  condoFeeMonthlyAssumption: 400, // 50% counted towards qualification ($200)
  minimumDownPaymentRules: [
    { threshold: 500000, rate: 0.05, description: '5% on first $500,000' },
    { threshold: 1000000, rate: 0.10, description: '10% on portion between $500,000 and $999,999' },
    { threshold: 1500000, rate: 0.20, description: '20% on portion at or above $1,000,000 (up to $1.5M insured cap)' }
  ],
  defaultInsuranceTiers: [
    { minDownPercent: 0.05, maxDownPercent: 0.0999, premiumPercent: 0.040 }, // 4.00%
    { minDownPercent: 0.10, maxDownPercent: 0.1499, premiumPercent: 0.031 }, // 3.10%
    { minDownPercent: 0.15, maxDownPercent: 0.1999, premiumPercent: 0.028 }, // 2.80%
    { minDownPercent: 0.20, maxDownPercent: 1.0000, premiumPercent: 0.000 }  // 0.00% Conventional
  ],
  disclaimer:
    'This is a preliminary affordability estimate based on the information you provided and current Canadian mortgage qualification assumptions. Your actual mortgage qualification may be different after an approved lender or licensed mortgage professional verifies your complete financial profile. This does not constitute a mortgage approval, rate guarantee, or lending commitment.'
};

/**
 * Calculates monthly mortgage payment given principal, annual interest rate, and amortization years.
 */
export function calculateMonthlyPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || annualRatePct <= 0 || years <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = years * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Inverts loan formula to find the maximum principal affordable given a maximum monthly payment.
 */
export function calculatePrincipalFromPayment(monthlyPayment: number, annualRatePct: number, years: number): number {
  if (monthlyPayment <= 0 || annualRatePct <= 0 || years <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = years * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (monthlyPayment * (factor - 1)) / (monthlyRate * factor);
}

/**
 * Evaluates the required minimum down payment for a target purchase price under Canadian rules.
 */
export function calculateMinimumDownPayment(purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;
  if (purchasePrice <= 500000) {
    return purchasePrice * 0.05;
  } else if (purchasePrice < 1000000) {
    return 500000 * 0.05 + (purchasePrice - 500000) * 0.10;
  } else if (purchasePrice <= 1500000) {
    // Under 2024/2025 Canadian rules, insured mortgages extended to $1.5M for first time buyers/new builds
    return 500000 * 0.05 + 500000 * 0.10 + (purchasePrice - 1000000) * 0.20;
  } else {
    // $1.5M+ requires minimum 20% down
    return purchasePrice * 0.20;
  }
}

/**
 * Pure calculation engine for Canadian Buyer Mortgage Qualification & Affordability Range
 */
export function calculateAffordability(
  profile: BuyerFinancialProfile,
  rules: MortgageQualificationRules = DEFAULT_MORTGAGE_RULES
): AffordabilityAssessment {
  // 1. Calculate Gross Annual & Monthly Income
  const grossAnnual = profile.isJointIncome
    ? (profile.applicant1Income || 0) + (profile.applicant2Income || 0)
    : (profile.grossAnnualIncome || 0);

  const grossMonthly = Math.max(0, grossAnnual / 12);

  // 2. Determine Effective Qualifying Stress-Test Rate
  // Formula: Max(qualifyingRateFloor, contractRate + stressTestSpread)
  const stressRate = Math.max(rules.qualifyingRateFloor, rules.contractRate + rules.stressTestSpread);

  // 3. Existing Monthly Debt Obligations
  const monthlyDebts = Math.max(0, profile.monthlyDebtObligations || 0);

  // 4. Property-specific carrying costs
  const isCondo = profile.propertyTypePlanning === 'Condo' || profile.propertyTypePlanning === 'Preconstruction';
  const condoFeeGdsPortion = isCondo ? rules.condoFeeMonthlyAssumption * 0.5 : 0;
  const heatingCost = rules.heatingCostMonthly;

  // 5. Down Payment determination (including equity if existing property is sold)
  let effectiveDownPayment = profile.intendedDownPayment > 0 ? profile.intendedDownPayment : profile.availableFunds;
  if (profile.ownsExistingProperty && profile.existingPropertyDetails?.sellingBeforePurchasing) {
    effectiveDownPayment += Math.max(0, profile.existingPropertyDetails.expectedSaleProceeds || 0);
  }

  // 6. Amortization: 25 years default, or 30 years if conventional (>=20% down) or preconstruction
  const downPaymentPercentEstimate = effectiveDownPayment >= 200000 ? 0.20 : 0.10;
  const amortizationYears = downPaymentPercentEstimate >= 0.20 || profile.propertyTypePlanning === 'Preconstruction'
    ? rules.maxAmortizationConventionalYears
    : rules.maxAmortizationInsuredYears;

  // 7. Solve for Maximum and Conservative Mortgage Capacity:
  // We estimate property taxes dynamically as ~0.85% / 12 of purchase price
  // GDS: (P&I + Taxes + Heat + 50% Condo) / Income <= GDS_Limit
  // TDS: (P&I + Taxes + Heat + 50% Condo + Debts) / Income <= TDS_Limit

  const solveCapacity = (gdsCap: number, tdsCap: number) => {
    const maxHousingByGds = grossMonthly * gdsCap;
    const maxTotalByTds = grossMonthly * tdsCap;
    const maxHousingByTds = Math.max(0, maxTotalByTds - monthlyDebts);

    // Limiting housing allowance
    const allowedHousingBudget = Math.min(maxHousingByGds, maxHousingByTds);

    // Base deductions: heating + condo fee portion
    const baseNonMortgageHousing = heatingCost + condoFeeGdsPortion;
    const netAvailableForMortgageAndTax = Math.max(0, allowedHousingBudget - baseNonMortgageHousing);

    // Net available covers P&I payment + property tax (approx 0.85%/12 of total price)
    // Approximate ratio: tax is roughly 12-15% of the mortgage payment
    const estimatedMortgagePmtAllowance = netAvailableForMortgageAndTax * 0.88;

    // Principal derived from payment
    let calculatedPrincipal = calculatePrincipalFromPayment(
      estimatedMortgagePmtAllowance,
      stressRate,
      amortizationYears
    );

    // Down payment & insurance adjustments
    const estimatedPurchase = calculatedPrincipal + effectiveDownPayment;
    const minDownRequired = calculateMinimumDownPayment(estimatedPurchase);

    // If down payment is less than minimum required, constrain purchase price to down payment capacity
    let constrainedPurchase = estimatedPurchase;
    if (effectiveDownPayment < minDownRequired && effectiveDownPayment > 0) {
      // rough multiplier for minimum down payment (~10-15x down payment)
      const maxPurchaseFromDown = effectiveDownPayment <= 25000
        ? effectiveDownPayment / 0.05
        : 500000 + (effectiveDownPayment - 25000) / 0.10;
      constrainedPurchase = Math.min(estimatedPurchase, maxPurchaseFromDown);
      calculatedPrincipal = Math.max(0, constrainedPurchase - effectiveDownPayment);
    }

    // Round to clean thousands
    return {
      mortgage: Math.round(calculatedPrincipal / 5000) * 5000,
      purchasePrice: Math.round(constrainedPurchase / 5000) * 5000
    };
  };

  // Calculate conservative (lower bound) and maximum (upper bound)
  const maxResult = solveCapacity(rules.gdsLimit, rules.tdsLimit);
  const minResult = solveCapacity(rules.gdsConservative, rules.tdsConservative);

  // Actual monthly carrying costs based on contract rate (not stress test rate)
  const actualMortgagePmtMin = calculateMonthlyPayment(minResult.mortgage, rules.contractRate, amortizationYears);
  const actualMortgagePmtMax = calculateMonthlyPayment(maxResult.mortgage, rules.contractRate, amortizationYears);
  const estPropertyTax = Math.round((maxResult.purchasePrice * rules.propertyTaxRateAnnual) / 12);
  const estCondoFees = isCondo ? rules.condoFeeMonthlyAssumption : 0;

  const totalCarryingMin = Math.round(actualMortgagePmtMin + estPropertyTax * 0.85 + heatingCost + estCondoFees);
  const totalCarryingMax = Math.round(actualMortgagePmtMax + estPropertyTax + heatingCost + estCondoFees);

  return {
    buyerId: profile.userId || 'guest-buyer',
    estimatedMortgageMin: Math.max(100000, minResult.mortgage),
    estimatedMortgageMax: Math.max(150000, maxResult.mortgage),
    estimatedPurchasePriceMin: Math.max(150000, minResult.purchasePrice),
    estimatedPurchasePriceMax: Math.max(200000, maxResult.purchasePrice),
    estimatedDownPayment: effectiveDownPayment,
    effectiveStressRate: Number(stressRate.toFixed(2)),
    contractRate: Number(rules.contractRate.toFixed(2)),
    qualifyingGds: Math.round(rules.gdsLimit * 100),
    qualifyingTds: Math.round(rules.tdsLimit * 100),
    monthlyCarryingCostsEstimated: {
      mortgagePaymentMin: Math.round(actualMortgagePmtMin),
      mortgagePaymentMax: Math.round(actualMortgagePmtMax),
      propertyTax: estPropertyTax,
      heating: heatingCost,
      condoFees: estCondoFees,
      totalMonthlyMin: totalCarryingMin,
      totalMonthlyMax: totalCarryingMax
    },
    calculationDate: new Date().toISOString(),
    ruleVersion: rules.ruleVersion,
    disclaimer: rules.disclaimer
  };
}

/**
 * Reusable property affordability evaluation with the 20% rule.
 *
 * Rules:
 * - Property Price <= Buyer Upper Range: "Within Estimated Range"
 * - Property Price > Upper Range && <= 1.20 * Upper Range: "Above Estimated Range" (Softer warning)
 * - Property Price > 1.20 * Upper Range: "Assistance Recommended" (Triggers concierge assistance workflow)
 */
export function evaluatePropertyAffordability(
  propertyPrice: number,
  buyerUpperRange: number,
  buyerLowerRange?: number
): PropertyAffordabilityAssessment {
  const safePrice = Number(propertyPrice || 0);
  const safeUpper = Number(buyerUpperRange || 0);
  const safeLower = Number(buyerLowerRange || 0);

  if (!safeUpper || safeUpper <= 0 || !safePrice || safePrice <= 0 || isNaN(safePrice)) {
    return {
      propertyId: '',
      propertyPrice: safePrice || 0,
      buyerUpperRange: safeUpper || 0,
      priceToRangeRatio: 1,
      category: 'Within Estimated Range',
      isAboveRange: false,
      isAssistanceRecommended: false,
      message: 'Calculate your affordability range to see exact suitability'
    };
  }

  const ratio = safePrice / safeUpper;

  if (ratio <= 1.0) {
    const isComfortable = safeLower > 0 && safePrice <= safeLower;
    return {
      propertyId: '',
      propertyPrice: safePrice,
      buyerUpperRange: safeUpper,
      priceToRangeRatio: Number(ratio.toFixed(2)),
      category: 'Within Estimated Range',
      isAboveRange: false,
      isAssistanceRecommended: false,
      message: isComfortable
        ? 'Comfortably within your conservative range'
        : 'Within your calculated maximum qualification ceiling'
    };
  } else if (ratio <= 1.20) {
    const percentAbove = Math.round((ratio - 1) * 100);
    return {
      propertyId: '',
      propertyPrice: safePrice,
      buyerUpperRange: safeUpper,
      priceToRangeRatio: Number(ratio.toFixed(2)),
      category: 'Above Estimated Range',
      isAboveRange: true,
      isAssistanceRecommended: false,
      message: `Near upper range (+${percentAbove}%) — feasible with incentives or adjusted deposit`
    };
  } else {
    const percentAbove = Math.round((ratio - 1) * 100);
    return {
      propertyId: '',
      propertyPrice: safePrice,
      buyerUpperRange: safeUpper,
      priceToRangeRatio: Number(ratio.toFixed(2)),
      category: 'Assistance Recommended',
      isAboveRange: true,
      isAssistanceRecommended: true,
      message: `Above range (+${percentAbove}%) — co-signer or extended deposit structure advised`
    };
  }
}

/**
 * LocalStorage Keys
 */
export const PROFILE_STORAGE_KEY = 'truecondo_buyer_financial_profile';
export const ASSESSMENT_STORAGE_KEY = 'truecondo_affordability_assessment';
export const SHOWING_REQUESTS_KEY = 'truecondo_showing_requests';
export const OFFERS_STORAGE_KEY = 'truecondo_offers_drafts';

export function loadSavedProfile(): BuyerFinancialProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfileLocally(profile: BuyerFinancialProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

export function loadSavedAssessment(): AffordabilityAssessment | null {
  try {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAssessmentLocally(assessment: AffordabilityAssessment): void {
  try {
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(assessment));
  } catch {}
}
