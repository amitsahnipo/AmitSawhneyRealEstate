import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BuyerFinancialProfile,
  AffordabilityAssessment,
  MortgageQualificationRules,
  PropertyAffordabilityAssessment
} from '../types';
import {
  DEFAULT_MORTGAGE_RULES,
  calculateAffordability,
  evaluatePropertyAffordability,
  loadSavedProfile,
  saveProfileLocally,
  loadSavedAssessment,
  saveAssessmentLocally,
  ASSESSMENT_STORAGE_KEY,
  PROFILE_STORAGE_KEY
} from '../services/affordabilityService';
import { useAuth } from './AuthContext';

export interface PropertyTarget {
  id: string;
  title: string;
  price: number;
  address: string;
  propertyType?: string;
  isPrecon?: boolean;
}

interface AffordabilityContextType {
  buyerProfile: BuyerFinancialProfile | null;
  assessment: AffordabilityAssessment | null;
  rules: MortgageQualificationRules;
  isQualified: boolean;
  evaluateProperty: (price: number) => PropertyAffordabilityAssessment;
  saveProfile: (profile: BuyerFinancialProfile) => Promise<AffordabilityAssessment>;
  resetProfile: () => void;
  // Wizard Modal
  wizardOpen: boolean;
  openWizard: (initialStep?: number) => void;
  closeWizard: () => void;
  // 20% Rule Assistance Modal
  assistanceModalOpen: boolean;
  assistanceProperty: PropertyTarget | null;
  openAssistanceModal: (property: PropertyTarget) => void;
  closeAssistanceModal: () => void;
  // Showing Booking Modal
  showingModalOpen: boolean;
  showingProperty: PropertyTarget | null;
  showingIsAssistance: boolean;
  openShowingModal: (property: PropertyTarget, isAssistance?: boolean) => void;
  closeShowingModal: () => void;
  requestShowing: (target: {
    targetId: string;
    targetTitle: string;
    targetPrice: number;
    targetAddress: string;
    targetType?: string;
  }) => void;
  // Pre-Offer Qualification & Preparation Modal
  offerModalOpen: boolean;
  offerProperty: PropertyTarget | null;
  openOfferModal: (property: PropertyTarget) => void;
  closeOfferModal: () => void;
  openOfferPreparation: (target: {
    targetId: string;
    targetTitle: string;
    targetPrice: number;
    targetAddress: string;
    targetType?: string;
  }) => void;
  // Rules Admin Modal
  rulesAdminOpen: boolean;
  setRulesAdminOpen: (open: boolean) => void;
  updateRules: (updates: Partial<MortgageQualificationRules>) => Promise<void>;
  // Filter toggle: "Show Me Properties I Can Afford"
  filterOnlyAffordable: boolean;
  setFilterOnlyAffordable: (val: boolean | ((prev: boolean) => boolean)) => void;
  // Journey tracking
  activeJourneyStage: 1 | 2 | 3 | 4 | 5 | 6;
  setActiveJourneyStage: (stage: 1 | 2 | 3 | 4 | 5 | 6) => void;
}

const AffordabilityContext = createContext<AffordabilityContextType | undefined>(undefined);

