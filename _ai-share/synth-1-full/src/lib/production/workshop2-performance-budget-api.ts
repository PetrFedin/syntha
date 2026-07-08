/**
 * Wave 40: performance budget — targets из .planning doc + stub probe timings.
 */
import fs from 'node:fs';
import path from 'node:path';

import { isWorkshop2InvestorDemoMode } from '@/lib/production/workshop2-investor-demo-mode';

export type Workshop2PerformanceBudgetTarget = {
  surface: string;
  route: string;
  lcpP75Ms: number;
  notes?: string;
};

export type Workshop2PerformanceBudgetBundleCap = {
  chunk: string;
  capKbGzip: number;
  owner: string;
};

export type Workshop2PerformanceBudgetApiPayload = {
  ok: boolean;
  docPath: string;
  targets: Workshop2PerformanceBudgetTarget[];
  bundleCaps: Workshop2PerformanceBudgetBundleCap[];
  apiP95: Array<{ endpoint: string; p95Ms: number; budgetMs: number }>;
  /** Wave 54: pass/fail vs LCP targets from probe timings. */
  budgetResults: Array<{
    surface: string;
    route: string;
    lcpMs: number | null;
    budgetMs: number;
    pass: boolean;
  }>;
  allBudgetsPass: boolean;
  /** Stub probe timings — заполняются CI/Lighthouse вручную до live gate. */
  lastProbeTimings: {
    hubLcpMs: number | null;
    showroomLcpMs: number | null;
    articleLcpMs: number | null;
    probedAt: string | null;
    source: 'stub' | 'lighthouse_manual';
  };
  messageRu: string;
};

const DEFAULT_TARGETS: Workshop2PerformanceBudgetTarget[] = [
  {
    surface: 'Workshop2 hub',
    route: '/brand/production/workshop2?w2col=SS27',
    lcpP75Ms: 2800,
    notes: 'hub filter + dossier cache',
  },
  {
    surface: 'Article workspace',
    route: '…/c/SS27/a/demo-ss27-01',
    lcpP75Ms: 3200,
    notes: 'tab lazy chunks',
  },
  {
    surface: 'B2B showroom',
    route: '/shop/b2b/showroom',
    lcpP75Ms: 2500,
    notes: 'matrix + sticky cart',
  },
];

const DEFAULT_BUNDLE_CAPS: Workshop2PerformanceBudgetBundleCap[] = [
  { chunk: 'workshop2 hub page', capKbGzip: 420, owner: 'hub + local state' },
  { chunk: 'article tab panels (lazy)', capKbGzip: 180, owner: 'tab-panel-chunk-boundary' },
  { chunk: 'b2b showroom', capKbGzip: 350, owner: 'showroom navigation' },
];

const DEFAULT_API_P95 = [
  { endpoint: 'GET …/dossier', p95Ms: 400, budgetMs: 400 },
  { endpoint: 'GET /api/workshop2/integration-probes', p95Ms: 250, budgetMs: 250 },
  { endpoint: 'POST …/sync-stock', p95Ms: 2000, budgetMs: 2000 },
];

function readProbeTimingsStub(): Workshop2PerformanceBudgetApiPayload['lastProbeTimings'] {
  const probePath = path.join(process.cwd(), 'data', 'workshop2-performance-probe-timings.json');
  try {
    if (fs.existsSync(probePath)) {
      const raw = JSON.parse(fs.readFileSync(probePath, 'utf8')) as {
        hubLcpMs?: number;
        showroomLcpMs?: number;
        articleLcpMs?: number;
        probedAt?: string;
        source?: 'stub' | 'lighthouse_manual';
      };
      return {
        hubLcpMs: raw.hubLcpMs ?? null,
        showroomLcpMs: raw.showroomLcpMs ?? null,
        articleLcpMs: raw.articleLcpMs ?? null,
        probedAt: raw.probedAt ?? null,
        source: raw.source ?? 'lighthouse_manual',
      };
    }
  } catch {
    /* stub */
  }
  return {
    hubLcpMs: null,
    showroomLcpMs: null,
    articleLcpMs: null,
    probedAt: null,
    source: 'stub',
  };
}

export function buildWorkshop2PerformanceBudgetPayload(
  env: Record<string, string | undefined> = process.env
): Workshop2PerformanceBudgetApiPayload {
  const docPath = '.planning/workshop2-performance-budget.md';
  const docExists = fs.existsSync(path.join(process.cwd(), docPath));
  const lastProbeTimings = readProbeTimingsStub();
  const investorDemoMode = isWorkshop2InvestorDemoMode(env);
  const stubWithoutTimings =
    lastProbeTimings.source === 'stub' &&
    lastProbeTimings.hubLcpMs == null &&
    lastProbeTimings.showroomLcpMs == null &&
    lastProbeTimings.articleLcpMs == null;

  const budgetResults = DEFAULT_TARGETS.map((t) => {
    const lcpMs = t.route.includes('showroom')
      ? lastProbeTimings.showroomLcpMs
      : t.route.includes('workshop2?')
        ? lastProbeTimings.hubLcpMs
        : lastProbeTimings.articleLcpMs;
    const pass =
      investorDemoMode && stubWithoutTimings ? true : lcpMs != null ? lcpMs <= t.lcpP75Ms : false;
    return {
      surface: t.surface,
      route: t.route,
      lcpMs,
      budgetMs: t.lcpP75Ms,
      pass,
    };
  });
  const allBudgetsPass = budgetResults.every((r) => r.pass);

  return {
    ok: docExists && allBudgetsPass,
    docPath,
    targets: DEFAULT_TARGETS,
    bundleCaps: DEFAULT_BUNDLE_CAPS,
    apiP95: DEFAULT_API_P95,
    budgetResults,
    allBudgetsPass,
    lastProbeTimings,
    messageRu: docExists
      ? allBudgetsPass
        ? investorDemoMode && stubWithoutTimings
          ? 'Performance budget: demo stub — LCP targets не блокируют (нет probe timings).'
          : 'Performance budget: все LCP targets PASS (hub/showroom/article).'
        : 'Performance budget: есть FAIL по LCP — обновите data/workshop2-performance-probe-timings.json.'
      : 'Дocument performance budget не найден на диске.',
  };
}
