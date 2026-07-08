'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Store, Factory, ShoppingCart, Loader2, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRbac } from '@/hooks/useRbac';
import { useAuth } from '@/providers/auth-provider';
import { HUB_AUTH_FULLSCREEN_SPINNER } from '@/lib/syntha-api-mode';
import { canAccessHub } from '@/lib/data/profile-page-features';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/error-boundary';
import { distributorNavGroups } from '@/lib/data/distributor-navigation';
import {
  DISTRIBUTOR_ARCHIVE_GROUP_ORDER,
  DISTRIBUTOR_CORE_GROUP_ORDER,
  DISTRIBUTOR_INVESTOR_SPINE_CORE_GROUP_ORDER,
  SYNTHA_SIDEBAR_CLUSTERS,
} from '@/lib/data/syntha-nav-clusters';
import { isDistributorNavInvestorSpineEnabled } from '@/lib/cabinet-nav-env';
import {
  applyDistributorNavPipeline,
  shouldHideNavArchiveCluster,
} from '@/lib/cabinet-core-mode';
import { augmentDistributorNavForCoreCabinet } from '@/lib/platform-core-nav-augment';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { HubSidebarHeader } from '@/components/hub/HubSidebarHeader';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  CabinetHubMain,
  CabinetHubSectionBar,
  CabinetHubTitleRow,
} from '@/components/layout/cabinet-hub-chrome';
import { cabinetRoleLabelRu } from '@/lib/ui/cabinet-role-labels';
import { cabinetHubLayout, cabinetSidebarLayout, cabinetSurface } from '@/lib/ui/cabinet-surface';
import { resolveCabinetActiveNavLink } from '@/lib/ui/cabinet-nav-active';
import { ROUTES } from '@/lib/routes';

const DISTRIBUTOR_ROLES = ['distributor', 'admin'];

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const { role } = useRbac();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasAccess = DISTRIBUTOR_ROLES.includes(role);

  const hubs = [
    { href: ROUTES.brand.home, hub: 'brand' as const, label: 'Бренд', icon: Store },
    { href: ROUTES.shop.home, hub: 'shop' as const, label: 'Магазин', icon: ShoppingCart },
    {
      href: ROUTES.factory.production,
      hub: 'factory' as const,
      label: 'Производство',
      icon: Factory,
    },
    {
      href: ROUTES.factory.supplier,
      hub: 'supplier' as const,
      label: 'Поставщик',
      icon: Warehouse,
    },
  ].filter((h) => canAccessHub(role, h.hub));

  const adjustedDistributorNavGroups = useMemo(
    () =>
      augmentDistributorNavForCoreCabinet(applyDistributorNavPipeline(distributorNavGroups)),
    []
  );
  const visibleClusters = shouldHideNavArchiveCluster()
    ? SYNTHA_SIDEBAR_CLUSTERS.filter((c) => c.id === 'syntha-cores')
    : SYNTHA_SIDEBAR_CLUSTERS;
  const distributorCoreOrder = isDistributorNavInvestorSpineEnabled()
    ? DISTRIBUTOR_INVESTOR_SPINE_CORE_GROUP_ORDER
    : DISTRIBUTOR_CORE_GROUP_ORDER;

  if (loading && HUB_AUTH_FULLSCREEN_SPINNER) {
    return (
      <div className={cabinetHubLayout.loadingShell}>
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={cabinetSurface.hubAccessDeniedShell}>
        <p className="text-text-secondary mb-2 font-medium">
          Нет доступа к кабинету дистрибьютора для роли {role}
        </p>
        <p className="text-text-muted mb-4 text-sm">Доступ: роль «дистрибутор».</p>
        <Link href="/" className="text-accent-primary text-sm font-bold hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  const sectionLabel =
    resolveCabinetActiveNavLink(pathname, adjustedDistributorNavGroups)?.label ?? 'Дашборд';

  return (
    <ErrorBoundary>
      <div className={cabinetHubLayout.rootShell}>
        <aside
          className={cn(cabinetHubLayout.asideChrome, cabinetSidebarLayout.asideWidthStandard)}
        >
          <HubSidebarHeader
            href={ROUTES.distributor.home}
            icon={Briefcase}
            title="Кабинет дистрибьютора"
            badge="Опт"
            badgeClass="bg-amber-50 text-amber-600"
            iconBgClass="bg-amber-900"
          />
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            <HubSidebar
              groups={adjustedDistributorNavGroups}
              basePath={ROUTES.distributor.home}
              accentClass="text-amber-600"
              activeBgClass="bg-amber-600"
              sidebarClusters={visibleClusters}
              coreGroupOrder={distributorCoreOrder}
              archiveGroupOrder={DISTRIBUTOR_ARCHIVE_GROUP_ORDER}
            />
          </div>
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
            <SheetTitle className="sr-only">Меню кабинета дистрибьютора</SheetTitle>
            <div className="shrink-0 pb-0 pt-12">
              <HubSidebarHeader
                href={ROUTES.distributor.home}
                icon={Briefcase}
                title="Кабинет дистрибьютора"
                badge="Опт"
                badgeClass="bg-amber-50 text-amber-600"
                iconBgClass="bg-amber-900"
              />
            </div>
            <div className="border-border-subtle shrink-0 border-b px-3 pb-2">
              <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                Навигация
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <HubSidebar
                groups={adjustedDistributorNavGroups}
                basePath={ROUTES.distributor.home}
                accentClass="text-amber-600"
                activeBgClass="bg-amber-600"
                onNavigate={() => setSidebarOpen(false)}
                sidebarClusters={visibleClusters}
                coreGroupOrder={distributorCoreOrder}
                archiveGroupOrder={DISTRIBUTOR_ARCHIVE_GROUP_ORDER}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className={cn('min-w-0 flex-1', cabinetSidebarLayout.mainPaddingLeftStandard)}>
          <CabinetHubMain className="space-y-2 pt-2">
            <CabinetHubTitleRow
              className="border-border-subtle gap-2 border-b pb-2"
              onOpenMobileNav={() => setSidebarOpen(true)}
              hubIcon={Briefcase}
              iconTileClassName="bg-amber-900 text-white shadow-sm ring-1 ring-border-subtle"
              title="Кабинет дистрибьютора"
              badges={
                <Badge
                  variant="outline"
                  className="shrink-0 border-amber-200 text-[8px] font-bold text-amber-700"
                >
                  {cabinetRoleLabelRu(role)}
                </Badge>
              }
              showDemoMark
              trailing={
                <nav className="flex flex-wrap items-center gap-2" aria-label="Переключение хабов">
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
              accentClassName="bg-amber-500"
              breadcrumbItems={['Аккаунт', 'Кабинет дистрибьютора', sectionLabel]}
              sectionTitle={sectionLabel}
            />

            <main className={cabinetHubLayout.mainInner}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </CabinetHubMain>
        </div>
      </div>
    </ErrorBoundary>
  );
}
