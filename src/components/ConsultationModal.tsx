import React, { useState } from 'react';
import { X, Calendar, Phone, Clock, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: 'Morning (10am - 12pm)',
    topic: 'General Pre-Construction Strategy',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    setSubmitting(true);
    try {
      await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
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
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Miller"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(647) 000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] focus:bg-white"
                  />
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
