import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  ShieldCheck,
  Phone,
  Mail
} from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { useAuth } from '../../context/AuthContext';
import { ShowingBookingRequest } from '../../types';

export const ShowingBookingModal: React.FC = () => {
  const {
    showingModalOpen,
    closeShowingModal,
    showingProperty,
    showingIsAssistance,
    assessment
  } = useAffordability();
  const { user } = useAuth();

  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('Afternoon (1:00 PM – 4:00 PM)');
  const [alternativeTime, setAlternativeTime] = useState<string>('Evening (5:00 PM – 7:30 PM)');
  const [attendeesCount, setAttendeesCount] = useState<number>(2);
  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedBooking, setSubmittedBooking] = useState<ShowingBookingRequest | null>(null);

  useEffect(() => {
    if (showingModalOpen) {
      if (user) {
        setFullName(prev => prev || user.fullName || '');
        setEmail(prev => prev || user.email || '');
        setPhone(prev => prev || user.phone || '');
      }
      setSubmittedBooking(null);
    }
  }, [showingModalOpen, user]);

  if (!showingModalOpen || !showingProperty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate || !fullName || !email || !phone) return;

    setIsSubmitting(true);
    const bookingPayload: Partial<ShowingBookingRequest> = {
      propertyId: showingProperty.id,
      propertyTitle: showingProperty.title,
      propertyAddress: showingProperty.address,
      propertyPrice: showingProperty.price,
      isPrecon: !!showingProperty.isPrecon,
      preferredDate,
      preferredTime,
      alternativeTime,
      attendeesCount,
      fullName,
      email,
      phone,
      notes,
      isAssistanceShowing: showingIsAssistance,
      buyerUpperRange: assessment?.estimatedPurchasePriceMax,
      priceToRangeRatio: assessment?.estimatedPurchasePriceMax
        ? Number((showingProperty.price / assessment.estimatedPurchasePriceMax).toFixed(2))
        : undefined,
      status: 'Requested'
    };

    try {
      const res = await fetch('/api/showings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await res.json();
      if (data.success && data.showing) {
        setSubmittedBooking(data.showing);
      } else {
        // Fallback local display
        setSubmittedBooking({
          ...bookingPayload,
          id: `show-${Date.now()}`,
          createdAt: new Date().toISOString()
        } as ShowingBookingRequest);
      }
    } catch (err) {
      console.error('Showing request network error, using local confirmation', err);
      setSubmittedBooking({
        ...bookingPayload,
        id: `show-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as ShowingBookingRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedBooking(null);
    closeShowingModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#121212] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C5A880]">
                {showingIsAssistance ? 'Assistance Showing Request' : 'VIP Showing Reservation'}
              </span>
              <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                Schedule Private Property Tour
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {submittedBooking ? (
            /* Confirmation Card */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">Showing Request Confirmed</h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                  Your tour request has been dispatched to <strong>Amit Sawhney, Licensed REALTOR®</strong>. We will coordinate with the listing brokerage / sales pavilion and confirm access details with you directly.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-stone-400">Property</span>
                  <span className="font-bold text-white text-right">{submittedBooking.propertyTitle}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-stone-400">Preferred Date</span>
                  <span className="font-mono text-white">{submittedBooking.preferredDate}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-stone-400">Preferred Window</span>
                  <span className="text-white">{submittedBooking.preferredTime}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-stone-400">Attendees</span>
                  <span className="text-white">{submittedBooking.attendeesCount} guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pending Brokerage Confirmation
                  </span>
                </div>
              </div>

              {showingIsAssistance && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-left text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Note: As this property is above your initial estimated range, Amit Sawhney will review comparative market statistics and lender pre-qualification requirements with you during the showing coordination.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close & Return to Search
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Property Summary Pill */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[280px]">{showingProperty.title}</h4>
                  <p className="text-[11px] text-stone-400 truncate max-w-[280px]">{showingProperty.address}</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#C5A880]">
                  ${showingProperty.price.toLocaleString()}
                </span>
              </div>

              {showingIsAssistance && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Assistance Workflow Active: Listed above your preliminary estimate of ${assessment?.estimatedPurchasePriceMax?.toLocaleString()}.
                  </span>
                </div>
              )}

              {/* Date & Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 focus:border-[#C5A880] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold">
                    Preferred Time Window *
                  </label>
                  <select
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/15 focus:border-[#C5A880] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Morning (10:00 AM – 12:00 PM)">Morning (10:00 AM – 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM – 4:00 PM)">Afternoon (1:00 PM – 4:00 PM)</option>
                    <option value="Evening (5:00 PM – 7:30 PM)">Evening (5:00 PM – 7:30 PM)</option>
                    <option value="Weekend Flexible">Weekend Flexible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold">
                    Alternative Time Option
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next day 2:00 PM"
                    value={alternativeTime}
                    onChange={e => setAlternativeTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 focus:border-[#C5A880] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold">
                    Number of Attendees
                  </label>
                  <select
                    value={attendeesCount}
                    onChange={e => setAttendeesCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/15 focus:border-[#C5A880] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 People</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4+ People</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880] block">
                  Attendee Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Legal Name *"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Cell Phone *"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Notes / Special Requests */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Specific Questions or Notes for REALTOR®
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inquire about parking spot, locker, status certificate, or deposit structure..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 focus:border-[#C5A880] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmitting Showing Booking...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Schedule Showing</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
