import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

// --- Get next invoice number ---
router.get("/next-number", async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const nextNumber = lastInvoice
      ? String(parseInt(lastInvoice.invoiceNo) + 1).padStart(4, "0")
      : "0001";

    res.json({ nextInvoiceNo: nextNumber });
  } catch (err) {
    console.error("Error fetching next invoice number:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Get all invoices ---
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("❌ Error fetching invoices:", err);
    res.status(500).json({ message: "Error fetching invoices" });
  }
});

// --- Save Invoice (AUTO-GENERATE invoiceNo HERE) ---
router.post("/save", async (req, res) => {
  try {
    const invoiceData = req.body;

    // Format items correctly
    invoiceData.items = (invoiceData.items || []).map((item) => ({
      description: item.description || "",
      hsn: item.hsn || "",
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
      amount:
        Number(item.amount) ||
        (Number(item.qty) || 0) * (Number(item.rate) || 0),
    }));

    invoiceData.total = Number(invoiceData.total) || 0;
    invoiceData.cgst = Number(invoiceData.cgst) || 0;
    invoiceData.sgst = Number(invoiceData.sgst) || 0;
    invoiceData.grandTotal = Number(invoiceData.grandTotal) || 0;

    // *** OLD SYSTEM AUTO INVOICE NO ***
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });

    const nextInvoiceNo = lastInvoice
      ? String(parseInt(lastInvoice.invoiceNo) + 1).padStart(4, "0")
      : "0001";

    invoiceData.invoiceNo = nextInvoiceNo;

    // Save invoice
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    res.status(201).json({
      message: "Invoice saved successfully",
      invoice: newInvoice,
    });

  } catch (err) {
    console.error("❌ Error saving invoice:", err.message);
    res.status(500).json({ error: "Failed to save invoice" });
  }
});

export default router;
