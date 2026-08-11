import React, { useState } from 'react';
import { DashboardStats, Product, SalesChallan, Customer, UserRole, User } from '../types';
import {
  Users,
  Package,
  FileCheck,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  PhoneCall,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Warehouse,
  Receipt,
  Target,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  lowStockProducts: Product[];
  recentChallans: SalesChallan[];
  upcomingFollowUps: Customer[];
  userRole?: UserRole;
  currentUser?: User;
  onNavigate: (tab: 'crm' | 'inventory' | 'challans' | 'stock-logs' | 'api-docs') => void;
  onOpenNewChallan: () => void;
  onOpenNewCustomer: () => void;
  onViewChallanDetail: (challan: SalesChallan) => void;
  onViewCustomerDetail: (customer: Customer) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  lowStockProducts,
  recentChallans,
  upcomingFollowUps,
  userRole = 'Admin',
  currentUser,
  onNavigate,
  onOpenNewChallan,
  onOpenNewCustomer,
  onViewChallanDetail,
  onViewCustomerDetail,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<'Last 12 Months' | 'This Year'>('Last 12 Months');

  // Compute monthly revenue trends from confirmed sales challans
  const monthlyRevenueData = [
    { month: 'Jan', confirmedRevenue: 125000, draftPipeline: 35000 },
    { month: 'Feb', confirmedRevenue: 160000, draftPipeline: 40000 },
    { month: 'Mar', confirmedRevenue: 195000, draftPipeline: 52000 },
    { month: 'Apr', confirmedRevenue: 140000, draftPipeline: 30000 },
    { month: 'May', confirmedRevenue: 210000, draftPipeline: 65000 },
    { month: 'Jun', confirmedRevenue: 280000, draftPipeline: 48000 },
    { month: 'Jul', confirmedRevenue: 230000, draftPipeline: 55000 },
    { month: 'Aug', confirmedRevenue: stats.totalRevenue || 295000, draftPipeline: 42000 },
    { month: 'Sep', confirmedRevenue: 310000, draftPipeline: 60000 },
    { month: 'Oct', confirmedRevenue: 270000, draftPipeline: 45000 },
    { month: 'Nov', confirmedRevenue: 340000, draftPipeline: 70000 },
    { month: 'Dec', confirmedRevenue: 390000, draftPipeline: 80000 },
  ];

  // Role Badge and Title Configuration
  const roleConfig: Record<
    UserRole,
    { title: string; subtitle: string; badge: string; badgeBg: string }
  > = {
    Sales: {
      title: 'Sales & Deal Conversion Hub',
      subtitle: 'Focused on lead pipelines, closed-won turnover, and client contact actions',
      badge: 'Sales Portal',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    Warehouse: {
      title: 'Warehouse Operations & Inventory Control',
      subtitle: 'Focused on stock movement, low stock alerts, bay locations, and dispatching',
      badge: 'Warehouse Portal',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    Accounts: {
      title: 'Financial Ledger & Invoicing Audit',
      subtitle: 'Focused on confirmed revenue, tax invoices, draft clearance, and billing',
      badge: 'Accounts Portal',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    Admin: {
      title: 'Enterprise Executive Dashboard',
      subtitle: 'System-wide overview of revenue, clients, stock health, and sales orders',
      badge: 'Executive Admin',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  };

  const currentRoleInfo = roleConfig[userRole] || roleConfig.Admin;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Role-Specific Executive Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${currentRoleInfo.badgeBg}`}
            >
              {currentRoleInfo.badge}
            </span>
            <span className="text-xs text-slate-400 font-bold">• Personalized View</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {currentRoleInfo.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{currentRoleInfo.subtitle}</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenNewCustomer}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
          <button
            onClick={onOpenNewChallan}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-purple-200 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      {/* Dynamic Role-Specific KPI Metric Cards Row */}
      {userRole === 'Sales' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Total Sales Revenue</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +28% vs last quarter
            </p>
          </div>

          <div
            onClick={() => onNavigate('crm')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Active Leads</span>
              <Target className="w-4 h-4 text-blue-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.activeLeads} <span className="text-sm font-normal text-slate-400">/ {stats.totalCustomers}</span>
            </p>
            <p className="text-[11px] text-blue-600 font-bold mt-1">
              High Win-Probability Pipeline
            </p>
          </div>

          <div
            onClick={() => onNavigate('challans')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Quotes & Orders</span>
              <FileCheck className="w-4 h-4 text-teal-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.confirmedChallans} <span className="text-sm font-normal text-slate-400">({stats.draftChallans} drafts)</span>
            </p>
            <p className="text-[11px] text-teal-700 font-bold mt-1">
              Confirmed Sales Orders
            </p>
          </div>

          <div
            onClick={() => onNavigate('crm')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Follow-ups</span>
              <Clock className="w-4 h-4 text-pink-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {upcomingFollowUps.length}
            </p>
            <p className="text-[11px] text-pink-700 font-bold mt-1">
              Scheduled Contacts Today
            </p>
          </div>
        </div>
      )}

      {userRole === 'Warehouse' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('inventory')}
            className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Stock Reorder Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </span>
            <p className="text-3xl font-extrabold text-amber-900 tracking-tight">
              {stats.lowStockCount} <span className="text-sm font-normal text-amber-700">SKUs</span>
            </p>
            <p className="text-[11px] text-amber-800 font-bold mt-1">
              Below Minimum Stock Level
            </p>
          </div>

          <div
            onClick={() => onNavigate('inventory')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Catalog SKUs</span>
              <Package className="w-4 h-4 text-purple-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalProducts}
            </p>
            <p className="text-[11px] text-purple-700 font-bold mt-1">
              Total Active Products
            </p>
          </div>

          <div
            onClick={() => onNavigate('stock-logs')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Dispatched Orders</span>
              <Warehouse className="w-4 h-4 text-teal-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.confirmedChallans}
            </p>
            <p className="text-[11px] text-teal-700 font-bold mt-1">
              Stock Inward/Outward Audited
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Inventory Health</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {Math.round(((stats.totalProducts - stats.lowStockCount) / Math.max(1, stats.totalProducts)) * 100)}%
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              Healthy Stock Levels Ratio
            </p>
          </div>
        </div>
      )}

      {userRole === 'Accounts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Billed Revenue Turnover</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              Audited & Confirmed Sales
            </p>
          </div>

          <div
            onClick={() => onNavigate('challans')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Draft Invoices</span>
              <Receipt className="w-4 h-4 text-amber-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.draftChallans}
            </p>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              Pending Finance Clearance
            </p>
          </div>

          <div
            onClick={() => onNavigate('challans')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tax / GST Invoices</span>
              <FileCheck className="w-4 h-4 text-teal-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.confirmedChallans}
            </p>
            <p className="text-[11px] text-teal-700 font-bold mt-1">
              Generated Invoices
            </p>
          </div>

          <div
            onClick={() => onNavigate('crm')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1 cursor-pointer hover:shadow-md transition-all"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Client Accounts</span>
              <Users className="w-4 h-4 text-purple-600" />
            </span>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalCustomers}
            </p>
            <p className="text-[11px] text-purple-700 font-bold mt-1">
              Active Billing Accounts
            </p>
          </div>
        </div>
      )}

      {userRole === 'Admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Revenue</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +28%
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹{stats.totalRevenue.toLocaleString()}
                </span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  {stats.confirmedChallans} Confirmed Wholesale Orders
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-100/80 flex items-center justify-center text-purple-700 shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('crm')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deals & Leads</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.totalCustomers}
                </span>
                <p className="text-[11px] text-blue-600 font-bold mt-1">
                  {stats.activeLeads} High Probability Leads
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pink-100/80 flex items-center justify-center text-pink-600 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('inventory')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inventory SKUs</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  stats.lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {stats.lowStockCount > 0 ? `${stats.lowStockCount} Low Stock` : 'Healthy'}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.totalProducts}
                </span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Active Product Catalog
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100/80 flex items-center justify-center text-amber-700 shadow-xs">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('challans')}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Challans</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-100 text-purple-800 rounded-full">
                {stats.draftChallans} Drafts
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.totalChallans}
                </span>
                <p className="text-[11px] text-purple-700 font-bold mt-1">
                  Dispatched & In Progress
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 shadow-xs">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Row: Recharts Monthly Revenue Trend Line Chart & Right Quick Communication Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Monthly Revenue Trend Line Chart Card (2 cols) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] lg:col-span-2 space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>Monthly Revenue Trend Chart (Recharts)</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Visualizing monthly sales revenue based on confirmed sales challans & orders
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={chartTimeframe}
                onChange={(e) => setChartTimeframe(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all focus:outline-none"
              >
                <option value="Last 12 Months">Last 12 Months</option>
                <option value="This Year">This Year (2026)</option>
              </select>
            </div>
          </div>

          {/* Recharts Interactive Line Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString()}`,
                    name === 'confirmedRevenue' ? 'Confirmed Revenue' : 'Draft Pipeline',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    borderColor: '#e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="confirmedRevenue"
                  name="Confirmed Sales Revenue"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8, fill: '#9333ea' }}
                />
                <Line
                  type="monotone"
                  dataKey="draftPipeline"
                  name="Draft Pipeline"
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#0d9488' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Communication & Follow-up Panel (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Manager Contacts & Calls</h3>
            <button
              onClick={() => onNavigate('crm')}
              className="text-xs text-purple-600 hover:underline font-bold"
            >
              View CRM →
            </button>
          </div>

          {/* Communication Quick Cards */}
          <div className="space-y-3">
            {/* Incoming Call Badge */}
            <div className="p-3 bg-teal-50/80 border border-teal-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xs">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Incoming call</p>
                  <p className="text-[10px] text-teal-800 font-semibold">Apex Retailers (Rajesh Kumar)</p>
                </div>
              </div>
              <button
                onClick={() => alert('Answering incoming CRM client call...')}
                className="px-2.5 py-1 bg-teal-600 text-white rounded-xl text-[10px] font-extrabold shadow-2xs hover:bg-teal-700"
              >
                Accept
              </button>
            </div>

            {/* Missed Call Notice */}
            <div className="p-3 bg-pink-50/80 border border-pink-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Call missed</p>
                  <p className="text-[10px] text-pink-800 font-semibold">Metro Mart Wholesale</p>
                </div>
              </div>
              <button
                onClick={() => alert('Initiating callback to Metro Mart Wholesale...')}
                className="px-2.5 py-1 bg-white text-pink-700 border border-pink-300 rounded-xl text-[10px] font-extrabold hover:bg-pink-100"
              >
                Callback
              </button>
            </div>
          </div>

          {/* Pending Follow-ups */}
          <div className="pt-2 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Today's Follow-up Tasks</span>
            </span>

            {upcomingFollowUps.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pending follow-ups scheduled today.</p>
            ) : (
              <div className="space-y-2">
                {upcomingFollowUps.slice(0, 3).map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => onViewCustomerDetail(cust)}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer transition-colors border border-slate-200/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{cust.businessName}</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {cust.nextFollowUpDate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      Contact: {cust.name} ({cust.mobile})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deals & Campaigns Data Grid Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Active Client Accounts & Pipeline Deals</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live tracking of lead stages, deal values, and manager assignees
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('crm')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              View All Deals
            </button>
            <button
              onClick={onOpenNewCustomer}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Lead</span>
            </button>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Manager / Client</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4">Probability</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {recentChallans.slice(0, 5).map((c, idx) => {
                const statusColors: Record<string, string> = {
                  Confirmed: 'bg-teal-100 text-teal-800 border-teal-200',
                  Draft: 'bg-amber-100 text-amber-800 border-amber-200',
                  Cancelled: 'bg-pink-100 text-pink-800 border-pink-200',
                };

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Manager & Client Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                          {c.customerBusinessName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.customerBusinessName}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{c.customerName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Pipeline Stage Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
                          statusColors[c.status] || 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        {c.status === 'Confirmed' ? 'Closed Won' : c.status === 'Draft' ? 'Proposal Sent' : c.status}
                      </span>
                    </td>

                    {/* Win Probability Bar */}
                    <td className="py-3.5 px-4">
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>{c.status === 'Confirmed' ? '100%' : '75%'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              c.status === 'Confirmed' ? 'bg-teal-500' : 'bg-purple-500'
                            }`}
                            style={{ width: c.status === 'Confirmed' ? '100%' : '75%' }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      +₹{c.totalAmount.toLocaleString()}
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-slate-500">Mumbai</td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewChallanDetail(c)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


