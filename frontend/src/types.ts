export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  token?: string;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';
export type PipelineStage = 'Inquiry' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type ActivityType = 'Call' | 'Meeting' | 'Email' | 'Quote' | 'Site Visit' | 'Note';

export interface FollowUpNote {
  id: string;
  note: string;
  date: string; // ISO or YYYY-MM-DD
  createdBy: string;
  createdAt: string;
  activityType?: ActivityType;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  followUpHistory?: FollowUpNote[];
  // Advanced CRM Pipeline & Financial Fields
  pipelineStage?: PipelineStage;
  dealValue?: number;
  winProbability?: number; // 0 - 100%
  expectedCloseDate?: string;
  assignedRep?: string;
  leadSource?: string;
  creditLimit?: number;
  outstandingBalance?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT';

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityChanged: number;
  movementType: StockMovementType;
  reason: string;
  createdBy: string;
  timestamp: string;
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanProductSnapshot {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  customerBusinessName: string;
  customerGst?: string;
  customerAddress: string;
  products: ChallanProductSnapshot[];
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdBy: string;
  createdById: string;
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
  cancelledAt?: string;
  notes?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeLeads: number;
  totalProducts: number;
  lowStockCount: number;
  totalChallans: number;
  draftChallans: number;
  confirmedChallans: number;
  totalRevenue: number;
}

export type AuditModule = 'CRM' | 'Inventory' | 'Sales Challans' | 'User Management' | 'System';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  module: AuditModule;
  action: string;
  recordId: string;
  recordName: string;
  details: string;
  ipAddress?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}
