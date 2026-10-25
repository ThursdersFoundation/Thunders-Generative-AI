# ⚡ autonomous_agents

The agent runtime: a ReAct-style loop (`agent_executor.py`) that alternates
reasoning decisions with tool actions until a goal is achieved or the step
budget is exhausted.

| Module | Purpose |
| --- | --- |
| `autonomous_agent.py` | Facade — `AutonomousAgent.create(config).run(goal)` |
| `agent_executor.py` | The observe → decide → act loop |
| `agent_controller.py` | Cooperative pause / resume / cancel |
| `agent_manager.py` | Create, track and stop multiple agents |
| `agent_config.py` | Declarative config (model, step budget, tool allowlist) |
| `agent_state.py` | Messages, scratchpad, step history, status |
| `agent_decision.py` | THINK / ACT / FINISH / FAIL decisions |
| `agent_lifecycle.py` | Async hooks around run events |
| `goal_manager.py` | Goal backlog with priorities and success criteria |
| `task_executor.py` | Single-task execution routing |

## Usage

```python
from ai.agents.autonomous_agents import AgentConfig, AgentManager

agent = AgentManager().create(AgentConfig(name="researcher", max_steps=15))
state = await agent.run("Find the three best vector databases and summarize them")
print(state.final_answer, state.status)
```

Decisions come from `ai/agents/reasoning/`, actions run through
`ai/agents/tools/`; both must be wired to a live model/engine for real runs
LLM-touching paths raise `NotImplementedError` until then.
