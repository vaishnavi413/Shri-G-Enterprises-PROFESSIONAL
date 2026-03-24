import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate, Link } from "react-router-dom";
import "./InvoiceForm.css";
import logo from "../assets/logo.jpeg";

const BACKEND_URL = "https://shri-g-enterprises-professional.onrender.com";

function InvoiceForm() {
  const invoiceRef = useRef(null);
  const navigate = useNavigate();

  // --- Invoice state ---
  const [invoice, setInvoice] = useState({
    customerName: "",
    address: "",
    invoiceNo: "",
    invoiceDate: "",
    poNo: "",
    poDate: "",
    items: [
      {
        description: "",
        hsn: "",
        qty: "",
        rate: "",
        amount: 0,
      },
    ],
    notes: ["Thank you for your business!", ""],
  });

  const [gstRate, setGstRate] = useState(18);

  useEffect(() => {
    fetchNextInvoice();
  }, []);

  const fetchNextInvoice = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/invoices/next-number`);
      setInvoice(prev => ({
        ...prev,
        invoiceNo: res.data.nextInvoiceNo || "0001"
      }));
    } catch (err) {
      console.error("Error fetching next invoice number:", err);
    }
  };

  const handleItemChange = (index, e) => {
    const newItems = [...invoice.items];
    newItems[index][e.target.name] = e.target.value;
    const qty = parseFloat(newItems[index].qty) || 0;
    const rate = parseFloat(newItems[index].rate) || 0;
    newItems[index].amount = qty * rate;
    setInvoice({ ...invoice, items: newItems });
  };

  const addRow = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { description: "", hsn: "", qty: "", rate: "", amount: 0 },
      ],
    });
  };

  const total = invoice.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const cgst = total * (gstRate / 2 / 100);
  const sgst = total * (gstRate / 2 / 100);
  const grandTotal = total + cgst + sgst;

  const numberToWords = (num) => {
    if (isNaN(num)) return "";
    if (num === 0) return "Rupees Zero Only";
    const [rupeesPart, paisePart] = num.toFixed(2).split(".");
    const rupees = parseInt(rupeesPart);
    const paise = parseInt(paisePart);
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function convertNumber(n) {
      if (n === 0) return "";
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertNumber(n % 100) : "");
      if (n < 100000) return convertNumber(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convertNumber(n % 1000) : "");
      if (n < 10000000) return convertNumber(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convertNumber(n % 100000) : "");
      return convertNumber(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convertNumber(n % 10000000) : "");
    }
    let words = "Rupees " + convertNumber(rupees);
    if (paise > 0) words += " and " + convertNumber(paise) + " Paise";
    return words + " Only";
  };

  const handleSaveInvoice = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/invoices/save`, {
        ...invoice,
        total,
        cgst,
        sgst,
        grandTotal,
        gstRate
      });
      alert("Invoice saved successfully!");
      navigate(`/invoice/${res.data.invoice._id}`);
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Error saving invoice!");
    }
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    html2canvas(invoiceRef.current, {
      scale: 3,
      useCORS: true,
      ignoreElements: (el) => el.classList.contains("no-print")
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const imgWidth = 595;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoice.invoiceNo}.pdf`);
    });
  };


  const removeItem = (index) => {
    if (invoice.items.length === 1) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  return (
    <div style={{ padding: "10px", background: "#f8f9fa", minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      {/* --- Invoice Controls Section --- */}
      <div className="no-print controls-wrapper" style={{ 
        width: "850px", 
        margin: "10px auto 20px auto", 
        background: "#fff", 
        padding: "20px", 
        borderRadius: "8px", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        border: "1px solid #e0e0e0"
      }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "bold" }}>
          Invoice <span style={{ borderBottom: "3px solid #f39c12", paddingBottom: "2px" }}>Controls</span>
        </h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSaveInvoice} style={{ background: "#f1c40f", color: "black", padding: "8px 20px", borderRadius: "5px", border: "none", fontWeight: "700", cursor: "pointer" }}>
            Save & Sync
          </button>
          <button onClick={() => navigate("/previous-invoices/all")} style={{ background: "#fff", color: "#333", padding: "8px 20px", borderRadius: "5px", border: "1px solid #ddd", fontWeight: "700", cursor: "pointer" }}>
            View History
          </button>
          <button onClick={downloadPDF} style={{ background: "#2c3e50", color: "white", padding: "8px 20px", borderRadius: "5px", border: "none", fontWeight: "700", cursor: "pointer" }}>
            Print Invoice
          </button>
        </div>
      </div>

      {/* --- Main Invoice Form (Professional Layout) --- */}
      <div className="amazon-invoice" ref={invoiceRef} style={{ padding: "40px" }}>
        <div className="tax-invoice-label">Tax Invoice</div>

        <div className="header-top" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "30px" }}>
          <div className="logo-box" style={{ marginBottom: "15px" }}>
             <img src={logo} alt="Logo" style={{ width: "80px" }} />
          </div>
          <div className="company-brand">
            <h1>SHRI G ENTERPRISES</h1>
            <div className="details" style={{ fontSize: "11px", color: "#666", lineHeight: "1.5" }}>
              <b>GSTIN: 27AJIPG2516N1ZZ</b><br />
              S.No.371, Flat No.20, Unity Park, Somwar Peth, Narpagtiri Chowk, Pune - 411011.<br />
              <b>Mobile:</b> 9850111166 | <b>Email:</b> shrignterprises25@gmail.com
            </div>
          </div>
          <div className="original-recipient" style={{ position: "absolute", top: "40px", right: "40px", fontSize: "9px", color: "#999", textTransform: "uppercase" }}>Original for Recipient</div>
        </div>

        <div className="invoice-boxes" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "20px" }}>
           <div className="info-box" style={{ border: "1px solid #e0e0e0", padding: "10px", borderRadius: "4px" }}>
             <span style={{ fontSize: "11px", color: "#888", fontWeight: "bold" }}>Invoice :</span>
             <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
               <input type="text" value={invoice.invoiceNo} onChange={(e) => setInvoice({...invoice, invoiceNo: e.target.value})} style={{ border: "none", borderBottom: "1px solid #eee", fontSize: "13px", fontWeight: "bold", width: "100%" }} />
             </div>
           </div>
           <div className="info-box" style={{ border: "1px solid #e0e0e0", padding: "10px", borderRadius: "4px" }}>
             <span style={{ fontSize: "11px", color: "#888", fontWeight: "bold" }}>Invoice Date:</span>
             <input type="date" value={invoice.invoiceDate} min="2026-04-01" max="2027-03-31" onChange={(e) => setInvoice({...invoice, invoiceDate: e.target.value})} style={{ border: "none", display: "block", marginTop: "5px", fontSize: "13px", fontWeight: "bold", width: "100%" }} />
           </div>
           <div className="info-box" style={{ border: "1px solid #e0e0e0", padding: "10px", borderRadius: "4px" }}>
             <span style={{ fontSize: "11px", color: "#888", fontWeight: "bold" }}>P.O. No & Date:</span>
             <div style={{ display: "flex", gap: "2px", marginTop: "5px" }}>
               <input type="text" placeholder="P.O. No" value={invoice.poNo} onChange={(e) => setInvoice({...invoice, poNo: e.target.value})} style={{ border: "none", borderBottom: "1px solid #eee", fontSize: "12px", width: "60px" }} />
               <input type="date" value={invoice.poDate} min="2026-04-01" max="2027-03-31" onChange={(e) => setInvoice({...invoice, poDate: e.target.value})} style={{ border: "none", fontSize: "12px", width: "100px" }} />
             </div>
           </div>
        </div>

        <div className="address-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
           <div className="addr-section">
             <h4 style={{ fontSize: "11px", borderBottom: "1px solid #eee", paddingBottom: "3px", color: "#444" }}>Customer Details:</h4>
             <input type="text" placeholder="Full Customer Name" value={invoice.customerName} onChange={(e) => setInvoice({...invoice, customerName: e.target.value})} style={{ width: "100%", border: "none", borderBottom: "1px solid #f9f9f9", marginTop: "5px", fontSize: "13px" }} />
           </div>
           <div className="addr-section">
             <h4 style={{ fontSize: "11px", borderBottom: "1px solid #eee", paddingBottom: "3px", color: "#444" }}>Billing Address:</h4>
             <textarea placeholder="Complete Billing Address" value={invoice.address} onChange={(e) => setInvoice({...invoice, address: e.target.value})} style={{ width: "100%", border: "none", marginTop: "5px", fontSize: "12px", height: "40px", resize: "none" }} />
           </div>
        </div>

        <div className="gst-line" style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "15px" }}>
          GSTIN: <input type="text" placeholder="Customer GST" style={{ border: "none", borderBottom: "1px dashed #ccc", outline: "none", width: "200px", marginLeft: "5px", fontSize: "13px", color: "#666" }} />
        </div>

        <table className="prof-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
          <thead>
            <tr>
              <th style={{ background: "#f8f9fa", border: "1px solid #eee", padding: "10px", fontSize: "11px", textAlign: "center", width: "60px" }}>SR. NO.</th>
              <th style={{ background: "#f8f9fa", border: "1px solid #eee", padding: "10px", fontSize: "11px", textAlign: "left", width: "250px" }}>ITEM DESCRIPTION</th>
              <th style={{ background: "#f8f9fa", border: "1px solid #eee", padding: "10px", fontSize: "11px", textAlign: "left", width: "80px" }}>RATE/ITEM</th>
              <th style={{ background: "#f8f9fa", border: "1px solid #eee", padding: "10px", fontSize: "11px", textAlign: "center", width: "50px" }}>QTY</th>
              <th style={{ background: "#f8f9fa", border: "1px solid #eee", padding: "10px", fontSize: "11px", textAlign: "right", width: "100px" }}>AMOUNT</th>
              <th className="no-print" style={{ background: "#f8f9fa", border: "1px solid #eee", padding: "10px", fontSize: "11px", textAlign: "center", width: "50px" }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #eee", padding: "10px", textAlign: "center" }}>{index + 1}</td>
                <td style={{ border: "1px solid #eee", padding: "10px" }}>
                  <input type="text" name="description" placeholder="Item Name" value={item.description} onChange={(e) => handleItemChange(index, e)} style={{ width: "100%", border: "none", fontSize: "13px", fontWeight: "bold", outline: "none" }} />
                  <input type="text" name="hsn" placeholder="HSN: 8517" value={item.hsn} onChange={(e) => handleItemChange(index, e)} style={{ width: "100%", border: "none", fontSize: "10px", color: "#888", outline: "none", marginTop: "2px" }} />
                </td>
                <td style={{ border: "1px solid #eee", padding: "10px" }}>
                  <input type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} style={{ width: "100%", border: "none", fontSize: "13px", outline: "none" }} />
                </td>
                <td style={{ border: "1px solid #eee", padding: "10px" }}>
                  <input type="number" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} style={{ width: "100%", border: "none", fontSize: "13px", textAlign: "center", outline: "none" }} />
                </td>
                <td style={{ border: "1px solid #eee", padding: "10px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>
                  {item.amount.toFixed(2)}
                </td>
                <td className="no-print" style={{ border: "1px solid #eee", padding: "10px", textAlign: "center" }}>
                   <button onClick={() => removeItem(index)} style={{ background: "#fff", border: "1px solid #ddd", color: "#e74c3c", padding: "2px 6px", borderRadius: "50%", cursor: "pointer" }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="no-print" style={{ textAlign: "left", marginBottom: "20px" }}>
          <button onClick={addRow} style={{ background: "#f39c12", color: "white", padding: "5px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>+ Add Item</button>

          <div style={{ float: "right" }}>
             <label style={{ fontSize: "12px", marginRight: "10px" }}><b>Select GST Rate: </b></label>
             <select value={gstRate} onChange={(e) => setGstRate(parseFloat(e.target.value))} style={{ padding: "4px" }}>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
             </select>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>

        <div className="total-flex" style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #000", paddingTop: "15px" }}>
          <div className="words-block" style={{ width: "60%" }}>
             <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>Total Amount (in words):</div>
             <div style={{ fontWeight: "bold", fontSize: "13px" }}>{numberToWords(grandTotal)}</div>
          </div>
          <div className="totals-block" style={{ width: "35%" }}>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
               <span>Taxable Amount</span>
               <span style={{ fontWeight: "bold" }}>₹{total.toFixed(2)}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
               <span>{gstRate}% GST</span>
               <span style={{ fontWeight: "bold" }}>₹{(cgst + sgst).toFixed(2)}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800", borderTop: "2px solid #000", marginTop: "10px", paddingTop: "10px" }}>
               <span>Total</span>
               <span>₹{grandTotal.toFixed(2)}</span>
             </div>
          </div>
        </div>

        <div className="footer-grid" style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
           <div className="bank-info-box" style={{ width: "40%", fontSize: "11px", color: "#555" }}>
             <div style={{ fontWeight: "bold", color: "#000", marginBottom: "5px" }}>BANK DETAILS:</div>
             <b>Bank:</b> HDFC BANK<br />
             <b>A/C #:</b> 50200095196440 (Current)<br />
             <b>IFSC:</b> HDFC0005383<br />
             <b>Branch:</b> SOMWAR PETH
           </div>
           
           <div className="sig-box" style={{ width: "35%", textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px" }}>For SHRI G ENTERPRISES</div>
              <div style={{ marginTop: "40px", borderTop: "1px solid #000", display: "inline-block", minWidth: "150px", textAlign: "center", paddingTop: "5px", fontSize: "12px" }}>
                Authorized Signatory
              </div>
           </div>
        </div>

        <div className="terms" style={{ marginTop: "30px", fontSize: "10px", color: "#777" }}>
          <b>Notes:</b> Thank you for your Business!<br /><br />
          <b>Terms and Conditions:</b>
          <ul style={{ margin: "5px 0 0 15px", padding: 0 }}>
            <li>Goods once sold cannot be taken back or exchanged.</li>
            <li>Interest @24% p.a. will be charged for uncleared bills beyond 15 days.</li>
            <li>Subject to Pune Jurisdiction.</li>
          </ul>
        </div>
        
        {/* Footer Disclaimer */}
        <p className="footer-disclaimer">This is a digitally signed document generated by Vaishanvi Enterprises (+91 9767216218) Billing System.</p>
      </div>
    </div>
  );
}

export default InvoiceForm;
