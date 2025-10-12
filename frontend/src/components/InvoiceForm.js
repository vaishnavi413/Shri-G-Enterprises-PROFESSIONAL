import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./InvoiceForm.css";
import logo from "../assets/logo.jpeg";

// --- Format date to DD/MM/YYYY ---

function InvoiceForm() {
  const invoiceRef = useRef(null);

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

    const fetchLatestInvoiceNo = async () => {
  try {
    const res = await axios.get("https://shri-g-enterprises-invoice-billl.onrender.com/api/invoices/latest");
    const nextNo = res.data.nextInvoiceNo || "0001";
    setInvoice(prev => ({ ...prev, invoiceNo: res.data.nextInvoiceNo }));
  } catch (err) {
    console.error("Error fetching latest invoice:", err);
  }
};
const fetchNextInvoice = async () => {
  try {
    const res = await fetch("https://shri-g-enterprises-invoice-billl.onrender.com/api/invoices/next-number");
    const data = await res.json();
    // Update invoiceNo in your invoice state
    setInvoice(prev => ({ ...prev, invoiceNo: data.nextNumber }));
  } catch (err) {
    console.error("Error fetching next invoice number:", err);
  }
};





  // Fetch invoice number when page loads
 

  // --- GST Rate state ---
  const [gstRate, setGstRate] = useState(18);

  // --- Fetch latest invoice number from backend ---
  useEffect(() => {
  const fetchNextInvoice = async () => {
    try {
      const res = await axios.get(
        "https://shri-g-enterprises-invoice-billl.onrender.com/api/invoices/next-number"
      );
      setInvoice(prev => ({
        ...prev,
        invoiceNo: res.data.nextInvoiceNo || "0001"
      }));
    } catch (err) {
      console.error("Error fetching next invoice number:", err);
    }
  };
  fetchNextInvoice();
}, []);




  // --- Handle changes to invoice items ---
  const handleItemChange = (index, e) => {
    const newItems = [...invoice.items];
    newItems[index][e.target.name] = e.target.value;
    const qty = parseFloat(newItems[index].qty) || 0;
    const rate = parseFloat(newItems[index].rate) || 0;
    newItems[index].amount = qty * rate;
    setInvoice({ ...invoice, items: newItems });
  };

  // --- Add new item row ---
  const addRow = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { description: "", hsn: "", qty: "", rate: "", amount: 0 },
      ],
    });
  };

  const [previousInvoices, setPreviousInvoices] = useState([]);
  const [showPrevious, setShowPrevious] = useState(false);

{/*const fetchPreviousInvoices = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/invoices");
    setPreviousInvoices(res.data); // assuming backend returns all invoices
  } catch (err) {
    console.error("Error fetching previous invoices:", err);
  }
};*/}

  // --- Total & GST calculation ---
  // --- Total & GST calculation ---
const total = invoice.items.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

// Calculate CGST and SGST as half of GST rate
const cgst = total * (gstRate / 2 / 100);
const sgst = total * (gstRate / 2 / 100);

const grandTotal = total + cgst + sgst;


  // --- Convert number to words ---
  // --- Convert number to words including paise ---
const numberToWords = (num) => {
  if (isNaN(num)) return "";
  if (num === 0) return "Rupees Zero Only";

  // Split rupees and paise
  const [rupeesPart, paisePart] = num.toFixed(2).split(".");
  const rupees = parseInt(rupeesPart);
  const paise = parseInt(paisePart);

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertNumber(n) {
    if (n === 0) return "";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " and " + convertNumber(n % 100) : "")
      );
    if (n < 100000)
      return (
        convertNumber(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convertNumber(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convertNumber(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convertNumber(n % 100000) : "")
      );
    return (
      convertNumber(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convertNumber(n % 10000000) : "")
    );
  }

  let words = "Rupees " + convertNumber(rupees);

  if (paise > 0) {
    words += " and " + convertNumber(paise) + " Paise";
  }

  words += " Only";

  return words;
};


  const rupeesInWords = numberToWords(grandTotal);


  // --- Save invoice to backend ---
 // ✅ Save invoice and auto-reset
const handleSaveInvoice = async () => {
  try {
    await axios.post(
      "https://shri-g-enterprises-invoice-billl.onrender.com/api/invoices/save",
      invoice
    );

    alert("Invoice saved successfully!");

    // Clear form but keep next invoice number
    const res = await axios.get(
      "https://shri-g-enterprises-invoice-billl.onrender.com/api/invoices/next-number"
    );

    setInvoice({
      customerName: "",
      address: "",
      invoiceNo: res.data.nextInvoiceNo || "0001",
      invoiceDate: "",
      poNo: "",
      poDate: "",
      items: [{ description: "", hsn: "", qty: 0, rate: 0, amount: 0 }],
      notes: ["Thank you for your business!", ""],
    });
  } catch (err) {
    console.error("Error saving invoice:", err);
    alert("Error saving invoice!");
  }
};




  // --- Download invoice as PDF ---
