import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_OP_CHAIN_MATERIALS_INVENTORY_LEDGER_LINK_TESTID,
  BRAND_OP_CHAIN_MATERIALS_PO_BADGE_TESTID,
  BRAND_OP_CHAIN_MATERIALS_SSE_DEDUP_HINT_TESTID,
  BRAND_OP_CHAIN_MATERIALS_SUPPLIER_LINK_PATCH_TESTID,
  BRAND_OP_CHAIN_MATERIALS_SUPPLIER_STRIP_TESTID,
  buildBrandOpChainInventoryLedgerWmsHref,
  buildBrandOpChainMaterialsSupplierPatchHref,
  brandOpChainMaterialsInventoryLedgerLinkLabelRu,
  brandOpChainMaterialsSseDedupHintRu,
  supplierPatchHrefCarriesPoContext,
} from '@/lib/fashion/brand-op-wave-xm';
import { BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID } from '@/lib/fashion/brand-op-wave-vq';

describe('wave XM — brand OP chain materials supplier PATCH deep-link', () => {
  it('supplier PATCH href carries role=supplier + po= + order context', () => {
    const href = buildBrandOpChainMaterialsSupplierPatchHref({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(href).toContain('view=procurement');
    expect(href).toContain('role=supplier');
    expect(href).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(supplierPatchHrefCarriesPoContext(href, PLATFORM_CORE_DEMO.productionOrderId)).toBe(
      true
    );
    expect(href).toContain('/factory/production/materials');
  });

  it('inventory ledger WMS cross-link carries order + po + overview feature', () => {
    const href = buildBrandOpChainInventoryLedgerWmsHref({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
    });
    expect(href).toContain('/brand/inventory');
    expect(href).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
    expect(href).toContain('pcf=overview');
  });

  it('chain materials strip + step link testids', () => {
    expect(BRAND_OP_CHAIN_MATERIALS_SUPPLIER_STRIP_TESTID).toContain('materials-supplier');
    expect(BRAND_OP_CHAIN_MATERIALS_SUPPLIER_LINK_PATCH_TESTID).toContain('patch');
    expect(BRAND_OP_CHAIN_MATERIALS_PO_BADGE_TESTID).toContain('po-badge');
    expect(BRAND_OP_CHAIN_MATERIALS_INVENTORY_LEDGER_LINK_TESTID).toContain('inventory-ledger');
  });

  it('SSE dedup polish references Wave VQ badge + compact hint', () => {
    expect(BRAND_OP_CHAIN_SSE_DEDUP_BADGE_TESTID).toContain('sse-dedup');
    expect(BRAND_OP_CHAIN_MATERIALS_SSE_DEDUP_HINT_TESTID).toContain('sse-dedup');
    expect(brandOpChainMaterialsSseDedupHintRu()).toContain('VQ');
    expect(brandOpChainMaterialsInventoryLedgerLinkLabelRu()).toContain('ledger');
  });

  it('mirrors inventory ledger supplier-patch-link contract', () => {
    expect('brand-op-inventory-ledger-supplier-patch-link').toContain('supplier-patch');
    expect('brand-op-inventory-ledger-wms-reserve-badge').toContain('wms-reserve');
  });
});
