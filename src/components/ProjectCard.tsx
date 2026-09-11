import React from 'react';
import { MapPin, Building, Calendar, DollarSign, Sparkles, ChevronRight, CheckCircle, ShieldCheck, Lock, Scale, Check, Gift, Calculator, ArrowRight } from 'lucide-react';
import { Project } from '../types';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface ProjectCardProps {
  project: Project;
  onSelectProject: (p: Project) => void;
  onOpenVIPModal: (projectId: string) => void;
  onOpenClientView: (p: Project) => void;
  isCompared?: boolean;
  onToggleCompare?: (project: Project) => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Pre-Construction'; projectId: string }) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelectProject,
  onOpenVIPModal,
  onOpenClientView,
  isCompared = false,
  onToggleCompare,
  onOpenCashbackEligibility
}) => {
  const cardCashback = calculateCashback(project.priceRange.min, 'Pre-Construction');

  const handleCalculateSavings = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenCashbackEligibility) {
      onOpenCashbackEligibility({
        purchasePrice: project.priceRange.min,
        targetProject: project.name,
        transactionType: 'Pre-Construction',
        projectId: project.id
      });
    } else {
      const el = document.getElementById('cashback');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onSelectProject(project);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Platinum VIP Launch':
        return 'bg-[#C5A880] text-[#111827] font-bold shadow-sm';
      case 'Selling Now':
        return 'bg-[#0F2942] text-white font-semibold shadow-sm';
      case 'Upcoming Registration':
        return 'bg-stone-800 text-white font-medium shadow-sm';
      default:
        return 'bg-stone-600 text-white font-medium shadow-sm';
    }
  };

  return (
    <div className={`group bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 text-stone-900 ${
      isCompared ? 'ring-2 ring-[#0F2942] border-[#0F2942]' : 'border-stone-200'
    }`}>
      {/* Thumbnail & Badges */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs tracking-wider uppercase ${getStatusBadgeClass(project.status)}`}>
            {project.status === 'Platinum VIP Launch' && <Sparkles className="w-3 h-3 inline mr-1 fill-[#111827]" />}
            {project.status}
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F2942]/90 text-white border border-white/20 flex items-center gap-1 shadow-md">
            <ShieldCheck className="w-3 h-3 text-[#C5A880]" />
            <span>Verified Portal</span>
          </span>

          {isCompared && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F2942] text-white border border-[#C5A880] flex items-center gap-1 shadow-md">
              <Check className="w-3 h-3 text-[#C5A880]" />
              <span>Comparing</span>
            </span>
          )}
        </div>

        {/* Builder Badge Top Right */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-800 shadow-md">
          Builder: <strong className="text-stone-950">{project.builder}</strong>
        </div>

        {/* Price Tag Overlay at Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-300 font-semibold">Starting Price</p>
            <p className="text-xl font-extrabold text-white font-serif drop-shadow-sm">
              {project.priceRange.display}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-[#0F2942]/90 text-[#E0E7FF] border border-[#1E3A8A]/60 px-2.5 py-0.5 rounded text-[11px] font-medium shadow-sm">
              Occ: {project.occupancyYear}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="truncate">{project.location.address}, {project.location.city} ({project.location.region})</span>
          </div>

          {/* Project Title */}
          <h3
            onClick={() => onSelectProject(project)}
            className="text-lg font-bold text-[#111827] group-hover:text-[#0F2942] transition-colors cursor-pointer font-serif line-clamp-1"
          >
            {project.name}
          </h3>

          {/* Property Types & Key Highlights */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {project.propertyTypes.map((pt, i) => (
              <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] rounded font-medium border border-stone-200">
                {pt}
              </span>
            ))}
            {project.storeys && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] rounded font-medium border border-stone-200">
                {project.storeys} Storeys
              </span>
            )}
          </div>

          {/* Snippet Highlights */}
          <ul className="mt-3 space-y-1.5 text-xs text-stone-600">
            {project.highlights.slice(0, 2).map((hl, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#0F2942] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{hl}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buyer Savings & Incentives Breakdown: Builder Incentives vs. Our Cashback Offer */}
        {cardCashback.isEligiblePrice && (
          <div className="bg-stone-50/90 border border-amber-200/90 rounded-2xl p-3 space-y-2.5 shadow-2xs">
            {/* Distinct Source 1: Builder Incentives (Direct from Developer) */}
            <div className="flex items-start justify-between gap-2 text-xs">
              <div className="flex items-start gap-1.5 min-w-0">
                <Gift className="w-3.5 h-3.5 text-[#0F2942] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-stone-900">Builder Incentives</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                      Developer Concessions
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 truncate mt-0.5">
                    {project.depositStructure[0]?.stage || 'Extended Deposit Structure'} • Capped Levies
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-stone-800 font-mono">
                  ~{formatCurrency(cardCashback.estimatedBuilderIncentives)}
                </span>
                <p className="text-[9px] text-stone-500">Builder Value</p>
              </div>
            </div>

            {/* Distinct Source 2: Our Cashback Offer (Realtor Rebate on Closing) */}
            <div className="flex items-start justify-between gap-2 text-xs pt-2 border-t border-dashed border-amber-200">
              <div className="flex items-start gap-1.5 min-w-0">
                <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-amber-950">Potential Cashback</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      Our Cashback Offer
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 truncate mt-0.5">
                    Direct commission rebate to buyer on closing
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-amber-900 font-mono">
                  Up to {formatCurrency(cardCashback.estimatedCashback)}*
                </span>
                <p className="text-[9px] text-amber-700 font-medium">Rebate Payout</p>
              </div>
            </div>

            {/* 'Calculate Savings' Call-to-Action Button */}
            <button
              type="button"
              onClick={handleCalculateSavings}
              className="w-full mt-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title={`Calculate total savings for ${project.name}`}
            >
              <Calculator className="w-3.5 h-3.5 text-stone-950" />
              <span>Calculate Savings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Deposit Structure Preview & Actions */}
        <div className="pt-3 border-t border-stone-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs flex items-center justify-between flex-1 min-w-0">
              <span className="text-stone-500 shrink-0">VIP Deposit:</span>
              <span className="font-semibold text-stone-800 truncate ml-1">
                {project.depositStructure[0]?.stage || 'Extended Deposit Structure'}
              </span>
            </div>
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(project)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 border ${
                  isCompared
                    ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Compare specifications (up to 3)'}
                aria-label={`Compare ${project.name}`}
              >
                <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-[#C5A880]' : 'text-stone-500'}`} />
                <span>{isCompared ? 'Compared' : 'Compare'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenClientView(project)}
            className="w-full py-2 px-3 bg-[#0F2942] hover:bg-[#163857] text-white font-semibold text-xs rounded-xl transition-colors border border-[#0F2942] flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Open Registered Client View</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectProject(project)}
              className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors border border-stone-300 flex items-center justify-center gap-1"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenVIPModal(project.id)}
              className="w-full py-2.5 px-3 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get VIP Package</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
