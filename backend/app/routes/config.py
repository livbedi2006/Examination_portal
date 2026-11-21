from typing import Optional, Dict
from fastapi import APIRouter
from pydantic import BaseModel
from config import Config

router = APIRouter(prefix="/config", tags=["Configuration"])

class FrontendConfig(BaseModel):
    google_client_id: str
    github_client_id: str
    backend_url: str
    api_version: str = "1.0"
    firebase_config: Optional[Dict[str, str]] = None

@router.get("/frontend", response_model=FrontendConfig)
async def get_frontend_config():
    """
    Get frontend configuration including Firebase and OAuth Client IDs
    """
    fb_config = None
    if Config.FIREBASE_API_KEY:
        fb_config = {
            "apiKey": Config.FIREBASE_API_KEY,
            "authDomain": Config.FIREBASE_AUTH_DOMAIN or (f"{Config.FIREBASE_PROJECT_ID}.firebaseapp.com" if Config.FIREBASE_PROJECT_ID else ""),
            "projectId": Config.FIREBASE_PROJECT_ID,
            "storageBucket": Config.FIREBASE_STORAGE_BUCKET or (f"{Config.FIREBASE_PROJECT_ID}.appspot.com" if Config.FIREBASE_PROJECT_ID else ""),
            "messagingSenderId": Config.FIREBASE_MESSAGING_SENDER_ID,
            "appId": Config.FIREBASE_APP_ID
        }

    return FrontendConfig(
        google_client_id=Config.GOOGLE_CLIENT_ID,
        github_client_id=Config.GITHUB_CLIENT_ID,
        backend_url=Config.BACKEND_URL or "http://localhost:8000",
        api_version="1.0",
        firebase_config=fb_config
    )