const downloadPDF = async () => {
  if (!invoiceRef.current) return;

  html2canvas(invoiceRef.current, {
    scale: 3,
    scrollY: -window.scrollY,
    ignoreElements: (el) => el.classList.contains("no-print") || el.classList.contains("add-row-btn")
  }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const imgWidth = 595;
    const pageHeight = 842;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Invoice_${invoice.invoiceNo}.pdf`);
  });
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

  // --- Add note row ---
  return (
    <div>
      {/* --- Invoice Container --- */}
      <div className="invoice-container" ref={invoiceRef}>
        {/* --- Header Section --- */}
      <div
  className="invoice-header"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: "1px solid #000",
    paddingBottom: "10px",
    marginBottom: "10px",
  }}
>
  {/* --- Left: Logo --- */}
  <div
    className="logo"
    style={{
      position: "absolute",
      left: "20px",
      top: "10px",
    }}
  >
    <img
      src={logo}
      alt="Company Logo"
      style={{ width: "80px", height: "80px", objectFit: "contain" }}
    />
  </div>

  {/* --- Center: Titles --- */}
  <div
    style={{
      textAlign: "center",
      lineHeight: "1.3",
    }}
  >
    <h2
      style={{
        margin: 0,
        fontSize: "20px",
        fontWeight: "bold",
        textTransform: "uppercase",
      }}
    >
      TAX INVOICE
    </h2>
    <h1
      style={{
        margin: "5px 0 0 0",
        fontSize: "36px",
        fontWeight: "bold",
        color: "red",
        letterSpacing: "1px",
      }}
    >
      SHRI G ENTERPRISES
    </h1>
  </div>
</div>


        {/* --- Company Info --- */}
        <p style={{ textAlign: "center", fontSize: "14px", lineHeight: "1.6" }}>
  Welding & Safety Equipment’s<br />
  S.No.371, Flat No.20, Unity Park, Somwar Peth, Narpagtiri Chowk,<br />
  Above HDFC Bank, Pune 411011.<br />
  Ph: +91 9850111166 | Email: shrignterprises25@gmail.com<br />
  <b>GST No.:</b> 27AJIPG2516N1ZZ
</p>

        {/* --- Customer & Invoice Details --- */}
        <div className="invoice-details-section">
          <table className="invoice-details-table">
            <tbody>
              <tr>
                <td className="to-section" colSpan="2">
                  <strong>To,</strong>
                  <br />
                  <textarea
                    placeholder="Customer Name"
                    value={invoice.customerName}
                    onChange={(e) =>
                      setInvoice({ ...invoice, customerName: e.target.value })
                    }
                  />
                  <br />
                 <div
  contentEditable
  suppressContentEditableWarning={true}
  onInput={(e) =>
    setInvoice({ ...invoice, address: e.currentTarget.textContent })
  }
  style={{
    width: "95%",
    minHeight: "60px",
    fontFamily: "Times New Roman",
    fontSize: "14px",
    border: "0px solid #ccc",
    padding: "6px",
    outline: "none",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    overflow: "visible",
    color: invoice.address ? "black" : "gray", // placeholder color
  }}
>
  {!invoice.address && "Enter Address..."}
</div>


                </td>
                <td className="right-details">
                  <table className="inner-details-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Invoice No.:</strong>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={invoice.invoiceNo}
                            onChange={(e) =>
                              setInvoice({ ...invoice, invoiceNo: e.target.value })
                            }
                          />
                        </td>
                      </tr>
                      <tr>
  <td><strong>Invoice Date:</strong></td>
  <td>
    <input
      type="date"
      value={invoice.invoiceDate || ""}
      onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
      max="2026-03-31"
      onKeyDown={(e) => e.preventDefault()} // prevent manual typing but keep calendar
    />
  </td>
</tr>
                      <tr>
                        <td>
                          <strong>P.O. No.:</strong>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={invoice.poNo}
                            onChange={(e) =>
                              setInvoice({ ...invoice, poNo: e.target.value })
                            }
                          />
                        </td>
                      </tr>
                      <tr>
  <td><strong>P.O. Date:</strong></td>
  <td>
    <input
      type="date"
      value={invoice.poDate || ""}
      onChange={(e) => setInvoice({ ...invoice, poDate: e.target.value })}
      max="2026-03-31"
      onKeyDown={(e) => e.preventDefault()} // prevent manual typing but keep calendar
    />
  </td>
</tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Items Table --- */}
        <table
          className="items-table"
          style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={{ width: "5%", textAlign: "center" }}>SR. NO.</th>
              <th style={{ width: "60%", textAlign: "left" }}>DESCRIPTION</th>
              <th style={{ width: "5%", textAlign: "center" }}>HSN</th>
              <th style={{ width: "5%", textAlign: "center" }}>QTY</th>
              <th style={{ width: "10%", textAlign: "right" }}>RATE</th>
              <th style={{ width: "15%", textAlign: "right" }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
  {invoice.items.map((item, index) => (
    <tr key={index}>
      <td style={{ textAlign: "center" }}>{index + 1}</td>

      {/* ✅ Description as a div instead of textarea for PDF */}
      <td>
  <div
    contentEditable
    suppressContentEditableWarning={true}
    onInput={(e) =>
      handleItemChange(index, {
        target: { name: "description", value: e.currentTarget.textContent },
      })
    }
    style={{
      width: "100%",
      minHeight: "40px",
      fontFamily: "Times New Roman",
      fontSize: "14px",
      whiteSpace: "pre-wrap", // preserves line breaks
      wordWrap: "break-word",
      overflowWrap: "break-word",
      outline: "none",   // remove default focus outline
    }}
  >
    {item.description}
  </div>
</td>


      <td>
        <input
          type="text"
          name="hsn"
          value={item.hsn}
          onChange={(e) => handleItemChange(index, e)}
          style={{ width: "90%", textAlign: "center", border: "none", outline: "none" }}
        />
      </td>
      <td>
        <input
          type="number"
          name="qty"
          value={item.qty}
          onChange={(e) => handleItemChange(index, e)}
          style={{ width: "90%", textAlign: "center", border: "none", outline: "none" }}
        />
      </td>
      <td>
        <input
          type="number"
          name="rate"
          value={item.rate}
          onChange={(e) => handleItemChange(index, e)}
          style={{ width: "90%", textAlign: "right", border: "none", outline: "none" }}
        />
      </td>
      <td style={{ textAlign: "right", paddingRight: "6px" }}>
        {item.amount.toFixed(2)}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      <button className="add-row-btn" onClick={addRow}>+ Add Row</button>


        {/* --- GST Selection --- */}
       {/* --- Screen only: GST selection --- */}
<div className="gst-select no-print" style={{ marginTop: "15px", textAlign: "right" }}>
  <label><b>Select GST Rate: </b></label>
  <select
    value={gstRate}
    onChange={(e) => setGstRate(parseFloat(e.target.value))}
    style={{ padding: "5px", marginLeft: "8px" }}
  >
    <option value={5}>GST 5% </option>
    <option value={18}>GST 18%</option>
  </select>
</div>

{/* --- PDF only: show selected GST value --- */}
<div className="pdf-only" style={{ marginTop: "15px", textAlign: "right", display: "none" }}>
  <b>GST Rate: </b> {gstRate}%
</div>


        {/* --- Totals & Rupees in Words --- */}
        <div
          className="amount-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            borderTop: "1px solid #000",
            borderBottom: "1px solid #000",
          }}
        >
          <div
            style={{
              width: "65%",
              borderRight: "1px solid #000",
              padding: "10px",
              fontSize: "14px",
            }}
          >
            <b>Rupees In Words :</b> {rupeesInWords}
          </div>
          <div style={{ width: "35%" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
            >
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}><b>TOTAL</b></td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}><b>CGST ({gstRate / 2}%)</b></td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}><b>SGST ({gstRate / 2}%)</b></td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{sgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}><b>GRAND TOTAL</b></td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", fontWeight: "bold" }}>{grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Notes Section --- */}

        {/* --- Save & Download Buttons --- */}
        
        <div className="actions no-print" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
  <button onClick={handleSaveInvoice}>💾 Save Invoice</button>
  <button onClick={downloadPDF} className="pdf-btn">⬇️ Download PDF</button>
</div>

        {showPrevious && (
  <div className="modal">
    <div className="modal-content">
      <h3>Previous Invoices</h3>
      <button onClick={() => setShowPrevious(false)}>❌ Close</button>
      <table className="previous-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {previousInvoices.map((inv, i) => (
            <tr key={i}>
              <td>{inv.invoiceNo}</td>
              <td>{inv.customerName}</td>
              <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
              <td>{inv.grandTotal?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


        {/* --- Bank Details & Signature --- */}
        <div style={{ marginTop: "30px", border: "1px solid #000" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <tbody>
              <tr>
                <td style={{ width: "60%", verticalAlign: "top", borderRight: "1px solid #000", padding: "10px", lineHeight: "1.6" }}>
                  <b>ACCOUNT TYPE –</b> CURRENT <br />
                  <b>BANK –</b> HDFC BANK &nbsp;&nbsp;
                  <b>BRANCH –</b> SOMWAR PETH <br />
                  <b>ACCOUNT NO.:</b> 50200095196440 <br />
                  <b>IFSC :</b> HDFC0005383
                </td>
                <td style={{ width: "40%", padding: "10px", textAlign: "center", verticalAlign: "middle" }}></td>
              </tr>
              <tr>
                <td style={{ borderTop: "1px solid #000", borderRight: "1px solid #000", padding: "8px", textAlign: "center" }}>
                  <b>Received Signature</b>
                </td>
                <td style={{ borderTop: "1px solid #000", padding: "8px", textAlign: "center", color: "red", fontWeight: "bold" }}>
                  FOR SHRI G ENTERPRISES
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Terms & Conditions Section --- */}
      

        {/* --- Footer Section --- */}
     
      </div>
    </div>
  );
}

export default InvoiceForm;
