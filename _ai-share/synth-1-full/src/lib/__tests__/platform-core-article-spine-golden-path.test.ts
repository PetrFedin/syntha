import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import {
  articleSpineGoldenPathHrefForStep,
  buildArticleSpineGoldenPathSession,
  PLATFORM_CORE_ARTICLE_SPINE_GOLDEN_PATH_STEPS,
} from '@/lib/platform-core-article-spine-golden-path';

describe('platform-core-article-spine-golden-path', () => {
  const demo = {
    collectionId: PLATFORM_CORE_DEMO.collectionId,
    demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
    demoArticleId: PLATFORM_CORE_DEMO.demoArticleId,
    factoryId: PLATFORM_CORE_DEMO.factoryId,
    factoryHubId: PLATFORM_CORE_DEMO.factoryHubId,
    productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
  };

  it('builds native hrefs for spine strip steps', () => {
    const session = buildArticleSpineGoldenPathSession(demo);
    for (const step of PLATFORM_CORE_ARTICLE_SPINE_GOLDEN_PATH_STEPS) {
      const href = articleSpineGoldenPathHrefForStep(session, step.id);
      expect(href).toContain('/core?');
      expect(href).toContain(`section=${step.id}`);
      expect(href).not.toMatch(/\/shop\/b2b\//);
    }
    expect(articleSpineGoldenPathHrefForStep(session, 'brand-dev-dossier')).toContain(
      `article=${encodeURIComponent(demo.demoArticleId)}`
    );
  });
});
