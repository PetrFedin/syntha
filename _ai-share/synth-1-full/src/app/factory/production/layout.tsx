'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import React, { useState, Suspense, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Factory, Store, Briefcase, ShoppingCart, Loader2, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRbac } from '@/hooks/useRbac';
import { useAuth } from '@/providers/auth-provider';
import { HUB_AUTH_FULLSCREEN_SPINNER } from '@/lib/syntha-api-mode';
import { canAccessHub } from '@/lib/data/profile-page-features';
import { ErrorBoundary } from '@/components/error-boundary';
import { manufacturerNavGroups } from '@/lib/data/factory-navigation';
import {
  FACTORY_MFR_ARCHIVE_GROUP_ORDER,
  FACTORY_MFR_CORE_GROUP_ORDER,
  FACTORY_MFR_INVESTOR_SPINE_CORE_GROUP_ORDER,
  SYNTHA_SIDEBAR_CLUSTERS,
} from '@/lib/data/syntha-nav-clusters';
import {
  applyFactoryManufacturerInvestorSpineClusterOverrides,
  isFactoryNavInvestorSpineEnabled,
} from '@/lib/cabinet-nav-env';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { HubSidebarHeader } from '@/components/hub/HubSidebarHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  CabinetHubMain,
  CabinetHubMobileNavOnly,
  CabinetHubSectionBar,
  CabinetHubTitleRow,
} from '@/components/layout/cabinet-hub-chrome';
import { cn } from '@/lib/utils';
import { cabinetHubLayout, cabinetSidebarLayout, cabinetSurface } from '@/lib/ui/cabinet-surface';
import { resolveCabinetActiveNavLink } from '@/lib/ui/cabinet-nav-active';
import { cabinetRoleLabelRu } from '@/lib/ui/cabinet-role-labels';
import { ROUTES } from '@/lib/routes';
import { shouldBypassHubRbacForCoreCabinet } from '@/lib/platform-core-cabinet-route';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { FactoryProductionLayoutSidebarPanel } from '@/app/factory/production/FactoryProductionLayoutSidebarPanel';

const FACTORY_PRODUCTION_ROLES = [
  'manufacturer',
  'designer',
  'technologist',
  'production_manager',
  'admin',
  'platform_admin',
];

