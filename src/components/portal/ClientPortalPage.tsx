import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  DollarSign,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  Calculator,
  Lock,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  FolderLock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAffordability } from '../../context/AffordabilityContext';
import { AMIT_SAWHNEY } from '../../data/agent';
import { PortalProfileSection } from './PortalProfileSection';
import { PortalOffersSection } from './PortalOffersSection';
import { PortalAffordabilitySection } from './PortalAffordabilitySection';
import { PortalWorksheetsSection } from './PortalWorksheetsSection';
import { PortalDocumentVaultSection } from './PortalDocumentVaultSection';
import { ActivityTimeline } from './ActivityTimeline';

export type PortalTab = 'overview' | 'profile' | 'offers' | 'affordability' | 'worksheets' | 'documents';

interface ClientPortalPageProps {
  initialTab?: PortalTab;
  isNewlyRegistered?: boolean;
  onNavigateHome: () => void;
  onNavigateToListings?: (maxBudget?: number) => void;
  onNavigateToPrecon?: () => void;
  onNavigateToAgentPortal?: () => void;
  onOpenOfferWizard?: () => void;
  onOpenConsultation?: () => void;
}

export const ClientPortalPage: React.FC<ClientPortalPageProps> = ({
  initialTab = 'overview',
  isNewlyRegistered = false,
  onNavigateHome,
  onNavigateToListings,
  onNavigateToPrecon,
  onNavigateToAgentPortal,
  onOpenOfferWizard,
  onOpenConsultation
}) => {
  const { user, isAuthenticated, isClient, isAgent, openAuthModal, logout } = useAuth();
  const { assessment, buyerProfile } = useAffordability();

  // If newly registered, guide straight to 'profile' section!
  const [activeTab, setActiveTab] = useState<PortalTab>(() => {
    if (isNewlyRegistered) return 'profile';
    return initialTab;
  });

  const [newlyRegisteredNotice, setNewlyRegisteredNotice] = useState(isNewlyRegistered);

  useEffect(() => {
    if (isNewlyRegistered) {
      setActiveTab('profile');
      setNewlyRegisteredNotice(true);
    }
  }, [isNewlyRegistered]);

  // Scroll to top on tab change
  const handleTabChange = (tab: PortalTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clientName = user?.fullName || 'Valued VIP Buyer';
  const maxPurchasingPower = assessment?.estimatedPurchasePriceMax || user?.targetBudgetMax || 750000;
  const intendedDown = assessment?.estimatedDownPayment || user?.intendedDownPayment || 150000;
  const cashbackEst = Math.round(maxPurchasingPower * 0.01);

  // 1. Gated: Agents do not have access to client portal when logged in as agent
  if (isAgent) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col justify-between" id="agent-restricted-gate">
        {/* Top Header */}
        <header className="bg-stone-900/90 backdrop-blur-md border-b border-stone-800 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Main Site</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-serif tracking-wider text-white">
                  TRUE<span className="text-[#C5A880]">CONDOS</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono hidden sm:inline">| Agent Access Restricted</span>
              </div>
            </div>
          </div>
        </header>

        {/* Central Restricted Card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-xl w-full bg-stone-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-1/4 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Shield Alert Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
                <Lock className="w-3.5 h-3.5" />
                <span>Agent Account Detected</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Client Portal is Exclusively for Clients
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed">
                You are currently signed in as an Agent (<span className="text-amber-300 font-semibold">{user?.fullName || user?.email}</span>). Real estate agents do not have access to client portals.
              </p>
              <p className="text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Please use your dedicated <strong>Agent CRM Portal</strong> to manage client leads, developer worksheets, and offer pipelines, or switch to a client account.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToAgentPortal || onNavigateHome}
                className="py-3 px-4 bg-[#C5A880] hover:bg-[#b89758] text-[#111827] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Agent CRM Portal</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  openAuthModal({
                    role: 'CLIENT',
                    tab: 'login',
                    customTitle: 'Sign In as Client',
                    customMessage: 'Please sign in with a registered client account to access the VIP Client Portal.'
                  });
                }}
                className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-stone-300" />
                <span>Switch to Client Account</span>
              </button>
            </div>

            <div className="border-t border-stone-800/80 pt-4">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Return to Main Homepage
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-stone-500 border-t border-stone-800/80">
          <span>Amit Sawhney Team • TrueCondos VIP Platform • Confidential & Proprietary</span>
        </footer>
      </div>
    );
  }

  // 2. Gated: Client Portal is exclusively for registered/authenticated clients
  if (!isAuthenticated || !isClient) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col justify-between" id="client-portal-gate">
        {/* Top Header */}
        <header className="bg-stone-900/90 backdrop-blur-md border-b border-stone-800 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Main Site</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-serif tracking-wider text-white">
                  TRUE<span className="text-[#C5A880]">CONDOS</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">| Private Client Gateway</span>
              </div>
            </div>
          </div>
        </header>

        {/* Central Card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-xl w-full bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background gold glow */}
            <div className="absolute top-0 right-1/4 w-64 h-32 bg-[#C5A880]/15 blur-3xl pointer-events-none" />

            {/* Lock Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-mono mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VIP Client Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Registered Client Access Required
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-3 leading-relaxed">
                The Client Portal is tied directly to your user account and is reserved exclusively for registered clients of Amit Sawhney & TrueCondos. Please sign in or register below to access confidential builder worksheets, price lists, your customized mortgage affordability assessment, and official offer drafts.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  openAuthModal({
                    role: 'CLIENT',
                    tab: 'login',
                    customTitle: 'Sign In to Client Portal',
                    customMessage: 'Please sign in with your registered client credentials to access your private VIP dashboard.'
                  })
                }
                className="py-3 px-4 bg-[#C5A880] hover:bg-[#b89758] text-[#111827] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In as Client</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  openAuthModal({
                    role: 'CLIENT',
                    tab: 'register',
                    customTitle: 'Register for VIP Client Access',
                    customMessage: 'Create your private client account to unlock developer worksheets, floor plans, and custom affordability insights.'
                  })
                }
                className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register VIP Account</span>
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="border-t border-stone-800/80 pt-6 text-left grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Confidential developer pricing worksheets & floorplans</span>
              </div>
              <div className="flex items-start gap-2">
                <Calculator className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Live mortgage stress qualification & range tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>1% Buyer Commission Cashback guarantee</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Direct OREA offer preparation & legal documentation</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-stone-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
              >
                Return to Public Home Page
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-stone-500 py-4 border-t border-stone-800/60">
          Amit Sawhney, Broker | Blueprint Realty Inc., Brokerage | RECO Registered
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20" id="client-portal-page">
      {/* Top Banner Navigation */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Main Site</span>
              </button>

              <div className="h-6 w-px bg-stone-700 hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span>VIP Client Portal</span>
                  </h1>
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Platinum VIP
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 hidden sm:block">
                  Dedicated Buyer Portfolio & Legal Fiduciary Portal | Blueprint Realty
                </p>
              </div>
            </div>

            {/* Right: Assigned REALTOR & Profile Summary */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <span className="text-[11px] text-stone-400 block">Assigned REALTOR®</span>
                <span className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <span>{AMIT_SAWHNEY.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono">RECO #4892105</span>
                </span>
              </div>

              <img
                src={AMIT_SAWHNEY.photo}
                alt="Amit Sawhney"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-400/40 shadow-sm"
              />

              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="p-2 sm:px-3 sm:py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                title="Direct REALTOR® Hotline"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="hidden sm:inline">Hotline</span>
              </a>
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="bg-stone-900/95 border-t border-stone-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => handleTabChange('overview')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#C5A880] text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                id="portal-tab-profile"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#C5A880] text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Client Profile</span>
                {newlyRegisteredNotice && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('offers')}
                id="portal-tab-offers"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'offers'
                    ? 'bg-[#C5A880] text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Offers & Progress</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('affordability')}
                id="portal-tab-affordability"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'affordability'
                    ? 'bg-[#C5A880] text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Buying Range & Affordability</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('worksheets')}
                id="portal-tab-worksheets"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'worksheets'
                    ? 'bg-[#C5A880] text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>VIP Worksheets</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('documents')}
                id="portal-tab-documents"
                className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'documents'
                    ? 'bg-[#C5A880] text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <FolderLock className="w-4 h-4" />
                <span>Document Vault</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-400/30">
                  Digital E-Sign
                </span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in" id="portal-overview-tab">
            {/* Welcome & Persona Hero */}
            <div className="bg-gradient-to-r from-stone-900 via-[#0F2942] to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C5A880] text-stone-900">
                      Welcome, {clientName}
                    </span>
                    <span className="text-xs text-stone-300 font-medium">
                      Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Your Platinum VIP Real Estate Dashboard
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-2xl leading-relaxed">
                    Access your active offers, real-time negotiation status, pre-construction builder allocations, and stored buying range calculations under full RECO fiduciary representation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTabChange('profile')}
                    className="px-4 py-2.5 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#0F2942]" />
                    <span>Client Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('affordability')}
                    className="px-4 py-2.5 bg-[#C5A880] text-stone-900 hover:bg-[#b5966c] rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-stone-900" />
                    <span>Recalculate Affordability</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Key Pillar Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Stored Purchasing Power */}
              <div
                onClick={() => handleTabChange('affordability')}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-[#0F2942] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Purchasing Power
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900">
                  ${maxPurchasingPower.toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                  <span>Down Payment: ${intendedDown.toLocaleString()}</span>
                  <span className="font-bold text-[#0F2942] flex items-center gap-0.5">
                    Adjust <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Pillar 2: Active Offers Progress */}
              <div
                onClick={() => {
                  const el = document.getElementById('portal-activity-timeline');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    handleTabChange('offers');
                  }
                }}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-[#0F2942] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Offers & Timeline
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900">
                  Active
                </p>
                <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                  <span className="text-amber-700 font-semibold">7-Stage Negotiation Tracker</span>
                  <span className="font-bold text-[#0F2942] flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Pillar 3: Pre-Con Worksheets */}
              <div
                onClick={() => handleTabChange('worksheets')}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-[#0F2942] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    VIP Allocations
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900">
                  Brooklin Trails
                </p>
                <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                  <span className="text-emerald-700 font-semibold">Priority Unit Held</span>
                  <span className="font-bold text-[#0F2942] flex items-center gap-0.5">
                    Worksheet <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Pillar 4: Cashback Benefit */}
              <div
                onClick={() => handleTabChange('affordability')}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Cashback On Closing
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                  Up to ${cashbackEst.toLocaleString()}
                </p>
                <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                  <span>1.0% Co-op Commission Back</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                VIP Portal Quick Navigation & Fiduciary Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="p-4 rounded-xl border border-stone-200 hover:border-[#0F2942] hover:bg-stone-50 text-left transition-all group"
                >
                  <User className="w-5 h-5 text-[#0F2942] mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-stone-900">Manage Client Profile</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Update legal buyer names, current address, co-buyer details, and purchase criteria.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('offers')}
                  className="p-4 rounded-xl border border-stone-200 hover:border-[#0F2942] hover:bg-stone-50 text-left transition-all group"
                >
                  <FileCheck2 className="w-5 h-5 text-blue-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-stone-900">Submitted Offers & Progress</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Review status, legal conditions, deposit schedules, and request offer amendments.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('affordability')}
                  className="p-4 rounded-xl border border-stone-200 hover:border-[#0F2942] hover:bg-stone-50 text-left transition-all group"
                >
                  <DollarSign className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-stone-900">Recalculate Affordability</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Store and recalculate your maximum purchase price and stress-tested debt service ratios.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('worksheets')}
                  className="p-4 rounded-xl border border-stone-200 hover:border-[#0F2942] hover:bg-stone-50 text-left transition-all group"
                >
                  <Building2 className="w-5 h-5 text-[#C5A880] mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-stone-900">VIP Builder Worksheets</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Pre-construction unit allocations, 10-day cooling off period tracking, and capped levies.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('documents')}
                  className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 text-left transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FolderLock className="w-5 h-5 text-amber-800 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Digital E-Sign
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Document Vault</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    View, download, and digitally sign APS agreements & floor plan addendums.
                  </p>
                </button>
              </div>
            </div>

            {/* 7-Stage Negotiation Progress Activity Timeline */}
            <ActivityTimeline
              onNavigateToOffers={() => handleTabChange('offers')}
              onPrepareNewOffer={onOpenOfferWizard}
              onNavigateToDocuments={() => handleTabChange('documents')}
            />
          </div>
        )}

        {/* TAB 2: CLIENT PROFILE SECTION */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in">
            <PortalProfileSection
              isNewlyRegistered={newlyRegisteredNotice}
              onNavigateTab={handleTabChange}
              onProfileUpdated={() => {
                setNewlyRegisteredNotice(false);
              }}
            />
          </div>
        )}

        {/* TAB 3: OFFERS & PROGRESS SECTION */}
        {activeTab === 'offers' && (
          <div className="animate-in fade-in">
            <PortalOffersSection
              onPrepareNewOffer={onOpenOfferWizard}
              onExploreProperties={() => onNavigateToListings?.(maxPurchasingPower)}
            />
          </div>
        )}

        {/* TAB 4: BUYING RANGE & AFFORDABILITY RECALCULATION */}
        {activeTab === 'affordability' && (
          <div className="animate-in fade-in">
            <PortalAffordabilitySection
              onSearchProperties={budget => onNavigateToListings?.(budget)}
              onDraftOffer={onOpenOfferWizard}
            />
          </div>
        )}

        {/* TAB 5: VIP WORKSHEETS SECTION */}
        {activeTab === 'worksheets' && (
          <div className="animate-in fade-in">
            <PortalWorksheetsSection
              onNavigateToProjects={onNavigateToPrecon}
            />
          </div>
        )}

        {/* TAB 6: DOCUMENT VAULT & DIGITAL SIGNATURES */}
        {activeTab === 'documents' && (
          <div className="animate-in fade-in">
            <PortalDocumentVaultSection
              onNavigateToWorksheets={() => handleTabChange('worksheets')}
              onNavigateToOffers={() => handleTabChange('offers')}
            />
          </div>
        )}
      </main>
    </div>
  );
};
