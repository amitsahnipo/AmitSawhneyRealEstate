import React, { useState } from 'react';
import { X, MapPin, Building2, Calendar, Sparkles, CheckCircle2, ShieldCheck, Download, FileText, Phone, DollarSign, Lock, Scale, Check, ArrowRight, Gift } from 'lucide-react';
import { Project } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenVIPModal: (projectId: string) => void;
  onOpenClientView: (p: Project) => void;
  isCompared?: boolean;
  onToggleCompare?: (project: Project) => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Pre-Construction'; projectId: string }) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onOpenVIPModal,
  onOpenClientView,
  isCompared = false,
  onToggleCompare,
  onOpenCashbackEligibility
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'floorplans' | 'deposit' | 'incentives' | 'cashback'>('overview');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<any>(project?.floorPlans?.[0] || null);

  if (!project) return null;

  const cashbackEst = calculateCashback(project.priceRange.min, 'Pre-Construction');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-900 relative">
        
        {/* Modal Top Header Bar */}
        <div className="relative h-60 sm:h-72 bg-stone-900 overflow-hidden shrink-0">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-stone-200 hover:text-white rounded-full border border-white/20 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-[#C5A880] text-[#111827] px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {project.status}
                </span>
                <span className="bg-black/60 text-stone-200 border border-white/20 px-2.5 py-0.5 rounded text-xs font-medium">
                  Builder: {project.builder}
                </span>
                <span className="bg-[#0F2942] text-white border border-blue-400/30 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  Registered Client View Ready
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                {project.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>{project.location.address}, {project.location.city} ({project.location.region})</span>
              </p>
            </div>

            <div className="bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0 text-right">
              <p className="text-[10px] text-stone-300 uppercase tracking-wider font-semibold">VIP Pricing From</p>
              <p className="text-xl sm:text-2xl font-black text-[#C5A880] font-serif">
                {project.priceRange.display}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 pt-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Overview & Specs
            </button>
            <button
              onClick={() => setActiveTab('floorplans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'floorplans'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Floor Plans ({project.floorPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deposit'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Deposit Structure
            </button>
            <button
              onClick={() => setActiveTab('incentives')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'incentives'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              VIP Incentives
            </button>
            <button
              onClick={() => setActiveTab('cashback')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cashback'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Cashback (Up to {formatCurrency(cashbackEst.estimatedCashback)}*)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pb-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(project)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isCompared
                    ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                {isCompared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>In Comparison</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5 text-stone-500" />
                    <span>Compare Project</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#8C6D43] font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Amit: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Buy Smart, Save Big Cashback Banner */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-stone-50 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Buy Smart, Save Big™ Commission Cashback Eligible</span>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    Purchase at {project.name} through Amit Sawhney REALTOR® and receive professional fiduciary representation, builder incentives, plus an estimated cashback of up to <strong className="text-amber-950 font-bold">{formatCurrency(cashbackEst.estimatedCashback)}*</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('cashback')}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>View Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onOpenCashbackEligibility && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCashbackEligibility({
                          purchasePrice: project.priceRange.min,
                          targetProject: project.name,
                          transactionType: 'Pre-Construction',
                          projectId: project.id
                        });
                      }}
                      className="px-3.5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Check Eligibility
                    </button>
                  )}
                </div>
              </div>

              {/* Registered Client Portal Banner */}
              <div className="bg-[#0F2942]/5 border border-[#0F2942]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2942]">
                    <ShieldCheck className="w-4 h-4 text-[#0F2942]" />
                    <span>Exclusive Registered Client Portal</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Access real-time developer inventory worksheets, unit pricing matrices, site plans, and official documentation reserved for registered clients.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenClientView(project);
                  }}
                  className="shrink-0 px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#C5A880]" />
                  <span>Launch Client View Portal</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-2 font-serif">Project Description</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                <div>
                  <p className="text-stone-500">Total Units</p>
                  <p className="text-sm font-bold text-stone-900">{project.totalUnits} Suites</p>
                </div>
                <div>
                  <p className="text-stone-500">Occupancy Year</p>
                  <p className="text-sm font-bold text-[#8C6D43]">{project.occupancyYear}</p>
                </div>
                <div>
                  <p className="text-stone-500">Intersection</p>
                  <p className="text-sm font-bold text-stone-900">{project.location.intersection}</p>
                </div>
                <div>
                  <p className="text-stone-500">Property Types</p>
                  <p className="text-sm font-bold text-stone-900">{project.propertyTypes.join(', ')}</p>
                </div>
              </div>

              {/* Highlights List */}
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-3 font-serif">Key Project Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((hl, idx) => (
                    <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                      <span className="text-stone-700">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'floorplans' && (
            <div className="space-y-6">
              <p className="text-xs text-stone-600">
                Browse sample VIP floor plan layouts below. Full confidential floor plan packages and price sheets are available upon registering interest with <strong className="text-[#8C6D43]">{AMIT_SAWHNEY.name}</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.floorPlans.map(fp => (
                  <div
                    key={fp.id}
                    onClick={() => setSelectedFloorPlan(fp)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedFloorPlan?.id === fp.id
                        ? 'bg-stone-50 border-[#0F2942] shadow-md ring-1 ring-[#0F2942]'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#8C6D43]">{fp.type}</span>
                      <span className="text-xs font-extrabold text-stone-900">{fp.sqft} Sq.Ft.</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#111827] font-serif">{fp.name}</h4>
                    <p className="text-xs text-stone-500 mt-1">Starting From: <strong className="text-stone-800">{fp.startingPrice}</strong></p>

                    <ul className="mt-3 space-y-1 text-[11px] text-stone-600 border-t border-stone-200 pt-2">
                      {fp.features.map((ft, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#0F2942] shrink-0" />
                          <span>{ft}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-2 font-serif">Extended VIP Deposit Milestone Schedule</h3>
                <p className="text-xs text-stone-600">
                  Pre-construction deposits in Ontario allow you to lock in property appreciation with staggered payments over time.
                </p>
              </div>

              <div className="space-y-3">
                {project.depositStructure.map((dep, idx) => (
                  <div key={idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#111827] text-sm">{dep.stage}</p>
                      <p className="text-stone-500">Timing: <strong className="text-stone-800">{dep.timing}</strong></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8C6D43] font-extrabold text-base">{dep.percentage}%</p>
                      <p className="text-[11px] text-stone-500">{dep.estimatedAmount || 'Contact Agent'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'incentives' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-2 font-serif">Exclusive Platinum VIP Buyer Incentives</h3>
                <p className="text-xs text-stone-600">
                  Working with REALTOR® Amit Sawhney unlocks these builder incentives at zero additional cost to you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.vipIncentives.map((inc, i) => (
                  <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#8C6D43] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#111827]">{inc}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Negotiated exclusively by Blueprint Realty</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cashback' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>The "Buy Smart, Save Big™" Formula for {project.name}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  When you purchase a unit at <strong>{project.name}</strong> represented by Amit Sawhney (REALTOR®, Blueprint Realty), you never have to choose between full representation and financial savings. You receive full fiduciary guidance, builder incentives, and cash back upon closing.
                </p>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Starting Price</p>
                  <p className="text-xl font-extrabold text-[#111827] font-serif mt-1">{project.priceRange.display}</p>
                  <p className="text-[10px] text-stone-500 mt-1">Starting tier for this project</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Estimated Buyer Cashback</p>
                  <p className="text-xl font-extrabold text-amber-900 font-serif mt-1">
                    {formatCurrency(cashbackEst.estimatedCashback)}*
                  </p>
                  <p className="text-[10px] text-amber-700 mt-1">Direct wire/bank transfer upon closing</p>
                </div>
                <div className="bg-[#0F2942] text-white p-4 rounded-2xl border border-[#0F2942] text-center">
                  <p className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider">Total Buyer Value</p>
                  <p className="text-xl font-extrabold text-white font-serif mt-1">
                    {formatCurrency(cashbackEst.totalBuyerBenefit)}*
                  </p>
                  <p className="text-[10px] text-stone-300 mt-1">Cashback + Builder VIP concessions</p>
                </div>
              </div>

              {/* 3 Pillars List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#111827] font-serif">What's Included When You Buy Through Us:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-bold text-[#0F2942] mb-1">1. Fiduciary Realtor Advice</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Independent 10-day cooling-off rescission review, Tarion warranty verification, and capped development levy protection.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-bold text-[#0F2942] mb-1">2. Platinum Builder Incentives</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      First-access VIP pricing, extended deposit structures, free assignment clauses, and right to lease during occupancy.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-bold text-[#0F2942] mb-1">3. Legally Binding Rebate</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Documented in writing in your Buyer Representation Agreement Schedule before signing, paid securely post-completion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onOpenCashbackEligibility && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCashbackEligibility({
                        purchasePrice: project.priceRange.min,
                        targetProject: project.name,
                        transactionType: 'Pre-Construction',
                        projectId: project.id
                      });
                    }}
                    className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#163857] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Check Eligibility & Lock In Cashback on {project.name}</span>
                  </button>
                </div>
              )}

              <p className="text-[10px] text-stone-500 leading-relaxed italic">
                *Estimated cashback is based on a standard 2.5% co-operating builder commission and a 40% buyer rebate tier. Not intended to solicit buyers currently under an exclusive representation agreement with another brokerage. Terms subject to written representation agreement and lender approval.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Fixed CTA */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C5A880] shrink-0">
              <img
                src={AMIT_SAWHNEY.photo}
                alt={AMIT_SAWHNEY.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{AMIT_SAWHNEY.name}</p>
              <p className="text-[11px] text-[#8C6D43] font-semibold">{AMIT_SAWHNEY.phoneFormatted}</p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenVIPModal(project.id);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Register Interest for {project.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
