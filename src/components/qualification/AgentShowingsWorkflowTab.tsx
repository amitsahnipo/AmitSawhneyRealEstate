import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  MapPin,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { ShowingBookingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AgentShowingsWorkflowTab: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [showings, setShowings] = useState<ShowingBookingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchShowings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/showings', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.showings)) {
          setShowings(data.showings);
        }
      }
    } catch (err) {
      console.error('Failed to load showings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowings();
  }, []);

  const handleUpdateStatus = async (showingId: string, status: ShowingBookingRequest['status'], realtorNotes?: string) => {
    setUpdatingId(showingId);
    try {
      const res = await fetch(`/api/showings/${showingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status, realtorNotes })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.showing) {
          setShowings(prev => prev.map(s => (s.id === showingId ? data.showing : s)));
        }
      }
    } catch (err) {
      console.error('Failed to update showing status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#0F2942] text-[#C5A880]">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Private Showing & Tour Dispatch Queue
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage buyer tour requests across Durham MLS® listings & pre-con gallery appointments, including high-touch 20% rule interventions.
          </p>
        </div>

        <button
          onClick={fetchShowings}
          className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tours ({showings.length})</span>
        </button>
      </div>

      {showings.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-700">No Showing Requests Pending</h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Showing requests submitted by qualified or guided buyers will display here along with their mortgage readiness notes and preferred tour windows.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {showings.map(showing => {
            const isAssistance = (showing as any).requiresAssistanceConsultation || showing.isAssistanceShowing;
            const buyerName = (showing as any).buyerInfo?.fullName || showing.fullName || 'Client';
            const buyerPhone = (showing as any).buyerInfo?.phone || showing.phone || '';
            const buyerEmail = (showing as any).buyerInfo?.email || showing.email || '';
            const propertyTypeLabel = (showing as any).propertyType || (showing.isPrecon ? 'Pre-Construction' : 'Resale');
            const timeSlot = showing.preferredTime || (showing as any).preferredTimeSlot || 'Afternoon';
            const mortgageStatusLabel = (showing as any).mortgageStatus || (showing.isAssistanceShowing ? 'Assistance Consultation' : 'Pre-Qualified');

            return (
              <div
                key={showing.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isAssistance
                    ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                    : 'bg-white border-stone-200 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        showing.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : showing.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : showing.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {showing.status}
                      </span>

                      {isAssistance && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>20% Rule: Financing Assistance Required</span>
                        </span>
                      )}

                      <span className="text-xs text-stone-400 font-mono">
                        Requested: {new Date(showing.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-serif font-bold text-stone-900">
                      {showing.propertyTitle} ({propertyTypeLabel})
                    </h4>
                    <p className="text-xs text-stone-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{showing.propertyAddress}</span>
                      <span className="font-mono font-bold text-stone-900 ml-2">
                        ${showing.propertyPrice.toLocaleString()}
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#0F2942]" />
                        <strong>{buyerName}</strong>
                      </span>
                      {buyerPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#0F2942]" />
                          <a href={`tel:${buyerPhone}`} className="hover:underline">{buyerPhone}</a>
                        </span>
                      )}
                      {buyerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#0F2942]" />
                          <a href={`mailto:${buyerEmail}`} className="hover:underline">{buyerEmail}</a>
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-stone-100 rounded-xl text-xs text-stone-700 flex flex-wrap items-center gap-4">
                      <div>
                        <strong>Preferred Tour Date:</strong> {showing.preferredDate} ({timeSlot})
                      </div>
                      <div>
                        <strong>Pre-Approval Status:</strong> {mortgageStatusLabel}
                      </div>
                    </div>

                    {showing.notes && (
                      <p className="text-xs italic text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                        "{showing.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions for Agent */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end">
                    <button
                      onClick={() => handleUpdateStatus(showing.id, 'Confirmed', 'Listing brokerage booked. Lockbox code retrieved.')}
                      disabled={updatingId === showing.id || showing.status === 'Confirmed'}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Tour</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(showing.id, 'Completed')}
                      disabled={updatingId === showing.id || showing.status === 'Completed'}
                      className="px-3.5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Sparkles className="w-4 h-4 text-[#C5A880]" />
                      <span>Mark Completed</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(showing.id, 'Cancelled')}
                      disabled={updatingId === showing.id || showing.status === 'Cancelled'}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
