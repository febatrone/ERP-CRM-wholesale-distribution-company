import React from 'react';
import { SalesChallan } from '../types';
import { Printer, Download, X, Building2, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { generateChallanInvoicePDF } from '../utils/pdfExport';

interface ChallanInvoiceModalProps {
  challan: SalesChallan | null;
  onClose: () => void;
}

export const ChallanInvoiceModal: React.FC<ChallanInvoiceModalProps> = ({ challan, onClose }) => {
  if (!challan) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateChallanInvoicePDF(challan);
  };

  return (
    <div id="invoice-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 my-8 print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
              Challan Invoice Document
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                challan.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {challan.status}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-download-pdf-invoice"
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
              title="Generate and download PDF invoice document"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Invoice</span>
            </button>

            <button
              id="btn-print-invoice"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
              title="Open browser print dialog"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE / CHALLAN CONTENT */}
        <div id="printable-challan-invoice" className="space-y-6 text-slate-900 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold tracking-tight text-slate-900">OmniFlow Wholesale Ltd.</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Plot 108, Industrial Logistic Park, Sector 18</p>
              <p className="text-xs text-slate-500">GSTIN: 27AABCO9981Z1 | Phone: +91 22 4000 8800</p>
            </div>

            <div className="text-right">
              <h3 className="text-lg font-black uppercase text-indigo-900">DELIVERY CHALLAN / TAX INVOICE</h3>
              <p className="text-sm font-mono font-bold text-slate-800 mt-1">{challan.challanNumber}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: {new Date(challan.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consignee / Customer Details</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{challan.customerBusinessName}</p>
              <p className="font-medium text-slate-700">Attn: {challan.customerName}</p>
              {challan.customerGst && (
                <p className="font-mono text-slate-600 mt-1">
                  GSTIN: <span className="font-semibold">{challan.customerGst}</span>
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Delivery Address</span>
              <p className="text-slate-700 font-medium mt-1 leading-relaxed">{challan.customerAddress}</p>
              <p className="text-slate-500 mt-2">Issued By: {challan.createdBy}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 font-bold text-slate-700">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {challan.products.map((item, index) => (
                <tr key={index}>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{index + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.sku}</td>
                  <td className="py-2.5 px-3 text-right">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.lineTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Notes */}
          <div className="flex justify-between items-start border-t-2 border-slate-800 pt-4 text-xs">
            <div className="max-w-md space-y-1">
              <span className="font-bold text-slate-700">Terms & Dispatch Notes:</span>
              <p className="text-slate-500 italic">{challan.notes || 'Goods delivered in sound condition. Subject to Mumbai Jurisdiction.'}</p>
            </div>

            <div className="w-56 space-y-2 text-right">
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                <span>Total Quantity:</span>
                <span className="font-bold text-slate-900">{challan.totalQuantity} units</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm text-slate-900 border-b-2 border-slate-900">
                <span>Grand Total:</span>
                <span className="text-indigo-900">₹{challan.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-slate-500">
            <div className="border-t border-slate-300 pt-2 text-center">
              <span>Customer / Driver Receiver Signature</span>
            </div>
            <div className="border-t border-slate-300 pt-2 text-center">
              <span>Authorized Signatory (OmniFlow Ltd)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
