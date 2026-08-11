# Mini ERP + CRM Operations Portal

A modular monolith wholesale/distribution management portal built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and React.

## System Features
*   **Authentication & Security:** JWT tokens with dynamic role-based access control (RBAC) guards guarding routes for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
*   **CRM Customers Management:** Customer profiling (status stages, business contacts, and GST attributes) with append-only followups timeline history.
*   **Products Catalog:** Inventory tracking with low-stock warnings, automatic stock ledger logs, and warehouse locations.
*   **Sales Challan Workflow:** Create Draft/Confirmed challans. Enforces atomic transaction rollbacks (via database transaction locks) during confirmation to guarantee stock sufficiency and snapshot line item pricing history.
*   **Invoice PDF Generation:** Exporter compiles Confirmed challans into structured invoices containing tax computations (18% default GST) and initiates downloads.
*   **Uploads Module:** Secure integrations generating presigned AWS S3 URLs for asset storage.

---

## Local Setup

### Prerequisites
*   Node.js v18+
*   PostgreSQL running locally (or Docker Desktop)

### 1. Database Setup
Ensure PostgreSQL is active. Update the `backend/.env` configuration:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/mini_erp?schema=public"
JWT_SECRET="your_secret_key"
```

Configure structure and seed defaults:
```bash
cd backend
npm install
npx prisma db push
npx tsc prisma/seed.ts --module commonjs --ignoreConfig --outDir dist-seed
node dist-seed/seed.js
```

Seeded credentials (Password: `Password123`):
*   **Admin:** `admin@company.com`
*   **Sales:** `sales@company.com`
*   **Warehouse:** `warehouse@company.com`
*   **Accounts:** `accounts@company.com`

### 2. Startup Servers

**Backend API:**
```bash
cd backend
npm run dev
```
Runs at `http://localhost:5000`

**Frontend Client:**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

---

## Docker Setup
Launch the entire services stack (Postgres Database, Express API, and Nginx client) locally:
```bash
docker-compose up --build -d
```
