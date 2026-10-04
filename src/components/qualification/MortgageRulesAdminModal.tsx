import React, { useState } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  Building2,
  Lock
} from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { MortgageQualificationRules } from '../../types';

export const MortgageRulesAdminModal: React.FC = () => {
  const { rulesAdminOpen, setRulesAdminOpen, rules, updateRules } = useAffordability();

  const [qualifyingRateFloor, setQualifyingRateFloor] = useState<number>(rules.qualifyingRateFloor);
  const [contractRate, setContractRate] = useState<number>(rules.contractRate);
  const [stressTestSpread, setStressTestSpread] = useState<number>(rules.stressTestSpread);
  const [gdsLimit, setGdsLimit] = useState<number>(Math.round(rules.gdsLimit * 100));
  const [tdsLimit, setTdsLimit] = useState<number>(Math.round(rules.tdsLimit * 100));
  const [insuredAmortization, setInsuredAmortization] = useState<number>(rules.maxAmortizationInsuredYears);
  const [conventionalAmortization, setConventionalAmortization] = useState<number>(rules.maxAmortizationConventionalYears);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(Number((rules.propertyTaxRateAnnual * 100).toFixed(2)));
  const [heatingCost, setHeatingCost] = useState<number>(rules.heatingCostMonthly);
  const [condoFeeAssumption, setCondoFeeAssumption] = useState<number>(rules.condoFeeMonthlyAssumption);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!rulesAdminOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updates: Partial<MortgageQualificationRules> = {
      qualifyingRateFloor,
      contractRate,
      stressTestSpread,
      gdsLimit: gdsLimit / 100,
      tdsLimit: tdsLimit / 100,
      maxAmortizationInsuredYears: insuredAmortization,
      maxAmortizationConventionalYears: conventionalAmortization,
      propertyTaxRateAnnual: propertyTaxRate / 100,
      heatingCostMonthly: heatingCost,
      condoFeeMonthlyAssumption: condoFeeAssumption
    };

    try {
      await updateRules(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const calculatedStressRate = Math.max(qualifyingRateFloor, contractRate + stressTestSpread);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C5A880]">
                  Qualification Engine Settings
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {rules.ruleVersion}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                Canadian Mortgage Stress-Test Rules Configuration
              </h3>
            </div>
          </div>
          <button
            onClick={() => setRulesAdminOpen(false)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Rules successfully updated and synced with live backend calculation engine.</span>
            </div>
          )}

          {/* Stress-Test Rates */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Stress-Test Parameters (OSFI B-20)
              </h4>
              <span className="text-xs font-mono font-bold text-[#C5A880]">
                Effective Stress Rate: {calculatedStressRate.toFixed(2)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Qualifying Floor Rate (%)</label>
                <input
                  type="number"
                  step={0.05}
                  value={qualifyingRateFloor}
                  onChange={e => setQualifyingRateFloor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Contract 5-Yr Fixed Rate (%)</label>
                <input
                  type="number"
                  step={0.05}
                  value={contractRate}
                  onChange={e => setContractRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Stress Spread (+%)</label>
                <input
                  type="number"
                  step={0.1}
                  value={stressTestSpread}
                  onChange={e => setStressTestSpread(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* GDS / TDS Ratios */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Debt-Service Caps (Bank Standard)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Gross Debt Service (GDS Limit %)</label>
                <input
                  type="number"
                  step={1}
                  value={gdsLimit}
                  onChange={e => setGdsLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
                <span className="text-[10px] text-stone-400">Default: 39% (Principal, Interest, Taxes, Heat, 50% Condo)</span>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Total Debt Service (TDS Limit %)</label>
                <input
                  type="number"
                  step={1}
                  value={tdsLimit}
                  onChange={e => setTdsLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
                <span className="text-[10px] text-stone-400">Default: 44% (Housing + All monthly debt liabilities)</span>
              </div>
            </div>
          </div>

          {/* Amortizations & Carrying Costs */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Amortization & Carrying Cost Assumptions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Max Amortization Insured (Years)</label>
                <select
                  value={insuredAmortization}
                  onChange={e => setInsuredAmortization(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                >
                  <option value={25}>25 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Max Amortization Conventional (Years)</label>
                <select
                  value={conventionalAmortization}
                  onChange={e => setConventionalAmortization(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                >
                  <option value={25}>25 Years</option>
                  <option value={30}>30 Years (Eligible New Builds / Conventional)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Annual Property Tax Estimate (%)</label>
                <input
                  type="number"
                  step={0.05}
                  value={propertyTaxRate}
                  onChange={e => setPropertyTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Monthly Heating Assumption ($/mo)</label>
                <input
                  type="number"
                  step={10}
                  value={heatingCost}
                  onChange={e => setHeatingCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-sm font-mono text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRulesAdminOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Update Mortgage Rules</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
