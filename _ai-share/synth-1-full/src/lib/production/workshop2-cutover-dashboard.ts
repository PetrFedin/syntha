/**
 * Wave 51–52: cutover dashboard — probes wave45–52, human signoff gate, fail-closed без demo.
 */
import fs from 'node:fs';
import path from 'node:path';

import { type Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import {
  buildWorkshop2Wave52ProdLiveReadyProbe,
  buildWorkshop2Wave55InvestorFreezeReadyProbe,
} from '@/lib/production/workshop2-wave-probes-fs.server';

function buildWorkshop2Wave45StagingProdReadyProbe(_env: Workshop2ProcessEnvLike = process.env) {
  return { ok: false, wave45StagingProdReady: 0 };
}
function buildWorkshop2Wave46ProductionCutoverReadyProbe(
  _env: Workshop2ProcessEnvLike = process.env
) {
  return { ok: false, wave46ProductionCutoverReady: 0 };
}
function buildWorkshop2Wave47RoadmapReadyProbe(_env: Workshop2ProcessEnvLike = process.env) {
  return { ok: false, wave47RoadmapReady: 0 };
}
function buildWorkshop2Wave48InvestorShipReadyProbe(_env: Workshop2ProcessEnvLike = process.env) {
  return { ok: false, wave48InvestorShipReady: 0 };
}
function buildWorkshop2Wave49ProdOpsReadyProbe(_env: Workshop2ProcessEnvLike = process.env) {
  return { ok: false, wave49ProdOpsReady: 0 };
}
function buildWorkshop2Wave50ProdMergeReadyProbe(_env: Workshop2ProcessEnvLike = process.env) {
  return { ok: false, wave50ProdMergeReady: 0 };
}
function buildWorkshop2Wave51ProdCutoverReadyProbe(_env: Workshop2ProcessEnvLike = process.env) {
  return { ok: false, wave51ProdCutoverReady: 0 };
}
import {
  summarizeWorkshop2Wave55InvestorFreezeSignoff,
  loadWorkshop2Ss27UatSignoffJournal,
} from '@/lib/production/workshop2-ss27-uat-signoff-journal';
import { isWorkshop2OpsAppliedChecklistReady } from '@/lib/production/workshop2-wave-ops-applied-status';

export type Workshop2CutoverDashboardProbe = {
  id: string;
  labelRu: string;
  ok: boolean;
  score?: number;
  hintRu?: string;
};

function isWorkshop2InvestorDemoMode(env: Workshop2ProcessEnvLike): boolean {
  const v = String(env.WORKSHOP2_INVESTOR_DEMO_MODE ?? '')
    .trim()
    .toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/** Читает journal_only signoff из .planning/workshop2-ss27-uat-signoff.json. */
function summarizeWorkshop2HumanSignoffFromJournal(): {
  humanSignoffComplete: boolean;
  opsSigned: boolean;
  stagingSigned: boolean;
} {
  try {
    const file = path.join(process.cwd(), '.planning/workshop2-ss27-uat-signoff.json');
    if (!fs.existsSync(file)) {
      return { humanSignoffComplete: false, opsSigned: false, stagingSigned: false };
    }
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as {
      entries?: { role?: string }[];
      signoffs?: Partial<Record<'ops' | 'staging', unknown>>;
    };
    const roles = new Set<string>();
    for (const e of parsed.entries ?? []) {
      if (e.role) roles.add(String(e.role));
    }
    if (parsed.signoffs?.ops) roles.add('ops');
    if (parsed.signoffs?.staging) roles.add('staging');
    const opsSigned = roles.has('ops');
    const stagingSigned = roles.has('staging');
    return {
      humanSignoffComplete: opsSigned && stagingSigned,
      opsSigned,
      stagingSigned,
    };
  } catch {
    return { humanSignoffComplete: false, opsSigned: false, stagingSigned: false };
  }
}

function safeProbe<T extends { ok: boolean }>(build: () => T): T | null {
  try {
    return build();
  } catch {
    return null;
  }
}

/** Сводка готовности staging→prod cutover для ops UI и probe-alert. */
export function buildWorkshop2CutoverDashboard(env: Workshop2ProcessEnvLike = process.env): {
  cutoverReady: boolean;
  humanSignoffRequired: boolean;
  humanSignoffGateOk: boolean;
  wave51ProdCutoverReady: boolean;
  wave52ProdLiveReady: boolean;
  wave55FreezeReady: boolean;
  wave55InvestorFreezeProbeOk: boolean;
  /** Wave 56: PagerDuty + Sentry env или ops-applied status JSON. */
  opsAppliedChecklist: boolean;
  probes: Workshop2CutoverDashboardProbe[];
} {
  const demoMode = isWorkshop2InvestorDemoMode(env);
  const signoff = summarizeWorkshop2HumanSignoffFromJournal();
  const wave55Signoff = summarizeWorkshop2Wave55InvestorFreezeSignoff(
    loadWorkshop2Ss27UatSignoffJournal()
  );
  const humanSignoffRequired = !demoMode;
  const humanSignoffGateOk = !humanSignoffRequired || signoff.humanSignoffComplete;
  const wave55FreezeReady = !humanSignoffRequired || wave55Signoff.wave55FreezeComplete;

  const wave45 = safeProbe(() => buildWorkshop2Wave45StagingProdReadyProbe(env));
  const wave46 = safeProbe(() => buildWorkshop2Wave46ProductionCutoverReadyProbe(env));
  const wave47 = safeProbe(() => buildWorkshop2Wave47RoadmapReadyProbe(env));
  const wave48 = safeProbe(() => buildWorkshop2Wave48InvestorShipReadyProbe(env));
  const wave49 = safeProbe(() => buildWorkshop2Wave49ProdOpsReadyProbe(env));
  const wave50 = safeProbe(() => buildWorkshop2Wave50ProdMergeReadyProbe(env));
  const wave51 = safeProbe(() => buildWorkshop2Wave51ProdCutoverReadyProbe(env));
  const wave52 = safeProbe(() => buildWorkshop2Wave52ProdLiveReadyProbe(env));
  const wave55 = safeProbe(() => buildWorkshop2Wave55InvestorFreezeReadyProbe(env));

  const wave51ProdCutoverReady = wave51?.ok ?? false;
  const wave52ProdLiveReady = wave52?.ok ?? false;
  const wave55InvestorFreezeProbeOk = wave55?.ok ?? false;
  const opsAppliedChecklist = isWorkshop2OpsAppliedChecklistReady(env);

  const stagingPublicUrl = String(env.WORKSHOP2_STAGING_PUBLIC_URL ?? '').trim();
  const probes: Workshop2CutoverDashboardProbe[] = [
    {
      id: 'wave45_staging_prod',
      labelRu: 'Wave 45 — staging prod ready',
      ok: wave45?.ok ?? false,
      score: wave45?.wave45StagingProdReady,
      hintRu: 'PG ACK + human signoff scaffold + 3D sdk-stub.',
    },
    {
      id: 'wave46_production_cutover',
      labelRu: 'Wave 46 — production cutover',
      ok: wave46?.ok ?? false,
      score: wave46?.wave46ProductionCutoverReady,
      hintRu: 'ACK export/replay + OAuth rotation + cutover checklist.',
    },
    {
      id: 'wave47_roadmap',
      labelRu: 'Wave 47 — roadmap ops',
      ok: wave47?.ok ?? false,
      score: wave47?.wave47RoadmapReady,
      hintRu: 'Staging keys, e2e smoke, observability.',
    },
    {
      id: 'wave48_investor_ship',
      labelRu: 'Wave 48 — investor ship',
      ok: wave48?.ok ?? false,
      score: wave48?.wave48InvestorShipReady,
      hintRu: 'Hub staging keys panel + 3D SDK script handshake.',
    },
    {
      id: 'wave49_prod_ops',
      labelRu: 'Wave 49 — prod ops',
      ok: wave49?.ok ?? false,
      score: wave49?.wave49ProdOpsReady,
      hintRu: '3D SLA API + probe-alert + ACK archive.',
    },
    {
      id: 'wave50_prod_merge',
      labelRu: 'Wave 50 — prod merge',
      ok: wave50?.ok ?? false,
      score: wave50?.wave50ProdMergeReady,
      hintRu: 'ACK cron + Sentry alert doc + prepare-pr.',
    },
    {
      id: 'wave51_prod_cutover',
      labelRu: 'Wave 51 — prod cutover',
      ok: wave51ProdCutoverReady,
      score: wave51?.wave51ProdCutoverReady,
      hintRu: 'Matterport live + cutover dashboard + ack replay drill.',
    },
    {
      id: 'wave52_prod_live',
      labelRu: 'Wave 52 — prod live',
      ok: wave52ProdLiveReady,
      score: wave52?.wave52ProdLiveReady,
      hintRu: 'Production keys + brand registry + merge assist.',
    },
    {
      id: 'human_signoff_ops_staging',
      labelRu: 'Human UAT signoff (ops + staging)',
      ok: humanSignoffGateOk,
      hintRu: demoMode
        ? 'Demo mode — signoff не требуется (journal_only labeled).'
        : signoff.humanSignoffComplete
          ? 'ops + staging подписали SS27 UAT.'
          : `Ожидается: ops=${signoff.opsSigned ? '✓' : '—'}, staging=${signoff.stagingSigned ? '✓' : '—'}.`,
    },
    {
      id: 'wave55_investor_freeze_signoff',
      labelRu: 'Wave 55 investor freeze (ops + product)',
      ok: wave55FreezeReady,
      score: wave55?.wave55InvestorFreezeReady,
      hintRu: demoMode
        ? 'Demo mode — freeze signoff не требуется.'
        : wave55Signoff.wave55FreezeComplete
          ? 'ops + product подписали investor freeze.'
          : `Ожидается: ops=${wave55Signoff.wave55FreezeSignoffs.ops ? '✓' : '—'}, product=${wave55Signoff.wave55FreezeSignoffs.product ? '✓' : '—'}.`,
    },
    {
      id: 'wave56_ops_applied_checklist',
      labelRu: 'Wave 56 ops applied (PagerDuty + Sentry)',
      ok: opsAppliedChecklist,
      hintRu: opsAppliedChecklist
        ? 'WORKSHOP2_PAGERDUTY_WEBHOOK_URL + SENTRY_DSN или status JSON applied.'
        : 'Запустите scripts/workshop2-wave55-ops-applied-checklist.mjs после настройки org.',
    },
    {
      id: 'staging_public_url',
      labelRu: 'WORKSHOP2_STAGING_PUBLIC_URL',
      ok: Boolean(stagingPublicUrl),
      hintRu: stagingPublicUrl || 'Не задан — checklistLinks и signoff probes недоступны.',
    },
  ];

  const cutoverReady =
    wave51ProdCutoverReady &&
    wave52ProdLiveReady &&
    humanSignoffGateOk &&
    Boolean(stagingPublicUrl);

  return {
    cutoverReady,
    humanSignoffRequired,
    humanSignoffGateOk,
    wave51ProdCutoverReady,
    wave52ProdLiveReady,
    wave55FreezeReady,
    wave55InvestorFreezeProbeOk,
    opsAppliedChecklist,
    probes,
  };
}
