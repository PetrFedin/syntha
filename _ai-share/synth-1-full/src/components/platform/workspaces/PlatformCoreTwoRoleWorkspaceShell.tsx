'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, Store } from 'lucide-react';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';
import { cn } from '@/lib/utils';

type Role = 'brand' | 'shop';

type Props = {
  roleId: Role;
  pillarId: CoreHubPillarId;
  collectionId: string;
  orderId?: string | null;
  articleId?: string | null;
  children: ReactNode;
};

const ROLE_META = {
  brand: {
    label: 'Бренд',
    description: 'Разработка, коллекции, заказы и исполнение',
    icon: BriefcaseBusiness,
  },
  shop: {
    label: 'Магазин',
    description: 'Коллекции, заказы, приёмка и коммуникации',
    icon: Store,
  },
} as const;

/**
 * Канонический Platform Core v1 chrome.
 * Desktop: постоянная левая навигация по пяти столпам + рабочее окно справа.
 * Mobile: компактная горизонтальная навигация над рабочим окном.
 */
export function PlatformCoreTwoRoleWorkspaceShell({
  roleId,
  pillarId,
  collectionId,
  orderId,
  articleId,
  children,
}: Props) {
  const role = ROLE_META[roleId];
  const RoleIcon = role.icon;
  const activePillar = PLATFORM_CORE_PILLARS.find((pillar) => pillar.id === pillarId);

  const pillarHref = (target: CoreHubPillarId) =>
    roleCoreCabinetHref({
      roleId,
      pillarId: target,
      collectionId,
      orderId,
      articleId,
    });

  return (
    <div className="min-h-screen bg-bg-page text-text-primary" data-testid="platform-core-two-role-shell">
      <div className={hubCabinet.page}>
        <header className={hubCabinet.header}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href="/platform"
                className="inline-flex h-7 items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Platform Core
              </Link>
              <div className="mt-0.5 flex min-w-0 items-center gap-2">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-bg-surface">
                  <RoleIcon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h1 className={hubCabinet.title}>{role.label}</h1>
                  <p className={hubCabinet.roleMeta}>{role.description}</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-surface px-2 py-1.5 text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">Коллекция</p>
              <p className="text-[12px] font-semibold text-text-primary">{collectionId}</p>
            </div>
          </div>
        </header>

        <nav className={hubCabinet.pillarNavHorizontal} aria-label="Столпы Platform Core">
          <div className={hubCabinet.pillarNavPillRow}>
            {PLATFORM_CORE_PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={pillarHref(pillar.id)}
                className={cn(
                  hubCabinet.pillarPill,
                  pillar.id === pillarId
                    ? hubCabinet.pillarSegmentBtnActive
                    : hubCabinet.pillarSegmentBtnIdle
                )}
              >
                {pillar.title}
              </Link>
            ))}
          </div>
        </nav>

        <div className="grid min-w-0 gap-3 md:grid-cols-[10.5rem_minmax(0,1fr)] md:items-start">
          <aside className={cn(hubCabinet.pillarNav, 'sticky top-3')} aria-label="Навигация по столпам">
            <p className={hubCabinet.pillarNavLabel}>Рабочий процесс</p>
            <div className="space-y-0.5">
              {PLATFORM_CORE_PILLARS.map((pillar, index) => {
                const active = pillar.id === pillarId;
                return (
                  <Link
                    key={pillar.id}
                    href={pillarHref(pillar.id)}
                    className={active ? hubCabinet.pillarBtnActive : hubCabinet.pillarBtnIdle}
                    aria-current={active ? 'page' : undefined}
                    data-testid={`platform-core-pillar-nav-${pillar.id}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-text-muted">{index + 1}</span>
                      <span className={hubCabinet.pillarBtnTitle}>{pillar.title}</span>
                    </span>
                    {active ? (
                      <span className="mt-0.5 text-[10px] leading-4 text-text-muted">
                        {activePillar?.subtitle}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 rounded-md border border-border-subtle bg-bg-surface p-2.5 shadow-none md:p-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
