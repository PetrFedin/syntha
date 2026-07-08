import fs from 'node:fs';
import path from 'node:path';

import {
  BRAND_COLLECTION_INVENTORY_OVERLAY_API,
  BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_TESTID,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_TESTID,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_TABLE,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_TESTID,
  BRAND_COLLECTION_INVENTORY_OVERLAY_STRIP_TESTID,
  buildBrandCollectionInventoryLedgerWmsHref,
} from '@/lib/platform/wave-yb-brand-inventory-overlay-pg';
import {
  loadCollectionInventoryOverlayWithMode,
  mergeCollectionInventoryOverlayArticles,
  resetCollectionInventoryOverlayPersistModeCacheForTests,
} from '@/lib/production/collection-inventory-overlay-store';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YB — brand collection inventory overlay PG (core S1)', () => {
  beforeEach(() => {
    resetCollectionInventoryOverlayPersistModeCacheForTests();
  });

  it('RU labels + PG badge testids + ledger cross-link', () => {
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_RU).toContain('PostgreSQL');
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_RU).toContain('PG');
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_TESTID).toContain('storage-pg');
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_TESTID).toContain('unavailable');
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_STRIP_TESTID).toContain('overlay-strip');
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_TESTID).toContain('inventory-ledger');
    const href = buildBrandCollectionInventoryLedgerWmsHref({ collectionId: 'SS27' });
    expect(href).toContain('/brand/inventory');
    expect(href).toContain('collection=SS27');
    expect(href).toContain('pcf=overview');
  });

  it('fail-closed LS read in core (store + policy)', () => {
    const store = read('lib/production/collection-inventory-overlay-store.ts');
    expect(store).toContain('shouldUseLocalStorageClientFallbackInCore');
    expect(store).toContain('shouldMirrorPgClientStoreToLocalStorage');
    expect(store).toContain('loadCollectionInventoryOverlayWithMode');
    const inv = read('lib/production/local-collection-inventory.ts');
    expect(inv).toContain('shouldUseLocalStorageClientFallbackInCore');
    expect(inv).toContain('shouldMirrorPgClientStoreToLocalStorage');
  });

  it('BrandCollectionInventoryOverlayPgStrip + flow page merge (no LS dual-write)', () => {
    const strip = read('components/brand/production/BrandCollectionInventoryOverlayPgStrip.tsx');
    expect(strip).toContain('BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_TESTID');
    expect(strip).toContain('buildBrandCollectionInventoryLedgerWmsHref');
    const flow = read('app/brand/production/use-brand-production-collection-flow-page.ts');
    expect(flow).toContain('mergeCollectionInventoryOverlayArticles');
    expect(flow).toContain('useBrandProductionCollectionInventoryOverlay');
    expect(flow).toContain('isPlatformCoreMode() ? {} : localInventory.articlesByCollection');
  });

  it('postgres table + BFF route contract', () => {
    expect(BRAND_COLLECTION_INVENTORY_OVERLAY_API).toContain('collection-inventory-overlay');
    const repo = read('lib/server/brand-collection-inventory-overlay-repository.ts');
    expect(repo).toContain(BRAND_COLLECTION_INVENTORY_OVERLAY_PG_TABLE);
    expect(repo).toContain("storageMode: 'postgres'");
    const route = read('app/api/brand/collection-inventory-overlay/route.ts');
    expect(route).toContain('getBrandCollectionInventoryOverlayServer');
    expect(route).toContain('putBrandCollectionInventoryOverlayServer');
  });

  it('mergeCollectionInventoryOverlayArticles merges seed + overlay', () => {
    const seed = [
      { id: 's1', sku: 'SS27-01', season: 'SS27', name: 'Seed' },
      { id: 's2', sku: 'FW27-01', season: 'FW27', name: 'Other' },
    ];
    const overlay = [
      {
        id: 'o1',
        sku: 'SS27-OVR-01',
        season: 'SS27',
        name: 'Overlay',
        orderedQuantity: 1,
        price: 1,
        deliveryWindowId: 'd1',
        categoryLeafId: 'c1',
        productionSiteId: 'p1',
        productionSiteLabel: 'P1',
        fabricSuppliers: [],
        fabricMainFromBrandStock: false,
      },
    ];
    const merged = mergeCollectionInventoryOverlayArticles(seed, overlay, 'SS27');
    expect(merged).toHaveLength(2);
    expect(merged.some((r) => r.sku === 'SS27-OVR-01')).toBe(true);
    expect(merged.some((r) => r.sku === 'FW27-01')).toBe(false);
  });

  it('loadCollectionInventoryOverlayWithMode GET PG in core mode', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        doc: { v: 1, articles: [] },
        storageMode: 'postgres',
      }),
    });
    global.fetch = fetchMock as typeof fetch;

    jest.doMock('@/lib/cabinet-core-mode', () => ({
      isPlatformCoreMode: () => true,
    }));
    jest.resetModules();
    const { loadCollectionInventoryOverlayWithMode: loadCore } =
      await import('@/lib/production/collection-inventory-overlay-store');

    const loaded = await loadCore('SS27');
    expect(loaded.persistMode).toBe('postgres');
    expect(loaded.pgUnavailable).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BRAND_COLLECTION_INVENTORY_OVERLAY_API}?collectionId=SS27`,
      expect.objectContaining({ cache: 'no-store' })
    );

    jest.dontMock('@/lib/cabinet-core-mode');
    jest.resetModules();
  });
});
