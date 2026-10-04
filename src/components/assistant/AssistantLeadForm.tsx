import React, { useState } from 'react';
import { ShieldCheck, Phone, Mail, User, Clock, DollarSign, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { AMIT_SAWHNEY } from '../../data/agent';
import { validateEmail, validatePhone, validateName, formatPhoneNumber } from '../../utils/validation';

interface AssistantLeadFormProps {
  initialValues?: {
    buyerType?: string;
    budget?: string;
    timeline?: string;
    targetLocation?: string;
  };
  onSubmitSuccess: (lead: any) => void;
  onCancel?: () => void;
  activeContext?: {
    projectId?: string;
    projectName?: string;
  };
}

export const AssistantLeadForm: React.FC<AssistantLeadFormProps> = ({
  initialValues,
  onSubmitSuccess,
  onCancel,
  activeContext
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [buyerType, setBuyerType] = useState(initialValues?.buyerType || 'First-Time Buyer');
  const [budgetRange, setBudgetRange] = useState(initialValues?.budget || '$600,000 - $850,000');
  const [timeframe, setTimeframe] = useState(initialValues?.timeline || '1 to 3 Months');
  const [workingWithRealtor, setWorkingWithRealtor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});
  const [touched, setTouched] = useState<{ fullName?: boolean; phone?: boolean; email?: boolean }>({});

  const handleNameChange = (val: string) => {
    setFullName(val);
    if (error) setError('');
    if (touched.fullName || val.length > 1) {
      const res = validateName(val, 'Full name', true);
      setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setPhone(formatted);
    if (error) setError('');
    if (touched.phone || val.length > 4) {
      const res = validatePhone(formatted, true);
      setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError('');
    if (touched.email || val.length > 3) {
      const res = validateEmail(val, false);
      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, phone: true, email: true });

    const nameCheck = validateName(fullName, 'Full name', true);
    const phoneCheck = validatePhone(phone, true);
    const emailCheck = validateEmail(email, false);

    const newErrors = {
      fullName: nameCheck.isValid ? undefined : nameCheck.error,
      phone: phoneCheck.isValid ? undefined : phoneCheck.error,
      email: emailCheck.isValid ? undefined : emailCheck.error,
    };
    setErrors(newErrors);

    if (!nameCheck.isValid || !phoneCheck.isValid || !emailCheck.isValid) {
      setError(nameCheck.error || phoneCheck.error || emailCheck.error || 'Please provide valid contact information.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/ai-assistant/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          buyerType,
          budgetRange,
          timeframe,
          workingWithRealtor,
          associatedProjectId: activeContext?.projectId,
          associatedProjectName: activeContext?.projectName,
          targetLocation: initialValues?.targetLocation || 'GTA & Durham Region'
        })
      });

      const data = await res.json();
      if (res.ok && data.lead) {
        setSubmitted(true);
        onSubmitSuccess(data.lead);
      } else {
        setError(data.error || 'Failed to submit information.');
      }
    } catch (err: any) {
      setError('Network error. Please call Amit directly at (647) 895-3613.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 my-2 text-center animate-fadeIn">
        <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="font-extrabold text-sm text-emerald-900 font-serif">
          VIP Registration Received!
        </h4>
        <p className="text-xs text-emerald-800 mt-1">
          Thank you, <strong>{fullName}</strong>. Amit Sawhney will personally reach out via call/text at <strong>{phone}</strong> with confidential pricing and floor plans.
        </p>
        <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-center gap-2">
          <a
            href={`tel:${AMIT_SAWHNEY.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2942] text-white rounded-lg text-xs font-bold shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Call Amit Now ({AMIT_SAWHNEY.phoneFormatted})</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 sm:p-4 my-2 text-stone-900 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0F2942] text-[#C5A880] flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F2942]">
              {activeContext?.projectName ? `VIP Package for ${activeContext.projectName}` : 'Request VIP Price List & Floor Plans'}
            </h4>
            <p className="text-[10px] text-stone-500">
              Direct from Amit Sawhney, Licensed REALTOR® • 100% Free Service
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-[11px] text-stone-400 hover:text-stone-600"
          >
            Skip
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
            Your Full Name *
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={e => handleNameChange(e.target.value)}
              onBlur={() => {
                setTouched(prev => ({ ...prev, fullName: true }));
                const res = validateName(fullName, 'Full name', true);
                setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
              }}
              placeholder="e.g. Alex Johnson"
              className={`w-full pl-8 pr-2.5 py-1.5 bg-white border rounded-lg text-xs outline-none transition-colors ${
                errors.fullName
                  ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-stone-300 focus:ring-1 focus:ring-[#0F2942]'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[10px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
              Phone Number (for Floor Plans) *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, phone: true }));
                  const res = validatePhone(phone, true);
                  setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
                }}
                placeholder="(647) 000-0000"
                className={`w-full pl-8 pr-2.5 py-1.5 bg-white border rounded-lg text-xs outline-none transition-colors ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-stone-300 focus:ring-1 focus:ring-[#0F2942]'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[10px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, email: true }));
                  const res = validateEmail(email, false);
                  setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                }}
                placeholder="alex@example.com"
                className={`w-full pl-8 pr-2.5 py-1.5 bg-white border rounded-lg text-xs outline-none transition-colors ${
                  errors.email
                    ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-stone-300 focus:ring-1 focus:ring-[#0F2942]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Timeframe & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
              Purchase Timeframe
            </label>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as any)}
              className="w-full py-1.5 px-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0F2942] outline-none"
            >
              <option value="Immediate (0-30 days)">Immediate (0-30 days)</option>
              <option value="1 to 3 Months">1 to 3 Months</option>
              <option value="3 to 6 Months">3 to 6 Months</option>
              <option value="6 to 12 Months">6 to 12 Months</option>
              <option value="Exploring">Just Exploring</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
              Estimated Budget
            </label>
            <select
              value={budgetRange}
              onChange={e => setBudgetRange(e.target.value)}
              className="w-full py-1.5 px-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0F2942] outline-none"
            >
              <option value="Under $600,000">Under $600,000</option>
              <option value="$600,000 - $850,000">$600,000 - $850,000</option>
              <option value="$850,000 - $1,200,000">$850,000 - $1,200,000</option>
              <option value="$1,200,000+">$1,200,000+</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>

        {/* RECO Representation Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={workingWithRealtor}
              onChange={e => setWorkingWithRealtor(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-[#0F2942] focus:ring-[#0F2942]"
            />
            <span className="text-[10px] text-stone-500 leading-tight">
              I am currently under a signed representation agreement with another Ontario real estate brokerage. (If checked, per RECO rules we provide informational materials only).
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2 px-3 bg-[#0F2942] hover:bg-[#1a4168] text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <span>Securing VIP Access...</span>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Receive Floor Plans & VIP Pricing</span>
              <ArrowRight className="w-3 h-3 text-[#C5A880]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
