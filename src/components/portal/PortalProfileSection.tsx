import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Save,
  FileCheck,
  Check,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { AuthUser } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAffordability } from '../../context/AffordabilityContext';
import { validateEmail, validatePhone, validateName, formatPhoneNumber } from '../../utils/validation';

interface PortalProfileSectionProps {
  isNewlyRegistered?: boolean;
  onProfileUpdated?: (updatedUser: AuthUser) => void;
  onNavigateTab?: (tab: string) => void;
}

const AVAILABLE_AREAS = [
  'Whitby',
  'Brooklin',
  'Oshawa',
  'Ajax',
  'Pickering',
  'Bowmanville / Clarington',
  'Markham',
  'Toronto / North York',
  'Richmond Hill',
  'Vaughan'
];

const PROPERTY_TYPES = [
  'Pre-Construction Townhome',
  'Pre-Construction Condo High-Rise',
  'Resale Detached Home',
  'Resale Semi-Detached',
  'Resale Freehold Townhome',
  'Condo Apartment'
];

export const PortalProfileSection: React.FC<PortalProfileSectionProps> = ({
  isNewlyRegistered,
  onProfileUpdated,
  onNavigateTab
}) => {
  const { user, updateUserProfile } = useAuth();
  const { buyerProfile, saveProfile } = useAffordability();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentAddress, setCurrentAddress] = useState(user?.currentAddress || '');
  const [city, setCity] = useState(user?.city || 'Whitby');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  
  // Buyer Intentions
  const [buyerType, setBuyerType] = useState<string>(user?.buyerType || 'First-Time Buyer');
  const [purchaseTimeline, setPurchaseTimeline] = useState(user?.purchaseTimeline || '1-3 Months');
  const [targetAreas, setTargetAreas] = useState<string[]>(user?.targetAreas || ['Whitby', 'Brooklin']);
  const [propertyTypePlanning, setPropertyTypePlanning] = useState(user?.propertyTypePlanning || 'Pre-Construction Townhome');
  const [targetBudgetMin, setTargetBudgetMin] = useState<number>(user?.targetBudgetMin || 600000);
  const [targetBudgetMax, setTargetBudgetMax] = useState<number>(user?.targetBudgetMax || 850000);

  // Co-Buyer Details
  const [hasCoBuyer, setHasCoBuyer] = useState(!!user?.coBuyerName);
  const [coBuyerName, setCoBuyerName] = useState(user?.coBuyerName || '');
  const [coBuyerEmail, setCoBuyerEmail] = useState(user?.coBuyerEmail || '');
  const [coBuyerPhone, setCoBuyerPhone] = useState(user?.coBuyerPhone || '');
  const [coBuyerRelationship, setCoBuyerRelationship] = useState(user?.coBuyerRelationship || 'Spouse');

  // Financing & Pre-Approval
  const [mortgagePreApprovalStatus, setMortgagePreApprovalStatus] = useState(user?.mortgagePreApprovalStatus || 'Fully Pre-Approved');
  const [preApprovalAmount, setPreApprovalAmount] = useState<number>(user?.preApprovalAmount || 800000);
  const [lenderOrBroker, setLenderOrBroker] = useState(user?.lenderOrBroker || 'RBC Royal Bank Mortgage Specialist');
  const [intendedDownPayment, setIntendedDownPayment] = useState<number>(user?.intendedDownPayment || 150000);
  const [downPaymentSource, setDownPaymentSource] = useState(user?.downPaymentSource || 'Personal Savings & Investments');
  const [ownsExistingProperty, setOwnsExistingProperty] = useState(!!user?.ownsExistingProperty);
  const [dependsOnSaleOfCurrentHome, setDependsOnSaleOfCurrentHome] = useState(!!user?.dependsOnSaleOfCurrentHome);

  // Notes
  const [notes, setNotes] = useState(user?.notes || '');

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      if (user.currentAddress) setCurrentAddress(user.currentAddress);
      if (user.city) setCity(user.city);
      if (user.postalCode) setPostalCode(user.postalCode);
      if (user.buyerType) setBuyerType(user.buyerType);
      if (user.purchaseTimeline) setPurchaseTimeline(user.purchaseTimeline);
      if (user.targetAreas) setTargetAreas(user.targetAreas);
      if (user.propertyTypePlanning) setPropertyTypePlanning(user.propertyTypePlanning);
      if (user.targetBudgetMin) setTargetBudgetMin(user.targetBudgetMin);
      if (user.targetBudgetMax) setTargetBudgetMax(user.targetBudgetMax);
      if (user.coBuyerName) {
        setHasCoBuyer(true);
        setCoBuyerName(user.coBuyerName);
      }
      if (user.coBuyerEmail) setCoBuyerEmail(user.coBuyerEmail);
      if (user.coBuyerPhone) setCoBuyerPhone(user.coBuyerPhone);
      if (user.coBuyerRelationship) setCoBuyerRelationship(user.coBuyerRelationship);
      if (user.mortgagePreApprovalStatus) setMortgagePreApprovalStatus(user.mortgagePreApprovalStatus);
      if (user.preApprovalAmount) setPreApprovalAmount(user.preApprovalAmount);
      if (user.lenderOrBroker) setLenderOrBroker(user.lenderOrBroker);
      if (user.intendedDownPayment) setIntendedDownPayment(user.intendedDownPayment);
      if (user.downPaymentSource) setDownPaymentSource(user.downPaymentSource);
      if (user.ownsExistingProperty !== undefined) setOwnsExistingProperty(user.ownsExistingProperty);
      if (user.dependsOnSaleOfCurrentHome !== undefined) setDependsOnSaleOfCurrentHome(user.dependsOnSaleOfCurrentHome);
      if (user.notes) setNotes(user.notes);
    }
  }, [user]);

  const toggleArea = (area: string) => {
    if (targetAreas.includes(area)) {
      if (targetAreas.length > 1) {
        setTargetAreas(targetAreas.filter(a => a !== area));
      }
    } else {
      setTargetAreas([...targetAreas, area]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    const nameCheck = validateName(fullName, 'Full name', true);
    if (!nameCheck.isValid) {
      setErrors(prev => ({ ...prev, fullName: nameCheck.error || '' }));
      setErrorMessage('Please enter a valid legal full name.');
      return;
    }

    if (phone) {
      const phoneCheck = validatePhone(phone, false);
      if (!phoneCheck.isValid) {
        setErrors(prev => ({ ...prev, phone: phoneCheck.error || '' }));
        setErrorMessage('Please enter a valid phone number.');
        return;
      }
    }

    setSaving(true);
    const updates: Partial<AuthUser> = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      currentAddress: currentAddress.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      buyerType: buyerType as any,
      purchaseTimeline,
      targetAreas,
      propertyTypePlanning,
      targetBudgetMin: Number(targetBudgetMin),
      targetBudgetMax: Number(targetBudgetMax),
      coBuyerName: hasCoBuyer ? coBuyerName.trim() : '',
      coBuyerEmail: hasCoBuyer ? coBuyerEmail.trim() : '',
      coBuyerPhone: hasCoBuyer ? coBuyerPhone.trim() : '',
      coBuyerRelationship: hasCoBuyer ? coBuyerRelationship : '',
      mortgagePreApprovalStatus,
      preApprovalAmount: Number(preApprovalAmount),
      lenderOrBroker: lenderOrBroker.trim(),
      intendedDownPayment: Number(intendedDownPayment),
      downPaymentSource,
      ownsExistingProperty,
      dependsOnSaleOfCurrentHome: ownsExistingProperty ? dependsOnSaleOfCurrentHome : false,
      notes: notes.trim(),
      vipAccessTier: 'Platinum VIP Verified',
      representationAgreementStatus: 'Active (Signed with Amit Sawhney)'
    };

    const res = await updateUserProfile(updates);
    setSaving(false);

    if (res.success && res.user) {
      // Sync with affordability profile if buyerProfile exists
      if (buyerProfile && saveProfile) {
        saveProfile({
          ...buyerProfile,
          intendedDownPayment: Number(intendedDownPayment),
          availableFunds: Math.max(buyerProfile.availableFunds || 0, Number(intendedDownPayment)),
          ownsExistingProperty: ownsExistingProperty,
          mortgagePreApprovalStatus: mortgagePreApprovalStatus
        }).catch(err => console.log('Affordability sync in profile skipped', err));
      }

      setSaveSuccess(true);
      onProfileUpdated?.(res.user);
      setTimeout(() => setSaveSuccess(false), 4500);
    } else {
      setErrorMessage(res.error || 'Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="space-y-8" id="portal-profile-section">
      {/* Newly Registered Guided Banner */}
      {isNewlyRegistered && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-amber-900/5 to-transparent border border-emerald-500/30 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <span>Welcome to Blueprint VIP Client Portal, {fullName || 'Valued Buyer'}!</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Account Active
              </span>
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-3">
              Your account has been created. Please review and complete your client profile below. This confidential information enables Amit Sawhney, Licensed REALTOR®, to coordinate developer allocations, structure mortgage stress-tested clauses, and draft legal agreements on your behalf.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> RECO Fiduciary Representation
              </span>
              <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Platinum VIP Pre-Con Allocations
              </span>
              <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 1.0% Commission Cashback
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Client Profile Updated Successfully</p>
              <p className="text-xs text-emerald-700">All contact details, search criteria, and financing preferences have been securely saved.</p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('affordability')}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>View Buying Range</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section 1: Contact & Legal Identity */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2942]/5 text-[#0F2942] flex items-center justify-center">
                <User className="w-5 h-5 text-[#0F2942]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Legal Contact & Primary Buyer Identity</h2>
                <p className="text-xs text-stone-500">Legal names matching government-issued ID for OREA Agreement of Purchase and Sale contracts</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded-full text-stone-600">
              Primary Applicant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  id="profile-fullname"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. David Alexander Miller"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent text-stone-900 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-stone-400 font-normal">(Account Login)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-600 bg-stone-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Primary Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  id="profile-phone"
                  value={phone}
                  onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(416) 555-0192"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent text-stone-900 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Current Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  id="profile-address"
                  value={currentAddress}
                  onChange={e => setCurrentAddress(e.target.value)}
                  placeholder="e.g. 128 Brock St E, Suite 305"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent text-stone-900 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Municipality / City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Whitby"
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value.toUpperCase())}
                placeholder="L1N 2H4"
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] focus:border-transparent text-stone-900 bg-stone-50/50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Buyer Persona & Search Criteria */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Purchase Intent & Target Criteria</h2>
              <p className="text-xs text-stone-500">Guides VIP allocation priorities and automated MLS® alert matching</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Buyer Profile Archetype
              </label>
              <select
                value={buyerType}
                onChange={e => setBuyerType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              >
                <option value="First-Time Buyer">First-Time Homebuyer (Eligible for $4,000 LTT Rebate & FHSA)</option>
                <option value="Move-Up Buyer">Move-Up Buyer (Transitioning to larger home/townhome)</option>
                <option value="Investor">Real Estate Investor (Positive cash flow & ROIC focus)</option>
                <option value="Downsizing">Downsizing Senior / Empty Nester (Low maintenance luxury)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Target Purchase Timeline
              </label>
              <select
                value={purchaseTimeline}
                onChange={e => setPurchaseTimeline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              >
                <option value="Immediate (0-30 Days)">Immediate (0-30 Days) - Actively writing offers</option>
                <option value="1-3 Months">1-3 Months - Touring and securing pre-approvals</option>
                <option value="3-6 Months">3-6 Months - Planning for summer/autumn market</option>
                <option value="6-12 Months">6-12 Months - Exploring upcoming VIP launches</option>
                <option value="Pre-Con Extended Closing (2-4 Years)">Pre-Con Extended Closing (2-4 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Preferred Property Class
              </label>
              <select
                value={propertyTypePlanning}
                onChange={e => setPropertyTypePlanning(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              >
                {PROPERTY_TYPES.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Target Budget Range: <span className="text-[#0F2942] font-extrabold">${targetBudgetMin.toLocaleString()} - ${targetBudgetMax.toLocaleString()}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Min Target ($)</span>
                  <input
                    type="number"
                    step={10000}
                    value={targetBudgetMin}
                    onChange={e => setTargetBudgetMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-stone-300 text-stone-900"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Max Ceiling ($)</span>
                  <input
                    type="number"
                    step={10000}
                    value={targetBudgetMax}
                    onChange={e => setTargetBudgetMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-stone-300 text-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Target Geographic Communities & Municipalities
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AREAS.map(area => {
                const isSelected = targetAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F2942] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Co-Buyer / Legal Partner Details */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Co-Buyer / Joint Legal Applicant</h2>
                <p className="text-xs text-stone-500">Spouse, partner, or family member who will appear on title and mortgage agreement</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
              <input
                type="checkbox"
                checked={hasCoBuyer}
                onChange={e => setHasCoBuyer(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2942] focus:ring-[#0F2942]"
              />
              <span>Include Co-Buyer</span>
            </label>
          </div>

          {hasCoBuyer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Co-Buyer Legal Full Name
                </label>
                <input
                  type="text"
                  value={coBuyerName}
                  onChange={e => setCoBuyerName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Relationship to Primary Buyer
                </label>
                <select
                  value={coBuyerRelationship}
                  onChange={e => setCoBuyerRelationship(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
                >
                  <option value="Spouse">Spouse / Common-Law Partner</option>
                  <option value="Parent">Parent / Guarantor</option>
                  <option value="Child">Adult Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Business Partner">Business / Investment Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Co-Buyer Email Address
                </label>
                <input
                  type="email"
                  value={coBuyerEmail}
                  onChange={e => setCoBuyerEmail(e.target.value)}
                  placeholder="sarah.miller@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Co-Buyer Phone Number
                </label>
                <input
                  type="tel"
                  value={coBuyerPhone}
                  onChange={e => setCoBuyerPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(416) 555-0193"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 text-center">
              Single applicant purchasing alone. Check the box above if you plan to purchase jointly with a spouse or partner.
            </div>
          )}
        </div>

        {/* Section 4: Financing & Mortgage Readiness */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Mortgage Qualification & Down Payment Readiness</h2>
                <p className="text-xs text-stone-500">Helps determine if financing conditions are required in offers and validates builder deposit requirements</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Stress-Tested (OSFI B-20)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Mortgage Pre-Approval Status
              </label>
              <select
                value={mortgagePreApprovalStatus}
                onChange={e => setMortgagePreApprovalStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              >
                <option value="Fully Pre-Approved">Fully Pre-Approved with Rate Hold Certificate</option>
                <option value="In Progress">In Progress (Gathering documents with broker)</option>
                <option value="Need Broker Referral">Need Mortgage Specialist Referral from Amit Sawhney</option>
                <option value="Cash Buyer">Cash Buyer (No mortgage required)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Lender / Mortgage Brokerage Name
              </label>
              <input
                type="text"
                value={lenderOrBroker}
                onChange={e => setLenderOrBroker(e.target.value)}
                placeholder="e.g. RBC Royal Bank / Mortgage Alliance"
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Pre-Approved Maximum Mortgage ($)
              </label>
              <input
                type="number"
                step={5000}
                value={preApprovalAmount}
                onChange={e => setPreApprovalAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Liquid Down Payment Available ($)
              </label>
              <input
                type="number"
                step={5000}
                value={intendedDownPayment}
                onChange={e => setIntendedDownPayment(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Verified Down Payment Source
              </label>
              <select
                value={downPaymentSource}
                onChange={e => setDownPaymentSource(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
              >
                <option value="Personal Savings & Investments">Personal Savings & Liquid Investments</option>
                <option value="First Home Savings Account (FHSA)">First Home Savings Account (FHSA)</option>
                <option value="RRSP Home Buyers Plan (HBP)">RRSP Home Buyers' Plan (HBP)</option>
                <option value="Gift from Immediate Family">Gift from Immediate Family (Gift Letter)</option>
                <option value="Proceeds from Sale of Existing Property">Proceeds from Sale of Existing Property</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={ownsExistingProperty}
                  onChange={e => setOwnsExistingProperty(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F2942] focus:ring-[#0F2942]"
                />
                <span>Currently Own Existing Residential Property</span>
              </label>

              {ownsExistingProperty && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 pl-6 animate-in fade-in">
                  <input
                    type="checkbox"
                    checked={dependsOnSaleOfCurrentHome}
                    onChange={e => setDependsOnSaleOfCurrentHome(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F2942] focus:ring-[#0F2942]"
                  />
                  <span>Purchase depends on successful sale of existing property (Conditional Offer)</span>
                </label>
              )}
            </div>

            {onNavigateTab && (
              <div className="md:col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Need to test your stress-tested borrowing range?</h4>
                    <p className="text-[11px] text-stone-600">Update income, monthly debts, and interest rates to recalculate your maximum purchase price and debt service ratios.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('affordability')}
                  className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Recalculate Affordability</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Legal Fiduciary Representation Card */}
        <div className="bg-stone-900 text-white rounded-2xl p-6 md:p-8 shadow-md border border-stone-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-5 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-[#C5A880] flex items-center justify-center border border-amber-400/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">RECO Fiduciary Agency & Representation</h3>
                <p className="text-xs text-stone-400">Licensed real estate brokerage representation under Ontario TRESA 2002 regulations</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Platinum VIP Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300">
            <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60">
              <span className="text-stone-400 block mb-1">Assigned REALTOR®</span>
              <p className="font-bold text-white text-sm">Amit Sawhney</p>
              <p className="text-[11px] text-stone-400">RECO Registration #4892105</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60">
              <span className="text-stone-400 block mb-1">Licensed Brokerage</span>
              <p className="font-bold text-white text-sm">Blueprint Realty Brokerage Inc.</p>
              <p className="text-[11px] text-stone-400">Full MLS® Fiduciary Services</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60">
              <span className="text-stone-400 block mb-1">Commission Cashback Status</span>
              <p className="font-bold text-[#C5A880] text-sm">Up to 1.0% Back on Closing</p>
              <p className="text-[11px] text-stone-400">Subject to BRA agreement</p>
            </div>
          </div>
        </div>

        {/* Section 6: Client Priorities & Notes */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Strategic Priorities & Custom Preferences for Amit Sawhney
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Need EV charging parking space, close to GO Transit in Whitby, preference for builder assignment rights and capped levies under $8,000..."
            className="w-full p-4 rounded-xl text-sm border border-stone-300 focus:ring-2 focus:ring-[#0F2942] text-stone-900 bg-stone-50/50"
          />
        </div>

        {/* Bottom Save Action Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-300 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-stone-500 hidden sm:block">
            Last updated: <span className="font-medium text-stone-700">{(user as any)?.updatedAt ? new Date((user as any).updatedAt).toLocaleString() : 'Just now'}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('overview')}
                className="px-4 py-2.5 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              id="save-client-profile-btn"
              className="px-6 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#C5A880]" />
                  <span>Save Client Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
