import {
  buildShopDevelopmentVersionToken,
  diffShopDevelopmentProgress,
  type ShopDevelopmentProgressSnapshot,
} from '@/lib/server/shop-development-progress-server';

const baseSnapshot = (): ShopDevelopmentProgressSnapshot => ({
  collectionId: 'SS27',
  articleCount: 3,
  sampleQueueCount: 1,
  demoArticleId: 'ART-1',
  workshop2Href: '/brand/production/workshop2',
  steps: [
    { id: 'dossier_articles', labelRu: 'Артикулы (3)', done: true },
    { id: 'factory_samples', labelRu: 'Образцы (1)', done: true },
    { id: 'ready_for_collection', labelRu: 'Готово к публикации', done: false },
  ],
});

describe('shop-development-progress-server', () => {
  it('builds stable version token for same snapshot', () => {
    const a = buildShopDevelopmentVersionToken(baseSnapshot());
    const b = buildShopDevelopmentVersionToken(baseSnapshot());
    expect(a).toBe(b);
    expect(a).toHaveLength(16);
  });

  it('diffs article count and step completion', () => {
    const prev = baseSnapshot();
    const next = {
      ...baseSnapshot(),
      articleCount: 4,
      steps: baseSnapshot().steps.map((s) =>
        s.id === 'ready_for_collection' ? { ...s, done: true } : s
      ),
    };
    const changes = diffShopDevelopmentProgress(prev, next);
    expect(changes.some((c) => c.includes('Артикулов'))).toBe(true);
    expect(changes.some((c) => c.includes('Готово к публикации'))).toBe(true);
  });
});
