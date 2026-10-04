import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileText,
  Phone,
  DollarSign,
  Lock,
  Scale,
  Check,
  ArrowRight,
  Gift,
  FileCheck2,
  Share2,
  Copy,
  MessageSquare,
  Mail,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { Project } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { calculateCashback, formatCurrency } from '../utils/cashback';
import { AffordabilityIndicatorBadge } from './qualification/AffordabilityIndicatorBadge';
import { useAffordability } from '../context/AffordabilityContext';
import { generateProjectPdf } from '../utils/projectPdfGenerator';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenVIPModal: (projectId: string) => void;
  onOpenClientView: (p: Project) => void;
  isCompared?: boolean;
  onToggleCompare?: (project: Project) => void;
  onOpenCashbackEligibility?: (data: { purchasePrice: number; targetProject: string; transactionType: 'Pre-Construction'; projectId: string }) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onOpenVIPModal,
  onOpenClientView,
  isCompared = false,
  onToggleCompare,
  onOpenCashbackEligibility
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'floorplans' | 'deposit' | 'incentives' | 'cashback'>('overview');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<any>(project?.floorPlans?.[0] || null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const { requestShowing, openOfferPreparation } = useAffordability();

  if (!project) return null;

  const cashbackEst = calculateCashback(project.priceRange.min, 'Pre-Construction');

  const showNotification = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => {
      setShareToast(null);
    }, 3500);
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('project', project.id);
      return url.toString();
    } catch {
      return `${window.location.origin}/?project=${project.id}`;
    }
  };

  const getShareData = () => {
    const url = getShareUrl();
    const title = `${project.name} | VIP Pre-Construction in ${project.location.city}`;
    const text = [
      `🏗️ ${project.name} by ${project.builder}`,
      `📍 ${project.location.address}, ${project.location.city} (${project.location.region})`,
      `💰 VIP Pricing: ${project.priceRange.display}`,
      `📅 Occupancy: ${project.occupancyYear || project.status}`,
      `🏠 Property Types: ${project.propertyTypes.join(', ')}`,
      `🎁 VIP Buyer Cashback: Up to 1.0% (~${formatCurrency(cashbackEst.estimatedCashback)}) with Amit Sawhney REALTOR®`,
      ``,
      `View floor plans, deposit structures & VIP builder allocations:`,
      url
    ].join('\n');

    return { title, text, url };
  };

  // Helper to fetch project image as a File for Web Share API Level 2 (files sharing)
  const fetchImageFile = async (imageUrl: string, fileName: string): Promise<File | null> => {
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) return null;
      const blob = await res.blob();
      const mimeType = blob.type || 'image/jpeg';
      const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      return new File([blob], `${fileName}.${ext}`, { type: mimeType });
    } catch (err) {
      console.warn('Could not fetch project image file for sharing:', err);
      return null;
    }
  };

  const handleShare = async () => {
    if (!project || isSharing) return;
    setIsSharing(true);

    const { title, text, url } = getShareData();

    // Check if the Web Share API is available in this browser environment
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        let imageFile: File | null = null;

        // Attempt to fetch project image for direct file sharing
        if (project.image) {
          try {
            imageFile = await fetchImageFile(project.image, `${project.id}-preview`);
          } catch {
            // Ignore image conversion failure and proceed with link and text
          }
        }

        // Test if sharing with files is supported by user agent
        const canShareWithFile =
          imageFile &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [imageFile] });

        if (canShareWithFile && imageFile) {
          try {
            await navigator.share({
              title,
              text,
              url,
              files: [imageFile]
            });
            showNotification('Project details & image shared successfully!');
            setIsSharing(false);
            return;
          } catch (fileShareErr: any) {
            // If user explicitly dismissed or canceled the share sheet, exit gracefully
            if (fileShareErr?.name === 'AbortError') {
              setIsSharing(false);
              return;
            }
            console.warn('File share attempt failed, trying text and URL fallback:', fileShareErr);
          }
        }

        // Standard Web Share with title, descriptive text, and deep link
        await navigator.share({
          title,
          text,
          url
        });
        showNotification('Project details shared successfully!');
        setIsSharing(false);
        return;
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          setIsSharing(false);
          return;
        }
        console.warn('Web Share API error, opening interactive share sheet:', shareErr);
      }
    }

    // Web Share API unavailable or threw error -> open interactive fallback modal
    setIsSharing(false);
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showNotification('Direct project link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showNotification('Failed to copy link.');
    }
  };

  const handleCopyFullSummary = async () => {
    const { text } = getShareData();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      showNotification('Complete project details & link copied!');
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      showNotification('Failed to copy project summary.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!project || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      generateProjectPdf(project);
    } catch (err) {
      console.error('Failed to generate project PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-900 relative">
        
        {/* Modal Top Header Bar */}
        <div className="relative h-60 sm:h-72 bg-stone-900 overflow-hidden shrink-0">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Header Action Buttons Container */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {/* Header Action: Share Project via Web Share API */}
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="px-3.5 py-1.5 bg-black/60 hover:bg-black/85 text-stone-100 rounded-full border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:border-[#C5A880]/60"
              title="Share project details, image and direct link to other apps"
              id="project-modal-share-header-btn"
            >
              <Share2 className={`w-3.5 h-3.5 text-[#C5A880] ${isSharing ? 'animate-spin' : ''}`} />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>

            {/* Header Action: Download PDF Summary */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-black/60 hover:bg-black/85 text-stone-100 rounded-full border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60"
              title="Download formatted project summary as PDF"
              id="project-modal-download-pdf-header-btn"
            >
              <Download className={`w-3.5 h-3.5 text-[#C5A880] ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
              <span className="sm:hidden">{isGeneratingPdf ? '...' : 'PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 bg-black/60 hover:bg-black/80 text-stone-200 hover:text-white rounded-full border border-white/20 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-[#C5A880] text-[#111827] px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {project.status}
                </span>
                <span className="bg-black/60 text-stone-200 border border-white/20 px-2.5 py-0.5 rounded text-xs font-medium">
                  Builder: {project.builder}
                </span>
                <span className="bg-[#0F2942] text-white border border-blue-400/30 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  Registered Client View Ready
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                {project.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>{project.location.address}, {project.location.city} ({project.location.region})</span>
              </p>
            </div>

            <div className="bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0 text-right">
              <p className="text-[10px] text-stone-300 uppercase tracking-wider font-semibold">VIP Pricing From</p>
              <p className="text-xl sm:text-2xl font-black text-[#C5A880] font-serif">
                {project.priceRange.display}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 pt-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Overview & Specs
            </button>
            <button
              onClick={() => setActiveTab('floorplans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'floorplans'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Floor Plans ({project.floorPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deposit'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Deposit Structure
            </button>
            <button
              onClick={() => setActiveTab('incentives')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'incentives'
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              VIP Incentives
            </button>
            <button
              onClick={() => setActiveTab('cashback')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'cashback'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Cashback (Up to {formatCurrency(cashbackEst.estimatedCashback)}*)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pb-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(project)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isCompared
                    ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                {isCompared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>In Comparison</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5 text-stone-500" />
                    <span>Compare Project</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`tel:${AMIT_SAWHNEY.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#8C6D43] font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Amit: {AMIT_SAWHNEY.phoneFormatted}</span>
            </a>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Dynamic Buyer Mortgage Affordability Evaluation Badge (Displayed only after user calculates range) */}
              <AffordabilityIndicatorBadge
                propertyPrice={project.priceRange.min}
                minPrice={project.priceRange.min}
                maxPrice={project.priceRange.max}
                isPrecon={true}
                className="mb-1"
              />

              {/* Buy Smart, Save Big Cashback Banner */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-stone-50 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Buy Smart, Save Big™ Commission Cashback Eligible</span>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    Purchase at {project.name} through Amit Sawhney REALTOR® and receive professional fiduciary representation, builder incentives, plus an estimated cashback of up to <strong className="text-amber-950 font-bold">{formatCurrency(cashbackEst.estimatedCashback)}*</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('cashback')}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>View Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onOpenCashbackEligibility && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCashbackEligibility({
                          purchasePrice: project.priceRange.min,
                          targetProject: project.name,
                          transactionType: 'Pre-Construction',
                          projectId: project.id
                        });
                      }}
                      className="px-3.5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Check Eligibility
                    </button>
                  )}
                </div>
              </div>

              {/* Registered Client Portal Banner */}
              <div className="bg-[#0F2942]/5 border border-[#0F2942]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2942]">
                    <ShieldCheck className="w-4 h-4 text-[#0F2942]" />
                    <span>Exclusive Registered Client Portal</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Access real-time developer inventory worksheets, unit pricing matrices, site plans, and official documentation reserved for registered clients.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenClientView(project);
                  }}
                  className="shrink-0 px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#C5A880]" />
                  <span>Launch Client View Portal</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-2 font-serif">Project Description</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                <div>
                  <p className="text-stone-500">Total Units</p>
                  <p className="text-sm font-bold text-stone-900">{project.totalUnits} Suites</p>
                </div>
                <div>
                  <p className="text-stone-500">Occupancy Year</p>
                  <p className="text-sm font-bold text-[#8C6D43]">{project.occupancyYear}</p>
                </div>
                <div>
                  <p className="text-stone-500">Intersection</p>
                  <p className="text-sm font-bold text-stone-900">{project.location.intersection}</p>
                </div>
                <div>
                  <p className="text-stone-500">Property Types</p>
                  <p className="text-sm font-bold text-stone-900">{project.propertyTypes.join(', ')}</p>
                </div>
              </div>

              {/* Highlights List */}
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-3 font-serif">Key Project Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.highlights.map((hl, idx) => (
                    <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#0F2942] shrink-0 mt-0.5" />
                      <span className="text-stone-700">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'floorplans' && (
            <div className="space-y-6">
              {/* Floor Plans PDF Download Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif">
                    Architectural Floor Plans & Suite Specifications ({project.floorPlans.length} Designs)
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Download complete suite metrics, square footage, starting prices, and VIP deposit milestones formatted as a printable PDF brief.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer disabled:opacity-60"
                  id="project-modal-download-floorplans-pdf-btn"
                >
                  <Download className={`w-3.5 h-3.5 text-[#C5A880] ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Floor Plans PDF'}</span>
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Browse sample VIP floor plan layouts below. Full confidential floor plan packages and price sheets are available upon registering interest with <strong className="text-[#8C6D43]">{AMIT_SAWHNEY.name}</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.floorPlans.map(fp => (
                  <div
                    key={fp.id}
                    onClick={() => setSelectedFloorPlan(fp)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedFloorPlan?.id === fp.id
                        ? 'bg-stone-50 border-[#0F2942] shadow-md ring-1 ring-[#0F2942]'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#8C6D43]">{fp.type}</span>
                      <span className="text-xs font-extrabold text-stone-900">{fp.sqft} Sq.Ft.</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#111827] font-serif">{fp.name}</h4>
                    <p className="text-xs text-stone-500 mt-1">Starting From: <strong className="text-stone-800">{fp.startingPrice}</strong></p>

                    <ul className="mt-3 space-y-1 text-[11px] text-stone-600 border-t border-stone-200 pt-2">
                      {fp.features.map((ft, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#0F2942] shrink-0" />
                          <span>{ft}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-2 font-serif">Extended VIP Deposit Milestone Schedule</h3>
                <p className="text-xs text-stone-600">
                  Pre-construction deposits in Ontario allow you to lock in property appreciation with staggered payments over time.
                </p>
              </div>

              <div className="space-y-3">
                {project.depositStructure.map((dep, idx) => (
                  <div key={idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#111827] text-sm">{dep.stage}</p>
                      <p className="text-stone-500">Timing: <strong className="text-stone-800">{dep.timing}</strong></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8C6D43] font-extrabold text-base">{dep.percentage}%</p>
                      <p className="text-[11px] text-stone-500">{dep.estimatedAmount || 'Contact Agent'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'incentives' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#111827] mb-2 font-serif">Exclusive Platinum VIP Buyer Incentives</h3>
                <p className="text-xs text-stone-600">
                  Working with REALTOR® Amit Sawhney unlocks these builder incentives at zero additional cost to you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.vipIncentives.map((inc, i) => (
                  <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#8C6D43] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#111827]">{inc}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Negotiated exclusively by Blueprint Realty</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cashback' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>The "Buy Smart, Save Big™" Formula for {project.name}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  When you purchase a unit at <strong>{project.name}</strong> represented by Amit Sawhney (REALTOR®, Blueprint Realty), you never have to choose between full representation and financial savings. You receive full fiduciary guidance, builder incentives, and cash back upon closing.
                </p>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Starting Price</p>
                  <p className="text-xl font-extrabold text-[#111827] font-serif mt-1">{project.priceRange.display}</p>
                  <p className="text-[10px] text-stone-500 mt-1">Starting tier for this project</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Estimated Buyer Cashback</p>
                  <p className="text-xl font-extrabold text-amber-900 font-serif mt-1">
                    {formatCurrency(cashbackEst.estimatedCashback)}*
                  </p>
                  <p className="text-[10px] text-amber-700 mt-1">Direct wire/bank transfer upon closing</p>
                </div>
                <div className="bg-[#0F2942] text-white p-4 rounded-2xl border border-[#0F2942] text-center">
                  <p className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider">Total Buyer Value</p>
                  <p className="text-xl font-extrabold text-white font-serif mt-1">
                    {formatCurrency(cashbackEst.totalBuyerBenefit)}*
                  </p>
                  <p className="text-[10px] text-stone-300 mt-1">Cashback + Builder VIP concessions</p>
                </div>
              </div>

              {/* 3 Pillars List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#111827] font-serif">What's Included When You Buy Through Us:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-bold text-[#0F2942] mb-1">1. Fiduciary Realtor Advice</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Independent 10-day cooling-off rescission review, Tarion warranty verification, and capped development levy protection.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-bold text-[#0F2942] mb-1">2. Platinum Builder Incentives</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      First-access VIP pricing, extended deposit structures, free assignment clauses, and right to lease during occupancy.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="font-bold text-[#0F2942] mb-1">3. Legally Binding Rebate</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Documented in writing in your Buyer Representation Agreement Schedule before signing, paid securely post-completion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onOpenCashbackEligibility && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCashbackEligibility({
                        purchasePrice: project.priceRange.min,
                        targetProject: project.name,
                        transactionType: 'Pre-Construction',
                        projectId: project.id
                      });
                    }}
                    className="w-full py-3 px-4 bg-[#0F2942] hover:bg-[#163857] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    <span>Check Eligibility & Lock In Cashback on {project.name}</span>
                  </button>
                </div>
              )}

              <p className="text-[10px] text-stone-500 leading-relaxed italic">
                *Estimated cashback is based on a standard 2.5% co-operating builder commission and a 40% buyer rebate tier. Not intended to solicit buyers currently under an exclusive representation agreement with another brokerage. Terms subject to written representation agreement and lender approval.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Fixed CTA */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C5A880] shrink-0">
              <img
                src={AMIT_SAWHNEY.photo}
                alt={AMIT_SAWHNEY.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{AMIT_SAWHNEY.name}</p>
              <p className="text-[11px] text-[#8C6D43] font-semibold">{AMIT_SAWHNEY.phoneFormatted}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Share Project CTA */}
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#C5A880]"
              title="Share project details, image, and link directly to other apps"
              id="project-modal-share-footer-btn"
            >
              <Share2 className={`w-4 h-4 text-[#8C6D43] ${isSharing ? 'animate-spin' : ''}`} />
              <span>{isSharing ? 'Sharing...' : 'Share Project'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Download formatted project executive summary as PDF"
              id="project-modal-download-pdf-footer-btn"
            >
              <Download className={`w-4 h-4 text-[#8C6D43] ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF Summary'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                openOfferPreparation({
                  targetId: project.id,
                  targetTitle: project.name,
                  targetPrice: project.priceRange.min,
                  targetAddress: `${project.location.address}, ${project.location.city}`,
                  targetType: 'Pre-Construction'
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Prepare Offer / Worksheet</span>
            </button>

            <button
              onClick={() => {
                onClose();
                requestShowing({
                  targetId: project.id,
                  targetTitle: project.name,
                  targetPrice: project.priceRange.min,
                  targetAddress: `${project.location.address}, ${project.location.city}`,
                  targetType: 'Pre-Construction'
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#C5A880] hover:bg-[#B89758] text-[#111827] font-extrabold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Gallery Tour</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenVIPModal(project.id);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <span>VIP Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-stone-950/95 text-white border border-[#C5A880]/60 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-slideDown pointer-events-auto"
        >
          <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Interactive Fallback Share Sheet / App Selector Dialog */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[65] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-stone-900 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Share Dialog Header */}
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                    Share {project.name}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Send project specs, pricing, and links directly to other apps
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project Summary Preview Box */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-2xs">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#C5A880] text-stone-950">
                      {project.status}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium truncate">
                      {project.builder}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 truncate">
                    {project.name}
                  </h4>
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8C6D43] shrink-0" />
                    <span className="truncate">{project.location.address}, {project.location.city}</span>
                  </p>
                  <p className="text-xs font-black text-[#8C6D43] mt-1">
                    {project.priceRange.display}
                  </p>
                </div>
              </div>

              {/* Direct App Share Options */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Share Directly to Apps
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareData().text)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-1 text-emerald-800 transition-all text-center group cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">WhatsApp</span>
                  </a>

                  {/* SMS / Messages */}
                  <a
                    href={`sms:?&body=${encodeURIComponent(getShareData().title + '\n' + getShareData().url)}`}
                    className="p-3 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl flex flex-col items-center justify-center gap-1 text-blue-800 transition-all text-center group cursor-pointer shadow-2xs"
                  >
                    <Phone className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Messages / SMS</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(getShareData().title)}&body=${encodeURIComponent(getShareData().text)}`}
                    className="p-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl flex flex-col items-center justify-center gap-1 text-purple-800 transition-all text-center group cursor-pointer shadow-2xs"
                  >
                    <Mail className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Email Client</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareData().title)}&url=${encodeURIComponent(getShareData().url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl flex flex-col items-center justify-center gap-1 text-stone-800 transition-all text-center group cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-5 h-5 text-stone-700 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">X (Twitter)</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareData().url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl flex flex-col items-center justify-center gap-1 text-sky-800 transition-all text-center group cursor-pointer shadow-2xs"
                  >
                    <Building2 className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">LinkedIn</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareData().url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-1 text-indigo-800 transition-all text-center group cursor-pointer shadow-2xs"
                  >
                    <Share2 className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Facebook</span>
                  </a>
                </div>
              </div>

              {/* Direct Link Copy Bar */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Project Deep Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-700 text-xs font-mono select-all focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Full Text Summary Copy */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyFullSummary}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700">Project Specs & Pricing Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-[#8C6D43]" />
                      <span>Copy Formatted Summary & Specs to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              {/* System Share Trigger (if supported) */}
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <div className="pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareModal(false);
                      handleShare();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C5A880] hover:bg-[#b89758] text-stone-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Launch Native Device Share Sheet</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
