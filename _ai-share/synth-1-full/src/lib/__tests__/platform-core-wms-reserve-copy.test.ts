import { formatShopB2bTrackingReserveLabelRu } from '@/lib/platform-core-tracking-reserve-label';
import {
  PLATFORM_CORE_WMS_RESERVE_BEFORE_HANDOFF_RU,
  PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU,
  PLATFORM_CORE_WMS_RESERVE_DISABLED_RU,
  PLATFORM_CORE_WMS_RESERVE_PENDING_AFTER_HANDOFF_RU,
  PLATFORM_CORE_WMS_RESERVE_SUPPLIER_PROCUREMENT_RU,
  formatPlatformCoreWmsReserveBrandBadgeRu,
  formatPlatformCoreWmsReserveCabinetLongRu,
  formatPlatformCoreWmsReserveDoneWithQtyRu,
  formatPlatformCoreWmsCheckoutAtpBadgeRu,
  formatPlatformCoreWmsStockAtpSourceRu,
} from '@/lib/platform-core-wms-reserve-copy';

describe('platform-core-wms-reserve-copy', () => {
  it('checkout copy совпадает с tracking до handoff', () => {
    const tracking = formatShopB2bTrackingReserveLabelRu({
      status: 'pending',
      handedOff: false,
      inventoryReserved: false,
    });
    expect(PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU).toBe(tracking.text);
  });

  it('supplier pending — заявка в PG', () => {
    expect(formatPlatformCoreWmsReserveCabinetLongRu(false, 'supplier')).toContain('PG');
  });

  it('brand badge короткий', () => {
    expect(formatPlatformCoreWmsReserveBrandBadgeRu(true)).toBe('WMS ✓');
    expect(formatPlatformCoreWmsReserveBrandBadgeRu(false)).toBe('WMS…');
  });

  it('done qty форматируется единообразно', () => {
    expect(formatPlatformCoreWmsReserveDoneWithQtyRu(42)).toContain('42');
  });

  it('supplier procurement copy честный про checkout path', () => {
    expect(PLATFORM_CORE_WMS_RESERVE_SUPPLIER_PROCUREMENT_RU).toContain('handoff');
  });

  it('константы pending/disabled не пустые', () => {
    expect(PLATFORM_CORE_WMS_RESERVE_PENDING_AFTER_HANDOFF_RU.length).toBeGreaterThan(10);
    expect(PLATFORM_CORE_WMS_RESERVE_DISABLED_RU).toContain('WMS');
  });

  it('checkout ATP badge + source RU (wave VE)', () => {
    expect(formatPlatformCoreWmsCheckoutAtpBadgeRu({ loading: false, liveWms: true, atpTotal: 12 })).toContain(
      '12'
    );
    expect(formatPlatformCoreWmsStockAtpSourceRu('wms')).toBe('WMS');
    expect(formatPlatformCoreWmsStockAtpSourceRu('pg+wms')).toContain('PG');
  });
});
