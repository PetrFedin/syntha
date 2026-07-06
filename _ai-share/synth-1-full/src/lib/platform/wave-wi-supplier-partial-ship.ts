/**
 * Wave WI — supplier partial ship qty + backorder + bulk-confirm dedup + WMS webhook (RU copy + testids).
 */

export const WAVE_WI_SUP_PARTIAL_SHIP_PG_MIGRATION = '064_wave_wi_supplier_partial_ship_pg';

export const WAVE_WI_SUP_PARTIAL_SHIP_PATCH_API = '/api/workshop2/supplier/material-request';
export const WAVE_WI_SUP_BULK_CONFIRM_API = '/api/workshop2/supplier/material-request/bulk-confirm';
export const WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API = '/api/workshop2/supplier/wms-confirm';

export const WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID = 'sup-op-partial-ship-confirm-strip';
export const WAVE_WI_SUP_PARTIAL_SHIP_HOST_TESTID = 'sup-op-procurement-partial-ship-host';
export const WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_TESTID = 'sup-op-procurement-bulk-confirm-dedup-hint';
export const WAVE_WI_SUP_BACKORDER_BADGE_TESTID = 'sup-op-backorder-badge';

export const WAVE_WI_SUP_PARTIAL_SHIP_TITLE_RU = 'Частичная отгрузка';
export const WAVE_WI_SUP_PARTIAL_SHIP_QTY_LABEL_RU = 'Отгружено, ед.';
export const WAVE_WI_SUP_PARTIAL_SHIP_BACKORDER_LABEL_RU = 'Остаток · backorder';
export const WAVE_WI_SUP_PARTIAL_SHIP_CONFIRM_BTN_RU = 'Подтвердить отгрузку';
export const WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_RU =
  'Полная отгрузка — через поле «Отгружено» выше (без дубля bulk-confirm).';
export const WAVE_WI_SUP_BACKORDER_BADGE_RU = 'Backorder';

export function formatWaveWiSupBackorderBadgeRu(partialShipQty?: number, requestedQty?: number): string {
  if (partialShipQty != null && requestedQty != null && partialShipQty < requestedQty) {
    return `${WAVE_WI_SUP_BACKORDER_BADGE_RU} · ${partialShipQty}/${requestedQty}`;
  }
  if (partialShipQty != null) {
    return `${WAVE_WI_SUP_BACKORDER_BADGE_RU} · ${partialShipQty} ед.`;
  }
  return WAVE_WI_SUP_BACKORDER_BADGE_RU;
}
