const express = require("express");
const { authRequired } = require("../middleware/auth");
const { listScans } = require("../services/store");

const router = express.Router();

function mapReport(scan) {
  const ai = scan.aiResult || {};
  return {
    id: scan._id,
    patientId: scan.patientId,
    fileName: scan.fileName,
    modality: scan.modality,
    notes: scan.notes,
    diagnosis: scan.diagnosis,
    disease: ai.prediction || "Unknown",
    confidence: ai.confidence || 0,
    enhancedImage: ai.enhanced_image || null,
    heatmap: ai.heatmap || null,
    summary: ai.summary || scan.explanation || "",
    createdAt: scan.createdAt,
  };
}

router.get("/", authRequired, async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const scans = await listScans(patientId ? { patientId } : {});
    res.json({
      reports: scans.map(mapReport),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:patientId", authRequired, async (req, res, next) => {
  try {
    const scans = await listScans({ patientId: req.params.patientId });
    res.json({
      reports: scans.map(mapReport),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
