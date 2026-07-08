import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  buildBrandOpInventoryLedgerSession,
  sumWmsReservedQty,
} from '@/lib/b2b/brand-op-inventory-ledger-session';
import {
  buildProductionOrderCutTicketStub,
  summarizeProductionOrderCutTicketRu,
} from '@/lib/production/brand-op-production-order-cut-ticket';
import { factoryMaterialsProcurementHrefForDemo } from '@/lib/platform-core-hub-matrix-demo-hrefs';
import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';

describe('wave UG — brand OP cut ticket PG + inventory ledger WMS', () => {
  it('production order cut_ticket PATCH API route', () => {
    expect('/api/workshop2/manufacturer/production-orders/').toContain('production-orders');
    expect('/api/workshop2/manufacturer/production-orders/[poId]/cut-ticket').toContain(
      'cut-ticket'
    );
  });

  it('builds cut_ticket stub for PO mirror', () => {
    const stub = buildProductionOrderCutTicketStub({
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      b2bOrderId: PLATFORM_CORE_DEMO.demoOrderId,
      qty: 480,
      brandStatus: 'ready',
      ticketNo: 'CT-SS27-001',
    });
    expect(stub.ticketNo).toBe('CT-SS27-001');
    expect(stub.statusLabelRu).toContain('Готова');
    expect(summarizeProductionOrderCutTicketRu(stub)).toContain('CT-SS27-001');
  });

  it('brand OP inventory ledger session carries WMS + supplier PATCH hrefs', () => {
    const session = buildBrandOpInventoryLedgerSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
    });
    expect(session.inventoryReserveHref).toContain('/inventory-reserve');
    expect(session.wmsBalancesHref).toContain('/wms/balances');
    expect(session.supplierProcurementPatchHref).toContain('view=procurement');
    expect(session.supplierProcurementPatchHref).toContain('role=supplier');
    expect(session.supplierProcurementPatchHref).toContain('po=');
  });

  it('sums WMS reserved qty from balance rows', () => {
    expect(sumWmsReservedQty([{ qtyReserved: 12 }, { qty_reserved: 8 }])).toBe(20);
  });

  it('brand OP inventory ledger strip testids', () => {
    expect('brand-op-inventory-ledger-strip').toContain('inventory-ledger');
    expect('brand-op-inventory-ledger-wms-reserve-badge').toContain('wms-reserve');
    expect('brand-op-inventory-ledger-wms-reserve-api-link').toContain('reserve-api');
    expect('brand-op-inventory-ledger-supplier-patch-link').toContain('supplier-patch');
  });

  it('brand dossier factory diff panel wires attach TZ PO link', () => {
    const session = buildBrandOpAttachTzPoSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(session.attachTzPoHref).toContain('#w2-tz-export');
    expect('brand-op-attach-tz-po-link').toContain('attach-tz-po');
    expect('brand-dossier-factory-diff-match-badge').toContain('match');
  });

  it('brand OP chain materials supplier strip carries po context', () => {
    const href = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO, { role: 'supplier' });
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
    expect('brand-op-chain-materials-supplier-link-patch').toContain('patch');
    expect('brand-op-chain-materials-po-badge').toContain('po-badge');
  });

  it('migration 062 adds production_orders cut_ticket column', () => {
    expect('062_wave_ug_production_order_cut_ticket.sql').toContain('cut_ticket');
    expect('workshop2_purchase_orders').toContain('purchase_orders');
  });
});
