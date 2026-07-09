#!/bin/bash
# Exam System Startup Script

echo "================================"
echo "Exam System - Full Stack Startup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if ! command -v python &> /dev/null; then
    echo -e "${RED}Python not found. Please install Python 3.8+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found${NC}"
echo ""

# Setup Backend
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install requirements
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp ../.env.example .env
    echo -e "${YELLOW}⚠ Please edit .env with your Google OAuth credentials${NC}"
fi

# Initialize database
echo "Initializing database..."
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)" 2>/dev/null

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Start Backend
echo -e "${YELLOW}Starting Backend API...${NC}"
echo "Backend will run on http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""

# Start frontend server in background
cd ../frontend
echo -e "${YELLOW}Starting Frontend Server...${NC}"
echo "Frontend will run on http://localhost:8080"
echo ""

if command -v python3 &> /dev/null; then
    python3 -m http.server 8080 &
else
    python -m http.server 8080 &
fi
FRONTEND_PID=$!

# Start backend
cd ../backend
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Exam System is Running!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔌 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Handle cleanup on exit
trap "kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; echo 'Services stopped'" EXIT

# Wait for processes
wait
