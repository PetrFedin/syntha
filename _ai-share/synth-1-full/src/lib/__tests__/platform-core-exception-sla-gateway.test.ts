import { getPlatformCoreExceptionForOrder } from '@/lib/platform-core-gateways/exception-sla-gateway';

describe('platform-core exception-sla gateway', () => {
  it('rejects empty orderId', async () => {
    const result = await getPlatformCoreExceptionForOrder({ orderId: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
