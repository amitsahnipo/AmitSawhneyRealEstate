import React from 'react';
import { Sparkles, ArrowRight, DollarSign, ShieldCheck, Gift, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/cashback';

interface CashbackTeaserProps {
  onNavigateToCashback: () => void;
  onOpenEligibilityModal: () => void;
}

export const CashbackTeaser: React.FC<CashbackTeaserProps> = ({
  onNavigateToCashback,
  onOpenEligibilityModal
}) => {
  const rebateTiers = [
    { price: 750000, rebate: 7500, label: 'Townhome / Condo' },
    { price: 1000000, rebate: 10000, label: 'Executive Town / Semi', featured: true },
    { price: 1500000, rebate: 15000, label: 'Detached Residence' }
  ];

  return (
    <section id="cashback" className="py-16 sm:py-20 bg-[#FAF9F6] border-y border-stone-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Container with refined border */}
        <div className="bg-white border border-stone-200 p-8 sm:p-12 lg:p-14 relative shadow-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Value Proposition & Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Category Marker */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D43] font-sans">
                  03 — BUYER REBATE PROGRAM
                </span>
                <span className="w-8 h-[1px] bg-[#C5A880]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200/60">
                  RECO Compliant
                </span>
              </div>

              {/* Serif Display Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900 font-serif tracking-tight leading-[1.15]">
                Buy Smart. Retain Capital. <br />
                <span className="font-serif italic font-normal text-[#8C6D43]">
                  Up to 1.0% Commission Cashback.
                </span>
              </h2>

              {/* Informative Body Copy */}
              <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-xl font-sans">
                When purchasing your pre-construction suite or resale property with Amit Sawhney as your licensed REALTOR®, you receive full fiduciary representation and up to <strong className="font-semibold text-stone-900">1.0% of the purchase price back on closing</strong> (~40% of cooperating commission)—while keeping 100% of builder promotions, capped levies, and credits intact.
              </p>

              {/* 3 Key Tenets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-stone-50 border border-stone-200/60 text-left">
                  <div className="flex items-center gap-1.5 text-stone-900 font-medium text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-[#8C6D43]" />
                    <span>Direct Rebate</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Paid on firm closing toward moving or mortgage</p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200/60 text-left">
                  <div className="flex items-center gap-1.5 text-stone-900 font-medium text-xs">
                    <Gift className="w-3.5 h-3.5 text-[#8C6D43]" />
                    <span>Keep Incentives</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Stackable with builder discounts &amp; capped levies</p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200/60 text-left">
                  <div className="flex items-center gap-1.5 text-stone-900 font-medium text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D43]" />
                    <span>Fiduciary Duty</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Contract review, cooling-off &amp; market analysis</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <button
                  type="button"
                  onClick={onNavigateToCashback}
                  className="px-6 py-3.5 bg-[#111111] hover:bg-[#252525] text-white text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Explore Cashback Details &amp; Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={onOpenEligibilityModal}
                  className="px-5 py-3.5 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Check Transaction Eligibility</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>

            </div>

            {/* Right Column: Mini Rebate Demonstration Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[#111111] text-white p-6 sm:p-8 border border-stone-800 relative">
                
                {/* Header of card */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#C5A880]">
                    ESTIMATED CLIENT CASHBACK
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">
                    1.0% Rate
                  </span>
                </div>

                {/* Tiers list */}
                <div className="divide-y divide-stone-800/80 my-4">
                  {rebateTiers.map((tier) => (
                    <div
                      key={tier.price}
                      className={`py-3.5 flex items-center justify-between ${
                        tier.featured ? 'bg-stone-900/50 -mx-3 px-3 border-l-2 border-[#C5A880]' : ''
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-200">
                          {formatCurrency(tier.price)}
                        </div>
                        <div className="text-[11px] text-stone-400 font-light">
                          {tier.label}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base sm:text-lg font-serif font-bold text-[#F3E8DB]">
                          +{formatCurrency(tier.rebate)}
                        </div>
                        <div className="text-[10px] text-[#C5A880] uppercase tracking-wider">
                          Rebate on Closing
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtext and interactive invite */}
                <div className="pt-4 border-t border-stone-800">
                  <p className="text-[11px] text-stone-400 leading-relaxed font-light mb-4">
                    Based on standard 2.5% co-operating commission. Actual rebate formalized via Buyer Representation Agreement prior to offer submission.
                  </p>

                  <button
                    type="button"
                    onClick={onNavigateToCashback}
                    className="w-full py-2.5 px-4 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Dedicated Cashback Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
