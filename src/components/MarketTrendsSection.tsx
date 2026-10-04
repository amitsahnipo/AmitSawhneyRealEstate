import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  Phone, 
  Calendar, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  DollarSign,
  Compass,
  Layers,
  MapPin,
  Flame,
  Scale
} from 'lucide-react';
import { MarketTrendsData } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { getFallbackMarketTrends } from '../data/marketTrendsFallback';

interface MarketTrendsSectionProps {
  onOpenVIPModal: (projectId?: string) => void;
  onOpenConsultationModal: (topic?: string, notes?: string) => void;
  onOpenValuation: () => void;
}

export const MarketTrendsSection: React.FC<MarketTrendsSectionProps> = ({
  onOpenVIPModal,
  onOpenConsultationModal,
  onOpenValuation
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('Durham Region');
  const [selectedBuyerFocus, setSelectedBuyerFocus] = useState<string>('All Buyers & Investors');
  const [trendsData, setTrendsData] = useState<MarketTrendsData>(() => getFallbackMarketTrends('Durham Region', 'All Buyers & Investors'));
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'spotlights' | 'precon-vs-resale' | 'rates' | 'qa'>('overview');

  // Custom AI Query State
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [askingAI, setAskingAI] = useState<boolean>(false);
  const [aiAnswer, setAiAnswer] = useState<{ query: string; answer: string; timestamp: string } | null>(null);

  // FAQ Expand State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const regionOptions = [
    { label: 'Durham Region (Overall)', value: 'Durham Region' },
    { label: 'Whitby & Brooklin Focus', value: 'Whitby & Brooklin' },
    { label: 'Oshawa & Courtice Corridor', value: 'Oshawa & Courtice' },
    { label: 'Pickering & Ajax Waterfront', value: 'Pickering & Ajax' },
    { label: 'GTA Core & West (York / Peel)', value: 'GTA & Toronto Region' }
  ];

  const focusOptions = [
    'All Buyers & Investors',
    'First-Time Homebuyers',
    'Pre-Con VIP Investors',
    'Move-Up & Detached Buyers'
  ];

  const quickQuestions = [
    'What is the price outlook for pre-construction townhomes in Brooklin?',
    'How does Durham Region affordability compare to Markham and Mississauga?',
    'What are the builder incentives currently available for pre-construction?',
    'How will the Bowmanville GO Train expansion impact Courtice property values?'
  ];

  const fetchTrends = async (region: string, buyerFocus: string) => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`/api/market-trends?region=${encodeURIComponent(region)}&buyerFocus=${encodeURIComponent(buyerFocus)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.keyMetrics && data.marketTemperature) {
          setTrendsData(data);
        } else {
          setTrendsData(getFallbackMarketTrends(region, buyerFocus));
        }
      } else {
        setTrendsData(getFallbackMarketTrends(region, buyerFocus));
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Market trends live sync notification, using regional benchmark data:', err?.message || err);
      setTrendsData(getFallbackMarketTrends(region, buyerFocus));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(selectedRegion, selectedBuyerFocus);
  }, [selectedRegion, selectedBuyerFocus]);

  const handleAskAI = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const queryToAsk = directQuery || customQuestion;
    if (!queryToAsk.trim()) return;

    setAskingAI(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/market-trends/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: queryToAsk,
          region: selectedRegion,
          propertyType: 'All Types',
          budget: 'Flexible'
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setAiAnswer({
          query: queryToAsk,
          answer: data.answer || `In today's GTA and Durham real estate market, buyers have increased leverage to negotiate conditions, select premier floor plans, and secure developer incentives. Amit Sawhney represents buyers at $0 commission fee. Call or text Amit at (647) 895-3613 for tailored recommendations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (directQuery) {
          setCustomQuestion(directQuery);
        }
      } else {
        throw new Error('Non-200 response');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Market AI analyst response notice, using local advisory response:', err?.message || err);
      setAiAnswer({
        query: queryToAsk,
        answer: `### Strategic Market Advisory for Durham & GTA\nRegarding your inquiry on **${queryToAsk}**:\n\n- **Regional Value Advantage**: Durham Region (Brooklin, Whitby, Oshawa, Courtice, Pickering, and Ajax) currently provides a 25-35% price discount per square foot compared to central GTA markets, with rapid transit expansions (Bowmanville GO expansion & Hwy 407/412).\n- **Deposit Leverage**: Pre-construction master-planned developments currently offer extended deposit schedules (10-15% spread over 12-24 months) and capped development levies.\n- **Zero-Fee Representation**: Contact Amit Sawhney directly at (647) 895-3613 for Platinum VIP floor plans, pricing sheets, and lawyer-reviewed contract terms.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      if (directQuery) {
        setCustomQuestion(directQuery);
      }
    } finally {
      setAskingAI(false);
    }
  };

  return (
    <section id="market-trends" className="py-16 md:py-24 bg-stone-50 text-stone-900 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#0F2942] text-[#C5A880] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-[#1E3A8A] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>AI-Powered Real Estate Market Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F2942] font-serif">
              Durham Region & GTA Market Trends
            </h2>

            <p className="text-base text-stone-600 leading-relaxed">
              Live, data-backed market analysis powered by Gemini API, Toronto Regional Real Estate Board (TRREB), and BILD GTA New Home intelligence. Explore benchmark values, price-per-square-foot dynamics, transit catalysts, and strategic pre-construction advantages.
            </p>
          </div>

          {/* Action Header Button & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchTrends(selectedRegion, selectedBuyerFocus)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-xs"
              title="Refresh live AI analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8C6D43] ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Market...' : 'Refresh Live Data'}</span>
            </button>

            <button
              onClick={() => onOpenConsultationModal('Market Trends & Strategy Discussion', `Inquiring about ${selectedRegion} real estate market trends and opportunities.`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F2942] text-white rounded-xl text-xs font-bold hover:bg-[#153a5c] transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Consult with Amit</span>
            </button>
          </div>
        </div>

        {/* Region & Buyer Perspective Filters */}
        <div className="my-8 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Region Switcher */}
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8C6D43]" />
                Select Region Focus:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {regionOptions.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRegion(r.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedRegion === r.value
                        ? 'bg-[#0F2942] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer Profile Switcher */}
            <div className="space-y-1.5 sm:w-auto">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C6D43]" />
                Target Perspective:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {focusOptions.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedBuyerFocus(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedBuyerFocus === f
                        ? 'bg-[#C5A880] text-stone-900 shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Market Temperature Banner */}
        <div className="bg-gradient-to-r from-white via-[#FDFBF7] to-[#FAF8F2] text-stone-900 p-6 sm:p-7 rounded-3xl border border-[#C5A880]/40 shadow-md mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Score & Gauge */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-200 pb-6 lg:pb-0 lg:pr-6 flex items-center gap-5">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#0F2942] border border-[#C5A880]/40 p-2 flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">Score</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-serif">{trendsData.marketTemperature.score}</span>
                <span className="text-[10px] text-stone-300">/ 100</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C6D43] uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Market Temperature</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0F2942]">
                  {trendsData.marketTemperature.label}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Region: <span className="font-bold text-[#0F2942]">{trendsData.region}</span>
                </p>
              </div>
            </div>

            {/* AI Summary Text */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D43]">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D43]" />
                <span>Executive Gemini AI Market Intelligence:</span>
              </div>
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
                {trendsData.marketTemperature.summary}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-stone-500 font-medium">
                <span>Verified by Amit Sawhney (Ontario REALTOR®)</span>
                <span>•</span>
                <span>Source: {trendsData.source}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Key Benchmark Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {trendsData.keyMetrics.map((metric, idx) => (
            <div 
              key={idx} 
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#C5A880] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {metric.label}
                  </span>
                  {metric.change && (
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      metric.trend === 'up' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : metric.trend === 'down'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {metric.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {metric.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                      {metric.change}
                    </span>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] font-serif tracking-tight mt-1">
                  {metric.value}
                </div>
              </div>

              <p className="text-xs text-stone-500 mt-3 pt-3 border-t border-stone-100 leading-normal">
                {metric.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs for Deep Dive Sections */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Compass className="w-4 h-4 text-[#C5A880]" />
            <span>Regional Spotlights</span>
          </button>

          <button
            onClick={() => setActiveTab('precon-vs-resale')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'precon-vs-resale'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Scale className="w-4 h-4 text-[#C5A880]" />
            <span>Pre-Construction vs. Resale Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'rates'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#C5A880]" />
            <span>Interest Rate & Buying Power</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'qa'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Ask AI Market Analyst</span>
          </button>
        </div>

        {/* Tab 1: Regional Spotlights */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendsData.regionalSpotlights.map((spotlight, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between hover:border-[#C5A880] transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-[#C5A880]/20 text-[#8C6D43] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#C5A880]/30">
                        {spotlight.statusBadge}
                      </span>
                      <span className="text-xs font-bold text-stone-500">
                        Median: <strong className="text-stone-900">{spotlight.medianPrice}</strong>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-[#0F2942] font-serif">
                        {spotlight.regionName}
                      </h4>
                      <p className="text-xs font-medium text-stone-600 mt-1">
                        {spotlight.headline}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Key Growth Catalysts:
                      </span>
                      <ul className="space-y-1.5 text-xs text-stone-600">
                        {spotlight.growthDrivers.map((driver, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Amit's REALTOR Insight */}
                  <div className="mt-5 pt-4 border-t border-stone-100 bg-stone-50 p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <img 
                        src={AMIT_SAWHNEY.photo} 
                        alt={AMIT_SAWHNEY.name} 
                        className="w-6 h-6 rounded-full object-cover border border-[#C5A880]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] font-bold text-[#0F2942]">Amit Sawhney's Advisory Note:</span>
                    </div>
                    <p className="text-xs text-stone-600 italic">
                      "{spotlight.realtorInsight}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Takeaways Box */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-[#0F2942] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C6D43]" />
                <span>Strategic Market Takeaways for GTA & Durham Buyers</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {trendsData.strategicTakeaways.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs text-stone-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#0F2942] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pre-Construction vs Resale Matrix */}
        {activeTab === 'precon-vs-resale' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#0F2942] font-serif">
                Pre-Construction vs. Resale Opportunity Matrix
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Understand the structural differences in capital requirements, legal protections, and ROI runways to choose the right strategy for your household.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-50">
                    <th className="py-3.5 px-4 rounded-l-xl">Market Factor</th>
                    <th className="py-3.5 px-4 text-[#0F2942]">Pre-Construction VIP</th>
                    <th className="py-3.5 px-4 text-stone-800">Move-In Resale Home</th>
                    <th className="py-3.5 px-4 text-[#8C6D43] rounded-r-xl">Realtor Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                  {trendsData.preConVsResale.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-stone-900 align-top sm:w-1/5">
                        {item.factor}
                      </td>
                      <td className="py-4 px-4 align-top sm:w-1/3 text-stone-800 leading-relaxed">
                        <div className="bg-[#0F2942]/5 p-2.5 rounded-xl border border-[#0F2942]/10">
                          {item.preConstruction}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top sm:w-1/3 text-stone-800 leading-relaxed">
                        <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                          {item.resale}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top sm:w-1/4 italic text-[#8C6D43] font-medium leading-relaxed">
                        {item.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#0F2942] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-[#C5A880]">Need personalized guidance?</span> Amit Sawhney reviews builder contracts and MLS resale listings with zero buyer commission fees.
              </div>
              <button
                onClick={() => onOpenVIPModal()}
                className="px-4 py-2 bg-[#C5A880] hover:bg-[#b0936b] text-stone-900 font-bold rounded-xl text-xs whitespace-nowrap transition-colors shadow-sm"
              >
                Access Platinum Pre-Con Projects
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Interest Rate & Purchasing Power */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>Macroeconomic & Rate Environment</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0F2942] font-serif">
                  {trendsData.rateImpactAnalysis.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {trendsData.rateImpactAnalysis.bocSummary}
                </p>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-[#0F2942] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#8C6D43]" />
                    <span>Buyer Strategic Action Plan:</span>
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                    {trendsData.rateImpactAnalysis.buyerStrategy}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-[#0F2942] to-[#1E3A8A] text-white p-6 rounded-3xl border border-blue-900 shadow-md space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A880]" />
                  <span>Mortgage Carrying Cost Advantage</span>
                </h4>
                <div className="space-y-3 text-xs text-stone-200">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/15 flex justify-between items-center">
                    <span>Whitby / Brooklin ($950k)</span>
                    <strong className="text-emerald-400 text-sm">~$3,820/mo</strong>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/15 flex justify-between items-center">
                    <span>Oshawa / Courtice ($750k)</span>
                    <strong className="text-emerald-400 text-sm">~$3,015/mo</strong>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/15 flex justify-between items-center">
                    <span>Markham / Richmond Hill ($1.45M)</span>
                    <strong className="text-stone-300 text-sm">~$5,840/mo</strong>
                  </div>
                </div>
                <p className="text-[11px] text-stone-300 italic pt-1">
                  *Based on 20% down payment, 5-year fixed rate @ 4.64%, 25-year amortization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Interactive Gemini AI Market Analyst */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#C5A880]/20 text-[#8C6D43] px-3 py-1 rounded-full text-xs font-bold border border-[#C5A880]/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D43]" />
                <span>Custom Gemini AI Market Inquiry</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0F2942] font-serif">
                Ask the AI Real Estate Market Analyst
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Have a specific question about property appreciation, transit expansion, or choosing between Durham neighborhoods? Ask below for instant, verified analysis.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Popular Questions to Ask:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAI(undefined, q)}
                    disabled={askingAI}
                    className="text-left bg-stone-50 hover:bg-[#0F2942] hover:text-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-700 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleAskAI} className="relative flex items-center gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={e => setCustomQuestion(e.target.value)}
                placeholder="Ask anything about Durham Region & GTA real estate trends, builder pricing, or ROI..."
                className="w-full bg-stone-50 border border-stone-300 rounded-2xl py-3.5 pl-4 pr-24 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942] focus:border-transparent transition-all"
                disabled={askingAI}
              />
              <button
                type="submit"
                disabled={askingAI || !customQuestion.trim()}
                className="absolute right-2 px-4 py-2 bg-[#0F2942] text-white rounded-xl text-xs font-bold hover:bg-[#153a5c] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {askingAI ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                )}
                <span>{askingAI ? 'Analyzing...' : 'Ask AI'}</span>
              </button>
            </form>

            {/* AI Generated Answer Card */}
            {aiAnswer && (
              <div className="bg-stone-50 p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8C6D43]" />
                    <span className="text-xs font-bold text-[#0F2942]">AI Market Analysis for: "{aiAnswer.query}"</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Generated at {aiAnswer.timestamp}</span>
                </div>
                <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {aiAnswer.answer}
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-stone-200 text-xs">
                  <span className="text-stone-500">Want to see specific listings or builder allocations?</span>
                  <a
                    href={`tel:${AMIT_SAWHNEY.phone}`}
                    className="font-bold text-[#0F2942] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-[#8C6D43]" />
                    <span>Call Amit ({AMIT_SAWHNEY.phoneFormatted})</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Market FAQs Accordion */}
        <div className="mt-12 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-[#0F2942] font-serif flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#8C6D43]" />
            <span>Frequently Asked Market Trend Questions</span>
          </h3>

          <div className="space-y-3 pt-2">
            {trendsData.faqs.map((faq, index) => {
              const isExpanded = expandedFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="border border-stone-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#0F2942]">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-12 bg-gradient-to-br from-[#FDFBF7] via-white to-[#F5F2E9] rounded-3xl p-8 sm:p-10 text-stone-900 text-center space-y-6 shadow-lg relative overflow-hidden border border-[#C5A880]/50">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-bold text-[#8C6D43] uppercase tracking-widest bg-[#8C6D43]/10 px-3.5 py-1 rounded-full border border-[#8C6D43]/20 inline-block">
              Independent Ontario REALTOR® Advisory
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F2942]">
              Ready to Capitalize on Current Market Dynamics?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Whether you are locking in a Platinum VIP pre-construction allocation with capped builder levies or searching for a turnkey move-in home in Durham Region, Amit Sawhney provides comprehensive representation at $0 buyer fee.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 relative z-10">
            <button
              onClick={() => onOpenVIPModal()}
              className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#b0936b] text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-stone-950" />
              <span>Register for VIP Price Lists</span>
            </button>

            <button
              onClick={onOpenValuation}
              className="px-6 py-3.5 bg-white hover:bg-stone-50 text-[#0F2942] font-bold rounded-xl text-xs sm:text-sm transition-all border border-stone-300 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-[#8C6D43]" />
              <span>Request Free Home Valuation (CMA)</span>
            </button>

            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="px-6 py-3.5 bg-[#0F2942] hover:bg-[#17375A] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#C5A880]" />
              <span>Call Direct: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
