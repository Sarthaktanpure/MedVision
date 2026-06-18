const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["active", "done"], default: "active" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);
