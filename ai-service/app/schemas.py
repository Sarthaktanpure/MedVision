from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    file_name: str = Field(default="scan.png")
    base64: Optional[str] = None
    file_path: Optional[str] = None
    mime_type: str = Field(default="image/png")
    modality: str = Field(default="xray")


class AnalyzeResponse(BaseModel):
    enhanced_image: str
    prediction: str
    confidence: float
    heatmap: str
    summary: str
    model_mode: str
