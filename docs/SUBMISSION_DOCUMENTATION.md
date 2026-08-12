# Insight Scope — Submission Documentation

This document serves as the official submission package for **Insight Scope (Enterprise ERP & CRM Operations Portal)**. It includes all required live URLs, credentials, setup processes, environment configuration, deployment steps, and architectural assumptions.

---

## 🔗 Project Links & Resources

*   **Live App (Frontend URL):** [https://insightscope.febatrone.com/](https://insightscope.febatrone.com/)
*   **Live API (Backend URL):** [https://insight-scope-backend.onrender.com](https://insight-scope-backend.onrender.com)
*   **GitHub Repository Link:** [https://github.com/febatrone/ERP-CRM-wholesale-distribution-company](https://github.com/febatrone/ERP-CRM-wholesale-distribution-company)
*   **Postman Collection Download:** [https://insight-scope-backend.onrender.com/api/docs/postman](https://insight-scope-backend.onrender.com/api/docs/postman)
*   **Interactive API Documentation:** Accessible directly inside the client UI via the **API Documentation** tab on the navigation menu.

---

## 🔑 Test Login Credentials for All Roles

All operational roles are pre-seeded in the live production database with specific permissions:

| Role | Test Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@insightscope.com` | `Admin@12345` | Complete system access (Audit logs, configurations, user management, and DB seed control). |
| **Sales Rep** | `sales@insightscope.com` | `Sales@12345` | CRM client management, follow-ups timeline logs, and sales order (challan) creation. |
| **Warehouse Manager** | `warehouse@insightscope.com` | `Warehouse@12345` | Inventory catalogue, low-stock warnings, and manual stock adjustment (IN/OUT) ledger logging. |
| **Accountant** | `accounts@insightscope.com` | `Accounts@12345` | Auditing history logs, financial aggregates, draft-to-confirmed order invoice generation. |

---

## 🛠️ How the Server was Set Up

The backend is built as a RESTful API server using a **Node.js, Express, and TypeScript** stack, backed by a relational **PostgreSQL** database managed via **Prisma ORM**.

### Setup Stages:
1.  **Structure Initialization:** Initialized with npm and configured with TypeScript compiler options (`tsconfig.json`) to compile code from `src/` to output directory `dist/`.
2.  **Database Connection Routing:** Integrated Prisma ORM (`prisma/schema.prisma`) defining relational tables (Users, Customers, CustomerFollowUps, Products, StockMovements, Challans, ChallanItems, Invoices) with schema constraints and cascade delete indexes.
3.  **Middlewares & Security:** Added Express JSON parser, CORS options, and custom global error handling middlewares. JWT authentication middleware decrypts Bearer tokens and appends verified user payloads to requests.
4.  **Route Modularization:** Mapped module controllers for users, products, customers, challans, stock logs, invoices, and analytics dashboards to clean `/api/...` endpoints.

---

## 🔑 How Environment Variables are Managed

Environment variables are managed dynamically through `.env` files parsed at runtime using the `dotenv` library.

### Variables Configuration:

#### Backend Server (`backend/.env`):
*   `DATABASE_URL`: Connection string containing username, password, host, and database name. Used by Prisma Client for query routing.
*   `JWT_SECRET`: High-entropy key used to sign and verify web token payloads.
*   `PORT`: Identifies the system port the Express app listens to (defaults to `5000`).

#### Frontend Client (`frontend/.env`):
*   `VITE_API_URL`: Points the Axios instance to the live Express server API endpoint (`https://insight-scope-backend.onrender.com/api` or `http://localhost:5000/api`).

---

## 💻 How to Run the Project Locally

### 1. Database Migrations & Seeding
Ensure a local PostgreSQL instance is running.
Configure `backend/.env` with your local database URL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_erp?schema=public"
JWT_SECRET="local_development_jwt_secret_key"
```

Set up schemas and seed data:
```bash
cd backend
npm install
npx prisma db push
npx tsc prisma/seed.ts --module commonjs --ignoreConfig --outDir dist-seed
node dist-seed/seed.js
```

### 2. Start Backend Server
```bash
npm run dev
```
Runs locally at `http://localhost:5000`.

### 3. Start Frontend Client
Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Run development server:
```bash
cd ../frontend
npm install
npm run dev
```
Runs locally at `http://localhost:5173`.

---

## 🚀 How to Deploy the Project

### 1. Backend Server (Render Deployment)
1.  Create a Web Service on Render linked to your repository.
2.  Set Environment Variables: `DATABASE_URL` (pointing to your live cloud PostgreSQL instance) and `JWT_SECRET`.
3.  Set Build Command: `npm install && npm run build` (runs `tsc`).
4.  Set Start Command: `npm run start` (runs `node dist/server.js`).

### 2. Frontend Client (Netlify Deployment)
1.  Configure custom domain pointing to Netlify.
2.  Set Build Command: `npm run build` (compiles production asset files).
3.  Set Publish Directory: `dist`.
4.  Set Environment Variable: `VITE_API_URL=https://insight-scope-backend.onrender.com/api`.
5.  Configure redirection rule in `public/_redirects` to handle client-side SPA routing routes:
    `/*  /index.html  200`

---

## 💡 Assumptions Made

1.  **JWT Tokens Validity:** Token verification validates role permission configurations on write operations client-side, but is always strictly checked server-side via middleware guards.
2.  **GST Computations:** Sales invoices assume a standard default GST rate of 18% applied directly to subtotal amounts.
3.  **Local Storage Security:** Session tokens are stored in the client browser's `localStorage` for automatic logins, assuming the client device is secure.
4.  **Transaction Locks:** Stock adjustments during challan confirmations are executed inside database transaction blocks (`prisma.$transaction`) to prevent concurrent race conditions.
