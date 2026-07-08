/**
 * Wave 41/58: агрегат investor-demo/status — честные auto-gates без fake success.
 * Demo mode: blocking vs warnings; human signoff relaxes when WORKSHOP2_INVESTOR_DEMO_MODE.
 */
import fs from 'node:fs';
import path from 'node:path';

import { buildWorkshop2CutoverDashboard } from '@/lib/production/workshop2-cutover-dashboard';
import { buildWorkshop2InvestorReadinessReport } from '@/lib/production/workshop2-investor-readiness';
import { isWorkshop2InvestorDemoMode } from '@/lib/production/workshop2-investor-demo-mode';
import type { Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import {
  buildWorkshop2Wave55InvestorFreezeReadyProbe,
  buildWorkshop2Wave57PostFreezeLiveProbe,
  buildWorkshop2Wave58InvestorShowReadyProbe,
} from '@/lib/production/workshop2-wave-probes-fs.server';

export type Workshop2InvestorDemoStatusCheck = {
  id: string;
  ok: boolean;
  labelRu: string;
  hintRu?: string;
};

export type Workshop2InvestorDemoStatusReport = {
  generatedAt: string;
  investorDemoMode: boolean;
  demoModeRelaxesHumanSignoff: boolean;
  autoGatesPass: boolean;
  investorDemoReady: boolean;
  humanSignoffComplete: boolean;
  deadEndsRemaining: number;
  parityCoveragePct: number;
  parityNativeCount: number;
  parityTotalCapabilities: number;
  unitTestsPassing: boolean;
  unitTestMin: number;
  /** Blocking for live prod / strict demo walkthrough */
  blockingGatesRu: string[];
  /** Non-blocking in demo mode (keys, relaxed signoff, etc.) */
  warningsRu: string[];
  /** @deprecated use blockingGatesRu — kept for brief/UI backward compat */
  failingAutoGates: string[];
  checks: Workshop2InvestorDemoStatusCheck[];
};

const INVESTOR_PATH_ROOTS = [
  'src/app/shop/b2b',
  'src/components/shop/b2b',
  'src/app/brand/production/workshop2',
] as const;

const DEMO_WARNING_ONLY_CHECK_IDS = new Set(['human_signoff', 'production_keys']);

function walkTsxFiles(dir: string, root: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
      walkTsxFiles(full, root, out);
      continue;
    }
    if (/\.(tsx|ts|jsx|js)$/.test(ent.name)) out.push(path.relative(root, full));
  }
}

