import React, { useEffect, useState } from "react";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Plus, Sliders, History, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [minStockQty, setMinStockQty] = useState(10);
  const [location, setLocation] = useState("");

  // Adjustment fields
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState("IN");
  const [adjustReason, setAdjustReason] = useState("");

  const { user } = useAuth();
  const canModify = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products?page=${page}&search=${search}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/products", {
        name,
        sku,
        category,
        unitPrice: Number(unitPrice),
        currentStock: Number(currentStock),
        minStockQty: Number(minStockQty),
        location
      });
      setShowModal(false);
      fetchProducts();
      // Reset
      setName("");
      setSku("");
      setCategory("");
      setUnitPrice(0);
      setCurrentStock(0);
      setMinStockQty(10);
      setLocation("");
    } catch (err) {
      alert("Failed to create product record.");
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post(`/products/${selectedProduct.id}/stock`, {
        quantity: Number(adjustQty),
        type: adjustType,
        reason: adjustReason
      });
      setShowAdjustModal(false);
      fetchProducts();
      setAdjustQty(1);
      setAdjustReason("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Adjustment failed");
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Products Catalog</h1>
        {canModify && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>New Product</span>
          </button>
        )}
      </div>

      <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search catalog by product name or SKU..."
          className="form-control"
          style={{ border: "none", padding: 0 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading product catalog...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No catalog items found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Levels</th>
                  <th>Location</th>
                  {canModify && <th>Stock Operations</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.currentStock < p.minStockQty;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>${Number(p.unitPrice).toFixed(2)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: isLow ? "var(--color-destructive)" : "var(--color-foreground)"
                        }}>{p.currentStock}</span>
                        {isLow && <span className="role-badge" style={{ backgroundColor: "#fef2f2", color: "var(--color-destructive)", marginLeft: "0.5rem" }}>LOW</span>}
                      </td>
                      <td>{p.location}</td>
                      {canModify && (
                        <td>
                          <button className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.825rem" }} onClick={() => { setSelectedProduct(p); setShowAdjustModal(true); }}>
                            <Sliders size={14} />
                            <span>Adjust</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Add Product to Catalog</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-control" value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Unit Price ($)</label>
                  <input type="number" step="0.01" className="form-control" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input type="number" className="form-control" value={currentStock} onChange={(e) => setCurrentStock(Number(e.target.value))} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Min Alert Stock Qty</label>
                  <input type="number" className="form-control" value={minStockQty} onChange={(e) => setMinStockQty(Number(e.target.value))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Warehouse Location</label>
                  <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdjustModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Manual Stock: {selectedProduct?.name}</h3>
            <form onSubmit={handleAdjustStock}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" className="form-control" min={1} value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Operation Type</label>
                <select className="form-control" value={adjustType} onChange={(e) => setAdjustType(e.target.value)}>
                  <option value="IN">IN (Restock / Add)</option>
                  <option value="OUT">OUT (Correction / Subtract)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input type="text" className="form-control" placeholder="e.g. Correction audit, damage scrap" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} required />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
