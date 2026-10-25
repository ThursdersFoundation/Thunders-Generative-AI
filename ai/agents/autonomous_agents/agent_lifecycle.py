"""Lifecycle hooks fired around agent execution."""

from __future__ import annotations

import logging
from collections import defaultdict
from collections.abc import Awaitable, Callable
from enum import Enum

logger = logging.getLogger(__name__)

Hook = Callable[[dict], Awaitable[None]]


class LifecycleEvent(str, Enum):
    ON_START = "on_start"
    BEFORE_STEP = "before_step"
    AFTER_STEP = "after_step"
    ON_TOOL_CALL = "on_tool_call"
    ON_FINISH = "on_finish"
    ON_ERROR = "on_error"


class Lifecycle:
    """Registry of async hooks; hooks must never break the agent loop."""

    def __init__(self) -> None:
        self._hooks: dict[LifecycleEvent, list[Hook]] = defaultdict(list)

    def register(self, event: LifecycleEvent, hook: Hook) -> None:
        self._hooks[event].append(hook)

    async def emit(self, event: LifecycleEvent, payload: dict) -> None:
        for hook in self._hooks[event]:
            try:
                await hook(payload)
            except Exception:  # noqa: BLE001 — observability must not crash runs
                logger.exception("lifecycle hook failed for %s", event)
