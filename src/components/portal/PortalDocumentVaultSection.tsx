import React, { useState, useEffect, useRef } from 'react';
import {
  FolderLock,
  FileCheck2,
  FileText,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Building2,
  Lock,
  Search,
  Upload,
  Calendar,
  X,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Info,
  DollarSign,
  FileSignature,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ClientVaultDocument, VaultDocumentCategory, VaultDocumentStatus, VaultDocumentAttachment } from '../../types';
import { generateVaultDocumentPdf } from '../../utils/vaultPdfGenerator';
import { AMIT_SAWHNEY } from '../../data/agent';
import { downloadAttachmentFile, formatBytes } from '../../utils/attachmentUtils';

interface PortalDocumentVaultSectionProps {
  onNavigateToWorksheets?: () => void;
  onNavigateToOffers?: () => void;
}

export const PortalDocumentVaultSection: React.FC<PortalDocumentVaultSectionProps> = ({
  onNavigateToWorksheets,
  onNavigateToOffers
}) => {
  const { user, getAuthHeaders } = useAuth();

  const [documents, setDocuments] = useState<ClientVaultDocument[]>([]);
  const [metrics, setMetrics] = useState<{
    totalCount: number;
    pendingSignatureCount: number;
    signedCount: number;
    coolingOffDaysRemaining: number | null;
    unitNumber: string;
    projectName: string;
  }>({
    totalCount: 0,
    pendingSignatureCount: 0,
    signedCount: 0,
    coolingOffDaysRemaining: null,
    unitNumber: 'Suite 404',
    projectName: 'Brooklin Trails By Tribute Communities'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [viewingDoc, setViewingDoc] = useState<ClientVaultDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<ClientVaultDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Signing state
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(user?.fullName || 'David Miller');
  const [selectedFont, setSelectedFont] = useState<string>('font-cursive-1');
  const [legalConsentChecked, setLegalConsentChecked] = useState(false);
  const [isSigningSubmitting, setIsSigningSubmitting] = useState(false);
  const [signSuccessNotice, setSignSuccessNotice] = useState<{
    title: string;
    certId: string;
    doc: ClientVaultDocument;
  } | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<VaultDocumentCategory>('APS Agreement');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [clientAttachment, setClientAttachment] = useState<VaultDocumentAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Canvas ref for drawing signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/client/documents', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } else {
        setError('Unable to load document vault. Please verify your authentication.');
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Connection error loading document vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F2942'; // Luxury dark navy ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Open Signing Modal
  const handleOpenSignModal = (doc: ClientVaultDocument) => {
    setSigningDoc(doc);
    setLegalConsentChecked(false);
    setSignatureMode('draw');
    setHasDrawn(false);
    setTypedName(user?.fullName || 'David Miller');
    setSignSuccessNotice(null);
  };

  // Submit Signature
  const handleSubmitSignature = async () => {
    if (!signingDoc) return;
    if (!legalConsentChecked) {
      alert('Please check the legal consent checkbox to confirm your electronic signature.');
      return;
    }

    let signatureDataUrl: string | undefined = undefined;
    if (signatureMode === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        alert('Please draw your signature on the pad before confirming.');
        return;
      }
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      if (!typedName.trim()) {
        alert('Please enter your full legal name.');
        return;
      }
    }

    setIsSigningSubmitting(true);
    try {
      const res = await fetch(`/api/client/documents/${signingDoc.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          signatureDataUrl,
          signatureType: signatureMode,
          signerName: typedName.trim(),
          typedFont: selectedFont,
          legalConsentText:
            'I consent to electronic signature execution under the Ontario Electronic Commerce Act (ECA, 2000) and RECO digital guidelines.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedDoc = data.document;

        // Update local state
        setDocuments(prev => prev.map(d => (d.id === updatedDoc.id ? updatedDoc : d)));
        setMetrics(prev => ({
          ...prev,
          pendingSignatureCount: Math.max(0, prev.pendingSignatureCount - 1),
          signedCount: prev.signedCount + 1
        }));

        setSignSuccessNotice({
          title: updatedDoc.title,
          certId: data.certificateId,
          doc: updatedDoc
        });

        // If viewing this doc, update viewer too
        if (viewingDoc && viewingDoc.id === updatedDoc.id) {
          setViewingDoc(updatedDoc);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit electronic signature.');
      }
    } catch (err) {
      console.error('Error signing document:', err);
      alert('Network error while recording signature. Please try again.');
    } finally {
      setIsSigningSubmitting(false);
    }
  };

  // Submit Custom Document Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/client/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          category: uploadCategory,
          description: uploadDescription.trim() || 'Client-uploaded legal file.',
          unitNumber: metrics.unitNumber,
          projectName: metrics.projectName,
          fileSize: clientAttachment?.fileSize || '1.4 MB',
          attachment: clientAttachment || undefined,
          sourceType: 'client_upload'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(prev => [data.document, ...prev]);
        setMetrics(prev => ({ ...prev, totalCount: prev.totalCount + 1, signedCount: prev.signedCount + 1 }));
        setIsUploadModalOpen(false);
        setUploadTitle('');
        setUploadDescription('');
        setUploadFileName('');
        setClientAttachment(null);
      } else {
        alert('Failed to upload document.');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Connection error during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.unitNumber.toLowerCase().includes(q) ||
        doc.projectName.toLowerCase().includes(q) ||
        doc.tags.some(t => t.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Status filter
    if (selectedStatus === 'pending' && doc.status !== 'Pending Signature') return false;
    if (selectedStatus === 'signed' && doc.status !== 'Signed & Executed') return false;
    if (selectedStatus === 'reference' && doc.status !== 'Reference Only') return false;

    // Category filter
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;

    return true;
  });

  const pendingDocs = documents.filter(d => d.status === 'Pending Signature');

  return (
    <div className="space-y-8 animate-in fade-in" id="portal-document-vault-section">
      {/* 1. Header & Unit Summary Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-[#0F2942] to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-5 pointer-events-none flex items-center justify-center">
          <FolderLock className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/30 text-[#C5A880] text-xs font-bold">
              <FolderLock className="w-3.5 h-3.5" />
              <span>Pre-Construction Unit Legal Vault</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Document Vault & Digital Signatures
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Securely view, sign, and download your binding Agreements of Purchase and Sale (APS), architectural floor plan
              addendums, and Tarion warranty disclosures for your allocated pre-construction residence.
            </p>
          </div>

          {/* Unit Badge Card */}
          <div className="bg-stone-950/60 border border-stone-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between text-xs text-[#C5A880] font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Allocated Unit File
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
                Contract Active
              </span>
            </div>

            <p className="text-base font-bold text-white tracking-tight">{metrics.unitNumber}</p>
            <p className="text-xs text-stone-300 font-medium">{metrics.projectName}</p>

            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Assigned Broker:</span>
              <span className="text-stone-200 font-semibold">{AMIT_SAWHNEY.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-[#C5A880]/50 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Total Documents</span>
            <FileText className="w-4 h-4 text-[#0F2942]" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{documents.length}</p>
          <p className="text-[11px] text-stone-400 mt-1">Stored securely in RECO vault</p>
        </div>

        {/* Action Required: Pending Signature */}
        <div
          onClick={() => setSelectedStatus('pending')}
          className={`rounded-2xl p-5 border shadow-xs transition-all cursor-pointer ${
            metrics.pendingSignatureCount > 0
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-stone-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5" /> Pending Signature
            </span>
            {metrics.pendingSignatureCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-bold text-amber-900">{metrics.pendingSignatureCount}</p>
          <p className="text-[11px] text-amber-700 mt-1">
            {metrics.pendingSignatureCount > 0 ? 'Requires purchaser e-signature' : 'All signatures up to date'}
          </p>
        </div>

        {/* Fully Executed */}
        <div
          onClick={() => setSelectedStatus('signed')}
          className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Executed & Signed
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">{metrics.signedCount}</p>
          <p className="text-[11px] text-stone-400 mt-1">Digitally certified with audit trail</p>
        </div>

        {/* Statutory Cooling Off Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-[#0F2942] mb-2">
            <span className="text-xs font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C5A880]" /> 10-Day Cooling Off
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">Condo Act</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {metrics.coolingOffDaysRemaining !== null ? `${metrics.coolingOffDaysRemaining} Days` : 'Protected'}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">Section 73 lawyer review window</p>
        </div>
      </div>

      {/* 3. Action Alert Banner (when signatures are pending) */}
      {pendingDocs.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Action Required: {pendingDocs.length} Pre-Construction Document{pendingDocs.length > 1 ? 's' : ''} Awaiting Digital Signature
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Execute your <span className="font-semibold">{pendingDocs[0]?.title}</span> to finalize your unit reservation and secure Platinum VIP pricing before the builder cutoff.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenSignModal(pendingDocs[0])}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Sign Now ({pendingDocs[0]?.unitNumber})</span>
          </button>
        </div>
      )}

      {/* 4. Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, clause, unit, or category..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:bg-white text-stone-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedStatus === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedStatus === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Pending</span>
              {metrics.pendingSignatureCount > 0 && (
                <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
                  {metrics.pendingSignatureCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('signed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedStatus === 'signed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Signed ({metrics.signedCount})
            </button>
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="APS Agreement">APS Agreements</option>
            <option value="Floor Plan Addendum">Floor Plan Addendums</option>
            <option value="VIP Incentives & Levies">VIP Incentives & Levies</option>
            <option value="Tarion Disclosure">Tarion Disclosures</option>
            <option value="Deposit Receipt">Deposit Receipts</option>
          </select>

          {/* Upload Custom Doc */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Upload lawyer review notes, mortgage pre-approval, or bank draft receipt"
          >
            <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* 5. Documents Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
          <div className="w-10 h-10 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-stone-900">Loading your secure document vault...</p>
          <p className="text-xs text-stone-500 mt-1">Retrieving legal instruments and Tarion disclosure schedules</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 shadow-xs">
          <FolderLock className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">No documents match your filters</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Try resetting your search query or status filter to view all agreements and disclosure schedules in your vault.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map(doc => {
            const isPending = doc.status === 'Pending Signature';
            const isSigned = doc.status === 'Signed & Executed';

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isPending ? 'border-amber-300 ring-1 ring-amber-400/30' : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-3.5">
                  {/* Category & Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{doc.category}</span>
                    </span>

                    {isPending ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                        <PenTool className="w-3 h-3" /> Sign Pending
                      </span>
                    ) : isSigned ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed & Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {doc.status}
                      </span>
                    )}
                  </div>

                  {/* Title & Unit */}
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0F2942] leading-snug line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{doc.projectName} • {doc.unitNumber}</span>
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Signature Details (if signed) */}
                  {isSigned && doc.signature && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-950 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Signed by {doc.signature.signerName}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          {new Date(doc.signature.signedAt).toLocaleDateString('en-CA')}
                        </span>
                      </div>
                      <p className="font-mono text-[9px] text-emerald-700 truncate">
                        ID: {doc.signature.certificateId}
                      </p>
                    </div>
                  )}

                  {/* Attached Local System File Badge */}
                  {doc.attachment && (
                    <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-2xs ${
                          doc.attachment.fileExtension === 'docx' || doc.attachment.fileExtension === 'doc'
                            ? 'bg-blue-600'
                            : doc.attachment.fileExtension === 'pdf'
                            ? 'bg-red-600'
                            : 'bg-emerald-600'
                        }`}>
                          {(doc.attachment.fileExtension || 'FILE').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-stone-500 uppercase block">Attached File:</span>
                          <span className="text-xs font-semibold text-stone-900 truncate block font-mono">
                            {doc.attachment.fileName}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAttachmentFile(doc.attachment!);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title={`Download ${doc.attachment.fileName}`}
                      >
                        <Download className="w-3 h-3 text-[#C5A880]" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}

                  {/* File specs */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                    <span>PDF • {doc.pageCount} Pages • {doc.fileSize}</span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString('en-CA')}</span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingDoc(doc)}
                    className="flex-1 py-2 px-2.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Read full agreement terms and clauses"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-600" />
                    <span>View Terms</span>
                  </button>

                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handleOpenSignModal(doc)}
                      className="flex-1 py-2 px-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Sign Digital PDF</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => generateVaultDocumentPdf(doc, true)}
                      className="flex-1 py-2 px-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      title="Download PDF copy to your device"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0F2942] rounded-xl text-[#C5A880]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30">
                      {viewingDoc.category}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Ref: {viewingDoc.id}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                    {viewingDoc.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generateVaultDocumentPdf(viewingDoc, true)}
                  className="px-3 py-1.5 bg-[#C5A880] hover:bg-[#b59870] text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download Official PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-800 text-xs">
              {/* Unit Purchase Particulars Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 rounded-2xl p-4 border border-stone-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Unit & Model</span>
                  <span className="font-bold text-stone-900 text-sm">{viewingDoc.unitNumber}</span>
                  <span className="text-[11px] text-stone-500 block truncate">{viewingDoc.unitModel}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Purchase Price</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(
                      viewingDoc.purchasePrice
                    )}
                  </span>
                  <span className="text-[11px] text-stone-500 block">Fixed Contract Price</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Builder & Project</span>
                  <span className="font-bold text-stone-900 text-xs truncate block">{viewingDoc.projectName}</span>
                  <span className="text-[11px] text-stone-500 block">{viewingDoc.builderName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Execution Status</span>
                  <span
                    className={`font-bold text-xs inline-flex items-center gap-1 ${
                      viewingDoc.status === 'Signed & Executed' ? 'text-emerald-700' : 'text-amber-600'
                    }`}
                  >
                    {viewingDoc.status}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    {viewingDoc.coolingOffPeriodEnd ? 'Statutory Review Active' : 'Verified by Brokerage'}
                  </span>
                </div>
              </div>

              {/* Attached Local System File Card */}
              {viewingDoc.attachment && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 to-stone-100/90 border border-stone-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xs shadow-xs ${
                        viewingDoc.attachment.fileExtension === 'docx' || viewingDoc.attachment.fileExtension === 'doc'
                          ? 'bg-blue-600'
                          : viewingDoc.attachment.fileExtension === 'pdf'
                          ? 'bg-red-600'
                          : 'bg-emerald-600'
                      }`}>
                        {(viewingDoc.attachment.fileExtension || 'FILE').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            Attached Builder / Agent Document
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified Source
                          </span>
                        </div>
                        <h5 className="font-bold text-stone-900 text-sm mt-0.5">{viewingDoc.attachment.fileName}</h5>
                        <span className="text-xs text-stone-500 font-mono">
                          {viewingDoc.attachment.fileSize} • {viewingDoc.attachment.fileType}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadAttachmentFile(viewingDoc.attachment!)}
                      className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Download className="w-4 h-4 text-[#C5A880]" />
                      <span>Download Attached File</span>
                    </button>
                  </div>

                  {/* Inline Image Preview */}
                  {['png', 'jpg', 'jpeg', 'webp'].includes(viewingDoc.attachment.fileExtension || '') && viewingDoc.attachment.fileDataUrl && (
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-[11px] font-bold text-stone-600 block mb-2">Architectural Plan / Visual Preview:</span>
                      <img
                        src={viewingDoc.attachment.fileDataUrl}
                        alt={viewingDoc.title}
                        className="max-h-80 w-full object-contain rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              {viewingDoc.documentContent?.summary && (
                <div className="bg-[#0F2942]/5 border border-[#0F2942]/20 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#0F2942] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Executive Document Summary</span>
                  </h4>
                  <p className="text-stone-700 leading-relaxed">{viewingDoc.documentContent.summary}</p>
                </div>
              )}

              {/* Specifications (if present) */}
              {viewingDoc.documentContent?.specifications && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Schedule Details & Architectural Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(viewingDoc.documentContent.specifications).map(([key, val], idx) => (
                      <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">{key}</span>
                        <span className="text-xs font-semibold text-stone-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deposit Milestones (if present) */}
              {viewingDoc.documentContent?.depositMilestones && viewingDoc.documentContent.depositMilestones.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Schedule C: Builder Deposit Installment Milestones</span>
                    <span className="text-[11px] text-stone-500 font-normal">Held in Insured Trust</span>
                  </h4>
                  <div className="border border-stone-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#0F2942] text-white text-[11px]">
                        <tr>
                          <th className="p-2.5 pl-4">Milestone</th>
                          <th className="p-2.5">Due Date</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 pr-4 text-right">Amount (CAD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {viewingDoc.documentContent.depositMilestones.map((m, mIdx) => (
                          <tr key={mIdx} className="hover:bg-stone-50 transition-colors">
                            <td className="p-2.5 pl-4 font-bold text-stone-800">{m.label}</td>
                            <td className="p-2.5 text-stone-500">{m.dueDate}</td>
                            <td className="p-2.5">
                              {m.status === 'Paid' ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Paid
                                </span>
                              ) : (
                                <span className="text-amber-700">{m.status}</span>
                              )}
                            </td>
                            <td className="p-2.5 pr-4 text-right font-bold text-stone-900">
                              {new Intl.NumberFormat('en-CA', {
                                style: 'currency',
                                currency: 'CAD',
                                maximumFractionDigits: 0
                              }).format(m.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Key Clauses & Conditions */}
              {viewingDoc.documentContent?.keyClauses && viewingDoc.documentContent.keyClauses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Binding Terms & Statutory Protections
                  </h4>
                  <div className="space-y-2.5">
                    {viewingDoc.documentContent.keyClauses.map((clause, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3.5 bg-stone-50/80 border border-stone-200 rounded-xl space-y-1 relative pl-4 border-l-4 border-l-[#C5A880]"
                      >
                        <h5 className="font-bold text-stone-900 text-xs">
                          {cIdx + 1}. {clause.title}
                        </h5>
                        <p className="text-stone-600 leading-relaxed">{clause.clause}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution / Signature Status Card */}
              {viewingDoc.signature ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Certified Digital Signature Block</span>
                    </span>
                    <p className="font-bold text-emerald-950 text-sm">
                      Executed by {viewingDoc.signature.signerName}
                    </p>
                    <p className="text-emerald-800 text-[11px]">
                      Timestamp: {new Date(viewingDoc.signature.signedAt).toLocaleString('en-CA')} •{' '}
                      <span className="font-mono text-[10px]">{viewingDoc.signature.certificateId}</span>
                    </p>
                  </div>

                  {viewingDoc.signature.signatureDataUrl && (
                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <img
                        src={viewingDoc.signature.signatureDataUrl}
                        alt="Signature"
                        className="h-10 w-auto max-w-[160px] object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>This document is currently awaiting purchaser execution.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const docToSign = viewingDoc;
                      setViewingDoc(null);
                      handleOpenSignModal(docToSign);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Sign Now
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                RECO Compliant • Blueprint Realty Brokerage Inc.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => generateVaultDocumentPdf(viewingDoc, true)}
                  className="px-4 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Digital Signature Modal */}
      {signingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            {/* Signing Header */}
            <div className="p-4 sm:p-6 bg-[#0F2942] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#C5A880] text-stone-950 rounded-xl">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Ontario ECA Secure Signature
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                    Sign {signingDoc.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSigningDoc(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signing Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-800">
              {/* Success Notification if just signed */}
              {signSuccessNotice ? (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-emerald-950">
                      Document Successfully Signed & Legally Executed!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Your signature has been permanently recorded with audit verification ID:
                    </p>
                    <p className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/70 inline-block px-3 py-1 rounded-lg mt-2">
                      {signSuccessNotice.certId}
                    </p>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    A certified PDF copy has been added to your Document Vault and transmitted to Amit Sawhney and the builder escrow office.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => generateVaultDocumentPdf(signSuccessNotice.doc, true)}
                      className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#C5A880]" />
                      <span>Download Signed PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigningDoc(null)}
                      className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Return to Vault
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Unit & Document Brief */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-500 uppercase">Unit File</span>
                      <span className="font-bold text-[#0F2942]">{signingDoc.projectName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-stone-900">{signingDoc.unitNumber} ({signingDoc.unitModel})</span>
                      <span className="font-bold text-emerald-700">
                        {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(
                          signingDoc.purchasePrice
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                      By signing, you agree to the covenants, schedules, and 10-day statutory cooling-off protections set out in this document.
                    </p>
                  </div>

                  {/* Mode Selector: Draw or Type */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-900 text-xs">Choose Signature Method:</label>
                      <div className="flex items-center bg-stone-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setSignatureMode('draw')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            signatureMode === 'draw'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          Draw Signature
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('type')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            signatureMode === 'type'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          Type Legal Name
                        </button>
                      </div>
                    </div>

                    {/* DRAW MODE */}
                    {signatureMode === 'draw' ? (
                      <div className="space-y-2">
                        <div className="relative border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/50 p-1">
                          <canvas
                            ref={canvasRef}
                            width={560}
                            height={160}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-36 bg-white rounded-xl cursor-crosshair touch-none"
                          />
                          {!hasDrawn && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-stone-400 text-xs">
                              <PenTool className="w-5 h-5 mb-1 text-stone-300" />
                              <span>Draw your signature here with your mouse or finger</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span>Legal ink color: Classic Canadian Fiduciary Navy</span>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Clear Pad
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* TYPE MODE */
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            Legal Signer Full Name:
                          </label>
                          <input
                            type="text"
                            value={typedName}
                            onChange={e => setTypedName(e.target.value)}
                            placeholder="Enter your legal name as on ID"
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] text-stone-900 font-semibold"
                          />
                        </div>

                        {/* Font Styles Preview */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-stone-600">Select Signature Style:</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div
                              onClick={() => setSelectedFont('font-cursive-1')}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedFont === 'font-cursive-1'
                                  ? 'border-[#0F2942] bg-[#0F2942]/5 ring-1 ring-[#0F2942]'
                                  : 'border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              <span className="font-serif italic text-lg text-stone-900 block truncate">
                                {typedName || 'Your Signature'}
                              </span>
                              <span className="text-[10px] text-stone-400">Executive Script</span>
                            </div>

                            <div
                              onClick={() => setSelectedFont('font-cursive-2')}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedFont === 'font-cursive-2'
                                  ? 'border-[#0F2942] bg-[#0F2942]/5 ring-1 ring-[#0F2942]'
                                  : 'border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              <span className="italic font-mono text-base text-stone-900 block truncate">
                                {typedName || 'Your Signature'}
                              </span>
                              <span className="text-[10px] text-stone-400">Notarial Formal</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attestation & Legal Checkbox */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={legalConsentChecked}
                        onChange={e => setLegalConsentChecked(e.target.checked)}
                        className="mt-0.5 rounded border-stone-300 text-[#0F2942] focus:ring-[#C5A880] w-4 h-4"
                      />
                      <span className="text-[11px] text-stone-700 leading-snug">
                        I confirm that I am <strong className="text-stone-900">{typedName || user?.fullName}</strong>, the lawful purchaser named in this contract. I intend to execute this agreement digitally under the <strong className="text-stone-900">Ontario Electronic Commerce Act, 2000 (ECA)</strong> and acknowledge receipt of the statutory Tarion warranty disclosures.
                      </span>
                    </label>

                    <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-2 border-t border-stone-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Timestamp, IP address, and cryptographic SHA-256 hash will be permanently attached.</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSigningDoc(null)}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSigningSubmitting || !legalConsentChecked}
                      onClick={handleSubmitSignature}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSigningSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Recording Signature...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Execute & Sign Document</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Upload Custom Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-4 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-bold text-white">Deposit File into Secure Vault</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Lawyer Review Approval Letter or Certified Bank Draft Receipt"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value as VaultDocumentCategory)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] text-stone-900 font-medium cursor-pointer"
                >
                  <option value="APS Agreement">APS Agreement</option>
                  <option value="Floor Plan Addendum">Floor Plan Addendum</option>
                  <option value="Deposit Receipt">Deposit Receipt</option>
                  <option value="VIP Incentives & Levies">VIP Incentives & Levies</option>
                  <option value="Tarion Disclosure">Tarion Disclosure</option>
                  <option value="Representation Agreement">Representation Agreement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notes / Description (Optional)</label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  placeholder="Add any specific solicitor notes, reference numbers, or conditions satisfied..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880] text-stone-900 font-medium resize-none"
                />
              </div>

              {/* Mock File selector box */}
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center bg-stone-50/50">
                <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-stone-800">
                  {uploadFileName || 'Drag and drop PDF file here, or browse files'}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Supports PDF, DOCX, PNG up to 25MB</p>
                <input
                  type="file"
                  id="vault-file-picker"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.txt"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFileName(file.name);
                      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '));
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        const dataUrl = re.target?.result as string;
                        const ext = (file.name.split('.').pop() || '').toLowerCase();
                        setClientAttachment({
                          fileName: file.name,
                          fileType: file.type || 'application/octet-stream',
                          fileSize: formatBytes(file.size),
                          fileDataUrl: dataUrl,
                          fileExtension: ext,
                          uploadedAt: new Date().toISOString()
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {clientAttachment ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                    <span className="font-semibold truncate max-w-[240px]">
                      Ready: {clientAttachment.fileName} ({clientAttachment.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setClientAttachment(null);
                        setUploadFileName('');
                      }}
                      className="text-stone-400 hover:text-red-600 font-bold p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById('vault-file-picker')?.click()}
                    className="mt-2.5 px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Browse Device
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadTitle.trim()}
                  className="px-5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isUploading ? 'Uploading...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
