'use client';

import React, { useState, useEffect, useMemo, type ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  isPlatformCoreCabinetNavLink,
  platformCoreCabinetNavLinkClass,
} from '@/lib/platform-core-cabinet-chrome';
import { useNavPins } from '@/hooks/use-nav-pins';
import { NAV_GROUP_CLUSTERS, type brandNavGroups } from '@/lib/data/brand-navigation';
import {
  BRAND_ARCHIVE_GROUP_ORDER,
  BRAND_CORE_GROUP_ORDER,
  sortNavGroupsByOrder,
} from '@/lib/data/syntha-nav-clusters';
import {
  BRAND_CORE_PILLARS_NAV_ORDER,
  filterNavGroupsForCoreSidebar,
  resolveSidebarClustersForCore,
  shouldHideNavArchiveCluster,
} from '@/lib/cabinet-core-mode';

type NavGroup = (typeof brandNavGroups)[number];
type ClusterId = (typeof NAV_GROUP_CLUSTERS)[number]['id'];
type NavLink = NavGroup['links'][number];

/** Совпадение href с path + query: ссылки с ?… требуют тех же параметров в URL (напр. разработка коллекции vs пол). */
function hrefMatchScore(href: string, path: string, sp: URLSearchParams): number {
  const qIdx = href.indexOf('?');
  const pathPart = (qIdx >= 0 ? href.slice(0, qIdx) : href).replace(/\/$/, '') || '/';
  const queryPart = qIdx >= 0 ? href.slice(qIdx + 1) : '';
  if (pathPart === '/brand' || pathPart === '/brand/profile') {
    return path === '/brand' || path === '/brand/profile' ? pathPart.length : -1;
  }
  if (path !== pathPart && !path.startsWith(`${pathPart}/`)) return -1;
  const base = pathPart.length;
  if (!queryPart) return base;
  const req = new URLSearchParams(queryPart);
  for (const [k, v] of req.entries()) {
    if (sp.get(k) !== v) return -1;
  }
  return base + 1000 + queryPart.length;
}

type NavSubsection = {
  href: string;
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  /** Не рисовать в сайдбаре (маршрут только для подсветки и метаданных). */
  hideInSidebar?: boolean;
  /** Вложенные пункты (напр. лайншиты внутри B2B Шоурум). */
  children?: NavSubsection[];
};

function visibleSubsections(subs: NavSubsection[] | undefined): NavSubsection[] {
  return (subs ?? []).filter((s) => !s.hideInSidebar);
}

function hasSubsections(link: NavLink): link is NavLink & { subsections: NavSubsection[] } {
  return !!(link as { subsections?: unknown[] }).subsections?.length;
}

function subsectionMatchesWinner(s: NavSubsection, winnerValue: string): boolean {
  if (s.value === winnerValue) return true;
  return !!s.children?.some((c) => subsectionMatchesWinner(c, winnerValue));
}

function isLinkOrSubActive(link: NavLink, winnerValue: string | undefined): boolean {
  if (winnerValue === undefined) return false;
  if (link.value === winnerValue) return true;
  const subs = (link as { subsections?: NavSubsection[] }).subsections;
  return !!subs?.some((s) => subsectionMatchesWinner(s, winnerValue));
}

/** Самое узкое совпадение по href (родитель или подпункт), иначе коллизии по префиксу. */
function resolveMostSpecificActiveLink(
  allLinks: NavLink[],
  pathname: string,
  sp: URLSearchParams
): { link: NavLink; activeValue: string } | undefined {
  const path = pathname.replace(/\/$/, '') || '/';
  let best: { link: NavLink; activeValue: string; score: number } | undefined;
  for (const link of allLinks) {
    const href = (link as { href?: string }).href ?? '';
    const parentScore = hrefMatchScore(href, path, sp);
    if (parentScore >= 0) {
      const v = (link as { value: string }).value;
      if (!best || parentScore > best.score) {
        best = { link, activeValue: v, score: parentScore };
      }
    }
    const subs = (link as { subsections?: NavSubsection[] }).subsections;
    for (const s of subs ?? []) {
      const sc = hrefMatchScore(s.href, path, sp);
      if (sc >= 0 && (!best || sc > best.score)) {
        best = { link, activeValue: s.value, score: sc };
      }
      for (const ch of s.children ?? []) {
        const chSc = hrefMatchScore(ch.href, path, sp);
        if (chSc >= 0 && (!best || chSc > best.score)) {
          best = { link, activeValue: ch.value, score: chSc };
        }
      }
    }
  }
  return best;
}

