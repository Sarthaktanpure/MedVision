const express = require("express");
const { authRequired, allowRoles } = require("../middleware/auth");
const { listReminders, createReminder, updateReminder, deleteReminder } = require("../services/store");

const router = express.Router();

router.get("/:patientId", authRequired, async (req, res, next) => {
  try {
    const reminders = await listReminders(req.params.patientId);
    res.json({ reminders });
  } catch (error) {
    next(error);
  }
});

router.post("/", authRequired, allowRoles("doctor", "patient"), async (req, res, next) => {
  try {
    const { patientId, title, time, status = "active" } = req.body;
    if (!patientId || !title || !time) {
      return res.status(400).json({ message: "patientId, title, and time are required." });
    }
    const reminder = await createReminder({ patientId, title, time, status });
    res.status(201).json({ reminder });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", authRequired, async (req, res, next) => {
  try {
    const reminder = await updateReminder(req.params.id, req.body);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found." });
    }
    res.json({ reminder });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const reminder = await deleteReminder(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found." });
    }
    res.json({ message: "Reminder removed." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
