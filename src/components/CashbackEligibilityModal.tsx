import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Phone,
  Mail,
  User,
  ArrowRight,
  Info,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface CashbackEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    purchasePrice?: number;
    targetProject?: string;
    transactionType?: 'Pre-Construction' | 'Resale';
    projectId?: string;
  };
  onOpenConsultation?: (interest?: string) => void;
}

export const CashbackEligibilityModal: React.FC<CashbackEligibilityModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onOpenConsultation
}) => {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    purchasePrice: 900000,
    propertyType: 'Townhome',
    transactionType: 'Pre-Construction' as 'Pre-Construction' | 'Resale' | 'Undecided',
    targetProjectOrArea: '',
    projectId: '',
    purchaseTimeframe: '3-6 months' as 'Immediate (1-3 months)' | '3-6 months' | '6-12 months' | 'Just planning',
    workingWithRealtor: false,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<any | null>(null);

  // Sync initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: user?.fullName || prev.fullName,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone,
        purchasePrice: initialData?.purchasePrice || prev.purchasePrice || 900000,
        transactionType: initialData?.transactionType || prev.transactionType || 'Pre-Construction',
        targetProjectOrArea: initialData?.targetProject || prev.targetProjectOrArea,
        projectId: initialData?.projectId || prev.projectId
      }));
      setSubmitError(null);
      setSubmittedInquiry(null);
    }
  }, [isOpen, initialData, user]);

  const calc = calculateCashback(
    formData.purchasePrice,
    formData.transactionType === 'Undecided' ? 'Pre-Construction' : formData.transactionType
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setSubmitError('Please enter your full name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/cashback/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          purchasePrice: formData.purchasePrice,
          propertyType: formData.propertyType,
          transactionType: formData.transactionType,
          targetProjectOrArea: formData.targetProjectOrArea.trim(),
          projectId: formData.projectId || undefined,
          purchaseTimeframe: formData.purchaseTimeframe,
          workingWithRealtor: formData.workingWithRealtor,
          notes: formData.notes.trim(),
          userId: user?.id || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit cashback inquiry');
      }

      setSubmittedInquiry(data.inquiry);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while registering. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-stone-900 border border-stone-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-stone-100 relative my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 border-b border-stone-800 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Buy Smart, Save Big Program</span>
          </div>

          <h3 className="text-2xl font-bold text-white font-serif">Check Cashback Eligibility</h3>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Connect with Amit Sawhney, Licensed REALTOR®, to confirm your eligibility and lock in potential savings.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedInquiry ? (
            /* Submission Success Screen */
            <div className="py-6 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-white">Inquiry Successfully Registered!</h4>
                <p className="text-sm text-stone-200 max-w-md mx-auto mt-2">
                  Thank you, <strong>{formData.fullName}</strong>. Amit Sawhney has received your eligibility inquiry.
                </p>
              </div>

              {submittedInquiry.workingWithRealtor ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 text-left max-w-lg mx-auto">
                  <p className="font-semibold mb-1">RECO Non-Solicitation Notice:</p>
                  <p className="text-stone-300">
                    Because you noted an active representation agreement with another brokerage, we cannot provide
                    representation or cashback services on this transaction in accordance with Ontario real estate
                    regulations.
                  </p>
                </div>
              ) : (
                <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-stone-700/60 pb-2">
                    <span className="text-stone-300">Anticipated Purchase Price:</span>
                    <span className="font-bold text-white">{formatCurrency(submittedInquiry.purchasePrice)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm border-b border-stone-700/60 pb-2">
                    <span className="text-stone-300">Estimated Potential Cashback:</span>
                    <span className="font-extrabold text-amber-300 text-lg font-mono">
                      {formatCurrency(submittedInquiry.estimatedCashback)}*
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-stone-300">
                    <span>Program Status:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
                      Eligibility Pending Verification
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-300 pt-1">
                    *Payable following closing and receipt of commission. Subject to formal representation agreement.
                  </p>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                {onOpenConsultation && !submittedInquiry.workingWithRealtor && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenConsultation('Cashback Program Follow-up');
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Book Strategy Call with Amit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Lead Capture Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Live Savings Header Preview Banner */}
              <div className="bg-stone-800/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-300 font-semibold block">
                    Estimated Buyer Benefit
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                    {formatCurrency(calc.estimatedCashback)}*
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-300 block">Based on purchase of:</span>
                  <span className="text-sm font-bold text-stone-200">{formatCurrency(formData.purchasePrice)}</span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="cb-full-name" className="block text-xs font-medium text-stone-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="cb-full-name"
                      type="text"
                      required
                      placeholder="e.g. Michael Thompson"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="cb-email" className="block text-xs font-medium text-stone-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="cb-email"
                      type="email"
                      required
                      placeholder="e.g. michael@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="cb-phone" className="block text-xs font-medium text-stone-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="cb-phone"
                      type="tel"
                      required
                      placeholder="e.g. (647) 555-0199"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Purchase Price Input */}
                <div>
                  <label htmlFor="cb-price-input" className="block text-xs font-medium text-stone-300 mb-1">
                    Target Purchase Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="cb-price-input"
                      type="number"
                      min={300000}
                      step={25000}
                      value={formData.purchasePrice}
                      onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                      className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Transaction Type */}
                <div>
                  <label htmlFor="cb-tx-type" className="block text-xs font-medium text-stone-300 mb-1">
                    Property Category
                  </label>
                  <select
                    id="cb-tx-type"
                    value={formData.transactionType}
                    onChange={e => setFormData({ ...formData, transactionType: e.target.value as any })}
                    className="w-full bg-stone-800/80 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Pre-Construction">Pre-Construction Development</option>
                    <option value="Resale">Resale Property (Turnkey)</option>
                    <option value="Undecided">Comparing Pre-Con vs Resale</option>
                  </select>
                </div>

                {/* Purchase Timeframe */}
                <div>
                  <label htmlFor="cb-timeframe" className="block text-xs font-medium text-stone-300 mb-1">
                    Expected Purchase Timeframe
                  </label>
                  <select
                    id="cb-timeframe"
                    value={formData.purchaseTimeframe}
                    onChange={e => setFormData({ ...formData, purchaseTimeframe: e.target.value as any })}
                    className="w-full bg-stone-800/80 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Immediate (1-3 months)">Immediate (1 to 3 months)</option>
                    <option value="3-6 months">3 to 6 months</option>
                    <option value="6-12 months">6 to 12 months</option>
                    <option value="Just planning">Just exploratory / planning</option>
                  </select>
                </div>
              </div>

              {/* Target Project or Area of Interest */}
              <div>
                <label htmlFor="cb-target-project" className="block text-xs font-medium text-stone-300 mb-1">
                  Project or City of Interest (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="cb-target-project"
                    type="text"
                    placeholder="e.g. Brooklin Trails, Whitby, Oshawa, Cobourg, or Toronto"
                    value={formData.targetProjectOrArea}
                    onChange={e => setFormData({ ...formData, targetProjectOrArea: e.target.value })}
                    className="w-full bg-stone-800/80 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Critical RECO Compliance Representation Confirmation */}
              <div className="bg-stone-850 border border-stone-700/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-stone-200 block">
                      Representation Status (Required by RECO)
                    </span>
                    <p className="text-[11px] text-stone-300 leading-normal">
                      Are you currently under an active Buyer Representation Agreement with another real estate
                      brokerage?
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-6 pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="radio"
                      name="realtorRep"
                      checked={!formData.workingWithRealtor}
                      onChange={() => setFormData({ ...formData, workingWithRealtor: false })}
                      className="accent-amber-400"
                    />
                    <span>
                      <strong>No</strong>, I am not currently represented by another Realtor
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="realtorRep"
                      checked={formData.workingWithRealtor}
                      onChange={() => setFormData({ ...formData, workingWithRealtor: true })}
                      className="accent-amber-400"
                    />
                    <span>Yes, I am currently represented</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Verifying Eligibility...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>Unlock My Cashback Eligibility</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Micro Disclaimer */}
              <p className="text-[10px] text-stone-400 text-center leading-normal">
                Submitting this form does not bind you to a transaction. An estimate is not a guaranteed payment and is
                subject to formal representation agreement, closing completion, and brokerage commission disbursement.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
