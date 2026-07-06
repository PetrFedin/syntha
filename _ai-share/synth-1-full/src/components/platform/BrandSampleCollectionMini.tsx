'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import {
  brandLinesheetsHrefForDemo,
  getPlatformCoreCollectionLabel,
} from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/platform-core-routes';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { pickSampleCollectionStatus } from '@/lib/platform-core-pillar-snapshot.types';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BrandCentricStyleImportPanel } from '@/components/integrations/BrandCentricStyleImportPanel';
import { BrandCentricMediaImportPanel } from '@/components/integrations/BrandCentricMediaImportPanel';
import { BrandLinesheetGenPanel } from '@/components/integrations/BrandLinesheetGenPanel';
import { useWorkshop2PublishedArticleCount } from '@/hooks/use-workshop2-published-article-count';
import { PlatformCorePublishedCountSyncBadge } from '@/components/platform/PlatformCorePublishedCountSyncBadge';
import { FileText } from 'lucide-react';
import { BrandReleasePublishAuditPanel } from '@/components/brand/merch/BrandReleasePublishAuditPanel';
import { BrandScCabinetGoldenPathStrip } from '@/components/brand/sample/BrandScCabinetGoldenPathStrip';
import { PlatformCoreArticleSpineGoldenPathStrip } from '@/components/platform/peers/PlatformCoreArticleSpineGoldenPathStrip';
import { BrandScCabinetRetailPeerStrip } from '@/components/platform/BrandScCabinetRetailPeerStrip';
import { BrandScCabinetMiniMatrixStrip } from '@/components/platform/BrandScCabinetMiniMatrixStrip';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PillarInsightHeader } from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { usePlatformCoreHubAuditLegacyAttrs } from '@/hooks/use-platform-core-hub-audit-legacy-attrs';
import {
  shouldShowHubCabinetPublishedCountSyncBadge,
} from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { WAVE_ZE_SC_COLLECTION_ERROR_RU } from '@/lib/platform-core-ports/platform/wave-ze-hub-diagnostics-ru';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { BrandScLinesheetSyndicationPanel } from '@/components/platform/BrandScLinesheetSyndicationPanel';
import { BrandScPublishReleasePeerStrip } from '@/components/platform/BrandScPublishReleasePeerStrip';
import {
  BRAND_SC_PUBLISH_SECTION,
  BRAND_SC_SHOWROOM_SECTION,
  resolveBrandScArticleSpineActiveStep,
  resolveBrandScGoldenPathOmitStep,
} from '@/lib/platform-core-sample-collection-section';

