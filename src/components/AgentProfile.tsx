import React, { useState } from 'react';
import { Phone, Mail, ShieldCheck, CheckCircle2, Calendar, Sparkles, Plus, Minus, ArrowUpRight } from 'lucide-react';
import { AMIT_SAWHNEY, AGENT_FAQS } from '../data/agent';

interface AgentProfileProps {
  onOpenConsultationModal: () => void;
  onOpenVIPModal: () => void;
}

export const AgentProfile: React.FC<AgentProfileProps> = ({
  onOpenConsultationModal,
  onOpenVIPModal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section id="hp-welcome" className="py-24 bg-[#FAF9F6] border-t border-b border-stone-200 text-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Main Editorial Welcome Grid (Directly inspired by Sharlene Chang's hp-welcome) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Framed Editorial Portrait with Subtle Architectural Layering */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[380px]">
              
              {/* Subtle Offset Architectural Frame */}
              <div className="absolute -top-4 -left-4 w-full h-full border border-[#C5A880]/70 pointer-events-none hidden sm:block" />
              
              {/* Main Portrait Card */}
              <div className="relative z-10 bg-white border border-stone-200 overflow-hidden shadow-xl aspect-[4/5]">
                <img
                  src={AMIT_SAWHNEY.photo}
                  alt={AMIT_SAWHNEY.name}
                  className="w-full h-full object-cover object-top filter contrast-[1.02] brightness-[0.98]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle bottom vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                
                {/* Floating Portrait Badge */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C5A880] block mb-1">
                    LICENSED ONTARIO REALTOR®
                  </span>
                  <p className="text-xl font-serif tracking-tight font-light text-white">
                    {AMIT_SAWHNEY.name}
                  </p>
                  <p className="text-xs text-stone-300 font-sans mt-0.5">
                    Blueprint Realty Brokerage
                  </p>
                </div>
              </div>

              {/* RECO Registration Seal */}
              <div className="mt-4 p-3 bg-white border border-stone-200 flex items-center justify-between text-xs text-stone-600 shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5B6964]" />
                  <span className="font-medium text-[11px] uppercase tracking-wider">{AMIT_SAWHNEY.license}</span>
                </div>
                <span className="font-mono text-[10px] text-stone-400">{AMIT_SAWHNEY.recoRegistrationNumber}</span>
              </div>

            </div>
          </div>

          {/* Right Column: High-Fashion Narrative & Credentials */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Section Index Marker */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#5B6964]" />
              <span className="text-[#5B6964] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
                01 — ABOUT AMIT SAWHNEY
              </span>
            </div>

            {/* Editorial Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-5xl font-light font-serif text-[#111111] tracking-tight leading-[1.15]">
              A Passion For Fiduciary Care & <span className="font-serif italic font-normal text-[#1F2937]">Architectural Distinction</span>
            </h2>

            {/* Narrative Paragraphs */}
            <div className="space-y-4 text-stone-600 text-sm sm:text-base font-light leading-relaxed font-sans">
              <p>
                With over a decade of dedicated client advocacy across the Greater Toronto Area and Durham Region, Amit Sawhney offers a bespoke, white-glove approach to residential real estate and master-planned pre-construction acquisitions.
              </p>
              <p>
                As a recognized Platinum VIP partner with Ontario’s premier builders, Amit secures priority launch-tier pricing, coveted floor plan allocations, and capped development levies—ensuring every client acquires property with genuine structural and financial advantages.
              </p>
            </div>

            {/* Key Accomplishment Metrics in Serif */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-stone-200">
              <div className="space-y-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-light text-[#111111] block">
                  $180M+
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold font-sans">
                  Volume Negotiated
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-light text-[#111111] block">
                  350+
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold font-sans">
                  Families & Investors
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-light text-[#111111] block">
                  12+
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold font-sans">
                  Years In Ontario
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-light text-[#C5A880] block">
                  100%
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold font-sans">
                  Fiduciary Advocacy
                </span>
              </div>
            </div>

            {/* Signature Quote Callout */}
            <blockquote className="border-l-2 border-[#C5A880] pl-5 py-1 text-sm sm:text-base italic font-serif text-stone-700 font-normal leading-relaxed">
              "Guiding families and investors through the Ontario property landscape is a privilege that demands unyielding integrity, deep analytical market intelligence, and relentless fiduciary advocacy."
            </blockquote>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenConsultationModal}
                className="px-6 py-3.5 bg-[#111111] hover:bg-[#252525] text-white text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer rounded-none shadow-sm"
              >
                <span>Schedule Private Session</span>
                <span className="text-base text-[#C5A880] font-light">+</span>
              </button>

              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="px-6 py-3.5 border border-stone-300 hover:border-stone-900 text-stone-900 text-xs uppercase font-bold tracking-[0.18em] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#5B6964]" />
                <span>Call {AMIT_SAWHNEY.phoneFormatted}</span>
              </a>
            </div>

          </div>

        </div>

        {/* Editorial FAQ Accordion Section */}
        <div className="pt-12 border-t border-stone-200">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-2">
            <span className="text-[#5B6964] text-[11px] font-semibold tracking-[0.22em] uppercase font-sans">
              TRANSPARENCY & FREQUENT INQUIRIES
            </span>
            <h3 className="text-2xl sm:text-4xl font-light font-serif text-[#111111] tracking-tight">
              Frequently Asked <span className="font-serif italic font-normal">Questions</span>
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm font-light">
              Clear answers regarding pre-construction representation, buyer fees, cooling-off periods, and resale services.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {AGENT_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-stone-200 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-serif font-normal text-stone-900">
                      {faq.question}
                    </span>
                    <span className="text-stone-400 hover:text-stone-900 transition-colors shrink-0">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-[#C5A880]" />
                      ) : (
                        <Plus className="w-4 h-4 text-stone-500" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-stone-100 text-xs sm:text-sm text-stone-600 font-light leading-relaxed font-sans">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
