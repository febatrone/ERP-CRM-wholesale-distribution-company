import React, { useState } from 'react';
import { StockLog, UserRole } from '../types';
import { History, ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';

interface StockLogsModuleProps {
  stockLogs: StockLog[];
  userRole: UserRole;
}

export const StockLogsModule: React.FC<StockLogsModuleProps> = ({ stockLogs, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all');

  const filteredLogs = stockLogs.filter((l) => {
    const matchesSearch =
      l.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || l.movementType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div id="stock-logs-module-view" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-600" />
          <span>Stock Movement Audit Logs</span>
        </h2>
        <p className="text-xs text-slate-500">Complete immutable log of all inventory receipts (IN) and sales dispatches (OUT)</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="search-stock-log-input"
            placeholder="Search product name, SKU, reason, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Movement Type:</span>
          <select
            id="filter-stock-log-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'IN' | 'OUT')}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
          >
            <option value="all">All Movements</option>
            <option value="IN">Stock IN (+)</option>
            <option value="OUT">Stock OUT (-)</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Movement</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Reason / Reference</th>
                <th className="py-3 px-4">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => {
                const isIN = log.movementType === 'IN';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.productName}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">{log.productSku}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isIN ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isIN ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>Stock {log.movementType}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {isIN ? `+${log.quantityChanged}` : `-${log.quantityChanged}`} units
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.reason}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] font-semibold">{log.createdBy}</td>
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
