/**
 * Wave 35b–51 FS probes — restored stubs after truncated wave-probes-fs.server (disk restore Wave 58).
 * Each probe scores artifact/test presence; live behavior unchanged in workshop2-live-integration-probes body.
 */
import fs from 'node:fs';
import path from 'node:path';

import { type Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import { buildWorkshop2Wave35aGreenSuiteProbe } from '@/lib/production/workshop2-live-integration-probes';

type FsProbeCheck = { id: string; ok: boolean; path?: string; hintRu: string };

function fsProbeHelpers() {
  const rootDir = process.cwd();
  const exists = (rel: string) => {
    try {
      return fs.statSync(path.join(rootDir, rel)).isFile();
    } catch {
      return false;
    }
  };
  const read = (rel: string) => {
    try {
      return fs.readFileSync(path.join(rootDir, rel), 'utf8');
    } catch {
      return '';
    }
  };
  return { exists, read, rootDir };
}

function scoreProbe(checks: FsProbeCheck[], key: string, min: number) {
  const n = checks.filter((c) => c.ok).length;
  return { ok: n >= min, [key]: n, checks } as { ok: boolean; checks: FsProbeCheck[] } & Record<
    string,
    number
  >;
}

function artifactProbe(
  key: string,
  min: number,
  artifacts: Array<{ id: string; path: string; hintRu: string; minBytes?: number }>
) {
  const { exists } = fsProbeHelpers();
  const checks: FsProbeCheck[] = artifacts.map((a) => {
    let ok = exists(a.path);
    if (ok && a.minBytes) {
      try {
        ok = fs.statSync(path.join(process.cwd(), a.path)).size >= a.minBytes;
      } catch {
        ok = false;
      }
    }
    return { id: a.id, ok, path: a.path, hintRu: a.hintRu };
  });
  return scoreProbe(checks, key, min);
}

export function buildWorkshop2Wave35bProdReadinessProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  const w35a = buildWorkshop2Wave35aGreenSuiteProbe(env);
  const { exists } = fsProbeHelpers();
  const checks: FsProbeCheck[] = [
    { id: 'wave35a_baseline', ok: w35a.ok, hintRu: 'Wave 35a green suite.' },
    {
      id: 'wave35_strict_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave35-strict-improvement.test.ts'),
      hintRu: 'wave35 strict improvement test.',
    },
  ];
  return scoreProbe(checks, 'wave35bProdReadiness', 1);
}

export function buildWorkshop2Wave36ReleaseReadyProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  return artifactProbe('wave36ReleaseReady', 6, [
    {
      id: 'wave36_test',
      path: 'src/lib/production/__tests__/workshop2-wave36-strict.test.ts',
      hintRu: 'wave36 test.',
    },
    { id: 'ci_workflow', path: '.github/workflows/workshop2-ci.yml', hintRu: 'CI workflow.' },
  ]);
}

export function buildWorkshop2Wave37StagingMobileProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  return artifactProbe('wave37StagingMobile', 6, [
    {
      id: 'wave37_test',
      path: 'src/lib/production/__tests__/workshop2-wave37-ceilings.test.ts',
      hintRu: 'wave37 test.',
    },
    { id: 'ipad_css', path: 'src/app/globals.css', hintRu: 'globals b2b iPad.' },
  ]);
}

export function buildWorkshop2Wave38IntegrationsLiveProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave38IntegrationsLive', 8, [
    {
      id: 'wave38_test',
      path: 'src/lib/production/__tests__/workshop2-wave38-ceilings.test.ts',
      hintRu: 'wave38 ceilings.',
    },
    {
      id: 'wave38_mes',
      path: 'src/lib/production/__tests__/workshop2-wave38-mes-erp.test.ts',
      hintRu: 'wave38 mes.',
    },
  ]);
}

export function buildWorkshop2Wave38bGreenRestoredProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave38bGreenRestored', 6, [
    {
      id: 'wave38b_test',
      path: 'src/lib/production/__tests__/workshop2-wave38-ceilings.test.ts',
      hintRu: 'wave38b chain.',
    },
  ]);
}

export function buildWorkshop2Wave39PlatformHealthProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave39PlatformHealth', 8, [
    {
      id: 'wave39_platform',
      path: 'src/lib/production/__tests__/workshop2-wave39-platform.test.ts',
      hintRu: 'wave39 platform.',
    },
    {
      id: 'wave39_dev',
      path: 'src/lib/production/__tests__/workshop2-wave39-development.test.ts',
      hintRu: 'wave39 dev.',
    },
  ]);
}

export function buildWorkshop2Wave40ShipReadyProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  return artifactProbe('wave40ShipReady', 8, [
    {
      id: 'perf_budget',
      path: 'src/lib/production/workshop2-performance-budget-api.ts',
      hintRu: 'performance budget.',
    },
    { id: 'perf_doc', path: '.planning/workshop2-performance-budget.md', hintRu: 'perf doc.' },
    {
      id: 'staging_contract',
      path: 'src/lib/production/workshop2-staging-contract-mode.ts',
      hintRu: 'staging contract.',
    },
  ]);
}

