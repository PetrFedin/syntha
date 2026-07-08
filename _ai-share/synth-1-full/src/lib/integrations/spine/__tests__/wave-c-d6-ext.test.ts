import {
  createInitialWorkingOrderVersion,
  exportWholesaleOrderAfterConfirm,
  getWholesaleExport,
} from '../wholesale-export.service';
import { importWholesaleOrder } from '../order-import.service';
import {
  importApparelMagicVendorPo,
  acknowledgeApparelMagicVendorPo,
} from '../apparel-magic-vendor-po.service';
import { importCentricRfq, acknowledgeCentricRfq } from '../centric-rfq-import.service';
import { getVendorPoByOrderId } from '../vendor-po-persistence.file';
import { getCentricRfqById } from '../centric-rfq-persistence.file';
import { importZedonkConsolidatedOrder } from '../zedonk-consolidated-import.service';

describe('wave-c-d6-ext', () => {
  it('confirm flow creates export + working order for JOOR', async () => {
    const extId = `joor-export-${Date.now()}`;
    const outcome = importWholesaleOrder({
      platform: 'joor',
      externalOrderId: extId,
      raw: {
        id: extId,
        status: 'approved',
        customer_name: 'Export Shop',
        lines: [{ sku: 'SS27-M-COAT-01', quantity: 5, unit_price: 100 }],
      },
    });
    createInitialWorkingOrderVersion(
      outcome.wholesaleOrderId,
      [{ productId: 'SS27-M-COAT-01', quantity: 5, size: 'M' }],
      'joor'
    );
    const exp = await exportWholesaleOrderAfterConfirm(outcome.wholesaleOrderId);
    expect(exp?.platform).toBe('joor');
    expect(getWholesaleExport(outcome.wholesaleOrderId)?.externalExportId).toMatch(/^EXP-/);
  });

  it('AM vendor PO import and ack', async () => {
    const rec = await importApparelMagicVendorPo({
      b2bOrderId: 'INT-JOOR-VPO-TEST',
      productionOrderId: 'PO-B2B-TEST',
    });
    expect(rec.status).toBe('open');
    const acked = await acknowledgeApparelMagicVendorPo({ vendorPoId: rec.vendorPoId });
    expect(acked?.status).toBe('acknowledged');
    expect(getVendorPoByOrderId('INT-JOOR-VPO-TEST')?.lines[0]?.ackQty).toBeGreaterThan(0);
  });

  it('Centric RFQ import and ack with PG write-through path', async () => {
    const rfqId = `RFQ-TEST-${Date.now()}`;
    const rec = await importCentricRfq({
      rfqId,
      styleId: rfqId,
      collectionId: 'SS27',
      articleId: 'ART-RFQ-TEST',
      b2bOrderId: 'INT-JOOR-RFQ-TEST',
    });
    expect(rec.status).toBe('open');
    const quoted = await acknowledgeCentricRfq({ rfqId, status: 'quoted' });
    expect(quoted?.status).toBe('quoted');
    const awarded = await acknowledgeCentricRfq({ rfqId, status: 'awarded' });
    expect(awarded?.status).toBe('awarded');
    expect(getCentricRfqById(rfqId)?.status).toBe('awarded');
  });

  it('zedonk consolidated imports multiple INT orders', () => {
    const result = importZedonkConsolidatedOrder({
      consolidatedId: 'CONS-1',
      brandOrders: [
        { brandId: 'B1', orderId: 'z-child-1' },
        { brandId: 'B2', orderId: 'z-child-2' },
      ],
    });
    expect(result.imported).toHaveLength(2);
    expect(result.imported[0]?.wholesaleOrderId).toMatch(/^INT-ZEDONK-/);
  });

  it('force re-export creates new export id', async () => {
    const extId = `joor-reexp-${Date.now()}`;
    const outcome = importWholesaleOrder({
      platform: 'joor',
      externalOrderId: extId,
      raw: {
        id: extId,
        status: 'approved',
        customer_name: 'Reexport Shop',
        lines: [{ sku: 'SS27-M-COAT-01', quantity: 2, unit_price: 100 }],
      },
    });
    const first = await exportWholesaleOrderAfterConfirm(outcome.wholesaleOrderId);
    const second = await exportWholesaleOrderAfterConfirm(outcome.wholesaleOrderId, undefined, {
      force: true,
    });
    expect(first?.externalExportId).not.toBe(second?.externalExportId);
  });
});
