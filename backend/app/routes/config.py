from fastapi import APIRouter
from pydantic import BaseModel
from config import Config

router = APIRouter(prefix="/config", tags=["Configuration"])

class FrontendConfig(BaseModel):
    google_client_id: str
    github_client_id: str
    backend_url: str
    api_version: str = "1.0"

@router.get("/frontend", response_model=FrontendConfig)
async def get_frontend_config():
    """
    Get frontend configuration including Google OAuth Client ID
    """
    return FrontendConfig(
        google_client_id=Config.GOOGLE_CLIENT_ID,
        github_client_id=Config.GITHUB_CLIENT_ID,
        backend_url=Config.BACKEND_URL or "http://localhost:8000",
        api_version="1.0"
    )
