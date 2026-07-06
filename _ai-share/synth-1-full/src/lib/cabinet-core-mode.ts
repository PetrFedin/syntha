/**
 * Platform Core — фокус на трёх столпах (ТЗ→образец, B2B, связь).
 * Включается через `NEXT_PUBLIC_PLATFORM_CORE_MODE=1` (см. `env.core.example`).
 */

import { ROUTES } from '@/lib/routes';
import { SYNTHA_SIDEBAR_CLUSTERS } from '@/lib/data/syntha-nav-clusters';
import { PLATFORM_CORE_SIDEBAR_CLUSTER_LABEL } from '@/lib/platform-core-canonical-labels';
import {
  applyBrandInvestorSpineClusterOverrides,
  applyDistributorInvestorSpineClusterOverrides,
  applyFactoryManufacturerInvestorSpineClusterOverrides,
  applyFactorySupplierInvestorSpineClusterOverrides,
  applyShopInvestorSpineClusterOverrides,
  isBrandNavInvestorSpineEnabled,
  isDistributorNavInvestorSpineEnabled,
  isFactoryNavInvestorSpineEnabled,
  isShopNavInvestorSpineEnabled,
} from '@/lib/cabinet-nav-env';

function isPublicOn(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const t = String(raw).trim().toLowerCase();
  return t === '1' || t === 'true' || t === 'yes' || t === 'on';
}

/** Единый флаг core-окружения (:3001 / worktree). */
export function isPlatformCoreMode(): boolean {
  return isPublicOn(
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE : undefined
  );
}

/** Strict: legacy page routes → redirect /platform (см. middleware). */
export function isPlatformCoreStrictMode(): boolean {
  return (
    isPlatformCoreMode() &&
    isPublicOn(
      typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PLATFORM_CORE_STRICT : undefined
    )
  );
}

/** Алиас для навигации бренда (совместимость с планом). */
export function isBrandNavCorePillarsOnly(): boolean {
  return isPlatformCoreMode();
}

/** Секция «Архив» в сайдбаре не рендерится в core. */
export function shouldHideNavArchiveCluster(): boolean {
  return isPlatformCoreMode();
}

type NavGroupClusterLike = { id: string; clusterId?: string };

/** В core sidebar — только группы основного контура (без archive в DOM и active-state). */
export function filterNavGroupsForCoreSidebar<T extends NavGroupClusterLike>(
  groups: readonly T[]
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return groups.filter((g) => g.clusterId === 'syntha-cores');
}

type SidebarClusterView = {
  id: (typeof SYNTHA_SIDEBAR_CLUSTERS)[number]['id'];
  label: string;
  order: number;
};

/** Кластеры sidebar: в core — один блок «Цепочка · 5 столпов». */
export function resolveSidebarClustersForCore(): readonly SidebarClusterView[] {
  if (!shouldHideNavArchiveCluster()) {
    return SYNTHA_SIDEBAR_CLUSTERS;
  }
  const cores = SYNTHA_SIDEBAR_CLUSTERS.find((c) => c.id === 'syntha-cores');
  if (!cores) return SYNTHA_SIDEBAR_CLUSTERS;
  return [{ ...cores, label: PLATFORM_CORE_SIDEBAR_CLUSTER_LABEL }];
}

export const BRAND_CORE_PILLARS_GROUP_IDS = new Set([
  'development',
  'production',
  'pim',
  'b2b',
  'comms',
]);

export const SHOP_CORE_PILLARS_GROUP_IDS = new Set(['pim', 'partners', 'b2b', 'comms']);

export const DISTRIBUTOR_CORE_PILLARS_GROUP_IDS = new Set([
  'comms',
  'partners',
  'b2b',
  'logistics',
]);

export const FACTORY_MFR_CORE_PILLARS_GROUP_IDS = new Set(['production', 'comms']);

export const FACTORY_SUP_CORE_PILLARS_GROUP_IDS = new Set(['pim', 'comms']);

/** Роли цепочки для RolePanel вне core (в core панель скрыта — см. shouldShowFloatingRolePanel). */
export const CORE_CHAIN_ROLE_KEYS = new Set(['brand', 'shop', 'manufacturer', 'supplier']);

/** Плавающая панель «Роли/Цепочка» справа — в core дублирует блоки на /platform. */
export function shouldShowFloatingRolePanel(): boolean {
  return !isPlatformCoreMode();
}

/** В core контент кабинета на всю ширину колонки (без узких max-w-5xl). */
export function resolveCabinetPageMaxWidth(
  requested: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'screen' | 'full'
): typeof requested {
  if (!isPlatformCoreMode()) return requested;
  return 'full';
}

export const BRAND_CORE_PILLARS_NAV_ORDER: readonly string[] = [
  'development',
  'pim',
  'b2b',
  'production',
  'comms',
];

