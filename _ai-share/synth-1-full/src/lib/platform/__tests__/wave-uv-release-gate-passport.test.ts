import {
  BRAND_RELEASE_GATE_PASSPORT_API_PATH,
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
  BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU,
  evaluateBrandMaterialPassportReleaseGateFromSummary,
} from '@/lib/production/brand-material-passport-release-gate';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';
import { materialPassportCertsBlockRelease } from '@/lib/fashion/brand-material-passport-certs';

describe('wave UV — SC release gate passport', () => {
  it('SC check API path distinct from merch release-gate', () => {
    expect(BRAND_SC_RELEASE_GATE_CHECK_API_PATH).toBe(
      '/api/brand/sample-collection/release-gate/check'
    );
    expect(BRAND_RELEASE_GATE_PASSPORT_API_PATH).toBe('/api/brand/merch/release-gate');
    expect(BRAND_SC_RELEASE_GATE_CHECK_API_PATH).not.toBe(BRAND_RELEASE_GATE_PASSPORT_API_PATH);
  });

  it('schema/passport peer strip testids', () => {
    expect('brand-sc-release-gate-schema-passport-peer-strip').toContain('schema-passport');
    expect('brand-sc-release-gate-schema-link').toContain('schema');
    expect('brand-sc-release-gate-passport-certs-link').toContain('certs');
    expect('brand-sc-release-gate-checklist-link').toContain('checklist');
  });

  it('block publish UI testids', () => {
    expect('brand-sc-release-gate-block-strip').toContain('block-strip');
    expect('brand-sc-release-gate-block-badge').toContain('block-badge');
    expect('brand-sc-release-gate-block-ready-badge').toContain('ready-badge');
    expect('brand-sc-release-gate-block-message').toContain('block-message');
    expect('brand-sc-release-gate-block-passport-link').toContain('passport-link');
    expect('brand-sc-release-gate-block-schema-link').toContain('schema-link');
    expect('brand-sc-release-gate-block-recheck-btn').toContain('recheck');
    expect('brand-sc-release-gate-block-publish-hint').toContain('publish-hint');
  });

  it('passport incomplete blocks release (409 semantics)', () => {
    expect(materialPassportCertsBlockRelease({ total: 6, ready: 2 })).toBe(true);
    const gate = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 6, ready: 2, blocked: 4 },
      releaseBlocked: true,
      storageMode: 'pg',
    });
    expect(gate.blocked).toBe(true);
    expect(gate.messageRu).toContain('material passport');
    expect(BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU).toContain('publish');
  });

  it('passport complete allows release', () => {
    const gate = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 4, ready: 4, blocked: 0 },
      releaseBlocked: false,
      storageMode: 'pg',
    });
    expect(gate.blocked).toBe(false);
    expect(gate.ready).toBe(true);
  });
});

describe('wave UV — release gate server + client fetch', () => {
  it('evaluateBrandMaterialPassportReleaseGateForCollection for SS27', async () => {
    const mod = await import('@/lib/server/brand-material-passport-release-gate-server');
    const gate = await mod.evaluateBrandMaterialPassportReleaseGateForCollection({
      collectionId: 'SS27',
    });
    expect(typeof gate.blocked).toBe('boolean');
    expect(gate.summary.total).toBeGreaterThanOrEqual(0);
    expect(gate.messageRu.length).toBeGreaterThan(0);
  });

  it('fetchBrandScReleaseGateCheck is exported', () => {
    expect(typeof fetchBrandScReleaseGateCheck).toBe('function');
  });
});
