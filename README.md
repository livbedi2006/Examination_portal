# Exam System - AI-Powered Adaptive Exam Platform with Real-Time Proctoring

A complete full-stack exam system featuring Google OAuth authentication, adaptive AI-driven questioning, real-time proctoring with violation detection, and comprehensive student performance analytics.

## 🚀 Quick Start

### Windows
```bash
start.bat
```

### macOS/Linux
```bash
bash start.sh
```

This will:
1. Create Python virtual environment
2. Install dependencies
3. Start Backend API on `http://localhost:8000`
4. Start Frontend on `http://localhost:8080`

## 📋 Overview

The system is divided into **Frontend** and **Backend** for clear separation of concerns:

### Frontend (`/frontend`)
- Interactive web interface built with HTML5, CSS3, Vanilla JavaScript
- No build process needed - just run and access via browser
- Google Sign-in integration
- Real-time proctoring monitor
- Exam interface with adaptive questions
- Results and performance analytics

### Backend (`/backend`)
- FastAPI REST API with Swagger documentation
- SQLAlchemy ORM with SQLite/PostgreSQL support
- JWT authentication with Google OAuth 2.0
- WebSocket support for real-time proctoring
- Integration with trained AI models
- Comprehensive database models

## 📁 Project Structure

```
student examination system/
├── frontend/                    # Web frontend
│   ├── index.html              # Main HTML file
│   ├── css/
│   │   └── styles.css          # Responsive styling
│   ├── js/
│   │   ├── api.js              # API client
│   │   ├── app.js              # Main application logic
│   │   ├── exam.js             # Exam utilities
│   │   └── proctoring.js       # Proctoring monitor
│   └── README.md               # Frontend documentation
│
├── backend/                     # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py         # FastAPI app setup
│   │   ├── auth.py             # Authentication utilities
│   │   ├── database.py         # Database configuration
│   │   ├── schemas.py          # Pydantic models
│   │   ├── exam_engine.py      # Exam logic & AI integration
│   │   ├── models/
│   │   │   ├── user.py         # User model
│   │   │   └── exam.py         # Exam & proctoring models
│   │   └── routes/
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── exams.py        # Exam endpoints
│   │       ├── proctoring.py   # Proctoring endpoints
│   │       └── subjects.py     # Subject/job role endpoints
│   ├── config.py               # Configuration settings
│   ├── requirements.txt        # Python dependencies
│   ├── README.md               # Backend documentation
│   └── .env.example            # Environment template
│
├── Ai_models/                   # Your trained ML models
├── Proctoring/                  # Proctoring system with YOLO, MediaPipe
├── data/                        # Question bank
└── models/                      # Trained model files
```

## 🔧 System Requirements

- Python 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 4GB+ RAM
- Webcam (for proctoring)

## 📦 Installation

### Step 1: Clone/Download
```bash
cd "student examination system"
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Step 3: Run Startup Script

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
bash start.sh
```

## 🎯 Features

### Authentication
- ✅ Google OAuth 2.0 sign-in
- ✅ Secure JWT tokens
- ✅ User profile management

### Exam Taking
- ✅ Job role-based subject selection
- ✅ Adaptive difficulty algorithm
- ✅ Real-time score tracking
- ✅ Multiple choice questions

### AI Integration
- ✅ Difficulty prediction model
- ✅ Adaptive question sequencing
- ✅ Performance analytics

### Proctoring
- ✅ Real-time camera monitoring
- ✅ Violation logging
- ✅ Attention level tracking
- ✅ WebSocket real-time updates

### Results & Analytics
- ✅ Immediate score display
- ✅ Performance metrics
- ✅ Exam history

## 🔌 API Endpoints

### Base URL: `http://localhost:8000`

#### Authentication
```
POST   /auth/google              → Sign in with Google
POST   /auth/register            → Register new user
GET    /auth/me                  → Get current user
PUT    /auth/me                  → Update profile
```

#### Exams
```
POST   /exams/start              → Start new exam
GET    /exams/{exam_id}          → Get exam status
POST   /exams/submit-answer      → Submit answer
POST   /exams/complete/{exam_id} → Complete exam
GET    /exams/history/{user_id}  → Get exam history
```

#### Subjects
```
GET    /subjects/job-roles       → Get all job roles
GET    /subjects/by-role/{role}  → Get subjects for role
GET    /subjects/all             → Get all subjects
```

#### Proctoring
```
POST   /proctoring/start/{exam_id}              → Start monitoring
GET    /proctoring/status/{exam_id}            → Get status
POST   /proctoring/log-violation/{exam_id}     → Log violation
WS     /proctoring/ws/{exam_id}/{user_id}      → WebSocket monitoring
```

## 📊 Supported Job Roles & Subjects

### Software Engineer
- Data Structures & Algorithms
- Object-Oriented Programming
- System Design

### Data Scientist
- Statistics & Probability
- Machine Learning
- Data Analysis

### Frontend Developer
- HTML & CSS
- JavaScript
- React.js

### Backend Developer
- Databases
- API Design
- Backend Frameworks

## 🔐 Security Features

- OAuth 2.0 authentication
- JWT tokens
- CORS protection
- Database validation
- Camera permissions handling
