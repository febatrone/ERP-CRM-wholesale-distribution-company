import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Search, Plus } from "lucide-react";

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [type, setType] = useState("RETAIL");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("LEAD");
  const [notes, setNotes] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/customers?page=${page}&search=${search}`);
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/customers", {
        name,
        mobile,
        email,
        businessName,
        gstNumber: gstNumber || null,
        type,
        address,
        status,
        notes
      });
      setShowModal(false);
      fetchCustomers();
      // Reset
      setName("");
      setMobile("");
      setEmail("");
      setBusinessName("");
      setGstNumber("");
      setAddress("");
      setNotes("");
    } catch (err) {
      alert("Failed to create customer record.");
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>CRM Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem", marginBottom: "1rem" }}>
        <Search size={20} color="#64748b" />
        <input
          type="text"
          placeholder="Search by name, business name, or email..."
          className="form-control"
          style={{ border: "none", padding: 0 }}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading customer records...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>No customer records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.businessName}</td>
                    <td><span className="role-badge">{c.type}</span></td>
                    <td>{c.email}</td>
                    <td>{c.mobile}</td>
                    <td>
                      <span className="role-badge" style={{
                        backgroundColor: c.status === "ACTIVE" ? "#ecfdf5" : c.status === "LEAD" ? "#fffbeb" : "#fef2f2",
                        color: c.status === "ACTIVE" ? "var(--color-accent)" : c.status === "LEAD" ? "var(--color-warning)" : "var(--color-destructive)"
                      }}>{c.status}</span>
                    </td>
                    <td>
                      <Link to={`/customers/${c.id}`} className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>
                        View Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div className="card" style={{ width: "100%", maxWidth: "600px", maxMHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Add New Customer</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Contact Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="text" className="form-control" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input type="text" className="form-control" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">GST Number (Optional)</label>
                  <input type="text" className="form-control" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Billing Address</label>
                <textarea className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} required rows={2}></textarea>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Notes</label>
                <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
