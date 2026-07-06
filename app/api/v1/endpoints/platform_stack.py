"""Platform stack API — registry + live probes for all 10 capabilities."""

from typing import Any

from fastapi import APIRouter, Query

from app.platform.stack_probe import build_stack_matrix, probe_all_capabilities
from app.platform.stack_registry import get_capability_for_section, get_agents_for_capability, StackCapabilityId
from app.agents.hub_agent_routing import build_hub_agent_matrix, resolve_agent_routing
from app.agents.orchestrator_agent import orchestrator_agent

router = APIRouter()


@router.get("/matrix")
async def get_stack_matrix() -> Any:
    """Capability → pillar × role × section × agent mapping."""
    return {"capabilities": build_stack_matrix()}


@router.get("/health")
async def get_stack_health() -> Any:
    """Live probes for PostgreSQL, AI, payments, etc."""
    probes = await probe_all_capabilities()
    degraded = [k for k, v in probes.items() if v.get("status") in ("error", "not_configured")]
    return {
        "ok": len(degraded) == 0,
        "degraded": degraded,
        "probes": probes,
    }


@router.get("/section/{section_id}")
async def get_section_capabilities(section_id: str) -> Any:
    """Resolve which stack capabilities a Platform Core section depends on."""
    caps = get_capability_for_section(section_id)
    return {
        "section_id": section_id,
        "capabilities": [c.value for c in caps],
        "agents": sorted({a for c in caps for a in get_agents_for_capability(c)}),
    }


@router.get("/capability/{capability_id}/agents")
async def get_capability_agents(capability_id: str) -> Any:
    try:
        cap = StackCapabilityId(capability_id)
    except ValueError:
        return {"error": "unknown_capability", "capability_id": capability_id}
    return {"capability_id": capability_id, "agent_ids": get_agents_for_capability(cap)}


@router.get("/agents/routing")
async def get_agent_routing(
    pillar: str | None = Query(None),
    role: str | None = Query(None),
    section_id: str | None = Query(None),
    task: str | None = Query(None),
) -> Any:
    """Agents filtered by pillar/role/section; preferred agent when task or section given."""
    matrix = build_stack_matrix()
    out: list[dict] = []
    for row in matrix:
        if pillar and pillar not in row["pillars"]:
            continue
        if role and role not in row["roles"]:
            continue
        if section_id and section_id not in row.get("section_ids", []):
            continue
        for agent_id in row["agent_ids"]:
            out.append(
                {
                    "agent_id": agent_id,
                    "capability_id": row["id"],
                    "pillars": row["pillars"],
                    "roles": row["roles"],
                }
            )
    routing = resolve_agent_routing(
        pillar=pillar,
        role=role,
        section_id=section_id,
        task=task,
    )
    payload: dict[str, Any] = {
        "agents": out,
        **routing,
    }
    if not pillar and not role and not section_id:
        payload["hub_matrix"] = build_hub_agent_matrix()
    return payload


@router.get("/agents/registry")
async def get_agent_registry() -> Any:
    """Agent metadata + orchestrator wiring status."""
    from app.agents.registry import AGENT_REGISTRY, list_unwired_agents

    return {
        "agents": AGENT_REGISTRY,
        "unwired_agent_ids": sorted(list_unwired_agents().keys()),
        "orchestrator_task_types": orchestrator_agent.list_task_types(),
    }
