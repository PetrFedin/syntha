import { buildWorkshop2SupplierBulkConfirmIdempotencyKey } from '@/lib/production/workshop2-supplier-bulk-confirm-idempotency';
import {
  parseSupplierMaterialPartialShipFields,
  supplierMaterialPartialShipJournalFields,
} from '@/lib/production/workshop2-supplier-material-partial-ship';
import { isWorkshop2SupplierWmsConfirmWebhookEnabled } from '@/lib/production/workshop2-supplier-wms-confirm-webhook';
import {
  WAVE_WI_SUP_BULK_CONFIRM_API,
  WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_RU,
  WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_TESTID,
  WAVE_WI_SUP_PARTIAL_SHIP_CONFIRM_BTN_RU,
  WAVE_WI_SUP_PARTIAL_SHIP_PG_MIGRATION,
  WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID,
  WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API,
  formatWaveWiSupBackorderBadgeRu,
} from '@/lib/platform/wave-wi-supplier-partial-ship';
import {
  peekWorkshop2SupplierBulkConfirmIdempotency,
  rememberWorkshop2SupplierBulkConfirmIdempotency,
  resetWorkshop2SupplierBulkConfirmIdempotencyForTests,
} from '@/lib/server/workshop2-supplier-material-request-confirm';

describe('wave WI — sup-op partial ship + backorder PG + bulk-confirm dedup', () => {
  afterEach(() => {
    resetWorkshop2SupplierBulkConfirmIdempotencyForTests();
  });

  it('parses partialShipQty/backorderFlag for PATCH and bulk-confirm', () => {
    expect(
      parseSupplierMaterialPartialShipFields({ partialShipQty: 4, backorderFlag: true })
    ).toEqual({
      shippedQty: 4,
      backorder: true,
    });
  });

  it('writes PG journal aliases partialShipQty/backorderFlag', () => {
    expect(
      supplierMaterialPartialShipJournalFields({
        shippedQty: 6,
        backorder: true,
        status: 'confirmed',
      })
    ).toEqual({ partialShipQty: 6, backorderFlag: true });
  });

  it('bulk-confirm idempotency key is stable and mode-aware', () => {
    const confirmKey = buildWorkshop2SupplierBulkConfirmIdempotencyKey({
      b2bOrderId: 'B2B-1',
      collectionId: 'SS27',
      articleId: 'demo-01',
      productionOrderId: 'PO-1',
      partialShipQty: 3,
      backorderFlag: true,
    });
    const notifyKey = buildWorkshop2SupplierBulkConfirmIdempotencyKey({
      b2bOrderId: 'B2B-1',
      collectionId: 'SS27',
      articleId: 'demo-01',
      productionOrderId: 'PO-1',
      notifyOnly: true,
    });
    expect(confirmKey).toContain('sup-bulk-confirm:confirm');
    expect(notifyKey).toContain('sup-bulk-confirm:notify');
    expect(confirmKey).toBe(
      buildWorkshop2SupplierBulkConfirmIdempotencyKey({
        b2bOrderId: 'B2B-1',
        collectionId: 'SS27',
        articleId: 'demo-01',
        productionOrderId: 'PO-1',
        partialShipQty: 3,
        backorderFlag: true,
      })
    );
  });

  it('server bulk-confirm idempotency cache replays response', () => {
    const key = 'sup-bulk-confirm:test';
    rememberWorkshop2SupplierBulkConfirmIdempotency(key, {
      ok: true,
      confirmed: 2,
      idempotent: 0,
      created: 0,
      requisitionIds: ['r1'],
      messageRu: 'ok',
      partialShipQty: 2,
      backorderFlag: true,
    });
    expect(peekWorkshop2SupplierBulkConfirmIdempotency(key)?.confirmed).toBe(2);
  });

  it('wave WI PG migration + UX testids + RU labels', () => {
    expect(WAVE_WI_SUP_PARTIAL_SHIP_PG_MIGRATION).toContain('wave_wi');
    expect(WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID).toContain('partial-ship');
    expect(WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_TESTID).toContain('dedup');
    expect(WAVE_WI_SUP_BULK_CONFIRM_DEDUP_HINT_RU).toMatch(/без дубля bulk-confirm/i);
    expect(WAVE_WI_SUP_PARTIAL_SHIP_CONFIRM_BTN_RU).toMatch(/Подтвердить отгрузку/i);
    expect(formatWaveWiSupBackorderBadgeRu(2, 5)).toBe('Backorder · 2/5');
  });

  it('WMS confirm webhook route + chain bump handler', () => {
    expect(WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API).toContain('wms-confirm');
    expect(WAVE_WI_SUP_BULK_CONFIRM_API).toContain('bulk-confirm');
    expect('handleWorkshop2SupplierWmsConfirmWebhook').toContain('WmsConfirm');
    expect(
      isWorkshop2SupplierWmsConfirmWebhookEnabled({
        WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_ENABLED: 'true',
      })
    ).toBe(true);
  });
});
