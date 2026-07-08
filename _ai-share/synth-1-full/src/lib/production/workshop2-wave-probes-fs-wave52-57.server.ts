import fs from 'node:fs';
import path from 'node:path';
import { type Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';

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
  return { exists, read };
}

function scoreProbe(checks: FsProbeCheck[], key: string, min: number) {
  const n = checks.filter((c) => c.ok).length;
  return { ok: n >= min, [key]: n, checks } as { ok: boolean; checks: FsProbeCheck[] } & Record<
    string,
    number
  >;
}

export function buildWorkshop2Wave52ProdLiveReadyProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const checks: FsProbeCheck[] = [
    {
      id: 'cutover_dashboard_lib',
      ok: exists('src/lib/production/workshop2-cutover-dashboard.ts'),
      hintRu: 'cutover dashboard lib.',
    },
    {
      id: 'cutover_dashboard_api',
      ok: exists('src/app/api/workshop2/cutover-dashboard/route.ts'),
      hintRu: 'cutover dashboard API.',
    },
    {
      id: 'brand_tenant_registry',
      ok: exists('src/lib/production/workshop2-brand-tenant-registry.ts'),
      hintRu: 'brand tenant registry.',
    },
    {
      id: 'b2b_brand_registry_api',
      ok: exists('src/app/api/shop/b2b/brand-registry/route.ts'),
      hintRu: 'B2B brand registry API.',
    },
    {
      id: 'rep_brand_switcher',
      ok: exists('src/components/shop/b2b/B2bRepBrandSwitcher.tsx'),
      hintRu: 'rep brand switcher UI.',
    },
    {
      id: 'production_keys_checklist',
      ok: exists('scripts/workshop2-production-keys-checklist.mjs'),
      hintRu: 'production keys checklist.',
    },
    {
      id: 'merge_assist',
      ok: exists('scripts/workshop2-merge-assist.sh'),
      hintRu: 'merge assist script.',
    },
    {
      id: 'probe_alert',
      ok: exists('scripts/workshop2-probe-alert.mjs'),
      hintRu: 'probe alert script.',
    },
    {
      id: 'probe_prod',
      ok: exists('scripts/workshop2-probe-prod.mjs'),
      hintRu: 'probe prod script.',
    },
    {
      id: 'env_production_ru',
      ok: exists('.env.production.ru.example'),
      hintRu: '.env.production.ru.example.',
    },
    {
      id: 'wave52_restore',
      ok: exists('scripts/wave52-restore-disk.mjs'),
      hintRu: 'wave52-restore-disk.',
    },
    {
      id: 'wave52_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave52-prod-live.test.ts'),
      hintRu: 'wave52 unit test.',
    },
  ];
  return scoreProbe(checks, 'wave52ProdLiveReady', 12);
}

export function buildWorkshop2Wave53ProdSlaReadyProbe(env: Workshop2ProcessEnvLike = process.env) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const w52 = buildWorkshop2Wave52ProdLiveReadyProbe(env);
  const checks: FsProbeCheck[] = [
    {
      id: 'sla_dashboard_lib',
      ok: exists('src/lib/production/workshop2-ops-sla-dashboard.ts'),
      hintRu: 'SLA dashboard lib.',
    },
    {
      id: 'sla_dashboard_api',
      ok: exists('src/app/api/workshop2/ops/sla-dashboard/route.ts'),
      hintRu: 'SLA dashboard API.',
    },
    {
      id: 'showroom_3d_sla',
      ok: exists('src/app/api/shop/b2b/showroom/3d-sla/route.ts'),
      hintRu: '3D SLA API.',
    },
    {
      id: 'orders_export',
      ok: exists('src/app/api/shop/b2b/orders/export/route.ts'),
      hintRu: 'orders export route.',
    },
    {
      id: 'probe_escalation',
      ok: read('scripts/workshop2-probe-escalation.mjs').includes(
        'WORKSHOP2_PAGERDUTY_WEBHOOK_URL'
      ),
      hintRu: 'escalation probe script.',
    },
    {
      id: 'wave53_restore',
      ok: exists('scripts/wave53-restore-disk.mjs'),
      hintRu: 'wave53-restore-disk.',
    },
    {
      id: 'wave53_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave53-prod-sla.test.ts'),
      hintRu: 'wave53 test.',
    },
    { id: 'wave52_baseline', ok: w52.ok, hintRu: 'Wave 52 baseline.' },
    {
      id: 'probe_alert_w53',
      ok: read('scripts/workshop2-probe-alert.mjs').includes('wave53ProdSlaReady'),
      hintRu: 'probe-alert wave53.',
    },
    {
      id: 'ru_ops_runbook',
      ok: exists('.planning/workshop2-ru-ops-runbook.md'),
      hintRu: 'RU ops runbook.',
    },
    {
      id: 'b2b_invoice_repo',
      ok: exists('src/lib/server/workshop2-b2b-invoice-repository.ts'),
      hintRu: 'B2B invoice repository.',
    },
    {
      id: 'sla_targets_doc',
      ok: exists('.planning/workshop2-sla-targets.md'),
      hintRu: 'SLA targets doc.',
    },
  ];
  return scoreProbe(checks, 'wave53ProdSlaReady', 12);
}

