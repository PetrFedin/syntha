import {
  getPlatformCoreCommsForArticle,
  getPlatformCoreCommsForOrder,
} from '@/lib/platform-core-gateways/entity-comms-gateway';

describe('platform-core entity-comms gateway', () => {
  it('rejects empty article path', async () => {
    const result = await getPlatformCoreCommsForArticle({ collectionId: '', articleId: 'a1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });

  it('rejects empty orderId', async () => {
    const result = await getPlatformCoreCommsForOrder({ orderId: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
