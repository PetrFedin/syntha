'use client';

/**
 * Единая оболочка личного кабинета клиента: сайдбар, шапка хаба, контент.
 * Используется в `app/client/layout.tsx` и в корневых layout’ах `/orders`, `/academy`, `/wallet`
 * (экспорт `UserCabinetRouteLayout` — то же самое).
 */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useRbac } from '@/hooks/useRbac';
import { useAuth } from '@/providers/auth-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { clientNavGroups } from '@/lib/data/client-navigation';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { HubSidebarHeader } from '@/components/hub/HubSidebarHeader';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  CabinetHubMain,
  CabinetHubSectionBar,
  CabinetHubTitleRow,
} from '@/components/layout/cabinet-hub-chrome';
import { cn } from '@/lib/utils';
import { cabinetHubLayout, cabinetSidebarLayout, cabinetSurface } from '@/lib/ui/cabinet-surface';
import { nuOrderDeskShell } from '@/lib/ui/nuorder-desk-shell';
import { resolveCabinetActiveNavLink } from '@/lib/ui/cabinet-nav-active';
import { ROUTES } from '@/lib/routes';
import { getClientAcademyLearningActivity, getMyPlatformEnrollments } from '@/lib/education-data';

const CLIENT_ROLES = ['client', 'admin'];

function clientDisplayName(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'Профиль';
  const id = user.identity;
  if (id?.firstName || id?.lastName) {
    return [id.firstName, id.lastName].filter(Boolean).join(' ').trim();
  }
  if (user.displayName?.trim()) return user.displayName.trim();
  const mail = user.email?.split('@')[0];
  return mail ? mail.replace(/\./g, ' ') : 'Профиль';
}

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '••';
}

function clientPublicHandle(user: UserProfile | null): string {
  if (!user) return '—';
  const nick = user.nickname?.trim();
  if (nick) {
    const clean = nick.replace(/^@+/, '');
    return `@${clean}`;
  }
  const uid = user.uid?.trim();
  return uid || '—';
}

