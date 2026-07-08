'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

/**
 * Сайдбар factory/supplier layout — supplierNavGroups в отдельном chunk.
 */
import { useMemo } from 'react';
import { HubSidebarLazy } from '@/components/hub/HubSidebarLazy';
import { isFactoryNavInvestorSpineEnabled } from '@/lib/cabinet-nav-env';
import {
  applyFactoryNavPipeline,
  FACTORY_SUP_CORE_PILLARS_NAV_ORDER,
  filterNavGroupsForCoreSidebar,
  resolveSidebarClustersForCore,
  shouldHideNavArchiveCluster,
} from '@/lib/cabinet-core-mode';
import { augmentSupplierNavForCoreCabinet } from '@/lib/platform-core-nav-augment';
import { supplierNavGroups } from '@/lib/data/factory-navigation';
import {
  FACTORY_SUP_ARCHIVE_GROUP_ORDER,
  FACTORY_SUP_CORE_GROUP_ORDER,
  FACTORY_SUP_INVESTOR_SPINE_CORE_GROUP_ORDER,
} from '@/lib/data/syntha-nav-clusters';
import { ROUTES } from '@/lib/routes';

type FactorySupplierLayoutSidebarPanelProps = {
  onNavigate?: () => void;
};

export function FactorySupplierLayoutSidebarPanel({
  onNavigate,
}: FactorySupplierLayoutSidebarPanelProps) {
  const groups = useMemo(
    () =>
      filterNavGroupsForCoreSidebar(
        augmentSupplierNavForCoreCabinet(applyFactoryNavPipeline(supplierNavGroups, 'supplier'))
      ),
    []
  );
  const visibleClusters = resolveSidebarClustersForCore();
  const coreGroupOrder = shouldHideNavArchiveCluster()
    ? FACTORY_SUP_CORE_PILLARS_NAV_ORDER
    : isFactoryNavInvestorSpineEnabled()
      ? FACTORY_SUP_INVESTOR_SPINE_CORE_GROUP_ORDER
      : FACTORY_SUP_CORE_GROUP_ORDER;

  return (
    <HubSidebarLazy
      groups={groups}
      basePath={EXTENDED_ROUTES.factory.supplier}
      ariaLabel="Меню поставщика"
      accentClass="text-emerald-600"
      activeBgClass="bg-emerald-600"
      onNavigate={onNavigate}
      sidebarClusters={visibleClusters}
      coreGroupOrder={coreGroupOrder}
      archiveGroupOrder={FACTORY_SUP_ARCHIVE_GROUP_ORDER}
    />
  );
}
