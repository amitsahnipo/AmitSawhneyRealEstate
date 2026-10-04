import React, { useState } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ChevronRight,
  Info,
  Gift,
  FileText,
  BadgeCheck,
  Handshake,
  Percent
} from 'lucide-react';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface CashbackSectionProps {
  onOpenEligibilityModal: (initialData?: { purchasePrice?: number; targetProject?: string; transactionType?: 'Pre-Construction' | 'Resale' }) => void;
  onOpenConsultationModal: (propertyInterest?: string) => void;
}

export const CashbackSection: React.FC<CashbackSectionProps> = ({
  onOpenEligibilityModal,
  onOpenConsultationModal
}) => {
  const [purchasePrice, setPurchasePrice] = useState<number>(900000);
  const [transactionType, setTransactionType] = useState<'Pre-Construction' | 'Resale'>('Pre-Construction');
  const [propertyType, setPropertyType] = useState<string>('Townhome');
  const [showRateDetails, setShowRateDetails] = useState<boolean>(false);
  const [customCommissionRate, setCustomCommissionRate] = useState<number>(2.5);
  const [customCashbackPercent, setCustomCashbackPercent] = useState<number>(1.0);

  const calc = calculateCashback(
    purchasePrice,
    transactionType,
    showRateDetails ? customCashbackPercent : undefined,
    showRateDetails ? customCommissionRate : undefined
  );

  const pricePresets = [
    { label: '$650,000', value: 650000 },
    { label: '$800,000', value: 800000 },
    { label: '$900,000', value: 900000 },
    { label: '$1,200,000', value: 1200000 },
    { label: '$1,500,000', value: 1500000 }
  ];

  return (
    <section id="cashback" className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Eyebrow & Main Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Buy Smart, Save Big • Exclusive Realtor® Program</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-5 font-serif">
            Buy Your Home. Get Expert Advice. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Keep More Money.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
            When you purchase through our website and work with Amit Sawhney as your licensed REALTOR®, you can qualify
            for cashback on eligible transactions. That means you get <strong>full fiduciary representation</strong>, take
            advantage of <strong>eligible builder or seller incentives</strong>, and potentially put{' '}
            <strong>thousands of dollars back in your pocket</strong>.
          </p>

          {/* Quick Pillar Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">1. Massive Savings</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Receive up to 1.0% purchase price (approx 40% cooperating commission) back upon successful closing.
                </p>
              </div>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">2. Keep Builder Incentives</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Cashback is designed to be in addition to eligible builder perks, capped levies, and signing bonuses.
                </p>
              </div>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0 text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">3. Professional Fiduciary</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Zero compromise on advice. Contract reviews, 10-day cooling-off guidance, and full representation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Calculator Block */}
        <div className="bg-gradient-to-b from-stone-800/90 to-stone-800/60 border border-stone-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-700/80">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" />
                <span>Interactive Savings Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Commission Cashback Calculator</h3>
              <p className="text-sm text-stone-300 mt-1">
                Select your anticipated purchase price to calculate estimated cashback savings and builder perks.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-stone-900/80 p-1.5 rounded-2xl border border-stone-700 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setTransactionType('Pre-Construction')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  transactionType === 'Pre-Construction'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Pre-Construction
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('Resale')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  transactionType === 'Resale'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Resale Property
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8">
            {/* Left Inputs Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Purchase Price Input & Presets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="cashback-purchase-price" className="text-sm font-medium text-stone-300">
                    Estimated Purchase Price
                  </label>
                  <span className="text-2xl font-bold text-white font-mono">
                    {formatCurrency(purchasePrice)}
                  </span>
                </div>

                <input
                  id="cashback-purchase-price"
                  type="range"
                  min={350000}
                  max={2500000}
                  step={25000}
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  className="w-full h-2.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                />

                <div className="flex flex-wrap gap-2 mt-3">
                  {pricePresets.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setPurchasePrice(preset.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        purchasePrice === preset.value
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-stone-900/60 border-stone-700 text-stone-300 hover:text-white hover:border-stone-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Property Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Townhome', 'Detached Home', 'Condo Suite', 'Semi-Detached'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        propertyType === type
                          ? 'bg-stone-700 border-amber-400 text-white font-semibold shadow-inner'
                          : 'bg-stone-900/40 border-stone-700/80 text-stone-300 hover:border-stone-500 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Advanced Rate Controls Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowRateDetails(!showRateDetails)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-amber-300 transition-colors"
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>{showRateDetails ? 'Hide' : 'Customize'} Commission &amp; Cashback Rates</span>
                </button>

                {showRateDetails && (
                  <div className="mt-3 p-4 bg-stone-900/90 border border-stone-700/80 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Co-operating Commission Rate: <strong className="text-white">{customCommissionRate}%</strong>
                      </label>
                      <input
                        type="range"
                        min={1.5}
                        max={3.5}
                        step={0.25}
                        value={customCommissionRate}
                        onChange={e => setCustomCommissionRate(Number(e.target.value))}
                        className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <span className="text-[10px] text-stone-300">Standard GTA benchmark: 2.5%</span>
                    </div>

                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Buyer Cashback Rate: <strong className="text-amber-300">{customCashbackPercent}%</strong>
                      </label>
                      <input
                        type="range"
                        min={0.5}
                        max={1.5}
                        step={0.1}
                        value={customCashbackPercent}
                        onChange={e => setCustomCashbackPercent(Number(e.target.value))}
                        className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <span className="text-[10px] text-stone-300">Standard offer: 1.0% of purchase price</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Legal Transparency Note */}
              <div className="bg-stone-900/60 border border-stone-700/60 rounded-xl p-3.5 text-xs text-stone-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Actual cashback is subject to formal written Buyer Representation Agreement prior to submission,
                  commission received by brokerage, transaction eligibility, and closing completion. Estimates are not
                  guarantees.
                </p>
              </div>
            </div>

            {/* Right Value Results Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-stone-900/95 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl flex-1 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Value Breakdown
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                      {transactionType === 'Pre-Construction' ? 'Pre-Con VIP' : 'Resale'}
                    </span>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-300">Purchase Price:</span>
                      <span className="text-stone-100 font-semibold">{formatCurrency(calc.purchasePrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-300">
                        Gross Co-op Commission ({calc.commissionRate}%):
                      </span>
                      <span className="text-stone-200 font-mono">{formatCurrency(calc.grossCommission)}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-800">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          Estimated Buyer Cashback:
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                          {formatCurrency(calc.estimatedCashback)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-0.5 text-right">
                        Paid to you upon firm closing (~{calc.savingsShareOfCommission}% share of commission)
                      </p>
                    </div>

                    {transactionType === 'Pre-Construction' && (
                      <div className="pt-2 border-t border-stone-800">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-emerald-300 flex items-center gap-1.5">
                            <Gift className="w-4 h-4 text-emerald-400" />
                            Est. Builder Incentives:
                          </span>
                          <span className="text-base font-bold text-emerald-300 font-mono">
                            +{formatCurrency(calc.estimatedBuilderIncentives)}*
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 mt-0.5 text-right">
                          Capped development levies + decor credits + free assignment
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Benefit Box */}
                <div className="mt-4 pt-4 border-t-2 border-stone-800 bg-stone-800/60 -mx-6 -mb-6 p-6 rounded-b-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-stone-300 block">
                        Potential Total Benefit
                      </span>
                      <span className="text-xs text-stone-300">Cashback + Builder Incentives</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                        {formatCurrency(calc.totalBuyerBenefit)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenEligibilityModal({
                          purchasePrice: calc.purchasePrice,
                          transactionType
                        })
                      }
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>Check My Eligibility &amp; Unlock Cashback</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenConsultationModal('Commission Cashback Program')}
                      className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Handshake className="w-3.5 h-3.5 text-amber-400" />
                      <span>Speak With Amit Sawhney, REALTOR®</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Savings Comparison Table */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Traditional Purchase vs. Purchase Through Us
            </h3>
            <p className="text-sm text-stone-300 mt-2">
              Why settle for standard representation when you can receive expert fiduciary advice AND money back?
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-stone-800/80 rounded-2xl overflow-hidden border border-stone-700">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="py-4 px-5 text-left text-xs font-bold uppercase tracking-wider text-stone-300 w-2/5">
                    Service &amp; Value Factor
                  </th>
                  <th className="py-4 px-5 text-center text-xs font-bold uppercase tracking-wider text-stone-300 w-3/10 bg-stone-900/50">
                    Traditional Purchase
                  </th>
                  <th className="py-4 px-5 text-center text-xs font-bold uppercase tracking-wider text-amber-300 w-3/10 bg-amber-500/10 border-l border-amber-500/30">
                    Purchase Through Our Website
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700/60 text-sm">
                <tr>
                  <td className="py-3.5 px-5 text-stone-200 font-medium">Property &amp; Project Access</td>
                  <td className="py-3.5 px-5 text-center text-stone-300 bg-stone-900/50">Standard MLS / Public Walk-in</td>
                  <td className="py-3.5 px-5 text-center text-emerald-300 font-semibold bg-amber-500/5 border-l border-amber-500/30">
                    VIP Platinum Launch Access &amp; Inventory
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 text-stone-200 font-medium">Licensed Fiduciary Representation</td>
                  <td className="py-3.5 px-5 text-center text-stone-300 bg-stone-900/50">
                    None if buying direct from builder rep
                  </td>
                  <td className="py-3.5 px-5 text-center text-emerald-300 font-semibold bg-amber-500/5 border-l border-amber-500/30">
                    100% Buyer Fiduciary Representation
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 text-stone-200 font-medium">Builder / Seller Incentives</td>
                  <td className="py-3.5 px-5 text-center text-stone-300 bg-stone-900/50">Standard Public Offers</td>
                  <td className="py-3.5 px-5 text-center text-emerald-300 font-semibold bg-amber-500/5 border-l border-amber-500/30">
                    Kept Intact + VIP Capped Levies &amp; Discounts
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 text-stone-200 font-medium">10-Day Cooling-Off &amp; Contract Review</td>
                  <td className="py-3.5 px-5 text-center text-stone-300 bg-stone-900/50">DIY or Separate Legal Fee</td>
                  <td className="py-3.5 px-5 text-center text-emerald-300 font-semibold bg-amber-500/5 border-l border-amber-500/30">
                    Comprehensive Guidance Included
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 text-stone-200 font-medium">Comparative Pricing &amp; Rental Projections</td>
                  <td className="py-3.5 px-5 text-center text-stone-300 bg-stone-900/50">Limited / Builder Marketing</td>
                  <td className="py-3.5 px-5 text-center text-emerald-300 font-semibold bg-amber-500/5 border-l border-amber-500/30">
                    Independent CMA &amp; ROI Analysis
                  </td>
                </tr>
                <tr className="bg-stone-800 font-bold">
                  <td className="py-4 px-5 text-white">Buyer Commission Cashback</td>
                  <td className="py-4 px-5 text-center text-stone-300 bg-stone-900/80 font-medium">$0 (Kept by Brokerage)</td>
                  <td className="py-4 px-5 text-center text-amber-300 text-base bg-amber-500/20 border-l border-amber-500/40">
                    Yes! Up to {formatCurrency(calc.estimatedCashback)}*
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pre-Construction vs Resale Specific Messaging Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Pre-Con Spotlight */}
          <div className="bg-stone-800/70 border border-stone-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Buying Pre-Construction?</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">Don't Leave Money on the Table.</h4>
              <p className="text-sm text-stone-300 leading-relaxed mb-4">
                Purchasing directly at a presentation centre means the builder's sales staff represent the builder's
                interests. By registering with Amit Sawhney first, you receive <strong>dedicated buyer advocacy</strong>,
                developer incentives, and <strong>cashback at closing</strong>.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>VIP Platinum worksheet allocations before public releases</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Developer deposit structure navigation &amp; milestone planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Assignment rights &amp; capped development charges review</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Potential cashback disbursed after completion</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-300">Tribute, Great Gulf &amp; more</span>
              <button
                type="button"
                onClick={() =>
                  onOpenEligibilityModal({
                    purchasePrice: 850000,
                    transactionType: 'Pre-Construction'
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>Check Pre-Con Eligibility</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Resale Spotlight */}
          <div className="bg-stone-800/70 border border-stone-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Buying a Resale Home?</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">Turnkey Homes with Cash Back.</h4>
              <p className="text-sm text-stone-300 leading-relaxed mb-4">
                Whether purchasing a detached family home in Whitby or a luxury condo in Toronto, you can qualify for
                cashback on eligible transactions while benefiting from sharp negotiation and complete market analysis.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full Comparative Market Analysis (CMA) before making an offer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Offer strategy, inspection condition clauses, and counter-offer protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Neighborhood sales data across Durham Region and GTA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Direct cashback toward your moving costs or mortgage reduction</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-300">Whitby, Oshawa, Toronto &amp; GTA</span>
              <button
                type="button"
                onClick={() =>
                  onOpenEligibilityModal({
                    purchasePrice: 950000,
                    transactionType: 'Resale'
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Check Resale Eligibility</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5-Step "How Does Cashback Work?" Timeline */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">How Does Cashback Work?</h3>
            <p className="text-sm text-stone-300 mt-2">
              A transparent, five-step path to locking in professional advice and your savings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Find Your Property',
                desc: 'Browse curated pre-construction developments and resale listings across GTA & Durham Region.'
              },
              {
                step: '02',
                title: 'Connect & Confirm',
                desc: 'Contact us or register before signing with a builder or seller to confirm eligibility and cashback terms.'
              },
              {
                step: '03',
                title: 'Expert Representation',
                desc: 'Get independent market advice, pricing analysis, contract review, and floor plan evaluations.'
              },
              {
                step: '04',
                title: 'Complete Your Purchase',
                desc: 'Execute your agreement of purchase and sale with Amit Sawhney as your co-operating REALTOR®.'
              },
              {
                step: '05',
                title: 'Receive Eligible Cashback',
                desc: 'After closing is complete and commission is disbursed to the brokerage, your cashback is delivered.'
              }
            ].map(item => (
              <div
                key={item.step}
                className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <span className="text-2xl font-mono font-extrabold text-amber-400/70 block mb-2">{item.step}</span>
                  <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Buy Through Us Section */}
        <div className="bg-stone-800/40 border border-stone-700/60 rounded-3xl p-6 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-white font-serif">Why Buy Through Us?</h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              The smart way to buy in today's Ontario real estate market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">1. Save Meaningful Money</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Cashback puts thousands back in your pocket for renovations, moving costs, or emergency funds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">2. Keep Eligible Incentives</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Don't lose out on developer credits or seller concessions. We ensure you capitalize on both.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">3. Licensed Fiduciary Guidance</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Amit Sawhney (RECO #4892105) acts solely in your best interests from initial search to closing day.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">4. VIP Development Access</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Access Platinum VIP pricing, best floor plans, and priority unit allocations before the general public.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">5. Independent Due Diligence</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Unbiased analysis of builder track records, Tarion coverage, hidden fees, and resale appreciation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Handshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">6. Frictionless Process</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Digital client portal to track your worksheet, agreements, closing milestones, and cashback payout.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclosures & RECO Compliance Statement */}
        <div className="border border-stone-800 bg-stone-950/60 rounded-2xl p-5 text-stone-300 text-xs leading-relaxed">
          <h5 className="font-bold text-stone-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Legal Compliance &amp; Program Disclosures (RECO / REBBA)</span>
          </h5>
          <p className="mb-2">
            The "Buy Smart, Save Big" Commission Cashback Program is offered exclusively through Amit Sawhney, Licensed
            Real Estate Sales Representative, with Blueprint Realty Brokerage Inc. Cashback is applicable solely to
            eligible real estate purchase transactions in Ontario. To participate, the buyer must enter into a formal
            written Buyer Representation Agreement with Amit Sawhney prior to submitting an offer to purchase or
            pre-construction builder worksheet reservation.
          </p>
          <p className="mb-2">
            <strong>Non-Solicitation Notice:</strong> If you are already under an active representation agreement with
            another real estate brokerage, this is not an attempt to solicit your business. By RECO regulations, cashback
            and representation services cannot be provided to buyers currently under an active buyer representation
            agreement.
          </p>
          <p>
            Cashback amounts are calculated based on the actual co-operating commission received by Blueprint Realty
            Brokerage Inc. and will be disbursed following transaction completion and receipt of commission funds.
            Estimates provided on this website are illustrative and do not constitute a guaranteed payment. Builder and
            seller incentives are subject to builder/seller approval and availability. Taxes and other transaction
            considerations may apply.
          </p>
        </div>
      </div>
    </section>
  );
};
