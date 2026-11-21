import os
from dotenv import load_dotenv

# The startup scripts create backend/.env, so load it before reading settings.
load_dotenv()

class Config:
    # Database
    _default_db = "sqlite:////tmp/exam_system.db" if os.getenv("VERCEL") else "sqlite:///./exam_system.db"
    DATABASE_URL = os.getenv("DATABASE_URL", _default_db)
    
    # Backend URL for frontend access
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-12345")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    
    # Firebase Configuration
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "")
    FIREBASE_AUTH_DOMAIN = os.getenv("FIREBASE_AUTH_DOMAIN", "")
    FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    FIREBASE_MESSAGING_SENDER_ID = os.getenv("FIREBASE_MESSAGING_SENDER_ID", "")
    FIREBASE_APP_ID = os.getenv("FIREBASE_APP_ID", "")

    # Google OAuth (Legacy / Direct)
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "YOUR_GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
    
    # GitHub OAuth
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "YOUR_GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "YOUR_GITHUB_CLIENT_SECRET")
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Proctoring
    ENABLE_PROCTORING = True
    PROCTORING_CONFIG_PATH = "../Proctoring/config.json"
    
    # Exam Settings
    QUESTIONS_CSV_PATH = "../data/clean_questions.csv"
    DIFFICULTY_MODEL_PATH = "../models/difficulty_model.pkl"
    VECTORIZER_PATH = "../models/tfidf_vectorizer.pkl"
    
    # CORS
    CORS_ORIGINS = [
        "*",
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8000",
    ]
    
    # Session
    SESSION_TIMEOUT_MINUTES = 180  # 3 hours
