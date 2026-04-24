import React, { useState } from "react";
import axios from "axios";
import "./InvoiceStyle.css";

const CreateInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    date: "",
    poNo: "",
    poDate: "",
    customerName: "",
    customerAddress: "",
    products: [{ srNo: 1, description: "", hsn: "", qty: 1, rate: 0, amount: 0 }],
  });

  const handleProductChange = (index, field, value) => {
    const updated = [...invoiceData.products];
    updated[index][field] = value;
    if (field === "qty" || field === "rate") {
      updated[index].amount = updated[index].qty * updated[index].rate;
    }
    setInvoiceData({ ...invoiceData, products: updated });
  };

  const addProduct = () => {
    setInvoiceData({
      ...invoiceData,
      products: [...invoiceData.products, { srNo: invoiceData.products.length + 1, description: "", hsn: "", qty: 1, rate: 0, amount: 0 }],
    });
  };

  const handleSubmit = async () => {
    const total = invoiceData.products.reduce((sum, p) => sum + p.amount, 0);
    const cgst = total * 0.09;
    const sgst = total * 0.09;
    const grandTotal = total + cgst + sgst;

    const dataToSend = { ...invoiceData, total, cgst, sgst, grandTotal };
    await axios.post("http://localhost:5000/api/invoices", dataToSend);
    alert("Invoice Saved Successfully!");
  };

  return (
    <div className="invoice-container">
      <div className="header">
        <div className="logo">
          <img src="https://via.placeholder.com/60x60.png?text=LOGO" alt="Logo" />
        </div>
        <h2>TAX INVOICE</h2>
        <h1 className="header-title">SHRI G ENTERPRISES</h1>
        <div className="subtext">Welding & Safety Equipment’s</div>
        <div className="address">
          S. No.371, Flat No.20, Unity Park, Somwar Peth, Narpagtiri Chowk,<br />
          Above HDFC Bank, Pune 411011. | Ph: +91 9850111166 |
          Email: <u>shrignterprises25@gmail.com</u>
        </div>
        <div className="gst">GST No.: 27AJIPG2516N1ZZ</div>
      </div>

      <table className="info-table" style={{ marginTop: "12px" }}>
        <tbody>
          <tr>
            <td rowSpan="4" width="60%">
              <b>To,</b><br />
              <input
                type="text"
                placeholder="Customer Name"
                value={invoiceData.customerName}
                onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
              /><br />
              <textarea
                rows="4"
                placeholder="Customer Address"
                value={invoiceData.customerAddress}
                onChange={(e) => setInvoiceData({ ...invoiceData, customerAddress: e.target.value })}
              />
            </td>
            <td><b>Invoice No. :</b> (Auto Generated)</td>
          </tr>
          <tr><td><b>Date :</b> <input type="date" value={invoiceData.date} onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })} /></td></tr>
          <tr><td><b>P.O. No. :</b> <input type="text" value={invoiceData.poNo} onChange={(e) => setInvoiceData({ ...invoiceData, poNo: e.target.value })} /></td></tr>
          <tr><td><b>P.O. Date :</b> <input type="date" value={invoiceData.poDate} onChange={(e) => setInvoiceData({ ...invoiceData, poDate: e.target.value })} /></td></tr>
        </tbody>
      </table>

      <table className="product-table" style={{ marginTop: "12px" }}>
        <thead>
          <tr>
            <th>SR. NO.</th>
            <th>DESCRIPTION</th>
            <th style={{width: "100px"}}>HSN / SAC</th>
            <th>QTY.</th>
            <th>RATE</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.products.map((p, i) => (
            <tr key={i}>
              <td style={{ textAlign: "center" }}>{p.srNo}</td>
              <td><input value={p.description} onChange={(e) => handleProductChange(i, "description", e.target.value)} /></td>
              <td><input style={{width: "100%"}} maxLength="15" value={p.hsn} onChange={(e) => handleProductChange(i, "hsn", e.target.value)} /></td>
              <td><input type="number" value={p.qty} onChange={(e) => handleProductChange(i, "qty", e.target.value)} /></td>
              <td><input type="number" value={p.rate} onChange={(e) => handleProductChange(i, "rate", e.target.value)} /></td>
              <td className="amount">{p.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addProduct}>+ Add Item</button>
      <button onClick={handleSubmit}>💾 Save Invoice</button>
    </div>
  );
};

export default CreateInvoice;
