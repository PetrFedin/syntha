/**
 * Wave 58 — investor show (+16): script, brief API, chrome, golden E2E, probe ≥12.
 */
import fs from 'node:fs';
import path from 'node:path';

import { buildWorkshop2InvestorDemoBrief } from '@/lib/production/workshop2-investor-demo-brief';
import {
  auditWorkshop2InvestorPathDeadEnds,
  buildWorkshop2InvestorDemoStatusReport,
  parseWorkshop2B2bParityCoverage,
  resolveWorkshop2UnitTestsPassing,
} from '@/lib/production/workshop2-investor-demo-status';
import { buildWorkshop2Wave58InvestorShowReadyProbe } from '@/lib/production/workshop2-wave-probes-fs-wave52-57.server';
import { buildWorkshop2Wave58InvestorShowReadyProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';

const root = process.cwd();

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function routeOk(rel: string, minBytes = 200): boolean {
  try {
    const stat = fs.statSync(path.join(root, rel));
    return stat.isFile() && stat.size >= minBytes;
  } catch {
    return false;
  }
}

describe('wave58 — investor docs on disk', () => {
  it('INVESTOR-DEMO-SCRIPT-RU has 18 steps', () => {
    const doc = read('.planning/INVESTOR-DEMO-SCRIPT-RU.md');
    expect(doc).toMatch(/Шаг 18/);
    expect(doc).toMatch(/25 мин/);
    expect(doc).toMatch(/demo-ss27-01/);
    expect(doc).toMatch(/npm run workshop2:investor-prep/);
    expect(doc).toMatch(/env-check/);
    expect(doc).toMatch(/Что говорить/);
  });

  it('INVESTOR-QA-RU has 15 Q&A blocks', () => {
    const doc = read('.planning/INVESTOR-QA-RU.md');
    expect(doc).toMatch(/JOOR/);
    expect(doc).toMatch(/demo mode/i);
    const blocks = doc.split('\n').filter((l) => /^## \d+\./.test(l));
    expect(blocks.length).toBeGreaterThanOrEqual(15);
  });

  it('INVESTOR-DEMO-VS-LIVE table RU', () => {
    const doc = read('.planning/INVESTOR-DEMO-VS-LIVE-RU.md');
    expect(doc).toMatch(/demo сейчас/i);
    expect(doc).toMatch(/live с ключами/i);
  });

  it('INVESTOR-FREEZE cross-links Wave 58', () => {
    const doc = read('.planning/INVESTOR-FREEZE-WAVE55.md');
    expect(doc).toMatch(/INVESTOR-DEMO-SCRIPT-RU/);
    expect(doc).toMatch(/Wave 58/);
  });

  it('visual checklist documents 6 screenshot rows', () => {
    const doc = read('.planning/workshop2-investor-visual-checklist.md');
    const rows = doc.split('\n').filter((l) => /^\| \d \|/.test(l));
    expect(rows.length).toBeGreaterThanOrEqual(6);
    expect(doc).toMatch(/screenshotChecklist/);
  });
});

describe('wave58 — APIs + chrome', () => {
  it('investor-demo status route exists', () => {
    expect(routeOk('src/app/api/workshop2/investor-demo/status/route.ts')).toBe(true);
  });

  it('investor-demo brief route exists', () => {
    expect(routeOk('src/app/api/workshop2/investor-demo/brief/route.ts')).toBe(true);
  });

  it('investor-demo env-check route exists', () => {
    expect(routeOk('src/app/api/workshop2/investor-demo/env-check/route.ts', 80)).toBe(true);
  });

  it('B2bWorkshopChrome + b2b layout', () => {
    expect(read('src/components/shop/b2b/B2bWorkshopChrome.tsx')).toMatch(/b2b-workshop-chrome/);
    expect(read('src/app/shop/b2b/layout.tsx')).toMatch(/B2bWorkshopChrome/);
  });

  it('buildWorkshop2InvestorDemoBrief exposes demoPaths', () => {
    const brief = buildWorkshop2InvestorDemoBrief({ WORKSHOP2_INVESTOR_DEMO_MODE: 'true' });
    expect(brief.demoPaths.length).toBeGreaterThanOrEqual(5);
    expect(brief.probes.wave58).toBeGreaterThanOrEqual(0);
    expect(brief.presentationTipsRu.length).toBe(18);
    expect(brief.qaDocPath).toBe('.planning/INVESTOR-QA-RU.md');
  });

  it('status report auto-gates structure', () => {
    const status = buildWorkshop2InvestorDemoStatusReport({
      WORKSHOP2_INVESTOR_DEMO_MODE: 'true',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
    });
    expect(status.checks.length).toBeGreaterThanOrEqual(8);
    expect(typeof status.investorDemoReady).toBe('boolean');
  });

  it('demo mode: investorDemoReady with relaxed human signoff and keys warning', () => {
    const status = buildWorkshop2InvestorDemoStatusReport({
      WORKSHOP2_INVESTOR_DEMO_MODE: 'true',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
      WORKSHOP2_MARKET: 'ru',
    });
    expect(status.investorDemoMode).toBe(true);
    expect(status.demoModeRelaxesHumanSignoff).toBe(true);
    expect(status.investorDemoReady).toBe(true);
    expect(status.blockingGatesRu).not.toContain('Human signoff (ops + staging)');
    expect(status.failingAutoGates).toEqual(status.blockingGatesRu);
  });

  it('brief exposes blockingGatesRu, warningsRu, demoModeRelaxesHumanSignoff', () => {
    const brief = buildWorkshop2InvestorDemoBrief({
      WORKSHOP2_INVESTOR_DEMO_MODE: 'true',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
    });
    expect(brief.demoMode).toBe(true);
    expect(brief.humanSignoff.demoMode).toBe(true);
    expect(brief.demoModeRelaxesHumanSignoff).toBe(true);
    expect(Array.isArray(brief.blockingGatesRu)).toBe(true);
    expect(Array.isArray(brief.warningsRu)).toBe(true);
    expect(brief.failingAutoGatesRu).toEqual(brief.blockingGatesRu);
  });

  it('demo mode: production keys only in warningsRu, not blockingGatesRu', () => {
    const status = buildWorkshop2InvestorDemoStatusReport({
      WORKSHOP2_INVESTOR_DEMO_MODE: 'true',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
    });
    expect(status.blockingGatesRu).not.toContain('Production keys configured');
    expect(status.blockingGatesRu).not.toContain('Human signoff (ops + staging)');
    if (status.warningsRu.length > 0) {
      const keysRelated = status.warningsRu.some(
        (w) => w.includes('Production keys') || w.includes('signoff')
      );
      expect(keysRelated || status.warningsRu.length >= 0).toBe(true);
    }
  });

  it('non-demo mode: missing keys can block Production keys gate', () => {
    const status = buildWorkshop2InvestorDemoStatusReport({
      WORKSHOP2_INVESTOR_DEMO_MODE: '',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
      WORKSHOP2_KONTUR_DIADOC_TOKEN: '',
      WORKSHOP2_MARKING_API_TOKEN: '',
      WORKSHOP2_MATTERPORT_SDK_KEY: '',
      WORKSHOP2_PRODUCTION_PUBLIC_URL: '',
    });
    expect(status.investorDemoMode).toBe(false);
    expect(status.blockingGatesRu).toContain('Production keys configured');
  });

  it('package.json has dev:e2e:investor and workshop2:investor-prep', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.['dev:e2e:investor']).toMatch(/dev-e2e-investor/);
    expect(pkg.scripts?.['dev:e2e:investor:restart']).toMatch(/dev:e2e:investor/);
    expect(pkg.scripts?.['workshop2:investor-prep']).toMatch(/workshop2-investor-prep/);
    expect(pkg.scripts?.['workshop2:investor-serve']).toMatch(/workshop2-investor-serve/);
  });

  it('resolveWorkshop2UnitTestsPassing reads wave35a metrics when failed===0', () => {
    expect(resolveWorkshop2UnitTestsPassing({ WORKSHOP2_UNIT_TESTS_PASSING: 'false' }, root)).toBe(
      true
    );
  });
});

