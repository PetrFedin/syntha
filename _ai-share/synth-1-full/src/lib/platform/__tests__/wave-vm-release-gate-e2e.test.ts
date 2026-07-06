import {
  BRAND_RELEASE_GATE_PASSPORT_API_PATH,
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
  BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU,
  evaluateBrandMaterialPassportReleaseGateFromSummary,
} from '@/lib/production/brand-material-passport-release-gate';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';
import { materialPassportCertsBlockRelease } from '@/lib/fashion/brand-material-passport-certs';
import { brandAttributeSchemaReleaseChecklistHref } from '@/lib/fashion/brand-attribute-schema-workspace';

describe('wave VM — SC release gate E2E contracts', () => {
  it('SC check API path for publish gate', () => {
    expect(BRAND_SC_RELEASE_GATE_CHECK_API_PATH).toBe(
      '/api/brand/sample-collection/release-gate/check'
    );
    expect(BRAND_RELEASE_GATE_PASSPORT_API_PATH).toBe('/api/brand/merch/release-gate');
  });

  it('dev schema↔passport peer strip testids', () => {
    expect('brand-dev-schema-passport-peer-strip').toContain('schema-passport');
    expect('brand-dev-schema-passport-schema-link').toContain('schema');
    expect('brand-dev-schema-passport-schema-health-link').toContain('health');
    expect('brand-dev-schema-passport-passport-link').toContain('passport');
    expect('brand-dev-schema-passport-certs-link').toContain('certs');
    expect('brand-dev-schema-passport-release-gate-link').toContain('release-gate');
  });

  it('syndicate + showroom publish 409 RU banner testids', () => {
    expect('brand-sc-release-gate-block-syndicate-banner').toContain('syndicate-banner');
    expect('brand-sc-release-gate-block-syndicate-409').toContain('syndicate-409');
    expect('brand-sc-release-gate-block-publish-hint').toContain('publish-hint');
    expect('brand-showroom-publish-one-click-strip').toContain('one-click');
  });

  it('passport release panel SC gate integration testids', () => {
    expect('brand-material-passport-release-sc-gate-blocked').toContain('sc-gate-blocked');
    expect('brand-material-passport-release-sc-gate-ready').toContain('sc-gate-ready');
    expect('brand-material-passport-release-sc-gate-message').toContain('sc-gate-message');
    expect('brand-material-passport-release-sc-gate-recheck-btn').toContain('recheck');
  });

  it('release checklist href includes checklist feature', () => {
    expect(brandAttributeSchemaReleaseChecklistHref('SS27')).toContain('checklist');
    expect(brandAttributeSchemaReleaseChecklistHref('SS27')).toContain('SS27');
  });

  it('passport incomplete blocks release (409 semantics)', () => {
    expect(materialPassportCertsBlockRelease({ total: 8, ready: 3 })).toBe(true);
    const gate = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 8, ready: 3, blocked: 5 },
      releaseBlocked: true,
      storageMode: 'pg',
    });
    expect(gate.blocked).toBe(true);
    expect(gate.messageRu).toContain('material passport');
    expect(BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU).toContain('publish');
  });

  it('passport complete allows SC publish gate', () => {
    const gate = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 5, ready: 5, blocked: 0 },
      releaseBlocked: false,
      storageMode: 'pg',
    });
    expect(gate.blocked).toBe(false);
    expect(gate.ready).toBe(true);
  });
});

describe('wave VM — release gate server + client fetch', () => {
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
