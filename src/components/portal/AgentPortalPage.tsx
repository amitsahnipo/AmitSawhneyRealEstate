import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  UserCheck,
  Phone,
  Mail,
  Download,
  RefreshCw,
  Building2,
  ShieldCheck,
  Lock,
  UserPlus,
  Users,
  FileText,
  CheckCircle2,
  Copy,
  AlertCircle,
  Sparkles,
  DollarSign,
  Check,
  Edit3,
  ArrowRight,
  Bot,
  FileCheck2,
  Calendar,
  Home,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  LogOut,
  ArrowLeft,
  FolderLock,
  FileSpreadsheet
} from 'lucide-react';
import { VIPRegistration, ClientWorksheet, AuthUser, ClientInvitation, CashbackInquiry, CashbackDealStatus } from '../../types';
import { AMIT_SAWHNEY } from '../../data/agent';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/cashback';
import { validateEmail, validatePhone, validateName, formatPhoneNumber } from '../../utils/validation';
import { AgentMarketDataManager, SubView } from '../AgentMarketDataManager';
import { AgentAILeadsTab } from '../assistant/AgentAILeadsTab';
import { AgentOffersWorkflowTab } from '../qualification/AgentOffersWorkflowTab';
import { AgentShowingsWorkflowTab } from '../qualification/AgentShowingsWorkflowTab';
import { AgentDocumentVaultTab } from './AgentDocumentVaultTab';

export type AgentPortalTab =
  | 'market-data'
  | 'ai-leads'
  | 'offers'
  | 'showings'
  | 'leads'
  | 'clients'
  | 'documents'
  | 'worksheets'
  | 'invite'
  | 'cashback';

interface AgentPortalPageProps {
  onNavigateHome: () => void;
  initialTab?: AgentPortalTab;
}

