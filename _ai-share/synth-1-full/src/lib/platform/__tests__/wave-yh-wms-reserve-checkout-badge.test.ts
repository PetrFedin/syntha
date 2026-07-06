import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  brandOpChainMaterialsInventoryLedgerReserveLinkLabelRu,
  brandOpChainMaterialsSuppliedPatchHintRu,
  brandOpChainMaterialsSuppliedPatchLinkLabelRu,
  buildShopCheckoutInventoryReserveProbeHref,
  buildShopCheckoutWmsBalancesHref,
  buildWaveYhBrandInventoryLedgerSession,
  buildWaveYhShopCheckoutInventoryOpsSession,
  buildWaveYhSupplierProcurementPatchHref,
  formatBrandInventoryLedgerReserveQtyCrossLinkRu,
  formatShopCheckoutWmsReserveLiveBadgeRu,
  formatShopCheckoutWmsReserveLiveDetailRu,
  sumShopCheckoutWmsReservedFromAtpRows,
  supplierPatchHrefCarriesMaterialsSuppliedContext,
  WAVE_YH_BRAND_CHAIN_MATERIALS_PATCH_CHAIN_HINT_TESTID,
  WAVE_YH_BRAND_CHAIN_MATERIALS_SUPPLIED_STEP,
  WAVE_YH_BRAND_INVENTORY_LEDGER_RESERVE_QTY_LINK_TESTID,
  WAVE_YH_CHECKOUT_WMS_RESERVE_PHASE_PRE_HANDOFF,
  WAVE_YH_SHOP_CO_CHECKOUT_INVENTORY_BADGE_TESTID,
  WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_LIVE_BADGE_TESTID,
  WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_QTY_LINK_TESTID,
} from '@/lib/platform/wave-yh-wms-reserve-checkout';

describe('wave YH — S3 WMS inventory reserve checkout + brand ledger', () => {
  it('sums reserved qty from checkout stock-atp rows (live WMS, not stub)', () => {
    expect(
      sumShopCheckoutWmsReservedFromAtpRows([
        { sku: 'A', reserved: 40, atp: 10 },
        { sku: 'B', reserved: 5, atp: 0 },
        { sku: 'C', reserved: 0, atp: 20 },
      ])
    ).toBe(45);
  });

  it('formats live WMS reserve badge with reserved qty priority over ATP', () => {
    expect(
      formatShopCheckoutWmsReserveLiveBadgeRu({
        loading: false,
        liveWms: true,
        reservedQty: 120,
        atpTotal: 80,
      })
    ).toBe('WMS резерв 120 ед.');
    expect(
      formatShopCheckoutWmsReserveLiveBadgeRu({
        loading: false,
        liveWms: true,
        reservedQty: 0,
        atpTotal: 50,
      })
    ).toBe('Доступно 50 ед.');
    expect(
      formatShopCheckoutWmsReserveLiveBadgeRu({
        loading: true,
        liveWms: false,
        reservedQty: 0,
        atpTotal: 0,
      })
    ).toBe('Склад · проверка…');
  });

  it('formats live detail line for checkout honest copy', () => {
    expect(
      formatShopCheckoutWmsReserveLiveDetailRu({
        liveWms: true,
        reservedQty: 30,
        atpTotal: 12,
      })
    ).toContain('резерв WMS');
    expect(
      formatShopCheckoutWmsReserveLiveDetailRu({
        liveWms: false,
        reservedQty: 0,
        atpTotal: 0,
      })
    ).toBeNull();
  });

  it('shop checkout WMS probe hrefs + testids (extends wave VE/UX)', () => {
    expect(buildShopCheckoutWmsBalancesHref('SS27')).toContain('/wms/balances');
    expect(buildShopCheckoutInventoryReserveProbeHref(PLATFORM_CORE_DEMO.demoOrderId)).toContain(
      'inventory-reserve'
    );
    expect(WAVE_YH_SHOP_CO_CHECKOUT_INVENTORY_BADGE_TESTID).toContain('inventory-badge');
    expect(WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_LIVE_BADGE_TESTID).toContain('live-badge');
    expect(WAVE_YH_SHOP_CO_CHECKOUT_WMS_RESERVE_QTY_LINK_TESTID).toContain('reserve-qty');
    expect(WAVE_YH_CHECKOUT_WMS_RESERVE_PHASE_PRE_HANDOFF).toBe('pre-handoff');
  });

  it('brand ledger session + reserve qty cross-link (wave UX/S3)', () => {
    const session = buildWaveYhBrandInventoryLedgerSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
    });
    expect(session.inventoryReserveHref).toContain('/inventory-reserve');
    expect(session.wmsBalancesHref).toContain('/wms/balances');
    expect(formatBrandInventoryLedgerReserveQtyCrossLinkRu(88)).toContain('88');
    expect(WAVE_YH_BRAND_INVENTORY_LEDGER_RESERVE_QTY_LINK_TESTID).toContain('reserve-qty');
  });

  it('shop checkout inventory ops session carries replenishment ATP href', () => {
    const ops = buildWaveYhShopCheckoutInventoryOpsSession(PLATFORM_CORE_DEMO.collectionId);
    expect(ops.replenishmentAtpHref).toContain('stock-atp');
    expect(ops.orderCommsHref).toContain('tracking');
  });

  it('supplier materials_supplied PATCH chain polish (wave SQ/TX/XM)', () => {
    const href = buildWaveYhSupplierProcurementPatchHref({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(href).toContain('view=procurement');
    expect(href).toContain('role=supplier');
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
    expect(supplierPatchHrefCarriesMaterialsSuppliedContext(href)).toBe(true);
    expect(WAVE_YH_BRAND_CHAIN_MATERIALS_SUPPLIED_STEP).toBe('materials_supplied');
    expect(WAVE_YH_BRAND_CHAIN_MATERIALS_PATCH_CHAIN_HINT_TESTID).toContain('patch-hint');
    expect(brandOpChainMaterialsSuppliedPatchHintRu(false)).toMatch(/materials_supplied/i);
    expect(brandOpChainMaterialsSuppliedPatchLinkLabelRu(false)).toContain('PATCH');
    expect(brandOpChainMaterialsInventoryLedgerReserveLinkLabelRu(42)).toContain('42');
  });
});
