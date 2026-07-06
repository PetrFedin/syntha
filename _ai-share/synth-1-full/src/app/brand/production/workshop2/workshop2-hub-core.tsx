'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlatformCoreDevelopmentChrome } from '@/components/platform/PlatformCoreDevelopmentChrome';
import { Workshop2TabContent } from '@/components/brand/production/Workshop2TabContent';
import { useWorkshop2LocalState } from '@/app/brand/production/workshop2/workshop2-local-state-provider';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { WORKSHOP2_SS27_COLLECTION_ID } from '@/lib/production/workshop2-ru-journey-ss27';
import {
  useWorkshop2BackendStatusHint,
  workshop2BackendStatusHintRu,
} from '@/components/brand/production/use-workshop2-backend-status-hint';
import {
  formatWorkshop2PgSourceStatsRu,
  type Workshop2PgSourceStats,
} from '@/lib/production/workshop2-pg-source-stats';
import { isWorkshop2InvestorDemoModeEnabled } from '@/lib/production/workshop2-investor-demo-mode';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BRAND_DEV_W2_HUB_SECTION } from '@/lib/platform-core-cabinet-workspace';
import { Workshop2DevelopmentIntro } from '@/components/brand/production/Workshop2DevelopmentIntro';
import { Workshop2HubShowroomPublishButton } from '@/components/brand/production/Workshop2HubShowroomPublishButton';
import { isPlatformCoreEmptyChainCollection } from '@/lib/platform-core-demo-context';
import { BrandDevEmptyChainOnboarding } from '@/components/platform/BrandDevEmptyChainOnboarding';
import { BrandDevPgSyncPeerStrip } from '@/components/platform/BrandDevPgSyncPeerStrip';
import { BrandDevW2HubInvestorSummaryStrip } from '@/components/platform/BrandDevW2HubInvestorSummaryStrip';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import {
  shouldShowHubCabinetInvestorReadinessStrip,
  shouldShowHubCabinetPgSyncDiagnostics,
} from '@/lib/platform/wave-yt-hub-noise-pass2';
import { BrandDevW2HubContextStrip } from '@/components/brand/production/BrandDevW2HubContextStrip';
import { BrandScPublishReleasePeerStrip } from '@/components/platform/BrandScPublishReleasePeerStrip';
import { Workshop2HubSlaOpsPanel } from '@/components/brand/production/Workshop2HubSlaOpsPanel';
import { BrandScPublishAuditLog } from '@/components/brand/sample/BrandScPublishAuditLog';
import { shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner } from '@/lib/platform/wave-xs-brand-w2-readpath-banner';
import { PlatformCoreArticleSpineGoldenPathStrip } from '@/components/platform/peers/PlatformCoreArticleSpineGoldenPathStrip';

function isWorkshop2InvestorPath(): boolean {
  return (
    isWorkshop2InvestorDemoModeEnabled() ||
    String(process.env.NEXT_PUBLIC_WORKSHOP2_INVESTOR_DEMO_MODE ?? '').toLowerCase() === 'true'
  );
}

function Workshop2CorePgDualSourceBanner() {
  const status = useWorkshop2BackendStatusHint(true);
  if (status !== 'server') return null;
  return (
    <div
      className="rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2.5 text-[12px] text-sky-950"
      role="status"
      data-testid="workshop2-core-pg-source-banner"
    >
      {workshop2BackendStatusHintRu(status)}
    </div>
  );
}

function formatPgHydrateMessage(stats: {
  added: number;
  skippedDuplicates: number;
  publishedCount: number;
}): string {
  if (stats.publishedCount === 0) {
    return 'В PG нет опубликованных артикулов для этой коллекции.';
  }
  if (stats.added > 0) {
    return `Из PG: ${stats.publishedCount} опубликованных · добавлено в локальный состав: ${stats.added}.`;
  }
  return `Из PG: ${stats.publishedCount} опубликованных · локальный состав уже содержит эти артикулы.`;
}

