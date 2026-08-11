import React, { useState } from 'react';
import { Product, UserRole } from '../types';
import { Plus, Search, AlertTriangle, ArrowDownRight, ArrowUpRight, Edit2, PackagePlus, Warehouse, CheckCircle, X, Download } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface InventoryModuleProps {
  products: Product[];
  userRole: UserRole;
  onAddProduct: (data: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  onAddStockMovement: (payload: {
    productId: string;
    quantity: number;
    movementType: 'IN' | 'OUT';
    reason: string;
  }) => Promise<void>;
  initialLowStockFilter?: boolean;
  onDeleteProduct?: (id: string) => Promise<void>;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  userRole,
  onAddProduct,
  onUpdateProduct,
  onAddStockMovement,
  initialLowStockFilter = false,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(initialLowStockFilter);

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustmentProduct, setStockAdjustmentProduct] = useState<Product | null>(null);

  // Forms State
  const [productFormData, setProductFormData] = useState({
    name: '',
    sku: '',
    category: 'Lighting & Fixtures',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 10,
    location: 'Warehouse A',
  });

  const [stockFormData, setStockFormData] = useState({
    quantity: 1,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Categories
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesLowStock = !onlyLowStock || p.currentStock <= p.minStockAlert;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Export Filtered Products to CSV Report
  const handleDownloadReport = () => {
    const headers = [
      'SKU / Code',
      'Product Name',
      'Category',
      'Unit Price (INR)',
      'Current Stock',
      'Min Stock Alert Level',
      'Warehouse Bay / Location',
      'Stock Status',
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      p.unitPrice,
      p.currentStock,
      p.minStockAlert,
      `"${p.location.replace(/"/g, '""')}"`,
      p.currentStock <= p.minStockAlert ? '"LOW STOCK"' : '"HEALTHY"',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `inventory_stock_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      sku: '',
      category: 'Lighting & Fixtures',
      unitPrice: 1000,
      currentStock: 50,
      minStockAlert: 10,
      location: 'Warehouse A - Bay 1',
    });
    setFormError('');
    setShowProductModal(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProductFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      location: p.location,
    });
    setFormError('');
    setShowProductModal(true);
  };

  const openStockAdjustModal = (p: Product) => {
    setStockAdjustmentProduct(p);
    setStockFormData({
      quantity: 10,
      movementType: 'IN',
      reason: 'Purchase Order Stock Receive',
    });
    setFormError('');
    setShowStockModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productFormData.name || !productFormData.sku || !productFormData.category) {
      setFormError('Please fill in required fields: Product Name, SKU, Category');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productFormData);
      } else {
        await onAddProduct(productFormData);
      }
      setShowProductModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustmentProduct) return;
    setFormError('');

    if (!stockFormData.reason) {
      setFormError('Please provide a reason for stock movement (e.g. Purchase order, damage return)');
      return;
    }

    if (stockFormData.movementType === 'OUT' && stockAdjustmentProduct.currentStock < stockFormData.quantity) {
      setFormError(
        `Insufficient stock for '${stockAdjustmentProduct.name}'. Current stock: ${stockAdjustmentProduct.currentStock}, Requested: ${stockFormData.quantity}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddStockMovement({
        productId: stockAdjustmentProduct.id,
        quantity: Number(stockFormData.quantity),
        movementType: stockFormData.movementType,
        reason: stockFormData.reason,
      });
      setShowStockModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Error executing stock adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="inventory-module-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product & Inventory Catalogue</h2>
          <p className="text-xs text-slate-500">Track stock levels, warehouse locations, and minimum threshold alerts</p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            id="btn-download-inventory-csv"
            onClick={handleDownloadReport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            title="Export filtered inventory stock report as CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download Report</span>
          </button>

          {(userRole === 'Admin' || userRole === 'Warehouse') && (
            <button
              id="btn-add-product"
              onClick={openAddProductModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="search-product-input"
            placeholder="Search SKU, Product Name, Category, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            id="filter-product-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Toggle */}
        <button
          id="btn-toggle-low-stock"
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border ${
            onlyLowStock
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock Only ({products.filter((p) => p.currentStock <= p.minStockAlert).length})</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min Alert</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((p) => {
                const isLow = p.currentStock <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">
                      <HighlightText text={p.sku} highlight={searchTerm} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <HighlightText text={p.name} highlight={searchTerm} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700">
                        <HighlightText text={p.category} highlight={searchTerm} />
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{p.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isLow ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3 mr-0.5" />}
                        <span>{p.currentStock} units</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{p.minStockAlert}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium flex items-center">
                      <Warehouse className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <HighlightText text={p.location} highlight={searchTerm} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {(userRole === 'Admin' || userRole === 'Warehouse') && (
                          <button
                            onClick={() => openStockAdjustModal(p)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-semibold text-[11px] flex items-center space-x-1"
                            title="Adjust stock (IN / OUT)"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Stock In/Out</span>
                          </button>
                        )}
                        {(userRole === 'Admin' || userRole === 'Warehouse') && (
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteProduct && (userRole === 'Admin' || userRole === 'Warehouse') && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete product ${p.name} (SKU: ${p.sku})?`)) {
                                await onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-650 hover:bg-slate-100 rounded transition-all"
                            title="Delete Product"
                          >
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Edit Product Details' : 'Add New Inventory Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  placeholder="e.g. Industrial LED High Bay Light 100W"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.sku}
                    onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value.toUpperCase() })}
                    placeholder="LED-HB-100W"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    placeholder="e.g. Lighting & Fixtures"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={productFormData.unitPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productFormData.currentStock}
                    onChange={(e) => setProductFormData({ ...productFormData, currentStock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Alert Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={productFormData.minStockAlert}
                    onChange={(e) => setProductFormData({ ...productFormData, minStockAlert: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Location</label>
                <input
                  type="text"
                  value={productFormData.location}
                  onChange={(e) => setProductFormData({ ...productFormData, location: e.target.value })}
                  placeholder="Warehouse A - Bay 4"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Stock In / Out Adjustment Modal */}
      {showStockModal && stockAdjustmentProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Stock Movement</h3>
                <p className="text-xs text-slate-500">{stockAdjustmentProduct.name} ({stockAdjustmentProduct.sku})</p>
              </div>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleStockAdjustSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Current Registered Stock:</span>
                <span className="font-bold text-slate-900 text-sm">{stockAdjustmentProduct.currentStock} units</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Movement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockFormData({ ...stockFormData, movementType: 'IN' })}
                    className={`py-2 rounded-lg font-bold border transition-all flex items-center justify-center space-x-1 ${
                      stockFormData.movementType === 'IN'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Stock IN (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockFormData({ ...stockFormData, movementType: 'OUT' })}
                    className={`py-2 rounded-lg font-bold border transition-all flex items-center justify-center space-x-1 ${
                      stockFormData.movementType === 'OUT'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Stock OUT (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Reference *</label>
                <input
                  type="text"
                  required
                  value={stockFormData.reason}
                  onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
                  placeholder="e.g. Purchase order PO-2026-99 or Damage adjustment"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Recording...' : 'Record Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
