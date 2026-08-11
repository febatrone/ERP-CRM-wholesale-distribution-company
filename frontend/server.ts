import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_STOCK_LOGS, INITIAL_CHALLANS, DEMO_USERS } from './src/data/initialData';
import { Customer, Product, StockLog, SalesChallan, User, FollowUpNote, ChallanProductSnapshot } from './src/types';

// In-Memory Database Store
let users: User[] = [...DEMO_USERS];
let customers: Customer[] = [...INITIAL_CUSTOMERS];
let products: Product[] = [...INITIAL_PRODUCTS];
let stockLogs: StockLog[] = [...INITIAL_STOCK_LOGS];
let challans: SalesChallan[] = [...INITIAL_CHALLANS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Auth Endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid user credentials. Use demo credentials from the login screen.' });
    }

    // Optional override role if provided
    const activeRole = role || user.role;
    const token = `jwt-mock-token-${user.id}-${Date.now()}`;

    res.json({
      user: {
        ...user,
        role: activeRole,
      },
      token,
      message: 'Login successful',
    });
  });

  // 2. Dashboard Stats
  app.get('/api/dashboard/stats', (req: Request, res: Response) => {
    const totalCustomers = customers.length;
    const activeLeads = customers.filter((c) => c.status === 'Lead').length;
    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
    const totalChallans = challans.length;
    const draftChallans = challans.filter((c) => c.status === 'Draft').length;
    const confirmedChallans = challans.filter((c) => c.status === 'Confirmed').length;
    const totalRevenue = challans
      .filter((c) => c.status === 'Confirmed')
      .reduce((sum, c) => sum + c.totalAmount, 0);

    res.json({
      totalCustomers,
      activeLeads,
      totalProducts,
      lowStockCount,
      totalChallans,
      draftChallans,
      confirmedChallans,
      totalRevenue,
    });
  });

  // 3. Customer CRM Endpoints
  app.get('/api/customers', (req: Request, res: Response) => {
    const { q, status, type, page = 1, limit = 50 } = req.query;

    let result = [...customers];

    if (q) {
      const query = String(q).toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.businessName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.mobile.includes(query) ||
          (c.gstNumber && c.gstNumber.toLowerCase().includes(query))
      );
    }

    if (status && status !== 'all') {
      result = result.filter((c) => c.status === status);
    }

    if (type && type !== 'all') {
      result = result.filter((c) => c.customerType === type);
    }

    // Sort by latest created first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      data: result,
      total: result.length,
      page: Number(page),
      limit: Number(limit),
    });
  });

  app.get('/api/customers/:id', (req: Request, res: Response) => {
    const customer = customers.find((c) => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  });

  app.post('/api/customers', (req: Request, res: Response) => {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      nextFollowUpDate,
      notes,
      pipelineStage,
      dealValue,
      winProbability,
      expectedCloseDate,
      assignedRep,
      leadSource,
      creditLimit,
    } = req.body;

    // Input Validation
    if (!name || !mobile || !email || !businessName || !customerType || !address) {
      return res.status(400).json({ error: 'Missing required fields: name, mobile, email, businessName, customerType, address' });
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      mobile,
      email,
      businessName,
      gstNumber: gstNumber || '',
      customerType,
      address,
      status: status || 'Lead',
      nextFollowUpDate: nextFollowUpDate || '',
      notes: notes || '',
      pipelineStage: pipelineStage || 'Inquiry',
      dealValue: dealValue ? Number(dealValue) : 100000,
      winProbability: winProbability ? Number(winProbability) : 30,
      expectedCloseDate: expectedCloseDate || '',
      assignedRep: assignedRep || 'Alex Vance (Sales)',
      leadSource: leadSource || 'Website Inquiry',
      creditLimit: creditLimit ? Number(creditLimit) : 500000,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followUpHistory: notes
        ? [
            {
              id: `fup-${Date.now()}`,
              note: notes,
              date: new Date().toISOString().split('T')[0],
              createdBy: assignedRep || 'System User',
              createdAt: new Date().toISOString(),
              activityType: 'Note',
              priority: 'Medium',
            },
          ]
        : [],
    };

    customers.unshift(newCustomer);
    res.status(201).json(newCustomer);
  });

  app.put('/api/customers/:id', (req: Request, res: Response) => {
    const index = customers.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const existing = customers[index];
    const updated: Customer = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    customers[index] = updated;
    res.json(updated);
  });

  // Quick Stage Transition Endpoint for CRM Pipeline
  app.patch('/api/customers/:id/stage', (req: Request, res: Response) => {
    const { id } = req.params;
    const { pipelineStage, updatedBy } = req.body;

    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const oldStage = customer.pipelineStage;
    customer.pipelineStage = pipelineStage;

    // Automatically map pipelineStage to status where applicable
    if (pipelineStage === 'Closed Won') {
      customer.status = 'Active';
      customer.winProbability = 100;
    } else if (pipelineStage === 'Closed Lost') {
      customer.status = 'Inactive';
      customer.winProbability = 0;
    } else if (pipelineStage === 'Proposal') {
      customer.winProbability = 60;
    } else if (pipelineStage === 'Negotiation') {
      customer.winProbability = 80;
    }

    if (!customer.followUpHistory) customer.followUpHistory = [];
    customer.followUpHistory.unshift({
      id: `fup-${Date.now()}`,
      note: `Pipeline stage updated from '${oldStage || 'Inquiry'}' to '${pipelineStage}'`,
      date: new Date().toISOString().split('T')[0],
      createdBy: updatedBy || 'Sales User',
      createdAt: new Date().toISOString(),
      activityType: 'Note',
      priority: 'Medium',
    });

    customer.updatedAt = new Date().toISOString();
    res.json(customer);
  });

  app.post('/api/customers/:id/followups', (req: Request, res: Response) => {
    const { id } = req.params;
    const { note, date, createdBy, activityType, priority } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'Follow-up note content is required' });
    }

    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const newFollowUp: FollowUpNote = {
      id: `fup-${Date.now()}`,
      note,
      date: date || new Date().toISOString().split('T')[0],
      createdBy: createdBy || 'Sales User',
      createdAt: new Date().toISOString(),
      activityType: activityType || 'Call',
      priority: priority || 'Medium',
    };

    if (!customer.followUpHistory) {
      customer.followUpHistory = [];
    }
    customer.followUpHistory.unshift(newFollowUp);
    if (date) {
      customer.nextFollowUpDate = date;
    }
    customer.updatedAt = new Date().toISOString();

    res.status(201).json(customer);
  });

  // CRM Analytics Metrics Endpoint
  app.get('/api/crm/analytics', (req: Request, res: Response) => {
    const totalPipelineValue = customers.reduce((sum, c) => sum + (c.dealValue || 0), 0);
    const weightedPipelineValue = customers.reduce(
      (sum, c) => sum + (c.dealValue || 0) * ((c.winProbability || 0) / 100),
      0
    );

    const stagesCount: Record<string, number> = {
      Inquiry: 0,
      Contacted: 0,
      Proposal: 0,
      Negotiation: 0,
      'Closed Won': 0,
      'Closed Lost': 0,
    };

    const stagesValue: Record<string, number> = {
      Inquiry: 0,
      Contacted: 0,
      Proposal: 0,
      Negotiation: 0,
      'Closed Won': 0,
      'Closed Lost': 0,
    };

    customers.forEach((c) => {
      const stage = c.pipelineStage || 'Inquiry';
      stagesCount[stage] = (stagesCount[stage] || 0) + 1;
      stagesValue[stage] = (stagesValue[stage] || 0) + (c.dealValue || 0);
    });

    const totalWon = stagesCount['Closed Won'] || 0;
    const totalLost = stagesCount['Closed Lost'] || 0;
    const winRate = totalWon + totalLost > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 100;

    res.json({
      totalPipelineValue,
      weightedPipelineValue,
      stagesCount,
      stagesValue,
      winRate,
      totalCustomers: customers.length,
    });
  });

  // 4. Product & Inventory Endpoints
  app.get('/api/products', (req: Request, res: Response) => {
    const { q, category, lowStock } = req.query;

    let result = [...products];

    if (q) {
      const query = String(q).toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    if (category && category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    if (lowStock === 'true') {
      result = result.filter((p) => p.currentStock <= p.minStockAlert);
    }

    res.json({ data: result, total: result.length });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;

    if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, sku, category, unitPrice, currentStock' });
    }

    // SKU uniqueness check
    if (products.some((p) => p.sku.toLowerCase() === String(sku).toLowerCase())) {
      return res.status(409).json({ error: `Product SKU '${sku}' already exists.` });
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      sku: String(sku).toUpperCase(),
      category,
      unitPrice: Number(unitPrice),
      currentStock: Number(currentStock),
      minStockAlert: Number(minStockAlert) || 10,
      location: location || 'Main Warehouse',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);

    // Initial stock log if currentStock > 0
    if (newProduct.currentStock > 0) {
      stockLogs.unshift({
        id: `stk-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        productSku: newProduct.sku,
        quantityChanged: newProduct.currentStock,
        movementType: 'IN',
        reason: 'Initial Product Stock Setup',
        createdBy: 'System / Warehouse',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = products[index];
    const updated: Product = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    res.json(updated);
  });

  // 5. Stock Movement Logs Endpoints
  app.get('/api/stock-logs', (req: Request, res: Response) => {
    const { productId, type } = req.query;

    let result = [...stockLogs];

    if (productId) {
      result = result.filter((l) => l.productId === productId);
    }

    if (type && (type === 'IN' || type === 'OUT')) {
      result = result.filter((l) => l.movementType === type);
    }

    // Sort by newest
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ data: result, total: result.length });
  });

  app.post('/api/stock-logs', (req: Request, res: Response) => {
    const { productId, quantity, movementType, reason, createdBy } = req.body;

    if (!productId || !quantity || !movementType || !reason) {
      return res.status(400).json({ error: 'Missing required fields: productId, quantity, movementType, reason' });
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Stock Validation for OUT movement
    if (movementType === 'OUT') {
      if (product.currentStock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for product '${product.name}' (${product.sku}). Current stock: ${product.currentStock}, Requested reduction: ${qty}`,
        });
      }
      product.currentStock -= qty;
    } else if (movementType === 'IN') {
      product.currentStock += qty;
    } else {
      return res.status(400).json({ error: "movementType must be either 'IN' or 'OUT'" });
    }

    product.updatedAt = new Date().toISOString();

    const log: StockLog = {
      id: `stk-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantityChanged: qty,
      movementType,
      reason,
      createdBy: createdBy || 'Warehouse User',
      timestamp: new Date().toISOString(),
    };

    stockLogs.unshift(log);

    res.status(201).json({
      stockLog: log,
      updatedProduct: product,
    });
  });

  // 6. Sales Challans Endpoints
  app.get('/api/challans', (req: Request, res: Response) => {
    const { q, status } = req.query;

    let result = [...challans];

    if (q) {
      const query = String(q).toLowerCase();
      result = result.filter(
        (c) =>
          c.challanNumber.toLowerCase().includes(query) ||
          c.customerName.toLowerCase().includes(query) ||
          c.customerBusinessName.toLowerCase().includes(query)
      );
    }

    if (status && status !== 'all') {
      result = result.filter((c) => c.status === status);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ data: result, total: result.length });
  });

  app.get('/api/challans/:id', (req: Request, res: Response) => {
    const challan = challans.find((c) => c.id === req.params.id || c.challanNumber === req.params.id);
    if (!challan) {
      return res.status(404).json({ error: 'Sales Challan not found' });
    }
    res.json(challan);
  });

  app.post('/api/challans', (req: Request, res: Response) => {
    const { customerId, items, status = 'Draft', notes, createdBy, createdById } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and at least 1 product item are required' });
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Build Product Snapshots and validate product existence & stock if status === 'Confirmed'
    const snapshotItems: ChallanProductSnapshot[] = [];
    let totalQty = 0;
    let totalAmt = 0;

    // Check all products first
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return res.status(404).json({ error: `Product ID '${item.productId}' not found` });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({ error: `Quantity for '${prod.name}' must be greater than 0` });
      }

      // BUSINESS LOGIC: Check stock if Confirmed
      if (status === 'Confirmed' && prod.currentStock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for product '${prod.name}' (${prod.sku}). Available stock: ${prod.currentStock}, Requested quantity: ${qty}`,
        });
      }

      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : prod.unitPrice;
      const lineTotal = unitPrice * qty;

      totalQty += qty;
      totalAmt += lineTotal;

      snapshotItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unitPrice,
        quantity: qty,
        lineTotal,
      });
    }

    // Generate Challan Number
    const challanSeq = challans.length + 1;
    const challanNumber = `CHAL-2026-${String(challanSeq).padStart(4, '0')}`;

    const newChallan: SalesChallan = {
      id: `chl-${Date.now()}`,
      challanNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerBusinessName: customer.businessName,
      customerGst: customer.gstNumber,
      customerAddress: customer.address,
      products: snapshotItems,
      totalQuantity: totalQty,
      totalAmount: totalAmt,
      status: status === 'Confirmed' ? 'Confirmed' : 'Draft',
      createdBy: createdBy || 'Sales User',
      createdById: createdById || 'usr-sales',
      createdAt: new Date().toISOString(),
      notes: notes || '',
    };

    if (newChallan.status === 'Confirmed') {
      newChallan.confirmedAt = new Date().toISOString();
      newChallan.confirmedBy = createdBy || 'Sales User';

      // Perform stock deduction and record stock movement log
      for (const snapshot of snapshotItems) {
        const prod = products.find((p) => p.id === snapshot.productId);
        if (prod) {
          prod.currentStock -= snapshot.quantity;
          prod.updatedAt = new Date().toISOString();

          stockLogs.unshift({
            id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            quantityChanged: snapshot.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${newChallan.challanNumber} dispatch`,
            createdBy: createdBy || 'Sales User',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    challans.unshift(newChallan);

    res.status(201).json(newChallan);
  });

  app.put('/api/challans/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, updatedBy } = req.body;

    if (!['Draft', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Allowed values: 'Draft', 'Confirmed', 'Cancelled'" });
    }

    const challan = challans.find((c) => c.id === id);
    if (!challan) {
      return res.status(404).json({ error: 'Sales Challan not found' });
    }

    if (challan.status === status) {
      return res.json(challan);
    }

    // If confirming a Draft challan: check stock and deduct stock!
    if (status === 'Confirmed' && challan.status === 'Draft') {
      // Check stock first
      for (const item of challan.products) {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) {
          return res.status(404).json({ error: `Product '${item.productName}' no longer exists in database.` });
        }
        if (prod.currentStock < item.quantity) {
          return res.status(400).json({
            error: `Cannot confirm challan. Insufficient stock for product '${prod.name}' (${prod.sku}). Available: ${prod.currentStock}, Requested: ${item.quantity}`,
          });
        }
      }

      // Deduct stock and log
      for (const item of challan.products) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          prod.currentStock -= item.quantity;
          prod.updatedAt = new Date().toISOString();

          stockLogs.unshift({
            id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${challan.challanNumber} confirmed`,
            createdBy: updatedBy || 'Sales/Accounts User',
            timestamp: new Date().toISOString(),
          });
        }
      }

      challan.status = 'Confirmed';
      challan.confirmedAt = new Date().toISOString();
      challan.confirmedBy = updatedBy || 'Sales User';
    } else if (status === 'Cancelled' && challan.status === 'Confirmed') {
      // Return stock back if cancelled!
      for (const item of challan.products) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          prod.currentStock += item.quantity;
          prod.updatedAt = new Date().toISOString();

          stockLogs.unshift({
            id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            quantityChanged: item.quantity,
            movementType: 'IN',
            reason: `Sales Challan ${challan.challanNumber} cancellation stock restock`,
            createdBy: updatedBy || 'System',
            timestamp: new Date().toISOString(),
          });
        }
      }
      challan.status = 'Cancelled';
      challan.cancelledAt = new Date().toISOString();
    } else {
      challan.status = status;
    }

    res.json(challan);
  });

  // 7. Downloadable Postman Collection Exporter
  app.get('/api/docs/postman', (req: Request, res: Response) => {
    const postmanCollection = {
      info: {
        name: 'OmniFlow Mini ERP & CRM API Collection',
        description: 'Complete REST API endpoints for Wholesale ERP/CRM Portal assignment.',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [
        {
          name: 'Auth - Login',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ email: 'sales@omniflow.com', role: 'Sales' }, null, 2),
            },
            url: { raw: '{{baseUrl}}/api/auth/login' },
          },
        },
        {
          name: 'Customers - List All',
          request: {
            method: 'GET',
            url: { raw: '{{baseUrl}}/api/customers?status=Active' },
          },
        },
        {
          name: 'Customers - Create New',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  name: 'Rohit Sharma',
                  mobile: '+91 99887 76655',
                  email: 'rohit@sharmatraders.in',
                  businessName: 'Sharma Wholesale Market',
                  gstNumber: '27AAAAA0000A1Z5',
                  customerType: 'Wholesale',
                  address: 'Shop 12, Grain Market, Pune 411002',
                  status: 'Lead',
                  notes: 'Inquired about electrical wiring bulk rates.',
                },
                null,
                2
              ),
            },
            url: { raw: '{{baseUrl}}/api/customers' },
          },
        },
        {
          name: 'Products - List Inventory',
          request: {
            method: 'GET',
            url: { raw: '{{baseUrl}}/api/products?lowStock=false' },
          },
        },
        {
          name: 'Products - Add New Product',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  name: 'Digital Surge Protector 240V',
                  sku: 'SURGE-240V-PRO',
                  category: 'Circuit Protection',
                  unitPrice: 1250,
                  currentStock: 50,
                  minStockAlert: 10,
                  location: 'Warehouse A - Bin 04',
                },
                null,
                2
              ),
            },
            url: { raw: '{{baseUrl}}/api/products' },
          },
        },
        {
          name: 'Sales Challans - Create Confirmed Order (Auto Stock Deduction)',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  customerId: 'cust-2',
                  items: [{ productId: 'prod-1', quantity: 2, unitPrice: 3200 }],
                  status: 'Confirmed',
                  createdBy: 'Alex Vance (Sales)',
                  notes: 'Direct warehouse dispatch.',
                },
                null,
                2
              ),
            },
            url: { raw: '{{baseUrl}}/api/challans' },
          },
        },
      ],
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="omniflow-erp-postman-collection.json"');
    res.send(JSON.stringify(postmanCollection, null, 2));
  });

  // --- VITE DEVELOPMENT OR PRODUCTION SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniFlow Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
