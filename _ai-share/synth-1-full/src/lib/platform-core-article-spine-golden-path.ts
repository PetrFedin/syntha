/**
 * Wave 6 · Article Spine golden strip — native `/…/core` hrefs из golden-cross-role-path.
 * UI: brand W2 hub → dossier → linesheets → shop matrix (без legacy B2B).
 */
import {
  PLATFORM_CORE_DEMO,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-demo-context';
import { buildPlatformCoreGoldenCrossRoleStops } from '@/lib/platform-core-golden-cross-role-path';

/** Шаги strip на экранах brand dev / sample_collection (embedded hub). */
export type ArticleSpineGoldenStepId =
  | 'brand-dev-w2-hub'
  | 'brand-dev-dossier'
  | 'brand-sc-linesheets'
  | 'shop-co-matrix';

export const PLATFORM_CORE_ARTICLE_SPINE_GOLDEN_PATH_STEPS: ReadonlyArray<{
  id: ArticleSpineGoldenStepId;
  labelRu: string;
  linkTestId: string;
}> = [
  {
    id: 'brand-dev-w2-hub',
    labelRu: 'Артикулы',
    linkTestId: 'article-spine-golden-w2-hub-link',
  },
  {
    id: 'brand-dev-dossier',
    labelRu: 'Досье · ТЗ',
    linkTestId: 'article-spine-golden-dossier-link',
  },
  {
    id: 'brand-sc-linesheets',
    labelRu: 'Лайншиты',
    linkTestId: 'article-spine-golden-linesheets-link',
  },
  {
    id: 'shop-co-matrix',
    labelRu: 'Матрица · магазин',
    linkTestId: 'article-spine-golden-shop-matrix-link',
  },
] as const;

export type ArticleSpineGoldenPathSession = {
  demo: PlatformCoreDemoContext;
  hrefByStep: Readonly<Partial<Record<ArticleSpineGoldenStepId, string>>>;
};

export function buildArticleSpineGoldenPathSession(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): ArticleSpineGoldenPathSession {
  const stops = buildPlatformCoreGoldenCrossRoleStops(demo);
  const hrefByStep: Partial<Record<ArticleSpineGoldenStepId, string>> = {};
  for (const step of PLATFORM_CORE_ARTICLE_SPINE_GOLDEN_PATH_STEPS) {
    const stop = stops.find((s) => s.sectionId === step.id);
    if (stop) hrefByStep[step.id] = stop.href;
  }
  return { demo, hrefByStep };
}

export function articleSpineGoldenPathHrefForStep(
  session: ArticleSpineGoldenPathSession,
  stepId: ArticleSpineGoldenStepId
): string {
  return session.hrefByStep[stepId] ?? '';
}

/** Три шага hub overview (/platform) — те же section, что в spine. */
export const PLATFORM_CORE_HUB_CHAIN_SPINE_STEPS: ReadonlyArray<{
  stepId: ArticleSpineGoldenStepId;
  labelRu: string;
  chainTestId: string;
}> = [
  { stepId: 'brand-dev-w2-hub', labelRu: 'Артикулы', chainTestId: 'development' },
  { stepId: 'brand-sc-linesheets', labelRu: 'Коллекция', chainTestId: 'sample_collection' },
  { stepId: 'shop-co-matrix', labelRu: 'Оптовый заказ', chainTestId: 'collection_order' },
] as const;