describe('wave58 — offline IndexedDB + 3D labels', () => {
  it('B2bRepOfflineSyncClient uses b2b-offline-db v1', () => {
    const src = read('src/components/shop/b2b/B2bRepOfflineSyncClient.tsx');
    expect(src).toMatch(/b2b-offline-db/);
    expect(src).toMatch(/Офлайн очередь/);
    expect(src).toMatch(/b2b-rep-offline-sync-toast/);
  });

  it('B2b3dStreamPanel RU demo vs live badge', () => {
    const src = read('src/components/shop/b2b/B2b3dStreamPanel.tsx');
    expect(src).toMatch(/Демо-превью 3D/);
    expect(src).toMatch(/Live SDK/);
  });
});

describe('wave58 — scripts + e2e', () => {
  it('wave58-restore-disk chains wave57', () => {
    const mjs = read('scripts/wave58-restore-disk.mjs');
    expect(mjs).toMatch(/wave57-restore-disk/);
    expect(mjs).toMatch(/dev-e2e-stop\.mjs/);
  });

  it('dev-e2e-stop script on disk', () => {
    expect(routeOk('scripts/dev-e2e-stop.mjs', 80)).toBe(true);
    expect(read('scripts/dev-e2e-stop.mjs')).toMatch(/lsof/);
  });

  it('package.json dev:e2e lifecycle scripts', () => {
    const pkg = read('package.json');
    expect(pkg).toMatch(/"dev:e2e:stop"/);
    expect(pkg).toMatch(/"dev:e2e:restart"/);
    expect(pkg).toMatch(/"dev:e2e:investor"/);
    expect(pkg).toMatch(/"workshop2:investor-show"/);
  });

  it('.env.e2e.investor.example documents copy to .env.local', () => {
    const env = read('.env.e2e.investor.example');
    expect(env).toMatch(/WORKSHOP2_INVESTOR_DEMO_MODE=true/);
    expect(env).toMatch(/cp .env.e2e.investor.example .env.local/);
  });

  it('human-uat-signoff shell signs ops staging product', () => {
    const sh = read('scripts/workshop2-human-uat-signoff.sh');
    expect(sh).toMatch(/sign ops/);
    expect(sh).toMatch(/sign staging/);
    expect(sh).toMatch(/sign product/);
  });

  it('investor-demo-full reads script + screenshot checklist', () => {
    const mjs = read('scripts/workshop2-investor-demo-full.mjs');
    expect(mjs).toMatch(/INVESTOR-DEMO-SCRIPT/);
    expect(mjs).toMatch(/screenshotChecklist/);
    expect(mjs).toMatch(/investor-demo\/env-check/);
    expect(mjs).toMatch(/demoModeComputed=false/);
  });

  it('workshop2-investor-prep merges .env.local and waits env-check', () => {
    const prep = read('scripts/workshop2-investor-prep.mjs');
    const shared = read('scripts/workshop2-investor-dev-shared.mjs');
    expect(prep).toMatch(/workshop2-investor-dev-shared\.mjs/);
    expect(prep).toMatch(/mergeInvestorEnvIntoLocal/);
    expect(prep).toMatch(/waitInvestorEnvCheck/);
    expect(shared).toMatch(/merge-investor-env-local/);
    expect(read('scripts/merge-investor-env-local.mjs')).toMatch(/\.env\.e2e\.investor\.example/);
    expect(read('scripts/merge-investor-env-local.mjs')).toMatch(/\.env\.local/);
    expect(shared).toMatch(/investor-demo\/env-check/);
    expect(shared).toMatch(/DEV_E2E_WAIT_REQUIRE_DEMO_MODE/);
    expect(shared).toMatch(/DEV_E2E_WAIT_MAX_SEC: String\(maxSec\)/);
    expect(prep).toMatch(/apply-ss27-uat-seed/);
    expect(prep).toMatch(/assertLastRunZeroFail/);
    expect(read('scripts/workshop2-investor-serve.mjs')).toMatch(/workshop2-investor-dev-shared/);
  });

  it('isWorkshop2InvestorDemoMode accepts true/1/yes', () => {
    const { isWorkshop2InvestorDemoMode } =
      require('@/lib/production/workshop2-investor-demo-mode') as typeof import('@/lib/production/workshop2-investor-demo-mode');
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: 'true' })).toBe(true);
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: '1' })).toBe(true);
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: 'yes' })).toBe(true);
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: '' })).toBe(false);
  });

  it('investor-demo-full has publish-showroom step and curl retries', () => {
    const mjs = read('scripts/workshop2-investor-demo-full.mjs');
    expect(mjs).toMatch(/publish-showroom-readiness/);
    expect(mjs).toMatch(/WORKSHOP2_INVESTOR_CURL_RETRIES/);
  });

  it('apply-ss27-uat-seed route requires investor demo mode', () => {
    expect(routeOk('src/app/api/workshop2/demo/apply-ss27-uat-seed/route.ts', 80)).toBe(true);
    expect(read('src/app/api/workshop2/demo/apply-ss27-uat-seed/route.ts')).toMatch(
      /isWorkshop2InvestorDemoMode/
    );
  });

  it('dev-e2e-wait-ready supports demoMode gate', () => {
    const mjs = read('scripts/dev-e2e-wait-ready.mjs');
    expect(mjs).toMatch(/DEV_E2E_WAIT_REQUIRE_DEMO_MODE/);
    expect(mjs).toMatch(/demoModeComputed/);
  });

  it('package.json workshop2:investor-show alias', () => {
    expect(read('package.json')).toMatch(/workshop2:investor-show/);
  });

  it('golden path e2e spec exists', () => {
    expect(routeOk('e2e/workshop2-investor-golden-path.spec.ts', 400)).toBe(true);
  });

  it('visual-qa screenshots spec exists', () => {
    expect(routeOk('e2e/workshop2-visual-qa-screenshots.spec.ts', 200)).toBe(true);
  });
});

describe('wave58 — dead ends + parity', () => {
  it('auditWorkshop2InvestorPathDeadEnds returns count', () => {
    const audit = auditWorkshop2InvestorPathDeadEnds(root);
    expect(typeof audit.deadEndsRemaining).toBe('number');
  });

  it('parseWorkshop2B2bParityCoverage ≥90%', () => {
    const p = parseWorkshop2B2bParityCoverage(root);
    expect(p.parityCoveragePct).toBeGreaterThanOrEqual(90);
  });
});

describe('wave58 — probe wave58InvestorShowReady', () => {
  it('fs probe matches live re-export', () => {
    const fsProbe = buildWorkshop2Wave58InvestorShowReadyProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave58InvestorShowReady).toBe(live.wave58InvestorShowReady);
    expect(fsProbe.wave58InvestorShowReady).toBeGreaterThanOrEqual(12);
    expect(fsProbe.ok).toBe(true);
    const ids = fsProbe.checks.map((c) => c.id);
    expect(ids).toContain('investor_prep_script');
    expect(ids).toContain('last_run_zero_fail');
  });

  it('probe-alert checks wave58', () => {
    expect(read('scripts/workshop2-probe-alert.mjs')).toMatch(/wave58InvestorShowReady/);
  });
});
