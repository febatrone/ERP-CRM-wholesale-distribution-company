import { Customer, Product, SalesChallan, StockLog, User, DashboardStats } from '../types';

export const api = {
  // Auth
  async login(email: string, password?: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Customers
  async getCustomers(query?: string, status?: string, type?: string): Promise<{ data: Customer[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'all') params.append('status', status);
    if (type && type !== 'all') params.append('type', type);

    const res = await fetch(`/api/customers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomerById(id: string): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`);
    if (!res.ok) throw new Error('Customer not found');
    return res.json();
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create customer');
    }
    return res.json();
  },

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update customer');
    }
    return res.json();
  },

  async updateCustomerStage(id: string, pipelineStage: string, updatedBy?: string): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineStage, updatedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update deal stage');
    }
    return res.json();
  },

  async addFollowUp(
    customerId: string,
    note: string,
    date?: string,
    createdBy?: string,
    activityType?: string,
    priority?: string
  ): Promise<Customer> {
    const res = await fetch(`/api/customers/${customerId}/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, date, createdBy, activityType, priority }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add follow-up note');
    }
    return res.json();
  },

  async getCrmAnalytics(): Promise<{
    totalPipelineValue: number;
    weightedPipelineValue: number;
    stagesCount: Record<string, number>;
    stagesValue: Record<string, number>;
    winRate: number;
    totalCustomers: number;
  }> {
    const res = await fetch('/api/crm/analytics');
    if (!res.ok) throw new Error('Failed to fetch CRM analytics');
    return res.json();
  },

  // Products & Inventory
  async getProducts(query?: string, category?: string, lowStock?: boolean): Promise<{ data: Product[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);
    if (lowStock) params.append('lowStock', 'true');

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  // Stock Logs
  async getStockLogs(productId?: string, type?: 'IN' | 'OUT'): Promise<{ data: StockLog[]; total: number }> {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (type) params.append('type', type);

    const res = await fetch(`/api/stock-logs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch stock movement logs');
    return res.json();
  },

  async addStockMovement(payload: {
    productId: string;
    quantity: number;
    movementType: 'IN' | 'OUT';
    reason: string;
    createdBy?: string;
  }): Promise<{ stockLog: StockLog; updatedProduct: Product }> {
    const res = await fetch('/api/stock-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record stock movement');
    }
    return res.json();
  },

  // Sales Challans
  async getChallans(query?: string, status?: string): Promise<{ data: SalesChallan[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'all') params.append('status', status);

    const res = await fetch(`/api/challans?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sales challans');
    return res.json();
  },

  async getChallanById(id: string): Promise<SalesChallan> {
    const res = await fetch(`/api/challans/${id}`);
    if (!res.ok) throw new Error('Challan not found');
    return res.json();
  },

  async createChallan(payload: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    status?: 'Draft' | 'Confirmed';
    notes?: string;
    createdBy?: string;
    createdById?: string;
  }): Promise<SalesChallan> {
    const res = await fetch('/api/challans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create sales challan');
    }
    return res.json();
  },

  async updateChallanStatus(id: string, status: 'Draft' | 'Confirmed' | 'Cancelled', updatedBy?: string): Promise<SalesChallan> {
    const res = await fetch(`/api/challans/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updatedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update challan status');
    }
    return res.json();
  },
};
