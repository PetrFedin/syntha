import { getPlatformCoreRfqForArticle } from '@/lib/platform-core-gateways/rfq-gateway';

describe('platform-core rfq gateway', () => {
  it('buildPlatformCoreRfq rejects empty path', async () => {
    const result = await getPlatformCoreRfqForArticle({ collectionId: '', articleId: 'a1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
