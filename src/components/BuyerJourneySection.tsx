import React, { useState } from 'react';
import { Sparkles, Building2, Key, Home, TrendingUp, DollarSign, CheckCircle2, ArrowRight, ShieldCheck, Compass, HelpCircle } from 'lucide-react';
import { BUYER_JOURNEYS, JourneyPathway } from '../data/buyerJourney';

interface BuyerJourneySectionProps {
  onSelectPathway?: (pathway: JourneyPathway) => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
  onOpenSellerPage?: () => void;
}

export const BuyerJourneySection: React.FC<BuyerJourneySectionProps> = ({
  onSelectPathway,
  onOpenConsultation = (_topic?: string, _notes?: string) => {},
  onOpenValuation = () => {},
  onOpenSellerPage
}) => {
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>(BUYER_JOURNEYS[0].id);

  const activePathway = BUYER_JOURNEYS.find(p => p.id === selectedPathwayId) || BUYER_JOURNEYS[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Key': return <Key className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  const handleAction = () => {
    if ((activePathway.id === 'selling-home' || activePathway.actionType === 'valuation') && onOpenSellerPage) {
      onOpenSellerPage();
    } else if (activePathway.actionType === 'valuation') {
      onOpenValuation();
    } else if (onSelectPathway) {
      onSelectPathway(activePathway);
    } else {
      // Default action: scroll to appropriate section
      if (activePathway.filterCategory === 'resale') {
        const el = document.getElementById('resale-homes');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const el = document.getElementById('projects');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="buyer-journey" className="py-24 bg-[#FDFBF7] border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#0F2942]" />
            <span>Tailored Guidance for Every Goal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] font-serif tracking-tight">
            How Can We Help You Today?
          </h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            Select your current scenario to unlock customized insights, relevant listings, and strategic Ontario real estate advice.
          </p>
        </div>

        {/* 6 Interactive Pathway Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {BUYER_JOURNEYS.map(pathway => {
            const isSelected = pathway.id === selectedPathwayId;
            return (
              <button
                key={pathway.id}
                onClick={() => setSelectedPathwayId(pathway.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#111827] text-white border-[#111827] shadow-lg scale-[1.02]'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl w-fit ${
                  isSelected ? 'bg-[#C5A880] text-[#111827]' : 'bg-stone-100 text-stone-700 shadow-sm'
                }`}>
                  {getIcon(pathway.iconName)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-serif leading-snug">
                    {pathway.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Pathway Detailed Showcase Card (Sophisticated Deep Navy) */}
        <div className="bg-[#0F2942] text-white rounded-3xl p-6 sm:p-10 border border-[#1E3A8A]/50 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {activePathway.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white tracking-tight">
                  {activePathway.title}
                </h3>
                <p className="text-[#C5A880] text-sm font-medium">
                  {activePathway.subtitle}
                </p>
              </div>

              <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
                {activePathway.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleAction}
                  className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>{activePathway.recommendedAction}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenConsultation(`${activePathway.title} Consultation`, `Inquiring about ${activePathway.subtitle}`)}
                  className="px-5 py-3.5 bg-[#163857] hover:bg-[#1C476E] text-stone-100 font-semibold text-xs sm:text-sm rounded-xl border border-[#2B5E8A]/50 transition-all"
                >
                  Book 1-on-1 Strategy Call
                </button>
              </div>
            </div>

            {/* Right Pillars Checklist */}
            <div className="lg:col-span-5 bg-[#0B1E32] border border-[#1E3A8A]/60 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Strategic Advantages & Protections
              </h4>
              
              <div className="space-y-3">
                {activePathway.keyBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#1E3A8A]/50 flex items-center justify-between text-xs text-stone-300">
                <span>Recommended Types:</span>
                <span className="text-white font-semibold">{activePathway.recommendedPropertyTypes.join(', ')}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
