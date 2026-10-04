import React, { useState } from 'react';
import { TrendingUp, DollarSign, Building2, ShieldCheck, ArrowRight, Calculator, PieChart, Sparkles, CheckCircle2 } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface InvestmentSectionProps {
  onOpenConsultation: (topic?: string, notes?: string) => void;
  onOpenVIPModal: (projectId?: string) => void;
}

export const InvestmentSection: React.FC<InvestmentSectionProps> = ({
  onOpenConsultation,
  onOpenVIPModal
}) => {
  // Interactive Deposit Leverage Estimator State
  const [purchasePrice, setPurchasePrice] = useState<number>(750000);
  const [appreciationRate, setAppreciationRate] = useState<number>(4.5);
  const [constructionYears, setConstructionYears] = useState<number>(3);
  const [depositPercent, setDepositPercent] = useState<number>(15);

  const totalDeposit = purchasePrice * (depositPercent / 100);
  const projectedFutureValue = Math.round(purchasePrice * Math.pow(1 + appreciationRate / 100, constructionYears));
  const estimatedCapitalGain = projectedFutureValue - purchasePrice;
  const returnOnInvestedCapital = totalDeposit > 0 ? Math.round((estimatedCapitalGain / totalDeposit) * 100) : 0;

  return (
    <section id="investment-opportunities" className="py-24 bg-[#FDFCF7] border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-[#0F2942]" />
            <span>High-Yield Strategic Corridors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] font-serif tracking-tight">
            Real Estate Opportunities Worth Exploring
          </h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            Harness pre-construction deposit leverage, transit-oriented development along Highway 407 & GO expansions, and resilient tenant demand in Durham Region.
          </p>
        </div>

        {/* 3 Core Investment Vectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F2942]/10 text-[#0F2942] flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#111827]">
              The Power of Deposit Leverage
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Control a $750,000+ real asset with just 10%–15% deposit spread over 1 to 2 years. 100% of market appreciation accrues on the full asset value before closing.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>Extended builder payment milestones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>No mortgage payments during build phase</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A880]/20 text-[#8C6D43] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#111827]">
              Durham Infrastructure Boom
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Durham Region is experiencing historic population inflow driven by Highway 407 expansions, the Lakeshore East GO extension to Bowmanville, and Ontario Tech University expansions.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>Top rental occupancy rates in Whitby/Oshawa</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>Substantial price-per-sqft discount vs Toronto core</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2D4B3E]/15 text-[#2D4B3E] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#111827]">
              Capped Levies & Assignment Rights
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our Platinum VIP contracts safeguard investor profitability with negotiated maximum development charge caps and free right-to-assign clauses before closing.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>Fixed closing costs with capped builder levies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>Exit flexibility with free assignment rights</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Interactive Deposit Leverage & ROI Simulator */}
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 border border-gray-800 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-gray-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C5A880] mb-2">
                <Calculator className="w-4 h-4" />
                <span>Interactive Pre-Construction Leverage Simulator</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
                Calculate Your Projected Return on Invested Capital (ROIC)
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1">
                See how a modest down deposit compounds across the full asset valuation during the construction phase.
              </p>
            </div>

            <button
              onClick={() => onOpenConsultation('Investment Portfolio & ROI Analysis', `Evaluating $${purchasePrice.toLocaleString()} pre-con with ${depositPercent}% deposit`)}
              className="px-6 py-3 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all shrink-0"
            >
              Request Custom Pro Forma
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Purchase Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium">Purchase Price</span>
                  <span className="text-[#C5A880] font-extrabold font-mono text-base">${purchasePrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="400000"
                  max="1600000"
                  step="25000"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#C5A880]"
                />
              </div>

              {/* Deposit Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium">Total Deposit During Build</span>
                  <span className="text-[#C5A880] font-extrabold font-mono text-base">{depositPercent}% (${totalDeposit.toLocaleString()})</span>
                </div>
                <div className="flex gap-2">
                  {[10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setDepositPercent(pct)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        depositPercent === pct
                          ? 'bg-[#C5A880] text-[#111827]'
                          : 'bg-gray-800 text-stone-300 hover:bg-gray-700'
                      }`}
                    >
                      {pct}% Deposit
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Appreciation Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium">Est. Annual Market Appreciation</span>
                  <span className="text-emerald-400 font-extrabold font-mono text-base">{appreciationRate}% / yr</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={appreciationRate}
                  onChange={e => setAppreciationRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

            </div>

            {/* Right Output Display */}
            <div className="lg:col-span-6 bg-[#0B0F17] p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800">
                  <p className="text-[11px] text-stone-300 font-medium">Out-of-Pocket Deposit</p>
                  <p className="text-xl font-black text-white font-mono">${totalDeposit.toLocaleString()}</p>
                  <p className="text-[10px] text-stone-300">Spread over 12-24 mo</p>
                </div>

                <div className="bg-gray-900/90 p-4 rounded-xl border border-gray-800">
                  <p className="text-[11px] text-stone-300 font-medium">Est. Value at Occupancy</p>
                  <p className="text-xl font-black text-[#C5A880] font-mono">${projectedFutureValue.toLocaleString()}</p>
                  <p className="text-[10px] text-stone-300">In {constructionYears} Years</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900 to-gray-900 p-5 rounded-2xl border border-[#C5A880]/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Projected Capital Gain</p>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono">+${estimatedCapitalGain.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">Return on Deposit</p>
                  <p className="text-2xl sm:text-3xl font-black text-[#E6CBA8] font-mono">+{returnOnInvestedCapital}%</p>
                </div>
              </div>

              <p className="text-[11px] text-stone-300 leading-relaxed italic">
                *Illustrative simulation assuming compound annual capital appreciation over a {constructionYears}-year build cycle. Past performance is not indicative of future returns. Consult Amit Sawhney for detailed project-specific pro formas.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
