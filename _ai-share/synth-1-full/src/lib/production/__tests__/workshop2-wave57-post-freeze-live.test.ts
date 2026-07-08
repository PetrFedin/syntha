/**
 * Wave 57 — live ops verification (+14): org-applied journal, rep offline queue, JOOR OAuth prod, invoice PDF playwright.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  appendWorkshop2OpsAppliedOrgJournal,
  isWorkshop2OpsOrgAppliedFromJournal,
  readWorkshop2OpsAppliedOrgJournal,
} from '@/lib/production/workshop2-ops-applied-org-journal';
import {
  exchangeWorkshop2B2bOAuthCodeStub,
  isWorkshop2B2bOAuthProdLiveReady,
  mapWorkshop2JoorOrderIdFromOAuthResponse,
  resolveWorkshop2B2bOAuthInboundConfig,
} from '@/lib/production/workshop2-b2b-oauth-inbound';
import {
  isWorkshop2OpsAppliedChecklistReady,
  readWorkshop2OpsAppliedStatus,
} from '@/lib/production/workshop2-wave-ops-applied-status';
import { buildWorkshop2Wave57PostFreezeLiveProbe } from '@/lib/production/workshop2-wave-probes-fs.server';
import { buildWorkshop2Wave57PostFreezeLiveProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';
import { WORKSHOP2_B2B_OFFLINE_QUEUE_KEY } from '@/components/shop/b2b/B2bRepOfflineSyncClient';

const root = process.cwd();

describe('wave57 — ops org-applied journal', () => {
  const prev = process.cwd();
  let tmp = '';

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'w57-ops-'));
    process.chdir(tmp);
    fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(prev);
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('appendWorkshop2OpsAppliedOrgJournal sets orgApplied', () => {
    appendWorkshop2OpsAppliedOrgJournal({
      appliedBy: 'ops-lead',
      pagerdutyApplied: true,
      sentryApplied: true,
      source: 'admin_api',
    });
    expect(isWorkshop2OpsOrgAppliedFromJournal()).toBe(true);
    expect(readWorkshop2OpsAppliedOrgJournal()?.entries).toHaveLength(1);
  });

  it('journal accumulates multiple entries', () => {
    appendWorkshop2OpsAppliedOrgJournal({
      appliedBy: 'ops-a',
      pagerdutyApplied: true,
      sentryApplied: true,
      source: 'checklist_script',
    });
    appendWorkshop2OpsAppliedOrgJournal({
      appliedBy: 'ops-b',
      pagerdutyApplied: true,
      sentryApplied: true,
      source: 'admin_api',
    });
    expect(readWorkshop2OpsAppliedOrgJournal()?.entries).toHaveLength(2);
  });

  it('isWorkshop2OpsAppliedChecklistReady true from journal without env', () => {
    appendWorkshop2OpsAppliedOrgJournal({
      appliedBy: 'ops-lead',
      pagerdutyApplied: true,
      sentryApplied: true,
      source: 'admin_api',
    });
    expect(isWorkshop2OpsAppliedChecklistReady({})).toBe(true);
  });
});

describe('wave57 — mark-applied API + checklist script', () => {
  it('mark-applied route exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/workshop2/ops/mark-applied/route.ts'))).toBe(
      true
    );
    const src = fs.readFileSync(
      path.join(root, 'src/app/api/workshop2/ops/mark-applied/route.ts'),
      'utf8'
    );
    expect(src).toContain('appendWorkshop2OpsAppliedOrgJournal');
  });

  it('ops-applied-checklist reads journal OR env', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-wave55-ops-applied-checklist.mjs'),
      'utf8'
    );
    expect(mjs).toContain('workshop2-ops-applied-org-journal.json');
    expect(mjs).toContain('orgApplied');
    expect(mjs).toContain('mark-applied');
  });

  it('mark-applied POST rejects when sentryApplied false', () => {
    const src = fs.readFileSync(
      path.join(root, 'src/app/api/workshop2/ops/mark-applied/route.ts'),
      'utf8'
    );
    expect(src).toContain('pagerdutyApplied !== false');
    expect(src).toContain('sentryApplied !== false');
    expect(src).toContain('status: 400');
  });

  it('mark-applied GET reads journal + status file', () => {
    const src = fs.readFileSync(
      path.join(root, 'src/app/api/workshop2/ops/mark-applied/route.ts'),
      'utf8'
    );
    expect(src).toContain('readWorkshop2OpsAppliedOrgJournal');
    expect(src).toContain('readWorkshop2OpsAppliedStatus');
  });
});

describe('wave57 — ACK prod drill last JSON', () => {
  it('ack-restore-drill-quarterly --prod writes prodDrill flag', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-ack-restore-drill-quarterly.mjs'),
      'utf8'
    );
    expect(mjs).toContain('--prod');
    expect(mjs).toContain('prodDrill');
    expect(mjs).toContain('summaryRu');
  });

  it('ops runbook documents quarterly prod drill RU', () => {
    const md = fs.readFileSync(path.join(root, '.planning/workshop2-ru-ops-runbook.md'), 'utf8');
    expect(md).toMatch(/квартальн/i);
    expect(md).toContain('mark-applied');
  });
});

describe('wave57 — invoice PDF playwright path', () => {
  it('playwright script documents WORKSHOP2_INVOICE_PDF_ENGINE', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-invoice-pdf-playwright.mjs'),
      'utf8'
    );
    expect(mjs).toContain('WORKSHOP2_INVOICE_PDF_ENGINE=playwright');
    expect(mjs).toContain('HTML default');
  });
});

describe('wave57 — rep offline sync phase 1', () => {
  it('B2bRepOfflineSyncClient uses b2b-offline-queue', () => {
    const src = fs.readFileSync(
      path.join(root, 'src/components/shop/b2b/B2bRepOfflineSyncClient.tsx'),
      'utf8'
    );
    expect(src).toContain(WORKSHOP2_B2B_OFFLINE_QUEUE_KEY);
    expect(src).toContain('/api/shop/b2b/rep/offline-pack');
    expect(src).toContain('/api/shop/b2b/cart/lines');
    expect(src).toContain('getWorkshop2B2bOfflineQueueCount');
    expect(src).toContain("addEventListener('online'");
  });

  it('sales-rep-portal shows offline queue banner RU', () => {
    const page = fs.readFileSync(
      path.join(root, 'src/app/shop/b2b/sales-rep-portal/page.tsx'),
      'utf8'
    );
    expect(page).toContain('B2bRepOfflineSyncClient');
    expect(page).toContain('Офлайн очередь');
  });
});

describe('wave57 — JOOR OAuth prod inbound', () => {
  it('prod live ready when all env set', () => {
    expect(
      isWorkshop2B2bOAuthProdLiveReady({
        WORKSHOP2_B2B_OAUTH_INBOUND_ENABLED: 'true',
        WORKSHOP2_B2B_OAUTH_CLIENT_ID: 'id',
        WORKSHOP2_B2B_OAUTH_CLIENT_SECRET: 'secret',
        WORKSHOP2_B2B_OAUTH_TOKEN_URL: 'https://auth.joor.com/oauth/token',
      })
    ).toBe(true);
  });

  it('maps joor order id from token response', () => {
    expect(mapWorkshop2JoorOrderIdFromOAuthResponse({ joorOrderId: 'JOOR-12345' })).toBe(
      'JOOR-12345'
    );
    const stub = exchangeWorkshop2B2bOAuthCodeStub({
      code: 'abc',
      provider: 'joor',
      env: { WORKSHOP2_B2B_OAUTH_CLIENT_ID: 'x', WORKSHOP2_B2B_OAUTH_CLIENT_SECRET: 'y' },
    });
    expect(stub.ok).toBe(true);
  });

  it('oauth callback route maps joor + chat event', () => {
    const route = fs.readFileSync(
      path.join(root, 'src/app/api/shop/b2b/inbound/oauth/callback/route.ts'),
      'utf8'
    );
    expect(route).toContain('b2b_oauth_inbound');
    expect(route).toContain('joorOrderId');
    expect(route).toContain('isWorkshop2B2bOAuthProdLiveReady');
  });

  it('production.ru.example documents JOOR section', () => {
    const example = path.join(root, '.env.production.ru.example');
    if (!fs.existsSync(example)) {
      expect(resolveWorkshop2B2bOAuthInboundConfig({}).configured).toBe(false);
      return;
    }
    const env = fs.readFileSync(example, 'utf8');
    expect(env).toMatch(/JOOR|WORKSHOP2_B2B_OAUTH/i);
  });
});

describe('wave57 — restore disk + probe wave57PostFreezeLive', () => {
  it('wave57 restore disk chains wave56', () => {
    expect(fs.existsSync(path.join(root, 'scripts/wave57-restore-disk.mjs'))).toBe(true);
    const mjs = fs.readFileSync(path.join(root, 'scripts/wave57-restore-disk.mjs'), 'utf8');
    expect(mjs).toContain('wave56-restore-disk');
  });

  it('fs and live probes agree', () => {
    process.chdir(root);
    const fsProbe = buildWorkshop2Wave57PostFreezeLiveProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave57PostFreezeLive).toBe(live.wave57PostFreezeLive);
    if (fsProbe.ok) {
      expect(fsProbe.wave57PostFreezeLive).toBeGreaterThanOrEqual(10);
    }
  });

  it('probe-alert checks wave57PostFreezeLive', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-alert.mjs'), 'utf8');
    expect(mjs).toContain('wave57PostFreezeLive');
  });
});

describe('wave57 — status file still readable', () => {
  it('readWorkshop2OpsAppliedStatus tolerates missing file', () => {
    expect(readWorkshop2OpsAppliedStatus()).toBeNull();
  });
});
