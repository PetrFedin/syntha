import { NextResponse } from 'next/server';
import { buildPlatformCorePlanner, type TechDebtCategory } from '@/lib/platform-core-planner';
import {
  appendPlannerDiscoveredItems,
  isDevPlannerApiEnabled,
  readPlannerRuntimeState,
  runtimeToOverlay,
  type PlannerDiscoveredDevItem,
  type PlannerDiscoveredTechDebtItem,
} from '@/lib/server/platform-core-planner-runtime.server';

function asTechDebtCategory(raw: unknown): TechDebtCategory {
  const s = String(raw ?? 'missing-link');
  const allowed: TechDebtCategory[] = [
    'error',
    'dead-end',
    'stub',
    'demo-dupe',
    'missing-link',
    'noise',
    'monster-file',
  ];
  return allowed.includes(s as TechDebtCategory) ? (s as TechDebtCategory) : 'missing-link';
}

function slugId(parts: string[]) {
  return parts
    .join('-')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .slice(0, 80);
}

function normalizeDev(raw: unknown): PlannerDiscoveredDevItem[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const out: PlannerDiscoveredDevItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = row as Record<string, unknown>;
    const title = String(o.title ?? '').trim();
    if (title.length < 4) continue;
    const priority = o.priority === 'P0' || o.priority === 'P2' ? o.priority : 'P1';
    const kind =
      o.kind === 'add' || o.kind === 'stage' || o.kind === 'existing' ? o.kind : 'improve';
    out.push({
      id: String(o.id ?? slugId(['disc-dev', title.slice(0, 40)])),
      kind,
      priority,
      title,
      evidence: String(o.evidence ?? o.hint ?? 'cursor-scan').slice(0, 400),
      href: typeof o.href === 'string' ? o.href : undefined,
      roleId:
        typeof o.roleId === 'string' ? (o.roleId as PlannerDiscoveredDevItem['roleId']) : undefined,
      pillarId:
        typeof o.pillarId === 'string'
          ? (o.pillarId as PlannerDiscoveredDevItem['pillarId'])
          : undefined,
      addedAt: now,
    });
  }
  return out;
}

function normalizeDebt(raw: unknown): PlannerDiscoveredTechDebtItem[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const out: PlannerDiscoveredTechDebtItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = row as Record<string, unknown>;
    const title = String(o.title ?? '').trim();
    if (title.length < 4) continue;
    const priority = o.priority === 'P0' || o.priority === 'P2' ? o.priority : 'P1';
    const action =
      o.action === 'fix' || o.action === 'remove' || o.action === 'merge' ? o.action : 'change';
    out.push({
      id: String(o.id ?? slugId(['disc-td', title.slice(0, 40)])),
      category: asTechDebtCategory(o.category),
      priority,
      title,
      action,
      hint: typeof o.hint === 'string' ? o.hint.slice(0, 200) : undefined,
      source: String(o.source ?? 'cursor-scan'),
      evidence: String(o.evidence ?? o.hint ?? title).slice(0, 400),
      addedAt: now,
    });
  }
  return out;
}

/** Dev: приём находок от Cursor-агента (сканирование). */
export async function POST(request: Request) {
  if (!isDevPlannerApiEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    collection?: string;
    development?: unknown;
    techDebt?: unknown;
    by?: string;
  };
  const collectionId = body.collection ?? 'SS27';
  const development = normalizeDev(body.development);
  const techDebt = normalizeDebt(body.techDebt);
  const total = development.length + techDebt.length;

  if (total === 0) {
    return NextResponse.json({ ok: true, added: { development: 0, techDebt: 0, total: 0 } });
  }

  await appendPlannerDiscoveredItems({ development, techDebt });
  const runtimeAfter = await readPlannerRuntimeState();
  const snapshot = buildPlatformCorePlanner(collectionId, runtimeToOverlay(runtimeAfter));

  return NextResponse.json({
    ok: true,
    added: { development: development.length, techDebt: techDebt.length, total },
    counts: snapshot.counts,
    message: `Cursor: +${total} (развитие ${development.length}, техдолг ${techDebt.length})`,
  });
}
