const fs = require("fs");
const path = require("path");
const { isDatabaseReady } = require("../config/db");
const User = require("../models/User");
const Scan = require("../models/Scan");
const Reminder = require("../models/Reminder");
const { buildSeedUsers } = require("../data/seed");

const memory = {
  users: [],
  scans: [],
  reminders: [],
};

function getUploadsDir() {
  return path.join(__dirname, "..", "..", "uploads");
}

async function ensureDemoData() {
  if (isDatabaseReady()) {
    const count = await User.countDocuments();
    if (count === 0) {
      const seedUsers = buildSeedUsers();
      await User.insertMany(seedUsers);
      await Reminder.insertMany([
        {
          patientId: "PAT-2026-001",
          title: "Morning medication",
          time: "08:00",
          status: "active",
        },
        {
          patientId: "PAT-2026-001",
          title: "Follow-up scan review",
          time: "18:00",
          status: "active",
        },
      ]);
    }
    return;
  }

  if (memory.users.length === 0) {
    memory.users = buildSeedUsers().map((user, index) => ({
      ...user,
      _id: `mem-user-${index + 1}`,
    }));
    memory.reminders = [
      {
        _id: "mem-rem-1",
        patientId: "PAT-2026-001",
        title: "Morning medication",
        time: "08:00",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "mem-rem-2",
        patientId: "PAT-2026-001",
        title: "Follow-up scan review",
        time: "18:00",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

async function createUser(user) {
  if (isDatabaseReady()) {
    return User.create(user);
  }
  const record = { ...user, _id: `mem-user-${Date.now()}` };
  memory.users.push(record);
  return record;
}

async function findUserByEmail(email) {
  if (isDatabaseReady()) {
    return User.findOne({ email });
  }
  return memory.users.find((user) => user.email === email) || null;
}

async function findUserById(id) {
  if (isDatabaseReady()) {
    return User.findById(id);
  }
  return memory.users.find((user) => String(user._id) === String(id)) || null;
}

async function listPatients() {
  if (isDatabaseReady()) {
    return User.find({ role: "patient" }).sort({ createdAt: -1 });
  }
  return memory.users.filter((user) => user.role === "patient");
}

async function createScan(scan) {
  if (isDatabaseReady()) {
    return Scan.create(scan);
  }
  const record = {
    ...scan,
    _id: `mem-scan-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  memory.scans.unshift(record);
  return record;
}

async function listScans(filter = {}) {
  if (isDatabaseReady()) {
    return Scan.find(filter).sort({ createdAt: -1 });
  }
  return memory.scans.filter((scan) => {
    if (filter.patientId && scan.patientId !== filter.patientId) return false;
    if (filter.doctorId && scan.doctorId !== filter.doctorId) return false;
    return true;
  });
}

async function listReports(patientId) {
  return listScans({ patientId });
}

async function listReminders(patientId) {
  if (isDatabaseReady()) {
    return Reminder.find({ patientId }).sort({ createdAt: -1 });
  }
  return memory.reminders.filter((reminder) => reminder.patientId === patientId);
}

async function createReminder(reminder) {
  if (isDatabaseReady()) {
    return Reminder.create(reminder);
  }
  const record = {
    ...reminder,
    _id: `mem-rem-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  memory.reminders.unshift(record);
  return record;
}

async function updateReminder(id, patch) {
  if (isDatabaseReady()) {
    return Reminder.findByIdAndUpdate(id, patch, { new: true });
  }
  const index = memory.reminders.findIndex((reminder) => String(reminder._id) === String(id));
  if (index === -1) return null;
  memory.reminders[index] = { ...memory.reminders[index], ...patch };
  return memory.reminders[index];
}

async function deleteReminder(id) {
  if (isDatabaseReady()) {
    return Reminder.findByIdAndDelete(id);
  }
  const index = memory.reminders.findIndex((reminder) => String(reminder._id) === String(id));
  if (index === -1) return null;
  const [removed] = memory.reminders.splice(index, 1);
  return removed;
}

async function getDashboardSummary() {
  const patients = await listPatients();
  const reports = isDatabaseReady() ? await Scan.find().sort({ createdAt: -1 }).limit(10) : memory.scans.slice(0, 10);
  return {
    patients: patients.length,
    reports: reports.length,
    reminders: isDatabaseReady() ? await Reminder.countDocuments() : memory.reminders.length,
    storageMode: isDatabaseReady() ? "MongoDB" : "In-memory demo",
  };
}

function removeOrphanedFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_error) {
    // Best-effort cleanup.
  }
}

module.exports = {
  ensureDemoData,
  createUser,
  findUserByEmail,
  findUserById,
  listPatients,
  createScan,
  listScans,
  listReports,
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getDashboardSummary,
  removeOrphanedFile,
  getUploadsDir,
};
