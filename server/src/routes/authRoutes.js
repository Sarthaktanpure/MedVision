const express = require("express");
const { authRequired } = require("../middleware/auth");
const { signToken } = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/password");
const { createUser, findUserByEmail, findUserById } = require("../services/store");

const router = express.Router();

function sanitizeUser(user) {
  if (!user) return null;
  const plain = typeof user.toObject === "function" ? user.toObject() : user;
  const { passwordHash, ...safe } = plain;
  return safe;
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, specialization = "", age = 0, patientId = "", phone = "" } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required." });
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Account already exists." });
    }

    const user = await createUser({
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role,
      specialization,
      age,
      patientId,
      phone,
    });

    const token = signToken({ sub: String(user._id), role: user.role, email: user.email }, process.env.JWT_SECRET || "medivision-dev-secret");

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordHash = typeof user.toObject === "function" ? user.toObject().passwordHash : user.passwordHash;
    if (!verifyPassword(password, passwordHash)) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken({ sub: String(user._id), role: user.role, email: user.email }, process.env.JWT_SECRET || "medivision-dev-secret");

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
