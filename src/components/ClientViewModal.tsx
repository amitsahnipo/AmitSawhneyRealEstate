import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, Download, FileText, Sparkles, Building2, User, Phone, Mail, ArrowRight, Layers, FileCode, Clock, Check, AlertCircle, LogIn, DollarSign, Award } from 'lucide-react';
import { Project, FloorPlan } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { useAuth } from '../context/AuthContext';
import { calculateCashback, formatCurrency } from '../utils/cashback';

export interface RegisteredClient {
  fullName: string;
  email: string;
  phone?: string;
}

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  registeredClient: RegisteredClient | null;
  onRegisterClient: (client: RegisteredClient) => void;
  onOpenVIPModal: (projectId?: string) => void;
}

export const ClientViewModal: React.FC<ClientViewModalProps> = ({
  isOpen,
  onClose,
  project,
  registeredClient,
  onRegisterClient,
  onOpenVIPModal,
}) => {
  const { isAuthenticated, isClient, isAgent, user, openAuthModal, getAuthHeaders } = useAuth();

  const effectiveClient: RegisteredClient | null = user
    ? { fullName: user.fullName, email: user.email, phone: user.phone }
    : registeredClient;

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [quickUnlockError, setQuickUnlockError] = useState('');

  // Active tab inside Client View
  const [activeTab, setActiveTab] = useState<'worksheet' | 'floorplans' | 'documents' | 'reserve' | 'cashback'>('worksheet');
  
  // Selected unit for reservation
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [reservationNotes, setReservationNotes] = useState('');
  const [reservationSent, setReservationSent] = useState(false);
  const [reservationSaving, setReservationSaving] = useState(false);

  if (!isOpen || !project) return null;

  // Generate sample live inventory units for this project
  const mockUnits = (project.floorPlans || []).flatMap((fp, idx) => [
    {
      unitNumber: `${(idx + 2) * 100 + 4}`,
      floor: `${idx + 2}nd Floor`,
      model: fp.name,
      type: fp.type,
      sqft: fp.sqft,
      price: fp.startingPrice,
      exposure: idx % 2 === 0 ? 'South / Sunset View' : 'East / Park View',
      status: 'Available',
      deposit: project.depositStructure[0]?.stage || '5% in 30 Days'
    },
    {
      unitNumber: `${(idx + 5) * 100 + 12}`,
      floor: `${idx + 5}th Floor`,
      model: fp.name,
      type: fp.type,
      sqft: fp.sqft + 15,
      price: `$${(parseInt(fp.startingPrice.replace(/[^0-9]/g, '')) + 15000).toLocaleString()}`,
      exposure: 'North / City Skyline',
      status: 'On Hold',
      deposit: project.depositStructure[0]?.stage || '5% in 30 Days'
    }
  ]);

  const handleQuickUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setQuickUnlockError('Please enter a valid email address.');
      return;
    }
    const clientName = nameInput.trim() || 'Registered Client';
    onRegisterClient({
      fullName: clientName,
      email: emailInput.trim(),
      phone: phoneInput.trim()
    });
    setQuickUnlockError('');
  };

  const handleSendReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservationSaving(true);
    setReservationSent(true);

    if (isAuthenticated && isClient) {
      try {
        await fetch('/api/client/worksheets', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            projectId: project.id,
            projectName: project.name,
            unitChoice1: selectedUnit
              ? `Suite ${selectedUnit.unitNumber} - ${selectedUnit.model} (${selectedUnit.price})`
              : 'Suite Allocation Request',
            floorPlanName: selectedUnit?.model,
            notes: reservationNotes
          })
        });
      } catch (err) {
        console.error('Worksheet submission error:', err);
      }
    }

    setReservationSaving(false);
    setTimeout(() => {
      setReservationSent(false);
      setSelectedUnit(null);
      setReservationNotes('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-900 relative">
        
        {/* Top Header Bar */}
        <div className="bg-[#0F2942] p-5 border-b border-[#1E3A8A] flex items-center justify-between shrink-0 relative text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">
                  Verified Client View Portal
                </span>
                <span className="px-2 py-0.5 bg-white/10 text-stone-200 text-[10px] font-semibold rounded border border-white/20">
                  {project.builder}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-serif">
                {project.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY AREA */}
        {!effectiveClient ? (
          /* ================= UNREGISTERED CLIENT LOCK GATE ================= */
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto flex flex-col justify-center max-w-2xl mx-auto text-center space-y-6">
            
            <div className="w-20 h-20 rounded-3xl bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#8C6D43] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-serif">
                Client Portal Sign In Required
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                The <strong className="text-stone-900">Client View Portal</strong> for <span className="text-[#8C6D43] font-semibold">{project.name}</span> contains confidential developer inventory worksheets, live price lists, builder deposit terms, and unit allocation controls.
              </p>
            </div>

            {/* Quick Auth Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto w-full">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal({ role: 'CLIENT', tab: 'login' });
                }}
                className="py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#C5A880]" />
                <span>Sign In as Client</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal({ role: 'CLIENT', tab: 'register' });
                }}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#8C6D43]" />
                <span>Create VIP Account</span>
              </button>
            </div>

            {/* Quick Unlock Form or Full VIP Form Link */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-left space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F2942] border-b border-stone-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#8C6D43]" />
                <span>Quick Guest Access (Instant Preview)</span>
              </div>

              {quickUnlockError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {quickUnlockError}
                </div>
              )}

              <form onSubmit={handleQuickUnlock} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] placeholder-stone-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Full Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Sarah Johnson"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] placeholder-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="(647) 000-0000"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] placeholder-stone-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#C5A880]" />
                  <span>Quick Unlock Client View</span>
                </button>
              </form>
            </div>

            <div className="text-left text-[11px] text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Licensed REALTOR® Representation by <strong className="text-stone-900">{AMIT_SAWHNEY.name}</strong> ({AMIT_SAWHNEY.phoneFormatted}). Confidential & zero buyer fee.</span>
            </div>
          </div>
        ) : (
          /* ================= REGISTERED CLIENT VIEW PORTAL ================= */
          <div className="flex-1 overflow-y-auto flex flex-col bg-white">
            
            {/* Registered Client Status Strip */}
            <div className="bg-stone-100 px-6 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-stone-500">
                  {isAgent ? 'Agent Preview Mode:' : 'Verified Client Account:'}
                </span>
                <strong className="text-stone-900 font-semibold">{effectiveClient.fullName}</strong>
                <span className="text-stone-400">({effectiveClient.email})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 hidden sm:inline">
                  Represented by: <strong>{AMIT_SAWHNEY.name}</strong>
                </span>
                <button
                  onClick={() => {
                    onRegisterClient(null as any);
                    openAuthModal({ role: 'CLIENT', tab: 'login' });
                  }}
                  className="text-[#8C6D43] hover:underline text-[11px] font-semibold"
                >
                  Switch Account
                </button>
              </div>
            </div>

            {/* Portal Navigation Tabs */}
            <div className="bg-stone-50 border-b border-stone-200 px-6 pt-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('worksheet')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'worksheet'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Live Allocation Worksheet</span>
              </button>

              <button
                onClick={() => setActiveTab('floorplans')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'floorplans'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Floor Plan Package</span>
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'documents'
                    ? 'bg-[#0F2942] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Builder Documentation</span>
              </button>

              <button
                onClick={() => setActiveTab('reserve')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'reserve'
                    ? 'bg-[#0F2942] text-white shadow-sm border border-[#C5A880]'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Request Unit Allocation</span>
              </button>

              <button
                onClick={() => setActiveTab('cashback')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'cashback'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
                    : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                <span>Buy Smart Cashback</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 space-y-6 flex-1 bg-stone-50">
              
              {activeTab === 'worksheet' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#111827] font-serif">
                        Real-Time Unit Allocation Worksheet
                      </h3>
                      <p className="text-xs text-stone-500">
                        Live status and VIP starting prices for {project.name}. Select a suite to reserve your unit allocation.
                      </p>
                    </div>

                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-[11px] font-bold shrink-0">
                      Platinum Release Active
                    </span>
                  </div>

                  {/* Worksheet Table */}
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Suite #</th>
                          <th className="p-3">Model Name</th>
                          <th className="p-3">Layout</th>
                          <th className="p-3">Sq.Ft.</th>
                          <th className="p-3">VIP Price</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {mockUnits.map((unit, idx) => (
                          <tr key={idx} className="hover:bg-stone-50 transition-colors">
                            <td className="p-3 font-bold text-stone-900">Unit #{unit.unitNumber} ({unit.floor})</td>
                            <td className="p-3 text-stone-700">{unit.model}</td>
                            <td className="p-3 text-[#8C6D43] font-semibold">{unit.type}</td>
                            <td className="p-3 text-stone-600">{unit.sqft} sq.ft.</td>
                            <td className="p-3 font-extrabold text-stone-900">{unit.price}</td>
                            <td className="p-3">
                              {unit.status === 'Available' ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                  Available
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                                  Pending Hold
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedUnit(unit);
                                  setActiveTab('reserve');
                                }}
                                className="px-3 py-1 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-lg font-bold text-[11px] shadow-xs"
                              >
                                Reserve Suite
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
                    💡 <strong>Client Note:</strong> Unit allocations are processed on a first-come, first-served worksheet basis upon submission to builder sales office.
                  </p>
                </div>
              )}

              {activeTab === 'floorplans' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#111827] font-serif">
                        Confidential VIP Floor Plan Package
                      </h3>
                      <p className="text-xs text-stone-500">
                        Detailed floor plan schematics with room dimensions and orientation details.
                      </p>
                    </div>

                    <button
                      onClick={() => alert(`Floor Plan PDF package for ${project.name} has been initiated for download.`)}
                      className="px-3 py-1.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Download Full PDF Package</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.floorPlans.map(fp => (
                      <div key={fp.id} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <h4 className="text-sm font-bold text-stone-900 font-serif">{fp.name}</h4>
                          <span className="text-xs font-bold text-[#8C6D43]">{fp.type}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                          <div>
                            <span className="text-stone-400">Total Area:</span> <strong className="text-stone-800">{fp.sqft} Sq.Ft.</strong>
                          </div>
                          <div>
                            <span className="text-stone-400">Bathrooms:</span> <strong className="text-stone-800">{fp.bathrooms} Baths</strong>
                          </div>
                          <div>
                            <span className="text-stone-400">Starting Price:</span> <strong className="text-stone-900">{fp.startingPrice}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400">Balcony / Outdoor:</span> <strong className="text-stone-800">Included</strong>
                          </div>
                        </div>

                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-stone-700">
                          <p className="font-semibold text-stone-900 mb-1">Architectural Features:</p>
                          <ul className="grid grid-cols-2 gap-1 list-disc list-inside text-stone-600">
                            {fp.features.map((ft, i) => (
                              <li key={i}>{ft}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] font-serif">
                      Official Developer Legal & Sales Documents
                    </h3>
                    <p className="text-xs text-stone-500">
                      Access official documentation provided for registered clients for {project.name}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
                      <FileText className="w-6 h-6 text-[#0F2942] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-900">Full Builder Brochure & Site Plan</p>
                        <p className="text-[11px] text-stone-500">Includes master plan lot maps, building orientation, and amenity renderings.</p>
                        <button
                          onClick={() => alert(`Brochure PDF for ${project.name} opened.`)}
                          className="text-xs font-bold text-[#8C6D43] hover:underline pt-1 inline-block"
                        >
                          View Document PDF →
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
                      <FileText className="w-6 h-6 text-[#8C6D43] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-900">Capped Development Levies & Incentives Agreement</p>
                        <p className="text-[11px] text-stone-500">Written guarantee of capped levies and free assignment rights.</p>
                        <button
                          onClick={() => alert(`Incentives PDF for ${project.name} opened.`)}
                          className="text-xs font-bold text-[#8C6D43] hover:underline pt-1 inline-block"
                        >
                          View Document PDF →
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
                      <FileText className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-900">Deposit Milestone Breakdown</p>
                        <p className="text-[11px] text-stone-500">Full timeline of staggered deposit payments over construction period.</p>
                        <button
                          onClick={() => alert(`Deposit Schedule PDF for ${project.name} opened.`)}
                          className="text-xs font-bold text-[#8C6D43] hover:underline pt-1 inline-block"
                        >
                          View Document PDF →
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-xs">
                      <FileText className="w-6 h-6 text-[#0F2942] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-900">10-Day Statutory Cooling Off Guide</p>
                        <p className="text-[11px] text-stone-500">Ontario Condominium Act legal protection checklist for buyers.</p>
                        <button
                          onClick={() => alert(`Legal Guide PDF for ${project.name} opened.`)}
                          className="text-xs font-bold text-[#8C6D43] hover:underline pt-1 inline-block"
                        >
                          View Document PDF →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reserve' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-[#111827] font-serif">
                      Submit Worksheet & Reserve Unit Allocation
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Direct developer submission for <strong className="text-stone-900">{project.name}</strong> handled by Realtor Amit Sawhney.
                    </p>
                  </div>

                  {reservationSent ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-stone-900 font-serif">Unit Reservation Request Received!</h4>
                      <p className="text-xs text-stone-600">
                        Thank you <strong className="text-stone-900">{registeredClient.fullName}</strong>. Amit Sawhney will review your unit request for {project.name} and contact you at {registeredClient.email} to finalize worksheet submission.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendReservation} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 text-xs shadow-xs">
                      {selectedUnit && (
                        <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="text-stone-500">Selected Unit:</p>
                            <p className="font-bold text-stone-900">Unit #{selectedUnit.unitNumber} ({selectedUnit.model} - {selectedUnit.type})</p>
                          </div>
                          <div className="text-right">
                            <p className="text-stone-900 font-extrabold">{selectedUnit.price}</p>
                            <p className="text-[10px] text-stone-500">{selectedUnit.sqft} sq.ft.</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">Registered Client Name</label>
                        <input
                          type="text"
                          disabled
                          value={registeredClient.fullName}
                          className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-700"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">Email & Contact Phone</label>
                        <input
                          type="text"
                          disabled
                          value={`${registeredClient.email} ${registeredClient.phone ? '• ' + registeredClient.phone : ''}`}
                          className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-700"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Floor Preference, Alternate Model Choices, or Parking/Locker Requests
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Prefer 5th floor or higher, east exposure, require 1 parking spot and 1 locker..."
                          value={reservationNotes}
                          onChange={e => setReservationNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0F2942] placeholder-stone-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-colors"
                      >
                        Submit VIP Unit Reservation Request
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'cashback' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  {/* Hero Box */}
                  <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Buy Smart, Save Big™ Commission Cashback Protection</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                      Your Exclusive Cashback on {project.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      As a registered buyer represented by Amit Sawhney (REALTOR®, Blueprint Realty), you qualify for a legal commission cashback rebate paid directly upon completed closing.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-amber-500/20">
                      <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                        <p className="text-[10px] uppercase font-bold text-stone-500">Project Starting Tier</p>
                        <p className="text-base font-extrabold text-stone-900 font-serif">{project.priceRange.display}</p>
                      </div>
                      <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300">
                        <p className="text-[10px] uppercase font-bold text-amber-900">Estimated Cashback</p>
                        <p className="text-base font-extrabold text-amber-950 font-serif">
                          Up to {formatCurrency(calculateCashback(project.priceRange.min, 'Pre-Construction').estimatedCashback)}*
                        </p>
                      </div>
                      <div className="bg-[#0F2942] text-white p-3 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-[#C5A880]">Combined Value Advantage</p>
                        <p className="text-base font-extrabold text-white font-serif">
                          ~{formatCurrency(calculateCashback(project.priceRange.min, 'Pre-Construction').totalBuyerBenefit)}*
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5 Milestone Step Tracker */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0F2942]" />
                      <span>Cashback Release & Transaction Roadmap</span>
                    </h4>

                    <div className="space-y-3">
                      {[
                        {
                          step: 1,
                          title: 'Eligibility Verification & Consultation',
                          desc: 'Amit Sawhney verifies you are not under an existing exclusive agreement with another brokerage in compliance with RECO regulations.',
                          status: 'Ready'
                        },
                        {
                          step: 2,
                          title: 'Rebate Schedule Added to Buyer Representation Agreement',
                          desc: 'The exact percentage and cashback terms are memorialized in writing in your formal representation agreement.',
                          status: 'Documentation'
                        },
                        {
                          step: 3,
                          title: 'Worksheet Submission & Agreement of Purchase and Sale (APS)',
                          desc: 'VIP unit allocation secured with builder with full Platinum incentives locked in.',
                          status: 'Incentives Locked'
                        },
                        {
                          step: 4,
                          title: '10-Day Cooling-off Period & Legal Document Review',
                          desc: 'Independent lawyer review and Tarion warranty inspection completed before firm deal.',
                          status: 'Due Diligence'
                        },
                        {
                          step: 5,
                          title: 'Final Closing & Cashback Disbursement',
                          desc: 'Upon final closing and receipt of builder co-op commission by Blueprint Realty, rebate is wired to your bank.',
                          status: 'Payout'
                        }
                      ].map(item => (
                        <div key={item.step} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                          <div className="w-6 h-6 rounded-full bg-[#0F2942] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {item.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-stone-900">{item.title}</p>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 shrink-0">
                                {item.status}
                              </span>
                            </div>
                            <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECO Compliance Notice */}
                  <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 leading-relaxed space-y-1">
                    <p className="font-bold text-stone-800">RECO & Ontario Real Estate Regulatory Notice:</p>
                    <p>
                      Cashback rebates are paid exclusively to the represented buyer following completion of the transaction and receipt of co-operating brokerage commission. Lender approval may be required. This program is not intended to solicit buyers currently under an active, exclusive representation agreement with another brokerage.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
