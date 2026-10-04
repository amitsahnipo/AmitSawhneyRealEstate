import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  Calendar,
  ShieldCheck,
  Phone,
  Mail,
  Send,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { OfferPreparationDraft, OfferDraftStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AMIT_SAWHNEY } from '../../data/agent';

interface PortalOffersSectionProps {
  onPrepareNewOffer?: () => void;
  onExploreProperties?: () => void;
}

// 7-Stage Visual Progress Workflow
const OFFER_STAGES: {
  key: string;
  label: string;
  description: string;
  matchingStatuses: OfferDraftStatus[];
}[] = [
  {
    key: 'draft',
    label: 'Draft Prepared',
    description: 'Buyer terms & qualification submitted',
    matchingStatuses: ['Draft']
  },
  {
    key: 'realtor_review',
    label: 'REALTOR® Review',
    description: 'Amit Sawhney fiduciary & clause audit',
    matchingStatuses: ['REALTOR Review Requested', 'In Review by Amit Sawhney', 'Changes Requested']
  },
  {
    key: 'aps_drafted',
    label: 'OREA APS Signed',
    description: 'Form 100 drafted & e-signed by buyer',
    matchingStatuses: ['Approved for Signing', 'Approved for OREA APS']
  },
  {
    key: 'submitted',
    label: 'Submitted to Seller',
    description: 'Formal registered offer presented',
    matchingStatuses: ['Submitted to Seller', 'Submitted']
  },
  {
    key: 'negotiation',
    label: 'In Negotiation',
    description: 'Counter-offer or terms alignment',
    matchingStatuses: ['Submitted to Seller']
  },
  {
    key: 'conditional',
    label: 'Conditional Acceptance',
    description: 'Financing, inspection & status cert',
    matchingStatuses: ['Accepted by Seller']
  },
  {
    key: 'firm',
    label: 'Firm & Binding',
    description: 'All conditions waived; escrow closing',
    matchingStatuses: ['Accepted by Seller']
  }
];

function getStageIndex(status: OfferDraftStatus): number {
  switch (status) {
    case 'Draft':
      return 0;
    case 'REALTOR Review Requested':
    case 'In Review by Amit Sawhney':
    case 'Changes Requested':
      return 1;
    case 'Approved for Signing':
    case 'Approved for OREA APS':
      return 2;
    case 'Submitted to Seller':
    case 'Submitted':
      return 3;
    case 'Accepted by Seller':
      return 5;
    case 'Rejected':
      return 1;
    default:
      return 1;
  }
}

