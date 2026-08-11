import React, { useState } from 'react';
import { Customer, CustomerStatus, CustomerType, PipelineStage, ActivityType, UserRole, SalesChallan } from '../types';
import { HighlightText } from './HighlightText';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  ChevronRight,
  X,
  MessageSquarePlus,
  LayoutGrid,
  Kanban,
  BarChart3,
  TrendingUp,
  DollarSign,
  UserCheck,
  Download,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Send,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CustomerCRMProps {
  customers: Customer[];
  userRole: UserRole;
  challans?: SalesChallan[];
  onAddCustomer: (data: Partial<Customer>) => Promise<void>;
  onUpdateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  onUpdateCustomerStage?: (id: string, stage: PipelineStage) => Promise<void>;
  onAddFollowUp: (id: string, note: string, date?: string, activityType?: ActivityType, priority?: 'High' | 'Medium' | 'Low') => Promise<void>;
  selectedCustomerForDetail: Customer | null;
  onSelectCustomerForDetail: (customer: Customer | null) => void;
  onOpenNewChallanForCustomer?: (customerId: string) => void;
  viewMode?: 'kanban' | 'table' | 'analytics';
  onViewModeChange?: (mode: 'kanban' | 'table' | 'analytics') => void;
}

const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string; border: string; bg: string }[] = [
  { id: 'Inquiry', label: '1. Inquiry / Lead', color: 'text-blue-700', border: 'border-blue-400', bg: 'bg-blue-50' },
  { id: 'Contacted', label: '2. Contacted', color: 'text-sky-700', border: 'border-sky-400', bg: 'bg-sky-50' },
  { id: 'Proposal', label: '3. Proposal Sent', color: 'text-purple-700', border: 'border-purple-400', bg: 'bg-purple-50' },
  { id: 'Negotiation', label: '4. Negotiation', color: 'text-amber-700', border: 'border-amber-400', bg: 'bg-amber-50' },
  { id: 'Closed Won', label: '5. Closed Won', color: 'text-emerald-700', border: 'border-emerald-400', bg: 'bg-emerald-50' },
  { id: 'Closed Lost', label: '6. Closed Lost', color: 'text-slate-600', border: 'border-slate-300', bg: 'bg-slate-50' },
];

