import { Customer, CustomerStatus, CustomerType, Product, SalesChallan, StockLog, User, DashboardStats, ChallanStatus } from '../types';

let authToken: string | null = localStorage.getItem('authToken');

// Helpers to map backend responses to camelCase frontend models
const mapCustomerToFrontend = (c: any): Customer => ({
  ...c,
  customerType: c.customerType || (c.type ? (c.type.charAt(0) + c.type.slice(1).toLowerCase()) as CustomerType : 'Wholesale'),
  status: c.status ? (c.status.charAt(0) + c.status.slice(1).toLowerCase()) as CustomerStatus : 'Lead',
  nextFollowUpDate: c.followUpDate ? c.followUpDate.split('T')[0] : (c.nextFollowUpDate ? c.nextFollowUpDate.split('T')[0] : undefined),
  // Coerce Prisma Decimal fields to plain JS numbers
  dealValue: Number(c.dealValue) || 0,
  creditLimit: Number(c.creditLimit) || 0,
  outstandingBalance: Number(c.outstandingBalance) || 0,
  winProbability: Number(c.winProbability) || 0,
  followUpHistory: (c.followUps || c.followUpHistory || []).map((f: any) => ({
    id: f.id,
    note: f.notes || f.note || "",
    date: f.createdAt ? f.createdAt.split('T')[0] : "",
    createdBy: f.createdBy,
    createdAt: f.createdAt,
    activityType: f.activityType || 'Note',
    priority: f.priority || 'Medium'
  }))
});

const mapProductToFrontend = (p: any): Product => ({
  ...p,
  minStockAlert: p.minStockQty !== undefined ? p.minStockQty : (p.minStockAlert !== undefined ? p.minStockAlert : 10),
  unitPrice: Number(p.unitPrice),
});

const mapChallanToFrontend = (c: any): SalesChallan => {
  let totalAmount = 0;
  if (c.items) {
    totalAmount = c.items.reduce((sum: number, item: any) => sum + Number(item.subtotal || 0), 0);
  } else if (c.totalAmount !== undefined) {
    totalAmount = Number(c.totalAmount);
  }

  const status = c.status ? (c.status.charAt(0) + c.status.slice(1).toLowerCase()) as ChallanStatus : 'Draft';

  return {
    ...c,
    customerName: c.customerName || c.customer?.name || 'Unknown',
    customerBusinessName: c.customerBusinessName || c.customer?.businessName || 'Unknown',
    customerAddress: c.customerAddress || c.customer?.address || '',
    customerGst: c.customerGst || c.customer?.gstNumber || '',
    status,
    totalAmount,
    totalQuantity: c.totalQuantity || (c.items || []).reduce((acc: number, curr: any) => acc + curr.quantity, 0),
    products: (c.items || []).map((item: any) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      sku: item.skuSnapshot,
      unitPrice: Number(item.unitPriceSnapshot),
      quantity: item.quantity,
      lineTotal: Number(item.subtotal),
    })),
    createdBy: c.createdBy?.name || c.createdBy || 'System Operator',
    createdById: c.createdById,
  };
};

