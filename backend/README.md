# Exam System Backend

A FastAPI-based backend for an AI-powered adaptive exam system with real-time proctoring.

## Features

- **Google OAuth 2.0 Authentication** - Secure sign-in with Google
- **Adaptive Questioning** - Difficulty adjusts based on student performance
- **Real-time Proctoring** - Camera monitoring and violation detection
- **User Management** - Student profiles and exam history
- **REST API** - Full API documentation with Swagger/OpenAPI
- **WebSocket Support** - Real-time proctoring communication

## Tech Stack

- FastAPI 0.104+
- SQLAlchemy ORM
- SQLite/PostgreSQL Database
- JWT Authentication
- WebSocket Support
- Pydantic Validation

## Installation

### Prerequisites

- Python 3.8+
- pip or conda

### Setup

1. Clone the repository:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize database:
```bash
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

## Running the Server

### Development

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/google` - Google OAuth sign-in
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `PUT /auth/me` - Update user profile

### Exams
- `POST /exams/start` - Start new exam
- `GET /exams/{exam_id}` - Get exam status
- `POST /exams/submit-answer` - Submit answer
- `POST /exams/complete/{exam_id}` - Complete exam
- `GET /exams/history/{user_id}` - Get exam history

### Subjects
- `GET /subjects/job-roles` - Get all job roles
- `GET /subjects/by-role/{job_role}` - Get subjects for role
- `GET /subjects/all` - Get all subjects

### Proctoring
- `POST /proctoring/start/{exam_id}` - Start proctoring
- `GET /proctoring/status/{exam_id}` - Get proctoring status
- `POST /proctoring/log-violation/{exam_id}` - Log violation
- `WS /proctoring/ws/{exam_id}/{user_id}` - WebSocket monitoring

## Configuration

Edit `config.py` to customize:

- Database URL
- JWT settings
- CORS origins
- Proctoring configuration
- AI model paths

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:8000/auth/google/callback`
   - `http://localhost:3000` (frontend)
6. Copy Client ID and Secret to `.env`

## Database

The system uses SQLAlchemy ORM supporting:
- SQLite (development)
- PostgreSQL (production)

Models:
- **User** - Student accounts with Google OAuth integration
- **ExamSession** - Exam attempts and results
- **ProctoringRecord** - Violation logs with severity levels

## Integration with AI Models

The backend integrates with your trained models:
- Question difficulty prediction
- Adaptive question selection
- Performance analytics

Models should be saved as:
- `models/difficulty_model.pkl`
- `models/tfidf_vectorizer.pkl`
- `data/clean_questions.csv`

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process and restart
```

### Database Locked Error
```bash
# Remove old database and let it recreate
rm exam_system.db
```

### Google Auth Not Working
- Verify Client ID in `.env`
- Check redirect URI matches exactly
- Clear browser cookies and try again

## Performance Tuning

For production deployments:
- Use PostgreSQL instead of SQLite
- Enable connection pooling
- Add caching layer (Redis)
- Configure CORS appropriately
- Use reverse proxy (Nginx)

## License

This project is part of the Student Examination System.

## Support

For issues, check the logs or open an issue in the repository.