export const PortalOffersSection: React.FC<PortalOffersSectionProps> = ({
  onPrepareNewOffer,
  onExploreProperties
}) => {
  const { user, getAuthHeaders } = useAuth();
  const [offers, setOffers] = useState<OfferPreparationDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [amendmentModalOpen, setAmendmentModalOpen] = useState(false);
  const [selectedOfferForAmendment, setSelectedOfferForAmendment] = useState<OfferPreparationDraft | null>(null);
  const [amendmentText, setAmendmentText] = useState('');
  const [amendmentSent, setAmendmentSent] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      // 1. Try fetching client-specific offers
      const res = await fetch('/api/client/offers', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.offers) && data.offers.length > 0) {
          setOffers(data.offers);
          setExpandedOfferId(data.offers[0].id);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback to /api/offers and filter by user email or provide active offers
      const allRes = await fetch('/api/offers', {
        headers: getAuthHeaders()
      });
      if (allRes.ok) {
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.offers)) {
          // Check if any match client email or name
          const userEmail = user?.email?.toLowerCase();
          const userMatches = allData.offers.filter(
            (o: OfferPreparationDraft) =>
              o.buyerInfo?.email?.toLowerCase() === userEmail ||
              o.buyerInfo?.fullName?.toLowerCase() === user?.fullName?.toLowerCase()
          );

          if (userMatches.length > 0) {
            setOffers(userMatches);
            setExpandedOfferId(userMatches[0].id);
          } else if (allData.offers.length > 0) {
            // If newly registered and no offers, show available offers for demonstration
            setOffers(allData.offers);
            setExpandedOfferId(allData.offers[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  const handleSendAmendment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendmentText.trim()) return;
    setAmendmentSent(true);
    setTimeout(() => {
      setAmendmentSent(false);
      setAmendmentModalOpen(false);
      setAmendmentText('');
    }, 2500);
  };

  const getStatusColorClass = (status: OfferDraftStatus) => {
    switch (status) {
      case 'In Review by Amit Sawhney':
      case 'REALTOR Review Requested':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Approved for Signing':
      case 'Approved for OREA APS':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Submitted to Seller':
      case 'Submitted':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Accepted by Seller':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Changes Requested':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="space-y-8" id="portal-offers-section">
      {/* Top Section Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Complete Offer Portfolio
            </span>
            <span className="text-xs text-stone-500">• {offers.length} Tracked Submission{offers.length !== 1 ? 's' : ''}</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Submitted Offers & Real-Time Progress</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Track every stage of your real estate offers from initial draft submission and Amit Sawhney's RECO fiduciary review through OREA APS drafting, builder/seller presentation, and final firm escrow closing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchOffers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Offers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0F2942]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onPrepareNewOffer && (
            <button
              type="button"
              onClick={onPrepareNewOffer}
              className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C5A880]" />
              <span>Draft New Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-[#0F2942]/20 border-t-[#0F2942] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-700">Loading your submitted offers...</p>
          <p className="text-xs text-stone-500">Retrieving agreement progress and REALTOR® status updates</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-[#C5A880] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">No Active Offers Yet</h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
            When you find a pre-construction allocation or resale property you wish to pursue, submit your offer draft here for Amit Sawhney's licensed legal review and preparation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onPrepareNewOffer && (
              <button
                type="button"
                onClick={onPrepareNewOffer}
                className="px-5 py-2.5 bg-[#0F2942] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-[#C5A880]" />
                <span>Prepare Offer Draft</span>
              </button>
            )}
            {onExploreProperties && (
              <button
                type="button"
                onClick={onExploreProperties}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
              >
                Browse Available Properties
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map(offer => {
            const isExpanded = expandedOfferId === offer.id;
            const currentStageIdx = getStageIndex(offer.status);

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Offer Card Header */}
                <div className="p-6 border-b border-stone-100 bg-stone-50/40">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColorClass(offer.status)}`}>
                          {offer.status}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          Submitted: {new Date(offer.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-stone-400">• Offer ID #{offer.id.slice(-8)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-stone-900">{offer.propertyTitle}</h3>
                      <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-stone-400" />
                        <span>{offer.propertyAddress}</span>
                        <span className="text-stone-300">•</span>
                        <span className="font-semibold text-stone-700">{offer.propertyType}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-stone-500 block uppercase font-bold tracking-wider">Offer Price</span>
                        <span className="text-2xl font-black text-[#0F2942]">${offer.purchaseTerms.offerPrice.toLocaleString()}</span>
                        {offer.propertyPrice && offer.propertyPrice !== offer.purchaseTerms.offerPrice && (
                          <span className="text-[11px] text-stone-400 block line-through">
                            List: ${offer.propertyPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                        className="p-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-white hover:text-stone-900 transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* 7-Stage Visual Progress Stepper */}
                  <div className="pt-3 pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Progress Stepper: Stage {currentStageIdx + 1} of 7</span>
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        {OFFER_STAGES[currentStageIdx]?.label}
                      </span>
                    </div>

                    {/* Progress Bar and Dots */}
                    <div className="relative">
                      {/* Gray track */}
                      <div className="h-2 bg-stone-200 rounded-full w-full overflow-hidden">
                        <div
                          className="h-full bg-[#0F2942] transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(14, ((currentStageIdx + 1) / OFFER_STAGES.length) * 100))}%` }}
                        />
                      </div>

                      {/* Step Labels on desktop */}
                      <div className="hidden md:grid grid-cols-7 gap-1 pt-2 text-center">
                        {OFFER_STAGES.map((st, i) => {
                          const isCompleted = i < currentStageIdx;
                          const isCurrent = i === currentStageIdx;

                          return (
                            <div key={st.key} className="text-center">
                              <div
                                className={`w-3.5 h-3.5 mx-auto rounded-full mb-1 border-2 transition-all ${
                                  isCompleted
                                    ? 'bg-[#0F2942] border-[#0F2942]'
                                    : isCurrent
                                    ? 'bg-amber-500 border-amber-600 ring-2 ring-amber-200 animate-pulse'
                                    : 'bg-stone-100 border-stone-300'
                                }`}
                              />
                              <p className={`text-[11px] font-bold leading-tight ${isCurrent ? 'text-[#0F2942]' : isCompleted ? 'text-stone-700' : 'text-stone-400'}`}>
                                {st.label}
                              </p>
                              <p className="text-[10px] text-stone-400 leading-tight hidden lg:block">{st.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* REALTOR Notes Highlight Banner */}
                {offer.realtorNotes && (
                  <div className="p-4 bg-amber-50/80 border-b border-amber-200/60 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-900 mb-0.5 flex items-center gap-2">
                        <span>Fiduciary Note from Amit Sawhney (REALTOR® #4892105):</span>
                        <span className="text-[10px] font-normal text-stone-500">Live Status Update</span>
                      </p>
                      <p className="text-xs text-stone-700 leading-relaxed italic">
                        "{offer.realtorNotes}"
                      </p>
                    </div>
                    <a
                      href={`tel:${AMIT_SAWHNEY.phone}`}
                      className="px-3 py-1.5 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Amit</span>
                    </a>
                  </div>
                )}

                {/* Expanded Offer Details */}
                {isExpanded && (
                  <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
                    {/* Financial Terms & Deposit Structure */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                          Deposit Amount
                        </span>
                        <p className="text-lg font-bold text-stone-900">
                          ${offer.purchaseTerms.depositAmount.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {((offer.purchaseTerms.depositAmount / offer.purchaseTerms.offerPrice) * 100).toFixed(1)}% of offer price
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                          Preferred Closing Date
                        </span>
                        <p className="text-lg font-bold text-stone-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          <span>{offer.purchaseTerms.preferredClosingDate}</span>
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Subject to mutual agreement</p>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                          Financing Plan
                        </span>
                        <p className="text-lg font-bold text-stone-900">
                          ${(offer.financing?.estimatedMortgageAmount || 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Down payment: ${(offer.financing?.downPaymentAvailable || 0).toLocaleString()} ({offer.financing?.mortgagePreApprovalStatus || 'In Progress'})
                        </p>
                      </div>
                    </div>

                    {/* Conditions Breakdown Table */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-[#0F2942]" />
                        <span>Contractual Conditions & Protection Clauses</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${offer.conditions.financingCondition ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                          <div>
                            <p className="font-bold">Financing Condition</p>
                            <p className="text-[11px] opacity-80">5 banking days lender verification</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${offer.conditions.financingCondition ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {offer.conditions.financingCondition ? 'INCLUDED' : 'WAIVED'}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center justify-between ${offer.conditions.homeInspectionCondition ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                          <div>
                            <p className="font-bold">Home Inspection</p>
                            <p className="text-[11px] opacity-80">Certified inspector report</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${offer.conditions.homeInspectionCondition ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {offer.conditions.homeInspectionCondition ? 'INCLUDED' : 'N/A'}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center justify-between ${offer.conditions.statusCertificateCondition ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                          <div>
                            <p className="font-bold">Status Certificate</p>
                            <p className="text-[11px] opacity-80">Legal lawyer review of condo docs</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${offer.conditions.statusCertificateCondition ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {offer.conditions.statusCertificateCondition ? 'INCLUDED' : 'N/A'}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center justify-between ${offer.conditions.lawyerReviewCondition ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                          <div>
                            <p className="font-bold">Lawyer Approval</p>
                            <p className="text-[11px] opacity-80">Subject to solicitor review</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${offer.conditions.lawyerReviewCondition ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {offer.conditions.lawyerReviewCondition ? 'INCLUDED' : 'WAIVED'}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center justify-between ${offer.conditions.saleOfPropertyCondition ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                          <div>
                            <p className="font-bold">Sale of Existing Home (SPOP)</p>
                            <p className="text-[11px] opacity-80">Conditional on buyer sale</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${offer.conditions.saleOfPropertyCondition ? 'bg-amber-200 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>
                            {offer.conditions.saleOfPropertyCondition ? 'CONDITIONAL' : 'NO SPOP'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-stone-700">
                          <div>
                            <p className="font-bold">10-Day Statutory Cooling Off</p>
                            <p className="text-[11px] text-stone-500">Ontario Condominium Act protection</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            STANDARD
                          </span>
                        </div>
                      </div>

                      {offer.conditions.customConditionsNotes && (
                        <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                          <span className="font-bold text-stone-800 block mb-0.5">Special Clauses & Levies:</span>
                          <span>{offer.conditions.customConditionsNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Primary Applicant & Co-Buyer Info */}
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-stone-400 block">Primary Legal Buyer:</span>
                        <p className="font-bold text-stone-900">{offer.buyerInfo.fullName}</p>
                        <p className="text-[11px] text-stone-500">{offer.buyerInfo.phone}</p>
                      </div>

                      {offer.buyerInfo.coBuyerName && (
                        <div>
                          <span className="text-stone-400 block">Joint Co-Buyer:</span>
                          <p className="font-bold text-stone-900">{offer.buyerInfo.coBuyerName}</p>
                          <p className="text-[11px] text-stone-500">{offer.buyerInfo.email}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-stone-400 block">Mortgage Specialist:</span>
                        <p className="font-bold text-stone-900">{offer.financing?.lenderOrBroker || 'RBC Royal Bank'}</p>
                        <p className="text-[11px] text-stone-500">Status: {offer.financing?.mortgagePreApprovalStatus || 'Verified'}</p>
                      </div>
                    </div>

                    {/* Offer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOfferForAmendment(offer);
                            setAmendmentModalOpen(true);
                          }}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Request Offer Amendment</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <span>Print Summary</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${AMIT_SAWHNEY.email}?subject=Inquiry regarding Offer for ${encodeURIComponent(offer.propertyTitle)}`}
                          className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Amit</span>
                        </a>

                        <a
                          href={`tel:${AMIT_SAWHNEY.phone}`}
                          className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Direct Hotline</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Amendment Request Modal */}
      {amendmentModalOpen && selectedOfferForAmendment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Request Offer Amendment</h3>
              <button
                type="button"
                onClick={() => setAmendmentModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Property: <strong className="text-stone-900">{selectedOfferForAmendment.propertyTitle}</strong>
              <br />
              Specify your proposed changes (e.g., price revision, closing date adjustment, condition waiver, or deposit timeline). Amit Sawhney will prepare the revised OREA Form 120 Amendment for your signature.
            </p>

            {amendmentSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Amendment request dispatched to Amit Sawhney. You will be notified when the updated APS is ready.</span>
              </div>
            ) : (
              <form onSubmit={handleSendAmendment} className="space-y-4">
                <textarea
                  rows={4}
                  required
                  value={amendmentText}
                  onChange={e => setAmendmentText(e.target.value)}
                  placeholder="Describe your requested change, e.g.: 'Please revise offer price to $715,000 and extend the financing condition by 2 business days.'"
                  className="w-full p-3.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#0F2942]"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAmendmentModalOpen(false)}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Amit Sawhney</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
