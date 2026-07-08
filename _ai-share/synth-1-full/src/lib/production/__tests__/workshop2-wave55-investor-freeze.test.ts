/**
 * Wave 55 — investor freeze: release notes, signoff ops+product, HTML invoice, ops checklist (+12).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildWorkshop2B2bInvoiceHtmlStub } from '@/lib/production/workshop2-b2b-invoice-html-stub';
import { buildWorkshop2B2bInvoiceStubUrl } from '@/lib/production/workshop2-b2b-invoice-stub';
import { appendWorkshop2B2bInvoiceStubJournal } from '@/lib/production/workshop2-b2b-invoice-stub';
import { buildWorkshop2CutoverDashboard } from '@/lib/production/workshop2-cutover-dashboard';
import {
  appendWorkshop2Ss27UatSignoff,
  summarizeWorkshop2Wave55InvestorFreezeSignoff,
  loadWorkshop2Ss27UatSignoffJournal,
} from '@/lib/production/workshop2-ss27-uat-signoff-journal';
import { buildWorkshop2Wave55InvestorFreezeReadyProbe } from '@/lib/production/workshop2-wave-probes-fs.server';
import { buildWorkshop2Wave55InvestorFreezeReadyProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';

const root = process.cwd();

describe('wave55 — HTML invoice stub RU', () => {
  it('buildWorkshop2B2bInvoiceHtmlStub returns printable HTML', () => {
    const html = buildWorkshop2B2bInvoiceHtmlStub('ORD-55');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('journal_only stub');
    expect(html).toContain('ORD-55');
  });

  it('journal stub links to invoice-stub HTML path', () => {
    const prev = process.cwd();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'w55-inv-'));
    process.chdir(tmp);
    fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
    const entry = appendWorkshop2B2bInvoiceStubJournal({
      orderId: 'B2B-055',
      brandId: 'demo-brand',
      tenantId: 'tenant-demo',
      totalRub: 55000,
    });
    expect(entry.pdfPathPlaceholderRu).toBe(buildWorkshop2B2bInvoiceStubUrl('B2B-055'));
    expect(entry.pdfPathPlaceholderRu).toContain('/invoice-stub');
    expect(entry.pdfPathPlaceholderRu).not.toContain('.pdf');
    process.chdir(prev);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});

describe('wave55 — signoff ops + product gate', () => {
  const prev = process.cwd();
  let tmp = '';

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'w55-sign-'));
    process.chdir(tmp);
    fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(prev);
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('wave55FreezeComplete when ops and product signed', () => {
    appendWorkshop2Ss27UatSignoff({ role: 'ops', signedBy: 'ops@test.ru' });
    appendWorkshop2Ss27UatSignoff({ role: 'product', signedBy: 'product@test.ru' });
    const freeze = summarizeWorkshop2Wave55InvestorFreezeSignoff(
      loadWorkshop2Ss27UatSignoffJournal()
    );
    expect(freeze.wave55FreezeComplete).toBe(true);
  });

  it('signoff API accepts product role', () => {
    const route = fs.readFileSync(
      path.join(root, 'src/app/api/workshop2/uat/ss27/signoff/route.ts'),
      'utf8'
    );
    expect(route).toContain("'product'");
  });
});

describe('wave55 — cutover dashboard wave55FreezeReady', () => {
  it('exports wave55FreezeReady field', () => {
    process.chdir(root);
    const dash = buildWorkshop2CutoverDashboard({ WORKSHOP2_INVESTOR_DEMO_MODE: '1' });
    expect(typeof dash.wave55FreezeReady).toBe('boolean');
    expect(typeof dash.wave55InvestorFreezeProbeOk).toBe('boolean');
  });
});

describe('wave55 — investor freeze artifacts on disk', () => {
  it('release notes and freeze snapshot exist', () => {
    expect(fs.existsSync(path.join(root, '.planning/RELEASE-NOTES-WAVES-9-55-RU.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.planning/INVESTOR-FREEZE-WAVE55.md'))).toBe(true);
  });

  it('investor freeze tag script prints tag name', () => {
    const sh = fs.readFileSync(path.join(root, 'scripts/workshop2-investor-freeze-tag.sh'), 'utf8');
    expect(sh).toContain('investor-freeze-wave55');
    expect(sh).toContain('WORKSHOP2_RUN_GIT_TAG');
  });

  it('ack restore drill writes last.json path', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-ack-restore-drill-quarterly.mjs'),
      'utf8'
    );
    expect(mjs).toContain('workshop2-ack-restore-drill-last.json');
  });

  it('ops applied checklist RU', () => {
    const md = fs.readFileSync(
      path.join(root, '.planning/workshop2-wave55-ops-applied-checklist.md'),
      'utf8'
    );
    expect(md).toContain('PagerDuty');
    expect(md).toContain('Sentry');
  });

  it('orders export includes invoiceStubUrl', () => {
    const route = fs.readFileSync(
      path.join(root, 'src/app/api/shop/b2b/orders/export/route.ts'),
      'utf8'
    );
    expect(route).toContain('invoiceStubUrl');
  });

  it('wave55 restore disk chains wave54', () => {
    expect(fs.existsSync(path.join(root, 'scripts/wave55-restore-disk.mjs'))).toBe(true);
    const mjs = fs.readFileSync(path.join(root, 'scripts/wave55-restore-disk.mjs'), 'utf8');
    expect(mjs).toContain('wave54-restore-disk');
  });

  it('investor-demo-full optional wave55 step', () => {
    const mjs = fs.readFileSync(
      path.join(root, 'scripts/workshop2-investor-demo-full.mjs'),
      'utf8'
    );
    expect(mjs).toContain('wave55-investor-freeze');
    expect(mjs).toContain('WORKSHOP2_INVESTOR_DEMO_WAVE55_FREEZE');
  });

  it('probe-alert checks wave55InvestorFreezeReady', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-alert.mjs'), 'utf8');
    expect(mjs).toContain('wave55InvestorFreezeReady');
  });
});

describe('wave55 — probe wave55InvestorFreezeReady', () => {
  it('fs and live probes agree', () => {
    process.chdir(root);
    const fsProbe = buildWorkshop2Wave55InvestorFreezeReadyProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave55InvestorFreezeReady).toBe(live.wave55InvestorFreezeReady);
    if (fsProbe.ok) {
      expect(fsProbe.wave55InvestorFreezeReady).toBeGreaterThanOrEqual(10);
    }
  });
});
