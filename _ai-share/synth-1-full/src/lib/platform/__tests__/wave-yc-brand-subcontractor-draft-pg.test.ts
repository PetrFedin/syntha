import {
  createBrandSubcontractorFloorDemoSeed,
  createBrandSubcontractorFloorEmptySeed,
  resolveBrandSubcontractorFloorDefaultSeed,
  WAVE_YC_BRAND_FLOOR_TAB_DRAFT_LS_PREFIX,
  WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_SCOPE,
  WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_TAB_API,
  WAVE_YC_BRAND_SUBCONTRACTOR_HUB_TITLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_PG_BADGE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_PG_UNAVAILABLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TOAST_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_TITLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_STATUS_LABELS_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_PG_TESTID,
  WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_UNAVAILABLE_TESTID,
  waveYcBrandSubcontractorFloorTabStorageKey,
} from '@/lib/platform/wave-yc-brand-subcontractor-draft-pg';
import {
  loadFloorTabDraftWithMode,
  resetFloorTabDraftPersistModeCacheForTests,
} from '@/lib/production-data/floor-tab-draft-client';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';
import { resolveWorkshop2SewingContractorsPayload } from '@/lib/production/workshop2-sewing-plan-reference-data';

describe('wave YC — brand subcontractor floor-tab draft PG', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
    resetFloorTabDraftPersistModeCacheForTests();
  });

  it('RU labels + PG testids', () => {
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_HUB_TITLE_RU).toContain('субподряда');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_TITLE_RU).toContain('сторону');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TOAST_RU).toContain('Субподряд');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_PG_BADGE_RU).toContain('PostgreSQL');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_PG_UNAVAILABLE_RU).toContain('недоступен');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_STATUS_LABELS_RU.in_progress).toBe('В работе');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_PG_TESTID).toContain('storage-pg');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_UNAVAILABLE_TESTID).toContain('unavailable');
  });

  it('floor-tab PG BFF + fail-closed LS', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_TAB_API).toContain('floor-tabs');
    expect(WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_SCOPE).toBe('subcontractor');
    expect(WAVE_YC_BRAND_FLOOR_TAB_DRAFT_LS_PREFIX).toContain('floor_tab_draft');
    expect(waveYcBrandSubcontractorFloorTabStorageKey()).toContain('subcontractor');
    expect('loadFloorTabDraftWithMode').toContain('FloorTabDraft');
    expect(shouldUseLocalStorageClientFallbackInCore()).toBe(false);
    expect(shouldMirrorPgClientStoreToLocalStorage()).toBe(false);
  });

  it('demo seed uses enterprise partners (no sc1/sc2 placeholders)', () => {
    const seed = createBrandSubcontractorFloorDemoSeed();
    expect(seed.orders.length).toBe(2);
    expect(seed.orders[0]?.subcontractorId).toBe('syntha-lab');
    expect(seed.orders[1]?.subcontractorId).toBe('factory-01');
    expect(seed.orders.some((o) => o.subcontractorId === 'sc1')).toBe(false);
  });

  it('core default seed is empty; non-core keeps demo', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(resolveBrandSubcontractorFloorDefaultSeed().orders).toEqual([]);
    delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    expect(resolveBrandSubcontractorFloorDefaultSeed().orders.length).toBe(2);
    expect(createBrandSubcontractorFloorEmptySeed().orders).toEqual([]);
  });

  it('sewing contractors skip placeholder brands in core', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const payload = resolveWorkshop2SewingContractorsPayload();
    expect(payload.source.partners).toBe('enterprise_and_b2b');
    expect(payload.partners.some((p) => p.id.startsWith('b2b:'))).toBe(false);
  });

  it('floor-tab client GET in PG mode', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        draft: { v: 1, orders: [{ id: 'yc-1', status: 'requested' }] },
        storageMode: 'pg',
      }),
    });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadFloorTabDraftWithMode('subcontractor');
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/brand/production/floor-tabs/subcontractor'),
      expect.objectContaining({ cache: 'no-store' })
    );
  });
});
