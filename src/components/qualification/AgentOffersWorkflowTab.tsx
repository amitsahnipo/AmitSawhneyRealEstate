import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  ShieldCheck,
  Send,
  Building2,
  FileText,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  Check,
  Edit3
} from 'lucide-react';
import { OfferPreparationDraft, OfferDraftStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AgentOffersWorkflowTab: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [offers, setOffers] = useState<OfferPreparationDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferPreparationDraft | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/offers', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.offers)) {
          setOffers(data.offers);
          if (!selectedOffer && data.offers.length > 0) {
            setSelectedOffer(data.offers[0]);
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
  }, []);

  const handleUpdateStatus = async (offerId: string, newStatus: OfferDraftStatus) => {
    setUpdatingId(offerId);
    try {
      const res = await fetch(`/api/offers/${offerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          status: newStatus,
          realtorNotes: statusUpdateNote || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.offer) {
          setOffers(prev => prev.map(o => (o.id === offerId ? data.offer : o)));
          if (selectedOffer?.id === offerId) {
            setSelectedOffer(data.offer);
          }
          setStatusUpdateNote('');
        }
      }
    } catch (err) {
      console.error('Failed to update offer status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OfferDraftStatus) => {
    switch (status) {
      case 'Approved for OREA APS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Changes Requested':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Submitted to Seller':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Accepted by Seller':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#0F2942] text-[#C5A880]">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              REALTOR® Pre-Offer Review & OREA APS Preparation Queue
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Fiduciary review checkpoint: Evaluate buyer qualification readiness, proposed conditions, and prepare formal Ontario Agreements of Purchase and Sale.
          </p>
        </div>

        <button
          onClick={fetchOffers}
          className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue ({offers.length})</span>
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-700">No Offer Preparation Drafts Submitted Yet</h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            When a buyer selects "Prepare Offer Checkpoint" on any property, their structured offer draft, financing verification, and recommended conditions will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: List of Offers (4 cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {offers.map(offer => {
              const isSelected = selectedOffer?.id === offer.id;
              return (
                <div
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-md'
                      : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected ? 'bg-white/20 text-white border-white/30' : getStatusBadge(offer.status)
                    }`}>
                      {offer.status}
                    </span>
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm truncate">{offer.propertyTitle}</h4>
                  <p className={`text-xs truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    {offer.buyerInfo?.fullName || 'Client'} • {offer.buyerInfo?.phone || ''}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-dashed flex items-center justify-between text-xs font-mono">
                    <span className={isSelected ? 'text-stone-300' : 'text-stone-500'}>
                      Offer Price:
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-[#C5A880]' : 'text-stone-900'}`}>
                      ${offer.purchaseTerms.offerPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Offer Review & Action Console (8 cols) */}
          {selectedOffer ? (
            <div className="lg:col-span-8 bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5 text-stone-900">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 uppercase">Offer ID: {selectedOffer.id}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedOffer.status)}`}>
                      {selectedOffer.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
                    {selectedOffer.propertyTitle}
                  </h3>
                  <p className="text-xs text-stone-500">{selectedOffer.propertyAddress}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-500">Proposed Purchase Price</div>
                  <div className="text-2xl font-mono font-black text-[#0F2942]">
                    ${selectedOffer.purchaseTerms.offerPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-stone-500">
                    Deposit: ${selectedOffer.purchaseTerms.depositAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Buyer & Financing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Buyer Profile Box */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 uppercase">
                    <User className="w-3.5 h-3.5 text-[#0F2942]" />
                    <span>Buyer Legal Information</span>
                  </div>
                  <div className="space-y-1 text-stone-600">
                    <div><strong>Name:</strong> {selectedOffer.buyerInfo?.fullName || 'Client'}</div>
                    {selectedOffer.buyerInfo?.coBuyerName && (
                      <div><strong>Co-Buyer:</strong> {selectedOffer.buyerInfo?.coBuyerName}</div>
                    )}
                    <div><strong>Email:</strong> {selectedOffer.buyerInfo?.email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedOffer.buyerInfo?.phone || 'N/A'}</div>
                    {selectedOffer.buyerInfo?.currentAddress && (
                      <div><strong>Address:</strong> {selectedOffer.buyerInfo?.currentAddress}</div>
                    )}
                  </div>
                </div>

                {/* Financing Box */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 uppercase">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Financing & Pre-Approval</span>
                  </div>
                  <div className="space-y-1 text-stone-600">
                    <div><strong>Down Payment:</strong> ${selectedOffer.financing.downPaymentAvailable.toLocaleString()}</div>
                    <div><strong>Pre-Approval Status:</strong> <span className="font-semibold text-emerald-700">{selectedOffer.financing.mortgagePreApprovalStatus}</span></div>
                    <div><strong>Lender / Broker:</strong> {selectedOffer.financing.lenderOrBroker || 'Unassigned'}</div>
                    <div><strong>Mortgage Required:</strong> ${selectedOffer.financing.estimatedMortgageAmount.toLocaleString()}</div>
                    <div><strong>Preferred Closing:</strong> {selectedOffer.purchaseTerms.preferredClosingDate}</div>
                  </div>
                </div>
              </div>

              {/* Smart Conditions Flagged */}
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Recommended & Requested Conditions</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">OREA Standard Schedules</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${selectedOffer.conditions.financingCondition ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400 line-through'}`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Financing (5 Business Days)</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${selectedOffer.conditions.statusCertificateCondition ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400 line-through'}`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Status Certificate Review</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${selectedOffer.conditions.homeInspectionCondition ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400 line-through'}`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Home Inspection</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${selectedOffer.conditions.lawyerReviewCondition ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-400 line-through'}`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Lawyer Review Clause</span>
                  </div>
                </div>

                {selectedOffer.conditions.customConditionsNotes && (
                  <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-700 border border-stone-200">
                    <strong>Buyer Notes / Chattels:</strong> {selectedOffer.conditions.customConditionsNotes}
                  </div>
                )}
              </div>

              {/* REALTOR Decision & Action Console */}
              <div className="p-4 bg-[#0F2942] text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                    Amit Sawhney REALTOR® Fiduciary Action
                  </div>
                  <span className="text-[10px] text-stone-300">OREA Form 100 Workflow</span>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-300 mb-1">
                    Internal Notes / Buyer Feedback (e.g. recommend offering at $740K with 48-hr irrevocable)
                  </label>
                  <input
                    type="text"
                    value={statusUpdateNote}
                    onChange={e => setStatusUpdateNote(e.target.value)}
                    placeholder="Enter notes to accompany this status update..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'Approved for OREA APS')}
                    disabled={updatingId === selectedOffer.id}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Draft OREA APS</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'Changes Requested')}
                    disabled={updatingId === selectedOffer.id}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Request Changes from Buyer</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'Submitted to Seller')}
                    disabled={updatingId === selectedOffer.id}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Mark Submitted to Seller</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'Accepted by Seller')}
                    disabled={updatingId === selectedOffer.id}
                    className="px-4 py-2 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mark Deal Firm / Accepted</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'Rejected')}
                    disabled={updatingId === selectedOffer.id}
                    className="px-3 py-2 bg-white/10 hover:bg-rose-900/60 text-stone-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ml-auto"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Draft</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-xs text-stone-500">Select an offer from the queue to review its financial parameters and conditions.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
