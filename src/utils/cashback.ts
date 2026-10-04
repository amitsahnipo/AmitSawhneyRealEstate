import { CashbackConfig } from '../types';

export const DEFAULT_CASHBACK_CONFIG: CashbackConfig = {
  defaultCashbackPercent: 1.0, // 1.0% of purchase price (approx 40% of standard 2.5% co-operating commission)
  defaultCommissionRate: 2.5, // 2.5% typical co-operating commission in GTA & Durham Region
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
    'Potential cashback is provided through Amit Sawhney, Licensed REALTOR® with Blueprint Realty Brokerage Inc. on eligible pre-construction and resale purchase transactions. Actual cashback is subject to entering into a formal written Buyer Representation Agreement with Amit Sawhney prior to submitting an offer or worksheet reservation, the co-operating commission actually received by the brokerage, successful closing of the transaction, and full compliance with RECO (Real Estate Council of Ontario) regulations. Cashback is disbursed after transaction closing and commission receipt. Not intended to solicit buyers currently under an active representation agreement with another brokerage. Builder and seller incentives are provided directly by respective builders/sellers and are subject to their specific promotional terms.'
};

export interface CashbackCalculationResult {
  purchasePrice: number;
  commissionRate: number;
  grossCommission: number;
  cashbackPercent: number;
  estimatedCashback: number;
  estimatedBuilderIncentives: number;
  totalBuyerBenefit: number;
  savingsShareOfCommission: number;
  isEligiblePrice: boolean;
}

/**
 * Calculates estimated commission, buyer cashback, builder perks, and total buyer benefit.
 */
export function calculateCashback(
  price: number,
  transactionType: 'Pre-Construction' | 'Resale' | 'Undecided' = 'Pre-Construction',
  customCashbackPercent?: number,
  customCommissionRate?: number,
  config: CashbackConfig = DEFAULT_CASHBACK_CONFIG
): CashbackCalculationResult {
  const safePrice = Math.max(0, isNaN(price) ? 0 : price);
  const commissionRate = customCommissionRate !== undefined ? customCommissionRate : config.defaultCommissionRate;
  const cashbackPercent = customCashbackPercent !== undefined ? customCashbackPercent : config.defaultCashbackPercent;

  const isEligiblePrice = safePrice >= config.minPurchasePrice;

  // Gross cooperating commission received by brokerage
  const grossCommission = Math.round(safePrice * (commissionRate / 100));

  // Buyer cashback calculation (capped at max configured amount)
  let estimatedCashback = isEligiblePrice ? Math.round(safePrice * (cashbackPercent / 100)) : 0;
  if (estimatedCashback > config.maxCashbackAmount) {
    estimatedCashback = config.maxCashbackAmount;
  }

  // Realistic builder incentives benchmark (for pre-con developments: capped levies, free assignment, decor credits)
  let estimatedBuilderIncentives = 0;
  if (transactionType === 'Pre-Construction' && isEligiblePrice) {
    if (safePrice < 600000) {
      estimatedBuilderIncentives = 25000;
    } else if (safePrice < 900000) {
      estimatedBuilderIncentives = 40000;
    } else if (safePrice < 1300000) {
      estimatedBuilderIncentives = 55000;
    } else {
      estimatedBuilderIncentives = 70000;
    }
  }

  const totalBuyerBenefit = estimatedCashback + estimatedBuilderIncentives;
  const savingsShareOfCommission = grossCommission > 0 ? Math.round((estimatedCashback / grossCommission) * 100) : 0;

  return {
    purchasePrice: safePrice,
    commissionRate,
    grossCommission,
    cashbackPercent,
    estimatedCashback,
    estimatedBuilderIncentives,
    totalBuyerBenefit,
    savingsShareOfCommission,
    isEligiblePrice
  };
}

/**
 * Formats a number into Canadian currency ($X,XXX)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(amount);
}