/** Компактный PG-статус в platform core — только при деградации (не шум на happy path). */
function Workshop2CorePgSyncHint({
  active,
  pgAvailable,
}: {
  active: boolean;
  pgAvailable: boolean;
}) {
  const platformCore = isPlatformCoreMode();
  const status = useWorkshop2BackendStatusHint(active);
  if (!platformCore) return null;
  if (shouldSuppressWorkshop2CorePgSyncHintForReadPathBanner(pgAvailable)) return null;
  if (status === 'loading' || status === 'server') return null;
  const isFilePersist = status === 'pg_disabled';
  return (
    <div
      className={
        isFilePersist
          ? 'rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[12px] text-amber-950'
          : 'rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-[12px] text-emerald-950'
      }
      role="status"
      data-testid={
        isFilePersist ? 'workshop2-core-dossier-file-persist-banner' : 'workshop2-core-pg-sync-hint'
      }
      data-audit-legacy="brand-dev-pg-sync-hint"
      data-workshop2-pg-hint-mode={status}
    >
      {isFilePersist ? 'Файловый режим — без PG' : workshop2BackendStatusHintRu(status)}
    </div>
  );
}

function Workshop2CorePgHydrateBanner({
  collectionId,
  onSync,
  pgSourceStats,
  onRefreshStats,
}: {
  collectionId: string;
  onSync: () => Promise<{
    added: number;
    skippedDuplicates: number;
    publishedCount: number;
  }>;
  pgSourceStats?: Workshop2PgSourceStats;
  onRefreshStats: () => Promise<void>;
}) {
  const pgStatus = useWorkshop2BackendStatusHint(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lastAutoSyncKey = useRef<string | null>(null);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const stats = await onSync();
      setMessage(formatPgHydrateMessage(stats));
      await onRefreshStats();
      return stats;
    } finally {
      setSyncing(false);
    }
  }, [onSync, onRefreshStats]);

  useEffect(() => {
    if (pgStatus !== 'server') return;
    void onRefreshStats();
  }, [pgStatus, collectionId, onRefreshStats]);

  useEffect(() => {
    if (pgStatus !== 'server') return;
    const key = `${collectionId}:${pgStatus}`;
    if (lastAutoSyncKey.current === key) return;
    lastAutoSyncKey.current = key;
    void runSync();
  }, [pgStatus, collectionId, runSync]);

  if (pgStatus === 'loading') return null;
  if (pgStatus !== 'server') return null;

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-[12px] text-emerald-950"
      role="status"
      data-testid="workshop2-core-pg-hydrate-banner"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          {message ?? 'Синхронизация опубликованных артикулов из PG.'}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-emerald-300 text-[11px]"
          disabled={syncing}
          onClick={() => {
            void runSync();
          }}
        >
          {syncing ? 'Синхронизация…' : 'Синхронизировать из PG'}
        </Button>
      </div>
      {pgSourceStats ? (
        <span data-testid="workshop2-pg-source-stats">
          {formatWorkshop2PgSourceStatsRu(pgSourceStats)}
        </span>
      ) : null}
    </div>
  );
}

type Workshop2HubCorePageProps = {
  /** Встроен в `/brand/core?pillar=development` — без дублирующего ListChrome. */
  embedded?: boolean;
};

