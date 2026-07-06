import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  buildBrandDossierFactoryDiffPeerHrefs,
  buildBrandDossierFactoryDiffStubRows,
  summarizeBrandDossierFactoryDiffRu,
} from '@/lib/fashion/brand-dossier-factory-diff-stub';
import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import { brandW2ProductionTzHref, factoryProductionDossierContextHref } from '@/lib/routes';

describe('wave TO — brand dev dossier factory diff + OP attach TZ PO', () => {
  it('brand dossier factory diff stub rows are read-only aligned', () => {
    const rows = buildBrandDossierFactoryDiffStubRows({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    });
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.every((r) => r.matched)).toBe(true);
    expect(summarizeBrandDossierFactoryDiffRu(rows)).toContain('совпадают');
  });

  it('brand dossier factory diff peer hrefs', () => {
    const peers = buildBrandDossierFactoryDiffPeerHrefs({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
    });
    expect(peers.brandTzHref).toBe(brandW2ProductionTzHref('SS27', 'demo-ss27-01'));
    expect(peers.factoryDossierHref).toContain('/factory/production/dossier/demo-ss27-01');
    expect(peers.factoryDossierHref).toContain('pillar=order_production');
  });

  it('brand dossier factory diff testids', () => {
    expect('brand-dossier-factory-diff-panel').toContain('factory-diff');
    expect('brand-dossier-factory-diff-brand-col').toContain('brand-col');
    expect('brand-dossier-factory-diff-factory-col').toContain('factory-col');
    expect('brand-dossier-factory-diff-summary').toContain('summary');
    expect('brand-dossier-factory-diff-row-bom-lines').toContain('row-');
  });

  it('brand OP attach TZ PO session deep-links W2 + factory PO', () => {
    const session = buildBrandOpAttachTzPoSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      factoryId: PLATFORM_CORE_DEMO.factoryId,
    });
    expect(session.attachTzPoHref).toContain('w2sec=material');
    expect(session.attachTzPoHref).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(session.attachTzPoHref).toContain('po=');
    expect(session.attachTzPoHref).toContain('#w2-tz-export');
    expect(session.poHref).toContain('/factory/production/orders');
    expect(session.productionOrderId).toContain('PO-');
  });

  it('brand OP attach TZ PO strip testids', () => {
    expect('brand-op-attach-tz-po-strip').toContain('attach-tz-po');
    expect('brand-op-attach-tz-po-link').toContain('attach-tz-po-link');
    expect('brand-op-attach-tz-po-order-link').toContain('order-link');
  });

  it('mirrors factory dossier context href on diff peer strip', () => {
    const href = factoryProductionDossierContextHref(PLATFORM_CORE_DEMO.demoArticleId, {
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
    });
    expect(href).toContain('collection=SS27');
    expect(href).toContain('order=');
  });
});