export function buildWorkshop2Wave54ProdHardeningReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const w53 = buildWorkshop2Wave53ProdSlaReadyProbe(env);
  const checks: FsProbeCheck[] = [
    {
      id: 'wave54_restore',
      ok: exists('scripts/wave54-restore-disk.mjs'),
      hintRu: 'wave54-restore-disk.',
    },
    { id: 'probe_prod', ok: exists('scripts/workshop2-probe-prod.mjs'), hintRu: 'probe-prod.' },
    {
      id: 'probe_escalation',
      ok: exists('scripts/workshop2-probe-escalation.mjs'),
      hintRu: 'probe-escalation.',
    },
    {
      id: 'ack_s3',
      ok: exists('scripts/workshop2-ack-s3-lifecycle-apply.mjs'),
      hintRu: 'S3 lifecycle ACK.',
    },
    {
      id: 'ack_drill',
      ok: exists('scripts/workshop2-ack-restore-drill-quarterly.mjs'),
      hintRu: 'restore drill quarterly.',
    },
    {
      id: 'b2b_invoice_sql',
      ok: exists('db/migrations/022_workshop2_b2b_invoice.sql'),
      hintRu: 'invoice migration.',
    },
    {
      id: 'b2b_invoice_repo',
      ok: exists('src/lib/server/workshop2-b2b-invoice-repository.ts'),
      hintRu: 'invoice repository.',
    },
    {
      id: 'perf_budget',
      ok: exists('src/lib/production/workshop2-performance-budget-api.ts'),
      hintRu: 'performance budget API.',
    },
    {
      id: 'probe_prod_workflow',
      ok: exists('.github/workflows/workshop2-probe-prod.yml'),
      hintRu: 'probe-prod CI workflow.',
    },
    {
      id: 'wave54_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave54-prod-hardening.test.ts'),
      hintRu: 'wave54 test.',
    },
    {
      id: 'probe_alert_w54',
      ok: read('scripts/workshop2-probe-alert.mjs').includes('wave54ProdHardeningReady'),
      hintRu: 'probe-alert wave54.',
    },
    { id: 'wave53_baseline', ok: w53.ok, hintRu: 'Wave 53 baseline.' },
  ];
  return scoreProbe(checks, 'wave54ProdHardeningReady', 12);
}

