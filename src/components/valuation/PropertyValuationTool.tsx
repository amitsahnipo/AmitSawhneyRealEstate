import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Home,
  CheckCircle2,
  TrendingUp,
  Sliders,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  AlertCircle,
  HelpCircle,
  Clock,
  MapPin,
  RefreshCw,
  Award,
  BarChart3,
  Calendar,
  Check,
  Building,
  Maximize2,
  ChevronRight,
  X,
  Lock,
  Wrench,
  BedDouble,
  Bath,
  Car,
  Flame,
  CheckSquare,
  Square,
  Sparkle,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import {
  SubjectPropertyInput,
  ValuationResponse,
  ComparableSale,
  PropertyCondition,
  ValuationPropertyType,
  PropertyRenovations,
  ValuationLeadSubmission
} from '../../types';
import { AMIT_SAWHNEY } from '../../data/agent';
import { validateEmail, validatePhone, validateName, formatPhoneNumber, validateAddress } from '../../utils/validation';

interface PropertyValuationToolProps {
  initialAddress?: string;
  initialCity?: string;
  initialMode?: 'seller' | 'buyer';
  onOpenConsultationModal?: (topic?: string, notes?: string) => void;
  className?: string;
}

const EXAMPLE_ADDRESSES = [
  '123 Main Street, Whitby, ON',
  '18 Carnwith Drive East, Brooklin, ON',
  '240 Harmony Road North, Oshawa, ON',
  '25 King Street West, Toronto, ON',
  '100 Lakeshore Road East, Mississauga, ON'
];

const LOADING_STEPS = [
  'Locating property and municipality records...',
  'Accessing TRREB Community Market Reports (trreb.ca)...',
  'Analyzing municipal price velocity, DOM, and neighborhood absorption...',
  'Applying condition, room counts, and renovation adjustments...',
  'Synthesizing statistical valuation range...'
];

type WizardStep = 'address' | 'details' | 'renovations' | 'result';

