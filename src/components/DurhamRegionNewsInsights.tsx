import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Train,
  Percent,
  CheckCircle2,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  DURHAM_NEWS_INSIGHTS,
  DURHAM_MUNICIPAL_SNAPSHOT,
  DURHAM_MACRO_INDICATORS,
  DURHAM_REGION_NEWS_METADATA,
  DurhamNewsInsight,
  MunicipalMarketSnapshot
} from '../data/durhamNewsInsights';

interface DurhamRegionNewsInsightsProps {
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  onOpenValuation?: () => void;
  onUpdateMarketData?: () => void;
}

export const DurhamRegionNewsInsights: React.FC<DurhamRegionNewsInsightsProps> = ({
  onOpenConsultation = (_topic?: string, _notes?: string) => {},
  onOpenValuation = () => {}
}) => {
  const [insights, setInsights] = useState<DurhamNewsInsight[]>(DURHAM_NEWS_INSIGHTS);
  const [munis, setMunis] = useState<MunicipalMarketSnapshot[]>(DURHAM_MUNICIPAL_SNAPSHOT);
  const [macro, setMacro] = useState(DURHAM_MACRO_INDICATORS);
  const [meta, setMeta] = useState(DURHAM_REGION_NEWS_METADATA);

  const [activeInsightId, setActiveInsightId] = useState<string>(DURHAM_NEWS_INSIGHTS[0].id);
  const [selectedMuniCode, setSelectedMuniCode] = useState<string>('pickering');

  // Fetch live published market data from server
  const fetchLiveMarketData = async () => {
    try {
      const res = await fetch('/api/market-pulse/data');
      if (res.ok) {
        const json = await res.json();
        if (json.editorialInsights && Array.isArray(json.editorialInsights) && json.editorialInsights.length > 0) {
          setInsights(json.editorialInsights);
          if (!json.editorialInsights.some((i: DurhamNewsInsight) => i.id === activeInsightId)) {
            setActiveInsightId(json.editorialInsights[0].id);
          }
        }
        if (json.municipalSnapshot && Array.isArray(json.municipalSnapshot) && json.municipalSnapshot.length > 0) {
          setMunis(json.municipalSnapshot);
        }
        if (json.macroIndicators && Array.isArray(json.macroIndicators) && json.macroIndicators.length > 0) {
          setMacro(json.macroIndicators);
        }
        if (json.metadata) {
          setMeta(json.metadata);
        }
      }
    } catch {
      // Keep static defaults seamlessly
    }
  };

  useEffect(() => {
    fetchLiveMarketData();
    const handleSyncEvent = () => fetchLiveMarketData();
    window.addEventListener('market-pulse-updated', handleSyncEvent);
    return () => window.removeEventListener('market-pulse-updated', handleSyncEvent);
  }, []);

  const activeInsight = insights.find(i => i.id === activeInsightId) || insights[0] || DURHAM_NEWS_INSIGHTS[0];
  const activeMuni = munis.find(m => m.regionCode === selectedMuniCode) || munis[0] || DURHAM_MUNICIPAL_SNAPSHOT[0];

  const getCategoryIcon = (category: DurhamNewsInsight['category']) => {
    switch (category) {
      case 'Market Dynamics':
        return <TrendingUp className="w-4 h-4 text-[#8C6D43]" />;
      case 'Interest Rates':
        return <Percent className="w-4 h-4 text-emerald-700" />;
      case 'Municipal Trends':
        return <Building className="w-4 h-4 text-[#0F2942]" />;
      case 'Infrastructure':
        return <Train className="w-4 h-4 text-amber-700" />;
      default:
        return <Newspaper className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Source Credit Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-200/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5 text-[#8C6D43]" />
              <span>DurhamRegion.com Editorial Coverage</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Intelligent Real Estate Insights: Durham Region
            </h3>
            <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
              Curated intelligence, municipal price velocity, and infrastructure analysis synthesized directly from reporting published on{' '}
              <a
                href={DURHAM_REGION_NEWS_METADATA.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8C6D43] font-semibold hover:underline inline-flex items-center gap-1"
              >
                DurhamRegion.com/business/real-estate
                <ExternalLink className="w-3 h-3 inline" />
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={DURHAM_REGION_NEWS_METADATA.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              <span>Visit DurhamRegion.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onOpenValuation()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#b5956a] text-stone-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              <span>Check Your Home's Value</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Macro Indicators from DurhamRegion.com */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {macro.map((indicator, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>{indicator.label}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700">
                  {indicator.benchmark}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-stone-900">
                {indicator.value}
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                {indicator.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Analysis Section: Editorial Storylines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Insight Category Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Key Editorial Themes
            </span>
            <span className="text-[11px] text-stone-400">
              {insights.length} Key Topics
            </span>
          </div>

          <div className="space-y-2">
            {insights.map((item) => {
              const isSelected = item.id === activeInsightId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveInsightId(item.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-md'
                      : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {item.sourceDate}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold font-serif leading-snug line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-stone-900'
                  }`}>
                    {item.headline}
                  </h4>

                  <p className={`text-xs mt-1 line-clamp-2 ${
                    isSelected ? 'text-stone-300' : 'text-stone-600'
                  }`}>
                    {item.subheadline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Prompt / Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <Info className="w-3.5 h-3.5 text-[#8C6D43]" />
              <span>Independent Editorial Citation</span>
            </div>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              Synthesized from local investigative and municipal market articles published by Metroland Media in DurhamRegion.com.
            </p>
          </div>
        </div>

        {/* Right Column: Deep Dive into Active Insight */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Header of Active Insight */}
          <div className="space-y-3 pb-6 border-b border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D43]">
                {getCategoryIcon(activeInsight.category)}
                <span>{activeInsight.category} Deep Dive</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeInsight.sourcePublication} • {activeInsight.sourceDate}</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
              {activeInsight.headline}
            </h3>

            <p className="text-sm font-medium text-stone-600 italic">
              "{activeInsight.subheadline}"
            </p>
          </div>

          {/* Key Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeInsight.keyStats.map((stat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-center">
                <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider mb-0.5">
                  {stat.label}
                </span>
                <span className="text-xl font-bold font-mono text-[#0F2942]">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Editorial Summary & Market Evidence
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
              {activeInsight.summary}
            </p>
          </div>

          {/* Dual Action Takeaways: Sellers vs. Buyers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* For Sellers */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#8C6D43]" />
                <span>What This Means for Sellers</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {activeInsight.sellerTakeaway}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenValuation()}
                  className="text-xs font-bold text-[#8C6D43] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Evaluate your home at 1% commission</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* For Buyers */}
            <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-200/80 space-y-2">
              <div className="flex items-center gap-2 text-[#0F2942] font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#0F2942]" />
                <span>What This Means for Buyers</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {activeInsight.buyerTakeaway}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenConsultation('Buyer Negotiation Strategy', `Discussing ${activeInsight.headline}`)}
                  className="text-xs font-bold text-[#0F2942] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Plan your purchase strategy with Amit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200/60 text-xs">
            <span className="text-stone-400 font-medium mr-1">Report Topics:</span>
            {activeInsight.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Municipal Benchmark Matrix from DurhamRegion.com Reporting */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5 text-[#8C6D43]" />
              <span>Municipal Comparison</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Durham Municipal Snapshot & Price Distribution
            </h3>
            <p className="text-xs text-stone-600">
              Comparative benchmark prices and market conditions reported across Durham Region municipalities
            </p>
          </div>

          <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Updated {meta.lastRefreshed || 'Q3 2026 Reporting'}</span>
          </div>
        </div>

        {/* Municipality Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {munis.map((muni) => {
            const isSelected = muni.regionCode === selectedMuniCode;
            return (
              <button
                key={muni.regionCode}
                type="button"
                onClick={() => setSelectedMuniCode(muni.regionCode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F2942] text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {muni.name}
              </button>
            );
          })}
        </div>

        {/* Highlighted Municipality Card */}
        <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-serif font-bold text-stone-900">
                {activeMuni.name}
              </h4>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                activeMuni.marketCondition === 'Tight Seller Market'
                  ? 'bg-rose-100 text-rose-800'
                  : activeMuni.marketCondition === 'Buyer Favoured'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeMuni.marketCondition}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {activeMuni.highlight}
            </p>

            <div className="text-xs text-stone-500 flex items-center gap-1.5 pt-1">
              <Train className="w-3.5 h-3.5 text-stone-600" />
              <span>{activeMuni.commuterProximity}</span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                Avg Sold Price
              </span>
              <span className="text-base font-bold font-mono text-stone-900">
                ${activeMuni.avgSoldPrice.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                Detached Avg
              </span>
              <span className="text-base font-bold font-mono text-stone-900">
                ${activeMuni.detachedAvgPrice.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                Inventory (MOI)
              </span>
              <span className="text-base font-bold font-mono text-stone-900">
                {activeMuni.inventoryMonths} Mos
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
                Sale / List
              </span>
              <span className="text-base font-bold font-mono text-stone-900">
                {activeMuni.saleToListRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* Full Municipal Table for Quick Reference */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100 text-stone-900 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Municipality</th>
                <th className="py-3 px-4">Avg Sold Price</th>
                <th className="py-3 px-4">Detached Benchmark</th>
                <th className="py-3 px-4">Supply (MOI)</th>
                <th className="py-3 px-4">Sale / List Ratio</th>
                <th className="py-3 px-4">Market Condition</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 bg-white">
              {munis.map((m) => (
                <tr
                  key={m.regionCode}
                  className={`hover:bg-stone-50 transition-colors ${
                    m.regionCode === selectedMuniCode ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {m.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                    ${m.avgSoldPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-700">
                    ${m.detachedAvgPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-700">
                    {m.inventoryMonths} Months
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-700">
                    {m.saleToListRatio}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      m.marketCondition === 'Tight Seller Market'
                        ? 'bg-rose-100 text-rose-800'
                        : m.marketCondition === 'Buyer Favoured'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.marketCondition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenConsultation('Municipal Pricing Analysis', `Discussing market conditions in ${m.name}`)}
                      className="text-[11px] font-bold text-[#8C6D43] hover:underline cursor-pointer"
                    >
                      Consult Amit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Citation & Source Disclaimer */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <span>
            Source Publication: <strong className="text-stone-700">{meta.portalName || 'DurhamRegion.com Real Estate'}</strong> ({meta.publisher || 'Metroland Media Group'}) & TRREB MLS® System data.
          </span>
          <a
            href={meta.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8C6D43] hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Read full local coverage on DurhamRegion.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
