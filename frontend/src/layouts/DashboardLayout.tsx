import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Users, 
  Package, 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  History,
  TrendingUp,
  Receipt
} from "lucide-react";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { to: "/customers", label: "CRM Customers", icon: Users, roles: ["ADMIN", "SALES", "ACCOUNTS"] },
    { to: "/products", label: "Products Catalog", icon: Package, roles: ["ADMIN", "WAREHOUSE", "SALES"] },
    { to: "/challans", label: "Sales Challans", icon: FileText, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">
          <TrendingUp size={24} color="#3b82f6" />
          <span>Portal ERP</span>
        </div>
        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          <div className="sidebar-link" onClick={handleLogout} style={{ marginTop: "auto" }}>
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Management System</h2>
          <div className="user-profile">
            <span>{user?.name}</span>
            <span className="role-badge">{user?.role}</span>
          </div>
        </header>
        <div className="content-container">{children}</div>
      </main>
    </div>
  );
};
