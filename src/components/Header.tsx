import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Phone,
  Mail,
  Building2,
  Sparkles,
  User,
  Bot,
  Menu,
  X,
  ShieldCheck,
  DollarSign,
  Home,
  TrendingUp,
  Compass,
  Calculator,
  ChevronRight,
  Search,
  Layers,
  FileSpreadsheet,
  Calendar,
  Lock,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  LogIn,
  LogOut,
  KeyRound,
  Scale
} from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenVIPModal: (projectId?: string) => void;
  onOpenAIModal: () => void;
  onOpenLeadsModal: () => void;
  onOpenConsultationModal: () => void;
  onOpenClientView: () => void;
  onOpenValuation: () => void;
  onOpenCompareModal?: () => void;
  compareCount?: number;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  currentPage?: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings';
  onNavigate?: (page: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings', targetSectionId?: string) => void;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'modal' | 'section';
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVIPModal,
  onOpenAIModal,
  onOpenLeadsModal,
  onOpenConsultationModal,
  onOpenClientView,
  onOpenValuation,
  onOpenCompareModal,
  compareCount = 0,
  activeSection,
  setActiveSection,
  currentPage = 'home',
  onNavigate
}) => {
  const { user, isAuthenticated, isAgent, isClient, openAuthModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'modals' | 'sections'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchFilter('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleScrollToSection = (id: string) => {
    setActiveSection(id);
    setMenuOpen(false);
    if (currentPage !== 'home' && onNavigate) {
      onNavigate('home', id);
      return;
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  // Comprehensive list of all Modals / Interactive Tools
  const modalTools: MenuItem[] = [
    {
      id: 'page-seller-1pct',
      title: 'Sell Your Home (1% Listing Fee)',
      subtitle: 'Full-service representation, HDR media, 3D Matterport & MLS® listing with $0 upfront cost',
      category: 'modal',
      badge: 'Save $15K+',
      icon: DollarSign,
      action: () => {
        setMenuOpen(false);
        if (onNavigate) {
          onNavigate('seller');
        } else {
          onOpenValuation();
        }
      }
    },
    {
      id: 'page-browse-homes',
      title: 'Pre-Construction & Resale Homes',
      subtitle: 'Explore VIP developer launches, move-in ready residences & neighborhood market guides',
      category: 'modal',
      badge: 'Buyer Portal',
      icon: Home,
      action: () => {
        setMenuOpen(false);
        if (onNavigate) {
          onNavigate('home');
        } else {
          handleScrollToSection('projects');
        }
      }
    },
    {
      id: 'modal-vip',
      title: 'VIP Platinum Access & Worksheet',
      subtitle: 'Early builder allocations, priority floor plans & developer pricing incentives',
      category: 'modal',
      badge: 'Platinum VIP',
      icon: FileSpreadsheet,
      action: () => {
        setMenuOpen(false);
        onOpenVIPModal();
      }
    },
    {
      id: 'modal-ai',
      title: 'Ask Gemini AI Real Estate Advisor',
      subtitle: 'Instant 24/7 intelligent insights on GTA pre-construction, Durham pricing & ROI',
      category: 'modal',
      badge: 'AI Powered',
      icon: Bot,
      action: () => {
        setMenuOpen(false);
        onOpenAIModal();
      }
    },
    {
      id: 'modal-valuation',
      title: 'Free Home Valuation (CMA Estimator)',
      subtitle: 'Discover what your home is worth today with a custom Comparative Market Analysis',
      category: 'modal',
      badge: 'Free Valuation',
      icon: DollarSign,
      action: () => {
        setMenuOpen(false);
        onOpenValuation();
      }
    },
    {
      id: 'modal-consultation',
      title: 'Book 1-on-1 VIP Strategy Call',
      subtitle: 'Private consultation with licensed Realtor Amit Sawhney for buyers, sellers & investors',
      category: 'modal',
      badge: 'Strategy Call',
      icon: Calendar,
      action: () => {
        setMenuOpen(false);
        onOpenConsultationModal();
      }
    },
    {
      id: 'modal-client-view',
      title: 'Client View Registered Portal',
      subtitle: 'Access your saved allocations, floor plan worksheets & VIP registration details',
      category: 'modal',
      badge: isClient ? 'Verified Client' : 'Client Access',
      icon: ShieldCheck,
      action: () => {
        setMenuOpen(false);
        onOpenClientView();
      }
    },
    ...(onOpenCompareModal ? [{
      id: 'modal-compare',
      title: 'Compare Properties Side-by-Side',
      subtitle: 'Compare price, bedrooms, deposit milestones, and occupancy for up to 3 projects',
      category: 'modal' as const,
      badge: compareCount > 0 ? `${compareCount}/3 Selected` : 'Compare (3 Max)',
      icon: Scale,
      action: () => {
        setMenuOpen(false);
        onOpenCompareModal();
      }
    }] : []),
    {
      id: 'modal-agent-leads',
      title: 'Agent CRM & Lead Management',
      subtitle: 'Private Realtor portal to manage registrant pipeline, inquiries & client worksheets',
      category: 'modal',
      badge: isAgent ? 'Realtor Access' : 'Agent Login Required',
      icon: Lock,
      action: () => {
        setMenuOpen(false);
        onOpenLeadsModal();
      }
    },
    {
      id: 'modal-auth',
      title: isAuthenticated ? `Sign Out (${user?.role})` : 'Agent & Client Account Sign In',
      subtitle: isAuthenticated
        ? `Logged in as ${user?.fullName} (${user?.email}). Click to sign out or switch accounts.`
        : 'Sign in with your Agent or Client credentials to access protected documents and tools.',
      category: 'modal',
      badge: isAuthenticated ? user?.role : 'Sign In',
      icon: isAuthenticated ? LogOut : LogIn,
      action: () => {
        setMenuOpen(false);
        if (isAuthenticated) {
          logout();
        } else {
          openAuthModal({ role: 'AGENT', tab: 'login' });
        }
      }
    }
  ];

  // Comprehensive list of all Page Sections
  const pageSections: MenuItem[] = [
    {
      id: 'hero',
      title: 'Home & Property Search',
      subtitle: 'Interactive filters by city, property type, max price, and occupancy timeframe',
      category: 'section',
      icon: Search,
      action: () => handleScrollToSection('hero')
    },
    {
      id: 'cashback-portal',
      title: 'Buy Smart™ Commission Cashback & Rebate Portal',
      subtitle: 'Calculate your closing rebate (up to 1.0% back), check transaction eligibility, and keep builder perks',
      category: 'section',
      badge: 'Up to 1.0% Back',
      icon: Sparkles,
      action: () => {
        setMenuOpen(false);
        if (onNavigate) {
          onNavigate('cashback');
        } else {
          handleScrollToSection('cashback');
        }
      }
    },
    {
      id: 'buyer-journey',
      title: 'Buyer & Seller Pathways',
      subtitle: 'Tailored guidance for first-time buyers, pre-con, upsizing, downsizers & investors',
      category: 'section',
      icon: Compass,
      action: () => handleScrollToSection('buyer-journey')
    },
    {
      id: 'preconstruction-portal',
      title: 'Pre-Construction Collection & ROIC Calculator',
      subtitle: 'Dedicated page for VIP builder launches, capped levies, and projected Return on Invested Capital simulator',
      category: 'section',
      badge: 'VIP Portfolio',
      icon: Building2,
      action: () => {
        setMenuOpen(false);
        if (onNavigate) onNavigate('preconstruction');
      }
    },
    {
      id: 'all-listings-portal',
      title: 'Live MLS® Listings Feed (All Ontario)',
      subtitle: 'Browse all active residential properties across Durham & GTA from the REALTOR.ca feed with interactive map and filters',
      category: 'section',
      badge: 'Live Feed',
      icon: Home,
      action: () => {
        setMenuOpen(false);
        if (onNavigate) onNavigate('listings');
      }
    },
    {
      id: 'market-trends',
      title: 'Live Market Intelligence & Trends',
      subtitle: 'TRREB & BILD real-time data, benchmark prices, ppsf trends & GTA market forecasts',
      category: 'section',
      icon: TrendingUp,
      action: () => handleScrollToSection('market-trends')
    },
    {
      id: 'communities',
      title: 'Featured Communities & Neighborhoods',
      subtitle: 'Explore Whitby, Brooklin, Oshawa, Courtice, Markham, Pickering & Durham Region',
      category: 'section',
      icon: Layers,
      action: () => handleScrollToSection('communities')
    },
    {
      id: 'investment-opportunities',
      title: 'Investment & Assignment Opportunities',
      subtitle: 'Pre-construction deposit leverage, rental yields, cap rates & assignment sales',
      category: 'section',
      icon: DollarSign,
      action: () => handleScrollToSection('investment-opportunities')
    },
    {
      id: 'calculator',
      title: 'Mortgage & Deposit Calculator',
      subtitle: 'Milestone deposit breakdown, live mortgage rates, stress test & closing taxes',
      category: 'section',
      icon: Calculator,
      action: () => handleScrollToSection('calculator')
    },
    {
      id: 'agent',
      title: 'About Amit Sawhney (Realtor®)',
      subtitle: 'Licensed Ontario REALTOR® with Blueprint Realty Brokerage, bio & credentials',
      category: 'section',
      icon: User,
      action: () => handleScrollToSection('agent')
    },
    {
      id: 'footer',
      title: 'Disclosures & Regulatory Info',
      subtitle: 'RECO, TRREB, CREA compliance, brokerage details & contact information',
      category: 'section',
      icon: BadgeCheck,
      action: () => handleScrollToSection('footer')
    }
  ];

  // Filtered lists based on menu search bar
  const filteredModals = useMemo(() => {
    if (activeTab === 'sections') return [];
    if (!searchFilter.trim()) return modalTools;
    const q = searchFilter.toLowerCase();
    return modalTools.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [searchFilter, activeTab]);

  const filteredSections = useMemo(() => {
    if (activeTab === 'modals') return [];
    if (!searchFilter.trim()) return pageSections;
    const q = searchFilter.toLowerCase();
    return pageSections.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [searchFilter, activeTab]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-900 shadow-xs">
      {/* Top Realtor Direct Bar */}
      <div className="w-full bg-[#0F2942] text-xs py-1.5 text-stone-200 border-b border-[#183759]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 bg-[#17375A] text-[#E0E7FF] px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border border-[#254F7F] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span className="truncate">Licensed Ontario REALTOR® • Amit Sawhney</span>
            </span>
            <span className="hidden md:inline text-stone-300 font-normal truncate text-xs">
              GTA & Durham Pre-Con & Resale Specialist
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="inline-flex items-center gap-1.5 text-[#C5A880] hover:text-white font-bold transition-colors whitespace-nowrap text-xs"
              title="Call or Text Amit Sawhney Directly"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span>Direct: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar: Clean, Decluttered, Fully Responsive */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          onClick={() => {
            if (onNavigate) {
              onNavigate('home', 'hero');
            } else {
              handleScrollToSection('hero');
            }
          }}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#0F2942] border border-[#C5A880]/50 p-0.5 shadow-sm group-hover:border-[#C5A880] transition-colors shrink-0">
            <div className="w-full h-full bg-[#0F2942] rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-[#C5A880]" />
            </div>
          </div>

          <div className="min-w-0">
            <span className="block font-extrabold text-sm sm:text-lg md:text-xl xl:text-2xl tracking-tight text-[#0F2942] font-serif whitespace-nowrap leading-tight">
              AMIT SAWHNEY
            </span>
            <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-[#8C6D43] font-bold truncate">
              Blueprint Realty • REALTOR®
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Links (Clean & Decluttered) */}
        {/* Core priority items visible on lg (1024px+); additional items on xl (1280px+) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold text-stone-700 min-w-0">
          <button
            onClick={() => {
              if (onNavigate) onNavigate('preconstruction');
            }}
            className={`px-2.5 xl:px-3 py-1.5 rounded-none transition-colors whitespace-nowrap cursor-pointer hover:text-[#111111] hover:bg-stone-100 ${
              currentPage === 'preconstruction' ? 'text-[#111111] font-bold bg-stone-100 ring-1 ring-stone-300' : ''
            }`}
          >
            Pre-Construction
          </button>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('listings');
            }}
            className={`px-2.5 xl:px-3 py-1.5 rounded-none transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 hover:text-[#111111] hover:bg-stone-100 ${
              currentPage === 'listings' ? 'text-[#111111] font-bold bg-stone-100 ring-1 ring-stone-300' : ''
            }`}
          >
            <span>MLS® Listings</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('seller');
              } else {
                handleScrollToSection('seller');
              }
            }}
            className={`px-2.5 xl:px-3 py-1.5 rounded-none transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 hover:text-[#111111] hover:bg-amber-50 ${
              currentPage === 'seller' ? 'text-[#111111] font-bold bg-amber-100/80 border border-[#C5A880]/50' : 'text-stone-800'
            }`}
          >
            <span>Sell (1%)</span>
            <span className="px-1.5 py-0.2 rounded-none bg-[#C5A880] text-stone-950 text-[9px] font-extrabold">
              Save $15k+
            </span>
          </button>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('cashback');
              } else {
                handleScrollToSection('cashback');
              }
            }}
            className={`hidden xl:inline-flex px-2.5 xl:px-3 py-1.5 rounded-none transition-colors whitespace-nowrap cursor-pointer hover:text-[#111111] hover:bg-stone-100 ${
              currentPage === 'cashback' ? 'text-[#111111] font-bold bg-stone-100 ring-1 ring-stone-300' : ''
            }`}
          >
            Cashback
          </button>
          <button
            onClick={() => handleScrollToSection('communities')}
            className={`hidden xl:inline-flex px-2.5 xl:px-3 py-1.5 rounded-none transition-colors whitespace-nowrap cursor-pointer hover:text-[#111111] hover:bg-stone-100 ${
              currentPage === 'home' && activeSection === 'communities' ? 'text-[#111111] font-bold bg-stone-100' : ''
            }`}
          >
            Communities
          </button>
        </nav>

        {/* Right Action Area: Decluttered, Responsive, and Never Cuts Off */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Compare Properties Button (Only active/visible when 1+ projects selected) */}
          {compareCount > 0 && onOpenCompareModal && (
            <button
              onClick={onOpenCompareModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#0F2942] text-white border border-[#C5A880]/60 rounded-xl text-xs font-semibold shadow-xs transition-all whitespace-nowrap cursor-pointer"
              title="Compare Properties Side-by-Side"
            >
              <Scale className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span className="hidden md:inline">Compare</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#C5A880] text-[#111827]">
                {compareCount}
              </span>
            </button>
          )}

          {/* Client Portal / User Account Button (Hidden on mobile, accessible via Menu drawer) */}
          {!isAuthenticated ? (
            <button
              onClick={() => openAuthModal({ role: 'AGENT', tab: 'login' })}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold shadow-xs transition-all whitespace-nowrap cursor-pointer"
              title="Agent & Client Portal Sign In"
            >
              <User className="w-3.5 h-3.5 text-[#8C6D43]" />
              <span>Portal</span>
            </button>
          ) : isAgent ? (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={onOpenLeadsModal}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#0F2942] hover:bg-[#183759] text-white border border-[#C5A880]/50 rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap cursor-pointer"
                title="Agent CRM Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="hidden md:inline">Agent CRM</span>
              </button>
              <button
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={onOpenClientView}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap cursor-pointer"
                title="Client Portal"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user?.fullName.split(' ')[0]}</span>
              </button>
              <button
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Primary Consultation CTA - Always cleanly sized */}
          <button
            onClick={() => onOpenConsultationModal()}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-stone-950 text-stone-950 shrink-0" />
            <span>Book Call</span>
          </button>

          {/* Directory & Menu Drawer Toggle - Always 100% visible and never clipped */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer group shrink-0 ${
              menuOpen
                ? 'bg-[#C5A880] text-stone-950 shadow-md ring-2 ring-[#C5A880]/30'
                : 'bg-[#0F2942] hover:bg-[#183759] text-white'
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-950" />
            ) : (
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
            )}
            <span className="font-bold">
              {menuOpen ? 'Close' : 'Menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Portal-Mounted Slide-Over Navigation Drawer to Guarantee Perfect Layout Across All Devices */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <div className="fixed inset-0 z-[9999] overflow-hidden">
                {/* Dark Glassmorphic Backdrop */}
                <motion.div
                  key="drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-[#0F2942]/75 backdrop-blur-sm cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* Sliding Menu Panel */}
                <motion.div
                  key="drawer-panel"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-[500px] md:w-[560px] max-w-full bg-white shadow-2xl border-l border-stone-200 flex flex-col h-full overflow-hidden"
                >
                  {/* Drawer Header */}
                  <div className="p-5 sm:p-6 bg-[#0F2942] text-white flex items-center justify-between border-b border-[#183759] shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#17375A] border border-[#C5A880]/50 flex items-center justify-center shadow-inner">
                        <Building2 className="w-6 h-6 text-[#C5A880]" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-white leading-tight">
                          Navigation & Directory
                        </h3>
                        <p className="text-xs text-[#C5A880] font-medium">
                          Amit Sawhney • Blueprint Realty REALTOR®
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-[#17375A] transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Filter Bar */}
                  <div className="p-4 bg-stone-50 border-b border-stone-200 shrink-0 space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search sections, tools, calculators, portals..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942] focus:border-transparent transition-all shadow-xs"
                      />
                      {searchFilter && (
                        <button
                          onClick={() => setSearchFilter('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                          activeTab === 'all'
                            ? 'bg-white text-[#0F2942] shadow-xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        All ({modalTools.length + pageSections.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('modals')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                          activeTab === 'modals'
                            ? 'bg-white text-[#0F2942] shadow-xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        VIP Tools ({modalTools.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('sections')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                          activeTab === 'sections'
                            ? 'bg-white text-[#0F2942] shadow-xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Sections ({pageSections.length})
                      </button>
                    </div>
                  </div>

                  {/* Drawer Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* User Account & Role Badge Card */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
                      {isAuthenticated ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isAgent ? 'bg-[#0F2942] text-[#C5A880]' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isAgent ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  isAgent ? 'bg-[#0F2942] text-[#C5A880]' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isAgent ? 'Licensed Agent' : 'VIP Client'}
                                </span>
                              </div>
                              <h5 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                                {user?.fullName}
                              </h5>
                              <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAgent ? (
                              <button
                                onClick={() => {
                                  setMenuOpen(false);
                                  onOpenLeadsModal();
                                }}
                                className="px-3 py-1.5 bg-[#0F2942] hover:bg-[#183759] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                CRM
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setMenuOpen(false);
                                  onOpenClientView();
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                My Portal
                              </button>
                            )}
                            <button
                              onClick={logout}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="Sign Out"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                              <KeyRound className="w-3.5 h-3.5 text-[#8C6D43]" />
                              <span>Agent & Client Secure Portal</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Sign in for builder price worksheets, allocations, or Agent CRM.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                openAuthModal({ role: 'AGENT', tab: 'login' });
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-[#0F2942] hover:bg-[#183759] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(false);
                                openAuthModal({ role: 'CLIENT', tab: 'register' });
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Register
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 1: Direct VIP Portals & Interactive Modal Windows */}
                    {filteredModals.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#8C6D43]" />
                            <h4 className="text-xs font-extrabold text-[#0F2942] uppercase tracking-wider">
                              VIP Portals & Instant Tools
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#8C6D43]">
                            {filteredModals.length} Tools
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {filteredModals.map(item => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={item.action}
                                className="text-left p-3.5 rounded-2xl bg-[#FDFBF7] hover:bg-[#F5F2EB] border border-[#EBE4D5] hover:border-[#C5A880] transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-xl bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    {item.badge && (
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#0F2942]/10 text-[#0F2942] border border-[#0F2942]/10 whitespace-nowrap">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-bold text-xs sm:text-sm text-[#0F2942] group-hover:text-[#8C6D43] transition-colors leading-snug">
                                    {item.title}
                                  </h5>
                                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                                    {item.subtitle}
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-bold text-[#8C6D43]">
                                  <span>Open Tool</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: All Website Exploration & Main Page Sections */}
                    {filteredSections.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-[#0F2942]" />
                            <h4 className="text-xs font-extrabold text-[#0F2942] uppercase tracking-wider">
                              Website Sections
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            {filteredSections.length} Sections
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {filteredSections.map(item => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={item.action}
                                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group ${
                                  isActive
                                    ? 'bg-[#0F2942] text-white shadow-sm'
                                    : 'hover:bg-stone-100 text-stone-800'
                                }`}
                              >
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    isActive
                                      ? 'bg-[#17375A] text-[#C5A880]'
                                      : 'bg-stone-100 text-stone-600 group-hover:bg-white group-hover:text-[#8C6D43] group-hover:shadow-xs'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs sm:text-sm flex items-center justify-between">
                                    <span className={isActive ? 'text-white' : 'text-[#0F2942]'}>
                                      {item.title}
                                    </span>
                                    <ChevronRight
                                      className={`w-4 h-4 transition-transform ${
                                        isActive
                                          ? 'text-[#C5A880] translate-x-0.5'
                                          : 'text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5'
                                      }`}
                                    />
                                  </div>
                                  <p
                                    className={`text-[11px] truncate mt-0.5 ${
                                      isActive ? 'text-stone-300' : 'text-stone-500'
                                    }`}
                                  >
                                    {item.subtitle}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Empty Search Result State */}
                    {filteredModals.length === 0 && filteredSections.length === 0 && (
                      <div className="py-12 text-center space-y-3">
                        <Search className="w-8 h-8 text-stone-400 mx-auto" />
                        <p className="text-sm font-semibold text-stone-700">
                          No matching tools or sections found for "{searchFilter}"
                        </p>
                        <button
                          onClick={() => {
                            setSearchFilter('');
                            setActiveTab('all');
                          }}
                          className="px-3.5 py-1.5 bg-[#0F2942] text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Clear Search Filter
                        </button>
                      </div>
                    )}

                    {/* Direct Licensed Realtor Contact Card */}
                    <div className="pt-2 space-y-3">
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-3xl space-y-3 shadow-xs">
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <img
                              src={AMIT_SAWHNEY.photo}
                              alt={AMIT_SAWHNEY.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A880] shadow-sm"
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-serif font-bold text-sm text-[#0F2942]">
                                {AMIT_SAWHNEY.name}
                              </h5>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-xs text-stone-600 truncate">{AMIT_SAWHNEY.title}</p>
                            <p className="text-[10px] text-[#8C6D43] font-bold uppercase tracking-wider">
                              {AMIT_SAWHNEY.brokerage} • {AMIT_SAWHNEY.license}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={`tel:${AMIT_SAWHNEY.phone}`}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#0F2942] hover:bg-[#183759] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Call Direct</span>
                          </a>

                          <a
                            href={`mailto:${AMIT_SAWHNEY.email}`}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#0F2942]" />
                            <span>Email Amit</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer CTA: Instant Booking */}
                  <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 shrink-0">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenConsultationModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-stone-950 text-stone-950" />
                      <span>Book 1-on-1 VIP Strategy Call</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};
