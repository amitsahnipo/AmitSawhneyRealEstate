import React from 'react';
import { Search, Key, DollarSign, Coffee, ArrowUpRight } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface TakeNextStepSectionProps {
  onOpenVIPModal?: () => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
  onNavigateHomeSearch?: () => void;
  onNavigatePrecon?: () => void;
}

export const TakeNextStepSection: React.FC<TakeNextStepSectionProps> = ({
  onOpenVIPModal,
  onOpenConsultation,
  onOpenValuation,
  onNavigateHomeSearch,
  onNavigatePrecon
}) => {
  const steps = [
    {
      id: 'step-search',
      number: '01',
      title: 'Start Your Home Search',
      subtitle: 'Browse all active MLS® listings, luxury estates, and master-planned releases across Durham Region & the GTA.',
      buttonText: 'Search Properties',
      action: () => {
        if (onNavigateHomeSearch) {
          onNavigateHomeSearch();
        } else {
          const el = document.getElementById('projects');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      },
      icon: Search,
      badge: 'Live MLS® Feed'
    },
    {
      id: 'step-vip',
      number: '02',
      title: 'Pre-Construction VIP Access',
      subtitle: 'Explore developer allocations, capped development levies, and our projected ROIC calculator before public launch.',
      buttonText: 'Pre-Con Portfolio',
      action: () => {
        if (onNavigatePrecon) {
          onNavigatePrecon();
        } else if (onOpenVIPModal) {
          onOpenVIPModal();
        }
      },
      icon: Key,
      badge: 'Platinum Allocations'
    },
    {
      id: 'step-valuation',
      number: '03',
      title: 'Get Your Home Valuation',
      subtitle: 'Receive a comprehensive comparative market assessment (CMA) paired with our 1% full-service listing fee model.',
      buttonText: 'Valuation Report',
      action: () => {
        if (onOpenValuation) onOpenValuation();
      },
      icon: DollarSign,
      badge: 'Save $15,000+'
    },
    {
      id: 'step-coffee',
      number: '04',
      title: "Let's Get Coffee",
      subtitle: 'Schedule a private 1-on-1 real estate strategy session with Amit Sawhney to align your family or investment goals.',
      buttonText: 'Schedule Meeting',
      action: () => {
        if (onOpenConsultation) {
          onOpenConsultation("Let's Get Coffee / Strategy Session", 'Client scheduled meeting from Take The Next Step');
        }
      },
      icon: Coffee,
      badge: 'Private Advisory'
    }
  ];

  return (
    <section id="hp-nstep" className="py-24 bg-[#FAF9F6] text-stone-900 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Sharlene Chang-style sequence marker */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#5B6964]" />
            <span className="text-[#5B6964] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              TAKE THE NEXT STEP
            </span>
            <span className="w-8 h-[1px] bg-[#5B6964]" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-light text-[#111111] font-serif tracking-tight">
            How May We <span className="font-serif italic font-normal">Assist You?</span>
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto font-sans">
            Whether taking your first step into homeownership or expanding an investment portfolio, select your preferred pathway below.
          </p>
        </div>

        {/* 4 Architectural Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="group bg-white border border-stone-200 p-8 flex flex-col justify-between hover:border-[#C5A880] transition-all duration-300 relative shadow-xs hover:shadow-lg rounded-none text-left"
              >
                {/* Top Number & Icon */}
                <div>
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100">
                    <span className="font-serif text-3xl font-light text-[#C5A880] group-hover:text-[#B89758] transition-colors">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 bg-stone-100 text-stone-700">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-light font-serif text-[#111111] group-hover:text-[#0F2942] transition-colors mb-3 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-stone-500 font-light leading-relaxed font-sans">
                    {step.subtitle}
                  </p>
                </div>

                {/* Bottom Signature "+" Action Button */}
                <div className="pt-8 mt-6 border-t border-stone-100">
                  <button
                    onClick={step.action}
                    className="w-full py-3 px-4 bg-stone-100 hover:bg-[#111111] text-stone-900 hover:text-white text-xs uppercase font-bold tracking-[0.18em] transition-all flex items-center justify-between cursor-pointer rounded-none"
                  >
                    <span>{step.buttonText}</span>
                    <span className="text-base font-light text-[#C5A880]">+</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
