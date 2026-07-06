'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { BrandPgThreadRow } from '@/lib/platform-core-ports/brand/brand-messages-pg-threads';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/platform-core-ports/b2b-order-lifecycle';
import { commsHubThreadLabel } from '@/lib/platform-core-ports/communications/comms-hub-inbox-rows';
import { commsCabinetThreadRowKey, COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY } from '@/lib/platform-core-ports/communications/comms-cabinet-thread-keys';
import {
  commsCabinetInboxAllHref,
  commsCabinetRolePrefix,
  commsCabinetThreadWorkspaceHref,
  type CommsCabinetVariant,
} from '@/lib/platform-core-ports/communications/comms-cabinet-thread-nav';
import { useCommsHubMergedThreads } from '@/hooks/use-comms-hub-merged-threads';
import { useMinLg } from '@/hooks/use-min-lg';
import { useCommsCabinetSplitSelectionOptional } from '@/components/platform/CommsCabinetSplitProvider';
import { usePlatformCoreUniversalInboxOrderUnread } from '@/hooks/use-platform-core-universal-inbox-order-unread';
import { useCommsSectionContextAutoThread } from '@/hooks/use-comms-section-context-auto-thread';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';

type Variant = CommsCabinetVariant;

type Props = {
  variant: Variant;
  collectionId: string;
  orderId: string;
  disabled?: boolean;
  compact?: boolean;
  /** Universal inbox on /messages: numeric PG unread per order (threads + pgEventUnread). */
  universalInbox?: boolean;
  /** Core cabinet: section rows, max 3, 11px+. */
  minimalChrome?: boolean;
};

function rolePrefix(variant: Variant): string {
  return commsCabinetRolePrefix(variant);
}

function threadWorkspaceHref(variant: Variant, thread: BrandPgThreadRow): string | null {
  return commsCabinetThreadWorkspaceHref(variant, thread);
}

function inboxAllHref(variant: Variant): string {
  return commsCabinetInboxAllHref(variant);
}

