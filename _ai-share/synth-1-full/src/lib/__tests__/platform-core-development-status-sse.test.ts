import { fingerprintWorkshop2DevelopmentStatus } from '@/lib/platform-core-development-status-sse';

describe('platform-core-development-status-sse', () => {
  it('fingerprint меняется при смене шагов и tier', () => {
    const base = {
      collectionId: 'SS27',
      articleCount: 1,
      sampleQueueCount: 0,
      articleIds: ['demo-ss27-01'],
      steps: [
        { id: 'dossier_articles', labelRu: 'a', done: true },
        { id: 'factory_samples', labelRu: 'b', done: false },
        { id: 'ready_for_collection', labelRu: 'c', done: false },
      ],
      rangePlanner: {
        collectionId: 'SS27',
        articleCount: 1,
        tiers: [
          {
            id: 'core' as const,
            labelRu: 'Core',
            descRu: '',
            pgSkuCount: 1,
            budget: 100,
            targetMargin: 0.4,
            planSkuCount: 2,
          },
        ],
        unassignedSkuCount: 0,
        unassignedArticles: [],
        tierArticles: { core: [{ articleId: 'demo-ss27-01' }], trend: [], novelty: [] },
        dataSource: 'pg' as const,
        tiersFromPg: true,
        budgetFromPg: true,
      },
    };
    const fp1 = fingerprintWorkshop2DevelopmentStatus(base);
    const fp2 = fingerprintWorkshop2DevelopmentStatus({
      ...base,
      sampleQueueCount: 1,
      steps: base.steps.map((s) => (s.id === 'factory_samples' ? { ...s, done: true } : s)),
    });
    expect(fp1).not.toBe(fp2);
  });
});