export function Workshop2HubCorePage({ embedded = false }: Workshop2HubCorePageProps = {}) {
  const investorPath = isWorkshop2InvestorPath();
  const platformCore = isPlatformCoreMode();
  const auditUi = usePlatformCoreAuditUi();
  const ctx = useWorkshop2LocalState();
  const searchParams = useSearchParams();
  const pageCollectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
    fallback: WORKSHOP2_SS27_COLLECTION_ID,
  });
  const activeCollectionId =
    ctx.activeCollections.find((c) => c.id === pageCollectionId)?.id ?? pageCollectionId;

  const syncFromPgRef = useRef(ctx.syncPublishedArticlesFromPg);
  syncFromPgRef.current = ctx.syncPublishedArticlesFromPg;

  const handlePgSync = useCallback(
    () => syncFromPgRef.current(activeCollectionId),
    [activeCollectionId]
  );

  const refreshPgSourceStatsRef = useRef(ctx.refreshPgSourceStats);
  refreshPgSourceStatsRef.current = ctx.refreshPgSourceStats;

  const handleRefreshPgSourceStats = useCallback(async () => {
    await refreshPgSourceStatsRef.current(activeCollectionId);
  }, [activeCollectionId]);

  const hubArticleIds = useMemo(
    () => Object.keys(ctx.getSkuFlowDoc(activeCollectionId).skus ?? {}),
    [ctx, activeCollectionId]
  );
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishReloadNonce, setPublishReloadNonce] = useState(0);

  const handlePublishMessage = useCallback((msg: string | null) => {
    setPublishMessage(msg);
    if (msg && /опублик|publish|готов|успеш|batch/i.test(msg)) {
      setPublishReloadNonce((n) => n + 1);
    }
  }, []);

  const hubInner = (
    <>
      {!platformCore ? <Workshop2DevelopmentIntro /> : null}
      {embedded && platformCore ? (
        <Workshop2TabContent
          basePath={`/brand/core?pillar=development&section=${BRAND_DEV_W2_HUB_SECTION}&collection=${encodeURIComponent(activeCollectionId)}`}
          activeCollections={ctx.activeCollections}
          archivedCollections={ctx.archivedCollections}
          metricsByCollectionId={ctx.metricsByCollectionId}
          getArticlePipelineProgress={ctx.getArticlePipelineProgress}
          getSkuFlowDoc={ctx.getSkuFlowDoc}
          onCreateCollection={ctx.onCreateCollection}
          onArchiveCollection={ctx.onArchiveCollection}
          onRestoreCollection={ctx.onRestoreCollection}
          onToggleCollectionPin={ctx.onToggleCollectionPin}
          getUserCollectionRow={ctx.getUserCollectionRow}
          getCollectionCoverDataUrl={ctx.getCollectionCoverDataUrl}
          onUpdateUserCollection={ctx.onUpdateUserCollection}
          onUpdateSs27Meta={ctx.onUpdateSs27Meta}
          articlePickerLines={ctx.articlePickerLines}
          onCommitWorkshop2Article={ctx.onCommitWorkshop2Article}
          onBulkAddWorkshop2Articles={ctx.onBulkAddWorkshop2Articles}
          onRemoveWorkshop2Article={ctx.onRemoveWorkshop2Article}
          onPatchWorkshop2ArticleLine={ctx.onPatchWorkshop2ArticleLine}
          createdByLabel={ctx.createdByLabel}
          highlightArticleId={ctx.highlightArticleId}
          embeddedHub
        />
      ) : null}
      {platformCore && !embedded && hubArticleIds.length > 0 ? (
        <div
          className="rounded-lg border border-border-subtle bg-bg-surface px-3 py-2.5"
          data-testid="brand-dev-w2-hub-publish-strip"
        >
          <p className="text-text-muted mb-1.5 text-[10px] font-semibold uppercase tracking-wide">
            Публикация
          </p>
          <Workshop2HubShowroomPublishButton
            collectionId={activeCollectionId}
            articleIds={hubArticleIds}
            onMessage={handlePublishMessage}
          />
          {publishMessage ? (
            <p className="text-text-secondary mt-1.5 text-[10px]" role="status">
              {publishMessage}
            </p>
          ) : null}
          <BrandScPublishAuditLog collectionId={activeCollectionId} reloadNonce={publishReloadNonce} />
          <BrandScPublishReleasePeerStrip collectionId={activeCollectionId} />
        </div>
      ) : platformCore && !embedded && isPlatformCoreEmptyChainCollection(activeCollectionId) ? (
        <BrandDevEmptyChainOnboarding collectionId={activeCollectionId} variant="w2-hub" />
      ) : null}
      {!embedded ? (
        <Workshop2CorePgSyncHint active pgAvailable={ctx.preferPgApiForPublishedArticles} />
      ) : null}
      {platformCore && !embedded ? (
        <div className="space-y-2">
          <BrandDevW2HubContextStrip collectionId={activeCollectionId} />
          {shouldShowHubCabinetPgSyncDiagnostics(auditUi) ? (
            <BrandDevPgSyncPeerStrip
              collectionId={activeCollectionId}
              articleId={getPlatformCoreDemo(activeCollectionId).demoArticleId}
            />
          ) : null}
          {shouldShowHubCabinetInvestorReadinessStrip(auditUi) ? (
            <BrandDevW2HubInvestorSummaryStrip
              collectionId={activeCollectionId}
              articleId={getPlatformCoreDemo(activeCollectionId).demoArticleId}
            />
          ) : null}
          <Workshop2HubSlaOpsPanel compact />
        </div>
      ) : null}
      {!platformCore ? (
        <>
          <Workshop2CorePgDualSourceBanner />
          <Workshop2CorePgHydrateBanner
            collectionId={activeCollectionId}
            onSync={handlePgSync}
            pgSourceStats={ctx.getPgSourceStats(activeCollectionId)}
            onRefreshStats={handleRefreshPgSourceStats}
          />
        </>
      ) : null}
      {ctx.storageStaleBanner && !platformCore ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-950"
          role="status"
        >
          <span>Данные обновлены в другой вкладке</span>
          <Button
            type="button"
            size="sm"
            className="h-8 text-[11px]"
            onClick={ctx.reloadInventoryAfterExternalChange}
          >
            Обновить
          </Button>
        </div>
      ) : null}
      {!(embedded && platformCore) ? (
      <Workshop2TabContent
        basePath={
          embedded
            ? `/brand/core?pillar=development&section=${BRAND_DEV_W2_HUB_SECTION}&collection=${encodeURIComponent(activeCollectionId)}`
            : ROUTES.brand.productionWorkshop2
        }
        activeCollections={ctx.activeCollections}
        archivedCollections={ctx.archivedCollections}
        metricsByCollectionId={ctx.metricsByCollectionId}
        getArticlePipelineProgress={ctx.getArticlePipelineProgress}
        getSkuFlowDoc={ctx.getSkuFlowDoc}
        onCreateCollection={ctx.onCreateCollection}
        onArchiveCollection={ctx.onArchiveCollection}
        onRestoreCollection={ctx.onRestoreCollection}
        onToggleCollectionPin={ctx.onToggleCollectionPin}
        getUserCollectionRow={ctx.getUserCollectionRow}
        getCollectionCoverDataUrl={ctx.getCollectionCoverDataUrl}
        onUpdateUserCollection={ctx.onUpdateUserCollection}
        onUpdateSs27Meta={ctx.onUpdateSs27Meta}
        articlePickerLines={ctx.articlePickerLines}
        onCommitWorkshop2Article={ctx.onCommitWorkshop2Article}
        onBulkAddWorkshop2Articles={ctx.onBulkAddWorkshop2Articles}
        onRemoveWorkshop2Article={ctx.onRemoveWorkshop2Article}
        onPatchWorkshop2ArticleLine={ctx.onPatchWorkshop2ArticleLine}
        createdByLabel={ctx.createdByLabel}
        highlightArticleId={ctx.highlightArticleId}
      />
      ) : null}
    </>
  );

  const cabinetBackHref = `/brand/core?pillar=development&collection=${encodeURIComponent(activeCollectionId)}`;
  const cabinetBackLabel = 'Кабинет';

  const hubPanel = (
    <div
      className="space-y-4 pb-20"
      data-testid="brand-dev-w2-hub-panel"
      data-audit-legacy="workshop2-hub-core"
    >
      <PlatformCoreDevelopmentChrome
        collectionId={activeCollectionId}
        backHref={cabinetBackHref}
        backLabel={cabinetBackLabel}
      >
        {hubInner}
      </PlatformCoreDevelopmentChrome>
    </div>
  );

  if (embedded) {
    const spineDemo = getPlatformCoreDemo(activeCollectionId);
    return (
      <div
        className="w-full min-w-0 max-w-none space-y-4 pb-20"
        data-testid="brand-dev-w2-hub-panel"
        data-audit-legacy="workshop2-hub-core-embedded"
      >
        <PlatformCoreArticleSpineGoldenPathStrip
          demo={spineDemo}
          activeStep="brand-dev-w2-hub"
        />
        {hubInner}
      </div>
    );
  }

  return hubPanel;
}
