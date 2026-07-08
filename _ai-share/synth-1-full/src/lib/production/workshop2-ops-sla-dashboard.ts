/**
 * Wave 53: ops SLA dashboard — ACK p99, 3D error rate, probe heartbeat, SLO targets RU.
 */
import fs from 'node:fs';
import path from 'node:path';

import { type Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import { summarizeWorkshop2B2b3dSlaFromJournal } from '@/lib/production/workshop2-b2b-3d-sla';

const ACK_JOURNAL_BASENAME = '.planning/workshop2-integration-ack-journal.json';
const SLA_TARGETS_BASENAME = '.planning/workshop2-sla-targets.md';

function ackJournalPath(): string {
  return path.join(process.cwd(), ACK_JOURNAL_BASENAME);
}

function slaTargetsPath(): string {
  return path.join(process.cwd(), SLA_TARGETS_BASENAME);
}

export type Workshop2SloTargets = {
  ackP99Ms: number;
  b2b3dErrorRatePct: number;
  labelRu: string;
};

export type Workshop2OpsSlaDashboard = {
  ackEdoP99Ms: number | null;
  ackMarkingP99Ms: number | null;
  b2b3dErrorRate: number;
  probeLastOkAt: string | null;
  sloTargets: Workshop2SloTargets;
  sloOk: boolean;
  labelRu: string;
};

const DEFAULT_SLO: Workshop2SloTargets = {
  ackP99Ms: 5000,
  b2b3dErrorRatePct: 5,
  labelRu: 'SLO по умолчанию: ACK p99 ≤ 5000 ms, 3D error ≤ 5%.',
};

type AckJournalEntry = {
  kind?: 'edo' | 'marking' | string;
  latencyMs?: number;
};

function loadAckJournalEntries(): AckJournalEntry[] {
  try {
    if (!fs.existsSync(ackJournalPath())) return [];
    const parsed = JSON.parse(fs.readFileSync(ackJournalPath(), 'utf8')) as {
      entries?: AckJournalEntry[];
    };
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    return [];
  }
}

function computeP99(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.99) - 1;
  return sorted[Math.max(0, idx)] ?? null;
}

function p99ForKind(kind: 'edo' | 'marking'): number | null {
  const latencies = loadAckJournalEntries()
    .filter((e) => e.kind === kind)
    .map((e) => Number(e.latencyMs ?? NaN))
    .filter((n) => Number.isFinite(n) && n >= 0);
  return computeP99(latencies);
}

/** Парсит .planning/workshop2-sla-targets.md или возвращает defaults. */
export function readWorkshop2SloTargetsFromDisk(): Workshop2SloTargets {
  try {
    if (!fs.existsSync(slaTargetsPath())) return DEFAULT_SLO;
    const raw = fs.readFileSync(slaTargetsPath(), 'utf8');
    const ackMatch = raw.match(/ack\s*p99[^0-9]*(\d+)/i);
    const errMatch = raw.match(/3d\s*error[^0-9]*(\d+)/i);
    const ackP99Ms = ackMatch ? Number(ackMatch[1]) : DEFAULT_SLO.ackP99Ms;
    const b2b3dErrorRatePct = errMatch ? Number(errMatch[1]) : DEFAULT_SLO.b2b3dErrorRatePct;
    return {
      ackP99Ms: Number.isFinite(ackP99Ms) ? ackP99Ms : DEFAULT_SLO.ackP99Ms,
      b2b3dErrorRatePct: Number.isFinite(b2b3dErrorRatePct)
        ? b2b3dErrorRatePct
        : DEFAULT_SLO.b2b3dErrorRatePct,
      labelRu: `SLO из ${path.basename(slaTargetsPath())}: ACK p99 ≤ ${ackP99Ms} ms, 3D error ≤ ${b2b3dErrorRatePct}%.`,
    };
  } catch {
    return DEFAULT_SLO;
  }
}

/** Ops SLA dashboard для hub panel и GET /api/workshop2/ops/sla-dashboard. */
export function buildWorkshop2OpsSlaDashboard(
  env: Workshop2ProcessEnvLike = process.env
): Workshop2OpsSlaDashboard {
  const sloTargets = readWorkshop2SloTargetsFromDisk();
  const ackEdoP99Ms = p99ForKind('edo');
  const ackMarkingP99Ms = p99ForKind('marking');
  const b2b3d = summarizeWorkshop2B2b3dSlaFromJournal();
  const probeLastOkAt = String(env.WORKSHOP2_PROBE_LAST_OK_AT ?? '').trim() || null;

  const ackOk =
    (ackEdoP99Ms == null || ackEdoP99Ms <= sloTargets.ackP99Ms) &&
    (ackMarkingP99Ms == null || ackMarkingP99Ms <= sloTargets.ackP99Ms);
  const b2b3dOk = b2b3d.sessionCount === 0 || b2b3d.errorRatePct <= sloTargets.b2b3dErrorRatePct;
  const sloOk = ackOk && b2b3dOk;

  return {
    ackEdoP99Ms,
    ackMarkingP99Ms,
    b2b3dErrorRate: b2b3d.errorRatePct,
    probeLastOkAt,
    sloTargets,
    sloOk,
    labelRu: sloOk
      ? 'SLO в норме (ACK p99 + 3D error rate).'
      : 'SLO нарушен — проверьте ACK journal и 3D session journal.',
  };
}
