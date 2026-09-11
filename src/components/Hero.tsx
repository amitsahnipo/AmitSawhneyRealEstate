import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Building,
  ShieldCheck,
  Sparkles,
  Phone,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Building2,
  Key,
  Home,
  TrendingUp,
  DollarSign,
  SlidersHorizontal,
  Award,
  CheckCircle2
} from 'lucide-react';
import { FilterState } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';

interface HeroProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
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
  filters,
  setFilters,
  onOpenVIPModal = () => {},
  onOpenAIModal = () => {},
  onOpenValuation = () => {},
  onOpenConsultation = (_topic?: string, _notes?: string) => {},
  totalProjectsCount = 10,
  totalResaleCount = 8,
  onSearchClick,
  onOpenSellerPage,
  onOpenPreconPage,
  onOpenListingsPage
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'preconstruction' | 'resale' | 'sell' | 'invest'>(
    filters.category || 'all'
  );
  const [selectedBeds, setSelectedBeds] = useState<string>('Any');
  const [selectedBaths, setSelectedBaths] = useState<string>('Any');

  // Automatic slideshow rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tab: 'all' | 'preconstruction' | 'resale' | 'sell' | 'invest') => {
    setActiveTab(tab);
    setFilters(prev => ({
      ...prev,
      category: tab
    }));
    if (tab === 'sell') {
      if (onOpenSellerPage) {
        onOpenSellerPage();
      } else {
        onOpenValuation();
      }
    }
  };

  const handleSearchAction = () => {
    if (onSearchClick) {
      onSearchClick();
      return;
    }
    if (activeTab === 'resale') {
      if (onOpenListingsPage) {
        onOpenListingsPage();
      } else {
        const el = document.getElementById('resale-homes');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (activeTab === 'preconstruction') {
      if (onOpenPreconPage) {
        onOpenPreconPage();
      } else {
        const el = document.getElementById('projects');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleBedSelect = (beds: string) => {
    setSelectedBeds(beds);
    // If numeric, set filters accordingly or incorporate into query
    if (beds !== 'Any') {
      setFilters(prev => ({
        ...prev,
        searchQuery: prev.searchQuery.replace(/\b\d+\s*bed\w*/gi, '').trim() + (beds !== 'Any' ? ` ${beds} Bed` : '')
      }));
    }
  };

  const handleBathSelect = (baths: string) => {
    setSelectedBaths(baths);
    if (baths !== 'Any') {
      setFilters(prev => ({
        ...prev,
        searchQuery: prev.searchQuery.replace(/\b\d+\s*bath\w*/gi, '').trim() + (baths !== 'Any' ? ` ${baths} Bath` : '')
      }));
    }
  };

  const cities = [
    'All',
    'Whitby',
    'Brooklin',
    'Courtice',
    'Oshawa',
    'Pickering',
    'Ajax',
    'Newcastle',
    'Bowmanville',
    'Markham',
    'Toronto',
    'Mississauga',
    'Niagara Falls'
  ];

  const propertyTypes = [
    'All',
    'Detached Home',
    'Townhome',
    'Semi-Detached',
    'High-Rise Condo',
    'Mid-Rise Condo',
    'Luxury Estate'
  ];

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

          {/* Action CTAs: Signature Sharlene Chang "+" Button Style */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111111] text-xs uppercase font-bold tracking-[0.18em] rounded-none border border-[#C5A880] transition-all transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Properties</span>
              <span className="text-base font-light">+</span>
            </button>

            <button
              onClick={onOpenVIPModal}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-xs uppercase font-bold tracking-[0.18em] rounded-none border border-white/40 hover:border-white transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
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
                  const el = document.getElementById('hp-qs');
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

      {/* hp-qs: ARCHITECTURAL QUICK SEARCH CONSOLE (Modeled directly after Sharlene Chang's hp-qs) */}
      <div id="hp-qs" className="relative z-30 bg-[#FAF9F6] text-stone-900 border-b border-stone-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Quick Search Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#5B6964] font-semibold mb-1">
                <span className="w-4 h-[1px] bg-[#5B6964]" />
                <span>Quick Search</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light font-serif text-[#111111] tracking-tight">
                Start Your <span className="font-serif italic font-normal">Search</span>
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border border-stone-300 p-1 bg-white rounded-none">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                All Collections ({totalProjectsCount + totalResaleCount})
              </button>
              <button
                onClick={() => handleTabChange('preconstruction')}
                className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-all ${
                  activeTab === 'preconstruction'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Pre-Construction ({totalProjectsCount})
              </button>
              <button
                onClick={() => handleTabChange('resale')}
                className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-all ${
                  activeTab === 'resale'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Resale Homes ({totalResaleCount})
              </button>
              <button
                onClick={() => handleTabChange('sell')}
                className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-all ${
                  activeTab === 'sell'
                    ? 'bg-[#5B6964] text-white shadow-xs'
                    : 'text-[#5B6964] hover:bg-[#5B6964]/10'
                }`}
              >
                Sell (1% Listing Fee)
              </button>
            </div>
          </div>

          {/* Search Controls Form Container */}
          <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* Keyword / Neighborhood / Address */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">
                  Keywords / Address / Community
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Whitby, Brooklin, Ravine, High-Rise..."
                    value={filters.searchQuery}
                    onChange={e => handleInputChange('searchQuery', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50/70 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all rounded-none"
                  />
                </div>
              </div>

              {/* City / Region */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">
                  Location / Region
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={filters.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-stone-50/70 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all appearance-none cursor-pointer rounded-none"
                  >
                    <option value="All">All GTA & Durham Region</option>
                    {cities.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">
                  Property Type
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={filters.propertyType}
                    onChange={e => handleInputChange('propertyType', e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-stone-50/70 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all appearance-none cursor-pointer rounded-none"
                  >
                    <option value="All">All Property Types</option>
                    {propertyTypes.filter(pt => pt !== 'All').map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button (Signature Sharlene Chang "+" Button) */}
              <div className="lg:col-span-2 flex items-end">
                <button
                  onClick={handleSearchAction}
                  className="w-full py-3 bg-[#111111] hover:bg-[#252525] text-white text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none shadow-sm"
                >
                  <span>Search</span>
                  <span className="text-base text-[#C5A880] font-light">+</span>
                </button>
              </div>

            </div>

            {/* Architectural Filter Pills: Bedrooms & Bathrooms (Directly from Sharlene Chang hp-qs) */}
            <div className="mt-6 pt-5 border-t border-stone-200 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Bedrooms Pills */}
              <div className="md:col-span-5 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mr-1">
                  Bedrooms:
                </span>
                {['Any', '1+', '2+', '3+', '4+', '5+'].map(b => (
                  <button
                    key={b}
                    onClick={() => handleBedSelect(b)}
                    className={`px-3 py-1 text-xs tracking-wider transition-all border rounded-none cursor-pointer ${
                      selectedBeds === b
                        ? 'bg-[#C5A880] border-[#C5A880] text-stone-950 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Bathrooms Pills */}
              <div className="md:col-span-4 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mr-1">
                  Bathrooms:
                </span>
                {['Any', '1+', '2+', '3+', '4+', '5+'].map(b => (
                  <button
                    key={b}
                    onClick={() => handleBathSelect(b)}
                    className={`px-3 py-1 text-xs tracking-wider transition-all border rounded-none cursor-pointer ${
                      selectedBaths === b
                        ? 'bg-[#C5A880] border-[#C5A880] text-stone-950 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Advanced / AI Advisor Links */}
              <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-3 text-xs">
                <button
                  onClick={onOpenAIModal}
                  className="inline-flex items-center gap-1.5 text-xs text-[#5B6964] hover:text-[#44504C] font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>AI Advisor</span>
                  <span className="text-sm font-light">+</span>
                </button>
              </div>

            </div>

          </div>

          {/* 4 Luxury Architectural Assurance Pillars */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
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
