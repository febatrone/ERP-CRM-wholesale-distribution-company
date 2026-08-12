import React, { useState, useCallback } from 'react';
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
  onAddStockMovement?: (payload: { productId: string; quantity: number; movementType: 'IN' | 'OUT'; reason: string }) => Promise<void>;
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
  onAddStockMovement,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<
    | 'Today'
    | 'Yesterday'
    | 'Last 7 Days'
    | 'Last 30 Days'
    | 'Last 3 Months'
    | 'Last 6 Months'
    | 'Last 12 Months'
    | 'This Year'
    | 'Last Year'
    | 'Custom Date Range'
    | 'All Time'
  >('Last 12 Months');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [restockingIds, setRestockingIds] = useState<Set<string>>(new Set());

  const handleRestock = useCallback(async (product: Product) => {
    if (!onAddStockMovement || restockingIds.has(product.id)) return;
    setRestockingIds(prev => new Set(prev).add(product.id));
    try {
      await onAddStockMovement({
        productId: product.id,
        quantity: 50,
        movementType: 'IN',
        reason: `Dashboard restock: replenished 50 units of ${product.name} (SKU: ${product.sku}) via Restock Hub`,
      });
    } finally {
      setRestockingIds(prev => { const s = new Set(prev); s.delete(product.id); return s; });
    }
  }, [onAddStockMovement, restockingIds]);

  // Compute revenue trends dynamically based on the selected timeframe preset
  const monthlyRevenueData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    // Helpers to check date matching
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    // 1 & 2: Today / Yesterday (Group by Hour)
    if (chartTimeframe === 'Today' || chartTimeframe === 'Yesterday') {
      const targetDay = chartTimeframe === 'Today' ? startOfToday : startOfYesterday;
      const result: { month: string; confirmedRevenue: number; draftPipeline: number }[] = [];

      for (let hour = 0; hour < 24; hour += 2) {
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        let confirmedRevenue = 0;
        let draftPipeline = 0;

        recentChallans.forEach((c) => {
          const cDate = new Date(c.createdAt);
          if (isSameDay(cDate, targetDay) && cDate.getHours() >= hour && cDate.getHours() < hour + 2) {
            if (c.status === 'Confirmed') {
              confirmedRevenue += c.totalAmount;
            } else if (c.status === 'Draft') {
              draftPipeline += c.totalAmount;
            }
          }
        });

        result.push({ month: hourLabel, confirmedRevenue, draftPipeline });
      }
      return result;
    }

    // 3 & 4: Last 7 Days / Last 30 Days (Group by Day)
    if (chartTimeframe === 'Last 7 Days' || chartTimeframe === 'Last 30 Days') {
      const daysCount = chartTimeframe === 'Last 7 Days' ? 7 : 30;
      const result: { month: string; confirmedRevenue: number; draftPipeline: number }[] = [];

      for (let i = daysCount - 1; i >= 0; i--) {
        const targetDate = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
        const dayLabel = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;

        let confirmedRevenue = 0;
        let draftPipeline = 0;

        recentChallans.forEach((c) => {
          const cDate = new Date(c.createdAt);
          if (isSameDay(cDate, targetDate)) {
            if (c.status === 'Confirmed') {
              confirmedRevenue += c.totalAmount;
            } else if (c.status === 'Draft') {
              draftPipeline += c.totalAmount;
            }
          }
        });

        result.push({ month: dayLabel, confirmedRevenue, draftPipeline });
      }
      return result;
    }

    // 5 & 6 & 7: Last 3 / 6 / 12 Months (Group by Month)
    if (
      chartTimeframe === 'Last 3 Months' ||
      chartTimeframe === 'Last 6 Months' ||
      chartTimeframe === 'Last 12 Months'
    ) {
      const monthsCount =
        chartTimeframe === 'Last 3 Months' ? 3 : chartTimeframe === 'Last 6 Months' ? 6 : 12;
      const result: { month: string; confirmedRevenue: number; draftPipeline: number }[] = [];

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const targetMonth = d.getMonth();
        const targetYear = d.getFullYear();

        let confirmedRevenue = 0;
        let draftPipeline = 0;

        recentChallans.forEach((c) => {
          const cDate = new Date(c.createdAt);
          if (cDate.getFullYear() === targetYear && cDate.getMonth() === targetMonth) {
            if (c.status === 'Confirmed') {
              confirmedRevenue += c.totalAmount;
            } else if (c.status === 'Draft') {
              draftPipeline += c.totalAmount;
            }
          }
        });

        result.push({
          month: `${monthNames[targetMonth]} ${targetYear}`,
          confirmedRevenue,
          draftPipeline,
        });
      }
      return result;
    }

    // 8 & 9: This Year / Last Year (Group by Month)
    if (chartTimeframe === 'This Year' || chartTimeframe === 'Last Year') {
      const targetYear = chartTimeframe === 'This Year' ? now.getFullYear() : now.getFullYear() - 1;

      return monthNames.map((name, index) => {
        let confirmedRevenue = 0;
        let draftPipeline = 0;

        recentChallans.forEach((c) => {
          const cDate = new Date(c.createdAt);
          if (cDate.getFullYear() === targetYear && cDate.getMonth() === index) {
            if (c.status === 'Confirmed') {
              confirmedRevenue += c.totalAmount;
            } else if (c.status === 'Draft') {
              draftPipeline += c.totalAmount;
            }
          }
        });

        return { month: `${name} ${targetYear}`, confirmedRevenue, draftPipeline };
      });
    }

    // 10: All Time (Group by Month from oldest date)
    if (chartTimeframe === 'All Time') {
      if (recentChallans.length === 0) {
        return [];
      }

      let oldestDate = new Date();
      recentChallans.forEach((c) => {
        const cDate = new Date(c.createdAt);
        if (cDate < oldestDate) oldestDate = cDate;
      });

      const result: { month: string; confirmedRevenue: number; draftPipeline: number }[] = [];
      const startYear = oldestDate.getFullYear();
      const startMonth = oldestDate.getMonth();
      const endYear = now.getFullYear();
      const endMonth = now.getMonth();

      let currYear = startYear;
      let currMonth = startMonth;

      while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
        let confirmedRevenue = 0;
        let draftPipeline = 0;

        recentChallans.forEach((c) => {
          const cDate = new Date(c.createdAt);
          if (cDate.getFullYear() === currYear && cDate.getMonth() === currMonth) {
            if (c.status === 'Confirmed') {
              confirmedRevenue += c.totalAmount;
            } else if (c.status === 'Draft') {
              draftPipeline += c.totalAmount;
            }
          }
        });

        result.push({
          month: `${monthNames[currMonth]} ${currYear}`,
          confirmedRevenue,
          draftPipeline,
        });

        currMonth++;
        if (currMonth > 11) {
          currMonth = 0;
          currYear++;
        }
      }
      return result;
    }

    // 11: Custom Date Range
    if (chartTimeframe === 'Custom Date Range') {
      const start = new Date(customStartDate + 'T00:00:00');
      const end = new Date(customEndDate + 'T23:59:59');

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const result: { month: string; confirmedRevenue: number; draftPipeline: number }[] = [];

      if (diffDays <= 31) {
        // Group by Day
        for (let i = 0; i < diffDays; i++) {
          const targetDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const dayLabel = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;

          let confirmedRevenue = 0;
          let draftPipeline = 0;

          recentChallans.forEach((c) => {
            const cDate = new Date(c.createdAt);
            if (isSameDay(cDate, targetDate)) {
              if (c.status === 'Confirmed') {
                confirmedRevenue += c.totalAmount;
              } else if (c.status === 'Draft') {
                draftPipeline += c.totalAmount;
              }
            }
          });

          result.push({ month: dayLabel, confirmedRevenue, draftPipeline });
        }
      } else {
        // Group by Month
        let currYear = start.getFullYear();
        let currMonth = start.getMonth();
        const endYear = end.getFullYear();
        const endMonth = end.getMonth();

        while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
          let confirmedRevenue = 0;
          let draftPipeline = 0;

          recentChallans.forEach((c) => {
            const cDate = new Date(c.createdAt);
            if (cDate.getFullYear() === currYear && cDate.getMonth() === currMonth) {
              if (c.status === 'Confirmed') {
                confirmedRevenue += c.totalAmount;
              } else if (c.status === 'Draft') {
                draftPipeline += c.totalAmount;
              }
            }
          });

          result.push({
            month: `${monthNames[currMonth]} ${currYear}`,
            confirmedRevenue,
            draftPipeline,
          });

          currMonth++;
          if (currMonth > 11) {
            currMonth = 0;
            currYear++;
          }
        }
      }
      return result;
    }

    return [];
  })();

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

            <div className="flex flex-wrap items-center gap-2">
              {chartTimeframe === 'Custom Date Range' && (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                  <span className="text-[10px] font-extrabold text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              )}
              <select
                value={chartTimeframe}
                onChange={(e) => setChartTimeframe(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all focus:outline-none"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="Last 12 Months">Last 12 Months</option>
                <option value="This Year">This Year (2026)</option>
                <option value="Last Year">Last Year</option>
                <option value="Custom Date Range">Custom Date Range</option>
                <option value="All Time">All Time (Past Data)</option>
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

        {/* Quick Operations & Low Stock Alert Center (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span>Operations & Restock Hub</span>
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-purple-600 hover:underline font-bold"
            >
              Inventory →
            </button>
          </div>

          {/* Low Stock Alerts */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Critical Stock Warnings</p>
            {lowStockProducts.length === 0 ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/80 rounded-2xl text-center">
                <p className="text-xs font-bold text-emerald-800">All Stock Levels Healthy</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">No immediate restock required.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-amber-800 font-semibold">SKU: {p.sku} • Stock: {p.currentStock}</p>
                    </div>
                    <button
                      onClick={() => handleRestock(p)}
                      disabled={restockingIds.has(p.id)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-xl text-[10px] font-extrabold shadow-2xs transition-all"
                    >
                      {restockingIds.has(p.id) ? '...' : 'Restock'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Follow-ups */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Pending CRM Follow-ups</span>
            </span>

            {upcomingFollowUps.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pending follow-ups scheduled today.</p>
            ) : (
              <div className="space-y-2">
                {upcomingFollowUps.slice(0, 2).map((cust) => (
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
                    <td className="py-3.5 px-4 text-slate-500">
                      {(() => {
                        if (!c.customerAddress) return 'N/A';
                        const parts = c.customerAddress.split(',').map(p => p.trim()).filter(Boolean);
                        if (parts.length === 1) return parts[0];
                        if (parts.length === 2) return parts[0];
                        return parts[parts.length - 2] || 'N/A';
                      })()}
                    </td>

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