export const api = {
  // Set auth token
  setToken(token: string | null) {
    authToken = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },

  // Helper request wrapper
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
    } as any;

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      ...options,
      headers
    });
    
    // Auto unpack Express wrapper { success: true, customer/product/etc } envelopes
    if (res.ok) {
      try {
        const body = await res.json();
        let payload = body;
        
        if (body && typeof body === 'object') {
          if ('customer' in body) {
            payload = body.customer;
          } else if ('product' in body) {
            payload = body.product;
          } else if ('challan' in body) {
            payload = body.challan;
          } else if ('invoice' in body) {
            payload = body.invoice;
          }
        }
        
        // Return a mocked Response interface
        return {
          ok: true,
          status: res.status,
          json: async () => payload,
          text: async () => JSON.stringify(payload)
        } as any;
      } catch (e) {
        // Fallback silently if not JSON
      }
    }
    
    return res;
  },

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
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await this.fetchWithAuth('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Customers
  async getCustomers(query?: string, status?: string, type?: string): Promise<{ data: Customer[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'all') params.append('status', status);
    if (type && type !== 'all') params.append('type', type);

    const res = await this.fetchWithAuth(`/api/customers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    const body = await res.json();
    return {
      data: (body.data || []).map(mapCustomerToFrontend),
      total: body.total || 0,
    };
  },

  async getCustomerById(id: string): Promise<Customer> {
    const res = await this.fetchWithAuth(`/api/customers/${id}`);
    if (!res.ok) throw new Error('Customer not found');
    const customer = await res.json();
    return mapCustomerToFrontend(customer);
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const backendData: any = { ...customerData };
    if (customerData.customerType) {
      backendData.type = customerData.customerType.toUpperCase();
      delete backendData.customerType;
    }
    if (customerData.status) {
      backendData.status = customerData.status.toUpperCase();
    }
    if (customerData.nextFollowUpDate !== undefined) {
      backendData.followUpDate = customerData.nextFollowUpDate;
      delete backendData.nextFollowUpDate;
    }
    const res = await this.fetchWithAuth('/api/customers', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create customer');
    }
    const customer = await res.json();
    return mapCustomerToFrontend(customer);
  },

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    // Only send fields the backend schema accepts; strip frontend-only fields
    const {
      customerType, status, nextFollowUpDate,
      // Strip read-only / frontend-only fields
      id: _id, followUpHistory, outstandingBalance,
      ...rest
    } = customerData as any;

    const backendData: any = { ...rest };
    if (customerType) {
      backendData.type = customerType.toUpperCase();
    }
    if (status) {
      backendData.status = status.toUpperCase();
    }
    if (nextFollowUpDate !== undefined) {
      backendData.followUpDate = nextFollowUpDate || null;
    }
    const res = await this.fetchWithAuth(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update customer');
    }
    const customer = await res.json();
    return mapCustomerToFrontend(customer);
  },

  async updateCustomerStage(id: string, pipelineStage: string, updatedBy?: string): Promise<Customer> {
    const res = await this.fetchWithAuth(`/api/customers/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ pipelineStage, updatedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update deal stage');
    }
    const customer = await res.json();
    return mapCustomerToFrontend(customer);
  },

  async deleteCustomer(id: string): Promise<void> {
    const res = await this.fetchWithAuth(`/api/customers/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete customer');
    }
  },

  async addFollowUp(
    customerId: string,
    note: string,
    date?: string,
    createdBy?: string,
    activityType?: string,
    priority?: string
  ): Promise<Customer> {
    const res = await this.fetchWithAuth(`/api/customers/${customerId}/followups`, {
      method: 'POST',
      body: JSON.stringify({ note, date, createdBy, activityType, priority }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add follow-up note');
    }
    const customer = await res.json();
    return mapCustomerToFrontend(customer);
  },

  async getCrmAnalytics(): Promise<{
    totalPipelineValue: number;
    weightedPipelineValue: number;
    stagesCount: Record<string, number>;
    stagesValue: Record<string, number>;
    winRate: number;
    totalCustomers: number;
  }> {
    const res = await this.fetchWithAuth('/api/crm/analytics');
    if (!res.ok) throw new Error('Failed to fetch CRM analytics');
    return res.json();
  },

  // Products & Inventory
  async getProducts(query?: string, category?: string, lowStock?: boolean): Promise<{ data: Product[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);
    if (lowStock) params.append('lowStock', 'true');

    const res = await this.fetchWithAuth(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const body = await res.json();
    return {
      data: (body.data || []).map(mapProductToFrontend),
      total: body.total || 0,
    };
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const backendData: any = { ...productData };
    if (productData.minStockAlert !== undefined) {
      backendData.minStockQty = productData.minStockAlert;
      delete backendData.minStockAlert;
    }
    const res = await this.fetchWithAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    const product = await res.json();
    return mapProductToFrontend(product);
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const backendData: any = { ...productData };
    if (productData.minStockAlert !== undefined) {
      backendData.minStockQty = productData.minStockAlert;
      delete backendData.minStockAlert;
    }
    const res = await this.fetchWithAuth(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    const product = await res.json();
    return mapProductToFrontend(product);
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await this.fetchWithAuth(`/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete product');
    }
  },

  // Stock Logs
  async getStockLogs(productId?: string, type?: 'IN' | 'OUT'): Promise<{ data: StockLog[]; total: number }> {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (type) params.append('type', type);

    const res = await this.fetchWithAuth(`/api/stock-logs?${params.toString()}`);
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
    const res = await this.fetchWithAuth('/api/stock-logs', {
      method: 'POST',
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
    if (status && status !== 'all') params.append('status', status.toUpperCase());

    const res = await this.fetchWithAuth(`/api/challans?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sales challans');
    const body = await res.json();
    return {
      data: (body.data || []).map(mapChallanToFrontend),
      total: body.total || 0,
    };
  },

  async getChallanById(id: string): Promise<SalesChallan> {
    const res = await this.fetchWithAuth(`/api/challans/${id}`);
    if (!res.ok) throw new Error('Challan not found');
    const data = await res.json();
    return mapChallanToFrontend(data);
  },

  async createChallan(payload: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    status?: 'Draft' | 'Confirmed';
    notes?: string;
    createdBy?: string;
    createdById?: string;
  }): Promise<SalesChallan> {
    // server.ts expects mixed-case: 'Draft' | 'Confirmed' | 'Cancelled'
    const backendPayload = {
      ...payload,
      status: payload.status || 'Draft',
    };
    const res = await this.fetchWithAuth('/api/challans', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create sales challan');
    }
    const data = await res.json();
    return mapChallanToFrontend(data);
  },

  async updateChallanStatus(id: string, status: 'Draft' | 'Confirmed' | 'Cancelled', updatedBy?: string): Promise<SalesChallan> {
    const res = await this.fetchWithAuth(`/api/challans/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, updatedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update challan status');
    }
    const data = await res.json();
    return mapChallanToFrontend(data);
  },

  // User Management
  async getUsers(): Promise<User[]> {
    const res = await this.fetchWithAuth('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(userData: Partial<User> & { password?: string }): Promise<User> {
    const res = await this.fetchWithAuth('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || 'Failed to create user');
    }
    return res.json();
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const res = await this.fetchWithAuth(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || 'Failed to update user');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await this.fetchWithAuth(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || 'Failed to delete user');
    }
  },

  async resetUserPassword(id: string, password?: string): Promise<void> {
    const res = await this.fetchWithAuth(`/api/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || 'Failed to reset password');
    }
  },
};
