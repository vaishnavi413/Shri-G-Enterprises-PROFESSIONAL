// models/Counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // example: "invoiceCounter"
  seq: { type: Number, default: 0 }      // current sequence number
});

export default mongoose.model("Counter", counterSchema);