export function buildWorkshop2Wave55InvestorFreezeReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const w54 = buildWorkshop2Wave54ProdHardeningReadyProbe(env);
  const checks: FsProbeCheck[] = [
    {
      id: 'wave55_restore',
      ok: exists('scripts/wave55-restore-disk.mjs'),
      hintRu: 'wave55-restore-disk.',
    },
    {
      id: 'release_notes',
      ok: exists('.planning/RELEASE-NOTES-WAVES-9-55-RU.md'),
      hintRu: 'RELEASE-NOTES RU.',
    },
    {
      id: 'investor_freeze',
      ok: exists('.planning/INVESTOR-FREEZE-WAVE55.md'),
      hintRu: 'INVESTOR-FREEZE doc.',
    },
    {
      id: 'freeze_tag',
      ok: exists('scripts/workshop2-investor-freeze-tag.sh'),
      hintRu: 'freeze tag script.',
    },
    {
      id: 'wave55_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave55-investor-freeze.test.ts'),
      hintRu: 'wave55 test.',
    },
    {
      id: 'probe_alert_w55',
      ok: read('scripts/workshop2-probe-alert.mjs').includes('wave55InvestorFreezeReady'),
      hintRu: 'probe-alert wave55.',
    },
    {
      id: 'uat_signoff_api',
      ok: exists('src/app/api/workshop2/uat/ss27/signoff/route.ts'),
      hintRu: 'UAT signoff API.',
    },
    {
      id: 'invoice_stub_route',
      ok: exists('src/app/api/shop/b2b/orders/[id]/invoice-stub/route.ts'),
      hintRu: 'invoice stub route.',
    },
    {
      id: 'ack_drill_last',
      ok: read('scripts/workshop2-ack-restore-drill-quarterly.mjs').includes(
        'workshop2-ack-restore-drill-last.json'
      ),
      hintRu: 'ACK drill last JSON.',
    },
    {
      id: 'ops_applied_checklist_md',
      ok: exists('.planning/workshop2-wave55-ops-applied-checklist.md'),
      hintRu: 'ops applied checklist MD.',
    },
    { id: 'wave54_baseline', ok: w54.ok, hintRu: 'Wave 54 baseline.' },
    {
      id: 'cutover_freeze_gate',
      ok: read('src/lib/production/workshop2-cutover-dashboard.ts').includes('wave55FreezeReady'),
      hintRu: 'cutover wave55 gate.',
    },
  ];
  return scoreProbe(checks, 'wave55InvestorFreezeReady', 10);
}

export function buildWorkshop2Wave56PostFreezeReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const w55 = buildWorkshop2Wave55InvestorFreezeReadyProbe(env);
  const checks: FsProbeCheck[] = [
    {
      id: 'wave56_restore',
      ok: exists('scripts/wave56-restore-disk.mjs'),
      hintRu: 'wave56-restore-disk.',
    },
    {
      id: 'ops_checklist_script',
      ok: read('scripts/workshop2-wave55-ops-applied-checklist.mjs').includes('orgApplied'),
      hintRu: 'ops checklist journal or env.',
    },
    {
      id: 'offline_pack_lib',
      ok: exists('src/lib/production/workshop2-b2b-rep-offline-pack.ts'),
      hintRu: 'offline pack lib.',
    },
    {
      id: 'offline_pack_api',
      ok: exists('src/app/api/shop/b2b/rep/offline-pack/route.ts'),
      hintRu: 'offline-pack API.',
    },
    {
      id: 'ack_drill_prod',
      ok: read('scripts/workshop2-ack-restore-drill-quarterly.mjs').includes('prodDrill'),
      hintRu: 'ACK drill --prod.',
    },
    {
      id: 'roadmap_v2',
      ok: exists('.planning/ROADMAP-V2-POST-FREEZE-RU.md'),
      hintRu: 'ROADMAP V2 RU.',
    },
    {
      id: 'multi_brand_playbook',
      ok: exists('.planning/workshop2-multi-brand-rollout-playbook-RU.md'),
      hintRu: 'multi-brand playbook.',
    },
    {
      id: 'wave56_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave56-post-freeze.test.ts'),
      hintRu: 'wave56 test.',
    },
    {
      id: 'probe_alert_w56',
      ok: read('scripts/workshop2-probe-alert.mjs').includes('wave56PostFreezeReady'),
      hintRu: 'probe-alert wave56.',
    },
    {
      id: 'ops_applied_status',
      ok: exists('src/lib/production/workshop2-wave-ops-applied-status.ts'),
      hintRu: 'ops applied status lib.',
    },
    { id: 'wave55_baseline', ok: w55.ok, hintRu: 'Wave 55 baseline.' },
    {
      id: 'invoice_html_stub',
      ok: read('src/lib/production/workshop2-b2b-invoice-html-stub.ts').includes('печать в PDF'),
      hintRu: 'invoice HTML print RU.',
    },
  ];
  return scoreProbe(checks, 'wave56PostFreezeReady', 10);
}

