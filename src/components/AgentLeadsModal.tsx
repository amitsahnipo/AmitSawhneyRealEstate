import React, { useEffect, useState } from 'react';
import { X, UserCheck, Phone, Mail, Download, RefreshCw, Building2, ShieldCheck, Lock, UserPlus, Users, FileText, CheckCircle2, Copy, AlertCircle, Sparkles, DollarSign, Check, Edit3, ArrowRight } from 'lucide-react';
import { VIPRegistration, ClientWorksheet, AuthUser, ClientInvitation, CashbackInquiry, CashbackDealStatus } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/cashback';

interface AgentLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentLeadsModal: React.FC<AgentLeadsModalProps> = ({ isOpen, onClose }) => {
  const { isAgent, user, getAuthHeaders, openAuthModal, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'worksheets' | 'invite' | 'cashback'>('leads');
  const [leads, setLeads] = useState<VIPRegistration[]>([]);
  const [clients, setClients] = useState<AuthUser[]>([]);
  const [worksheets, setWorksheets] = useState<ClientWorksheet[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [cashbackDeals, setCashbackDeals] = useState<CashbackInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Deal edit state
  const [editingDeal, setEditingDeal] = useState<CashbackInquiry | null>(null);
  const [dealStatusInput, setDealStatusInput] = useState<CashbackDealStatus>('Inquiry');
  const [dealAmountInput, setDealAmountInput] = useState<string>('');
  const [dealNotesInput, setDealNotesInput] = useState<string>('');
  const [dealPaymentRefInput, setDealPaymentRefInput] = useState<string>('');
  const [dealUpdating, setDealUpdating] = useState<boolean>(false);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ token: string; link: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAgentData = async () => {
    if (!isAgent) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch leads
      const leadsRes = await fetch('/api/registrations', {
        headers: getAuthHeaders()
      });
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.registrations || []);
      } else if (leadsRes.status === 403 || leadsRes.status === 401) {
        setError('Agent authentication credentials required.');
      }

      // 2. Fetch clients and worksheets overview
      const overviewRes = await fetch('/api/agent/overview', {
        headers: getAuthHeaders()
      });
      if (overviewRes.ok) {
        const ovData = await overviewRes.json();
        setClients(ovData.clients || []);
        setInvitations(ovData.invitations || []);
        setWorksheets(ovData.worksheets || []);
      }

      // 3. Fetch Cashback Deals
      const cbRes = await fetch('/api/cashback/deals', {
        headers: getAuthHeaders()
      });
      if (cbRes.ok) {
        const cbData = await cbRes.json();
        setCashbackDeals(cbData.deals || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch agent CRM data', err);
      setError('Unable to load agent data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDeal = (deal: CashbackInquiry) => {
    setEditingDeal(deal);
    setDealStatusInput(deal.status);
    setDealAmountInput(deal.confirmedCashbackAmount ? String(deal.confirmedCashbackAmount) : String(deal.estimatedCashback));
    setDealNotesInput(deal.notes || '');
    setDealPaymentRefInput(deal.paymentReference || '');
  };

  const handleSaveDealUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    setDealUpdating(true);
    try {
      const res = await fetch(`/api/cashback/deals/${editingDeal.id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: dealStatusInput,
          confirmedCashbackAmount: parseFloat(dealAmountInput) || undefined,
          notes: dealNotesInput,
          paymentReference: dealPaymentRefInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCashbackDeals(prev => prev.map(d => d.id === editingDeal.id ? data.deal : d));
        setEditingDeal(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update deal');
      }
    } catch (err) {
      console.error('Failed to update deal', err);
      alert('Error saving deal update.');
    } finally {
      setDealUpdating(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAgent) {
      fetchAgentData();
    }
  }, [isOpen, isAgent]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/invite-client', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: inviteName,
          email: inviteEmail,
          phone: invitePhone
        })
      });

      const data = await res.json();
      setInviteLoading(false);

      if (res.ok && data.invitation) {
        const fullLink = `${window.location.origin}${window.location.pathname}${data.activationLink}`;
        setInviteResult({
          token: data.invitation.token,
          link: fullLink
        });
        setInviteName('');
        setInviteEmail('');
        setInvitePhone('');
        fetchAgentData(); // Refresh invitation list
      } else {
        setError(data.error || 'Failed to generate invitation.');
      }
    } catch (err: any) {
      setInviteLoading(false);
      setError(err.message || 'Invitation request failed.');
    }
  };

  const handleCopyLink = () => {
    if (inviteResult?.link) {
      navigator.clipboard.writeText(inviteResult.link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Date', 'Name', 'Phone', 'Email', 'Project', 'Buyer Type', 'Desired Unit', 'Budget', 'Comments'];
    const rows = leads.map(l => [
      new Date(l.createdAt).toLocaleDateString(),
      `"${l.fullName}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.projectName || 'General VIP'}"`,
      `"${l.buyerType}"`,
      `"${l.desiredType}"`,
      `"${l.budgetRange}"`,
      `"${(l.comments || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blueprint_realty_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // 1. GATED VIEW IF NOT SIGNED IN AS AGENT
  if (!isAgent) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
        <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-stone-900 relative">
          <div className="bg-[#0F2942] p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] mx-auto flex items-center justify-center mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-serif">Agent CRM Access Restricted</h3>
            <p className="text-xs text-stone-300 mt-1">
              Brokerage Lead & Client Management Portal
            </p>
          </div>

          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-stone-600">
              This area contains proprietary VIP lead data, builder worksheets, and client contact information. Access is restricted to licensed agent <strong>Amit Sawhney</strong>.
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500">
              Pre-seeded agent credentials available: <br />
              <code className="text-[#0F2942] font-bold">truecondodeal@gmail.com</code> / <code className="text-[#0F2942] font-bold">BlueprintVIP2026!</code>
            </div>

            <button
              onClick={() => {
                onClose();
                openAuthModal({ role: 'AGENT', tab: 'login' });
              }}
              className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Sign In as Agent (Amit Sawhney)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED AGENT CRM PORTAL
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-stone-900 relative">
        
        {/* Header */}
        <div className="bg-[#0F2942] p-5 border-b border-[#1E3A8A] flex flex-wrap items-center justify-between gap-3 shrink-0 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white font-serif">
                  Agent Lead & Client Center
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A880] text-[#0F2942]">
                  RECO Verified
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {user?.fullName || AMIT_SAWHNEY.name} ({user?.email}) • Hotline: {AMIT_SAWHNEY.phoneFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAgentData}
              className="p-2 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-[#0F2942] hover:bg-[#153a5c] border border-[#C5A880]/60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-[#C5A880]" />
              <span className="hidden sm:inline">Export Leads CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-5 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'leads'
                ? 'border-[#0F2942] text-[#0F2942] font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>VIP Leads ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'clients'
                ? 'border-[#0F2942] text-[#0F2942] font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Accounts ({clients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('worksheets')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'worksheets'
                ? 'border-[#0F2942] text-[#0F2942] font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Builder Worksheets ({worksheets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cashback')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'cashback'
                ? 'border-amber-500 text-amber-900 font-extrabold bg-amber-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>Cashback Deals ({cashbackDeals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'invite'
                ? 'border-[#C5A880] text-[#0F2942] font-bold bg-[#C5A880]/10'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#8C6D43]" />
            <span className="text-[#8C6D43]">Invite New Client</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-stone-50">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: VIP LEADS */}
          {activeTab === 'leads' && (
            <div>
              {loading ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  Loading buyer registrations...
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  No registered leads found.
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map(lead => (
                    <div key={lead.id} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2 text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <div>
                          <span className="bg-[#C5A880]/20 text-[#8C6D43] px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 border border-[#C5A880]/40">
                            {lead.buyerType}
                          </span>
                          <strong className="text-stone-900 text-sm font-serif">{lead.fullName}</strong>
                        </div>
                        <span className="text-[11px] text-stone-400">
                          Registered: {new Date(lead.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#8C6D43]" />
                          <a href={`tel:${lead.phone}`} className="font-bold text-stone-900 hover:underline">{lead.phone}</a>
                        </p>
                        <p className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#0F2942]" />
                          <span className="truncate">{lead.email}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#0F2942]" />
                          <span className="truncate font-semibold text-[#8C6D43]">{lead.projectName}</span>
                        </p>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
                        <span>Desired: <strong className="text-stone-900">{lead.desiredType}</strong></span>
                        <span>Budget: <strong className="text-emerald-700">{lead.budgetRange}</strong></span>
                        {lead.comments && (
                          <span className="text-stone-600 italic truncate max-w-xs">"{lead.comments}"</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTERED CLIENTS ROSTER */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-600">
                  Clients registered directly or via agent invitation with active portal credentials.
                </p>
                <button
                  onClick={() => setActiveTab('invite')}
                  className="px-3 py-1.5 bg-[#0F2942] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#153a5c]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite New</span>
                </button>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  No registered client accounts found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clients.map(cl => (
                    <div key={cl.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm font-serif">{cl.fullName}</h4>
                          <p className="text-xs text-stone-500">{cl.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cl.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 space-y-1 pt-1 border-t border-stone-100">
                        {cl.phone && <p>Phone: <strong>{cl.phone}</strong></p>}
                        <p className="text-[11px] text-stone-400">
                          Joined: {new Date(cl.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {invitations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Pending / Historical Invitations
                  </h4>
                  <div className="space-y-2">
                    {invitations.map(inv => (
                      <div key={inv.id} className="bg-stone-100/80 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-800">{inv.fullName}</span> ({inv.email})
                          <div className="text-[10px] text-stone-400">
                            Sent: {new Date(inv.createdAt).toLocaleDateString()} • Status: {inv.used ? 'Activated' : 'Pending Activation'}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.used ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {inv.used ? 'Used' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WORKSHEET SUBMISSIONS */}
          {activeTab === 'worksheets' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                Official builder worksheet requests submitted by authenticated clients for allocation review.
              </p>

              {worksheets.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  No worksheet submissions received yet.
                </div>
              ) : (
                worksheets.map(ws => (
                  <div key={ws.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                      <div>
                        <span className="text-xs font-bold text-[#8C6D43] bg-[#C5A880]/15 px-2 py-0.5 rounded mr-2">
                          {ws.projectName}
                        </span>
                        <strong className="text-stone-900 text-sm">{ws.buyerName}</strong>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {ws.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                      <div>
                        <span className="text-stone-400 block text-[11px]">Primary Unit Choice:</span>
                        <strong className="text-stone-900">{ws.unitChoice1}</strong>
                      </div>
                      {ws.unitChoice2 && (
                        <div>
                          <span className="text-stone-400 block text-[11px]">Secondary Unit Choice:</span>
                          <strong className="text-stone-900">{ws.unitChoice2}</strong>
                        </div>
                      )}
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2">
                      <span>Deposit Status: <strong className="text-emerald-700">{ws.depositStatus}</strong></span>
                      {ws.coolingOffPeriodEnd && (
                        <span className="text-[11px] text-amber-700">
                          10-Day Cooling Off Ends: {new Date(ws.coolingOffPeriodEnd).toLocaleDateString()}
                        </span>
                      )}
                      <span>Buyer: <a href={`mailto:${ws.email}`} className="text-[#0F2942] underline">{ws.email}</a></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: INVITE NEW CLIENT */}
          {activeTab === 'invite' && (
            <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-base font-serif text-stone-900">Send VIP Client Invitation</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Generate a secure activation link allowing your client to create an account and unlock reserved builder worksheets.
                </p>
              </div>

              {inviteResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VIP Invitation Created Successfully!</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Send this private activation link to your client:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteResult.link}
                      className="w-full text-xs font-mono bg-white p-2 rounded border border-emerald-300 text-stone-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Activation token: <code className="font-mono bg-white px-1 py-0.5 rounded">{inviteResult.token}</code> (Valid for 48 hours).
                  </p>
                </div>
              )}

              <form onSubmit={handleSendInvite} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Client Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Client Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={invitePhone}
                    onChange={e => setInvitePhone(e.target.value)}
                    placeholder="(416) 555-0188"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {inviteLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-[#C5A880]" />
                      <span>Generate VIP Invitation</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 5. CASHBACK DEALS PIPELINE TAB */}
          {activeTab === 'cashback' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <p className="text-[10px] uppercase font-bold text-stone-500">Active Deals</p>
                  <p className="text-2xl font-black text-stone-900 font-serif mt-1">{cashbackDeals.length}</p>
                  <p className="text-[10px] text-stone-400">Total cashback inquiries</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                  <p className="text-[10px] uppercase font-bold text-stone-500">Pipeline Volume</p>
                  <p className="text-xl font-black text-[#0F2942] font-serif mt-1">
                    {formatCurrency(cashbackDeals.reduce((sum, d) => sum + (d.purchasePrice || 0), 0))}
                  </p>
                  <p className="text-[10px] text-stone-400">Target property value</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
                  <p className="text-[10px] uppercase font-bold text-amber-800">Total Rebates</p>
                  <p className="text-xl font-black text-amber-900 font-serif mt-1">
                    {formatCurrency(cashbackDeals.reduce((sum, d) => sum + (d.confirmedCashbackAmount || d.estimatedCashback || 0), 0))}
                  </p>
                  <p className="text-[10px] text-amber-700">Estimated buyer payouts</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Closed & Disbursed</p>
                  <p className="text-2xl font-black text-emerald-900 font-serif mt-1">
                    {cashbackDeals.filter(d => d.status === 'Cashback Paid').length}
                  </p>
                  <p className="text-[10px] text-emerald-700">Completed closings</p>
                </div>
              </div>

              {/* Deals Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 font-serif text-sm">
                      Buy Smart, Save Big™ Deal Management
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Track buyer eligibility, representation agreements, and closing disbursements.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {cashbackDeals.length} Total Records
                  </span>
                </div>

                {cashbackDeals.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <DollarSign className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="text-sm font-semibold text-stone-700">No cashback inquiries recorded yet</p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Inquiries submitted through the homepage calculator or property pages will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 overflow-x-auto">
                    {cashbackDeals.map((deal) => {
                      const getStatusBadge = (st: CashbackDealStatus) => {
                        switch (st) {
                          case 'Cashback Paid':
                            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                          case 'Cashback Processing':
                          case 'Firm Closing Pending':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          case 'Agreement Signed':
                          case 'Transaction in Progress':
                            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                          case 'Eligibility Confirmed':
                            return 'bg-amber-100 text-amber-900 border-amber-300';
                          case 'Ineligible':
                            return 'bg-red-100 text-red-800 border-red-200';
                          default:
                            return 'bg-stone-100 text-stone-700 border-stone-200';
                        }
                      };

                      return (
                        <div key={deal.id} className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-stone-900 font-bold text-sm">{deal.fullName}</strong>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(deal.status)}`}>
                                {deal.status}
                              </span>
                              <span className="text-stone-400 text-[10px]">
                                {new Date(deal.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-stone-600 flex-wrap">
                              <a href={`mailto:${deal.email}`} className="hover:text-[#0F2942] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-stone-400" />
                                <span>{deal.email}</span>
                              </a>
                              <a href={`tel:${deal.phone}`} className="hover:text-[#0F2942] flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                <span>{deal.phone}</span>
                              </a>
                            </div>

                            <p className="text-stone-700 font-medium">
                              Target: <span className="font-bold text-stone-900">{deal.targetProjectOrArea || 'Unspecified'}</span> ({deal.transactionType}) • Timeframe: {deal.purchaseTimeframe}
                            </p>

                            {deal.paymentReference && (
                              <p className="text-[10px] text-emerald-700 font-mono">
                                Payment Ref: {deal.paymentReference}
                              </p>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 w-full sm:w-auto">
                            <div className="text-right">
                              <p className="text-[10px] text-stone-400 uppercase font-bold">Purchase / Rebate</p>
                              <p className="text-sm font-extrabold text-stone-900 font-mono">
                                {formatCurrency(deal.purchasePrice)}
                              </p>
                              <p className="text-xs font-black text-amber-900 font-mono">
                                Rebate: {formatCurrency(deal.confirmedCashbackAmount || deal.estimatedCashback)}
                              </p>
                            </div>

                            <button
                              onClick={() => handleOpenEditDeal(deal)}
                              className="px-3 py-1.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                              <span>Manage Deal</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Deal Modal Overlay */}
          {editingDeal && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="font-bold text-base text-stone-900 font-serif">
                      Update Deal & Cashback Status
                    </h3>
                    <p className="text-xs text-stone-500">
                      Client: <strong>{editingDeal.fullName}</strong> ({editingDeal.targetProjectOrArea})
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingDeal(null)}
                    className="p-2 hover:bg-stone-100 rounded-xl text-stone-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveDealUpdate} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Deal Lifecycle Status</label>
                    <select
                      value={dealStatusInput}
                      onChange={e => setDealStatusInput(e.target.value as CashbackDealStatus)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                    >
                      <option value="Inquiry">Inquiry (New Lead)</option>
                      <option value="Eligibility Pending">Eligibility Pending (Reviewing Representation)</option>
                      <option value="Eligibility Confirmed">Eligibility Confirmed (Eligible for Rebate)</option>
                      <option value="Agreement Signed">Agreement Signed (Buyer Representation Agreement Executed)</option>
                      <option value="Transaction in Progress">Transaction in Progress (APS Executed with Builder)</option>
                      <option value="Firm Closing Pending">Firm Closing Pending (Cooling-off & Due Diligence Cleared)</option>
                      <option value="Cashback Processing">Cashback Processing (Co-op Commission Received by Brokerage)</option>
                      <option value="Cashback Paid">Cashback Paid (Disbursed to Client)</option>
                      <option value="Ineligible">Ineligible (Already represented by other brokerage)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Purchase Price ($)</label>
                      <input
                        type="text"
                        disabled
                        value={formatCurrency(editingDeal.purchasePrice)}
                        className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Confirmed Rebate Amount ($)</label>
                      <input
                        type="number"
                        step="100"
                        value={dealAmountInput}
                        onChange={e => setDealAmountInput(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                        placeholder="e.g. 10000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Payment / Wire Transfer Reference</label>
                    <input
                      type="text"
                      value={dealPaymentRefInput}
                      onChange={e => setDealPaymentRefInput(e.target.value)}
                      placeholder="e.g. Wire Ref #BP-98214 disbursed via RBC Trust"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Deal Notes & Conditions</label>
                    <textarea
                      rows={3}
                      value={dealNotesInput}
                      onChange={e => setDealNotesInput(e.target.value)}
                      placeholder="Notes on builder co-op commission rate, schedule A rebate terms, lender consent..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDeal(null)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dealUpdating}
                      className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {dealUpdating ? 'Saving...' : 'Save Updates'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
