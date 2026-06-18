from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .pipeline import build_heatmap, enhance_image, image_to_data_url, load_image_from_request, predict_disease
from .schemas import AnalyzeRequest

app = FastAPI(title="MediVision AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-service"}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    original = load_image_from_request(payload.file_name, payload.base64, payload.file_path)
    enhanced = enhance_image(original)
    prediction, confidence, summary = predict_disease(enhanced, payload.modality)
    heatmap = build_heatmap(original, enhanced)

    return {
        "enhanced_image": image_to_data_url(enhanced),
        "prediction": prediction,
        "confidence": confidence,
        "heatmap": image_to_data_url(heatmap),
        "summary": summary,
        "model_mode": "opencv-heuristic",
    }
