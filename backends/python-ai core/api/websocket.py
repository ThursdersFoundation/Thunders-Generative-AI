"""
==============================================================================
THUNDERS GENERATIVE - REAL-TIME WEBSOCKET STREAMING ENGINE
File: app/api/websocket.py
Description: Enterprise-grade WebSocket handler for real-time token streaming,
             bi-directional AI-Core telemetry broadcasting, session lifecycle
             management, and connection pooling.
Repository: Thunders Generative
==============================================================================
"""

import asyncio
import json
import logging
import time
import uuid
from typing import Dict, Any, List, Optional, Set
from enum import Enum

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends, Query
from pydantic import BaseModel, Field, ValidationError

# Configure internal logger for WebSocket Subsystem
logger = logging.getLogger("ThundersGenerative.API.WebSocket")
logger.setLevel(logging.INFO)

# ------------------------------------------------------------------------------
# 1. ENUMS & SCHEMAS FOR WEBSOCKET PROTOCOL
# ------------------------------------------------------------------------------

class WSMessageType(str, Enum):
    INIT = "init_session"
    START_GENERATION = "start_generation"
    TOKEN_STREAM = "token_stream"
    TELEMETRY_TICK = "telemetry_tick"
    STOP_GENERATION = "stop_generation"
    ERROR = "error"
    COMPLETED = "completed"
    PING = "ping"
    PONG = "pong"

class StreamPayload(BaseModel):
    prompt: str = Field(..., min_length=1)
    model_id: str = Field(default="thunder-llm-v2")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=8192)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    stream_telemetry: bool = Field(default=True)

class WSMessageFrame(BaseModel):
    event: WSMessageType
    session_id: str
    timestamp: float = Field(default_factory=time.time)
    payload: Optional[Dict[str, Any]] = None

# ------------------------------------------------------------------------------
# 2. CONNECTION MANAGER & SESSION POOL
# ------------------------------------------------------------------------------

class WebSocketConnectionManager:
    """
    Manages active WebSocket client connections, channel broadcasting,
    and concurrent connection limits for the Thunders Generative API.
    """
    def __init__(self):
        # Maps session_id -> WebSocket instance
        self.active_connections: Dict[str, WebSocket] = {}
        # Tracks active background generation tasks per session
        self.running_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, session_id: str, websocket: WebSocket) -> None:
        """Accepts and registers a new WebSocket client session."""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"[WS Connect] Active Session Registered: {session_id}")

    def disconnect(self, session_id: str) -> None:
        """Removes a session and cancels any ongoing AI inference tasks."""
        if session_id in self.running_tasks:
            self.running_tasks[session_id].cancel()
            del self.running_tasks[session_id]

        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"[WS Disconnect] Session Cleaned Up: {session_id}")

    async def send_json_frame(self, session_id: str, event: WSMessageType, payload: Dict[str, Any]) -> None:
        """Sends a structured JSON message frame to a specific client."""
        if session_id in self.active_connections:
            frame = WSMessageFrame(
                event=event,
                session_id=session_id,
                payload=payload
            )
            await self.active_connections[session_id].send_text(frame.model_dump_json())

    async def broadcast_telemetry(self, telemetry_data: Dict[str, Any]) -> None:
        """Broadcasts system-wide GPU telemetry metrics to all connected clients."""
        for session_id in list(self.active_connections.keys()):
            try:
                await self.send_json_frame(session_id, WSMessageType.TELEMETRY_TICK, telemetry_data)
            except Exception as e:
                logger.error(f"Failed to broadcast telemetry to session {session_id}: {str(e)}")

ws_manager = WebSocketConnectionManager()

# ------------------------------------------------------------------------------
# 3. AI-CORE STREAMING SIMULATION ENGINE
# ------------------------------------------------------------------------------

