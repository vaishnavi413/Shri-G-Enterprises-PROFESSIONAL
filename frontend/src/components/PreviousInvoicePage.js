import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./PreviousInvoicePage.css"; 

function PreviousInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("https://shri-g-enterprises-professional.onrender.com/api/invoices"); 
        setInvoices(res.data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };
    fetchInvoices();
  }, []);

  const handleView = (id) => {
    navigate(`/invoice/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${id}`);
        setInvoices(invoices.filter((inv) => inv._id !== id));
        alert("Invoice deleted successfully");
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to delete invoice.");
      }
    }
  };

  return (
    <div className="previous-invoice-page" style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#2c3e50" }}>📜 Previous Invoices</h2>
        <button onClick={() => navigate("/")} style={{ padding: "10px 20px", background: "#34495e", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>➕ Create New Invoice</button>
      </div>

      <table className="invoice-table" style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
            <th style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>No.</th>
            <th style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>Customer Name</th>
            <th style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>Invoice Date</th>
            <th style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>Grand Total</th>
            <th style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <tr key={inv._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px" }}>{inv.invoiceNo}</td>
                <td style={{ padding: "15px" }}>{inv.customerName}</td>
                <td style={{ padding: "15px" }}>{new Date(inv.invoiceDate).toLocaleDateString("en-GB")}</td>
                <td style={{ padding: "15px", fontWeight: "bold" }}>₹{(inv.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: "15px", display: "flex", gap: "10px" }}>
                  <button
                    className="view-btn"
                    onClick={() => handleView(inv._id)}
                    style={{ padding: "8px 15px", background: "#3498db", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                  >
                    👁️ View
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(inv._id)}
                    style={{ padding: "8px 15px", background: "#e74c3c", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                No invoices found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PreviousInvoicePage;

