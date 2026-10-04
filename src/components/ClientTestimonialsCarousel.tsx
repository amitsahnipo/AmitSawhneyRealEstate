import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Pause, 
  Play, 
  ArrowUpRight,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { 
  MOCK_TESTIMONIALS, 
  TRUST_STATS, 
  ClientTestimonial 
} from '../data/testimonials';

interface ClientTestimonialsCarouselProps {
  onOpenConsultationModal?: (topic?: string, notes?: string) => void;
  onOpenVIPModal?: () => void;
  onOpenValuation?: () => void;
}

type FilterCategory = 'all' | 'seller' | 'buyer' | 'precon' | 'investor';

export const ClientTestimonialsCarousel: React.FC<ClientTestimonialsCarouselProps> = ({
  onOpenConsultationModal = (_topic?: string, _notes?: string) => {},
  onOpenVIPModal = () => {},
  onOpenValuation = () => {}
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Filter testimonials based on active tab
  const filteredTestimonials: ClientTestimonial[] = React.useMemo(() => {
    if (selectedCategory === 'all') return MOCK_TESTIMONIALS;
    return MOCK_TESTIMONIALS.filter(t => t.clientType === selectedCategory);
  }, [selectedCategory]);

  // Reset index when filter category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const totalSlides = filteredTestimonials.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-rotation timer: 7 seconds per slide, pauses on hover or when user explicitly pauses
  useEffect(() => {
    if (!isPlaying || isHovered || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, totalSlides, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  const activeTestimonial = filteredTestimonials[currentIndex] || filteredTestimonials[0];

  const categoryFilters: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All Verified Stories' },
    { id: 'seller', label: 'Home Sellers (1% Model)' },
    { id: 'precon', label: 'VIP Pre-Con Investors' },
    { id: 'buyer', label: 'Buyers & Relocations' },
    { id: 'investor', label: 'Portfolio Investors' }
  ];

  return (
    <section 
      id="client-testimonials-section" 
      className="py-24 bg-white border-b border-stone-200 text-stone-900 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div id="testimonials" className="sr-only" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {/* Section Header: Luxury Architectural Editorial */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#C5A880]" />
            <span className="text-[#8C6D43] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              PROVEN TRACK RECORD & FIDUCIARY ADVOCACY
            </span>
            <span className="w-8 h-[1px] bg-[#C5A880]" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-light text-[#111111] font-serif tracking-tight">
            Client Stories & <span className="font-serif italic font-normal">Successful Outcomes</span>
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto font-sans">
            Real experiences from Ontario homeowners, buyers, and investors who trusted Amit Sawhney for strategic representation, measurable savings, and seamless closings.
          </p>
        </div>

        {/* Trust Benchmark Statistics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-[#FAF9F6] border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          {TRUST_STATS.map((stat, idx) => (
            <div key={idx} className="text-center sm:text-left space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6D43] block">
                {stat.label}
              </span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#0F2942]">
                {stat.value}
              </div>
              <p className="text-xs text-stone-500 font-sans">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#FAF9F6] border border-stone-200 rounded-xl max-w-full">
            {categoryFilters.map(cat => (
              <button
                key={cat.id}
                id={`filter-testimonials-${cat.id}`}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F2942] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Showcase Stage */}
        <div 
          className="relative max-w-5xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle architectural backdrop border */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#C5A880]/15 via-transparent to-[#0F2942]/10 blur-lg -z-10 pointer-events-none" />

          {/* Testimonial Active Slide with Smooth Animation */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md relative min-h-[460px] flex flex-col justify-between overflow-hidden">
            
            {/* Elegant Background Watermark Quote */}
            <div className="absolute right-6 top-6 text-stone-100 -z-0 pointer-events-none select-none">
              <Quote className="w-28 h-28 opacity-40 text-stone-200" />
            </div>

            <AnimatePresence mode="wait">
              {activeTestimonial && (
                <motion.div
                  key={activeTestimonial.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="relative z-10 space-y-8 flex-1 flex flex-col justify-between"
                >
                  {/* Top Bar: Verification, Rating, and Category */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-5">
                    <div className="flex items-center gap-3">
                      {/* Monogram Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-[#0F2942] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs shrink-0">
                        {activeTestimonial.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-stone-900">
                            {activeTestimonial.clientName}
                          </h4>
                          {activeTestimonial.verifiedTransaction && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                              title="Verified Registered Transaction via Ontario Real Estate Association & RECO"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified Transaction
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span>{activeTestimonial.location}</span>
                          <span>•</span>
                          <span className="font-medium text-[#8C6D43]">{activeTestimonial.clientTypeLabel}</span>
                        </p>
                      </div>
                    </div>

                    {/* Star Rating & Year */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(activeTestimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#C5A880] text-[#C5A880]" />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-stone-400">
                        {activeTestimonial.year}
                      </span>
                    </div>
                  </div>

                  {/* Core Testimonial Body */}
                  <div className="space-y-4">
                    {/* Outcome Headline */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#0F2942] font-semibold leading-snug">
                      "{activeTestimonial.headline}"
                    </h3>

                    {/* Detailed Review Quote */}
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                      {activeTestimonial.quote}
                    </p>
                  </div>

                  {/* Bottom Successful Outcome Callout Card */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FAF9F6] p-4 sm:p-5 rounded-2xl border border-stone-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8C6D43] flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Verified Financial / Tactical Impact
                        </span>
                        <div className="font-mono text-base sm:text-lg font-bold text-[#0F2942]">
                          {activeTestimonial.outcomeMetric.value}
                          <span className="text-xs font-sans font-normal text-stone-600 ml-2">
                            ({activeTestimonial.outcomeMetric.label})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-stone-600 flex items-center gap-1.5 self-end sm:self-center">
                      <CheckCircle2 className="w-4 h-4 text-[#8C6D43]" />
                      <span>{activeTestimonial.secondaryOutcome}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carousel Navigation Toolbar */}
            <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 relative z-10">
              
              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {filteredTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    id={`testimonial-dot-${idx}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Jump to testimonial ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? 'w-8 bg-[#0F2942]' 
                        : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
                <span className="text-xs font-mono text-stone-400 ml-2">
                  {currentIndex + 1} / {totalSlides}
                </span>
              </div>

              {/* Controls: Prev, Next, Play/Pause */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="testimonial-pause-toggle-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
                  aria-label={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  type="button"
                  id="testimonial-prev-btn"
                  onClick={prevSlide}
                  className="w-11 h-11 rounded-full border border-stone-200 bg-white text-stone-800 hover:bg-[#0F2942] hover:text-white hover:border-[#0F2942] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  id="testimonial-next-btn"
                  onClick={nextSlide}
                  className="w-11 h-11 rounded-full border border-stone-200 bg-white text-stone-800 hover:bg-[#0F2942] hover:text-white hover:border-[#0F2942] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Fiduciary Call-to-Action Card */}
        <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#0F2942]">
              Ready to create your own real estate success story?
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              Connect directly with Amit Sawhney for unbiased fiduciary market counsel, 1% full-service listing representation, or exclusive pre-construction VIP allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="testimonial-cta-consultation-btn"
              onClick={() => onOpenConsultationModal('Client Consultation & Strategy', 'Inquiring after reviewing client testimonials')}
              className="px-5 py-2.5 bg-[#0F2942] hover:bg-[#1a3d5e] text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Schedule Strategy Call</span>
              <ArrowUpRight className="w-4 h-4 text-[#C5A880]" />
            </button>
            <button
              type="button"
              id="testimonial-cta-valuation-btn"
              onClick={onOpenValuation}
              className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
            >
              Free Home Valuation
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
