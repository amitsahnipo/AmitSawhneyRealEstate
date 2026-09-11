import React, { useState } from 'react';
import {
  Building2,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  Search,
  MapPin,
  Building,
  DollarSign,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Scale,
  FileSpreadsheet,
  Phone,
  LayoutGrid,
  Map
} from 'lucide-react';
import { Project, FilterState } from '../types';
import { ProjectCard } from './ProjectCard';
import { ProjectMap } from './ProjectMap';
import { DepositCalculator } from './DepositCalculator';
import { AMIT_SAWHNEY } from '../data/agent';

interface PreconstructionPageProps {
  projects: Project[];
  onBackToHome: () => void;
  onSelectProject: (p: Project) => void;
  onOpenVIPModal: (projectId?: string) => void;
  onOpenClientView: (p: Project) => void;
  compareProjects: Project[];
  onToggleCompare: (p: Project) => void;
  onOpenCompareModal: () => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Pre-Construction'; projectId: string }) => void;
  onNavigateCashback?: () => void;
  onOpenConsultation: (topic?: string, notes?: string) => void;
  onOpenValuation: () => void;
}

export const PreconstructionPage: React.FC<PreconstructionPageProps> = ({
  projects,
  onBackToHome,
  onSelectProject,
  onOpenVIPModal,
  onOpenClientView,
  compareProjects,
  onToggleCompare,
  onOpenCompareModal,
  onOpenCashbackEligibility,
  onNavigateCashback,
  onOpenConsultation,
  onOpenValuation
}) => {
  // Filter state for pre-construction page
  const [filters, setFilters] = useState<FilterState>({
    category: 'preconstruction',
    searchQuery: '',
    city: 'All',
    propertyType: 'All',
    status: 'All',
    minBeds: 0,
    maxPrice: 0,
    occupancyYear: 'All',
    sortBy: 'featured'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'occupancy'>('featured');

  // Interactive ROIC Calculator State
  const [purchasePrice, setPurchasePrice] = useState<number>(750000);
  const [appreciationRate, setAppreciationRate] = useState<number>(4.5);
  const [constructionYears, setConstructionYears] = useState<number>(3);
  const [depositPercent, setDepositPercent] = useState<number>(15);

  const totalDeposit = purchasePrice * (depositPercent / 100);
  const projectedFutureValue = Math.round(purchasePrice * Math.pow(1 + appreciationRate / 100, constructionYears));
  const estimatedCapitalGain = projectedFutureValue - purchasePrice;
  const returnOnInvestedCapital = totalDeposit > 0 ? Math.round((estimatedCapitalGain / totalDeposit) * 100) : 0;

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBuilder = p.builder.toLowerCase().includes(q);
      const matchCity = p.location.city.toLowerCase().includes(q);
      const matchAddress = p.location.address.toLowerCase().includes(q);
      if (!matchName && !matchBuilder && !matchCity && !matchAddress) return false;
    }

    if (filters.city !== 'All' && p.location.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.propertyType !== 'All' && !p.propertyTypes.includes(filters.propertyType as any)) {
      return false;
    }

    if (filters.status !== 'All' && p.status !== filters.status) {
      return false;
    }

    if (filters.maxPrice > 0 && p.priceRange.min > filters.maxPrice) {
      return false;
    }

    if (filters.occupancyYear !== 'All' && p.occupancyYear !== filters.occupancyYear) {
      return false;
    }

    return true;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceRange.min - b.priceRange.min;
    if (sortBy === 'price-desc') return b.priceRange.min - a.priceRange.min;
    if (sortBy === 'occupancy') return a.occupancyYear.localeCompare(b.occupancyYear);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const cities = ['All', 'Whitby', 'Brooklin', 'Courtice', 'Oshawa', 'Pickering', 'Ajax', 'Markham', 'Toronto', 'Niagara'];
  const propertyTypes = ['All', 'Townhome', 'Detached Home', 'High-Rise Condo', 'Mid-Rise Condo'];
  const statusOptions = ['All', 'Platinum VIP Launch', 'Selling Now', 'Upcoming Registration', 'Final Inventory'];

  const resetFilters = () => {
    setFilters({
      category: 'preconstruction',
      searchQuery: '',
      city: 'All',
      propertyType: 'All',
      status: 'All',
      minBeds: 0,
      maxPrice: 0,
      occupancyYear: 'All',
      sortBy: 'featured'
    });
  };

  const scrollToROIC = () => {
    const el = document.getElementById('precon-roic-calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900">
      
      {/* 1. Sharlene Chang-Inspired Editorial Pre-Construction Hero */}
      <section className="relative bg-[#111111] text-white pt-24 pb-20 sm:pb-28 overflow-hidden border-b border-stone-800">
        {/* Subtle Architectural Grid Backdrop */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Pre-construction architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-black/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb / Category Tracker */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="text-stone-400 hover:text-[#C5A880] text-xs uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Home</span>
              <span className="text-[#C5A880]">/</span>
            </button>
            <span className="w-6 h-[1px] bg-[#C5A880]" />
            <span className="text-[#C5A880] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              PLATINUM VIP ALLOCATIONS
            </span>
          </div>

          {/* Headline in Cormorant Garamond */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white font-serif tracking-tight leading-[1.12]">
              The Pre-Construction <span className="font-serif italic font-normal text-[#F3E8DB]">Collection</span>
            </h1>
            <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-2xl font-sans">
              Direct developer allocations, guaranteed capped development charges, Tarion 7-year warranty protection, and 10-day statutory cooling-off legal review across Greater Toronto, Durham Region & Southern Ontario.
            </p>
          </div>

          {/* 5 Regulatory & Financial Value Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">01 / FIDUCIARY</span>
              <p className="text-xs font-bold text-white">$0 Buyer Fee</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Funded 100% by the developer</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">02 / PROTECTION</span>
              <p className="text-xs font-bold text-white">10-Day Cooling Off</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Statutory rescission deposit guarantee</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">03 / CERTAINTY</span>
              <p className="text-xs font-bold text-white">Capped Levies</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Protects against municipal levy spikes</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">04 / CASH FLOW</span>
              <p className="text-xs font-bold text-white">Phased Deposits</p>
              <p className="text-[11px] text-stone-400 mt-0.5">10%–15% spread over 12–36 months</p>
            </div>

            <div className="p-3.5 bg-stone-900/90 border border-stone-800 text-left col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block mb-1">05 / WARRANTY</span>
              <p className="text-xs font-bold text-white">Tarion Coverage</p>
              <p className="text-[11px] text-stone-400 mt-0.5">7-Year major structural warranty</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenVIPModal()}
              className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111111] text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Request Platinum Worksheet</span>
              <span className="text-base font-light">+</span>
            </button>

            <button
              onClick={scrollToROIC}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <Calculator className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Projected ROIC Calculator</span>
              <span className="text-base font-light">↓</span>
            </button>

            <button
              onClick={() => onOpenConsultation('Pre-Construction Strategy', 'General pre-con consultation from dedicated page')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300 hover:text-[#C5A880] transition-colors ml-2 cursor-pointer"
            >
              <span>Schedule 1-on-1 Consultation</span>
              <span className="text-base font-light">+</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. Interactive Search & Filter Console */}
      <section className="bg-white border-b border-stone-200 py-6 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search project name, builder, or address..."
                value={filters.searchQuery}
                onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all rounded-none"
              />
            </div>

            {/* City Selector */}
            <div className="lg:col-span-3 relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={filters.city}
                onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all appearance-none cursor-pointer rounded-none"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Municipalities' : c}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div className="lg:col-span-3 relative">
              <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={filters.propertyType}
                onChange={e => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all appearance-none cursor-pointer rounded-none"
              >
                {propertyTypes.map(pt => (
                  <option key={pt} value={pt}>{pt === 'All' ? 'All Property Types' : pt}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-2 relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#C5A880] cursor-pointer appearance-none rounded-none"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="occupancy">Occupancy Date</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>

          {/* Secondary Controls: View Toggle, Compare, Active Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
            
            <div className="flex items-center gap-3">
              <span className="text-stone-500 font-medium">
                Showing <strong className="text-stone-900">{sortedProjects.length}</strong> of {projects.length} VIP Developments
              </span>

              {(filters.city !== 'All' || filters.propertyType !== 'All' || filters.searchQuery !== '') && (
                <button
                  onClick={resetFilters}
                  className="text-[#5B6964] hover:text-stone-900 flex items-center gap-1 font-semibold underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Compare Button */}
              {compareProjects.length > 0 && (
                <button
                  onClick={onOpenCompareModal}
                  className="px-3 py-1.5 bg-[#111111] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Compare ({compareProjects.length}/3)</span>
                </button>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center border border-stone-300 p-0.5 bg-stone-100">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'grid' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'map' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. The Full Pre-Construction Developments Showcase */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {viewMode === 'grid' ? (
          sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelectProject={onSelectProject}
                  onOpenVIPModal={onOpenVIPModal}
                  onOpenClientView={onOpenClientView}
                  isCompared={compareProjects.some(cp => cp.id === project.id)}
                  onToggleCompare={onToggleCompare}
                  onOpenCashbackEligibility={onOpenCashbackEligibility}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white border border-stone-200 p-8 max-w-md mx-auto shadow-sm">
              <Building2 className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold font-serif text-stone-900">No Matching Developments</h3>
              <p className="text-stone-500 text-xs mt-1 mb-5">
                We couldn't find any developments matching your selected filters. Reset your filters or contact Amit Sawhney for unreleased allocations.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#111111] text-white text-xs uppercase font-bold tracking-wider cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )
        ) : (
          <div className="bg-white border border-stone-200 p-2 shadow-sm">
            <ProjectMap
              projects={sortedProjects}
              onSelectProject={onSelectProject}
              onOpenVIPModal={onOpenVIPModal}
            />
          </div>
        )}
      </section>

      {/* 4. Calculate Your Projected Return on Invested Capital (ROIC) Calculator */}
      {/* Moved under the dedicated preconstruction page per user request! */}
      <section id="precon-roic-calculator" className="py-24 bg-[#111111] text-white border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-800">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#C5A880]" />
                <span className="text-[#C5A880] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
                  FINANCIAL INTELLIGENCE
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white font-serif tracking-tight">
                Calculate Your Projected <span className="font-serif italic font-normal text-[#F3E8DB]">Return on Invested Capital</span>
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm font-light max-w-2xl font-sans leading-relaxed">
                Harness deposit leverage: control 100% of an asset's appreciation with only 10%–15% cash down spread over 1 to 3 years. Appreciation compounds across the entire asset value.
              </p>
            </div>

            <button
              onClick={() => onOpenConsultation('Investment Pro Forma & ROI', `Evaluating $${purchasePrice.toLocaleString()} pre-con with ${depositPercent}% deposit`)}
              className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111111] text-xs uppercase font-bold tracking-[0.18em] transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Request Custom Pro Forma</span>
              <span className="text-base font-light">+</span>
            </button>
          </div>

          {/* Interactive Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-8 bg-stone-900/90 border border-stone-800 p-6 sm:p-8">
              
              {/* Purchase Price */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium tracking-wider uppercase text-[11px]">Purchase Price</span>
                  <span className="text-[#C5A880] font-bold font-mono text-base">${purchasePrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="400000"
                  max="1600000"
                  step="25000"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 appearance-none cursor-pointer accent-[#C5A880]"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>$400,000</span>
                  <span>$1,000,000</span>
                  <span>$1,600,000</span>
                </div>
              </div>

              {/* Deposit Percentage */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium tracking-wider uppercase text-[11px]">Deposit Over Build Period</span>
                  <span className="text-[#C5A880] font-bold font-mono text-base">{depositPercent}% (${totalDeposit.toLocaleString()})</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setDepositPercent(pct)}
                      className={`py-2 text-xs font-semibold tracking-wider transition-all border cursor-pointer ${
                        depositPercent === pct
                          ? 'bg-[#C5A880] border-[#C5A880] text-[#111111]'
                          : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-500'
                      }`}
                    >
                      {pct}% Deposit
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Appreciation Rate */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium tracking-wider uppercase text-[11px]">Est. Annual Market Appreciation</span>
                  <span className="text-emerald-400 font-bold font-mono text-base">{appreciationRate}% / year</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={appreciationRate}
                  onChange={e => setAppreciationRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>2.0% (Conservative)</span>
                  <span>4.5% (Historical GTA)</span>
                  <span>8.0% (Aggressive)</span>
                </div>
              </div>

              {/* Build Duration */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium tracking-wider uppercase text-[11px]">Construction Duration to Closing</span>
                  <span className="text-white font-bold font-mono text-base">{constructionYears} Years</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map(yrs => (
                    <button
                      key={yrs}
                      onClick={() => setConstructionYears(yrs)}
                      className={`py-2 text-xs font-semibold tracking-wider transition-all border cursor-pointer ${
                        constructionYears === yrs
                          ? 'bg-white border-white text-[#111111]'
                          : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-500'
                      }`}
                    >
                      {yrs} Years
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Output Display */}
            <div className="lg:col-span-6 bg-[#0B0F17] p-8 sm:p-10 border border-stone-800 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-900/90 p-5 border border-stone-800">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Total Cash Outlay</p>
                  <p className="text-2xl font-bold text-white font-mono mt-1">${totalDeposit.toLocaleString()}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Phased over {constructionYears * 12} months</p>
                </div>

                <div className="bg-stone-900/90 p-5 border border-stone-800">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Est. Value at Closing</p>
                  <p className="text-2xl font-bold text-[#C5A880] font-mono mt-1">${projectedFutureValue.toLocaleString()}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">At occupancy year</p>
                </div>
              </div>

              {/* Major ROIC Highlight Bar */}
              <div className="p-6 bg-gradient-to-r from-stone-900 to-stone-900/90 border border-[#C5A880]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Projected Capital Gain</p>
                  <p className="text-3xl sm:text-4xl font-light text-white font-mono mt-1">+${estimatedCapitalGain.toLocaleString()}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">Return on Invested Capital</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#E6CBA8] font-mono mt-1">+{returnOnInvestedCapital}%</p>
                </div>
              </div>

              {/* Fiduciary Insights */}
              <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs text-stone-400 font-light font-sans leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>Zero monthly mortgage payments</strong> during the construction build cycle.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>Exit flexibility:</strong> Negotiated right-to-assign before closing enables taking profits prior to mortgage registration.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>Capped levies:</strong> Protects against municipal charge increases between launch and occupancy.</span>
                </div>
              </div>

              <p className="text-[10px] text-stone-500 leading-relaxed italic pt-2">
                *Illustrative simulation assuming compound annual appreciation. Past market performance is not a guarantee of future returns. Review full Tarion agreements and project disclosure statements with Amit Sawhney and your real estate lawyer.
              </p>

            </div>

          </div>

          {/* 3 Core Investment Vectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-6 bg-stone-900/60 border border-stone-800 space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">VECTOR 01</span>
              <h4 className="text-base font-serif font-bold text-white">Deposit Leverage Dynamics</h4>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Control a $750,000+ asset with just 10%–15% down. 100% of market appreciation accrues to you on the full purchase price before mortgage financing starts.
              </p>
            </div>

            <div className="p-6 bg-stone-900/60 border border-stone-800 space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">VECTOR 02</span>
              <h4 className="text-base font-serif font-bold text-white">Transit Infrastructure Corridor</h4>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Whitby, Brooklin, Oshawa & Courtice benefit from the Hwy 407 eastward expansion and Lakeshore East GO extension, driving consistent tenant absorption.
              </p>
            </div>

            <div className="p-6 bg-stone-900/60 border border-stone-800 space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">VECTOR 03</span>
              <h4 className="text-base font-serif font-bold text-white">Contractual Fiduciary Shields</h4>
              <p className="text-xs text-stone-400 font-light leading-relaxed">
                Our Platinum VIP agreements include capped development levies and free assignment clauses to ensure maximum risk mitigation and investor exit freedom.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Deposit Milestone Scheduler & Mortgage Stress Test Tool */}
      <section className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#5B6964] font-semibold">
              <span className="w-4 h-[1px] bg-[#5B6964]" />
              <span>FINANCIAL PLANNING</span>
              <span className="w-4 h-[1px] bg-[#5B6964]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-light font-serif text-[#111111] tracking-tight">
              Deposit Milestone <span className="font-serif italic font-normal">Scheduler</span>
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm font-light">
              Understand standard builder payment schedules, stress test benchmarks, and closing expense budgeting.
            </p>
          </div>

          <DepositCalculator />
        </div>
      </section>

      {/* 6. Why Buy Pre-Construction with Amit Sawhney (The Platinum VIP Advantage) */}
      <section className="py-20 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#5B6964]" />
              <span className="text-[#5B6964] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
                THE VIP ADVANTAGE
              </span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-light text-[#111111] font-serif tracking-tight">
              Why Independent <span className="font-serif italic font-normal">Representation Matters</span>
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed font-sans">
              When you walk into a builder sales presentation gallery without an agent, the sales team represents the developer's bottom line. Partnering with licensed REALTOR® Amit Sawhney provides dedicated fiduciary protection at absolutely $0 cost to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Unrepresented Buyer */}
            <div className="p-8 bg-[#FAF9F6] border border-stone-200 space-y-4">
              <div className="flex items-center gap-3 text-stone-500">
                <span className="text-xs font-bold uppercase tracking-[0.2em]">WALK-IN UNREPRESENTED</span>
              </div>
              <h4 className="text-xl font-serif text-stone-900 font-normal">Purchasing Directly from Builder</h4>
              <ul className="space-y-3 text-xs text-stone-600 leading-relaxed font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Sales representatives have a legal duty to maximize developer revenue, not protect you.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Risk of uncapped development levies exceeding $25,000–$40,000+ upon final closing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Late-stage unit pickings after Platinum VIP brokers have reserved premier floor plans.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Strict assignment restrictions and punitive builder transfer fees.</span>
                </li>
              </ul>
            </div>

            {/* With Amit Sawhney */}
            <div className="p-8 bg-[#111111] text-white border border-stone-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-[#C5A880]">
                <span className="text-xs font-bold uppercase tracking-[0.2em]">PLATINUM VIP REPRESENTATION</span>
              </div>
              <h4 className="text-xl font-serif text-white font-normal">Represented by Amit Sawhney REALTOR®</h4>
              <ul className="space-y-3 text-xs text-stone-300 leading-relaxed font-sans">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>100% Free Representation:</strong> The developer compensates our brokerage; you pay $0.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>Capped Development Charges:</strong> Contractual caps safeguarding you from closing surprises.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>Priority Allocation Worksheets:</strong> First access to premier layouts, views, and parking spots.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span><strong>10-Day Cooling-Off Legal Review:</strong> Dedicated lawyer review of agreement and Tarion warranties.</span>
                </li>
                <li className="flex items-start gap-2.5 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span><strong className="text-emerald-300">Up to 1.0% Commission Cashback:</strong> Retain capital with our Buy Smart™ buyer rebate disbursed upon firm closing.</span>
                    {onNavigateCashback && (
                      <button
                        type="button"
                        onClick={onNavigateCashback}
                        className="text-[#C5A880] hover:text-white underline text-xs font-semibold ml-1 cursor-pointer"
                      >
                        Explore Cashback Program →
                      </button>
                    )}
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Bottom Statement & VIP Worksheet CTA */}
      <section className="py-20 bg-[#FAF9F6] border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-[#5B6964]" />
            <span className="text-[#5B6964] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
              REGISTER YOUR WORKSHEET TODAY
            </span>
            <span className="w-8 h-[1px] bg-[#5B6964]" />
          </div>

          <h3 className="text-3xl sm:text-5xl font-light text-[#111111] font-serif tracking-tight">
            Ready to Secure Your <span className="font-serif italic font-normal">Next Allocation?</span>
          </h3>

          <p className="text-stone-600 text-xs sm:text-sm font-light max-w-xl mx-auto font-sans leading-relaxed">
            Submit your unit preferences and budget. Amit Sawhney will present your worksheet directly to the builder sales directors for first-tier pricing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenVIPModal()}
              className="px-8 py-4 bg-[#111111] hover:bg-[#252525] text-white text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Submit VIP Worksheet</span>
              <span className="text-base text-[#C5A880] font-light">+</span>
            </button>

            <button
              onClick={() => onOpenConsultation('VIP Pre-Con Allocation Call', 'Requested allocation call from bottom pre-con page')}
              className="px-8 py-4 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Book Strategy Call</span>
              <span className="text-base font-light">+</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
