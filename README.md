# MediVision AI

MediVision AI is a full-stack medical imaging assistant with a doctor dashboard, patient portal, and an AI microservice for scan enhancement, prediction, and heatmap generation.

## Project Structure

```text
/client       React + Vite frontend
/server       Node.js + Express + MongoDB API
/ai-service   Python FastAPI AI microservice
```

## What It Includes

- JWT-based authentication with doctor and patient roles
- Doctor dashboard for scan uploads, viewer workflow, notes, and diagnosis capture
- AI analysis endpoint with enhancement, prediction, and heatmap output
- Patient portal with report viewing, simple explanations, and medicine reminders
- Rural/offline mode with local caching
- Free and open-source stack only

## Demo Credentials

- Doctor: `doctor@medivision.ai` / `doctor123`
- Patient: `patient@medivision.ai` / `patient123`

## Setup

### 1) Start MongoDB

You can run MongoDB locally or leave `MONGO_URI` unset to use the built-in in-memory demo mode.

### 2) Start the AI service

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3) Start the API server

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

### 4) Start the client

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/uploads/analyze`
- `GET /api/reports`
- `GET /api/reports/:patientId`
- `GET /api/patients`
- `GET /api/patients/profile`
- `GET /api/patients/summary`
- `GET /api/reminders/:patientId`
- `POST /api/reminders`
- `PATCH /api/reminders/:id`
- `DELETE /api/reminders/:id`

## AI Contract

`POST /analyze`

```json
{
  "file_name": "scan.png",
  "base64": "data:image/png;base64,...",
  "mime_type": "image/png",
  "modality": "xray"
}
```

Response:

```json
{
  "enhanced_image": "data:image/png;base64,...",
  "prediction": "Possible pneumonia pattern",
  "confidence": 78.2,
  "heatmap": "data:image/png;base64,...",
  "summary": "..."
}
```

## Notes

- The server falls back to an in-memory demo store if MongoDB is unavailable.
- The client caches the latest analysis in local storage for rural/offline mode.
- The AI service uses OpenCV enhancement and a heuristic heatmap pipeline, with optional DICOM support through `pydicom`.
"# MedVision" 