function FactoryProductionLayoutContent({ children }: { children: React.ReactNode }) {
  const platformCore = isPlatformCoreMode();
  const pathname = usePathname();
  const { loading } = useAuth();
  const { role } = useRbac();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasAccess = FACTORY_PRODUCTION_ROLES.includes(role);

  const hubs = [
    { href: ROUTES.brand.home, label: 'Бренд', icon: Store, hub: 'brand' as const },
    { href: ROUTES.shop.home, label: 'Магазин', icon: ShoppingCart, hub: 'shop' as const },
    {
      href: ROUTES.distributor.home,
      label: 'Дистрибьютор',
      icon: Briefcase,
      hub: 'distributor' as const,
    },
    {
      href: EXTENDED_ROUTES.factory.supplier,
      label: 'Поставщик',
      icon: Warehouse,
      hub: 'supplier' as const,
    },
  ].filter((h) => canAccessHub(role, h.hub));

  const adjustedManufacturerNavGroups = useMemo(
    () => applyFactoryManufacturerInvestorSpineClusterOverrides(manufacturerNavGroups),
    []
  );
  const factoryMfrCoreOrder = isFactoryNavInvestorSpineEnabled()
    ? FACTORY_MFR_INVESTOR_SPINE_CORE_GROUP_ORDER
    : FACTORY_MFR_CORE_GROUP_ORDER;

  if (loading && HUB_AUTH_FULLSCREEN_SPINNER) {
    return (
      <div className={cabinetHubLayout.loadingShell}>
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!hasAccess && !shouldBypassHubRbacForCoreCabinet(pathname)) {
    return (
      <div className={cabinetSurface.hubAccessDeniedShell}>
        <p className="text-text-secondary mb-2 font-medium">
          Нет доступа к кабинету производства для роли {role}
        </p>
        <p className="text-text-muted mb-4 text-sm">
          Доступ: производитель, дизайнер, технолог, руководитель производства.
        </p>
        <Link href="/" className="text-accent-primary text-sm font-bold hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  const sectionLabel =
    resolveCabinetActiveNavLink(pathname, adjustedManufacturerNavGroups)?.label ?? 'Дашборд';

  return (
    <ErrorBoundary>
      <div className={cabinetHubLayout.rootShell}>
        <aside
          className={cn(cabinetHubLayout.asideChrome, cabinetSidebarLayout.asideWidthStandard)}
          data-testid="factory-mfr-sidebar"
        >
          <HubSidebarHeader
            href={EXTENDED_ROUTES.factory.production}
            icon={Factory}
            title="Кабинет производства"
            badge="Производство"
            badgeClass="bg-emerald-50 text-emerald-600"
            iconBgClass="bg-emerald-900"
          />
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            {platformCore ? (
              <FactoryProductionLayoutSidebarPanel />
            ) : (
              <HubSidebar
                groups={adjustedManufacturerNavGroups}
                basePath={EXTENDED_ROUTES.factory.production}
                accentClass="text-emerald-600"
                activeBgClass="bg-emerald-600"
                sidebarClusters={SYNTHA_SIDEBAR_CLUSTERS}
                coreGroupOrder={factoryMfrCoreOrder}
                archiveGroupOrder={FACTORY_MFR_ARCHIVE_GROUP_ORDER}
              />
            )}
          </div>
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
            <div className="shrink-0 pb-0 pt-12">
              <HubSidebarHeader
                href={EXTENDED_ROUTES.factory.production}
                icon={Factory}
                title="Кабинет производства"
                badge="Производство"
                badgeClass="bg-emerald-50 text-emerald-600"
                iconBgClass="bg-emerald-900"
              />
            </div>
            <div className="border-border-subtle shrink-0 border-b px-3 pb-2">
              <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                Навигация
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {platformCore ? (
                <FactoryProductionLayoutSidebarPanel onNavigate={() => setSidebarOpen(false)} />
              ) : (
                <HubSidebar
                  groups={adjustedManufacturerNavGroups}
                  basePath={EXTENDED_ROUTES.factory.production}
                  accentClass="text-emerald-600"
                  activeBgClass="bg-emerald-600"
                  onNavigate={() => setSidebarOpen(false)}
                  sidebarClusters={SYNTHA_SIDEBAR_CLUSTERS}
                  coreGroupOrder={factoryMfrCoreOrder}
                  archiveGroupOrder={FACTORY_MFR_ARCHIVE_GROUP_ORDER}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className={cn('min-w-0 flex-1', cabinetSidebarLayout.mainPaddingLeftStandard)}>
          <CabinetHubMain className="space-y-2 pt-2">
            {platformCore ? (
              <CabinetHubMobileNavOnly onOpenMobileNav={() => setSidebarOpen(true)} />
            ) : (
              <>
                <CabinetHubTitleRow
                  className="border-border-subtle gap-2 border-b pb-2"
                  onOpenMobileNav={() => setSidebarOpen(true)}
                  hubIcon={Factory}
                  iconTileClassName="bg-emerald-900 text-white shadow-sm ring-1 ring-border-subtle"
                  title="Кабинет производства"
                  badges={
                    <Badge
                      variant="outline"
                      className="shrink-0 border-emerald-200 text-[8px] font-bold text-emerald-700"
                    >
                      {cabinetRoleLabelRu(role)}
                    </Badge>
                  }
                  trailing={
                    <nav
                      className="flex flex-wrap items-center gap-2"
                      aria-label="Переключение хабов"
                    >
                      {hubs.map((hub) => {
                        const HubIcon = hub.icon;
                        return (
                          <Link
                            key={hub.href}
                            href={hub.href}
                            className={cabinetHubLayout.hubSwitcherLink}
                          >
                            <HubIcon className="size-3.5" aria-hidden /> {hub.label}
                          </Link>
                        );
                      })}
                    </nav>
                  }
                />
                <CabinetHubSectionBar
                  accentClassName="bg-emerald-500"
                  breadcrumbItems={['Аккаунт', 'Завод', 'Производство', sectionLabel]}
                  sectionTitle={sectionLabel}
                />
              </>
            )}

            <main className={cabinetHubLayout.mainInner}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </CabinetHubMain>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function FactoryProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            cabinetHubLayout.loadingShell,
            'text-text-muted flex flex-col gap-3 text-xs font-medium uppercase tracking-widest'
          )}
        >
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          Загрузка…
        </div>
      }
    >
      <FactoryProductionLayoutContent>{children}</FactoryProductionLayoutContent>
    </Suspense>
  );
}
