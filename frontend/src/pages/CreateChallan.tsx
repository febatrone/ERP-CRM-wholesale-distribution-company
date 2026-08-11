import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Trash, Plus, ArrowLeft } from "lucide-react";

export const CreateChallan: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState<any[]>([{ productId: "", quantity: 1 }]);
  const [isDraft, setIsDraft] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          API.get("/customers?limit=100"),
          API.get("/products?limit=100")
        ]);
        setCustomers(cRes.data.data || []);
        setProducts(pRes.data.data || []);
      } catch (err) {
        console.error("Failed to load dependency data", err);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Please select a customer.");
      return;
    }

    // Filter out invalid items
    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    try {
      await API.post("/challans", {
        customerId: selectedCustomerId,
        status: isDraft ? "DRAFT" : "CONFIRMED",
        items: validItems.map((it) => ({
          productId: it.productId,
          quantity: Number(it.quantity)
        }))
      });
      navigate("/challans");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create sales challan.");
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/challans")} style={{ padding: "0.5rem" }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Create Sales Challan</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Header Information</h3>
          <div className="form-group" style={{ maxWidth: "400px" }}>
            <label className="form-label">Select Customer</label>
            <select
              className="form-control"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Line Items</h3>
          
          {items.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "1rem" }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Product</label>
                <select
                  className="form-control"
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) - Price: ${Number(p.unitPrice).toFixed(2)} - Stock: {p.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ width: "120px", margin: 0 }}>
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                  required
                />
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  className="btn btn-destructive"
                  style={{ padding: "0.75rem" }}
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: "1rem" }}
            onClick={handleAddItem}
          >
            <Plus size={18} />
            <span>Add Row</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/challans")}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-secondary"
            onClick={() => setIsDraft(true)}
          >
            Save as Draft
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            onClick={() => setIsDraft(false)}
          >
            Create & Confirm
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};
