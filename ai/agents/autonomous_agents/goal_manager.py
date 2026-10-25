"""Goal creation, prioritisation and progress tracking."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class GoalStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    ACHIEVED = "achieved"
    ABANDONED = "abandoned"


@dataclass(slots=True)
class Goal:
    description: str
    success_criteria: list[str] = field(default_factory=list)
    priority: int = 0  # higher = more urgent
    status: GoalStatus = GoalStatus.PENDING
    notes: list[str] = field(default_factory=list)


class GoalManager:
    """Owns the agent's goal backlog."""

    def __init__(self) -> None:
        self._goals: list[Goal] = []

    def add(self, goal: Goal) -> Goal:
        self._goals.append(goal)
        return goal

    def next_goal(self) -> Goal | None:
        """Highest-priority pending goal (stable order for ties)."""
        pending = [g for g in self._goals if g.status is GoalStatus.PENDING]
        if not pending:
            return None
        return max(pending, key=lambda g: g.priority)

    def update_status(self, goal: Goal, status: GoalStatus) -> None:
        goal.status = status

    def add_note(self, goal: Goal, note: str) -> None:
        goal.notes.append(note)

    @property
    def achieved(self) -> list[Goal]:
        return [g for g in self._goals if g.status is GoalStatus.ACHIEVED]

    @property
    def all(self) -> list[Goal]:
        return list(self._goals)