export const SHOP_CORE_PILLARS_NAV_ORDER: readonly string[] = ['pim', 'partners', 'b2b', 'comms'];

export const FACTORY_MFR_CORE_PILLARS_NAV_ORDER: readonly string[] = ['production', 'comms'];

export const FACTORY_SUP_CORE_PILLARS_NAV_ORDER: readonly string[] = ['pim', 'comms'];

type NavGroupLike = {
  id: string;
  clusterId?: string;
  links?: Array<{
    label: string;
    value: string;
    href: string;
    icon: unknown;
    description?: string;
  }>;
};

function withArchiveClusterId<G extends NavGroupLike>(g: G): G {
  const next = Object.assign({}, g);
  next.clusterId = 'archive';
  return next;
}

/** Столп остаётся в основном контуре даже после investor spine (partners → archive). */
function withCoreClusterId<G extends NavGroupLike>(g: G): G {
  const next = Object.assign({}, g);
  next.clusterId = 'syntha-cores';
  return next;
}

function archiveExcept<T extends NavGroupLike>(groups: readonly T[], allowed: Set<string>): T[] {
  return groups.map((g) => (allowed.has(g.id) ? withCoreClusterId(g) : withArchiveClusterId(g)));
}

export function applyBrandCorePillarsClusterOverrides<T extends NavGroupLike>(
  groups: readonly T[]
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return archiveExcept(groups, BRAND_CORE_PILLARS_GROUP_IDS);
}

export function applyShopCorePillarsClusterOverrides<T extends NavGroupLike>(
  groups: readonly T[]
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return archiveExcept(groups, SHOP_CORE_PILLARS_GROUP_IDS);
}

export function applyDistributorCorePillarsClusterOverrides<T extends NavGroupLike>(
  groups: readonly T[]
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  return archiveExcept(groups, DISTRIBUTOR_CORE_PILLARS_GROUP_IDS);
}

/** Investor spine + core pillars для дистрибутора. */
export function applyDistributorNavPipeline<T extends NavGroupLike>(groups: readonly T[]): T[] {
  let out = [...groups];
  if (isDistributorNavInvestorSpineEnabled() || isPlatformCoreMode()) {
    out = applyDistributorInvestorSpineClusterOverrides(out);
  }
  return applyDistributorCorePillarsClusterOverrides(out);
}

export function applyFactoryCorePillarsClusterOverrides<T extends NavGroupLike>(
  groups: readonly T[],
  role: 'manufacturer' | 'supplier'
): T[] {
  if (!isPlatformCoreMode()) return [...groups];
  const allowed =
    role === 'manufacturer' ? FACTORY_MFR_CORE_PILLARS_GROUP_IDS : FACTORY_SUP_CORE_PILLARS_GROUP_IDS;
  return archiveExcept(groups, allowed);
}

/** Investor spine + core pillars для бренда. */
export function applyBrandNavPipeline<T extends NavGroupLike>(groups: readonly T[]): T[] {
  let out = [...groups];
  if (isBrandNavInvestorSpineEnabled() || isPlatformCoreMode()) {
    out = applyBrandInvestorSpineClusterOverrides(out);
  }
  out = applyBrandCorePillarsClusterOverrides(out);
  return out;
}

export function applyShopNavPipeline<T extends NavGroupLike>(groups: readonly T[]): T[] {
  let out = [...groups];
  if (isShopNavInvestorSpineEnabled() || isPlatformCoreMode()) {
    out = applyShopInvestorSpineClusterOverrides(out);
  }
  return applyShopCorePillarsClusterOverrides(out);
}

export function applyFactoryNavPipeline<T extends NavGroupLike>(
  groups: readonly T[],
  role: 'manufacturer' | 'supplier'
): T[] {
  let out = [...groups];
  if (isFactoryNavInvestorSpineEnabled() || isPlatformCoreMode()) {
    out =
      role === 'manufacturer'
        ? applyFactoryManufacturerInvestorSpineClusterOverrides(out)
        : applyFactorySupplierInvestorSpineClusterOverrides(out);
  }
  return applyFactoryCorePillarsClusterOverrides(out, role);
}

/** Стартовые URL ролей в core (не profile / retail hub). */
export function getCoreRoleLandingHref(roleKey: string): string | null {
  if (!isPlatformCoreMode()) return null;
  switch (roleKey) {
    case 'brand':
      return ROUTES.brand.coreCabinet;
    case 'shop':
      return ROUTES.shop.coreCabinet;
    case 'manufacturer':
      return ROUTES.factory.productionCoreCabinet;
    case 'supplier':
      return ROUTES.factory.supplierCoreCabinet;
    default:
      return null;
  }
}
