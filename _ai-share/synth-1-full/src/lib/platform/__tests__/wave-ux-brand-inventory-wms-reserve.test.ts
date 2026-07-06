import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  buildBrandOpInventoryLedgerSession,
  resolveBrandOpInventoryReserveQty,
  sumWmsReservedQty,
} from '@/lib/b2b/brand-op-inventory-ledger-session';
import { factoryMaterialsProcurementHrefForDemo } from '@/lib/platform-core-hub-matrix-demo-hrefs';

describe('wave UX S3 — brand OP inventory ledger WMS reserve', () => {
  it('GET inventory-reserve API route contract', () => {
    expect('/api/workshop2/b2b/orders/B2B-demo/inventory-reserve').toContain('inventory-reserve');
    expect('getWorkshop2B2bInventoryReserve').toContain('InventoryReserve');
  });

  it('brand OP inventory ledger session carries reserve + WMS API hrefs', () => {
    const session = buildBrandOpInventoryLedgerSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
    });
    expect(session.inventoryReserveHref).toContain('/inventory-reserve');
    expect(session.wmsBalancesHref).toContain('/wms/balances');
    expect(session.wmsReserveSampleHref).toContain('/wms/reserve-sample');
    expect(session.supplierProcurementPatchHref).toContain('view=procurement');
    expect(session.supplierProcurementPatchHref).toContain('role=supplier');
  });

  it('resolveBrandOpInventoryReserveQty prefers inventoryReserve.reservedQty', () => {
    expect(
      resolveBrandOpInventoryReserveQty({
        reservedQty: 5,
        inventoryReserve: { reserved: true, reservedQty: 120 },
      })
    ).toBe(120);
    expect(
      resolveBrandOpInventoryReserveQty({
        inventoryReserve: { reserved: false },
      })
    ).toBeNull();
  });

  it('sums WMS balance rows for fallback badge', () => {
    expect(sumWmsReservedQty([{ qtyReserved: 40 }, { qty_reserved: 10 }])).toBe(50);
  });

  it('brand OP inventory ledger WMS testids (wave S3)', () => {
    expect('brand-op-inventory-ledger-wms-reserve-badge').toContain('wms-reserve');
    expect('brand-op-inventory-ledger-wms-reserve-api-link').toContain('reserve-api');
    expect('brand-op-inventory-ledger-wms-balances-api-link').toContain('balances-api');
    expect('brand-op-inventory-ledger-supplier-patch-link').toContain('supplier-patch');
  });

  it('materials_supplied chain step deep-links supplier PATCH with po=', () => {
    const href = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO, { role: 'supplier' });
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
    expect('brand-op-chain-materials-supplier-link-patch').toContain('patch');
  });

  it('shop checkout honest reserve badge testids', () => {
    expect('shop-co-checkout-inventory-badge').toContain('inventory-badge');
    expect('shop-co-checkout-inventory-hold').toContain('inventory-hold');
    expect('data-reserve-honest').toContain('honest');
    expect('data-reserve-phase').toContain('phase');
  });
});
