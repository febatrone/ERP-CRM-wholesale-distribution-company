import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FileCheck,
  History,
  Code2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  BarChart2,
  Settings as SettingsIcon,
  MessageCircle,
  Briefcase,
  ChevronDown,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';
import { UserRole, User } from '../types';

export type ActiveTab = 'dashboard' | 'crm' | 'inventory' | 'challans' | 'stock-logs' | 'api-docs' | 'audit-logs';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: UserRole;
  currentUser?: User;
  lowStockCount: number;
  draftChallanCount: number;
  onOpenUserManagement?: () => void;
  crmViewMode?: 'kanban' | 'table' | 'analytics';
  onCrmViewModeChange?: (mode: 'kanban' | 'table' | 'analytics') => void;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  currentUser,
  lowStockCount,
  draftChallanCount,
  onOpenUserManagement,
  crmViewMode = 'kanban',
  onCrmViewModeChange,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const mainNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] as UserRole[],
    },
    {
      id: 'crm' as ActiveTab,
      label: 'Clients & CRM',
      icon: Users,
      badge: '28',
      badgeColor: 'bg-pink-100 text-pink-600',
      roles: ['Admin', 'Sales', 'Accounts'] as UserRole[],
      subItems: [
        { id: 'crm-pipeline', label: 'Sales Pipeline' },
        { id: 'crm-contacts', label: 'Client Contacts' },
      ],
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Products & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['Admin', 'Warehouse'] as UserRole[],
    },
    {
      id: 'challans' as ActiveTab,
      label: 'Sales Orders',
      icon: FileCheck,
      badge: draftChallanCount > 0 ? `${draftChallanCount} Draft` : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800',
      roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] as UserRole[],
    },
    {
      id: 'stock-logs' as ActiveTab,
      label: 'Stock Movements',
      icon: History,
      roles: ['Admin', 'Warehouse'] as UserRole[],
    },
    {
      id: 'audit-logs' as ActiveTab,
      label: 'Security Audit Trail',
      icon: ShieldAlert,
      roles: ['Admin', 'Accounts'] as UserRole[],
    },
  ];

  const sidebarContent = (
    <aside
      id="main-sidebar"
      className={`${
        isOpenMobile
          ? 'fixed inset-y-0 left-0 w-64 bg-white text-slate-800 h-full z-50 flex flex-col border-r border-slate-200 shadow-2xl animate-slide-in'
          : 'hidden md:flex md:flex-col md:w-64 bg-white/90 backdrop-blur-md text-slate-800 h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] sticky top-5 my-2 ml-2 rounded-3xl border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] select-none shrink-0 z-10 transition-all'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
            {/* Geometric Insight Scope / OmniFlow Brand Mark */}
            <div className="grid grid-cols-2 gap-1 w-4 h-4">
              <div className="bg-white rounded-sm"></div>
              <div className="bg-purple-400 rounded-sm"></div>
              <div className="bg-purple-400 rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
              Insight Scope
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Enterprise ERP & CRM</p>
          </div>
        </div>

        {isOpenMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {/* MAIN CATEGORY */}
        <div>
          <p className="px-3 mb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Main</p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isPermitted = item.roles.includes(userRole);
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      if (isPermitted) {
                        onTabChange(item.id);
                        onCloseMobile?.();
                      }
                    }}
                    disabled={!isPermitted}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-purple-100/80 text-purple-800 shadow-xs'
                        : isPermitted
                        ? 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        : 'text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-purple-700' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {!isPermitted ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    ) : item.badge ? (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>

                  {/* Nested Sub-Menu guide lines when active */}
                  {isActive && item.subItems && (
                    <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-purple-300 ml-5">
                      {item.subItems.map((sub) => {
                        const isSubActive =
                          (sub.id === 'crm-pipeline' && crmViewMode === 'kanban') ||
                          (sub.id === 'crm-contacts' && crmViewMode === 'table');

                        return (
                          <button
                            key={sub.id}
                            id={`nav-subitem-${sub.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isPermitted) {
                                onTabChange(item.id);
                                if (sub.id === 'crm-pipeline' && onCrmViewModeChange) {
                                  onCrmViewModeChange('kanban');
                                } else if (sub.id === 'crm-contacts' && onCrmViewModeChange) {
                                  onCrmViewModeChange('table');
                                }
                                onCloseMobile?.();
                              }
                            }}
                            className={`block w-full text-left text-[11px] py-1 transition-colors flex items-center space-x-1.5 ${
                              isSubActive
                                ? 'text-purple-900 font-extrabold'
                                : 'text-purple-600 hover:text-purple-900 font-medium'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-purple-700' : 'bg-purple-300'}`} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ADMIN ACCOUNT MANAGEMENT SECTION */}
        {userRole === 'Admin' && (
          <div>
            <p className="px-3 mb-2 text-[10px] uppercase font-bold text-purple-600 tracking-wider">
              Administration
            </p>
            <button
              id="sidebar-user-management-btn"
              onClick={() => onOpenUserManagement && onOpenUserManagement()}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-2xl text-xs font-bold transition-all shadow-2xs"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4 text-purple-700" />
                <span>User Account Mgmt</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-purple-200 text-purple-800 rounded">
                Admin
              </span>
            </button>
          </div>
        )}

        {/* COMMUNICATION & QUICK TEAM LINKS */}
        <div>
          <p className="px-3 mb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Communication
          </p>
          <div className="space-y-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onTabChange('crm')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl hover:bg-slate-100/80 transition-all text-slate-600"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Top Managers</span>
              </div>
            </button>

            <button
              onClick={() => onTabChange('crm')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl hover:bg-slate-100/80 transition-all text-slate-600"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span>Sales Department</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Logout button clearly visible above user profile */}
      {onLogout && (
        <div className="px-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-2xl text-xs font-bold transition-all border border-rose-200/60 shadow-2xs"
            title="Sign Out of Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Log Out</span>
          </button>
        </div>
      )}

      {/* User Profile Switcher Footer */}
      <div className="p-3 m-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="relative">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={currentUser?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border border-white shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Evgeniy Pateyuk'}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'patenson_28@google.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}
      {sidebarContent}
    </>
  );
};

