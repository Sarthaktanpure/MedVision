const { hashPassword } = require("../utils/password");

const demoUsers = [
  {
    name: "Dr. Asha Mehta",
    email: "doctor@medivision.ai",
    password: "doctor123",
    role: "doctor",
    specialization: "Radiology",
    patientId: "",
    phone: "+91 90000 00001",
  },
  {
    name: "Rahul Verma",
    email: "patient@medivision.ai",
    password: "patient123",
    role: "patient",
    age: 42,
    patientId: "PAT-2026-001",
    phone: "+91 90000 00002",
  },
];

function buildSeedUsers() {
  return demoUsers.map((user) => ({
    ...user,
    passwordHash: hashPassword(user.password),
  }));
}

module.exports = {
  buildSeedUsers,
};
