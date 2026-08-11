import React, { useState } from 'react';
import { Download, Code, Server, Database, ShieldCheck, CheckCircle2, Terminal } from 'lucide-react';

export const ApiDocsModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apis' | 'architecture' | 'roles'>('apis');

  const handleDownloadPostman = () => {
    window.open('/api/docs/postman', '_blank');
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Role-based JWT login endpoint. Returns active user & mock token.',
      body: '{\n  "email": "sales@omniflow.com",\n  "role": "Sales"\n}',
    },
    {
      method: 'GET',
      path: '/api/customers',
      desc: 'List customers with search, status filter (Lead/Active/Inactive), type filter.',
      params: '?q=apex&status=Active&type=Distributor',
    },
    {
      method: 'POST',
      path: '/api/customers',
      desc: 'Add a new customer with input validation for required fields.',
      body: '{\n  "name": "Rajesh Sharma",\n  "mobile": "+91 98765 43210",\n  "email": "rajesh@sharmatraders.in",\n  "businessName": "Sharma Electricals",\n  "customerType": "Wholesale",\n  "address": "12 Market Rd, Pune 411002"\n}',
    },
    {
      method: 'POST',
      path: '/api/customers/:id/followups',
      desc: 'Log a new CRM follow-up note & update scheduled follow-up date.',
      body: '{\n  "note": "Discussed bulk order terms",\n  "date": "2026-08-20"\n}',
    },
    {
      method: 'GET',
      path: '/api/products',
      desc: 'Retrieve product inventory catalogue with search & low-stock filter.',
      params: '?lowStock=true',
    },
    {
      method: 'POST',
      path: '/api/products',
      desc: 'Add new product with SKU uniqueness validation.',
      body: '{\n  "name": "Smart Energy Meter 3P",\n  "sku": "MTR-SMT-3P",\n  "category": "Instruments",\n  "unitPrice": 5400,\n  "currentStock": 60,\n  "minStockAlert": 15\n}',
    },
    {
      method: 'POST',
      path: '/api/stock-logs',
      desc: 'Record manual Stock IN/OUT with stock non-negativity check.',
      body: '{\n  "productId": "prod-1",\n  "quantity": 10,\n  "movementType": "IN",\n  "reason": "Purchase Order Receipt"\n}',
    },
    {
      method: 'POST',
      path: '/api/challans',
      desc: 'Generate Sales Challan with product snapshot & automatic stock deduction on Confirmed status.',
      body: '{\n  "customerId": "cust-1",\n  "items": [{ "productId": "prod-1", "quantity": 5 }],\n  "status": "Confirmed"\n}',
    },
  ];

  return (
    <div id="api-docs-view" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Developer & Evaluator Portal</span>
          <h2 className="text-2xl font-bold mt-1 flex items-center space-x-2">
            <Server className="w-6 h-6 text-indigo-400" />
            <span>REST API Documentation & Architecture</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Express.js REST backend specification, Postman Collection download, and role permission matrix.
          </p>
        </div>

        <button
          id="btn-download-postman"
          onClick={handleDownloadPostman}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Postman Collection</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('apis')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'apis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>REST API Endpoints</span>
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'architecture' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Architecture & Business Logic</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'roles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role-Based Access Matrix</span>
        </button>
      </div>

      {/* TAB 1: ENDPOINTS LIST */}
      {activeTab === 'apis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      ep.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ep.method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-slate-800 font-bold">{ep.path}</span>
                </div>
                <p className="text-slate-600">{ep.desc}</p>
                {ep.params && (
                  <div className="bg-slate-50 p-2 rounded font-mono text-[11px] text-indigo-700">
                    Query Params: {ep.params}
                  </div>
                )}
                {ep.body && (
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] whitespace-pre overflow-x-auto">
                    {ep.body}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ARCHITECTURE & BUSINESS LOGIC */}
      {activeTab === 'architecture' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 text-xs text-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Core Business Logic Implementation</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-slate-900">Automatic Stock Reduction:</strong> When a Sales Challan status transitions to <code className="bg-slate-100 px-1 py-0.5 rounded">Confirmed</code>, the server automatically checks available stock for every line item. If sufficient, stock is deducted and an immutable <code className="bg-slate-100 px-1 py-0.5 rounded">StockLog</code> entry with movement type <code className="bg-slate-100 px-1 py-0.5 rounded">OUT</code> is created.
              </li>
              <li>
                <strong className="text-slate-900">Stock Non-Negativity Guard:</strong> If stock is insufficient, the REST API responds with a <code className="bg-slate-100 px-1 py-0.5 rounded">400 Bad Request</code> error code detailing exact current stock vs requested quantity.
              </li>
              <li>
                <strong className="text-slate-900">Product Snapshotting:</strong> Sales Challans store frozen product snapshots (Product Name, SKU, Unit Price) at order creation time, ensuring future price adjustments do not distort historic invoice records.
              </li>
              <li>
                <strong className="text-slate-900">Full Stack Architecture:</strong> Built with Node.js + Express.js backend API server and React + Vite frontend SPA with real-time API communication.
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Test Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-bold text-purple-900">Admin</p>
                <p className="text-purple-800">admin@omniflow.com</p>
                <p className="text-slate-500">Pass: admin123</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-bold text-blue-900">Sales</p>
                <p className="text-blue-800">sales@omniflow.com</p>
                <p className="text-slate-500">Pass: sales123</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-bold text-amber-900">Warehouse</p>
                <p className="text-amber-800">warehouse@omniflow.com</p>
                <p className="text-slate-500">Pass: warehouse123</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="font-bold text-emerald-900">Accounts</p>
                <p className="text-emerald-800">accounts@omniflow.com</p>
                <p className="text-slate-500">Pass: accounts123</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                <th className="py-3 px-4">Feature / Module</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Sales</th>
                <th className="py-3 px-4 text-center">Warehouse</th>
                <th className="py-3 px-4 text-center">Accounts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-4 font-semibold">View Dashboard & Key Metrics</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Customer CRM (Add / Edit / Follow-up)</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-slate-400">Restricted</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-medium">Read-Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Inventory & Product Stock Management</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-medium">Read-Only</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-medium">Read-Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Sales Challans (Create & Confirm Orders)</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-medium">Read-Only</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-medium">Read-Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold">Invoice Generation & PDF Print Export</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-medium">Read-Only</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
