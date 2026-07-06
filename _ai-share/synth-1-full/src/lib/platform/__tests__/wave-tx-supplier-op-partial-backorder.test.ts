import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import {
  parseSupplierMaterialPartialShipFields,
  supplierMaterialPartialShipJournalFields,
} from '@/lib/production/workshop2-supplier-material-partial-ship';
import {
  isWorkshop2SupplierWmsConfirmWebhookEnabled,
} from '@/lib/production/workshop2-supplier-wms-confirm-webhook';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

describe('wave TX — P2 sup-op partial ship + backorder + WMS webhook', () => {
  it('parses partialShipQty and backorderFlag aliases', () => {
    expect(parseSupplierMaterialPartialShipFields({ partialShipQty: 12, backorderFlag: true })).toEqual({
      shippedQty: 12,
      backorder: true,
    });
    expect(parseSupplierMaterialPartialShipFields({ shippedQty: 5, backorder: false })).toEqual({
      shippedQty: 5,
      backorder: false,
    });
  });

  it('writes canonical PG journal keys partialShipQty/backorderFlag', () => {
    expect(
      supplierMaterialPartialShipJournalFields({
        shippedQty: 8,
        backorder: true,
        status: 'confirmed',
      })
    ).toEqual({ partialShipQty: 8, backorderFlag: true });
  });

  it('supplier comms tail hrefs carry po= query', () => {
    const session = buildSupplierOrderCommsSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(session.brandOrderHandoffHref).toContain('po=');
    expect(session.shopTrackingHref).toContain('po=');
    expect(session.messagesHref).toContain('po=');
  });

  it('procurement handoff href carries po context', () => {
    const session = buildSupplierProcurementSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(session.handoffHref).toContain('po=');
    expect(session.shopTrackingHref).toContain('po=');
  });

  it('appendSupplierOpPoContextToHref is idempotent for po', () => {
    const href = appendSupplierOpPoContextToHref('/factory/supplier/messages?order=B2B-1', {
      orderId: 'B2B-1',
      productionOrderId: 'PO-B2B-B2B-1',
    });
    expect(href).toContain('po=PO-B2B-B2B-1');
    expect(appendSupplierOpPoContextToHref(href, { orderId: 'B2B-1' })).toBe(href);
  });

  it('WMS confirm webhook env gate', () => {
    expect(
      isWorkshop2SupplierWmsConfirmWebhookEnabled({
        WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_ENABLED: 'true',
      })
    ).toBe(true);
    expect(
      isWorkshop2SupplierWmsConfirmWebhookEnabled({
        WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_ENABLED: 'false',
      })
    ).toBe(false);
  });

  it('wave TX UI testids', () => {
    expect('sup-op-bulk-confirm-progress-strip').toContain('bulk-confirm-progress');
    expect('sup-op-backorder-badge').toContain('backorder');
    expect('/api/workshop2/supplier/wms-confirm').toContain('wms-confirm');
  });
});