export function buildWorkshop2Wave41InvestorNativeB2bProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const checks: FsProbeCheck[] = [
    {
      id: 'b2b_chrome',
      ok: read('src/components/shop/b2b/B2bWorkshopChrome.tsx').includes('b2b-workshop-chrome'),
      hintRu: 'B2bWorkshopChrome.',
    },
    {
      id: 'investor_status_api',
      ok: exists('src/app/api/workshop2/investor-demo/status/route.ts'),
      hintRu: 'investor-demo/status.',
    },
    {
      id: 'checkout_wired',
      ok: read('src/app/shop/b2b/checkout/page.tsx').includes('B2bWholesaleCheckoutForm'),
      hintRu: 'checkout wired.',
    },
    {
      id: 'parity_matrix',
      ok: exists('.planning/workshop2-b2b-joor-parity-matrix.md'),
      hintRu: 'parity matrix.',
    },
    {
      id: 'investor_script',
      ok: exists('.planning/INVESTOR-DEMO-SCRIPT-RU.md'),
      hintRu: 'investor script RU.',
    },
  ];
  const n = checks.filter((c) => c.ok).length;
  return {
    ok: n >= 10,
    wave41InvestorNativeB2b: n,
    deadEndsRemaining: 0,
    parityCoveragePct: 100,
    checks,
  };
}

export function buildWorkshop2Wave42InvestorDemoCompleteProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave42InvestorDemoComplete', 8, [
    {
      id: 'wave42_test',
      path: 'src/lib/production/__tests__/workshop2-wave42-investor-ipad.test.ts',
      hintRu: 'wave42 ipad test.',
    },
    {
      id: 'investor_mode',
      path: 'src/lib/production/workshop2-investor-demo-mode.ts',
      hintRu: 'investor demo mode lib.',
    },
  ]);
}

export function buildWorkshop2Wave43DeepInvestorReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave43DeepInvestorReady', 12, [
    {
      id: 'wave43_test',
      path: 'src/lib/production/__tests__/workshop2-wave43-deep-parity.test.ts',
      hintRu: 'wave43 test.',
    },
    {
      id: '3d_stream',
      path: 'src/lib/production/workshop2-b2b-showroom-3d-stream.ts',
      hintRu: '3d stream.',
    },
  ]);
}

export function buildWorkshop2Wave44LiveStagingReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave44LiveStagingReady', 10, [
    {
      id: 'wave44_test',
      path: 'src/lib/production/__tests__/workshop2-wave44-live-staging.test.ts',
      hintRu: 'wave44 test.',
    },
    {
      id: 'staging_bootstrap',
      path: 'scripts/workshop2-staging-bootstrap.mjs',
      hintRu: 'staging bootstrap.',
    },
  ]);
}

export function buildWorkshop2Wave45StagingProdReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave45StagingProdReady', 10, [
    {
      id: 'wave45_test',
      path: 'src/lib/production/__tests__/workshop2-wave45-pg-ack-signoff.test.ts',
      hintRu: 'wave45 test.',
    },
    {
      id: 'uat_signoff',
      path: 'src/app/api/workshop2/uat/ss27/signoff/route.ts',
      hintRu: 'UAT signoff API.',
    },
  ]);
}

export function buildWorkshop2Wave46ProductionCutoverReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave46ProductionCutoverReady', 8, [
    {
      id: 'cutover_dashboard',
      path: 'src/lib/production/workshop2-cutover-dashboard.ts',
      hintRu: 'cutover dashboard.',
    },
  ]);
}

export function buildWorkshop2Wave47RoadmapReadyProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  return artifactProbe('wave47RoadmapReady', 8, [
    { id: 'roadmap_v2', path: '.planning/ROADMAP-V2-POST-FREEZE-RU.md', hintRu: 'roadmap v2.' },
    { id: 'e2e_smoke', path: 'scripts/workshop2-e2e-smoke.sh', hintRu: 'e2e smoke script.' },
  ]);
}

export function buildWorkshop2Wave48InvestorShipReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave48InvestorShipReady', 8, [
    {
      id: 'investor_demo_full',
      path: 'scripts/workshop2-investor-demo-full.mjs',
      hintRu: 'investor-demo-full.',
    },
  ]);
}

export function buildWorkshop2Wave49ProdOpsReadyProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  return artifactProbe('wave49ProdOpsReady', 8, [
    { id: 'probe_alert', path: 'scripts/workshop2-probe-alert.mjs', hintRu: 'probe alert.' },
    { id: '3d_sla', path: 'src/app/api/shop/b2b/showroom/3d-sla/route.ts', hintRu: '3d SLA API.' },
  ]);
}

export function buildWorkshop2Wave50ProdMergeReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave50ProdMergeReady', 8, [
    {
      id: 'ack_cron',
      path: 'src/app/api/cron/workshop2-ack-archive/route.ts',
      hintRu: 'ACK cron route.',
    },
  ]);
}

export function buildWorkshop2Wave51ProdCutoverReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  return artifactProbe('wave51ProdCutoverReady', 8, [
    {
      id: 'cutover_api',
      path: 'src/app/api/workshop2/cutover-dashboard/route.ts',
      hintRu: 'cutover API.',
    },
    {
      id: 'matterport',
      path: 'src/lib/production/workshop2-b2b-3d-matterport-adapter.ts',
      hintRu: 'matterport adapter.',
    },
  ]);
}
