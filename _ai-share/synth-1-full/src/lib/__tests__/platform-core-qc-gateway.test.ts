import { getPlatformCoreQcForArticle } from '@/lib/platform-core-gateways/qc-gateway';

describe('platform-core qc gateway', () => {
  it('rejects empty path', async () => {
    const result = await getPlatformCoreQcForArticle({ collectionId: '', articleId: 'a1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
