'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  isPlatformCoreCabinetNavLink,
  platformCoreCabinetNavLinkClass,
} from '@/lib/platform-core-cabinet-chrome';
import { SYNTHA_SIDEBAR_CLUSTERS, sortNavGroupsByOrder } from '@/lib/data/syntha-nav-clusters';

type NavLink = {
  href: string;
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subsections?: { href: string; label: string; value: string }[];
  testId?: string;
};
type NavGroup = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  links: NavLink[];
  clusterId?: 'syntha-cores' | 'archive';
};

function pathFromHref(href: string): string {
  return (href.split('?')[0] || '').replace(/\/$/, '') || '/';
}

function isLinkActive(link: NavLink, pathname: string, basePath: string): boolean {
  const href = link.href ?? '';
  const path = pathname.replace(/\/$/, '') || '/';
  const norm = pathFromHref(href);
  if (norm === basePath) return path === basePath;
  if (path === norm || path.startsWith(norm + '/')) return true;
  const subs = link.subsections;
  return !!subs?.some(
    (s) => path === pathFromHref(s.href) || path.startsWith(pathFromHref(s.href) + '/')
  );
}

function hasSubsections(
  link: NavLink
): link is NavLink & { subsections: { href: string; label: string; value: string }[] } {
  return !!link.subsections?.length;
}

export function HubSidebar({
  groups,
  basePath,
  accentClass = 'text-slate-900',
  activeBgClass = 'bg-slate-900',
  className,
  onNavigate,
  ariaLabel,
  sidebarClusters,
  coreGroupOrder,
  archiveGroupOrder,
}: {
  groups: NavGroup[];
  basePath: string;
  accentClass?: string;
  activeBgClass?: string;
  className?: string;
  onNavigate?: () => void;
  /** Accessible name для `<nav>` — e2e и screen readers (client cabinet). */
  ariaLabel?: string;
  /** Если заданы вместе с порядками — секции «Ядра 1–3» и «Архив». */
  sidebarClusters?: ReadonlyArray<(typeof SYNTHA_SIDEBAR_CLUSTERS)[number]>;
  coreGroupOrder?: readonly string[];
  archiveGroupOrder?: readonly string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clusteredSections = useMemo(() => {
    if (!sidebarClusters || !coreGroupOrder || !archiveGroupOrder) return null;
    const core = sortNavGroupsByOrder(
      groups.filter((g) => g.clusterId === 'syntha-cores'),
      coreGroupOrder
    );
    const archive = sortNavGroupsByOrder(
      groups.filter((g) => g.clusterId === 'archive'),
      archiveGroupOrder
    );
    return sidebarClusters.map((c) => ({
      ...c,
      groups: c.id === 'syntha-cores' ? core : archive,
    }));
  }, [groups, sidebarClusters, coreGroupOrder, archiveGroupOrder]);

  const flatGroupsForActive = clusteredSections
    ? clusteredSections.flatMap((s) => s.groups)
    : groups;

  const activeGroupId = flatGroupsForActive.find((g) =>
    g.links.some((l) => isLinkActive(l, pathname || '', basePath))
  )?.id;
  const activeLinkValue = flatGroupsForActive
    .flatMap((g) => g.links)
    .find((l) => isLinkActive(l, pathname || '', basePath))?.value;

  const [openGroups, setOpenGroups] = useState<Set<string>>(() =>
    activeGroupId ? new Set([activeGroupId]) : new Set()
  );
  const [openLinks, setOpenLinks] = useState<Set<string>>(() =>
    activeLinkValue ? new Set([activeLinkValue]) : new Set()
  );

  useEffect(() => {
    if (activeGroupId) setOpenGroups((prev) => new Set([...prev, activeGroupId]));
    if (activeLinkValue) setOpenLinks((prev) => new Set([...prev, activeLinkValue]));
  }, [activeGroupId, activeLinkValue]);

  const setGroupOpen = (id: string, open: boolean) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const setLinkOpen = (value: string, open: boolean) => {
    setOpenLinks((prev) => {
      const next = new Set(prev);
      if (open) next.add(value);
      else next.delete(value);
      return next;
    });
  };

  const renderGroup = (group: NavGroup) => {
    const isGroupActive = activeGroupId === group.id;
    return (
      <div key={group.id} className="mb-3 last:mb-0">
        <Collapsible
          open={openGroups.has(group.id)}
          onOpenChange={(open) => setGroupOpen(group.id, open)}
        >
          <CollapsibleTrigger
            className={cn(
              'group/trigger flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-slate-50 data-[state=open]:bg-slate-50'
            )}
          >
            <group.icon
              className={cn('h-4 w-4 shrink-0', isGroupActive ? accentClass : 'text-slate-400')}
            />
            <span
              className={cn('flex-1 truncate', isGroupActive ? 'text-slate-900' : 'text-slate-600')}
            >
              {group.label}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-data-[state=open]/trigger:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-3 space-y-0.5 border-l border-slate-100 pb-2 pl-2 pr-1 pt-0.5">
              {group.links.map((link) => {
                const active = isLinkActive(link, pathname || '', basePath);
                const subs = hasSubsections(link) ? link.subsections : [];

                if (subs.length > 0) {
                  return (
                    <Collapsible
                      key={link.value}
                      open={openLinks.has(link.value)}
                      onOpenChange={(open) => setLinkOpen(link.value, open)}
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={cn(
                            'group/sub flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                            active
                              ? `${activeBgClass} text-white`
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <link.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 truncate">{link.label}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 transition-transform group-data-[state=open]/sub:rotate-90" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-0.5 pb-1 pl-4 pt-0.5">
                          {subs.map((sub) => {
                            const p = (pathname || '').replace(/\/$/, '') || '/';
                            const subPath = pathFromHref(sub.href);
                            const pathPrefixMatch = p === subPath || p.startsWith(`${subPath}/`);
                            const qs = sub.href.includes('?') ? sub.href.split('?')[1] : '';
                            const queryMatch =
                              !qs ||
                              Array.from(new URLSearchParams(qs)).every(
                                ([k, v]) => searchParams?.get(k) === v
                              );
                            const subIsActive = pathPrefixMatch && queryMatch;
                            return (
                              <Link
                                key={sub.value}
                                href={sub.href}
                                onClick={onNavigate}
                                className={cn(
                                  'block truncate rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors',
                                  subIsActive
                                    ? `${activeBgClass} text-white`
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                )}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                const linkClass = cn(
                  'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                  active
                    ? `${activeBgClass} text-white`
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                );

                return (
                  <Link
                    key={link.value}
                    href={link.href}
                    onClick={onNavigate}
                    data-testid={link.testId}
                    className={
                      isPlatformCoreCabinetNavLink(link.value)
                        ? platformCoreCabinetNavLinkClass(active, linkClass)
                        : linkClass
                    }
                  >
                    <link.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="min-w-0 truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={cn('scrollbar-hide flex h-full flex-col overflow-y-auto', className)}
    >
      <div className="space-y-0.5 p-2">
        {clusteredSections
          ? clusteredSections.map((section) => (
              <div key={section.id} className="mb-4 last:mb-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  <div className="h-0.5 min-w-2 flex-1 rounded-full bg-slate-200" />
                  <span className="shrink-0 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {section.label}
                  </span>
                  <div className="h-0.5 min-w-2 flex-1 rounded-full bg-slate-200" />
                </div>
                <div className="mt-0.5 space-y-0.5">{section.groups.map(renderGroup)}</div>
              </div>
            ))
          : groups.map(renderGroup)}
      </div>
    </nav>
  );
}
