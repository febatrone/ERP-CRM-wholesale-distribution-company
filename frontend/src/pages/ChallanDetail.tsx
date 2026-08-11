import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ArrowLeft, Check, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { generateInvoicePDF } from "../utils/pdfGenerator";

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const canModify = user?.role === "ADMIN" || user?.role === "SALES";
  const canInvoice = user?.role === "ADMIN" || user?.role === "ACCOUNTS";

  const fetchChallan = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/challans/${id}`);
      setChallan(res.data.challan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    try {
      await API.post(`/challans/${id}/confirm`);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || "Confirmation failed");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this challan? This action restores stock.")) return;
    try {
      await API.post(`/challans/${id}/cancel`);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  if (loading) {
    return <DashboardLayout><div>Loading details...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/challans")} style={{ padding: "0.5rem" }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Challan: {challan.challanNumber}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        
        {/* Main Details and Items */}
        <div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>SKU (Snapshot)</th>
                    <th>Price (Snapshot)</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {challan.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.productNameSnapshot}</td>
                      <td>{item.skuSnapshot}</td>
                      <td>${Number(item.unitPriceSnapshot).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Status Info & Actions */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Metadata Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div><strong>Business client:</strong> {challan.customer?.businessName}</div>
              <div><strong>Contact Name:</strong> {challan.customer?.name}</div>
              <div><strong>Status state:</strong> <span className="role-badge">{challan.status}</span></div>
              <div><strong>Created Date:</strong> {new Date(challan.createdAt).toLocaleString()}</div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {challan.status === "DRAFT" && canModify && (
                <>
                  <button className="btn btn-primary" onClick={handleConfirm} style={{ width: "100%" }}>
                    <Check size={18} />
                    <span>Confirm Challan</span>
                  </button>
                  <button className="btn btn-destructive" onClick={handleCancel} style={{ width: "100%" }}>
                    <AlertTriangle size={18} />
                    <span>Cancel Challan</span>
                  </button>
                </>
              )}

              {challan.status === "CONFIRMED" && (
                <>
                  {canInvoice && (
                    <button className="btn btn-primary" onClick={() => generateInvoicePDF(challan)} style={{ width: "100%", backgroundColor: "var(--color-success)" }}>
                      <FileText size={18} />
                      <span>Export Invoice PDF</span>
                    </button>
                  )}
                  {canModify && (
                    <button className="btn btn-destructive" onClick={handleCancel} style={{ width: "100%" }}>
                      <AlertTriangle size={18} />
                      <span>Cancel & Return Stock</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
