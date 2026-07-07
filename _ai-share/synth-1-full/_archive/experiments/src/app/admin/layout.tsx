'use client';

import React, { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  CabinetHubMain,
  CabinetHubSectionBar,
  CabinetHubTitleRow,
} from '@/components/layout/cabinet-hub-chrome';
import { cabinetRoleLabelRu } from '@/lib/ui/cabinet-role-labels';
import { ErrorBoundary } from '@/components/error-boundary';
import { useRbac } from '@/hooks/useRbac';
import { useAuth } from '@/providers/auth-provider';
import { HUB_AUTH_FULLSCREEN_SPINNER } from '@/lib/syntha-api-mode';
import { adminNavGroups } from '@/lib/data/admin-navigation-normalized';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { HubSidebarHeader } from '@/components/hub/HubSidebarHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { cabinetHubLayout, cabinetSidebarLayout } from '@/lib/ui/cabinet-surface';
import { ROUTES } from '@/lib/routes';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const { role } = useRbac();
  const { loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading && HUB_AUTH_FULLSCREEN_SPINNER) {
    return (
      <div className={cabinetHubLayout.loadingShell}>
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const getCurrentLabel = () => {
    const sorted = adminNavGroups
      .flatMap((g) => g.links)
      .sort((a, b) => b.href.length - a.href.length);
    const current = sorted.find((link) => {
      const p = (pathname || '').replace(/\/$/, '') || '/';
      const h = link.href.replace(/\/$/, '') || '/';
      if (h === ROUTES.admin.home) return p === ROUTES.admin.home;
      return p === h || p.startsWith(h + '/');
    });
    const group = adminNavGroups.find((g) => g.links.some((l) => l.value === current?.value));
    return group?.label || 'Контроль';
  };

  const activeLink = adminNavGroups
    .flatMap((g) => g.links)
    .find(
      (l) => pathname === l.href || (pathname || '').startsWith(l.href.replace(/\/$/, '') + '/')
    );

  return (
    <ErrorBoundary>
      <div className={cabinetHubLayout.rootShell}>
        <aside
          className={cn(cabinetHubLayout.asideChrome, cabinetSidebarLayout.asideWidthStandard)}
        >
          <HubSidebarHeader
            href={ROUTES.admin.home}
            icon={Shield}
            title="Админ-центр"
            badge="HQ"
            badgeClass="bg-amber-50 text-amber-600"
            iconBgClass="bg-text-primary"
          />
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            <Suspense
              fallback={
                <div className="mx-3 my-4 h-24 animate-pulse rounded-md bg-muted/40" aria-hidden />
              }
            >
              <HubSidebar
                groups={adminNavGroups}
                basePath={ROUTES.admin.home}
                accentClass="text-amber-600"
                activeBgClass="bg-text-primary"
              />
            </Suspense>
          </div>
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
            <div className="shrink-0 pb-0 pt-12">
              <HubSidebarHeader
                href={ROUTES.admin.home}
                icon={Shield}
                title="Админ-центр"
                badge="HQ"
                badgeClass="bg-amber-50 text-amber-600"
                iconBgClass="bg-text-primary"
              />
            </div>
            <div className="border-border-subtle shrink-0 border-b px-3 pb-2">
              <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                Навигация
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Suspense
                fallback={
                  <div
                    className="mx-3 my-4 h-24 animate-pulse rounded-md bg-muted/40"
                    aria-hidden
                  />
                }
              >
                <HubSidebar
                  groups={adminNavGroups}
                  basePath={ROUTES.admin.home}
                  accentClass="text-amber-600"
                  activeBgClass="bg-text-primary"
                  onNavigate={() => setSidebarOpen(false)}
                />
              </Suspense>
            </div>
          </SheetContent>
        </Sheet>

        <div className={cn('min-w-0 flex-1', cabinetSidebarLayout.mainPaddingLeftStandard)}>
          <CabinetHubMain className="space-y-2 pt-2">
            <CabinetHubTitleRow
              className="border-border-subtle gap-2 border-b pb-2"
              onOpenMobileNav={() => setSidebarOpen(true)}
              hubIcon={Shield}
              iconTileClassName="bg-text-primary text-text-inverse shadow-sm ring-1 ring-border-subtle"
              title="Админ-центр"
              badges={
                <Badge
                  variant="outline"
                  className="shrink-0 border-amber-200 text-[8px] font-bold text-amber-700"
                >
                  {cabinetRoleLabelRu(role)}
                </Badge>
              }
              showDemoMark
            />
            <CabinetHubSectionBar
              accentClassName="bg-amber-500"
              breadcrumbItems={['Аккаунт', 'Админ-центр', getCurrentLabel()]}
              sectionTitle={getCurrentLabel()}
              trailing={
                activeLink ? (
                  <Badge
                    variant="outline"
                    className="border-border-subtle rounded-sm text-[9px] font-black uppercase"
                  >
                    {activeLink.label}
                  </Badge>
                ) : undefined
              }
            />

            <main className={cabinetHubLayout.mainInner}>
              <ErrorBoundary>
                <Suspense
                  fallback={<div className={cabinetHubLayout.suspenseFallback} aria-busy />}
                >
                  {children}
                </Suspense>
              </ErrorBoundary>
            </main>
          </CabinetHubMain>
        </div>
      </div>
    </ErrorBoundary>
  );
}
