import sys
import os

# Define project directories
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# Ensure paths are in sys.path
for directory in [ROOT_DIR, BACKEND_DIR]:
    if directory not in sys.path:
        sys.path.insert(0, directory)

# Set environment variable indicating Vercel execution
os.environ.setdefault("VERCEL", "1")

# On Vercel, the filesystem is read-only except /tmp
# Default SQLite database to a temporary location if no external database URL is supplied
if "DATABASE_URL" not in os.environ:
    import tempfile
    temp_db = os.path.join(tempfile.gettempdir(), "exam_system.db").replace("\\", "/")
    os.environ["DATABASE_URL"] = f"sqlite:///{temp_db}"

# Import FastAPI application from backend/app/__init__.py
from app import app
