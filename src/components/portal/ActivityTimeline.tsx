import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  FileCheck2,
  Scale,
  Send,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OfferPreparationDraft, OfferDraftStatus } from '../../types';
import { AMIT_SAWHNEY } from '../../data/agent';

export interface ActivityTimelineProps {
  onNavigateToOffers?: () => void;
  onPrepareNewOffer?: () => void;
  onNavigateToDocuments?: () => void;
  className?: string;
}

export interface NegotiationStageDefinition {
  stageNumber: number;
  key: string;
  shortLabel: string;
  fullTitle: string;
  focus: string;
  description: string;
  typicalDuration: string;
  legalForm: string;
  checklistItems: string[];
  fiduciaryAdvice: string;
}

// Canonical 7-Stage Real Estate Negotiation Progress (Ontario OREA / RECO Standard)
export const NEGOTIATION_7_STAGES: NegotiationStageDefinition[] = [
  {
    stageNumber: 1,
    key: 'draft_prepared',
    shortLabel: 'Draft Prepared',
    fullTitle: 'Buyer Terms & Qualification Drafted',
    focus: 'Financial qualification & offer parameters',
    description: 'Buyer purchase criteria, target purchase price, deposit capability, and protective conditions are assembled and stress-tested.',
    typicalDuration: '1 Day',
    legalForm: 'Client Questionnaire & Pre-Qualification Record',
    checklistItems: [
      'Down payment funds verified in Canadian financial institution',
      'Mortgage pre-approval status & qualifying interest rate logged',
      'Desired closing date & essential chattels/fixtures identified',
      'Initial deposit schedule (typically 5% in Durham Region) prepared'
    ],
    fiduciaryAdvice: 'We verify your purchasing power under the OSFI B-20 mortgage stress test before drafting, ensuring your initial offer is strategically solid without overextending.'
  },
  {
    stageNumber: 2,
    key: 'realtor_audit',
    shortLabel: 'REALTOR® Audit',
    fullTitle: 'REALTOR® Fiduciary Clause & Pricing Audit',
    focus: 'Comparative market analysis & contractual risk mitigation',
    description: 'Amit Sawhney conducts a 1.5km CMA comparable sold analysis, customizes Schedule A protective clauses, and ensures RECO Code of Ethics compliance.',
    typicalDuration: '1 Business Day',
    legalForm: 'OREA Form 100 Schedule A & RECO Fiduciary Representation',
    checklistItems: [
      'Hyper-local CMA sold comparables evaluated to establish realistic valuation ceiling',
      'Statutory financing & certified home inspection clauses drafted with 5-day escape windows',
      'Status certificate clause inserted for condo townhome / apartment transactions',
      'RECO Information Guide and client representation terms confirmed'
    ],
    fiduciaryAdvice: 'Never make an unrepresented or un-audited offer. We ensure your deposit is protected by water-tight contractual clauses that allow you to exit without penalty if conditions fail.'
  },
  {
    stageNumber: 3,
    key: 'offer_sent',
    shortLabel: 'Offer Sent',
    fullTitle: 'Formal Offer Registered & Sent to Seller',
    focus: 'Presentation to listing brokerage with binding irrevocable deadline',
    description: 'Formal OREA Form 100 Agreement of Purchase and Sale is executed via digital e-sign and registered on the listing board with an irrevocable deadline.',
    typicalDuration: '12 - 24 Hours Irrevocable',
    legalForm: 'OREA Form 801 (Offer Submission Confirmation) & Form 100',
    checklistItems: [
      'Buyer digital signatures completed via compliant e-signature vault',
      'OREA Form 801 formally registered with the seller\'s listing brokerage',
      'Irrevocable deadline timer active (legally binding commitment window)',
      'Confirmation of Cooperation and Representation (OREA Form 320) exchanged'
    ],
    fiduciaryAdvice: 'Once registered via Form 801, the listing brokerage is legally obligated to inform all inquiring parties that a registered offer exists, preventing behind-the-scenes manipulations.'
  },
  {
    stageNumber: 4,
    key: 'counter_offer',
    shortLabel: 'Counter-Offer',
    fullTitle: 'Seller Review & Counter-Offer Negotiation',
    focus: 'Price, deposit, closing date, or chattels sign-back alignment',
    description: 'The seller reviews the terms and signs back with revised pricing or conditions. Amit Sawhney leads strategic counter-proposals to protect your capital.',
    typicalDuration: '24 - 48 Hours',
    legalForm: 'OREA Form 100 Sign-Back / Form 120 Amendment',
    checklistItems: [
      'Seller sign-back price and altered clauses analyzed against CMA benchmark',
      'Tactical counter-response strategy formulated with buyer',
      'Negotiation on chattels (appliances, light fixtures, window coverings)',
      'Closing date revisions aligned with mortgage broker and moving schedule'
    ],
    fiduciaryAdvice: 'Counter-offers are where our negotiation experience yields tangible cash savings. We maintain emotional discipline and anchor negotiations to factual Durham sold comps.'
  },
  {
    stageNumber: 5,
    key: 'mutual_agreement',
    shortLabel: 'Mutual Agreement',
    fullTitle: 'Mutual Agreement & Deposit Escrow Placement',
    focus: 'Binding agreement reached; statutory trust deposit transferred',
    description: 'Buyer and seller have agreed to all terms, and the Confirmation of Acceptance is executed. The initial deposit is wired to the listing brokerage trust account.',
    typicalDuration: 'Within 24 Hours of Acceptance',
    legalForm: 'Executed OREA APS & Brokerage Statutory Trust Deposit Receipt',
    checklistItems: [
      'Confirmation of Acceptance (COA) signed by both buyer and seller',
      'Certified bank draft or wire transfer deposited into listing brokerage real estate trust',
      'Official Real Estate Trust Receipt issued under REBBA 2002 trust accounting rules',
      'Fully executed agreement delivered to buyer, mortgage lender, and closing lawyer'
    ],
    fiduciaryAdvice: 'Your deposit is held in a segregated, insured statutory brokerage trust account in trust for both parties, protected under Ontario provincial law until closing or legal release.'
  },
  {
    stageNumber: 6,
    key: 'conditional_clearance',
    shortLabel: 'Conditional Clearance',
    fullTitle: 'Due Diligence & Conditional Clearance Period',
    focus: 'Mortgage commitment, certified inspection & lawyer status cert review',
    description: 'The 5-day conditional period is active. Property inspection is conducted, lender issues unconditional financing commitment, and lawyer clears status certificate.',
    typicalDuration: '5 Banking Days',
    legalForm: 'OREA Form 124 (Notice of Fulfillment) / Form 123 (Waiver)',
    checklistItems: [
      'Lender appraisal completed and formal mortgage commitment issued',
      'Comprehensive certified physical home inspection completed; minor remedies negotiated',
      'Condominium status certificate, reserve fund study, and bylaws approved by lawyer',
      'OREA Form 124 (Notice of Fulfillment) delivered to listing brokerage before deadline'
    ],
    fiduciaryAdvice: 'We never waive conditions until your lender gives unconditional financing approval in writing and your lawyer approves the status certificate.'
  },
  {
    stageNumber: 7,
    key: 'firm_sale',
    shortLabel: 'Firm Sale',
    fullTitle: 'Firm Sale & Escrow Closing Conveyancing',
    focus: 'Unconditional contract; lawyer conveyancing & 1% VIP Cashback',
    description: 'All conditions waived or fulfilled. The agreement is firm, final, and legally binding. Legal files transferred to solicitor for title transfer and closing.',
    typicalDuration: '30 - 60 Days Until Closing',
    legalForm: 'Firm Agreement Certificate & Lawyer Statement of Adjustments',
    checklistItems: [
      'All conditions formally waived; status updated to "Firm & Sold" on MLS/TRREB',
      'Complete legal file conveyed to buyer\'s real estate closing solicitor',
      'Homeowner insurance binder secured and submitted to lender',
      'Amit Sawhney 1.0% Platinum VIP Cashback credited to buyer on closing statement'
    ],
    fiduciaryAdvice: 'Congratulations on reaching Firm Sale status! We remain beside you through the pre-closing walkthrough inspection, key handover, and delivery of your 1.0% VIP cashback benefit.'
  }
];