export const AgentPortalPage: React.FC<AgentPortalPageProps> = ({
  onNavigateHome,
  initialTab = 'market-data'
}) => {
  const { isAgent, user, getAuthHeaders, openAuthModal, logout, login } = useAuth();

  const [activeTab, setActiveTab] = useState<AgentPortalTab>(initialTab);
  const [leads, setLeads] = useState<VIPRegistration[]>([]);
  const [clients, setClients] = useState<AuthUser[]>([]);
  const [worksheets, setWorksheets] = useState<ClientWorksheet[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [cashbackDeals, setCashbackDeals] = useState<CashbackInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);
  const [marketDataSubView, setMarketDataSubView] = useState<SubView>('overview');

  // Search & Filter state for leads & clients
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Preselected client for Document Vault direct sharing
  const [preselectedVaultClientId, setPreselectedVaultClientId] = useState<string | null>(null);

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
  const [inviteErrors, setInviteErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [inviteTouched, setInviteTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});

  // Sync initial tab when changed externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleInviteNameChange = (val: string) => {
    setInviteName(val);
    if (inviteTouched.name || val.length > 1) {
      const res = validateName(val, 'Legal name', true);
      setInviteErrors(prev => ({ ...prev, name: res.isValid ? undefined : res.error }));
    }
  };

  const handleInviteEmailChange = (val: string) => {
    setInviteEmail(val);
    if (inviteTouched.email || val.length > 3) {
      const res = validateEmail(val, true);
      setInviteErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  const handleInvitePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setInvitePhone(formatted);
    if (inviteTouched.phone || val.length > 4) {
      const res = validatePhone(formatted, false);
      setInviteErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

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

  useEffect(() => {
    if (isAgent) {
      fetchAgentData();
    }
  }, [isAgent]);

  const handleDemoAgentSignIn = async () => {
    setDemoLoginLoading(true);
    try {
      await login('truecondodeal@gmail.com', 'BlueprintVIP2026!');
    } catch (err) {
      console.error('Demo agent login error:', err);
    } finally {
      setDemoLoginLoading(false);
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

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteTouched({ name: true, email: true, phone: true });

    const nameCheck = validateName(inviteName, 'Legal name', true);
    const emailCheck = validateEmail(inviteEmail, true);
    const phoneCheck = validatePhone(invitePhone, false);

    const newErrors = {
      name: nameCheck.isValid ? undefined : nameCheck.error,
      email: emailCheck.isValid ? undefined : emailCheck.error,
      phone: phoneCheck.isValid ? undefined : phoneCheck.error,
    };
    setInviteErrors(newErrors);

    if (!nameCheck.isValid || !emailCheck.isValid || !phoneCheck.isValid) {
      setError(nameCheck.error || emailCheck.error || phoneCheck.error || 'Please correct the invalid inputs.');
      return;
    }

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
        fetchAgentData();
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
      l?.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
      `"${l?.fullName || ''}"`,
      `"${l?.phone || ''}"`,
      `"${l?.email || ''}"`,
      `"${l?.projectName || 'General VIP'}"`,
      `"${l?.buyerType || ''}"`,
      `"${l?.desiredType || ''}"`,
      `"${l?.budgetRange || ''}"`,
      `"${(l?.comments || '').replace(/"/g, '""')}"`
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

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      !searchQuery ||
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.phone && l.phone.includes(searchQuery));
    const matchesProj = projectFilter === 'all' || l.projectId === projectFilter;
    return matchesSearch && matchesProj;
  });

  // Unique projects from leads
  const leadProjects = Array.from(new Set(leads.map(l => l.projectName || 'General VIP')));

  // =========================================================================
  // VIEW: GATED SCREEN IF NOT LOGGED IN AS AGENT
  // =========================================================================
  if (!isAgent) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto w-full space-y-8 my-auto">
          {/* Back button */}
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </button>

          <div className="bg-stone-950 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] flex items-center justify-center shrink-0">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A880] block">
                  RESTRICTED BROKERAGE ACCESS
                </span>
                <h1 className="text-2xl font-serif font-bold text-white">
                  Agent CRM & Intelligence Portal
                </h1>
              </div>
            </div>

            <p className="text-stone-300 text-sm leading-relaxed">
              This area is dedicated to licensed broker <strong>Amit Sawhney</strong> (RE/MAX Rouge River Realty Ltd.). It manages live market intelligence for the <strong>Durham Region section</strong>, client offers, pre-construction worksheets, and buyer registrations.
            </p>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#C5A880] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Pre-Seeded Agent Access Available:</span>
              </div>
              <div className="text-stone-300 font-mono text-xs">
                Email: <span className="text-white font-bold">truecondodeal@gmail.com</span><br />
                Password: <span className="text-white font-bold">BlueprintVIP2026!</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleDemoAgentSignIn}
                disabled={demoLoginLoading}
                className="w-full py-3.5 px-4 bg-[#C5A880] hover:bg-[#b5956a] text-stone-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5 text-stone-950" />
                <span>{demoLoginLoading ? 'Signing in as Amit Sawhney...' : 'One-Click Sign In as Amit Sawhney'}</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal({ role: 'AGENT', tab: 'login' })}
                className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In with Custom Agent Credentials</span>
              </button>
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <span>RE/MAX Rouge River Realty Ltd.</span>
              <button onClick={onNavigateHome} className="text-[#C5A880] hover:underline">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED AGENT PORTAL (FULL WEBPAGE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-24" id="agent-portal-page">
      {/* Top Header Navigation Bar */}
      <header className="bg-[#0F2942] text-white border-b border-[#1E3A8A] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Left: Branding & Agent Details */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={onNavigateHome}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer shrink-0"
                title="Return to Public Website"
              >
                <Home className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-serif font-extrabold text-white truncate">
                    Agent Command Center
                  </h1>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A880] text-stone-950 uppercase">
                    RECO Verified
                  </span>
                </div>
                <p className="text-xs text-stone-300 truncate">
                  {user?.fullName || AMIT_SAWHNEY.name} • {AMIT_SAWHNEY.brokerage}
                </p>
              </div>
            </div>

            {/* Right: Quick Global Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={fetchAgentData}
                disabled={loading}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh All Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>

              <button
                onClick={exportCSV}
                className="px-3 py-2 bg-[#C5A880] hover:bg-[#b5956a] text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Export Leads CSV"
              >
                <Download className="w-3.5 h-3.5 text-stone-950" />
                <span className="hidden md:inline">Export Leads</span>
              </button>

              <button
                onClick={() => logout()}
                className="p-2.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-xl transition-colors cursor-pointer text-xs"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="bg-[#0b1f32] border-t border-white/10 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 whitespace-nowrap min-w-max">
            
            {/* TAB 1: INTELLIGENT REAL ESTATE INSIGHTS & MARKET DATA */}
            <button
              onClick={() => setActiveTab('market-data')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'market-data'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Intelligent Real Estate Insights (Durham)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                activeTab === 'market-data' ? 'bg-stone-950 text-[#C5A880]' : 'bg-[#C5A880] text-stone-950'
              }`}>
                Live
              </span>
            </button>

            {/* TAB 2: AI LEADS & CONCIERGE */}
            <button
              onClick={() => setActiveTab('ai-leads')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ai-leads'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Chat Leads & Concierge</span>
            </button>

            {/* TAB 3: SUBMITTED OFFERS */}
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Submitted Offers</span>
            </button>

            {/* TAB 4: PRIVATE SHOWINGS */}
            <button
              onClick={() => setActiveTab('showings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'showings'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Showings & Tours</span>
            </button>

            {/* TAB 5: LEADS */}
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>VIP Registrations</span>
              {leads.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-stone-800 text-stone-200">
                  {leads.length}
                </span>
              )}
            </button>

            {/* TAB 6: CLIENTS */}
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>VIP Clients & Buying Power</span>
              {clients.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-stone-800 text-stone-200">
                  {clients.length}
                </span>
              )}
            </button>

            {/* TAB 7: DOCUMENT VAULT & DIGITAL SIGNATURES */}
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>Document Vault & Contracts</span>
            </button>

            {/* TAB 8: WORKSHEETS */}
            <button
              onClick={() => setActiveTab('worksheets')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'worksheets'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Allocations & Worksheets</span>
              {worksheets.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-stone-800 text-stone-200">
                  {worksheets.length}
                </span>
              )}
            </button>

            {/* TAB 8: INVITE CLIENTS */}
            <button
              onClick={() => setActiveTab('invite')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'invite'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Clients</span>
            </button>

            {/* TAB 9: CASHBACK DEALS */}
            <button
              onClick={() => setActiveTab('cashback')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'cashback'
                  ? 'bg-[#C5A880] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Cashback Rebates (1%)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB 1: INTELLIGENT REAL ESTATE INSIGHTS: DURHAM REGION & TRREB DATA MANAGER */}
        {activeTab === 'market-data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#8C6D43] block">
                  TRREB & DurhamRegion.com Live Editorial Engine
                </span>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  Intelligent Real Estate Insights: Durham Region
                </h2>
                <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                  Update published DurhamRegion.com journalistic analysis, municipal benchmark pricing (Pickering, Ajax, Whitby, Oshawa, Clarington, Uxbridge, Scugog, Brock), macro interest rates, and empirical TRREB statistics.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMarketDataSubView('import');
                    const btn = document.getElementById('agent-import-tab-btn');
                    if (btn) {
                      btn.click();
                      const suite = document.getElementById('agent-trreb-batch-suite');
                      if (suite) suite.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-stone-950" />
                  <span>TRREB Fast Batch Import</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>View Public Section</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Market Data Manager */}
            <AgentMarketDataManager initialSubView={marketDataSubView} />
          </div>
        )}

        {/* TAB 2: AI LEADS & CONCIERGE */}
        {activeTab === 'ai-leads' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <AgentAILeadsTab />
          </div>
        )}

        {/* TAB 3: OFFERS WORKFLOW */}
        {activeTab === 'offers' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <AgentOffersWorkflowTab />
          </div>
        )}

        {/* TAB 4: SHOWINGS WORKFLOW */}
        {activeTab === 'showings' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <AgentShowingsWorkflowTab />
          </div>
        )}

        {/* TAB 5: VIP REGISTRATIONS */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Search buyer name, email, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#0F2942]"
                />

                <select
                  value={projectFilter}
                  onChange={e => setProjectFilter(e.target.value)}
                  className="w-full sm:w-56 px-4 py-2.5 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  <option value="all">All Pre-Con Projects ({leads.length})</option>
                  {leadProjects.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-stone-500">
                Showing <strong className="text-stone-900">{filteredLeads.length}</strong> of {leads.length} registrations
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-semibold">No VIP registrations found matching criteria.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Buyer Contact</th>
                        <th className="p-4">Project</th>
                        <th className="p-4">Unit Desired</th>
                        <th className="p-4">Budget Range</th>
                        <th className="p-4">Buyer Persona</th>
                        <th className="p-4">Comments / Notes</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredLeads.map(l => (
                        <tr key={l.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-4 whitespace-nowrap text-stone-500">
                            {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-stone-900 block">{l.fullName}</span>
                            <span className="text-stone-500 block">{l.email}</span>
                            {l.phone && <span className="text-stone-500 block">{l.phone}</span>}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-[#0F2942] block">
                              {l.projectName || 'General VIP'}
                            </span>
                          </td>
                          <td className="p-4 text-stone-800">{l.desiredType || 'Any'}</td>
                          <td className="p-4 font-semibold text-emerald-800">{l.budgetRange || 'Flexible'}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                              {l.buyerType || 'Buyer'}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs text-stone-600 truncate" title={l.comments}>
                            {l.comments || '—'}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <a
                              href={`mailto:${l.email}?subject=VIP Access: ${encodeURIComponent(l.projectName || 'Durham Region Real Estate')}`}
                              className="inline-flex items-center gap-1 text-[#0F2942] hover:text-[#8C6D43] font-bold transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Reply</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: VIP CLIENTS & BUYING POWER */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900">Registered VIP Buyer Accounts</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Clients registered with verified profiles, affordability assessments, and co-buyer records.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('invite')}
                className="px-4 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Invite New Client</span>
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-semibold">No registered VIP clients yet.</p>
                <p className="text-xs text-stone-400 mt-1">Use the "Invite Clients" tab to onboard clients into their portal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 hover:border-stone-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 text-base">{c.fullName}</h4>
                        <span className="text-xs text-stone-500 block">{c.email}</span>
                        {c.phone && <span className="text-xs text-stone-500 block">{c.phone}</span>}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        {c.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Pre-Approval:</span>
                        <span className="font-semibold text-stone-800">{c.mortgagePreApprovalStatus || 'Pre-approved'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Target Budget:</span>
                        <span className="font-bold text-stone-900">${(c.targetBudgetMax || 750000).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Down Payment:</span>
                        <span className="font-semibold text-emerald-700">${(c.intendedDownPayment || 150000).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => {
                          setPreselectedVaultClientId(c.id);
                          setActiveTab('documents');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#0F2942]/10 hover:bg-[#0F2942] text-[#0F2942] hover:text-white font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Share builder contracts, floor plans, and addendums to this client's vault"
                      >
                        <FolderLock className="w-3.5 h-3.5" />
                        <span>Share Document / Vault</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="text-stone-400 text-[11px]">
                          Joined: {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        <a
                          href={`mailto:${c.email}`}
                          className="text-[#0F2942] hover:text-[#8C6D43] font-bold inline-flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DOCUMENT VAULT & DIGITAL SIGNATURES */}
        {activeTab === 'documents' && (
          <AgentDocumentVaultTab
            clients={clients}
            getAuthHeaders={getAuthHeaders}
            preselectedClientId={preselectedVaultClientId}
            onClearPreselectedClient={() => setPreselectedVaultClientId(null)}
          />
        )}

        {/* TAB 8: WORKSHEETS */}
        {activeTab === 'worksheets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <h3 className="text-xl font-bold font-serif text-stone-900">Pre-Construction Builder Worksheets</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Unit allocation requests, developer deposit schedules, and Tarion cooling-off submissions.
              </p>
            </div>

            {worksheets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-semibold">No builder worksheets submitted yet.</p>
                <p className="text-xs text-stone-400 mt-1">Worksheets will populate here as VIP buyers allocate pre-con suites.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Submission Date</th>
                      <th className="p-4">Client ID</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Primary Unit Choice</th>
                      <th className="p-4">Alternative Choice</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {worksheets.map((ws: any) => (
                      <tr key={ws.id} className="hover:bg-stone-50/80">
                        <td className="p-4 text-stone-500">{new Date(ws.submittedAt || Date.now()).toLocaleDateString()}</td>
                        <td className="p-4 font-mono font-bold text-stone-800">{ws.userId}</td>
                        <td className="p-4 font-semibold text-[#0F2942]">{ws.projectId}</td>
                        <td className="p-4 text-stone-900">{ws.firstChoiceSuite || 'Standard Model'}</td>
                        <td className="p-4 text-stone-600">{ws.secondChoiceSuite || '—'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {ws.status || 'Under Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: INVITE CLIENTS */}
        {activeTab === 'invite' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold text-[#8C6D43] uppercase tracking-wider block">
                  VIP Onboarding
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  Invite Client to VIP Portal
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Generate an exclusive invitation link granting the client full access to their Buyer Profile, Stored Affordability, Submitted Offers, and 1% Cashback rebate tracker.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {inviteResult && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>VIP Invitation Link Generated!</span>
                  </div>
                  <p className="text-xs text-emerald-900">
                    Send this private activation link to your client via SMS, WhatsApp, or Email:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteResult.link}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-emerald-300 font-mono text-stone-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Client Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={e => handleInviteNameChange(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                  />
                  {inviteErrors.name && (
                    <span className="text-[11px] text-red-600 mt-1 block">{inviteErrors.name}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Client Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => handleInviteEmailChange(e.target.value)}
                    placeholder="e.g. david.miller@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                  />
                  {inviteErrors.email && (
                    <span className="text-[11px] text-red-600 mt-1 block">{inviteErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Client Mobile Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={invitePhone}
                    onChange={e => handleInvitePhoneChange(e.target.value)}
                    placeholder="(416) 555-0192"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full py-3 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 text-[#C5A880]" />
                    <span>{inviteLoading ? 'Generating Invitation...' : 'Create Secure VIP Invitation'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: CASHBACK DEALS */}
        {activeTab === 'cashback' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900">1% Buyer Cashback Deal Tracker</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Track client rebate disbursements, builder/listing commission confirmation, and direct buyer payouts at closing.
                </p>
              </div>
            </div>

            {cashbackDeals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                <DollarSign className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-semibold">No cashback rebate inquiries recorded yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Property</th>
                      <th className="p-4">Purchase Price</th>
                      <th className="p-4">Est. Rebate (1%)</th>
                      <th className="p-4">Deal Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cashbackDeals.map(d => (
                      <tr key={d.id} className="hover:bg-stone-50/80">
                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{d.clientName}</span>
                          <span className="text-stone-500 block">{d.clientEmail}</span>
                        </td>
                        <td className="p-4 text-stone-800">{d.propertyAddress || 'Durham Property'}</td>
                        <td className="p-4 font-semibold text-stone-900">
                          {d.purchasePrice ? `$${d.purchasePrice.toLocaleString()}` : '—'}
                        </td>
                        <td className="p-4 font-bold text-emerald-700">
                          ${(d.confirmedCashbackAmount || d.estimatedCashback).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDeal(d)}
                            className="text-[#0F2942] hover:text-[#8C6D43] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Status</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Deal Edit Modal */}
            {editingDeal && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
                  <h4 className="text-lg font-bold font-serif text-stone-900">Update Cashback Deal Status</h4>
                  <form onSubmit={handleSaveDealUpdate} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Status</label>
                      <select
                        value={dealStatusInput}
                        onChange={e => setDealStatusInput(e.target.value as CashbackDealStatus)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                      >
                        <option value="Inquiry">Inquiry</option>
                        <option value="Pre-Approval Verified">Pre-Approval Verified</option>
                        <option value="Agreement Signed">Representation Agreement Signed</option>
                        <option value="Offer Accepted">Offer Accepted / Firm</option>
                        <option value="Commission Received">Commission Received</option>
                        <option value="Rebate Paid">Rebate Paid to Client</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Confirmed Rebate Amount ($ CAD)</label>
                      <input
                        type="number"
                        value={dealAmountInput}
                        onChange={e => setDealAmountInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Payment Reference / Cheque #</label>
                      <input
                        type="text"
                        value={dealPaymentRefInput}
                        onChange={e => setDealPaymentRefInput(e.target.value)}
                        placeholder="e.g. EFT-98214 or Trust Cheque #4102"
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Deal Notes</label>
                      <textarea
                        rows={2}
                        value={dealNotesInput}
                        onChange={e => setDealNotesInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDeal(null)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={dealUpdating}
                        className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                      >
                        {dealUpdating ? 'Saving...' : 'Save Updates'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
