#!/usr/bin/env python3
"""Export agent routing map → .planning/intel/agents-map.md (agent long-term memory)."""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
OUT = ROOT / ".planning" / "intel" / "agents-map.md"


def _orchestrator_task_types() -> list[str]:
    text = (ROOT / "app/agents/orchestrator_agent.py").read_text(encoding="utf-8")
    import re

    return sorted(set(re.findall(r'"([A-Z][A-Z0-9_]*_ITERATION)"', text)))


def main() -> None:
    from app.agents.hub_agent_routing import PILLAR_CURSOR_SUBAGENT, build_hub_agent_matrix
    from app.agents.registry import AGENT_REGISTRY, list_unwired_agents
    from app.agents.section_agent_hints import SECTION_AGENT_HINTS

    task_types = _orchestrator_task_types()

    lines: list[str] = [
        "# Agents map (Fashion OS / SYNTHA)",
        "",
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "Refresh: `npm run agent:intel:refresh` (also `/gsd-intel refresh`).",
        "",
        "## Layers",
        "",
        "| Layer | Entry |",
        "|-------|-------|",
        "| Backend registry | `app/agents/registry.py` |",
        "| Orchestrator | `app/agents/orchestrator_agent.py` → `POST /api/v1/ai/task` |",
        "| Dev bridge (Platform Core) | `POST /api/dev/platform-ai/task` → `/api/v1/ai/task/dev` |",
        "| Stack routing | `app/agents/stack_routing.py`, `app/platform/stack_registry.py` |",
        "| Hub matrix API | `GET /api/v1/platform/stack/agents/routing` |",
        "| Planner queue | `_ai-share/synth-1-full/.../platform-core-planner-agent.ts` |",
        "| Cursor subagents | `.cursor/agents/syntha-*.md` |",
        "",
        "## Orchestrator task types (wired)",
        "",
    ]
    for tt in task_types:
        lines.append(f"- `{tt}`")

    lines.extend(["", "## Registry", ""])
    lines.append("| agent_id | lifecycle | wired | module |")
    lines.append("|----------|-----------|-------|--------|")
    for aid, meta in sorted(AGENT_REGISTRY.items()):
        wired = meta.get("wired_in_orchestrator", False)
        lines.append(
            f"| `{aid}` | {meta['lifecycle']} | {'yes' if wired else 'no'} | `{meta['module']}` |"
        )

    unwired = list_unwired_agents()
    if unwired:
        lines.extend(["", f"Unwired: {', '.join(f'`{k}`' for k in sorted(unwired))}", ""])

    lines.extend(["", "## Hub: pillar × role → primary backend agent", ""])
    lines.append("| Pillar | Brand | Shop | Manufacturer | Supplier | Cursor subagent |")
    lines.append("|--------|-------|------|--------------|----------|-----------------|")
    by_pillar: dict[str, dict[str, str | None]] = {}
    for row in build_hub_agent_matrix():
        p = row["pillar"]
        by_pillar.setdefault(p, {})[row["role"]] = row.get("primary_agent")
    for pillar in (
        "development",
        "sample_collection",
        "collection_order",
        "order_production",
        "comms",
    ):
        cells = by_pillar.get(pillar, {})
        sub = PILLAR_CURSOR_SUBAGENT.get(pillar, "—")
        lines.append(
            f"| `{pillar}` | {cells.get('brand') or '—'} | {cells.get('shop') or '—'} | "
            f"{cells.get('manufacturer') or '—'} | {cells.get('supplier') or '—'} | `{sub}` |"
        )

    lines.extend(["", "## Section hints (SECTION_AUDIT → agent_id)", ""])
    for sid, agent in sorted(SECTION_AGENT_HINTS.items()):
        lines.append(f"- `{sid}` → `{agent}`")

    lines.extend(
        [
            "",
            "## Platform Core AI strips (UI → backend)",
            "",
            "| testid | section | agent |",
            "|--------|---------|-------|",
            "| `brand-co-registry-ai-anomaly` | brand-co-registry | order_anomaly |",
            "| `shop-co-matrix-quota-ai` | shop-co-matrix | quota |",
            "| `shop-co-registry-ai-anomaly` | shop-co-registry | order_anomaly |",
            "| `mfr-op-handoff-queue-ai-anomaly` | mfr-op-handoff-queue | order_anomaly |",
            "| `planner-ui-improvement-ai` | brand-dev-cabinet | ui_improvement |",
            "",
            "## Eval",
            "",
            "- `npm run agent:eval:routing`",
            "- `npm run agent:eval:ollama` (Ollama :11434)",
            "",
            "## Not AI agents",
            "",
            "B2B `ShopAgentRep*` / `BrandAgentRep*` — торговый представитель, не backend agent.",
            "",
        ]
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} ({len(lines)} lines)")


if __name__ == "__main__":
    main()
