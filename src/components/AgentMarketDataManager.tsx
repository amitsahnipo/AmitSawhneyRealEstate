import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  Newspaper,
  Calendar,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  FileSpreadsheet,
  LayoutDashboard,
  SlidersHorizontal,
  Search,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  FileText,
  Upload,
  Download,
  Percent,
  Layers,
  ArrowDownRight,
  Sliders,
  CheckSquare,
  Square,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DurhamNewsInsight,
  MunicipalMarketSnapshot,
  DURHAM_REGION_NEWS_METADATA,
  DURHAM_NEWS_INSIGHTS,
  DURHAM_MUNICIPAL_SNAPSHOT,
  DURHAM_MACRO_INDICATORS
} from '../data/durhamNewsInsights';

export type SubView = 'overview' | 'municipal' | 'macro' | 'editorial' | 'import' | 'settings';

export interface ParsedBatchItem extends Partial<MunicipalMarketSnapshot> {
  included: boolean;
  originalAvgPrice?: number;
  originalDetachedPrice?: number;
  originalMOI?: number;
  originalSaleToList?: number;
}

export interface AgentMarketDataManagerProps {
  initialSubView?: SubView;
}

export const AgentMarketDataManager: React.FC<AgentMarketDataManagerProps> = ({
  initialSubView = 'overview'
}) => {
  const { getAuthHeaders } = useAuth();

  // Sub-view Tab Navigation
  const [activeSubView, setActiveSubView] = useState<SubView>(initialSubView);

  // Sync external initialSubView prop if changed
  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  // Loading & State
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [syncingAI, setSyncingAI] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Form Data
  const [metadata, setMetadata] = useState(DURHAM_REGION_NEWS_METADATA);
  const [macroIndicators, setMacroIndicators] = useState(DURHAM_MACRO_INDICATORS);
  const [municipalSnapshot, setMunicipalSnapshot] = useState<MunicipalMarketSnapshot[]>(DURHAM_MUNICIPAL_SNAPSHOT);
  const [editorialInsights, setEditorialInsights] = useState<DurhamNewsInsight[]>(DURHAM_NEWS_INSIGHTS);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>('');

  // Municipal View State
  const [muniSearch, setMuniSearch] = useState<string>('');
  const [muniFilter, setMuniFilter] = useState<string>('all');
  const [muniViewMode, setMuniViewMode] = useState<'grid' | 'table'>('grid');

  // Editorial Filter State
  const [editorialCategoryFilter, setEditorialCategoryFilter] = useState<string>('all');

  // TRREB Batch Import State
  const [importMethod, setImportMethod] = useState<'paste' | 'upload' | 'presets' | 'adjust' | 'ai'>('paste');
  const [quickPasteText, setQuickPasteText] = useState<string>('');
  const [quickPasteError, setQuickPasteError] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<ParsedBatchItem[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [bulkPercent, setBulkPercent] = useState<number>(2.5);
  const [bulkMOI, setBulkMOI] = useState<number>(-0.2);
  const [bulkSaleToList, setBulkSaleToList] = useState<number>(0.5);
  const [publishDirectlyOnCommit, setPublishDirectlyOnCommit] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch current data from server
  const fetchMarketData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/market-pulse/data');
      if (res.ok) {
        const json = await res.json();
        if (json.metadata) setMetadata(json.metadata);
        if (json.macroIndicators) setMacroIndicators(json.macroIndicators);
        if (json.municipalSnapshot) setMunicipalSnapshot(json.municipalSnapshot);
        if (json.editorialInsights) setEditorialInsights(json.editorialInsights);
        if (json.updatedAt) setUpdatedAt(json.updatedAt);
        if (json.lastUpdatedBy) setLastUpdatedBy(json.lastUpdatedBy);
        setIsDirty(false);
      }
    } catch (err: any) {
      console.error('Failed to fetch market pulse data:', err);
      setErrorMessage('Failed to load market pulse data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Save changes to server
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const payload = {
        metadata: {
          ...metadata,
          lastRefreshed: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        },
        macroIndicators,
        municipalSnapshot,
        editorialInsights
      };

      const res = await fetch('/api/market-pulse/data', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        setSuccessMessage('Market data successfully published to the live platform & valuation engine!');
        setIsDirty(false);
        if (resData.data?.updatedAt) setUpdatedAt(resData.data.updatedAt);
        if (resData.data?.lastUpdatedBy) setLastUpdatedBy(resData.data.lastUpdatedBy);
        window.dispatchEvent(new Event('market-pulse-updated'));
        setTimeout(() => setSuccessMessage(''), 6000);
      } else {
        const errJson = await res.json();
        setErrorMessage(errJson.error || 'Failed to save market data.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage('Network error while saving market data.');
    } finally {
      setSaving(false);
    }
  };

  // AI-Assisted Auto-Sync with Gemini
  const handleAISync = async () => {
    if (!confirm('Run Gemini AI auto-sync to scan latest TRREB and DurhamRegion.com market data? This will automatically calibrate benchmark values.')) {
      return;
    }
    setSyncingAI(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/market-pulse/sync-ai', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.metadata) setMetadata(json.data.metadata);
          if (json.data.macroIndicators) setMacroIndicators(json.data.macroIndicators);
          if (json.data.municipalSnapshot) setMunicipalSnapshot(json.data.municipalSnapshot);
          if (json.data.editorialInsights) setEditorialInsights(json.data.editorialInsights);
          if (json.data.updatedAt) setUpdatedAt(json.data.updatedAt);
          if (json.data.lastUpdatedBy) setLastUpdatedBy(json.data.lastUpdatedBy);
          setIsDirty(false);
        }
        setSuccessMessage('Successfully synchronized market data using Gemini AI!');
        window.dispatchEvent(new Event('market-pulse-updated'));
        setTimeout(() => setSuccessMessage(''), 6000);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'AI Sync failed. Please verify server API key.');
      }
    } catch (err: any) {
      console.error('AI Sync error:', err);
      setErrorMessage('Failed to connect to AI Sync service.');
    } finally {
      setSyncingAI(false);
    }
  };

  // Reset to initial baseline
  const handleReset = async () => {
    if (!confirm('Reset all market pulse data, indicators, and municipal matrix to default baseline values?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/market-pulse/reset', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMetadata(json.data.metadata);
          setMacroIndicators(json.data.macroIndicators);
          setMunicipalSnapshot(json.data.municipalSnapshot);
          setEditorialInsights(json.data.editorialInsights);
          setUpdatedAt(json.data.updatedAt);
          setLastUpdatedBy(json.data.lastUpdatedBy);
          setIsDirty(false);
        }
        setSuccessMessage('Reset to factory baseline successful.');
        window.dispatchEvent(new Event('market-pulse-updated'));
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Reset error:', err);
      setErrorMessage('Failed to reset market pulse data.');
    } finally {
      setLoading(false);
    }
  };

  // Update specific municipal row
  const handleUpdateMuni = (index: number, field: keyof MunicipalMarketSnapshot, value: any) => {
    const updated = [...municipalSnapshot];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setMunicipalSnapshot(updated);
    setIsDirty(true);
  };

  // Update macro indicator
  const handleUpdateMacro = (index: number, field: string, value: string) => {
    const updated = [...macroIndicators];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setMacroIndicators(updated);
    setIsDirty(true);
  };

  // Export CSV Template of current matrix
  const handleExportCSV = () => {
    const headers = [
      'Municipality',
      'Region Code',
      'Average Sold Price',
      'Detached Average Price',
      'Months of Inventory (MOI)',
      'Sale to List Ratio (%)',
      'Market Condition',
      'Commuter Proximity',
      'Market Highlight'
    ];

    const rows = municipalSnapshot.map(m => [
      `"${m.name}"`,
      `"${m.regionCode}"`,
      m.avgSoldPrice,
      m.detachedAvgPrice,
      m.inventoryMonths,
      m.saleToListRatio,
      `"${m.marketCondition}"`,
      `"${m.commuterProximity}"`,
      `"${m.highlight.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TRREB_Durham_Market_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload from Disk (.csv, .tsv, .txt)
  const handleFileProcess = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setQuickPasteText(text);
        parseTRREBText(text);
      }
    };
    reader.readAsText(file);
  };

  // Enhanced TRREB Parser with Fuzzy Match, Strip Formatting, and Delta Previews
  const parseTRREBText = (text: string) => {
    setQuickPasteError('');
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    try {
      const lines = text.trim().split('\n');
      const preview: ParsedBatchItem[] = [];

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        // Skip table header lines
        if (/^(town|city|municipality|region|area|name|market)/i.test(line)) {
          continue;
        }

        // Split by comma, tab, semicolon, or multiple spaces
        const parts = line.split(/[,\t;]+/).map(p => p.trim());
        if (parts.length >= 2) {
          const namePart = parts[0].toLowerCase();

          // Fuzzy Match target municipality in Durham Region
          const matchedTarget = municipalSnapshot.find(m => {
            const mName = m.name.toLowerCase();
            const mCode = m.regionCode.toLowerCase();
            if (namePart.includes('pickering') && mCode === 'pickering') return true;
            if (namePart.includes('ajax') && mCode === 'ajax') return true;
            if ((namePart.includes('whitby') || namePart.includes('brooklin')) && mCode === 'whitby') return true;
            if (namePart.includes('oshawa') && mCode === 'oshawa') return true;
            if ((namePart.includes('clarington') || namePart.includes('courtice') || namePart.includes('bowmanville') || namePart.includes('newcastle')) && mCode === 'clarington') return true;
            if ((namePart.includes('scugog') || namePart.includes('uxbridge') || namePart.includes('port perry') || namePart.includes('brock') || namePart.includes('north')) && mCode === 'north_durham') return true;
            return mName.includes(namePart) || namePart.includes(mName) || mCode.includes(namePart);
          });

          if (matchedTarget) {
            // Clean numbers: strip $, commas, %, "mo", "months"
            const cleanNum = (str: string | undefined, defaultVal: number): number => {
              if (!str) return defaultVal;
              const cleaned = str.replace(/[$,%]|mo|months/gi, '').trim();
              const parsed = parseFloat(cleaned);
              return isNaN(parsed) ? defaultVal : parsed;
            };

            const avg = cleanNum(parts[1], matchedTarget.avgSoldPrice);
            const detached = parts.length >= 3 ? cleanNum(parts[2], matchedTarget.detachedAvgPrice) : matchedTarget.detachedAvgPrice;
            const moi = parts.length >= 4 ? cleanNum(parts[3], matchedTarget.inventoryMonths) : matchedTarget.inventoryMonths;
            const snlr = parts.length >= 5 ? cleanNum(parts[4], matchedTarget.saleToListRatio) : matchedTarget.saleToListRatio;

            // Determine projected condition based on MOI
            let condition: 'Tight Seller Market' | 'Balanced Market' | 'Buyer Favoured' = matchedTarget.marketCondition;
            if (moi < 3.0) condition = 'Tight Seller Market';
            else if (moi > 4.5) condition = 'Buyer Favoured';
            else condition = 'Balanced Market';

            const item: ParsedBatchItem = {
              name: matchedTarget.name,
              regionCode: matchedTarget.regionCode,
              avgSoldPrice: avg,
              detachedAvgPrice: detached,
              inventoryMonths: moi,
              saleToListRatio: snlr,
              marketCondition: condition,
              highlight: matchedTarget.highlight,
              commuterProximity: matchedTarget.commuterProximity,
              included: true,
              originalAvgPrice: matchedTarget.avgSoldPrice,
              originalDetachedPrice: matchedTarget.detachedAvgPrice,
              originalMOI: matchedTarget.inventoryMonths,
              originalSaleToList: matchedTarget.saleToListRatio
            };

            // Deduplicate if already parsed in this batch
            const existingIdx = preview.findIndex(p => p.regionCode === matchedTarget.regionCode);
            if (existingIdx !== -1) {
              preview[existingIdx] = item;
            } else {
              preview.push(item);
            }
          }
        }
      }

      if (preview.length > 0) {
        setParsedPreview(preview);
      } else {
        setQuickPasteError('Could not match municipal names. Ensure input contains: Pickering, Ajax, Whitby, Oshawa, Clarington, or Scugog/Uxbridge.');
        setParsedPreview([]);
      }
    } catch (err: any) {
      setQuickPasteError('Parse error: ' + err.message);
      setParsedPreview([]);
    }
  };

  // Generate Bulk Uniform Market Adjustment Simulation
  const handleGenerateBulkAdjustment = (pct: number, moiDelta: number, snlrDelta: number) => {
    const preview: ParsedBatchItem[] = municipalSnapshot.map(m => {
      const multiplier = 1 + (pct / 100);
      const newAvg = Math.round(m.avgSoldPrice * multiplier);
      const newDetached = Math.round(m.detachedAvgPrice * multiplier);
      const newMoi = Math.max(1.0, Number((m.inventoryMonths + moiDelta).toFixed(1)));
      const newSnlr = Math.min(105, Math.max(90, Number((m.saleToListRatio + snlrDelta).toFixed(1))));

      let condition: 'Tight Seller Market' | 'Balanced Market' | 'Buyer Favoured' = m.marketCondition;
      if (newMoi < 3.0) condition = 'Tight Seller Market';
      else if (newMoi > 4.5) condition = 'Buyer Favoured';
      else condition = 'Balanced Market';

      return {
        name: m.name,
        regionCode: m.regionCode,
        avgSoldPrice: newAvg,
        detachedAvgPrice: newDetached,
        inventoryMonths: newMoi,
        saleToListRatio: newSnlr,
        marketCondition: condition,
        highlight: m.highlight,
        commuterProximity: m.commuterProximity,
        included: true,
        originalAvgPrice: m.avgSoldPrice,
        originalDetachedPrice: m.detachedAvgPrice,
        originalMOI: m.inventoryMonths,
        originalSaleToList: m.saleToListRatio
      };
    });

    setParsedPreview(preview);
    setSuccessMessage(`Simulated ${pct >= 0 ? '+' : ''}${pct}% market shift across all ${preview.length} municipalities. Review deltas below!`);
  };

  // Inline edit individual field in the preview matrix
  const handleUpdatePreviewItem = (index: number, field: keyof ParsedBatchItem, val: any) => {
    const updated = [...parsedPreview];
    updated[index] = {
      ...updated[index],
      [field]: val
    };

    // If MOI changed, auto-recalculate market condition
    if (field === 'inventoryMonths') {
      const num = Number(val);
      if (num < 3.0) updated[index].marketCondition = 'Tight Seller Market';
      else if (num > 4.5) updated[index].marketCondition = 'Buyer Favoured';
      else updated[index].marketCondition = 'Balanced Market';
    }

    setParsedPreview(updated);
  };

  // Toggle single item inclusion
  const handleToggleInclude = (index: number) => {
    const updated = [...parsedPreview];
    updated[index].included = !updated[index].included;
    setParsedPreview(updated);
  };

  // Toggle select all in preview
  const handleToggleSelectAll = (select: boolean) => {
    setParsedPreview(prev => prev.map(p => ({ ...p, included: select })));
  };

  // Commit Parsed Preview to Municipal Matrix with Optional Instant Live Publish
  const handleApplyParsedPreview = async (publishImmediately: boolean = false) => {
    const activeItems = parsedPreview.filter(p => p.included);
    if (activeItems.length === 0) {
      setQuickPasteError('Please select at least one municipality in the preview table to apply.');
      return;
    }

    const updated = [...municipalSnapshot];
    let appliedCount = 0;

    activeItems.forEach(p => {
      const idx = updated.findIndex(m => m.regionCode === p.regionCode);
      if (idx !== -1) {
        if (p.avgSoldPrice) updated[idx].avgSoldPrice = p.avgSoldPrice;
        if (p.detachedAvgPrice) updated[idx].detachedAvgPrice = p.detachedAvgPrice;
        if (p.inventoryMonths) updated[idx].inventoryMonths = p.inventoryMonths;
        if (p.saleToListRatio) updated[idx].saleToListRatio = p.saleToListRatio;
        if (p.marketCondition) updated[idx].marketCondition = p.marketCondition;
        appliedCount++;
      }
    });

    setMunicipalSnapshot(updated);
    setIsDirty(true);

    if (publishImmediately) {
      setSaving(true);
      try {
        const payload = {
          metadata: {
            ...metadata,
            lastRefreshed: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          },
          macroIndicators,
          municipalSnapshot: updated,
          editorialInsights
        };

        const res = await fetch('/api/market-pulse/data', {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const resData = await res.json();
          setSuccessMessage(`Successfully updated and published ${appliedCount} Durham municipalities to the live platform & valuation engine!`);
          setIsDirty(false);
          if (resData.data?.updatedAt) setUpdatedAt(resData.data.updatedAt);
          if (resData.data?.lastUpdatedBy) setLastUpdatedBy(resData.data.lastUpdatedBy);
          window.dispatchEvent(new Event('market-pulse-updated'));
          setTimeout(() => setSuccessMessage(''), 7000);
        } else {
          setErrorMessage('Applied to local draft, but failed to publish to server.');
        }
      } catch (err) {
        setErrorMessage('Applied to local draft, but network error occurred during publish.');
      } finally {
        setSaving(false);
      }
    } else {
      setSuccessMessage(`Successfully updated ${appliedCount} municipalities in draft matrix! Click "Publish to Live Site" to commit.`);
      setTimeout(() => setSuccessMessage(''), 6000);
    }

    setParsedPreview([]);
    setQuickPasteText('');
    setActiveSubView('municipal');
  };

  // Filtered Municipalities for display
  const filteredMunicipalities = municipalSnapshot.filter(muni => {
    const matchesSearch = muni.name.toLowerCase().includes(muniSearch.toLowerCase()) ||
      muni.commuterProximity.toLowerCase().includes(muniSearch.toLowerCase()) ||
      muni.highlight.toLowerCase().includes(muniSearch.toLowerCase());

    const matchesFilter = muniFilter === 'all' || muni.marketCondition === muniFilter;
    return matchesSearch && matchesFilter;
  });

  // Filtered Editorial Insights
  const filteredEditorial = editorialInsights.filter(story => {
    if (editorialCategoryFilter === 'all') return true;
    return story.category === editorialCategoryFilter;
  });

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#0F2942] animate-spin mx-auto" />
        <p className="text-sm font-semibold text-stone-700">Loading Market Intelligence data...</p>
        <p className="text-xs text-stone-400">Retrieving municipal benchmarks and editorial data from server</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-stone-50">
      
      {/* 1. TOP COMMAND BAR - Pinned & Context-Aware */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 sticky top-0 z-10 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0F2942] text-[#C5A880] flex items-center justify-center font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                Market Data & TRREB Sync Manager
              </h2>
              {isDirty ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Staged Unsaved Changes
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Live on Portal
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              Period: <strong className="text-stone-700">{metadata.reportingPeriod}</strong>
              {updatedAt && (
                <span> • Last committed: {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {lastUpdatedBy || 'Agent'}</span>
              )}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('import')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubView === 'import'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900'
            }`}
            title="Fast batch import from TRREB Market Watch, CSV, or Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">TRREB Batch Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleAISync}
            disabled={syncingAI}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Scan latest DurhamRegion.com articles and TRREB stats via Gemini AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${syncingAI ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{syncingAI ? 'AI Syncing...' : 'AI Auto-Sync'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              isDirty
                ? 'bg-[#8C6D43] hover:bg-[#725735] text-white ring-2 ring-[#C5A880]/50'
                : 'bg-[#0F2942] hover:bg-[#153a5c] text-white'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Publishing...' : 'Publish to Live Site'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-VIEW SEGMENTED NAVIGATION PILLS */}
      <div className="bg-stone-100/90 border-b border-stone-200 px-4 sm:px-6 py-2 overflow-x-auto flex items-center gap-1.5 sm:gap-2 shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveSubView('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeSubView === 'overview'
              ? 'bg-white text-[#0F2942] shadow-xs border border-stone-200/80 font-extrabold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-[#0F2942]" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveSubView('municipal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeSubView === 'municipal'
              ? 'bg-white text-[#0F2942] shadow-xs border border-stone-200/80 font-extrabold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-[#8C6D43]" />
          <span>Municipal Price Matrix ({municipalSnapshot.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('macro')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeSubView === 'macro'
              ? 'bg-white text-[#0F2942] shadow-xs border border-stone-200/80 font-extrabold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
          <span>Macro Policy & BoC Rates ({macroIndicators.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('editorial')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeSubView === 'editorial'
              ? 'bg-white text-[#0F2942] shadow-xs border border-stone-200/80 font-extrabold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5 text-blue-700" />
          <span>Editorial Stories ({editorialInsights.length})</span>
        </button>

        <button
          id="agent-import-tab-btn"
          onClick={() => setActiveSubView('import')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeSubView === 'import'
              ? 'bg-amber-500 text-stone-950 shadow-xs border border-amber-400 font-extrabold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-900" />
          <span>TRREB Batch Import</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-200 text-amber-950 font-black">
            Fast
          </span>
        </button>

        <button
          onClick={() => setActiveSubView('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeSubView === 'settings'
              ? 'bg-white text-[#0F2942] shadow-xs border border-stone-200/80 font-extrabold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
          <span>Publishing & Metadata</span>
        </button>
      </div>

      {/* 3. ALERTS & NOTIFICATIONS */}
      {successMessage && (
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. WORKSPACE CONTENT AREA (Switching cleanly between tabs) */}
      <div className="p-4 sm:p-6 space-y-6 flex-1">
        
        {/* ========================================================
            SUB-VIEW 1: EXECUTIVE OVERVIEW
        ======================================================== */}
        {activeSubView === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick Hero Glance */}
            <div className="bg-gradient-to-r from-[#0F2942] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A880]/20 text-[#C5A880] text-[10px] font-extrabold uppercase tracking-wider border border-[#C5A880]/30 mb-2">
                    <Compass className="w-3 h-3" />
                    <span>Executive Real Estate Intelligence</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif">Durham Region Housing Pulse</h3>
                  <p className="text-xs text-stone-300 max-w-2xl leading-relaxed mt-1">
                    {metadata.editorialSynopsis}
                  </p>
                </div>
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2 text-right">
                  <a
                    href={metadata.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>View DurhamRegion.com Source</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880]" />
                  </a>
                  <span className="text-[11px] text-stone-300">
                    Source: {metadata.publisher}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Macro Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {macroIndicators.map((macro, idx) => (
                <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>{macro.label}</span>
                    <button
                      onClick={() => setActiveSubView('macro')}
                      className="text-[11px] text-[#8C6D43] hover:underline font-bold"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-xl font-extrabold text-[#0F2942] font-serif">
                    {macro.value}
                  </div>
                  <div className="text-[11px] font-bold text-stone-600 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                    {macro.benchmark}
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug">
                    {macro.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Fast TRREB Batch Refresh & Intelligence Hub */}
            <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[10px] uppercase tracking-wider">
                    Agent Intelligence Engine
                  </span>
                  <span className="text-xs text-stone-500 font-medium">TRREB Community Market Watch Hub</span>
                </div>
                <h4 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-800" />
                  <span>Rapid TRREB Batch Calibration & Intelligence Sync</span>
                </h4>
                <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                  Easily update all Durham municipality benchmarks simultaneously. Paste report text, drag-and-drop CSV/TSV spreadsheets, load official presets, or run Gemini AI auto-sync.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                  title="Download current Durham matrix as CSV for editing in Excel"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleAISync}
                  disabled={syncingAI}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Run Gemini AI search grounding for latest market stats"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-purple-700 ${syncingAI ? 'animate-spin' : ''}`} />
                  <span>{syncingAI ? 'Syncing...' : 'Gemini AI Sync'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubView('import')}
                  className="px-4 py-2 rounded-xl bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Launch Batch Import</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </button>
              </div>
            </div>

            {/* Municipal Price Matrix Quick Glance */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#8C6D43]" />
                    <span>Regional Benchmarks at a Glance (6 Municipalities)</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    Directly influences public average pricing cards and comparative market analysis
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubView('municipal')}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Matrix Editor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {municipalSnapshot.map(m => {
                  const conditionBadge =
                    m.marketCondition === 'Tight Seller Market'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : m.marketCondition === 'Buyer Favoured'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300';

                  return (
                    <div
                      key={m.regionCode}
                      className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/70 hover:bg-white hover:shadow-xs transition-all space-y-2 cursor-pointer"
                      onClick={() => {
                        setMuniSearch(m.name);
                        setActiveSubView('municipal');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm font-serif">{m.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${conditionBadge}`}>
                          {m.marketCondition}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 block">Avg Price:</span>
                          <span className="font-bold text-stone-900">${m.avgSoldPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Detached Benchmark:</span>
                          <span className="font-bold text-stone-900">${m.detachedAvgPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                        <span>MOI: <strong>{m.inventoryMonths} mo</strong></span>
                        <span>Sale/List: <strong>{m.saleToListRatio}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Editorial Insights Glance */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-[#8C6D43]" />
                    <span>Active Editorial Highlights & Client Advice</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    {editorialInsights.length} stories educating buyers and sellers on DurhamRegion.com market dynamics
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubView('editorial')}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Editorial Stories</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {editorialInsights.slice(0, 2).map(story => (
                  <div key={story.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-bold text-[#8C6D43] uppercase tracking-wider">{story.category}</span>
                      <span>{story.sourceDate}</span>
                    </div>
                    <h5 className="font-bold text-stone-900 line-clamp-1">{story.headline}</h5>
                    <p className="text-stone-600 line-clamp-2 leading-relaxed text-[11px]">{story.summary}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 font-semibold truncate max-w-[45%]">
                        Seller: {story.sellerTakeaway}
                      </span>
                      <span className="text-emerald-800 font-semibold truncate max-w-[45%]">
                        Buyer: {story.buyerTakeaway}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            SUB-VIEW 2: MUNICIPAL PRICE MATRIX
        ======================================================== */}
        {activeSubView === 'municipal' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Filter & Control Header */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={muniSearch}
                    onChange={e => setMuniSearch(e.target.value)}
                    placeholder="Search municipality (e.g. Pickering)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942] focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setMuniFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      muniFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All ({municipalSnapshot.length})
                  </button>
                  <button
                    onClick={() => setMuniFilter('Tight Seller Market')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      muniFilter === 'Tight Seller Market' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Tight Seller
                  </button>
                  <button
                    onClick={() => setMuniFilter('Balanced Market')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      muniFilter === 'Balanced Market' ? 'bg-white text-blue-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    onClick={() => setMuniFilter('Buyer Favoured')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      muniFilter === 'Buyer Favoured' ? 'bg-white text-amber-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Buyer Favoured
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => setActiveSubView('import')}
                  className="px-3 py-1.5 rounded-xl bg-[#0F2942]/10 hover:bg-[#0F2942]/20 text-[#0F2942] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Batch Paste TRREB</span>
                </button>

                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-100 p-0.5 text-xs">
                  <button
                    onClick={() => setMuniViewMode('grid')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      muniViewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Cards View
                  </button>
                  <button
                    onClick={() => setMuniViewMode('table')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      muniViewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Cards View */}
            {muniViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMunicipalities.map((muni) => {
                  const origIndex = municipalSnapshot.findIndex(item => item.regionCode === muni.regionCode);

                  return (
                    <div
                      key={muni.regionCode}
                      className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div>
                          <h4 className="font-bold text-stone-900 font-serif text-base">{muni.name}</h4>
                          <span className="text-[10px] text-stone-400 font-mono uppercase">{muni.regionCode}</span>
                        </div>
                        <select
                          value={muni.marketCondition}
                          onChange={e => handleUpdateMuni(origIndex, 'marketCondition', e.target.value)}
                          className="px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold bg-stone-50"
                        >
                          <option value="Tight Seller Market">Tight Seller Market</option>
                          <option value="Balanced Market">Balanced Market</option>
                          <option value="Buyer Favoured">Buyer Favoured</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase">Avg Sold Price</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                            <input
                              type="number"
                              value={muni.avgSoldPrice}
                              onChange={e => handleUpdateMuni(origIndex, 'avgSoldPrice', Number(e.target.value))}
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 focus:ring-1 focus:ring-[#0F2942]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase">Detached Benchmark</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                            <input
                              type="number"
                              value={muni.detachedAvgPrice}
                              onChange={e => handleUpdateMuni(origIndex, 'detachedAvgPrice', Number(e.target.value))}
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 focus:ring-1 focus:ring-[#0F2942]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase">Months Inventory (MOI)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={muni.inventoryMonths}
                            onChange={e => handleUpdateMuni(origIndex, 'inventoryMonths', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 focus:ring-1 focus:ring-[#0F2942]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 uppercase">Sale/List Ratio (%)</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={muni.saleToListRatio}
                              onChange={e => handleUpdateMuni(origIndex, 'saleToListRatio', Number(e.target.value))}
                              className="w-full pl-2.5 pr-6 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 focus:ring-1 focus:ring-[#0F2942]"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-bold text-stone-500 uppercase">Commute / Transit Proximity</label>
                        <input
                          type="text"
                          value={muni.commuterProximity}
                          onChange={e => handleUpdateMuni(origIndex, 'commuterProximity', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-[11px] text-stone-700 bg-stone-50/50"
                          placeholder="e.g. 28 min to Union Station via GO Express"
                        />
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-bold text-stone-500 uppercase">Market Commentary Highlight</label>
                        <textarea
                          rows={2}
                          value={muni.highlight}
                          onChange={e => handleUpdateMuni(origIndex, 'highlight', e.target.value)}
                          className="w-full p-2 rounded-lg border border-stone-300 text-[11px] text-stone-600 bg-stone-50/50"
                          placeholder="Key driver for buyers/sellers"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dense Spreadsheet Table View */}
            {muniViewMode === 'table' && (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-100/90 border-b border-stone-200 text-stone-700 uppercase font-bold text-[10px] tracking-wider">
                        <th className="p-3">Municipality</th>
                        <th className="p-3">Avg Sold Price ($)</th>
                        <th className="p-3">Detached Benchmark ($)</th>
                        <th className="p-3">MOI (Months)</th>
                        <th className="p-3">Condition</th>
                        <th className="p-3">Sale/List (%)</th>
                        <th className="p-3">Transit & Proximity Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filteredMunicipalities.map((muni) => {
                        const origIndex = municipalSnapshot.findIndex(item => item.regionCode === muni.regionCode);
                        return (
                          <tr key={muni.regionCode} className="hover:bg-stone-50 transition-colors">
                            <td className="p-3 font-bold text-stone-900 whitespace-nowrap">
                              {muni.name}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={muni.avgSoldPrice}
                                onChange={e => handleUpdateMuni(origIndex, 'avgSoldPrice', Number(e.target.value))}
                                className="w-28 px-2 py-1 rounded-md border border-stone-300 font-semibold text-stone-900"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={muni.detachedAvgPrice}
                                onChange={e => handleUpdateMuni(origIndex, 'detachedAvgPrice', Number(e.target.value))}
                                className="w-28 px-2 py-1 rounded-md border border-stone-300 font-semibold text-stone-900"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.1"
                                value={muni.inventoryMonths}
                                onChange={e => handleUpdateMuni(origIndex, 'inventoryMonths', Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded-md border border-stone-300 font-semibold text-stone-900"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={muni.marketCondition}
                                onChange={e => handleUpdateMuni(origIndex, 'marketCondition', e.target.value)}
                                className="px-2 py-1 rounded-md border border-stone-300 font-semibold text-stone-800 text-[11px]"
                              >
                                <option value="Balanced Market">Balanced Market</option>
                                <option value="Tight Seller Market">Tight Seller Market</option>
                                <option value="Buyer Favoured">Buyer Favoured</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.1"
                                value={muni.saleToListRatio}
                                onChange={e => handleUpdateMuni(origIndex, 'saleToListRatio', Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded-md border border-stone-300 font-semibold text-stone-900"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={muni.commuterProximity}
                                onChange={e => handleUpdateMuni(origIndex, 'commuterProximity', e.target.value)}
                                className="w-48 px-2 py-1 rounded-md border border-stone-300 text-[11px] text-stone-700"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            SUB-VIEW 3: MACRO MONETARY & BOC RATES
        ======================================================== */}
        {activeSubView === 'macro' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
              <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#8C6D43]" />
                <span>Macro Policy & Absorption Gauges (4 Headline Indicators)</span>
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                These four metrics are displayed in prominent headline cards across consumer market pulse views and dynamic valuation assessments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {macroIndicators.map((macro, idx) => (
                <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C6D43] uppercase tracking-wider">
                      Gauge {idx + 1} of 4
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-stone-100 text-stone-700">
                      Public Display
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-stone-700 block">Metric Title / Label</label>
                    <input
                      type="text"
                      value={macro.label}
                      onChange={e => handleUpdateMacro(idx, 'label', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 block">Primary Display Value</label>
                      <input
                        type="text"
                        value={macro.value}
                        onChange={e => handleUpdateMacro(idx, 'value', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-[#0F2942] text-sm"
                        placeholder="e.g. 2.25%"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 block">Benchmark Subtitle</label>
                      <input
                        type="text"
                        value={macro.benchmark}
                        onChange={e => handleUpdateMacro(idx, 'benchmark', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-stone-800"
                        placeholder="e.g. BoC Overnight Rate"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-stone-700 block">Contextual Narrative for Consumers</label>
                    <textarea
                      rows={3}
                      value={macro.description}
                      onChange={e => handleUpdateMacro(idx, 'description', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-700"
                      placeholder="Explain what this metric means for home buyers and sellers in Durham Region..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-VIEW 4: EDITORIAL STORIES & CLIENT ADVICE
        ======================================================== */}
        {activeSubView === 'editorial' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#8C6D43]" />
                  <span>DurhamRegion.com Curated News & Strategic Takeaways</span>
                </h4>
                <p className="text-xs text-stone-500">
                  {editorialInsights.length} articles providing balanced advice and negotiation leverage
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={editorialCategoryFilter}
                  onChange={e => setEditorialCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                >
                  <option value="all">All Categories ({editorialInsights.length})</option>
                  <option value="Market Dynamics">Market Dynamics</option>
                  <option value="Interest Rates">Interest Rates</option>
                  <option value="Municipal Trends">Municipal Trends</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Affordability">Affordability</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const newStory: DurhamNewsInsight = {
                      id: `story-${Date.now()}`,
                      category: 'Market Dynamics',
                      headline: 'New Durham Housing Development Headline',
                      subheadline: 'Subheadline describing the market change',
                      sourceDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                      sourcePublication: 'DurhamRegion.com Real Estate',
                      sourceUrl: 'https://www.durhamregion.com/business/real-estate/',
                      summary: 'Summary of the recent real estate developments in Durham Region.',
                      sellerTakeaway: 'Practical advice for home sellers navigating current buyer demand.',
                      buyerTakeaway: 'Practical advice for home buyers taking advantage of available inventory.',
                      keyStats: [
                        { label: 'Key Benchmark', value: '100%', trend: 'neutral' }
                      ],
                      tags: ['Durham Region', 'Market Update']
                    };
                    setEditorialInsights([newStory, ...editorialInsights]);
                    setIsDirty(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Headline</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEditorial.map((story, idx) => (
                <div key={story.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <select
                        value={story.category}
                        onChange={e => {
                          const updated = [...editorialInsights];
                          updated[idx].category = e.target.value as any;
                          setEditorialInsights(updated);
                          setIsDirty(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-stone-300 font-bold text-xs bg-stone-50 text-stone-900"
                      >
                        <option value="Market Dynamics">Market Dynamics</option>
                        <option value="Interest Rates">Interest Rates</option>
                        <option value="Municipal Trends">Municipal Trends</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Affordability">Affordability</option>
                      </select>
                      <span className="text-xs text-stone-500 font-medium">• {story.sourceDate}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove headline "${story.headline}"?`)) {
                          setEditorialInsights(editorialInsights.filter((_, i) => i !== idx));
                          setIsDirty(true);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 block">Headline</label>
                      <input
                        type="text"
                        value={story.headline}
                        onChange={e => {
                          const updated = [...editorialInsights];
                          updated[idx].headline = e.target.value;
                          setEditorialInsights(updated);
                          setIsDirty(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-sm text-stone-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700 block">Summary & Editorial Context</label>
                      <textarea
                        rows={3}
                        value={story.summary}
                        onChange={e => {
                          const updated = [...editorialInsights];
                          updated[idx].summary = e.target.value;
                          setEditorialInsights(updated);
                          setIsDirty(true);
                        }}
                        className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-700 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Seller Strategic Recommendation</span>
                        </div>
                        <textarea
                          rows={2}
                          value={story.sellerTakeaway}
                          onChange={e => {
                            const updated = [...editorialInsights];
                            updated[idx].sellerTakeaway = e.target.value;
                            setEditorialInsights(updated);
                            setIsDirty(true);
                          }}
                          className="w-full p-2 rounded-lg border border-amber-300/80 text-xs bg-white text-stone-800"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Buyer Leverage & Advantage</span>
                        </div>
                        <textarea
                          rows={2}
                          value={story.buyerTakeaway}
                          onChange={e => {
                            const updated = [...editorialInsights];
                            updated[idx].buyerTakeaway = e.target.value;
                            setEditorialInsights(updated);
                            setIsDirty(true);
                          }}
                          className="w-full p-2 rounded-lg border border-emerald-300/80 text-xs bg-white text-stone-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-VIEW 5: TRREB BATCH IMPORT & CALIBRATION SUITE
        ======================================================== */}
        {activeSubView === 'import' && (
          <div className="space-y-6 animate-fadeIn" id="agent-trreb-batch-suite">
            {/* 1. Header Banner */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                      Batch Refresh Engine
                    </span>
                    <span className="text-xs text-stone-500 font-mono">TRREB MLS® & DurhamRegion.com</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-amber-800" />
                    <span>TRREB Community Market Watch Batch Calibration</span>
                  </h3>
                  <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
                    Rapidly update benchmark pricing, detached averages, months of inventory (MOI), and list-to-sale ratios across all Durham Region municipalities in one operation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                    title="Download current Durham matrix as CSV for editing in Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    <span>Download CSV Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAISync}
                    disabled={syncingAI}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${syncingAI ? 'animate-spin' : ''}`} />
                    <span>{syncingAI ? 'Syncing...' : 'Gemini AI Auto-Sync'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Monitored Towns</span>
                  <span className="font-bold text-stone-800">{municipalSnapshot.length} Durham Municipalities</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Regional Avg Price</span>
                  <span className="font-bold text-stone-800">
                    ${Math.round(municipalSnapshot.reduce((a, b) => a + b.avgSoldPrice, 0) / municipalSnapshot.length).toLocaleString()}
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Regional MOI</span>
                  <span className="font-bold text-stone-800">
                    {(municipalSnapshot.reduce((a, b) => a + b.inventoryMonths, 0) / municipalSnapshot.length).toFixed(1)} Months
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Last Committed</span>
                  <span className="font-bold text-stone-800 truncate block">
                    {updatedAt ? new Date(updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'September 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Step 1: Calibration Source Selector */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C6D43] block">
                    Step 1: Choose Calibration Source
                  </span>
                  <h4 className="text-sm font-bold text-stone-900">
                    Select how you would like to import or calibrate monthly TRREB data
                  </h4>
                </div>

                {/* Sub-Tabs / Mode Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setImportMethod('paste')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      importMethod === 'paste'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Text/CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMethod('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      importMethod === 'upload'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMethod('presets')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      importMethod === 'presets'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>TRREB Presets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMethod('adjust')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      importMethod === 'adjust'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Bulk % Adjuster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMethod('ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      importMethod === 'ai'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Web Sync</span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: PASTE TEXT / CSV / TSV */}
              {importMethod === 'paste' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-stone-600">
                      Paste rows directly from <strong>Excel</strong>, <strong>Google Sheets</strong>, or TRREB report text.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const sample = `Pickering\t$935,490\t$1,165,883\t3.7 mo\t98.4%\nAjax\t$871,853\t$1,025,000\t2.9 mo\t99.1%\nWhitby\t$894,257\t$940,000\t2.9 mo\t98.2%\nOshawa\t$693,677\t$785,000\t4.1 mo\t97.5%\nClarington\t$840,000\t$895,000\t3.8 mo\t97.9%\nScugog\t$1,150,000\t$1,280,000\t4.8 mo\t96.8%`;
                          setQuickPasteText(sample);
                          parseTRREBText(sample);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                      >
                        Load Tab-Separated Sample (Excel)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = `Pickering, 948000, 1185000, 3.4, 98.9\nAjax, 882000, 1035000, 2.7, 99.4\nWhitby, 905000, 955000, 2.8, 98.7\nOshawa, 705000, 795000, 3.9, 97.8\nClarington, 850000, 910000, 3.6, 98.1\nScugog, 1170000, 1300000, 4.5, 97.1`;
                          setQuickPasteText(sample);
                          parseTRREBText(sample);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                      >
                        Load CSV Sample
                      </button>
                      {quickPasteText && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuickPasteText('');
                            setParsedPreview([]);
                            setQuickPasteError('');
                          }}
                          className="px-2 py-1 text-stone-400 hover:text-stone-700 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    value={quickPasteText}
                    onChange={e => {
                      setQuickPasteText(e.target.value);
                      parseTRREBText(e.target.value);
                    }}
                    placeholder={`Paste rows here from Excel or TRREB Market Watch...\nExample:\nPickering, $945,000, $1,180,000, 3.2 mo, 98.8%\nAjax, $880,000, $1,030,000, 2.8 mo, 99.2%\nWhitby, $905,000, $955,000, 2.7 mo, 98.5%\nOshawa, $702,000, $792,000, 3.9 mo, 97.8%\nClarington, $848,000, $905,000, 3.6 mo, 98.2%\nScugog, $1,165,000, $1,295,000, 4.6 mo, 97.0%`}
                    className="w-full p-3.5 rounded-xl border border-stone-300 font-mono text-xs bg-stone-50/70 focus:bg-white focus:ring-2 focus:ring-[#0F2942] leading-relaxed"
                  />

                  {quickPasteError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{quickPasteError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: FILE DRAG & DROP UPLOAD */}
              {importMethod === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileProcess(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDraggingFile
                        ? 'border-amber-500 bg-amber-50/60 scale-[0.99]'
                        : 'border-stone-300 hover:border-[#0F2942] hover:bg-stone-50/80 bg-stone-50/30'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-stone-900">
                      Drop your TRREB CSV or TSV file here, or click to browse files
                    </h5>
                    <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                      Supports TRREB Market Watch raw tables, exported Excel spreadsheets (.csv, .tsv), or plain text reports.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold">
                      <span>Choose File from Computer</span>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 3: ONE-CLICK TRREB OFFICIAL PRESETS */}
              {importMethod === 'presets' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Preset 1 */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#0F2942] hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[9px] font-extrabold uppercase">
                        Baseline Benchmark
                      </span>
                      <h5 className="font-bold text-stone-900 text-sm">September 2026 TRREB Release</h5>
                      <p className="text-xs text-stone-500 leading-snug">
                        Official Durham baseline: Pickering $935K, Ajax $871K, Whitby $894K, Oshawa $693K, Clarington $840K, Scugog $1.15M.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `Pickering, 935490, 1165883, 3.7, 98.4\nAjax, 871853, 1025000, 2.9, 99.1\nWhitby, 894257, 940000, 2.9, 98.2\nOshawa, 693677, 785000, 4.1, 97.5\nClarington, 840000, 895000, 3.8, 97.9\nScugog, 1150000, 1280000, 4.8, 96.8`;
                        setQuickPasteText(sample);
                        parseTRREBText(sample);
                      }}
                      className="w-full py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Load Baseline Matrix
                    </button>
                  </div>

                  {/* Preset 2 */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-white hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                        +3.5% Spring Surge
                      </span>
                      <h5 className="font-bold text-stone-900 text-sm">High-Velocity Seller's Wave</h5>
                      <p className="text-xs text-stone-500 leading-snug">
                        Simulates accelerating buyer absorption, sub-3.0 MOI in Ajax/Whitby, and rapid turnover.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `Pickering, 968000, 1205000, 3.1, 99.2\nAjax, 902000, 1060000, 2.5, 99.8\nWhitby, 925000, 975000, 2.6, 99.0\nOshawa, 718000, 812000, 3.6, 98.4\nClarington, 870000, 925000, 3.3, 98.7\nScugog, 1190000, 1325000, 4.2, 97.6`;
                        setQuickPasteText(sample);
                        parseTRREBText(sample);
                      }}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Load Spring Surge
                    </button>
                  </div>

                  {/* Preset 3 */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-white hover:border-blue-500 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-extrabold uppercase">
                        Balanced Autumn (4.2 MOI)
                      </span>
                      <h5 className="font-bold text-stone-900 text-sm">Mortgage Renewal Stabilization</h5>
                      <p className="text-xs text-stone-500 leading-snug">
                        Orderly inventory inflow from 2021 fixed-rate renewals, balanced 98% list-to-sale realization.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `Pickering, 942000, 1175000, 3.9, 98.1\nAjax, 878000, 1030000, 3.2, 98.8\nWhitby, 898000, 945000, 3.1, 98.0\nOshawa, 698000, 788000, 4.3, 97.2\nClarington, 845000, 898000, 4.0, 97.6\nScugog, 1155000, 1285000, 4.9, 96.5`;
                        setQuickPasteText(sample);
                        parseTRREBText(sample);
                      }}
                      className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Load Balanced Scenario
                    </button>
                  </div>

                  {/* Preset 4 */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-white hover:border-amber-500 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-extrabold uppercase">
                        Buyer-Favored (4.8 MOI)
                      </span>
                      <h5 className="font-bold text-stone-900 text-sm">Buyer Leverage Influx</h5>
                      <p className="text-xs text-stone-500 leading-snug">
                        Higher active supply, extended days on market, conditional offers standard, conservative benchmarks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `Pickering, 922000, 1150000, 4.2, 97.5\nAjax, 860000, 1010000, 3.6, 98.0\nWhitby, 882000, 930000, 3.5, 97.4\nOshawa, 685000, 775000, 4.8, 96.8\nClarington, 830000, 885000, 4.4, 97.1\nScugog, 1135000, 1260000, 5.3, 95.9`;
                        setQuickPasteText(sample);
                        parseTRREBText(sample);
                      }}
                      className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Load Buyer Leverage
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 4: BULK PERCENTAGE & MOI ADJUSTER */}
              {importMethod === 'adjust' && (
                <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200 space-y-4">
                  <div className="space-y-1">
                    <h5 className="font-bold text-stone-900 text-sm">
                      Simulate Regional Uniform Price & Velocity Adjustment
                    </h5>
                    <p className="text-xs text-stone-500">
                      Apply a blanket percentage shift across all 6 Durham municipalities (e.g. after a Bank of Canada rate decision or quarterly TRREB recap).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-700">Average Price Shift (%)</label>
                        <span className={`font-mono font-bold ${bulkPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {bulkPercent >= 0 ? `+${bulkPercent}%` : `${bulkPercent}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-10.0"
                        max="15.0"
                        step="0.5"
                        value={bulkPercent}
                        onChange={e => setBulkPercent(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-[#0F2942]"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>-10%</span>
                        <span>0%</span>
                        <span>+15%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-700">Months of Inventory (MOI)</label>
                        <span className={`font-mono font-bold ${bulkMOI >= 0 ? 'text-stone-700' : 'text-amber-700'}`}>
                          {bulkMOI >= 0 ? `+${bulkMOI} mo` : `${bulkMOI} mo`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-1.5"
                        max="2.0"
                        step="0.1"
                        value={bulkMOI}
                        onChange={e => setBulkMOI(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-[#0F2942]"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>-1.5 mo (Tight)</span>
                        <span>0</span>
                        <span>+2.0 mo (Soft)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-700">Sale-to-List Shift (%)</label>
                        <span className="font-mono font-bold text-stone-800">
                          {bulkSaleToList >= 0 ? `+${bulkSaleToList}%` : `${bulkSaleToList}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2.5"
                        max="2.5"
                        step="0.1"
                        value={bulkSaleToList}
                        onChange={e => setBulkSaleToList(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-[#0F2942]"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>-2.5%</span>
                        <span>0</span>
                        <span>+2.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateBulkAdjustment(bulkPercent, bulkMOI, bulkSaleToList)}
                      className="px-4 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-[#C5A880]" />
                      <span>Generate Bulk Simulation Preview</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 5: GEMINI AI REAL-TIME SYNC */}
              {importMethod === 'ai' && (
                <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-stone-900 text-sm">
                        Gemini AI Intelligent Web Sync with Search Grounding
                      </h5>
                      <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                        Scans live Metroland DurhamRegion.com editorial coverage and TRREB Community Market Watch releases. Automatically extracts updated municipal benchmark prices, Bank of Canada overnight rate implications, and regional absorption metrics.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAISync}
                      disabled={syncingAI}
                      className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${syncingAI ? 'animate-spin' : ''}`} />
                      <span>{syncingAI ? 'Querying Gemini AI & Grounding Live Data...' : 'Run Gemini AI Live Market Sync Now'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Step 2: Interactive Live Preview & Delta Comparison Matrix */}
            {parsedPreview.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                        Step 2: Review & Calibrate
                      </span>
                      <h4 className="font-bold text-stone-900 text-base">
                        Batch Preview Matrix ({parsedPreview.filter(p => p.included).length} of {parsedPreview.length} Selected)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-500">
                      Inspect calculated price deltas vs current live values. Edit any number directly before publishing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(false)}
                      className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-stone-200 rounded-xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 text-center w-10">Include</th>
                        <th className="p-3">Municipality</th>
                        <th className="p-3">Average Sold Price ($)</th>
                        <th className="p-3">Detached Avg ($)</th>
                        <th className="p-3">MOI (Months)</th>
                        <th className="p-3">Sale/List (%)</th>
                        <th className="p-3">Projected Velocity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {parsedPreview.map((item, idx) => {
                        const originalAvg = item.originalAvgPrice || 0;
                        const newAvg = item.avgSoldPrice || 0;
                        const avgDiff = newAvg - originalAvg;
                        const avgPct = originalAvg > 0 ? ((avgDiff / originalAvg) * 100).toFixed(1) : '0';

                        const originalDet = item.originalDetachedPrice || 0;
                        const newDet = item.detachedAvgPrice || 0;
                        const detDiff = newDet - originalDet;
                        const detPct = originalDet > 0 ? ((detDiff / originalDet) * 100).toFixed(1) : '0';

                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              item.included ? 'hover:bg-amber-50/30' : 'bg-stone-50/60 opacity-60'
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={item.included}
                                onChange={() => handleToggleInclude(idx)}
                                className="w-4 h-4 rounded text-[#0F2942] focus:ring-[#0F2942] cursor-pointer"
                              />
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-stone-900">{item.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">{item.regionCode}</div>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={item.avgSoldPrice || ''}
                                  onChange={e => handleUpdatePreviewItem(idx, 'avgSoldPrice', parseFloat(e.target.value) || 0)}
                                  className="w-28 p-1.5 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 text-xs bg-stone-50/50 focus:bg-white"
                                />
                                {avgDiff !== 0 && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${
                                      avgDiff > 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {avgDiff > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {avgDiff > 0 ? `+${avgPct}%` : `${avgPct}%`}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                Current: ${originalAvg.toLocaleString()}
                              </span>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={item.detachedAvgPrice || ''}
                                  onChange={e => handleUpdatePreviewItem(idx, 'detachedAvgPrice', parseFloat(e.target.value) || 0)}
                                  className="w-28 p-1.5 rounded-lg border border-stone-300 font-mono font-semibold text-stone-900 text-xs bg-stone-50/50 focus:bg-white"
                                />
                                {detDiff !== 0 && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${
                                      detDiff > 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {detDiff > 0 ? `+${detPct}%` : `${detPct}%`}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                Current: ${originalDet.toLocaleString()}
                              </span>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={item.inventoryMonths || ''}
                                  onChange={e => handleUpdatePreviewItem(idx, 'inventoryMonths', parseFloat(e.target.value) || 0)}
                                  className="w-18 p-1.5 rounded-lg border border-stone-300 font-mono font-semibold text-stone-900 text-xs bg-stone-50/50 focus:bg-white"
                                />
                                <span className="text-stone-500 text-xs font-mono">mo</span>
                              </div>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                Current: {item.originalMOI} mo
                              </span>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={item.saleToListRatio || ''}
                                  onChange={e => handleUpdatePreviewItem(idx, 'saleToListRatio', parseFloat(e.target.value) || 0)}
                                  className="w-18 p-1.5 rounded-lg border border-stone-300 font-mono font-semibold text-stone-900 text-xs bg-stone-50/50 focus:bg-white"
                                />
                                <span className="text-stone-500 text-xs">%</span>
                              </div>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                Current: {item.originalSaleToList}%
                              </span>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  item.marketCondition === 'Tight Seller Market'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : item.marketCondition === 'Buyer Favoured'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}
                              >
                                {item.marketCondition}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Final Actions Row */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 select-none">
                    <input
                      type="checkbox"
                      checked={publishDirectlyOnCommit}
                      onChange={e => setPublishDirectlyOnCommit(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F2942] focus:ring-[#0F2942]"
                    />
                    <span>Publish live directly to portal & client valuation engine immediately</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedPreview([]);
                        setQuickPasteText('');
                        setQuickPasteError('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 text-xs font-semibold border border-stone-300 transition-colors cursor-pointer"
                    >
                      Discard
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyParsedPreview(false)}
                      className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply as Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyParsedPreview(publishDirectlyOnCommit)}
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-[#C5A880]" />
                      <span>{saving ? 'Publishing...' : publishDirectlyOnCommit ? 'Commit & Publish Live Now' : 'Save to Matrix'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-VIEW 6: PUBLISHING & METADATA SETTINGS
        ======================================================== */}
        {activeSubView === 'settings' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#8C6D43]" />
                    <span>Reporting Vintage & Publication Credits</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    Displayed on client valuation reports, attribution footnotes, and public headers
                  </p>
                </div>
                <a
                  href={metadata.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8C6D43] hover:underline font-bold inline-flex items-center gap-1"
                >
                  <span>Verify DurhamRegion.com Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Reporting Period Title</label>
                  <input
                    type="text"
                    value={metadata.reportingPeriod}
                    onChange={e => {
                      setMetadata({ ...metadata, reportingPeriod: e.target.value });
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-semibold text-xs"
                    placeholder="e.g., September 2026 Market Intelligence"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Publisher & Media Credit</label>
                  <input
                    type="text"
                    value={metadata.publisher}
                    onChange={e => {
                      setMetadata({ ...metadata, publisher: e.target.value });
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-semibold text-xs"
                    placeholder="e.g., Metroland Media Group / DurhamRegion.com"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-stone-700 block">Source Portal URL</label>
                  <input
                    type="text"
                    value={metadata.portalUrl}
                    onChange={e => {
                      setMetadata({ ...metadata, portalUrl: e.target.value });
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-stone-700 block">Regional Editorial Overview (Synopsis)</label>
                  <textarea
                    rows={3}
                    value={metadata.editorialSynopsis}
                    onChange={e => {
                      setMetadata({ ...metadata, editorialSynopsis: e.target.value });
                      setIsDirty(true);
                    }}
                    className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-700 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 5. STICKY BOTTOM SAVE BANNER (Appears when there are staged changes) */}
      {isDirty && (
        <div className="sticky bottom-0 bg-[#0F2942] text-white px-5 py-3.5 border-t border-[#1E3A8A] flex flex-wrap items-center justify-between gap-3 shadow-xl z-20 animate-slideUp">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-200">You have unstaged changes!</span>
            <span className="text-stone-300 hidden sm:inline">Click "Publish to Live Site" to push updates immediately to the public portal and valuation tools.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMarketData}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-1.5 rounded-xl bg-[#C5A880] hover:bg-[#b5956a] text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Publishing...' : 'Publish to Live Site'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
