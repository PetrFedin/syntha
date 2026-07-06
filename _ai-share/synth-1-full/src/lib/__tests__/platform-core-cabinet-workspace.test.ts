import {
  hasEmbeddedPlatformCoreWorkspace,
  isShopCoMatrixEmbeddedCabinetContext,
  platformCoreCabinetSectionHref,
  resolveCabinetWorkspaceSection,
  roleCoreCabinetBasePath,
  shopCoMatrixEmbeddedTabHref,
} from '@/lib/platform-core-cabinet-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

describe('platform-core-cabinet-workspace', () => {
  const demo = {
    collectionId: PLATFORM_CORE_DEMO.collectionId,
    demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
    demoArticleId: PLATFORM_CORE_DEMO.demoArticleId,
    factoryId: PLATFORM_CORE_DEMO.factoryId,
  };

  it('flags embedded manufacturer order_production + supplier comms + brand/shop CO', () => {
    expect(hasEmbeddedPlatformCoreWorkspace('brand', 'collection_order')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('shop', 'collection_order')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('manufacturer', 'order_production')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('manufacturer', 'comms')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('supplier', 'development')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('supplier', 'order_production')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('supplier', 'comms')).toBe(true);
    expect(hasEmbeddedPlatformCoreWorkspace('shop', 'collection_order')).toBe(true);
  });

  it('resolves default collection_order sections for brand and shop', () => {
    expect(resolveCabinetWorkspaceSection('brand', 'collection_order', null)).toBe(
      'brand-co-registry'
    );
    expect(resolveCabinetWorkspaceSection('shop', 'collection_order', null)).toBe('shop-co-matrix');
  });

  it('builds section href with pillar, collection, section, order', () => {
    const href = platformCoreCabinetSectionHref(
      'manufacturer',
      'order_production',
      'mfr-op-handoff-queue',
      demo
    );
    expect(href).toContain(roleCoreCabinetBasePath('manufacturer'));
    expect(href).toContain('pillar=order_production');
    expect(href).toContain('section=mfr-op-handoff-queue');
    expect(href).toContain(`collection=${encodeURIComponent(demo.collectionId)}`);
    expect(href).toContain(`order=${encodeURIComponent(demo.demoOrderId)}`);
  });

  it('adds article for dossier and BOM sections', () => {
    const dossier = platformCoreCabinetSectionHref(
      'manufacturer',
      'order_production',
      'mfr-op-dossier',
      demo
    );
    expect(dossier).toContain(`article=${encodeURIComponent(demo.demoArticleId)}`);

    const bom = platformCoreCabinetSectionHref('supplier', 'development', 'sup-dev-bom', demo);
    expect(bom).toContain(`article=${encodeURIComponent(demo.demoArticleId)}`);
  });

  it('resolves default section when URL param absent', () => {
    expect(resolveCabinetWorkspaceSection('manufacturer', 'order_production', null)).toBe(
      'mfr-op-handoff-queue'
    );
    expect(resolveCabinetWorkspaceSection('supplier', 'comms', undefined)).toBe('sup-cm-order');
    expect(resolveCabinetWorkspaceSection('supplier', 'comms', 'sup-cm-rfq-inbox')).toBe(
      'sup-cm-rfq-inbox'
    );
  });

  it('maps archive sections to pillar default in article spine mode', () => {
    const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(
      resolveCabinetWorkspaceSection('brand', 'collection_order', 'brand-co-retailers')
    ).toBe('brand-co-registry');
    expect(resolveCabinetWorkspaceSection('brand', 'collection_order', 'brand-co-chain')).toBe(
      'brand-co-registry'
    );
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
  });
  it('brand dev hub section: no article in href; dossier includes article', () => {
    const hub = platformCoreCabinetSectionHref('brand', 'development', 'brand-dev-w2-hub', demo);
    expect(hub).toContain('section=brand-dev-w2-hub');
    expect(hub).not.toContain('article=');

    const dossier = platformCoreCabinetSectionHref(
      'brand',
      'development',
      'brand-dev-dossier',
      demo
    );
    expect(dossier).toContain('section=brand-dev-dossier');
    expect(dossier).toContain(`article=${encodeURIComponent(demo.demoArticleId)}`);
  });

  it('shouldShowBrandDevelopmentArticleWorkspace: hub vs dossier', () => {
    const { shouldShowBrandDevelopmentArticleWorkspace } = jest.requireActual(
      '@/lib/platform-core-cabinet-workspace'
    );
    expect(
      shouldShowBrandDevelopmentArticleWorkspace('brand-dev-w2-hub', demo.demoArticleId)
    ).toBe(false);
    expect(
      shouldShowBrandDevelopmentArticleWorkspace('brand-dev-dossier', demo.demoArticleId)
    ).toBe(true);
    expect(shouldShowBrandDevelopmentArticleWorkspace(null, demo.demoArticleId)).toBe(true);
    expect(shouldShowBrandDevelopmentArticleWorkspace('brand-dev-w2-hub', null)).toBe(false);
  });

  it('builds embedded shop CO matrix tab hrefs on /shop/core', () => {
    const matrix = shopCoMatrixEmbeddedTabHref('matrix', {
      collectionId: demo.collectionId,
      orderId: demo.demoOrderId,
    });
    expect(matrix).toContain('/shop/core?');
    expect(matrix).toContain('pillar=collection_order');
    expect(matrix).toContain('section=shop-co-matrix');
    expect(matrix).toContain('pcf=matrix');

    const inspector = shopCoMatrixEmbeddedTabHref('inspector', {
      collectionId: demo.collectionId,
      orderId: demo.demoOrderId,
      articleId: demo.demoArticleId,
    });
    expect(inspector).toContain('pcf=inspector');
    expect(inspector).toContain(`article=${encodeURIComponent(demo.demoArticleId)}`);
  });

  it('detects embedded shop CO matrix cabinet context', () => {
    expect(isShopCoMatrixEmbeddedCabinetContext('/shop/core', 'shop-co-matrix')).toBe(true);
    expect(isShopCoMatrixEmbeddedCabinetContext('/shop/core', 'shop-co-checkout')).toBe(false);
    expect(isShopCoMatrixEmbeddedCabinetContext('/shop/b2b/matrix', 'shop-co-matrix')).toBe(false);
  });
});
