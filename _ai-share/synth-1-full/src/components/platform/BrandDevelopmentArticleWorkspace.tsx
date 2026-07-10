'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Workshop2ArticleCoreWayfinding } from '@/app/brand/production/workshop2/(w2-enterprise)/c/[collectionId]/a/[articleId]/workshop2-article-core-wayfinding';
import { Workshop2ArticleWorkspace } from '@/components/brand/production/Workshop2ArticleWorkspace';
import { Workshop2BackendStatusBanner } from '@/components/brand/production/Workshop2BackendStatusBanner';
import { useWorkshop2LocalState } from '@/app/brand/production/workshop2/workshop2-local-state-provider';
import { PlatformCoreArticleSpineGoldenPathStrip } from '@/components/platform/peers/PlatformCoreArticleSpineGoldenPathStrip';
import { PlatformCoreArticleCreationModeStrip } from '@/components/platform/PlatformCoreArticleCreationModeStrip';
import { getPlatformCoreDemo } from '@/lib/platform-core-demo-context';
import {
  type ArticleCreationMode,
  resolveArticleCreationMode,
} from '@/lib/platform-core-article-spine';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Досье артикула: компактный контекст сверху, рабочая форма — главный экран. */
export function BrandDevelopmentArticleWorkspace({ collectionId, articleId }: Props) {
  const state = useWorkshop2LocalState();
  const articleLine = state.getArticleLine(collectionId, articleId);
  const [creationModeOverride, setCreationModeOverride] = useState<ArticleCreationMode | null>(
    null
  );
  const creationMode = useMemo(
    () => creationModeOverride ?? resolveArticleCreationMode(articleLine),
    [articleLine, creationModeOverride]
  );

  const handleCreationModeChange = useCallback(
    (mode: ArticleCreationMode) => {
      const ok = state.onPatchWorkshop2ArticleLine(collectionId, articleId, {
        articleCreationMode: mode,
      });
      setCreationModeOverride(ok ? null : mode);
    },
    [articleId, collectionId, state]
  );

  return (
    <div
      className="workshop2-article-workspace-page w-full min-w-0 max-w-none space-y-2.5 pb-10"
      data-testid="brand-development-article-workspace"
    >
      <section
        className="border-border-subtle bg-bg-surface space-y-1.5 rounded-md border p-2"
        aria-label="Контекст артикула"
      >
        <PlatformCoreArticleSpineGoldenPathStrip
          demo={{ ...getPlatformCoreDemo(collectionId), collectionId, demoArticleId: articleId }}
          activeStep="brand-dev-dossier"
        />
        <div className="grid min-w-0 gap-1.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Workshop2ArticleCoreWayfinding collectionId={collectionId} articleId={articleId} />
          <PlatformCoreArticleCreationModeStrip
            value={creationMode}
            onChange={handleCreationModeChange}
          />
        </div>
      </section>

      {state.storageStaleBanner ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-2.5 py-2 text-[11px] text-amber-950"
          role="status"
        >
          <span>Данные изменены в другой вкладке.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 rounded-md px-2 text-[10px]"
            onClick={state.reloadInventoryAfterExternalChange}
          >
            Обновить данные
          </Button>
        </div>
      ) : null}

      <Workshop2BackendStatusBanner />

      <Workshop2ArticleWorkspace
        collectionId={collectionId}
        articleId={articleId}
        createdByLabel={state.createdByLabel}
        activeCollections={state.activeCollections}
        archivedCollections={state.archivedCollections}
        getArticlePipelineProgress={state.getArticlePipelineProgress}
        onPatchWorkshop2ArticleLine={state.onPatchWorkshop2ArticleLine}
        articlePickerLines={state.articlePickerLines}
        onCommitWorkshop2Article={state.onCommitWorkshop2Article}
        articleCreationModeOverride={creationMode}
      />
    </div>
  );
}
