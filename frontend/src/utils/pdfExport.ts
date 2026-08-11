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
  
  // Colors
  const primaryColor = [79, 70, 229]; // Indigo-600 #4F46E5
  const darkTextColor = [15, 23, 42]; // Slate-900
  const grayTextColor = [100, 116, 139]; // Slate-500
  const lightBgColor = [248, 250, 252]; // Slate-50

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Company Name & Info (Left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('OmniFlow Wholesale Ltd.', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('Plot 108, Industrial Logistic Park, Sector 18, Navi Mumbai, MH 400705', 14, 25);
  doc.text('GSTIN: 27AABCO9981Z1  |  Phone: +91 22 4000 8800  |  Email: billing@omniflow.com', 14, 29);

  // Invoice Title & Status (Right side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('DELIVERY CHALLAN / TAX INVOICE', pageWidth - 14, 20, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(challan.challanNumber, pageWidth - 14, 26, { align: 'right' });

  // Status Badge box
  const statusText = challan.status.toUpperCase();
  doc.setFontSize(8);
  if (challan.status === 'Confirmed') {
    doc.setFillColor(220, 252, 231); // Emerald-100
    doc.setTextColor(22, 101, 52); // Emerald-800
  } else if (challan.status === 'Draft') {
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.setTextColor(146, 64, 14); // Amber-800
  } else {
    doc.setFillColor(241, 245, 249);
    doc.setTextColor(71, 85, 105);
  }
  doc.roundedRect(pageWidth - 45, 29, 31, 6, 1.5, 1.5, 'F');
  doc.text(statusText, pageWidth - 29.5, 33.2, { align: 'center' });

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.line(14, 38, pageWidth - 14, 38);

  // 2. Customer & Dispatch Info Box
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, pageWidth - 28, 28, 2, 2, 'FD');

  // Customer Side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('CONSIGNEE / CUSTOMER DETAILS', 18, 47);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(challan.customerBusinessName, 18, 52.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attn: ${challan.customerName}`, 18, 57);
  if (challan.customerGst) {
    doc.text(`GSTIN: ${challan.customerGst}`, 18, 61.5);
  }

  // Delivery Side
  const midX = pageWidth / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('DELIVERY & ISSUE DETAILS', midX, 47);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const formattedDate = new Date(challan.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.text(`Invoice Date: ${formattedDate}`, midX, 52.5);
  doc.text(`Issued By: ${challan.createdBy}`, midX, 57);
  
  // Truncated Address
  const addrText = challan.customerAddress || 'Standard Warehouse Dispatch';
  const splitAddress = doc.splitTextToSize(`Address: ${addrText}`, 80);
  doc.text(splitAddress[0], midX, 61.5);

  // 3. Line Items Table using autoTable
  const tableData = challan.products.map((item, index) => [
    index + 1,
    item.productName,
    item.sku,
    `INR ${item.unitPrice.toLocaleString()}`,
    item.quantity,
    `INR ${item.lineTotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 74,
    head: [['#', 'Item Description', 'SKU', 'Unit Price', 'Qty', 'Line Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
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
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32, font: 'courier' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  // 4. Totals & Notes Section
  const summaryY = finalY + 6;

  // Left side: Dispatch Notes & Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Terms & Dispatch Notes:', 14, summaryY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  const notesText = challan.notes || 'Goods delivered in good sound condition. All disputes subject to Mumbai Jurisdiction.';
  const splitNotes = doc.splitTextToSize(notesText, 105);
  doc.text(splitNotes, 14, summaryY + 4.5);

  // Right side: Totals Summary Box
  const summaryBoxWidth = 65;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, summaryY - 2, summaryBoxWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Quantity:', summaryBoxX + 4, summaryY + 3);
  doc.text(`${challan.totalQuantity} units`, summaryBoxX + summaryBoxWidth - 4, summaryY + 3, { align: 'right' });

  doc.line(summaryBoxX + 4, summaryY + 6, summaryBoxX + summaryBoxWidth - 4, summaryY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Grand Total:', summaryBoxX + 4, summaryY + 12);
  doc.setTextColor(79, 70, 229);
  doc.text(`INR ${challan.totalAmount.toLocaleString()}`, summaryBoxX + summaryBoxWidth - 4, summaryY + 12, { align: 'right' });

  // 5. Signatures Section
  const sigY = summaryY + 36;
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.3);

  // Customer Signature
  doc.line(14, sigY, 70, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('Customer / Driver Receiver Signature', 14, sigY + 4);

  // Authorized Signatory
  doc.line(pageWidth - 70, sigY, pageWidth - 14, sigY);
  doc.text('Authorized Signatory (OmniFlow Ltd)', pageWidth - 70, sigY + 4);

  // Footer Tagline
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated securely by OmniFlow ERP on ${new Date().toLocaleString()}`, pageWidth / 2, pageWidth === 210 ? 287 : 280, {
    align: 'center',
  });

  // Save the PDF
  const cleanFileName = `Challan_Invoice_${challan.challanNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(cleanFileName);
};