export const AffordabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isClient } = useAuth();

  const [buyerProfile, setBuyerProfile] = useState<BuyerFinancialProfile | null>(null);
  const [assessment, setAssessment] = useState<AffordabilityAssessment | null>(null);
  const [rules, setRules] = useState<MortgageQualificationRules>(DEFAULT_MORTGAGE_RULES);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
  const [assistanceProperty, setAssistanceProperty] = useState<PropertyTarget | null>(null);
  const [showingModalOpen, setShowingModalOpen] = useState(false);
  const [showingProperty, setShowingProperty] = useState<PropertyTarget | null>(null);
  const [showingIsAssistance, setShowingIsAssistance] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerProperty, setOfferProperty] = useState<PropertyTarget | null>(null);
  const [rulesAdminOpen, setRulesAdminOpen] = useState(false);
  const [filterOnlyAffordable, setFilterOnlyAffordable] = useState(false);
  const [activeJourneyStage, setActiveJourneyStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Sync client profile/assessment when auth state or client changes
  useEffect(() => {
    if (isAuthenticated && isClient && user) {
      let clientAssessment: AffordabilityAssessment | null = null;
      let clientProfile: BuyerFinancialProfile | null = null;

      try {
        const clientAssKey = `truecondo_assessment_${user.id}`;
        const clientProfKey = `truecondo_profile_${user.id}`;
        const rawAss = localStorage.getItem(clientAssKey) || (user.id === 'user-client-1' ? localStorage.getItem(ASSESSMENT_STORAGE_KEY) : null);
        if (rawAss) clientAssessment = JSON.parse(rawAss);

        const rawProf = localStorage.getItem(clientProfKey) || (user.id === 'user-client-1' ? localStorage.getItem(PROFILE_STORAGE_KEY) : null);
        if (rawProf) clientProfile = JSON.parse(rawProf);
      } catch {}

      // If client has target budget saved in account, reconstruct assessment if not in local storage
      if (!clientAssessment && user.targetBudgetMax && user.targetBudgetMax > 0) {
        const minPrice = user.targetBudgetMin || Math.round(user.targetBudgetMax * 0.8);
        const dp = user.intendedDownPayment || Math.round(user.targetBudgetMax * 0.15);
        clientAssessment = {
          buyerId: user.id,
          estimatedMortgageMin: Math.round((user.targetBudgetMax - dp) * 0.8),
          estimatedMortgageMax: user.preApprovalAmount || (user.targetBudgetMax - dp),
          estimatedPurchasePriceMin: minPrice,
          estimatedPurchasePriceMax: user.targetBudgetMax,
          estimatedDownPayment: dp,
          effectiveStressRate: 6.69,
          contractRate: 4.69,
          qualifyingGds: 0.32,
          qualifyingTds: 0.38,
          monthlyCarryingCostsEstimated: {
            mortgagePaymentMin: 2900,
            mortgagePaymentMax: 3200,
            propertyTax: 450,
            heating: 125,
            condoFees: 350,
            totalMonthlyMin: 3800,
            totalMonthlyMax: 4125
          },
          calculationDate: new Date().toISOString(),
          ruleVersion: '1.0',
          disclaimer: 'Calculated client profile'
        };
      }

      setAssessment(clientAssessment);
      setBuyerProfile(clientProfile);
    } else {
      // Unauthenticated visitor, guest, or agent: do NOT show client buying range or indicators
      setAssessment(null);
      setBuyerProfile(null);
      setFilterOnlyAffordable(false);
      setActiveJourneyStage(1);
    }
  }, [isAuthenticated, isClient, user?.id]);

  // Sync rules from server on load
  useEffect(() => {
    fetch('/api/affordability/rules')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rules) {
          setRules(data.rules);
          // Recalculate if profile exists
          if (buyerProfile && isAuthenticated && isClient) {
            const freshAssessment = calculateAffordability(buyerProfile, data.rules);
            setAssessment(freshAssessment);
            saveAssessmentLocally(freshAssessment);
          }
        }
      })
      .catch(err => console.log('Using default local mortgage rules', err));
  }, [isAuthenticated, isClient]);

  // Update active journey stage based on user progress
  useEffect(() => {
    if (assessment) {
      if (activeJourneyStage === 1) {
        setActiveJourneyStage(2);
      }
    }
  }, [assessment]);

  const evaluateProperty = useCallback(
    (price: number): PropertyAffordabilityAssessment => {
      const upper = assessment ? assessment.estimatedPurchasePriceMax : 0;
      const lower = assessment ? assessment.estimatedPurchasePriceMin : 0;
      return evaluatePropertyAffordability(price, upper, lower);
    },
    [assessment]
  );

  const saveProfile = async (profile: BuyerFinancialProfile): Promise<AffordabilityAssessment> => {
    setBuyerProfile(profile);
    saveProfileLocally(profile);

    const calcResult = calculateAffordability(profile, rules);
    setAssessment(calcResult);
    saveAssessmentLocally(calcResult);

    if (user?.id) {
      try {
        localStorage.setItem(`truecondo_assessment_${user.id}`, JSON.stringify(calcResult));
        localStorage.setItem(`truecondo_profile_${user.id}`, JSON.stringify(profile));
      } catch {}
    }

    setActiveJourneyStage(3); // Progress to Property Preferences / Search

    // Sync with backend asynchronously
    fetch('/api/affordability/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, userId: user?.id, email: user?.email })
    }).catch(err => console.log('Offline profile sync skipped', err));

    return calcResult;
  };

  const resetProfile = () => {
    setBuyerProfile(null);
    setAssessment(null);
    setFilterOnlyAffordable(false);
    setActiveJourneyStage(1);
    try {
      localStorage.removeItem('truecondo_buyer_financial_profile');
      localStorage.removeItem('truecondo_affordability_assessment');
      if (user?.id) {
        localStorage.removeItem(`truecondo_profile_${user.id}`);
        localStorage.removeItem(`truecondo_assessment_${user.id}`);
      }
    } catch {}
  };

  const openWizard = (_initialStep?: number) => {
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  const openAssistanceModal = (property: PropertyTarget) => {
    setAssistanceProperty(property);
    setAssistanceModalOpen(true);
  };

  const closeAssistanceModal = () => {
    setAssistanceModalOpen(false);
    setAssistanceProperty(null);
  };

  const openShowingModal = (property: PropertyTarget, isAssistance = false) => {
    setShowingProperty(property);
    setShowingIsAssistance(isAssistance);
    setShowingModalOpen(true);
    setActiveJourneyStage(5);
  };

  const closeShowingModal = () => {
    setShowingModalOpen(false);
    setShowingProperty(null);
  };

  const openOfferModal = (property: PropertyTarget) => {
    setOfferProperty(property);
    setOfferModalOpen(true);
    setActiveJourneyStage(6);
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setOfferProperty(null);
  };

  const requestShowing = (target: {
    targetId: string;
    targetTitle: string;
    targetPrice: number;
    targetAddress: string;
    targetType?: string;
  }) => {
    const propTarget: PropertyTarget = {
      id: target.targetId,
      title: target.targetTitle,
      price: target.targetPrice,
      address: target.targetAddress,
      propertyType: target.targetType,
      isPrecon: target.targetType === 'Pre-Construction'
    };

    // 20% Rule: If buyer is qualified and target price > 120% of their estimated upper limit,
    // intercept with the Financing Assistance Workflow Modal
    const upperLimit = assessment?.estimatedPurchasePriceMax || 0;
    if (upperLimit > 0 && target.targetPrice > upperLimit * 1.2) {
      openAssistanceModal(propTarget);
    } else {
      openShowingModal(propTarget, false);
    }
  };

  const openOfferPreparation = (target: {
    targetId: string;
    targetTitle: string;
    targetPrice: number;
    targetAddress: string;
    targetType?: string;
  }) => {
    const propTarget: PropertyTarget = {
      id: target.targetId,
      title: target.targetTitle,
      price: target.targetPrice,
      address: target.targetAddress,
      propertyType: target.targetType,
      isPrecon: target.targetType === 'Pre-Construction'
    };
    openOfferModal(propTarget);
  };

  const updateRules = async (updates: Partial<MortgageQualificationRules>) => {
    try {
      const res = await fetch('/api/affordability/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.rules) {
        setRules(data.rules);
        if (buyerProfile) {
          const fresh = calculateAffordability(buyerProfile, data.rules);
          setAssessment(fresh);
          saveAssessmentLocally(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to update rules on server, applying local fallback', err);
      const localUpdated = { ...rules, ...updates };
      setRules(localUpdated);
      if (buyerProfile) {
        const fresh = calculateAffordability(buyerProfile, localUpdated);
        setAssessment(fresh);
        saveAssessmentLocally(fresh);
      }
    }
  };

  const value: AffordabilityContextType = {
    buyerProfile,
    assessment,
    rules,
    isQualified: Boolean(isAuthenticated && isClient && assessment && assessment.estimatedPurchasePriceMax > 0),
    evaluateProperty,
    saveProfile,
    resetProfile,
    wizardOpen,
    openWizard,
    closeWizard,
    assistanceModalOpen,
    assistanceProperty,
    openAssistanceModal,
    closeAssistanceModal,
    showingModalOpen,
    showingProperty,
    showingIsAssistance,
    openShowingModal,
    closeShowingModal,
    requestShowing,
    offerModalOpen,
    offerProperty,
    openOfferModal,
    closeOfferModal,
    openOfferPreparation,
    rulesAdminOpen,
    setRulesAdminOpen,
    updateRules,
    filterOnlyAffordable,
    setFilterOnlyAffordable,
    activeJourneyStage,
    setActiveJourneyStage
  };

  return <AffordabilityContext.Provider value={value}>{children}</AffordabilityContext.Provider>;
};

export const useAffordability = (): AffordabilityContextType => {
  const ctx = useContext(AffordabilityContext);
  if (!ctx) {
    throw new Error('useAffordability must be used within an AffordabilityProvider');
  }
  return ctx;
};
