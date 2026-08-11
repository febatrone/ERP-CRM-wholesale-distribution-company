import React, { useState } from 'react';
import { User, Product, Customer, SalesChallan } from '../types';
import {
  Bell,
  Search,
  Plus,
  FileCode,
  LogOut,
  Package,
  AlertTriangle,
  Building2,
  Check,
  Sparkles,
  Command,
  ChevronDown,
  Folder,
  Settings,
  Users,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { HighlightText } from './HighlightText';

interface HeaderProps {
  currentUser: User;
  lowStockProducts: Product[];
  customers?: Customer[];
  products?: Product[];
  challans?: SalesChallan[];
  activeTab?: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
  onOpenNewChallan: () => void;
  onOpenNewCustomer: () => void;
  onOpenApiDocs: () => void;
  onOpenUserManagement?: () => void;
  onLogout: () => void;
  onNavigateToLowStock: () => void;
  onViewCustomerDetail?: (cust: Customer) => void;
  onViewChallanDetail?: (challan: SalesChallan) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  lowStockProducts,
  customers = [],
  products = [],
  challans = [],
  activeTab = 'dashboard',
  onTabChange,
  onOpenNewChallan,
  onOpenNewCustomer,
  onOpenApiDocs,
  onOpenUserManagement,
  onLogout,
  onNavigateToLowStock,
  onViewCustomerDetail,
  onViewChallanDetail,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(true);

  // Formatted date string matching Insight Scope style "4:28 pm, 12 Sep., Mon"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();

  // Role-specific Header Navigation Pills
  const rolePillTabs: Record<string, { id: ActiveTab; label: string }[]> = {
    Admin: [
      { id: 'dashboard' as ActiveTab, label: 'CRM System ▾' },
      { id: 'crm' as ActiveTab, label: 'Leads & Pipeline' },
      { id: 'challans' as ActiveTab, label: 'Sales Quotes' },
      { id: 'inventory' as ActiveTab, label: 'Products' },
      { id: 'stock-logs' as ActiveTab, label: 'Stock Logs' },
      { id: 'audit-logs' as ActiveTab, label: 'Audit Trail' },
    ],
    Sales: [
      { id: 'dashboard' as ActiveTab, label: 'Sales Hub ▾' },
      { id: 'crm' as ActiveTab, label: 'Leads & Pipeline' },
      { id: 'challans' as ActiveTab, label: 'Sales Orders' },
    ],
    Warehouse: [
      { id: 'dashboard' as ActiveTab, label: 'Warehouse Hub ▾' },
      { id: 'inventory' as ActiveTab, label: 'Products Catalog' },
      { id: 'stock-logs' as ActiveTab, label: 'Stock Movements' },
      { id: 'challans' as ActiveTab, label: 'Dispatch Orders' },
    ],
    Accounts: [
      { id: 'dashboard' as ActiveTab, label: 'Finance Hub ▾' },
      { id: 'challans' as ActiveTab, label: 'Invoices & Orders' },
      { id: 'crm' as ActiveTab, label: 'Client Accounts' },
      { id: 'audit-logs' as ActiveTab, label: 'Audit Trail' },
    ],
  };

  const topPillTabs = rolePillTabs[currentUser.role] || rolePillTabs.Admin;

  // Search Results filtering across CRM, Inventory, and Challans
  const cleanQuery = searchQuery.trim().toLowerCase();
  const matchedCustomers = cleanQuery
    ? customers.filter(
        (c) =>
          c.businessName.toLowerCase().includes(cleanQuery) ||
          c.name.toLowerCase().includes(cleanQuery) ||
          c.mobile.includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery) ||
          (c.city && c.city.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const matchedProducts = cleanQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.sku.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.location.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchedChallans = cleanQuery
    ? challans.filter(
        (c) =>
          c.challanNumber.toLowerCase().includes(cleanQuery) ||
          c.customerBusinessName.toLowerCase().includes(cleanQuery) ||
          c.customerName.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const totalMatches = matchedCustomers.length + matchedProducts.length + matchedChallans.length;

  return (
    <header
      id="main-app-header"
      className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl mx-2 mt-2 px-5 py-3.5 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3"
    >
      {/* Top Bar: Welcome Greeting, Search, AI Assistant & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Welcome Date Banner */}
        <div className="flex items-center space-x-3 shrink-0">
          <div>
            <p className="text-xs font-semibold text-slate-500 leading-tight">Welcome back!</p>
            <p className="text-sm font-extrabold text-slate-900 tracking-tight">
              It's <span className="text-purple-700">{formattedTime}</span>, {formattedDate}
            </p>
          </div>
        </div>

        {/* Search Bar with CMD+K & Real-time Live Highlight Overlay */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            id="global-header-search"
            placeholder="Search leads, clients, SKUs, sales orders..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-12 py-2 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-2 flex items-center space-x-0.5 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-400 shadow-2xs pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}

          {/* Real-time Search Overlay Popover */}
          {cleanQuery && showSearchResults && (
            <div className="absolute left-0 right-0 top-12 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 px-3 z-50 space-y-3 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Real-time Matches ({totalMatches})</span>
                </span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-[11px] font-bold text-purple-600 hover:underline"
                >
                  Close
                </button>
              </div>

              {totalMatches === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  No matching clients, SKUs, or sales orders found for "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Clients / CRM Section */}
                  {matchedCustomers.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 px-1 flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>Clients & CRM Leads</span>
                      </div>
                      <div className="space-y-1">
                        {matchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (onViewCustomerDetail) onViewCustomerDetail(c);
                              if (onTabChange) onTabChange('crm');
                              setShowSearchResults(false);
                            }}
                            className="p-2 hover:bg-purple-50/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-900">
                                <HighlightText text={c.businessName} highlight={searchQuery} />
                              </p>
                              <p className="text-[10px] text-slate-500">
                                <HighlightText text={c.name} highlight={searchQuery} /> •{' '}
                                <HighlightText text={c.mobile} highlight={searchQuery} />
                              </p>
                            </div>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full shrink-0">
                              {c.pipelineStage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inventory Products Section */}
                  {matchedProducts.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-1 flex items-center space-x-1">
                        <Package className="w-3 h-3" />
                        <span>Inventory Catalog SKUs</span>
                      </div>
                      <div className="space-y-1">
                        {matchedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (onTabChange) onTabChange('inventory');
                              setShowSearchResults(false);
                            }}
                            className="p-2 hover:bg-amber-50/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-900">
                                <HighlightText text={p.name} highlight={searchQuery} />
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                SKU: <HighlightText text={p.sku} highlight={searchQuery} /> •{' '}
                                <HighlightText text={p.category} highlight={searchQuery} />
                              </p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full shrink-0">
                              ₹{p.unitPrice.toLocaleString()} ({p.currentStock} stock)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sales Challans Section */}
                  {matchedChallans.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 px-1 flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>Sales Challans / Orders</span>
                      </div>
                      <div className="space-y-1">
                        {matchedChallans.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              if (onViewChallanDetail) onViewChallanDetail(c);
                              if (onTabChange) onTabChange('challans');
                              setShowSearchResults(false);
                            }}
                            className="p-2 hover:bg-teal-50/80 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-900 font-mono">
                                <HighlightText text={c.challanNumber} highlight={searchQuery} />
                              </p>
                              <p className="text-[10px] text-slate-500">
                                <HighlightText text={c.customerBusinessName} highlight={searchQuery} />
                              </p>
                            </div>
                            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full shrink-0">
                              ₹{c.totalAmount.toLocaleString()} ({c.status})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center space-x-2.5">
          {/* AI Assistant Pill Button */}
          <button
            onClick={() => alert('✨ OmniFlow AI Assistant active: Intelligent pipeline analysis & auto lead scoring enabled.')}
            className="px-3.5 py-1.5 bg-linear-to-r from-amber-50 via-purple-50 to-pink-50 hover:from-amber-100 hover:to-pink-100 text-slate-800 rounded-full text-xs font-bold border border-amber-200/80 shadow-2xs transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-purple-900">Ai assistant</span>
          </button>

          {/* REST API & Postman Button */}
          <button
            id="btn-header-api-docs"
            onClick={onOpenApiDocs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="REST API Documentation & Postman Export"
          >
            <FileCode className="w-4 h-4 text-slate-600" />
          </button>

          {/* Admin User Account Management Button */}
          {currentUser.role === 'Admin' && onOpenUserManagement && (
            <button
              id="btn-header-user-mgmt"
              onClick={onOpenUserManagement}
              className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold border border-purple-300/80 transition-all flex items-center space-x-1"
              title="Admin User Account Management"
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span className="hidden lg:inline">User Accounts</span>
            </button>
          )}

          {/* Low Stock Alerts Bell */}
          <div className="relative">
            <button
              id="btn-notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Stock Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {lowStockProducts.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 py-3 z-30 space-y-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Low Stock Warnings ({lowStockProducts.length})</span>
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-purple-600 hover:underline font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 px-2">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs flex flex-col items-center">
                      <Check className="w-5 h-5 text-emerald-500 mb-1" />
                      <span>All product stocks are at healthy levels.</span>
                    </div>
                  ) : (
                    lowStockProducts.map((p) => (
                      <div key={p.id} className="p-2.5 hover:bg-amber-50/50 rounded-xl transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                            {p.currentStock} left
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {lowStockProducts.length > 0 && (
                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-center rounded-b-2xl">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigateToLowStock();
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-bold"
                    >
                      View Inventory & Restock →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Logout Button */}
          <button
            id="btn-logout"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Category Pill Tabs & Quick Creation Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
        {/* Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {topPillTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-purple-100 text-purple-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {(currentUser.role === 'Admin' || currentUser.role === 'Sales') && (
            <button
              id="btn-quick-new-customer"
              onClick={onOpenNewCustomer}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Add Lead</span>
            </button>
          )}

          {(currentUser.role === 'Admin' || currentUser.role === 'Sales') && (
            <button
              id="btn-quick-new-challan"
              onClick={onOpenNewChallan}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Sales Order</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


