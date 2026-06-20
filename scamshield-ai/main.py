"""
ScamShield AI — FastAPI AI service.

Exposes scam analysis endpoints consumed by the Express backend
(scamshield-backend), which in turn is called by the Next.js frontend.

This service does NOT handle file uploads directly — the Express backend
runs OCR (Tesseract) on screenshots and sends the EXTRACTED TEXT here via
the same /analyze-text logic. Keeps this service focused on analysis only.
"""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from utils.hybrid_detector import run_hybrid_analysis
from utils.url_analyzer import analyze_url_heuristics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scamshield.main")

app = FastAPI(
    title="ScamShield AI Service",
    description="Hybrid rule-based + LLM scam detection for ScamShield AI.",
    version="1.0.0",
)

# Allow the Express backend (and, during local dev, direct frontend calls)
# to reach this service. Tighten allow_origins in production if this
# service is ever exposed publicly rather than just to the backend.
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000)


class UrlAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)


@app.get("/")
def health_check():
    """Basic health check — used by Render and for quick manual verification."""
    return {"status": "ok", "service": "scamshield-ai"}


@app.post("/analyze-text")
def analyze_text(payload: TextAnalysisRequest):
    """
    Analyzes free-form text (SMS, email, WhatsApp, job offer, or OCR-extracted
    screenshot text) for scam indicators using the hybrid detector.
    """
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text must not be empty.")

    try:
        result = run_hybrid_analysis(text)
        return result
    except Exception as exc:
        logger.exception("Unexpected error during text analysis")
        raise HTTPException(
            status_code=500, detail="Analysis failed unexpectedly."
        ) from exc


@app.post("/analyze-url")
def analyze_url(payload: UrlAnalysisRequest):
    """
    Analyzes a URL for phishing / scam indicators using heuristic checks
    (suspicious domains, TLDs, shorteners, brand impersonation patterns).
    """
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL must not be empty.")

    try:
        result = analyze_url_heuristics(url)
        return result
    except Exception as exc:
        logger.exception("Unexpected error during URL analysis")
        raise HTTPException(
            status_code=500, detail="Analysis failed unexpectedly."
        ) from exc
