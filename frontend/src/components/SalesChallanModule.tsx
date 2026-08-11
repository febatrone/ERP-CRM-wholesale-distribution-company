import React, { useState } from 'react';
import { Customer, Product, SalesChallan, UserRole } from '../types';
import { Plus, Search, Filter, FileText, CheckCircle, AlertTriangle, Printer, Trash2, X, Eye, Download } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { generateChallanInvoicePDF } from '../utils/pdfExport';

interface SalesChallanModuleProps {
  challans: SalesChallan[];
  customers: Customer[];
  products: Product[];
  userRole: UserRole;
  onCreateChallan: (payload: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    status?: 'Draft' | 'Confirmed';
    notes?: string;
  }) => Promise<SalesChallan>;
  onUpdateChallanStatus: (id: string, status: 'Draft' | 'Confirmed' | 'Cancelled') => Promise<void>;
  onViewChallanDetail: (challan: SalesChallan) => void;
  initialCreateOpen?: boolean;
}

export const SalesChallanModule: React.FC<SalesChallanModuleProps> = ({
  challans,
  customers,
  products,
  userRole,
  onCreateChallan,
  onUpdateChallanStatus,
  onViewChallanDetail,
  initialCreateOpen = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(initialCreateOpen);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter challans
  const filteredChallans = challans.filter((c) => {
    const matchesSearch =
      c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerBusinessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export Filtered Sales Challans to CSV Report
  const handleDownloadReport = () => {
    const headers = [
      'Challan Number',
      'Customer Business Name',
      'Contact Person',
      'Status',
      'Total Line Items',
      'Total Quantity',
      'Total Amount (INR)',
      'Created Date',
      'Created By',
      'Notes',
    ];

    const rows = filteredChallans.map((c) => [
      `"${c.challanNumber}"`,
      `"${c.customerBusinessName.replace(/"/g, '""')}"`,
      `"${c.customerName.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      c.products.length,
      c.totalQuantity,
      c.totalAmount,
      `"${c.createdAt}"`,
      `"${c.createdBy}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sales_challans_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItemRow = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length === 1) return;
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const handleItemProductChange = (index: number, productId: string) => {
    const updated = [...selectedItems];
    updated[index].productId = productId;
    setSelectedItems(updated);
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, qty);
    setSelectedItems(updated);
  };

  const handleCreateSubmit = async (status: 'Draft' | 'Confirmed') => {
    setFormError('');

    if (!selectedCustomerId) {
      setFormError('Please select a customer for this sales challan.');
      return;
    }

    const validItems = selectedItems.filter((i) => i.productId !== '');
    if (validItems.length === 0) {
      setFormError('Please select at least one product line item.');
      return;
    }

    // Front-end stock validation check before submitting if status === 'Confirmed'
    if (status === 'Confirmed') {
      for (const item of validItems) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && prod.currentStock < item.quantity) {
          setFormError(
            `Insufficient stock for '${prod.name}' (${prod.sku}). Available: ${prod.currentStock}, Requested: ${item.quantity}. Reduce quantity or save as Draft.`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await onCreateChallan({
        customerId: selectedCustomerId,
        items: validItems,
        status,
        notes,
      });
      setShowCreateModal(false);
      // Reset form
      setSelectedCustomerId('');
      setSelectedItems([{ productId: '', quantity: 1 }]);
      setNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create sales challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate live total for create modal preview
  const calculateTotals = () => {
    let qtyTotal = 0;
    let amtTotal = 0;

    selectedItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        qtyTotal += item.quantity;
        amtTotal += prod.unitPrice * item.quantity;
      }
    });

    return { qtyTotal, amtTotal };
  };

  const { qtyTotal, amtTotal } = calculateTotals();

  return (
    <div id="sales-challan-module-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Challans & Dispatch</h2>
          <p className="text-xs text-slate-500">
            Generate auto-numbered sales challans with automatic stock reduction on confirmed orders
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            id="btn-download-challan-csv"
            onClick={handleDownloadReport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            title="Export filtered sales challan report as CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download Report</span>
          </button>

          {(userRole === 'Admin' || userRole === 'Sales') && (
            <button
              id="btn-create-challan"
              onClick={() => {
                setFormError('');
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Sales Challan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="search-challan-input"
            placeholder="Search Challan #, Customer name, Business name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            id="filter-challan-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Challan List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Challan #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Products Snapshot</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredChallans.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <HighlightText text={c.challanNumber} highlight={searchTerm} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">
                      <HighlightText text={c.customerBusinessName} highlight={searchTerm} />
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <HighlightText text={c.customerName} highlight={searchTerm} />
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="space-y-0.5">
                      {c.products.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="truncate max-w-xs font-medium text-[11px]">
                          • {item.productName} × <span className="font-bold text-slate-800">{item.quantity}</span>
                        </p>
                      ))}
                      {c.products.length > 2 && (
                        <p className="text-[10px] text-indigo-600 italic">+ {c.products.length - 2} more item(s)</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">₹{c.totalAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : c.status === 'Draft'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {c.status === 'Draft' && (userRole === 'Admin' || userRole === 'Sales' || userRole === 'Accounts') && (
                      <button
                        onClick={async () => {
                          try {
                            await onUpdateChallanStatus(c.id, 'Confirmed');
                          } catch (err: any) {
                            alert(err.message || 'Error confirming challan');
                          }
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-all"
                        title="Confirm & Reduce Stock"
                      >
                        Confirm Order
                      </button>
                    )}

                    <button
                      onClick={() => generateChallanInvoicePDF(c)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-all inline-flex items-center space-x-1"
                      title="Download PDF Invoice for this sales challan"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => onViewChallanDetail(c)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded transition-all inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Invoice / Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sales Challan Wizard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create New Sales Challan</h3>
                <p className="text-xs text-slate-500">Stock will be automatically deducted upon confirmation</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Select Customer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Customer *</label>
                <select
                  id="select-challan-customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.businessName} ({cust.name}) - {cust.customerType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Line Item Products *</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-indigo-600 hover:underline text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedItems.map((item, index) => {
                    const selectedProd = products.find((p) => p.id === item.productId);
                    const linePrice = selectedProd ? selectedProd.unitPrice * item.quantity : 0;
                    const isInsufficient = selectedProd && selectedProd.currentStock < item.quantity;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isInsufficient ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex-1 w-full">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemProductChange(index, e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (SKU: {p.sku}) — ₹{p.unitPrice} | Stock: {p.currentStock}
                              </option>
                            ))}
                          </select>
                          {selectedProd && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Location: {selectedProd.location} | Registered Stock: {selectedProd.currentStock} units
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <div>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(index, Number(e.target.value))}
                              className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                            />
                          </div>

                          <div className="w-24 text-right font-bold text-slate-900">
                            ₹{linePrice.toLocaleString()}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700">Order Totals:</span>
                  <p className="text-[11px] text-slate-500">{qtyTotal} total unit(s)</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-indigo-900">₹{amtTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Shipping Terms</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Express freight delivery before Friday"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCreateSubmit('Draft')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCreateSubmit('Confirmed')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Confirm & Deduct Stock</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