/** Бренд · sample_collection — hub-гаджет. */
export function BrandSampleCollectionMini({
  demo,
  compact = false,
  minimalChrome = false,
  sectionId,
}: {
  demo: PlatformCoreDemoContext;
  compact?: boolean;
  minimalChrome?: boolean;
  /** Sidebar `?section=` — linesheets / showroom / publish. */
  sectionId?: string | null;
}) {
  const { collectionId, demoArticleId } = demo;
  const activeSection = sectionId?.trim() ?? '';
  const isPublishSection = activeSection === BRAND_SC_PUBLISH_SECTION;
  const isShowroomSection = activeSection === BRAND_SC_SHOWROOM_SECTION;
  const goldenOmitStep = resolveBrandScGoldenPathOmitStep(activeSection);
  const spineActiveStep = resolveBrandScArticleSpineActiveStep(activeSection);
  const [linesheetReloadNonce, setLinesheetReloadNonce] = useState(0);
  const [snapshotReloadNonce, setSnapshotReloadNonce] = useState(0);
  const [syndicateReloadNonce, setSyndicateReloadNonce] = useState(0);
  const coreMode = isPlatformCoreMode();
  const auditUi = usePlatformCoreAuditUi();
  const auditLegacy = usePlatformCoreHubAuditLegacyAttrs();

  const { snapshot, loading, error } = usePillarSnapshot({
    collectionId,
    pillarId: 'sample_collection',
    roleId: 'brand',
    reloadNonce: snapshotReloadNonce,
  });

  const status = pickSampleCollectionStatus(snapshot);
  const loadState = loading ? 'loading' : error || !status ? 'error' : 'ready';
  const { count: livePublishedCount, loading: liveCountLoading } =
    useWorkshop2PublishedArticleCount(collectionId);
  const refPublishedCount = status?.publishedCount ?? null;
  const publishedInSync =
    livePublishedCount == null || refPublishedCount == null
      ? true
      : refPublishedCount === livePublishedCount;

  return (
    <div
      className={hubGadget.root}
      data-testid={isPublishSection ? 'brand-sc-publish-cabinet-panel' : 'brand-sc-cabinet-panel'}
      data-section={activeSection || undefined}
      {...auditLegacy('brand-sample-collection-mini')}
    >
      {!compact || coreMode ? (
        <>
          {coreMode && minimalChrome ? (
            <PlatformCoreArticleSpineGoldenPathStrip
              demo={demo}
              activeStep={spineActiveStep ?? 'brand-sc-linesheets'}
            />
          ) : (
            <BrandScCabinetGoldenPathStrip
              collectionId={collectionId}
              omitStep={goldenOmitStep}
              omitMatrixPrefillCta={coreMode}
            />
          )}
          {isPublishSection && coreMode ? <BrandScPublishReleasePeerStrip collectionId={collectionId} /> : null}
          {coreMode && !minimalChrome && !isPublishSection ? (
            <BrandScCabinetRetailPeerStrip collectionId={collectionId} omitBuyPath />
          ) : null}
          {coreMode && !minimalChrome && !isPublishSection ? (
            <BrandScCabinetMiniMatrixStrip collectionId={collectionId} />
          ) : null}
        </>
      ) : null}
      <div className={hubGadget.card}>
        <div className={hubGadget.cardBody}>
          {compact && loadState === 'loading' ? (
            <PlatformCorePillarInsightSkeleton testId="brand-sc-cabinet-loading" />
          ) : (
            <>
              {compact && !minimalChrome ? (
                <PillarInsightHeader
                  icon={FileText}
                  title={
                    isPublishSection
                      ? 'Публикация · syndication'
                      : isShowroomSection
                        ? 'Витрина бренда'
                        : 'Образец → коллекция'
                  }
                  subtitle={
                    isPublishSection
                      ? 'One-click publish → авто-ingest витрины магазина (NuORDER).'
                      : isShowroomSection
                        ? 'Опубликованные артикулы перед передачей байеру.'
                        : 'Публикация артикулов и лайншит для магазинов.'
                  }
                />
              ) : null}
              {compact && !minimalChrome && coreMode ? (
                <PlatformCorePillarNotificationCenterCompact
                  variant="brand"
                  compact
                  collectionId={collectionId}
                  orderId={demo.demoOrderId}
                  orderScoped
                />
              ) : null}
              {!compact && loadState === 'loading' ? (
                <p
                  className={hubGadget.muted}
                  data-testid="brand-sc-cabinet-loading"
                  {...auditLegacy('brand-sample-collection-mini-loading')}
                >
                  Загрузка…
                </p>
              ) : loadState === 'error' ? (
                <div className="space-y-2" data-testid="brand-sc-cabinet-error">
                  <p className={hubGadget.muted}>
                    {error ?? WAVE_ZE_SC_COLLECTION_ERROR_RU}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px]"
                      data-testid="brand-sc-cabinet-error-retry"
                      onClick={() => setSnapshotReloadNonce((n) => n + 1)}
                    >
                      Повторить
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" asChild>
                      <Link
                        href={brandLinesheetsHrefForDemo(demo)}
                        data-testid="brand-sc-cabinet-error-linesheet-link"
                      >
                        Лайншиты
                      </Link>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" asChild>
                      <Link
                        href={platformCoreUiHref(`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`)}
                        data-testid="brand-sc-cabinet-error-showroom-link"
                      >
                        Шоурум магазина
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={hubGadget.statRow}
                  data-testid="brand-sc-cabinet-published-badge"
                  {...auditLegacy('brand-sample-collection-published-badge')}
                >
                  <span className={hubGadget.stat}>
                    <strong>{status?.publishedCount ?? 0}</strong> арт. ·{' '}
                    {getPlatformCoreCollectionLabel(collectionId)}
                  </span>
                  {shouldShowHubCabinetPublishedCountSyncBadge(auditUi, publishedInSync) ? (
                    <PlatformCorePublishedCountSyncBadge
                      liveCount={livePublishedCount}
                      referenceCount={status?.publishedCount ?? null}
                      loading={liveCountLoading}
                      testId="brand-sc-cabinet-published-sync"
                      compact
                    />
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {isPublishSection && coreMode && loadState === 'ready' ? (
        <BrandScLinesheetSyndicationPanel
          collectionId={collectionId}
          onDone={() => {
            setSyndicateReloadNonce((n) => n + 1);
            setSnapshotReloadNonce((n) => n + 1);
          }}
          panelTestId="brand-sc-publish-syndicate-panel"
          buttonTestId="brand-sc-publish-syndicate-one-click"
          buttonLabelRu="Опубликовать → магазин"
          titleRu="One-click publish · shop ingest"
        />
      ) : null}
      {isShowroomSection && coreMode ? (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" asChild>
            <Link
              href={`${ROUTES.brand.showroom}?collection=${encodeURIComponent(collectionId)}`}
              data-testid="brand-sc-showroom-cabinet-full-link"
            >
              Полная витрина бренда →
            </Link>
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" asChild>
            <Link
              href={platformCoreUiHref(
                `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`
              )}
              data-testid="brand-sc-showroom-cabinet-shop-link"
            >
              Витрина магазина →
            </Link>
          </Button>
        </div>
      ) : null}
      {coreMode && loadState === 'ready' ? (
        <BrandReleasePublishAuditPanel
          collectionId={collectionId}
          compact
          reloadNonce={syndicateReloadNonce}
        />
      ) : null}
      {!(compact && minimalChrome) && !isPublishSection ? (
      <div
        className="border-border-subtle flex flex-col gap-1.5 border-t pt-2"
        data-testid="brand-sc-upstream-strip"
      >
        <BrandCentricStyleImportPanel
          collectionId={collectionId}
          articleId={demoArticleId}
          compact
        />
        <BrandCentricMediaImportPanel
          collectionId={collectionId}
          articleId={demoArticleId}
          compact
          onImportSuccess={() => setLinesheetReloadNonce((n) => n + 1)}
        />
        <BrandLinesheetGenPanel
          collectionId={collectionId}
          compact
          reloadNonce={linesheetReloadNonce}
        />
      </div>
      ) : null}
    </div>
  );
}