export function CommsPillarThreadStrip({
  variant,
  collectionId,
  orderId,
  disabled,
  compact = false,
  universalInbox = false,
  minimalChrome = false,
}: Props) {
  const prefix = rolePrefix(variant);
  const inboxRole =
    variant === 'shop'
      ? ('shop' as const)
      : variant === 'brand'
        ? ('brand' as const)
        : variant === 'supplier'
          ? ('supplier' as const)
          : ('manufacturer' as const);
  const pgOrderUnreadEnabled = (universalInbox || minimalChrome) && !disabled;
  const { resolveOrderUnread } = usePlatformCoreUniversalInboxOrderUnread(
    inboxRole,
    pgOrderUnreadEnabled
  );
  const sectionContextRow = useCommsSectionContextAutoThread({
    variant,
    collectionId,
    orderId,
    disabled,
    enabled: minimalChrome && !disabled,
  });
  const { loaded, mergedThreads, poByOrderId } = useCommsHubMergedThreads({
    variant,
    collectionId,
    orderId,
    disabled,
  });
  const isLg = useMinLg();
  const splitSelection = useCommsCabinetSplitSelectionOptional();
  const selectOnLg = minimalChrome && isLg && Boolean(splitSelection);
  const [query, setQuery] = useState('');
  const maxVisible = minimalChrome
    ? 3
    : variant === 'manufacturer' || variant === 'supplier'
      ? 8
      : 5;

  const { visible, hiddenOrderCount } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
    let list = mergedThreads;
    if (tokens.length > 0) {
      list = mergedThreads.filter((t) => {
        const blob = [
          commsHubThreadLabel(t, poByOrderId),
          t.lastMessagePreview,
          t.contextId,
          t.collectionId,
          t.articleId,
          poByOrderId[t.contextId?.trim() ?? ''],
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return tokens.every((tok) => blob.includes(tok));
      });
    }
    const orderOnly = list.filter((t) => t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE);
    const articles = list.filter((t) => t.contextType !== WORKSHOP2_B2B_ORDER_CONTEXT_TYPE);
    const visibleOrders = orderOnly.slice(0, maxVisible);
    const hiddenOrders = Math.max(0, orderOnly.length - visibleOrders.length);
    const room = Math.max(0, maxVisible - visibleOrders.length);
    return {
      visible: [...visibleOrders, ...articles.slice(0, room)],
      hiddenOrderCount: hiddenOrders,
    };
  }, [mergedThreads, query, poByOrderId, maxVisible]);

  const hasPoInbox = mergedThreads.some((t) => t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE);

  useEffect(() => {
    if (!selectOnLg || !splitSelection) return;
    splitSelection.setSelectedThreadKey(null);
  }, [orderId, selectOnLg, splitSelection?.setSelectedThreadKey]);

  useEffect(() => {
    if (!selectOnLg || !splitSelection || !loaded || splitSelection.selectedThreadKey) return;
    const activeOrder = orderId.trim();
    const preferred =
      visible.find(
        (t) =>
          t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE && t.contextId?.trim() === activeOrder
      ) ?? visible[0];
    if (preferred) {
      splitSelection.setSelectedThreadKey(commsCabinetThreadRowKey(preferred));
    } else if (sectionContextRow) {
      splitSelection.setSelectedThreadKey(COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY);
    }
  }, [
    selectOnLg,
    splitSelection?.setSelectedThreadKey,
    loaded,
    visible,
    orderId,
    sectionContextRow,
    splitSelection?.selectedThreadKey,
  ]);

  if (disabled) return null;

  const rowActiveClass = (active: boolean) =>
    active
      ? 'border-accent-primary/25 bg-accent-primary/5 ring-1 ring-accent-primary/15'
      : undefined;

  if (minimalChrome) {
    return (
      <section className="space-y-2" data-testid={`${prefix}-thread-strip`}>
        <p className={hubSectionLabelClassName()}>Треды</p>
        {loaded && (sectionContextRow || visible.length > 0) ? (
          <nav
            className={pillarInsight.sectionList}
            data-testid={hasPoInbox ? `${prefix}-po-inbox` : `${prefix}-thread-list`}
          >
            {sectionContextRow ? (
              selectOnLg ? (
                <button
                  type="button"
                  data-testid={`${prefix}-section-context-row`}
                  className={cn(
                    pillarInsight.sectionRow,
                    'w-full text-left',
                    rowActiveClass(
                      splitSelection?.selectedThreadKey === COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY
                    )
                  )}
                  onClick={() =>
                    splitSelection?.setSelectedThreadKey(COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY)
                  }
                >
                  <span className="min-w-0 flex-1">
                    <span className={pillarInsight.sectionRowLabel}>{sectionContextRow.label}</span>
                    <span className={pillarInsight.sectionRowMeta}>Контекст раздела</span>
                  </span>
                  <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
                </button>
              ) : (
                <Link
                  href={sectionContextRow.href}
                  data-testid={`${prefix}-section-context-row`}
                  className={pillarInsight.sectionRow}
                >
                  <span className="min-w-0 flex-1">
                    <span className={pillarInsight.sectionRowLabel}>{sectionContextRow.label}</span>
                    <span className={pillarInsight.sectionRowMeta}>Контекст раздела</span>
                  </span>
                  <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
                </Link>
              )
            ) : null}
            {visible.map((t) => {
              const href = threadWorkspaceHref(variant, t);
              const rowKey = commsCabinetThreadRowKey(t);
              const orderThreadId =
                t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE ? (t.contextId?.trim() ?? '') : '';
              const unread = pgOrderUnreadEnabled
                ? t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE
                  ? resolveOrderUnread(orderThreadId)
                  : t.lastSeenMessageCount != null && t.messageCount > t.lastSeenMessageCount
                    ? 1
                    : 0
                : t.lastSeenMessageCount != null && t.messageCount > t.lastSeenMessageCount
                  ? 1
                  : 0;
              const preview = t.lastMessagePreview?.trim().slice(0, 48) || 'Без сообщений';
              const label = commsHubThreadLabel(t, poByOrderId);
              const showPgNumericBadge =
                pgOrderUnreadEnabled &&
                t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE &&
                unread > 0;
              const rowBody = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className={pillarInsight.sectionRowLabel}>{label}</span>
                    <span className={cn(pillarInsight.sectionRowMeta, 'block truncate')}>
                      {preview}
                    </span>
                  </span>
                  {showPgNumericBadge ? (
                    <span
                      className="bg-accent-primary text-text-inverse inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-none"
                      data-testid={`${prefix}-universal-inbox-order-unread-${orderThreadId}`}
                      aria-label={`${unread} непрочитанных`}
                    >
                      {unread > 99 ? '99+' : unread}
                    </span>
                  ) : unread > 0 ? (
                    <span
                      className={cn(pillarInsight.liveDot, pillarInsight.liveDotOn)}
                      title="Непрочитанные"
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
                  )}
                </>
              );
              if (!href) {
                return (
                  <div key={rowKey} className={pillarInsight.sectionRow}>
                    <span className={pillarInsight.sectionRowLabel}>{label}</span>
                    <span className={pillarInsight.sectionRowMeta}>{preview}</span>
                  </div>
                );
              }
              if (selectOnLg) {
                return (
                  <button
                    key={rowKey}
                    type="button"
                    data-testid={`${prefix}-thread-item`}
                    className={cn(
                      pillarInsight.sectionRow,
                      'w-full text-left',
                      rowActiveClass(splitSelection?.selectedThreadKey === rowKey)
                    )}
                    onClick={() => splitSelection?.setSelectedThreadKey(rowKey)}
                  >
                    {rowBody}
                  </button>
                );
              }
              return (
                <Link
                  key={rowKey}
                  href={href}
                  data-testid={`${prefix}-thread-item`}
                  className={pillarInsight.sectionRow}
                >
                  {rowBody}
                </Link>
              );
            })}
          </nav>
        ) : loaded ? (
          <p className="text-text-muted text-[11px]" data-testid={`${prefix}-thread-empty`}>
            Треды после первого сообщения
          </p>
        ) : null}
        {loaded && (hiddenOrderCount > 0 || mergedThreads.length > visible.length) ? (
          <Link
            href={inboxAllHref(variant)}
            data-testid={`${prefix}-po-inbox-more`}
            className="text-accent-primary inline-flex min-h-10 items-center text-[11px] font-medium hover:underline"
          >
            Все треды
            {hiddenOrderCount > 0 ? ` · +${hiddenOrderCount}` : null}
            <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <div className="space-y-1.5" data-testid={`${prefix}-thread-strip`}>
      {!compact ? (
        <div className="group relative">
          <Search
            className="text-text-muted absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2"
            aria-hidden
          />
          <Input
            data-testid={`${prefix}-thread-search`}
            className="border-border-subtle bg-bg-surface1 placeholder:text-text-muted h-7 rounded-md pl-7 text-[10px]"
            placeholder="Поиск…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск тредов"
          />
        </div>
      ) : null}
      {loaded && visible.length > 0 ? (
        <ul
          className="space-y-0.5"
          data-testid={hasPoInbox ? `${prefix}-po-inbox` : `${prefix}-thread-list`}
          data-audit-legacy={`${prefix}-thread-list`}
        >
          {visible.map((t) => {
            const href = threadWorkspaceHref(variant, t);
            const orderId = t.contextId?.trim() ?? '';
            const unread = universalInbox
              ? t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE
                ? resolveOrderUnread(orderId)
                : 0
              : t.lastSeenMessageCount != null && t.messageCount > t.lastSeenMessageCount
                ? 1
                : 0;
            const preview = t.lastMessagePreview?.trim().slice(0, 56) || 'Без сообщений';
            const label = commsHubThreadLabel(t, poByOrderId);
            return (
              <li key={`${t.contextType}:${t.contextId}`}>
                {href ? (
                  <Link
                    href={href}
                    data-testid={`${prefix}-thread-item`}
                    className="text-accent-primary hover:bg-bg-surface2 block rounded px-1 py-0.5 text-[10px] font-medium leading-snug"
                  >
                    <span className="font-mono">{label}</span>
                    {unread > 0 ? (
                      universalInbox ? (
                        <span
                          className="bg-accent-primary text-text-inverse ml-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-none align-middle"
                          data-testid={`${prefix}-universal-inbox-order-unread-${orderId}`}
                          aria-label={`${unread} непрочитанных`}
                        >
                          {unread > 99 ? '99+' : unread}
                        </span>
                      ) : (
                        <span className="bg-accent-primary ml-1 inline-block h-1.5 w-1.5 rounded-full align-middle" />
                      )
                    ) : null}
                    <span className="text-text-muted block font-normal">· {preview}</span>
                  </Link>
                ) : (
                  <span className="text-text-muted block px-1 py-0.5 text-[10px]">
                    {label} · {preview}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : loaded ? (
        <p className="text-text-muted px-0.5 text-[10px]" data-testid={`${prefix}-thread-empty`}>
          {query.trim() ? 'Нет по запросу' : 'Треды после первого сообщения'}
        </p>
      ) : null}
      {loaded && hiddenOrderCount > 0 ? (
        <Link
          href={inboxAllHref(variant)}
          data-testid={`${prefix}-po-inbox-more`}
          className="text-accent-primary px-0.5 text-[10px] font-medium hover:underline"
        >
          Ещё {hiddenOrderCount} заказов во «Все треды» →
        </Link>
      ) : null}
    </div>
  );
}
