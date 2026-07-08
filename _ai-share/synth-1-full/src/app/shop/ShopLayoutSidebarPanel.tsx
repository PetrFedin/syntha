'use client';

/**
 * Сайдбар shop layout — shopNavGroups + RBAC в отдельном chunk (не в initial layout).
 */
import { useMemo } from 'react';
import { ShopSidebarLazy } from '@/components/shop/ShopSidebarLazy';
import { canSeeShopNavGroup } from '@/lib/data/profile-page-features';
import { shopNavGroups } from '@/lib/data/shop-navigation-data';
import { filterShopNavGroupsByTier, getShopNavDisplayMode } from '@/lib/data/shop-navigation-utils';
import { applyShopNavPipeline, filterNavGroupsForCoreSidebar } from '@/lib/cabinet-core-mode';
import { augmentShopNavForCoreCabinet } from '@/lib/platform-core-nav-augment';
import type { useRbac } from '@/hooks/useRbac';

type ShopLayoutSidebarPanelProps = {
  role: ReturnType<typeof useRbac>['role'];
  can: ReturnType<typeof useRbac>['can'];
  onNavigate?: () => void;
};

export function ShopLayoutSidebarPanel({ role, can, onNavigate }: ShopLayoutSidebarPanelProps) {
  const sidebarGroups = useMemo(() => {
    const piped = augmentShopNavForCoreCabinet(applyShopNavPipeline(shopNavGroups));
    const rbacFiltered = piped.filter((g) => canSeeShopNavGroup(role, g.id, can));
    const afterRbac = rbacFiltered.length > 0 ? rbacFiltered : piped;
    return filterNavGroupsForCoreSidebar(
      filterShopNavGroupsByTier(afterRbac, getShopNavDisplayMode())
    );
  }, [role, can]);

  return (
    <ShopSidebarLazy groups={sidebarGroups} ariaLabel="Меню магазина" onNavigate={onNavigate} />
  );
}
