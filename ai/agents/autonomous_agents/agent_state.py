"""Runtime state for an agent run."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    FINISHED = "finished"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(slots=True)
class StepRecord:
    """One observe-decide-act cycle of the agent loop."""

    step: int
    thought: str
    tool: str | None = None
    tool_args: dict | None = None
    observation: str | None = None
    error: str | None = None


@dataclass(slots=True)
class AgentState:
    """Everything the agent accumulates during a run."""

    goal: str
    status: AgentStatus = AgentStatus.IDLE
    messages: list[dict] = field(default_factory=list)
    scratchpad: dict[str, str] = field(default_factory=dict)
    steps: list[StepRecord] = field(default_factory=list)
    final_answer: str | None = None
    error: str | None = None

    @property
    def step_count(self) -> int:
        return len(self.steps)

    def record_step(self, record: StepRecord) -> None:
        """Append a step and mirror it into the conversation messages."""
        self.steps.append(record)
        self.messages.append({"role": "assistant", "content": record.thought})
        if record.observation is not None:
            self.messages.append(
                {"role": "user", "content": f"[tool:{record.tool}] {record.observation}"}
            )

    def snapshot(self) -> dict:
        """Serializable summary of the run (used by checkpoints and monitoring)."""
        return {
            "goal": self.goal,
            "status": self.status.value,
            "steps": self.step_count,
            "final_answer": self.final_answer,
            "error": self.error,
        }
