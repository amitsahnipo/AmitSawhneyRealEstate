import React from 'react';
import { Phone, Sparkles, ArrowUpRight } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface StatementBannerProps {
  onOpenVIPModal?: () => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
}

export const StatementBanner: React.FC<StatementBannerProps> = ({
  onOpenVIPModal,
  onOpenConsultation,
  onOpenValuation
}) => {
  return (
    <section id="hp-statement" className="relative w-full py-20 sm:py-24 bg-[#141817] text-white overflow-hidden border-t border-b border-white/10">
      {/* Subtle architectural background glow and grain */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#5B6964]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
        
        {/* Editorial Subtitle Accent */}
        <div className="inline-flex items-center gap-3">
          <span className="w-8 h-[1px] bg-[#C5A880]" />
          <span className="text-[#C5A880] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
            STATEMENT OF EXCELLENCE
          </span>
          <span className="w-8 h-[1px] bg-[#C5A880]" />
        </div>

        {/* Grand Editorial Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light font-serif text-white tracking-tight leading-[1.12]">
          Ready To Find Your <span className="font-serif italic font-normal text-[#F3E8DB]">Dream Home</span> Or Unlock Platinum Pre-Construction?
        </h2>

        <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-light max-w-2xl mx-auto leading-relaxed font-sans">
          Whether acquiring a luxury pre-construction allocation with builder incentives or marketing your residence with bespoke representation, experience white-glove advisory from start to finish.
        </p>

        {/* Action Buttons: Signature Sharlene Chang "+" Design */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              if (onOpenConsultation) {
                onOpenConsultation('General Advisory', 'Client requested strategy session from statement banner');
              }
            }}
            className="px-8 py-4 bg-[#C5A880] hover:bg-[#B89758] text-[#111111] text-xs uppercase font-bold tracking-[0.2em] transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2 cursor-pointer rounded-none"
          >
            <span>Let's Get Started</span>
            <span className="text-lg font-light leading-none">+</span>
          </button>

          {onOpenVIPModal && (
            <button
              onClick={onOpenVIPModal}
              className="px-8 py-4 bg-transparent hover:bg-white/10 text-white text-xs uppercase font-bold tracking-[0.2em] border border-white/40 hover:border-white transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer rounded-none"
            >
              <span>VIP Platinum Worksheet</span>
              <span className="text-lg font-light leading-none">+</span>
            </button>
          )}

          <a
            href={`tel:${AMIT_SAWHNEY.phone}`}
            className="px-6 py-4 text-stone-300 hover:text-white text-xs uppercase font-semibold tracking-[0.18em] transition-colors flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Direct: {AMIT_SAWHNEY.phoneFormatted}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
