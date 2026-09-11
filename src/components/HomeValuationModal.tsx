import React, { useState } from 'react';
import { X, Sparkles, Home, DollarSign, CheckCircle2, ShieldCheck, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface HomeValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HomeValuationModal: React.FC<HomeValuationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    city: 'Whitby',
    propertyType: 'Detached Home',
    bedrooms: '3',
    bathrooms: '3',
    condition: 'Well Maintained / Move-in Ready',
    timeframeToSell: 'Just curious about value',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.propertyAddress) {
      setErrorMessage('Please fill in your name, phone number, and property address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to submit home valuation request');
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please call Amit directly at (647) 895-3613.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-auto">
        
        {/* Header */}
        <div className="bg-[#0F2942] text-white p-6 relative border-b border-[#1E3A8A]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complimentary Market Analysis</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
            What Is Your Home Worth in Today's Market?
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            Receive a precision Comparative Market Analysis (CMA) with active buyer demand and recent comparable sales in your neighborhood.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-5 bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-serif text-[#111827]">
                Valuation Request Received!
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-stone-900">{formData.fullName}</strong>. Amit Sawhney (Licensed REALTOR®) will analyze recent comparable solds for <strong className="text-stone-900">{formData.propertyAddress}</strong> and contact you at <strong className="text-stone-900">{formData.phone}</strong>.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 max-w-md mx-auto text-left text-xs text-stone-700 space-y-2">
              <p className="font-bold text-[#111827]">Your Selling Strategy Suite Includes:</p>
              <p>• Recent MLS sold data for your immediate subdivision</p>
              <p>• Recommended listing price bracket & pricing strategy</p>
              <p>• 4K HDR photo, video & staging consultation plan</p>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-sm rounded-xl shadow-sm transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 bg-white">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Property Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 142 Meadowglen Drive, Whitby"
                  value={formData.propertyAddress}
                  onChange={e => setFormData({ ...formData, propertyAddress: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:border-[#0F2942] focus:bg-white bg-stone-50 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    City / Municipality
                  </label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:border-[#0F2942] focus:outline-none bg-stone-50 text-stone-900"
                  >
                    <option value="Whitby">Whitby</option>
                    <option value="Brooklin">Brooklin</option>
                    <option value="Courtice">Courtice</option>
                    <option value="Oshawa">Oshawa</option>
                    <option value="Pickering">Pickering</option>
                    <option value="Ajax">Ajax</option>
                    <option value="Newcastle">Newcastle</option>
                    <option value="Bowmanville">Bowmanville</option>
                    <option value="Toronto">Toronto</option>
                    <option value="Markham">Markham</option>
                    <option value="Other GTA">Other GTA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:border-[#0F2942] focus:outline-none bg-stone-50 text-stone-900"
                  >
                    <option value="Detached Home">Detached Home</option>
                    <option value="Semi-Detached">Semi-Detached</option>
                    <option value="Freehold Townhome">Freehold Townhome</option>
                    <option value="Condo Townhouse">Condo Townhouse</option>
                    <option value="High-Rise Condo">High-Rise Condo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Bedrooms
                  </label>
                  <select
                    value={formData.bedrooms}
                    onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-stone-50 text-stone-900 focus:border-[#0F2942]"
                  >
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4 Beds</option>
                    <option value="5+">5+ Beds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Bathrooms
                  </label>
                  <select
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-stone-50 text-stone-900 focus:border-[#0F2942]"
                  >
                    <option value="1">1 Bath</option>
                    <option value="2">2 Baths</option>
                    <option value="3">3 Baths</option>
                    <option value="4+">4+ Baths</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Selling Horizon
                  </label>
                  <select
                    value={formData.timeframeToSell}
                    onChange={e => setFormData({ ...formData, timeframeToSell: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-stone-50 text-stone-900 focus:border-[#0F2942]"
                  >
                    <option value="Immediately (0-30 days)">0-30 Days</option>
                    <option value="1 to 3 Months">1-3 Months</option>
                    <option value="3 to 6 Months">3-6 Months</option>
                    <option value="Just curious about market value">Just Curious</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#0F2942] focus:bg-white bg-stone-50 text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Phone Number (Cell) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (647) 555-0123"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#0F2942] focus:bg-white bg-stone-50 text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#0F2942] focus:bg-white bg-stone-50 text-stone-900 focus:outline-none"
                />
              </div>

            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Confidential • No Obligation</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                    <span>Analyzing Solds...</span>
                  </>
                ) : (
                  <>
                    <span>Get Free Home Valuation</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
