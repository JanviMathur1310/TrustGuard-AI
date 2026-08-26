from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os
import tempfile

from backend.detector import detect_threats
from backend.risk_engine import calculate_risk
from backend.voice_detector import analyze_voice


app = FastAPI(
    title="TrustGuard AI API",
    description="AI-powered digital scam detection and risk assessment system",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://janvimathur1310.github.io"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {
        "message": "TrustGuard AI API is running",
        "status": "active"
    }


@app.post("/analyze")
def analyze_message(request: MessageRequest):

    # Detect scam indicators
    indicators = detect_threats(request.text)

    # Calculate risk
    score, risk_level = calculate_risk(indicators)

    # Generate recommendation
    if risk_level == "HIGH":
        recommendation = (
            "HIGH RISK! Do not click links, share OTPs, "
            "transfer money, or provide sensitive information. "
            "Verify through an official channel."
        )

    elif risk_level == "MEDIUM":
        recommendation = (
            "MEDIUM RISK! Be cautious. Do not share sensitive "
            "information until the sender or request is verified."
        )

    else:
        recommendation = (
            "LOW RISK. No major scam indicators were detected. "
            "However, remain cautious with unexpected requests."
        )

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "detected_indicators": indicators,
        "recommendation": recommendation
    }


# ==========================================
# VOICE ANALYSIS
# ==========================================

@app.post("/analyze-voice")
async def analyze_voice_endpoint(file: UploadFile = File(...)):

    # Supported audio formats
    allowed_formats = [".wav", ".mp3", ".ogg", ".flac", ".webm"]

    suffix = os.path.splitext(file.filename)[1].lower()

    if suffix not in allowed_formats:
        return {
            "status": "error",
            "message": (
                "Unsupported audio format. "
                "Please upload WAV, MP3, OGG, or FLAC."
            )
        }

    temp_path = None

    try:

        # Create temporary audio file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_path = temp_file.name

            content = await file.read()
            temp_file.write(content)

        # Analyze the uploaded voice recording
        result = analyze_voice(temp_path)

        return result

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }

    finally:

        # Delete temporary audio file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)