import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Maximize, Car, DollarSign, Calendar, ShieldCheck, Heart, Phone, Mail, Share2, CheckCircle2, Calculator, Sparkles, ArrowRight } from 'lucide-react';
import { ResaleListing } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { calculateCashback, formatCurrency } from '../utils/cashback';

interface ResaleModalProps {
  listing: ResaleListing | null;
  onClose: () => void;
  onOpenConsultation: (topic?: string, notes?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Resale' }) => void;
}

export const ResaleModal: React.FC<ResaleModalProps> = ({
  listing,
  onClose,
  onOpenConsultation,
  isFavorite,
  onToggleFavorite,
  onOpenCashbackEligibility
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!listing) return null;

  const cashbackEst = calculateCashback(listing.price, 'Resale');
  const images = listing.galleryImages && listing.galleryImages.length > 0 ? listing.galleryImages : [listing.image];

  // Quick mortgage estimate calculation (20% down, 4.64% 5-yr fixed, 25 yr amortization)
  const downPayment = listing.price * 0.2;
  const loanAmount = listing.price - downPayment;
  const monthlyRate = 0.0464 / 12;
  const numPayments = 25 * 12;
  const estMonthlyMortgage = Math.round(
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto relative">
        
        {/* Sticky Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
              {listing.propertyType}
            </span>
            <span className="text-xs text-slate-500 font-mono">MLS® {listing.mlsNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Save to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-white">
          
          {/* Main Gallery Carousel */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-[#0F2942]/90 backdrop-blur-md text-[#C5A880] border border-[#0F2942] rounded-lg text-xs font-bold">
                  {listing.status}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-[#0F2942] scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Address Block */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F2942] mb-1">
                <MapPin className="w-4 h-4 text-[#8C6D43]" />
                <span>{listing.address}, {listing.city}, Ontario ({listing.region}) {listing.postalCode && `• ${listing.postalCode}`}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-serif">
                {listing.title}
              </h2>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-stone-500 font-medium">Asking Price</p>
              <div className="text-3xl font-black text-[#111827] font-sans tracking-tight">
                {listing.priceDisplay}
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Taxes: {listing.annualTaxes}</p>
            </div>
          </div>

          {/* Key Specs Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-stone-700 border border-stone-200">
                <Bed className="w-5 h-5 text-[#0F2942]" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Bedrooms</p>
                <p className="text-sm font-extrabold text-stone-900">{listing.bedrooms} Beds</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-stone-700 border border-stone-200">
                <Bath className="w-5 h-5 text-[#0F2942]" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Bathrooms</p>
                <p className="text-sm font-extrabold text-stone-900">{listing.bathrooms} Baths</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-stone-700 border border-stone-200">
                <Maximize className="w-5 h-5 text-[#0F2942]" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Living Space</p>
                <p className="text-sm font-extrabold text-stone-900">{listing.sqft} sq.ft.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-stone-700 border border-stone-200">
                <Car className="w-5 h-5 text-[#0F2942]" />
              </div>
              <div>
                <p className="text-xs text-stone-500">Garage & Parking</p>
                <p className="text-sm font-extrabold text-stone-900">{listing.garageSpaces} Garage Spot{listing.garageSpaces > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-[#111827]">Property Description</h3>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            <h3 className="text-lg font-bold font-serif text-[#111827] pt-2">Key Features & Upgrades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {listing.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Smart, Save Big Cashback Banner */}
          {cashbackEst.isEligiblePrice && (
            <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-amber-500 text-stone-950 rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
                    <span>Buy Smart, Save Big™ Commission Cashback</span>
                  </div>
                  <p className="text-xl font-black text-amber-900 font-serif">
                    Up to {formatCurrency(cashbackEst.estimatedCashback)}* Cash Back
                  </p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Buy this property through Amit Sawhney REALTOR® and receive full fiduciary representation, inspection negotiation, plus cashback upon closing.
                  </p>
                </div>
              </div>

              {onOpenCashbackEligibility && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCashbackEligibility({
                      purchasePrice: listing.price,
                      targetProject: `${listing.address}, ${listing.city}`,
                      transactionType: 'Resale'
                    });
                  }}
                  className="shrink-0 px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Monthly Payment Preview Estimator */}
          <div className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#0F2942] text-white rounded-xl shadow-sm">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">Estimated Monthly Mortgage</p>
                <p className="text-xl font-black text-[#0F2942] font-serif">${estMonthlyMortgage.toLocaleString()} / mo</p>
                <p className="text-[11px] text-stone-500">Based on 20% down (${downPayment.toLocaleString()}), 25-yr amort. at current 4.64% fixed.</p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenConsultation(`Mortgage Pre-Approval for ${listing.address}`, `Estimated price: ${listing.priceDisplay}`);
              }}
              className="shrink-0 px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              Get Pre-Approved
            </button>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-[#0F2942] border-t border-[#1E3A8A] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={AMIT_SAWHNEY.photo}
              alt={AMIT_SAWHNEY.name}
              className="w-10 h-10 rounded-full object-cover border border-[#C5A880]"
            />
            <div>
              <p className="text-xs font-bold text-white">{AMIT_SAWHNEY.name} • Licensed REALTOR®</p>
              <p className="text-[11px] text-stone-300">Zero Buyer Representation Fee (Paid by Seller)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-stone-100 font-bold text-xs rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Call (647) 895-3613</span>
            </a>
            
            <button
              onClick={() => {
                onClose();
                onOpenConsultation(`Private Tour for ${listing.address}`, `MLS: ${listing.mlsNumber}`);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-extrabold text-xs rounded-xl shadow-sm transition-colors"
            >
              Book Private Showing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
