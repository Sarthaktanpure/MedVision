const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["doctor", "patient"], required: true },
    specialization: { type: String, default: "" },
    age: { type: Number, default: 0 },
    patientId: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