export function buildWorkshop2Wave57PostFreezeLiveProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const w56 = buildWorkshop2Wave56PostFreezeReadyProbe(env);
  const checks: FsProbeCheck[] = [
    {
      id: 'wave57_restore_disk',
      ok: exists('scripts/wave57-restore-disk.mjs'),
      hintRu: 'wave57-restore-disk.',
    },
    {
      id: 'ops_mark_applied_api',
      ok:
        exists('src/app/api/workshop2/ops/mark-applied/route.ts') &&
        read('src/lib/production/workshop2-ops-applied-org-journal.ts').includes(
          'appendWorkshop2OpsAppliedOrgJournal'
        ),
      hintRu: 'mark-applied org journal.',
    },
    {
      id: 'ops_checklist_journal_or_env',
      ok: read('scripts/workshop2-wave55-ops-applied-checklist.mjs').includes('orgApplied'),
      hintRu: 'checklist journal OR env.',
    },
    {
      id: 'ack_drill_prod_flag',
      ok:
        read('scripts/workshop2-ack-restore-drill-quarterly.mjs').includes('prodDrill') &&
        read('.planning/workshop2-ru-ops-runbook.md').includes('mark-applied'),
      hintRu: 'ACK drill prod + runbook.',
    },
    {
      id: 'invoice_pdf_jspdf_module',
      ok:
        exists('src/lib/production/workshop2-schet-offerta-pdf.ts') &&
        read('src/app/api/shop/b2b/orders/[id]/schet-offerta.pdf/route.ts').includes(
          'WORKSHOP2_INVOICE_PIPELINE_JSPDF'
        ),
      hintRu: 'jsPDF schet-offerta API.',
    },
    {
      id: 'invoice_pdf_playwright_script',
      ok: read('scripts/workshop2-invoice-pdf-playwright.mjs').includes(
        'WORKSHOP2_INVOICE_PDF_ENGINE'
      ),
      hintRu: 'Playwright invoice PDF (optional).',
    },
    {
      id: 'rep_offline_sync_client',
      ok:
        exists('src/components/shop/b2b/B2bRepOfflineSyncClient.tsx') &&
        read('src/app/shop/b2b/sales-rep-portal/page.tsx').includes('Офлайн очередь'),
      hintRu: 'rep offline queue banner.',
    },
    {
      id: 'joor_oauth_prod_callback',
      ok:
        exists('src/app/api/shop/b2b/inbound/oauth/callback/route.ts') &&
        read('src/lib/production/workshop2-b2b-oauth-inbound.ts').includes(
          'isWorkshop2B2bOAuthProdLiveReady'
        ),
      hintRu: 'JOOR OAuth prod.',
    },
    {
      id: 'production_ru_joor_example',
      ok:
        !exists('.env.production.ru.example') ||
        read('.env.production.ru.example').includes('WORKSHOP2_B2B_OAUTH'),
      hintRu: 'production.ru JOOR env.',
    },
    {
      id: 'wave57_unit_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave57-post-freeze-live.test.ts'),
      hintRu: 'wave57 test (+14).',
    },
    {
      id: 'probe_alert_wave57',
      ok: read('scripts/workshop2-probe-alert.mjs').includes('wave57PostFreezeLive'),
      hintRu: 'probe-alert wave57.',
    },
    { id: 'wave56_baseline', ok: w56.ok, hintRu: 'Wave 56 baseline.' },
  ];
  return scoreProbe(checks, 'wave57PostFreezeLive', 10);
}

