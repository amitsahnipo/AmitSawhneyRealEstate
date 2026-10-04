import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronDown,
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
  Scale,
  Star,
  Percent,
  Flame,
  Clock,
  ExternalLink
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
  currentPage?: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings' | 'valuation' | 'client-portal' | 'agent-portal';
  onNavigate?: (page: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings' | 'valuation' | 'client-portal' | 'agent-portal', targetSectionId?: string) => void;
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
  
  // Navigation states
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'buy' | 'sell' | 'tools' | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  const buyDropdownRef = useRef<HTMLDivElement>(null);
  const sellDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu & dropdowns on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false);
        if (activeDropdown) setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, activeDropdown]);

  // Lock body scroll when mobile drawer is open
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
    setActiveDropdown(null);
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

  const handlePageNavigation = (
    page: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings' | 'valuation' | 'client-portal' | 'agent-portal',
    targetSectionId?: string
  ) => {
    setActiveDropdown(null);
    setMenuOpen(false);

    if (page === 'client-portal') {
      if (isAgent) {
        // Agent does not have access to client portal
        if (onNavigate) {
          onNavigate('agent-portal');
        } else {
          onOpenLeadsModal();
        }
        return;
      }
      if (!isAuthenticated || !isClient) {
        openAuthModal({
          role: 'CLIENT',
          tab: 'login',
          customTitle: 'Registered Client Access Required',
          customMessage: 'The Client Portal is tied to your account and reserved for registered clients. Please sign in or register to access confidential worksheets, floor plans, and pricing.'
        });
        return;
      }
    }

    if (onNavigate) {
      onNavigate(page, targetSectionId);
    } else if (targetSectionId) {
      handleScrollToSection(targetSectionId);
    }
  };

  // Structured menu items for the Zown-inspired slide-over drawer
  const menuCategories = useMemo(() => [
    {
      id: 'buy',
      title: 'Buy Homes',
      subtitle: 'Browse MLS® listings, pre-construction launches & cash back rebates',
      badge: 'Up to 1% Rebate',
      items: [
        {
          title: 'Live MLS® Listings Feed',
          description: 'Search active homes for sale in Durham Region & Greater Toronto Area',
          icon: Home,
          badge: 'Live REALTOR.ca Feed',
          action: () => handlePageNavigation('listings')
        },
        {
          title: 'Pre-Construction VIP Launches',
          description: 'Exclusive first access to top builder pricing, capped levies & floor plans',
          icon: Building2,
          badge: 'Platinum VIP',
          action: () => handlePageNavigation('preconstruction')
        },
        {
          title: 'Buy Smart™ Cashback Program',
          description: 'Get up to 1.0% cash back at closing with $0 buyer commission fees',
          icon: Percent,
          badge: 'Save $8,000+',
          action: () => handlePageNavigation('cashback')
        },
        {
          title: 'Durham & GTA Neighborhood Guides',
          description: 'Explore Whitby, Brooklin, Oshawa, Courtice, Pickering, Ajax & Markham',
          icon: Layers,
          action: () => handleScrollToSection('communities')
        },
        {
          title: 'Mortgage & Deposit Calculator',
          description: 'Calculate monthly payments, stress test & staggered deposit structures',
          icon: Calculator,
          action: () => handleScrollToSection('calculator')
        }
      ]
    },
    {
      id: 'sell',
      title: 'Sell Your Home',
      subtitle: 'Full-service representation with modern 1% listing fee',
      badge: 'Save $15K+',
      items: [
        {
          title: 'Sell for 1% Listing Fee',
          description: 'Full-service MLS® listing, HDR photography, 3D Matterport & expert negotiation',
          icon: DollarSign,
          badge: 'Save $15,000+',
          action: () => handlePageNavigation('seller')
        },
        {
          title: 'Instant Home Value Estimator',
          description: 'AI-powered Comparative Market Analysis (CMA) based on verified sold comparables',
          icon: Calculator,
          badge: 'Instant AI Report',
          action: () => {
            setMenuOpen(false);
            if (onNavigate) {
              onNavigate('valuation');
            } else {
              onOpenValuation();
            }
          }
        },
        {
          title: 'Book Seller Strategy Consultation',
          description: 'Private 1-on-1 valuation meeting with Amit Sawhney at your home or via video call',
          icon: Calendar,
          badge: 'Free Valuation',
          action: () => {
            setMenuOpen(false);
            onOpenConsultationModal();
          }
        }
      ]
    },
    {
      id: 'tools',
      title: 'Tools & Intelligence',
      subtitle: 'AI-powered real estate tools and real-time market data',
      badge: 'AI Powered',
      items: [
        {
          title: 'Gemini AI Real Estate Assistant',
          description: 'Ask instant questions about Ontario pre-con rules, cooling-off periods & pricing',
          icon: Bot,
          badge: '24/7 Advisor',
          action: () => {
            setMenuOpen(false);
            onOpenAIModal();
          }
        },
        {
          title: 'Durham Market Pulse & TRREB Trends',
          description: 'Real-time sales velocity, days on market, and average price benchmarks',
          icon: TrendingUp,
          badge: 'Updated Weekly',
          action: () => handleScrollToSection('durham-market-pulse')
        },
        {
          title: 'VIP Floor Plan & Price Worksheets',
          description: 'Submit your builder unit preferences for upcoming project releases',
          icon: FileSpreadsheet,
          badge: 'VIP Worksheet',
          action: () => {
            setMenuOpen(false);
            onOpenVIPModal();
          }
        },
        ...(onOpenCompareModal ? [{
          title: 'Side-by-Side Property Comparison',
          description: 'Compare price per sq.ft, deposit milestones & completion dates',
          icon: Scale,
          badge: compareCount > 0 ? `${compareCount}/3 Selected` : 'Compare (3 Max)',
          action: () => {
            setMenuOpen(false);
            onOpenCompareModal();
          }
        }] : [])
      ]
    }
  ], [onNavigate, onOpenValuation, onOpenConsultationModal, onOpenAIModal, onOpenVIPModal, onOpenCompareModal, compareCount]);

  // Flattened items for search bar filtering
  const filteredSearchItems = useMemo(() => {
    if (!searchFilter.trim()) return [];
    const q = searchFilter.toLowerCase();
    const matches: Array<{
      title: string;
      description: string;
      category: string;
      badge?: string;
      icon: any;
      action: () => void;
    }> = [];

    menuCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
        ) {
          matches.push({ ...item, category: cat.title });
        }
      });
    });

    return matches;
  }, [searchFilter, menuCategories]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-900 shadow-xs transition-all">
        {/* Top Utility Bar (Zown-style Clean Trust & Hotline Header) */}
        <div className="w-full bg-[#0F2942] text-xs py-1.5 text-stone-200 border-b border-[#183759]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 min-w-0">
            {/* Left: Credential & Cashback Highlight */}
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
              <span className="inline-flex items-center gap-1.5 bg-[#17375A] text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border border-[#254F7F] shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span>Licensed Ontario REALTOR®</span>
              </span>
              <div className="hidden md:flex items-center gap-2 text-stone-300 text-[11px] truncate">
                <span className="text-stone-400">•</span>
                <span className="font-medium text-[#C5A880]">Buy Smart™ Cashback:</span>
                <span className="truncate">Up to 1.0% cash rebate on closing with $0 buyer commission fees</span>
              </div>
            </div>

            {/* Right: Direct Hotline & Portal Access */}
            <div className="flex items-center gap-4 shrink-0 text-xs">
              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="inline-flex items-center gap-1.5 text-[#C5A880] hover:text-white font-bold transition-colors whitespace-nowrap"
                title="Call or Text Amit Sawhney Directly"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span className="hidden sm:inline">Direct Hotline:</span>
                <span>{AMIT_SAWHNEY.phoneFormatted}</span>
              </a>

              <span className="hidden lg:inline text-stone-500">|</span>

              {/* Portal status / sign in */}
              {!isAuthenticated ? (
                <button
                  onClick={() => openAuthModal({ role: 'CLIENT', tab: 'login' })}
                  className="hidden lg:inline-flex items-center gap-1 text-stone-300 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  <User className="w-3 h-3 text-[#C5A880]" />
                  <span>Portal Login</span>
                </button>
              ) : isAgent ? (
                <button
                  onClick={onOpenLeadsModal}
                  className="hidden lg:inline-flex items-center gap-1 text-[#C5A880] hover:text-white font-semibold transition-colors cursor-pointer text-xs"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Agent CRM</span>
                </button>
              ) : isClient ? (
                <button
                  onClick={() => handlePageNavigation('client-portal')}
                  className="hidden lg:inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer text-xs"
                >
                  <User className="w-3 h-3" />
                  <span>Client Portal</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div
          ref={navContainerRef}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4"
        >
          {/* Brand Logo (Zown-style Modern Clean Wordmark) */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => handlePageNavigation('home', 'hero')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0F2942] border border-[#C5A880]/60 p-0.5 shadow-sm group-hover:border-[#C5A880] transition-colors shrink-0 flex items-center justify-center">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-[#0F2942] font-serif whitespace-nowrap">
                  AMIT SAWHNEY
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 bg-[#C5A880]/15 text-[#8C6D43] text-[9px] font-extrabold rounded-sm uppercase tracking-wider">
                  Brokerage
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8C6D43] font-bold truncate">
                Blueprint Realty • REALTOR®
              </p>
            </div>
          </div>

          {/* Desktop Navigation Menu with Zown-Style Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-stone-700">
            {/* 1. BUY DROPDOWN */}
            <div
              ref={buyDropdownRef}
              className="relative"
              onMouseEnter={() => setActiveDropdown('buy')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'buy' ? null : 'buy')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeDropdown === 'buy' || currentPage === 'listings' || currentPage === 'preconstruction' || currentPage === 'cashback'
                    ? 'text-[#0F2942] font-bold bg-stone-100'
                    : 'hover:text-[#0F2942] hover:bg-stone-50'
                }`}
              >
                <span>Buy</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                    activeDropdown === 'buy' ? 'rotate-180 text-[#0F2942]' : ''
                  }`}
                />
              </button>

              {/* Buy Mega-Dropdown Card */}
              <AnimatePresence>
                {activeDropdown === 'buy' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full pt-2 w-96 z-50"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 space-y-1">
                      <div className="px-3 py-2 border-b border-stone-100 mb-1">
                        <span className="text-[10px] font-extrabold text-[#8C6D43] uppercase tracking-wider">
                          Homebuyer Services & Tools
                        </span>
                      </div>

                      <button
                        onClick={() => handlePageNavigation('listings')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                              MLS® Listings Feed
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Live
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Search all active homes for sale across Durham & GTA
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handlePageNavigation('preconstruction')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                              Pre-Construction VIP
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#0F2942] text-[#C5A880]">
                              Platinum Access
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Exclusive builder releases, floor plans & capped levies
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handlePageNavigation('cashback')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-[#8C6D43] flex items-center justify-center shrink-0 transition-colors">
                          <Percent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                              Cash Back (Up to 1% Back)
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#C5A880] text-stone-950">
                              Rebate
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Down payment boost & cash rebate at closing
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleScrollToSection('communities')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                            Communities & Neighborhoods
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Whitby, Brooklin, Oshawa, Courtice, Pickering & Ajax
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleScrollToSection('calculator')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <Calculator className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                            Mortgage & Deposit Calculator
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Live mortgage rates, stress test & payment schedules
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. SELL DROPDOWN (Zown 1% Model Inspired) */}
            <div
              ref={sellDropdownRef}
              className="relative"
              onMouseEnter={() => setActiveDropdown('sell')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'sell' ? null : 'sell')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeDropdown === 'sell' || currentPage === 'seller' || currentPage === 'valuation'
                    ? 'text-[#0F2942] font-bold bg-amber-50 border border-[#C5A880]/40'
                    : 'hover:text-[#0F2942] hover:bg-stone-50'
                }`}
              >
                <span>Sell</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#C5A880] text-stone-950 text-[9px] font-extrabold">
                  1% Fee
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                    activeDropdown === 'sell' ? 'rotate-180 text-[#0F2942]' : ''
                  }`}
                />
              </button>

              {/* Sell Mega-Dropdown Card */}
              <AnimatePresence>
                {activeDropdown === 'sell' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full pt-2 w-96 z-50"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 space-y-1">
                      <div className="px-3 py-2 border-b border-stone-100 mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#8C6D43] uppercase tracking-wider">
                          Full-Service Home Selling
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">Save $15K+</span>
                      </div>

                      <button
                        onClick={() => handlePageNavigation('seller')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-[#8C6D43] flex items-center justify-center shrink-0 transition-colors">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                              Sell for 1% Listing Fee
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#C5A880] text-stone-950">
                              Full Service
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            MLS® syndication, 3D Matterport, HDR media & negotiation
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          if (onNavigate) {
                            onNavigate('valuation');
                          } else {
                            onOpenValuation();
                          }
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <Calculator className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                              Free Home Valuation (AI CMA)
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                              Instant
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Discover your property value based on recent sold comparables
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenConsultationModal();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                            Book Listing Strategy Consultation
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Private in-person or virtual consultation with Amit Sawhney
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. CASH BACK DIRECT LINK (Zown Signature Highlight) */}
            <button
              onClick={() => handlePageNavigation('cashback')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'cashback'
                  ? 'text-[#0F2942] font-bold bg-stone-100'
                  : 'hover:text-[#0F2942] hover:bg-stone-50'
              }`}
            >
              <span>Cash Back</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                Up to 1%
              </span>
            </button>

            {/* 4. PRE-CONSTRUCTION DIRECT LINK */}
            <button
              onClick={() => handlePageNavigation('preconstruction')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                currentPage === 'preconstruction'
                  ? 'text-[#0F2942] font-bold bg-stone-100'
                  : 'hover:text-[#0F2942] hover:bg-stone-50'
              }`}
            >
              Pre-Con VIP
            </button>

            {/* VIP CLIENT PORTAL DIRECT LINK - ONLY FOR AUTHENTICATED CLIENTS */}
            {isAuthenticated && isClient && (
              <button
                onClick={() => handlePageNavigation('client-portal')}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  currentPage === 'client-portal'
                    ? 'text-emerald-900 font-bold bg-emerald-50 border border-emerald-300 shadow-xs'
                    : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Client Portal</span>
              </button>
            )}

            {/* 5. TOOLS & MARKET DROPDOWN */}
            <div
              ref={toolsDropdownRef}
              className="relative"
              onMouseEnter={() => setActiveDropdown('tools')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'tools' ? null : 'tools')}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeDropdown === 'tools'
                    ? 'text-[#0F2942] font-bold bg-stone-100'
                    : 'hover:text-[#0F2942] hover:bg-stone-50'
                }`}
              >
                <span>Market & Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                    activeDropdown === 'tools' ? 'rotate-180 text-[#0F2942]' : ''
                  }`}
                />
              </button>

              {/* Tools Mega-Dropdown */}
              <AnimatePresence>
                {activeDropdown === 'tools' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full pt-2 w-80 z-50"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 space-y-1">
                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenAIModal();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                              Ask AI Advisor
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              Gemini
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Instant answers on pre-con rules, cooling off & ROI
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleScrollToSection('durham-market-pulse')}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                            Durham Market Pulse
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            TRREB benchmark data & local market forecasts
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenVIPModal();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                            VIP Worksheet Submission
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Submit floor plan preferences for upcoming launches
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          onOpenLeadsModal();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] text-stone-700 flex items-center justify-center shrink-0 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43] transition-colors">
                            Agent CRM & Intelligence Portal
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            Update Durham Region insights, manage client offers & leads
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Suite (Decluttered, Modern, Zown-inspired) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Compare Badge Button (Visible if active) */}
            {compareCount > 0 && onOpenCompareModal && (
              <button
                onClick={onOpenCompareModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-[#0F2942] text-white border border-[#C5A880]/60 rounded-xl text-xs font-semibold shadow-xs transition-all whitespace-nowrap cursor-pointer"
                title="Compare Properties Side-by-Side"
              >
                <Scale className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span className="hidden md:inline">Compare</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#C5A880] text-stone-950">
                  {compareCount}
                </span>
              </button>
            )}

            {/* Ask AI Assistant Trigger Pill */}
            <button
              onClick={onOpenAIModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              title="Open Gemini AI Real Estate Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Ask AI</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
            </button>

            {/* Primary Action Button: "Book Call" / "Get Valuation" */}
            <button
              onClick={() => onOpenConsultationModal()}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950 shrink-0" />
              <span>Book Call</span>
            </button>

            {/* Hamburger / Menu Drawer Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                menuOpen
                  ? 'bg-[#C5A880] text-stone-950 shadow-md ring-2 ring-[#C5A880]/30'
                  : 'bg-[#0F2942] hover:bg-[#183759] text-white shadow-xs'
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-4 h-4 text-stone-950" />
              ) : (
                <Menu className="w-4 h-4 text-[#C5A880]" />
              )}
              <span className="hidden sm:inline font-bold">
                {menuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Portal-Mounted Full Screen / Slide-Over Navigation Drawer (Zown-style Clean App Experience) */}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {menuOpen && (
                <div className="fixed inset-0 z-[9999] overflow-hidden">
                  {/* Backdrop */}
                  <motion.div
                    key="drawer-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-[#0F2942]/75 backdrop-blur-sm cursor-pointer"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Sliding Drawer Container */}
                  <motion.div
                    key="drawer-panel"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    className="fixed inset-y-0 right-0 z-[10000] w-full sm:w-[480px] md:w-[540px] max-w-full bg-white shadow-2xl border-l border-stone-200 flex flex-col h-full overflow-hidden"
                  >
                    {/* Drawer Header */}
                    <div className="p-4 sm:p-5 bg-[#0F2942] text-white flex items-center justify-between border-b border-[#183759] shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#17375A] border border-[#C5A880]/50 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#C5A880]" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                            Amit Sawhney Real Estate
                          </h3>
                          <p className="text-xs text-[#C5A880] font-medium">
                            Blueprint Realty • Licensed REALTOR®
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setMenuOpen(false)}
                        className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-[#17375A] transition-colors cursor-pointer"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Drawer Search Filter Bar */}
                    <div className="p-4 bg-stone-50 border-b border-stone-200 shrink-0">
                      <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search MLS®, pre-con, cashback, valuation..."
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
                    </div>

                    {/* Drawer Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                      {/* Search results mode */}
                      {searchFilter ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            Found {filteredSearchItems.length} matching result{filteredSearchItems.length === 1 ? '' : 's'}
                          </p>
                          {filteredSearchItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={idx}
                                onClick={item.action}
                                className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex items-start gap-3 cursor-pointer group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-[#0F2942] group-hover:text-[#8C6D43]">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                                    {item.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <>
                          {/* User Account / Portal Quick Status Card */}
                          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                            {isAuthenticated ? (
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-stone-200 text-stone-800 uppercase">
                                      {user?.role}
                                    </span>
                                    <h5 className="font-bold text-xs text-stone-900 truncate">
                                      {user?.fullName}
                                    </h5>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isAgent ? (
                                    <button
                                      onClick={() => {
                                        setMenuOpen(false);
                                        onOpenLeadsModal();
                                      }}
                                      className="px-2.5 py-1 bg-[#0F2942] text-white rounded-lg text-xs font-bold"
                                    >
                                      CRM
                                    </button>
                                  ) : isClient ? (
                                    <button
                                      onClick={() => {
                                        setMenuOpen(false);
                                        handlePageNavigation('client-portal');
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                                    >
                                      Portal
                                    </button>
                                  ) : null}
                                  <button
                                    onClick={logout}
                                    className="p-1.5 text-stone-400 hover:text-red-600"
                                    title="Sign Out"
                                  >
                                    <LogOut className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                                    <KeyRound className="w-3.5 h-3.5 text-[#8C6D43]" />
                                    <span>Account Sign In</span>
                                  </div>
                                  <p className="text-[11px] text-stone-500">
                                    Worksheets, saved listings & CRM
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setMenuOpen(false);
                                    openAuthModal({ role: 'CLIENT', tab: 'login' });
                                  }}
                                  className="px-3 py-1.5 bg-[#0F2942] text-white rounded-lg text-xs font-bold"
                                >
                                  Sign In
                                </button>
                              </div>
                            )}

                            {/* Prominent Client Portal link inside drawer ONLY for authenticated clients */}
                            {isAuthenticated && isClient && (
                              <div className="mt-3 pt-3 border-t border-stone-200">
                                <button
                                  onClick={() => {
                                    setMenuOpen(false);
                                    handlePageNavigation('client-portal');
                                  }}
                                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Open VIP Client Portal</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Navigation Sections Categorized by Intent (Buy, Sell, Tools) */}
                          {menuCategories.map(cat => (
                            <div key={cat.id} className="space-y-2">
                              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                                <span className="text-xs font-extrabold text-[#0F2942] uppercase tracking-wider">
                                  {cat.title}
                                </span>
                                {cat.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C5A880]/15 text-[#8C6D43]">
                                    {cat.badge}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                {cat.items.map((item, idx) => {
                                  const Icon = item.icon;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={item.action}
                                      className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-[#0F2942] group-hover:text-[#C5A880] flex items-center justify-center shrink-0 transition-colors">
                                          <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#8C6D43] transition-colors truncate">
                                              {item.title}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-stone-500 truncate">
                                            {item.description}
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 shrink-0" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          {/* Direct Realtor Contact Card */}
                          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={AMIT_SAWHNEY.photo}
                                  alt={AMIT_SAWHNEY.name}
                                  className="w-11 h-11 rounded-full object-cover border-2 border-[#C5A880]"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-xs sm:text-sm text-[#0F2942]">
                                  {AMIT_SAWHNEY.name}
                                </h5>
                                <p className="text-[11px] text-stone-600 truncate">{AMIT_SAWHNEY.title}</p>
                                <p className="text-[10px] text-[#8C6D43] font-bold uppercase">
                                  {AMIT_SAWHNEY.brokerage}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`tel:${AMIT_SAWHNEY.phone}`}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F2942] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#183759] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                                <span>Call Direct</span>
                              </a>
                              <a
                                href={`mailto:${AMIT_SAWHNEY.email}`}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-stone-800 border border-stone-300 rounded-xl text-xs font-bold hover:bg-stone-100 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#0F2942]" />
                                <span>Email Amit</span>
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Drawer Footer CTA */}
                    <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenConsultationModal();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
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

      {/* Sticky Mobile Bottom Navigation Bar (Zown-style Mobile App Dock) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-5 gap-1 text-center">
          {/* 1. Explore / Listings */}
          <button
            onClick={() => handlePageNavigation('listings')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              currentPage === 'listings' ? 'text-[#0F2942] font-bold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">MLS® Feed</span>
          </button>

          {/* 2. Pre-Con VIP */}
          <button
            onClick={() => handlePageNavigation('preconstruction')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              currentPage === 'preconstruction' ? 'text-[#0F2942] font-bold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Pre-Con</span>
          </button>

          {/* 3. Cash Back (Center Highlight) */}
          <button
            onClick={() => handlePageNavigation('cashback')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer relative ${
              currentPage === 'cashback' ? 'text-[#C5A880] font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <div className="w-8 h-8 -mt-2 mb-0.5 rounded-full bg-[#0F2942] text-[#C5A880] flex items-center justify-center shadow-md">
              <Percent className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight font-bold">1% Rebate</span>
          </button>

          {/* 4. Sell for 1% */}
          <button
            onClick={() => handlePageNavigation('seller')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              currentPage === 'seller' || currentPage === 'valuation' ? 'text-[#0F2942] font-bold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Sell (1%)</span>
          </button>

          {/* 5. Ask AI / Hotline */}
          <button
            onClick={onOpenAIModal}
            className="flex flex-col items-center justify-center py-1 rounded-lg transition-colors text-[#8C6D43] hover:text-[#0F2942] cursor-pointer"
          >
            <Bot className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight font-bold">Ask AI</span>
          </button>
        </div>
      </div>
    </>
  );
};
