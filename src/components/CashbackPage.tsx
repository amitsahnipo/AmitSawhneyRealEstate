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
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Gift,
  FileText,
  BadgeCheck,
  Handshake,
  Percent,
  Phone,
  Mail,
  Calendar,
  ArrowUpRight,
  Home
} from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface CashbackPageProps {
  onBackToHome: () => void;
  onOpenEligibilityModal: (initialData?: {
    purchasePrice?: number;
    targetProject?: string;
    transactionType?: 'Pre-Construction' | 'Resale';
  }) => void;
  onOpenConsultationModal: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
}

export const CashbackPage: React.FC<CashbackPageProps> = ({
  onBackToHome,
  onOpenEligibilityModal,
  onOpenConsultationModal,
  onOpenValuation
}) => {
  // Calculator state
  const [purchasePrice, setPurchasePrice] = useState<number>(950000);
  const [transactionType, setTransactionType] = useState<'Pre-Construction' | 'Resale'>('Pre-Construction');
  const [propertyType, setPropertyType] = useState<string>('Townhome');
  const [showRateDetails, setShowRateDetails] = useState<boolean>(false);
  const [customCommissionRate, setCustomCommissionRate] = useState<number>(2.5);
  const [customCashbackPercent, setCustomCashbackPercent] = useState<number>(1.0);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const calc = calculateCashback(
    purchasePrice,
    transactionType,
    showRateDetails ? customCashbackPercent : undefined,
    showRateDetails ? customCommissionRate : undefined
  );

  const pricePresets = [
    { label: '$650,000', value: 650000 },
    { label: '$800,000', value: 800000 },
    { label: '$950,000', value: 950000 },
    { label: '$1,200,000', value: 1200000 },
    { label: '$1,500,000', value: 1500000 },
    { label: '$2,000,000', value: 2000000 }
  ];

  const faqs = [
    {
      q: 'Is commission cashback legal in Ontario?',
      a: 'Yes, 100% legal. Under the Real Estate and Business Brokers Act (REBBA) and the Trust in Real Estate Services Act (TRESA) administered by the Real Estate Council of Ontario (RECO), licensed brokerages and agents are permitted to provide commission rebates directly to clients, provided the rebate terms are agreed upon in writing within a formal Buyer Representation Agreement before submitting an offer or worksheet.'
    },
    {
      q: 'Will the builder or seller reduce their incentives if I use your cashback program?',
      a: 'No. Builder promotional incentives (such as capped development levies, free assignment clauses, and decor credits) are standard offerings made to all cooperating brokers. Because cooperating broker commissions are pre-budgeted by the developer, your cashback comes directly out of Amit Sawhney’s cooperating commission—meaning you keep 100% of the builder’s perks PLUS your cashback.'
    },
    {
      q: 'When and how do I receive my cashback rebate?',
      a: 'Your cashback rebate is disbursed following the firm closing of your transaction and after the developer or seller’s lawyer transfers the cooperating commission to Blueprint Realty Brokerage Inc. You will receive a formal brokerage cheque or direct bank transfer accompanied by an itemized closing reconciliation statement.'
    },
    {
      q: 'Why do you offer a cashback rebate instead of keeping the full commission?',
      a: 'Modern technology, digital client portals, and streamlined pre-construction allocations have drastically reduced traditional overhead. Rather than spending thousands on generic billboards and print ads, Amit Sawhney passes those efficiency savings directly back to you—aligning fiduciary incentives and building lifelong client relationships.'
    },
    {
      q: 'Can I combine this cashback with the 1% Listing Fee to sell my current home?',
      a: 'Yes. In fact, that is our clients’ favorite combined strategy. When you sell your existing home with Amit for a 1% listing fee and buy your next pre-construction or resale property through him, you can save $15,000+ on your sale and receive $10,000+ cashback on your purchase—amounting to $25,000 to $40,000+ in total retained wealth.'
    },
    {
      q: 'What if I have already walked into a presentation centre or contacted the builder?',
      a: 'If you have merely walked into a presentation centre without signing a binding representation agreement or purchase agreement, you can usually still register Amit Sawhney as your cooperating REALTOR®. However, it is critical that you contact us immediately before submitting any worksheet or signing builder paperwork so we can confirm your representation and lock in your cashback.'
    }
  ];

  const caseStudies = [
    {
      title: 'First-Time Homebuyer — Townhome in Whitby',
      price: '$780,000',
      type: 'Pre-Construction Townhome',
      cashback: '$7,800',
      builderPerks: '$12,500 in capped levies + free assignment',
      totalBenefit: '$20,300',
      summary: 'Used the $7,800 cashback rebate to fund appliances, window coverings, and initial utility hookups upon interim occupancy.'
    },
    {
      title: 'Move-Up Family — Executive Detached in Brooklin',
      price: '$1,280,000',
      type: 'Resale 4-Bedroom Residence',
      cashback: '$12,800',
      builderPerks: '$0 (Resale property)',
      totalBenefit: '$12,800',
      summary: 'Combined with a 1% listing fee on their previous Oshawa home, saving over $31,000 across their dual-transaction move.'
    },
    {
      title: 'Pre-Construction Investor — 2 Downtown Condo Suites',
      price: '$1,450,000 (Combined)',
      type: 'Platinum VIP Mid-Rise Condos',
      cashback: '$14,500',
      builderPerks: '$20,000 in capped charges + extended deposit structure',
      totalBenefit: '$34,500',
      summary: 'Leveraged VIP platinum worksheets for priority tier-one pricing and applied the cashback directly toward second deposit milestones.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#C5A880] selection:text-stone-950 font-sans">
      
      {/* Top Editorial Breadcrumb & Regulatory Strip */}
      <div className="w-full bg-[#111111] text-stone-300 border-b border-stone-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="text-stone-400 hover:text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span>Back to Home</span>
            </button>
            <span className="text-stone-600">/</span>
            <span className="text-[#C5A880] uppercase tracking-[0.2em] font-semibold text-[11px]">
              Commission Cashback &amp; Rebate Program
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-stone-400 text-[11px] uppercase tracking-wider">
              RECO / TRESA Licensed Program
            </span>
            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="inline-flex items-center gap-1.5 text-[#C5A880] hover:text-white font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Direct: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>
          </div>

        </div>
      </div>

      {/* 1. Sharlene Chang-Inspired Editorial Hero Section */}
      <section className="relative bg-[#111111] text-white pt-20 pb-20 sm:pt-24 sm:pb-28 overflow-hidden border-b border-stone-800">
        
        {/* Subtle Architectural Backdrop */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury modern architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/85 to-black/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Tag & Tracker */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A880] font-sans">
              EXCLUSIVE REALTOR® PROGRAM
            </span>
            <span className="w-8 h-[1px] bg-[#C5A880]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300 bg-stone-800/80 px-2 py-0.5 border border-stone-700">
              Zero Fiduciary Compromise
            </span>
          </div>

          {/* Headline in Cormorant Garamond */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white font-serif tracking-tight leading-[1.12]">
              The Buyer Rebate &amp; <br className="hidden sm:inline" />
              <span className="font-serif italic font-normal text-[#F3E8DB]">
                Commission Cashback
              </span>{' '}
              Program
            </h1>
            <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-2xl font-sans">
              Buy your home with complete fiduciary representation from Amit Sawhney (RECO #4892105), preserve 100% of eligible developer perks, and receive up to <strong className="font-semibold text-white">1.0% of the purchase price back on closing</strong> (~40% of cooperating commission).
            </p>
          </div>

          {/* 5 Regulatory & Financial Value Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">01 / CAPITAL</span>
              <p className="text-xs font-bold text-white">Up to 1.0% Back</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Disbursed on firm closing</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">02 / INCENTIVES</span>
              <p className="text-xs font-bold text-white">Keep 100% Perks</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Stackable with builder credits</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">03 / ADVOCACY</span>
              <p className="text-xs font-bold text-white">Full Representation</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Contract &amp; 10-day review</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">04 / EXPENSE</span>
              <p className="text-xs font-bold text-white">$0 Buyer Fee</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Funded by developer / seller</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">05 / INTEGRITY</span>
              <p className="text-xs font-bold text-white">RECO Compliant</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Written TRESA agreements</p>
            </div>
          </div>

          {/* Quick CTA row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('cashback-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Calculate Your Cashback Rebate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenEligibilityModal({
                  purchasePrice: 950000,
                  transactionType: 'Pre-Construction'
                })
              }
              className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              Check Transaction Eligibility
            </button>
          </div>

        </div>
      </section>

      {/* 2. Interactive Commission Cashback Calculator */}
      <section id="cashback-calculator" className="py-20 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Eyebrow & Title */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D43] font-sans block">
              SIMULATOR &amp; BENEFIT BREAKDOWN
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 font-serif tracking-tight">
              Calculate Your Closing Rebate
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Adjust purchase price and transaction type to see your estimated cashback and combined buyer perks.
            </p>
          </div>

          {/* Calculator Container */}
          <div className="bg-white border border-stone-300 shadow-sm p-6 sm:p-10 lg:p-12">
            
            {/* Top toggle bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-[#8C6D43] font-semibold">
                  Transaction Classification
                </span>
                <h3 className="text-xl font-serif text-stone-900 font-bold">
                  {transactionType === 'Pre-Construction' ? 'Pre-Construction VIP Development' : 'Resale Property (Move-In Ready)'}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setTransactionType('Pre-Construction')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    transactionType === 'Pre-Construction'
                      ? 'bg-[#111111] text-white shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Pre-Construction
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('Resale')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    transactionType === 'Resale'
                      ? 'bg-[#111111] text-white shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Resale Property
                </button>
              </div>
            </div>

            {/* Main inputs & output split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-8">
              
              {/* Left Column: Sliders & Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Purchase Price Input */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label htmlFor="price-slider" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Anticipated Purchase Price
                    </label>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-950">
                      {formatCurrency(purchasePrice)}
                    </span>
                  </div>

                  <input
                    id="price-slider"
                    type="range"
                    min={350000}
                    max={2500000}
                    step={25000}
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-none appearance-none cursor-pointer accent-[#111111]"
                  />

                  {/* Price Presets */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {pricePresets.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setPurchasePrice(preset.value)}
                        className={`px-2.5 py-1 text-xs font-mono transition-colors border cursor-pointer ${
                          purchasePrice === preset.value
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Property Configuration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Townhome', 'Detached Home', 'Condo Suite', 'Semi-Detached'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`py-2 px-3 text-xs text-center border transition-all cursor-pointer ${
                          propertyType === type
                            ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Customize Rate Details */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRateDetails(!showRateDetails)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#8C6D43] transition-colors cursor-pointer"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>{showRateDetails ? 'Hide' : 'Fine-Tune'} Commission &amp; Cashback Percentages</span>
                  </button>

                  {showRateDetails && (
                    <div className="mt-3 p-4 bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Co-op Commission Rate: <strong>{customCommissionRate}%</strong>
                        </label>
                        <input
                          type="range"
                          min={1.5}
                          max={3.5}
                          step={0.25}
                          value={customCommissionRate}
                          onChange={e => setCustomCommissionRate(Number(e.target.value))}
                          className="w-full h-1.5 bg-stone-200 rounded-none appearance-none cursor-pointer accent-[#111111]"
                        />
                        <span className="text-[10px] text-stone-500">Ontario standard: 2.5%</span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                          Buyer Cashback Rate: <strong>{customCashbackPercent}%</strong>
                        </label>
                        <input
                          type="range"
                          min={0.5}
                          max={1.5}
                          step={0.1}
                          value={customCashbackPercent}
                          onChange={e => setCustomCashbackPercent(Number(e.target.value))}
                          className="w-full h-1.5 bg-stone-200 rounded-none appearance-none cursor-pointer accent-[#111111]"
                        />
                        <span className="text-[10px] text-stone-500">Standard offer: 1.0% purchase price</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transparency Guarantee */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#8C6D43] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Actual rebate amounts are legally formalized prior to submitting an offer via written Buyer Representation Agreement, subject to cooperating commission received by Blueprint Realty Brokerage Inc. and firm closing.
                  </p>
                </div>

              </div>

              {/* Right Column: Financial Results Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-[#111111] text-white p-7 sm:p-8 border border-stone-800 flex flex-col justify-between h-full shadow-lg">
                  
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A880]">
                        FINANCIAL BENEFIT AUDIT
                      </span>
                      <span className="px-2 py-0.5 bg-stone-800 text-[10px] uppercase tracking-wider text-stone-300">
                        {propertyType}
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="py-4 space-y-3.5 text-sm font-sans">
                      <div className="flex justify-between items-center text-stone-300">
                        <span>Purchase Price:</span>
                        <span className="font-mono font-semibold text-white">{formatCurrency(calc.purchasePrice)}</span>
                      </div>

                      <div className="flex justify-between items-center text-stone-300">
                        <span>Gross Co-operating Commission ({calc.commissionRate}%):</span>
                        <span className="font-mono text-stone-300">{formatCurrency(calc.grossCommission)}</span>
                      </div>

                      <div className="pt-3 border-t border-stone-800">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs uppercase tracking-wider text-[#C5A880] font-bold">
                            Estimated Buyer Cashback:
                          </span>
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E8DB]">
                            {formatCurrency(calc.estimatedCashback)}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1 text-right">
                          Paid directly to you upon closing (~{calc.savingsShareOfCommission}% share of commission)
                        </p>
                      </div>

                      {transactionType === 'Pre-Construction' && (
                        <div className="pt-3 border-t border-stone-800">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-stone-300">
                              Estimated Developer Perks:
                            </span>
                            <span className="font-mono text-emerald-400 font-bold text-sm">
                              +{formatCurrency(calc.estimatedBuilderIncentives)}*
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5 text-right">
                            Capped levies + free assignment + decor credits
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total Value Summary Box */}
                  <div className="mt-6 pt-5 border-t border-stone-800 bg-stone-900/60 -mx-7 sm:-mx-8 -mb-7 sm:-mb-8 p-6 sm:p-7">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-mono block">
                          ESTIMATED TOTAL BENEFIT
                        </span>
                        <span className="text-xs text-stone-400">Cashback + Builder Incentives</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
                          {formatCurrency(calc.totalBuyerBenefit)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenEligibilityModal({
                            purchasePrice: calc.purchasePrice,
                            transactionType
                          })
                        }
                        className="w-full py-3.5 px-4 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Check My Eligibility &amp; Lock Terms</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenConsultationModal('Commission Cashback Consultation')}
                        className="w-full py-2.5 px-4 bg-transparent hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Speak with Amit Sawhney
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. The 5-Step Architectural Timeline */}
      <section className="py-20 bg-[#FAF9F6] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D43] font-sans block">
              TRANSPARENT PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 font-serif tracking-tight">
              How the Cashback Program Operates
            </h2>
            <p className="text-stone-600 text-sm font-light">
              A frictionless, five-step path to locking in licensed fiduciary representation and closing-day savings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Property Selection',
                desc: 'Explore curated pre-construction master-planned launches or active MLS® resale homes across Ontario.'
              },
              {
                step: '02',
                title: 'Written Agreement',
                desc: 'Execute a transparent TRESA Buyer Representation Agreement with Amit Sawhney prior to builder registration.'
              },
              {
                step: '03',
                title: 'Fiduciary Guidance',
                desc: 'Receive comprehensive contract reviews, 10-day cooling-off guidance, and independent CMA pricing analysis.'
              },
              {
                step: '04',
                title: 'Firm Completion',
                desc: 'Execute your purchase agreement with Blueprint Realty Brokerage Inc. as cooperating representative.'
              },
              {
                step: '05',
                title: 'Direct Disbursement',
                desc: 'Following closing and receipt of funds by the brokerage, your cashback rebate is transferred directly to you.'
              }
            ].map(item => (
              <div
                key={item.step}
                className="bg-white border border-stone-200 p-6 flex flex-col justify-between hover:border-stone-400 transition-colors shadow-xs"
              >
                <div>
                  <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#8C6D43] block mb-3">
                    STEP {item.step}
                  </span>
                  <h3 className="text-base font-serif font-bold text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-light font-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Visual Comparison Matrix */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D43] font-sans block">
              REPRESENTATION COMPARISON
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 font-serif tracking-tight">
              Traditional Representation vs. Buy Smart™
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Why settle for standard walk-ins when you can retain dedicated advocacy and thousands of dollars back?
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-stone-200 text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-stone-700 w-2/5 font-sans">
                    Representation &amp; Value Factor
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider text-stone-500 w-3/10 bg-stone-100/50 font-sans">
                    Builder Sales Rep / Walk-in
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-wider text-[#111111] w-3/10 bg-[#FAF9F6] border-l-2 border-[#C5A880] font-sans">
                    Amit Sawhney Buy Smart™
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-sans">
                <tr>
                  <td className="py-4 px-6 font-medium text-stone-900">Legal Duty of Loyalty &amp; Fiduciary Advocacy</td>
                  <td className="py-4 px-6 text-center text-stone-500 bg-stone-50/50">Represents the builder/seller only</td>
                  <td className="py-4 px-6 text-center text-stone-900 font-semibold bg-[#FAF9F6] border-l-2 border-[#C5A880]">
                    100% Dedicated Buyer Fiduciary
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-stone-900">VIP Platinum Allocations &amp; Tier-1 Pricing</td>
                  <td className="py-4 px-6 text-center text-stone-500 bg-stone-50/50">Public walk-in pricing</td>
                  <td className="py-4 px-6 text-center text-stone-900 font-semibold bg-[#FAF9F6] border-l-2 border-[#C5A880]">
                    First-Tier Developer Pricing
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-stone-900">Builder Incentives &amp; Capped Levies</td>
                  <td className="py-4 px-6 text-center text-stone-500 bg-stone-50/50">Subject to sales rep discretion</td>
                  <td className="py-4 px-6 text-center text-stone-900 font-semibold bg-[#FAF9F6] border-l-2 border-[#C5A880]">
                    100% Retained &amp; Negotiated
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-stone-900">10-Day Statutory Rescission / Legal Guidance</td>
                  <td className="py-4 px-6 text-center text-stone-500 bg-stone-50/50">Unassisted / Self-guided</td>
                  <td className="py-4 px-6 text-center text-stone-900 font-semibold bg-[#FAF9F6] border-l-2 border-[#C5A880]">
                    Full Review &amp; Lawyer Handoff
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-stone-900">Independent Valuation (CMA) &amp; Rental Projections</td>
                  <td className="py-4 px-6 text-center text-stone-500 bg-stone-50/50">Marketing brochures only</td>
                  <td className="py-4 px-6 text-center text-stone-900 font-semibold bg-[#FAF9F6] border-l-2 border-[#C5A880]">
                    Objective Market Comps &amp; ROIC
                  </td>
                </tr>
                <tr className="bg-stone-50 font-bold">
                  <td className="py-4 px-6 text-stone-950 font-serif text-base">Direct Buyer Commission Cashback</td>
                  <td className="py-4 px-6 text-center text-stone-500">$0 (Kept by Seller / Developer)</td>
                  <td className="py-4 px-6 text-center text-emerald-800 text-base bg-emerald-50/60 border-l-2 border-[#C5A880]">
                    Up to {formatCurrency(calc.estimatedCashback)}* on Closing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 5. Real-World Case Studies */}
      <section className="py-20 bg-[#FAF9F6] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D43] font-sans block">
              CLIENT OUTCOMES
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 font-serif tracking-tight">
              Real-World Savings in Ontario
            </h2>
            <p className="text-stone-600 text-sm font-light">
              See how Ontario homebuyers and investors maximize their capital across various property categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((study, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6D43] block mb-2">
                    CASE 0{idx + 1}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
                    {study.title}
                  </h3>
                  <div className="text-xs text-stone-500 mb-4">{study.type}</div>

                  <div className="space-y-2.5 py-4 border-y border-stone-100 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Purchase Price:</span>
                      <span className="font-mono font-semibold text-stone-900">{study.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Cashback Rebate:</span>
                      <span className="font-mono font-bold text-emerald-700">{study.cashback}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Incentives Retained:</span>
                      <span className="text-stone-700 text-right font-medium">{study.builderPerks}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-light mt-4">
                    {study.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Total Retained Value:</span>
                  <span className="font-serif font-bold text-stone-950 text-base">{study.totalBenefit}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Frequently Asked Questions Accordion */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D43] font-sans block">
              REGULATORY &amp; TRANSACTION INQUIRIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 font-serif tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Clear, transparent answers about RECO compliance, closing disbursement, and program terms.
            </p>
          </div>

          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {faqs.map((faq, index) => (
              <div key={index} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between text-left gap-4 font-serif text-lg text-stone-900 hover:text-[#8C6D43] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-[#8C6D43] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  )}
                </button>

                {openFaqIndex === index && (
                  <div className="mt-3 text-stone-600 text-sm font-light leading-relaxed font-sans pr-8 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Legal Compliance & Non-Solicitation Statement */}
      <section className="py-12 bg-stone-100/70 border-b border-stone-200 text-xs text-stone-600 leading-relaxed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold uppercase tracking-wider text-[11px]">
            <Info className="w-4 h-4 text-[#8C6D43]" />
            <span>Statutory Program Disclosures (RECO, REBBA &amp; TRESA)</span>
          </div>

          <p>
            The Buy Smart™ Commission Cashback Program is offered exclusively by Amit Sawhney, Licensed Real Estate Sales Representative with Blueprint Realty Brokerage Inc. Cashback is applicable solely to eligible real estate purchase transactions in Ontario. To participate, the buyer must enter into a formal written Buyer Representation Agreement with Amit Sawhney prior to submitting an offer to purchase or reserving a pre-construction builder worksheet.
          </p>

          <p>
            <strong>Non-Solicitation Notice:</strong> If you are already under an active representation agreement with another real estate brokerage, this is not intended to solicit your business. By RECO regulations, cashback and representation services cannot be provided to buyers currently under an active buyer representation agreement with another brokerage.
          </p>

          <p>
            Cashback amounts are calculated based on the actual co-operating commission received by Blueprint Realty Brokerage Inc. and will be disbursed following firm transaction completion and receipt of commission funds. Estimates provided on this website are illustrative and do not constitute a guaranteed payment. Builder and seller incentives are subject to builder/seller approval and availability.
          </p>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="py-16 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-mono block">
            READY TO SAVE THOUSANDS ON CLOSING?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light font-serif tracking-tight">
            Lock in Your Cashback Before You Tour or Sign
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed font-sans">
            Connect directly with Amit Sawhney to verify eligibility for your target project or neighborhood before visiting presentation centres.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() =>
                onOpenEligibilityModal({
                  purchasePrice: 950000,
                  transactionType: 'Pre-Construction'
                })
              }
              className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer shadow-sm"
            >
              Check Transaction Eligibility
            </button>

            <button
              type="button"
              onClick={() => onOpenConsultationModal('Cashback Program Consultation')}
              className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Schedule 1-on-1 Consultation
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
