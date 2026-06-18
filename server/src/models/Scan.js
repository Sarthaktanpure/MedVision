const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    modality: { type: String, default: "xray" },
    notes: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    aiResult: { type: Object, default: {} },
    explanation: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Scan || mongoose.model("Scan", scanSchema);
