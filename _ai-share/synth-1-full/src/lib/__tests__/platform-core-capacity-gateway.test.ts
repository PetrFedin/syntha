import { getPlatformCoreCapacityForOrder } from '@/lib/platform-core-gateways/capacity-gateway';

describe('platform-core capacity gateway', () => {
  it('rejects empty orderId', async () => {
    const result = await getPlatformCoreCapacityForOrder({ orderId: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
