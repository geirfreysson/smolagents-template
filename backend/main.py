import os
import uvicorn
from api import app

def is_debug_mode():
    """Check if we're running in debug mode"""
    return os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

if __name__ == "__main__":
    debug = is_debug_mode()
    port = int(os.getenv("PORT", 8000))
    
    # In debug mode, enable auto-reload and more verbose logging
    if debug:
        print(f"🔧 Running in DEBUG mode with auto-reload enabled on port {port}")
        uvicorn.run(
            "api:app",  # Use string import for reload to work
            host="0.0.0.0", 
            port=port,
            reload=True,
            reload_dirs=["."],  # Watch current directory
            log_level="debug"
        )
    else:
        print(f"🚀 Running in PRODUCTION mode on port {port}")
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=port,
            log_level="info"
        )