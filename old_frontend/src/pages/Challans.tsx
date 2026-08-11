import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Plus, Eye } from "lucide-react";

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/challans?page=${page}`);
      setChallans(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page]);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Sales Challans</h1>
        <Link to="/challans/create" className="btn btn-primary">
          <Plus size={18} />
          <span>New Challan</span>
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading sales challans...</div>
        ) : challans.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No sales challans recorded.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Customer Name</th>
                  <th>Business Name</th>
                  <th>Quantity Total</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((ch) => (
                  <tr key={ch.id}>
                    <td style={{ fontWeight: 700 }}>{ch.challanNumber}</td>
                    <td>{ch.customer?.name}</td>
                    <td>{ch.customer?.businessName}</td>
                    <td>{ch.totalQuantity} items</td>
                    <td>
                      <span className="role-badge" style={{
                        backgroundColor: ch.status === "CONFIRMED" ? "#ecfdf5" : ch.status === "DRAFT" ? "#fffbeb" : "#fef2f2",
                        color: ch.status === "CONFIRMED" ? "var(--color-accent)" : ch.status === "DRAFT" ? "var(--color-warning)" : "var(--color-destructive)"
                      }}>{ch.status}</span>
                    </td>
                    <td>{new Date(ch.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/challans/${ch.id}`} className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>
                        <Eye size={14} />
                        <span>View</span>
                      </Link>
                    </td>
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