export function ClientCabinetShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const { loading, user } = useAuth();
  const { role } = useRbac();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasAccess = CLIENT_ROLES.includes(role);

  const clientNuOrderHub = pathname.startsWith('/client');
  const isAcademyHub = pathname === '/academy' || pathname.startsWith('/academy/');

  const profileName = useMemo(() => clientDisplayName(user), [user]);
  const initials = useMemo(() => clientInitials(profileName), [profileName]);
  const photo = user?.photoURL?.trim();
  const publicHandle = useMemo(() => clientPublicHandle(user), [user]);

  const academyProfileFooter = useMemo(() => {
    if (!isAcademyHub) return null;
    const activity = getClientAcademyLearningActivity(getMyPlatformEnrollments());
    const accentNum = clientNuOrderHub ? 'text-[#4a5fc8]' : 'text-accent-primary';
    const accentBar = clientNuOrderHub ? 'bg-[#4a5fc8]' : 'bg-accent-primary';
    return (
      <div className="border-border-subtle/90 bg-bg-surface2/60 rounded-md border px-2.5 py-2 shadow-sm">
        <div className="space-y-2">
          <div className="min-w-0">
            <p className="text-text-muted text-[10px] font-medium leading-tight">Активность</p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-0.5 leading-none">
              <span className={cn('text-sm font-bold tabular-nums tracking-tight', accentNum)}>
                {activity.activityScore}
              </span>
              <span className="text-text-muted text-[10px] font-normal tabular-nums">/ 100</span>
            </p>
          </div>
          <div className="border-border-subtle/70 min-w-0 border-t pt-2">
            <p className="text-text-muted text-[10px] font-medium leading-tight">Рейтинг</p>
            <p className="text-text-primary mt-0.5 text-[11px] font-semibold tabular-nums leading-tight">
              {activity.rankAmongClients.toLocaleString('ru-RU')}
              <span className="text-text-muted text-[10px] font-normal"> / </span>
              <span className="text-text-muted text-[10px] font-normal tabular-nums">
                {activity.totalClientsRanked.toLocaleString('ru-RU')}
              </span>
            </p>
          </div>
        </div>
        <div className="pointer-events-none mt-2" aria-hidden>
          <Progress
            value={activity.activityScore}
            className="bg-border-subtle/90 h-1 rounded-full"
            indicatorClassName={cn('rounded-full', accentBar)}
          />
        </div>
      </div>
    );
  }, [isAcademyHub, pathname, clientNuOrderHub]);

  /** Пока идёт dev auto-login / восстановление сессии, RBAC даёт «retailer» при пустых ролях — не показывать ложный «нет доступа» и не рендерить сайдбар без роли клиента. */
  if (loading) {
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
          Нет доступа к личному кабинету для роли {role}
        </p>
        <p className="text-text-muted mb-4 text-sm">Доступ: роль «клиент».</p>
        <Link href="/" className="text-accent-primary text-sm font-bold hover:underline">
          На главную
        </Link>
      </div>
    );
  }

  const sectionLabel = resolveCabinetActiveNavLink(pathname, clientNavGroups)?.label ?? 'Главная';

  return (
    <ErrorBoundary>
      <div
        className={cn(
          cabinetHubLayout.rootShell,
          clientNuOrderHub && nuOrderDeskShell.clientCabinetHubScope
        )}
        data-client-cabinet-nuorder={clientNuOrderHub ? 'true' : undefined}
      >
        <aside
          className={cn(cabinetHubLayout.asideChrome, cabinetSidebarLayout.asideWidthStandard)}
        >
          <HubSidebarHeader
            href={ROUTES.client.profile}
            icon={User}
            title="Личный кабинет"
            showRole={false}
            profile={{
              name: profileName,
              initials,
              photoURL: photo,
              clientId: publicHandle,
              profileFooter: isAcademyHub ? academyProfileFooter : undefined,
            }}
            badgeClass={
              clientNuOrderHub
                ? 'bg-[#4a5fc8]/12 text-[#4a5fc8] border border-[#4a5fc8]/25'
                : 'bg-accent-primary/10 text-accent-primary'
            }
            iconBgClass={
              clientNuOrderHub ? nuOrderDeskShell.clientCabinetHubIconTile : 'bg-accent-primary'
            }
          />
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            <HubSidebar
              groups={clientNavGroups}
              basePath={ROUTES.client.home}
              ariaLabel="Клиентское меню"
              accentClass={clientNuOrderHub ? 'text-[#4a5fc8]' : 'text-accent-primary'}
              activeBgClass={clientNuOrderHub ? 'bg-[#4a5fc8]' : 'bg-accent-primary'}
            />
          </div>
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className={cn(
              'flex w-72 flex-col gap-0 p-0',
              clientNuOrderHub && 'border-[#c5ccd6] bg-[#eef0f4]'
            )}
          >
            <SheetTitle className="sr-only">Меню личного кабинета</SheetTitle>
            <div className="shrink-0 pb-0 pt-12">
              <HubSidebarHeader
                href={ROUTES.client.profile}
                icon={User}
                title="Личный кабинет"
                showRole={false}
                profile={{
                  name: profileName,
                  initials,
                  photoURL: photo,
                  clientId: publicHandle,
                  profileFooter: isAcademyHub ? academyProfileFooter : undefined,
                }}
                badgeClass={
                  clientNuOrderHub
                    ? 'bg-[#4a5fc8]/12 text-[#4a5fc8] border border-[#4a5fc8]/25'
                    : 'bg-accent-primary/10 text-accent-primary'
                }
                iconBgClass={
                  clientNuOrderHub ? nuOrderDeskShell.clientCabinetHubIconTile : 'bg-accent-primary'
                }
              />
            </div>
            <div className="border-border-subtle shrink-0 border-b px-3 pb-2">
              <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                Навигация
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <HubSidebar
                groups={clientNavGroups}
                basePath={ROUTES.client.home}
                ariaLabel="Клиентское меню"
                accentClass={clientNuOrderHub ? 'text-[#4a5fc8]' : 'text-accent-primary'}
                activeBgClass={clientNuOrderHub ? 'bg-[#4a5fc8]' : 'bg-accent-primary'}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className={cn('min-w-0 flex-1', cabinetSidebarLayout.mainPaddingLeftStandard)}>
          <CabinetHubMain
            className={cn(
              'space-y-2 !px-2 pt-2 lg:!px-3',
              clientNuOrderHub &&
                'rounded-sm border border-[#c5ccd6]/70 bg-[#eceff3] lg:rounded-tl-none'
            )}
          >
            <CabinetHubTitleRow
              className="border-border-subtle gap-2 border-b pb-2"
              onOpenMobileNav={() => setSidebarOpen(true)}
              hubIcon={User}
              iconTileClassName={
                clientNuOrderHub
                  ? nuOrderDeskShell.clientCabinetHubIconTile
                  : 'bg-accent-primary text-white shadow-sm ring-1 ring-border-subtle'
              }
              title="Личный кабинет"
              showDemoMark
            />
            {/*
              Путь: Личный кабинет › Аккаунт › текущий раздел (как в навигации продукта).
            */}
            <CabinetHubSectionBar
              accentClassName={
                clientNuOrderHub ? nuOrderDeskShell.clientCabinetHubAccentRail : 'bg-accent-primary'
              }
              breadcrumbItems={[
                { label: 'Личный кабинет', href: ROUTES.client.home },
                { label: 'Аккаунт', href: ROUTES.client.profile },
                sectionLabel,
              ]}
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

/** Алиас: тот же хаб, что и `ClientCabinetShell`, для маршрутов вне сегмента `/client`. */
export const UserCabinetRouteLayout = ClientCabinetShell;
