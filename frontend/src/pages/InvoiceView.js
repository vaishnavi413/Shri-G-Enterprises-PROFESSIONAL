import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.jpeg";
import "../components/AmazonInvoice.css"; 

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inv, setInv] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`https://shri-g-enterprises-professional.onrender.com/api/invoices/${id}`);
        setInv(res.data);
      } catch (err) { console.error(err); }
    };
    load();
  }, [id]);

  const downloadPDF = async () => {
    const node = document.getElementById("invoice-pdf");
    if (!node) return;
    const canvas = await html2canvas(node, { scale: 3, useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${inv.invoiceNo}.pdf`);
  };

  const numberToWords = (num) => {
    if (isNaN(num)) return "";
    if (num === 0) return "Zero Rupees Only";
    const [rupeesPart, paisePart] = num.toFixed(2).split(".");
    const rupees = parseInt(rupeesPart);
    const paise = parseInt(paisePart);
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function convert(n) {
      if (n === 0) return "";
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
      if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
      if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
      return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
    }
    let words = convert(rupees) + " Rupees";
    if (paise > 0) words += " and " + convert(paise) + " Paise";
    return words + " Only";
  };

  if (!inv) return <div className="loading">Loading...</div>;

  return (
    <div className="view-container">
      <div className="no-print actions-bar" style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0" }}>
        <button onClick={() => navigate("/")} className="back-btn" style={{ padding: "8px 20px", background: "#f8f9fa", border: "1px solid #ddd", cursor: "pointer" }}>⬅️ Back</button>
        <button onClick={downloadPDF} className="download-btn" style={{ padding: "8px 20px", background: "#000", color: "#fff", border: "none", cursor: "pointer" }}>⬇️ Download PDF</button>
      </div>

      <div id="invoice-pdf" className="amazon-invoice">
        <div className="tax-invoice-label">Tax Invoice</div>

        {/* Centered Logo and Brand */}
        <div className="header-top" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "30px" }}>
          <div className="logo-box" style={{ marginBottom: "15px" }}>
             <img src={logo} alt="Logo" style={{ width: "100px", height: "auto" }} />
          </div>
          <div className="company-brand">
            <h1>SHRI G ENTERPRISES</h1>
            <div className="details">
              <b>GSTIN: 27AJIPG2516N1ZZ</b><br />
              S.No.371, Flat No.20, Unity Park, Somwar Peth, Narpagtiri Chowk, Pune - 411011.<br />
              <b>Mobile:</b> 9850111166 | <b>Email:</b> shrignterprises25@gmail.com
            </div>
          </div>
          <div className="original-recipient" style={{ position: "absolute", top: "50px", right: "50px" }}>Original for Recipient</div>
        </div>

        <div className="invoice-boxes">
           <div className="info-box">
             <span>Invoice :</span>
             <div>{inv.invoiceNo}</div>
           </div>
           <div className="info-box">
             <span>Invoice Date:</span>
             <div>{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"}) : ""}</div>
           </div>
           <div className="info-box">
             <span>P.O. No & Date:</span>
             <div>{inv.poNo || "N/A"} / {inv.poDate ? new Date(inv.poDate).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"}) : ""}</div>
           </div>
        </div>

        <div className="address-grid">
           <div className="addr-section">
             <h4>Customer Details:</h4>
             <p>{inv.customerName}</p>
           </div>
           <div className="addr-section">
             <h4>Billing Address:</h4>
             <p>{inv.address}</p>
           </div>
        </div>

        <div className="gst-line">GSTIN: <span style={{fontWeight: 400, color: "#666"}}>Customer GST Not Provided</span></div>

        <table className="prof-table">
          <thead>
            <tr>
              <th style={{width: "50px"}}>SR. NO.</th>
              <th style={{width: "280px"}}>Item Description</th>
              <th>Rate/Item</th>
              <th>Qty</th>
              <th>Taxable Value</th>
              <th>Tax Amount ({inv.gstRate}%)</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <div style={{fontWeight: 700}}>{it.description}</div>
                  <div style={{fontSize: "10px", color: "#888"}}>HSN: {it.hsn}</div>
                </td>
                <td>{it.rate.toFixed(2)}</td>
                <td>{it.qty}</td>
                <td>{(it.qty * it.rate).toFixed(2)}</td>
                <td>{((it.qty * it.rate * inv.gstRate) / 100).toFixed(2)}</td>
                <td style={{fontWeight: 700}}>{((it.qty * it.rate) * (1 + inv.gstRate/100)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="total-flex">
          <div className="words-block">
             <div style={{color: "#888", marginBottom: "5px"}}>Total Amount (in words):</div>
             <div style={{fontWeight: 700, fontSize: "14px"}}>{numberToWords(inv.grandTotal)}</div>
          </div>
          <div className="totals-block">
             <div className="row-item">
               <span>Taxable Amount</span>
               <span style={{fontWeight: 700}}>₹{inv.total.toFixed(2)}</span>
             </div>
             <div className="row-item">
               <span>{inv.gstRate}% GST</span>
               <span style={{fontWeight: 700}}>₹{(inv.cgst + inv.sgst).toFixed(2)}</span>
             </div>
             <div className="row-item grand">
               <span>Total</span>
               <span>₹{inv.grandTotal.toFixed(2)}</span>
             </div>
          </div>
        </div>

        <div className="footer-grid">
           <div className="bank-info-box">
             <div style={{fontWeight: 700, color: "#000", marginBottom: "5px"}}>BANK DETAILS:</div>
             <b>Bank:</b> HDFC BANK<br />
             <b>A/C :</b> 50200095196440 (Current)<br />
             <b>IFSC:</b> HDFC0005383<br />
             <b>Branch:</b> SOMWAR PETH
           </div>
           
           <div className="sig-box">
              <div style={{fontWeight: 700}}>For SHRI G ENTERPRISES</div>
              <div className="sig-line">Authorized Signatory</div>
           </div>
        </div>

        <div className="terms">
          <b>Notes:</b> Thank you for your Business!<br /><br />
          <b>Terms and Conditions:</b>
          <ul>
            <li>Goods once sold cannot be taken back or exchanged.</li>
            <li>Interest @24% p.a. will be charged for uncleared bills beyond 15 days.</li>
            <li>Subject to Pune Jurisdiction.</li>
          </ul>
        </div>

        <div className="bottom-line">
          Subject to Pune Jurisdiction. This is a computer generated invoice.
        </div>
        
        <p className="footer-disclaimer">This is a digitally signed document generated by Vaishanvi Enterprises (+91 9767216218) Billing System.</p>
      </div>
    </div>
  );
}

