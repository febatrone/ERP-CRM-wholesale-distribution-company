import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesChallan } from '../types';

export const generateChallanInvoicePDF = (challan: SalesChallan) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Design Colors matching Insight Scope UI theme (Purple/Indigo)
  const primaryColor: [number, number, number] = [124, 58, 237]; // Purple-600 (#7C3AED)
  const secondaryColor: [number, number, number] = [99, 102, 241]; // Indigo-500 (#6366F1)
  const darkTextColor = [15, 23, 42]; // Slate-900
  const grayTextColor = [100, 116, 139]; // Slate-500
  const lightBgColor = [248, 250, 252]; // Slate-50

  // 1. Header Banner: Purple/Indigo Gradient Simulation (Increased height to 45mm)
  const bannerHeight = 45;
  for (let i = 0; i < bannerHeight; i++) {
    // Interpolate color from primary Purple to secondary Indigo for a smooth gradient vertical effect
    const ratio = i / bannerHeight;
    const r = Math.round(primaryColor[0] * (1 - ratio) + secondaryColor[0] * ratio);
    const g = Math.round(primaryColor[1] * (1 - ratio) + secondaryColor[1] * ratio);
    const b = Math.round(primaryColor[2] * (1 - ratio) + secondaryColor[2] * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, i, pageWidth, 1, 'F');
  }

  // Draw Logo Emblem (Geometric circles matching brand mark)
  const logoX = 18;
  const logoY = 22;
  
  // Circle base
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX, logoY, 4.5, 'F');
  // Inner shape matching screenshot (emblem cut)
  doc.setFillColor(111, 76, 235);
  doc.rect(logoX - 4.5, logoY - 1, 9, 2, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX, logoY - 2.2, 1.8, 'F');
  doc.circle(logoX, logoY + 2.2, 1.8, 'F');

  // Title: "INVOICE"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', logoX + 8, logoY + 3);

  // Dark Translucent Capsule status badge / Challan info on top right
  const badgeText = `INVOICE #${challan.challanNumber.toUpperCase()}`;
  doc.setFontSize(8.5);
  // Dark capsule background (#1E1B4B / rgba(30, 27, 75, 0.8))
  doc.setFillColor(30, 27, 75);
  doc.roundedRect(pageWidth - 68, logoY - 4, 54, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(badgeText, pageWidth - 41, logoY + 1.2, { align: 'center' });

  // 2. Billing & Company Metadata
  const billingY = bannerHeight + 14;

  // Left Side: Company & Consignee info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('INVOICE TO:', 14, billingY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(challan.customerBusinessName.toUpperCase(), 14, billingY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${challan.customerName}`, 14, billingY + 10.5);
  
  const addrText = challan.customerAddress || 'Warehouse Dispatch Delivery';
  const splitAddress = doc.splitTextToSize(addrText, 85);
  doc.text(splitAddress, 14, billingY + 15);

  // Right Side: Info / Date Table Box
  const infoTableX = pageWidth - 78;
  const infoTableWidth = 64;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('INVOICE / BILL DETAILS', infoTableX, billingY);

  // Outer border & Grid line for Info table
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(infoTableX, billingY + 2, infoTableWidth, 14, 'FD');
  doc.line(infoTableX, billingY + 9, infoTableX + infoTableWidth, billingY + 9);
  doc.line(infoTableX + 22, billingY + 2, infoTableX + 22, billingY + 16);

  // Table content labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('No.', infoTableX + 3, billingY + 6.5);
  doc.text('Date', infoTableX + 3, billingY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(challan.challanNumber, infoTableX + 25, billingY + 6.5);

  const formattedDate = new Date(challan.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(formattedDate, infoTableX + 25, billingY + 13.5);

  // 3. Line Items Table using autoTable
  const tableData = challan.products.map((item) => [
    item.productName,
    `INR ${item.unitPrice.toLocaleString()}`,
    item.quantity,
    `INR ${item.lineTotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: billingY + 28,
    head: [['ITEM DESCRIPTION', 'PRICE', 'QTY', 'TOTAL']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 28, halign: 'right' },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  // 4. Totals & Terms Section
  const summaryY = finalY + 8;

  // Left Side: Terms and signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('PAYMENT TERMS:', 14, summaryY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  const termsText = 'All goods are delivered subject to standard payment timelines. Disputes are handled via local jurisdiction rules.';
  const splitTerms = doc.splitTextToSize(termsText, 100);
  doc.text(splitTerms, 14, summaryY + 4);

  // Right Side: Summary Card Box (Light tinted background with rounded edges)
  const summaryBoxWidth = 64;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  // Draw subtotal background card matching screenshot layout
  doc.setFillColor(243, 244, 246); // Gray-100 background
  doc.setDrawColor(229, 231, 235); // Gray-200 border
  doc.roundedRect(summaryBoxX, summaryY - 2, summaryBoxWidth, 22, 2, 2, 'FD');

  // Subtotal label & value
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Tax (2.5%):', summaryBoxX + 4, summaryY + 3.5);
  const taxValue = challan.totalAmount * 0.025;
  doc.text(`INR ${taxValue.toFixed(0)}`, summaryBoxX + summaryBoxWidth - 4, summaryY + 3.5, { align: 'right' });

  // Grand Total Card Footer Block (Purple block matching screenshot)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(summaryBoxX, summaryY + 8, summaryBoxWidth, 10, 1.5, 1.5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SubTotal:', summaryBoxX + 4, summaryY + 14.5);
  doc.text(`INR ${challan.totalAmount.toLocaleString()}`, summaryBoxX + summaryBoxWidth - 4, summaryY + 14.5, { align: 'right' });

  // 5. Signature Section
  const sigY = summaryY + 32;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Signature', pageWidth - 18, sigY, { align: 'right' });

  doc.line(pageWidth - 52, sigY + 1.5, pageWidth - 14, sigY + 1.5);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('INSIGHT SCOPE INC. LTD.', pageWidth - 14, sigY + 5, { align: 'right' });

  // Footer notes & thank you
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('THANK YOU', 14, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const footerText = 'Note: This is a computer generated invoice and does not require a physical signature unless verified otherwise.';
  doc.text(footerText, 14, sigY + 10);

  // Save the PDF
  const cleanFileName = `Invoice_${challan.challanNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(cleanFileName);
};

