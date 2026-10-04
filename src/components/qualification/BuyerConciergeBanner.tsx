import React from 'react';
import {
  Sparkles,
  DollarSign,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  Lock
} from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { useAuth } from '../../context/AuthContext';

interface ConciergeBannerProps {
  onOpenConsultation?: (topic?: string, notes?: string) => void;
}

export const BuyerConciergeBanner: React.FC<ConciergeBannerProps> = ({ onOpenConsultation }) => {
  const {
    isQualified,
    assessment,
    openWizard,
    filterOnlyAffordable,
    setFilterOnlyAffordable,
    activeJourneyStage
  } = useAffordability();
  const { isAuthenticated, isClient, user, openAuthModal } = useAuth();

  const hasCalculatedRange = Boolean(isQualified && assessment && assessment.estimatedPurchasePriceMax > 0);
  const showAffordabilityRange = isAuthenticated && isClient && hasCalculatedRange;

  // Steps in journey: 1 Financial Profile → 2 Affordability → 3 Property Preferences → 4 Search → 5 Showing → 6 Offer
  const stages = [
    { num: 1, title: 'Financial Profile' },
    { num: 2, title: 'Affordability' },
    { num: 3, title: 'Preferences' },
    { num: 4, title: 'Search' },
    { num: 5, title: 'Showing' },
    { num: 6, title: 'Offer' }
  ];

  return (
    <div className="w-full bg-[#111111] border-y border-white/10 text-white shadow-xl relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#C5A880]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Top Mini Journey Breadcrumb */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[11px] font-mono text-stone-400 overflow-x-auto scrollbar-none gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="uppercase tracking-widest text-[#C5A880] font-bold">Guided Buyer Journey</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {stages.map((stage, idx) => {
              const isActive = activeJourneyStage === stage.num;
              const isPast = activeJourneyStage > stage.num;
              return (
                <React.Fragment key={stage.num}>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isActive
                          ? 'bg-[#C5A880] text-black font-extrabold'
                          : isPast
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-stone-500'
                      }`}
                    >
                      {stage.num}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isActive
                          ? 'text-white font-bold'
                          : isPast
                          ? 'text-stone-300'
                          : 'text-stone-500'
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <span className="text-stone-700 font-light mx-1">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Banner Controls */}
        <div className="pt-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {showAffordabilityRange ? (
            /* 1. Qualified State: Only shown to logged in clients after they calculate their buying range */
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Preliminary Affordability Active
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Stress Rate: {assessment?.effectiveStressRate}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-400">Your Estimated Range:</span>
                    <span className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                      ${(assessment!.estimatedPurchasePriceMin / 1000).toFixed(0)}K – ${(assessment!.estimatedPurchasePriceMax / 1000).toFixed(0)}K
                    </span>
                    <span className="text-xs text-stone-400">
                      (${assessment!.estimatedDownPayment.toLocaleString()} down)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Toggle: "Show Me Properties I Can Afford" */}
                <button
                  type="button"
                  onClick={() => setFilterOnlyAffordable(prev => !prev)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    filterOnlyAffordable
                      ? 'bg-emerald-500 text-black font-bold shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-stone-200 border border-white/10'
                  }`}
                  title="Filter inventory to properties at or below your estimated purchase range"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {filterOnlyAffordable ? 'Filter Active: Affordable Only' : 'Only Properties I Can Afford'}
                  </span>
                  {filterOnlyAffordable && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                {/* Edit Financial Profile */}
                <button
                  type="button"
                  onClick={() => openWizard()}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Edit Financials</span>
                </button>

                {/* Talk to REALTOR */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenConsultation) {
                      onOpenConsultation(
                        'Affordability Review with REALTOR Amit Sawhney',
                        `Buyer range: $${(assessment!.estimatedPurchasePriceMin / 1000).toFixed(0)}K - $${(assessment!.estimatedPurchasePriceMax / 1000).toFixed(0)}K. Looking for curated matches in GTA & Durham Region.`
                      );
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#C5A880]/15 hover:bg-[#C5A880]/25 border border-[#C5A880]/40 text-[#C5A880] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Talk to REALTOR®</span>
                </button>
              </div>
            </>
          ) : isAuthenticated && isClient ? (
            /* 2. Logged-in Client State, but haven't calculated buying range yet */
            <>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                      Finance-First VIP Client Experience
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300 font-mono">
                      Confidential Advisory
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-serif font-medium text-white">
                    Welcome, {user?.fullName || 'VIP Client'}. Calculate your buying range to activate real-time property affordability indicators.
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => openWizard()}
                  className="flex-1 md:flex-initial px-6 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Calculate Your Buying Range</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* 3. Unauthenticated Visitor State: Affordability range and indicators are locked to clients */
            <>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                      Client Affordability & Buying Range
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Client-Only Access
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-serif font-medium text-stone-200">
                    Affordability range and suitability indicators are shown exclusively to logged in clients after calculating their buying range.
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => openAuthModal({
                    role: 'CLIENT',
                    tab: 'login',
                    customTitle: 'Client Account Required',
                    customMessage: 'Sign in or register your VIP client account to calculate your confidential buying range and unlock live affordability indicators across all properties.'
                  })}
                  className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In as Client</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWizard()}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-stone-200 border border-white/15 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <DollarSign className="w-4 h-4 text-[#C5A880]" />
                  <span>Calculate Buying Range</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
