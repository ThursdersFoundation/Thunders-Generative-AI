"""The observe -> decide -> act loop for an autonomous agent."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Protocol

from ai.agents.autonomous_agents.agent_decision import Decision, DecisionType
from ai.agents.autonomous_agents.agent_state import AgentState, AgentStatus, StepRecord

if TYPE_CHECKING:
    from ai.agents.autonomous_agents.agent_config import AgentConfig
    from ai.agents.autonomous_agents.agent_controller import AgentController
    from ai.agents.autonomous_agents.agent_lifecycle import Lifecycle, LifecycleEvent

logger = logging.getLogger(__name__)


class ReasoningLike(Protocol):
    async def decide(self, state: AgentState) -> Decision: ...


class ToolsLike(Protocol):
    async def execute(self, tool: str, args: dict) -> str: ...


class AgentExecutor:
    """Runs an agent until the goal is met, a failure occurs or steps run out."""

    def __init__(
        self,
        config: AgentConfig,
        state: AgentState,
        reasoning: ReasoningLike,
        tools: ToolsLike,
        lifecycle: Lifecycle | None = None,
        controller: AgentController | None = None,
    ) -> None:
        self.config = config
        self.state = state
        self.reasoning = reasoning
        self.tools = tools
        self.lifecycle = lifecycle
        self.controller = controller

    async def _emit(self, event: LifecycleEvent, payload: dict[str, Any]) -> None:
        if self.lifecycle is not None:
            await self.lifecycle.emit(event, payload)

    async def _act(self, decision: Decision) -> str:
        await self._emit("on_tool_call", {"tool": decision.tool, "args": decision.tool_args})
        return await self.tools.execute(decision.tool, decision.tool_args)  # type: ignore[arg-type]

    async def run(self) -> AgentState:
        self.state.status = AgentStatus.RUNNING
        await self._emit("on_start", self.state.snapshot())
        try:
            while self.state.step_count < self.config.max_steps:
                if self.controller is not None:
                    await self.controller.checkpoint()  # pause/cancel hook

                decision = await self.reasoning.decide(self.state)
                problems = decision.validate()
                if problems:
                    raise ValueError(f"invalid decision: {'; '.join(problems)}")

                observation: str | None = None
                if decision.type is DecisionType.FINISH:
                    self.state.final_answer = decision.final_answer
                    self.state.status = AgentStatus.FINISHED
                    break
                if decision.type is DecisionType.FAIL:
                    self.state.status = AgentStatus.FAILED
                    self.state.error = decision.reasoning
                    break
                if decision.type is DecisionType.ACT:
                    observation = await self._act(decision)

                self.state.record_step(
                    StepRecord(
                        step=self.state.step_count + 1,
                        thought=decision.reasoning,
                        tool=decision.tool,
                        tool_args=decision.tool_args or None,
                        observation=observation,
                    )
                )
                await self._emit("after_step", self.state.snapshot())

            if self.state.status is AgentStatus.RUNNING:
                self.state.status = AgentStatus.FAILED
                self.state.error = "max steps reached without finishing"
        except Exception as exc:  # noqa: BLE001 — the loop owns run outcomes
            self.state.status = AgentStatus.FAILED
            self.state.error = f"{type(exc).__name__}: {exc}"
            logger.exception("agent run failed")
            await self._emit("on_error", {"error": self.state.error})
        finally:
            await self._emit("on_finish", self.state.snapshot())
        return self.state
