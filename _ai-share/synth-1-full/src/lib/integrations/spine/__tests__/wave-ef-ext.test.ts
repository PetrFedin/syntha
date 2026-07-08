import { importWholesaleOrder } from '../order-import.service';
import {
  generateCollectionLinesheet,
  getCollectionLinesheetSnapshot,
} from '../linesheet-gen.service';
import { importNuOrderShipmentInbound } from '../nuorder-shipment-inbound.service';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

describe('wave-ef-ext', () => {
  it('linesheet gen persists and can be read back', async () => {
    const gen = await generateCollectionLinesheet(PLATFORM_CORE_DEMO.collectionId);
    expect(gen.linesheetId).toMatch(/^LS-/);
    expect(gen.articleCount).toBeGreaterThanOrEqual(0);

    const snap = getCollectionLinesheetSnapshot(PLATFORM_CORE_DEMO.collectionId);
    expect(snap?.linesheetId).toBe(gen.linesheetId);
  });

  it('nuorder inbound shipment import mirrors tracking', async () => {
    const extId = `nu-inbound-${Date.now()}`;
    const outcome = importWholesaleOrder({
      platform: 'nuorder',
      externalOrderId: extId,
      raw: {
        id: extId,
        status: 'approved',
        customer_name: 'Inbound Shop',
        lines: [{ sku: 'SS27-M-COAT-01', quantity: 4, unit_price: 100 }],
      },
    });

    const result = await importNuOrderShipmentInbound({
      wholesaleOrderId: outcome.wholesaleOrderId,
      shipment: {
        trackingNumber: 'SYN-IN-001',
        carrier: 'Carrier',
        status: 'in_transit',
      },
    });
    expect(result?.source).toBe('webhook');
    expect(result?.shipment.trackingNumber).toBe('SYN-IN-001');
    expect(result?.shipment.platform).toBe('nuorder');
  });
});
