'use client';

/**
 * Сайдбар distributor layout — nav groups + clusters в отдельном chunk.
 */
import { useMemo } from 'react';
import { HubSidebarLazy } from '@/components/hub/HubSidebarLazy';
import {
  applyDistributorInvestorSpineClusterOverrides,
  isDistributorNavInvestorSpineEnabled,
} from '@/lib/cabinet-nav-env';
import { distributorNavGroups } from '@/lib/data/distributor-navigation';
import {
  DISTRIBUTOR_ARCHIVE_GROUP_ORDER,
  DISTRIBUTOR_CORE_GROUP_ORDER,
  DISTRIBUTOR_INVESTOR_SPINE_CORE_GROUP_ORDER,
  SYNTHA_SIDEBAR_CLUSTERS,
} from '@/lib/data/syntha-nav-clusters';
import { ROUTES } from '@/lib/routes';

type DistributorLayoutSidebarPanelProps = {
  onNavigate?: () => void;
};

export function DistributorLayoutSidebarPanel({ onNavigate }: DistributorLayoutSidebarPanelProps) {
  const groups = useMemo(
    () => applyDistributorInvestorSpineClusterOverrides(distributorNavGroups),
    []
  );
  const coreGroupOrder = isDistributorNavInvestorSpineEnabled()
    ? DISTRIBUTOR_INVESTOR_SPINE_CORE_GROUP_ORDER
    : DISTRIBUTOR_CORE_GROUP_ORDER;

  return (
    <HubSidebarLazy
      groups={groups}
      basePath={ROUTES.distributor.home}
      ariaLabel="Меню дистрибьютора"
      accentClass="text-amber-600"
      activeBgClass="bg-amber-600"
      onNavigate={onNavigate}
      sidebarClusters={SYNTHA_SIDEBAR_CLUSTERS}
      coreGroupOrder={coreGroupOrder}
      archiveGroupOrder={DISTRIBUTOR_ARCHIVE_GROUP_ORDER}
    />
  );
}
