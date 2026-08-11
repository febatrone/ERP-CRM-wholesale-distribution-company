import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePDF(challan: any) {
  const doc = new jsPDF();

  // Header Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SALES INVOICE", 14, 20);

  // Business Metadata Info
  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text(`Invoice No: INV-${challan.challanNumber.replace("CHN-", "")}`, 14, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 34);
  doc.text(`Challan Ref: ${challan.challanNumber}`, 14, 40);

  // Customer Details
  doc.setFont("Helvetica", "bold");
  doc.text("Bill To:", 14, 50);
  doc.setFont("Helvetica", "normal");
  doc.text(`${challan.customer?.businessName || "N/A"}`, 14, 56);
  doc.text(`Contact: ${challan.customer?.name || "N/A"}`, 14, 62);
  doc.text(`Mobile: ${challan.customer?.mobile || "N/A"}`, 14, 68);
  doc.text(`Address: ${challan.customer?.address || "N/A"}`, 14, 74);

  // Table items map
  const tableRows = challan.items.map((item: any) => [
    item.productNameSnapshot,
    item.skuSnapshot,
    `$${Number(item.unitPriceSnapshot).toFixed(2)}`,
    item.quantity,
    `$${Number(item.subtotal).toFixed(2)}`
  ]);

  // Generate AutoTable layout
  autoTable(doc, {
    startY: 82,
    head: [["Product Name", "SKU", "Unit Price", "Qty", "Subtotal"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] }
  });

  // Calculate totals (18% GST default)
  const subtotal = challan.items.reduce((acc: number, curr: any) => acc + Number(curr.subtotal), 0);
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("Helvetica", "bold");
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`GST (18%): $${gstAmount.toFixed(2)}`, 140, finalY + 6);
  doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 140, finalY + 12);

  // Save the document to trigger browser download
  doc.save(`Invoice_${challan.challanNumber}.pdf`);
}
