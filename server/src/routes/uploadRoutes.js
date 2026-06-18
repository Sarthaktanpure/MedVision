const express = require("express");
const path = require("path");
const { authRequired, allowRoles } = require("../middleware/auth");
const { saveBase64File, ensureDir } = require("../utils/files");
const { analyzeImage } = require("../services/aiClient");
const { createScan, getUploadsDir } = require("../services/store");

const router = express.Router();

router.post("/analyze", authRequired, allowRoles("doctor"), async (req, res, next) => {
  try {
    const {
      patientId,
      fileName = "scan.png",
      fileData,
      mimeType = "image/png",
      modality = "xray",
      notes = "",
      diagnosis = "",
    } = req.body;

    if (!patientId || !fileData) {
      return res.status(400).json({ message: "patientId and fileData are required." });
    }

    const base64 = fileData.includes(",") ? fileData.split(",").pop() : fileData;
    const uploadsDir = getUploadsDir();
    ensureDir(uploadsDir);
    const savedPath = saveBase64File({
      base64,
      outputDir: uploadsDir,
      fileName,
    });

    const aiResult = await analyzeImage({
      file_name: fileName,
      mime_type: mimeType,
      modality,
      path: savedPath,
      base64,
    });

    const explanation = `AI suggests ${aiResult.prediction} with ${Math.round(aiResult.confidence)}% confidence.`;

    const scan = await createScan({
      patientId,
      doctorId: req.user.sub,
      fileName,
      filePath: savedPath,
      modality,
      notes,
      diagnosis,
      aiResult,
      explanation,
    });

    res.status(201).json({
      scan,
      aiResult,
      report: {
        disease: aiResult.prediction,
        confidence: aiResult.confidence,
        summary: aiResult.summary || explanation,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", authRequired, allowRoles("doctor"), async (req, res, next) => {
  try {
    const { patientId, fileName = "scan.png", fileData } = req.body;
    if (!patientId || !fileData) {
      return res.status(400).json({ message: "patientId and fileData are required." });
    }
    const uploadsDir = getUploadsDir();
    ensureDir(uploadsDir);
    const base64 = fileData.includes(",") ? fileData.split(",").pop() : fileData;
    const savedPath = saveBase64File({ base64, outputDir: uploadsDir, fileName });
    res.status(201).json({
      message: "File uploaded.",
      filePath: savedPath,
      publicPath: `/uploads/${path.basename(savedPath)}`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
