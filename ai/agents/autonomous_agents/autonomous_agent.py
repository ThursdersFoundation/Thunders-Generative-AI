"""The AutonomousAgent facade composing config, memory, reasoning and tools."""

from __future__ import annotations

import logging
import uuid

from ai.agents.autonomous_agents.agent_config import AgentConfig
from ai.agents.autonomous_agents.agent_controller import AgentController
from ai.agents.autonomous_agents.agent_executor import AgentExecutor
from ai.agents.autonomous_agents.agent_state import AgentState
from ai.agents.autonomous_agents.goal_manager import Goal, GoalManager, GoalStatus

logger = logging.getLogger(__name__)


class AutonomousAgent:
    """High-level agent handle: create -> run(goal) -> inspect state."""

    def __init__(
        self,
        agent_id: str,
        config: AgentConfig,
        executor: AgentExecutor,
        controller: AgentController,
        memory,
        goals: GoalManager,
    ) -> None:
        self.agent_id = agent_id
        self.config = config
        self.executor = executor
        self.controller = controller
        self.memory = memory
        self.goals = goals

    @classmethod
    def create(cls, config: AgentConfig) -> AutonomousAgent:
        """Wire a default stack: registry-backed tools, in-process memory."""
        from ai.agents.memory.memory_manager import MemoryManager
        from ai.agents.reasoning.reasoning_engine import ReasoningEngine
        from ai.agents.tools.tool_executor import ToolExecutor
        from ai.agents.tools.tool_registry import ToolRegistry

        tool_registry = ToolRegistry()
        ToolRegistry.install_builtin_tools(tool_registry)
        tools = ToolExecutor(tool_registry, allowed=config.allowed_tools)
        reasoning = ReasoningEngine(model=config.model, temperature=config.temperature)
        memory = MemoryManager() if config.memory_enabled else None
        state = AgentState(goal="")
        executor = AgentExecutor(config, state, reasoning, tools)
        controller = AgentController(executor)
        return cls(uuid.uuid4().hex, config, executor, controller, memory, GoalManager())

    async def run(self, goal: str, success_criteria: list[str] | None = None) -> AgentState:
        """Pursue a goal to completion and return the resulting state."""
        goal_obj = self.goals.add(Goal(description=goal, success_criteria=success_criteria or []))
        self.goals.update_status(goal_obj, GoalStatus.IN_PROGRESS)
        self.executor.state.goal = goal
        logger.info("agent %s starting goal: %s", self.agent_id, goal)
        state = await self.controller.start()
        if state.status is AgentStatus.FINISHED:
            self.goals.update_status(goal_obj, GoalStatus.ACHIEVED)
        return state

    def pause(self) -> None:
        self.controller.pause()

    def resume(self) -> None:
        self.controller.resume()

    def cancel(self) -> None:
        self.controller.cancel()
