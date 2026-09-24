import os
import asyncio
import logging
import json
import base64
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status, Depends, Security, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field, HttpUrl, ConfigDict
import httpx

# Generative AI & Third-Party SDKs
import google.genai as genai
from google.genai import types
import replicate
from elevenlabs.client import ElevenLabs

# ==========================================
# Logging & System Configurations
# ==========================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s (%(lineno)d) - %(message)s",
)
logger = logging.getLogger("thunders-ai-core")

# Environment Variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
CANVA_API_KEY = os.getenv("CANVA_API_KEY")
THUNDERS_SERVICE_KEY = os.getenv("THUNDERS_SERVICE_KEY", "thunders-dev-secret-key")

DEFAULT_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-2.5-flash")
DEFAULT_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "imagen-3.0-generate-002")

# Global SDK Clients
genai_client: Optional[genai.Client] = None
elevenlabs_client: Optional[ElevenLabs] = None

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# ==========================================
# Lifecycle Management
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for SDK client initializations.
    """
    global genai_client, elevenlabs_client
    logger.info("Initializing Thunders Generative AI-Core Microservice...")

    # Initialize Gemini SDK
    if GEMINI_API_KEY:
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Google GenAI Client initialized successfully.")
    else:
        logger.warning("GEMINI_API_KEY missing. Text and Imagen routes will fail.")

    # Initialize ElevenLabs SDK
    if ELEVENLABS_API_KEY:
        elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        logger.info("ElevenLabs SDK initialized successfully.")
    else:
        logger.warning("ELEVENLABS_API_KEY missing. Audio features will be disabled.")

    yield

    logger.info("Shutting down Thunders Generative AI-Core Microservice...")

# ==========================================
# FastAPI App Initialization
# ==========================================
app = FastAPI(
    title="Thunders Generative - Advanced AI Core",
    description="Multimodal Enterprise AI Engine for Text, Audio Sync, Image Synthesis, Video Generation, Notebook Execution, and Canva Design Integration.",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Security Middleware
# ==========================================
async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != THUNDERS_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header credential.",
        )
    return api_key

# ==========================================
# Enums & Pydantic Data Contracts
# ==========================================
class VideoAspectRatios(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"

class CanvasExportFormat(str, Enum):
    PNG = "png"
    SVG = "svg"
    PDF = "pdf"

# --- Voice Schemas ---
class TTSRequest(BaseModel):
    text: str = Field(..., description="Text payload to synthesize into speech")
    voice_id: str = Field(default="21m00Tcm4TlvDq8ikWAM", description="ElevenLabs Voice ID")
    model_id: str = Field(default="eleven_multilingual_v2", description="Audio model selection")
    stability: float = Field(default=0.5, ge=0.0, le=1.0)
    similarity_boost: float = Field(default=0.75, ge=0.0, le=1.0)

class TTSResponse(BaseModel):
    status: str
    audio_base64: str
    mime_type: str = "audio/mpeg"

# --- Image Schemas ---
class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., description="High-detail prompt for image generation")
    aspect_ratio: str = Field(default="1:1", description="Options: 1:1, 3:4, 4:3, 9:16, 16:9")
    number_of_images: int = Field(default=1, ge=1, le=4)
    negative_prompt: Optional[str] = Field(default=None)

class ImageGenerationResponse(BaseModel):
    status: str
    images_base64: List[str]

# --- Video Schemas ---
class VideoGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt describing the video scene")
    image_url: Optional[HttpUrl] = Field(default=None, description="Image source for Image-to-Video mode")
    aspect_ratio: VideoAspectRatios = Field(default=VideoAspectRatios.RATIO_16_9)
    duration_seconds: int = Field(default=5, ge=2, le=10)

class VideoJobResponse(BaseModel):
    status: str
    job_id: str
    prediction_url: str

# --- Jupyter Notebook Schemas ---
class NotebookCell(BaseModel):
    cell_type: str = Field(..., description="'code' or 'markdown'")
    source: List[str] = Field(..., description="Lines of text or python code")

class BuildNotebookRequest(BaseModel):
    topic: str = Field(..., description="Technical topic or task requirements")
    include_markdown_explanations: bool = Field(default=True)

class NotebookResponse(BaseModel):
    status: str
    notebook_json: Dict[str, Any]

# --- Canva / Visual Design Schemas ---
class CanvaDesignRequest(BaseModel):
    title: str = Field(..., description="Title of the design layout")
    brand_color_hex: str = Field(default="#1A1A1A", description="Primary brand color")
    elements: List[Dict[str, Any]] = Field(..., description="Visual elements specifications")
    export_format: CanvasExportFormat = Field(default=CanvasExportFormat.PNG)

class CanvaDesignResponse(BaseModel):
    status: str
    design_id: str
    export_url: str
    generated_svg: Optional[str] = None

# ==========================================
# Core Engine Handlers
# ==========================================

@app.get("/health", tags=["System Ops"])
async def health_check():
    """Health check validating configured third-party engine integrations."""
    return {
        "status": "healthy",
        "engines": {
            "google_genai": genai_client is not None,
            "elevenlabs": elevenlabs_client is not None,
            "replicate": bool(REPLICATE_API_TOKEN),
            "canva": bool(CANVA_API_KEY),
        },
    }

# ------------------------------------------
# 1. VOICE SYNTHESIS (TTS)
# ------------------------------------------
@app.post(
    "/api/v1/voice/generate",
    response_model=TTSResponse,
    dependencies=[Depends(verify_api_key)],
    tags=["Voice Engine"],
)
async def generate_voice(payload: TTSRequest):
    """
    Generates realistic speech audio using the ElevenLabs API.
    """
    if not elevenlabs_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ElevenLabs client is not configured on this server.",
        )

    try:
        audio_stream = elevenlabs_client.generate(
            text=payload.text,
            voice=payload.voice_id,
            model=payload.model_id,
            voice_settings={
                "stability": payload.stability,
                "similarity_boost": payload.similarity_boost,
            },
        )

        audio_bytes = b"".join(audio_stream)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        return TTSResponse(status="success", audio_base64=audio_b64)

    except Exception as exc:
        logger.error(f"Voice generation failure: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice synthesis failed: {str(exc)}",
        )

# ------------------------------------------
# 2. IMAGE GENERATION
# ------------------------------------------
@app.post(
    "/api/v1/image/generate",
    response_model=ImageGenerationResponse,
    dependencies=[Depends(verify_api_key)],
    tags=["Image Engine"],
)
async def generate_image(payload: ImageGenerationRequest):
    """
    Generates high-fidelity images using Google GenAI Imagen 3 SDK.
    """
    if not genai_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google GenAI SDK is not initialized.",
        )

    try:
        result = genai_client.models.generate_images(
            model=DEFAULT_IMAGE_MODEL,
            prompt=payload.prompt,
            config=types.GenerateImagesConfig(
                number_of_images=payload.number_of_images,
                aspect_ratio=payload.aspect_ratio,
                output_mime_type="image/jpeg",
            ),
        )

        images_b64 = []
        for generated_image in result.generated_images:
            b64_str = base64.b64encode(generated_image.image.image_bytes).decode("utf-8")
            images_b64.append(b64_str)

        return ImageGenerationResponse(status="success", images_base64=images_b64)

    except Exception as exc:
        logger.error(f"Image generation failure: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image generation failed: {str(exc)}",
        )

# ------------------------------------------
# 3. VIDEO GENERATION (Luma / Runway / ZeroScope via Replicate)
# ------------------------------------------
@app.post(
    "/api/v1/video/generate",
    response_model=VideoJobResponse,
    dependencies=[Depends(verify_api_key)],
    tags=["Video Engine"],
)
async def generate_video(payload: VideoGenerationRequest):
    """
    Dispatches video generation jobs asynchronously to Replicate inference endpoints.
    """
    if not REPLICATE_API_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="REPLICATE_API_TOKEN is not configured.",
        )

    try:
        model_identifier = "luma/ray:5f68b8d4f40f31623832c32cf4b9be38d17b5f3c09e3e782628e93e2b26002f2"
        input_payload = {
            "prompt": payload.prompt,
            "aspect_ratio": payload.aspect_ratio.value,
        }
        if payload.image_url:
            input_payload["input_image"] = str(payload.image_url)

        prediction = replicate.predictions.create(
            version=model_identifier,
            input=input_payload,
        )

        return VideoJobResponse(
            status="processing",
            job_id=prediction.id,
            prediction_url=f"https://api.replicate.com/v1/predictions/{prediction.id}",
        )

    except Exception as exc:
        logger.error(f"Video pipeline submission failure: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video generation pipeline error: {str(exc)}",
        )

# ------------------------------------------
# 4. NOTEBOOK GENERATION
# ------------------------------------------
@app.post(
    "/api/v1/notebook/build",
    response_model=NotebookResponse,
    dependencies=[Depends(verify_api_key)],
    tags=["Notebook Engine"],
)
async def build_jupyter_notebook(payload: BuildNotebookRequest):
    """
    Dynamically generates a `.ipynb` (Jupyter Notebook) JSON structure populated with Python code.
    """
    if not genai_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google GenAI SDK is not initialized.",
        )

    system_prompt = (
        "You are an expert Data Science and Software Engineering Assistant. "
        "Your task is to produce a fully functional Jupyter Notebook JSON structure based on a user's prompt. "
        "Return ONLY valid JSON matching the standard IPYNB format (nbformat v4)."
    )

    user_prompt = f"""
    Create a complete Jupyter Notebook on the topic: '{payload.topic}'.
    Requirements:
    - Executable Python code.
    - Standard import blocks, model/logic implementation, and visualization.
    - Markdown cells describing each step.
    
    Structure the response as a valid JSON object matching this schema:
    {{
      "nbformat": 4,
      "nbformat_minor": 2,
      "metadata": {{
        "language_info": {{ "name": "python" }}
      }},
      "cells": [
        {{
          "cell_type": "markdown",
          "metadata": {{}},
          "source": ["# Title\\n", "Description here."]
        }},
        {{
          "cell_type": "code",
          "execution_count": null,
          "metadata": {{}},
          "outputs": [],
          "source": ["import numpy as np\\n", "print('Hello World')"]
        }}
      ]
    }}
    """

    try:
        response = genai_client.models.generate_content(
            model=DEFAULT_TEXT_MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        notebook_data = json.loads(response.text)
        return NotebookResponse(status="success", notebook_json=notebook_data)

    except Exception as exc:
        logger.error(f"Notebook generation failure: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate executable notebook: {str(exc)}",
        )

# ------------------------------------------
# 5. CANVA INTEGRATION & VECTOR DESIGN
# ------------------------------------------
@app.post(
    "/api/v1/canva/build-design",
    response_model=CanvaDesignResponse,
    dependencies=[Depends(verify_api_key)],
    tags=["Canva & Design Engine"],
)
async def build_canva_design(payload: CanvaDesignRequest):
    """
    Interacts with Canva Connect API or falls back to an AI-driven SVG design layout engine.
    """
    if CANVA_API_KEY:
        try:
            async with httpx.AsyncClient() as http_client:
                canva_res = await http_client.post(
                    "https://api.canva.com/v1/designs",
                    headers={
                        "Authorization": f"Bearer {CANVA_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "title": payload.title,
                        "design_type": "Presentation",
                    },
                    timeout=10.0,
                )
                if canva_res.status_code in [200, 201]:
                    canva_data = canva_res.json()
                    return CanvaDesignResponse(
                        status="success",
                        design_id=canva_data.get("design", {}).get("id", "canva_external_id"),
                        export_url=canva_data.get("design", {}).get("url", "https://canva.com"),
                    )
        except Exception as e:
            logger.warning(f"Direct Canva Connect API failed, falling back to SVG Engine: {str(e)}")

    # Fallback / Native Generative Vector Design Engine (SVG Generation)
    svg_template = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <rect width="800" height="600" fill="{payload.brand_color_hex}" />
      <text x="40" y="80" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF">
        {payload.title}
      </text>
      <circle cx="700" cy="100" r="50" fill="#FF4081" opacity="0.8" />
      <rect x="40" y="140" width="720" height="400" rx="15" fill="#FFFFFF" opacity="0.1" />
      <text x="60" y="180" font-family="Arial, sans-serif" font-size="20" fill="#E0E0E0">
        Generated automatically by Thunders AI Core Layout Engine
      </text>
    </svg>"""

    encoded_svg = base64.b64encode(svg_template.encode("utf-8")).decode("utf-8")
    data_uri = f"data:image/svg+xml;base64,{encoded_svg}"

    return CanvaDesignResponse(
        status="success",
        design_id="svg_generated_layout_01",
        export_url=data_uri,
        generated_svg=svg_template,
    )

# ==========================================
# Application Runner Entrypoint
# ==========================================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
