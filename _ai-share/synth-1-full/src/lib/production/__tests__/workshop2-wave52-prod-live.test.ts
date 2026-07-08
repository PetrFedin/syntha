/**
 * Wave 52 — prod live keys, brand registry, merge assist, cutover human gate (+14).
 */
import fs from 'node:fs';
import path from 'node:path';

import { buildWorkshop2CutoverDashboard } from '@/lib/production/workshop2-cutover-dashboard';
import {
  listWorkshop2BrandTenantRegistry,
  validateWorkshop2B2bCheckoutBrandTenant,
} from '@/lib/production/workshop2-brand-tenant-registry';
import { buildWorkshop2Wave52ProdLiveReadyProbe } from '@/lib/production/workshop2-wave-probes-fs.server';
import { buildWorkshop2Wave52ProdLiveReadyProbe as liveProbe } from '@/lib/production/workshop2-live-integration-probes';

const root = process.cwd();

describe('wave52 — cutover dashboard human signoff gate', () => {
  it('humanSignoffRequired when not demo mode', () => {
    const dash = buildWorkshop2CutoverDashboard({ WORKSHOP2_INVESTOR_DEMO_MODE: '' });
    expect(dash.humanSignoffRequired).toBe(true);
  });

  it('humanSignoffGateOk in demo mode without signoff', () => {
    const dash = buildWorkshop2CutoverDashboard({ WORKSHOP2_INVESTOR_DEMO_MODE: 'true' });
    expect(dash.humanSignoffRequired).toBe(false);
    expect(dash.humanSignoffGateOk).toBe(true);
  });

  it('probes include wave45 staging prod', () => {
    const dash = buildWorkshop2CutoverDashboard();
    expect(dash.probes.some((p) => p.id === 'wave45_staging_prod')).toBe(true);
  });
});

describe('wave52 — brand tenant registry', () => {
  it('default demo brand registry', () => {
    const brands = listWorkshop2BrandTenantRegistry({});
    expect(brands.length).toBeGreaterThan(0);
    expect(brands[0]?.brandId).toBeTruthy();
  });

  it('checkout validates registered brand', () => {
    const r = validateWorkshop2B2bCheckoutBrandTenant({
      session: { lines: [{ brandId: 'demo-brand' } as never], brandId: 'demo-brand' },
    });
    expect(r.ok).toBe(true);
  });
});

describe('wave52 — routes and scripts on disk', () => {
  it('cutover dashboard API exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/workshop2/cutover-dashboard/route.ts'))).toBe(
      true
    );
  });

  it('brand registry API exists', () => {
    expect(fs.existsSync(path.join(root, 'src/app/api/shop/b2b/brand-registry/route.ts'))).toBe(
      true
    );
  });

  it('B2bRepBrandSwitcher component exists', () => {
    expect(fs.existsSync(path.join(root, 'src/components/shop/b2b/B2bRepBrandSwitcher.tsx'))).toBe(
      true
    );
  });

  it('production keys checklist script exists', () => {
    expect(fs.existsSync(path.join(root, 'scripts/workshop2-production-keys-checklist.mjs'))).toBe(
      true
    );
  });

  it('merge assist script has gh pr create without git commit', () => {
    const sh = fs.readFileSync(path.join(root, 'scripts/workshop2-merge-assist.sh'), 'utf8');
    expect(sh).toContain('gh pr create');
    expect(sh).not.toContain('git commit -m');
  });

  it('probe-alert accepts BASE_URL argv', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-alert.mjs'), 'utf8');
    expect(mjs).toContain('process.argv[2]');
    expect(mjs).toContain('wave52ProdLiveReady');
  });

  it('probe-prod requires WORKSHOP2_PRODUCTION_PUBLIC_URL', () => {
    const mjs = fs.readFileSync(path.join(root, 'scripts/workshop2-probe-prod.mjs'), 'utf8');
    expect(mjs).toContain('WORKSHOP2_PRODUCTION_PUBLIC_URL');
  });

  it('production env example exists', () => {
    expect(fs.existsSync(path.join(root, '.env.production.ru.example'))).toBe(true);
  });

  it('merge assist checklist RU doc exists', () => {
    expect(fs.existsSync(path.join(root, '.planning/workshop2-merge-assist-checklist.md'))).toBe(
      true
    );
  });

  it('hub cutover panel mounted in enterprise hub inner', () => {
    const src = fs.readFileSync(
      path.join(root, 'src/app/brand/production/workshop2/workshop2-enterprise-hub-inner.tsx'),
      'utf8'
    );
    expect(src).toContain('Workshop2HubCutoverDashboardPanel');
  });

  it('cutover dashboard references wave45 in probes', () => {
    const src = fs.readFileSync(
      path.join(root, 'src/lib/production/workshop2-cutover-dashboard.ts'),
      'utf8'
    );
    expect(src).toContain('wave45_staging_prod');
    expect(src).toContain('buildWorkshop2Wave45StagingProdReadyProbe');
  });

  it('wave52 restore disk script exists', () => {
    expect(fs.existsSync(path.join(root, 'scripts/wave52-restore-disk.mjs'))).toBe(true);
  });
});

describe('wave52 — probe wave52ProdLiveReady', () => {
  it('fs and live probes agree with ≥12 checks when artifacts present', () => {
    const fsProbe = buildWorkshop2Wave52ProdLiveReadyProbe({ WORKSHOP2_MARKET: 'ru' });
    const live = liveProbe({ WORKSHOP2_MARKET: 'ru' });
    expect(fsProbe.wave52ProdLiveReady).toBe(live.wave52ProdLiveReady);
    if (fsProbe.ok) {
      expect(fsProbe.wave52ProdLiveReady).toBeGreaterThanOrEqual(12);
    }
  });
});
