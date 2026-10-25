"""The decision an agent makes at each step of its loop."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class DecisionType(str, Enum):
    THINK = "think"    # reason only, no tool call this step
    ACT = "act"        # call a tool
    FINISH = "finish"  # goal achieved, final answer ready
    FAIL = "fail"      # unrecoverable, abort the run


@dataclass(slots=True)
class Decision:
    """A single agent decision, produced by the reasoning engine."""

    type: DecisionType
    reasoning: str
    tool: str | None = None
    tool_args: dict = field(default_factory=dict)
    final_answer: str | None = None
    confidence: float = 1.0

    def validate(self) -> list[str]:
        """Return problems that make this decision unactionable."""
        problems: list[str] = []
        if self.type is DecisionType.ACT and not self.tool:
            problems.append("ACT decisions require a tool name")
        if self.type is DecisionType.FINISH and not self.final_answer:
            problems.append("FINISH decisions require a final answer")
        if not 0.0 <= self.confidence <= 1.0:
            problems.append("confidence must be within [0.0, 1.0]")
        return problems

    @classmethod
    def from_llm_payload(cls, payload: dict) -> Decision:
        """Parse a decision from a model JSON payload."""
        return cls(
            type=DecisionType(payload.get("action", "think")),
            reasoning=str(payload.get("reasoning", "")),
            tool=payload.get("tool"),
            tool_args=payload.get("tool_args") or {},
            final_answer=payload.get("final_answer"),
            confidence=float(payload.get("confidence", 1.0)),
        )
