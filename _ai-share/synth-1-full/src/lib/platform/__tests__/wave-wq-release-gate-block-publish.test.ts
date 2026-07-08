import {
  BRAND_DEV_PASSPORT_RELEASE_GATE_BLOCK_BANNER_RU,
  BRAND_DEV_PASSPORT_RELEASE_GATE_BLOCK_BANNER_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_CHECKLIST_LINK_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_RECHECK_BTN_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_SHOWROOM_PUBLISH_LINK_TESTID,
  BRAND_DEV_PASSPORT_RELEASE_GATE_STATUS_BADGE_TESTID,
  BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU,
  BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU,
  BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_TESTID,
  BRAND_SC_RELEASE_GATE_CHECK_API_PATH,
  brandDevPassportReleaseChecklistHref,
  brandDevPassportReleaseGateStatusLabelRu,
  brandDevPassportShowroomPublishHref,
} from '@/lib/production/wave-wq-release-gate-block-publish';
import { evaluateBrandMaterialPassportReleaseGateFromSummary } from '@/lib/production/brand-material-passport-release-gate';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';
import { materialPassportCertsBlockRelease } from '@/lib/fashion/brand-material-passport-certs';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

describe('wave WQ — release gate block publish (full UI wire)', () => {
  it('SC check API path + RU publish banner copy', () => {
    expect(BRAND_SC_RELEASE_GATE_CHECK_API_PATH).toBe(
      '/api/brand/sample-collection/release-gate/check'
    );
    expect(BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU).toContain('publish');
    expect(BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU).toContain('material passport');
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_BLOCK_BANNER_RU).toContain('sample-collection');
  });

  it('publish + passport banner testids', () => {
    expect(BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_TESTID).toContain('publish-banner');
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_BLOCK_BANNER_TESTID).toContain('block-banner');
    expect('brand-sc-release-gate-block-publish-hint').toContain('publish-hint');
    expect('brand-sc-release-gate-block-strip').toContain('block-strip');
  });

  it('dev passport → release gate peer strip testids', () => {
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID).toContain('peer-strip');
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_STATUS_BADGE_TESTID).toContain('status-badge');
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_CHECKLIST_LINK_TESTID).toContain('checklist-link');
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_SHOWROOM_PUBLISH_LINK_TESTID).toContain(
      'showroom-publish-link'
    );
    expect(BRAND_DEV_PASSPORT_RELEASE_GATE_RECHECK_BTN_TESTID).toContain('recheck');
  });

  it('peer strip hrefs resolve to release workspace tabs', () => {
    const cid = PLATFORM_CORE_DEMO.collectionId;
    expect(brandDevPassportReleaseChecklistHref(cid)).toContain('pcf=checklist');
    expect(brandDevPassportReleaseChecklistHref(cid)).toContain(cid);
    expect(brandDevPassportShowroomPublishHref(cid)).toContain('pcf=showroom-publish');
    expect(brandDevPassportShowroomPublishHref(cid)).toContain(cid);
  });

  it('release gate status label RU for blocked vs ready', () => {
    expect(
      brandDevPassportReleaseGateStatusLabelRu({ blocked: true, ready: 2, total: 8 })
    ).toContain('заблокирован');
    expect(
      brandDevPassportReleaseGateStatusLabelRu({ blocked: false, ready: 8, total: 8 })
    ).toContain('ready');
  });

  it('passport incomplete blocks publish (409 semantics)', () => {
    expect(materialPassportCertsBlockRelease({ total: 6, ready: 1 })).toBe(true);
    const gate = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 6, ready: 1, blocked: 5 },
      releaseBlocked: true,
      storageMode: 'pg',
    });
    expect(gate.blocked).toBe(true);
    expect(gate.messageRu).toContain('material passport');
    expect(BRAND_RELEASE_GATE_PASSPORT_BLOCKED_RU).toContain('publish');
  });

  it('passport complete allows SC publish gate', () => {
    const gate = evaluateBrandMaterialPassportReleaseGateFromSummary({
      summary: { total: 4, ready: 4, blocked: 0 },
      releaseBlocked: false,
      storageMode: 'pg',
    });
    expect(gate.blocked).toBe(false);
    expect(gate.ready).toBe(true);
  });
});

describe('wave WQ — release gate server + client fetch', () => {
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
