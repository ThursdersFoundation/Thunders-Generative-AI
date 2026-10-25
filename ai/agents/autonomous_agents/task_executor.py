"""Execution of a single task unit (tool invocation or subtask)."""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

TaskHandler = Callable[[dict], Awaitable[str]]


@dataclass(slots=True)
class Task:
    """A unit of work the agent can execute, optionally via a tool."""

    id: str
    description: str
    tool: str | None = None            # None -> handled by a registered handler
    args: dict = field(default_factory=dict)
    depends_on: list[str] = field(default_factory=list)


class TaskExecutor:
    """Routes tasks to tool calls or registered async handlers."""

    def __init__(self) -> None:
        self._handlers: dict[str, TaskHandler] = {}

    def register_handler(self, task_kind: str, handler: TaskHandler) -> None:
        self._handlers[task_kind] = handler

    async def execute(self, task: Task) -> str:
        """Run one task and return its textual observation."""
        handler = self._handlers.get(task.id) or self._handlers.get(task.description)
        if handler is not None:
            return await handler(task.args)
        if task.tool is None:
            raise NotImplementedError(
                f"no handler or tool for task '{task.id}' — register one or set task.tool"
            )
        # TODO: delegate to ai.agents.tools.tool_executor.ToolExecutor
        raise NotImplementedError("tool-backed task execution is not wired up yet")
