import {
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemoByOrderId,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';

describe('wave TD — brand OP chain materials supplier PATCH deep-link', () => {
  it('supplier procurement href carries role=supplier + PATCH context', () => {
    const href = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO, { role: 'supplier' });
    expect(href).toContain('view=procurement');
    expect(href).toContain('role=supplier');
    expect(href).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
  });

  it('brand OP chain materials supplier strip testids', () => {
    expect('brand-op-chain-materials-supplier-strip').toContain('materials-supplier');
    expect('brand-op-chain-materials-supplier-link-patch').toContain('supplier-link');
    expect('brand-op-chain-materials-supplier-link-done').toContain('supplier-link');
    expect('brand-op-chain-materials-po-badge').toContain('po-badge');
  });

  it('demo order resolves procurement href for chain card', () => {
    const demo = getPlatformCoreDemoByOrderId(PLATFORM_CORE_DEMO.demoOrderId);
    const href = factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' });
    expect(href).toContain('/factory/production/materials');
    expect(href).toContain('collection=');
  });

  it('mirrors sup-op-chain-procurement-link pattern', () => {
    expect('sup-op-chain-procurement-link').toContain('procurement');
    expect('brand-op-chain-materials-supplier-link-patch').toContain('patch');
  });
});
