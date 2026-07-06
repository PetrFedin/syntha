import { getPlatformCoreDppForArticle } from '@/lib/platform-core-gateways/dpp-gateway';

describe('platform-core dpp gateway', () => {
  it('rejects empty path', async () => {
    const result = await getPlatformCoreDppForArticle({ collectionId: '', articleId: 'a1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
