/**
 * Planner dispatch + analyze: pillar/section → backend agent + Cursor subagent.
 * Backend mirror: app/agents/hub_agent_routing.py, app/agents/section_agent_hints.py
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';

export const PILLAR_CURSOR_SUBAGENT: Record<CoreHubPillarId, string> = {
  development: 'syntha-w2-development',
  sample_collection: 'syntha-sample-collection',
  collection_order: 'syntha-b2b-order',
  order_production: 'syntha-factory-production',
  comms: 'syntha-comms',
};

/** section_id → backend agent_id (subset of Python SECTION_AGENT_HINTS) */
export const SECTION_BACKEND_AGENT: Record<string, string> = {
  'brand-dev-w2-hub': 'product_architect',
  'brand-dev-dossier': 'product_architect',
  'brand-dev-range': 'quota',
  'brand-dev-pg-sync': 'tech_debt',
  'brand-sc-linesheets': 'product_architect',
  'brand-sc-showroom': 'content',
  'shop-sc-showroom': 'product_architect',
  'shop-co-matrix': 'quota',
  'shop-co-checkout': 'order_anomaly',
  'shop-co-registry': 'order_anomaly',
  'brand-co-registry': 'order_anomaly',
  'mfr-op-handoff-queue': 'order_anomaly',
  'sup-op-procurement': 'order_anomaly',
  'brand-cm-order-chat': 'architecture_guard',
  'shop-cm-order-chat': 'architecture_guard',
};

export function cursorSubagentForPillar(pillarId?: CoreHubPillarId): string | undefined {
  return pillarId ? PILLAR_CURSOR_SUBAGENT[pillarId] : undefined;
}

export function backendAgentForSection(sectionId?: string): string | undefined {
  if (!sectionId) return undefined;
  return SECTION_BACKEND_AGENT[sectionId];
}

export function plannerDispatchAgentLines(opts: {
  pillarId?: CoreHubPillarId;
  roleId?: CoreChainRoleId;
  sectionId?: string;
}): string[] {
  const lines: string[] = [];
  const sub = cursorSubagentForPillar(opts.pillarId);
  if (sub) {
    lines.push(
      `Cursor subagent: Use Task tool with subagent_type matching «${sub}» (.cursor/agents/${sub}.md).`
    );
  }
  const backend =
    backendAgentForSection(opts.sectionId) ??
    (opts.pillarId === 'collection_order' && opts.roleId === 'shop'
      ? 'order_anomaly'
      : opts.pillarId === 'development' && opts.roleId === 'brand'
        ? 'product_architect'
        : undefined);
  if (backend) {
    lines.push(
      `Backend hint: POST /api/v1/ai/task with pillar=${opts.pillarId ?? '—'} role=${opts.roleId ?? '—'} → agent ${backend}.`
    );
  }
  return lines;
}
