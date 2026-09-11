import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectGrid } from './components/ProjectGrid';
import { CommunitiesSection } from './components/CommunitiesSection';
import { AgentProfile } from './components/AgentProfile';
import { StatementBanner } from './components/StatementBanner';
import { TakeNextStepSection } from './components/TakeNextStepSection';
import { Footer } from './components/Footer';

// Modals
import { ProjectModal } from './components/ProjectModal';
import { ResaleModal } from './components/ResaleModal';
import { HomeValuationModal } from './components/HomeValuationModal';
import { VIPForm } from './components/VIPForm';
import { ClientViewModal, RegisteredClient } from './components/ClientViewModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { AgentLeadsModal } from './components/AgentLeadsModal';
import { ConsultationModal } from './components/ConsultationModal';
import { AuthModal } from './components/AuthModal';
import { PropertyComparisonModal } from './components/PropertyComparisonModal';
import { ComparisonBar } from './components/ComparisonBar';
import { CashbackEligibilityModal } from './components/CashbackEligibilityModal';
import { CashbackTeaser } from './components/CashbackTeaser';
import { CashbackPage } from './components/CashbackPage';
import { SellerPage } from './components/SellerPage';
import { ListingsPage } from './components/ListingsPage';
import { PreconstructionPage } from './components/PreconstructionPage';
import { updateProjectSEO } from './utils/seo';

