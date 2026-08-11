import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AlertCircle, TrendingUp, Users, Package, FileText } from "lucide-react";

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    customers: 0,
    products: 0,
    challans: 0,
    lowStock: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const [cRes, pRes, chRes] = await Promise.all([
          API.get("/customers?limit=1"),
          API.get("/products?limit=100"),
          API.get("/challans?limit=1")
        ]);

        const allProducts = pRes.data.data || [];
        const lowStockList = allProducts.filter((p: any) => p.currentStock < p.minStockQty);

        setMetrics({
          customers: cRes.data.pagination?.total || 0,
          products: allProducts.length,
          challans: chRes.data.pagination?.total || 0,
          lowStock: lowStockList
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return <DashboardLayout><div>Loading overview metrics...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1.5rem" }}>System Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", margin: 0 }}>
          <div style={{ backgroundColor: "#eff6ff", padding: "1rem", borderRadius: "100px", color: "var(--color-primary)" }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>Active Customers</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{metrics.customers}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", margin: 0 }}>
          <div style={{ backgroundColor: "#f0fdf4", padding: "1rem", borderRadius: "100px", color: "var(--color-accent)" }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>Products Catalog</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{metrics.products}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", margin: 0 }}>
          <div style={{ backgroundColor: "#faf5ff", padding: "1rem", borderRadius: "100px", color: "#a855f7" }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>Sales Challans</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{metrics.challans}</div>
          </div>
        </div>

      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <AlertCircle size={20} color="var(--color-warning)" />
        <span>Inventory Low Stock Alerts</span>
      </h2>
      
      <div className="card" style={{ padding: 0 }}>
        {metrics.lowStock.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>All products have sufficient stock levels.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Warehouse Location</th>
                  <th>Current Stock</th>
                  <th>Min Alert Qty</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lowStock.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                    <td>{prod.sku}</td>
                    <td>{prod.location}</td>
                    <td style={{ color: "var(--color-destructive)", fontWeight: 700 }}>{prod.currentStock}</td>
                    <td>{prod.minStockQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
