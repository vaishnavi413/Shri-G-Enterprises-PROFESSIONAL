import Invoice from "../models/invoice.model.js";

// Auto-generate next invoice number (0001, 0002...)
const generateNextInvoiceNo = async () => {
  const last = await Invoice.findOne().sort({ createdAt: -1 });

  if (!last) return "0001";

  const lastNum = parseInt(last.invoiceNo);
  const nextNum = lastNum + 1;

  return String(nextNum).padStart(4, "0");
};

// SAVE INVOICE
export const saveInvoice = async (req, res) => {
  try {
    const invoiceNo = await generateNextInvoiceNo();

    const newInvoice = new Invoice({
      invoiceNo,
      customerName: req.body.customerName,
      address: req.body.address,
      invoiceDate: req.body.invoiceDate,
      poNo: req.body.poNo,
      poDate: req.body.poDate,
      items: req.body.items,
      total: req.body.total,
      cgst: req.body.cgst,
      sgst: req.body.sgst,
      grandTotal: req.body.grandTotal,
      notes: req.body.notes,
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error("Error saving invoice:", err);
    res.status(500).json({ message: "Failed to save invoice", error: err });
  }
};

// GET ALL INVOICES
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch invoices", error: err });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch invoice", error: err });
  }
};
