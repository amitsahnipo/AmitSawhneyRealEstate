import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, CheckCircle2, Phone, Download, Mail, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { Project } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { validateEmail, validatePhone, validateName, formatPhoneNumber } from '../utils/validation';
import { useAuth } from '../context/AuthContext';

interface VIPFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject?: Project | null;
  projects: Project[];
  onClientRegistered?: (client: { fullName: string; email: string; phone: string }) => void;
}

export const VIPForm: React.FC<VIPFormProps> = ({
  isOpen,
  onClose,
  selectedProject,
  projects,
  onClientRegistered
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    projectId: selectedProject?.id || '',
    buyerType: 'End User' as 'End User' | 'Investor' | 'First-Time Buyer',
    desiredType: '1 Bed + Den',
    budgetRange: '$500,000 - $650,000',
    preferredTiming: 'Immediate VIP Launch',
    comments: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ fullName?: boolean; email?: boolean; phone?: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        projectId: selectedProject?.id || prev.projectId,
        fullName: prev.fullName || user?.fullName || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || user?.phone || ''
      }));
      setSuccessResult(null);
      setErrorMsg('');
    }
  }, [isOpen, selectedProject, user]);

  const handleNameChange = (val: string) => {
    setFormData(prev => ({ ...prev, fullName: val }));
    if (errorMsg) setErrorMsg('');
    if (touched.fullName || val.length > 1) {
      const res = validateName(val, 'Full name', true);
      setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
    }
  };

  const handleEmailChange = (val: string) => {
    setFormData(prev => ({ ...prev, email: val }));
    if (errorMsg) setErrorMsg('');
    if (touched.email || val.length > 3) {
      const res = validateEmail(val, true);
      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errorMsg) setErrorMsg('');
    if (touched.phone || val.length > 4) {
      const res = validatePhone(formatted, true);
      setErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true });

    const nameCheck = validateName(formData.fullName, 'Full name', true);
    const emailCheck = validateEmail(formData.email, true);
    const phoneCheck = validatePhone(formData.phone, true);

    const newErrors = {
      fullName: nameCheck.isValid ? undefined : nameCheck.error,
      email: emailCheck.isValid ? undefined : emailCheck.error,
      phone: phoneCheck.isValid ? undefined : phoneCheck.error,
    };
    setErrors(newErrors);

    if (!nameCheck.isValid || !emailCheck.isValid || !phoneCheck.isValid) {
      setErrorMsg(nameCheck.error || emailCheck.error || phoneCheck.error || 'Please correct the invalid inputs.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const chosenProject = projects.find(p => p.id === formData.projectId) || selectedProject;

      const res = await fetch('/api/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectName: chosenProject?.name || 'General Ontario Pre-Construction VIP List'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register interest.');
      }

      setSuccessResult(data);
      if (onClientRegistered) {
        onClientRegistered({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-stone-900 relative">
        
        {/* Header Bar */}
        <div className="bg-[#0F2942] p-6 border-b border-[#1E3A8A] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C5A880] font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Platinum VIP Registration Access</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white font-serif">
            {selectedProject ? `Register Interest for ${selectedProject.name}` : 'Register for Ontario Pre-Construction VIP Package'}
          </h2>

          <p className="text-stone-300 text-xs mt-1">
            Licensed Realtor Representation by <strong className="text-white">{AMIT_SAWHNEY.name}</strong> • Phone: <strong className="text-[#C5A880]">{AMIT_SAWHNEY.phoneFormatted}</strong>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-white">
          {successResult ? (
            /* Success Summary Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[#111827] font-serif">VIP Registration Confirmed!</h3>
                <p className="text-stone-600 text-xs mt-1 max-w-md mx-auto">
                  Thank you <strong className="text-[#8C6D43]">{formData.fullName}</strong>. Your Platinum VIP registration was submitted successfully.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Assigned Licensed REALTOR®:</span>
                  <span className="font-bold text-stone-900">{AMIT_SAWHNEY.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Direct Phone:</span>
                  <a href={`tel:${AMIT_SAWHNEY.phone}`} className="font-bold text-[#8C6D43] hover:underline">
                    {AMIT_SAWHNEY.phoneFormatted}
                  </a>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Buyer Service Fee:</span>
                  <span className="font-extrabold text-emerald-600">$0 (Paid by Developer)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Contract Safety:</span>
                  <span className="font-semibold text-[#0F2942]">10-Day Statutory Cooling Off Period</span>
                </div>
              </div>

              <div className="bg-[#0F2942]/5 border border-[#0F2942]/15 p-4 rounded-xl text-left text-xs space-y-2">
                <p className="font-bold text-[#0F2942]">What Happens Next?</p>
                <ul className="space-y-1 text-stone-600 list-disc list-inside">
                  <li>Amit Sawhney will contact you at <strong className="text-stone-900">{formData.phone}</strong> with confidential price sheets & floor plan PDFs.</li>
                  <li>You will receive priority access before public sales launch.</li>
                  <li>Assistance with deposit schedules, capped levies, and 10-day contract review with a lawyer.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`tel:${AMIT_SAWHNEY.phone}`}
                  className="w-full sm:w-auto px-6 py-3 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Amit Now: {AMIT_SAWHNEY.phoneFormatted}</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors border border-stone-200"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Select Project */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Select Pre-Construction Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                >
                  <option value="">General Pre-Construction VIP Priority List (All Projects)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location.city}) — {p.priceRange.display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name, Email, Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={formData.fullName}
                    onChange={e => handleNameChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, fullName: true }));
                      const res = validateName(formData.fullName, 'Full name', true);
                      setErrors(prev => ({ ...prev, fullName: res.isValid ? undefined : res.error }));
                    }}
                    className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-stone-900 focus:outline-none placeholder-stone-400 transition-colors ${
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

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      const res = validateEmail(formData.email, true);
                      setErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                    }}
                    className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-stone-900 focus:outline-none placeholder-stone-400 transition-colors ${
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
                    className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-stone-900 focus:outline-none placeholder-stone-400 transition-colors ${
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
              </div>

              {/* Buyer Type, Unit Type, Budget Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Buying Intent</label>
                  <select
                    value={formData.buyerType}
                    onChange={e => setFormData({ ...formData, buyerType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  >
                    <option value="End User">End User (Personal Home)</option>
                    <option value="Investor">Real Estate Investor</option>
                    <option value="First-Time Buyer">First-Time Home Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Desired Layout</label>
                  <select
                    value={formData.desiredType}
                    onChange={e => setFormData({ ...formData, desiredType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  >
                    <option value="1 Bed">1 Bedroom Suite</option>
                    <option value="1 Bed + Den">1 Bed + Den Suite</option>
                    <option value="2 Bedroom">2 Bedroom Suite</option>
                    <option value="3 Bedroom / Penthouse">3 Bed / Penthouse</option>
                    <option value="Townhome">Townhome / Stacked Town</option>
                    <option value="Detached Home">Detached Single Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Budget Range</label>
                  <select
                    value={formData.budgetRange}
                    onChange={e => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  >
                    <option value="Under $500,000">Under $500,000</option>
                    <option value="$500,000 - $650,000">$500,000 - $650,000</option>
                    <option value="$650,000 - $800,000">$650,000 - $800,000</option>
                    <option value="$800,000 - $1,000,000">$800,000 - $1,000,000</option>
                    <option value="$1,000,000+">$1,000,000+</option>
                  </select>
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Specific Questions or Floor Plan Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Looking for a north-facing 1B+D under $600k with parking, interested in extended deposit options..."
                  value={formData.comments}
                  onChange={e => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white placeholder-stone-400"
                />
              </div>

              {/* Disclosure Note */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                <p>
                  By registering, you consent to receive direct communication regarding pre-construction pricing and floor plans from <strong className="text-stone-900">Amit Sawhney, Licensed Realtor in Ontario</strong> (Phone: 647-895-3613). Your information is confidential and will never be shared.
                </p>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting Registration...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Access Platinum VIP Package & Floor Plans</span>
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