// Types & Data
import { Project, FilterState, ResaleListing, CommunityInfo } from './types';
import { PROJECTS_DATA } from './data/projects';
import { RESALE_LISTINGS_DATA } from './data/resale';
import { COMMUNITIES_DATA } from './data/communities';
import { AMIT_SAWHNEY } from './data/agent';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [resaleListings, setResaleListings] = useState<ResaleListing[]>(RESALE_LISTINGS_DATA);
  const [communities, setCommunities] = useState<CommunityInfo[]>(COMMUNITIES_DATA);
  const [savedFavoriteIds, setSavedFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('blueprint_favorites');
      return saved ? JSON.parse(saved) : ['resale-whitby-shores-executive'];
    } catch {
      return ['resale-whitby-shores-executive'];
    }
  });

  const handleToggleFavorite = (id: string) => {
    setSavedFavoriteIds(prev => {
      const updated = prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id];
      try {
        localStorage.setItem('blueprint_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchQuery: '',
    city: 'All',
    propertyType: 'All',
    status: 'All',
    minBeds: 0,
    maxPrice: 0,
    occupancyYear: 'All',
    sortBy: 'featured'
  });

  const [activeSection, setActiveSection] = useState<string>('projects');
  
  // Selected Community City from Community Panel
  const [selectedCommunityCity, setSelectedCommunityCity] = useState<string>('All');

  // Dedicated Page State ('home' | 'preconstruction' | 'cashback' | 'seller' | 'listings')
  const [currentPage, setCurrentPage] = useState<'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (path === '/preconstruction' || params.get('page') === 'preconstruction' || window.location.hash === '#preconstruction') {
        return 'preconstruction';
      }
      if (path === '/cashback' || params.get('page') === 'cashback' || window.location.hash === '#cashback-page') {
        return 'cashback';
      }
      if (path === '/seller' || params.get('page') === 'seller' || window.location.hash === '#seller') {
        return 'seller';
      }
      if (path === '/listings' || params.get('page') === 'listings' || window.location.hash === '#listings') {
        return 'listings';
      }
    }
    return 'home';
  });

  // Browser navigation popstate listener (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (path === '/preconstruction' || params.get('page') === 'preconstruction' || window.location.hash === '#preconstruction') {
        setCurrentPage('preconstruction');
      } else if (path === '/cashback' || params.get('page') === 'cashback' || window.location.hash === '#cashback-page') {
        setCurrentPage('cashback');
      } else if (path === '/seller' || params.get('page') === 'seller' || window.location.hash === '#seller') {
        setCurrentPage('seller');
      } else if (path === '/listings' || params.get('page') === 'listings' || window.location.hash === '#listings') {
        setCurrentPage('listings');
        const cityParam = params.get('city');
        if (cityParam) setSelectedCommunityCity(cityParam);
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update Page Title and Meta Description when switching pages
  useEffect(() => {
    if (currentPage === 'preconstruction') {
      document.title = "Platinum Pre-Construction Developments & ROIC Calculator | Amit Sawhney REALTOR®";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Explore premier pre-construction master-planned developments, townhomes, and condos across the GTA & Durham Region. Calculate your projected Return on Invested Capital (ROIC) with Amit Sawhney.'
        );
      }
    } else if (currentPage === 'cashback') {
      document.title = "Buyer Commission Cashback & Rebate Program | Up to 1.0% Back | Amit Sawhney REALTOR®";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Receive up to 1.0% purchase price commission cashback (~40% of co-op commission) on closing for eligible Ontario pre-construction and resale properties with Amit Sawhney REALTOR®. Full fiduciary representation, 100% RECO compliant.'
        );
      }
    } else if (currentPage === 'seller') {
      document.title = "Sell Your Home for 1% Listing Fee | Full-Service MLS® Representation | Amit Sawhney REALTOR®";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Sell your home for just 1% listing fee with Amit Sawhney REALTOR®. Full-service MLS® listing, HDR photography, 3D Matterport virtual tour, staging consultation, and expert negotiation. Save $15,000+.'
        );
      }
    } else if (currentPage === 'listings') {
      document.title = selectedCommunityCity && selectedCommunityCity !== 'All'
        ? `${selectedCommunityCity} Live MLS® Listings | REALTOR.ca Feed | Amit Sawhney`
        : "Live MLS® Listings Across Ontario | REALTOR.ca Feed | Amit Sawhney REALTOR®";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Browse live MLS® listings across Ontario directly from the REALTOR.ca feed. Detached homes, townhomes, and condos in Whitby, Brooklin, Oshawa, and the GTA with Amit Sawhney.'
        );
      }
    } else {
      document.title = "Amit Sawhney Real Estate | Pre-Construction & Resale Homes GTA & Durham Region";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Discover premium pre-construction developments, new communities, and resale homes across the GTA and Durham Region with Amit Sawhney, Licensed Ontario REALTOR®.'
        );
      }
    }
  }, [currentPage, selectedCommunityCity]);

  // Navigate between Home, Pre-Construction, Cashback, Seller, and Listings Page
  const handleNavigate = (page: 'home' | 'preconstruction' | 'cashback' | 'seller' | 'listings', targetSectionId?: string) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      let newUrl = '/';
      if (page === 'preconstruction') newUrl = '/preconstruction';
      else if (page === 'cashback') newUrl = '/cashback';
      else if (page === 'seller') newUrl = '/seller';
      else if (page === 'listings') {
        newUrl = targetSectionId && targetSectionId !== 'All' ? `/listings?city=${encodeURIComponent(targetSectionId)}` : '/listings';
        if (targetSectionId) setSelectedCommunityCity(targetSectionId);
      }

      window.history.pushState({ page, city: targetSectionId }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (targetSectionId) {
        setTimeout(() => {
          const el = document.getElementById(targetSectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  };
  
  // Registered Customer State (Persisted in localStorage)
  const [registeredClient, setRegisteredClient] = useState<RegisteredClient | null>(() => {
    try {
      const saved = localStorage.getItem('blueprint_registered_client');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleRegisterClient = (client: RegisteredClient | null) => {
    setRegisteredClient(client);
    if (client) {
      localStorage.setItem('blueprint_registered_client', JSON.stringify(client));
    } else {
      localStorage.removeItem('blueprint_registered_client');
    }
  };

  // Modals state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedResale, setSelectedResale] = useState<ResaleListing | null>(null);
  const [valuationModalOpen, setValuationModalOpen] = useState<boolean>(false);
  const [vipModalOpen, setVipModalOpen] = useState<boolean>(false);
  const [vipProjectId, setVipProjectId] = useState<string | undefined>(undefined);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [leadsModalOpen, setLeadsModalOpen] = useState<boolean>(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState<boolean>(false);
  const [cashbackModalOpen, setCashbackModalOpen] = useState<boolean>(false);
  const [cashbackInitialData, setCashbackInitialData] = useState<{
    purchasePrice?: number;
    targetProject?: string;
    transactionType?: 'Pre-Construction' | 'Resale';
    projectId?: string;
  } | undefined>(undefined);

  const handleOpenCashbackEligibility = (data?: {
    purchasePrice?: number;
    targetProject?: string;
    transactionType?: 'Pre-Construction' | 'Resale';
    projectId?: string;
  }) => {
    setCashbackInitialData(data);
    setCashbackModalOpen(true);
  };

  // Client View Modal State
  const [clientViewOpen, setClientViewOpen] = useState<boolean>(false);
  const [clientViewProject, setClientViewProject] = useState<Project | null>(null);

  // Property Comparison State (up to 3 projects)
  const [compareProjects, setCompareProjects] = useState<Project[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const handleToggleCompare = (project: Project) => {
    setCompareProjects(prev => {
      const exists = prev.some(p => p.id === project.id);
      if (exists) {
        return prev.filter(p => p.id !== project.id);
      }
      if (prev.length >= 3) {
        setCompareNotice('You can compare up to 3 properties at a time. Remove one to add another.');
        setTimeout(() => setCompareNotice(null), 3500);
        return prev;
      }
      return [...prev, project];
    });
  };

  const handleRemoveFromCompare = (projectId: string) => {
    setCompareProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleAddProjectToCompare = (project: Project) => {
    setCompareProjects(prev => {
      if (prev.some(p => p.id === project.id)) return prev;
      if (prev.length >= 3) {
        setCompareNotice('Maximum of 3 projects reached for comparison.');
        setTimeout(() => setCompareNotice(null), 3500);
        return prev;
      }
      return [...prev, project];
    });
  };

  const handleClearCompare = () => {
    setCompareProjects([]);
  };

  // Fetch projects, resale listings, and communities from server API on mount
  useEffect(() => {
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(err => {
        console.log('Using local fallback project data', err);
      });

    fetch('/api/resale')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setResaleListings(data);
        }
      })
      .catch(err => {
        console.log('Using local fallback resale data', err);
      });

    fetch('/api/communities')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCommunities(data);
        }
      })
      .catch(err => {
        console.log('Using local fallback community data', err);
      });
  }, []);

  // Dynamically inject specific SEO meta tags, OpenGraph, Twitter cards & JSON-LD when a project modal is open
  useEffect(() => {
    updateProjectSEO(selectedProject);

    // Synchronize URL query parameter for deep-linking, social sharing, and search indexing
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedProject) {
        url.searchParams.set('project', selectedProject.id);
        window.history.replaceState({ projectId: selectedProject.id }, '', url.toString());
      } else {
        if (url.searchParams.has('project')) {
          url.searchParams.delete('project');
          const cleanUrl = url.pathname + (url.search ? url.search : '') + url.hash;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    }

    return () => {
      if (selectedProject) {
        updateProjectSEO(null);
      }
    };
  }, [selectedProject]);

  // Deep-linking: Automatically open project modal if ?project=<id> is in URL on load
  useEffect(() => {
    if (typeof window !== 'undefined' && projects.length > 0 && !selectedProject) {
      const params = new URLSearchParams(window.location.search);
      const projectIdParam = params.get('project');
      if (projectIdParam) {
        const found = projects.find(p => p.id.toLowerCase() === projectIdParam.toLowerCase());
        if (found) {
          setSelectedProject(found);
        }
      }
    }
  }, [projects]);

  const handleOpenVIPModal = (projectId?: string) => {
    setVipProjectId(projectId);
    setVipModalOpen(true);
  };

  const handleOpenClientView = (project?: Project) => {
    const projToUse = project || selectedProject || projects[0] || null;
    setClientViewProject(projToUse);
    setClientViewOpen(true);
  };

  const handleSelectCommunity = (commName: string | CommunityInfo) => {
    const targetName = typeof commName === 'string' ? commName : commName.name;
    setSelectedCommunityCity(targetName);
    setFilters(prev => ({
      ...prev,
      city: targetName
    }));
    handleNavigate('listings', targetName);
  };

  const selectedVIPProject = projects.find(p => p.id === vipProjectId) || selectedProject || null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FBFBFA] text-stone-900 font-sans selection:bg-[#C5A880] selection:text-stone-950">
      {/* Top Header Navbar */}
      <Header
        onOpenVIPModal={handleOpenVIPModal}
        onOpenAIModal={() => setAiModalOpen(true)}
        onOpenLeadsModal={() => setLeadsModalOpen(true)}
        onOpenConsultationModal={() => setConsultationModalOpen(true)}
        onOpenClientView={() => handleOpenClientView()}
        onOpenValuation={() => setValuationModalOpen(true)}
        onOpenCompareModal={() => setCompareModalOpen(true)}
        compareCount={compareProjects.length}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {currentPage === 'seller' ? (
        /* Dedicated Seller Page (Modeled after Zown 1% Listing Model) */
        <SellerPage
          onBackToHome={() => handleNavigate('home')}
          onOpenConsultationModal={(topic, notes) => setConsultationModalOpen(true)}
          onOpenValuationModal={() => setValuationModalOpen(true)}
        />
      ) : currentPage === 'listings' ? (
        /* Dedicated Listings Page (All Live Listings from REALTOR.ca Feed) */
        <ListingsPage
          initialCity={selectedCommunityCity}
          onBackToHome={() => handleNavigate('home')}
          onSelectListing={p => setSelectedResale(p as any)}
          onOpenConsultation={(topic, notes) => setConsultationModalOpen(true)}
          onOpenValuation={() => setValuationModalOpen(true)}
          onOpenCashbackEligibility={handleOpenCashbackEligibility}
          savedFavoriteIds={savedFavoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : currentPage === 'preconstruction' ? (
        /* Dedicated Pre-Construction Page with ROIC Calculator */
        <PreconstructionPage
          projects={projects}
          onBackToHome={() => handleNavigate('home')}
          onSelectProject={p => setSelectedProject(p)}
          onOpenVIPModal={handleOpenVIPModal}
          onOpenClientView={handleOpenClientView}
          compareProjects={compareProjects}
          onToggleCompare={handleToggleCompare}
          onOpenCompareModal={() => setCompareModalOpen(true)}
          onOpenCashbackEligibility={handleOpenCashbackEligibility}
          onNavigateCashback={() => handleNavigate('cashback')}
          onOpenConsultation={(topic, notes) => setConsultationModalOpen(true)}
          onOpenValuation={() => setValuationModalOpen(true)}
        />
      ) : currentPage === 'cashback' ? (
        /* Dedicated Cashback & Buyer Rebate Page (Inspired by sharlenechang.com luxury editorial design) */
        <CashbackPage
          onBackToHome={() => handleNavigate('home')}
          onOpenEligibilityModal={handleOpenCashbackEligibility}
          onOpenConsultationModal={(topic, notes) => setConsultationModalOpen(true)}
          onOpenValuation={() => setValuationModalOpen(true)}
        />
      ) : (
        <>
          {/* Hero Section with Architectural Slideshow and Quick Search Console (hp-slideshow & hp-qs) */}
          <Hero
            filters={filters}
            setFilters={setFilters}
            onOpenVIPModal={() => handleOpenVIPModal()}
            onOpenAIModal={() => setAiModalOpen(true)}
            onOpenValuation={() => setValuationModalOpen(true)}
            onOpenConsultation={(topic, notes) => setConsultationModalOpen(true)}
            totalProjectsCount={projects.length}
            totalResaleCount={resaleListings.length}
            onOpenSellerPage={() => handleNavigate('seller')}
            onOpenPreconPage={() => handleNavigate('preconstruction')}
            onOpenListingsPage={() => handleNavigate('listings')}
          />

          {/* About Amit Sawhney: Editorial Magazine Profile & FAQ (hp-welcome) */}
          <AgentProfile
            onOpenConsultationModal={() => setConsultationModalOpen(true)}
            onOpenVIPModal={() => handleOpenVIPModal()}
          />

          {/* Statement Banner: High-Touch Fiduciary Call-to-Action (hp-statement) */}
          <StatementBanner
            onOpenVIPModal={() => handleOpenVIPModal()}
            onOpenConsultation={(topic, notes) => setConsultationModalOpen(true)}
            onOpenValuation={() => setValuationModalOpen(true)}
          />

          {/* Featured Pre-Construction Catalog Teaser with Link to Dedicated Pre-Con Page (hp-listings) */}
          <ProjectGrid
            projects={projects}
            filters={filters}
            setFilters={setFilters}
            onSelectProject={p => setSelectedProject(p)}
            onOpenVIPModal={handleOpenVIPModal}
            onOpenClientView={handleOpenClientView}
            compareProjects={compareProjects}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setCompareModalOpen(true)}
            onOpenCashbackEligibility={handleOpenCashbackEligibility}
            isTeaser={true}
            onViewAllPrecon={() => handleNavigate('preconstruction')}
          />

          {/* Informative Buyer Cashback Teaser Section with CTA to Dedicated Cashback Page */}
          <CashbackTeaser
            onNavigateToCashback={() => handleNavigate('cashback')}
            onOpenEligibilityModal={() => handleOpenCashbackEligibility()}
          />

          {/* Curated Neighborhood Showcase (hp-map: Explore The Area) */}
          <CommunitiesSection
            communities={communities}
            onSelectCommunity={handleSelectCommunity}
            onOpenConsultation={(topic, notes) => setConsultationModalOpen(true)}
            onViewAllListings={(city) => handleNavigate('listings', city)}
          />

          {/* Take The Next Step: 4 Luxury Action Pathways (hp-nstep) */}
          <TakeNextStepSection
            onOpenVIPModal={() => handleOpenVIPModal()}
            onOpenConsultation={(topic, notes) => setConsultationModalOpen(true)}
            onOpenValuation={() => setValuationModalOpen(true)}
            onNavigateHomeSearch={() => handleNavigate('listings')}
            onNavigatePrecon={() => handleNavigate('preconstruction')}
          />
        </>
      )}

      {/* Comprehensive Footer & Regulatory Disclosures */}
      <Footer
        onOpenVIPModal={() => handleOpenVIPModal()}
        onOpenConsultationModal={() => setConsultationModalOpen(true)}
        onOpenValuation={() => setValuationModalOpen(true)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Pre-Con Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenVIPModal={pId => {
          setSelectedProject(null);
          handleOpenVIPModal(pId);
        }}
        onOpenClientView={p => {
          setSelectedProject(null);
          handleOpenClientView(p);
        }}
        isCompared={selectedProject ? compareProjects.some(cp => cp.id === selectedProject.id) : false}
        onToggleCompare={handleToggleCompare}
        onOpenCashbackEligibility={handleOpenCashbackEligibility}
      />

      {/* Resale Property Detail Modal */}
      <ResaleModal
        listing={selectedResale}
        onClose={() => setSelectedResale(null)}
        onOpenConsultation={(topic, notes) => {
          setSelectedResale(null);
          setConsultationModalOpen(true);
        }}
        isFavorite={selectedResale ? savedFavoriteIds.includes(selectedResale.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenCashbackEligibility={handleOpenCashbackEligibility}
      />

      {/* Home Valuation (CMA) Modal */}
      <HomeValuationModal
        isOpen={valuationModalOpen}
        onClose={() => setValuationModalOpen(false)}
      />

      {/* In-App Registered Client View Modal */}
      <ClientViewModal
        isOpen={clientViewOpen}
        onClose={() => setClientViewOpen(false)}
        project={clientViewProject}
        registeredClient={registeredClient}
        onRegisterClient={handleRegisterClient}
        onOpenVIPModal={pId => {
          setClientViewOpen(false);
          handleOpenVIPModal(pId);
        }}
      />

      {/* VIP Interest Registration Modal */}
      <VIPForm
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        selectedProject={selectedVIPProject}
        projects={projects}
        onClientRegistered={handleRegisterClient}
      />

      {/* Gemini AI Advisor Modal */}
      <AIAdvisorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onOpenVIPModal={() => {
          setAiModalOpen(false);
          handleOpenVIPModal();
        }}
      />

      {/* Agent Leads Management Portal */}
      <AgentLeadsModal
        isOpen={leadsModalOpen}
        onClose={() => setLeadsModalOpen(false)}
      />

      {/* 1-on-1 Consultation Booking Modal */}
      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
      />

      {/* Agent and Client Authentication Modal */}
      <AuthModal />

      {/* Floating Comparison Dock Bar */}
      <ComparisonBar
        selectedProjects={compareProjects}
        onRemoveProject={handleRemoveFromCompare}
        onClearAll={handleClearCompare}
        onOpenCompareModal={() => setCompareModalOpen(true)}
      />

      {/* Property Specifications Comparison View */}
      <PropertyComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedProjects={compareProjects}
        allProjects={projects}
        onRemoveProject={handleRemoveFromCompare}
        onAddProject={handleAddProjectToCompare}
        onClearAll={handleClearCompare}
        onOpenProjectDetail={project => {
          setCompareModalOpen(false);
          setSelectedProject(project);
        }}
        onOpenVIPModal={projectId => {
          setCompareModalOpen(false);
          handleOpenVIPModal(projectId);
        }}
        onOpenClientView={project => {
          setCompareModalOpen(false);
          handleOpenClientView(project);
        }}
      />

      {/* Cashback Rebate Eligibility & Savings Calculator Modal */}
      <CashbackEligibilityModal
        isOpen={cashbackModalOpen}
        onClose={() => setCashbackModalOpen(false)}
        initialData={cashbackInitialData}
        onOpenConsultation={interest => setConsultationModalOpen(true)}
      />

      {/* Comparison Toast Alert */}
      {compareNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0F2942] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-[#C5A880] flex items-center gap-2 animate-bounce">
          <Scale className="w-4 h-4 text-[#C5A880]" />
          <span>{compareNotice}</span>
        </div>
      )}
    </div>
  );
}

