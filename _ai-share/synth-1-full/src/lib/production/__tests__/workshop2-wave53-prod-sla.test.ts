/**
 * Wave 53 — prod SLA dashboard, CDN doc, export, invoice stub, probe escalation (+14).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { summarizeWorkshop2B2b3dSlaFromJournal } from '@/lib/production/workshop2-b2b-3d-sla';
import { appendWorkshop2B2bInvoiceStubJournal } from '@/lib/production/workshop2-b2b-invoice-stub';
import {
  buildWorkshop2OpsSlaDashboard,
  readWorkshop2SloTargetsFromDisk,
} from '@/lib/production/workshop2-ops-sla-dashboard';
import { buildWorkshop2Wave53ProdSlaReadyProbe } from '@/lib/production/workshop2-wave-probes-fs.server';
import { buildWorkshop2Wave53ProdSlaReadyProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';

const root = process.cwd();

describe('wave53 — b2b 3d sla journal', () => {
  const prevCwd = process.cwd();
  let tmpDir = '';

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'w53-3d-'));
    process.chdir(tmpDir);
    fs.mkdirSync(path.join(tmpDir, '.planning'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(prevCwd);
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('empty journal returns zero sessions', () => {
    const s = summarizeWorkshop2B2b3dSlaFromJournal();
    expect(s.sessionCount).toBe(0);
    expect(s.errorRatePct).toBe(0);
  });

  it('computes error rate from journal entries', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.planning/workshop2-b2b-3d-session-journal.json'),
      JSON.stringify({
        sessions: [
          { durationSec: 10, error: false },
          { durationSec: 5, error: true },
        ],
      }),
      'utf8'
    );
    const s = summarizeWorkshop2B2b3dSlaFromJournal();
    expect(s.sessionCount).toBe(2);
    expect(s.errorCount).toBe(1);
    expect(s.errorRatePct).toBe(50);
  });
});

describe('wave53 — ops sla dashboard', () => {
  it('defaults SLO targets when md missing in tmp', () => {
    process.chdir(root);
    const targets = readWorkshop2SloTargetsFromDisk();
    expect(targets.ackP99Ms).toBe(5000);
    expect(targets.b2b3dErrorRatePct).toBe(5);
  });

  it('buildWorkshop2OpsSlaDashboard returns labelRu', () => {
    process.chdir(root);
    const dash = buildWorkshop2OpsSlaDashboard({});
    expect(dash.labelRu).toBeTruthy();
    expect(dash.sloTargets.ackP99Ms).toBe(5000);
  });

  it('probeLastOkAt from env or null', () => {
    const dash = buildWorkshop2OpsSlaDashboard({
      WORKSHOP2_PROBE_LAST_OK_AT: '2026-05-29T00:00:00Z',
    });
    expect(dash.probeLastOkAt).toBe('2026-05-29T00:00:00Z');
  });
});

describe('wave53 — invoice stub journal_only', () => {
  const prevCwd = process.cwd();
  let tmpDir = '';

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'w53-inv-'));
    process.chdir(tmpDir);
    fs.mkdirSync(path.join(tmpDir, '.planning'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(prevCwd);
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('appendWorkshop2B2bInvoiceStubJournal writes journal_only entry', () => {
    const entry = appendWorkshop2B2bInvoiceStubJournal({
      orderId: 'B2B-001',
      brandId: 'demo-brand',
      tenantId: 'tenant-demo',
      totalRub: 100000,
    });
    expect(entry.mode).toBe('journal_only');
    expect(entry.pdfPathPlaceholderRu).toContain('/schet-offerta.pdf');
  });
});

describe('wave53 — routes scripts docs on disk', () => {
  it('sla dashboard API + lib exist', () => {
    expect(
      fs.existsSync(path.join(root, 'src/lib/production/workshop2-ops-sla-dashboard.ts'))
    ).toBe(true);
    expect(fs.existsSync(path.join(root, 'src/app/api/workshop2/ops/sla-dashboard/route.ts'))).toBe(
      true
    );
  });

  it('3d-sla API exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/shop/b2b/showroom/3d-sla/route.ts'))).toBe(
      true
    );
  });

  it('orders export route exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/shop/b2b/orders/export/route.ts'))).toBe(
      true
    );
  });

  it('probe escalation script fail-closed', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-escalation.mjs'), 'utf8');
    expect(mjs).toContain('workshop2-probe-escalation-journal.json');
    expect(mjs).toContain('SENTRY_DSN');
    expect(mjs).toContain('WORKSHOP2_PAGERDUTY_WEBHOOK_URL');
  });

  it('planning docs exist', () => {
    expect(fs.existsSync(path.join(root, '.planning/workshop2-sla-targets.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.planning/workshop2-cdn-routing.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.planning/workshop2-ack-s3-lifecycle.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.planning/workshop2-sentry-alert-rules.md'))).toBe(true);
  });

  it('sentry doc includes Wave 53 escalation section', () => {
    const md = fs.readFileSync(
      path.join(root, '.planning/workshop2-sentry-alert-rules.md'),
      'utf8'
    );
    expect(md).toContain('Wave 53');
    expect(md).toContain('probe-escalation');
  });

  it('hub sla panel mounted', () => {
    const src = fs.readFileSync(
      path.join(root, 'src/app/brand/production/workshop2/workshop2-hub-core.tsx'),
      'utf8'
    );
    expect(src).toContain('Workshop2HubSlaOpsPanel');
  });

  it('wave53 restore disk script exists', () => {
    expect(fs.existsSync(path.join(root, 'scripts/wave53-restore-disk.mjs'))).toBe(true);
  });

  it('middleware mentions b2b cart no-store', () => {
    const mw = fs.readFileSync(path.join(root, 'src/middleware.ts'), 'utf8');
    expect(mw).toContain('/api/shop/b2b/cart');
    expect(mw).toContain('no-store');
  });
});

describe('wave53 — probe wave53ProdSlaReady', () => {
  it('fs and live probes agree', () => {
    process.chdir(root);
    const fsProbe = buildWorkshop2Wave53ProdSlaReadyProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave53ProdSlaReady).toBe(live.wave53ProdSlaReady);
    if (fsProbe.ok) {
      expect(fsProbe.wave53ProdSlaReady).toBeGreaterThanOrEqual(12);
    }
  });
});
