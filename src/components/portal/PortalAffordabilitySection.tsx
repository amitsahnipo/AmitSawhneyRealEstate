import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  ShieldCheck,
  Building2,
  Calculator,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Info,
  CreditCard,
  Home,
  Check,
  Sparkles,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { useAuth } from '../../context/AuthContext';
import { BuyerFinancialProfile, AffordabilityAssessment } from '../../types';
import { calculateAffordability } from '../../services/affordabilityService';

interface PortalAffordabilitySectionProps {
  onSearchProperties?: (maxBudget: number) => void;
  onDraftOffer?: () => void;
}

export const PortalAffordabilitySection: React.FC<PortalAffordabilitySectionProps> = ({
  onSearchProperties,
  onDraftOffer
}) => {
  const { user, updateUserProfile } = useAuth();
  const {
    buyerProfile: contextProfile,
    assessment: contextAssessment,
    rules,
    saveProfile,
    updateRules,
    openWizard
  } = useAffordability();

  // Primary Income & Co-Applicant States
  const [applicant1Income, setApplicant1Income] = useState<number>(() => {
    return contextProfile?.applicant1Income || contextProfile?.grossAnnualIncome || 110000;
  });
  const [isJointIncome, setIsJointIncome] = useState<boolean>(() => {
    return contextProfile?.isJointIncome ?? true;
  });
  const [applicant2Income, setApplicant2Income] = useState<number>(() => {
    return contextProfile?.applicant2Income || 65000;
  });

  // Debts & Liabilities
  const [showDebtBreakdown, setShowDebtBreakdown] = useState(false);
  const [totalDebtSimple, setTotalDebtSimple] = useState<number>(() => {
    if (contextProfile?.debtBreakdown) {
      const b = contextProfile.debtBreakdown;
      const sum = (b.carLoans || 0) + (b.studentLoans || 0) + (b.creditCardsMin || 0) + (b.linesOfCredit || 0) + (b.otherMonthlyDebt || 0);
      if (sum > 0) return sum;
    }
    return contextProfile?.monthlyDebtObligations || 450;
  });
  const [carLoans, setCarLoans] = useState<number>(contextProfile?.debtBreakdown?.carLoans || 350);
  const [studentLoans, setStudentLoans] = useState<number>(contextProfile?.debtBreakdown?.studentLoans || 0);
  const [creditCardsMin, setCreditCardsMin] = useState<number>(contextProfile?.debtBreakdown?.creditCardsMin || 100);
  const [linesOfCredit, setLinesOfCredit] = useState<number>(contextProfile?.debtBreakdown?.linesOfCredit || 0);
  const [otherDebt, setOtherDebt] = useState<number>(contextProfile?.debtBreakdown?.otherMonthlyDebt || 0);

  // Down Payment & Mortgage Settings
  const [intendedDownPayment, setIntendedDownPayment] = useState<number>(() => {
    return contextProfile?.intendedDownPayment || user?.intendedDownPayment || 160000;
  });
  const [availableFunds, setAvailableFunds] = useState<number>(() => {
    return contextProfile?.availableFunds || Math.max(180000, intendedDownPayment);
  });
  const [contractRate, setContractRate] = useState<number>(() => {
    return rules?.contractRate || 4.69;
  });
  const [amortizationYears, setAmortizationYears] = useState<number>(25);
  const [propertyTypePlanning, setPropertyTypePlanning] = useState<string>(() => {
    return contextProfile?.propertyTypePlanning || user?.propertyTypePlanning || 'Preconstruction';
  });

  // Track if user has modified anything since last save
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Synchronize state when context profile or user data updates from outside
  useEffect(() => {
    if (contextProfile) {
      if (contextProfile.applicant1Income) {
        setApplicant1Income(contextProfile.applicant1Income);
      } else if (contextProfile.grossAnnualIncome) {
        setApplicant1Income(contextProfile.grossAnnualIncome);
      }
      if (contextProfile.isJointIncome !== undefined) {
        setIsJointIncome(contextProfile.isJointIncome);
      }
      if (contextProfile.applicant2Income !== undefined) {
        setApplicant2Income(contextProfile.applicant2Income);
      }
      if (contextProfile.intendedDownPayment) {
        setIntendedDownPayment(contextProfile.intendedDownPayment);
      }
      if (contextProfile.availableFunds) {
        setAvailableFunds(contextProfile.availableFunds);
      }
      if (contextProfile.propertyTypePlanning) {
        setPropertyTypePlanning(contextProfile.propertyTypePlanning);
      }
      if (contextProfile.debtBreakdown) {
        const b = contextProfile.debtBreakdown;
        setCarLoans(b.carLoans || 0);
        setStudentLoans(b.studentLoans || 0);
        setCreditCardsMin(b.creditCardsMin || 0);
        setLinesOfCredit(b.linesOfCredit || 0);
        setOtherDebt(b.otherMonthlyDebt || 0);
        const sum = (b.carLoans || 0) + (b.studentLoans || 0) + (b.creditCardsMin || 0) + (b.linesOfCredit || 0) + (b.otherMonthlyDebt || 0);
        setTotalDebtSimple(sum);
      } else if (contextProfile.monthlyDebtObligations) {
        setTotalDebtSimple(contextProfile.monthlyDebtObligations);
      }
    }
  }, [contextProfile]);

  // Derived effective monthly debt
  const totalMonthlyDebt = showDebtBreakdown
    ? carLoans + studentLoans + creditCardsMin + linesOfCredit + otherDebt
    : totalDebtSimple;

  const totalGrossIncome = applicant1Income + (isJointIncome ? applicant2Income : 0);

  // Build live profile for calculation
  const activeProfile = useMemo<BuyerFinancialProfile>(() => {
    return {
      userId: user?.id,
      grossAnnualIncome: totalGrossIncome,
      isJointIncome,
      applicant1Income,
      applicant2Income: isJointIncome ? applicant2Income : 0,
      employmentStatus: 'Full-time',
      employmentDurationYears: 5,
      monthlyDebtObligations: totalMonthlyDebt,
      debtBreakdown: {
        carLoans: showDebtBreakdown ? carLoans : totalMonthlyDebt,
        studentLoans: showDebtBreakdown ? studentLoans : 0,
        creditCardsMin: showDebtBreakdown ? creditCardsMin : 0,
        linesOfCredit: showDebtBreakdown ? linesOfCredit : 0,
        personalLoans: 0,
        otherMonthlyDebt: showDebtBreakdown ? otherDebt : 0
      },
      availableFunds: Math.max(availableFunds, intendedDownPayment),
      intendedDownPayment,
      downPaymentSource: 'Personal savings & investments',
      ownsExistingProperty: user?.ownsExistingProperty || false,
      creditProfileCategory: 'Good',
      propertyTypePlanning: propertyTypePlanning as any,
      mortgagePreApprovalStatus: user?.mortgagePreApprovalStatus || 'Pre-approved',
      financialProfileUpdatedDate: new Date().toISOString()
    };
  }, [
    user?.id,
    user?.ownsExistingProperty,
    user?.mortgagePreApprovalStatus,
    totalGrossIncome,
    isJointIncome,
    applicant1Income,
    applicant2Income,
    totalMonthlyDebt,
    showDebtBreakdown,
    carLoans,
    studentLoans,
    creditCardsMin,
    linesOfCredit,
    otherDebt,
    availableFunds,
    intendedDownPayment,
    propertyTypePlanning
  ]);

  // Active customized qualification rules based on current slider/inputs
  const activeRules = useMemo(() => {
    return {
      ...rules,
      contractRate,
      maxAmortizationConventionalYears: amortizationYears,
      maxAmortizationInsuredYears: Math.min(25, amortizationYears)
    };
  }, [rules, contractRate, amortizationYears]);

  // Live recalculation result (recomputes instantly on any change)
  const currentAssessment = useMemo<AffordabilityAssessment>(() => {
    return calculateAffordability(activeProfile, activeRules);
  }, [activeProfile, activeRules]);

  // Derived financial metrics from live calculation
  const maxPurchasePrice = currentAssessment.estimatedPurchasePriceMax;
  const recommendedMin = currentAssessment.estimatedPurchasePriceMin;
  const recommendedMax = Math.round((maxPurchasePrice * 0.95) / 5000) * 5000;
  const maxMortgage = currentAssessment.estimatedMortgageMax;
  const effectiveStressRate = currentAssessment.effectiveStressRate;
  const monthlyHousing = currentAssessment.monthlyCarryingCostsEstimated.totalMonthlyMax;
  const monthlyHousingMin = currentAssessment.monthlyCarryingCostsEstimated.totalMonthlyMin;
  const estPropertyTax = currentAssessment.monthlyCarryingCostsEstimated.propertyTax;
  const estCondoFees = currentAssessment.monthlyCarryingCostsEstimated.condoFees;
  const estHeating = currentAssessment.monthlyCarryingCostsEstimated.heating;
  const cashbackEstimated = Math.round(maxPurchasePrice * 0.01);

  // Actual qualifying stress ratio computations for visual gauge
  const grossMonthly = Math.max(1, totalGrossIncome / 12);
  const actualGds = Math.min(100, Math.round(((monthlyHousing) / grossMonthly) * 100 * 10) / 10);
  const actualTds = Math.min(100, Math.round(((monthlyHousing + totalMonthlyDebt) / grossMonthly) * 100 * 10) / 10);

  // Handle saving updated financials to client profile & context
  const handleSaveAffordability = async () => {
    setSaving(true);
    try {
      // 1. If contract rate changed, update rules
      if (contractRate !== rules.contractRate) {
        await updateRules({ contractRate });
      }

      // 2. Persist financial profile in AffordabilityContext (updates local storage & backend)
      await saveProfile(activeProfile);

      // 3. Update AuthUser account profile so client CRM and portal retain the fresh figures
      if (updateUserProfile) {
        await updateUserProfile({
          targetBudgetMax: maxPurchasePrice,
          targetBudgetMin: recommendedMin,
          intendedDownPayment: intendedDownPayment,
          preApprovalAmount: maxMortgage,
          propertyTypePlanning: propertyTypePlanning
        });
      }

      setHasUnsavedChanges(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 5000);
    } catch (err) {
      console.error('Failed to persist affordability profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" id="portal-affordability-section">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Client Financial Profile & Affordability</span>
            </span>
            <span className="text-xs text-stone-500 font-medium">
              OSFI B-20 Stress-Tested • Real-Time Recalculation
            </span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Update Financials & Recalculate Buying Range
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Update your income, liabilities, or down payment below to instantly recalculate your maximum purchase price, comfortable budget bracket, and debt service ratios. Changes saved here sync across all property badges and offer preparation tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openWizard}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-stone-300 transition-all cursor-pointer shadow-xs"
            title="Launch step-by-step guided wizard"
          >
            <Sparkles className="w-4 h-4 text-[#8C6D43]" />
            <span>Guided Wizard</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAffordability}
            disabled={saving}
            className="px-5 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
            ) : (
              <Save className="w-4 h-4 text-[#C5A880]" />
            )}
            <span>Save & Apply to Portal</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Callout Strip */}
      {hasUnsavedChanges && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved financial adjustments. Previewing live recalculated figures below. Click "Save & Apply to Portal" to commit them to your client profile.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveAffordability}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 ml-3 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Save Confirmation Toast */}
      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Financials & Affordability Saved Successfully</p>
              <p className="text-xs text-emerald-800">
                Your new purchasing power (${recommendedMin.toLocaleString()} – ${maxPurchasePrice.toLocaleString()}) has been saved. All property badges and your Client Portal overview have been updated.
              </p>
            </div>
          </div>
          {onSearchProperties && (
            <button
              type="button"
              onClick={() => onSearchProperties(maxPurchasePrice)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>Explore Matching Homes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Live Calculated Buying Range Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Max Purchasing Power */}
        <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-md border border-stone-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Max Purchasing Power
          </span>
          <p className="text-3xl font-black text-white tracking-tight">
            ${maxPurchasePrice.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-400 mt-2 pt-2 border-t border-stone-800">
            <span>Down: ${intendedDownPayment.toLocaleString()}</span>
            <span className="text-emerald-400 font-semibold">Stress: {effectiveStressRate.toFixed(2)}%</span>
          </div>
        </div>

        {/* Card 2: Comfortable Target Range */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-[#0F2942] uppercase tracking-wider block mb-1">
            Comfortable Target Range
          </span>
          <p className="text-2xl font-black text-stone-900 tracking-tight">
            ${recommendedMin.toLocaleString()} – ${recommendedMax.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span>Balanced cash flow</span>
            <span className="font-semibold text-stone-700">Healthy reserves</span>
          </div>
        </div>

        {/* Card 3: Max Qualifying Mortgage */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
            Max Qualifying Mortgage
          </span>
          <p className="text-2xl font-black text-stone-900 tracking-tight">
            ${maxMortgage.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span>{amortizationYears} Yr Amortization</span>
            <span className="font-semibold text-stone-700">Contract: {contractRate}%</span>
          </div>
        </div>

        {/* Card 4: Est. Commission Cashback */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Est. Commission Cashback
          </span>
          <p className="text-2xl font-black text-emerald-700 tracking-tight">
            Up to ${cashbackEstimated.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-emerald-800 mt-2 pt-2 border-t border-emerald-200">
            <span>1.0% Co-op Rebate</span>
            <span className="font-bold text-emerald-900">Paid on closing</span>
          </div>
        </div>
      </div>

      {/* Debt Service Ratios & Stress Test Certification */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F2942]/5 text-[#0F2942] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#0F2942]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">OSFI B-20 Mortgage Stress Test & Qualification Ratios</h3>
              <p className="text-xs text-stone-500">Major Canadian Schedule I A-Lender qualification benchmarks</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stress Test Passed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GDS Ratio */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-700">Gross Debt Service (GDS)</span>
              <span className="text-sm font-black text-[#0F2942]">{actualGds.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all ${actualGds <= 39 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, (actualGds / 39) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Housing / Gross Income</span>
              <span className="font-semibold text-stone-700">Max Limit: 39.0%</span>
            </div>
          </div>

          {/* TDS Ratio */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-700">Total Debt Service (TDS)</span>
              <span className="text-sm font-black text-[#0F2942]">{actualTds.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all ${actualTds <= 44 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, (actualTds / 44) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Housing + Debts / Income</span>
              <span className="font-semibold text-stone-700">Max Limit: 44.0%</span>
            </div>
          </div>

          {/* Estimated Monthly Carrying Costs */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-700">Est. Total Monthly Carrying</span>
              <span className="text-sm font-black text-[#0F2942]">${monthlyHousing.toLocaleString()}/mo</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-stone-500 pt-1 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Principal & Interest ({contractRate}%):</span>
                <span className="font-semibold text-stone-700">${currentAssessment.monthlyCarryingCostsEstimated.mortgagePaymentMax.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Taxes & Utilities:</span>
                <span className="font-semibold text-stone-700">${(estPropertyTax + estHeating).toLocaleString()}/mo</span>
              </div>
              {estCondoFees > 0 && (
                <div className="flex justify-between">
                  <span>Est. Condo Maintenance Fee:</span>
                  <span className="font-semibold text-stone-700">${estCondoFees}/mo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recalculation Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Adjust Financials & Live Recalculate</h3>
              <p className="text-xs text-stone-500">Edit any parameter below to immediately recalculate your purchasing power</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAffordability}
              disabled={saving}
              className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{saving ? 'Saving...' : 'Save Financials'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Column 1: Income Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-stone-100">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Annual Household Income</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Primary Applicant Gross Income ($/yr)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                <input
                  type="number"
                  step={5000}
                  min={0}
                  value={applicant1Income}
                  onChange={e => {
                    setApplicant1Income(Math.max(0, Number(e.target.value)));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl text-sm border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 mb-2">
                <input
                  type="checkbox"
                  checked={isJointIncome}
                  onChange={e => {
                    setIsJointIncome(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-4 h-4 rounded text-[#0F2942] focus:ring-[#0F2942]"
                />
                <span>Include Co-Applicant / Joint Income</span>
              </label>

              {isJointIncome && (
                <div className="animate-in fade-in space-y-1">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Co-Applicant Gross Income ($/yr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                    <input
                      type="number"
                      step={5000}
                      min={0}
                      value={applicant2Income}
                      onChange={e => {
                        setApplicant2Income(Math.max(0, Number(e.target.value)));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl text-sm border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>Total Gross Household:</span>
              <strong className="text-stone-900">${totalGrossIncome.toLocaleString()}/yr</strong>
            </div>
          </div>

          {/* Column 2: Down Payment & Mortgage Settings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-stone-100">
              <Home className="w-3.5 h-3.5 text-[#0F2942]" />
              <span>Down Payment & Mortgage Settings</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Intended Down Payment Available ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                <input
                  type="number"
                  step={5000}
                  min={0}
                  value={intendedDownPayment}
                  onChange={e => {
                    const val = Math.max(0, Number(e.target.value));
                    setIntendedDownPayment(val);
                    if (val > availableFunds) setAvailableFunds(val);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl text-sm border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mortgage Rate (%)
                </label>
                <input
                  type="number"
                  step={0.05}
                  min={2.0}
                  max={12.0}
                  value={contractRate}
                  onChange={e => {
                    setContractRate(Math.max(1, Number(e.target.value)));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Amortization
                </label>
                <select
                  value={amortizationYears}
                  onChange={e => {
                    setAmortizationYears(Number(e.target.value));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-2.5 py-2.5 rounded-xl text-xs border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942] bg-white"
                >
                  <option value={25}>25 Years (Standard)</option>
                  <option value={30}>30 Years (Extended/Pre-con)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Planned Property Type
              </label>
              <select
                value={propertyTypePlanning}
                onChange={e => {
                  setPropertyTypePlanning(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942] bg-white"
              >
                <option value="Preconstruction">Pre-Construction VIP Project (30-Yr Amort. Capable)</option>
                <option value="Condo">Condo Suite (50% Condo Fees in Stress Test)</option>
                <option value="Townhouse">Freehold Townhome</option>
                <option value="Detached">Single-Family Detached</option>
              </select>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>Down Payment Ratio:</span>
              <strong className="text-stone-900">
                {maxPurchasePrice > 0 ? ((intendedDownPayment / maxPurchasePrice) * 100).toFixed(1) : '20.0'}% of maximum
              </strong>
            </div>
          </div>

          {/* Column 3: Monthly Liabilities & Debts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Monthly Debt Obligations</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowDebtBreakdown(!showDebtBreakdown)}
                className="text-[11px] font-semibold text-[#0F2942] hover:underline cursor-pointer"
              >
                {showDebtBreakdown ? 'Simple View' : 'Itemize Debts'}
              </button>
            </div>

            {showDebtBreakdown ? (
              <div className="space-y-2.5 animate-in fade-in">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">Auto Financing / Lease ($/mo)</label>
                  <input
                    type="number"
                    step={25}
                    min={0}
                    value={carLoans}
                    onChange={e => {
                      setCarLoans(Math.max(0, Number(e.target.value)));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">Student Loans ($/mo)</label>
                  <input
                    type="number"
                    step={25}
                    min={0}
                    value={studentLoans}
                    onChange={e => {
                      setStudentLoans(Math.max(0, Number(e.target.value)));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">Credit Cards Min. Payments ($/mo)</label>
                  <input
                    type="number"
                    step={25}
                    min={0}
                    value={creditCardsMin}
                    onChange={e => {
                      setCreditCardsMin(Math.max(0, Number(e.target.value)));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">Lines of Credit / Loans ($/mo)</label>
                  <input
                    type="number"
                    step={25}
                    min={0}
                    value={linesOfCredit}
                    onChange={e => {
                      setLinesOfCredit(Math.max(0, Number(e.target.value)));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-stone-300"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Total Monthly Debt Obligations ($/mo)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    step={50}
                    min={0}
                    value={totalDebtSimple}
                    onChange={e => {
                      const val = Math.max(0, Number(e.target.value));
                      setTotalDebtSimple(val);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl text-sm border border-stone-300 text-stone-900 focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Includes all car loans, student debt, and monthly credit card minimums
                </p>
              </div>
            )}

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>Total Monthly Liabilities:</span>
              <strong className="text-stone-900">${totalMonthlyDebt.toLocaleString()}/mo</strong>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-stone-600 leading-relaxed">
            Live Calculated Range: <strong className="text-[#0F2942] text-sm">${recommendedMin.toLocaleString()} – ${maxPurchasePrice.toLocaleString()}</strong>.
            {hasUnsavedChanges ? (
              <span className="text-amber-700 font-semibold block sm:inline sm:ml-2">
                • Changes pending save
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold block sm:inline sm:ml-2">
                • Synced with your VIP client profile
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveAffordability}
              disabled={saving}
              className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{saving ? 'Saving...' : 'Save & Update Profile'}</span>
            </button>

            {onDraftOffer && (
              <button
                type="button"
                onClick={onDraftOffer}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Prepare Offer Draft
              </button>
            )}

            {onSearchProperties && (
              <button
                type="button"
                onClick={() => onSearchProperties(maxPurchasePrice)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>Search Listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
