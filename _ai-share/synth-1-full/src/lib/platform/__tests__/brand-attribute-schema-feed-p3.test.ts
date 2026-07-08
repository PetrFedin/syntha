import {
  buildBrandAttributeSchemaFeedRows,
  buildBrandSizeChartGradeFeedRows,
  mergeBrandSizeChartGradeFeedRows,
} from '@/lib/fashion/brand-attribute-schema-feed';
import {
  buildBrandSupplierBomSeedFeedRows,
  mergeBrandSupplierBomFeedRows,
} from '@/lib/fashion/brand-supplier-bom-feed';
import {
  clearBrandAttributeSchemaFeedMemoryForTests,
  listBrandAttributeSchemaFeedServer,
  listBrandSizeChartGradeFeedServer,
  patchBrandSizeChartGradeFeedServer,
} from '@/lib/server/brand-attribute-schema-repository';
import {
  clearBrandSupplierBomMemoryForTests,
  listBrandSupplierBomFeedServer,
} from '@/lib/server/brand-supplier-bom-repository';
import { products } from '@/lib/products';

describe('brand-attribute-schema-feed', () => {
  it('builds schema and size-chart feed rows', () => {
    const schemas = buildBrandAttributeSchemaFeedRows(products.slice(0, 5));
    const sizeRows = buildBrandSizeChartGradeFeedRows(products.slice(0, 5));
    expect(schemas.length).toBe(5);
    expect(sizeRows.length).toBe(5);
    expect(sizeRows.every((r) => ['empty', 'partial', 'ready'].includes(r.gradeState))).toBe(true);
  });

  it('merges persisted grade state', () => {
    const catalog = buildBrandSizeChartGradeFeedRows(products.slice(0, 2));
    const merged = mergeBrandSizeChartGradeFeedRows(
      catalog,
      new Map([
        [catalog[0]!.sku, { ...catalog[0]!, gradeState: 'ready' as const, source: 'pg' as const }],
      ])
    );
    expect(merged[0]?.gradeState).toBe('ready');
    expect(merged[0]?.source).toBe('pg');
  });
});

describe('brand-attribute-schema-repository', () => {
  beforeEach(() => {
    clearBrandAttributeSchemaFeedMemoryForTests();
  });

  it('seeds schema feed', async () => {
    const listed = await listBrandAttributeSchemaFeedServer({ collectionId: 'SS27' });
    expect(listed.schemas.length).toBeGreaterThan(0);
    expect(listed.storageMode).not.toBe('demo');
  });

  it('patches size-chart grade', async () => {
    const listed = await listBrandSizeChartGradeFeedServer({ collectionId: 'SS27' });
    const sku = listed.rows[0]?.sku;
    expect(sku).toBeTruthy();
    const patched = await patchBrandSizeChartGradeFeedServer({
      collectionId: 'SS27',
      sku: sku!,
      gradeState: 'ready',
    });
    expect(patched.row?.gradeState).toBe('ready');
  });
});

describe('brand-supplier-bom-feed', () => {
  beforeEach(() => {
    clearBrandSupplierBomMemoryForTests();
  });

  it('seeds BOM when snapshot empty', async () => {
    const listed = await listBrandSupplierBomFeedServer({
      collectionId: 'SS27',
      articleId: 'ART-001',
      snapshotLines: [],
    });
    expect(listed.rows.length).toBeGreaterThan(0);
    expect(listed.summary.pgSourced).toBeGreaterThan(0);
  });

  it('prefers snapshot lines in merge helper', () => {
    const snapshot = mergeBrandSupplierBomFeedRows(
      [
        {
          lineId: 's1',
          materialName: 'Fabric',
          qty: 2,
          unit: 'm',
          filled: true,
          source: 'snapshot',
        },
      ],
      []
    );
    expect(snapshot[0]?.materialName).toBe('Fabric');
    const seeded = mergeBrandSupplierBomFeedRows([], buildBrandSupplierBomSeedFeedRows());
    expect(seeded.length).toBeGreaterThan(0);
  });
});