export const CustomerCRM: React.FC<CustomerCRMProps> = ({
  customers,
  userRole,
  challans = [],
  onAddCustomer,
  onUpdateCustomer,
  onUpdateCustomerStage,
  onAddFollowUp,
  selectedCustomerForDetail,
  onSelectCustomerForDetail,
  onOpenNewChallanForCustomer,
  viewMode: propViewMode,
  onViewModeChange,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'analytics'>(propViewMode || 'kanban');

  React.useEffect(() => {
    if (propViewMode) {
      setViewMode(propViewMode);
    }
  }, [propViewMode]);

  const handleSetViewMode = (mode: 'kanban' | 'table' | 'analytics') => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repFilter, setRepFilter] = useState<string>('all');

  // Modal & Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'pipeline' | 'activities' | 'orders'>('overview');

  // Follow-up form state inside drawer
  const [activityNoteInput, setActivityNoteInput] = useState('');
  const [activityDateInput, setActivityDateInput] = useState('');
  const [activityTypeInput, setActivityTypeInput] = useState<ActivityType>('Call');
  const [activityPriorityInput, setActivityPriorityInput] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Add/Edit Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Wholesale' as CustomerType,
    address: '',
    status: 'Lead' as CustomerStatus,
    nextFollowUpDate: '',
    notes: '',
    pipelineStage: 'Inquiry' as PipelineStage,
    dealValue: 250000,
    winProbability: 50,
    expectedCloseDate: '',
    assignedRep: 'Alex Vance (Sales)',
    leadSource: 'Website Inquiry',
    creditLimit: 500000,
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.customerType === typeFilter;
    const matchesRep = repFilter === 'all' || c.assignedRep === repFilter;

    return matchesSearch && matchesStatus && matchesType && matchesRep;
  });

  // Unique list of assigned reps for filter dropdown
  const uniqueReps = Array.from(new Set(customers.map((c) => c.assignedRep).filter(Boolean)));

  // Analytics Metrics Calculation
  const totalPipelineValue = filteredCustomers.reduce((sum, c) => sum + (c.dealValue || 0), 0);
  const weightedPipelineValue = filteredCustomers.reduce(
    (sum, c) => sum + (c.dealValue || 0) * ((c.winProbability || 0) / 100),
    0
  );
  const wonCount = filteredCustomers.filter((c) => c.pipelineStage === 'Closed Won').length;
  const lostCount = filteredCustomers.filter((c) => c.pipelineStage === 'Closed Lost').length;
  const winRate = wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 85;

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'Wholesale',
      address: '',
      status: 'Lead',
      nextFollowUpDate: '',
      notes: '',
      pipelineStage: 'Inquiry',
      dealValue: 250000,
      winProbability: 40,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedRep: 'Alex Vance (Sales)',
      leadSource: 'Website Inquiry',
      creditLimit: 500000,
    });
    setFormError('');
    setShowAddModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      mobile: c.mobile,
      email: c.email,
      businessName: c.businessName,
      gstNumber: c.gstNumber || '',
      customerType: c.customerType,
      address: c.address,
      status: c.status,
      nextFollowUpDate: c.nextFollowUpDate || '',
      notes: c.notes || '',
      pipelineStage: c.pipelineStage || 'Inquiry',
      dealValue: c.dealValue || 250000,
      winProbability: c.winProbability || 50,
      expectedCloseDate: c.expectedCloseDate || '',
      assignedRep: c.assignedRep || 'Alex Vance (Sales)',
      leadSource: c.leadSource || 'Direct Outreach',
      creditLimit: c.creditLimit || 500000,
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.mobile || !formData.email || !formData.businessName || !formData.address) {
      setFormError('Please fill in required fields (Name, Mobile, Email, Business Name, Address)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer.id, formData);
      } else {
        await onAddCustomer(formData);
      }
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Error saving customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageShift = async (customerId: string, newStage: PipelineStage) => {
    try {
      if (onUpdateCustomerStage) {
        await onUpdateCustomerStage(customerId, newStage);
      } else {
        await onUpdateCustomer(customerId, {
          pipelineStage: newStage,
          status: newStage === 'Closed Won' ? 'Active' : newStage === 'Closed Lost' ? 'Inactive' : 'Lead',
        });
      }
    } catch (err: any) {
      alert(err.message || 'Error shifting stage');
    }
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForDetail || !activityNoteInput.trim()) return;

    try {
      await onAddFollowUp(
        selectedCustomerForDetail.id,
        activityNoteInput,
        activityDateInput,
        activityTypeInput,
        activityPriorityInput
      );
      setActivityNoteInput('');
      setActivityDateInput('');
    } catch (err: any) {
      alert(err.message || 'Error logging activity');
    }
  };

  const exportCustomersCSV = () => {
    const headers = ['Business Name', 'Contact Person', 'Email', 'Mobile', 'Type', 'Stage', 'Deal Value (₹)', 'Win %', 'Assigned Rep'];
    const rows = filteredCustomers.map((c) => [
      `"${c.businessName}"`,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.mobile}"`,
      `"${c.customerType}"`,
      `"${c.pipelineStage || 'Inquiry'}"`,
      c.dealValue || 0,
      `${c.winProbability || 0}%`,
      `"${c.assignedRep || 'Unassigned'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omniflow_crm_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter customer-specific challans for detail drawer
  const customerChallans = selectedCustomerForDetail
    ? challans.filter((ch) => ch.customerId === selectedCustomerForDetail.id)
    : [];
  const customerTotalSpent = customerChallans
    .filter((ch) => ch.status === 'Confirmed')
    .reduce((sum, ch) => sum + ch.totalAmount, 0);

  return (
    <div id="customer-crm-view" className="space-y-4">
      {/* Executive Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl text-slate-900 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase tracking-wider">
              CRM System
            </span>
            <span className="text-[11px] text-slate-400 font-bold">• Sales Pipeline & Lead Scoring</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold mt-0.5 text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Client Opportunities & Pipeline Kanban</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
            Real-time lead tracking, probability forecasting, account history, and manager follow-up logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={exportCustomersCSV}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {(userRole === 'Admin' || userRole === 'Sales') && (
            <button
              id="btn-add-customer"
              onClick={openCreateModal}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Lead / Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Top CRM Pipeline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Pipeline Value</span>
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
          </span>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">₹{totalPipelineValue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Active Deal Funnel</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Weighted Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <p className="text-xl font-extrabold text-teal-700 tracking-tight">₹{Math.round(weightedPipelineValue).toLocaleString()}</p>
          <p className="text-[10px] text-teal-800 font-semibold">Probability Forecast</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Active Accounts</span>
            <Layers className="w-3.5 h-3.5 text-pink-600" />
          </span>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">{filteredCustomers.length} Accounts</p>
          <p className="text-[10px] text-slate-400 font-semibold">Leads & Wholesale</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-0.5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Win Ratio</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </span>
          <p className="text-xl font-extrabold text-purple-900 tracking-tight">{winRate}%</p>
          <p className="text-[10px] text-slate-400 font-semibold">Closed Won Success</p>
        </div>
      </div>

      {/* Control Bar: View Switcher & Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* View Switcher Buttons */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-bold text-slate-600 shrink-0">
          <button
            onClick={() => handleSetViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'kanban' ? 'bg-purple-100 text-purple-800 font-extrabold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline Kanban</span>
          </button>

          <button
            onClick={() => handleSetViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'table' ? 'bg-purple-100 text-purple-800 font-extrabold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Data Grid Table</span>
          </button>

          <button
            onClick={() => handleSetViewMode('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'analytics' ? 'bg-purple-100 text-purple-800 font-extrabold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sales Analytics</span>
          </button>
        </div>

        {/* Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-customer-input"
              placeholder="Search client name, business, GST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            id="filter-customer-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium"
          >
            <option value="all">All Types</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
            <option value="Retail">Retail</option>
          </select>

          {uniqueReps.length > 0 && (
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium"
            >
              <option value="all">All Sales Reps</option>
              {uniqueReps.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-2 pt-0.5">
          {PIPELINE_STAGES.map((stage) => {
            const stageCustomers = filteredCustomers.filter(
              (c) => (c.pipelineStage || 'Inquiry') === stage.id
            );
            const stageTotalValue = stageCustomers.reduce((sum, c) => sum + (c.dealValue || 0), 0);

            return (
              <div
                key={stage.id}
                className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-2.5 flex flex-col space-y-2 min-w-[200px]"
              >
                {/* Stage Header */}
                <div className={`p-2 bg-white rounded-lg border-t-3 ${stage.border} shadow-2xs space-y-0.5`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-extrabold ${stage.color}`}>{stage.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                      {stageCustomers.length}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-slate-800">
                    ₹{stageTotalValue.toLocaleString()}
                  </p>
                </div>

                {/* Stage Cards List */}
                <div className="space-y-2 flex-1">
                  {stageCustomers.length === 0 ? (
                    <div className="p-3 border border-dashed border-slate-200 rounded-lg text-center text-[10px] text-slate-400 italic">
                      No deals in stage
                    </div>
                  ) : (
                    stageCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-1.5 text-xs group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">
                            {cust.customerType}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                            {cust.winProbability || 50}% Win
                          </span>
                        </div>

                        <div>
                          <h4
                            onClick={() => onSelectCustomerForDetail(cust)}
                            className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer text-xs truncate"
                          >
                            {cust.businessName}
                          </h4>
                          <p className="text-[10px] text-slate-500 flex items-center mt-0.5">
                            <Building className="w-2.5 h-2.5 mr-1 text-slate-400 shrink-0" />
                            <span className="truncate">{cust.name}</span>
                          </p>
                        </div>

                        <div className="p-1.5 bg-slate-50 rounded flex items-center justify-between font-mono text-[10px]">
                          <span className="text-slate-500 font-medium">Deal:</span>
                          <span className="font-extrabold text-slate-900">₹{(cust.dealValue || 0).toLocaleString()}</span>
                        </div>

                        {cust.nextFollowUpDate && (
                          <div className="text-[9px] text-indigo-600 font-semibold flex items-center">
                            <Calendar className="w-2.5 h-2.5 mr-1" />
                            <span>Next: {cust.nextFollowUpDate}</span>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px]">
                          <span className="text-slate-400 truncate max-w-[70px]">{cust.assignedRep?.split(' ')[0] || 'Sales'}</span>

                          <div className="flex items-center space-x-1">
                            {/* Fast Stage Transition Buttons */}
                            {stage.id !== 'Closed Won' && (
                              <button
                                onClick={() =>
                                  handleStageShift(
                                    cust.id,
                                    stage.id === 'Inquiry'
                                      ? 'Contacted'
                                      : stage.id === 'Contacted'
                                      ? 'Proposal'
                                      : stage.id === 'Proposal'
                                      ? 'Negotiation'
                                      : 'Closed Won'
                                  )
                                }
                                title="Advance Stage"
                                className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded"
                              >
                                Advance →
                              </button>
                            )}

                            <button
                              onClick={() => onSelectCustomerForDetail(cust)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded"
                            >
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DATA GRID TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Business & Contact</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Win Prob</th>
                  <th className="py-3 px-4">Credit Limit / Balance</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4">Next Follow-Up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        <HighlightText text={cust.businessName} highlight={searchTerm} />
                      </p>
                      <p className="text-[11px] text-slate-500">
                        <HighlightText text={cust.name} highlight={searchTerm} /> • <HighlightText text={cust.mobile} highlight={searchTerm} />
                      </p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{cust.customerType}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100">
                        {cust.pipelineStage || 'Inquiry'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{(cust.dealValue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      {cust.winProbability || 50}%
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="text-slate-800 font-bold">₹{(cust.creditLimit || 500000).toLocaleString()}</span>
                      <p className="text-[10px] text-amber-600">Used: ₹{(cust.outstandingBalance || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{cust.assignedRep || 'Sales'}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">
                      {cust.nextFollowUpDate || '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(cust)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="Edit Lead"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectCustomerForDetail(cust)}
                        className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded text-[11px] hover:bg-indigo-700"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SALES ANALYTICS & PIPELINE FUNNEL */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Pipeline Stage Conversion Funnel</span>
            </h3>

            <div className="space-y-3 text-xs">
              {PIPELINE_STAGES.map((st) => {
                const count = filteredCustomers.filter((c) => (c.pipelineStage || 'Inquiry') === st.id).length;
                const pct = filteredCustomers.length > 0 ? Math.round((count / filteredCustomers.length) * 100) : 0;

                return (
                  <div key={st.id} className="space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>{st.label}</span>
                      <span>
                        {count} deals ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${st.bg.replace('bg-', 'bg-indigo-')}`} style={{ width: `${Math.max(pct, 5)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Top High-Value Accounts</span>
            </h3>

            <div className="space-y-2">
              {[...filteredCustomers]
                .sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0))
                .slice(0, 5)
                .map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{c.businessName}</p>
                      <p className="text-[11px] text-slate-500">{c.customerType} • {c.assignedRep}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-extrabold text-indigo-600">₹{(c.dealValue || 0).toLocaleString()}</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {c.pipelineStage || 'Inquiry'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE CUSTOMER DETAIL DRAWER */}
      {selectedCustomerForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Client File</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">
                      {selectedCustomerForDetail.customerType}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCustomerForDetail.businessName}</h3>
                </div>
                <button
                  onClick={() => onSelectCustomerForDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Tab Navigation */}
              <div className="flex space-x-1 border-b border-slate-200 text-xs font-bold text-slate-500">
                <button
                  onClick={() => setDrawerTab('overview')}
                  className={`pb-2.5 px-3 border-b-2 transition-all ${
                    drawerTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'
                  }`}
                >
                  Overview & Credit
                </button>
                <button
                  onClick={() => setDrawerTab('pipeline')}
                  className={`pb-2.5 px-3 border-b-2 transition-all ${
                    drawerTab === 'pipeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'
                  }`}
                >
                  Deal Pipeline
                </button>
                <button
                  onClick={() => setDrawerTab('activities')}
                  className={`pb-2.5 px-3 border-b-2 transition-all ${
                    drawerTab === 'activities' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'
                  }`}
                >
                  Activities ({selectedCustomerForDetail.followUpHistory?.length || 0})
                </button>
                <button
                  onClick={() => setDrawerTab('orders')}
                  className={`pb-2.5 px-3 border-b-2 transition-all ${
                    drawerTab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'
                  }`}
                >
                  Orders ({customerChallans.length})
                </button>
              </div>

              {/* TAB 1: OVERVIEW & CREDIT */}
              {drawerTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block font-medium">Contact Person</span>
                        <span className="font-bold text-slate-900">{selectedCustomerForDetail.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Phone</span>
                        <span className="font-bold text-slate-900">{selectedCustomerForDetail.mobile}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Email</span>
                        <span className="font-bold text-slate-900">{selectedCustomerForDetail.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">GSTIN</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCustomerForDetail.gstNumber || 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-medium">Address</span>
                        <span className="text-slate-700">{selectedCustomerForDetail.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Credit Health Card */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Account Credit Health</span>
                      <span className="text-indigo-600 font-mono font-bold">Limit: ₹{(selectedCustomerForDetail.creditLimit || 500000).toLocaleString()}</span>
                    </h4>
                    <div className="w-full bg-indigo-200/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((selectedCustomerForDetail.outstandingBalance || 0) / (selectedCustomerForDetail.creditLimit || 500000)) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>Outstanding: ₹{(selectedCustomerForDetail.outstandingBalance || 0).toLocaleString()}</span>
                      <span>Total Invoice Billing: ₹{customerTotalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DEAL PIPELINE SELECTOR */}
              {drawerTab === 'pipeline' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900">Current Pipeline Stage</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {PIPELINE_STAGES.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => handleStageShift(selectedCustomerForDetail.id, st.id)}
                          className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                            (selectedCustomerForDetail.pipelineStage || 'Inquiry') === st.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Opportunity Deal Value:</span>
                      <span className="font-mono text-indigo-600">₹{(selectedCustomerForDetail.dealValue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Forecast Win Probability:</span>
                      <span className="font-mono text-emerald-600">{selectedCustomerForDetail.winProbability || 50}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ACTIVITIES & FOLLOW-UP LOG */}
              {drawerTab === 'activities' && (
                <div className="space-y-4 text-xs">
                  {/* Log Activity Form */}
                  {(userRole === 'Admin' || userRole === 'Sales') && (
                    <form onSubmit={handleAddActivitySubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                        <span>Log New Interaction / Activity</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Activity Type</label>
                          <select
                            value={activityTypeInput}
                            onChange={(e) => setActivityTypeInput(e.target.value as ActivityType)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="Call">Phone Call</option>
                            <option value="Meeting">Meeting / Visit</option>
                            <option value="Email">Email Sent</option>
                            <option value="Quote">Quotation Sent</option>
                            <option value="Note">General Note</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
                          <select
                            value={activityPriorityInput}
                            onChange={(e) => setActivityPriorityInput(e.target.value as any)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Log notes, terms agreed, follow-up commitments..."
                        value={activityNoteInput}
                        onChange={(e) => setActivityNoteInput(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />

                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="date"
                          value={activityDateInput}
                          onChange={(e) => setActivityDateInput(e.target.value)}
                          className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                        >
                          Log Activity
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Activity List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(!selectedCustomerForDetail.followUpHistory || selectedCustomerForDetail.followUpHistory.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No activity history recorded.</p>
                    ) : (
                      selectedCustomerForDetail.followUpHistory.map((fup) => (
                        <div key={fup.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">
                              {fup.activityType || 'Note'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{fup.date}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{fup.note}</p>
                          <p className="text-[10px] text-slate-400 italic text-right">— {fup.createdBy}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ORDER & BILLING HISTORY */}
              {drawerTab === 'orders' && (
                <div className="space-y-3 text-xs">
                  {onOpenNewChallanForCustomer && (
                    <button
                      onClick={() => onOpenNewChallanForCustomer(selectedCustomerForDetail.id)}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Sales Challan / Order</span>
                    </button>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customerChallans.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No sales challans or orders logged for this customer yet.</p>
                    ) : (
                      customerChallans.map((ch) => (
                        <div key={ch.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-indigo-600">{ch.challanNumber}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ch.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ch.status}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium">
                            {ch.products.length} line items • Qty: {ch.totalQuantity} units
                          </p>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-100 font-mono">
                            <span className="text-slate-400 text-[10px]">{new Date(ch.createdAt).toLocaleDateString()}</span>
                            <span className="font-extrabold text-slate-900">₹{ch.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectCustomerForDetail(null)}
              className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
            >
              Close Client File
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCustomer ? 'Edit Client Record' : 'Register New Lead / Account'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Apex Distributors Ltd"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Mehta"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98201 44321"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Type</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={formData.pipelineStage}
                    onChange={(e) => setFormData({ ...formData, pipelineStage: e.target.value as PipelineStage })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Deal Value (₹)</label>
                  <input
                    type="number"
                    value={formData.dealValue}
                    onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                  <input
                    type="text"
                    value={formData.assignedRep}
                    onChange={(e) => setFormData({ ...formData, assignedRep: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full office or warehouse address"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
