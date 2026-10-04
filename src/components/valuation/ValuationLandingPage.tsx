import React, { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  ShieldCheck,
  Award,
  DollarSign,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building,
  Home
} from 'lucide-react';
import { PropertyValuationTool } from './PropertyValuationTool';
import { AMIT_SAWHNEY } from '../../data/agent';

interface ValuationLandingPageProps {
  city?: string;
  onNavigateHome?: () => void;
  onNavigateSeller?: () => void;
  onNavigateCity?: (cityName: string) => void;
  onOpenConsultationModal?: (topic?: string, notes?: string) => void;
}

interface CityMarketProfile {
  name: string;
  title: string;
  region: string;
  medianPrice: string;
  avgDaysOnMarket: number;
  yoyGrowth: string;
  hotNeighborhoods: string[];
  description: string;
  sampleAddresses: string[];
}

const CITY_PROFILES: Record<string, CityMarketProfile> = {
  whitby: {
    name: 'Whitby',
    title: 'Whitby & Brooklin Home Value Estimator',
    region: 'Durham Region',
    medianPrice: '$945,000',
    avgDaysOnMarket: 19,
    yoyGrowth: '+4.2%',
    hotNeighborhoods: ['Brooklin', 'Port Whitby', 'Rolling Acres', 'Blue Grass Meadows', 'Pringle Creek'],
    description:
      'Whitby is one of Durham Region’s most active real estate markets, characterized by high demand for family detached homes, modern executive townhouses in Brooklin, and waterfront condominiums near Port Whitby marina.',
    sampleAddresses: [
      '123 Main Street, Whitby, ON',
      '18 Carnwith Drive East, Brooklin, ON',
      '45 Watson Street West, Whitby, ON'
    ]
  },
  brooklin: {
    name: 'Brooklin',
    title: 'Brooklin Property Value Estimator',
    region: 'North Whitby / Durham Region',
    medianPrice: '$1,085,000',
    avgDaysOnMarket: 16,
    yoyGrowth: '+4.8%',
    hotNeighborhoods: ['Downtown Brooklin Historic District', 'Carnwith', 'Old Brooklin', 'Brooklin West'],
    description:
      'Brooklin commands a premium within Whitby, featuring master-planned family enclaves, spacious double-car garage detached homes, high-ranking schools, and quick commuter access to Highway 407.',
    sampleAddresses: [
      '18 Carnwith Drive East, Brooklin, ON',
      '55 Winchester Road East, Brooklin, ON',
      '200 Baldwin Street, Brooklin, ON'
    ]
  },
  oshawa: {
    name: 'Oshawa',
    title: 'Oshawa Real Estate Valuation & CMA',
    region: 'Durham Region',
    medianPrice: '$785,000',
    avgDaysOnMarket: 22,
    yoyGrowth: '+3.9%',
    hotNeighborhoods: ['North Oshawa / Kedron', 'Samac', 'Taunton', 'Pinecrest', 'Eastdale'],
    description:
      'Oshawa offers exceptional value in the Greater Toronto Area, driven by expansive educational institutions, Go Transit expansions, and rapid master-planned residential growth in North Oshawa.',
    sampleAddresses: [
      '240 Harmony Road North, Oshawa, ON',
      '1050 Simcoe Street North, Oshawa, ON',
      '450 Taunton Road East, Oshawa, ON'
    ]
  },
  toronto: {
    name: 'Toronto',
    title: 'Toronto Home & Condo Value Estimator',
    region: 'City of Toronto',
    medianPrice: '$1,120,000',
    avgDaysOnMarket: 24,
    yoyGrowth: '+2.8%',
    hotNeighborhoods: ['Downtown Core', 'Leaside', 'Yorkville', 'The Beaches', 'High Park', 'Liberty Village'],
    description:
      'Toronto’s micro-markets vary dramatically by pocket, from historic Victorian freeholds to luxury transit-connected high-rise condominiums. Precise comparable sales matching is critical for accurate valuations.',
    sampleAddresses: [
      '25 King Street West, Toronto, ON',
      '180 University Avenue, Toronto, ON',
      '450 Bay Street, Toronto, ON'
    ]
  },
  mississauga: {
    name: 'Mississauga',
    title: 'Mississauga Property Value Estimator',
    region: 'Peel Region',
    medianPrice: '$995,000',
    avgDaysOnMarket: 21,
    yoyGrowth: '+3.5%',
    hotNeighborhoods: ['Port Credit', 'City Centre / Square One', 'Lorne Park', 'Streetsville', 'Erin Mills'],
    description:
      'Mississauga combines urban high-rise vibrancy around Square One with scenic waterfront enclaves along Port Credit and established estate neighborhoods in Lorne Park.',
    sampleAddresses: [
      '100 Lakeshore Road East, Mississauga, ON',
      '300 City Centre Drive, Mississauga, ON',
      '55 Queen Street South, Mississauga, ON'
    ]
  }
};