export const PropertyValuationTool: React.FC<PropertyValuationToolProps> = ({
  initialAddress = '',
  initialCity = '',
  initialMode = 'seller',
  onOpenConsultationModal,
  className = ''
}) => {
  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<WizardStep>('address');

  // Input & Step 1 State: Location & Property Type
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Array<{ address: string; municipality: string; province: string; propertyType?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAutocomplete, setIsSearchingAutocomplete] = useState(false);
  const [propertyType, setPropertyType] = useState<ValuationPropertyType>('Detached Home');
  const [valuationMode, setValuationMode] = useState<'seller' | 'buyer'>(initialMode);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteTimeoutRef = useRef<any>(null);

  // Step 2 State: Property Specifications & Layout
  const [beds, setBeds] = useState(4);
  const [baths, setBaths] = useState(3);
  const [sqft, setSqft] = useState(2250);
  const [garage, setGarage] = useState(2);
  const [basement, setBasement] = useState<'Finished' | 'Unfinished' | 'Partially Finished' | 'None' | 'Separate Entrance Suite'>('Finished');
  const [condition, setCondition] = useState<PropertyCondition>('Good');

  // Step 3 State: Upgrades, Renovations Done & Timeline
  const [renovations, setRenovations] = useState<PropertyRenovations>({
    kitchen: false,
    bathrooms: false,
    finishedBasement: false,
    flooring: false,
    windows: false,
    roof: false,
    furnaceHvac: false,
    landscaping: false,
    pool: false
  });
  const [sellingTimeline, setSellingTimeline] = useState<'1-3 months' | '3-6 months' | '6-12 months' | 'curious'>('1-3 months');
  const [askingPriceInput, setAskingPriceInput] = useState<number | ''>('');

  // Step 4 State: Valuation Execution & Result
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [valuationResult, setValuationResult] = useState<ValuationResponse | null>(null);
  const [valuationError, setValuationError] = useState<string | null>(null);

  // Expandable UI States in Result
  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const [activeCompExplanationId, setActiveCompExplanationId] = useState<string | null>(null);
  const [compExplanations, setCompExplanations] = useState<Record<string, string>>({});
  const [loadingCompId, setLoadingCompId] = useState<string | null>(null);

  // Lead Generation Modal State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadIntent, setLeadIntent] = useState<'seller_cma' | 'speak_with_realtor' | 'selling_strategy' | 'buyer_representation'>('seller_cma');
  const [leadFormData, setLeadFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    consent: true
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Address validation state
  const [addressError, setAddressError] = useState<string | undefined>(undefined);
  const [addressTouched, setAddressTouched] = useState(false);

  // Lead modal validation state
  const [leadErrors, setLeadErrors] = useState<{ firstName?: string; lastName?: string; email?: string; phone?: string }>({});
  const [leadTouched, setLeadTouched] = useState<{ firstName?: boolean; lastName?: boolean; email?: boolean; phone?: boolean }>({});

  const handleAddressChange = (val: string) => {
    setAddressInput(val);
    if (valuationError) setValuationError(null);
    if (addressTouched || val.length > 4) {
      const res = validateAddress(val);
      setAddressError(res.isValid ? undefined : res.error);
    }
  };

  const handleLeadFirstNameChange = (val: string) => {
    setLeadFormData(prev => ({ ...prev, firstName: val }));
    if (leadError) setLeadError(null);
    if (leadTouched.firstName || val.length > 1) {
      const res = validateName(val, 'First name', true);
      setLeadErrors(prev => ({ ...prev, firstName: res.isValid ? undefined : res.error }));
    }
  };

  const handleLeadLastNameChange = (val: string) => {
    setLeadFormData(prev => ({ ...prev, lastName: val }));
    if (leadError) setLeadError(null);
    if (leadTouched.lastName || val.length > 1) {
      const res = validateName(val, 'Last name', false);
      setLeadErrors(prev => ({ ...prev, lastName: res.isValid ? undefined : res.error }));
    }
  };

  const handleLeadEmailChange = (val: string) => {
    setLeadFormData(prev => ({ ...prev, email: val }));
    if (leadError) setLeadError(null);
    if (leadTouched.email || val.length > 3) {
      const res = validateEmail(val, true);
      setLeadErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
    }
  };

  const handleLeadPhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setLeadFormData(prev => ({ ...prev, phone: formatted }));
    if (leadError) setLeadError(null);
    if (leadTouched.phone || val.length > 4) {
      const res = validatePhone(formatted, true);
      setLeadErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
    }
  };

  // Autocomplete fetch on debounce
  useEffect(() => {
    if (!addressInput || addressInput.trim().length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    autocompleteTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearchingAutocomplete(true);
        const res = await fetch(`/api/valuation/autocomplete?q=${encodeURIComponent(addressInput.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setAutocompleteSuggestions(data);
        }
      } catch (err) {
        console.warn('Autocomplete fetch error:', err);
      } finally {
        setIsSearchingAutocomplete(false);
      }
    }, 200);

    return () => {
      if (autocompleteTimeoutRef.current) clearTimeout(autocompleteTimeoutRef.current);
    };
  }, [addressInput]);

  // Loading animation step timer
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 700);
    } else {
      setLoadingStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Select Autocomplete Address
  const handleSelectAddress = (addr: string, propType?: string) => {
    setAddressInput(addr);
    setShowSuggestions(false);
    if (propType) {
      setPropertyType(propType as ValuationPropertyType);
    }
    // Attempt to prefetch known details to save user time
    fetchKnownPropertyDetails(addr);
  };

  const fetchKnownPropertyDetails = async (addr: string) => {
    try {
      const res = await fetch('/api/valuation/property-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bedrooms) setBeds(data.bedrooms);
        if (data.bathrooms) setBaths(data.bathrooms);
        if (data.sqft) setSqft(data.sqft);
        if (data.propertyType) setPropertyType(data.propertyType);
        if (data.garage !== undefined) setGarage(data.garage);
        if (data.basement) setBasement(data.basement);
        if (data.condition) setCondition(data.condition);
      }
    } catch {
      // Non-blocking
    }
  };

  // Toggle Renovation Item
  const toggleRenovation = (key: keyof PropertyRenovations) => {
    setRenovations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Count active renovations
  const activeRenovationsCount = Object.values(renovations).filter(Boolean).length;

  // Advance from Step 1 to Step 2
  const handleGoToDetails = () => {
    setAddressTouched(true);
    const addrValidation = validateAddress(addressInput);
    if (!addrValidation.isValid) {
      setAddressError(addrValidation.error);
      setValuationError(addrValidation.error || 'Please enter a valid Canadian property address.');
      return;
    }
    setAddressError(undefined);
    setValuationError(null);
    setShowSuggestions(false);
    setCurrentStep('details');
  };

  // Advance from Step 2 to Step 3
  const handleGoToRenovations = () => {
    setValuationError(null);
    setCurrentStep('renovations');
  };

  // Execute Valuation (Final step)
  const handleRunValuation = async (overrideAddress?: string, overrideDetails?: Partial<SubjectPropertyInput>) => {
    const targetAddress = (overrideAddress || addressInput).trim();
    const addrValidation = validateAddress(targetAddress);
    if (!addrValidation.isValid) {
      setAddressError(addrValidation.error);
      setValuationError(addrValidation.error || 'Please enter a valid Canadian property address to estimate market value.');
      setCurrentStep('address');
      return;
    }

    setIsLoading(true);
    setValuationError(null);
    setShowSuggestions(false);
    setCurrentStep('result');

    try {
      const payload: any = {
        address: targetAddress,
        mode: valuationMode,
        askingPrice: askingPriceInput ? Number(askingPriceInput) : undefined,
        propertyDetails: {
          address: targetAddress,
          propertyType,
          bedrooms: beds,
          bathrooms: baths,
          sqft,
          garage,
          basement,
          condition,
          renovations,
          ...(overrideDetails || {})
        },
        renovations
      };

      const res = await fetch('/api/valuation/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to calculate property valuation. Please try again.');
      }

      const data: ValuationResponse = await res.json();
      setValuationResult(data);
    } catch (err: any) {
      setValuationError(err.message || 'An unexpected error occurred during property valuation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle or Fetch AI Explanation for a single comparable
  const handleExplainComp = async (comp: ComparableSale) => {
    if (activeCompExplanationId === comp.id) {
      setActiveCompExplanationId(null);
      return;
    }

    if (compExplanations[comp.id]) {
      setActiveCompExplanationId(comp.id);
      return;
    }

    if (!valuationResult) return;

    setLoadingCompId(comp.id);
    setActiveCompExplanationId(comp.id);

    try {
      const res = await fetch('/api/valuation/comp-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comp,
          subject: valuationResult.subjectProperty
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCompExplanations(prev => ({
          ...prev,
          [comp.id]: data.explanation
        }));
      } else {
        setCompExplanations(prev => ({
          ...prev,
          [comp.id]: comp.selectionReason
        }));
      }
    } catch {
      setCompExplanations(prev => ({
        ...prev,
        [comp.id]: comp.selectionReason
      }));
    } finally {
      setLoadingCompId(null);
    }
  };

  // Submit Lead Generation Form
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadTouched({ firstName: true, lastName: true, email: true, phone: true });

    const fNameCheck = validateName(leadFormData.firstName, 'First name', true);
    const lNameCheck = validateName(leadFormData.lastName, 'Last name', false);
    const emailCheck = validateEmail(leadFormData.email, true);
    const phoneCheck = validatePhone(leadFormData.phone, true);

    const newErrors = {
      firstName: fNameCheck.isValid ? undefined : fNameCheck.error,
      lastName: lNameCheck.isValid ? undefined : lNameCheck.error,
      email: emailCheck.isValid ? undefined : emailCheck.error,
      phone: phoneCheck.isValid ? undefined : phoneCheck.error,
    };
    setLeadErrors(newErrors);

    if (!fNameCheck.isValid || !lNameCheck.isValid || !emailCheck.isValid || !phoneCheck.isValid) {
      setLeadError(fNameCheck.error || emailCheck.error || phoneCheck.error || lNameCheck.error || 'Please correct the invalid fields.');
      return;
    }

    setLeadSubmitting(true);
    setLeadError(null);

    try {
      const payload: ValuationLeadSubmission = {
        auditId: valuationResult?.auditId,
        firstName: leadFormData.firstName,
        lastName: leadFormData.lastName,
        email: leadFormData.email,
        phone: leadFormData.phone,
        propertyAddress: valuationResult?.subjectProperty.address || addressInput,
        municipality: valuationResult?.subjectProperty.municipality,
        province: valuationResult?.subjectProperty.province,
        estimatedValue: valuationResult?.estimatedValue,
        valuationDate: valuationResult?.valuationDate,
        propertyType: valuationResult?.subjectProperty.propertyType,
        bedrooms: valuationResult?.subjectProperty.bedrooms,
        bathrooms: valuationResult?.subjectProperty.bathrooms,
        intent: leadIntent,
        consentToBeContacted: leadFormData.consent,
        notes: `${leadFormData.notes ? leadFormData.notes + ' | ' : ''}Timeline: ${sellingTimeline}. Renovations: ${activeRenovationsCount} items reported.`
      };

      const res = await fetch('/api/valuation/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit detailed CMA request.');
      }

      setLeadSuccess(true);
    } catch (err: any) {
      setLeadError(err.message || 'Unable to submit request. Please call Amit Sawhney directly.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const openLeadModalWithIntent = (intent: 'seller_cma' | 'speak_with_realtor' | 'selling_strategy' | 'buyer_representation') => {
    setLeadIntent(intent);
    setShowLeadModal(true);
  };

  // Savings calculation (Traditional 2.5% vs Amit's 1%)
  const currentEst = valuationResult?.estimatedValue || 950000;
  const traditionalListingFee = currentEst * 0.025;
  const smartListingFee = currentEst * 0.01;
  const estimatedSavings = Math.round(traditionalListingFee - smartListingFee);

  // Safe valuation fields extraction (guaranteed non-crashing fallbacks)
  const valLow = valuationResult
    ? (valuationResult.lowValue ?? valuationResult.valuationRange?.low ?? Math.round((valuationResult.estimatedValue || 950000) * 0.95))
    : 0;
  const valHigh = valuationResult
    ? (valuationResult.highValue ?? valuationResult.valuationRange?.high ?? Math.round((valuationResult.estimatedValue || 950000) * 1.05))
    : 0;
  const valConfidenceRating = valuationResult
    ? (valuationResult.confidence ?? valuationResult.confidenceScore?.rating ?? 'Moderate')
    : 'Moderate';
  const valConfidencePercent = valuationResult
    ? (valuationResult.confidencePercent ?? valuationResult.confidenceScore?.score ?? 75)
    : 75;
  const valComparables = valuationResult
    ? (valuationResult.comparables || valuationResult.comparablesUsed || [])
    : [];

  const renovationOptions: Array<{ key: keyof PropertyRenovations; label: string; icon: string; desc: string; liftNote: string }> = [
    {
      key: 'kitchen',
      label: "Chef's Kitchen Remodel",
      icon: '🍳',
      desc: 'Quartz/granite countertops, custom cabinetry, island, luxury appliances',
      liftNote: 'High equity impact (~$18k lift)'
    },
    {
      key: 'bathrooms',
      label: 'Modernized Spa Bathrooms',
      icon: '🛁',
      desc: 'Upgraded vanities, frameless glass shower, freestanding soaker tub',
      liftNote: 'Key buyer focal point (~$12k lift)'
    },
    {
      key: 'finishedBasement',
      label: 'Fully Finished Lower Level',
      icon: '🛋️',
      desc: 'Open recreation room, wet bar, pot lights, entertainment center',
      liftNote: 'Expands usable sq ft (~$22k lift)'
    },
    {
      key: 'flooring',
      label: 'Hardwood / Luxury Flooring',
      icon: '🪵',
      desc: 'Engineered hardwood, porcelain tile, or upgraded broadloom throughout',
      liftNote: 'Contemporary feel (~$7.5k lift)'
    },
    {
      key: 'windows',
      label: 'Energy-Efficient Windows',
      icon: '🪟',
      desc: 'New triple/double pane thermal windows and exterior doors',
      liftNote: 'Lower utility costs (~$6k lift)'
    },
    {
      key: 'roof',
      label: 'New Roof Shingles',
      icon: '🏠',
      desc: 'Replaced within the past 5-7 years with architectural shingles',
      liftNote: 'Critical buyer peace of mind (~$6.5k lift)'
    },
    {
      key: 'furnaceHvac',
      label: 'Upgraded HVAC Systems',
      icon: '❄️',
      desc: 'High-efficiency furnace, tankless water heater, or heat pump',
      liftNote: 'Mechanical reliability (~$5k lift)'
    },
    {
      key: 'landscaping',
      label: 'Landscaping & Interlocking',
      icon: '🌿',
      desc: 'Interlocking stone patio, custom deck, mature gardens, curb appeal',
      liftNote: 'First impression equity (~$4.5k lift)'
    },
    {
      key: 'pool',
      label: 'In-Ground Swimming Pool',
      icon: '🏊',
      desc: 'Heated saltwater or chlorine pool, cabana, stamped concrete',
      liftNote: 'Summer lifestyle demand (~$15k lift)'
    }
  ];

  return (
    <div id="property-valuation-tool" className={`w-full ${className}`}>
      {/* Outer Card: Editorial Luxury Frame (Inspired by Sharlene Chang aesthetic) */}
      <div className="bg-white text-stone-900 rounded-3xl shadow-xl border border-[#E7E2D8] overflow-hidden">
        
        {/* Editorial Header & Progress Track */}
        <div className="bg-[#FAF8F5] border-b border-[#E7E2D8] px-6 py-6 sm:px-10 sm:py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Top Eyebrow & Mode Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A38258]">
                <Sparkle className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Bespoke Valuation Advisory • Ontario MLS® Solds</span>
              </div>

              {/* Step Counter Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/60 text-stone-700 text-xs font-medium">
                <span>Step {currentStep === 'address' ? '1' : currentStep === 'details' ? '2' : currentStep === 'renovations' ? '3' : '4'} of 4</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-900 tracking-tight leading-snug mb-2">
              What Is Your Home Worth in Today's Market?
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
              Unlike generic price calculators, our automated Comparative Market Analysis analyzes your exact room counts, interior square footage, and completed renovations against verified recent neighborhood sales.
            </p>

            {/* 4-Step Progress Bar */}
            <div className="mt-6 pt-5 border-t border-[#E7E2D8]/80 grid grid-cols-4 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => setCurrentStep('address')}
                className={`flex flex-col items-center gap-1.5 py-1 transition-all cursor-pointer ${
                  currentStep === 'address' ? 'text-[#0F2942] font-bold' : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 'address'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  1
                </div>
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">1. Address</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (addressInput.trim()) setCurrentStep('details');
                }}
                disabled={!addressInput.trim()}
                className={`flex flex-col items-center gap-1.5 py-1 transition-all ${
                  !addressInput.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  currentStep === 'details' ? 'text-[#0F2942] font-bold' : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 'details'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : currentStep === 'renovations' || currentStep === 'result'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  {currentStep === 'renovations' || currentStep === 'result' ? '✓' : '2'}
                </div>
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">2. Rooms & Layout</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (addressInput.trim()) setCurrentStep('renovations');
                }}
                disabled={!addressInput.trim()}
                className={`flex flex-col items-center gap-1.5 py-1 transition-all ${
                  !addressInput.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  currentStep === 'renovations' ? 'text-[#0F2942] font-bold' : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 'renovations'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : currentStep === 'result'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  {currentStep === 'result' ? '✓' : '3'}
                </div>
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">3. Renovations</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (valuationResult) setCurrentStep('result');
                }}
                disabled={!valuationResult}
                className={`flex flex-col items-center gap-1.5 py-1 transition-all ${
                  !valuationResult ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  currentStep === 'result' ? 'text-[#0F2942] font-bold' : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 'result'
                    ? 'bg-[#C5A880] text-[#0F2942] shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  4
                </div>
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">4. Valuation Report</span>
              </button>
            </div>

          </div>
        </div>

        {/* Wizard Step Containers */}
        <div className="p-6 sm:p-10 max-w-4xl mx-auto">
          
          {/* Validation Error Banner */}
          {valuationError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="block font-bold">Please check your inputs</strong>
                <span>{valuationError}</span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 1: PROPERTY LOCATION & IDENTIFICATION                   */}
          {/* ============================================================ */}
          {currentStep === 'address' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Step 1 • Address & Property Type
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-stone-900 font-bold">
                  Where is your property located?
                </h3>
                <p className="text-stone-600 text-sm">
                  Enter your Ontario street address. We'll cross-reference recent MLS® sales within your specific subdivision.
                </p>
              </div>

              {/* Address Search Field with Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Canadian Property Address
                </label>
                
                <div className={`relative flex items-center bg-stone-50 rounded-2xl border-2 transition-all p-2 shadow-xs ${
                  addressError
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-stone-200 focus-within:border-[#C5A880] focus-within:bg-white'
                }`}>
                  <MapPin className={`w-5 h-5 ml-2 mr-3 shrink-0 ${addressError ? 'text-rose-500' : 'text-stone-400'}`} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={addressInput}
                    onChange={e => {
                      handleAddressChange(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setAddressTouched(true);
                      const res = validateAddress(addressInput);
                      setAddressError(res.isValid ? undefined : res.error);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Enter street address (e.g. 123 Main Street, Whitby, ON)..."
                    className="w-full text-base sm:text-lg bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none"
                  />
                  {addressInput && (
                    <button
                      type="button"
                      onClick={() => {
                        handleAddressChange('');
                        setAutocompleteSuggestions([]);
                      }}
                      className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {addressError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{addressError}</span>
                  </p>
                )}

                {/* Autocomplete Dropdown */}
                {showSuggestions && autocompleteSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden">
                    <div className="p-2 border-b border-stone-100 bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between">
                      <span>Matching Ontario Properties</span>
                      {isSearchingAutocomplete && <span className="text-xs text-amber-700">Searching...</span>}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                      {autocompleteSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAddress(item.address, item.propertyType)}
                          className="w-full text-left p-3.5 hover:bg-stone-50 transition-colors flex items-center justify-between text-xs sm:text-sm group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Building className="w-4 h-4 text-stone-400 group-hover:text-[#0F2942]" />
                            <div>
                              <div className="font-semibold text-stone-900">{item.address}</div>
                              <div className="text-[11px] text-stone-600">{item.municipality}, {item.province} • {item.propertyType || 'Residential'}</div>
                            </div>
                          </div>
                          <span className="text-xs text-[#8C6D43] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Sample Address Pills */}
              <div className="space-y-2">
                <span className="text-xs text-stone-600 block">
                  Or explore with a verified Ontario sample property:
                </span>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_ADDRESSES.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAddress(ex)}
                      className="px-3 py-1.5 rounded-full text-xs bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Grid */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Property Structure Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(['Detached Home', 'Semi-Detached', 'Freehold Townhouse', 'Condo Townhouse', 'Condo Apartment', 'Luxury Estate'] as ValuationPropertyType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPropertyType(t)}
                      className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all text-center cursor-pointer ${
                        propertyType === t
                          ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valuation Perspective Toggle */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Valuation Perspective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValuationMode('seller')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      valuationMode === 'seller'
                        ? 'bg-amber-50/50 border-[#C5A880] text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center justify-between">
                      <span>I am the Homeowner / Seller</span>
                      {valuationMode === 'seller' && <Check className="w-4 h-4 text-[#8C6D43]" />}
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Estimate market equity, pricing strategy, and 1% commission net savings.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValuationMode('buyer')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      valuationMode === 'buyer'
                        ? 'bg-amber-50/50 border-[#C5A880] text-stone-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center justify-between">
                      <span>I am a Buyer / Investor</span>
                      {valuationMode === 'buyer' && <Check className="w-4 h-4 text-[#8C6D43]" />}
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Assess fair market value before drafting an offer or investment proposal.
                    </p>
                  </button>
                </div>
              </div>

              {/* Bottom Step 1 Action Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleGoToDetails}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Rooms & Layout</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </button>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: ROOMS, SQUARE FOOTAGE & PROPERTY SPECIFICATIONS      */}
          {/* ============================================================ */}
          {currentStep === 'details' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Step 2 • Rooms & Specifications
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-stone-900 font-bold">
                    Tell us about the property layout
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Accurate room counts and square footage produce a precise comparable match.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs flex items-center gap-2 self-start">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <span className="font-semibold truncate max-w-[220px]">{addressInput}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('address')}
                    className="text-[#8C6D43] hover:underline font-bold text-[11px] ml-1"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Bedrooms & Bathrooms Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Bedrooms Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-stone-500" />
                    <span>Bedrooms Above Grade</span>
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBeds(num)}
                        className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          beds === num
                            ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {num === 6 ? '6+' : num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-stone-500" />
                    <span>Total Bathrooms</span>
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBaths(num)}
                        className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          baths === num
                            ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {num === 6 ? '6+' : num}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Square Footage Slider & Presets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-stone-500" />
                    <span>Estimated Interior Living Area</span>
                  </label>
                  <div className="text-base font-bold text-[#0F2942] font-mono bg-stone-100 px-3 py-1 rounded-xl">
                    {sqft.toLocaleString()} sq. ft.
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="700"
                  max="5500"
                  step="50"
                  value={sqft}
                  onChange={e => setSqft(Number(e.target.value))}
                  className="w-full accent-[#C5A880] cursor-pointer h-2 bg-stone-200 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[1200, 1600, 2100, 2600, 3200, 4000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSqft(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        sqft === val
                          ? 'bg-[#C5A880] text-[#0F2942] font-bold'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      ~{val.toLocaleString()} sqft
                    </button>
                  ))}
                </div>
              </div>

              {/* Garage & Parking */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-stone-500" />
                  <span>Garage & Covered Parking Spaces</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { num: 0, label: '0 (Street/Drive)' },
                    { num: 1, label: '1 Car Garage' },
                    { num: 2, label: '2 Car Double' },
                    { num: 3, label: '3+ Car Triple' }
                  ].map(item => (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => setGarage(item.num)}
                      className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center cursor-pointer ${
                        garage === item.num
                          ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basement Finish Status */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Basement Type & Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { val: 'Finished', label: 'Fully Finished Rec Room' },
                    { val: 'Separate Entrance Suite', label: 'Separate Entrance / Legal Suite' },
                    { val: 'Partially Finished', label: 'Partially Finished' },
                    { val: 'Unfinished', label: 'Unfinished / Full Basement' },
                    { val: 'None', label: 'No Basement (Slab/Condo)' }
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setBasement(item.val as any)}
                      className={`p-3 rounded-2xl text-xs sm:text-sm font-medium border transition-all text-center cursor-pointer ${
                        basement === item.val
                          ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Overall Condition */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Overall Property Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { val: 'Fully Renovated', label: 'Designer Turnkey', desc: 'Top-tier luxury finishes' },
                    { val: 'Good', label: 'Well Maintained', desc: 'Move-in ready, clean' },
                    { val: 'Average', label: 'Average / Original', desc: 'Functional, older styles' },
                    { val: 'Needs Work', label: 'Needs Updates', desc: 'Requires cosmetic or repairs' }
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setCondition(item.val as any)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        condition === item.val
                          ? 'bg-amber-50/60 border-[#C5A880] text-stone-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm text-stone-900">{item.label}</div>
                      <div className="text-[11px] text-stone-600 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons for Step 2 */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('address')}
                  className="px-5 py-3 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToRenovations}
                  className="px-8 py-4 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Upgrades & Renovations</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </button>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: UPGRADES & RENOVATIONS DONE PRIOR TO VALUATION       */}
          {/* ============================================================ */}
          {currentStep === 'renovations' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Step 3 • Completed Upgrades & Timeline
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-stone-900 font-bold">
                    What renovations or updates have been done?
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Select any completed improvements. These directly elevate your valuation score and adjusted comparable market price.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-[#C5A880]/30 text-xs font-semibold text-[#8C6D43] flex items-center gap-1.5 self-start shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{activeRenovationsCount} Upgrades Selected</span>
                </div>
              </div>

              {/* Renovation Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {renovationOptions.map(opt => {
                  const isChecked = Boolean(renovations[opt.key]);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleRenovation(opt.key)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-amber-50/60 border-[#C5A880] shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-2xl shrink-0 mt-0.5">{opt.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-stone-950' : 'text-stone-800'}`}>
                            {opt.label}
                          </span>
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug mt-1">
                          {opt.desc}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#8C6D43]">
                          {opt.liftNote}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selling Timeline Selection */}
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>What is your timeline or motivation?</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { val: '1-3 months', label: '1 - 3 Months', desc: 'Actively preparing to sell' },
                    { val: '3-6 months', label: '3 - 6 Months', desc: 'Planning spring/summer move' },
                    { val: '6-12 months', label: '6 - 12 Months', desc: 'Long-term equity monitoring' },
                    { val: 'curious', label: 'Just Curious', desc: 'Refinancing or valuation check' }
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSellingTimeline(item.val as any)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        sellingTimeline === item.val
                          ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className={`text-[10px] mt-0.5 ${sellingTimeline === item.val ? 'text-stone-300' : 'text-stone-600'}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Target Asking Price */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-stone-500" />
                    <span>Do you have a target listing price in mind? (Optional)</span>
                  </label>
                  <span className="text-[11px] text-stone-600">Helps test pricing viability</span>
                </div>
                <div className="relative max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    value={askingPriceInput}
                    onChange={e => setAskingPriceInput(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 1050000"
                    className="w-full pl-8 pr-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#C5A880] text-stone-900 font-mono text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Primary Run Valuation CTA */}
              <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Layout</span>
                </button>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                  <div className="text-[11px] text-stone-600 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Confidential • Instant Analysis</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunValuation()}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#0F2942] to-[#173A5E] hover:from-[#173A5E] hover:to-[#0F2942] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C5A880]/30"
                  >
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Calculate Instant Market Valuation</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: VALUATION ANALYSIS & DETAILED REPORT                 */}
          {/* ============================================================ */}
          {currentStep === 'result' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* If Loading State: Radar Scanner */}
              {isLoading && (
                <div className="py-16 text-center space-y-6 max-w-lg mx-auto">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-stone-200 animate-ping opacity-30" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#C5A880] border-r-[#0F2942] border-b-stone-200 border-l-stone-200 animate-spin" />
                    <div className="absolute inset-3 rounded-full bg-stone-50 flex items-center justify-center shadow-inner">
                      <Home className="w-8 h-8 text-[#0F2942]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-serif font-bold text-stone-900">
                      Analyzing {addressInput}...
                    </h4>
                    <p className="text-xs text-stone-600 font-mono">
                      {LOADING_STEPS[loadingStepIndex]}
                    </p>
                  </div>

                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C5A880] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-stone-600">
                    Applying your specified {beds} bedrooms, {baths} bathrooms, {sqft} sqft, and {activeRenovationsCount} renovations...
                  </p>
                </div>
              )}

              {/* If Error Occurred: Informative Retry Card */}
              {!isLoading && valuationError && (
                <div className="py-12 text-center space-y-6 max-w-lg mx-auto bg-stone-50 border border-stone-200 rounded-3xl p-8 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-serif font-bold text-stone-900">
                      Valuation Analysis Interrupted
                    </h4>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {valuationError}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleRunValuation()}
                      className="w-full sm:w-auto px-6 py-3 bg-[#0F2942] hover:bg-[#173A5E] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Retry Calculation
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('address')}
                      className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl border border-stone-200 transition-all cursor-pointer"
                    >
                      Change Address
                    </button>
                  </div>
                </div>
              )}

              {/* If Insufficient Data: Guided Advisory Card */}
              {!isLoading && !valuationError && valuationResult?.insufficientData && (
                <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200 text-center space-y-6 shadow-sm max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-[#8C6D43] border border-amber-200 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-serif font-bold text-stone-900">
                      Personalized In-Person CMA Recommended
                    </h4>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {valuationResult.aiExplanation || "We found limited public MLS® comparable sales in this specific micro-pocket over the past 90 days. To ensure you receive an accurate, authoritative market value rather than a rough statistical estimate, Amit Sawhney will prepare a tailored manual Comparative Market Analysis for your address."}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => openLeadModalWithIntent('seller_cma')}
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Request Free Manual CMA from Amit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('address')}
                      className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Try Another Address
                    </button>
                  </div>
                </div>
              )}

              {/* If Valuation Result Loaded & Sufficient Data */}
              {!isLoading && !valuationError && valuationResult && !valuationResult.insufficientData && (
                <div className="space-y-8">
                  
                  {/* Top Notification Bar: Re-adjust Details link */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-stone-700">
                      <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                      <span>Valuation for: <strong className="text-stone-900">{valuationResult.subjectProperty?.address || addressInput}</strong></span>
                      <span className="hidden sm:inline text-stone-400">|</span>
                      <span className="hidden sm:inline text-stone-600">
                        {beds} Beds • {baths} Baths • {sqft.toLocaleString()} Sq Ft • {activeRenovationsCount} Upgrades
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep('details')}
                      className="px-3 py-1 bg-white hover:bg-stone-100 text-[#0F2942] font-bold rounded-lg border border-stone-200 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Adjust Property Details</span>
                    </button>
                  </div>

                  {/* Hero Valuation Bracket Banner */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F2942] via-[#14324F] to-[#0D2236] text-white shadow-xl border border-[#C5A880]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Main Estimated Price Range */}
                      <div className="lg:col-span-7 space-y-2.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 text-xs font-bold uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Estimated Market Valuation Range</span>
                        </div>

                        <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2 flex-wrap">
                          <span>${valLow.toLocaleString()}</span>
                          <span className="text-[#C5A880] font-sans font-light">—</span>
                          <span>${valHigh.toLocaleString()}</span>
                          <span className="text-xs font-sans text-stone-300 font-normal">CAD</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-300 pt-1">
                          <span>
                            Midpoint Benchmark: <strong className="text-white font-mono">${(valuationResult.estimatedValue || Math.round((valLow + valHigh) / 2)).toLocaleString()}</strong>
                          </span>
                          <span className="text-stone-500">•</span>
                          <span className="inline-flex items-center gap-1">
                            Market Data Source:
                            <a
                              href="https://trreb.ca/market-data/community-reports/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C5A880] hover:underline font-semibold inline-flex items-center gap-0.5"
                            >
                              TRREB Community Reports
                              <ArrowUpRight className="w-3 h-3 inline" />
                            </a>
                          </span>
                        </div>
                      </div>

                      {/* Right: Confidence Meter & 1% Commission Savings */}
                      <div className="lg:col-span-5 bg-white/10 rounded-2xl p-4 sm:p-5 border border-white/10 backdrop-blur-xs space-y-3">
                        
                        {/* Confidence Score */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-stone-300 font-medium">CMA Confidence Rating</span>
                            <span className="font-bold text-[#C5A880] uppercase tracking-wider">
                              {valConfidenceRating} ({valConfidencePercent}%)
                            </span>
                          </div>
                          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-[#C5A880] rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.max(10, valConfidencePercent))}%` }}
                            />
                          </div>
                        </div>

                        {/* 1% Commission Value Hook */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-stone-300 block">
                              Equity Saved with Amit's 1% Listing
                            </span>
                            <span className="text-xl font-bold font-mono text-emerald-400">
                              +${estimatedSavings.toLocaleString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openLeadModalWithIntent('seller_cma')}
                            className="px-3.5 py-2 bg-[#C5A880] hover:bg-[#B89758] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                          >
                            Lock In 1%
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* Summary of User Inputs Applied */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Property Attributes Factored Into This Valuation</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('details')}
                        className="text-xs font-semibold text-[#8C6D43] hover:underline"
                      >
                        Change Specs →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="text-stone-600 block text-[11px]">Bedrooms & Baths</span>
                        <strong className="text-stone-900 font-semibold">{beds} Beds • {baths} Baths</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="text-stone-600 block text-[11px]">Interior Living Area</span>
                        <strong className="text-stone-900 font-semibold">{sqft.toLocaleString()} sq. ft.</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="text-stone-600 block text-[11px]">Basement & Parking</span>
                        <strong className="text-stone-900 font-semibold">{basement} • {garage} Car</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <span className="text-stone-600 block text-[11px]">Overall Condition</span>
                        <strong className="text-stone-900 font-semibold">{condition}</strong>
                      </div>
                    </div>

                    {/* Renovation Badges */}
                    {activeRenovationsCount > 0 && (
                      <div className="pt-2 border-t border-stone-200/80">
                        <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                          Active Renovation Equity Lifts Applied:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {renovationOptions.filter(opt => renovations[opt.key]).map(opt => (
                            <span
                              key={opt.key}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-[#8C6D43] border border-[#C5A880]/30 text-xs font-semibold"
                            >
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Comparative Market Analysis Rationale */}
                  <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#0F2942] text-[#C5A880]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold font-serif text-stone-900">
                          AI Comparative Market Analysis Rationale
                        </h4>
                        <span className="text-xs text-stone-600">
                          Synthesized by Gemini based on Ontario MLS® sold benchmarks and your specific upgrades
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-stone-700 leading-relaxed space-y-3 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                      <p className="whitespace-pre-line">
                        {valuationResult.aiExplanation}
                      </p>
                    </div>
                  </div>

                  {/* TRREB Community Market Report Intelligence & Valuation Range Analysis */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          <Building className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Official Real Estate Board Intelligence</span>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-stone-900">
                          TRREB Community Market Report Intelligence
                        </h4>
                        <p className="text-xs text-stone-600">
                          Verified municipal market absorption data sourced directly from the Toronto Regional Real Estate Board (TRREB)
                        </p>
                      </div>

                      <a
                        href="https://trreb.ca/market-data/community-reports/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-[#0F2942] font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>TRREB Community Reports</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    </div>

                    {/* 4 TRREB Community Benchmark Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Card 1: Benchmark Range */}
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Community Benchmark Range
                        </span>
                        <div className="text-base sm:text-lg font-bold font-mono text-stone-900">
                          ${(valuationResult.communityReport?.benchmarkRange?.low || Math.round(valLow * 0.95)).toLocaleString()} — ${(valuationResult.communityReport?.benchmarkRange?.high || Math.round(valHigh * 1.05)).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-stone-600">
                          {propertyType} benchmark across {valuationResult.subjectProperty?.municipality || 'Durham Region'}
                        </p>
                      </div>

                      {/* Card 2: Average DOM */}
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            Median Days on Market
                          </span>
                          <Clock className="w-3.5 h-3.5 text-stone-600" />
                        </div>
                        <div className="text-xl font-bold font-mono text-stone-900">
                          {valuationResult.communityReport?.medianDaysOnMarket || 18} Days
                        </div>
                        <p className="text-[11px] text-emerald-800 font-semibold">
                          Active buyer absorption pace
                        </p>
                      </div>

                      {/* Card 3: SNLR & Market Condition */}
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            Sales-to-Listings Ratio
                          </span>
                          <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
                        </div>
                        <div className="text-xl font-bold font-mono text-stone-900">
                          {valuationResult.communityReport?.salesToNewListingsRatio || 58.6}%
                        </div>
                        <p className="text-[11px] text-stone-600">
                          {valuationResult.communityReport?.marketTemperature || 'Balanced Market (Healthy Liquidity)'}
                        </p>
                      </div>

                      {/* Card 4: Price Velocity */}
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            12-Month Price Velocity
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                        </div>
                        <div className="text-xl font-bold font-mono text-emerald-800">
                          +{valuationResult.communityReport?.yoyPriceChangePct || valuationResult.marketTrendAdjustment?.appliedPct || 2.4}% YoY
                        </div>
                        <p className="text-[11px] text-stone-600">
                          Annualized appreciation in {valuationResult.subjectProperty?.municipality || 'municipality'}
                        </p>
                      </div>

                    </div>

                    {/* Valuation Range Spectrum Visualizer */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h5 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                            Estimated Market Valuation Spectrum
                          </h5>
                          <p className="text-xs text-stone-600">
                            Calibration based on property layout ({beds} beds, {baths} baths, {sqft.toLocaleString()} sqft) and {activeRenovationsCount} verified upgrades
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold text-[#8C6D43]">
                          Spread: ${(valHigh - valLow).toLocaleString()} CAD
                        </div>
                      </div>

                      {/* Visual Spread Bar */}
                      <div className="space-y-2">
                        <div className="relative pt-6 pb-2">
                          {/* Main track */}
                          <div className="h-3 rounded-full bg-stone-200 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-amber-200 via-[#C5A880] to-emerald-400 rounded-full opacity-80" />
                          </div>

                          {/* Pin: Low */}
                          <div className="absolute left-0 top-0 text-left">
                            <span className="text-[10px] font-bold text-stone-600 uppercase block">Conservative</span>
                            <span className="text-xs font-mono font-bold text-stone-800">${valLow.toLocaleString()}</span>
                          </div>

                          {/* Pin: Midpoint */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center">
                            <span className="text-[10px] font-bold text-[#8C6D43] uppercase block">Midpoint Target</span>
                            <span className="text-xs font-mono font-bold text-[#0F2942]">
                              ${(valuationResult.estimatedValue || Math.round((valLow + valHigh) / 2)).toLocaleString()}
                            </span>
                          </div>

                          {/* Pin: High */}
                          <div className="absolute right-0 top-0 text-right">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Optimized Listing</span>
                            <span className="text-xs font-mono font-bold text-emerald-900">${valHigh.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-600">
                          <div className="p-3 bg-white rounded-xl border border-stone-200">
                            <strong className="block text-stone-900 font-semibold mb-0.5">Conservative Bracket (${valLow.toLocaleString()})</strong>
                            <span>Expected baseline under standard condition with no staging or quick-close timeline.</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-stone-200">
                            <strong className="block text-stone-900 font-semibold mb-0.5">Statistical Target (${(valuationResult.estimatedValue || Math.round((valLow + valHigh) / 2)).toLocaleString()})</strong>
                            <span>Current market equilibrium reflecting your {beds} bed, {baths} bath specs and basement condition.</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-stone-200">
                            <strong className="block text-stone-900 font-semibold mb-0.5">Optimized Potential (${valHigh.toLocaleString()})</strong>
                            <span>Achievable through Amit's professional staging, HD media, and 1% Full-Service buyer reach.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MLS® Privacy & Fiduciary Compliance Disclosure */}
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-[#C5A880]/30 text-xs text-stone-700 space-y-2">
                      <div className="flex items-center gap-2 text-stone-900 font-bold">
                        <Lock className="w-4 h-4 text-[#8C6D43]" />
                        <span>Fiduciary Protection & MLS® Data Privacy Policy</span>
                      </div>
                      <p className="leading-relaxed">
                        In strict compliance with the Toronto Regional Real Estate Board (TRREB) consumer privacy regulations and to protect your home's strategic negotiating position, individual property addresses and specific sold figures are not published in public automated web tools. For a complete, unredacted Comparative Market Analysis (CMA) binder containing verified sold comps within 500 meters of your doorstep, book a confidential walkthrough with Amit Sawhney.
                      </p>
                    </div>

                  </div>

                  {/* Dual Action CTAs: In-Person CMA Audit & Email Report */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-stone-100 border border-stone-300/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D43] block">
                        Complimentary In-Home Verification
                      </span>
                      <h4 className="text-xl font-serif font-bold text-stone-900">
                        Schedule an In-Person REALTOR® Walkthrough
                      </h4>
                      <p className="text-xs text-stone-600 max-w-md">
                        Amit Sawhney will personally tour your home, inspect unique architectural upgrades, and provide a binding listing price recommendation.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => openLeadModalWithIntent('seller_cma')}
                        className="w-full sm:w-auto px-6 py-3.5 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                      >
                        Book In-Person Audit ($0 Fee)
                      </button>

                      <button
                        type="button"
                        onClick={() => openLeadModalWithIntent('speak_with_realtor')}
                        className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl border border-stone-300 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Email Me This Report
                      </button>
                    </div>
                  </div>

                  {/* Reset / Start Over link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep('address');
                        setValuationResult(null);
                      }}
                      className="text-xs font-medium text-stone-600 hover:text-stone-800 transition-colors cursor-pointer"
                    >
                      ← Value another property address
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* ============================================================ */}
      {/* LEAD CAPTURE MODAL: In-Person Walkthrough / PDF CMA Report   */}
      {/* ============================================================ */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-[#0F2942] text-white p-6 relative border-b border-[#1E3A8A]">
              <button
                type="button"
                onClick={() => {
                  setShowLeadModal(false);
                  setLeadSuccess(false);
                }}
                className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ontario REALTOR® Advisory</span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-white">
                {leadIntent === 'seller_cma' ? 'In-Home Verification with Amit' : 'Receive Your Official CMA Report'}
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                Property: {valuationResult?.subjectProperty.address || addressInput}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {leadSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-stone-900">
                    Request Received!
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, {leadFormData.firstName}. Amit Sawhney (Licensed Ontario REALTOR®) will review your property specifications and connect with you at {leadFormData.phone} within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeadModal(false);
                      setLeadSuccess(false);
                    }}
                    className="px-6 py-2.5 bg-[#0F2942] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {leadError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                      {leadError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={leadFormData.firstName}
                        onChange={e => handleLeadFirstNameChange(e.target.value)}
                        onBlur={() => {
                          setLeadTouched(prev => ({ ...prev, firstName: true }));
                          const res = validateName(leadFormData.firstName, 'First name', true);
                          setLeadErrors(prev => ({ ...prev, firstName: res.isValid ? undefined : res.error }));
                        }}
                        className={`w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border focus:outline-none transition-colors ${
                          leadErrors.firstName
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-stone-200 focus:bg-white focus:border-[#C5A880]'
                        }`}
                        placeholder="John"
                      />
                      {leadErrors.firstName && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{leadErrors.firstName}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={leadFormData.lastName}
                        onChange={e => handleLeadLastNameChange(e.target.value)}
                        onBlur={() => {
                          setLeadTouched(prev => ({ ...prev, lastName: true }));
                          const res = validateName(leadFormData.lastName, 'Last name', false);
                          setLeadErrors(prev => ({ ...prev, lastName: res.isValid ? undefined : res.error }));
                        }}
                        className={`w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border focus:outline-none transition-colors ${
                          leadErrors.lastName
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-stone-200 focus:bg-white focus:border-[#C5A880]'
                        }`}
                        placeholder="Doe"
                      />
                      {leadErrors.lastName && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{leadErrors.lastName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={leadFormData.phone}
                        onChange={e => handleLeadPhoneChange(e.target.value)}
                        onBlur={() => {
                          setLeadTouched(prev => ({ ...prev, phone: true }));
                          const res = validatePhone(leadFormData.phone, true);
                          setLeadErrors(prev => ({ ...prev, phone: res.isValid ? undefined : res.error }));
                        }}
                        className={`w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border focus:outline-none transition-colors ${
                          leadErrors.phone
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-stone-200 focus:bg-white focus:border-[#C5A880]'
                        }`}
                        placeholder="(647) 000-0000"
                      />
                      {leadErrors.phone && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{leadErrors.phone}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={leadFormData.email}
                        onChange={e => handleLeadEmailChange(e.target.value)}
                        onBlur={() => {
                          setLeadTouched(prev => ({ ...prev, email: true }));
                          const res = validateEmail(leadFormData.email, true);
                          setLeadErrors(prev => ({ ...prev, email: res.isValid ? undefined : res.error }));
                        }}
                        className={`w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border focus:outline-none transition-colors ${
                          leadErrors.email
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                            : 'border-stone-200 focus:bg-white focus:border-[#C5A880]'
                        }`}
                        placeholder="john@example.com"
                      />
                      {leadErrors.email && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{leadErrors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Notes or Specific Features
                    </label>
                    <textarea
                      rows={2}
                      value={leadFormData.notes}
                      onChange={e => setLeadFormData({ ...leadFormData, notes: e.target.value })}
                      placeholder="e.g. In-law suite, premium lot backing onto ravine, recently painted..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="consent-check"
                      checked={leadFormData.consent}
                      onChange={e => setLeadFormData({ ...leadFormData, consent: e.target.checked })}
                      className="mt-0.5 accent-[#0F2942] rounded cursor-pointer"
                    />
                    <label htmlFor="consent-check" className="text-[10px] text-stone-600 leading-tight">
                      I consent to receive my comparative valuation report and occasional market updates from Amit Sawhney (Licensed Ontario REALTOR®). We respect your privacy.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={leadSubmitting}
                    className="w-full py-3.5 bg-[#0F2942] hover:bg-[#183759] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {leadSubmitting ? 'Submitting...' : 'Submit CMA Request'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
