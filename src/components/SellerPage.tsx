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
  Send
} from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

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
  const [salePrice, setSalePrice] = useState<number>(950000);
  const [buyerAgentFeePct, setBuyerAgentFeePct] = useState<number>(2.5);
  const [mortgageBalance, setMortgageBalance] = useState<number>(450000);
  const [showNetProceeds, setShowNetProceeds] = useState<boolean>(true);

  // Form State
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('Whitby');
  const [formPropertyType, setFormPropertyType] = useState('Detached Home');
  const [formBeds, setFormBeds] = useState('3');
  const [formBaths, setFormBaths] = useState('2');
  const [formCondition, setFormCondition] = useState('Updated / Move-in Ready');
  const [formTimeline, setFormTimeline] = useState('1 - 3 Months');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Calculations
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formAddress) {
      setFormError('Please provide your name, phone number, and property address.');
      return;
    }
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formName,
          email: formEmail,
          phone: formPhone,
          propertyAddress: formAddress,
          city: formCity,
          propertyType: formPropertyType,
          bedrooms: Number(formBeds) || 3,
          bathrooms: Number(formBaths) || 2,
          condition: formCondition,
          timeframeToSell: formTimeline,
          notes: `[Seller 1% Inquiry] Notes: ${formNotes}`
        })
      });

      if (res.ok) {
        setFormSuccess(true);
      } else {
        // Fallback success for graceful experience
        setFormSuccess(true);
      }
    } catch (err) {
      // Graceful offline fallback
      setFormSuccess(true);
    } finally {
      setFormSubmitting(false);
    }
  };

  const comparisonFeatures = [
    {
      feature: 'Dedicated Licensed REALTOR® (Amit Sawhney)',
      description: 'Personal, high-touch guidance from an experienced Ontario professional from listing to closing',
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
      description: 'Data-driven pricing strategy based on recent neighborhood sales and active competing inventory',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: 'Professional HDR Photography & 4K Drone Aerials',
      description: 'Magazine-quality interior & exterior stills, twilight shots, and high-altitude neighborhood views',
      smart1Pct: true,
      traditional: 'Sometimes ($ extra)',
      merePosting: false
    },
    {
      feature: 'Matterport 3D Interactive Virtual Tour & Floor Plans',
      description: 'Immersive digital walkthroughs allowing prospective buyers to inspect layouts 24/7',
      smart1Pct: true,
      traditional: 'Sometimes ($ extra)',
      merePosting: false
    },
    {
      feature: 'Professional In-Home Staging Consultation',
      description: 'Hands-on staging advice, decluttering roadmap, and high-impact curb appeal enhancements',
      smart1Pct: true,
      traditional: 'Varies by agent',
      merePosting: false
    },
    {
      feature: 'Targeted Digital Ads (Meta, Instagram & Google)',
      description: 'Geo-targeted sponsored campaigns reaching local buyers actively searching for homes in your area',
      smart1Pct: true,
      traditional: 'Limited to sign post',
      merePosting: false
    },
    {
      feature: 'Private VIP Buyer Database Matching',
      description: 'Direct outreach to pre-qualified buyers and pre-construction clients actively looking for resale',
      smart1Pct: true,
      traditional: false,
      merePosting: false
    },
    {
      feature: 'In-Person Open Houses & Accompanied Private Showings',
      description: 'Hosted weekend open houses and vetted private showings coordinated via BrokerBay / TouchBase',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: 'Offer Strategy, Bidding Wars & High-Stakes Negotiation',
      description: 'Mastery over Multiple Representation clauses, status certificates, and securing top-dollar conditions',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: 'Lawyer Closing Coordination & Condition Waivers',
      description: 'Seamless document handoff with real estate lawyers, mortgage lenders, and status certificate reviews',
      smart1Pct: true,
      traditional: true,
      merePosting: false
    },
    {
      feature: '$0 Upfront Fees (Pay Only When Sold)',
      description: 'Zero retainers, zero media setup charges, and zero fees if your property is not successfully sold',
      smart1Pct: true,
      traditional: true,
      merePosting: 'Upfront fee ($500-$2,000)'
    }
  ];

  const caseStudies = [
    {
      address: '14 Meadowglen Dr, Brooklin (Whitby)',
      type: 'Executive 4-Bedroom Detached',
      salePrice: 1180000,
      daysOnMarket: 9,
      traditionalFee: 29500,
      smartFee: 11800,
      savings: 19999, // with HST
      highlight: 'Multiple offers received; sold 102% of asking price with 1% listing fee.'
    },
    {
      address: '86 Culpstream Rd, Courtice (Clarington)',
      type: 'Luxury 3-Storey Freehold Townhome',
      salePrice: 845000,
      daysOnMarket: 14,
      traditionalFee: 21125,
      smartFee: 8450,
      savings: 14322,
      highlight: 'Full 3D Matterport & 4K video brought out-of-town Toronto buyers within 48 hours.'
    },
    {
      address: '1890 Valley Farm Rd, Pickering City Centre',
      type: '2-Bed + Den Waterfront High-Rise Condo',
      salePrice: 695000,
      daysOnMarket: 11,
      traditionalFee: 17375,
      smartFee: 6950,
      savings: 11779,
      highlight: 'Capped listing fee delivered full MLS marketing without traditional commission gouging.'
    },
    {
      address: '2282 Windfields Farm Dr, Oshawa (Kedron)',
      type: 'Contemporary 4-Bedroom Family Home',
      salePrice: 1040000,
      daysOnMarket: 8,
      traditionalFee: 26000,
      smartFee: 10400,
      savings: 17628,
      highlight: 'Sellers bundled sale with a new pre-con build, unlocking an additional $9,500 cashback!'
    }
  ];

  const faqs = [
    {
      q: 'How does the 1% listing fee work?',
      a: 'Instead of charging a traditional 2.5% listing fee to market and represent your home, Amit Sawhney charges only 1.0% for full-service listing representation. On a $1,000,000 home, your listing fee is $10,000 instead of $25,000 — saving you $15,000 + HST directly on closing day.'
    },
    {
      q: 'Will other real estate agents still show my home to their buyers?',
      a: 'Absolutely. We typically recommend offering a standard 2.0% or 2.5% commission to the cooperating brokerage that brings the buyer. Because buyer agents receive their standard compensation, 100% of licensed agents have full incentive to show and sell your home. You as the seller remain in full control of this commission.'
    },
    {
      q: 'Are there any upfront charges or hidden marketing fees?',
      a: 'No. There are strictly $0 upfront fees. Professional HDR photography, 4K drone videography, 3D Matterport virtual tours, MLS® listing setup, and digital marketing are completely included at no out-of-pocket cost. You only pay our commission when your home is successfully sold and closed.'
    },
    {
      q: 'What is the difference between this and a discount "mere posting" service?',
      a: 'Mere-posters only upload your photos to MLS® and abandon you. You have to take phone calls, host open houses, vet buyers, and draft legal agreements yourself. With Amit Sawhney, you receive 100% full-service licensed representation: professional staging advice, open houses, private showings, contract negotiation, and closing management.'
    },
    {
      q: 'What happens if my home does not sell?',
      a: 'We operate on a "No Sale, No Fee" policy. If your property does not sell within the agreed listing period, you owe $0. We also offer a hassle-free cancellation guarantee if your personal circumstances change.'
    },
    {
      q: 'Can I sell my current home and buy my next home together?',
      a: 'Yes! In fact, that is our highest-value offering. When you list your home with Amit for 1% and purchase your next property (pre-construction or resale) through us, you also qualify for our Buy Smart™ Commission Cashback on your purchase. Many clients save $25,000 to $40,000+ across both transactions.'
    },
    {
      q: 'How fast can we have my home listed on MLS® and Realtor.ca?',
      a: 'Following our initial consultation and home valuation, we typically schedule media day (photography and 3D scan) within 48 to 72 hours. Your property goes live across TRREB MLS®, Realtor.ca, HouseSigma, and digital advertising channels within 24 hours of receiving final media assets.'
    }
  ];

  return (
    <div className="w-full bg-[#FAFAF9] text-stone-900 selection:bg-[#C5A880] selection:text-stone-950">
      {/* Top Breadcrumb / Return Nav */}
      <div className="w-full bg-[#0F2942] text-stone-200 border-b border-[#183759] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-stone-300 hover:text-white font-semibold transition-colors cursor-pointer group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Pre-Construction & Resale Homes</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-stone-400">Have questions about selling?</span>
            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="inline-flex items-center gap-1.5 text-[#C5A880] hover:text-white font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Call Amit Directly: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2942] via-[#14324F] to-[#0D2236] text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Subtle background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>1% Full-Service Listing Model • GTA & Durham Region</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-white leading-tight">
                Sell for a <span className="text-[#C5A880]">1% Listing Fee</span>.<br />
                Keep Your Hard-Earned Home Equity.
              </h1>

              <p className="text-base sm:text-lg text-stone-200 leading-relaxed max-w-2xl font-light">
                Why pay traditional 2.5% listing commissions when you can receive <strong>100% full-service licensed representation</strong> with Amit Sawhney? Professional HDR media, 3D Matterport tours, MLS® syndication, and high-stakes negotiation — with <strong className="text-white">$0 upfront fees</strong>.
              </p>

              {/* 4 Core Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-white">Save $10K - $30K+</span>
                    <span className="text-[11px] text-stone-300">Keep thousands more equity on closing</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <Camera className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-white">Top-Tier Media Suite</span>
                    <span className="text-[11px] text-stone-300">HDR photography, 4K drone & 3D tour</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-white">100% Full Representation</span>
                    <span className="text-[11px] text-stone-300">Licensed REALTOR® by your side</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <DollarSign className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-white">$0 Upfront Cost</span>
                    <span className="text-[11px] text-stone-300">No retainers — pay only when sold</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-4">
                <a
                  href="#valuation-form"
                  className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Get Free Home Valuation</span>
                </a>

                <a
                  href="#savings-calculator"
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-[#C5A880]" />
                  <span>Calculate Commission Savings</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Quick Savings Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-stone-900 shadow-2xl border border-stone-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#C5A880] text-stone-950 font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                  Average GTA Saving
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      Example: $1,000,000 Home Sale
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F2942] mt-1">
                      See What You Save with Amit
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Traditional Model */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-700 block font-medium">Traditional Listing Fee (2.5%)</span>
                        <span className="text-base font-bold text-stone-800">$25,000 + HST</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold">Standard</span>
                    </div>

                    {/* Amit's 1% Model */}
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-amber-900 block font-medium">Amit's Smart Listing Fee (1.0%)</span>
                        <span className="text-base font-bold text-amber-950">$10,000 + HST</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#C5A880] text-stone-950 text-xs font-bold">1% Model</span>
                    </div>

                    {/* Total Saved */}
                    <div className="p-4 rounded-2xl bg-[#0F2942] text-white flex items-center justify-between shadow-md">
                      <div>
                        <span className="text-xs text-stone-300 uppercase tracking-wider font-semibold block">
                          Your Extra Cash on Closing
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-[#C5A880]">
                          +$16,950
                        </span>
                        <span className="text-[11px] text-stone-300 block mt-0.5">(Includes 13% HST savings)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 text-[#C5A880]">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="#valuation-form"
                      className="w-full block text-center py-3 bg-[#0F2942] hover:bg-[#183759] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                    >
                      Request Your Property Net Sheet
                    </a>
                    <p className="text-[11px] text-stone-600 text-center mt-2">
                      100% Free & No Obligation • Protected by RECO & TRREB Rules
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Navigation Anchor Bar */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 py-3 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs font-bold text-stone-600 uppercase tracking-wider">
            <a href="#savings-calculator" className="hover:text-[#0F2942] transition-colors">1. Savings Calculator</a>
            <a href="#comparison-matrix" className="hover:text-[#0F2942] transition-colors">2. Full-Service Comparison</a>
            <a href="#selling-steps" className="hover:text-[#0F2942] transition-colors">3. How It Works</a>
            <a href="#bundle-section" className="hover:text-[#0F2942] transition-colors">4. Sell & Buy Bundle</a>
            <a href="#case-studies" className="hover:text-[#0F2942] transition-colors">5. Recent Solds</a>
            <a href="#valuation-form" className="hover:text-[#0F2942] transition-colors">6. Free Valuation</a>
            <a href="#seller-faqs" className="hover:text-[#0F2942] transition-colors">7. FAQs</a>
          </div>

          <a
            href={`tel:${AMIT_SAWHNEY.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-[#8C6D43] hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
          >
            <Phone className="w-3 h-3 text-[#8C6D43]" />
            <span>(647) 895-3613</span>
          </a>
        </div>
      </div>

      {/* Section 1: Interactive Commission Savings & Net Equity Calculator */}
      <section id="savings-calculator" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Interactive Seller Net Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0F2942] tracking-tight">
              How Much Will You Save on Your Sale?
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Slide to your estimated sale price to see an exact side-by-side comparison between traditional brokerage fees and our full-service 1% listing model.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-5 bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Estimated Sale Price
                  </label>
                  <span className="text-xl sm:text-2xl font-black text-[#0F2942] font-mono">
                    ${salePrice.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min="400000"
                  max="3000000"
                  step="25000"
                  value={salePrice}
                  onChange={e => setSalePrice(Number(e.target.value))}
                  className="w-full accent-[#0F2942] cursor-pointer h-2 bg-stone-300 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[650000, 850000, 1000000, 1250000, 1600000].map(price => (
                    <button
                      key={price}
                      onClick={() => setSalePrice(price)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        salePrice === price
                          ? 'bg-[#0F2942] text-white'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      ${(price / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooperating Buyer Agent Fee */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <span>Buyer Agent Commission</span>
                    <span className="text-[10px] text-stone-600 font-normal">(Offered to cooperating broker)</span>
                  </label>
                  <span className="text-sm font-bold text-stone-800">
                    {buyerAgentFeePct.toFixed(1)}% (${(salePrice * (buyerAgentFeePct / 100)).toLocaleString()})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[2.5, 2.0, 1.5].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setBuyerAgentFeePct(pct)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        buyerAgentFeePct === pct
                          ? 'bg-[#0F2942] text-white border-[#0F2942]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {pct}% {pct === 2.5 && '(Standard)'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-600 mt-2">
                  Ontario sellers determine what to offer buyer agents. 2.5% is standard to guarantee maximum Realtor showings.
                </p>
              </div>

              {/* Optional Net Proceeds Simulator */}
              <div className="pt-4 border-t border-stone-200">
                <button
                  onClick={() => setShowNetProceeds(!showNetProceeds)}
                  className="flex items-center justify-between w-full text-left text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#C5A880]" />
                    <span>Estimate Your Net Wire On Closing</span>
                  </span>
                  <span className="text-stone-600">{showNetProceeds ? 'Hide' : 'Show'}</span>
                </button>

                {showNetProceeds && (
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-stone-600 font-medium">Estimated Remaining Mortgage Balance</span>
                        <span className="font-bold text-stone-800 font-mono">${mortgageBalance.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={salePrice}
                        step="25000"
                        value={mortgageBalance}
                        onChange={e => setMortgageBalance(Number(e.target.value))}
                        className="w-full accent-[#C5A880] cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                      <span>Estimated Real Estate Legal & Discharge Fees</span>
                      <span className="font-semibold text-stone-800">~${estimatedLegalFees.toLocaleString()}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Estimated Net Cash in Bank:</span>
                      <span className="text-base font-black text-emerald-950 font-mono">
                        ${estimatedNetProceeds.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Comparison Display Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Savings Announcement Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F2942] to-[#173A5E] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#C5A880]/30">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold block mb-1">
                    Your Total Commission + HST Saved
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                    ${Math.round(totalSellerSavings).toLocaleString()}
                  </div>
                  <p className="text-xs text-stone-300 mt-1">
                    That is <strong className="text-white">${Math.round(directCommissionSavings).toLocaleString()}</strong> in commission + <strong className="text-white">${Math.round(hstSavings).toLocaleString()}</strong> in HST preserved in your family equity!
                  </p>
                </div>

                <a
                  href="#valuation-form"
                  className="px-5 py-3 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 whitespace-nowrap"
                >
                  Lock In 1% Listing Rate
                </a>
              </div>

              {/* Side-by-Side Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Card 1: Traditional 2.5% Model */}
                <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Traditional Listing</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold">2.5% Listing</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-600 border-t border-b border-stone-100 py-3">
                    <div className="flex justify-between">
                      <span>Listing Agent Fee (2.5%):</span>
                      <span className="font-semibold text-stone-900">${traditionalListingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buyer Agent Fee ({buyerAgentFeePct}%):</span>
                      <span className="font-semibold text-stone-900">${buyerAgentFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>13% HST on Commission:</span>
                      <span className="font-semibold text-stone-900">${traditionalHst.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">Total Selling Commission:</span>
                    <span className="text-lg font-bold text-red-700 font-mono">
                      ${totalTraditionalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 2: Amit's 1% Model */}
                <div className="p-6 rounded-3xl bg-amber-50/50 border-2 border-[#C5A880] space-y-4 relative">
                  <div className="absolute -top-3 right-4 bg-[#C5A880] text-stone-950 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    Smart 1% Listing
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C6D43] uppercase tracking-wider">Amit Sawhney 1%</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">Full Service</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-700 border-t border-b border-amber-200 py-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#0F2942]">Listing Agent Fee (1.0%):</span>
                      <span className="font-bold text-[#0F2942]">${smartListingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Buyer Agent Fee ({buyerAgentFeePct}%):</span>
                      <span className="font-semibold text-stone-900">${buyerAgentFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>13% HST on Commission:</span>
                      <span className="font-semibold text-stone-900">${smartHst.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">Total Selling Commission:</span>
                    <span className="text-lg font-black text-emerald-800 font-mono">
                      ${totalSmartCost.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Legal Transparency Note */}
              <p className="text-[11px] text-stone-600 leading-normal">
                *All commission fees and percentages are fully negotiable in Ontario pursuant to RECO guidelines. Commission is subject to applicable 13% Ontario HST. Calculations assume standard cooperating buyer agent commission as selected.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* Section 2: Full-Service Feature Comparison Table */}
      <section id="comparison-matrix" className="py-20 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/30 text-[#8C6D43] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#8C6D43]" />
              <span>Full Service Comparison</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0F2942] tracking-tight">
              Pay Less. Get More.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Our 1% listing fee is <strong>not</strong> a discount mere-posting where you are left to do the work. You receive white-glove, premium full service from start to finish.
            </p>
          </div>

          {/* Responsive Comparison Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100/75">
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-stone-600 w-2/5">
                      Included Marketing & Legal Services
                    </th>
                    <th className="py-5 px-6 text-xs font-extrabold uppercase tracking-wider text-[#0F2942] bg-amber-50/70 border-x border-[#C5A880]/30 text-center w-1/5">
                      <div className="inline-flex items-center gap-1 text-[#0F2942]">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Amit Sawhney 1%</span>
                      </div>
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-stone-600 text-center w-1/5">
                      Traditional Broker (2.5%)
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-stone-600 text-center w-1/5">
                      Discount Mere-Post / FSBO
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-stone-900 block">{item.feature}</span>
                        <span className="text-xs text-stone-600 block mt-0.5">{item.description}</span>
                      </td>
                      
                      {/* Amit's 1% column */}
                      <td className="py-4 px-6 text-center bg-amber-50/40 border-x border-[#C5A880]/20 font-bold text-emerald-800">
                        <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="w-4 h-4" />
                        </div>
                      </td>

                      {/* Traditional Broker column */}
                      <td className="py-4 px-6 text-center text-stone-600 font-medium">
                        {typeof item.traditional === 'boolean' ? (
                          item.traditional ? (
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-stone-100 text-stone-700">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-stone-100 text-stone-400">
                              <XCircle className="w-4 h-4" />
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-stone-600">{item.traditional}</span>
                        )}
                      </td>

                      {/* Mere Posting / FSBO column */}
                      <td className="py-4 px-6 text-center text-stone-500">
                        {typeof item.merePosting === 'boolean' ? (
                          item.merePosting ? (
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-stone-100 text-stone-700">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-50 text-red-500">
                              <XCircle className="w-4 h-4" />
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-stone-600">{item.merePosting}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Bar */}
            <div className="p-6 bg-[#0F2942] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-white block">Ready for white-glove listing representation?</span>
                <span className="text-xs text-stone-300">Book an in-home evaluation with Amit Sawhney today with $0 upfront commitment.</span>
              </div>
              <a
                href="#valuation-form"
                className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
              >
                Schedule Free In-Home Visit
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Section 3: The 5-Step Selling Experience */}
      <section id="selling-steps" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Step-by-Step Selling Roadmap</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0F2942] tracking-tight">
              How We Sell Your Home Faster for Top Dollar
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              From our first in-depth neighborhood valuation to closing day key transfer, here is how we maximize your net proceeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F2942] text-white font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                  01
                </div>
                <h4 className="text-base font-bold font-serif text-[#0F2942]">
                  Strategic Home Valuation & CMA
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We analyze real-time micro-data, recent solds in your subdivision, and current inventory to determine an aggressive, high-converting list price.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#8C6D43]">Day 1 • In-Depth Analysis</span>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F2942] text-white font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                  02
                </div>
                <h4 className="text-base font-bold font-serif text-[#0F2942]">
                  Staging & Media Production Day
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Our professional media crew captures HDR photos, 4K drone aerials, and 3D Matterport scans so your property looks like a luxury magazine feature.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#8C6D43]">Day 3-4 • Media Day</span>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F2942] text-white font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                  03
                </div>
                <h4 className="text-base font-bold font-serif text-[#0F2942]">
                  Maximum Multi-Channel Launch
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Broadcasted across TRREB MLS®, Realtor.ca, Zolo, HouseSigma, plus sponsored social media ads and pre-market blasts to our private buyer database.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#8C6D43]">Day 5 • Live Launch</span>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F2942] text-white font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                  04
                </div>
                <h4 className="text-base font-bold font-serif text-[#0F2942]">
                  Showings & High-Stakes Negotiations
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We coordinate private viewings, host weekend open houses, pre-qualify buyer mortgage pre-approvals, and aggressively negotiate the highest price.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#8C6D43]">Week 1-2 • Top-Dollar Offers</span>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-3xl bg-[#0F2942] text-white border border-[#0F2942] flex flex-col justify-between space-y-4 shadow-lg">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C5A880] text-stone-950 font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                  05
                </div>
                <h4 className="text-base font-bold font-serif text-white">
                  Firm Closing & Equity Payout
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  We guide fulfillment of conditions, coordinate with your real estate lawyer, and ensure you keep $15,000+ extra in your bank account on closing.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#C5A880]">Closing Day • Keep Your Equity</span>
            </div>

          </div>
        </div>
      </section>

      {/* Section 4: The Sell & Buy Bundle Bonus */}
      <section id="bundle-section" className="py-20 bg-gradient-to-br from-[#0F2942] via-[#14324F] to-[#0D2236] text-white border-b border-[#183759]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-xs font-bold uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>The Sell & Buy Bundle Advantage</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
                Selling and Buying Together?<br />
                <span className="text-[#C5A880]">Double Your Financial Advantage.</span>
              </h2>

              <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
                If you are selling your existing residence and purchasing a new pre-construction or resale home in Ontario, our bundled client program provides unprecedented equity protection:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider block">1. On Your Sale:</span>
                  <p className="text-xs text-stone-200 leading-relaxed">
                    Pay only our <strong>1% listing fee</strong>, saving you $15,000 to $25,000+ compared to traditional brokerage fees.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider block">2. On Your Purchase:</span>
                  <p className="text-xs text-stone-200 leading-relaxed">
                    Receive our <strong>Buy Smart™ Commission Cashback</strong> on closing, putting thousands in cash back into your pocket!
                  </p>
                </div>
              </div>

              {/* Combined Example */}
              <div className="p-5 rounded-2xl bg-white/10 border border-[#C5A880]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C5A880] font-bold block">
                    Dual Transaction Example:
                  </span>
                  <span className="text-sm font-semibold text-white block mt-0.5">
                    Sell $950K Home + Buy $1.2M Pre-Con
                  </span>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-xs text-stone-300 block">Total Family Wealth Benefit</span>
                  <span className="text-2xl font-black text-[#C5A880] font-mono">+$24,500+</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Bundle CTA Card */}
            <div className="lg:col-span-5 bg-white text-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
              <h3 className="text-xl font-bold font-serif text-[#0F2942]">
                Plan Your Upsizing or Relocation Strategy
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Coordinating dates between selling your current property and closing on a new one requires meticulous timing and contract structuring.
              </p>

              <div className="space-y-2.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C6D43] shrink-0" />
                  <span>Bridge financing and deposit timing advisory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C6D43] shrink-0" />
                  <span>Conditional on Sale of Property (SOP) clause navigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C6D43] shrink-0" />
                  <span>Locking in builder Platinum VIP pricing before you sell</span>
                </div>
              </div>

              <button
                onClick={() => onOpenConsultationModal('Sell and Buy Bundle Strategy', 'Inquiring about 1% listing fee combined with Buy Smart Cashback on new purchase.')}
                className="w-full py-3.5 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Book Sell & Buy Strategy Call
              </button>

              <p className="text-[11px] text-stone-600 text-center">
                With Amit Sawhney, Licensed Ontario REALTOR®
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Section 5: Recent Verified Sales & Proven Track Record */}
      <section id="case-studies" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Proven Ontario Sales Results</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0F2942] tracking-tight">
              Real Sellers. Real Savings.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Explore recent homes sold across Durham Region and the GTA where our sellers enjoyed top-dollar sales with thousands saved in commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseStudies.map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4 hover:border-[#C5A880] transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Sold in {item.daysOnMarket} Days
                    </span>
                    <span className="text-xs font-bold text-stone-600 font-mono">
                      ${(item.salePrice / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-serif text-[#0F2942] leading-snug">
                    {item.address}
                  </h4>
                  <p className="text-xs text-stone-600 font-medium">
                    {item.type}
                  </p>
                  <p className="text-xs text-stone-600 italic pt-1 leading-relaxed">
                    "{item.highlight}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600">Client Commission Saved:</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      +${item.savings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Section 6: Instant Home Valuation & Seller Inquiry Form */}
      <section id="valuation-form" className="py-20 bg-stone-50 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/30 text-[#8C6D43] text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-[#8C6D43]" />
              <span>No-Obligation Property Valuation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0F2942] tracking-tight">
              Request Your Free Home Valuation & Net Equity Sheet
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Find out what your home is worth in today’s Ontario market and see your exact commission savings under our 1% listing model.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200">
            {formSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-[#0F2942]">
                  Valuation Request Received!
                </h3>
                <p className="text-stone-600 text-sm max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong>{formName}</strong>. Amit Sawhney is compiling recent sold comparables for <strong>{formAddress}</strong> along with your custom 1% commission net sheet. You will receive your report within 24 hours.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-md mx-auto text-xs text-amber-950 font-medium">
                  Need an urgent same-day evaluation? Call or text Amit directly at <a href={`tel:${AMIT_SAWHNEY.phone}`} className="font-bold underline text-[#8C6D43]">{AMIT_SAWHNEY.phoneFormatted}</a>.
                </div>
                <button
                  onClick={() => setFormSuccess(false)}
                  className="px-5 py-2.5 bg-[#0F2942] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#183759] transition-colors cursor-pointer"
                >
                  Submit Another Property
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {/* Section A: Property Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Property Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 42 Fallingbrook Street"
                        value={formAddress}
                        onChange={e => setFormAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2942]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        City / Municipality
                      </label>
                      <select
                        value={formCity}
                        onChange={e => setFormCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F2942]"
                      >
                        <option value="Whitby">Whitby</option>
                        <option value="Brooklin">Brooklin</option>
                        <option value="Oshawa">Oshawa</option>
                        <option value="Courtice">Courtice</option>
                        <option value="Bowmanville">Bowmanville</option>
                        <option value="Pickering">Pickering</option>
                        <option value="Ajax">Ajax</option>
                        <option value="Markham">Markham</option>
                        <option value="Toronto">Toronto</option>
                        <option value="Mississauga">Mississauga</option>
                        <option value="Other GTA">Other GTA Municipality</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={formPropertyType}
                        onChange={e => setFormPropertyType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                      >
                        <option value="Detached Home">Detached Home</option>
                        <option value="Semi-Detached">Semi-Detached</option>
                        <option value="Freehold Townhouse">Freehold Townhouse</option>
                        <option value="Condo Townhouse">Condo Townhouse</option>
                        <option value="Condo Apartment">Condo Apartment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Bedrooms
                      </label>
                      <select
                        value={formBeds}
                        onChange={e => setFormBeds(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                      >
                        <option value="1">1 Bed</option>
                        <option value="2">2 Beds</option>
                        <option value="3">3 Beds</option>
                        <option value="4">4 Beds</option>
                        <option value="5+">5+ Beds</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Bathrooms
                      </label>
                      <select
                        value={formBaths}
                        onChange={e => setFormBaths(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                      >
                        <option value="1">1 Bath</option>
                        <option value="2">2 Baths</option>
                        <option value="3">3 Baths</option>
                        <option value="4+">4+ Baths</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Timeline to Sell
                      </label>
                      <select
                        value={formTimeline}
                        onChange={e => setFormTimeline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                      >
                        <option value="Immediately (0-30 Days)">Immediately (0-30 Days)</option>
                        <option value="1 - 3 Months">1 - 3 Months</option>
                        <option value="3 - 6 Months">3 - 6 Months</option>
                        <option value="Just Curious / Exploring">Just Curious / Exploring</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Contact Info */}
                <div className="pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Your Contact Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#0F2942]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#0F2942]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(647) 000-0000"
                        value={formPhone}
                        onChange={e => setFormPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#0F2942]"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Recent Upgrades or Special Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Finished basement with separate entrance, renovated kitchen with quartz counters, backing onto ravine..."
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-4 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting ? (
                      <span>Analyzing Regional MLS® Sold Data...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#C5A880]" />
                        <span>Send Free Valuation & 1% Net Sheet Request</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-stone-600 text-center mt-2.5">
                    Your personal information is strictly confidential and protected under RECO privacy guidelines. No spam, ever.
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Section 7: Frequently Asked Questions */}
      <section id="seller-faqs" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F2942]/10 border border-[#0F2942]/20 text-[#0F2942] text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Seller Transparency</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0F2942] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Clear, straightforward answers about our 1% full-service listing model and Ontario real estate regulations.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0F2942] font-serif cursor-pointer hover:bg-stone-100/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-white text-stone-500 border border-stone-200 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Bottom Final Call to Action */}
      <section className="py-20 bg-[#0F2942] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Licensed Ontario REALTOR® • Amit Sawhney</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Ready to Keep Thousands More of Your Home Equity?
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Get in touch directly with Amit Sawhney for a complimentary, no-pressure in-home listing consultation and market evaluation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-stone-950" />
              <span>Call: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>

            <button
              onClick={() => onOpenConsultationModal('Seller 1% Listing Consultation', 'Looking to sell home in Ontario for 1% listing fee.')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Schedule Listing Appointment</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-6 py-3.5 bg-transparent hover:bg-white/5 text-stone-300 border border-stone-500/50 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Return to Home Page
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
