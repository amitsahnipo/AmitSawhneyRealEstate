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
  Send,
  Plus,
  Search,
  Filter,
  Trash2,
  Building2,
  ShieldCheck,
  UserCheck,
  Calendar,
  X,
  Sparkles,
  FileSignature,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  RefreshCw,
  Mail,
  Paperclip,
  Upload,
  FileCheck,
  Check
} from 'lucide-react';
import { AuthUser, ClientVaultDocument, VaultDocumentCategory, VaultDocumentStatus, VaultDocumentAttachment } from '../../types';
import { generateVaultDocumentPdf } from '../../utils/vaultPdfGenerator';
import { AMIT_SAWHNEY } from '../../data/agent';
import {
  downloadAttachmentFile,
  formatBytes,
  cleanFileNameToTitle,
  detectCategoryFromFileName,
  getAttachmentTypeInfo
} from '../../utils/attachmentUtils';

interface AgentDocumentVaultTabProps {
  clients: AuthUser[];
  getAuthHeaders: () => Record<string, string>;
  preselectedClientId?: string | null;
  onClearPreselectedClient?: () => void;
}

interface SharedDocumentWithClient extends ClientVaultDocument {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

// Pre-packaged legal contract templates for pre-construction
const DOCUMENT_TEMPLATES = [
  {
    id: 'aps-template',
    title: 'Agreement of Purchase and Sale (APS) — OREA Pre-Con',
    category: 'APS Agreement' as VaultDocumentCategory,
    projectName: 'Brooklin Trails By Tribute Communities',
    unitNumber: 'Suite 404',
    unitModel: 'The Oakdale Elevation A (1,480 sq.ft)',
    purchasePrice: 749900,
    builderName: 'Tribute Communities',
    requiresSignature: true,
    coolingOffDays: 10,
    fileSize: '2.4 MB',
    pageCount: 14,
    description: 'Standard OREA & Builder Pre-Construction Agreement of Purchase and Sale including 10-day statutory cooling off disclosure and assignment rider.',
    tags: ['APS', 'Core Agreement', '10-Day Review', 'Condo Act', 'Escrow Account'],
    keyClauses: [
      {
        title: '10-Day Statutory Rescission Period (Cooling Off)',
        clause: 'Pursuant to Section 73 of the Ontario Condominium Act, 1998, the Purchaser has the statutory right to rescind this agreement within 10 days of receiving this executed copy and the disclosure statement.'
      },
      {
        title: 'Capped Municipal & Education Development Levies',
        clause: 'Town of Whitby, Regional Municipality of Durham, and School Board development charges are guaranteed capped at a maximum of $7,500 + HST for this unit.'
      },
      {
        title: 'Assignment Rights Prior to Final Closing',
        clause: 'The Purchaser is permitted one (1) assignment of this Agreement to a qualified buyer after 90% of total deposit is received, with the standard builder assignment administrative fee of $5,000 waived.'
      },
      {
        title: 'Interim Occupancy & Lease Permission',
        clause: 'The Purchaser is granted the right to lease the unit during the interim occupancy period prior to final condominium title registration without builder penalty.'
      }
    ],
    depositMilestones: [
      { label: 'Initial Bank Draft with Offer', amount: 10000, dueDate: 'Paid Upon Signing', status: 'Paid' as const },
      { label: 'Balance to 5% (Day 30)', amount: 27495, dueDate: '30 Days from Acceptance', status: 'Scheduled' as const },
      { label: 'Second Installment (5% - Day 120)', amount: 37495, dueDate: '120 Days from Acceptance', status: 'Scheduled' as const },
      { label: 'Third Installment (5% - Day 270)', amount: 37495, dueDate: '270 Days from Acceptance', status: 'Scheduled' as const },
      { label: 'Final Deposit on Occupancy (5%)', amount: 37495, dueDate: 'Estimated Occupancy (Nov 2027)', status: 'Scheduled' as const }
    ],
    specifications: {
      'Property Type': '2-Storey Luxury Townhome with Garage',
      'Living Area': '1,480 sq.ft + 120 sq.ft Private Deck',
      'Ceiling Height': '9-foot smooth ceilings on main level, 8-foot second level',
      'Parking & Locker': '1 Private Single-Car Garage + 1 Private Driveway Included',
      'Tentative Occupancy': 'November 15, 2027'
    }
  },
  {
    id: 'floorplan-template',
    title: 'Architectural Floor Plan Addendum & Finishes Schedule A',
    category: 'Floor Plan Addendum' as VaultDocumentCategory,
    projectName: 'Brooklin Trails By Tribute Communities',
    unitNumber: 'Suite 404',
    unitModel: 'The Oakdale Elevation A (1,480 sq.ft)',
    purchasePrice: 749900,
    builderName: 'Tribute Communities',
    requiresSignature: true,
    coolingOffDays: 10,
    fileSize: '1.8 MB',
    pageCount: 4,
    description: 'Certified builder architectural plan, dimension certifications, Schedule A electrical layout, and premium designer finishes schedule.',
    tags: ['Floor Plan', 'Architecture', 'Finishes Schedule', 'Terrace', 'Schedule A'],
    keyClauses: [
      {
        title: 'Square Footage & Architectural Tolerances',
        clause: 'Gross floor area measured in accordance with Tarion Bulletin 22. Actual usable floor space may vary within standard architectural tolerances up to 2%.'
      },
      {
        title: 'Schedule A Finishes Specification',
        clause: 'Includes Caesarstone quartz countertops in kitchen and primary ensuite, engineered wide-plank hardwood flooring on main level, and 40-ounce plush broadloom in bedrooms.'
      }
    ],
    specifications: {
      'Model Elevation': 'Elevation A Contemporary Brick & Stone Façade',
      'Primary Bedroom': '14\'6" x 12\'4" with 4-piece Ensuite & Walk-in Closet',
      'Bedroom 2': '11\'2" x 10\'8" with double closet',
      'Living / Dining': '18\'4" x 13\'6" Open Concept with walk-out to terrace',
      'Kitchen': '12\'0" x 9\'6" with Island and Breakfast Bar'
    }
  },
  {
    id: 'vip-incentive-template',
    title: 'Platinum VIP Buyer Incentive & Capped Levies Rider',
    category: 'VIP Incentives & Levies' as VaultDocumentCategory,
    projectName: 'Brooklin Trails By Tribute Communities',
    unitNumber: 'Suite 404',
    unitModel: 'The Oakdale Elevation A',
    purchasePrice: 749900,
    builderName: 'Tribute Communities',
    requiresSignature: false,
    fileSize: '850 KB',
    pageCount: 3,
    description: 'Signed Platinum VIP rider securing $10,000 decor studio credit, capped municipal levies, and free assignment rights negotiated by Amit Sawhney.',
    tags: ['VIP Incentives', 'Capped Levies', 'Decor Dollars', 'Assignment Clause'],
    keyClauses: [
      {
        title: '$10,000 Builder Decor Dollar Allowance',
        clause: 'Purchaser is credited $10,000 at the Tribute Décor Studio towards interior upgrades, cabinetry, tiles, and fixtures.'
      },
      {
        title: 'Capped Municipal Levies at $7,500',
        clause: 'Town of Whitby, Regional Municipality of Durham, and School Board development charges are capped at $7,500 total.'
      },
      {
        title: 'Waived Assignment Legal Fee',
        clause: 'Standard builder assignment legal processing fee of $5,000 is waived in full for Platinum VIP clients of Amit Sawhney.'
      }
    ]
  },
  {
    id: 'tarion-template',
    title: 'Tarion Warranty Information & Statement of Critical Dates',
    category: 'Tarion Disclosure' as VaultDocumentCategory,
    projectName: 'Brooklin Trails By Tribute Communities',
    unitNumber: 'Suite 404',
    unitModel: 'The Oakdale Elevation A',
    purchasePrice: 749900,
    builderName: 'Tribute Communities',
    requiresSignature: false,
    fileSize: '1.2 MB',
    pageCount: 6,
    description: 'Mandatory Ontario new home warranty disclosure detailing critical construction milestone dates, occupancy extensions, and delayed closing protections.',
    tags: ['Tarion', 'Critical Dates', 'Ontario Warranty', 'Statutory Disclosure'],
    keyClauses: [
      {
        title: 'First Tentative Occupancy Date',
        clause: 'Scheduled for November 15, 2027. Vendor may extend this date by up to 120 days by giving 90 days prior written notice.'
      },
      {
        title: 'Tarion Warranty Protection Coverage',
        clause: '7-Year Major Structural Defect Protection ($400,000 limit), 2-Year Water Penetration & Building Envelope Protection, 1-Year Comprehensive Workmanship Protection.'
      }
    ]
  },
  {
    id: 'deposit-receipt-template',
    title: 'Trust Account Deposit Receipt — $10,000 Bank Draft',
    category: 'Deposit Receipt' as VaultDocumentCategory,
    projectName: 'Brooklin Trails By Tribute Communities',
    unitNumber: 'Suite 404',
    unitModel: 'The Oakdale Elevation A',
    purchasePrice: 749900,
    builderName: 'Tribute Communities',
    requiresSignature: false,
    fileSize: '420 KB',
    pageCount: 1,
    description: 'Certified escrow trust account receipt confirming initial bank draft received and credited towards pre-construction unit purchase.',
    tags: ['Deposit Receipt', 'Escrow Trust', 'Initial $10K', 'Verified'],
    keyClauses: [
      {
        title: 'Insured Escrow Account',
        clause: 'Funds held in segregated interest-bearing trust account in accordance with Section 81 of the Ontario Condominium Act.'
      }
    ],
    depositMilestones: [
      { label: 'Initial Bank Draft (Received)', amount: 10000, dueDate: 'Confirmed Received', status: 'Paid' as const },
      { label: 'Balance to 5% (Day 30)', amount: 27495, dueDate: 'Within 30 Days of Acceptance', status: 'Upcoming' as const }
    ]
  },
  {
    id: 'bra-template',
    title: 'RECO Representation Agreement (BRA) — Pre-Con VIP Representation',
    category: 'Representation Agreement' as VaultDocumentCategory,
    projectName: 'Durham Pre-Construction Portfolio',
    unitNumber: 'VIP Buyer File',
    unitModel: 'Designated Agency Representation',
    purchasePrice: 750000,
    builderName: 'Blueprint Realty Brokerage Inc.',
    requiresSignature: true,
    coolingOffDays: 0,
    fileSize: '1.4 MB',
    pageCount: 5,
    description: 'Exclusive Buyer Representation Agreement and RECO Information Guide acknowledging 1% buyer cashback rebate and fiduciary agency duties.',
    tags: ['RECO', 'BRA', '1% Cashback Entitlement', 'Agency Agreement'],
    keyClauses: [
      {
        title: 'Fiduciary Duty & Client Representation',
        clause: `Amit Sawhney (Brokerage: Blueprint Realty Brokerage Inc.) agrees to act with undivided loyalty, confidentiality, full disclosure, and standard of care under TRESA 2002.`
      },
      {
        title: '1% Buyer Cashback Guarantee',
        clause: 'Brokerage guarantees a 1% purchase price cashback disbursement to the buyer on completion of transaction from co-operating commissions received.'
      }
    ]
  }
];

export const AgentDocumentVaultTab: React.FC<AgentDocumentVaultTabProps> = ({
  clients,
  getAuthHeaders,
  preselectedClientId,
  onClearPreselectedClient
}) => {
  const [documents, setDocuments] = useState<SharedDocumentWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>(preselectedClientId || 'all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<SharedDocumentWithClient | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<SharedDocumentWithClient | null>(null);

  // Share Form State
  const [shareMode, setShareMode] = useState<'attach_local' | 'template'>('attach_local');
  const [attachedLocalFile, setAttachedLocalFile] = useState<VaultDocumentAttachment | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [targetClientId, setTargetClientId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('aps-template');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<VaultDocumentCategory>('APS Agreement');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectName, setFormProjectName] = useState('Brooklin Trails By Tribute Communities');
  const [formUnitNumber, setFormUnitNumber] = useState('Suite 404');
  const [formUnitModel, setFormUnitModel] = useState('The Oakdale Elevation A');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(749900);
  const [formBuilderName, setFormBuilderName] = useState('Tribute Communities');
  const [formRequiresSignature, setFormRequiresSignature] = useState(true);
  const [formCoolingOffDays, setFormCoolingOffDays] = useState(10);
  const [formFileSize, setFormFileSize] = useState('2.4 MB');
  const [formPageCount, setFormPageCount] = useState(4);
  const [formTags, setFormTags] = useState('APS, Pre-Construction, 10-Day Review');
  const [formKeyClauses, setFormKeyClauses] = useState<Array<{ title: string; clause: string }>>([]);
  const [formNewClauseTitle, setFormNewClauseTitle] = useState('');
  const [formNewClauseText, setFormNewClauseText] = useState('');
  const [isSharingSubmitting, setIsSharingSubmitting] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  // Sync preselected client
  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClientFilter(preselectedClientId);
      setTargetClientId(preselectedClientId);
      setShareMode('attach_local');
      setIsShareModalOpen(true);
    }
  }, [preselectedClientId]);

  // Handle local file selection from agent's computer
  const handleFileSelected = (file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('Selected file exceeds the 25MB limit. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const formattedSize = formatBytes(file.size);
      
      const newAttachment: VaultDocumentAttachment = {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: formattedSize,
        fileDataUrl: dataUrl,
        fileExtension: ext,
        uploadedAt: new Date().toISOString()
      };

      setAttachedLocalFile(newAttachment);
      setFormTitle(cleanFileNameToTitle(file.name));
      const detectedCat = detectCategoryFromFileName(file.name);
      setFormCategory(detectedCat);
      setFormFileSize(formattedSize);
      setFormPageCount(ext === 'pdf' ? 3 : 1);
      setFormTags(`Attached File, ${ext.toUpperCase()}, Pre-Construction, ${detectedCat}`);
    };
    reader.readAsDataURL(file);
  };

  // Load documents from backend
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agent/documents', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments(data.documents || []);
      } else {
        setError(data.error || 'Failed to load vault documents.');
      }
    } catch (err: any) {
      console.error('Error fetching vault documents:', err);
      setError('Network error while retrieving client document vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Autofill form when template changes
  const applyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = DOCUMENT_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;

    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormDescription(tmpl.description);
    setFormProjectName(tmpl.projectName);
    setFormUnitNumber(tmpl.unitNumber);
    setFormUnitModel(tmpl.unitModel);
    setFormPurchasePrice(tmpl.purchasePrice);
    setFormBuilderName(tmpl.builderName);
    setFormRequiresSignature(tmpl.requiresSignature);
    setFormCoolingOffDays(tmpl.coolingOffDays || 0);
    setFormFileSize(tmpl.fileSize);
    setFormPageCount(tmpl.pageCount);
    setFormTags(tmpl.tags.join(', '));
    setFormKeyClauses(tmpl.keyClauses || []);
  };

  const handleOpenShareModal = (presetClientId?: string, initialMode: 'attach_local' | 'template' = 'attach_local') => {
    if (presetClientId) {
      setTargetClientId(presetClientId);
    } else if (clients.length > 0 && !targetClientId) {
      setTargetClientId(clients[0].id);
    }
    setShareMode(initialMode);
    if (initialMode === 'template') {
      applyTemplate('aps-template');
      setAttachedLocalFile(null);
    } else {
      setAttachedLocalFile(null);
      setFormTitle('');
      setFormDescription('');
      setFormCategory('APS Agreement');
      setFormRequiresSignature(true);
      setFormCoolingOffDays(10);
    }
    setShareSuccessMessage(null);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setAttachedLocalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClearPreselectedClient) {
      onClearPreselectedClient();
    }
  };

  const handleAddClause = () => {
    if (!formNewClauseTitle.trim() || !formNewClauseText.trim()) return;
    setFormKeyClauses(prev => [
      ...prev,
      { title: formNewClauseTitle.trim(), clause: formNewClauseText.trim() }
    ]);
    setFormNewClauseTitle('');
    setFormNewClauseText('');
  };

  const handleRemoveClause = (idx: number) => {
    setFormKeyClauses(prev => prev.filter((_, i) => i !== idx));
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId) {
      alert('Please select a target VIP client.');
      return;
    }
    if (shareMode === 'attach_local' && !attachedLocalFile) {
      alert('Please select or drop a local file (PDF, Word doc, etc.) from your computer.');
      return;
    }
    if (!formTitle.trim()) {
      alert('Please enter a document title.');
      return;
    }

    setIsSharingSubmitting(true);
    setShareSuccessMessage(null);

    const tmpl = DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplateId);

    const payload = {
      clientId: targetClientId,
      title: formTitle.trim(),
      category: formCategory,
      description: formDescription.trim() || (attachedLocalFile ? `Official pre-construction document (${attachedLocalFile.fileName}) shared by agent.` : ''),
      projectName: formProjectName.trim(),
      projectId: formProjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      unitNumber: formUnitNumber.trim(),
      unitModel: formUnitModel.trim(),
      purchasePrice: Number(formPurchasePrice) || 749900,
      builderName: formBuilderName.trim(),
      requiresSignature: formRequiresSignature,
      coolingOffDays: formRequiresSignature ? formCoolingOffDays : 0,
      fileSize: attachedLocalFile?.fileSize || formFileSize,
      pageCount: formPageCount,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      keyClauses: formKeyClauses,
      specifications: tmpl?.specifications || {
        'Suite Number': formUnitNumber,
        'Model Name': formUnitModel,
        'Builder': formBuilderName
      },
      depositMilestones: tmpl?.depositMilestones || [],
      attachment: attachedLocalFile || undefined,
      sourceType: attachedLocalFile ? 'uploaded_file' : 'builder_template'
    };

    try {
      const res = await fetch('/api/agent/documents/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShareSuccessMessage(`Successfully shared "${formTitle}" to the client's Document Vault!`);
        fetchDocuments();
        setTimeout(() => {
          handleCloseShareModal();
        }, 1400);
      } else {
        alert(data.error || 'Failed to share document to client vault.');
      }
    } catch (err) {
      console.error('Error sharing document:', err);
      alert('An error occurred while communicating with the server.');
    } finally {
      setIsSharingSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/agent/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        setDeleteConfirmDoc(null);
      } else {
        alert(data.error || 'Failed to delete document.');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('An error occurred while deleting the document.');
    }
  };

  const handleSendReminder = (doc: SharedDocumentWithClient) => {
    setReminderSentId(doc.id);
    setTimeout(() => {
      setReminderSentId(null);
    }, 3000);
  };

  const handleDownloadPdf = (doc: ClientVaultDocument) => {
    try {
      generateVaultDocumentPdf(doc, true);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF document.');
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    // Client filter
    if (selectedClientFilter !== 'all' && doc.userId !== selectedClientFilter) {
      return false;
    }
    // Category filter
    if (selectedCategoryFilter !== 'all' && doc.category !== selectedCategoryFilter) {
      return false;
    }
    // Status filter
    if (selectedStatusFilter !== 'all' && doc.status !== selectedStatusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchClient = (doc.clientName || '').toLowerCase().includes(q);
      const matchProject = doc.projectName.toLowerCase().includes(q);
      const matchUnit = doc.unitNumber.toLowerCase().includes(q);
      const matchCategory = doc.category.toLowerCase().includes(q);
      return matchTitle || matchClient || matchProject || matchUnit || matchCategory;
    }
    return true;
  });

  // Metrics
  const totalCount = documents.length;
  const pendingCount = documents.filter(d => d.status === 'Pending Signature').length;
  const signedCount = documents.filter(d => d.status === 'Signed & Executed').length;
  const activeCoolingOffCount = documents.filter(
    d => d.coolingOffPeriodEnd && new Date(d.coolingOffPeriodEnd).getTime() > Date.now()
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0F2942] to-[#153a5c] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C5A880]/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <FolderLock className="w-3 h-3" />
                Fiduciary Pre-Construction Hub
              </span>
              <span className="text-xs text-stone-300">Ontario ECA & RECO Compliant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Client Document Vault & Digital Signatures
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Securely share official builder agreements of purchase and sale (APS), architectural floor plans, Tarion disclosures, and deposit receipts directly into your VIP clients' vaults for review, download, and legally binding digital signatures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenShareModal(undefined, 'attach_local')}
              className="px-4 py-3 bg-[#C5A880] hover:bg-[#b09268] text-stone-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Attach a local PDF, Word (.docx), or floor plan from your computer"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach Local Document</span>
            </button>
            <button
              onClick={() => handleOpenShareModal(undefined, 'template')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-white/20 cursor-pointer"
              title="Select a pre-packaged builder contract or disclosure template"
            >
              <FileText className="w-4 h-4 text-[#C5A880]" />
              <span>Use Template</span>
            </button>
            <button
              onClick={fetchDocuments}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs transition-colors flex items-center justify-center cursor-pointer"
              title="Refresh document records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real-Time Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300 block">
              Total Vault Files
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5 block">
              {totalCount}
            </span>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-xs rounded-2xl p-3 border border-amber-400/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Awaiting Client Signature
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-amber-300 mt-0.5 block">
              {pendingCount}
            </span>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-xs rounded-2xl p-3 border border-emerald-400/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Signed & Executed
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-emerald-300 mt-0.5 block">
              {signedCount}
            </span>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-xs rounded-2xl p-3 border border-blue-400/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Active 10-Day Cooling Off
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-blue-300 mt-0.5 block">
              {activeCoolingOffCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by document title, client name, unit number, or project..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#0F2942]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Client Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700">
            <UserCheck className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedClientFilter}
              onChange={e => setSelectedClientFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="APS Agreement">APS Agreements</option>
              <option value="Floor Plan Addendum">Floor Plans & Specs</option>
              <option value="Tarion Disclosure">Tarion Critical Dates</option>
              <option value="VIP Incentives & Levies">VIP Incentives & Levies</option>
              <option value="Deposit Receipt">Deposit Receipts</option>
              <option value="Representation Agreement">RECO Agreements</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Signature">Pending Signature</option>
              <option value="Signed & Executed">Signed & Executed</option>
              <option value="Reference Only">Reference Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0F2942] animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading client document vaults and digital signatures...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center text-red-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-xs font-bold">{error}</p>
          <button
            onClick={fetchDocuments}
            className="px-4 py-2 bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 space-y-4">
          <FolderLock className="w-14 h-14 text-stone-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-stone-900">No documents found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {searchQuery || selectedClientFilter !== 'all' || selectedCategoryFilter !== 'all'
                ? 'No documents match the active search and filter criteria.'
                : 'No documents have been shared yet. Click "Share New Document" to send an APS contract or floor plan directly to a client.'}
            </p>
          </div>
          <button
            onClick={() => handleOpenShareModal()}
            className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Share First Pre-Con Document</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map(doc => {
            const isPendingSign = doc.status === 'Pending Signature';
            const isSigned = doc.status === 'Signed & Executed';
            const hasCoolingOff = doc.coolingOffPeriodEnd && new Date(doc.coolingOffPeriodEnd).getTime() > Date.now();
            const daysLeft = hasCoolingOff
              ? Math.ceil((new Date(doc.coolingOffPeriodEnd!).getTime() - Date.now()) / (1000 * 3600 * 24))
              : null;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Title & Metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0F2942]/10 text-[#0F2942]">
                        {doc.category}
                      </span>

                      {/* Status Badge */}
                      {isPendingSign && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-200 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Awaiting Client E-Signature
                        </span>
                      )}
                      {isSigned && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Signed & Legally Executed
                        </span>
                      )}
                      {!isPendingSign && !isSigned && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {doc.status}
                        </span>
                      )}

                      {/* Cooling Off Badge */}
                      {hasCoolingOff && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          {daysLeft} Days Cooling-Off Left
                        </span>
                      )}

                      <span className="text-[11px] text-stone-400">
                        {doc.fileSize} • {doc.pageCount} Pages
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-stone-900 hover:text-[#0F2942] transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                        {doc.description}
                      </p>
                    </div>

                    {/* Unit & Project details */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-600 pt-1">
                      <div className="flex items-center gap-1 font-semibold text-[#0F2942]">
                        <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{doc.projectName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400">Unit:</span>
                        <span className="font-bold text-stone-900">{doc.unitNumber}</span>
                        <span className="text-stone-400">({doc.unitModel})</span>
                      </div>
                      {doc.purchasePrice > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400">Price:</span>
                          <span className="font-bold text-emerald-700">${doc.purchasePrice.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400">Builder:</span>
                        <span className="font-medium text-stone-800">{doc.builderName}</span>
                      </div>
                    </div>

                    {/* Client Owner Badge & Attachment Indicator */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-[11px] font-medium border border-stone-200">
                        <UserCheck className="w-3.5 h-3.5 text-[#0F2942]" />
                        <span>Client:</span>
                        <strong className="text-stone-900">{doc.clientName || 'VIP Purchaser'}</strong>
                        <span className="text-stone-500">({doc.clientEmail})</span>
                      </div>

                      {doc.attachment && (
                        <div className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                          doc.attachment.fileExtension === 'docx' || doc.attachment.fileExtension === 'doc'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : doc.attachment.fileExtension === 'pdf'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold text-[10px] uppercase">Attached File:</span>
                          <span className="font-mono text-xs truncate max-w-[180px] sm:max-w-xs">{doc.attachment.fileName}</span>
                          <span className="text-[10px] opacity-75 font-mono">({doc.attachment.fileSize})</span>
                        </div>
                      )}

                      {doc.signature && (
                        <div className="text-[11px] text-emerald-800 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Cert: {doc.signature.certificateId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View contract details and digital audit certificate"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Contract</span>
                      </button>

                      {doc.attachment ? (
                        <button
                          onClick={() => downloadAttachmentFile(doc.attachment!)}
                          className="px-3 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title={`Download original file: ${doc.attachment.fileName}`}
                        >
                          <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Download Attached File</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadPdf(doc)}
                          className="px-3 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Generate and download official PDF with ECA certificate"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Download PDF</span>
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteConfirmDoc(doc)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Revoke / Remove from client vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pending Sign Remind Button */}
                    {isPendingSign && (
                      <button
                        onClick={() => handleSendReminder(doc)}
                        className="w-full lg:w-auto px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3 text-amber-600" />
                        <span>
                          {reminderSentId === doc.id ? 'Reminder Sent to Client!' : 'Send E-Sign Alert'}
                        </span>
                      </button>
                    )}

                    <span className="text-[10px] text-stone-400">
                      Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHARE NEW DOCUMENT MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D43] block">
                  Agent Document Dispatch
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Share Document to Client Vault
                </h3>
                <p className="text-xs text-stone-500">
                  Deposit an official builder contract, floor plan addendum, or VIP rider directly into a client's secure portal.
                </p>
              </div>
              <button
                onClick={handleCloseShareModal}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shareSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{shareSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-5">
              {/* Step 1: Select Client */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  1. Select Target VIP Client *
                </label>
                <select
                  required
                  value={targetClientId}
                  onChange={e => setTargetClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#0F2942]"
                >
                  <option value="" disabled>Choose client from VIP registry...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} • {c.email} (Budget: ${(c.targetBudgetMax || 750000).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Switcher */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  2. Document Source & Upload Method *
                </label>
                <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShareMode('attach_local')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      shareMode === 'attach_local'
                        ? 'bg-white text-[#0F2942] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Paperclip className="w-4 h-4 text-[#C5A880]" />
                    <span>Attach Local File (PDF, Word, etc.)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShareMode('template');
                      applyTemplate(selectedTemplateId || 'aps-template');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      shareMode === 'template'
                        ? 'bg-white text-[#0F2942] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#0F2942]" />
                    <span>Pre-Built Builder Template</span>
                  </button>
                </div>
              </div>

              {/* Local File Attachment Zone */}
              {shareMode === 'attach_local' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.txt,.rtf"
                    className="hidden"
                  />

                  {!attachedLocalFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileSelected(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isDraggingFile
                          ? 'border-[#0F2942] bg-[#0F2942]/10 ring-2 ring-[#0F2942]/20'
                          : 'border-stone-300 hover:border-[#0F2942] bg-stone-50/70 hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center mx-auto text-[#0F2942] mb-2.5">
                        <Upload className="w-6 h-6 text-[#C5A880]" />
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">
                        Click to browse local files or drag & drop here
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                        Attach builder agreements (PDF), Word documents (.docx/.doc), architectural floor plans, or Tarion disclosures stored on your computer.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">PDF (.pdf)</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">Word (.docx, .doc)</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Images (.png, .jpg)</span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">Excel (.xlsx)</span>
                        <span className="text-[10px] text-stone-400">• Max 25 MB</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs ${
                            attachedLocalFile.fileExtension === 'docx' || attachedLocalFile.fileExtension === 'doc'
                              ? 'bg-blue-600'
                              : attachedLocalFile.fileExtension === 'pdf'
                              ? 'bg-red-600'
                              : 'bg-emerald-600'
                          }`}>
                            {(attachedLocalFile.fileExtension || 'FILE').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                                {attachedLocalFile.fileName}
                              </h5>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Ready to Share
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2 font-mono">
                              <span>Size: {attachedLocalFile.fileSize}</span>
                              <span>•</span>
                              <span>Type: {attachedLocalFile.fileType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAttachedLocalFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                        <span className="text-[11px]">
                          Document will be safely deposited with client-accessible download & digital e-signing.
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadAttachmentFile(attachedLocalFile)}
                          className="text-[#0F2942] hover:text-[#8C6D43] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          <span>Test Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template Selector Zone */}
              {shareMode === 'template' && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Choose Contract / Document Template (Fast Autofill)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DOCUMENT_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t.id)}
                        className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                          selectedTemplateId === t.id
                            ? 'border-[#0F2942] bg-[#0F2942]/5 ring-1 ring-[#0F2942]'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        <div className="font-bold text-stone-900 line-clamp-1">{t.title}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-[#8C6D43]">{t.category}</span>
                          <span>•</span>
                          <span>{t.requiresSignature ? 'Requires E-Sign' : 'Reference'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Document Details */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Agreement of Purchase and Sale (APS) — Suite 404"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as VaultDocumentCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                    >
                      <option value="APS Agreement">APS Agreement</option>
                      <option value="Floor Plan Addendum">Floor Plan Addendum</option>
                      <option value="Tarion Disclosure">Tarion Disclosure</option>
                      <option value="VIP Incentives & Levies">VIP Incentives & Levies</option>
                      <option value="Deposit Receipt">Deposit Receipt</option>
                      <option value="Representation Agreement">Representation Agreement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formProjectName}
                      onChange={e => setFormProjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Suite / Unit #
                    </label>
                    <input
                      type="text"
                      required
                      value={formUnitNumber}
                      onChange={e => setFormUnitNumber(e.target.value)}
                      placeholder="e.g. Suite 404"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Unit Model / Layout
                    </label>
                    <input
                      type="text"
                      required
                      value={formUnitModel}
                      onChange={e => setFormUnitModel(e.target.value)}
                      placeholder="e.g. The Oakdale Elevation A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Purchase Price ($ CAD)
                    </label>
                    <input
                      type="number"
                      required
                      value={formPurchasePrice}
                      onChange={e => setFormPurchasePrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Builder / Developer
                    </label>
                    <input
                      type="text"
                      required
                      value={formBuilderName}
                      onChange={e => setFormBuilderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Estimated File Size / Pages
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formFileSize}
                        onChange={e => setFormFileSize(e.target.value)}
                        placeholder="2.4 MB"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                      <input
                        type="number"
                        value={formPageCount}
                        onChange={e => setFormPageCount(Number(e.target.value))}
                        placeholder="4"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Document Summary & Guidance for Client
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Provide an overview of this contract or instructions for review and signature..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0F2942]"
                  />
                </div>

                {/* E-Signature & Cooling-Off Config */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                        <FileSignature className="w-4 h-4 text-amber-600" />
                        Require Client Electronic Signature
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Places this agreement into client's signature queue with ECA audit tracking.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formRequiresSignature}
                        onChange={e => setFormRequiresSignature(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F2942]"></div>
                    </label>
                  </div>

                  {formRequiresSignature && (
                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      <span className="text-xs text-stone-700 font-medium">
                        Ontario Statutory Cooling-Off Rescission Window (Days):
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={formCoolingOffDays}
                        onChange={e => setFormCoolingOffDays(Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded-lg border border-amber-300 bg-white text-xs font-bold text-center"
                      />
                    </div>
                  )}
                </div>

                {/* Key Legal Clauses Editor */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Key Legal Clauses & Negotiated Conditions ({formKeyClauses.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formKeyClauses.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <strong className="text-stone-900 block">{c.title}</strong>
                          <p className="text-stone-600 text-[11px] line-clamp-2">{c.clause}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveClause(idx)}
                          className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-stone-100/70 border border-stone-200 space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 block">Add Custom Clause:</span>
                    <input
                      type="text"
                      value={formNewClauseTitle}
                      onChange={e => setFormNewClauseTitle(e.target.value)}
                      placeholder="Clause Title (e.g. Free Assignment Rights)"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    />
                    <textarea
                      rows={2}
                      value={formNewClauseText}
                      onChange={e => setFormNewClauseText(e.target.value)}
                      placeholder="Legal terms / clause wording..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddClause}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      + Append Clause to Contract
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseShareModal}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSharingSubmitting}
                  className="px-6 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FolderLock className="w-4 h-4 text-[#C5A880]" />
                  <span>{isSharingSubmitting ? 'Sharing to Client Vault...' : 'Deposit Document into Client Vault'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CONTRACT DETAILS MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0F2942]/10 text-[#0F2942]">
                    {viewingDoc.category}
                  </span>
                  <span className="text-xs text-stone-500">ID: {viewingDoc.id}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  {viewingDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Ownership & Unit Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Client</span>
                <strong className="text-stone-900 block">{viewingDoc.clientName || 'VIP Purchaser'}</strong>
                <span className="text-stone-500 text-[11px]">{viewingDoc.clientEmail}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Project</span>
                <strong className="text-[#0F2942] block">{viewingDoc.projectName}</strong>
                <span className="text-stone-600 text-[11px]">{viewingDoc.builderName}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Suite & Model</span>
                <strong className="text-stone-900 block">{viewingDoc.unitNumber}</strong>
                <span className="text-stone-600 text-[11px]">{viewingDoc.unitModel}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Purchase Price</span>
                <strong className="text-emerald-700 block">${viewingDoc.purchasePrice.toLocaleString()}</strong>
                <span className="text-stone-500 text-[11px]">{viewingDoc.fileSize}</span>
              </div>
            </div>

            {/* Attached Local File Details & Direct Download */}
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
                          Attached Local System File
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Verified Integrity
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-sm mt-0.5">{viewingDoc.attachment.fileName}</h5>
                      <span className="text-xs text-stone-500 font-mono">
                        {viewingDoc.attachment.fileSize} • {viewingDoc.attachment.fileType}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadAttachmentFile(viewingDoc.attachment!)}
                    className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Download className="w-4 h-4 text-[#C5A880]" />
                    <span>Download Original Attached File</span>
                  </button>
                </div>

                {/* Inline Image Preview */}
                {['png', 'jpg', 'jpeg', 'webp'].includes(viewingDoc.attachment.fileExtension || '') && viewingDoc.attachment.fileDataUrl && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-[11px] font-bold text-stone-600 block mb-2">Architectural Visual Asset Preview:</span>
                    <img
                      src={viewingDoc.attachment.fileDataUrl}
                      alt={viewingDoc.title}
                      className="max-h-80 w-full object-contain rounded-xl border border-stone-200 bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Digital Signature Audit Trail (if signed) */}
            {viewingDoc.signature ? (
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Ontario ECA & RECO Compliant Digital Signature Certificate</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 font-mono">
                  <div>Certificate ID: <strong className="text-stone-900">{viewingDoc.signature.certificateId}</strong></div>
                  <div>Executed: <strong className="text-stone-900">{new Date(viewingDoc.signature.signedAt).toLocaleString()}</strong></div>
                  <div>Signee: <strong className="text-stone-900">{viewingDoc.signature.signerName} ({viewingDoc.signature.signerEmail})</strong></div>
                  <div>IP Address: <strong className="text-stone-900">{viewingDoc.signature.ipAddress || '127.0.0.1 (Verified)'}</strong></div>
                </div>
                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="text-[10px] text-stone-500 uppercase font-bold">SHA-256 Verification Hash:</div>
                  <code className="text-[11px] text-emerald-900 break-all bg-white px-2 py-1 rounded border border-emerald-200 block mt-0.5">
                    {viewingDoc.signature.verificationHash}
                  </code>
                </div>
                <p className="text-[11px] text-emerald-800 italic">
                  Legal Consent: "{viewingDoc.signature.legalConsentText}"
                </p>
              </div>
            ) : viewingDoc.status === 'Pending Signature' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Awaiting Purchaser Electronic Signature</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Client has been notified. They can draw or type their signature directly from the VIP Client Portal Document Vault tab.
                </p>
              </div>
            ) : null}

            {/* Key Clauses */}
            {viewingDoc.documentContent?.keyClauses && viewingDoc.documentContent.keyClauses.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Negotiated Contract Clauses & Statutory Terms
                </h4>
                <div className="space-y-2">
                  {viewingDoc.documentContent.keyClauses.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <strong className="text-stone-900 block">{c.title}</strong>
                      <p className="text-stone-600 text-[11px] leading-relaxed">{c.clause}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deposit Milestones if present */}
            {viewingDoc.documentContent?.depositMilestones && viewingDoc.documentContent.depositMilestones.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Builder Deposit Schedule
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                  {viewingDoc.documentContent.depositMilestones.map((m, i) => (
                    <div key={i} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-900 block">{m.label}</span>
                        <span className="text-stone-500 text-[11px]">{m.dueDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 block">${m.amount.toLocaleString()}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                Created {new Date(viewingDoc.createdAt).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPdf(viewingDoc)}
                  className="px-5 py-2 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Download Legal PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Revoke Document from Vault?
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Are you sure you want to remove <strong>"{deleteConfirmDoc.title}"</strong> from {deleteConfirmDoc.clientName || 'the client'}'s vault? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(deleteConfirmDoc.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Revoke Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
