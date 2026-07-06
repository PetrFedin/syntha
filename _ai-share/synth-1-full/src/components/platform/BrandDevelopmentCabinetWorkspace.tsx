'use client';

import dynamic from 'next/dynamic';
import { Workshop2LocalStateProvider } from '@/app/brand/production/workshop2/workshop2-local-state-provider';
import { BRAND_DEV_W2_HUB_SECTION } from '@/lib/platform-core-cabinet-workspace';

const Workshop2HubCorePage = dynamic(
  () =>
    import('@/app/brand/production/workshop2/workshop2-hub-core').then((m) => ({
      default: m.Workshop2HubCorePage,
    })),
  { ssr: false }
);

const BrandDevelopmentArticleWorkspace = dynamic(
  () =>
    import('@/components/platform/BrandDevelopmentArticleWorkspace').then((m) => ({
      default: m.BrandDevelopmentArticleWorkspace,
    })),
  { ssr: false }
);

type Props = {
  collectionId: string;
  articleId?: string | null;
  sectionId?: string | null;
};

/**
 * Столп development в brand core: список артикулов или досье артикула.
 * Столпы — segmented nav в шапке; без бокового списка «Разделы».
 */
export function BrandDevelopmentCabinetWorkspace({
  collectionId,
  articleId,
  sectionId,
}: Props) {
  const article = articleId?.trim() || null;
  const section = sectionId?.trim();
  const showArticle =
    Boolean(article && !article.startsWith('__')) &&
    (!section || section !== BRAND_DEV_W2_HUB_SECTION);

  return (
    <Workshop2LocalStateProvider>
      <div data-testid="brand-development-cabinet-workspace" className="min-w-0 w-full max-w-none">
        {showArticle && article ? (
          <BrandDevelopmentArticleWorkspace collectionId={collectionId} articleId={article} />
        ) : (
          <Workshop2HubCorePage embedded />
        )}
      </div>
    </Workshop2LocalStateProvider>
  );
}