class AICoreStreamEngine:
    """
    Simulates token-by-token generation streaming directly from PyTorch / CUDA
    inference kernels embedded in the Thunders Generative AI-Core.
    """
    @staticmethod
    async def stream_generation_pipeline(session_id: str, payload: StreamPayload):
        start_time = time.perf_counter()
        simulated_tokens = (
            f"This is a real-time generative output stream from Thunders Generative AI-Core. "
            f"Processing request for prompt: '{payload.prompt[:40]}...'. "
            f"Hardware acceleration enabled via CUDA/FlashAttention-2 kernels."
        ).split(" ")

        try:
            for index, word in enumerate(simulated_tokens):
                # Simulate token generation latency (e.g., 35ms per token)
                await asyncio.sleep(0.035)

                token_data = {
                    "token_index": index,
                    "token_text": word + " ",
                    "is_final": index == len(simulated_tokens) - 1
                }

                # Send streamed token frame
                await ws_manager.send_json_frame(
                    session_id=session_id,
                    event=WSMessageType.TOKEN_STREAM,
                    payload=token_data
                )

                # Send real-time GPU hardware telemetry tick every 5 tokens
                if payload.stream_telemetry and index % 5 == 0:
                    telemetry_tick = {
                        "gpu_utilization_pct": round(82.4 + (index % 3), 1),
                        "vram_used_gb": 14.8,
                        "throughput_tokens_sec": 38.5,
                        "current_latency_ms": round((time.perf_counter() - start_time) * 1000, 2)
                    }
                    await ws_manager.send_json_frame(
                        session_id=session_id,
                        event=WSMessageType.TELEMETRY_TICK,
                        payload=telemetry_tick
                    )

            # Signal generation completion
            total_time_ms = (time.perf_counter() - start_time) * 1000
            await ws_manager.send_json_frame(
                session_id=session_id,
                event=WSMessageType.COMPLETED,
                payload={
                    "total_tokens": len(simulated_tokens),
                    "execution_time_ms": round(total_time_ms, 2),
                    "average_tps": round(len(simulated_tokens) / (total_time_ms / 1000), 2)
                }
            )

        except asyncio.CancelledError:
            logger.warning(f"Inference pipeline cancelled for session {session_id}")
            await ws_manager.send_json_frame(
                session_id=session_id,
                event=WSMessageType.ERROR,
                payload={"message": "Generation pipeline execution was cancelled by user."}
            )
        except Exception as e:
            logger.error(f"Execution failure in AI-Core stream: {str(e)}")
            await ws_manager.send_json_frame(
                session_id=session_id,
                event=WSMessageType.ERROR,
                payload={"message": f"AI-Core runtime error: {str(e)}"}
            )

# ------------------------------------------------------------------------------
# 4. WEBSOCKET ROUTE HANDLER
# ------------------------------------------------------------------------------

router = APIRouter(
    prefix="/ws/v1",
    tags=["Real-time Streaming WebSockets"]
)

@router.websocket("/generate")
async def websocket_ai_stream_endpoint(
    websocket: WebSocket,
    api_key: Optional[str] = Query(None, alias="api_key")
):
    """
    Main WebSocket endpoint for real-time generative streaming and hardware telemetry.
    """
    session_id = f"wss_{uuid.uuid4().hex[:10]}"
    await ws_manager.connect(session_id, websocket)

    # Send Initialized Handshake Frame
    await ws_manager.send_json_frame(
        session_id=session_id,
        event=WSMessageType.INIT,
        payload={
            "session_id": session_id,
            "status": "connected",
            "server_time": time.time(),
            "ai_core_status": "online"
        }
    )

    try:
        while True:
            # Receive text frame from client
            raw_data = await websocket.receive_text()
            
            try:
                data_dict = json.loads(raw_data)
                event_type = data_dict.get("event")

                # Handle Ping/Pong keep-alive frames
                if event_type == WSMessageType.PING:
                    await ws_manager.send_json_frame(
                        session_id=session_id,
                        event=WSMessageType.PONG,
                        payload={"timestamp": time.time()}
                    )
                    continue

                # Handle Start Generation command
                elif event_type == WSMessageType.START_GENERATION:
                    payload_data = data_dict.get("payload", {})
                    stream_payload = StreamPayload(**payload_data)

                    # Cancel any existing running inference task for this session
                    if session_id in ws_manager.running_tasks:
                        ws_manager.running_tasks[session_id].cancel()

                    # Spawn async task for AI-Core streaming
                    task = asyncio.create_task(
                        AICoreStreamEngine.stream_generation_pipeline(session_id, stream_payload)
                    )
                    ws_manager.running_tasks[session_id] = task

                # Handle Stop Generation command
                elif event_type == WSMessageType.STOP_GENERATION:
                    if session_id in ws_manager.running_tasks:
                        ws_manager.running_tasks[session_id].cancel()
                        del ws_manager.running_tasks[session_id]
                        logger.info(f"Task stopped by client request for session {session_id}")

                else:
                    await ws_manager.send_json_frame(
                        session_id=session_id,
                        event=WSMessageType.ERROR,
                        payload={"message": f"Unsupported event type: '{event_type}'"}
                    )

            except ValidationError as val_err:
                await ws_manager.send_json_frame(
                    session_id=session_id,
                    event=WSMessageType.ERROR,
                    payload={"message": "Invalid schema payload", "details": val_err.errors()}
                )
            except json.JSONDecodeError:
                await ws_manager.send_json_frame(
                    session_id=session_id,
                    event=WSMessageType.ERROR,
                    payload={"message": "Invalid JSON frame received."}
                )

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected gracefully: {session_id}")
    except Exception as e:
        logger.error(f"Unexpected WebSocket error in session {session_id}: {str(e)}")
    finally:
        ws_manager.disconnect(session_id)