export function mapStatusToNegotiationStage(status: OfferDraftStatus | string): number {
  switch (status) {
    case 'Draft':
      return 1;
    case 'REALTOR Review Requested':
    case 'In Review by Amit Sawhney':
    case 'Changes Requested':
      return 2;
    case 'Approved for Signing':
    case 'Approved for OREA APS':
      return 2;
    case 'Submitted to Seller':
    case 'Submitted':
      return 3;
    case 'Counter-Offer Received':
    case 'In Negotiation':
      return 4;
    case 'Conditional Acceptance':
    case 'Accepted by Seller':
      return 6; // usually conditional acceptance first
    case 'Firm Sale':
    case 'Firm':
    case 'Sold Firm':
      return 7;
    case 'Rejected':
      return 3;
    default:
      return 4; // default to active negotiation demo if undetermined
  }
}

// Demo offer when no live offers exist yet
const SAMPLE_ACTIVE_OFFER: OfferPreparationDraft = {
  id: 'demo-simcoe-counter-1',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  propertyId: '1420-simcoe-oshawa',
  propertyTitle: '1420 Simcoe Street North, Unit 408',
  propertyAddress: '1420 Simcoe St N, Windfields, Oshawa, ON',
  propertyPrice: 789000,
  propertyType: 'Modern 3-Storey Executive Townhome',
  buyerInfo: {
    fullName: 'Valued VIP Buyer',
    email: 'client@example.com',
    phone: '(905) 555-0184',
    currentAddress: 'Durham Region, ON'
  },
  financing: {
    downPaymentAvailable: 160000,
    mortgagePreApprovalStatus: 'Pre-approved',
    mortgagePreApprovalAmount: 820000,
    lenderOrBroker: 'TD Canada Trust Mobile Mortgage Specialist',
    estimatedMortgageAmount: 615000,
    requiresMortgageFinancing: true
  },
  purchaseTerms: {
    offerPrice: 775000,
    depositAmount: 38750,
    preferredClosingDate: '2026-11-30'
  },
  conditions: {
    financingCondition: true,
    homeInspectionCondition: true,
    statusCertificateCondition: true,
    saleOfPropertyCondition: false,
    lawyerReviewCondition: true,
    customConditionsNotes: '5 banking days financing verification, 3 days status certificate review. Seller agrees to professional carpet cleaning prior to completion.'
  },
  readinessChecklist: {
    buyerInfoComplete: true,
    financialInfoComplete: true,
    downPaymentConfirmed: true,
    propertySelected: true,
    offerPriceEntered: true,
    preApprovalConfirmed: true,
    conditionsIdentified: true
  },
  status: 'Submitted to Seller',
  realtorNotes: 'Counter-Offer received from seller\'s listing agent at $782,000 (reduced from $789,000 list). Irrevocable until 8:00 PM tonight. Recommending a final firm compromise at $778,500 with inclusion of premium stainless appliances.'
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  onNavigateToOffers,
  onPrepareNewOffer,
  onNavigateToDocuments,
  className = ''
}) => {
  const { user, getAuthHeaders } = useAuth();
  const [offers, setOffers] = useState<OfferPreparationDraft[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedStageIndex, setExpandedStageIndex] = useState<number | null>(4); // default expand current active stage
  const [activeStageOverride, setActiveStageOverride] = useState<number | null>(null);

  // Fetch real offers
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/offers', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.offers) && data.offers.length > 0) {
          setOffers(data.offers);
          setSelectedOfferId(data.offers[0].id);
          setLoading(false);
          return;
        }
      }

      // Fallback to /api/offers
      const allRes = await fetch('/api/offers', {
        headers: getAuthHeaders()
      });
      if (allRes.ok) {
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.offers) && allData.offers.length > 0) {
          const userEmail = user?.email?.toLowerCase();
          const matches = allData.offers.filter(
            (o: OfferPreparationDraft) =>
              o.buyerInfo?.email?.toLowerCase() === userEmail ||
              o.buyerInfo?.fullName?.toLowerCase() === user?.fullName?.toLowerCase()
          );
          if (matches.length > 0) {
            setOffers(matches);
            setSelectedOfferId(matches[0].id);
          } else {
            // Include demo sample along with existing offers for rich experience
            setOffers([SAMPLE_ACTIVE_OFFER, ...allData.offers]);
            setSelectedOfferId(SAMPLE_ACTIVE_OFFER.id);
          }
        } else {
          setOffers([SAMPLE_ACTIVE_OFFER]);
          setSelectedOfferId(SAMPLE_ACTIVE_OFFER.id);
        }
      } else {
        setOffers([SAMPLE_ACTIVE_OFFER]);
        setSelectedOfferId(SAMPLE_ACTIVE_OFFER.id);
      }
    } catch {
      setOffers([SAMPLE_ACTIVE_OFFER]);
      setSelectedOfferId(SAMPLE_ACTIVE_OFFER.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  // Current selected offer
  const currentOffer = offers.find(o => o.id === selectedOfferId) || offers[0] || SAMPLE_ACTIVE_OFFER;
  
  // Real active stage derived from offer status (or manual interactive simulator override)
  const computedStage = mapStatusToNegotiationStage(currentOffer?.status || 'Submitted to Seller');
  const activeStage = activeStageOverride !== null ? activeStageOverride : computedStage;

  // Sync expanded stage whenever active stage changes
  useEffect(() => {
    setExpandedStageIndex(activeStage);
  }, [activeStage]);

  const toggleStageExpand = (stageNum: number) => {
    setExpandedStageIndex(prev => (prev === stageNum ? null : stageNum));
  };

  return (
    <section
      aria-label="Negotiation Progress and Activity Timeline"
      id="portal-activity-timeline"
      className={`bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-[#0F2942] to-stone-900 text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#C5A880] font-semibold tracking-wider uppercase mb-1">
                <span>RECO Fiduciary Workflow</span>
                <span aria-hidden="true">·</span>
                <span>Ontario OREA Form Standard</span>
                <span aria-hidden="true">·</span>
                <span>Active Representation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Activity Timeline & Negotiation Tracker</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-2xl leading-relaxed">
                Step-by-step fiduciary progress tracking from initial draft preparation through counter-offer negotiations to firm binding closing.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="px-3.5 py-2 bg-[#C5A880] hover:bg-[#b89758] text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Direct consultation with Amit Sawhney"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Amit ({AMIT_SAWHNEY.phoneFormatted})</span>
              </a>

              {onPrepareNewOffer && (
                <button
                  type="button"
                  onClick={onPrepareNewOffer}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Draft New Offer</span>
                </button>
              )}

              <button
                type="button"
                onClick={fetchOffers}
                disabled={loading}
                className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C5A880]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Active Offer Selector Bar (if client has offers or demo) */}
          {offers.length > 1 && (
            <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <Building2 className="w-4 h-4 text-[#C5A880]" />
                <span className="font-semibold">Selected Property Negotiation:</span>
              </div>
              
              {/* Clean Segmented Controls (no pill capsules) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950/60 rounded-xl border border-stone-800">
                {offers.map(off => {
                  const isSelected = off.id === currentOffer.id;
                  const label = off.propertyTitle ? off.propertyTitle.split('|')[0].trim() : 'Active Offer';
                  return (
                    <button
                      key={off.id}
                      type="button"
                      onClick={() => {
                        setSelectedOfferId(off.id);
                        setActiveStageOverride(null);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F2942] text-white shadow-sm border border-stone-700 font-bold'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-stone-600'}`} />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Negotiation Highlight Card */}
      <div className="p-6 sm:p-8 bg-stone-50 border-b border-stone-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Property & Live Status Summary */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="font-bold text-[#0F2942] uppercase tracking-wider">
                Stage {activeStage} of 7: {NEGOTIATION_7_STAGES[activeStage - 1]?.shortLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>Ref ID #{currentOffer.id.slice(-8).toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>{currentOffer.propertyType}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
              {currentOffer.propertyTitle}
            </h3>
            
            <p className="text-xs text-stone-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{currentOffer.propertyAddress}</span>
            </p>

            {/* Fiduciary Note Snippet */}
            {currentOffer.realtorNotes && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-stone-800 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-amber-950">Amit Sawhney Negotiation Directive:</span>
                    <span className="text-[10px] text-stone-500 font-mono">Live Fiduciary Advisory</span>
                  </div>
                  <p className="italic text-stone-700 leading-relaxed">
                    "{currentOffer.realtorNotes}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Offer Terms</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1.0% VIP Cashback: ${Math.round(currentOffer.purchaseTerms.offerPrice * 0.01).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Submitted Offer</span>
                <span className="text-lg font-black text-stone-900">
                  ${currentOffer.purchaseTerms.offerPrice.toLocaleString()}
                </span>
                {currentOffer.propertyPrice && currentOffer.propertyPrice !== currentOffer.purchaseTerms.offerPrice && (
                  <span className="text-[10px] text-stone-400 block line-through">
                    List: ${currentOffer.propertyPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Statutory Trust Deposit</span>
                <span className="text-lg font-black text-[#0F2942]">
                  ${currentOffer.purchaseTerms.depositAmount.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-500 block">
                  {((currentOffer.purchaseTerms.depositAmount / currentOffer.purchaseTerms.offerPrice) * 100).toFixed(1)}% of price
                </span>
              </div>
            </div>

            {/* Interactive Stage Preview Simulator (Demo / Inspection Tool) */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Interactive Simulation:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStageOverride(prev => Math.max(1, (prev || activeStage) - 1))}
                  disabled={activeStage <= 1}
                  className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 font-bold cursor-pointer"
                  title="Simulate previous stage"
                >
                  ← Prev
                </button>
                <span className="font-mono text-[11px] text-stone-600 px-1">
                  Stage {activeStage}/7
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStageOverride(prev => Math.min(7, (prev || activeStage) + 1))}
                  disabled={activeStage >= 7}
                  className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 font-bold cursor-pointer"
                  title="Simulate next stage"
                >
                  Next →
                </button>
                {activeStageOverride !== null && (
                  <button
                    type="button"
                    onClick={() => setActiveStageOverride(null)}
                    className="text-[10px] text-stone-400 hover:text-stone-700 underline ml-1 cursor-pointer"
                    title="Reset to live offer status"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 7-Stage Vertical Step-Based Progress Tracker */}
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              7-Stage Negotiation Step Progression
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any stage to expand legal documents, milestone deliverables, and REALTOR® fiduciary advice.
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Fulfilled</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F2942] inline-block ring-2 ring-amber-400" />
              <span>Active Negotiation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300 inline-block" />
              <span>Pending</span>
            </span>
          </div>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative pl-6 sm:pl-8 space-y-8">
          {/* Continuous Vertical Connecting Line */}
          <div
            className="absolute left-2.5 sm:left-3.5 top-3 bottom-6 w-0.5 bg-stone-200 pointer-events-none"
            aria-hidden="true"
          />

          {NEGOTIATION_7_STAGES.map((stage, idx) => {
            const isCompleted = stage.stageNumber < activeStage;
            const isCurrent = stage.stageNumber === activeStage;
            const isUpcoming = stage.stageNumber > activeStage;
            const isExpanded = expandedStageIndex === stage.stageNumber;

            return (
              <div
                key={stage.key}
                className="relative group transition-all"
                id={`timeline-step-${stage.stageNumber}`}
              >
                {/* Node Icon on Vertical Line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-[#0F2942] text-[#C5A880] ring-4 ring-amber-200/80 shadow-md scale-110'
                      : 'bg-white text-stone-400 border-2 border-stone-300'
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                  ) : (
                    <span className="text-xs font-bold font-mono">{stage.stageNumber}</span>
                  )}
                </div>

                {/* Stage Box Content */}
                <div
                  className={`rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-[#0F2942] bg-white shadow-md ring-1 ring-[#0F2942]/10'
                      : isCompleted
                      ? 'border-emerald-200/70 bg-stone-50/50 hover:bg-white'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  {/* Clickable Header for Step Accordion */}
                  <button
                    type="button"
                    onClick={() => toggleStageExpand(stage.stageNumber)}
                    className="w-full p-4 sm:p-5 text-left flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer group"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex-1">
                      {/* Quiet unboxed text metadata (zero-pill discipline) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                        <span className="font-bold text-stone-500 uppercase tracking-wider">
                          Stage {stage.stageNumber} of 7
                        </span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        
                        {isCompleted && (
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Fulfilled & Logged</span>
                          </span>
                        )}
                        {isCurrent && (
                          <span className="font-bold text-[#0F2942] bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                            <span>Active Negotiation Phase</span>
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="text-stone-400 font-medium">
                            Pending Stage {stage.stageNumber - 1} Completion
                          </span>
                        )}

                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-stone-500 font-medium">{stage.typicalDuration}</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#0F2942] transition-colors">
                        {stage.fullTitle}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                      <div className="text-right hidden sm:block">
                        <span className="text-[11px] font-mono text-stone-400 block">{stage.legalForm}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Stage Drawer */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-100 space-y-5 animate-in fade-in">
                      {/* 1. Deliverables Checklist */}
                      <div>
                        <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#0F2942]" />
                          <span>Key Milestone Deliverables & Verification</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {stage.checklistItems.map((item, itemIdx) => {
                            const itemDone = isCompleted || (isCurrent && itemIdx <= 1);
                            return (
                              <div
                                key={itemIdx}
                                className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                                  itemDone
                                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 font-medium'
                                    : 'bg-stone-50 border-stone-200 text-stone-600'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {itemDone ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-stone-300" />
                                  )}
                                </div>
                                <span className="leading-snug">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. RECO Legal Form & Artifact Reference */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-[#0F2942]" />
                          <div>
                            <span className="font-bold text-stone-900 block">Ontario Legal Instrument:</span>
                            <span className="text-stone-500">{stage.legalForm}</span>
                          </div>
                        </div>

                        {onNavigateToDocuments && (
                          <button
                            type="button"
                            onClick={onNavigateToDocuments}
                            className="text-[#0F2942] hover:text-[#C5A880] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <span>Inspect Document Vault</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 3. Fiduciary Advice by Amit Sawhney */}
                      <div className="p-3.5 rounded-xl bg-[#0F2942]/5 border border-[#0F2942]/15 text-stone-800 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-4 h-4 text-[#0F2942]" />
                          <span className="font-bold text-[#0F2942]">Amit Sawhney (Broker #4892105) Stage Guidance:</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed pl-6">
                          "{stage.fiduciaryAdvice}"
                        </p>
                      </div>

                      {/* 4. Active Stage Action Trigger */}
                      {isCurrent && (
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <a
                            href={`tel:${AMIT_SAWHNEY.phone}`}
                            className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Discuss Next Step with Amit</span>
                          </a>

                          {onNavigateToOffers && (
                            <button
                              type="button"
                              onClick={onNavigateToOffers}
                              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-stone-600" />
                              <span>View Full Offer Record</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Timeline Summary & Footer Links */}
        <div className="mt-10 p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                100% RECO-Governed Representation Guarantee
              </h4>
              <p className="text-[11px] text-stone-500">
                All agreements, counter-offers, and deposit waivers operate under strict Ontario Real Estate Association guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToOffers && (
              <button
                type="button"
                onClick={onNavigateToOffers}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Offers Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onNavigateToDocuments && (
              <button
                type="button"
                onClick={onNavigateToDocuments}
                className="px-3.5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Vault Documents</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
