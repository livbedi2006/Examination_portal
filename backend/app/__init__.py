from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from config import Config
from app.database import Base, engine
from app.routes import auth, exams, proctoring, subjects, config

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Exam System...")
    yield
    # Shutdown
    print("Shutting down Exam System...")

app = FastAPI(
    title="Exam System API",
    description="AI-powered adaptive exam system with proctoring",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS if "*" not in Config.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Routes
app.include_router(config.router)
app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(proctoring.router)
app.include_router(subjects.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Exam System API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
