const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectDatabase, isDatabaseReady } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reportRoutes = require("./routes/reportRoutes");
const patientRoutes = require("./routes/patientRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const { ensureDemoData } = require("./services/store");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "server",
    databaseReady: isDatabaseReady(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reminders", reminderRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();
  await ensureDemoData();

  app.listen(port, () => {
    console.log(`MediVision AI server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server:", error);
  process.exit(1);
});
