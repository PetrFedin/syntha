/**
 * Wave 58: one-screen JSON для investor dashboard / brief page.
 */
import { buildWorkshop2InvestorDemoStatusReport } from '@/lib/production/workshop2-investor-demo-status';
import {
  WORKSHOP2_INVESTOR_PRESENTATION_TIPS_RU,
  WORKSHOP2_INVESTOR_QA_DOC_PATH,
} from '@/lib/production/workshop2-investor-presentation-tips-ru';
import type { Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import {
  buildWorkshop2Wave54ProdHardeningReadyProbe,
  buildWorkshop2Wave55InvestorFreezeReadyProbe,
  buildWorkshop2Wave56PostFreezeReadyProbe,
  buildWorkshop2Wave57PostFreezeLiveProbe,
  buildWorkshop2Wave58InvestorShowReadyProbe,
} from '@/lib/production/workshop2-wave-probes-fs.server';

const PRODUCTION_KEYS = [
  'WORKSHOP2_KONTUR_DIADOC_TOKEN',
  'WORKSHOP2_MARKING_API_TOKEN',
  'WORKSHOP2_MATTERPORT_SDK_KEY',
  'WORKSHOP2_MATTERPORT_SPACE_ID',
  'SENTRY_DSN',
  'WORKSHOP2_ACK_ARCHIVE_S3_BUCKET',
  'WORKSHOP2_PRODUCTION_PUBLIC_URL',
  'WORKSHOP2_STAGING_PUBLIC_URL',
  'WORKSHOP2_BRAND_TENANT_REGISTRY_JSON',
  'WORKSHOP2_B2B_OAUTH_VAULT_WEBHOOK_SECRET',
] as const;

export type Workshop2InvestorDemoBrief = {
  generatedAt: string;
  /** Server-side investor demo flag (WORKSHOP2_INVESTOR_DEMO_MODE). */
  demoMode: boolean;
  investorDemoMode: boolean;
  labelRu: string;
  parityNativePct: number;
  unitTests: { passing: boolean; minExpected: number; lastGreenNoteRu: string };
  probes: {
    wave54: number;
    wave55: number;
    wave56: number;
    wave57: number;
    wave58: number;
  };
  humanSignoff: { complete: boolean; demoMode: boolean };
  demoModeRelaxesHumanSignoff: boolean;
  keysConfiguredCount: number;
  keysTotal: number;
  investorDemoReady: boolean;
  blockingGatesRu: string[];
  warningsRu: string[];
  /** @deprecated use blockingGatesRu */
  failingAutoGatesRu: string[];
  demoPaths: Array<{ id: string; path: string; labelRu: string }>;
  scriptPath: string;
  vsLiveDocPath: string;
  briefPagePath: string;
  /** 2–3 предложения «что говорить» на каждый из 18 шагов сценария. */
  presentationTipsRu: string[];
  qaDocPath: string;
};

export const WORKSHOP2_INVESTOR_DEMO_PATHS: Workshop2InvestorDemoBrief['demoPaths'] = [
  { id: 'w2_hub', path: '/brand/production/workshop2?w2col=SS27', labelRu: 'W2 Hub SS27' },
  { id: 'w2_article', path: '/brand/production/workshop2/c/SS27/a/demo-ss27-01', labelRu: 'Досье demo-ss27-01' },
  { id: 'b2b_showroom', path: '/shop/b2b/showroom?collection=SS27&article=demo-ss27-01', labelRu: 'B2B Showroom + matrix' },
  { id: 'b2b_checkout', path: '/shop/b2b/checkout', labelRu: 'Оптовое оформление B2B wholesale' },
  { id: 'b2b_rep', path: '/shop/b2b/sales-rep-portal', labelRu: 'Rep portal + offline queue' },
  { id: 'brief', path: '/brand/production/workshop2/investor-brief', labelRu: 'Бриф для инвестора (read-only)' },
  { id: 'summary', path: '/brand/production/workshop2/investor-summary', labelRu: 'Сводка для инвестора (read-only)' },
];

export function countWorkshop2ProductionKeysConfigured(
  env: Workshop2ProcessEnvLike = process.env
): { configuredCount: number; total: number } {
  let configuredCount = 0;
  for (const key of PRODUCTION_KEYS) {
    if (String(env[key] ?? '').trim()) configuredCount += 1;
  }
  return { configuredCount, total: PRODUCTION_KEYS.length };
}

export function buildWorkshop2InvestorDemoBrief(
  env: Workshop2ProcessEnvLike = process.env
): Workshop2InvestorDemoBrief {
  const status = buildWorkshop2InvestorDemoStatusReport(env);
  const w54 = buildWorkshop2Wave54ProdHardeningReadyProbe(env);
  const w55 = buildWorkshop2Wave55InvestorFreezeReadyProbe(env);
  const w56 = buildWorkshop2Wave56PostFreezeReadyProbe(env);
  const w57 = buildWorkshop2Wave57PostFreezeLiveProbe(env);
  const w58 = buildWorkshop2Wave58InvestorShowReadyProbe(env);
  const keys = countWorkshop2ProductionKeysConfigured(env);

  return {
    generatedAt: new Date().toISOString(),
    demoMode: status.investorDemoMode,
    investorDemoMode: status.investorDemoMode,
    labelRu: status.investorDemoReady
      ? status.investorDemoMode
        ? 'Готово к инвесторскому показу (demo mode — blocking gates PASS).'
        : 'Готово к инвесторскому показу (auto-gates + human signoff).'
      : 'Требуется донастройка — см. blockingGatesRu (без fake success).',
    parityNativePct: status.parityCoveragePct,
    unitTests: {
      passing: status.unitTestsPassing,
      minExpected: status.unitTestMin,
      lastGreenNoteRu: status.unitTestsPassing
        ? `npm run test:workshop2:unit — ≥${status.unitTestMin} passed`
        : 'WORKSHOP2_UNIT_TESTS_PASSING=true или data/workshop2-wave35a-unit-metrics.json failed===0',
    },
    probes: {
      wave54: w54.wave54ProdHardeningReady ?? 0,
      wave55: w55.wave55InvestorFreezeReady ?? 0,
      wave56: w56.wave56PostFreezeReady ?? 0,
      wave57: w57.wave57PostFreezeLive ?? 0,
      wave58: w58.wave58InvestorShowReady ?? 0,
    },
    humanSignoff: {
      complete: status.humanSignoffComplete,
      demoMode: status.investorDemoMode,
    },
    demoModeRelaxesHumanSignoff: status.demoModeRelaxesHumanSignoff,
    keysConfiguredCount: keys.configuredCount,
    keysTotal: keys.total,
    investorDemoReady: status.investorDemoReady,
    blockingGatesRu: status.blockingGatesRu,
    warningsRu: status.warningsRu,
    failingAutoGatesRu: status.blockingGatesRu,
    demoPaths: WORKSHOP2_INVESTOR_DEMO_PATHS,
    scriptPath: '.planning/INVESTOR-DEMO-SCRIPT-RU.md',
    vsLiveDocPath: '.planning/INVESTOR-DEMO-VS-LIVE-RU.md',
    briefPagePath: '/brand/production/workshop2/investor-brief',
    presentationTipsRu: WORKSHOP2_INVESTOR_PRESENTATION_TIPS_RU,
    qaDocPath: WORKSHOP2_INVESTOR_QA_DOC_PATH,
  };
}