export const ValuationLandingPage: React.FC<ValuationLandingPageProps> = ({
  city = 'whitby',
  onNavigateHome,
  onNavigateSeller,
  onNavigateCity,
  onOpenConsultationModal
}) => {
  const normalizedKey = (city || 'whitby').toLowerCase().trim();
  const profile = CITY_PROFILES[normalizedKey] || CITY_PROFILES.whitby;

  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const FAQS = [
    {
      q: 'How does this Canadian AI Property Valuation tool calculate my home value?',
      a: 'Unlike generic algorithms that simply multiply square footage by a regional average, our engine operates like a digital Comparative Market Analysis (CMA). It identifies recently sold properties within a strict geographic radius (0.5 to 5 km), normalizes for living area, bedrooms, bathrooms, lot size, garage, and finished basement, applies recent market pace adjustments, and synthesizes a realistic value range.'
    },
    {
      q: 'Is this valuation a formal Canadian bank appraisal?',
      a: 'No. This estimate is an automated, AI-assisted market calculation designed for informational planning, preliminary pricing, and market awareness. Lenders and appraisal institutes require an on-site physical inspection for mortgage financing underwriting. Amit Sawhney provides comprehensive in-person CMAs to confirm physical conditions, finishes, and exact listing strategies.'
    },
    {
      q: 'How does selling with Amit Sawhney for 1% listing fee work in Ontario?',
      a: 'Amit Sawhney provides full-service listing representation—including professional HDR photography, 4K virtual tours, MLS® syndication across REALTOR.ca, social ad marketing, and full offer negotiation—for a 1% listing commission instead of the traditional 2.5%. On a $1,000,000 home, you save approximately $15,000 in listing commission while receiving first-class representation.'
    },
    {
      q: 'Can I use this tool if I am thinking of buying a home?',
      a: 'Yes! Toggle to "Buyer Perspective" at the top of the valuation tool. Enter any property address and the current asking price. The tool will compare the asking price against recent comparable sold data, calculate whether the home is priced above or below fair market value, and generate recommended negotiation questions for your offer strategy.'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="bg-[#0F2942] text-white py-4 px-4 sm:px-8 border-b border-[#18395B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-stone-300">
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={onNavigateSeller}
              className="hover:text-white transition-colors"
            >
              Seller Services
            </button>
            <span>/</span>
            <span className="text-[#C5A880] font-semibold">
              {profile.name} Home Value Estimator
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-stone-300">Switch Market:</span>
            {['Whitby', 'Brooklin', 'Oshawa', 'Toronto', 'Mississauga'].map(cName => (
              <button
                key={cName}
                onClick={() => onNavigateCity?.(cName)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  profile.name.toLowerCase() === cName.toLowerCase()
                    ? 'bg-[#C5A880] text-[#0F2942] font-bold'
                    : 'text-stone-300 hover:text-white bg-white/5'
                }`}
              >
                {cName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* City Intro Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2942]/10 text-[#0F2942] text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{profile.region} • Real-Time Sales Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-4">
            {profile.title}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {profile.description}
          </p>
        </div>

        {/* 1. Embed Interactive Valuation Tool */}
        <PropertyValuationTool
          initialAddress={profile.sampleAddresses[0]}
          initialCity={profile.name}
          onOpenConsultationModal={onOpenConsultationModal}
        />

        {/* 2. City Market Stats Bento */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-extrabold text-stone-900">
                {profile.name} Real Estate Market Overview
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Key benchmarks based on recent Durham Region and GTA real estate board data
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Year-over-Year Growth: {profile.yoyGrowth}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Median Sale Price
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#0F2942]">
                {profile.medianPrice}
              </div>
              <div className="text-xs text-stone-500 mt-2">
                Based on single-family & townhouse sales across {profile.name}
              </div>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Average Days on Market
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#0F2942]">
                {profile.avgDaysOnMarket} Days
              </div>
              <div className="text-xs text-stone-500 mt-2">
                Well-priced, updated homes in high-demand pockets sell even faster
              </div>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Listing Commission Advantage
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#C5A880]">
                1% Listing
              </div>
              <div className="text-xs text-stone-500 mt-2">
                Keep up to $15,000+ more equity in your pocket when you list with Amit
              </div>
            </div>
          </div>

          {/* Hot Neighborhoods Pills */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">
              High-Demand {profile.name} Neighborhoods We Specialize In:
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.hotNeighborhoods.map((n, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full border border-stone-200 flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{n}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Frequently Asked Questions Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
              Frequently Asked Questions About Property Valuations
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Clear answers about automated valuations, comparative market analyses, and Canadian real estate practices
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="border border-stone-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-stone-900 text-sm sm:text-base hover:bg-stone-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#C5A880] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-stone-400 transition-transform shrink-0 ml-2 ${
                      faqOpenIndex === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {faqOpenIndex === index && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50/50 border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Consultation CTA Banner */}
        <div className="bg-[#0F2942] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready for a Comprehensive On-Site Evaluation in {profile.name}?
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Connect directly with Amit Sawhney for an in-depth assessment of your renovations, layout advantages, and custom 1% listing strategy.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => onOpenConsultationModal?.('Free In-Home CMA Consultation', `Interested in a detailed CMA for property in ${profile.name}`)}
                className="px-8 py-3.5 bg-gradient-to-r from-[#C5A880] to-[#B39366] text-[#0F2942] font-bold rounded-xl shadow-lg hover:from-[#B39366] hover:to-[#9E8056] transition-all"
              >
                Book Free In-Home Consultation
              </button>
              <a
                href="tel:6478953613"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
              >
                <span>Call (647) 895-3613</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
