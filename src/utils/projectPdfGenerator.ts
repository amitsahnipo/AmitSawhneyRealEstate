import { jsPDF } from 'jspdf';
import { Project, FloorPlan } from '../types';
import { AMIT_SAWHNEY } from '../data/agent';
import { calculateCashback, formatCurrency } from './cashback';

/**
 * Generates and downloads a formatted executive PDF summary for a pre-construction project,
 * including key metrics, VIP incentives, deposit structure, and detailed floor plans.
 */
export function generateProjectPdf(project: Project): void {
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

  // Helper to check for page break
  const checkPageBreak = (neededSpace: number = 20) => {
    if (y + neededSpace > pageHeight - 18) {
      addFooter();
      doc.addPage();
      y = 16;
      addPageHeader();
    }
  };

  // Running page header for subsequent pages
  const addPageHeader = () => {
    doc.setFillColor(15, 41, 66); // #0F2942
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${project.name.toUpperCase()} — EXECUTIVE PROJECT SUMMARY`, margin + 3, y + 5.5);
    doc.setTextColor(197, 168, 128);
    doc.text('AMIT SAWHNEY | BLUEPRINT REALTY', pageWidth - margin - 3, y + 5.5, { align: 'right' });
    y += 12;
  };

  // Running page footer
  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      'Exclusive Client Brief prepared by Amit Sawhney, Licensed REALTOR® • Blueprint Realty Brokerage Inc. • Confidential & Subject to Builder E&OE',
      margin,
      footerY + 2
    );

    const currentPage = (doc.internal as any).getCurrentPageInfo().pageNumber;
    doc.text(`Page ${currentPage}`, pageWidth - margin, footerY + 2, { align: 'right' });
  };

  // =========================================================================
  // PAGE 1: HEADER & LUXURY BRANDING BANNER
  // =========================================================================
  doc.setFillColor(15, 41, 66); // Dark Navy #0F2942
  doc.rect(margin, y, contentWidth, 32, 'F');

  // Gold accent line
  doc.setFillColor(197, 168, 128); // #C5A880
  doc.rect(margin, y + 31, contentWidth, 1.2, 'F');

  // Branding text
  doc.setTextColor(197, 168, 128);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BLUEPRINT REALTY BROKERAGE  •  VIP CLIENT EXECUTIVE BRIEF', margin + 6, y + 7);

  // Agent contact top right
  doc.setFontSize(7.5);
  doc.setTextColor(220, 220, 220);
  doc.text(`REPRESENTATIVE: ${AMIT_SAWHNEY.name.toUpperCase()}, REALTOR®`, pageWidth - margin - 6, y + 7, { align: 'right' });
  doc.text(`${AMIT_SAWHNEY.phoneFormatted}  |  ${AMIT_SAWHNEY.email}`, pageWidth - margin - 6, y + 12, { align: 'right' });

  // Project title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(project.name, margin + 6, y + 18);

  // Location & Builder
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 210, 225);
  doc.text(
    `${project.location.address}, ${project.location.city} (${project.location.region})  •  Builder: ${project.builder}`,
    margin + 6,
    y + 24
  );

  y += 37;

  // Status & Date Sub-bar
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(225, 230, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 41, 66);
  doc.text(`STATUS: ${project.status.toUpperCase()}`, margin + 4, y + 5.8);

  const cashbackResult = calculateCashback(project.priceRange.min, 'Pre-Construction');
  doc.setTextColor(140, 109, 67);
  doc.text(`BUY SMART CASHBACK: UP TO ${formatCurrency(cashbackResult.estimatedCashback)}*`, margin + 55, y + 5.8);

  const formattedDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 110);
  doc.text(`Generated: ${formattedDate}`, pageWidth - margin - 4, y + 5.8, { align: 'right' });

  y += 13;

  // =========================================================================
  // KEY METRICS 4-CARD BENTO GRID
  // =========================================================================
  const cardGap = 3;
  const cardWidth = (contentWidth - cardGap * 3) / 4;
  const cardHeight = 20;

  const metrics = [
    { label: 'VIP PRICING', value: project.priceRange.display, sub: 'Initial Release Tier' },
    { label: 'EST. OCCUPANCY', value: project.occupancyYear || 'TBA', sub: 'Tentative Closing' },
    { label: 'TOTAL RESIDENCES', value: project.totalUnits ? `${project.totalUnits} Units` : 'Boutique', sub: 'Master-Planned' },
    { label: 'PROPERTY TYPES', value: project.propertyTypes?.[0] || 'Condo/Town', sub: project.propertyTypes?.slice(1).join(', ') || 'Mixed' }
  ];

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + cardGap);
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    // Mini gold accent tag top of card
    doc.setFillColor(197, 168, 128);
    doc.rect(cardX, y, cardWidth, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(m.label, cardX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 41, 66);
    doc.text(doc.splitTextToSize(m.value, cardWidth - 6)[0], cardX + 3, y + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 130);
    doc.text(doc.splitTextToSize(m.sub, cardWidth - 6)[0], cardX + 3, y + 16.5);
  });

  y += cardHeight + 6;

  // =========================================================================
  // SECTION: PROJECT OVERVIEW & AMENITIES
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 41, 66);
  doc.text('Project Overview & Neighborhood Vision', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const descLines = doc.splitTextToSize(project.description, contentWidth);
  const truncatedDesc = descLines.slice(0, 4); // Keep concise
  doc.text(truncatedDesc, margin, y);
  y += truncatedDesc.length * 4.2 + 4;

  // Key Highlights chip row
  if (project.highlights && project.highlights.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 41, 66);
    doc.text('KEY PROJECT HIGHLIGHTS:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    const highlightsText = project.highlights.slice(0, 5).join('  •  ');
    doc.text(doc.splitTextToSize(highlightsText, contentWidth - 45), margin + 42, y);
    y += 7;
  }

  // =========================================================================
  // SECTION: DEPOSIT STRUCTURE & VIP INCENTIVES (2-COLUMN BOX)
  // =========================================================================
  checkPageBreak(38);

  const colWidth = (contentWidth - 4) / 2;

  // Column 1: Deposit Schedule
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(margin, y, colWidth, 40, 1.5, 1.5, 'FD');

  doc.setFillColor(15, 41, 66);
  doc.rect(margin, y, colWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EXTENDED VIP DEPOSIT STRUCTURE', margin + 3, y + 4.5);

  let depY = y + 10.5;
  if (project.depositStructure && project.depositStructure.length > 0) {
    project.depositStructure.slice(0, 5).forEach((dep) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 41, 66);
      doc.text(`${dep.percentage}%`, margin + 3, depY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(dep.stage, margin + 14, depY);

      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text(doc.splitTextToSize(dep.timing, 35)[0], margin + colWidth - 3, depY, { align: 'right' });
      depY += 5.5;
    });
  }

  // Column 2: VIP Incentives
  doc.setFillColor(254, 252, 248);
  doc.setDrawColor(235, 220, 195);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 40, 1.5, 1.5, 'FD');

  doc.setFillColor(197, 168, 128);
  doc.rect(margin + colWidth + 4, y, colWidth, 6.5, 'F');
  doc.setTextColor(25, 25, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EXCLUSIVE PLATINUM BUYER INCENTIVES', margin + colWidth + 7, y + 4.5);

  let incY = y + 11;
  const incentives = project.vipIncentives || [
    'Right to Lease During Interim Occupancy',
    'Capped Development Levies & Charges',
    'Reduced Assignment Administrative Fee',
    'Free Kitchen Island or Upgrade Credit'
  ];

  incentives.slice(0, 4).forEach((inc) => {
    doc.setFillColor(15, 41, 66);
    doc.circle(margin + colWidth + 8, incY - 1, 0.8, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    const incLines = doc.splitTextToSize(inc, colWidth - 14);
    doc.text(incLines[0], margin + colWidth + 11, incY);
    incY += 6.5;
  });

  y += 46;

  // =========================================================================
  // SECTION: FLOOR PLANS & SUITE SPECIFICATIONS
  // =========================================================================
  checkPageBreak(50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 41, 66);
  doc.text(`Curated Floor Plans & Layout Matrix (${project.floorPlans.length} Designs)`, margin, y);
  y += 4.5;

  // Floor plans table header
  const cols = {
    planName: { x: margin + 3, w: 42, label: 'MODEL / SUITE' },
    type: { x: margin + 46, w: 32, label: 'BED / TYPE' },
    sqft: { x: margin + 79, w: 22, label: 'SIZE (SQ.FT.)' },
    baths: { x: margin + 102, w: 18, label: 'BATHS' },
    price: { x: margin + 121, w: 30, label: 'STARTING PRICE' },
    features: { x: margin + 152, w: 30, label: 'NOTABLE FEATURES' }
  };

  doc.setFillColor(15, 41, 66);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  doc.text(cols.planName.label, cols.planName.x, y + 4.8);
  doc.text(cols.type.label, cols.type.x, y + 4.8);
  doc.text(cols.sqft.label, cols.sqft.x, y + 4.8);
  doc.text(cols.baths.label, cols.baths.x, y + 4.8);
  doc.text(cols.price.label, cols.price.x, y + 4.8);
  doc.text(cols.features.label, cols.features.x, y + 4.8);

  y += 7;

  // Floor plan table rows
  project.floorPlans.forEach((plan: FloorPlan, index: number) => {
    checkPageBreak(12);

    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 249, isEven ? 255 : 250, isEven ? 255 : 251);
    doc.rect(margin, y, contentWidth, 9.5, 'F');
    doc.setDrawColor(235, 235, 235);
    doc.line(margin, y + 9.5, pageWidth - margin, y + 9.5);

    // Plan Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 41, 66);
    doc.text(doc.splitTextToSize(plan.name, cols.planName.w - 2)[0], cols.planName.x, y + 4.5);

    // Suite Type
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(doc.splitTextToSize(plan.type, cols.type.w - 2)[0], cols.type.x, y + 4.5);

    // Sq.Ft.
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`${plan.sqft} sq.ft.`, cols.sqft.x, y + 4.5);

    // Bathrooms
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${plan.bathrooms} Bath`, cols.baths.x, y + 4.5);

    // Starting Price
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 109, 67); // Gold/Bronze
    doc.text(plan.startingPrice, cols.price.x, y + 4.5);

    // Features
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    const featureSnippet = plan.features?.[0] || plan.exposure || 'Standard Finishes';
    doc.text(doc.splitTextToSize(featureSnippet, cols.features.w - 2)[0], cols.features.x, y + 4.5);

    y += 9.5;
  });

  y += 5;

  // =========================================================================
  // FIDUCIARY ASSURANCE & ACTION NOTICE
  // =========================================================================
  checkPageBreak(30);

  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(200, 215, 230);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 41, 66);
  doc.text('VIP PLATINUM BUYER REPRESENTATION & WORKSHEET RESERVATION', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(
    'As a registered buyer represented by Amit Sawhney, your interest is secured via direct builder allocation worksheets before public launches. You benefit from Ontario statutory 10-day cooling-off protection, lawyer document review clauses, and the exclusive "Buy Smart, Save Big™" commission cashback at closing.',
    margin + 4,
    y + 10.5,
    { maxWidth: contentWidth - 8 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 41, 66);
  doc.text(
    `TO RESERVE A SUITE OR SCHEDULE A PRIVATE SALES GALLERY TOUR: Contact Amit Sawhney at ${AMIT_SAWHNEY.phoneFormatted} or ${AMIT_SAWHNEY.email}`,
    margin + 4,
    y + 18.5
  );

  y += 26;

  // Final footer on last page
  addFooter();

  // Save the PDF file
  const sanitizedProjectName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${sanitizedProjectName}_Executive_Summary.pdf`);
}
