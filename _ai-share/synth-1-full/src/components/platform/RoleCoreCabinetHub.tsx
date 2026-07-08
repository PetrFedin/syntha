'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_ROLE_EMPTY_PILLAR_RU } from '@/lib/platform-core-user-messages';
import {
  PLATFORM_CORE_PILLARS,
  getDefaultPillarForRole,
  getRolePillarWorkspaceHref,
  getPlatformCoreHubRow,
  getPlatformCorePillarEntityLabelForDemo,
  isCoreHubPillarId,
  isPlatformCoreEmptyChainCollection,
  resolvePlatformCoreCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { PlatformCoreChromeShell } from '@/components/platform/usePlatformCoreChainOverview';
import { PlatformCoreContextBar } from '@/components/platform/PlatformCoreContextBar';
import { PlatformCoreRoleCabinetStrip } from '@/components/platform/PlatformCoreRoleCabinetStrip';
import {
  usePlatformCoreChainOverview,
  usePlatformCoreDemoContext,
} from '@/components/platform/usePlatformCoreChainOverview';
import { cn } from '@/lib/utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  getRoleCabinetNavPillarIds,
  isEmptyCellInsightVisibleInUi,
  isEmptyCellInsightVisibleInCabinetHub,
  isRolePillarCabinetSelectable,
} from '@/lib/platform-core-empty-cell-registry';
import { prefetchPlatformCoreW2FromHref } from '@/lib/platform-core-w2-prefetch';
import { prefetchPillarSnapshot } from '@/lib/platform-core-pillar-prefetch';
import { RoleCabinetPillarNavMobile } from '@/components/platform/RoleCabinetPillarNavMobile';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import { PillarCabinetHeader } from '@/components/platform/PillarCabinetHeader';
import { PillarCabinetActionRail } from '@/components/platform/PillarCabinetActionRail';
import { PillarSectionList } from '@/components/platform/PillarSectionList';
import { PillarCabinetDiagnostics } from '@/components/platform/PillarCabinetDiagnostics';
import {
  buildPillarCabinetOverflowSections,
  buildPillarCabinetRelatedLinks,
  buildPillarCabinetSectionItems,
  pillarCabinetUsesEmptySections,
} from '@/lib/platform-core-ports/legacy/pillar-cabinet-sections';
import { PillarRelatedLinks } from '@/components/platform/PillarRelatedLinks';
import { BrandCoRetailersPickerRow } from '@/components/platform/BrandCoRetailersPickerRow';
import { PillarCabinetProgress } from '@/components/platform/PillarCabinetProgress';
import { WaveYrReadinessCellDashboardStrip } from '@/components/platform/WaveYrReadinessCellDashboardStrip';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { useBrandCoRetailersSummary } from '@/hooks/use-brand-co-retailers-summary';
import {
  shouldShowHubCabinetInvestorReadinessStrip,
  shouldShowHubCabinetOperatorPillarInsightCard,
  shouldShowHubCabinetPillarDiagnostics,
  shouldSuppressHubCabinetChainStatusBadge,
} from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import {
  buildPillarCabinetActions,
  countRoleChainProgress,
} from '@/lib/platform-core-ports/legacy/pillar-cabinet-primary-actions';
import {
  buildRoleCoreCabinetQueryString,
  hasEmbeddedPlatformCoreWorkspace,
  PLATFORM_CORE_CABINET_DEFAULT_SECTION,
  resolveCabinetWorkspaceSection,
} from '@/lib/platform-core-cabinet-workspace';
import { isPlatformCoreArticleSpineMode } from '@/lib/platform-core-article-spine';
import { RoleCorePillarInsightCards } from '@/components/platform/RoleCorePillarInsightCards';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import {
  brandB2bOrderHref,
  brandMessagesB2bOrderContextHref,
  brandMessagesWorkshop2ArticleContextHref,
  factoryMessagesB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopB2bOrderHref,
  shopMessagesB2bOrderContextHref,
  shopMessagesWorkshop2ArticleContextHref,
} from '@/lib/platform-core-routes';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';

