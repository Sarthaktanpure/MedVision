# 🧠 MediVision AI  
### AI-Powered Medical Imaging Assistant for Doctors & Patients  

---

## 🚀 Overview

**MediVision AI** is a full-stack AI-powered healthcare platform designed to assist doctors in analyzing medical scans (CT, MRI, X-ray) and provide patients with intelligent post-diagnosis care.

The system combines **medical image enhancement, disease detection, explainable AI, and patient management** into a single unified platform.

> 🎯 Goal: Improve diagnostic accuracy, reduce workload for doctors, and make healthcare more accessible — even in low-resource environments.

---

## ✨ Key Features

### 🧑‍⚕️ Doctor Dashboard
- Upload CT / MRI / X-ray scans (including DICOM)
- Interactive slice viewer for multi-image scans
- Toggle between:
  - Original Image
  - Enhanced Image
  - AI Heatmap Overlay
- Add notes and diagnosis
- Save patient records

---

### 🤖 AI Imaging Engine
- Image Enhancement using OpenCV (denoising, contrast improvement)
- Disease Detection using CNN / pretrained models
- Confidence score for predictions
- Explainable AI (Grad-CAM) for heatmap visualization

---

### 📊 Scan Comparison & Progress Tracking
- Compare previous and current scans
- Monitor disease progression or recovery
- Visual insights for better decision-making

---

### 🧾 AI Report Generation
- Structured medical report including:
  - Predicted condition
  - Confidence score
  - Visual explanation
  - Summary

---

### 🧑 Patient Portal
- View reports in simple language
- Medicine schedule and reminders
- Profile management
- Access diagnosis history

---

### 🌍 Rural Healthcare Mode (Basic Simulation)
- Offline support using local storage
- Sync data when internet is available
- Designed for low-connectivity environments

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- shadcn/ui
- Axios
- Zustand / Redux Toolkit

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Multer (file upload)

### AI Service
- Python (FastAPI)
- PyTorch / TensorFlow
- OpenCV
- pydicom

---

## 📁 Project Structure

MediVision-AI/
│
├── client/        # React Frontend
├── server/        # Node.js Backend
├── ai-service/    # Python AI Microservice
│
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

git clone https://github.com/your-username/MediVision-AI.git  
cd MediVision-AI  

---

### 2️⃣ Setup Backend

cd server  
npm install  

Create `.env` file:

PORT=5000  
MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret_key  
AI_SERVICE_URL=http://localhost:8000  

Run backend:

npm run dev  

---

### 3️⃣ Setup Frontend

cd client  
npm install  
npm run dev  

---

### 4️⃣ Setup AI Service

cd ai-service  
pip install -r requirements.txt  
uvicorn main:app --reload  

---

## 🔌 API Endpoints

### Auth
- POST /api/auth/register  
- POST /api/auth/login  

### Scan & AI
- POST /api/upload  
- POST /analyze (AI Service)  

### Patient
- GET /api/patient/:id  
- POST /api/report  

---

## 🧪 Demo Flow

1. Login as Doctor  
2. Upload medical scan  
3. AI processes image  
4. View:
   - Enhanced image  
   - Prediction  
   - Heatmap  
5. Generate report  
6. Patient views report in portal  

---

## 🔐 Security Features

- JWT Authentication  
- Role-Based Access Control (Doctor / Patient)  
- Secure file handling  

---

## 💡 Future Enhancements

- Full DICOM viewer integration  
- Advanced AI models (multi-disease detection)  
- Real-time doctor-patient chat  
- Cloud deployment (AWS/GCP)  
- Fully functional offline-first architecture  
- Multi-language & voice support  

---

## 🏆 Why This Project Stands Out

- Combines AI + Full Stack Development  
- Uses Explainable AI (rare in student projects)  
- Solves real-world healthcare problems  
- Includes doctor + patient ecosystem  
- Designed for scalability and real impact  

---

## 📸 Screenshots (Add Later)

- Doctor Dashboard  
- AI Heatmap View  
- Patient Portal  
- Upload Interface  

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Sarthak Tanpure  
B.Tech IT Student  
Aspiring Software Engineer (FAANG Target 🎯)  

---

## ⭐ Support

If you like this project:

Star this repo  
Share with others  
Give feedback  

---

> 🚀 Building intelligent systems that solve real-world problems.
