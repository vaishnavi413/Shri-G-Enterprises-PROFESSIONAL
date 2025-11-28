export default function formatInvoiceNumber(seq) {
  return String(seq).padStart(4, "0"); // e.g., 1 → "0001"
}
