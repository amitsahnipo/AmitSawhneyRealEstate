import React, { useState } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Sparkles,
  Home,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Camera,
  Layers,
  Award,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Check,
  Zap,
  Tag,
  FileText,
  BadgeCheck,
  Eye,
  RefreshCw,
  Send,
  Sliders,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';
import { PropertyValuationTool } from './valuation/PropertyValuationTool';

interface SellerPageProps {
  onBackToHome: () => void;
  onOpenConsultationModal: (topic?: string, notes?: string) => void;
  onOpenValuationModal: () => void;
}

export const SellerPage: React.FC<SellerPageProps> = ({
  onBackToHome,
  onOpenConsultationModal,
  onOpenValuationModal
}) => {
  // Calculator state
  const [salePrice, setSalePrice] = useState<number>(1050000);
  const [buyerAgentFeePct, setBuyerAgentFeePct] = useState<number>(2.5);
  const [mortgageBalance, setMortgageBalance] = useState<number>(450000);
  const [showNetProceeds, setShowNetProceeds] = useState<boolean>(true);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Commission Calculations
  const traditionalListingFee = salePrice * 0.025;
  const smartListingFee = salePrice * 0.01;
  const buyerAgentFee = salePrice * (buyerAgentFeePct / 100);

  const traditionalHst = (traditionalListingFee + buyerAgentFee) * 0.13;
  const smartHst = (smartListingFee + buyerAgentFee) * 0.13;

  const totalTraditionalCost = traditionalListingFee + buyerAgentFee + traditionalHst;
  const totalSmartCost = smartListingFee + buyerAgentFee + smartHst;

  // Direct Savings
  const directCommissionSavings = traditionalListingFee - smartListingFee;
  const hstSavings = traditionalHst - smartHst;
  const totalSellerSavings = directCommissionSavings + hstSavings;

  // Net Proceeds calculation
  const estimatedLegalFees = 1850;
  const estimatedNetProceeds = Math.max(0, salePrice - totalSmartCost - mortgageBalance - estimatedLegalFees);

  const pillarsOfAdvisory = [
    {
      num: '01',
      title: 'Architectural Media & Cinematic Film',
      subtitle: 'Magazine-Standard Stills & 4K Aerials',
      description:
        'Every listing is captured as an architectural masterpiece. We deploy accredited luxury interior photographers, twilight golden-hour captures, licensed 4K drone cinematography, and immersive 3D Matterport walkthroughs to captivate high-net-worth buyers locally and worldwide.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      num: '02',
      title: 'Precision Staging & Spatial Curation',
      subtitle: 'In-Home Design Optimization',
      description:
        'Staging is the art of emotional connection. Amit conducts a thorough architectural walkthrough to curate furniture placement, optimize sightlines, maximize perceived natural light, and accent key focal points so prospective purchasers immediately envision their elevated lifestyle.',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    },
    {
      num: '03',
      title: 'Omni-Channel Global & MLS® Syndication',
      subtitle: 'Maximum Qualified Buyer Exposure',
      description:
        'Your residence is syndicated to 70,000+ Ontario REALTORS® across TRREB MLS®, Realtor.ca, Zolo, HouseSigma, and luxury international buyer registries. We combine this with precision social campaigns and targeted outreach to pre-qualified buyers seeking your specific neighborhood.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    },
    {
      num: '04',
      title: 'Fierce Fiduciary Negotiation',
      subtitle: 'Protecting Price & Settlement Terms',
      description:
        'A higher sale price is won at the negotiating table. Amit Sawhney architects strategic offer presentation dates, handles multiple-offer dynamics with composure, and enforces protective deposit conditions — maximizing your net walk-away proceeds without compromising terms.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      num: '05',
      title: 'The 1% Equity Advantage',
      subtitle: 'Full-Service Representation. Zero Excess Fees.',
      description:
        'Why forfeit $15,000 to $30,000+ of your family’s hard-earned home equity to legacy 2.5% listing fees? We deliver an uncompromising white-glove listing service at a disciplined 1.0% listing fee, putting tens of thousands back into your pocket on closing day.',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const conciergeRoadmap = [
    {
      step: '01',
      title: 'Micro-Market Pricing & Strategy',
      desc: 'In-depth comparative market analysis cross-referencing recent neighborhood solds, pending sales, and buyer absorption rates to establish your optimal listing price.'
    },
    {
      step: '02',
      title: 'Staging, Styling & Media Production',
      desc: 'Concierge preparation including interior staging consultation, repairs audit, twilight photography, 4K video reel, and architectural 3D scanning.'
    },
    {
      step: '03',
      title: 'Multi-Channel Market Launch',
      desc: 'Simultaneous MLS® board syndication, high-impact social campaigns, private client notifications, and high-gloss digital feature brochures.'
    },
    {
      step: '04',
      title: 'Showings & Strategic Offer Architecture',
      desc: 'Accompanied showings, vetted buyer verification, open house hosting, and aggressive negotiation to achieve unconditional, record-setting offers.'
    },
    {
      step: '05',
      title: 'Firm Contract & Closing Coordination',
      desc: 'Smooth transaction management with your real estate lawyer, status certificate reviews, deposit escrow management, and net proceeds transfer.'
    }
  ];

  const comparisonFeatures = [
    {
      feature: 'Dedicated Licensed REALTOR® Representation',
      description: 'Direct, high-touch advisory from Amit Sawhney (Licensed REALTOR®) from initial consult to key handover',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: 'Full MLS®, Realtor.ca & TRREB Board Syndication',
      description: 'Broadcasted to 70,000+ Ontario agents and millions of active buyers on Realtor.ca, Zolo & HouseSigma',
      smart1Pct: true,
      traditional: true,
      merePosting: true
    },
    {
      feature: 'Comprehensive Comparative Market Analysis (CMA)',
      description: 'Algorithmic and hand-verified pricing strategy based on hyper-local sold comparables',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: 'Architectural Photography & 4K Drone Aerials',
      description: 'Magazine-quality interior and exterior stills, twilight captures, and aerial video',
      smart1Pct: true,
      traditional: 'Sometimes',
      merePosting: false
    },
    {
      feature: 'Interactive 3D Virtual Tour & Floor Plans',
      description: 'Immersive Matterport 3D walkthrough allowing remote and international buyers to explore',
      smart1Pct: true,
      traditional: 'Often Extra',
      merePosting: false
    },
    {
      feature: 'In-Person Professional Staging Consultation',
      description: 'Walkthrough and room-by-room preparation advice to maximize perceived value and square footage',
      smart1Pct: true,
      traditional: 'Often Extra',
      merePosting: false
    },
    {
      feature: 'Full Offer Negotiation & Legal Review',
      description: 'Fierce contract negotiation protecting your price, closing dates, and deposit conditions',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: 'Listing Commission Charged to Seller',
      description: 'The fee paid to your listing brokerage on closing',
      smart1Pct: '1.0% (Save $15K+)',
      traditional: '2.5% (High Cost)',
      merePosting: 'Flat Fee (DIY Risk)'
    },
    {
      feature: 'Upfront Marketing Fees or Hidden Charges',
      description: 'All advertising, photography, and signage fully covered with zero out-of-pocket costs',
      smart1Pct: '$0 Upfront',
      traditional: '$0 Upfront',
      merePosting: '$500–$2,000 Upfront'
    }
  ];

  const faqs = [
    {
      q: 'How can you offer full-service representation for just 1% listing fee?',
      a: 'Modern technology, digital marketing efficiencies, and an independent brokerage model allow us to operate with minimal legacy corporate overhead. We pass those structural savings directly to our clients. You receive the exact same high-end architectural photography, MLS® board syndication, professional staging advice, and seasoned negotiation that traditional brokerages charge 2.5% for.'
    },
    {
      q: 'Will cooperating buyer agents still show and sell my home at 1%?',
      a: 'Yes, absolutely. The 1% listing fee applies exclusively to the listing side (Amit Sawhney’s representation). You still offer the standard cooperating buyer agent commission (typically 2.0% to 2.5%) on the MLS® system. Buyer agents receive their full standard commission and have full financial incentive to bring their qualified buyers to your home.'
    },
    {
      q: 'Are there any upfront fees or hidden charges if my home doesn’t sell?',
      a: 'No. Zero upfront fees. We cover 100% of the cost for high-end photography, cinematic video, drone footage, 3D Matterport scans, signage, and online advertising. If your home does not sell, you owe us nothing.'
    },
    {
      q: 'What is the Sell & Buy Bundle advantage?',
      a: 'If you sell your current home with Amit Sawhney and also purchase your next home (resale or pre-construction) through our advisory, you receive our exclusive Buy Smart™ Commission Cashback on the purchase side in addition to your 1% listing savings — maximizing your total family equity.'
    },
    {
      q: 'Can I cancel my listing agreement if I change my mind?',
      a: 'Yes. We believe in earning your trust every single day. We offer a hassle-free cancellation guarantee if you are not 100% satisfied with our representation prior to accepting an unconditional offer.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#C5A880]/30 selection:text-stone-900 font-sans">
      
      {/* Editorial Top Announcement Bar */}
      <div className="bg-[#0B1E30] text-stone-200 border-b border-[#1E3A8A]/40 text-xs py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
            <span className="tracking-wide">
              Bespoke Seller Representation Across the GTA & Durham Region • Full-Service Advisory at 1%
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] tracking-wider uppercase font-semibold">
            <a
              href="tel:6478953613"
              className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-[#C5A880]" />
              <span>Direct Advisory: (647) 895-3613</span>
            </a>
            <span className="hidden md:inline text-stone-500">|</span>
            <button
              onClick={() => onOpenConsultationModal('Seller Strategy Session')}
              className="text-[#C5A880] hover:text-white underline cursor-pointer hidden md:inline"
            >
              Book Private Consultation
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. HERO SECTION: Editorial Luxury (Sharlene Chang Style)    */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FAF9F6]">
        {/* Subtle geometric hairline accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none border-x border-[#E7E2D8]/60" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Breadcrumb & Subtitle */}
          <div className="flex items-center justify-between pb-8 mb-6 border-b border-[#E7E2D8]">
            <button
              onClick={onBackToHome}
              className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Return to Home</span>
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              <Sparkle className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Bespoke Real Estate Representation</span>
            </div>
          </div>

          {/* Hero Editorial Headline */}
          <div className="space-y-6 max-w-4xl">
            <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold text-[#8C6D43] bg-amber-50 px-3 py-1 rounded-full border border-[#C5A880]/30">
              The 1% Listing Revolution
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-stone-900 tracking-tight leading-[1.12]">
              The Art of Maximizing Your Home’s Value.
              <span className="block font-serif italic text-[#8C6D43] mt-2">
                Uncompromising Full-Service at a 1% Listing Fee.
              </span>
            </h1>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              Why sacrifice your hard-earned equity to traditional 2.5% listing commissions? With Amit Sawhney (Licensed Ontario REALTOR®), you receive magazine-tier architectural photography, precision staging, global MLS® syndication, and fierce negotiation — while preserving $15,000 to $30,000+ on closing.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <a
                href="#valuation-tool"
                className="px-8 py-4 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-2xl shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Calculate My Home’s Real-Time Value</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </a>

              <button
                onClick={() => onOpenConsultationModal('Seller Strategy Walkthrough')}
                className="px-7 py-4 bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs uppercase tracking-[0.15em] rounded-2xl border border-stone-300 shadow-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#A38258]" />
                <span>Schedule In-Home Walkthrough</span>
              </button>
            </div>
          </div>

          {/* 4 Signature Hallmark Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 pt-12 border-t border-[#E7E2D8]">
            <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-600 block">Average Preserved Equity</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                $15,000+
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Saved compared to traditional 2.5% listing brokerages
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-600 block">Fiduciary Representation</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                100%
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Full-service licensed REALTOR® from consultation to closing
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-600 block">Architectural Media</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                4K & 3D
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Cinema drone video, twilight stills & Matterport included
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-600 block">Upfront Commitment</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                $0 Fees
              </div>
              <p className="text-xs text-stone-600 mt-1">
                No hidden costs; you only pay when your home successfully sells
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. THE 5 PILLARS OF BESPOKE ADVISORY (Editorial Multi-Column)*/}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E7E2D8]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              The White-Glove Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">
              Five Pillars of Our Advisory Service
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              We marry the marketing polish of Beverly Hills editorial brokerages with deep Durham Region & GTA transactional expertise.
            </p>
          </div>

          {/* Pillars List */}
          <div className="divide-y divide-[#E7E2D8]">
            {pillarsOfAdvisory.map(pillar => (
              <div
                key={pillar.num}
                className="py-12 first:pt-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Image */}
                <div className="lg:col-span-5 relative group overflow-hidden rounded-3xl aspect-4/3 bg-stone-100 shadow-md">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#0F2942]/90 backdrop-blur-xs text-white font-serif text-sm flex items-center justify-center font-bold">
                    {pillar.num}
                  </div>
                </div>

                {/* Text Description */}
                <div className="lg:col-span-7 space-y-4 lg:pl-6">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                    <span>Pillar {pillar.num}</span>
                    <span>•</span>
                    <span>{pillar.subtitle}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                    {pillar.description}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => onOpenConsultationModal(`Pillar Inquiries: ${pillar.title}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F2942] hover:text-[#8C6D43] transition-colors cursor-pointer"
                    >
                      <span>Explore this standard in detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE COMMISSION & NET EQUITY CALCULATOR           */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              Transparent Financial Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">
              Compare Your Net Closing Proceeds
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Use the interactive sliders below to simulate your exact dollar savings with Amit Sawhney’s 1% Listing Fee versus traditional 2.5% brokerages.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#E7E2D8] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Sliders & Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Slider 1: Expected Sale Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Estimated Property Sale Price
                  </label>
                  <span className="text-lg font-bold font-mono text-[#0F2942] bg-stone-100 px-3 py-1 rounded-xl">
                    ${salePrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="3000000"
                  step="25000"
                  value={salePrice}
                  onChange={e => setSalePrice(Number(e.target.value))}
                  className="w-full accent-[#C5A880] cursor-pointer h-2 bg-stone-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-stone-600">
                  <span>$500,000</span>
                  <span>$1,750,000</span>
                  <span>$3,000,000+</span>
                </div>
              </div>

              {/* Slider 2: Buyer Agent Commission */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Cooperating Buyer Agent Fee Offered
                  </label>
                  <span className="text-xs font-bold font-mono text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {buyerAgentFeePct.toFixed(1)}% (${Math.round(buyerAgentFee).toLocaleString()})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[2.5, 2.0, 1.5].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setBuyerAgentFeePct(pct)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        buyerAgentFeePct === pct
                          ? 'bg-[#0F2942] text-white border-[#0F2942]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {pct === 2.5 ? '2.5% (Standard)' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Net Proceeds Toggle & Mortgage Balance */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Simulate Net Wire Proceeds on Closing
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNetProceeds(!showNetProceeds)}
                    className="text-xs text-[#8C6D43] font-semibold hover:underline"
                  >
                    {showNetProceeds ? 'Hide Mortgage Calc' : 'Include Mortgage Wire'}
                  </button>
                </div>

                {showNetProceeds && (
                  <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Remaining Mortgage Balance:</span>
                      <span className="font-mono font-bold text-stone-900">${mortgageBalance.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={salePrice}
                      step="25000"
                      value={mortgageBalance}
                      onChange={e => setMortgageBalance(Number(e.target.value))}
                      className="w-full accent-[#0F2942] cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                    <div className="text-[11px] text-stone-600">
                      Estimated legal and conveyancing fee: ~$1,850
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Visual Summary Breakdown Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0F2942] to-[#14324F] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-[#C5A880]/30">
              
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880] block">
                  Total Equity Preserved
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 mt-1">
                  +${Math.round(totalSellerSavings).toLocaleString()}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Direct commission savings + 13% Ontario HST savings retained in your bank.
                </p>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-stone-300">
                  <span>Traditional 2.5% Listing Fee:</span>
                  <span className="font-mono">${Math.round(traditionalListingFee).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-white font-bold bg-white/10 px-3 py-2 rounded-xl">
                  <span className="text-[#C5A880]">Amit Sawhney 1% Listing Fee:</span>
                  <span className="font-mono text-[#C5A880]">${Math.round(smartListingFee).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-stone-300">
                  <span>Buyer Agent Fee ({buyerAgentFeePct}%):</span>
                  <span className="font-mono">${Math.round(buyerAgentFee).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-stone-300">
                  <span>HST on Commissions (13%):</span>
                  <span className="font-mono">${Math.round(smartHst).toLocaleString()}</span>
                </div>
              </div>

              {/* Net Estimated Cash Wire on Closing */}
              {showNetProceeds && (
                <div className="pt-4 border-t border-white/10 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-300 block">
                    Estimated Net Cash in Bank on Closing
                  </span>
                  <div className="text-2xl font-mono font-bold text-white">
                    ${Math.round(estimatedNetProceeds).toLocaleString()}
                  </div>
                </div>
              )}

              <button
                onClick={() => onOpenConsultationModal('Net Equity Review', `Estimated price: $${salePrice.toLocaleString()}`)}
                className="w-full py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Claim This 1% Commission Rate
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. REDESIGNED PROPERTY VALUATION TOOL (MULTI-STEP FLOW)      */}
      {/* ============================================================ */}
      <section id="valuation-tool" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E7E2D8]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              Automated Comparative Market Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">
              Calculate Your Property’s Current Market Value
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Our bespoke valuation tool analyzes your property's exact room counts, interior square footage, and completed capital renovations prior to scoring against verified recent neighborhood sales.
            </p>
          </div>

          {/* Embedded Redesigned Multi-Step Tool */}
          <PropertyValuationTool
            onOpenConsultationModal={onOpenConsultationModal}
            className="w-full"
          />

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. THE 5-PHASE CONCIERGE ROADMAP                            */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              Seamless Execution
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">
              The 5-Phase Concierge Roadmap
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              From our first confidential strategy meeting to handing over keys and wiring net closing funds, every phase is orchestrated with military precision.
            </p>
          </div>

          {/* Roadmap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {conciergeRoadmap.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-[#E7E2D8] shadow-xs flex flex-col justify-between hover:border-[#C5A880] transition-colors"
              >
                <div className="space-y-3">
                  <div className="text-2xl font-serif font-bold text-[#A38258]">
                    {item.step}
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phase {item.step} Included</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SELL & BUY BUNDLE ADVANTAGE (DOUBLE EQUITY ACCELERATOR)  */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E7E2D8]">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-gradient-to-r from-[#0F2942] to-[#173A5E] text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-[#C5A880]/30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Double Equity Accelerator</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  Selling & Buying Next? Unlock the Sell & Buy Bundle.
                </h2>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                  When you sell your current residence with Amit Sawhney at our 1% listing fee, and buy your next resale or pre-construction home through our advisory, you receive our exclusive <strong>Buy Smart™ Commission Cashback</strong> on the purchase side.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-xs text-[#C5A880] font-bold block uppercase tracking-wider">Step 1: Selling Side</span>
                    <p className="text-xs text-stone-200 mt-1">
                      1.0% Listing Commission saves you ~$15,000 to $30,000 on the sale.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-xs text-[#C5A880] font-bold block uppercase tracking-wider">Step 2: Buying Side</span>
                    <p className="text-xs text-stone-200 mt-1">
                      Up to 1.0% Cashback on your purchase price wired back directly to you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-center lg:text-right space-y-4">
                <button
                  onClick={() => onOpenConsultationModal('Sell & Buy Bundle Assessment')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-[0.15em] rounded-2xl shadow-xl transition-all cursor-pointer"
                >
                  Explore Sell & Buy Bundle
                </button>
                <span className="block text-[11px] text-stone-400">
                  Zero obligation • Confidential consultation
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. DETAILED FEATURE COMPARISON TABLE                        */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              Direct Transparency
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">
              Compare Our Standards
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Discover how Amit Sawhney’s 1% Listing Advisory compares to traditional 2.5% brokerages and discount mere-postings.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-[#E7E2D8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E2D8] bg-[#FAF8F5]">
                    <th className="p-4 sm:p-6 text-xs font-bold uppercase tracking-wider text-stone-700 w-1/2">
                      Inclusions & Representation
                    </th>
                    <th className="p-4 sm:p-6 text-xs font-bold uppercase tracking-wider text-[#0F2942] bg-[#0F2942]/5 text-center w-1/4">
                      Amit Sawhney (1%)
                    </th>
                    <th className="p-4 sm:p-6 text-xs font-bold uppercase tracking-wider text-stone-500 text-center w-1/4">
                      Traditional Broker (2.5%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D8] text-xs sm:text-sm">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 sm:p-6 space-y-0.5">
                        <div className="font-bold text-stone-900">{item.feature}</div>
                        <div className="text-[11px] text-stone-500 leading-snug">{item.description}</div>
                      </td>
                      <td className="p-4 sm:p-6 text-center font-bold text-emerald-700 bg-[#0F2942]/5">
                        {typeof item.smart1Pct === 'boolean' ? (
                          item.smart1Pct ? (
                            <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 mx-auto text-stone-300" />
                          )
                        ) : (
                          <span className="text-[#0F2942]">{item.smart1Pct}</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-6 text-center text-stone-600">
                        {typeof item.traditional === 'boolean' ? (
                          item.traditional ? (
                            <CheckCircle2 className="w-5 h-5 mx-auto text-stone-400" />
                          ) : (
                            <XCircle className="w-5 h-5 mx-auto text-stone-300" />
                          )
                        ) : (
                          <span>{item.traditional}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. EDITORIAL FAQ ACCORDION                                   */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E7E2D8]">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A38258]">
              Clarity & Peace of Mind
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-normal">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Straightforward, honest answers regarding our 1% commission model and white-glove listing services.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#E7E2D8] bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <span className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    {faq.q}
                  </span>
                  <div className={`p-1.5 rounded-full border border-stone-200 text-stone-500 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {openFaqIndex === idx && (
                  <div className="px-5 pb-6 sm:px-6 text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FINAL ADVISORY BANNER / IN-HOME CONSULTATION INVITATION  */}
      {/* ============================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="w-16 h-16 rounded-full bg-[#C5A880]/20 text-[#A38258] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-[#C5A880]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#A38258] block">
            Private Listing Advisory
          </span>

          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            Ready to Discover What Your Home Can Command?
          </h2>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-light">
            Amit Sawhney will personally tour your home, review your unique upgrades, and deliver a comprehensive in-person Comparative Market Analysis with zero cost or obligation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenConsultationModal('Private In-Home Seller Walkthrough')}
              className="w-full sm:w-auto px-8 py-4 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Schedule In-Person Walkthrough</span>
            </button>

            <a
              href="tel:6478953613"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs uppercase tracking-[0.15em] rounded-2xl border border-stone-300 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#A38258]" />
              <span>Call Direct: (647) 895-3613</span>
            </a>
          </div>

          <div className="text-[11px] text-stone-600 pt-4">
            Licensed Real Estate Professional • Blueprint Realty Brokerage • Whitby, Brooklin, Oshawa & GTA
          </div>

        </div>
      </section>

    </div>
  );
};
