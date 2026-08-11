import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  Users,
  Shield,
  Warehouse,
  Calculator,
  Plus,
  X,
  UserCheck,
  UserX,
  Edit2,
  Lock,
  Mail,
  Building2,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onSwitchUser: (user: User) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onSwitchUser,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    department: string;
    avatar: string;
  }>({
    name: '',
    email: '',
    role: 'Sales',
    department: 'Sales & Business Development',
    avatar: '',
  });

  if (!isOpen) return null;

  const roleIcons: Record<UserRole, React.ReactNode> = {
    Admin: <Shield className="w-4 h-4 text-purple-600" />,
    Sales: <Users className="w-4 h-4 text-blue-600" />,
    Warehouse: <Warehouse className="w-4 h-4 text-amber-600" />,
    Accounts: <Calculator className="w-4 h-4 text-emerald-600" />,
  };

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-purple-100 text-purple-800 border-purple-200',
    Sales: 'bg-blue-100 text-blue-800 border-blue-200',
    Warehouse: 'bg-amber-100 text-amber-800 border-amber-200',
    Accounts: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUserId) {
      onUpdateUser(editingUserId, formData);
      setEditingUserId(null);
    } else {
      onAddUser({
        ...formData,
        avatar:
          formData.avatar ||
          `https://images.unsplash.com/photo-${1535713875002 + users.length * 1000}?w=150&auto=format&fit=crop&q=80`,
      });
    }

    setFormData({
      name: '',
      email: '',
      role: 'Sales',
      department: 'Sales & Business Development',
      avatar: '',
    });
    setShowAddForm(false);
  };

  const startEdit = (u: User) => {
    setEditingUserId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || `${u.role} Department`,
      avatar: u.avatar || '',
    });
    setShowAddForm(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight flex items-center space-x-2">
                <span>Admin User Account Management</span>
                <span className="px-2 py-0.5 text-[10px] bg-purple-500/30 border border-purple-400/40 text-purple-200 rounded-full font-bold">
                  Admin Access Only
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Manage user privileges, assign roles, and audit departmental access across the ERP system
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Admin Banner Info */}
          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-900">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-purple-950">Role Isolation Security Enabled</p>
                <p className="text-purple-700 font-medium mt-0.5">
                  • <strong>Sales Users</strong>: Restricted strictly to CRM Leads & Sales Orders (No Warehouse/Accounts access).
                  <br />
                  • <strong>Warehouse Users</strong>: Restricted strictly to Inventory & Stock Logs (No CRM/Finance access).
                  <br />
                  • <strong>Accounts Users</strong>: Restricted strictly to Invoices, Ledgers & Billed Accounts (No Warehouse edits).
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingUserId(null);
                setFormData({
                  name: '',
                  email: '',
                  role: 'Sales',
                  department: 'Sales & Business Development',
                  avatar: '',
                });
                setShowAddForm(!showAddForm);
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition-all flex items-center space-x-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel Form' : 'Add New User'}</span>
            </button>
          </div>

          {/* Add / Edit User Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>{editingUserId ? 'Edit User Account & Role' : 'Create New Team Member Account'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@enterprise.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Assign User Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                        department: `${e.target.value} Department`,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                  >
                    <option value="Admin">Admin (Full System Access)</option>
                    <option value="Sales">Sales (CRM & Quotes Only)</option>
                    <option value="Warehouse">Warehouse (Inventory & Stock Logs Only)</option>
                    <option value="Accounts">Accounts (Financial Ledger & Invoices Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Department Tag</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Regional Logistics"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition-colors shadow-sm"
                >
                  {editingUserId ? 'Save Account Changes' : 'Create User Account'}
                </button>
              </div>
            </form>
          )}

          {/* User Accounts Data Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center justify-between">
              <span>Active User Accounts Directory ({users.length})</span>
              <span className="text-xs text-slate-400 font-medium">Logged in as {currentUser.name}</span>
            </h3>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                u.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-full">
                                    YOU
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-normal">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                              roleColors[u.role]
                            }`}
                          >
                            {roleIcons[u.role]}
                            <span>{u.role}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {u.department || `${u.role} Operations`}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center space-x-1 text-emerald-700 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Active</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => startEdit(u)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                              title="Edit user details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                onSwitchUser(u);
                                onClose();
                              }}
                              disabled={isSelf}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                                isSelf
                                  ? 'bg-slate-100 text-slate-400 cursor-default'
                                  : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                              }`}
                              title={isSelf ? 'Currently Active Account' : `Switch Context to ${u.name}`}
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>{isSelf ? 'Active' : 'Switch Context'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted RBAC Session Context • Changes sync automatically</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Close Management Window
          </button>
        </div>
      </div>
    </div>
  );
};
