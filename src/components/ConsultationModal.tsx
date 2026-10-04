import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Clock, CheckCircle2, ShieldCheck, User, AlertCircle } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';
import { validateEmail, validatePhone, validateName, formatPhoneNumber } from '../utils/validation';
import { useAuth } from '../context/AuthContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    preferredDate: '',
    preferredTime: 'Morning (10am - 12pm)',
    topic: 'General Pre-Construction Strategy',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ fullName?: boolean; email?: boolean; phone?: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user?.fullName || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || user?.phone || ''
      }));
      setSuccess(false);
      setFormError('');
      setErrors({});
    }
  }, [isOpen, user]);

  const handleNameChange = (val: string) => {
    setFormData(prev => ({ ...prev, fullName: val }));
    if (formError) setFormError('');
    if (touched.fullName || val.length > 1) {
      const res = validateName(val, 'Full name', true);
      setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (formError) setFormError('');
    if (touched.phone || val.length > 4) {
      const res = validatePhone(formatted, true);
      setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  const handleEmailChange = (val: string) => {
    setFormData(prev => ({ ...prev, email: val }));
    if (formError) setFormError('');
    if (touched.email || val.length > 3) {
      const res = validateEmail(val, false);
      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, phone: true, email: true });

    const nameCheck = validateName(formData.fullName, 'Full name', true);
    const phoneCheck = validatePhone(formData.phone, true);
    const emailCheck = validateEmail(formData.email, false);

    const newErrors = {
      fullName: nameCheck.isValid ? undefined : nameCheck.error,
      phone: phoneCheck.isValid ? undefined : phoneCheck.error,
      email: emailCheck.isValid ? undefined : emailCheck.error,
    };
    setErrors(newErrors);

    if (!nameCheck.isValid || !phoneCheck.isValid || !emailCheck.isValid) {
      setFormError(nameCheck.error || phoneCheck.error || emailCheck.error || 'Please correct the invalid inputs.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setFormError('Failed to schedule consultation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-900 relative">
        
        {/* Header */}
        <div className="bg-[#0F2942] p-6 border-b border-[#1E3A8A] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C5A880] font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Private REALTOR® Advisory Session</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white font-serif">
            Schedule a Call with {AMIT_SAWHNEY.name}
          </h2>

          <p className="text-stone-300 text-xs mt-1">
            Licensed Realtor in Ontario • Phone: <a href={`tel:${AMIT_SAWHNEY.phone}`} className="text-[#C5A880] font-bold hover:underline">{AMIT_SAWHNEY.phoneFormatted}</a>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] font-serif">Consultation Requested!</h3>
              <p className="text-xs text-stone-600">
                Amit Sawhney will call you directly at <strong className="text-[#8C6D43]">{formData.phone}</strong> to confirm your appointment for <strong className="text-stone-900">{formData.preferredDate || 'the requested date'}</strong>.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs rounded-xl uppercase tracking-wider transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Miller"
                  value={formData.fullName}
                  onChange={e => handleNameChange(e.target.value)}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, fullName: true }));
                    const res = validateName(formData.fullName, 'Full name', true);
                    setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
                  }}
                  className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-stone-900 focus:outline-none transition-colors ${
                    errors.fullName
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-[#0F2942] focus:bg-white'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(647) 000-0000"
                    value={formData.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, phone: true }));
                      const res = validatePhone(formData.phone, true);
                      setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
                    }}
                    className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-stone-900 focus:outline-none transition-colors ${
                      errors.phone
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-stone-300 focus:border-[#0F2942] focus:bg-white'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      const res = validateEmail(formData.email, false);
                      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                    }}
                    className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-stone-900 focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-stone-300 focus:border-[#0F2942] focus:bg-white'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Preferred Time Window</label>
                  <select
                    value={formData.preferredTime}
                    onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  >
                    <option value="Morning (10am - 12pm)">Morning (10am - 12pm)</option>
                    <option value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</option>
                    <option value="Evening (5pm - 8pm)">Evening (5pm - 8pm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Consultation Topic</label>
                <select
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                >
                  <option value="General Pre-Construction Strategy">General Pre-Construction Buying Strategy</option>
                  <option value="10-Day Cooling Off Contract Review">10-Day Cooling-Off Period Contract Review</option>
                  <option value="Real Estate Investor Portfolio">Real Estate Investor & ROI Analysis</option>
                  <option value="Assignment Sales & Occupancy">Assignment Sales & Occupancy Rules</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                {submitting ? 'Requesting Appointment...' : 'Confirm Call Request with Amit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
