import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  DollarSign,
  Building2,
  ArrowRight
} from 'lucide-react';
import { FilterState } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { useAffordability } from '../context/AffordabilityContext';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  filters?: FilterState;
  setFilters?: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenVIPModal?: () => void;
  onOpenAIModal?: () => void;
  onOpenValuation?: () => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  totalProjectsCount?: number;
  totalResaleCount?: number;
  onSearchClick?: () => void;
  onOpenSellerPage?: () => void;
  onOpenPreconPage?: () => void;
  onOpenListingsPage?: () => void;
}

interface SlideItem {
  id: number;
  image: string;
  tagline: string;
  titleItalic: string;
  titleRegular: string;
  subtitle: string;
  badge: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    image: '/src/assets/images/lifestyle_view_1788293425171.jpg',
    tagline: 'EXCLUSIVE PRE-CONSTRUCTION & BESPOKE RESIDENCES',
    titleRegular: 'Turning',
    titleItalic: 'Dreams',
    subtitle: 'Curating Ontario’s most prestigious pre-construction developments, VIP builder allocations, and move-in ready residences across the Greater Toronto Area & Durham Region.',
    badge: 'Platinum VIP Realtor'
  },
  {
    id: 2,
    image: '/src/assets/images/precon_building_render_1785855631147.jpg',
    tagline: 'TIER-1 BUILDER ALLOCATIONS & FIRST ACCESS',
    titleRegular: 'Platinum',
    titleItalic: 'First Access',
    subtitle: 'Secure prime unit selections, launch-tier pricing, capped development levies, and extended deposit structures months before public sales open.',
    badge: 'Developer Allocations'
  },
  {
    id: 3,
    image: '/src/assets/images/blueprint_realty_hero_1785855611011.jpg',
    tagline: 'ARCHITECTURAL DISTINCTION ACROSS DURHAM & GTA',
    titleRegular: 'Elevating',
    titleItalic: 'Modern Living',
    subtitle: 'From waterfront condominiums to executive ravine estates in Whitby, Brooklin, Oshawa, Pickering, Markham, and Toronto.',
    badge: 'Durham & GTA Specialist'
  },
  {
    id: 4,
    image: '/src/assets/images/brooklin_trails_1785877631233.jpg',
    tagline: 'MASTER-PLANNED COMMUNITIES & FAMILY LIVING',
    titleRegular: 'Community',
    titleItalic: 'Excellence',
    subtitle: 'Handpicked master-planned enclaves nestled among protected greenbelts, top-tier school districts, and rapid GO Transit commuter corridors.',
    badge: 'Master-Planned Living'
  },
  {
    id: 5,
    image: '/src/assets/images/stonemanor_woods_1785877658948.jpg',
    tagline: 'FIDUCIARY INTEGRITY & WHITE-GLOVE ADVISORY',
    titleRegular: 'Uncompromising',
    titleItalic: 'Client Care',
    subtitle: 'Independent client representation backed by full fiduciary protection under Ontario’s TRESA regulations—at $0 buyer representation fee.',
    badge: 'Fiduciary Representation'
  }
];

