'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { brandDevelopmentArticlesHubCabinetHref } from '@/lib/platform-core-cabinet-workspace';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Минимальный wayfinding досье: только возврат к списку артикулов. */
export function Workshop2ArticleCoreWayfinding({ collectionId, articleId }: Props) {
  if (!isPlatformCoreMode()) return null;

  const backHref = brandDevelopmentArticlesHubCabinetHref(
    collectionId,
    getPlatformCoreDemo(collectionId)
  );

  return (
    <div data-testid="brand-dev-dossier-panel" className="min-w-0 pb-1" data-article-id={articleId}>
      <Link
        href={backHref}
        data-testid="platform-core-workspace-back"
        className="text-text-secondary hover:text-accent-primary inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Артикулы
      </Link>
    </div>
  );
}
