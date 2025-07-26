import os
import uvicorn
from api import app

def is_debug_mode():
    """Check if we're running in debug mode"""
    return os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

if __name__ == "__main__":
    debug = is_debug_mode()
    
    # In debug mode, enable auto-reload and more verbose logging
    if debug:
        print("🔧 Running in DEBUG mode with auto-reload enabled")
        uvicorn.run(
            "api:app",  # Use string import for reload to work
            host="0.0.0.0", 
            port=8000,
            reload=True,
            reload_dirs=["."],  # Watch current directory
            log_level="debug"
        )
    else:
        print("🚀 Running in PRODUCTION mode")
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000,
            log_level="info"
        )