export const Hero: React.FC<HeroProps> = ({
  onOpenVIPModal = () => {},
  onOpenConsultation = (_topic?: string, _notes?: string) => {}
}) => {
  const { openWizard, isQualified, assessment } = useAffordability();
  const { isAuthenticated, isClient, openAuthModal } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Automatic slideshow rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <section id="hp-slideshow" className="relative w-full text-white bg-[#111111] overflow-hidden">
      {/* Background Architectural Slideshow Images */}
      <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={`${slide.titleRegular} ${slide.titleItalic}`}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-center transform transition-transform duration-10000 ease-out ${
                index === currentSlideIndex ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Cinematic Luxury Dark Scrim Overlay for Immaculate Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/40" />
          </div>
        ))}

        {/* Hero Slideshow Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-12 pt-8">
          
          {/* Top Editorial Monogram / Category Indicator */}
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block w-8 h-[1px] bg-[#C5A880]" />
            <span className="text-[#C5A880] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              {currentSlide.tagline}
            </span>
          </div>

          {/* Grand Sharlene Chang-Style Editorial Headline */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-white font-serif tracking-tight leading-[1.08]">
              {currentSlide.titleRegular}{' '}
              <span className="font-serif italic font-normal text-[#F3E8DB] underline decoration-[#C5A880]/60 decoration-1 underline-offset-8">
                {currentSlide.titleItalic}
              </span>{' '}
              Into Reality
            </h1>

            <p className="text-stone-200 text-sm sm:text-base lg:text-lg leading-relaxed font-light max-w-2xl text-shadow-sm font-sans">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Action CTAs: Finance-First Journey (Find Out What You Can Afford) */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Primary Action */}
            <button
              onClick={() => {
                if (!isAuthenticated || !isClient) {
                  openAuthModal({
                    role: 'CLIENT',
                    tab: 'login',
                    customTitle: 'Client Account Required',
                    customMessage: 'Sign in or register your VIP client account to calculate your confidential buying range and unlock live affordability indicators.'
                  });
                } else {
                  openWizard();
                }
              }}
              className="px-7 py-4 bg-[#C5A880] hover:bg-[#B89758] text-[#111111] text-xs uppercase font-extrabold tracking-[0.18em] rounded-none border border-[#C5A880] transition-all transform hover:-translate-y-0.5 shadow-2xl flex items-center gap-2.5 cursor-pointer group"
            >
              <DollarSign className="w-4 h-4 text-black" />
              <span>
                {isAuthenticated && isClient && isQualified
                  ? 'Review Your Buying Range'
                  : isAuthenticated && isClient
                  ? 'Calculate Your Buying Range'
                  : 'Find Out What You Can Afford'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Secondary Action */}
            <button
              onClick={() => {
                const el = document.getElementById('projects') || document.getElementById('resale-homes');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-xs uppercase font-bold tracking-[0.18em] rounded-none border border-white/40 hover:border-white transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-stone-300" />
              <span>Browse Properties</span>
            </button>

            <button
              onClick={onOpenVIPModal}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs uppercase font-bold tracking-[0.18em] rounded-none border border-white/20 hover:border-white/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>VIP Access Worksheet</span>
              <span className="text-base font-light">+</span>
            </button>

            <button
              onClick={() => onOpenConsultation('Fiduciary Advisory', 'Requested consultation from hero')}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A880] hover:text-white transition-colors ml-2 cursor-pointer"
            >
              <span>Private Advisory</span>
              <span className="text-base font-light">+</span>
            </button>
          </div>

          {/* Qualified Range Badge - Only shown to logged in clients after they calculate their buying range */}
          {isAuthenticated && isClient && isQualified && assessment && (
            <div className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Estimated Range: ${(assessment.estimatedPurchasePriceMin / 1000).toFixed(0)}K – ${(assessment.estimatedPurchasePriceMax / 1000).toFixed(0)}K (${assessment.estimatedDownPayment.toLocaleString()} down)
              </span>
            </div>
          )}

          {/* Bottom Slideshow Navigation Controls (01 02 03 04 05) */}
          <div className="absolute bottom-8 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 flex items-center justify-between border-t border-white/20 pt-4 z-20">
            {/* Numbered Indicators */}
            <div className="flex items-center gap-4 sm:gap-6">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`group flex items-center gap-2 text-xs tracking-widest font-mono transition-all cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'text-[#C5A880] font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>0{idx + 1}</span>
                  <span
                    className={`h-[1.5px] transition-all duration-500 ${
                      idx === currentSlideIndex
                        ? 'w-6 sm:w-10 bg-[#C5A880]'
                        : 'w-0 bg-transparent group-hover:w-3 group-hover:bg-white/50'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Prev / Next Controls & Scroll Indicator */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => {
                  const el = document.getElementById('hp-assurance') || document.getElementById('hp-welcome');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <span>Scroll Down</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#C5A880] animate-bounce" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentSlideIndex(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1))
                  }
                  aria-label="Previous Slide"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlideIndex(prev => (prev + 1) % SLIDES.length)}
                  aria-label="Next Slide"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded-none transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Luxury Architectural Assurance Pillars */}
      <div id="hp-assurance" className="relative z-30 bg-[#FAF9F6] text-stone-900 border-b border-stone-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-stone-200 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">01 / ADVOCACY</span>
              <p className="text-xs font-bold text-stone-900">$0 Buyer Representation</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">Full fiduciary advisory funded entirely by developer or seller</p>
            </div>

            <div className="p-4 bg-white border border-stone-200 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">02 / ALLOCATIONS</span>
              <p className="text-xs font-bold text-stone-900">Platinum VIP Launch Access</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">Priority tier-1 builder pricing, capped fees & prime floor plans</p>
            </div>

            <div className="p-4 bg-white border border-stone-200 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">03 / STATUTORY SAFETY</span>
              <p className="text-xs font-bold text-stone-900">10-Day Cooling-Off Period</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">Full statutory review window under the Ontario Condominium Act</p>
            </div>

            <div className="p-4 bg-white border border-stone-200 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">04 / PROTECTION</span>
              <p className="text-xs font-bold text-stone-900">Tarion 7-Year Warranty</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">Ontario’s legislated deposit protection and structural warranty</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