function NavLinkActions({ linkKey, onNavigate }: { linkKey: string; onNavigate?: () => void }) {
  const { pins, togglePin, setReminder } = useNavPins();
  const [reminderInput, setReminderInput] = useState('');
  const entry = pins[linkKey];
  const isPinned = entry?.pinned ?? false;
  const reminder = entry?.reminder ?? '';

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/sub:opacity-100 group-hover/subitem:opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePin(linkKey);
        }}
        className={cn(
          'hover:bg-bg-surface2 rounded p-0.5 transition-colors',
          isPinned && 'text-amber-500'
        )}
        title={isPinned ? 'Открепить' : 'Закрепить (важный)'}
        aria-label={isPinned ? 'Открепить' : 'Закрепить'}
      >
        <Star className={cn('h-3 w-3', isPinned ? 'fill-current' : '')} />
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setReminderInput(reminder);
            }}
            className={cn(
              'hover:bg-bg-surface2 rounded p-0.5 transition-colors',
              reminder && 'text-accent-primary'
            )}
            title={reminder || 'Добавить напоминание'}
            aria-label="Напоминание"
          >
            <MessageSquare className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2" onClick={(e) => e.stopPropagation()}>
          <Input
            placeholder="Напоминание..."
            value={reminderInput}
            onChange={(e) => setReminderInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              (setReminder(linkKey, reminderInput || undefined), setReminderInput(''))
            }
            className="h-7 text-[10px]"
          />
          <div className="mt-2 flex gap-1">
            <Button
              size="sm"
              className="h-6 text-[9px]"
              onClick={() => {
                setReminder(linkKey, reminderInput || undefined);
                setReminderInput('');
              }}
            >
              Сохранить
            </Button>
            {reminder && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[9px]"
                onClick={() => {
                  setReminder(linkKey, undefined);
                  setReminderInput('');
                }}
              >
                Удалить
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function BrandSidebar({
  groups,
  businessMode,
  className,
  onNavigate,
}: {
  groups: NavGroup[];
  secondaryItems?: unknown[];
  businessMode: 'b2b' | 'b2c';
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filtered = groups.filter((g) => g.scope === 'shared' || g.scope === businessMode);
  const { pins } = useNavPins();

  const groupsByCluster = NAV_GROUP_CLUSTERS.reduce<Record<ClusterId, NavGroup[]>>(
    (acc, c) => {
      acc[c.id] = filtered.filter(
        (g) => (g as NavGroup & { clusterId?: ClusterId }).clusterId === c.id
      );
      return acc;
    },
    {} as Record<ClusterId, NavGroup[]>
  );

  const flatLinks: NavLink[] = [];
  for (const g of filtered) {
    for (const l of g.links) {
      flatLinks.push(l as NavLink);
    }
  }
  const sp = useMemo(() => new URLSearchParams(searchParams?.toString() ?? ''), [searchParams]);
  const resolvedActive = resolveMostSpecificActiveLink(flatLinks, pathname || '', sp);
  const activeLinkValue = resolvedActive?.activeValue;
  const activeGroupId = resolvedActive
    ? filtered.find((g) => g.links.some((l) => l.value === resolvedActive.link.value))?.id
    : undefined;

  const groupIdsKey = useMemo(() => groups.map((g) => g.id).join('|'), [groups]);

  /** По умолчанию развёрнут только основной контур; архив свёрнут до ручного разворота или перехода в раздел. */
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    return new Set(
      groups
        .filter((g) => (g as NavGroup & { clusterId?: string }).clusterId === 'syntha-cores')
        .map((g) => g.id)
    );
  });

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const g of groups) {
        if (
          !next.has(g.id) &&
          (g as NavGroup & { clusterId?: string }).clusterId === 'syntha-cores'
        ) {
          next.add(g.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // Только при смене набора групп (B2B/B2C), не при каждом re-render родителя
    // eslint-disable-next-line react-hooks/exhaustive-deps -- groups читаем при изменении groupIdsKey
  }, [groupIdsKey]);

  useEffect(() => {
    if (activeGroupId) setOpenGroups((prev) => new Set([...prev, activeGroupId]));
  }, [activeGroupId, activeLinkValue]);

  const setGroupOpen = (id: string, open: boolean) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <nav
      className={cn(
        'border-border-default scrollbar-hide flex h-full flex-col overflow-y-auto border-r bg-white',
        className
      )}
    >
      <div className="space-y-0.5 p-2">
        {resolveSidebarClustersForCore().map((cluster) => {
          const raw = groupsByCluster[cluster.id].filter(Boolean);
          const coreOrder = shouldHideNavArchiveCluster()
            ? BRAND_CORE_PILLARS_NAV_ORDER
            : BRAND_CORE_GROUP_ORDER;
          const clusterGroups = sortNavGroupsByOrder(
            raw,
            cluster.id === 'syntha-cores' ? coreOrder : BRAND_ARCHIVE_GROUP_ORDER
          );
          if (clusterGroups.length === 0) return null;

          return (
            <div key={cluster.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <div className="bg-bg-surface2 h-0.5 min-w-2 flex-1 rounded-full" />
                <span className="text-text-muted shrink-0 text-[8px] font-black uppercase tracking-[0.15em]">
                  {cluster.label}
                </span>
                <div className="bg-bg-surface2 h-0.5 min-w-2 flex-1 rounded-full" />
              </div>
              <div className="mt-0.5 space-y-0.5">
                {clusterGroups.map((group) => {
                  const isGroupActive = activeGroupId === group.id;

                  return (
                    <Collapsible
                      key={group.id}
                      open={openGroups.has(group.id)}
                      onOpenChange={(open) => setGroupOpen(group.id, open)}
                      className="group/coll"
                    >
                      <CollapsibleTrigger className="group/trigger hover:bg-bg-surface2 data-[state=open]:bg-bg-surface2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors">
                        <group.icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isGroupActive ? 'text-accent-primary' : 'text-text-muted'
                          )}
                        />
                        <span
                          className={cn(
                            'flex-1 truncate',
                            isGroupActive ? 'text-text-primary' : 'text-text-secondary'
                          )}
                        >
                          {group.label}
                        </span>
                        <ChevronDown className="text-text-muted h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]/trigger:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-border-subtle ml-3 space-y-0.5 border-l pb-2 pl-2 pr-1 pt-0.5">
                          {group.links.map((link) => {
                            const subs = hasSubsections(link)
                              ? visibleSubsections(
                                  link.subsections.filter((s) => s.href) as NavSubsection[]
                                )
                              : [];
                            const parentStrong = activeLinkValue === link.value;
                            const parentMild =
                              !parentStrong &&
                              isLinkOrSubActive(link, activeLinkValue) &&
                              subs.length > 0;

                            if (subs.length > 0) {
                              return (
                                <div
                                  key={link.value}
                                  className={cn(
                                    'group/sub flex flex-col gap-0.5',
                                    pins[link.value]?.pinned &&
                                      'rounded-md bg-amber-50/50 ring-1 ring-amber-200'
                                  )}
                                >
                                  <div className="flex">
                                    <Link
                                      href={(link as { href: string }).href}
                                      onClick={onNavigate}
                                      className={cn(
                                        'flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                                        parentStrong
                                          ? 'bg-text-primary text-white'
                                          : parentMild
                                            ? 'bg-bg-surface2 text-text-primary'
                                            : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary'
                                      )}
                                    >
                                      <link.icon className="h-3.5 w-3.5 shrink-0" />
                                      <span className="flex-1 truncate">{link.label}</span>
                                      <ChevronRight
                                        className={cn(
                                          'text-text-muted h-3 w-3 shrink-0',
                                          parentMild && 'text-text-secondary'
                                        )}
                                        aria-hidden
                                      />
                                    </Link>
                                    <NavLinkActions linkKey={link.value} onNavigate={onNavigate} />
                                  </div>
                                  <div className="border-border-subtle space-y-0.5 border-l pl-3">
                                    {subs.map((sub) => {
                                      const SubIcon = sub.icon;
                                      const subActive = activeLinkValue === sub.value;
                                      const hasChildren = !!sub.children?.length;

                                      if (hasChildren) {
                                        const nestMild =
                                          !subActive &&
                                          sub.children!.some((c) => activeLinkValue === c.value);
                                        return (
                                          <div key={sub.value} className="space-y-0.5">
                                            <Link
                                              href={sub.href}
                                              onClick={onNavigate}
                                              className={cn(
                                                'flex items-center gap-2 truncate rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                                                subActive
                                                  ? 'bg-text-primary text-white'
                                                  : nestMild
                                                    ? 'bg-bg-surface2 text-text-primary'
                                                    : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary'
                                              )}
                                            >
                                              {SubIcon ? (
                                                <SubIcon
                                                  className={cn(
                                                    'size-3.5 shrink-0',
                                                    subActive ? 'text-white' : 'text-text-muted'
                                                  )}
                                                />
                                              ) : null}
                                              <span className="min-w-0 flex-1 truncate">
                                                {sub.label}
                                              </span>
                                            </Link>
                                            <div className="border-border-subtle space-y-0.5 border-l pl-3">
                                              {sub.children!.map((ch) => {
                                                const chActive = activeLinkValue === ch.value;
                                                const ChIcon = ch.icon;
                                                return (
                                                  <Link
                                                    key={ch.value}
                                                    href={ch.href}
                                                    onClick={onNavigate}
                                                    className={cn(
                                                      'flex items-center gap-2 truncate rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                                                      chActive
                                                        ? 'bg-text-primary text-white'
                                                        : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary'
                                                    )}
                                                  >
                                                    {ChIcon ? (
                                                      <ChIcon
                                                        className={cn(
                                                          'size-3.5 shrink-0',
                                                          chActive
                                                            ? 'text-white'
                                                            : 'text-text-muted'
                                                        )}
                                                      />
                                                    ) : null}
                                                    <span className="min-w-0 flex-1 truncate">
                                                      {ch.label}
                                                    </span>
                                                  </Link>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      }

                                      return (
                                        <Link
                                          key={sub.value}
                                          href={sub.href}
                                          onClick={onNavigate}
                                          className={cn(
                                            'flex items-center gap-2 truncate rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                                            subActive
                                              ? 'bg-text-primary text-white'
                                              : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary'
                                          )}
                                        >
                                          {SubIcon ? (
                                            <SubIcon
                                              className={cn(
                                                'size-3.5 shrink-0',
                                                subActive ? 'text-white' : 'text-text-muted'
                                              )}
                                            />
                                          ) : null}
                                          <span className="min-w-0 flex-1 truncate">
                                            {sub.label}
                                          </span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }

                            const active = activeLinkValue === link.value;
                            const linkClass = cn(
                              'flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors',
                              active
                                ? 'bg-text-primary text-white'
                                : 'text-text-secondary hover:bg-bg-surface2 hover:text-text-primary'
                            );

                            return (
                              <div
                                key={link.value}
                                className={cn(
                                  'group/sub flex',
                                  pins[link.value]?.pinned &&
                                    'rounded-md bg-amber-50/50 ring-1 ring-amber-200'
                                )}
                              >
                                <Link
                                  href={(link as { href: string }).href}
                                  onClick={onNavigate}
                                  className={
                                    isPlatformCoreCabinetNavLink(link.value)
                                      ? platformCoreCabinetNavLinkClass(active, linkClass)
                                      : linkClass
                                  }
                                >
                                  <link.icon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="flex-1 truncate">{link.label}</span>
                                </Link>
                                <NavLinkActions linkKey={link.value} onNavigate={onNavigate} />
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
