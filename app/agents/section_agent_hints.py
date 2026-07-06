"""Preferred agent_id for Platform Core SECTION_AUDIT section ids."""

from __future__ import annotations

# section_id → agent_id (must exist in stack_registry for that cell when possible)
SECTION_AGENT_HINTS: dict[str, str] = {
    # development — brand
    "brand-dev-w2-hub": "product_architect",
    "brand-dev-dossier": "product_architect",
    "brand-dev-range": "quota",
    "brand-dev-pg-sync": "tech_debt",
    "brand-dev-cabinet": "product_architect",
    # sample_collection
    "brand-sc-linesheets": "product_architect",
    "brand-sc-showroom": "content",
    "shop-sc-showroom": "product_architect",
    "shop-sc-matrix-entry": "quota",
    # collection_order
    "shop-co-matrix": "quota",
    "shop-co-checkout": "order_anomaly",
    "shop-co-registry": "order_anomaly",
    "shop-co-detail": "risk",
    "shop-co-buyer-tracking": "order_anomaly",
    "brand-co-registry": "order_anomaly",
    "brand-co-retailers": "order_anomaly",
    # order_production
    "mfr-op-handoff-queue": "order_anomaly",
    "mfr-op-production-orders": "order_anomaly",
    "sup-op-procurement": "order_anomaly",
    "sup-dev-bom": "product_architect",
    "brand-dev-w2-hub": "product_architect",
    "brand-dev-dossier": "product_architect",
    "brand-dev-pg-sync": "tech_debt",
    "mfr-dev-dossier": "lookbook",
    # comms
    "brand-cm-order-chat": "architecture_guard",
    "shop-cm-order-chat": "architecture_guard",
    "mfr-cm-order": "architecture_guard",
    "sup-cm-order": "architecture_guard",
    "brand-cm-calendar": "architecture_guard",
}


def agent_hint_for_section(section_id: str | None) -> str | None:
    if not section_id:
        return None
    return SECTION_AGENT_HINTS.get(section_id.strip())
