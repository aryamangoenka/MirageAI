"""
CORS Configuration for FastAPI
Person D - DevOps / Glue Engineer
Phase 2 (Hours 2-6): Ensure frontend can call backend
"""

import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


def configure_cors(app):
    """
    Configure CORS middleware for FastAPI app

    Args:
        app: FastAPI application instance

    Usage:
        from fastapi import FastAPI
        from utils.cors_config import configure_cors

        app = FastAPI()
        configure_cors(app)
    """

    # Get allowed origins from environment
    allowed_origins_str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    )

    # Parse comma-separated origins
    allowed_origins = [
        origin.strip()
        for origin in allowed_origins_str.split(",")
    ]

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,  # Specific origins for security
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,  # Cache preflight requests for 10 minutes
    )

    print(f"✓ CORS configured for origins: {allowed_origins}")


def get_cors_config():
    """
    Get CORS configuration as dict (useful for documentation)

    Returns:
        dict with CORS settings
    """
    allowed_origins_str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    )

    return {
        "allowed_origins": [o.strip() for o in allowed_origins_str.split(",")],
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
        "expose_headers": ["*"],
        "max_age": 600
    }
