const DEFAULT_AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

function buildFallbackAnalysis(fileName = "scan.png") {
  const lower = fileName.toLowerCase();
  const isPneumonia = /chest|xray|lung/.test(lower);
  const isTumor = /brain|ct|mri/.test(lower);
  const prediction = isTumor ? "Possible tumor pattern" : isPneumonia ? "Possible pneumonia pattern" : "No strong abnormality detected";
  const confidence = isTumor ? 84 : isPneumonia ? 78 : 62;

  return {
    enhanced_image: null,
    prediction,
    confidence,
    heatmap: null,
    summary: `Automated demo analysis for ${fileName}.`,
    model_mode: "fallback",
  };
}

async function analyzeImage(payload) {
  try {
    const response = await fetch(`${DEFAULT_AI_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    return await response.json();
  } catch (_error) {
    return buildFallbackAnalysis(payload.file_name || payload.fileName);
  }
}

module.exports = {
  analyzeImage,
  buildFallbackAnalysis,
};
