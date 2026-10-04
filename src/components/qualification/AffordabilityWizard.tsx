import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  User,
  Users,
  Briefcase,
  CreditCard,
  Building2,
  Home,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Sparkles,
  Sliders,
  Calendar,
  AlertTriangle,
  FileText,
  MapPin,
  Eye,
  Check,
  Clock,
  Phone,
  Mail,
  Scale,
  Gift,
  HelpCircle,
  FileCheck2,
  Lock,
  Search as SearchIcon
} from 'lucide-react';
import {
  BuyerFinancialProfile,
  EmploymentStatusType,
  DownPaymentSourceType,
  CreditProfileCategory,
  PropertyPlanningType,
  AffordabilityAssessment,
  Project,
  ResaleListing
} from '../../types';
import { useAffordability } from '../../context/AffordabilityContext';
import { useAuth } from '../../context/AuthContext';
import { calculateAffordability, calculateMonthlyPayment } from '../../services/affordabilityService';
import { calculateCashback, formatCurrency } from '../../utils/cashback';
import { AMIT_SAWHNEY } from '../../data/agent';
import { PROJECTS_DATA } from '../../data/projects';
import { RESALE_LISTINGS_DATA } from '../../data/resale';
import { AffordabilityIndicatorBadge } from './AffordabilityIndicatorBadge';

export interface AffordabilityWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateToProperties?: () => void;
  onOpenConsultation?: (topic?: string, notes?: string) => void;
  initialStage?: 1 | 2 | 3 | 4 | 5 | 6;
  embedded?: boolean;
}

