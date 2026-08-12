import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve Postman collection file download
app.get("/api/docs/postman", (req, res) => {
  const possiblePaths = [
    path.join(__dirname, "../../docs/postman_collection.json"),
    path.join(__dirname, "../../../docs/postman_collection.json"),
    path.join(process.cwd(), "docs/postman_collection.json"),
    path.join(process.cwd(), "../docs/postman_collection.json"),
  ];

  let resolvedPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      resolvedPath = p;
      break;
    }
  }

  if (resolvedPath) {
    res.download(resolvedPath, "insightscope_postman_collection.json");
  } else {
    res.status(404).json({ error: "Postman collection file not found" });
  }
});

// Routes Modules imports
import authRouter from "./modules/auth/auth.controller";
import customerRouter from "./modules/customers/customers.controller";
import productRouter from "./modules/products/products.controller";
import challanRouter from "./modules/challans/challans.controller";
import invoiceRouter from "./modules/invoices/invoices.controller";
import uploadRouter from "./modules/uploads/uploads.controller";
import stockLogsRouter from "./modules/stock-logs/stock-logs.controller";
import dashboardRouter from "./modules/dashboard/dashboard.controller";
import usersRouter from "./modules/users/users.controller";

// API Endpoints Mapping
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/products", productRouter);
app.use("/api/challans", challanRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/stock-logs", stockLogsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", usersRouter);

// Root welcome/info route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Mini ERP + CRM Backend API Portal",
    status: "healthy",
    frontendUrl: "http://localhost:5173",
    healthCheck: "/health"
  });
});

// Health check status route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
