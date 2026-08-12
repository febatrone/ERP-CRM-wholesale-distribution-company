# 📊 Insight Scope — Enterprise ERP & CRM Operations Portal

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A professional, responsive **Modular Monolith Enterprise Resource Planning (ERP) & Customer Relationship Management (CRM)** suite. Designed for wholesale distribution operations, Insight Scope features robust role-based access control, transaction safety, real-time inventory tracking, and dynamic executive dashboards.

---

## 🔗 Project Links

*   **Live App:** [https://insightscope.febatrone.com/](https://insightscope.febatrone.com/)
*   **Live Backend API:** [https://insight-scope-backend.onrender.com](https://insight-scope-backend.onrender.com)
*   **GitHub Repository:** [https://github.com/febatrone/ERP-CRM-wholesale-distribution-company](https://github.com/febatrone/ERP-CRM-wholesale-distribution-company)

---

## 🔑 Role-Based Test Credentials

The database has been seeded with dedicated test accounts for each operational role. Use the credentials below to log in:

| Operational Role | Test Email | Password | Access Control Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@insightscope.com` | `Admin@12345` | Complete system access, audit trails, configurations, database control. |
| **Sales Rep** | `sales@insightscope.com` | `Sales@12345` | CRM pipelines, client registrations, sales order (challan) creations. |
| **Warehouse Manager** | `warehouse@insightscope.com` | `Warehouse@12345` | Inventory control, low-stock indicators, manual stock additions & log tracking. |
| **Accountant** | `accounts@insightscope.com` | `Accounts@12345` | Financial audits, confirmed order invoices, audit trail validation, reports. |

---

## 🚀 Key Features

*   **🔐 Secure Identity Management:** Role-Based Access Control (RBAC) powered by JWT tokens, ensuring that users see only the options, charts, and modules matching their permission scope.
*   **📈 Dynamic CRM Dashboard:** Executively aggregated line charts powered by Recharts that support 11 timeline preset filters (Today, Yesterday, Last 7/30 Days, Last 12 Months, Custom Date Range, and All Time) with dynamic daily/weekly/monthly grouping.
*   **💼 Smart Customer Management:** Standardized customer records with a mobile country code selection dropdown, address-to-city dynamic extraction, and append-only timeline logs.
*   **📦 Stock ledger & warn indicators:** Product inventory database tracking item locations, dynamic warning indicators when stock falls below set minimum thresholds, and manual ledger adjustments.
*   **🧾 Atomic Sales Challan Workflows:** Supports Draft / Confirmed sales order workflows with transactional database locks. Order confirmation locks stock quantities and captures pricing snapshots.
*   **📱 Mobile slide-over navigation:** Responsive sidebar navigation menu that automatically converts into a slide-over panel on mobile and tablet screens.

---

## 🛠️ Technology Stack

*   **Frontend Client:** React (TypeScript), Vite, Tailwind CSS, Recharts, Lucide React, HTML2Canvas.
*   **Backend Server:** Node.js, Express, TypeScript, Zod Schema Validations, JWT Middleware.
*   **Database:** PostgreSQL (managed through Prisma ORM with relational integrity).

---

## 💻 Local Setup & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) v18+
*   PostgreSQL instance running locally (or Docker Desktop)

### 1. Database Setup
Create a PostgreSQL database (e.g. `mini_erp`). Configure your `backend/.env` environment settings:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_erp?schema=public"
JWT_SECRET="your_secure_jwt_token_secret_key"
```

Create schema structures and seed initial user credentials:
```bash
cd backend
npm install
npx prisma db push
npx tsc prisma/seed.ts --module commonjs --ignoreConfig --outDir dist-seed
node dist-seed/seed.js
```

### 2. Run Backend Server
```bash
npm run dev
```
The API server will run at `http://localhost:5000`. You can inspect endpoints via `http://localhost:5000/api-docs`.

### 3. Run Frontend Client
Configure the `.env` settings inside the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
cd ../frontend
npm install
npm run dev
```
The client app will launch at `http://localhost:5173`.

---

## 🐳 Docker Stack Deployment

Launch the entire system locally (including PostgreSQL, Express API server, and Nginx client proxying) with a single command:
```bash
docker-compose up --build -d
```

---

## 🛡️ Security Audit & Transaction Safety
All write transactions (such as confirming sales challans and adjusting inventory logs) are executed inside isolated database transaction blocks (`prisma.$transaction`). This prevents concurrent race conditions and ensures that stock movements cannot result in negative stock balances.
