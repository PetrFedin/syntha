import fs from 'node:fs';
import path from 'node:path';

import {
  BRAND_COLLECTION_STAGE_MODULES_API,
  BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_RU,
  BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_TESTID,
  BRAND_COLLECTION_STAGE_MODULES_PG_TABLE,
  BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_RU,
  BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_TESTID,
  BRAND_COLLECTION_STAGE_MODULES_SYNC_RU,
} from '@/lib/platform/wave-xj-collection-stage-modules-pg';
import {
  loadCollectionStageModulesWithMode,
  resetCollectionStageModulesPersistModeCacheForTests,
} from '@/lib/production/collection-stage-modules-store';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave XJ — collection stage modules PG (brand production floor)', () => {
  beforeEach(() => {
    resetCollectionStageModulesPersistModeCacheForTests();
  });

  it('RU labels + PG badge testids', () => {
    expect(BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_RU).toContain('PostgreSQL');
    expect(BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_RU).toContain('PG');
    expect(BRAND_COLLECTION_STAGE_MODULES_SYNC_RU).toContain('Синхрон');
    expect(BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_TESTID).toContain('storage-pg');
    expect(BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_TESTID).toContain('unavailable');
  });

  it('fail-closed LS read in core (store + policy)', () => {
    const store = read('lib/production/collection-stage-modules-store.ts');
    expect(store).toContain('shouldUseLocalStorageClientFallbackInCore');
    expect(store).toContain('loadCollectionStageModulesWithMode');
    expect(store).toContain('fetchCollectionStageModulesFromServerWithMode');
  });

  it('CollectionStageModuleHubCard PG-only refresh (no LS hydrate fallback)', () => {
    const card = read('components/brand/production/CollectionStageModuleHubCard.tsx');
    expect(card).toContain('loadCollectionStageModulesWithMode');
    expect(card).not.toContain('hydrateCollectionStageModulesFromServer');
    expect(card).not.toContain('loadCollectionStageModules(');
    expect(card).toContain('BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_TESTID');
    expect(card).toContain('BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_TESTID');
  });

  it('postgres table + BFF route contract', () => {
    expect(BRAND_COLLECTION_STAGE_MODULES_API).toContain('collection-stage-modules');
    const repo = read('lib/server/brand-collection-stage-modules-repository.ts');
    expect(repo).toContain(BRAND_COLLECTION_STAGE_MODULES_PG_TABLE);
    expect(repo).toContain("storageMode: 'postgres'");
    const route = read('app/api/brand/collection-stage-modules/route.ts');
    expect(route).toContain('getBrandCollectionStageModulesServer');
    expect(route).toContain('putBrandCollectionStageModulesServer');
  });

  it('loadCollectionStageModulesWithMode GET PG in core mode', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        doc: { v: 1, steps: { costing: { fields: { landedCostPolicy: 'FOB' }, attachments: [], history: [] } } },
        storageMode: 'postgres',
      }),
    });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadCollectionStageModulesWithMode('SS27');
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(false);
    expect(loaded.doc.steps.costing?.fields.landedCostPolicy).toBe('FOB');
    expect(fetchMock).toHaveBeenCalledWith(
      `${BRAND_COLLECTION_STAGE_MODULES_API}?collectionId=SS27`,
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('loadCollectionStageModulesWithMode fail-closed when PG down in core', async () => {
    jest.doMock('@/lib/production/workshop2-pg-read-path-policy', () => ({
      shouldUseLocalStorageClientFallbackInCore: () => false,
      shouldMirrorPgClientStoreToLocalStorage: () => false,
    }));
    jest.resetModules();
    const { loadCollectionStageModulesWithMode: loadCore } = await import(
      '@/lib/production/collection-stage-modules-store'
    );

    const fetchMock = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    global.fetch = fetchMock as typeof fetch;

    const loaded = await loadCore('SS27');
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(true);
    expect(loaded.doc.steps).toEqual({});

    jest.dontMock('@/lib/production/workshop2-pg-read-path-policy');
    jest.resetModules();
  });
});
