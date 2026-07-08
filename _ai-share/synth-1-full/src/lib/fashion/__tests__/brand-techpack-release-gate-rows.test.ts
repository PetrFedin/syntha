import { products } from '@/lib/products';
import {
  buildBrandTechPackReleaseGateRow,
  buildBrandTechPackReleaseGateRows,
  summarizeBrandTechPackReleaseGate,
} from '@/lib/fashion/brand-techpack-release-gate-rows';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

describe('brand-techpack-release-gate-rows', () => {
  it('builds blocked row for empty dossier', () => {
    const product = products[0]!;
    const row = buildBrandTechPackReleaseGateRow({
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      articleId: product.id,
      collectionId: 'SS27',
      dossier: { schemaVersion: 1, assignments: [] },
    });
    expect(row.sheetsTotal).toBe(6);
    expect(row.ready).toBe(false);
    expect(row.factoryPackHref).toContain('pcf=factory-pack');
  });

  it('summarizes rows from products', () => {
    const rows = buildBrandTechPackReleaseGateRows({
      products: products.slice(0, 3),
      collectionId: 'SS27',
      resolveDossier: () => ({ schemaVersion: 1, assignments: [] }) as Workshop2DossierPhase1,
    });
    expect(rows.length).toBe(3);
    const summary = summarizeBrandTechPackReleaseGate(rows);
    expect(summary.total).toBe(3);
  });
});