const PlatformCoreEmptyCellPanels = dynamic(
  () =>
    import('@/components/platform/PlatformCoreEmptyCellPanels').then((m) => ({
      default: m.PlatformCoreEmptyCellPanels,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="text-text-muted text-sm" data-testid="role-pillar-empty-insight-loading">
        Загрузка контекста…
      </p>
    ),
  }
);

const SupplierDevPillarMaterialCatalogNav = dynamic(
  () =>
    import('@/components/factory/supplier/SupplierDevPillarMaterialCatalogNav').then((m) => ({
      default: m.SupplierDevPillarMaterialCatalogNav,
    })),
  { ssr: false }
);

const PlatformCoreRolePillarWorkspace = dynamic(
  () =>
    import('@/components/platform/workspaces/PlatformCoreRolePillarWorkspace').then((m) => ({
      default: m.PlatformCoreRolePillarWorkspace,
    })),
  { ssr: false }
);

type Props = {
  roleId: CoreChainRoleId;
};

function cabinetPathWithQuery(
  pathname: string,
  searchParams: URLSearchParams,
  input: {
    roleId: CoreChainRoleId;
    pillarId: CoreHubPillarId;
    collectionId: string;
    sectionId?: string | null;
    orderId?: string | null;
    articleId?: string | null;
    hash?: string;
  }
): string {
  const qs = buildRoleCoreCabinetQueryString({
    roleId: input.roleId,
    pillarId: input.pillarId,
    collectionId: input.collectionId,
    sectionId: input.sectionId,
    orderId: input.orderId ?? searchParams.get('order'),
    articleId: input.articleId ?? searchParams.get('article'),
    baseParams: searchParams,
  });
  const hash = input.hash ?? '';
  return qs ? `${pathname}?${qs}${hash}` : `${pathname}${hash}`;
}

function RoleCoreCabinetHubInner({ roleId }: Props) {
  const row = getPlatformCoreHubRow(roleId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pillarFromUrl = searchParams.get('pillar');
  const developmentArticleId = searchParams.get('article')?.trim() || null;
  const workspaceSectionFromUrl = searchParams.get('section');
  const demoOrderIdFromUrl = searchParams.get('order')?.trim() || null;
  const collectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));
  const { pillarDone } = usePlatformCoreChainOverview(collectionId);
  const demo = usePlatformCoreDemoContext();
  const [selectedPillar, setSelectedPillar] = useState<CoreHubPillarId>(() => {
    if (pillarFromUrl && isCoreHubPillarId(pillarFromUrl)) return pillarFromUrl;
    return getDefaultPillarForRole(roleId);
  });

  useEffect(() => {
    const p = searchParams.get('pillar');
    const defaultPillar = getDefaultPillarForRole(roleId);
    if (p && isCoreHubPillarId(p) && isRolePillarCabinetSelectable(roleId, p, collectionId)) {
      setSelectedPillar(p);
      return;
    }
    if (p && isCoreHubPillarId(p) && !isRolePillarCabinetSelectable(roleId, p, collectionId)) {
      setSelectedPillar(defaultPillar);
      const hash = roleId === 'shop' && p === 'order_production' ? '#shop-co-buyer-tracking' : '';
      const target = cabinetPathWithQuery(pathname, searchParams, {
        roleId,
        pillarId:
          roleId === 'shop' && p === 'order_production' ? 'collection_order' : defaultPillar,
        collectionId,
        hash,
      });
      const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      if (target !== current) router.replace(target, { scroll: false });
      return;
    }
    if (!p) {
      const next = isRolePillarCabinetSelectable(roleId, selectedPillar, collectionId)
        ? selectedPillar
        : defaultPillar;
      setSelectedPillar(next);
      if (isPlatformCoreMode()) {
        const defaultSection = PLATFORM_CORE_CABINET_DEFAULT_SECTION[roleId]?.[next];
        const sectionId =
          hasEmbeddedPlatformCoreWorkspace(roleId, next) && defaultSection ? defaultSection : null;
        const target = cabinetPathWithQuery(pathname, searchParams, {
          roleId,
          pillarId: next,
          collectionId,
          sectionId,
        });
        const current = searchParams.toString()
          ? `${pathname}?${searchParams.toString()}`
          : pathname;
        if (target !== current) router.replace(target, { scroll: false });
      }
    }
  }, [searchParams, roleId, collectionId, pathname, router, selectedPillar]);

  useEffect(() => {
    if (!isEmptyCellInsightVisibleInUi(roleId, selectedPillar)) return;
    prefetchPillarSnapshot({
      collectionId,
      pillarId: selectedPillar,
      roleId,
      factoryId: demo.factoryId,
    });
  }, [roleId, selectedPillar, collectionId, demo.factoryId]);

  function selectPillar(pillarId: CoreHubPillarId) {
    setSelectedPillar(pillarId);
    const defaultSection = PLATFORM_CORE_CABINET_DEFAULT_SECTION[roleId]?.[pillarId];
    const sectionId =
      hasEmbeddedPlatformCoreWorkspace(roleId, pillarId) && defaultSection ? defaultSection : null;
    router.replace(
      cabinetPathWithQuery(pathname, searchParams, {
        roleId,
        pillarId,
        collectionId,
        sectionId,
      }),
      { scroll: false }
    );
  }

  const auditUi = usePlatformCoreAuditUi();
  const coreMode = isPlatformCoreMode();
  const { multiBuyer } = useBrandCoRetailersSummary(
    roleId === 'brand' && selectedPillar === 'collection_order' ? collectionId : null
  );
  const cell = row?.pillars[selectedPillar];
  const showOperatorPillarInsight =
    cell?.kind === 'active' &&
    (coreMode ||
      shouldShowHubCabinetOperatorPillarInsightCard({ auditUi, pillarId: selectedPillar }));
  const cabinetSections = useMemo(
    () =>
      row && cell
        ? buildPillarCabinetSectionItems(roleId, selectedPillar, collectionId, {
            emptyCell: pillarCabinetUsesEmptySections(roleId, selectedPillar, cell.kind),
          })
        : [],
    [row, cell, roleId, selectedPillar, collectionId]
  );
  const displayCabinetSections = useMemo(() => {
    if (!(roleId === 'brand' && selectedPillar === 'collection_order' && multiBuyer)) {
      return cabinetSections;
    }
    return cabinetSections.filter((section) => section.id !== 'brand-co-retailers');
  }, [cabinetSections, roleId, selectedPillar, multiBuyer]);

  const orderIdsForPoll =
    demo.demoOrderId && !demo.demoOrderId.startsWith('__') ? [demo.demoOrderId] : [];
  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled(roleId);
  const { sseConnected } = usePlatformCoreChainStatusPoll(
    coreMode && cell?.kind === 'active' && orderIdsForPoll.length > 0 && chainPushEnabled,
    orderIdsForPoll
  );

  const contextChips = useMemo(() => {
    if (!row || !cell) return undefined;
    if (!coreMode || isPlatformCoreEmptyChainCollection(collectionId)) return undefined;
    const orderId = demo.demoOrderId?.trim();
    if (!orderId || orderId.startsWith('__')) return undefined;
    const chips: Array<{ label: string; href: string; testId: string }> = [];
    const orderLabel = formatWholesaleOrderDisplayId(orderId);
    const orderMessagesHref =
      roleId === 'shop'
        ? shopMessagesB2bOrderContextHref(orderId)
        : roleId === 'brand'
          ? brandMessagesB2bOrderContextHref(orderId)
          : roleId === 'supplier'
            ? factorySupplierMessagesB2bOrderContextHref(orderId)
            : factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
    if (
      selectedPillar === 'comms' ||
      selectedPillar === 'collection_order' ||
      selectedPillar === 'order_production'
    ) {
      chips.push({
        label: `Заказ · ${orderLabel}`,
        href: orderMessagesHref,
        testId: 'platform-core-context-order-chip',
      });
    }
    const articleHref =
      roleId === 'shop'
        ? shopMessagesWorkshop2ArticleContextHref(collectionId, demo.demoArticleId)
        : roleId === 'brand'
          ? brandMessagesWorkshop2ArticleContextHref(collectionId, demo.demoArticleId)
          : `/factory/production/dossier/${encodeURIComponent(demo.demoArticleId)}?collection=${encodeURIComponent(collectionId)}`;
    if (selectedPillar === 'comms' && demo.demoArticleId) {
      chips.push({
        label: `Арт. · ${demo.demoArticleId}`,
        href: articleHref,
        testId: 'platform-core-context-article-chip',
      });
    }
    return chips.length > 0 ? chips : undefined;
  }, [coreMode, collectionId, demo, roleId, selectedPillar, row, cell]);

  if (!row || !cell) {
    return <PlatformCorePillarInsightSkeleton testId="role-core-cabinet-hub-loading" />;
  }

  const navPillarIds = getRoleCabinetNavPillarIds(roleId, collectionId);
  const workspaceHref = getRolePillarWorkspaceHref(roleId, selectedPillar, demo);
  const pillarMeta = PLATFORM_CORE_PILLARS.find((p) => p.id === selectedPillar);
  const pillarLead =
    cell.kind === 'active'
      ? cell.lead.split(/[.!]/)[0]?.trim() + (cell.lead.includes('.') ? '.' : '')
      : '';
  const cabinetSectionOpts = {
    emptyCell: pillarCabinetUsesEmptySections(roleId, selectedPillar, cell.kind),
  };
  const relatedLinks = buildPillarCabinetRelatedLinks(
    roleId,
    selectedPillar,
    collectionId,
    demo,
    cabinetSectionOpts
  );
  const overflowSections = buildPillarCabinetOverflowSections(
    roleId,
    selectedPillar,
    collectionId,
    cabinetSectionOpts
  );
  const cabinetActions = buildPillarCabinetActions(roleId, selectedPillar, demo);
  const chainProgress = countRoleChainProgress(navPillarIds, pillarDone);
  const showEmbeddedWorkspace =
    coreMode && cell.kind === 'active' && hasEmbeddedPlatformCoreWorkspace(roleId, selectedPillar);
  const hidePillarSectionListInSpine =
    isPlatformCoreArticleSpineMode() && hasEmbeddedPlatformCoreWorkspace(roleId, selectedPillar);
  const insightSectionId = resolveCabinetWorkspaceSection(
    roleId,
    selectedPillar,
    workspaceSectionFromUrl
  );
  const activeWorkspaceSection = showEmbeddedWorkspace ? insightSectionId : null;
  const showActionRail = selectedPillar !== 'comms' && !showEmbeddedWorkspace;

  function renderPillarAsideButtons() {
    return PLATFORM_CORE_PILLARS.filter((pillar) => navPillarIds.includes(pillar.id)).map(
      (pillar) => {
        const isActive = selectedPillar === pillar.id;
        const pillarCell = row.pillars[pillar.id];
        const isPeerContext =
          pillarCell.kind === 'empty' && isEmptyCellInsightVisibleInUi(roleId, pillar.id);
        return (
          <button
            key={pillar.id}
            type="button"
            data-testid={`role-pillar-${pillar.id}`}
            onClick={() => selectPillar(pillar.id)}
            onMouseEnter={() =>
              prefetchPillarSnapshot({
                collectionId,
                pillarId: pillar.id,
                roleId,
                factoryId: demo.factoryId,
              })
            }
            onFocus={() =>
              prefetchPillarSnapshot({
                collectionId,
                pillarId: pillar.id,
                roleId,
                factoryId: demo.factoryId,
              })
            }
            className={isActive ? hubCabinet.pillarBtnActive : hubCabinet.pillarBtnIdle}
          >
            <span className="flex items-center justify-between gap-2">
              <span className={hubCabinet.pillarBtnTitle}>{pillar.title}</span>
              {isPeerContext ? (
                <span
                  className="text-text-muted text-[11px] font-medium uppercase tracking-wide"
                  data-testid={`role-pillar-${pillar.id}-peer-badge`}
                >
                  контекст
                </span>
              ) : pillarDone(pillar.id) != null ? (
                pillarDone(pillar.id) ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="text-text-muted h-3 w-3 shrink-0" aria-hidden />
                )
              ) : null}
            </span>
          </button>
        );
      }
    );
  }

  return (
    <div
      data-testid={`role-core-cabinet-${roleId}`}
      className={cn(
        hubCabinet.page,
        isPlatformCoreMode() && 'bg-bg-surface pb-safe min-h-[calc(100vh-2.5rem)]',
        isPlatformCoreMode() && selectedPillar === 'comms' && 'md:pb-safe pb-20',
        !isPlatformCoreMode() && 'mx-auto max-w-6xl px-4 py-8 md:px-6'
      )}
    >
      <header className="border-border-subtle bg-bg-surface/95 sticky top-0 z-20 -mx-4 space-y-2 border-b px-4 pb-2 backdrop-blur-sm md:-mx-6 md:space-y-0 md:px-6">
        <PlatformCoreContextBar
          roleId={roleId}
          pillarId={selectedPillar}
          entityLabel={getPlatformCorePillarEntityLabelForDemo(selectedPillar, demo)}
          showDemoIdStrip={false}
          compactCabinet={coreMode}
          contextChips={contextChips}
        />
        {!isPlatformCoreMode() ? (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <PlatformCoreRoleCabinetStrip highlightRole={roleId} />
          </div>
        ) : null}
      </header>

      {coreMode ? (
        <div
          className={cn(
            'bg-bg-surface/95 sticky top-10 z-10 -mx-4 px-4 py-1 backdrop-blur-sm',
            showEmbeddedWorkspace
              ? 'md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none'
              : 'md:hidden'
          )}
        >
          <RoleCabinetPillarNavMobile
            pillarIds={navPillarIds}
            selectedPillarId={selectedPillar}
            onSelect={selectPillar}
            embeddedLayout={showEmbeddedWorkspace}
          />
        </div>
      ) : null}

      <div
        className={cn(
          coreMode
            ? showEmbeddedWorkspace
              ? 'flex w-full min-w-0 flex-col gap-3'
              : hubCabinet.shell
            : hubCabinet.layout,
          coreMode &&
            cell.kind === 'active' &&
            !showActionRail &&
            !showEmbeddedWorkspace &&
            'lg:grid-cols-[11.5rem_minmax(0,1fr)]'
        )}
      >
        {!showEmbeddedWorkspace ? (
          <aside
            data-testid="role-core-pillar-nav"
            className={cn(hubCabinet.pillarNav, coreMode && 'lg:col-start-1 lg:row-start-1')}
          >
            <p className={hubCabinet.pillarNavLabel}>Столпы</p>
            <nav aria-label="Разделы столпов" className="flex flex-col gap-0.5">
              {renderPillarAsideButtons()}
              {roleId === 'supplier' && selectedPillar === 'development' ? (
                <div className="border-border-subtle mt-1 space-y-1 border-t px-2 pt-2">
                  <SupplierDevPillarMaterialCatalogNav demo={demo} showPeers />
                </div>
              ) : null}
            </nav>
          </aside>
        ) : null}

        <main
          data-testid="role-core-pillar-panel"
          className={cn(
            hubCabinet.pillarPanel,
            coreMode && 'w-full max-w-none border-0 bg-transparent p-0 shadow-none',
            coreMode && showEmbeddedWorkspace && 'min-w-0 flex-1',
            coreMode && !showEmbeddedWorkspace && 'lg:col-start-2 lg:row-start-1'
          )}
        >
          {cell.kind === 'empty' ? (
            <div className="min-w-0 space-y-4" data-testid="role-pillar-empty-participant">
              {isEmptyCellInsightVisibleInCabinetHub(roleId, selectedPillar) ? (
                <PlatformCoreEmptyCellPanels
                  roleId={roleId}
                  pillarId={selectedPillar}
                  demo={demo}
                  embedCrossRole
                />
              ) : (
                <>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {PLATFORM_CORE_ROLE_EMPTY_PILLAR_RU}
                  </p>
                  <RolePillarCrossRoleLinks
                    roleId={roleId}
                    pillarId={selectedPillar}
                    variant="compact"
                  />
                </>
              )}
            </div>
          ) : (
            <div
              key={selectedPillar}
              className={cn(
                coreMode ? 'space-y-4' : 'space-y-3 md:space-y-4',
                hubCabinet.pillarPanelEnter
              )}
            >
              {coreMode ? (
                <div className="min-w-0 space-y-4">
                  {showEmbeddedWorkspace ? (
                    <>
                      <PlatformCoreRolePillarWorkspace
                        roleId={roleId}
                        pillarId={selectedPillar}
                        collectionId={collectionId}
                        sectionFromUrl={activeWorkspaceSection}
                        articleId={
                          roleId === 'brand' && selectedPillar === 'development'
                            ? developmentArticleId
                            : (developmentArticleId ?? demo.demoArticleId)
                        }
                        orderId={demoOrderIdFromUrl ?? demo.demoOrderId}
                        factoryId={demo.factoryId}
                      />
                    </>
                  ) : (
                    <>
                      <PillarCabinetHeader
                        title={pillarMeta?.title ?? cell.title}
                        subtitle={pillarMeta?.subtitle}
                        lead={pillarLead || undefined}
                        progress={
                          chainProgress.total > 0 ? (
                            <PillarCabinetProgress
                              done={chainProgress.done}
                              total={chainProgress.total}
                            />
                          ) : pillarDone(selectedPillar) != null ? (
                            <p className="text-text-muted text-[11px]">
                              {pillarDone(selectedPillar)
                                ? 'Этап цепочки выполнен'
                                : 'Этап цепочки в работе'}
                            </p>
                          ) : null
                        }
                      />
                      {showActionRail ? (
                        <PillarCabinetActionRail
                          variant="inline"
                          className="lg:hidden"
                          primary={cabinetActions.primary}
                          secondary={cabinetActions.secondary}
                          workspace={cabinetActions.workspace}
                          onPrefetch={prefetchPlatformCoreW2FromHref}
                        />
                      ) : null}
                      {shouldShowHubCabinetInvestorReadinessStrip(auditUi) ? (
                        <WaveYrReadinessCellDashboardStrip
                          roleId={roleId}
                          pillarId={selectedPillar}
                          collectionId={collectionId}
                          compact
                        />
                      ) : null}
                      {!hidePillarSectionListInSpine ? (
                        <PillarSectionList
                          sections={displayCabinetSections}
                          liveConnected={
                            orderIdsForPoll.length > 0 &&
                            chainPushEnabled &&
                            shouldSuppressHubCabinetChainStatusBadge({ compact: true, auditUi })
                              ? sseConnected
                              : undefined
                          }
                          appendRow={
                            !isPlatformCoreArticleSpineMode() &&
                            roleId === 'brand' &&
                            selectedPillar === 'collection_order' &&
                            cell.kind === 'active' ? (
                              <BrandCoRetailersPickerRow collectionId={collectionId} />
                            ) : null
                          }
                        />
                      ) : null}
                      <PillarRelatedLinks
                        related={relatedLinks}
                        overflowSections={overflowSections}
                      />
                      {showOperatorPillarInsight ? (
                        shouldShowHubCabinetPillarDiagnostics(auditUi) ? (
                          <PillarCabinetDiagnostics>
                            <RoleCorePillarInsightCards
                              roleId={roleId}
                              pillarId={selectedPillar}
                              compact
                              minimalChrome
                              sectionId={insightSectionId}
                            />
                          </PillarCabinetDiagnostics>
                        ) : (
                          <RoleCorePillarInsightCards
                            roleId={roleId}
                            pillarId={selectedPillar}
                            compact
                            minimalChrome
                            sectionId={insightSectionId}
                          />
                        )
                      ) : null}
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className={hubCabinet.panelHeader}>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h2 className={hubCabinet.pillarTitle}>{cell.title}</h2>
                      {pillarLead ? (
                        <p className={hubCabinet.pillarLead}>{pillarLead || cell.lead}</p>
                      ) : null}
                    </div>
                    <Link
                      href={workspaceHref}
                      data-testid="role-pillar-primary-cta"
                      className={hubCabinet.primaryCta}
                      onMouseEnter={() => prefetchPlatformCoreW2FromHref(workspaceHref)}
                      onFocus={() => prefetchPlatformCoreW2FromHref(workspaceHref)}
                    >
                      Открыть рабочий экран
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                  <div className={hubCabinet.insightGrid}>
                    <RoleCorePillarInsightCards
                      roleId={roleId}
                      pillarId={selectedPillar}
                      compact
                      sectionId={insightSectionId}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </main>
        {coreMode && cell.kind === 'active' && showActionRail ? (
          <div className="max-lg:hidden lg:col-start-3 lg:row-start-1">
            <PillarCabinetActionRail
              primary={cabinetActions.primary}
              secondary={cabinetActions.secondary}
              workspace={cabinetActions.workspace}
              onPrefetch={prefetchPlatformCoreW2FromHref}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RoleCoreCabinetHubWithCollection(props: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));
  return (
    <PlatformCoreChromeShell collectionId={collectionId}>
      <RoleCoreCabinetHubInner {...props} />
    </PlatformCoreChromeShell>
  );
}

export function RoleCoreCabinetHub(props: Props) {
  return <RoleCoreCabinetHubWithCollection {...props} />;
}
