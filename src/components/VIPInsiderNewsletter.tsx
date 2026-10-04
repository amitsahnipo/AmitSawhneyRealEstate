import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  User, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  FileText, 
  DollarSign, 
  Send,
  AlertCircle
} from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';
import { validateEmail, validateName } from '../utils/validation';

interface VIPInsiderNewsletterProps {
  onOpenVIPModal?: () => void;
  onOpenConsultationModal?: () => void;
  onNavigate?: (page: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings') => void;
}

const REGION_OPTIONS = [
  { id: 'all', label: 'All GTA & Durham' },
  { id: 'whitby', label: 'Whitby & Brooklin' },
  { id: 'oshawa', label: 'Oshawa & Courtice' },
  { id: 'pickering', label: 'Pickering & Ajax' },
  { id: 'condos', label: 'VIP Condos' },
  { id: 'freehold', label: 'Freehold Towns & Detached' }
];

export const VIPInsiderNewsletter: React.FC<VIPInsiderNewsletterProps> = ({
  onOpenVIPModal,
  onOpenConsultationModal,
  onNavigate
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All GTA & Durham');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [benefitsList, setBenefitsList] = useState<string[]>([]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errorMessage) setErrorMessage('');
    if (emailTouched || val.length > 3) {
      const res = validateEmail(val, true);
      setEmailError(res.isValid ? '' : res.error || '');
    }
  };

  const handleNameChange = (val: string) => {
    setFirstName(val);
    if (errorMessage) setErrorMessage('');
    if (nameTouched || val.length > 1) {
      const res = validateName(val, 'First name', false);
      setNameError(res.isValid ? '' : res.error || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setEmailTouched(true);
    setNameTouched(true);

    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error || 'Please enter a valid email address.');
      setErrorMessage(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    const nameCheck = validateName(firstName, 'First name', false);
    if (!nameCheck.isValid) {
      setNameError(nameCheck.error || 'Please enter a valid name.');
      setErrorMessage(nameCheck.error || 'Please enter a valid name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          preferredRegion: selectedRegion,
          propertyInterest: selectedRegion,
          source: 'footer-vip-insider'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to subscribe at this moment. Please try again.');
      }

      setIsSuccess(true);
      setBenefitsList(data.benefits || [
        'Instant launch alerts 48–72 hours prior to public MLS® listing',
        'Confidential builder price lists & deposit schedules',
        'Direct access to Platinum VIP worksheet allocations',
        '$0 buyer representation with Ontario REALTOR® Amit Sawhney'
      ]);

      // Cache subscriber state locally
      try {
        localStorage.setItem('vip_insider_subscriber', JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          region: selectedRegion,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        // Safe fallback if local storage is restricted
      }

    } catch (err: any) {
      console.error('VIP Insider signup error:', err);
      setErrorMessage(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setEmail('');
    setFirstName('');
    setErrorMessage('');
  };

  return (
    <section 
      id="vip-insider-list" 
      aria-label="VIP Insider List Newsletter"
      className="relative overflow-hidden bg-[#0F2942] text-white border border-[#C5A880]/40 rounded-none shadow-xl"
    >
      {/* Subtle architectural background motifs */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-[#C5A880]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full bg-[#5B6964]/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-[11px] font-bold uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VIP Insider Confirmed</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {firstName ? `Welcome to the Insider List, ${firstName}!` : "You're on the VIP Insider List!"}
              </h3>
              <p className="text-stone-300 text-sm max-w-xl mx-auto leading-relaxed">
                We have registered <strong className="text-white underline">{email}</strong> for priority alerts for <strong className="text-[#C5A880]">{selectedRegion}</strong>. You'll receive confidential pricing, floor plans, and worksheet links 48–72 hours before public launch.
              </p>
            </div>

            {/* Guaranteed Perks Pill Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-2xl mx-auto">
              {benefitsList.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 bg-white/5 border border-white/10 text-xs text-stone-200">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('preconstruction')}
                  className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Explore Active VIP Launches</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {onOpenConsultationModal && (
                <button
                  onClick={onOpenConsultationModal}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Book Strategy Call With Amit</span>
                </button>
              )}
              <button
                onClick={handleReset}
                className="text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer px-3 py-2"
              >
                Register another email
              </button>
            </div>
          </div>
        ) : (
          /* DEFAULT SIGNUP FORM STATE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition & Urgency */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em]">
                <Bell className="w-3.5 h-3.5 text-[#C5A880] animate-pulse" />
                <span>Exclusive Developer First-Access</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Join the <span className="text-[#C5A880]">VIP Insider List</span> for New Launch Alerts
              </h3>

              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Be the first to know when new master-planned communities and high-demand developments open in Whitby, Brooklin, Oshawa, and across the Greater Toronto Area. Receive confidential builder pricing, floor plans, and platinum worksheet access before public MLS® listing.
              </p>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-stone-300 text-xs">
                <div className="flex items-start gap-2 bg-white/5 p-2.5 border border-white/10">
                  <Clock className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white text-[11px]">48–72h Priority</strong>
                    <span className="text-[10px] text-stone-400">Before general public</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/5 p-2.5 border border-white/10">
                  <FileText className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white text-[11px]">VIP Floor Plans</strong>
                    <span className="text-[10px] text-stone-400">& deposit schedules</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/5 p-2.5 border border-white/10">
                  <DollarSign className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white text-[11px]">$0 Buyer Fee</strong>
                    <span className="text-[10px] text-stone-400">Paid by builder</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Lead Capture Form */}
            <div className="lg:col-span-6 bg-white/[0.04] border border-white/15 p-6 sm:p-8 backdrop-blur-xs text-left">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Interest / Region Pill Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-[0.18em] mb-2">
                    Select Your Preferred Launch Focus:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {REGION_OPTIONS.map(opt => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedRegion(opt.label)}
                        className={`px-2.5 py-1 text-[11px] font-medium tracking-wide transition-all cursor-pointer ${
                          selectedRegion === opt.label
                            ? 'bg-[#C5A880] text-stone-950 font-bold shadow-xs'
                            : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white border border-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  {/* First Name */}
                  <div className="sm:col-span-5 relative">
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Your First Name"
                        value={firstName}
                        onChange={e => handleNameChange(e.target.value)}
                        onBlur={() => {
                          setNameTouched(true);
                          if (firstName.trim()) {
                            const res = validateName(firstName, 'First name', false);
                            setNameError(res.isValid ? '' : res.error || '');
                          }
                        }}
                        className={`w-full pl-10 pr-3 py-3 bg-white/10 border text-white placeholder-stone-400 text-xs focus:outline-none transition-all ${
                          nameError 
                            ? 'border-rose-400 focus:border-rose-400 focus:bg-rose-500/10' 
                            : 'border-white/20 focus:border-[#C5A880] focus:bg-white/15'
                        }`}
                      />
                    </div>
                    {nameError && (
                      <p className="text-[11px] text-rose-300 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{nameError}</span>
                      </p>
                    )}
                  </div>

                  {/* Email Address (Required) */}
                  <div className="sm:col-span-7 relative">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="Your Email Address *"
                        value={email}
                        onChange={e => handleEmailChange(e.target.value)}
                        onBlur={() => {
                          setEmailTouched(true);
                          const res = validateEmail(email, true);
                          setEmailError(res.isValid ? '' : res.error || '');
                        }}
                        className={`w-full pl-10 pr-3 py-3 bg-white/10 border text-white placeholder-stone-400 text-xs focus:outline-none transition-all ${
                          emailError 
                            ? 'border-rose-400 focus:border-rose-400 focus:bg-rose-500/10' 
                            : 'border-white/20 focus:border-[#C5A880] focus:bg-white/15'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-[11px] text-rose-300 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#C5A880] hover:bg-[#B89758] active:scale-[0.99] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Securing VIP Access...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-stone-950" />
                      <span>Get VIP Launch Alerts</span>
                    </>
                  )}
                </button>

                {/* Trust & Privacy Badges */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>TRESA Compliant • CASL Certified</span>
                  </span>
                  <span className="text-stone-400">
                    Strictly confidential. No spam. 1-click unsubscribe anytime.
                  </span>
                </div>

              </form>
            </div>

          </div>
        )}
      </div>
    </section>
  );
};
