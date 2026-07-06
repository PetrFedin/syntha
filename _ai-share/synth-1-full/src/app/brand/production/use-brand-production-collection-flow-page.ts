'use client';

import { useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { BrandProductionCollectionFlowPageViewProps } from '@/app/brand/production/brand-production-collection-flow-page-view';
import products from '@/lib/products';
import { initialOrderItems } from '@/lib/order-data';
import {
  getProductionFloorTabTitle,
  mergeCollectionQuery,
} from '@/app/brand/production/production-page-utils';
import { MOCK_COLLECTIONS } from '@/app/brand/production/production-page-demo-data';
import { useBrandProductionLocalArticles } from '@/app/brand/production/use-brand-production-local-articles';
import { useBrandProductionLocalInventory } from '@/app/brand/production/use-brand-production-local-inventory';
import { deriveCollectionSeasonOptionsFromProducts } from '@/app/brand/production/production-page-collection-options';
import { buildArticleSeedsFromOrderItems } from '@/app/brand/production/production-page-article-seeds';
import {
  buildItemsForCollection,
  type ProductionPageOrderLike,
} from '@/app/brand/production/production-page-build-items-for-collection';
import {
  buildWorkshopCollectionsDisplay,
  formatProductionCollectionLabel,
  isUserDefinedProductionCollection,
  mergeCollectionSelectOptions,
} from '@/app/brand/production/production-page-collection-ui-helpers';
import { buildLocalRemovableArticlesFromItems } from '@/app/brand/production/production-page-local-removable-articles';
import { useBrandProductionWorkshopStageChainSection } from '@/app/brand/production/use-brand-production-workshop-stage-chain-section';
import { useBrandProductionFloorTabsPath } from '@/app/brand/production/use-brand-production-floor-tabs-path';
import { useBrandProductionFloorTabsShellBundle } from '@/app/brand/production/use-brand-production-floor-tabs-shell-bundle';
import { useBrandProductionUnifiedSkuDoc } from '@/app/brand/production/use-brand-production-unified-sku-doc';
import { useBrandProductionCollectionArticlesModel } from '@/app/brand/production/use-brand-production-collection-articles-model';
import { useBrandProductionWorkshopFloorMocks } from '@/app/brand/production/use-brand-production-workshop-floor-mocks';
import { useBrandProductionCollectionArticlesListUi } from '@/app/brand/production/use-brand-production-collection-articles-list-ui';
import { useBrandProductionCollectionChecklist } from '@/app/brand/production/use-brand-production-collection-checklist';
import { useBrandProductionCollectionInventoryOverlay } from '@/app/brand/production/use-brand-production-collection-inventory-overlay';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { mergeCollectionInventoryOverlayArticles } from '@/lib/production/collection-inventory-overlay-store';

export function useBrandProductionCollectionFlowPage(): BrandProductionCollectionFlowPageViewProps {
  const { toast } = useToast();
  const {
    searchParams,
    router,
    pathname,
    collectionIdFromQuery,
    effectiveCollectionId,
    collectionFlowKey,
    tab,
    setTabState,
    suppliesSub,
    setSuppliesSub,
    sampleSub,
    setSampleSub,
    launchSub,
    setLaunchSub,
    qualitySub,
    setQualitySub,
    floorHref,
    handleLiveContextCollectionChange,
    handleCollectionChange,
  } = useBrandProductionFloorTabsPath();

  const collectionOptions = useMemo(
    () => deriveCollectionSeasonOptionsFromProducts(products),
    [products]
  );

  const {
    localInventory,
    setLocalInventory,
    localInventoryHydrated,
    pushUserCollection,
    exportLocalInventory,
    importLocalInventory,
  } = useBrandProductionLocalInventory();

  const {
    overlayArticles,
    persistMode: overlayPersistMode,
    pgUnavailable: overlayPgUnavailable,
    overlayHydrated,
    updateOverlayArticles,
  } = useBrandProductionCollectionInventoryOverlay(collectionIdFromQuery);

  const collectionSelectOptions = useMemo(
    () => mergeCollectionSelectOptions(collectionOptions, localInventory.userCollections),
    [collectionOptions, localInventory.userCollections]
  );

  const workshopCollectionsDisplay = useMemo(
    () => buildWorkshopCollectionsDisplay(localInventory, MOCK_COLLECTIONS),
    [localInventory]
  );

  const pendingFocusLocalSkuRef = useRef<string | null>(null);

  const collectionLabel = useMemo(
    () => formatProductionCollectionLabel(collectionIdFromQuery),
    [collectionIdFromQuery]
  );

  const itemsForCollection = useMemo(() => {
    const seedItems = buildItemsForCollection({
      collectionIdFromQuery,
      initialOrderItems: initialOrderItems as readonly ProductionPageOrderLike[],
      articlesByCollection: isPlatformCoreMode() ? {} : localInventory.articlesByCollection,
    });
    if (isPlatformCoreMode()) {
      return mergeCollectionInventoryOverlayArticles(
        seedItems,
        overlayArticles,
        collectionIdFromQuery
      ) as ProductionPageOrderLike[];
    }
    return seedItems;
  }, [collectionIdFromQuery, localInventory.articlesByCollection, overlayArticles]);

  const localRemovableArticles = useMemo(
    () =>
      buildLocalRemovableArticlesFromItems(itemsForCollection as { id?: unknown; sku?: unknown }[]),
    [itemsForCollection]
  );

  const isUserDefinedCollection = useMemo(
    () => isUserDefinedProductionCollection(collectionIdFromQuery, localInventory.userCollections),
    [localInventory.userCollections, collectionIdFromQuery]
  );

  const {
    dropStats,
    dropsWithMeta,
    dropLabelById,
    qcSummary,
    milestonesSummary,
    subcontractSummary,
    hasRisks,
  } = useBrandProductionWorkshopFloorMocks({ itemsForCollection });

  const articleSeeds = useMemo(
    () => buildArticleSeedsFromOrderItems(itemsForCollection as ProductionPageOrderLike[]),
    [itemsForCollection]
  );

  const { unifiedDoc, setUnifiedDoc, flowDocReady } = useBrandProductionUnifiedSkuDoc({
    collectionFlowKey,
    articleSeeds,
  });

  const { isLocalSkuDuplicate, pushLocalArticle, removeLocalArticle, removeCurrentUserCollection } =
    useBrandProductionLocalArticles({
      collectionIdFromQuery,
      collectionFlowKey,
      itemsForCollection,
      localInventory,
      setLocalInventory,
      setUnifiedDoc,
      pendingFocusLocalSkuRef,
      updateOverlayArticles,
    });

  const {
    collectionArticles,
    stagesSkuContextId,
    stagesSkuContextLine,
    stagesStepContextId,
    stagesStepContextTitle,
    stagesSkuCatalogContext,
    articleContextValid,
    handleCollectionModuleSaved,
    aggregateStatus,
    completedCount,
    progressPct,
    articlesByStage,
    totalForecastRevenue,
    totalForecastQty,
    articlesProgressSummary,
  } = useBrandProductionCollectionArticlesModel({
    searchParams,
    pathname,
    router,
    toast,
    tab,
    localInventoryHydrated: isPlatformCoreMode() ? overlayHydrated : localInventoryHydrated,
    collectionFlowKey,
    itemsForCollection,
    flowDocReady,
    pendingFocusLocalSkuRef,
    setUnifiedDoc,
  });

  const {
    articleSearch,
    setArticleSearch,
    articleFilterStage,
    setArticleFilterStage,
    articleFilterDrop,
    setArticleFilterDrop,
    articleFocusNeedsAttention,
    setArticleFocusNeedsAttention,
    articleSortBy,
    setArticleSortBy,
    displayedArticles,
    needsAttentionCount,
    exportArticlesCsv,
  } = useBrandProductionCollectionArticlesListUi({
    collectionArticles,
    collectionIdFromQuery,
    dropLabelById,
  });

  const { collectionQuery, workshopStageChainProps } = useBrandProductionWorkshopStageChainSection({
    collectionFlowKey,
    collectionIdFromQuery,
    collectionLabel,
    articlesByStage,
    aggregateStatus,
    onAfterModuleSave: handleCollectionModuleSaved,
  });

  const collectionChecklist = useBrandProductionCollectionChecklist({
    collectionArticles,
    collectionQuery,
    floorHref,
  });

  const { shell: floorTabsShellProps, setTab } = useBrandProductionFloorTabsShellBundle({
    searchParams,
    router,
    pathname,
    collectionIdFromQuery,
    effectiveCollectionId,
    collectionFlowKey,
    tab,
    setTabState,
    suppliesSub,
    setSuppliesSub,
    sampleSub,
    setSampleSub,
    launchSub,
    setLaunchSub,
    qualitySub,
    setQualitySub,
    floorHref,
    handleLiveContextCollectionChange,
    handleCollectionChange,
    unifiedDoc,
    setUnifiedDoc,
    flowDocReady,
    collectionArticles,
    stagesSkuContextId,
    stagesSkuContextLine,
    stagesStepContextId,
    stagesStepContextTitle,
    stagesSkuCatalogContext,
    articleContextValid,
    collectionQuery,
    workshopStageChainProps,
    localRemovableArticles,
    isUserDefinedCollection,
    pushLocalArticle,
    pushUserCollection,
    removeLocalArticle,
    removeCurrentUserCollection,
    exportLocalInventory,
    importLocalInventory,
    isLocalSkuDuplicate,
    mergeCollectionQuery,
    getProductionFloorTabTitle,
    collectionLabel,
    completedCount,
    collectionSelectOptions,
    workshopCollections: workshopCollectionsDisplay,
    progressPct,
    totalForecastQty,
    totalForecastRevenue,
    mockFloor: {
      dropsWithMeta,
      dropStats,
      dropLabelById,
      qcSummary,
      milestonesSummary,
      subcontractSummary,
      hasRisks,
    },
    collectionChecklist,
    needsAttentionCount,
    articlesProgressSummary,
    setArticleFocusNeedsAttention,
    displayedArticles,
    articleSearch,
    setArticleSearch,
    articleFilterStage,
    setArticleFilterStage,
    articleFilterDrop,
    setArticleFilterDrop,
    articleSortBy,
    setArticleSortBy,
    articleFocusNeedsAttention,
    exportArticlesCsv,
  });

  return {
    tab,
    onTabChange: setTab,
    shell: floorTabsShellProps,
    inventoryOverlayStrip: {
      collectionId: collectionIdFromQuery,
      overlayCount: overlayArticles.length,
      persistMode: overlayPersistMode,
      pgUnavailable: overlayPgUnavailable,
      loading: !overlayHydrated,
    },
  };
}
