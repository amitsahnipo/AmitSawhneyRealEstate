import { VaultDocumentAttachment, VaultDocumentCategory } from '../types';

/**
 * Downloads an attached local file stored as a base64 Data URL.
 */
export function downloadAttachmentFile(attachment: VaultDocumentAttachment) {
  if (!attachment || !attachment.fileDataUrl) {
    alert('Attachment file data is unavailable for download.');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = attachment.fileDataUrl;
    link.download = attachment.fileName || 'preconstruction-document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to trigger download:', err);
    // Fallback for large data URLs
    window.open(attachment.fileDataUrl, '_blank');
  }
}

/**
 * Format bytes into human readable string (e.g. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a raw file name into a clean, professional contract title.
 * e.g. "Brooklin_Trails_APS_Suite_404_Executed.pdf" -> "Brooklin Trails APS Suite 404 Executed"
 */
export function cleanFileNameToTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  const cleaned = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize words nicely
  return cleaned
    .split(' ')
    .map(w => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

/**
 * Automatically infers vault document category from file name keywords.
 */
export function detectCategoryFromFileName(fileName: string): VaultDocumentCategory {
  const lower = fileName.toLowerCase();

  if (lower.includes('aps') || lower.includes('purchase') || lower.includes('sale') || lower.includes('agreement') || lower.includes('contract')) {
    return 'APS Agreement';
  }
  if (lower.includes('floor') || lower.includes('plan') || lower.includes('layout') || lower.includes('architectural') || lower.includes('elevation')) {
    return 'Floor Plan Addendum';
  }
  if (lower.includes('tarion') || lower.includes('warranty') || lower.includes('critical') || lower.includes('delayed') || lower.includes('disclosure')) {
    return 'Tarion Disclosure';
  }
  if (lower.includes('incentive') || lower.includes('levy') || lower.includes('levies') || lower.includes('rider') || lower.includes('credit') || lower.includes('decor')) {
    return 'VIP Incentives & Levies';
  }
  if (lower.includes('deposit') || lower.includes('receipt') || lower.includes('draft') || lower.includes('cheque') || lower.includes('escrow') || lower.includes('trust')) {
    return 'Deposit Receipt';
  }
  if (lower.includes('bra') || lower.includes('reco') || lower.includes('representation') || lower.includes('agency') || lower.includes('cashback')) {
    return 'Representation Agreement';
  }

  return 'APS Agreement';
}

export interface FileTypeInfo {
  typeKey: 'pdf' | 'word' | 'image' | 'excel' | 'text' | 'generic';
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
  isInlineViewable: boolean;
}

/**
 * Returns UI metadata and styling according to file extension or MIME type.
 */
export function getAttachmentTypeInfo(fileName: string, mimeType?: string): FileTypeInfo {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf')) {
    return {
      typeKey: 'pdf',
      label: 'PDF Document',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-700',
      badgeBorder: 'border-red-200',
      iconColor: 'text-red-600',
      isInlineViewable: true
    };
  }

  if (ext === 'doc' || ext === 'docx' || mime.includes('word') || mime.includes('officedocument.wordprocessingml')) {
    return {
      typeKey: 'word',
      label: 'Microsoft Word Document',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-200',
      iconColor: 'text-blue-700',
      isInlineViewable: false
    };
  }

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mime.startsWith('image/')) {
    return {
      typeKey: 'image',
      label: 'Architectural / Photo Asset',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      isInlineViewable: true
    };
  }

  if (['xlsx', 'xls', 'csv'].includes(ext) || mime.includes('sheet') || mime.includes('excel')) {
    return {
      typeKey: 'excel',
      label: 'Spreadsheet / Calculations',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-800',
      badgeBorder: 'border-teal-200',
      iconColor: 'text-teal-600',
      isInlineViewable: false
    };
  }

  if (['txt', 'rtf', 'md'].includes(ext) || mime.startsWith('text/')) {
    return {
      typeKey: 'text',
      label: 'Text Document',
      badgeBg: 'bg-stone-100',
      badgeText: 'text-stone-800',
      badgeBorder: 'border-stone-200',
      iconColor: 'text-stone-600',
      isInlineViewable: true
    };
  }

  return {
    typeKey: 'generic',
    label: 'Digital File Asset',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-700',
    badgeBorder: 'border-stone-200',
    iconColor: 'text-stone-600',
    isInlineViewable: false
  };
}
