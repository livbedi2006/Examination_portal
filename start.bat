@echo off
REM Exam System Startup Script for Windows

echo ================================
echo Exam System - Full Stack Startup
echo ================================
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.8+
    exit /b 1
)
echo [OK] Python found
echo.

REM Setup Backend
echo Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo Installing backend dependencies...
pip install -q -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy ..\\.env.example .env
    echo WARNING: Please edit .env with your Google OAuth credentials
)

REM Initialize database
echo Initializing database...
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)" 2>nul

echo [OK] Backend setup complete
echo.

REM Start services
echo Starting Exam System...
echo.
echo Frontend will run on: http://localhost:8080
echo Backend will run on:  http://localhost:8000
echo API Docs:            http://localhost:8000/docs
echo.
echo Starting services...
echo.

REM Start frontend in new window
cd ..\frontend
start "Exam System - Frontend" cmd /k python -m http.server 8080

REM Start backend in new window
cd ..\backend
start "Exam System - Backend" cmd /k python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

echo.
echo ================================
echo Services are starting...
echo ================================
echo.
echo Open your browser to: http://localhost:8080
echo.
echo Press Ctrl+C in each window to stop the services
echo.

timeout /t 5 /nobreak
