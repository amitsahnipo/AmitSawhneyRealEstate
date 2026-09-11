import React, { useState } from 'react';
import { LayoutGrid, Map, SlidersHorizontal, ArrowUpDown, RefreshCw, Building2, Scale } from 'lucide-react';
import { Project, FilterState } from '../types';
import { ProjectCard } from './ProjectCard';
import { ProjectMap } from './ProjectMap';

interface ProjectGridProps {
  projects: Project[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProject: (p: Project) => void;
  onOpenVIPModal: (projectId?: string) => void;
  onOpenClientView: (p: Project) => void;
  compareProjects?: Project[];
  onToggleCompare?: (project: Project) => void;
  onOpenCompareModal?: () => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Pre-Construction'; projectId: string }) => void;
  isTeaser?: boolean;
  onViewAllPrecon?: () => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  filters,
  setFilters,
  onSelectProject,
  onOpenVIPModal,
  onOpenClientView,
  compareProjects = [],
  onToggleCompare,
  onOpenCompareModal,
  onOpenCashbackEligibility,
  isTeaser = false,
  onViewAllPrecon
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'occupancy'>('featured');

  // Filter logic
  const filteredProjects = projects.filter(p => {
    // Search query
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBuilder = p.builder.toLowerCase().includes(q);
      const matchCity = p.location.city.toLowerCase().includes(q);
      const matchAddress = p.location.address.toLowerCase().includes(q);
      if (!matchName && !matchBuilder && !matchCity && !matchAddress) return false;
    }

    // City filter
    if (filters.city !== 'All' && p.location.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    // Property Type filter
    if (filters.propertyType !== 'All' && !p.propertyTypes.includes(filters.propertyType as any)) {
      return false;
    }

    // Status filter
    if (filters.status !== 'All' && p.status !== filters.status) {
      return false;
    }

    // Max Price
    if (filters.maxPrice > 0 && p.priceRange.min > filters.maxPrice) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceRange.min - b.priceRange.min;
    if (sortBy === 'price-desc') return b.priceRange.min - a.priceRange.min;
    if (sortBy === 'occupancy') return a.occupancyYear.localeCompare(b.occupancyYear);
    // default featured
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      city: 'All',
      propertyType: 'All',
      status: 'All',
      maxPrice: 0,
      occupancyYear: 'All'
    });
  };

  return (
    <section id="projects" className="py-20 bg-[#FAF9F6] border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header & View Toggles */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-[1px] bg-[#5B6964]" />
              <span className="text-[#5B6964] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase font-sans">
                02 — FEATURED DEVELOPMENTS
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#111111] font-serif tracking-tight">
              Pre-Construction <span className="font-serif italic font-normal">Showcase</span>
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm font-light mt-1 font-sans">
              Exclusive VIP builder launches & curated allocations across Greater Toronto, Durham Region & Southern Ontario
            </p>
          </div>

          {/* View Toggles & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode */}
            <div className="bg-white p-1 rounded-xl border border-stone-300 flex items-center gap-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Interactive Map</span>
              </button>
            </div>

            {/* Compare Button */}
            {onOpenCompareModal && (
              <button
                type="button"
                id="toolbar-compare-btn"
                onClick={onOpenCompareModal}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
                  compareProjects.length > 0
                    ? 'bg-[#0F2942] text-white border-[#0F2942]'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
                }`}
                title="Compare up to 3 projects side-by-side"
              >
                <Scale className={`w-4 h-4 ${compareProjects.length > 0 ? 'text-[#C5A880]' : 'text-stone-500'}`} />
                <span>Compare</span>
                {compareProjects.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#C5A880] text-[#111827]">
                    {compareProjects.length}/3
                  </span>
                )}
              </button>
            )}

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-[#0F2942] cursor-pointer appearance-none shadow-sm"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="occupancy">Occupancy Date</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {(filters.city !== 'All' || filters.propertyType !== 'All' || filters.status !== 'All' || filters.searchQuery !== '') && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Active Filters:</span>
            {filters.city !== 'All' && (
              <span className="bg-[#0F2942]/10 text-[#0F2942] border border-[#0F2942]/20 px-2.5 py-1 rounded-lg font-medium">
                City: {filters.city}
              </span>
            )}
            {filters.propertyType !== 'All' && (
              <span className="bg-stone-200 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-lg font-medium">
                Type: {filters.propertyType}
              </span>
            )}
            {filters.status !== 'All' && (
              <span className="bg-[#C5A880]/20 text-[#8C6D43] border border-[#C5A880]/40 px-2.5 py-1 rounded-lg font-medium">
                Status: {filters.status}
              </span>
            )}
            {filters.searchQuery && (
              <span className="bg-white text-stone-800 border border-stone-300 px-2.5 py-1 rounded-lg font-medium">
                "{filters.searchQuery}"
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-[#0F2942] hover:underline font-semibold flex items-center gap-1 ml-2"
            >
              <RefreshCw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}

        {/* Render Grid vs Map */}
        <div className="mt-8">
          {viewMode === 'grid' ? (
            sortedProjects.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(isTeaser ? sortedProjects.slice(0, 3) : sortedProjects).map(project => (
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

                {isTeaser && (
                  <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {onViewAllPrecon && (
                      <button
                        onClick={onViewAllPrecon}
                        className="w-full sm:w-auto px-8 py-4 bg-[#111111] hover:bg-[#252525] text-white text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>View All Pre-Construction Developments ({projects.length})</span>
                        <span className="text-base text-[#C5A880] font-light">+</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenVIPModal()}
                      className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Request Platinum VIP Worksheet</span>
                      <span className="text-base font-light">+</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center bg-white border border-stone-200 rounded-none max-w-lg mx-auto shadow-sm">
                <Building2 className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold font-serif text-stone-900">No Matching Pre-Con Builds Found</h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-4">
                  Try adjusting your search criteria or reset filters to browse all available developments in Ontario.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#111111] text-white font-bold rounded-none text-xs uppercase shadow-xs cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )
          ) : (
            <div id="map">
              <ProjectMap
                projects={sortedProjects}
                onSelectProject={onSelectProject}
                onOpenVIPModal={onOpenVIPModal}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
