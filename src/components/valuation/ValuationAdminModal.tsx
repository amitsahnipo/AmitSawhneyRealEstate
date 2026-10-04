import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  ShieldAlert,
  Settings,
  RefreshCw,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ValuationAnalytics, ValuationEngineConfig } from '../../types';

interface ValuationAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValuationAdminModal: React.FC<ValuationAdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'audits' | 'config'>('analytics');
  const [analytics, setAnalytics] = useState<ValuationAnalytics | null>(null);
  const [config, setConfig] = useState<ValuationEngineConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configErrors, setConfigErrors] = useState<{
    searchRadiusKm?: string;
    maxSearchRadiusKm?: string;
    lookbackDays?: string;
    minComparables?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setConfigErrors({});
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, configRes] = await Promise.all([
        fetch('/api/valuation/analytics'),
        fetch('/api/valuation/config')
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      if (configRes.ok) {
        const cData = await configRes.json();
        setConfig(cData);
      }
    } catch (err) {
      console.error('Failed to load valuation admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateConfigField = (field: keyof ValuationEngineConfig, value: number, currentConfig: ValuationEngineConfig) => {
    let error: string | undefined = undefined;

    if (field === 'searchRadiusKm') {
      if (isNaN(value) || value <= 0) {
        error = 'Search radius must be greater than 0 km.';
      } else if (value > currentConfig.maxSearchRadiusKm) {
        error = `Default radius (${value} km) cannot exceed max radius (${currentConfig.maxSearchRadiusKm} km).`;
      }
    } else if (field === 'maxSearchRadiusKm') {
      if (isNaN(value) || value <= 0) {
        error = 'Max radius must be greater than 0 km.';
      } else if (value < currentConfig.searchRadiusKm) {
        error = `Max radius (${value} km) cannot be smaller than default radius (${currentConfig.searchRadiusKm} km).`;
      } else if (value > 50) {
        error = 'Max radius cannot exceed 50 km for comparable accuracy.';
      }
    } else if (field === 'lookbackDays') {
      if (isNaN(value) || value < 30) {
        error = 'Lookback period must be at least 30 days.';
      } else if (value > 730) {
        error = 'Lookback period cannot exceed 730 days (2 years).';
      }
    } else if (field === 'minComparables') {
      if (isNaN(value) || value < 1) {
        error = 'Minimum comparables must be at least 1.';
      } else if (value > 20) {
        error = 'Minimum comparables cannot exceed 20.';
      }
    }

    setConfigErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const rCheck = validateConfigField('searchRadiusKm', config.searchRadiusKm, config);
    const mCheck = validateConfigField('maxSearchRadiusKm', config.maxSearchRadiusKm, config);
    const lCheck = validateConfigField('lookbackDays', config.lookbackDays, config);
    const cCheck = validateConfigField('minComparables', config.minComparables, config);

    if (!rCheck || !mCheck || !lCheck || !cCheck) {
      return;
    }

    try {
      const res = await fetch('/api/valuation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update valuation config:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0F2942] text-white p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Valuation Engine Governance & Analytics</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Property Valuation Admin Portal</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 border-b border-stone-200 bg-stone-50 shrink-0 text-xs sm:text-sm font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-[#0F2942] text-[#0F2942]'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Performance Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audits')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'audits'
                ? 'border-[#0F2942] text-[#0F2942]'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Audit Trail Logs ({analytics?.recentAudits?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-[#0F2942] text-[#0F2942]'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Algorithm Weights & Limits
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-stone-500 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[#C5A880] animate-spin mb-3" />
              <span>Loading valuation governance data...</span>
            </div>
          ) : (
            <>
              {/* 1. Analytics Tab */}
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="text-xs text-stone-500 font-semibold mb-1">Total Valuations</div>
                      <div className="text-2xl font-black text-[#0F2942]">{analytics.totalValuations}</div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="text-xs text-stone-500 font-semibold mb-1">Avg Property Value</div>
                      <div className="text-2xl font-black text-[#0F2942]">
                        ${analytics.averageEstimatedValue ? analytics.averageEstimatedValue.toLocaleString() : '0'}
                      </div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="text-xs text-stone-500 font-semibold mb-1">Lead Conversion</div>
                      <div className="text-2xl font-black text-emerald-700">
                        {analytics.leadConversionRate}% ({analytics.leadConversionCount})
                      </div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="text-xs text-stone-500 font-semibold mb-1">User Split (S / B)</div>
                      <div className="text-2xl font-black text-[#0F2942]">
                        {analytics.buyerVsSellerRatio.sellerCount} / {analytics.buyerVsSellerRatio.buyerCount}
                      </div>
                    </div>
                  </div>

                  {/* Valuations by Municipality */}
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <h4 className="font-bold text-stone-900 mb-3 text-sm">Valuations by Municipality</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Object.entries(analytics.valuationsByCity).map(([city, count]) => (
                        <div key={city} className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                          <span className="font-medium text-stone-700">{city}</span>
                          <span className="font-bold text-[#0F2942] bg-stone-100 px-2 py-0.5 rounded-full">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Audit Trail Logs Tab */}
              {activeTab === 'audits' && analytics && (
                <div className="space-y-4">
                  <div className="text-xs text-stone-500">
                    Showing {analytics.recentAudits.length} recorded valuation calculations with timestamp, AI prompt version, and comparable count:
                  </div>

                  <div className="space-y-3">
                    {analytics.recentAudits.map((item, i) => (
                      <div key={item.auditId || i} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <div className="font-bold text-stone-900 text-sm">{item.subjectAddress}</div>
                          <div className="text-stone-400">{new Date(item.timestamp).toLocaleString()}</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="bg-stone-200 px-2 py-0.5 rounded font-semibold text-stone-800">
                            {item.municipality}, {item.province}
                          </span>
                          <span className="bg-[#0F2942] text-white px-2 py-0.5 rounded font-semibold">
                            Est: ${item.estimatedValue.toLocaleString()}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                            {item.confidence} Confidence
                          </span>
                          <span className="bg-stone-200 px-2 py-0.5 rounded">
                            {item.comparablesCount} Comps
                          </span>
                          <span className="bg-stone-200 px-2 py-0.5 rounded">
                            Mode: {item.mode}
                          </span>
                          {item.userAdjustedDetails && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                              User Adjusted
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-400 font-mono">
                          Audit ID: {item.auditId} | Model: {item.modelVersion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Configuration Tab */}
              {activeTab === 'config' && config && (
                <form onSubmit={handleUpdateConfig} className="space-y-6">
                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Valuation engine configuration updated successfully.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Default Search Radius (km)</label>
                      <input
                        type="number"
                        step={0.5}
                        value={config.searchRadiusKm}
                        onChange={e => {
                          const val = Number(e.target.value);
                          const updated = { ...config, searchRadiusKm: val };
                          setConfig(updated);
                          validateConfigField('searchRadiusKm', val, updated);
                        }}
                        onBlur={e => validateConfigField('searchRadiusKm', Number(e.target.value), config)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${
                          configErrors.searchRadiusKm
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                            : 'border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                        }`}
                      />
                      {configErrors.searchRadiusKm && (
                        <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{configErrors.searchRadiusKm}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Max Search Radius (km)</label>
                      <input
                        type="number"
                        step={0.5}
                        value={config.maxSearchRadiusKm}
                        onChange={e => {
                          const val = Number(e.target.value);
                          const updated = { ...config, maxSearchRadiusKm: val };
                          setConfig(updated);
                          validateConfigField('maxSearchRadiusKm', val, updated);
                        }}
                        onBlur={e => validateConfigField('maxSearchRadiusKm', Number(e.target.value), config)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${
                          configErrors.maxSearchRadiusKm
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                            : 'border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                        }`}
                      />
                      {configErrors.maxSearchRadiusKm && (
                        <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{configErrors.maxSearchRadiusKm}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Lookback Period (Days)</label>
                      <input
                        type="number"
                        value={config.lookbackDays}
                        onChange={e => {
                          const val = Number(e.target.value);
                          const updated = { ...config, lookbackDays: val };
                          setConfig(updated);
                          validateConfigField('lookbackDays', val, updated);
                        }}
                        onBlur={e => validateConfigField('lookbackDays', Number(e.target.value), config)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${
                          configErrors.lookbackDays
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                            : 'border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                        }`}
                      />
                      {configErrors.lookbackDays && (
                        <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{configErrors.lookbackDays}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Minimum Comparables Required</label>
                      <input
                        type="number"
                        value={config.minComparables}
                        onChange={e => {
                          const val = Number(e.target.value);
                          const updated = { ...config, minComparables: val };
                          setConfig(updated);
                          validateConfigField('minComparables', val, updated);
                        }}
                        onBlur={e => validateConfigField('minComparables', Number(e.target.value), config)}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${
                          configErrors.minComparables
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500'
                            : 'border-stone-300 focus:ring-2 focus:ring-[#0F2942]'
                        }`}
                      />
                      {configErrors.minComparables && (
                        <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{configErrors.minComparables}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-4">
                    <h5 className="font-bold text-xs text-stone-800 uppercase tracking-wider mb-3">
                      Multi-Factor Weight Distribution (Sum = 100%)
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-stone-600 mb-1">Geographic Proximity: {Math.round(config.weights.geographicProximity * 100)}%</label>
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">Property Type: {Math.round(config.weights.propertyType * 100)}%</label>
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">Living Area SqFt: {Math.round(config.weights.livingArea * 100)}%</label>
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">Bedrooms: {Math.round(config.weights.bedrooms * 100)}%</label>
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">Bathrooms: {Math.round(config.weights.bathrooms * 100)}%</label>
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">Sale Recency: {Math.round(config.weights.saleRecency * 100)}%</label>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0F2942] text-white font-bold text-sm rounded-xl hover:bg-[#163B5F] transition-all"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
