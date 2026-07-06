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

/** Досье артикула в `/brand/core?pillar=development&article=…` — wayfinding + форма W2. */
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
      className="workshop2-article-workspace-page w-full min-w-0 max-w-none space-y-4 pb-20"
      data-testid="brand-development-article-workspace"
    >
      <PlatformCoreArticleSpineGoldenPathStrip
        demo={{ ...getPlatformCoreDemo(collectionId), collectionId, demoArticleId: articleId }}
        activeStep="brand-dev-dossier"
      />
      <PlatformCoreArticleCreationModeStrip
        value={creationMode}
        onChange={handleCreationModeChange}
      />
      <Workshop2ArticleCoreWayfinding collectionId={collectionId} articleId={articleId} />
      {state.storageStaleBanner ? (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2.5 text-[12px] text-amber-950"
          role="status"
        >
          <span>Данные обновлены в другой вкладке.</span>
          <Button
            type="button"
            size="sm"
            className="h-8 text-[11px]"
            onClick={state.reloadInventoryAfterExternalChange}
          >
            Обновить
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