export const AffordabilityWizard: React.FC<AffordabilityWizardProps> = ({
  isOpen = true,
  onClose,
  onNavigateToProperties,
  onOpenConsultation,
  initialStage = 1,
  embedded = false
}) => {
  const {
    buyerProfile,
    assessment,
    rules,
    saveProfile,
    setFilterOnlyAffordable,
    setActiveJourneyStage,
    activeJourneyStage,
    requestShowing,
    openOfferPreparation
  } = useAffordability();
  const { isAuthenticated, isClient, user, openAuthModal } = useAuth();

  // The 6-Step Journey:
  // Step 1: Financial Profile
  // Step 2: Affordability
  // Step 3: Property Preferences
  // Step 4: Search
  // Step 5: Showing
  // Step 6: Offer
  const [journeyStage, setJourneyStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(initialStage);

  // Sub-steps within Stage 1 (Financial Profile):
  // 1: Income, 2: Employment, 3: Debt, 4: Down Payment, 5: Credit Profile
  const [financialSubStep, setFinancialSubStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<AffordabilityAssessment | null>(assessment);

  // -------------------------------------------------------------
  // Form State: Income
  // -------------------------------------------------------------
  const [isJoint, setIsJoint] = useState<boolean>(buyerProfile?.isJointIncome ?? false);
  const [app1Income, setApp1Income] = useState<number>(
    buyerProfile?.applicant1Income || (buyerProfile?.isJointIncome ? 95000 : buyerProfile?.grossAnnualIncome || 110000)
  );
  const [app2Income, setApp2Income] = useState<number>(buyerProfile?.applicant2Income || 65000);
  const [otherIncome, setOtherIncome] = useState<number>(0);

  // -------------------------------------------------------------
  // Form State: Employment
  // -------------------------------------------------------------
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatusType>(
    buyerProfile?.employmentStatus || 'Full-time'
  );
  const [employmentYears, setEmploymentYears] = useState<number>(buyerProfile?.employmentDurationYears || 3);
  const [selfEmployedYears, setSelfEmployedYears] = useState<number>(buyerProfile?.selfEmployedYears || 2);
  const [selfEmployedIncome, setSelfEmployedIncome] = useState<number>(
    buyerProfile?.selfEmployedAnnualIncome || 120000
  );
  const [selfEmployedPrevIncome, setSelfEmployedPrevIncome] = useState<number>(
    buyerProfile?.selfEmployedPreviousYearIncome || 105000
  );

  // -------------------------------------------------------------
  // Form State: Debt Obligations
  // -------------------------------------------------------------
  const [useItemizedDebt, setUseItemizedDebt] = useState<boolean>(false);
  const [carLoans, setCarLoans] = useState<number>(buyerProfile?.debtBreakdown?.carLoans || 0);
  const [studentLoans, setStudentLoans] = useState<number>(buyerProfile?.debtBreakdown?.studentLoans || 0);
  const [creditCardsMin, setCreditCardsMin] = useState<number>(buyerProfile?.debtBreakdown?.creditCardsMin || 0);
  const [linesOfCredit, setLinesOfCredit] = useState<number>(buyerProfile?.debtBreakdown?.linesOfCredit || 0);
  const [otherMonthlyDebt, setOtherMonthlyDebt] = useState<number>(buyerProfile?.debtBreakdown?.otherMonthlyDebt || 0);
  const [totalDebtDirect, setTotalDebtDirect] = useState<number>(buyerProfile?.monthlyDebtObligations || 0);

  // Existing property
  const [ownsProperty, setOwnsProperty] = useState<boolean>(buyerProfile?.ownsExistingProperty ?? false);
  const [propValue, setPropValue] = useState<number>(
    buyerProfile?.existingPropertyDetails?.estimatedValue || 750000
  );
  const [propMortgage, setPropMortgage] = useState<number>(
    buyerProfile?.existingPropertyDetails?.mortgageBalance || 350000
  );
  const [propMonthlyPmt, setPropMonthlyPmt] = useState<number>(
    buyerProfile?.existingPropertyDetails?.monthlyMortgagePayment || 2100
  );
  const [sellingBeforeBuy, setSellingBeforeBuy] = useState<boolean>(
    buyerProfile?.existingPropertyDetails?.sellingBeforePurchasing ?? true
  );

  // -------------------------------------------------------------
  // Form State: Down Payment
  // -------------------------------------------------------------
  const [availableFunds, setAvailableFunds] = useState<number>(buyerProfile?.availableFunds || 125000);
  const [intendedDownPayment, setIntendedDownPayment] = useState<number>(
    buyerProfile?.intendedDownPayment || 100000
  );
  const [downPaymentSource, setDownPaymentSource] = useState<DownPaymentSourceType>(
    buyerProfile?.downPaymentSource || 'Personal savings'
  );
  const [firstTimeHomebuyer, setFirstTimeHomebuyer] = useState<boolean>(
    buyerProfile?.firstTimeHomebuyer ?? true
  );

  // -------------------------------------------------------------
  // Form State: Credit Profile
  // -------------------------------------------------------------
  const [creditProfile, setCreditProfile] = useState<CreditProfileCategory>(
    buyerProfile?.creditProfileCategory || 'Excellent'
  );

  // -------------------------------------------------------------
  // Form State: Property Preferences (Stage 3)
  // -------------------------------------------------------------
  const [propertyType, setPropertyType] = useState<PropertyPlanningType>(
    buyerProfile?.propertyTypePlanning || 'Townhouse'
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    buyerProfile?.preferredCities || ['Whitby', 'Oshawa', 'Pickering']
  );
  const [bedroomsPreference, setBedroomsPreference] = useState<string>(
    buyerProfile?.preferredBedrooms || '3+'
  );
  const [bathroomsPreference, setBathroomsPreference] = useState<string>(
    buyerProfile?.preferredBathrooms || '2+'
  );
  const [targetTimeline, setTargetTimeline] = useState<string>(
    buyerProfile?.targetTimeline || '1-3 months'
  );
  const [purchaseGoal, setPurchaseGoal] = useState<string>(
    buyerProfile?.purchaseGoal || 'Primary Residence'
  );
  const [preconOrResale, setPreconOrResale] = useState<'both' | 'precon' | 'resale'>('both');

  // -------------------------------------------------------------
  // Form State: Showing & Offer Stage
  // -------------------------------------------------------------
  const [showingSelectedPropertyId, setShowingSelectedPropertyId] = useState<string>('');
  const [showingDate, setShowingDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [showingTimeSlot, setShowingTimeSlot] = useState<string>('Afternoon (1:00 PM - 4:00 PM)');
  const [showingSuccess, setShowingSuccess] = useState<boolean>(false);

  // Offer State
  const [offerPropertyTarget, setOfferPropertyTarget] = useState<string>('');
  const [offerProposedPrice, setOfferProposedPrice] = useState<number>(
    activeAssessment?.estimatedPurchasePriceMax || 850000
  );
  const [offerDepositAmount, setOfferDepositAmount] = useState<number>(45000);
  const [offerIncludeFinancing, setOfferIncludeFinancing] = useState<boolean>(true);
  const [offerIncludeInspection, setOfferIncludeInspection] = useState<boolean>(true);
  const [offerIncludeStatusCert, setOfferIncludeStatusCert] = useState<boolean>(true);
  const [offerIncludeLawyerReview, setOfferIncludeLawyerReview] = useState<boolean>(true);
  const [offerSubmitted, setOfferSubmitted] = useState<boolean>(false);

  // Contact Info
  const [fullName, setFullName] = useState<string>(buyerProfile?.fullName || user?.fullName || '');
  const [email, setEmail] = useState<string>(buyerProfile?.email || user?.email || '');
  const [phone, setPhone] = useState<string>(buyerProfile?.phone || user?.phone || '');
  const [clientNotes, setClientNotes] = useState<string>('');

  // -------------------------------------------------------------
  // Synchronize on load
  // -------------------------------------------------------------
  useEffect(() => {
    if (assessment) {
      setActiveAssessment(assessment);
      if (offerProposedPrice === 850000 && assessment.estimatedPurchasePriceMax) {
        setOfferProposedPrice(assessment.estimatedPurchasePriceMax);
        setOfferDepositAmount(Math.round(assessment.estimatedPurchasePriceMax * 0.05));
      }
    }
  }, [assessment]);

  // Total gross income computation
  const totalGrossAnnual = useMemo(() => {
    let base = 0;
    if (employmentStatus === 'Self-employed') {
      base = (selfEmployedIncome + selfEmployedPrevIncome) / 2;
    } else if (isJoint) {
      base = app1Income + app2Income;
    } else {
      base = app1Income;
    }
    return base + otherIncome;
  }, [employmentStatus, selfEmployedIncome, selfEmployedPrevIncome, isJoint, app1Income, app2Income, otherIncome]);

  // Total monthly debt computation
  const calculatedMonthlyDebt = useMemo(() => {
    let monthly = 0;
    if (useItemizedDebt) {
      monthly = carLoans + studentLoans + creditCardsMin + linesOfCredit + otherMonthlyDebt;
    } else {
      monthly = totalDebtDirect;
    }
    if (ownsProperty && !sellingBeforeBuy) {
      monthly += propMonthlyPmt;
    }
    return monthly;
  }, [useItemizedDebt, carLoans, studentLoans, creditCardsMin, linesOfCredit, otherMonthlyDebt, totalDebtDirect, ownsProperty, sellingBeforeBuy, propMonthlyPmt]);

  // Available cash / down payment computation
  const effectiveDownPayment = useMemo(() => {
    let dp = intendedDownPayment;
    if (ownsProperty && sellingBeforeBuy) {
      const netEquity = Math.max(0, (propValue - propMortgage) * 0.95);
      dp += netEquity;
    }
    return dp;
  }, [intendedDownPayment, ownsProperty, sellingBeforeBuy, propValue, propMortgage]);

  // Helper to compile and save current profile
  const compileProfile = (): BuyerFinancialProfile => {
    return {
      grossAnnualIncome: totalGrossAnnual,
      isJointIncome: isJoint,
      applicant1Income: app1Income,
      applicant2Income: isJoint ? app2Income : 0,
      employmentStatus,
      employmentDurationYears: employmentYears,
      isSelfEmployed: employmentStatus === 'Self-employed',
      selfEmployedYears,
      selfEmployedAnnualIncome: selfEmployedIncome,
      selfEmployedPreviousYearIncome: selfEmployedPrevIncome,
      monthlyDebtObligations: calculatedMonthlyDebt,
      debtBreakdown: {
        carLoans,
        studentLoans,
        creditCardsMin,
        linesOfCredit,
        otherMonthlyDebt
      },
      availableFunds,
      intendedDownPayment: effectiveDownPayment,
      downPaymentSource,
      firstTimeHomebuyer,
      ownsExistingProperty: ownsProperty,
      existingPropertyDetails: ownsProperty
        ? {
            estimatedValue: propValue,
            mortgageBalance: propMortgage,
            monthlyMortgagePayment: propMonthlyPmt,
            expectedSaleProceeds: Math.max(0, propValue - propMortgage),
            sellingBeforePurchasing: sellingBeforeBuy
          }
        : undefined,
      creditProfileCategory: creditProfile,
      propertyTypePlanning: propertyType,
      preferredCities: selectedCities,
      preferredBedrooms: bedroomsPreference,
      preferredBathrooms: bathroomsPreference,
      targetTimeline,
      purchaseGoal,
      mortgagePreApprovalStatus: 'Not started',
      fullName,
      email,
      phone,
      financialProfileUpdatedDate: new Date().toISOString()
    };
  };

  // Run calculation & persist
  const performAffordabilityCalculation = async (profileData?: BuyerFinancialProfile) => {
    const profile = profileData || compileProfile();
    setIsSubmitting(true);
    try {
      const calculated = calculateAffordability(profile, rules);
      setActiveAssessment(calculated);
      await saveProfile(profile);
      return calculated;
    } catch (err) {
      console.error('Failed to calculate affordability:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move forward in Stage 1 sub-steps, or advance to Stage 2
  const handleFinancialNext = async () => {
    if (financialSubStep < 5) {
      setFinancialSubStep((prev) => (prev + 1) as any);
    } else {
      // Completed all financial sub-steps -> calculate & advance to Stage 2 (Affordability)
      await performAffordabilityCalculation();
      setJourneyStage(2);
      setActiveJourneyStage(2);
    }
  };

  const handleFinancialBack = () => {
    if (financialSubStep > 1) {
      setFinancialSubStep((prev) => (prev - 1) as any);
    }
  };

  // Switch between stages (with validation)
  const handleGoToStage = async (stage: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (stage > 1 && !activeAssessment) {
      await performAffordabilityCalculation();
    }
    setJourneyStage(stage);
    setActiveJourneyStage(stage);
  };

  // Filtered properties for Search (Stage 4)
  const qualifiedProperties = useMemo(() => {
    const maxBudget = activeAssessment?.estimatedPurchasePriceMax || 1500000;
    const minBudget = (activeAssessment?.estimatedPurchasePriceMin || 500000) * 0.7;

    const matchedPrecon = PROJECTS_DATA.filter((p) => {
      const withinPrice = p.priceRange.min <= maxBudget * 1.1;
      const withinCity = selectedCities.length === 0 || selectedCities.includes(p.location.city);
      return withinPrice && (selectedCities.length === 0 || withinCity);
    });

    const matchedResale = RESALE_LISTINGS_DATA.filter((r) => {
      const withinPrice = r.price <= maxBudget * 1.1 && r.price >= minBudget;
      const withinCity = selectedCities.length === 0 || selectedCities.includes(r.city);
      return withinPrice && (selectedCities.length === 0 || withinCity);
    });

    return {
      precon: matchedPrecon,
      resale: matchedResale,
      totalCount: matchedPrecon.length + matchedResale.length
    };
  }, [activeAssessment, selectedCities]);

  // Handle Booking Showing from Step 5
  const handleConfirmShowing = () => {
    if (!fullName || !phone) {
      alert('Please provide your name and phone number so Amit Sawhney can confirm your showing.');
      return;
    }
    const propTitle = showingSelectedPropertyId
      ? PROJECTS_DATA.find((p) => p.id === showingSelectedPropertyId)?.name ||
        RESALE_LISTINGS_DATA.find((r) => r.id === showingSelectedPropertyId)?.title ||
        'Selected Durham Portfolio Tour'
      : 'Curated 3-Home Showing Tour';

    requestShowing({
      targetId: showingSelectedPropertyId || 'custom-tour',
      targetTitle: propTitle,
      targetPrice: activeAssessment?.estimatedPurchasePriceMax || 850000,
      targetAddress: 'Durham Region, ON',
      targetType: propertyType
    });

    setShowingSuccess(true);
  };

  // Handle Submitting Offer Draft from Step 6
  const handleSubmitOffer = () => {
    if (!fullName || !phone || !email) {
      alert('Please complete your contact information (name, phone, email) to prepare an offer review.');
      return;
    }

    openOfferPreparation({
      targetId: offerPropertyTarget || 'draft-offer',
      targetTitle: offerPropertyTarget || 'Proposed Agreement of Purchase and Sale',
      targetPrice: offerProposedPrice,
      targetAddress: 'Durham Region, ON',
      targetType: propertyType
    });

    setOfferSubmitted(true);
  };

  // 6-step progress bar definition
  const journeySteps: Array<{ stage: 1 | 2 | 3 | 4 | 5 | 6; label: string; icon: any }> = [
    { stage: 1, label: 'Financial Profile', icon: User },
    { stage: 2, label: 'Affordability', icon: TrendingUp },
    { stage: 3, label: 'Property Preferences', icon: Home },
    { stage: 4, label: 'Search', icon: SearchIcon },
    { stage: 5, label: 'Showing', icon: Calendar },
    { stage: 6, label: 'Offer', icon: FileCheck2 }
  ];

  if (!isOpen && !embedded) return null;

  const content = (
    <div
      className={`relative w-full ${
        embedded ? 'max-w-5xl mx-auto' : 'max-w-4xl my-auto'
      } bg-[#111111] border border-white/15 rounded-3xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      id="affordability-wizard-container"
    >
      {/* Top Header & Concierge Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                Concierge Mortgage & Buying Power Flow
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-stone-300">
                OSFI B-20 Standard
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
              Affordability Wizard
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
            id="close-affordability-wizard-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 6-Step Journey Progress Indicator */}
      <div className="px-4 sm:px-8 py-3.5 bg-[#0C0C0C] border-b border-white/10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {journeySteps.map((step) => {
            const isCompleted = journeyStage > step.stage;
            const isCurrent = journeyStage === step.stage;
            const Icon = step.icon;

            return (
              <button
                key={step.stage}
                onClick={() => handleGoToStage(step.stage)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#C5A880]/15 border border-[#C5A880]/50 text-white'
                    : isCompleted
                    ? 'bg-white/5 border border-white/10 text-stone-200 hover:bg-white/10'
                    : 'bg-transparent border border-transparent text-stone-500 hover:text-stone-400'
                }`}
                title={`Jump to ${step.label}`}
                id={`wizard-journey-step-${step.stage}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-[#C5A880] text-black shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.stage}
                </div>
                <div className="truncate">
                  <span className="block text-[11px] font-bold leading-tight truncate">
                    {step.label}
                  </span>
                  <span className="text-[9px] text-stone-400 hidden lg:block">
                    {isCompleted ? 'Completed' : isCurrent ? 'Active' : 'Upcoming'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Journey Progress Bar Line */}
        <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#C5A880] to-amber-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${(journeyStage / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Body Content */}
      <div className="p-6 sm:p-8 max-h-[72vh] overflow-y-auto space-y-6">
        {/* ========================================================================= */}
        {/* STAGE 1: FINANCIAL PROFILE */}
        {/* ========================================================================= */}
        {journeyStage === 1 && (
          <div className="space-y-6">
            {/* Financial Profile Sub-step Navigation Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880]">
                  Step 1: Financial Profile
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-light text-white mt-0.5">
                  {financialSubStep === 1 && 'Gross Household Income'}
                  {financialSubStep === 2 && 'Employment & Income Stability'}
                  {financialSubStep === 3 && 'Monthly Debt Obligations'}
                  {financialSubStep === 4 && 'Down Payment & Available Assets'}
                  {financialSubStep === 5 && 'Credit Profile & Beacon Score'}
                </h3>
              </div>

              {/* Sub-step Dots */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/10">
                {[
                  { num: 1, name: 'Income' },
                  { num: 2, name: 'Employment' },
                  { num: 3, name: 'Debt' },
                  { num: 4, name: 'Down Payment' },
                  { num: 5, name: 'Credit' }
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => setFinancialSubStep(s.num as any)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      financialSubStep === s.num
                        ? 'bg-[#C5A880] text-black font-extrabold shadow-sm'
                        : financialSubStep > s.num
                        ? 'bg-white/15 text-white'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 1.1: GROSS INCOME */}
            {financialSubStep === 1 && (
              <div className="space-y-6">
                <p className="text-sm text-stone-400">
                  Enter your total pre-tax earnings before tax deductions. Canadian mortgage stress-testing (OSFI B-20)
                  evaluates verified gross household income against GDS (39%) and TDS (44%) limits.
                </p>

                {/* Single vs Joint Applicant Toggle */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsJoint(false)}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      !isJoint
                        ? 'bg-[#C5A880] text-black shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Single Applicant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsJoint(true)}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      isJoint
                        ? 'bg-[#C5A880] text-black shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Joint Income (Co-Borrower)</span>
                  </button>
                </div>

                {/* Income Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>{isJoint ? 'Applicant 1 Annual Gross' : 'Your Annual Gross Income'}</span>
                      <span className="text-[#C5A880] font-mono">${app1Income.toLocaleString()}</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="number"
                        min={30000}
                        max={1000000}
                        step={5000}
                        value={app1Income}
                        onChange={(e) => setApp1Income(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white font-mono text-sm focus:border-[#C5A880] outline-none"
                      />
                    </div>
                    <input
                      type="range"
                      min={40000}
                      max={400000}
                      step={5000}
                      value={app1Income}
                      onChange={(e) => setApp1Income(Number(e.target.value))}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                  </div>

                  {isJoint && (
                    <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                        <span>Co-Borrower Annual Gross</span>
                        <span className="text-[#C5A880] font-mono">${app2Income.toLocaleString()}</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input
                          type="number"
                          min={0}
                          max={1000000}
                          step={5000}
                          value={app2Income}
                          onChange={(e) => setApp2Income(Number(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white font-mono text-sm focus:border-[#C5A880] outline-none"
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={300000}
                        step={5000}
                        value={app2Income}
                        onChange={(e) => setApp2Income(Number(e.target.value))}
                        className="w-full accent-[#C5A880] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Additional verified income */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-300">
                      Other Verified Annual Income (Bonuses, Commissions, Rental)
                    </span>
                    <span className="text-[#C5A880] font-mono">${otherIncome.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                    <input
                      type="number"
                      min={0}
                      max={200000}
                      step={2500}
                      value={otherIncome}
                      onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 bg-black/50 border border-white/15 rounded-xl text-white font-mono text-sm focus:border-[#C5A880] outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#0F2942]/30 border border-[#C5A880]/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-stone-300">Total Combined Gross Annual Income:</span>
                  <span className="text-base font-bold text-[#C5A880] font-mono">
                    ${totalGrossAnnual.toLocaleString()} / yr
                  </span>
                </div>
              </div>
            )}

            {/* 1.2: EMPLOYMENT */}
            {financialSubStep === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-stone-400">
                  Select your primary employment structure. A-lenders look for verifiable tenure or a 2-year average for
                  self-employed entrepreneurs.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(['Full-time', 'Part-time', 'Self-employed', 'Contract', 'Other'] as EmploymentStatusType[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEmploymentStatus(st)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          employmentStatus === st
                            ? 'bg-[#C5A880]/15 border-[#C5A880] text-white'
                            : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Briefcase className={`w-4 h-4 mb-2 ${employmentStatus === st ? 'text-[#C5A880]' : 'text-stone-500'}`} />
                        <div className="text-xs font-bold text-white">{st}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {st === 'Full-time' && 'Permanent salaried / hourly'}
                          {st === 'Self-employed' && 'Sole prop or incorporated'}
                          {st === 'Contract' && 'Fixed-term or freelance'}
                          {st === 'Part-time' && 'Regular part-time hours'}
                          {st === 'Other' && 'Retirement, pension, or dividends'}
                        </div>
                      </button>
                    )
                  )}
                </div>

                {employmentStatus === 'Self-employed' ? (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Self-Employed 2-Year Averaging Requirement</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Canadian mortgage lenders calculate qualification from the average of your last 2 years of CRA Notice
                      of Assessments (Line 15000) or business financials.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-stone-300 block mb-1">Most Recent Year Net Income ($)</label>
                        <input
                          type="number"
                          value={selfEmployedIncome}
                          onChange={(e) => setSelfEmployedIncome(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-300 block mb-1">Prior Year Net Income ($)</label>
                        <input
                          type="number"
                          value={selfEmployedPrevIncome}
                          onChange={(e) => setSelfEmployedPrevIncome(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Years with Current Employer / Industry:</span>
                      <span className="text-[#C5A880] font-mono">{employmentYears} years</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={employmentYears}
                      onChange={(e) => setEmploymentYears(Number(e.target.value))}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>Under 1 yr (Probation)</span>
                      <span>2+ yrs (Prime A-Lender Standard)</span>
                      <span>10+ yrs</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 1.3: DEBT OBLIGATIONS */}
            {financialSubStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-stone-400">
                    Monthly debt obligations directly impact your Total Debt Service (TDS) ratio. OSFI rules mandate a
                    maximum 44% TDS limit.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUseItemizedDebt(!useItemizedDebt)}
                    className="text-xs text-[#C5A880] hover:underline font-semibold cursor-pointer shrink-0 ml-3"
                  >
                    {useItemizedDebt ? 'Use Quick Total' : 'Itemize Liabilities'}
                  </button>
                </div>

                {useItemizedDebt ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div>
                      <label className="text-xs text-stone-300 block mb-1">Car Loan / Lease ($/mo)</label>
                      <input
                        type="number"
                        min={0}
                        value={carLoans}
                        onChange={(e) => setCarLoans(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                        placeholder="e.g. 450"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-300 block mb-1">Student Loans ($/mo)</label>
                      <input
                        type="number"
                        min={0}
                        value={studentLoans}
                        onChange={(e) => setStudentLoans(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                        placeholder="e.g. 250"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-300 block mb-1">Credit Cards (3% min pmt)</label>
                      <input
                        type="number"
                        min={0}
                        value={creditCardsMin}
                        onChange={(e) => setCreditCardsMin(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                        placeholder="e.g. 150"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-300 block mb-1">Lines of Credit / Loans</label>
                      <input
                        type="number"
                        min={0}
                        value={linesOfCredit}
                        onChange={(e) => setLinesOfCredit(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                        placeholder="e.g. 200"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Total Estimated Monthly Debt Payments</span>
                      <span className="text-[#C5A880] font-mono">${totalDebtDirect.toLocaleString()} / mo</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={4000}
                      step={50}
                      value={totalDebtDirect}
                      onChange={(e) => setTotalDebtDirect(Number(e.target.value))}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>$0 / mo (Debt-Free)</span>
                      <span>$1,000 / mo</span>
                      <span>$2,500+ / mo</span>
                    </div>
                  </div>
                )}

                {/* Existing Property Toggle */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Do you currently own real estate?</div>
                      <div className="text-[11px] text-stone-400">
                        Selling your current home can contribute significant equity to your down payment.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOwnsProperty(!ownsProperty)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        ownsProperty ? 'bg-[#C5A880] text-black font-extrabold' : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {ownsProperty ? 'Yes, I Own' : 'No (Renting/First-Time)'}
                    </button>
                  </div>

                  {ownsProperty && (
                    <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">Estimated Home Value</label>
                        <input
                          type="number"
                          value={propValue}
                          onChange={(e) => setPropValue(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">Mortgage Balance</label>
                        <input
                          type="number"
                          value={propMortgage}
                          onChange={(e) => setPropMortgage(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-xs font-mono text-white"
                        />
                      </div>
                      <div className="flex items-center pt-4">
                        <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sellingBeforeBuy}
                            onChange={(e) => setSellingBeforeBuy(e.target.checked)}
                            className="rounded accent-[#C5A880]"
                          />
                          <span>Selling before closing</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 1.4: DOWN PAYMENT */}
            {financialSubStep === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-stone-400">
                  Canadian rules mandate minimum down payments: 5% on the first $500k, 10% between $500k and $1M, and
                  20% on $1.5M+. 20%+ avoids CMHC mortgage default insurance premiums.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Total Liquid Funds Available</span>
                      <span className="text-[#C5A880] font-mono">${availableFunds.toLocaleString()}</span>
                    </label>
                    <input
                      type="number"
                      min={10000}
                      max={1000000}
                      step={5000}
                      value={availableFunds}
                      onChange={(e) => setAvailableFunds(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white font-mono text-sm"
                    />
                    <input
                      type="range"
                      min={25000}
                      max={400000}
                      step={5000}
                      value={availableFunds}
                      onChange={(e) => setAvailableFunds(Number(e.target.value))}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                      <span>Intended Down Payment Allocation</span>
                      <span className="text-[#C5A880] font-mono">${intendedDownPayment.toLocaleString()}</span>
                    </label>
                    <input
                      type="number"
                      min={10000}
                      max={availableFunds}
                      step={5000}
                      value={intendedDownPayment}
                      onChange={(e) => setIntendedDownPayment(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-white font-mono text-sm"
                    />
                    <input
                      type="range"
                      min={25000}
                      max={availableFunds || 200000}
                      step={5000}
                      value={intendedDownPayment}
                      onChange={(e) => setIntendedDownPayment(Number(e.target.value))}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Down Payment Source */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Primary Source of Down Payment</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      'Personal savings',
                      "RRSP/Home Buyers' Plan",
                      'Gift',
                      'Sale of existing property'
                    ].map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setDownPaymentSource(src as any)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          downPaymentSource === src
                            ? 'bg-[#C5A880]/15 border-[#C5A880] text-white font-bold'
                            : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-xs">{src}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* First-Time Homebuyer Checkbox */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="first-time-buyer-toggle"
                      checked={firstTimeHomebuyer}
                      onChange={(e) => setFirstTimeHomebuyer(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#C5A880] cursor-pointer"
                    />
                    <label htmlFor="first-time-buyer-toggle" className="text-xs font-semibold text-stone-200 cursor-pointer">
                      I am a First-Time Home Buyer in Canada
                    </label>
                  </div>
                  <span className="text-[10px] text-[#C5A880] font-mono uppercase bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/30">
                    FHSA + HBP + Land Transfer Rebates
                  </span>
                </div>
              </div>
            )}

            {/* 1.5: CREDIT PROFILE */}
            {financialSubStep === 5 && (
              <div className="space-y-6">
                <p className="text-sm text-stone-400">
                  A strong beacon score unlocks Canada’s best prime A-lender interest rates. We never perform hard credit
                  pulls or ask for sensitive SIN numbers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      category: 'Excellent',
                      range: '760+',
                      tier: 'Prime A-Lender Best Rates',
                      desc: 'Eligible for lowest 5-year fixed and variable bank pricing.'
                    },
                    {
                      category: 'Good',
                      range: '700 - 759',
                      tier: 'Standard Prime A-Lender',
                      desc: 'Full access to tier-1 Canadian chartered bank mortgages.'
                    },
                    {
                      category: 'Fair',
                      range: '640 - 699',
                      tier: 'Conditional Prime / B-Lender',
                      desc: 'May require minor rate premium or alternative documentation.'
                    },
                    {
                      category: 'Needs improvement',
                      range: 'Under 640',
                      tier: 'Alternative Lending / Co-Signer',
                      desc: 'Specialized financing or credit repair roadmap recommended.'
                    }
                  ].map((c) => (
                    <button
                      key={c.category}
                      type="button"
                      onClick={() => setCreditProfile(c.category as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        creditProfile === c.category
                          ? 'bg-[#C5A880]/15 border-[#C5A880] text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{c.category}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-[#C5A880]">
                          {c.range}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-stone-300">{c.tier}</div>
                      <div className="text-[11px] text-stone-400 mt-1">{c.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-[#0F2942]/30 border border-[#C5A880]/30 p-4 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div className="text-xs text-stone-300 leading-relaxed">
                    <strong>Fiduciary Privacy Guarantee:</strong> This self-assessment is an informational estimation tool.
                    Your financial inputs are kept private and do not affect your credit score.
                  </div>
                </div>
              </div>
            )}

            {/* Sub-step navigation footer for Stage 1 */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleFinancialBack}
                disabled={financialSubStep === 1}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinancialNext}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B89758] text-black font-extrabold flex items-center gap-2 text-xs shadow-md transition-all cursor-pointer"
              >
                <span>
                  {financialSubStep === 5
                    ? isSubmitting
                      ? 'Calculating...'
                      : 'Calculate Affordability →'
                    : 'Next Step'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: AFFORDABILITY RESULTS & TRANSPARENCY */}
        {/* ========================================================================= */}
        {journeyStage === 2 && activeAssessment && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880]">
                  Step 2: Affordability Results
                </span>
                <h3 className="text-2xl font-serif font-light text-white">
                  Your Estimated Purchase Power
                </h3>
              </div>
              <button
                onClick={() => setJourneyStage(1)}
                className="text-xs text-[#C5A880] hover:underline font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Edit Financial Profile</span>
              </button>
            </div>

            {!isAuthenticated || !isClient ? (
              /* Confidential Client Gate: Only shown to logged in clients after they calculate their buying range */
              <div className="bg-gradient-to-br from-[#16273b] to-[#0a121d] p-6 sm:p-8 rounded-3xl border border-[#C5A880]/50 text-center space-y-4 shadow-2xl my-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/15 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880]">
                    Confidential Client Calculation Ready
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    Sign In as Client to Reveal Your Buying Range & Property Indicators
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
                  Under RECO fiduciary regulations and brokerage policy, personalized buying power ranges and live property suitability indicators are shown exclusively to authenticated VIP clients after calculating their buying range.
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto flex items-center justify-center gap-3 text-stone-300 text-xs font-mono">
                  <span className="text-stone-400">Estimated Range:</span>
                  <span className="text-lg font-bold text-white tracking-widest blur-sm select-none">$720,000 – $910,000</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-bold">Client Only</span>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => openAuthModal({
                      role: 'CLIENT',
                      tab: 'login',
                      customTitle: 'Unlock Your Buying Range',
                      customMessage: 'Sign in or register your VIP client account to reveal your calculated buying range and activate live property suitability indicators.'
                    })}
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#C5A880] hover:bg-[#b09268] text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In / Register as Client to Unlock</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Highlighted Price Range Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#16273b] to-[#0d1622] p-5 rounded-2xl border border-[#C5A880]/40 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A880]">
                      Maximum Purchase Price
                    </span>
                    <div className="text-3xl sm:text-4xl font-serif font-bold text-white font-mono">
                      ${activeAssessment.estimatedPurchasePriceMax.toLocaleString()}
                    </div>
                    <p className="text-xs text-stone-300">
                      Based on maximum OSFI qualification limits (39% GDS / 44% TDS) at stress-test rate{' '}
                      <strong>{activeAssessment.effectiveStressRate.toFixed(2)}%</strong>.
                    </p>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Comfortable Purchase Range
                    </span>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 font-mono">
                      ${activeAssessment.estimatedPurchasePriceMin.toLocaleString()} – $
                      {activeAssessment.estimatedPurchasePriceMax.toLocaleString()}
                    </div>
                    <p className="text-xs text-stone-400">
                      Ensures healthy monthly reserves and flexibility for life changes, savings, and investments.
                    </p>
                  </div>
                </div>

                {/* Key Ratios and Monthly Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[11px] text-stone-400 block">Est. Max Mortgage</span>
                    <span className="text-lg font-bold text-white font-mono">
                      ${activeAssessment.estimatedMortgageMax.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">30-Year Amortization</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[11px] text-stone-400 block">Down Payment</span>
                    <span className="text-lg font-bold text-[#C5A880] font-mono">
                      ${activeAssessment.estimatedDownPayment.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {(
                        (activeAssessment.estimatedDownPayment / activeAssessment.estimatedPurchasePriceMax) *
                        100
                      ).toFixed(1)}
                      % of maximum price
                    </span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-[11px] text-stone-400 block">Est. Monthly Payment</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      ${activeAssessment.monthlyCarryingCostsEstimated.totalMonthlyMin.toLocaleString()} – $
                      {activeAssessment.monthlyCarryingCostsEstimated.totalMonthlyMax.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">Includes principal, tax & heat</span>
                  </div>
                </div>

                {/* Buy Smart, Save Big: Amit Sawhney Cash-Back Rebate */}
                {(() => {
                  const cb = calculateCashback(activeAssessment.estimatedPurchasePriceMax);
                  return cb.isEligiblePrice ? (
                    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#C5A880]/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#C5A880] text-black flex items-center justify-center shrink-0">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">
                            "Buy Smart, Save Big" Client Rebate
                          </div>
                          <div className="text-sm font-semibold text-white">
                            Up to {formatCurrency(cb.estimatedCashback)} Direct Cashback at Closing
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-stone-300 font-medium">
                        Applicable to both Pre-Con & Resale Representation
                      </span>
                    </div>
                  ) : null;
                })()}

                {/* OSFI B-20 Compliance Disclaimer */}
                <div className="p-3 bg-stone-900/80 border border-white/10 rounded-xl text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>{activeAssessment.disclaimer}</span>
                </div>
              </>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setJourneyStage(1)}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Financial Profile</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoToStage(3)}
                className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B89758] text-black font-extrabold flex items-center gap-2 text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Set Property Preferences →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: PROPERTY PREFERENCES */}
        {/* ========================================================================= */}
        {journeyStage === 3 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/10">
              <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880]">
                Step 3: Property Preferences
              </span>
              <h3 className="text-2xl font-serif font-light text-white mt-0.5">
                What type of home are you targeting?
              </h3>
              <p className="text-sm text-stone-400 mt-1">
                Refine your target property category, municipalities in Durham Region, bedrooms, and purchase timeline.
              </p>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Property Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  [
                    'Townhouse',
                    'Semi-detached',
                    'Detached',
                    'Condo',
                    'Preconstruction',
                    'Investment property'
                  ] as PropertyPlanningType[]
                ).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPropertyType(pt)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      propertyType === pt
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-white'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Home className={`w-4 h-4 mb-2 ${propertyType === pt ? 'text-[#C5A880]' : 'text-stone-500'}`} />
                    <div className="text-xs font-bold text-white">{pt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Municipalities in Durham & GTA */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Preferred Municipalities</label>
              <div className="flex flex-wrap gap-2">
                {['Whitby', 'Oshawa', 'Pickering', 'Ajax', 'Clarington', 'Bowmanville', 'Markham', 'Toronto'].map(
                  (city) => {
                    const isSelected = selectedCities.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCities(selectedCities.filter((c) => c !== city));
                          } else {
                            setSelectedCities([...selectedCities, city]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#C5A880] text-black border-[#C5A880] font-bold shadow-sm'
                            : 'bg-white/5 border-white/15 text-stone-400 hover:text-white'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Bedrooms & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-300">Minimum Bedrooms</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1+', '2+', '3+', '4+'].map((beds) => (
                    <button
                      key={beds}
                      type="button"
                      onClick={() => setBedroomsPreference(beds)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        bedroomsPreference === beds
                          ? 'bg-[#C5A880] text-black border-[#C5A880]'
                          : 'bg-white/5 border-white/10 text-stone-400'
                      }`}
                    >
                      {beds}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-300">Target Purchase Timeline</label>
                <select
                  value={targetTimeline}
                  onChange={(e) => setTargetTimeline(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:border-[#C5A880] outline-none"
                >
                  <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                  <option value="1-3 months">1 – 3 months</option>
                  <option value="3-6 months">3 – 6 months</option>
                  <option value="6-12 months">6 – 12 months</option>
                  <option value="Pre-construction (2-4 years)">Pre-construction (2027–2029 VIP)</option>
                </select>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setJourneyStage(2)}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Affordability</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await performAffordabilityCalculation();
                  handleGoToStage(4);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B89758] text-black font-extrabold flex items-center gap-2 text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Find Qualified Homes (Search) →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: SEARCH (MATCHED & AFFORDABLE PROPERTIES) */}
        {/* ========================================================================= */}
        {journeyStage === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880]">
                  Step 4: Search & Curated Matches
                </span>
                <h3 className="text-2xl font-serif font-light text-white mt-0.5">
                  Properties Within Your Buying Power
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Matched against your maximum purchase limit of{' '}
                  <strong className="text-[#C5A880]">
                    {isAuthenticated && isClient && activeAssessment?.estimatedPurchasePriceMax
                      ? `$${activeAssessment.estimatedPurchasePriceMax.toLocaleString()}`
                      : 'Client Buying Range'}
                  </strong>
                  .
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilterOnlyAffordable(true);
                    if (onClose) onClose();
                    if (onNavigateToProperties) {
                      onNavigateToProperties();
                    } else {
                      const el = document.getElementById('projects') || document.getElementById('resale-homes');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <SearchIcon className="w-3.5 h-3.5" />
                  <span>Browse All in Catalog</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreconOrResale('both')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  preconOrResale === 'both' ? 'bg-[#C5A880] text-black font-extrabold' : 'bg-white/5 text-stone-400'
                }`}
              >
                All Matches ({qualifiedProperties.totalCount})
              </button>
              <button
                onClick={() => setPreconOrResale('precon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  preconOrResale === 'precon' ? 'bg-[#C5A880] text-black font-extrabold' : 'bg-white/5 text-stone-400'
                }`}
              >
                Pre-Construction ({qualifiedProperties.precon.length})
              </button>
              <button
                onClick={() => setPreconOrResale('resale')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  preconOrResale === 'resale' ? 'bg-[#C5A880] text-black font-extrabold' : 'bg-white/5 text-stone-400'
                }`}
              >
                Resale Homes ({qualifiedProperties.resale.length})
              </button>
            </div>

            {/* Matched Property Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(preconOrResale === 'both' || preconOrResale === 'precon') &&
                qualifiedProperties.precon.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/5 border border-white/10 hover:border-[#C5A880]/50 rounded-2xl p-4 space-y-3 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880]">
                          VIP Pre-Construction
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#C5A880] transition-colors">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#C5A880]" />
                          <span>
                            {p.location.city}, {p.location.region}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white font-mono">{p.priceRange.display}</span>
                    </div>

                    <AffordabilityIndicatorBadge propertyPrice={p.priceRange.min} />

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-stone-400">{p.builder}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowingSelectedPropertyId(p.id);
                          handleGoToStage(5);
                        }}
                        className="text-[#C5A880] font-bold hover:underline cursor-pointer"
                      >
                        Book Showing →
                      </button>
                    </div>
                  </div>
                ))}

              {(preconOrResale === 'both' || preconOrResale === 'resale') &&
                qualifiedProperties.resale.slice(0, 2).map((r) => (
                  <div
                    key={r.id}
                    className="bg-white/5 border border-white/10 hover:border-[#C5A880]/50 rounded-2xl p-4 space-y-3 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">
                          Resale MLS® Ready
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#C5A880] transition-colors">
                          {r.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#C5A880]" />
                          <span>
                            {r.city} • MLS® {r.mlsNumber}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white font-mono">{r.priceDisplay}</span>
                    </div>

                    <AffordabilityIndicatorBadge propertyPrice={r.price} />

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-stone-400">
                        {r.bedrooms} Beds • {r.bathrooms} Baths
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowingSelectedPropertyId(r.id);
                          handleGoToStage(5);
                        }}
                        className="text-[#C5A880] font-bold hover:underline cursor-pointer"
                      >
                        Book Showing →
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setJourneyStage(3)}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Preferences</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoToStage(5)}
                className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B89758] text-black font-extrabold flex items-center gap-2 text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Schedule Showing (Stage 5) →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: SHOWING & PRESENTATION CENTRE TOUR */}
        {/* ========================================================================= */}
        {journeyStage === 5 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/10">
              <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880]">
                Step 5: Showing & VIP Tour
              </span>
              <h3 className="text-2xl font-serif font-light text-white mt-0.5">
                Book a Private Viewing with Amit Sawhney
              </h3>
              <p className="text-sm text-stone-400 mt-1">
                Fiduciary buyer representation. Private walkthroughs, builder access, and unbiased valuation analysis.
              </p>
            </div>

            {showingSuccess ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Showing Tour Requested!</h4>
                <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                  Amit Sawhney will coordinate private access, confirm builder hours/MLS lockbox appointments, and
                  contact you directly at <strong className="text-white">{phone}</strong>.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleGoToStage(6)}
                    className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Proceed to Pre-Offer Preparation (Step 6) →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-300">Preferred Tour Date</label>
                    <input
                      type="date"
                      value={showingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setShowingDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/60 border border-white/20 rounded-xl text-white text-xs font-mono focus:border-[#C5A880] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-300">Preferred Time Window</label>
                    <select
                      value={showingTimeSlot}
                      onChange={(e) => setShowingTimeSlot(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/60 border border-white/20 rounded-xl text-white text-xs focus:border-[#C5A880] outline-none"
                    >
                      <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                      <option value="Evening (5:00 PM - 7:30 PM)">Evening (5:00 PM - 7:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(647) 000-0000"
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#0F2942]/30 border border-[#C5A880]/30 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                  <div className="text-xs text-stone-300 leading-relaxed">
                    <strong>100% Free Buyer Service:</strong> Commission is paid by the seller or builder. Amit Sawhney
                    protects your rights, negotiates incentives, and delivers your cash-back rebate.
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmShowing}
                    className="px-6 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Showing Request</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setJourneyStage(4)}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Search Matches</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoToStage(6)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 text-xs transition-all cursor-pointer"
              >
                <span>Proceed to Offer Preparation (Stage 6) →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 6: OFFER PREPARATION & REALTOR REVIEW */}
        {/* ========================================================================= */}
        {journeyStage === 6 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/10">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400">
                Step 6: Offer Preparation
              </span>
              <h3 className="text-2xl font-serif font-light text-white mt-0.5">
                Ontario Agreement of Purchase and Sale (APS) Draft
              </h3>
              <p className="text-sm text-stone-400 mt-1">
                Fiduciary OREA contract review. Structuring protective clauses (financing, inspection, status
                certificate) before binding commitments.
              </p>
            </div>

            {offerSubmitted ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Offer Draft Transmitted to Amit Sawhney</h4>
                <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                  Your offer profile and conditions have been added to Amit Sawhney’s fiduciary review queue. You will
                  receive a call or formal OREA APS draft review via email before any paperwork is presented to the
                  seller.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Done & Return to Properties
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Offer Price & Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs text-stone-300 block">Proposed Offer Price ($)</label>
                    <input
                      type="number"
                      step={5000}
                      value={offerProposedPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setOfferProposedPrice(val);
                        setOfferDepositAmount(Math.round(val * 0.05));
                      }}
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                    />
                    <span className="text-[10px] text-stone-400">
                      Estimated qualification ceiling: ${activeAssessment?.estimatedPurchasePriceMax.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-xs text-stone-300 block">Initial Deposit (Standard 5%)</label>
                    <input
                      type="number"
                      step={2500}
                      value={offerDepositAmount}
                      onChange={(e) => setOfferDepositAmount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm"
                    />
                    <span className="text-[10px] text-stone-400">
                      Payable by bank draft upon acceptance to listing brokerage in trust
                    </span>
                  </div>
                </div>

                {/* Protective Conditions Checklist */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Recommended Buyer Protection Clauses (OREA Schedule A)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer p-2 rounded-xl hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={offerIncludeFinancing}
                        onChange={(e) => setOfferIncludeFinancing(e.target.checked)}
                        className="rounded accent-[#C5A880] w-4 h-4"
                      />
                      <div>
                        <strong className="text-white block">5-Day Financing Condition</strong>
                        <span className="text-[10px] text-stone-400">Full formal mortgage approval protection</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer p-2 rounded-xl hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={offerIncludeInspection}
                        onChange={(e) => setOfferIncludeInspection(e.target.checked)}
                        className="rounded accent-[#C5A880] w-4 h-4"
                      />
                      <div>
                        <strong className="text-white block">Home Inspection Condition</strong>
                        <span className="text-[10px] text-stone-400">Licensed Ontario inspector review</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer p-2 rounded-xl hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={offerIncludeStatusCert}
                        onChange={(e) => setOfferIncludeStatusCert(e.target.checked)}
                        className="rounded accent-[#C5A880] w-4 h-4"
                      />
                      <div>
                        <strong className="text-white block">Status Certificate Review</strong>
                        <span className="text-[10px] text-stone-400">Lawyer condo reserve fund verification</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer p-2 rounded-xl hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={offerIncludeLawyerReview}
                        onChange={(e) => setOfferIncludeLawyerReview(e.target.checked)}
                        className="rounded accent-[#C5A880] w-4 h-4"
                      />
                      <div>
                        <strong className="text-white block">10-Day Cooling-Off / Lawyer</strong>
                        <span className="text-[10px] text-stone-400">Statutory pre-construction rescission</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Purchaser Legal Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(647) 000-0000"
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitOffer}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Submit Offer Draft for REALTOR® Review</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setJourneyStage(5)}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Showing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                }}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-stone-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Close Wizard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
      {content}
    </div>
  );
};
