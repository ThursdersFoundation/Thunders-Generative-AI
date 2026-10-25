"""Configuration for autonomous agents."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class AgentConfig:
    """Declarative configuration for a single autonomous agent."""

    name: str = "thunders-agent"
    model: str = "thunders-t1-chat"          # id from models/registry.yaml
    system_prompt: str | None = None
    max_steps: int = 20                      # hard stop for the ReAct loop
    max_tool_calls_per_step: int = 5
    temperature: float = 0.2
    allowed_tools: list[str] | None = None   # None -> every registered tool
    memory_enabled: bool = True
    reflection_enabled: bool = True
    require_tool_approval: bool = False      # human-in-the-loop gate
    metadata: dict[str, str] = field(default_factory=dict)

    def validate(self) -> list[str]:
        """Return configuration problems (empty list when valid)."""
        problems: list[str] = []
        if self.max_steps < 1:
            problems.append("max_steps must be >= 1")
        if not 0.0 <= self.temperature <= 2.0:
            problems.append("temperature must be within [0.0, 2.0]")
        if self.allowed_tools is not None and not self.allowed_tools:
            problems.append("allowed_tools must be None or a non-empty list")
        return problems
