import React, { useEffect } from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  Plus, 
  Check, 
  DollarSign, 
  Bed, 
  Layers, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';
import { Project } from '../types';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjects: Project[];
  allProjects: Project[];
  onRemoveProject: (projectId: string) => void;
  onAddProject: (project: Project) => void;
  onClearAll: () => void;
  onOpenProjectDetail: (project: Project) => void;
  onOpenVIPModal: (projectId: string) => void;
  onOpenClientView: (project: Project) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedProjects,
  allProjects,
  onRemoveProject,
  onAddProject,
  onClearAll,
  onOpenProjectDetail,
  onOpenVIPModal,
  onOpenClientView
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const availableToAdd = allProjects.filter(
    p => !selectedProjects.some(sp => sp.id === p.id)
  );

  // Helper to extract beds & sqft summary
  const getBedsSummary = (project: Project) => {
    if (project.floorPlans && project.floorPlans.length > 0) {
      const types = Array.from(new Set(project.floorPlans.map(f => f.type)));
      const sqfts = project.floorPlans.map(f => f.sqft).filter(Boolean);
      const minSqft = sqfts.length > 0 ? Math.min(...sqfts) : null;
      const maxSqft = sqfts.length > 0 ? Math.max(...sqfts) : null;
      const baths = project.floorPlans.map(f => f.bathrooms).filter(Boolean);
      const minBath = baths.length > 0 ? Math.min(...baths) : null;
      const maxBath = baths.length > 0 ? Math.max(...baths) : null;

      return {
        types,
        sqftRange: minSqft && maxSqft ? `${minSqft.toLocaleString()} - ${maxSqft.toLocaleString()} sq.ft` : null,
        bathRange: minBath && maxBath ? (minBath === maxBath ? `${minBath} Baths` : `${minBath} - ${maxBath} Baths`) : null,
        count: project.floorPlans.length
      };
    }
    return {
      types: project.propertyTypes,
      sqftRange: null,
      bathRange: null,
      count: 0
    };
  };

  // Helper to calculate total deposit percentage
  const getDepositSummary = (project: Project) => {
    const totalPercent = project.depositStructure.reduce((acc, m) => acc + (m.percentage || 0), 0);
    return {
      totalPercent: totalPercent > 0 ? `${totalPercent}% Total Deposit` : 'Extended Builder Deposit',
      milestones: project.depositStructure
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="property-comparison-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
    >
      <div 
        className="relative w-full max-w-7xl max-h-[94vh] bg-[#FAF8F5] rounded-2xl shadow-2xl flex flex-col border border-stone-200 overflow-hidden text-stone-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0F2942] text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="comparison-modal-title" className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
                  Compare Pre-Construction Developments
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5A880] text-[#111827]">
                  {selectedProjects.length} of 3 Selected
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Side-by-side breakdown of price, bedrooms, deposit structure, and occupancy dates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {selectedProjects.length > 0 && (
              <>
                <button
                  type="button"
                  id="comparison-print-btn"
                  onClick={handlePrint}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                  title="Print comparison sheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  id="comparison-clear-btn"
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/50 rounded-lg transition-colors border border-red-800/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </>
            )}

            <button
              type="button"
              id="comparison-close-btn"
              onClick={onClose}
              className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close comparison view"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {selectedProjects.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">No Properties Selected</h3>
              <p className="text-sm text-stone-600 mt-2 mb-6">
                Select up to 3 pre-construction projects from the catalog or pick from the list below to compare specifications side-by-side.
              </p>
              {allProjects.length > 0 && (
                <div className="space-y-2 text-left">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Quick Add a Project:</p>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                    {allProjects.slice(0, 4).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onAddProject(p)}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-[#0F2942] hover:bg-stone-50 transition-colors text-left group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#0F2942] truncate">{p.name}</p>
                          <p className="text-[11px] text-stone-500">{p.location.city} • {p.priceRange.display}</p>
                        </div>
                        <span className="shrink-0 p-1.5 rounded-lg bg-[#0F2942] text-white text-xs font-semibold flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="min-w-[700px] lg:min-w-full space-y-6">
              {/* Quick Selector if less than 3 projects */}
              {selectedProjects.length < 3 && availableToAdd.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8C6D43] shrink-0" />
                    <span>
                      You have <strong>{selectedProjects.length} of 3</strong> developments selected. You can add {3 - selectedProjects.length} more.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="quick-add-select" className="font-semibold text-stone-700 hidden sm:inline">Add Project:</label>
                    <select
                      id="quick-add-select"
                      onChange={(e) => {
                        const project = allProjects.find(p => p.id === e.target.value);
                        if (project) {
                          onAddProject(project);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 font-medium focus:outline-none focus:border-[#0F2942] cursor-pointer shadow-sm"
                    >
                      <option value="" disabled>Select a development to add...</option>
                      {availableToAdd.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.location.city} - {p.priceRange.display})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Comparison Table / Grid */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-200">
                
                {/* 1. HERO CARDS ROW */}
                <div className="grid grid-cols-12 bg-stone-50/60 divide-x divide-stone-200">
                  <div className="col-span-3 p-4 flex flex-col justify-end">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400">Specification</span>
                    <h3 className="text-base font-bold text-stone-900 font-serif mt-0.5">Development Overview</h3>
                  </div>

                  {/* Project Columns */}
                  {selectedProjects.map((project, idx) => (
                    <div 
                      key={project.id} 
                      className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4 flex flex-col justify-between relative group`}
                    >
                      <button
                        type="button"
                        onClick={() => onRemoveProject(project.id)}
                        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-stone-500 border border-stone-300 shadow-sm flex items-center justify-center transition-colors"
                        title="Remove from comparison"
                        aria-label={`Remove ${project.name} from comparison`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        {/* Image Thumbnail */}
                        <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-stone-100 border border-stone-200">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F2942]/90 text-white">
                            {project.status}
                          </div>
                        </div>

                        {/* Title & Builder */}
                        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                          {project.builder}
                        </p>
                        <h4 className="text-sm sm:text-base font-bold text-[#111827] font-serif line-clamp-1 hover:text-[#0F2942] cursor-pointer"
                          onClick={() => onOpenProjectDetail(project)}
                        >
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                          <span className="truncate">{project.location.city}, {project.location.region}</span>
                        </div>
                      </div>

                      {/* Quick action buttons in header */}
                      <div className="mt-3 pt-3 border-t border-stone-200 flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenVIPModal(project.id)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Get VIP Package</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenProjectDetail(project)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Full Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty Slot for adding 3rd project if room */}
                  {selectedProjects.length < 3 && (
                    <div className={`${selectedProjects.length === 1 ? 'col-span-0 hidden' : 'col-span-2'} p-4 bg-stone-50/40 border-dashed border-2 border-stone-200 rounded-xl m-2 flex flex-col items-center justify-center text-center`}>
                      <Plus className="w-6 h-6 text-stone-400 mb-1" />
                      <p className="text-xs font-semibold text-stone-600">Add 3rd Project</p>
                      <p className="text-[10px] text-stone-400">Up to 3 properties</p>
                    </div>
                  )}
                </div>

                {/* 2. PRICE SPECIFICATION ROW */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 hover:bg-stone-50/70 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Starting Price</h4>
                      <p className="text-[11px] text-stone-500">VIP Pricing tier & range</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                    >
                      <p className="text-lg sm:text-xl font-extrabold text-[#0F2942] font-serif">
                        {project.priceRange.display}
                      </p>
                      <div className="mt-1 space-y-0.5 text-xs text-stone-600">
                        <p>Range: ${project.priceRange.min.toLocaleString()} – ${project.priceRange.max.toLocaleString()}</p>
                        {project.totalUnits > 0 && (
                          <span className="inline-block px-2 py-0.5 bg-stone-100 rounded text-[11px] font-medium text-stone-600">
                            {project.totalUnits} Total Units
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2B. "BUY SMART, SAVE BIG" ESTIMATED CASHBACK ROW */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 bg-amber-50/50 hover:bg-amber-50/80 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">Potential Buyer Cashback</h4>
                      <p className="text-[11px] text-amber-800">Buy Smart, Save Big™ Rebate</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => {
                    const cb = calculateCashback(project.priceRange.min, 'Pre-Construction');
                    return (
                      <div 
                        key={project.id} 
                        className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                      >
                        <p className="text-base sm:text-lg font-extrabold text-amber-900 font-mono">
                          Up to {formatCurrency(cb.estimatedCashback)}*
                        </p>
                        <div className="mt-1 space-y-0.5 text-xs text-amber-950">
                          <p className="font-semibold text-emerald-800">Total Value: ~{formatCurrency(cb.totalBuyerBenefit)}*</p>
                          <p className="text-[10px] text-stone-500">Includes {formatCurrency(cb.estimatedBuilderIncentives)} builder credits</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. BEDS & FLOOR PLANS ROW */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 hover:bg-stone-50/70 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                      <Bed className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Bedrooms & Layouts</h4>
                      <p className="text-[11px] text-stone-500">Configurations & square footage</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => {
                    const bedsInfo = getBedsSummary(project);
                    return (
                      <div 
                        key={project.id} 
                        className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                      >
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {bedsInfo.types.map((type, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#0F2942]/10 text-[#0F2942] font-semibold text-xs border border-[#0F2942]/20">
                              {type}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-1 text-xs text-stone-600">
                          {bedsInfo.sqftRange && (
                            <p className="font-medium text-stone-800">
                              Size: <span className="font-bold">{bedsInfo.sqftRange}</span>
                            </p>
                          )}
                          {bedsInfo.bathRange && (
                            <p className="text-stone-500">{bedsInfo.bathRange}</p>
                          )}
                          {bedsInfo.count > 0 && (
                            <p className="text-[11px] text-stone-500">
                              {bedsInfo.count} standard floor plans available
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. DEPOSIT STRUCTURE ROW */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 hover:bg-stone-50/70 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Deposit Structure</h4>
                      <p className="text-[11px] text-stone-500">Payment milestones & schedule</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => {
                    const depositInfo = getDepositSummary(project);
                    return (
                      <div 
                        key={project.id} 
                        className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                      >
                        <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-300 mb-2">
                          {depositInfo.totalPercent}
                        </div>

                        <ul className="space-y-1.5 text-xs text-stone-700">
                          {depositInfo.milestones.slice(0, 4).map((m, mIdx) => (
                            <li key={mIdx} className="flex items-start justify-between gap-1 text-[11px]">
                              <span className="text-stone-500 font-medium">• {m.timing || m.stage}:</span>
                              <span className="font-bold text-stone-900 shrink-0">
                                {m.percentage > 0 ? `${m.percentage}%` : m.estimatedAmount || m.stage}
                              </span>
                            </li>
                          ))}
                          {depositInfo.milestones.length > 4 && (
                            <li className="text-[10px] text-stone-400 font-medium italic">
                              + {depositInfo.milestones.length - 4} extended milestone installments
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* 5. OCCUPANCY DATE ROW */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 hover:bg-stone-50/70 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Target Occupancy</h4>
                      <p className="text-[11px] text-stone-500">Estimated completion date</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                    >
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F2942] text-white text-xs font-bold shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{project.occupancyYear}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1.5">
                        Tentative builder target date
                      </p>
                    </div>
                  ))}
                </div>

                {/* 6. PROPERTY TYPES & BUILDING DETAILS */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 hover:bg-stone-50/70 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-700 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Property Types</h4>
                      <p className="text-[11px] text-stone-500">Home styles & storeys</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                    >
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {project.propertyTypes.map((pt, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
                            {pt}
                          </span>
                        ))}
                      </div>
                      {project.storeys && (
                        <p className="text-xs text-stone-600 font-medium">
                          Building Height: <strong>{project.storeys} Storeys</strong>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* 7. VIP INCENTIVES & HIGHLIGHTS */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 hover:bg-stone-50/70 transition-colors">
                  <div className="col-span-3 p-4 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8C6D43] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">VIP Incentives</h4>
                      <p className="text-[11px] text-stone-500">Exclusive Platinum perks</p>
                    </div>
                  </div>

                  {selectedProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4`}
                    >
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {project.vipIncentives.slice(0, 3).map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* 8. ACTIONS FOOTER ROW */}
                <div className="grid grid-cols-12 divide-x divide-stone-200 bg-stone-50/80">
                  <div className="col-span-3 p-4 flex items-center">
                    <p className="text-xs font-bold text-stone-500 uppercase">Representation & Next Steps</p>
                  </div>

                  {selectedProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`${selectedProjects.length === 1 ? 'col-span-9' : selectedProjects.length === 2 ? 'col-span-4' : 'col-span-3'} p-4 space-y-2`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenVIPModal(project.id);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reserve VIP Package</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenClientView(project);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#0F2942] hover:bg-[#163857] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Open Client View</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 border-t border-stone-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F2942]" />
            <span>Represented by <strong>Amit Sawhney</strong>, Licensed Ontario REALTOR® • RECO Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-stone-200 text-stone-800 font-semibold rounded-lg border border-stone-300 transition-colors shadow-sm"
            >
              Back to Developments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
