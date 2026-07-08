'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { adminNavGroups } from '@/lib/data/admin-navigation-normalized';
import { clientNavGroups } from '@/lib/data/client-navigation';
import { distributorNavGroups } from '@/lib/data/distributor-navigation';
import { manufacturerNavGroups, supplierNavGroups } from '@/lib/data/factory-navigation';
import { shopNavGroups } from '@/lib/data/shop-navigation-normalized';
import { getBrandSectionMeta } from '@/lib/data/brand-navigation';
import { getClientSectionFallback } from '@/lib/data/client-section-fallbacks';
import { normalizePath, resolveCabinetActiveNavLink } from '@/lib/ui/cabinet-nav-active';
import { ROUTES } from '@/lib/routes';
import {
  CabinetModulePageHeader,
  type CabinetModulePageHeaderProps,
} from './cabinet-module-page-header';

function useCabinetBack(fallbackHref: string) {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [router, fallbackHref]);
}

type Override = Partial<
  Pick<CabinetModulePageHeaderProps, 'title' | 'description' | 'meta' | 'icon' | 'iconClassName'>
> &
  Pick<CabinetModulePageHeaderProps, never> & {
    showBack?: boolean;
  };

function buildHeaderProps(
  meta: { label: string; description?: string; icon?: LucideIcon } | null | undefined,
  overrides: Override,
  onBack: () => void,
  showBack: boolean
): CabinetModulePageHeaderProps {
  return {
    title: overrides.title ?? meta?.label ?? 'Раздел',
    description: overrides.description ?? meta?.description,
    meta: overrides.meta,
    icon: overrides.icon ?? meta?.icon,
    iconClassName: overrides.iconClassName,
    onBack: showBack ? onBack : undefined,
    showBack,
  };
}

/** ЛК клиента (`/client`, `/orders`, …) — заголовок и описание из `client-navigation`. */
export function ClientCabinetSectionHeader(overrides: Override = {}) {
  const pathname = usePathname();
  const onBack = useCabinetBack(ROUTES.client.home);
  const link = resolveCabinetActiveNavLink(pathname, clientNavGroups);
  const fallback = !link ? getClientSectionFallback(normalizePath(pathname ?? '')) : undefined;
  const base = link ?? fallback;
  const showBack = overrides.showBack !== false;
  return (
    <CabinetModulePageHeader
      {...buildHeaderProps(base ?? undefined, overrides, onBack, showBack)}
    />
  );
}

/** Кабинет магазина — из `shopNavGroups` (включая подразделы). */
export function ShopCabinetSectionHeader(overrides: Override = {}) {
  const pathname = usePathname();
  const onBack = useCabinetBack(ROUTES.shop.home);
  const link = resolveCabinetActiveNavLink(pathname, shopNavGroups);
  const showBack = overrides.showBack !== false;
  return (
    <CabinetModulePageHeader
      {...buildHeaderProps(link ?? undefined, overrides, onBack, showBack)}
    />
  );
}

/** Админ-центр — из `adminNavGroups`. */
export function AdminCabinetSectionHeader(overrides: Override = {}) {
  const pathname = usePathname();
  const onBack = useCabinetBack(ROUTES.admin.home);
  const link = resolveCabinetActiveNavLink(pathname, adminNavGroups);
  const showBack = overrides.showBack !== false;
  return (
    <CabinetModulePageHeader
      {...buildHeaderProps(link ?? undefined, overrides, onBack, showBack)}
    />
  );
}

/** Дистрибьютор — из `distributorNavGroups`. */
export function DistributorCabinetSectionHeader(overrides: Override = {}) {
  const pathname = usePathname();
  const onBack = useCabinetBack(ROUTES.distributor.home);
  const link = resolveCabinetActiveNavLink(pathname, distributorNavGroups);
  const showBack = overrides.showBack !== false;
  return (
    <CabinetModulePageHeader
      {...buildHeaderProps(link ?? undefined, overrides, onBack, showBack)}
    />
  );
}

/** Производство — из `manufacturerNavGroups`. */
export function FactoryProductionCabinetSectionHeader(overrides: Override = {}) {
  const pathname = usePathname();
  const onBack = useCabinetBack(EXTENDED_ROUTES.factory.production);
  const link = resolveCabinetActiveNavLink(pathname, manufacturerNavGroups);
  const showBack = overrides.showBack !== false;
  return (
    <CabinetModulePageHeader
      {...buildHeaderProps(link ?? undefined, overrides, onBack, showBack)}
    />
  );
}

/** Поставщик — из `supplierNavGroups`. */
export function FactorySupplierCabinetSectionHeader(overrides: Override = {}) {
  const pathname = usePathname();
  const onBack = useCabinetBack(EXTENDED_ROUTES.factory.supplier);
  const link = resolveCabinetActiveNavLink(pathname, supplierNavGroups);
  const showBack = overrides.showBack !== false;
  return (
    <CabinetModulePageHeader
      {...buildHeaderProps(link ?? undefined, overrides, onBack, showBack)}
    />
  );
}

/**
 * Бренд-центр — `getBrandSectionMeta` (учёт query на `/brand`).
 * Заголовок: подраздел или раздел; описание из карточки навигации.
 */
export function BrandCabinetSectionHeader(
  overrides: Override & { pathnameOverride?: string } = {}
) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  const onBack = useCabinetBack(ROUTES.brand.home);
  const showBack = overrides.showBack !== false;

  const meta = getBrandSectionMeta(overrides.pathnameOverride ?? pathname, searchString);
  const title = overrides.title ?? meta?.subsectionLabel ?? meta?.sectionLabel ?? 'Бренд';
  const description = overrides.description ?? meta?.description;
  const Icon = overrides.icon ?? meta?.icon;

  return (
    <CabinetModulePageHeader
      title={title}
      description={description}
      meta={overrides.meta}
      icon={Icon}
      iconClassName={overrides.iconClassName}
      onBack={showBack ? onBack : undefined}
      showBack={showBack}
    />
  );
}
