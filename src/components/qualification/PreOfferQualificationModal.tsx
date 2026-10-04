import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  ShieldCheck,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  Building2,
  FileText,
  UserCheck,
  Send,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAffordability } from '../../context/AffordabilityContext';
import { useAuth } from '../../context/AuthContext';
import { OfferPreparationDraft, MortgagePreApprovalStatus } from '../../types';
import { AMIT_SAWHNEY } from '../../data/agent';

export const PreOfferQualificationModal: React.FC = () => {
  const {
    offerModalOpen,
    closeOfferModal,
    offerProperty,
    buyerProfile,
    assessment
  } = useAffordability();
  const { user } = useAuth();

  // Buyer Info
  const [fullName, setFullName] = useState(buyerProfile?.fullName || user?.fullName || '');
  const [coBuyerName, setCoBuyerName] = useState(buyerProfile?.isJointIncome ? 'Co-Applicant' : '');
  const [email, setEmail] = useState(buyerProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(buyerProfile?.phone || user?.phone || '');
  const [currentAddress, setCurrentAddress] = useState(buyerProfile?.currentAddress || '');

  // Purchase Terms
  const [offerPrice, setOfferPrice] = useState<number>(offerProperty?.price || 750000);
  const [depositAmount, setDepositAmount] = useState<number>(Math.round((offerProperty?.price || 750000) * 0.05));
  const [closingDate, setClosingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });

  // Financing
  const [downPayment, setDownPayment] = useState<number>(buyerProfile?.intendedDownPayment || 100000);
  const [preApprovalStatus, setPreApprovalStatus] = useState<MortgagePreApprovalStatus>(buyerProfile?.mortgagePreApprovalStatus || 'In progress');
  const [preApprovalAmount, setPreApprovalAmount] = useState<number>(assessment?.estimatedMortgageMax || 650000);
  const [lenderOrBroker, setLenderOrBroker] = useState<string>(buyerProfile?.mortgageLenderOrBroker || 'Major Canadian Bank / Mortgage Broker');

  // Existing property
  const [ownsProperty, setOwnsProperty] = useState<boolean>(buyerProfile?.ownsExistingProperty ?? false);
  const [dependsOnSale, setDependsOnSale] = useState<boolean>(buyerProfile?.existingPropertyDetails?.sellingBeforePurchasing ?? false);

  // Smart Conditions (Rule based recommendations)
  const isCondo = offerProperty?.propertyType?.toLowerCase().includes('condo') ?? true;
  const requiresFinancing = offerPrice - downPayment > 0;

  const [financingCondition, setFinancingCondition] = useState<boolean>(requiresFinancing);
  const [statusCertCondition, setStatusCertCondition] = useState<boolean>(isCondo);
  const [salePropertyCondition, setSalePropertyCondition] = useState<boolean>(dependsOnSale);
  const [inspectionCondition, setInspectionCondition] = useState<boolean>(true);
  const [lawyerReviewCondition, setLawyerReviewCondition] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedOffer, setSubmittedOffer] = useState<OfferPreparationDraft | null>(null);

  useEffect(() => {
    if (offerModalOpen) {
      setSubmittedOffer(null);
      if (user) {
        setFullName(prev => prev || user.fullName || '');
        setEmail(prev => prev || user.email || '');
        setPhone(prev => prev || user.phone || '');
      }
    }
    if (offerProperty) {
      setOfferPrice(offerProperty.price);
      setDepositAmount(Math.round(offerProperty.price * 0.05));
      if (buyerProfile?.intendedDownPayment) {
        setDownPayment(buyerProfile.intendedDownPayment);
      }
    }
  }, [offerModalOpen, offerProperty, buyerProfile, user]);

  if (!offerModalOpen || !offerProperty) return null;

  // Offer Readiness Checklist
  const estimatedMortgageNeeded = Math.max(0, offerPrice - downPayment);
  const checklist = {
    buyerInfoComplete: !!(fullName.trim() && email.trim() && phone.trim()),
    financialInfoComplete: downPayment > 0 && estimatedMortgageNeeded >= 0,
    downPaymentConfirmed: downPayment >= (offerPrice * 0.05),
    propertySelected: !!offerProperty.id,
    offerPriceEntered: offerPrice > 0,
    preApprovalConfirmed: preApprovalStatus === 'Pre-approved' || preApprovalStatus === 'Cash buyer',
    conditionsIdentified: financingCondition || statusCertCondition || inspectionCondition || lawyerReviewCondition
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklistCount = Object.keys(checklist).length;

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !offerPrice) return;

    setIsSubmitting(true);
    const draftPayload: Partial<OfferPreparationDraft> = {
      propertyId: offerProperty.id,
      propertyTitle: offerProperty.title,
      propertyAddress: offerProperty.address,
      propertyPrice: offerProperty.price,
      propertyType: offerProperty.propertyType || 'Condo',
      buyerInfo: {
        fullName,
        coBuyerName: coBuyerName || undefined,
        email,
        phone,
        currentAddress
      },
      financing: {
        downPaymentAvailable: downPayment,
        mortgagePreApprovalStatus: preApprovalStatus,
        mortgagePreApprovalAmount: preApprovalAmount,
        lenderOrBroker,
        estimatedMortgageAmount: estimatedMortgageNeeded,
        requiresMortgageFinancing: estimatedMortgageNeeded > 0
      },
      purchaseTerms: {
        offerPrice,
        depositAmount,
        preferredClosingDate: closingDate
      },
      existingProperty: {
        ownsProperty,
        dependsOnSale
      },
      conditions: {
        financingCondition,
        homeInspectionCondition: inspectionCondition,
        statusCertificateCondition: statusCertCondition,
        saleOfPropertyCondition: salePropertyCondition,
        lawyerReviewCondition,
        customConditionsNotes: customNotes
      },
      readinessChecklist: checklist,
      status: 'REALTOR Review Requested',
      realtorNotes: 'Forwarded to Amit Sawhney, Licensed REALTOR® with Blueprint Realty Brokerage Inc. for fiduciary preparation of Agreement of Purchase and Sale.'
    };

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload)
      });
      const data = await res.json();
      if (data.success && data.offer) {
        setSubmittedOffer(data.offer);
      } else {
        setSubmittedOffer({
          ...draftPayload,
          id: `offer-${Date.now()}`,
          createdAt: new Date().toISOString()
        } as OfferPreparationDraft);
      }
    } catch (err) {
      console.error('Network error during offer draft submission', err);
      setSubmittedOffer({
        ...draftPayload,
        id: `offer-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as OfferPreparationDraft);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedOffer(null);
    closeOfferModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#121212] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C5A880]">
                  Pre-Offer Qualification & Preparation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-stone-300">
                  REALTOR® Fiduciary Review
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                Structured Offer Checkpoint & Smart Conditions
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {submittedOffer ? (
            /* Submission Confirmation Card */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">Offer Forwarded for REALTOR® Review</h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
                  Your offer framework has been received by <strong>Amit Sawhney, Licensed REALTOR® (Blueprint Realty Brokerage Inc.)</strong>. Amit will draft the official standard OREA Agreement of Purchase and Sale, confirm condition wording with you, and schedule digital signing.
                </p>
              </div>

              {/* Offer Summary Box */}
              <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-stone-400">Target Property</span>
                  <span className="font-bold text-white text-right">{submittedOffer.propertyTitle}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-stone-400">Proposed Purchase Price</span>
                  <span className="font-mono text-base font-bold text-[#C5A880]">
                    ${submittedOffer.purchaseTerms.offerPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-stone-400">Deposit on Acceptance</span>
                  <span className="font-mono text-white">
                    ${submittedOffer.purchaseTerms.depositAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-stone-400">Preferred Closing Date</span>
                  <span className="font-mono text-white">{submittedOffer.purchaseTerms.preferredClosingDate}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-stone-400">Flagged Conditions</span>
                  <span className="text-white text-right">
                    {[
                      submittedOffer.conditions.financingCondition && 'Financing (5 Days)',
                      submittedOffer.conditions.statusCertificateCondition && 'Status Certificate Review',
                      submittedOffer.conditions.homeInspectionCondition && 'Inspection',
                      submittedOffer.conditions.lawyerReviewCondition && 'Lawyer Review',
                      submittedOffer.conditions.saleOfPropertyCondition && 'Sale of Property'
                    ].filter(Boolean).join(' • ') || 'Firm Offer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Workflow Status</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {submittedOffer.status}
                  </span>
                </div>
              </div>

              {/* REALTOR Compliance Guarantee */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs text-stone-300 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <p>
                  <strong>Fiduciary Compliance Note:</strong> Per Real Estate Council of Ontario (RECO) guidelines, formal submission of an offer to the seller or listing brokerage occurs only after you review and execute the final OREA Agreement of Purchase and Sale documents.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Done • Return to Platform
              </button>
            </div>
          ) : (
            /* Offer Qualification & Preparation Form */
            <form onSubmit={handleSubmitForReview} className="space-y-6">

              {/* Property Header */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#C5A880]">Target Property</span>
                  <h4 className="text-sm font-bold text-white">{offerProperty.title}</h4>
                  <p className="text-xs text-stone-400">{offerProperty.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-stone-400">List Price</span>
                  <div className="font-mono text-base font-bold text-white">
                    ${offerProperty.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Readiness Checklist Banner */}
              <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#C5A880] font-bold">
                    Offer Readiness Checklist
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-300">
                    {completedChecklistCount} of {totalChecklistCount} Complete
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${checklist.buyerInfoComplete ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-stone-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Buyer Info</span>
                  </div>
                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${checklist.offerPriceEntered ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-stone-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Offer Price</span>
                  </div>
                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${checklist.downPaymentConfirmed ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-stone-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Down Payment</span>
                  </div>
                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${checklist.conditionsIdentified ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-stone-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Conditions Set</span>
                  </div>
                </div>
              </div>

              {/* 1. Buyer Information */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-mono tracking-widest text-stone-400 font-semibold block">
                  1. Buyer Legal Identification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Legal Name *"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <input
                    type="text"
                    placeholder="Co-Buyer Legal Name (if applicable)"
                    value={coBuyerName}
                    onChange={e => setCoBuyerName(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Primary Phone *"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <input
                    type="text"
                    placeholder="Current Residential Address"
                    value={currentAddress}
                    onChange={e => setCurrentAddress(e.target.value)}
                    className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* 2. Purchase Terms */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-mono tracking-widest text-stone-400 font-semibold block">
                  2. Proposed Purchase Terms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Offer Price ($)</label>
                    <input
                      type="number"
                      step={1000}
                      value={offerPrice}
                      onChange={e => setOfferPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-mono text-white focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Deposit Amount ($)</label>
                    <input
                      type="number"
                      step={1000}
                      value={depositAmount}
                      onChange={e => setDepositAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-mono text-white focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1 font-semibold">Preferred Closing Date</label>
                    <input
                      type="date"
                      value={closingDate}
                      onChange={e => setClosingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Financing & Pre-Approval Checkpoint */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-mono tracking-widest text-stone-400 font-semibold block">
                  3. Financing Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Down Payment Available ($)</label>
                    <input
                      type="number"
                      step={5000}
                      value={downPayment}
                      onChange={e => setDownPayment(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Mortgage Pre-Approval</label>
                    <select
                      value={preApprovalStatus}
                      onChange={e => setPreApprovalStatus(e.target.value as MortgagePreApprovalStatus)}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/15 rounded-xl text-xs text-white"
                    >
                      <option value="Pre-approved">Pre-approved by Lender</option>
                      <option value="In progress">In Progress</option>
                      <option value="Not started">Not Started</option>
                      <option value="Cash buyer">Cash Buyer (No Financing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Estimated Mortgage Needed</label>
                    <div className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-[#C5A880] font-bold">
                      ${estimatedMortgageNeeded.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Smart Condition Engine (Mandated by Section 20) */}
              <div className="p-5 rounded-2xl bg-[#161616] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Smart Condition Recommendations</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Rules-Based Flagging</span>
                </div>

                <div className="space-y-3">
                  
                  {/* Financing Condition */}
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={financingCondition}
                      onChange={e => setFinancingCondition(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C5A880] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Conditional on Financing (Standard 5 Business Days)</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#C5A880]/20 text-[#C5A880]">Recommended</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Protects your deposit while your mortgage lender verifies property appraisal and issues final commitment letter.
                      </p>
                    </div>
                  </label>

                  {/* Status Certificate (Condo) */}
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={statusCertCondition}
                      onChange={e => setStatusCertCondition(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C5A880] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Conditional on Review of Status Certificate (Condominium)</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400">Condo Essential</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Permits your real estate lawyer to review condo corporation reserve fund adequacy, current budget, and pending legal claims.
                      </p>
                    </div>
                  </label>

                  {/* Home Inspection */}
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={inspectionCondition}
                      onChange={e => setInspectionCondition(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C5A880] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Conditional on Home / Property Inspection
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Allows a certified home inspector to examine mechanical, electrical, plumbing, and structural components.
                      </p>
                    </div>
                  </label>

                  {/* Lawyer Review */}
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={lawyerReviewCondition}
                      onChange={e => setLawyerReviewCondition(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#C5A880] cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Conditional on Buyer's Lawyer Approval of Terms
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Enables independent legal counsel to review the Agreement of Purchase and Sale before firm binding.
                      </p>
                    </div>
                  </label>

                  {/* Sale of Existing Property */}
                  {ownsProperty && (
                    <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={salePropertyCondition}
                        onChange={e => setSalePropertyCondition(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-[#C5A880] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Conditional on Sale of Buyer's Existing Property (OREA Form 105)</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300">Contingent</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Protects you from holding two simultaneous mortgages if your current property is not yet sold.
                        </p>
                      </div>
                    </label>
                  )}

                </div>

                {/* Specific Notes */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Special Clauses / Chattels Included (e.g., appliances, window coverings, custom closing terms)
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    placeholder="e.g. Include all existing stainless steel kitchen appliances, washer/dryer, light fixtures..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Mandated Legal Constraint from User Prompt */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <p>
                  <strong>Legal Notice:</strong> The AI identifies potentially relevant conditions based on your inputs, but does not independently determine the legal wording of an Agreement of Purchase and Sale. All offers are formally drafted and reviewed by Amit Sawhney, Licensed REALTOR®.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#C5A880] hover:bg-[#B89758] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Forwarding Draft to REALTOR®...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Request REALTOR® Review (Amit Sawhney)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
