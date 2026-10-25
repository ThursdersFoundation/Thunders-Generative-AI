"""Start / pause / resume / cancel control over an agent run."""

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

from ai.agents.autonomous_agents.agent_state import AgentState, AgentStatus

if TYPE_CHECKING:
    from ai.agents.autonomous_agents.agent_executor import AgentExecutor


class AgentController:
    """Cooperative control: the executor calls `checkpoint()` between steps."""

    def __init__(self, executor: AgentExecutor) -> None:
        self.executor = executor
        self._paused = asyncio.Event()
        self._cancelled = asyncio.Event()

    @property
    def is_cancelled(self) -> bool:
        return self._cancelled.is_set()

    def pause(self) -> None:
        self._paused.set()

    def resume(self) -> None:
        self._paused.clear()

    def cancel(self) -> None:
        self._cancelled.set()
        self._paused.clear()  # unblock a paused run so it can observe the cancel

    async def checkpoint(self) -> None:
        """Wait while paused; raise CancelledError when cancelled."""
        if self._cancelled.is_set():
            self.executor.state.status = AgentStatus.CANCELLED
            raise asyncio.CancelledError("agent run cancelled")
        while self._paused.is_set():
            self.executor.state.status = AgentStatus.PAUSED
            await asyncio.sleep(0.05)
        if self.executor.state.status is AgentStatus.PAUSED:
            self.executor.state.status = AgentStatus.RUNNING

    async def start(self) -> AgentState:
        """Run the executor to completion (or cancellation)."""
        try:
            return await self.executor.run()
        except asyncio.CancelledError:
            self.executor.state.status = AgentStatus.CANCELLED
            return self.executor.state