export function buildWorkshop2Wave58InvestorShowReadyProbe(
  env: Workshop2ProcessEnvLike = process.env
) {
  void env;
  const { exists, read } = fsProbeHelpers();
  const w57 = buildWorkshop2Wave57PostFreezeLiveProbe(env);
  const checks: FsProbeCheck[] = [
    {
      id: 'wave58_restore',
      ok: exists('scripts/wave58-restore-disk.mjs'),
      hintRu: 'wave58-restore-disk.',
    },
    {
      id: 'investor_script_ru',
      ok: exists('.planning/INVESTOR-DEMO-SCRIPT-RU.md'),
      hintRu: 'INVESTOR-DEMO-SCRIPT-RU.md.',
    },
    {
      id: 'investor_vs_live',
      ok: exists('.planning/INVESTOR-DEMO-VS-LIVE-RU.md'),
      hintRu: 'INVESTOR-DEMO-VS-LIVE RU.',
    },
    {
      id: 'brief_api',
      ok: exists('src/app/api/workshop2/investor-demo/brief/route.ts'),
      hintRu: 'investor-demo/brief API.',
    },
    {
      id: 'status_api',
      ok: exists('src/app/api/workshop2/investor-demo/status/route.ts'),
      hintRu: 'investor-demo/status API.',
    },
    {
      id: 'brief_page',
      ok: exists('src/app/brand/production/workshop2/investor-brief/page.tsx'),
      hintRu: 'investor-brief page.',
    },
    {
      id: 'b2b_chrome',
      ok: read('src/components/shop/b2b/B2bWorkshopChrome.tsx').includes('b2b-workshop-chrome'),
      hintRu: 'B2bWorkshopChrome.',
    },
    {
      id: 'b2b_layout',
      ok: exists('src/app/shop/b2b/layout.tsx'),
      hintRu: 'shop/b2b layout wraps chrome.',
    },
    {
      id: 'golden_e2e',
      ok: exists('e2e/workshop2-investor-golden-path.spec.ts'),
      hintRu: 'investor golden path E2E.',
    },
    {
      id: 'wave58_test',
      ok: exists('src/lib/production/__tests__/workshop2-wave58-investor-show.test.ts'),
      hintRu: 'wave58 unit test.',
    },
    {
      id: 'investor_show_npm',
      ok: read('package.json').includes('workshop2:investor-show'),
      hintRu: 'npm run workshop2:investor-show.',
    },
    {
      id: 'offline_idb',
      ok: read('src/components/shop/b2b/B2bRepOfflineSyncClient.tsx').includes('b2b-offline-db'),
      hintRu: 'IndexedDB b2b-offline-db v1.',
    },
    {
      id: 'visual_checklist',
      ok: exists('.planning/workshop2-investor-visual-checklist.md'),
      hintRu: 'visual checklist RU.',
    },
    {
      id: 'hub_banner',
      ok: read('src/app/brand/production/workshop2/workshop2-enterprise-hub-inner.tsx').includes(
        'Workshop2InvestorDemoHubBanner'
      ),
      hintRu: 'hub investor banner.',
    },
    {
      id: 'investor_prep_script',
      ok: exists('scripts/workshop2-investor-prep.mjs'),
      hintRu: 'workshop2-investor-prep one-command.',
    },
    {
      id: 'investor_qa_ru',
      ok: exists('.planning/INVESTOR-QA-RU.md'),
      hintRu: 'INVESTOR-QA-RU Q&A pack.',
    },
    {
      id: 'apply_ss27_seed_api',
      ok: exists('src/app/api/workshop2/demo/apply-ss27-uat-seed/route.ts'),
      hintRu: 'POST apply-ss27-uat-seed.',
    },
    {
      id: 'last_run_zero_fail',
      ok:
        read('scripts/workshop2-investor-prep.mjs').includes('assertLastRunZeroFail') &&
        read('scripts/workshop2-investor-demo-full.mjs').includes('investor-demo-last-run.json'),
      hintRu: 'prep→show→last-run 0 FAIL marker.',
    },
    { id: 'wave57_baseline', ok: w57.ok, hintRu: 'Wave 57 baseline.' },
  ];
  return scoreProbe(checks, 'wave58InvestorShowReady', 12);
}
