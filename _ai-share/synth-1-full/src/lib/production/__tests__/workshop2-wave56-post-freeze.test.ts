/**
 * Wave 56 — post-freeze maintenance (+12): ops checklist, ACK drill prod, invoice HTML URL, rep offline pack.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildWorkshop2B2bInvoiceHtmlStub } from '@/lib/production/workshop2-b2b-invoice-html-stub';
import { buildWorkshop2B2bInvoiceHtmlUrl } from '@/lib/production/workshop2-b2b-invoice-stub';
import { buildWorkshop2B2bRepOfflinePack } from '@/lib/production/workshop2-b2b-rep-offline-pack';
import { buildWorkshop2CutoverDashboard } from '@/lib/production/workshop2-cutover-dashboard';
import {
  isWorkshop2OpsAppliedChecklistReady,
  readWorkshop2OpsAppliedStatus,
} from '@/lib/production/workshop2-wave-ops-applied-status';
import { buildWorkshop2Wave56PostFreezeReadyProbe } from '@/lib/production/workshop2-wave-probes-fs.server';
import { buildWorkshop2Wave56PostFreezeReadyProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';

const root = process.cwd();

describe('wave56 — invoice HTML print RU', () => {
  it('HTML stub mentions печать в PDF', () => {
    const html = buildWorkshop2B2bInvoiceHtmlStub('ORD-56');
    expect(html).toContain('печать в PDF');
    expect(html).toContain('WORKSHOP2_INVOICE_PDF_ENGINE');
  });

  it('buildWorkshop2B2bInvoiceHtmlUrl points to invoice-stub route', () => {
    const url = buildWorkshop2B2bInvoiceHtmlUrl('B2B-056');
    expect(url).toContain('/invoice-stub');
    expect(url).not.toContain('.pdf');
  });
});

describe('wave56 — ops applied checklist status', () => {
  const prev = process.cwd();
  let tmp = '';

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'w56-ops-'));
    process.chdir(tmp);
    fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(prev);
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('isWorkshop2OpsAppliedChecklistReady when PagerDuty + Sentry env set', () => {
    expect(
      isWorkshop2OpsAppliedChecklistReady({
        WORKSHOP2_PAGERDUTY_WEBHOOK_URL: 'https://events.pagerduty.com/x',
        SENTRY_DSN: 'https://x@sentry.io/1',
      })
    ).toBe(true);
  });

  it('reads status JSON when written', () => {
    fs.writeFileSync(
      path.join(tmp, '.planning/workshop2-wave55-ops-applied-status.json'),
      JSON.stringify({
        checkedAt: new Date().toISOString(),
        pagerdutyConfigured: true,
        sentryConfigured: true,
        opsChecklistApplied: true,
        messageRu: 'ok',
      }),
      'utf8'
    );
    expect(readWorkshop2OpsAppliedStatus()?.opsChecklistApplied).toBe(true);
  });
});

describe('wave56 — cutover dashboard opsAppliedChecklist', () => {
  it('exports opsAppliedChecklist field', () => {
    process.chdir(root);
    const dash = buildWorkshop2CutoverDashboard({
      WORKSHOP2_INVESTOR_DEMO_MODE: '1',
      WORKSHOP2_PAGERDUTY_WEBHOOK_URL: 'https://pd.example',
      SENTRY_DSN: 'https://sentry.example/1',
    });
    expect(typeof dash.opsAppliedChecklist).toBe('boolean');
    expect(dash.opsAppliedChecklist).toBe(true);
  });
});

describe('wave56 — rep offline pack SS27', () => {
  it('buildWorkshop2B2bRepOfflinePack returns linesheet + cart', () => {
    process.chdir(root);
    const pack = buildWorkshop2B2bRepOfflinePack({ repId: 'rep-w56' });
    expect(pack.season).toBe('SS27');
    expect(pack.linesheet.articles.length).toBeGreaterThan(0);
    expect(pack.cartSnapshot.lineCount).toBeGreaterThanOrEqual(1);
    expect(pack.mode).toBe('journal_only');
  });
});

describe('wave56 — post-freeze artifacts on disk', () => {
  it('wave56 restore disk chains wave55', () => {
    expect(fs.existsSync(path.join(root, 'scripts/wave56-restore-disk.mjs'))).toBe(true);
    const mjs = fs.readFileSync(path.join(root, 'scripts/wave56-restore-disk.mjs'), 'utf8');
    expect(mjs).toContain('wave55-restore-disk');
  });

  it('ops applied checklist script exists', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-wave55-ops-applied-checklist.mjs'),
      'utf8'
    );
    expect(mjs).toContain('workshop2-wave55-ops-applied-status.json');
  });

  it('ack restore drill prod flag + summaryRu', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-ack-restore-drill-quarterly.mjs'),
      'utf8'
    );
    expect(mjs).toContain('--prod');
    expect(mjs).toContain('summaryRu');
  });

  it('ack s3 lifecycle documents 7y retention', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-ack-s3-lifecycle-apply.mjs'),
      'utf8'
    );
    expect(mjs).toContain('2555');
    expect(mjs).toContain('7y');
  });

  it('migration 022 has invoice_html_url', () => {
    const sql = fs.readFileSync(
      path.join(root, 'db/migrations/022_workshop2_b2b_invoice.sql'),
      'utf8'
    );
    expect(sql).toContain('invoice_html_url');
  });

  it('multi-brand playbook and v2 roadmap exist', () => {
    expect(
      fs.existsSync(path.join(root, '.planning/workshop2-multi-brand-rollout-playbook-RU.md'))
    ).toBe(true);
    expect(fs.existsSync(path.join(root, '.planning/ROADMAP-V2-POST-FREEZE-RU.md'))).toBe(true);
  });

  it('orders export includes invoiceHtmlUrl', () => {
    const route = fs.readFileSync(
      path.join(root, 'src/app/api/shop/b2b/orders/export/route.ts'),
      'utf8'
    );
    expect(route).toContain('invoiceHtmlUrl');
  });

  it('probe-alert checks wave56PostFreezeReady', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-alert.mjs'), 'utf8');
    expect(mjs).toContain('wave56PostFreezeReady');
  });
});

describe('wave56 — probe wave56PostFreezeReady', () => {
  it('fs and live probes agree', () => {
    process.chdir(root);
    const fsProbe = buildWorkshop2Wave56PostFreezeReadyProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave56PostFreezeReady).toBe(live.wave56PostFreezeReady);
    if (fsProbe.ok) {
      expect(fsProbe.wave56PostFreezeReady).toBeGreaterThanOrEqual(10);
    }
  });
});
