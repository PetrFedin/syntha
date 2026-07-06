import { getPlatformCoreDocumentsForArticle } from '@/lib/platform-core-gateways/documents-gateway';

describe('platform-core documents gateway', () => {
  it('rejects empty path', async () => {
    const result = await getPlatformCoreDocumentsForArticle({ collectionId: '', articleId: 'a1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid_path');
  });
});
