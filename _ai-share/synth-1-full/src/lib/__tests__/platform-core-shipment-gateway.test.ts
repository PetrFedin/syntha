import { getPlatformCoreShipmentForOrder } from '@/lib/platform-core-gateways/shipment-gateway';

describe('platform-core shipment gateway', () => {
  it('rejects empty orderId', async () => {
    const result = await getPlatformCoreShipmentForOrder({ orderId: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
