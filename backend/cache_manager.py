import json
import time
from pathlib import Path
from backend.config import Config

class CacheManager:
    @staticmethod
    def _get_cache_path(key: str) -> Path:
        """Sanitize key to prevent path traversal and return the file path."""
        # Replace non-alphanumeric chars to prevent directory traversal
        safe_key = "".join(c for c in key if c.isalnum() or c in ("-", "_")).lower()
        return Config.CACHE_DIR / f"{safe_key}.json"

    @classmethod
    def get(cls, key: str):
        """Retrieve cached JSON data if it exists and has not expired."""
        cache_path = cls._get_cache_path(key)
        
        if not cache_path.exists():
            return None
            
        try:
            # Check modification time
            mtime = cache_path.stat().st_mtime
            age_seconds = time.time() - mtime
            
            if age_seconds > Config.CACHE_TTL:
                # Cache expired, remove it asynchronously or just return None
                return None
                
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading cache for key {key}: {e}")
            return None

    @classmethod
    def set(cls, key: str, data) -> bool:
        """Write JSON-serializable data to a local file cache."""
        try:
            Config.CACHE_DIR.mkdir(parents=True, exist_ok=True)
            cache_path = cls._get_cache_path(key)
            
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error writing cache for key {key}: {e}")
            return False

    @classmethod
    def clear(cls) -> bool:
        """Clear all items in the cache directory."""
        try:
            if Config.CACHE_DIR.exists():
                for item in Config.CACHE_DIR.glob("*.json"):
                    item.unlink()
            return True
        except Exception as e:
            print(f"Error clearing cache directory: {e}")
            return False
