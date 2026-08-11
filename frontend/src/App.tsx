import React, { useEffect, useState, useCallback } from 'react';
import { Customer, Product, SalesChallan, StockLog, User, DashboardStats, AuditLog, AuditModule } from './types';
import { DEMO_USERS, INITIAL_AUDIT_LOGS } from './data/initialData';
import { api } from './services/api';
import { RoleBanner } from './components/RoleBanner';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomerCRM } from './components/CustomerCRM';
import { InventoryModule } from './components/InventoryModule';
import { SalesChallanModule } from './components/SalesChallanModule';
import { StockLogsModule } from './components/StockLogsModule';
import { AuditTrailModule } from './components/AuditTrailModule';
import { ChallanInvoiceModal } from './components/ChallanInvoiceModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';

export default function App() {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start unauthenticated to force login screen
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // App Data State
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeLeads: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalChallans: 0,
    draftChallans: 0,
    confirmedChallans: 0,
    totalRevenue: 0,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [challans, setChallans] = useState<SalesChallan[]>([]);

  // Selection / Modal States
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [selectedChallanForInvoice, setSelectedChallanForInvoice] = useState<SalesChallan | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [initialLowStockFilter, setInitialLowStockFilter] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [crmViewMode, setCrmViewMode] = useState<'kanban' | 'table' | 'analytics'>('kanban');

  // Fetch all app data
  const loadAppData = useCallback(async () => {
    try {
      const [statsRes, custRes, prodRes, logsRes, challanRes] = await Promise.all([
        api.getDashboardStats(),
        api.getCustomers(),
        api.getProducts(),
        api.getStockLogs(),
        api.getChallans(),
      ]);

      setStats(statsRes);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setStockLogs(logsRes.data);
      setChallans(challanRes.data);
    } catch (err) {
      console.error('Error loading ERP data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Handlers
  const handleLogin = async (email: string, password?: string, role?: string) => {
    const res = await api.login(email, password, role);
    setCurrentUser(res.user);
    setShowLoginModal(false);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    // Ensure activeTab is permissible for the new user role
    if (user.role === 'Sales' && (activeTab === 'inventory' || activeTab === 'stock-logs')) {
      setActiveTab('dashboard');
    } else if (user.role === 'Warehouse' && activeTab === 'crm') {
      setActiveTab('inventory');
    } else if (user.role === 'Accounts' && (activeTab === 'inventory' || activeTab === 'stock-logs')) {
      setActiveTab('challans');
    }
  };

  // Centralized Audit Trail Logger
  const logAuditEvent = useCallback(
    (
      module: AuditModule,
      action: string,
      recordId: string,
      recordName: string,
      details: string,
      severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
    ) => {
      const newLog: AuditLog = {
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || 'usr-system',
        userName: currentUser?.name || 'System Operator',
        userRole: currentUser?.role || 'Admin',
        userEmail: currentUser?.email || 'admin@omniflow.com',
        module,
        action,
        recordId,
        recordName,
        details,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
        severity,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr_${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    logAuditEvent(
      'User Management',
      'USER_CREATE',
      newUser.id,
      newUser.name,
      `Created user account with role '${newUser.role}' in '${newUser.department || 'General'}' department.`,
      'WARNING'
    );
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    logAuditEvent(
      'User Management',
      'USER_ROLE_ASSIGNMENT',
      id,
      updates.name || 'User Account',
      `Updated user privileges/role to '${updates.role || 'Modified'}'.`,
      'WARNING'
    );
  };

  const handleAddCustomer = async (data: Partial<Customer>) => {
    const created = await api.createCustomer(data);
    await loadAppData();
    logAuditEvent(
      'CRM',
      'CUSTOMER_CREATE',
      created.id,
      created.businessName || created.name,
      `Created new customer account (${created.customerType}) with initial status '${created.status}'.`,
      'INFO'
    );
  };

  const handleUpdateCustomer = async (id: string, data: Partial<Customer>) => {
    const updated = await api.updateCustomer(id, data);
    await loadAppData();
    logAuditEvent(
      'CRM',
      'CUSTOMER_UPDATE',
      id,
      updated.businessName || updated.name,
      `Updated customer details (Type: ${updated.customerType}, Status: ${updated.status}).`,
      'INFO'
    );
  };

  const handleUpdateCustomerStage = async (id: string, pipelineStage: any) => {
    const updated = await api.updateCustomerStage(id, pipelineStage, currentUser?.name);
    if (selectedCustomerForDetail && selectedCustomerForDetail.id === id) {
      setSelectedCustomerForDetail(updated);
    }
    await loadAppData();
    logAuditEvent(
      'CRM',
      'STAGE_CHANGE',
      id,
      updated.businessName || updated.name,
      `Advanced deal pipeline stage to '${pipelineStage}' (Deal Value: ₹${(updated.dealValue || 0).toLocaleString()}).`,
      'INFO'
    );
  };

  const handleAddFollowUp = async (
    customerId: string,
    note: string,
    date?: string,
    activityType?: any,
    priority?: any
  ) => {
    const updated = await api.addFollowUp(
      customerId,
      note,
      date,
      currentUser?.name,
      activityType,
      priority
    );
    setSelectedCustomerForDetail(updated);
    await loadAppData();
    logAuditEvent(
      'CRM',
      'FOLLOWUP_ADD',
      customerId,
      updated.businessName || updated.name,
      `Logged CRM activity '${activityType || 'Note'}': "${note.substring(0, 50)}${note.length > 50 ? '...' : ''}".`,
      'INFO'
    );
  };

  const handleAddProduct = async (data: Partial<Product>) => {
    const created = await api.createProduct(data);
    await loadAppData();
    logAuditEvent(
      'Inventory',
      'PRODUCT_CREATE',
      created.id,
      created.name,
      `Added new inventory product (SKU: ${created.sku}, Stock: ${created.currentStock}, Price: ₹${created.unitPrice}).`,
      'INFO'
    );
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    const updated = await api.updateProduct(id, data);
    await loadAppData();
    logAuditEvent(
      'Inventory',
      'PRODUCT_UPDATE',
      id,
      updated.name,
      `Updated product specs (SKU: ${updated.sku}, Location: ${updated.location}).`,
      'INFO'
    );
  };

  const handleAddStockMovement = async (payload: {
    productId: string;
    quantity: number;
    movementType: 'IN' | 'OUT';
    reason: string;
  }) => {
    await api.addStockMovement({
      ...payload,
      createdBy: currentUser?.name || 'Warehouse User',
    });
    await loadAppData();
    const targetProd = products.find((p) => p.id === payload.productId);
    logAuditEvent(
      'Inventory',
      payload.movementType === 'IN' ? 'STOCK_RESTOCK' : 'STOCK_DISPATCH',
      payload.productId,
      targetProd?.name || 'Product',
      `Manual stock movement (${payload.movementType}): ${payload.movementType === 'IN' ? '+' : '-'}${payload.quantity} units. Reason: ${payload.reason}.`,
      payload.movementType === 'OUT' ? 'WARNING' : 'INFO'
    );
  };

  const handleCreateChallan = async (payload: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    status?: 'Draft' | 'Confirmed';
    notes?: string;
  }) => {
    const newChallan = await api.createChallan({
      ...payload,
      createdBy: currentUser?.name || 'Sales User',
      createdById: currentUser?.id,
    });
    await loadAppData();
    logAuditEvent(
      'Sales Challans',
      'CHALLAN_CREATE',
      newChallan.id,
      newChallan.challanNumber,
      `Generated new Sales Order (${newChallan.status}) for ${newChallan.customerBusinessName} (Total: ₹${newChallan.totalAmount.toLocaleString()}).`,
      newChallan.status === 'Confirmed' ? 'CRITICAL' : 'INFO'
    );
    return newChallan;
  };

  const handleUpdateChallanStatus = async (id: string, status: 'Draft' | 'Confirmed' | 'Cancelled') => {
    await api.updateChallanStatus(id, status, currentUser?.name);
    await loadAppData();
    const targetChallan = challans.find((c) => c.id === id);
    logAuditEvent(
      'Sales Challans',
      status === 'Confirmed' ? 'CHALLAN_CONFIRM' : status === 'Cancelled' ? 'CHALLAN_CANCEL' : 'CHALLAN_UPDATE',
      id,
      targetChallan?.challanNumber || id,
      `Updated Sales Order status to '${status}' (Customer: ${targetChallan?.customerBusinessName || 'N/A'}). Stock balance updated.`,
      status === 'Confirmed' || status === 'Cancelled' ? 'CRITICAL' : 'INFO'
    );
  };

  // Filter low stock products for notification bell & alerts
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockAlert);
  const upcomingFollowUps = customers.filter((c) => c.nextFollowUpDate && c.status !== 'Inactive');

  if (!currentUser || showLoginModal) {
    return <LoginModal demoUsers={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex flex-col font-sans text-slate-800 antialiased selection:bg-purple-200 selection:text-purple-900">
      {/* Top Demo Role Banner */}
      <RoleBanner
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        allUsers={users}
        onOpenUserManagement={() => setShowUserManagementModal(true)}
      />

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        lowStockProducts={lowStockProducts}
        customers={customers}
        products={products}
        challans={challans}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setInitialLowStockFilter(false);
          setActiveTab(tab);
        }}
        onOpenNewChallan={() => setActiveTab('challans')}
        onOpenNewCustomer={() => {
          setActiveTab('crm');
        }}
        onOpenApiDocs={() => setActiveTab('api-docs')}
        onOpenUserManagement={() => setShowUserManagementModal(true)}
        onLogout={() => setShowLoginModal(true)}
        onNavigateToLowStock={() => {
          setInitialLowStockFilter(true);
          setActiveTab('inventory');
        }}
        onViewCustomerDetail={(c) => {
          setSelectedCustomerForDetail(c);
          setActiveTab('crm');
        }}
        onViewChallanDetail={(c) => {
          setSelectedChallanForInvoice(c);
          setActiveTab('challans');
        }}
        searchQuery={globalSearchQuery}
        onSearchChange={setGlobalSearchQuery}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col md:flex-row pb-6">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setInitialLowStockFilter(false);
            setActiveTab(tab);
          }}
          userRole={currentUser.role}
          currentUser={currentUser}
          lowStockCount={lowStockProducts.length}
          draftChallanCount={stats.draftChallans}
          onOpenUserManagement={() => setShowUserManagementModal(true)}
          crmViewMode={crmViewMode}
          onCrmViewModeChange={setCrmViewMode}
        />

        {/* Content Body */}
        <main className="flex-1 p-3 sm:p-5 max-w-[1440px] mx-auto w-full space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
              <span>Loading Insight Scope CRM Data...</span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  stats={stats}
                  lowStockProducts={lowStockProducts}
                  recentChallans={challans}
                  upcomingFollowUps={upcomingFollowUps}
                  userRole={currentUser.role}
                  currentUser={currentUser}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenNewChallan={() => setActiveTab('challans')}
                  onOpenNewCustomer={() => {
                    setCrmViewMode('kanban');
                    setActiveTab('crm');
                  }}
                  onViewChallanDetail={(c) => setSelectedChallanForInvoice(c)}
                  onViewCustomerDetail={(c) => setSelectedCustomerForDetail(c)}
                />
              )}

              {activeTab === 'crm' && (
                <CustomerCRM
                  customers={customers}
                  userRole={currentUser.role}
                  challans={challans}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onUpdateCustomerStage={handleUpdateCustomerStage}
                  onAddFollowUp={handleAddFollowUp}
                  selectedCustomerForDetail={selectedCustomerForDetail}
                  onSelectCustomerForDetail={setSelectedCustomerForDetail}
                  onOpenNewChallanForCustomer={(cust) => {
                    setActiveTab('challans');
                  }}
                  viewMode={crmViewMode}
                  onViewModeChange={setCrmViewMode}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryModule
                  products={products}
                  userRole={currentUser.role}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onAddStockMovement={handleAddStockMovement}
                  initialLowStockFilter={initialLowStockFilter}
                />
              )}

              {activeTab === 'challans' && (
                <SalesChallanModule
                  challans={challans}
                  customers={customers}
                  products={products}
                  userRole={currentUser.role}
                  onCreateChallan={handleCreateChallan}
                  onUpdateChallanStatus={handleUpdateChallanStatus}
                  onViewChallanDetail={(c) => setSelectedChallanForInvoice(c)}
                />
              )}

              {activeTab === 'stock-logs' && (
                <StockLogsModule stockLogs={stockLogs} userRole={currentUser.role} />
              )}

              {activeTab === 'audit-logs' && (
                <AuditTrailModule auditLogs={auditLogs} userRole={currentUser.role} />
              )}

              {activeTab === 'api-docs' && <ApiDocsModal />}
            </>
          )}
        </main>
      </div>

      {/* Printable Invoice Modal */}
      <ChallanInvoiceModal
        challan={selectedChallanForInvoice}
        onClose={() => setSelectedChallanForInvoice(null)}
      />

      {/* Admin User Account Management Modal */}
      <UserManagementModal
        isOpen={showUserManagementModal}
        onClose={() => setShowUserManagementModal(false)}
        users={users}
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onSwitchUser={handleSwitchUser}
      />
    </div>
  );
}
