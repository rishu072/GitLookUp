import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the root .env file if it exists
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Config:
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
    PORT = int(os.getenv("PORT", 5000))
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    
    # Caching configs
    CACHE_DIR = root_dir / ".cache"
    # Default TTL of 1 hour (3600 seconds)
    CACHE_TTL = int(os.getenv("CACHE_TTL", 3600))
    
    # Enable CORS
    CORS_HEADERS = "Content-Type"
