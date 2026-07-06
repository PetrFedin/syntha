'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  buildCommsGroupsNavHref,
  buildCommsSectionGroupMessagesHref,
  buildCommsSectionGroupsForRole,
  commsSectionGroupItemTestId,
  commsSectionGroupsPickerTestId,
} from '@/lib/platform-core-comms-section-groups';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isCoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import type { BrandPgThreadRow } from '@/lib/platform-core-ports/brand/brand-messages-pg-threads';
import {
  commsSectionGroupUnreadTestId,
  computeSectionGroupUnread,
  findPgB2bOrderThread,
} from '@/lib/platform-core-ports/communications/pg-contextual-section-unread';
import { subscribePgSectionVisitState } from '@/lib/platform-core-ports/communications/pg-contextual-section-read-state';
import { usePgSectionServerReadKeys } from '@/lib/platform-core-ports/communications/use-pg-section-server-read-keys';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'brand' | 'shop' | 'manufacturer' | 'supplier';

type Props = {
  variant: Variant;
  collectionId: string;
  orderId: string;
  disabled?: boolean;
  unreadByChat?: Record<string, number>;
  threads?: BrandPgThreadRow[];
  readerId?: string;
  /** Core cabinet sidebar — section rows, max 4. */
  minimalChrome?: boolean;
};

const roleIdFromVariant = (variant: Variant) =>
  variant === 'manufacturer' ? 'manufacturer' : variant;

export function CommsSectionGroupsPicker({
  variant,
  collectionId,
  orderId,
  disabled,
  unreadByChat = {},
  threads = [],
  readerId = '',
  minimalChrome = false,
}: Props) {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section')?.trim() ?? '';
  const activePillarRaw = searchParams.get('pillar')?.trim() ?? '';
  const activePillar: CoreHubPillarId | null =
    activePillarRaw && isCoreHubPillarId(activePillarRaw) ? activePillarRaw : null;

  const [visitTick, setVisitTick] = useState(0);

  useEffect(() => subscribePgSectionVisitState(() => setVisitTick((t) => t + 1)), []);

  const serverVisitedKeys = usePgSectionServerReadKeys(orderId, readerId);

  const groups = useMemo(
    () => buildCommsSectionGroupsForRole(roleIdFromVariant(variant)),
    [variant]
  );

  const byPillar = useMemo(() => {
    const map = new Map<string, typeof groups>();
    for (const g of groups) {
      const arr = map.get(g.pillarId) ?? [];
      arr.push(g);
      map.set(g.pillarId, arr);
    }
    return map;
  }, [groups]);

  const orderThread = useMemo(
    () => findPgB2bOrderThread(threads, orderId),
    [threads, orderId, visitTick]
  );

  if (disabled || !orderId.trim() || groups.length === 0) return null;

  const pickerTestId = commsSectionGroupsPickerTestId(variant);
  const roleId = roleIdFromVariant(variant);
  const groupsOverviewHref = buildCommsGroupsNavHref({ roleId, orderId, collectionId });

  if (minimalChrome) {
    const visible = groups.slice(0, 4);
    return (
      <section className="space-y-2" data-testid={pickerTestId}>
        <p className={hubSectionLabelClassName()}>Группы</p>
        <nav className={pillarInsight.sectionList}>
          {visible.map((g) => {
            const href = buildCommsSectionGroupMessagesHref({
              roleId,
              orderId,
              collectionId,
              pillarId: g.pillarId,
              sectionId: g.sectionId,
            });
            const sectionUnread = computeSectionGroupUnread({
              orderId,
              pillarId: g.pillarId,
              sectionId: g.sectionId,
              unreadByChat,
              orderThread,
              serverVisitedKeys,
            });
            return (
              <Link
                key={g.sectionId}
                href={href}
                data-testid={commsSectionGroupItemTestId(variant, g.sectionId)}
                className={pillarInsight.sectionRow}
              >
                <span className="min-w-0 flex-1">
                  <span className={pillarInsight.sectionRowLabel}>{g.label}</span>
                  <span className={pillarInsight.sectionRowMeta}>{g.pillarTitle}</span>
                </span>
                {sectionUnread > 0 ? (
                  <span
                    className={cn(pillarInsight.liveDot, pillarInsight.liveDotOn)}
                    title={`Непрочитано: ${sectionUnread}`}
                    aria-hidden
                  />
                ) : (
                  <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>
        {groups.length > visible.length ? (
          <Link
            href={groupsOverviewHref}
            data-testid="comms-pillar-groups-nav-more"
            className="text-accent-primary inline-flex min-h-10 items-center text-[11px] font-medium hover:underline"
          >
            Все группы ({groups.length})
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <div
      className="border-border-subtle/80 space-y-2 rounded-lg border bg-slate-50/60 px-2.5 py-2"
      data-testid={pickerTestId}
    >
      <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wide">
        Группы по разделам
      </p>
      <div className="max-h-40 space-y-2 overflow-y-auto pr-0.5">
        {[...byPillar.entries()].map(([pillarId, items]) => (
          <div key={pillarId}>
            <p className="text-text-muted mb-0.5 text-[11px] font-semibold uppercase tracking-wide">
              {items[0]?.pillarTitle ?? pillarId}
            </p>
            <ul className="flex flex-wrap gap-1">
              {items.map((g) => {
                const href = buildCommsSectionGroupMessagesHref({
                  roleId: roleIdFromVariant(variant),
                  orderId,
                  collectionId,
                  pillarId: g.pillarId,
                  sectionId: g.sectionId,
                });
                const isActive =
                  activeSection === g.sectionId &&
                  (activePillar == null || activePillar === g.pillarId);
                const sectionUnread = computeSectionGroupUnread({
                  orderId,
                  pillarId: g.pillarId,
                  sectionId: g.sectionId,
                  unreadByChat,
                  orderThread,
                  serverVisitedKeys,
                });
                return (
                  <li key={g.sectionId}>
                    <Link
                      href={href}
                      data-testid={commsSectionGroupItemTestId(variant, g.sectionId)}
                      data-section-id={g.sectionId}
                      data-pillar-id={g.pillarId}
                      className={
                        isActive
                          ? 'bg-accent-primary/15 text-accent-primary inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold'
                          : 'border-border-subtle hover:bg-bg-surface2 text-text-secondary inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium'
                      }
                      title={`Обсудить: ${g.label}`}
                    >
                      {g.label}
                      {sectionUnread > 0 ? (
                        <span
                          className="bg-accent-primary inline-flex min-w-[14px] items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none text-white"
                          data-testid={commsSectionGroupUnreadTestId(variant, g.sectionId)}
                          aria-label={`Непрочитано: ${sectionUnread}`}
                        >
                          {sectionUnread > 9 ? '9+' : sectionUnread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
