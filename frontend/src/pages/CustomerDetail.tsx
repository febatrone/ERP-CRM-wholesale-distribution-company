import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { History, Calendar, CheckSquare, Save } from "lucide-react";

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [cRes, fRes] = await Promise.all([
        API.get(`/customers/${id}`),
        API.get(`/customers/${id}/followups`)
      ]);
      setCustomer(cRes.data.customer);
      setFollowups(fRes.data.followUps);
      if (cRes.data.customer.followUpDate) {
        setNewFollowUpDate(new Date(cRes.data.customer.followUpDate).toISOString().slice(0, 10));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await API.post(`/customers/${id}/followups`, { notes: newNote.trim() });
      setNewNote("");
      fetchCustomerData();
    } catch (err) {
      alert("Failed to save followup note");
    }
  };

  const handleUpdateFollowUpDate = async () => {
    try {
      const datePayload = newFollowUpDate ? new Date(newFollowUpDate).toISOString() : null;
      await API.put(`/customers/${id}`, {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        businessName: customer.businessName,
        type: customer.type,
        address: customer.address,
        followUpDate: datePayload
      });
      alert("Schedule updated successfully");
      fetchCustomerData();
    } catch (err) {
      alert("Failed to update schedule");
    }
  };

  if (loading) {
    return <DashboardLayout><div>Loading details...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>CRM: {customer.businessName}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Profile Card */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Company Profile</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div><strong>Business Contact:</strong> {customer.name}</div>
              <div><strong>Mobile:</strong> {customer.mobile}</div>
              <div><strong>Email:</strong> {customer.email}</div>
              <div><strong>GST No:</strong> {customer.gstNumber || "N/A"}</div>
              <div><strong>Type:</strong> <span className="role-badge">{customer.type}</span></div>
              <div><strong>Status:</strong> <span className="role-badge">{customer.status}</span></div>
              <div><strong>Address:</strong><p style={{ marginTop: "0.25rem", color: "#475569" }}>{customer.address}</p></div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Next Scheduled Follow-Up</h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input 
                type="date" 
                className="form-control" 
                value={newFollowUpDate} 
                onChange={(e) => setNewFollowUpDate(e.target.value)} 
              />
              <button className="btn btn-primary" onClick={handleUpdateFollowUpDate}>
                <Save size={18} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Followup logs */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Add Follow-Up Update</h3>
            <form onSubmit={handleAddFollowup}>
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  placeholder="Record summary of conversation..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Add Note</button>
            </form>
          </div>

          <div className="card" style={{ padding: "1.5rem 0" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, padding: "0 1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <History size={18} />
              <span>Communication History</span>
            </h3>
            {followups.length === 0 ? (
              <div style={{ padding: "1rem 1.5rem", color: "#64748b" }}>No historical followups.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", maxHeight: "400px", overflowY: "auto" }}>
                {followups.map((f) => (
                  <div key={f.id} style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>
                      <span><strong>Logged By:</strong> {f.createdBy}</span>
                      <span>{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#0f172a" }}>{f.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
