/**
 * Wave 54 — prod hardening: gov live, PagerDuty, ACK lifecycle, billing PG, perf budget (+14).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildWorkshop2PerformanceBudgetPayload } from '@/lib/production/workshop2-performance-budget-api';
import {
  readWorkshop2B2bInvoiceStubJournal,
  isWorkshop2B2bInvoiceJournalFilePersistEnabled,
} from '@/lib/production/workshop2-b2b-invoice-stub';
import { buildWorkshop2Wave54ProdHardeningReadyProbe } from '@/lib/production/workshop2-wave-probes-fs.server';
import { buildWorkshop2Wave54ProdHardeningReadyProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';

const root = process.cwd();

describe('wave54 — performance budget pass/fail', () => {
  it('returns budgetResults with pass boolean', () => {
    const payload = buildWorkshop2PerformanceBudgetPayload();
    expect(payload.budgetResults.length).toBeGreaterThanOrEqual(3);
    expect(typeof payload.allBudgetsPass).toBe('boolean');
    expect(payload.budgetResults.some((r) => r.surface.includes('showroom'))).toBe(true);
  });
});

describe('wave54 — invoice repository journal fallback', () => {
  const prev = process.cwd();
  let tmp = '';

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'w54-inv-'));
    process.chdir(tmp);
    fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(prev);
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('readWorkshop2B2bInvoiceStubJournal reads tenant scoped entries', () => {
    fs.writeFileSync(
      path.join(tmp, '.planning/workshop2-b2b-invoice-stub-journal.json'),
      JSON.stringify({
        entries: [
          {
            id: 'i1',
            orderId: 'O1',
            brandId: 'b',
            tenantId: 't1',
            totalRub: 1,
            mode: 'journal_only',
            at: '2026-01-01',
            pdfPathPlaceholderRu: '/x',
          },
        ],
      }),
      'utf8'
    );
    expect(readWorkshop2B2bInvoiceStubJournal().filter((e) => e.tenantId === 't1')).toHaveLength(1);
  });

  it('skips file journal read when PG DATABASE_URL configured (non-test)', () => {
    const prevDb = process.env.WORKSHOP2_DATABASE_URL;
    const prevEnv = process.env.NODE_ENV;
    process.env.WORKSHOP2_DATABASE_URL = 'postgres://127.0.0.1:5433/w2';
    process.env.NODE_ENV = 'production';
    expect(isWorkshop2B2bInvoiceJournalFilePersistEnabled()).toBe(false);
    expect(readWorkshop2B2bInvoiceStubJournal()).toEqual([]);
    process.env.WORKSHOP2_DATABASE_URL = prevDb;
    process.env.NODE_ENV = prevEnv;
  });
});

describe('wave54 — scripts and migrations on disk', () => {
  it('probe-prod includes edo/send and marking configured', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-prod.mjs'), 'utf8');
    expect(mjs).toContain('edo/send');
    expect(mjs).toContain('marking/register-order');
    expect(mjs).toContain('configured');
  });

  it('probe-escalation uses fetch for PagerDuty', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-escalation.mjs'), 'utf8');
    expect(mjs).toContain('fetch(');
    expect(mjs).toContain('WORKSHOP2_PAGERDUTY_WEBHOOK_URL');
    expect(mjs).toContain('workshop2-probe-escalation-journal.json');
  });

  it('ack lifecycle apply dry-run default', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-ack-s3-lifecycle-apply.mjs'),
      'utf8'
    );
    expect(mjs).toContain('dry-run');
    expect(mjs).toContain('put-bucket-lifecycle-configuration');
  });

  it('ack restore drill quarterly wraps replay', () => {
    expect(
      fs.existsSync(path.join(root, 'scripts/workshop2-ack-restore-drill-quarterly.mjs'))
    ).toBe(true);
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-ack-restore-drill-quarterly.mjs'),
      'utf8'
    );
    expect(mjs).toContain('workshop2-ack-replay-drill');
  });

  it('022 invoice migration exists', () => {
    const sql = fs.readFileSync(
      path.join(root, 'db/migrations/022_workshop2_b2b_invoice.sql'),
      'utf8'
    );
    expect(sql).toMatch(/workshop2_b2b_invoice/);
    expect(sql).toMatch(/tenant_id/);
  });

  it('invoice repository listByTenantId export', () => {
    const ts = fs.readFileSync(
      path.join(root, 'src/lib/server/workshop2-b2b-invoice-repository.ts'),
      'utf8'
    );
    expect(ts).toContain('listWorkshop2B2bInvoicesByTenantId');
  });

  it('orders export uses invoice repository', () => {
    const route = fs.readFileSync(
      path.join(root, 'src/app/api/shop/b2b/orders/export/route.ts'),
      'utf8'
    );
    expect(route).toContain('listWorkshop2B2bInvoicesByTenantId');
  });

  it('investor-demo-full probes performance-budget', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-investor-demo-full.mjs'),
      'utf8'
    );
    expect(mjs).toContain('performance-budget');
  });

  it('probe-prod cron workflow', () => {
    const yml = fs.readFileSync(
      path.join(root, '.github/workflows/workshop2-probe-prod.yml'),
      'utf8'
    );
    expect(yml).toMatch(/schedule:/);
    expect(yml).toContain('workshop2-probe-alert.mjs');
  });

  it('production.ru.example complete', () => {
    const env = fs.readFileSync(path.join(root, '.env.production.ru.example'), 'utf8');
    expect(env).toContain('WORKSHOP2_PRODUCTION_PUBLIC_URL');
    expect(env).toContain('WORKSHOP2_PAGERDUTY_WEBHOOK_URL');
    expect(env).toContain('DATABASE_URL');
  });

  it('sentry + runbook PagerDuty RU', () => {
    expect(
      fs.readFileSync(path.join(root, '.planning/workshop2-sentry-alert-rules.md'), 'utf8')
    ).toContain('PagerDuty');
    expect(
      fs.readFileSync(path.join(root, '.planning/workshop2-ru-ops-runbook.md'), 'utf8')
    ).toContain('PagerDuty');
  });

  it('wave54 restore disk chains wave53', () => {
    expect(fs.existsSync(path.join(root, 'scripts/wave54-restore-disk.mjs'))).toBe(true);
    const mjs = fs.readFileSync(path.join(root, 'scripts/wave54-restore-disk.mjs'), 'utf8');
    expect(mjs).toContain('wave53-restore-disk');
  });
});

describe('wave54 — probe wave54ProdHardeningReady', () => {
  it('fs and live probes agree', () => {
    process.chdir(root);
    const fsProbe = buildWorkshop2Wave54ProdHardeningReadyProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave54ProdHardeningReady).toBe(live.wave54ProdHardeningReady);
    if (fsProbe.ok) {
      expect(fsProbe.wave54ProdHardeningReady).toBeGreaterThanOrEqual(12);
    }
  });
});
