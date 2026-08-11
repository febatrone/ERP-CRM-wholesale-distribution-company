import React from 'react';
import { User, UserRole } from '../types';
import { Shield, Users, Warehouse, Calculator, Sparkles, KeyRound } from 'lucide-react';

interface RoleBannerProps {
  currentUser: User | null;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenUserManagement?: () => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenUserManagement,
}) => {
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'Admin';

  const roleIcons: Record<UserRole, React.ReactNode> = {
    Admin: <Shield className="w-4 h-4 text-purple-600" />,
    Sales: <Users className="w-4 h-4 text-blue-600" />,
    Warehouse: <Warehouse className="w-4 h-4 text-amber-600" />,
    Accounts: <Calculator className="w-4 h-4 text-emerald-600" />,
  };

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-purple-100 text-purple-800 border-purple-300',
    Sales: 'bg-blue-100 text-blue-800 border-blue-300',
    Warehouse: 'bg-amber-100 text-amber-800 border-amber-300',
    Accounts: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div id="role-demo-banner" className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-1.5 bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-medium border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Role Isolation Active</span>
        </span>
        <span className="text-slate-400 hidden sm:inline">Context:</span>
        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border font-semibold ${roleColors[currentUser.role]}`}>
          {roleIcons[currentUser.role]}
          <span>{currentUser.role} Mode</span>
        </span>
        <span className="text-slate-400 hidden md:inline">({currentUser.name} • {currentUser.email})</span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
        {isAdmin ? (
          <>
            <span className="text-slate-400 font-medium mr-1 hidden sm:inline flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 inline text-amber-400" />
              <span>Admin Context Switcher:</span>
            </span>
            {allUsers.map((u) => {
              const isActive = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  id={`switch-role-${u.role.toLowerCase()}`}
                  onClick={() => onSwitchUser(u)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1 border ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={`Admin Switch to ${u.role} (${u.name})`}
                >
                  {roleIcons[u.role]}
                  <span>{u.role}</span>
                </button>
              );
            })}

            {onOpenUserManagement && (
              <button
                id="btn-admin-manage-users"
                onClick={onOpenUserManagement}
                className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded text-xs transition-all flex items-center space-x-1 ml-1 border border-purple-500"
                title="Open Admin User Account Management Modal"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Manage Users</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-medium">
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
              Role permissions strictly isolated by Admin
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
