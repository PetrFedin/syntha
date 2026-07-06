import {
  WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_RU,
  WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_TESTID,
  WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_LINK_TESTID,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_LABEL_RU,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID,
  WAVE_WP_SUP_MATERIALS_PATCH_API,
  WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_WP_SUP_PROCUREMENT_CHAIN_TITLE_RU,
  buildSupOpBrandInventoryLedgerPeerHref,
} from '@/lib/platform/wave-wp-sup-bom-po-progress';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

describe('wave WP — sup-op BOM×PO progress + brand push on PATCH', () => {
  it('BOM×PO progress + bulk-confirm dedup testids', () => {
    expect(WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID).toBe('sup-op-bom-po-progress');
    expect(WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_TESTID).toContain('dedup-hint');
    expect(WAVE_WP_SUP_BOM_PO_BULK_CONFIRM_DEDUP_HINT_RU).toMatch(/без дубля bulk-confirm/i);
    expect('sup-op-bulk-confirm-progress-strip').toContain('bulk-confirm-progress');
    expect('SupplierBulkConfirmProgressStrip').toContain('ProgressStrip');
  });

  it('procurement chain steps strip RU + testid', () => {
    expect(WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID).toBe('sup-op-procurement-chain-steps');
    expect(WAVE_WP_SUP_PROCUREMENT_CHAIN_TITLE_RU).toMatch(/Этапы цепочки/i);
    expect('SupOpProcurementChainStepsStrip').toContain('ChainStepsStrip');
  });

  it('brand inventory ledger peer href from supplier procurement', () => {
    const href = buildSupOpBrandInventoryLedgerPeerHref({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(href).toContain('/brand/inventory');
    expect(href).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(href).toContain(`collection=${encodeURIComponent(PLATFORM_CORE_DEMO.collectionId)}`);
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
  });

  it('cross-link peer strip testids', () => {
    expect(WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID).toContain('inventory-ledger-peer');
    expect(WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_LINK_TESTID).toContain('inventory-ledger-link');
    expect(WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_LABEL_RU).toMatch(/ledger/i);
    expect('brand-op-inventory-ledger-supplier-patch-link').toContain('supplier-patch');
  });

  it('materials PATCH API + notification_events push', () => {
    expect(WAVE_WP_SUP_MATERIALS_PATCH_API).toContain('/material-request');
    expect('recordPlatformCoreChainNotificationEvents').toContain('ChainNotification');
    expect('pushSupplierMaterialsBrandNotify').toContain('BrandNotify');
    expect('skipBrandPush').toContain('BrandPush');
  });
});
