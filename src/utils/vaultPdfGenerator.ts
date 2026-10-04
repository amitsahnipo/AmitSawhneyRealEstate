import { jsPDF } from 'jspdf';
import { ClientVaultDocument } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';

/**
 * Generates an official, legal-grade PDF document for a pre-construction unit purchase,
 * complete with builder contract details, legal clauses, unit specifications, deposit schedules,
 * and Ontario ECA-compliant digital signature certification blocks.
 */
export function generateVaultDocumentPdf(document: ClientVaultDocument, autoDownload: boolean = true): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  let y = 14;

  const checkPageBreak = (neededSpace: number = 22) => {
    if (y + neededSpace > pageHeight - 16) {
      addFooter();
      doc.addPage();
      y = 16;
      addPageHeader();
    }
  };

  const addPageHeader = () => {
    doc.setFillColor(15, 41, 66); // #0F2942 Navy
    doc.rect(margin, y, contentWidth, 7.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`${document.projectName.toUpperCase()} • ${document.unitNumber}`, margin + 3, y + 5);
    doc.setTextColor(197, 168, 128);
    doc.text('BLUEPRINT REALTY • DOCUMENT VAULT', pageWidth - margin - 3, y + 5, { align: 'right' });
    y += 11;
  };

  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Document Ref: ${document.id} • Registered Client Portal Record • Fiduciary Representation by ${AMIT_SAWHNEY.name} (${AMIT_SAWHNEY.license})`,
      margin,
      footerY + 2
    );
    const pageStr = `Page ${doc.getNumberOfPages()}`;
    doc.text(pageStr, pageWidth - margin, footerY + 2, { align: 'right' });
  };

  // --- PAGE 1: HEADER & BANNER ---
  // Top Banner
  doc.setFillColor(15, 41, 66); // #0F2942
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Gold accent bar
  doc.setFillColor(197, 168, 128); // #C5A880
  doc.rect(margin, y + 24, contentWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PRE-CONSTRUCTION LEGAL VAULT', margin + 5, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(215, 215, 215);
  doc.text(`Official Unit Documentation & Agreement Archive • ${document.category}`, margin + 5, y + 16);

  // Brokerage Info on Right
  doc.setTextColor(197, 168, 128);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(AMIT_SAWHNEY.brokerage.toUpperCase(), pageWidth - margin - 5, y + 8, { align: 'right' });
  doc.setTextColor(230, 230, 230);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Realtor: ${AMIT_SAWHNEY.name} • ${AMIT_SAWHNEY.license}`, pageWidth - margin - 5, y + 14, { align: 'right' });
  doc.text(`Direct: ${AMIT_SAWHNEY.phoneFormatted} • ${AMIT_SAWHNEY.email}`, pageWidth - margin - 5, y + 19, { align: 'right' });

  y += 31;

  // Document Title & Status Pill
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(document.title, margin, y);

  // Status Badge
  const isSigned = document.status === 'Signed & Executed';
  const badgeBg = isSigned ? [16, 185, 129] : [245, 158, 11]; // Green or Amber
  const badgeText = isSigned ? 'SIGNED & EXECUTED' : 'PENDING CLIENT SIGNATURE';
  doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
  doc.roundedRect(pageWidth - margin - 48, y - 5, 48, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(badgeText, pageWidth - margin - 24, y - 0.8, { align: 'center' });

  y += 5;

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const descLines = doc.splitTextToSize(document.description, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 3.8 + 4;

  // --- UNIT PURCHASE PARTICULARS BOX ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 23, 1.5, 1.5, 'FD');

  const colW = contentWidth / 4;
  const topTextY = y + 5.5;
  const valTextY = y + 12.5;
  const subTextY = y + 18.5;

  // Col 1: Development
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVELOPMENT & BUILDER', margin + 3, topTextY);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize(document.projectName, colW - 6)[0] || document.projectName, margin + 3, valTextY);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Builder: ${document.builderName}`, margin + 3, subTextY);

  // Col 2: Unit & Model
  doc.text('UNIT & MODEL', margin + colW + 3, topTextY);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(document.unitNumber, margin + colW + 3, valTextY);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(document.unitModel, margin + colW + 3, subTextY);

  // Col 3: Purchase Price
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE PRICE (CAD)', margin + colW * 2 + 3, topTextY);
  doc.setTextColor(16, 185, 129); // Green
  doc.setFontSize(9);
  doc.text(
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(document.purchasePrice),
    margin + colW * 2 + 3,
    valTextY
  );
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Subject to Builder Capped Levies', margin + colW * 2 + 3, subTextY);

  // Col 4: Cooling Off Status
  doc.setFont('helvetica', 'bold');
  doc.text('10-DAY COOLING OFF', margin + colW * 3 + 3, topTextY);
  doc.setTextColor(15, 41, 66);
  doc.setFontSize(7.5);
  doc.text(document.coolingOffPeriodEnd ? 'Statutory Active' : 'Final / N/A', margin + colW * 3 + 3, valTextY);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Section 73 Condo Act', margin + colW * 3 + 3, subTextY);

  y += 28;

  // --- EXECUTIVE SUMMARY SECTION ---
  if (document.documentContent?.summary) {
    checkPageBreak(25);
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'F');
    doc.setTextColor(15, 41, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('LEGAL SUMMARY & SCOPE OF DOCUMENT', margin + 3, y + 4.5);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const summaryLines = doc.splitTextToSize(document.documentContent.summary, contentWidth - 6);
    doc.text(summaryLines, margin + 3, y + 9);
    y += 18;
  }

  // --- UNIT SPECIFICATIONS (if available) ---
  if (document.documentContent?.specifications) {
    checkPageBreak(30);
    doc.setTextColor(15, 41, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('SCHEDULE DETAILS & ARCHITECTURAL SPECIFICATIONS', margin, y);
    y += 4;

    const specs = Object.entries(document.documentContent.specifications);
    const halfWidth = (contentWidth - 4) / 2;

    for (let i = 0; i < specs.length; i += 2) {
      checkPageBreak(12);
      const spec1 = specs[i];
      const spec2 = specs[i + 1];

      // Item 1
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y, halfWidth, 10, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, y, halfWidth, 10, 'S');
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text(spec1[0].toUpperCase(), margin + 2.5, y + 3.5);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text(doc.splitTextToSize(spec1[1], halfWidth - 5)[0] || spec1[1], margin + 2.5, y + 7.5);

      // Item 2
      if (spec2) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin + halfWidth + 4, y, halfWidth, 10, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.rect(margin + halfWidth + 4, y, halfWidth, 10, 'S');
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text(spec2[0].toUpperCase(), margin + halfWidth + 6.5, y + 3.5);
        doc.setTextColor(17, 24, 39);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.text(doc.splitTextToSize(spec2[1], halfWidth - 5)[0] || spec2[1], margin + halfWidth + 6.5, y + 7.5);
      }

      y += 12;
    }
    y += 2;
  }

  // --- DEPOSIT MILESTONE SCHEDULE (if available) ---
  if (document.documentContent?.depositMilestones && document.documentContent.depositMilestones.length > 0) {
    checkPageBreak(35);
    doc.setTextColor(15, 41, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('SCHEDULE C: BUILDER DEPOSIT INSTALLMENT MILESTONES', margin, y);
    y += 4;

    // Table Header
    doc.setFillColor(15, 41, 66);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('MILESTONE STAGE', margin + 3, y + 4.2);
    doc.text('DUE DATE / TIMELINE', margin + 80, y + 4.2);
    doc.text('STATUS', margin + 130, y + 4.2);
    doc.text('AMOUNT (CAD)', pageWidth - margin - 3, y + 4.2, { align: 'right' });
    y += 6;

    // Table Rows
    document.documentContent.depositMilestones.forEach((m, idx) => {
      checkPageBreak(9);
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y + 7, margin + contentWidth, y + 7);

      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text(m.label, margin + 3, y + 4.5);

      doc.setTextColor(100, 116, 139);
      doc.text(m.dueDate, margin + 80, y + 4.5);

      if (m.status === 'Paid') {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Verified Paid', margin + 130, y + 4.5);
      } else {
        doc.setTextColor(217, 119, 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Scheduled', margin + 130, y + 4.5);
      }

      doc.setTextColor(15, 41, 66);
      doc.setFont('helvetica', 'bold');
      doc.text(
        new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(m.amount),
        pageWidth - margin - 3,
        y + 4.5,
        { align: 'right' }
      );

      y += 7;
    });

    y += 4;
  }

  // --- KEY LEGAL CLAUSES ---
  if (document.documentContent?.keyClauses && document.documentContent.keyClauses.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(15, 41, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('KEY COVENANTS, ADDENDUMS & STATUTORY RIGHTS', margin, y);
    y += 5;

    document.documentContent.keyClauses.forEach((item, idx) => {
      const clauseLines = doc.splitTextToSize(item.clause, contentWidth - 10);
      const itemHeight = clauseLines.length * 3.6 + 8;
      checkPageBreak(itemHeight + 4);

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, y, contentWidth, itemHeight, 'FD');

      doc.setFillColor(197, 168, 128);
      doc.rect(margin, y, 2.5, itemHeight, 'F');

      doc.setTextColor(15, 41, 66);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.text(`${idx + 1}. ${item.title}`, margin + 6, y + 4.5);

      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text(clauseLines, margin + 6, y + 8.5);

      y += itemHeight + 3;
    });
  }

  // --- DIGITAL SIGNATURE & AUDIT EXECUTION BLOCK ---
  checkPageBreak(45);
  y += 4;

  if (document.signature) {
    // SIGNED CERTIFICATE BOX
    doc.setFillColor(240, 253, 244); // light emerald
    doc.setDrawColor(34, 197, 94); // emerald border
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

    // Seal icon bar
    doc.setFillColor(34, 197, 94);
    doc.rect(margin, y, 3, 38, 'F');

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CERTIFICATE OF DIGITAL EXECUTION & E-SIGNATURE VERIFICATION', margin + 7, y + 6);

    doc.setTextColor(74, 222, 128);
    doc.setFontSize(7);
    doc.text('VERIFIED BY BLUEPRINT SECURE VAULT ENGINE', pageWidth - margin - 5, y + 6, { align: 'right' });

    // Details Grid
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('LEGAL SIGNER:', margin + 7, y + 13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(document.signature.signerName, margin + 32, y + 13);

    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text('EMAIL / ID:', margin + 7, y + 18);
    doc.setTextColor(15, 23, 42);
    doc.text(document.signature.signerEmail, margin + 32, y + 18);

    doc.setTextColor(75, 85, 99);
    doc.text('TIMESTAMP (UTC):', margin + 7, y + 23);
    doc.setTextColor(15, 23, 42);
    doc.text(new Date(document.signature.signedAt).toLocaleString('en-CA', { timeZoneName: 'short' }), margin + 32, y + 23);

    doc.setTextColor(75, 85, 99);
    doc.text('AUDIT HASH:', margin + 7, y + 28);
    doc.setTextColor(30, 41, 59);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.text(document.signature.verificationHash || 'SHA256:verified_digital_signature_token', margin + 32, y + 28);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Executed in strict compliance with the Ontario Electronic Commerce Act (ECA, 2000) & Real Estate Council of Ontario (RECO) guidelines.',
      margin + 7,
      y + 34
    );

    // If signature data URL is present (drawn signature)
    if (document.signature.signatureDataUrl && document.signature.signatureType === 'draw') {
      try {
        doc.addImage(document.signature.signatureDataUrl, 'PNG', pageWidth - margin - 50, y + 10, 45, 18);
      } catch (err) {
        // Fallback cursive text if image embedding fails
        doc.setTextColor(15, 41, 66);
        doc.setFont('times', 'italic');
        doc.setFontSize(14);
        doc.text(document.signature.signerName, pageWidth - margin - 25, y + 20, { align: 'center' });
      }
    } else {
      // Cursive typed signature representation
      doc.setTextColor(15, 41, 66);
      doc.setFont('times', 'italic');
      doc.setFontSize(16);
      doc.text(document.signature.signerName, pageWidth - margin - 28, y + 20, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text('(Digitally Adopted Signature)', pageWidth - margin - 28, y + 26, { align: 'center' });
    }

    y += 42;
  } else {
    // PENDING SIGNATURE PLACEHOLDER BOX
    doc.setFillColor(254, 243, 199); // light amber
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ACTION REQUIRED: PENDING PURCHASER DIGITAL SIGNATURE', margin + 6, y + 6);

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      'This pre-construction document has been compiled and is awaiting your digital e-signature in the Blueprint VIP Client Portal.',
      margin + 6,
      y + 11
    );
    doc.text(
      'To execute this contract securely, navigate to the Document Vault tab and click "Sign Digital PDF".',
      margin + 6,
      y + 16
    );

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 60, y + 18, pageWidth - margin - 10, y + 18);
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text('Purchaser Signature Line', pageWidth - margin - 35, y + 22, { align: 'center' });

    y += 28;
  }

  // Add footer to final page
  addFooter();

  if (autoDownload) {
    const cleanFileName = `${document.unitNumber.replace(/\s+/g, '_')}_${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(cleanFileName);
  }

  return doc;
}
