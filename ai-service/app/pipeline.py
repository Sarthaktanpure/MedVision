import base64
import io
from typing import Optional, Tuple

import cv2
import numpy as np
from PIL import Image

try:
    import pydicom
except Exception:  # pragma: no cover - optional dependency
    pydicom = None


def _decode_data_url(value: str) -> bytes:
    if "," in value:
        value = value.split(",", 1)[1]
    return base64.b64decode(value)


def load_image_from_request(file_name: str, base64_payload: Optional[str], file_path: Optional[str]) -> np.ndarray:
    try:
        if file_path and file_path.lower().endswith(".dcm") and pydicom is not None:
            dicom = pydicom.dcmread(file_path)
            array = dicom.pixel_array.astype(np.float32)
            array = _normalize_to_uint8(array)
            return cv2.cvtColor(array, cv2.COLOR_GRAY2BGR)

        if file_path and not file_path.lower().endswith(".dcm"):
            with open(file_path, "rb") as file:
                raw = file.read()
            return _read_image_bytes(raw, file_name)

        if base64_payload:
            raw = _decode_data_url(base64_payload)
            return _read_image_bytes(raw, file_name)
    except Exception:
        pass

    placeholder = np.zeros((512, 512, 3), dtype=np.uint8)
    cv2.putText(
        placeholder,
        "No image received",
        (48, 256),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )
    return placeholder


def _read_image_bytes(raw: bytes, file_name: str) -> np.ndarray:
    try:
        if file_name.lower().endswith(".dcm") and pydicom is not None:
            try:
                dicom = pydicom.dcmread(io.BytesIO(raw))
                array = dicom.pixel_array.astype(np.float32)
                array = _normalize_to_uint8(array)
                return cv2.cvtColor(array, cv2.COLOR_GRAY2BGR)
            except Exception:
                pass

        image = Image.open(io.BytesIO(raw)).convert("RGB")
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception:
        placeholder = np.zeros((512, 512, 3), dtype=np.uint8)
        cv2.putText(
            placeholder,
            "Unsupported image",
            (54, 256),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )
        return placeholder


def _normalize_to_uint8(array: np.ndarray) -> np.ndarray:
    array = array.astype(np.float32)
    min_value = array.min()
    max_value = array.max()
    if max_value - min_value < 1e-6:
        return np.zeros_like(array, dtype=np.uint8)
    normalized = (array - min_value) / (max_value - min_value)
    return (normalized * 255).clip(0, 255).astype(np.uint8)


def enhance_image(image: np.ndarray) -> np.ndarray:
    denoised = cv2.fastNlMeansDenoisingColored(image, None, 6, 6, 7, 21)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    merged = cv2.merge((l_channel, a_channel, b_channel))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


def predict_disease(image: np.ndarray, modality: str) -> Tuple[str, float, str]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 45, 120)
    edge_density = float(edges.mean() / 255.0)
    brightness = float(gray.mean() / 255.0)
    contrast = float(gray.std() / 255.0)

    if modality.lower() in {"mri", "ct"}:
        score = 0.58 + (contrast * 0.6) + (edge_density * 0.55)
        if score > 0.95:
            label = "Possible abnormal lesion"
        elif score > 0.78:
            label = "Possible tumor pattern"
        else:
            label = "No strong abnormality detected"
    else:
        score = 0.52 + (edge_density * 0.75) + ((0.5 - brightness) * 0.2)
        if score > 0.92:
            label = "Possible pneumonia pattern"
        elif score > 0.76:
            label = "Possible lung opacity pattern"
        else:
            label = "No strong abnormality detected"

    confidence = float(np.clip(score, 0.51, 0.98) * 100)
    summary = {
        "Possible abnormal lesion": "The scan shows a stronger structural difference that should be reviewed by a specialist.",
        "Possible tumor pattern": "The scan contains a suspicious region that benefits from a radiology review.",
        "Possible pneumonia pattern": "The chest pattern may reflect an infection or inflammation and should be correlated clinically.",
        "Possible lung opacity pattern": "There is a mild opacity pattern that should be followed by the clinician.",
        "No strong abnormality detected": "The image does not show a clear abnormal pattern in this demo pipeline.",
    }[label]
    return label, confidence, summary


def build_heatmap(original: np.ndarray, enhanced: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
    sobel_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    magnitude = cv2.magnitude(sobel_x, sobel_y)
    normalized = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    heat = cv2.applyColorMap(normalized, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(original, 0.65, heat, 0.35, 0)
    return overlay


def image_to_data_url(image: np.ndarray) -> str:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    _, buffer = cv2.imencode(".png", rgb)
    encoded = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
