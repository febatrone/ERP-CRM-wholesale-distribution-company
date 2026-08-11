import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Building2, Shield, Users, Warehouse, Calculator, KeyRound, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  demoUsers: User[];
  onLogin: (email: string, password?: string, role?: string) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ demoUsers, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Sales');
  const [emailInput, setEmailInput] = useState('sales@company.com');
  const [passwordInput, setPasswordInput] = useState('Password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRolePresetSelect = (u: User) => {
    setSelectedRole(u.role);
    setEmailInput(u.email);
    setPasswordInput('Password123');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onLogin(emailInput, passwordInput, selectedRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Check email or select role preset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleIcons: Record<UserRole, React.ReactNode> = {
    Admin: <Shield className="w-5 h-5 text-purple-600" />,
    Sales: <Users className="w-5 h-5 text-blue-600" />,
    Warehouse: <Warehouse className="w-5 h-5 text-amber-600" />,
    Accounts: <Calculator className="w-5 h-5 text-emerald-600" />,
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">OmniFlow Operations</h2>
          <p className="text-xs text-slate-500">Mini ERP & CRM Portal — Select Role to Enter</p>
        </div>

        {/* Quick Demo Credentials Presets */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Select Demo Role Preset:</span>
            <span className="text-[10px] text-indigo-600 font-normal">Click to auto-fill</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => {
              const isSelected = selectedRole === u.role;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleRolePresetSelect(u)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="shrink-0">{roleIcons[u.role]}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{u.role}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{u.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
          >
            <span>{isSubmitting ? 'Authenticating...' : `Enter Portal as ${selectedRole}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center leading-normal">
          JWT-based role authentication enabled for <strong className="text-slate-600">Admin</strong>, <strong className="text-slate-600">Sales</strong>, <strong className="text-slate-600">Warehouse</strong>, & <strong className="text-slate-600">Accounts</strong>.
        </p>
      </div>
    </div>
  );
};
