'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

/**
 * Сайдбар factory/production layout — manufacturerNavGroups в отдельном chunk.
 */
import { useMemo } from 'react';
import { HubSidebarLazy } from '@/components/hub/HubSidebarLazy';
import { isFactoryNavInvestorSpineEnabled } from '@/lib/cabinet-nav-env';
import {
  applyFactoryNavPipeline,
  FACTORY_MFR_CORE_PILLARS_NAV_ORDER,
  filterNavGroupsForCoreSidebar,
  resolveSidebarClustersForCore,
  shouldHideNavArchiveCluster,
} from '@/lib/cabinet-core-mode';
import { augmentManufacturerNavForCoreCabinet } from '@/lib/platform-core-nav-augment';
import { manufacturerNavGroups } from '@/lib/data/factory-navigation';
import {
  FACTORY_MFR_ARCHIVE_GROUP_ORDER,
  FACTORY_MFR_CORE_GROUP_ORDER,
  FACTORY_MFR_INVESTOR_SPINE_CORE_GROUP_ORDER,
} from '@/lib/data/syntha-nav-clusters';
import { ROUTES } from '@/lib/routes';

type FactoryProductionLayoutSidebarPanelProps = {
  onNavigate?: () => void;
};

export function FactoryProductionLayoutSidebarPanel({
  onNavigate,
}: FactoryProductionLayoutSidebarPanelProps) {
  const groups = useMemo(
    () =>
      filterNavGroupsForCoreSidebar(
        augmentManufacturerNavForCoreCabinet(
          applyFactoryNavPipeline(manufacturerNavGroups, 'manufacturer')
        )
      ),
    []
  );
  const visibleClusters = resolveSidebarClustersForCore();
  const coreGroupOrder = shouldHideNavArchiveCluster()
    ? FACTORY_MFR_CORE_PILLARS_NAV_ORDER
    : isFactoryNavInvestorSpineEnabled()
      ? FACTORY_MFR_INVESTOR_SPINE_CORE_GROUP_ORDER
      : FACTORY_MFR_CORE_GROUP_ORDER;

  return (
    <HubSidebarLazy
      groups={groups}
      basePath={EXTENDED_ROUTES.factory.production}
      ariaLabel="Меню производства"
      accentClass="text-emerald-600"
      activeBgClass="bg-emerald-600"
      onNavigate={onNavigate}
      sidebarClusters={visibleClusters}
      coreGroupOrder={coreGroupOrder}
      archiveGroupOrder={FACTORY_MFR_ARCHIVE_GROUP_ORDER}
    />
  );
}
