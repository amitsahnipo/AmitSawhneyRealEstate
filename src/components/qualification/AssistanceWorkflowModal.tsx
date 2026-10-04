import React from 'react';
import {
  X,
  AlertTriangle,
  ArrowRight,
  Phone,
  UserCheck,
  Edit3,
  Search,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { AMIT_SAWHNEY } from '../../data/agent';

interface AssistanceModalProps {
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onNavigateToProperties?: () => void;
}

export const AssistanceWorkflowModal: React.FC<AssistanceModalProps> = ({
  onOpenConsultation,
  onNavigateToProperties
}) => {
  const {
    assistanceModalOpen,
    closeAssistanceModal,
    assistanceProperty,
    assessment,
    openWizard,
    openShowingModal,
    setFilterOnlyAffordable
  } = useAffordability();

  if (!assistanceModalOpen || !assistanceProperty) return null;

  const propertyPrice = assistanceProperty.price;
  const buyerUpperRange = assessment?.estimatedPurchasePriceMax || 0;
  const priceDifference = Math.max(0, propertyPrice - buyerUpperRange);
  const percentAbove = buyerUpperRange > 0 ? Math.round(((propertyPrice - buyerUpperRange) / buyerUpperRange) * 100) : 0;

  const handleSpeakWithMortgagePro = () => {
    closeAssistanceModal();
    if (onOpenConsultation) {
      onOpenConsultation(
        'Mortgage Financing Assistance & Higher Qualification Review',
        `Buyer is interested in ${assistanceProperty.title} ($${propertyPrice.toLocaleString()}). Current estimated upper range is $${buyerUpperRange.toLocaleString()}. Exploring co-signers, higher down payment, or alternative qualification lenders.`
      );
    }
  };

  const handleTalkToRealtor = () => {
    closeAssistanceModal();
    if (onOpenConsultation) {
      onOpenConsultation(
        'REALTOR® Guidance on Price Strategy & Comparable Value',
        `Discussing property ${assistanceProperty.title} ($${propertyPrice.toLocaleString()}) with REALTOR® Amit Sawhney to review recent comparable sales and negotiation room.`
      );
    }
  };

  const handleUpdateFinancials = () => {
    closeAssistanceModal();
    openWizard();
  };

  const handleBrowseWithinRange = () => {
    setFilterOnlyAffordable(true);
    closeAssistanceModal();
    if (onNavigateToProperties) {
      onNavigateToProperties();
    } else {
      const el = document.getElementById('projects') || document.getElementById('resale-homes');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestAssistanceShowing = () => {
    closeAssistanceModal();
    openShowingModal(assistanceProperty, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-amber-500/30 rounded-2xl shadow-2xl text-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Financing Guidance • 20% Rule Alert
              </span>
              <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                This Property Is Above Your Current Estimated Range
              </h3>
            </div>
          </div>
          <button
            onClick={closeAssistanceModal}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Property Context Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#C5A880]">Target Property</span>
                <h4 className="text-base font-bold text-white">{assistanceProperty.title}</h4>
                <p className="text-xs text-stone-400">{assistanceProperty.address}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono uppercase text-stone-400">Listing Price</span>
                <div className="text-xl font-mono font-bold text-amber-300">
                  ${propertyPrice.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-white/10 gap-2">
              <div>
                <span className="text-stone-400">Your Current Estimated Upper Range: </span>
                <span className="font-mono font-bold text-white">
                  ${buyerUpperRange.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-stone-400">Difference: </span>
                <span className="font-mono font-bold text-amber-400">
                  +${priceDifference.toLocaleString()} ({percentAbove}% above)
                </span>
              </div>
            </div>
          </div>

          {/* User-Facing Narrative (Mandated text from prompt) */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs sm:text-sm text-amber-100/90 leading-relaxed flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              This property is listed at approximately <strong>${propertyPrice.toLocaleString()}</strong>, while your current estimated purchase range is up to approximately <strong>${buyerUpperRange.toLocaleString()}</strong>. There may be financing or qualification considerations to review before scheduling a showing.
            </p>
          </div>

          {/* 4 Action Options */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-mono tracking-widest text-stone-400 block">
              Recommended Next Steps:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Speak With Mortgage Pro */}
              <button
                type="button"
                onClick={handleSpeakWithMortgagePro}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C5A880]">
                    <Sparkles className="w-4 h-4" />
                    <span>Mortgage Specialist</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-semibold text-white">Speak With a Mortgage Professional</div>
                <p className="text-xs text-stone-400 mt-1 leading-snug">
                  Explore co-signers, alternative lending tiers, or down payment strategies to stretch qualification.
                </p>
              </button>

              {/* Option 2: Talk to REALTOR */}
              <button
                type="button"
                onClick={handleTalkToRealtor}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C5A880]">
                    <UserCheck className="w-4 h-4" />
                    <span>REALTOR® Counsel</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-semibold text-white">Talk to My REALTOR® (Amit Sawhney)</div>
                <p className="text-xs text-stone-400 mt-1 leading-snug">
                  Review recent sale comps to see if the property is negotiable closer to your comfortable target.
                </p>
              </button>

              {/* Option 3: Update Financials */}
              <button
                type="button"
                onClick={handleUpdateFinancials}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                    <Edit3 className="w-4 h-4 text-stone-400" />
                    <span>Financial Profile</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-semibold text-white">Update My Financial Information</div>
                <p className="text-xs text-stone-400 mt-1 leading-snug">
                  Adjust joint income, additional down payment funds, or reduced monthly liabilities.
                </p>
              </button>

              {/* Option 4: Browse within range */}
              <button
                type="button"
                onClick={handleBrowseWithinRange}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Search className="w-4 h-4" />
                    <span>Filtered Search</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-semibold text-white">Browse Properties Within My Range</div>
                <p className="text-xs text-stone-400 mt-1 leading-snug">
                  Filter immediately to view active homes and VIP projects up to ${buyerUpperRange.toLocaleString()}.
                </p>
              </button>

            </div>
          </div>

          {/* Secondary Option: Request Showing Anyway with Assistance Flag */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-stone-400">
              Still wish to view this property? We will coordinate with licensed agent Amit Sawhney to review financing details beforehand.
            </p>
            <button
              type="button"
              onClick={handleRequestAssistanceShowing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Request Showing With Assistance</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
