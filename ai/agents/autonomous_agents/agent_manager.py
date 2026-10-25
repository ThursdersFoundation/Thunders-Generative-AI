"""Creation and lifecycle management of agent instances."""

from __future__ import annotations

import logging

from ai.agents.autonomous_agents.agent_config import AgentConfig
from ai.agents.autonomous_agents.autonomous_agent import AutonomousAgent

logger = logging.getLogger(__name__)


class AgentManager:
    """Registry of running agents (development-tier, in-process)."""

    def __init__(self) -> None:
        self._agents: dict[str, AutonomousAgent] = {}

    def create(self, config: AgentConfig | None = None) -> AutonomousAgent:
        agent = AutonomousAgent.create(config or AgentConfig())
        self._agents[agent.agent_id] = agent
        logger.info("agent created: %s (%s)", agent.config.name, agent.agent_id)
        return agent

    def get(self, agent_id: str) -> AutonomousAgent | None:
        return self._agents.get(agent_id)

    def list(self) -> list[AutonomousAgent]:
        return list(self._agents.values())

    async def stop(self, agent_id: str) -> bool:
        agent = self._agents.get(agent_id)
        if agent is None:
            return False
        agent.cancel()
        return True

    async def shutdown(self) -> None:
        for agent in self._agents.values():
            agent.cancel()
        self._agents.clear()