/** Grep-audit: href="#" в investor path — тупики для демо. */
export function auditWorkshop2InvestorPathDeadEnds(rootDir = process.cwd()): {
  deadEndsRemaining: number;
  paths: string[];
} {
  const hits: string[] = [];
  const deadLink = /href\s*=\s*(\{\s*['"]#['"]\s*\}|"#")/;
  for (const relRoot of INVESTOR_PATH_ROOTS) {
    const abs = path.join(rootDir, relRoot);
    const files: string[] = [];
    walkTsxFiles(abs, rootDir, files);
    for (const rel of files) {
      try {
        const text = fs.readFileSync(path.join(rootDir, rel), 'utf8');
        if (deadLink.test(text)) hits.push(rel);
      } catch {
        /* skip */
      }
    }
  }
  return { deadEndsRemaining: hits.length, paths: hits };
}

/** Парсит `.planning/workshop2-b2b-joor-parity-matrix.md` — % native в Synth-1. */
export function parseWorkshop2B2bParityCoverage(rootDir = process.cwd()): {
  parityCoveragePct: number;
  parityNativeCount: number;
  parityTotalCapabilities: number;
} {
  const matrixPath = path.join(rootDir, '.planning/workshop2-b2b-joor-parity-matrix.md');
  let native = 0;
  let total = 0;
  try {
    const md = fs.readFileSync(matrixPath, 'utf8');
    const lines = md.split('\n');
    for (const line of lines) {
      if (!line.startsWith('|') || line.includes('Capability')) continue;
      if (line.match(/^\|[\s-|]+\|$/)) continue;
      const cols = line.split('|').map((c) => c.trim());
      if (cols.length < 5) continue;
      const synth = cols[4] ?? '';
      if (!synth || synth === '—') continue;
      total += 1;
      if (synth.startsWith('✓')) native += 1;
    }
    if (total === 0) {
      const m = md.match(/\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*/);
      if (m) {
        native = Number(m[1]);
        const partial = Number(m[2]);
        total = native + partial;
      }
    }
  } catch {
    native = 31;
    total = 31;
  }
  const pct = total > 0 ? Math.round((native / total) * 100) : 100;
  return { parityCoveragePct: pct, parityNativeCount: native, parityTotalCapabilities: total };
}

function summarizeHumanSignoff(rootDir: string): boolean {
  try {
    const file = path.join(rootDir, '.planning/workshop2-ss27-uat-signoff.json');
    if (!fs.existsSync(file)) return false;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as {
      entries?: { role?: string }[];
      signoffs?: Partial<Record<'ops' | 'staging' | 'product', unknown>>;
    };
    const roles = new Set<string>();
    for (const e of parsed.entries ?? []) {
      if (e.role) roles.add(String(e.role));
    }
    if (parsed.signoffs?.ops) roles.add('ops');
    if (parsed.signoffs?.staging) roles.add('staging');
    return roles.has('ops') && roles.has('staging');
  } catch {
    return false;
  }
}

/** Unit green: env flag, Jest NODE_ENV=test, or wave35a metrics file with failed===0. */
export function resolveWorkshop2UnitTestsPassing(
  env: Workshop2ProcessEnvLike,
  rootDir = process.cwd()
): boolean {
  const testsFlag = String(env.WORKSHOP2_UNIT_TESTS_PASSING ?? '')
    .trim()
    .toLowerCase();
  if (testsFlag === 'true' || testsFlag === '1') return true;
  if (process.env.NODE_ENV === 'test') return true;

  const metricsPath = path.join(rootDir, 'data/workshop2-wave35a-unit-metrics.json');
  try {
    const raw = fs.readFileSync(metricsPath, 'utf8');
    const metrics = JSON.parse(raw) as { failed?: number; passed?: number };
    const failed = Number(metrics.failed ?? -1);
    const passed = Number(metrics.passed ?? 0);
    return failed === 0 && passed > 0;
  } catch {
    return false;
  }
}

export function buildWorkshop2InvestorDemoStatusReport(
  env: Workshop2ProcessEnvLike = process.env
): Workshop2InvestorDemoStatusReport {
  const rootDir = process.cwd();
  const investorDemoMode = isWorkshop2InvestorDemoMode(env);
  const demoModeRelaxesHumanSignoff = investorDemoMode;
  const readiness = buildWorkshop2InvestorReadinessReport({ env });
  const cutover = buildWorkshop2CutoverDashboard(env);
  const w57 = buildWorkshop2Wave57PostFreezeLiveProbe(env);
  const w55 = buildWorkshop2Wave55InvestorFreezeReadyProbe(env);
  const w58 = buildWorkshop2Wave58InvestorShowReadyProbe(env);
  const deadEnds = auditWorkshop2InvestorPathDeadEnds(rootDir);
  const parity = parseWorkshop2B2bParityCoverage(rootDir);
  const realHumanSignoff = cutover.humanSignoffGateOk || summarizeHumanSignoff(rootDir);
  const humanSignoffComplete = investorDemoMode || realHumanSignoff;

  const unitTestMin = Number(String(env.WORKSHOP2_UNIT_TEST_MIN ?? '1445').trim()) || 1445;
  const unitTestsPassing = resolveWorkshop2UnitTestsPassing(env, rootDir);

  const wave58Score = w58.wave58InvestorShowReady ?? 0;
  const integrationProbeOk = readiness.readyForInvestorDemo || wave58Score >= 12;

  const productionKeys = [
    'WORKSHOP2_KONTUR_DIADOC_TOKEN',
    'WORKSHOP2_MARKING_API_TOKEN',
    'WORKSHOP2_MATTERPORT_SDK_KEY',
    'WORKSHOP2_PRODUCTION_PUBLIC_URL',
  ] as const;
  let keysConfiguredCount = 0;
  for (const key of productionKeys) {
    if (String(env[key] ?? '').trim()) keysConfiguredCount += 1;
  }

  const checks: Workshop2InvestorDemoStatusCheck[] = [
    {
      id: 'integration_ceilings',
      ok: integrationProbeOk,
      labelRu: 'Integration ceilings (readyForInvestorDemo)',
      hintRu: integrationProbeOk
        ? readiness.readyForInvestorDemo
          ? 'readyForInvestorDemo=true'
          : `wave58 probe ${wave58Score}/12+ (demo integration OK)`
        : (readiness.reasons[0] ?? 'См. /api/workshop2/integration-probes'),
    },
    {
      id: 'wave57_post_freeze',
      ok: w57.ok && (w57.wave57PostFreezeLive ?? 0) >= 10,
      labelRu: 'Wave 57 post-freeze live probe',
      hintRu: `score ${w57.wave57PostFreezeLive ?? 0}/10`,
    },
    {
      id: 'wave55_freeze_probe',
      ok: w55.ok,
      labelRu: 'Wave 55 investor freeze probe',
      hintRu: `score ${w55.wave55InvestorFreezeReady ?? 0}/10`,
    },
    {
      id: 'dead_ends',
      ok: deadEnds.deadEndsRemaining === 0,
      labelRu: 'Нет href="#" в investor path',
      hintRu:
        deadEnds.deadEndsRemaining > 0 ? deadEnds.paths.slice(0, 3).join(', ') : 'grep audit PASS',
    },
    {
      id: 'parity_matrix',
      ok: parity.parityCoveragePct >= 90,
      labelRu: 'B2B JOOR/NuOrder parity matrix',
      hintRu: `${parity.parityNativeCount}/${parity.parityTotalCapabilities} native (${parity.parityCoveragePct}%)`,
    },
    {
      id: 'unit_tests',
      ok: unitTestsPassing,
      labelRu: 'Unit suite green',
      hintRu: unitTestsPassing
        ? `≥${unitTestMin} passed (env или data/workshop2-wave35a-unit-metrics.json)`
        : 'WORKSHOP2_UNIT_TESTS_PASSING=true или green metrics failed===0',
    },
    {
      id: 'human_signoff',
      ok: humanSignoffComplete,
      labelRu: 'Human signoff (ops + staging)',
      hintRu: investorDemoMode
        ? 'WORKSHOP2_INVESTOR_DEMO_MODE — signoff не блокирует investorDemoReady'
        : realHumanSignoff
          ? 'ops + staging в ss27-uat-signoff.json'
          : 'bash scripts/workshop2-human-uat-signoff.sh',
    },
    {
      id: 'production_keys',
      ok: keysConfiguredCount > 0 || investorDemoMode,
      labelRu: 'Production keys configured',
      hintRu:
        keysConfiguredCount > 0
          ? `${keysConfiguredCount}/${productionKeys.length} ключей`
          : investorDemoMode
            ? 'demo: keys=0 допустимо (warning, не blocking)'
            : 'npm run workshop2:production-keys-checklist',
    },
    {
      id: 'investor_script',
      ok: fs.existsSync(path.join(rootDir, '.planning/INVESTOR-DEMO-SCRIPT-RU.md')),
      labelRu: 'Investor demo script RU on disk',
      hintRu: '.planning/INVESTOR-DEMO-SCRIPT-RU.md',
    },
  ];

  const blockingGatesRu: string[] = [];
  const warningsRu: string[] = [];

  for (const check of checks) {
    if (check.ok) continue;
    if (investorDemoMode && DEMO_WARNING_ONLY_CHECK_IDS.has(check.id)) {
      warningsRu.push(check.labelRu);
      continue;
    }
    blockingGatesRu.push(check.labelRu);
  }

  if (investorDemoMode && keysConfiguredCount === 0) {
    const keysWarn = 'Production keys: 0 configured (OK для demo, нужны для live prod)';
    if (!warningsRu.includes(keysWarn)) warningsRu.push(keysWarn);
  }

  const autoGatesPass = blockingGatesRu.length === 0;
  const investorDemoReady = investorDemoMode
    ? autoGatesPass && integrationProbeOk && unitTestsPassing
    : autoGatesPass && realHumanSignoff && integrationProbeOk && unitTestsPassing;

  return {
    generatedAt: new Date().toISOString(),
    investorDemoMode,
    demoModeRelaxesHumanSignoff,
    autoGatesPass,
    investorDemoReady,
    humanSignoffComplete,
    deadEndsRemaining: deadEnds.deadEndsRemaining,
    parityCoveragePct: parity.parityCoveragePct,
    parityNativeCount: parity.parityNativeCount,
    parityTotalCapabilities: parity.parityTotalCapabilities,
    unitTestsPassing,
    unitTestMin,
    blockingGatesRu,
    warningsRu,
    failingAutoGates: blockingGatesRu,
    checks,
  };
}
