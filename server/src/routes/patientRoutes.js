const express = require("express");
const { authRequired, allowRoles } = require("../middleware/auth");
const { listPatients, findUserById, listReports, getDashboardSummary } = require("../services/store");

const router = express.Router();

router.get("/", authRequired, allowRoles("doctor"), async (_req, res, next) => {
  try {
    const patients = await listPatients();
    res.json({
      patients: patients.map((patient) => {
        const plain = typeof patient.toObject === "function" ? patient.toObject() : patient;
        const { passwordHash, ...safe } = plain;
        return safe;
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/profile", authRequired, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "Profile not found." });
    }
    const plain = typeof user.toObject === "function" ? user.toObject() : user;
    const { passwordHash, ...safe } = plain;
    res.json({ profile: safe });
  } catch (error) {
    next(error);
  }
});

router.get("/summary", authRequired, async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

router.get("/:patientId/reports", authRequired, async (req, res, next) => {
  try {
    const reports = await listReports(req.params.patientId);
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
