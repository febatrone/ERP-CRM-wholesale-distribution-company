import React, { useState, useMemo } from 'react';
import { AuditLog, AuditModule, UserRole } from '../types';
import { HighlightText } from './HighlightText';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  Building2,
  Package,
  FileCheck,
  Shield,
  Activity,
  AlertTriangle,
  Info,
  Calendar,
  RefreshCw,
  Lock,
  ArrowUpDown,
  FileText,
  User,
} from 'lucide-react';

interface AuditTrailModuleProps {
  auditLogs: AuditLog[];
  userRole: UserRole;
  onClearLogs?: () => void;
}

export const AuditTrailModule: React.FC<AuditTrailModuleProps> = ({
  auditLogs,
  userRole,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter((log) => {
        const matchesSearch =
          searchTerm === '' ||
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.recordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.module.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
        const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
        const matchesRole = selectedRole === 'ALL' || log.userRole === selectedRole;

        return matchesSearch && matchesModule && matchesSeverity && matchesRole;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });
  }, [auditLogs, searchTerm, selectedModule, selectedSeverity, selectedRole, sortOrder]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalEvents = auditLogs.length;
    const criticalEvents = auditLogs.filter((l) => l.severity === 'CRITICAL' || l.severity === 'WARNING').length;

    // Module counts
    const moduleCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    auditLogs.forEach((l) => {
      moduleCounts[l.module] = (moduleCounts[l.module] || 0) + 1;
      userCounts[l.userName] = (userCounts[l.userName] || 0) + 1;
    });

    let topModule = 'N/A';
    let maxModCount = 0;
    Object.entries(moduleCounts).forEach(([mod, count]) => {
      if (count > maxModCount) {
        maxModCount = count;
        topModule = mod;
      }
    });

    let topUser = 'N/A';
    let maxUserCount = 0;
    Object.entries(userCounts).forEach(([usr, count]) => {
      if (count > maxUserCount) {
        maxUserCount = count;
        topUser = usr;
      }
    });

    return {
      totalEvents,
      criticalEvents,
      topModule,
      topUser,
    };
  }, [auditLogs]);

  // Export to CSV Report
  const handleDownloadCsv = () => {
    const headers = [
      'Audit ID',
      'Timestamp',
      'User Name',
      'User Email',
      'User Role',
      'Module',
      'Action Code',
      'Record ID',
      'Record Name',
      'Severity',
      'Details',
      'IP Address',
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${l.userEmail.replace(/"/g, '""')}"`,
      `"${l.userRole}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.recordId}"`,
      `"${l.recordName.replace(/"/g, '""')}"`,
      `"${l.severity || 'INFO'}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `security_audit_trail_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const moduleColors: Record<AuditModule, string> = {
    CRM: 'bg-blue-100 text-blue-800 border-blue-200',
    Inventory: 'bg-purple-100 text-purple-800 border-purple-200',
    'Sales Challans': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'User Management': 'bg-amber-100 text-amber-800 border-amber-200',
    System: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const severityBadges: Record<string, React.ReactNode> = {
    CRITICAL: (
      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-[10px] font-extrabold flex items-center space-x-1">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>CRITICAL</span>
      </span>
    ),
    WARNING: (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold flex items-center space-x-1">
        <ShieldAlert className="w-3 h-3 text-amber-600" />
        <span>WARNING</span>
      </span>
    ),
    INFO: (
      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center space-x-1">
        <Info className="w-3 h-3 text-emerald-600" />
        <span>INFO</span>
      </span>
    ),
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <span>System Security Audit Trail</span>
                <span className="px-2.5 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-full font-bold border border-slate-200">
                  Immutable Event Logs
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Automatic recording of user modifications across CRM, Inventory, Sales Orders & Access Rules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            id="btn-download-audit-csv"
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Audit Trail Logs</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEvents}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Recorded system actions</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Alerts</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.criticalEvents}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Warnings or critical actions</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Active Module</p>
            <p className="text-lg font-black text-indigo-900 mt-1 truncate max-w-[140px]">{stats.topModule}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Highest event volume</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead User Activity</p>
            <p className="text-sm font-extrabold text-slate-900 mt-1 truncate max-w-[140px]">{stats.topUser}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Top contributor to logs</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by User, Action, Record Name, ID, or Details..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Module Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Modules</option>
              <option value="CRM">CRM Module</option>
              <option value="Inventory">Inventory Module</option>
              <option value="Sales Challans">Sales Challans</option>
              <option value="User Management">User Management</option>
              <option value="System">System & Security</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO Only</option>
              <option value="WARNING">WARNING Only</option>
              <option value="CRITICAL">CRITICAL Only</option>
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All User Roles</option>
              <option value="Admin">Admin</option>
              <option value="Sales">Sales</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Accounts">Accounts</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shrink-0"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <span>{sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Filter Summary indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{auditLogs.length}</strong> audit log records
          </span>

          {(selectedModule !== 'ALL' || selectedSeverity !== 'ALL' || selectedRole !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedModule('ALL');
                setSelectedSeverity('ALL');
                setSelectedRole('ALL');
              }}
              className="text-purple-600 hover:text-purple-800 font-bold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No matching audit logs found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria, module dropdowns, or severity filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp & IP</th>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Target Record</th>
                  <th className="py-3 px-4">Details & Change Summary</th>
                  <th className="py-3 px-4 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => {
                  const severityKey = log.severity || 'INFO';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-mono text-slate-700 text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(log.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {log.ipAddress || '192.168.1.1'}
                        </p>
                      </td>

                      {/* User & Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                            {log.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              <HighlightText text={log.userName} highlight={searchTerm} />
                            </p>
                            <div className="flex items-center space-x-1 text-[10px]">
                              <span className="text-slate-400">
                                <HighlightText text={log.userEmail} highlight={searchTerm} />
                              </span>
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-extrabold text-[9px]">
                                {log.userRole}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Module */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            moduleColors[log.module] || 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <HighlightText text={log.module} highlight={searchTerm} />
                        </span>
                      </td>

                      {/* Action Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] border border-slate-200">
                          <HighlightText text={log.action} highlight={searchTerm} />
                        </span>
                      </td>

                      {/* Target Record */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          <HighlightText text={log.recordName} highlight={searchTerm} />
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: <HighlightText text={log.recordId} highlight={searchTerm} />
                        </p>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 text-xs">
                        <p className="line-clamp-2 leading-relaxed">
                          <HighlightText text={log.details} highlight={searchTerm} />
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          {severityBadges[severityKey] || severityBadges.INFO}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
