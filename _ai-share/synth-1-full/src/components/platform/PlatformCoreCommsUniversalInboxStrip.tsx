'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CommsNotificationCenterStrip } from '@/components/platform/CommsNotificationCenterStrip';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import {
  usePlatformCoreB2bInboxOrderIds,
  type PlatformCoreB2bInboxCabinet,
} from '@/hooks/use-platform-core-b2b-inbox-order-ids';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import {
  getPlatformCoreDemo,
  isPlatformCoreEmptyChainCollection,
  resolvePageCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { PerOrderPgUnreadRow } from '@/lib/platform-core-ports/platform/platform-core-comms-notification-center';
import {
  universalInboxOrderDeepLinks,
  universalInboxOrderLabelRu,
  type PlatformCoreUniversalInboxVariant,
} from '@/lib/platform-core-ports/platform/platform-core-universal-inbox-order-links';
import { universalInboxOrderCalendarRowLinks } from '@/lib/platform-core-ports/platform/platform-core-comms-pctask-deeplinks';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { cn } from '@/lib/utils';

export type PlatformCoreCommsUniversalVariant = PlatformCoreUniversalInboxVariant;

type Props = {
  variant: PlatformCoreCommsUniversalVariant;
};

function rolePrefix(variant: PlatformCoreCommsUniversalVariant): string {
  if (variant === 'shop') return 'shop-cm';
  if (variant === 'brand') return 'brand-cm';
  if (variant === 'supplier') return 'sup-cm';
  return 'mfr-cm';
}

function inboxCabinet(variant: PlatformCoreCommsUniversalVariant): PlatformCoreB2bInboxCabinet {
  if (variant === 'shop') return 'shop';
  if (variant === 'brand') return 'brand';
  if (variant === 'supplier') return 'supplier';
  return 'manufacturer';
}

function UniversalInboxInner({ variant }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = usePlatformCoreDemoContext();
  const { buyerId } = useShopCoreBuyerId();
  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);
  const prefix = rolePrefix(variant);

  const orderFromUrl =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    '';

  const w2Fallback = demo.demoOrderId.startsWith('__') ? '' : demo.demoOrderId;

  const spineOpts =
    variant === 'shop'
      ? {
          fallbackOrderId: w2Fallback,
          collectionId,
          resolveFrom: ['w2_registry', 'allocation', 'operational'] as const,
          actorRole: 'shop' as const,
          buyerId,
          enabled: !emptyChain,
        }
      : variant === 'brand'
        ? {
            fallbackOrderId: w2Fallback,
            collectionId,
            resolveFrom: ['w2_registry', 'allocation'] as const,
            actorRole: 'brand' as const,
            enabled: !emptyChain,
          }
        : {
            fallbackOrderId: w2Fallback,
            collectionId,
            resolveFrom: ['w2_registry', 'handoff', 'allocation'] as const,
            factoryId: demo.factoryId,
            enabled: !emptyChain,
          };

  const { activeOrderId } = useSpineActiveWholesaleOrderId(spineOpts);
  const orderId = resolvePlatformCoreCabinetOrderId(
    orderFromUrl || activeOrderId,
    getPlatformCoreDemo(collectionId).demoOrderId
  );

  const cabinet = inboxCabinet(variant);
  const { orderIds, ready: inboxReady } = usePlatformCoreB2bInboxOrderIds(
    emptyChain ? null : cabinet,
    variant === 'shop' ? buyerId : undefined
  );
  const { tick: inboxTick, sseConnected: inboxSseConnected } = usePlatformCoreCommsInboxPoll(
    !emptyChain && isPlatformCoreMode()
  );
  const { tick: registryTick, sseConnected: registrySseConnected } = usePlatformCoreB2bRegistryPoll(
    !emptyChain && isPlatformCoreMode()
  );
  const refreshTick = inboxTick + registryTick;
  const sseLive = inboxSseConnected || registrySseConnected;

  const [perOrderRows, setPerOrderRows] = useState<PerOrderPgUnreadRow[]>([]);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  const registryOrderIds = useMemo(() => {
    const merged = [...new Set([...orderIds, orderId.trim()].filter(Boolean))];
    return merged.slice(0, 12);
  }, [orderIds, orderId]);

  useEffect(() => {
    if (emptyChain || !inboxReady || registryOrderIds.length === 0) {
      setPerOrderRows([]);
      setSummaryLoaded(!emptyChain && inboxReady);
      return;
    }
    let cancelled = false;
    setSummaryLoaded(false);
    void fetch(
      `/api/platform-core/comms/unread-summary?role=${encodeURIComponent(variant)}&collectionId=${encodeURIComponent(collectionId)}&orderIds=${encodeURIComponent(registryOrderIds.join(','))}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { orders?: PerOrderPgUnreadRow[] };
      })
      .then((json) => {
        if (cancelled) return;
        const rows = (json?.orders ?? []).slice().sort((a, b) => {
          if (b.totalUnread !== a.totalUnread) return b.totalUnread - a.totalUnread;
          return a.orderId.localeCompare(b.orderId);
        });
        setPerOrderRows(rows);
      })
      .catch(() => {
        if (!cancelled) setPerOrderRows([]);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [collectionId, emptyChain, inboxReady, registryOrderIds, refreshTick, variant]);

  if (!isPlatformCoreMode() || emptyChain) return null;

  const totalInboxUnread = perOrderRows.reduce((sum, row) => sum + row.totalUnread, 0);

  return (
    <div
      className="border-border-subtle bg-bg-surface1/60 mb-3 space-y-1.5 rounded-lg border px-2 py-1.5"
      data-testid="comms-universal-inbox-strip"
      data-comms-sse-live={sseLive ? '1' : '0'}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p
          className="text-text-secondary text-[10px] font-semibold uppercase tracking-wide"
          data-testid={`${prefix}-universal-inbox-title`}
        >
          Входящие по заказам
        </p>
        {summaryLoaded ? (
          <span
            className="text-text-muted text-[10px]"
            data-testid={`${prefix}-universal-inbox-total`}
          >
            {totalInboxUnread > 0 ? `${totalInboxUnread} непрочит.` : 'нет новых'}
          </span>
        ) : (
          <span className="text-text-muted text-[10px]">…</span>
        )}
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            sseLive ? 'bg-emerald-500' : 'bg-amber-400'
          )}
          title={sseLive ? 'SSE онлайн' : 'Опрос'}
          aria-hidden
        />
      </div>

      {orderId ? (
        <CommsNotificationCenterStrip
          variant={variant}
          collectionId={collectionId}
          orderId={orderId}
          orderScoped
          compact
        />
      ) : null}

      <div data-testid={`${prefix}-universal-inbox-po-list`}>
        {summaryLoaded && perOrderRows.length > 0 ? (
          <ul className="space-y-0.5">
            {perOrderRows.map((row) => {
              const calendarRow = universalInboxOrderCalendarRowLinks(variant, row.orderId, {
                factoryId: demo.factoryId,
                collectionId,
              });
              const chatHref = universalInboxOrderDeepLinks(variant, row.orderId, {
                factoryId: demo.factoryId,
              }).chatHref;
              const active = row.orderId === orderId.trim();
              const unreadLabel =
                row.totalUnread > 99 ? '99+' : String(Math.max(0, row.totalUnread));
              return (
                <li
                  key={row.orderId}
                  data-testid={`${prefix}-universal-inbox-po-row`}
                  data-order-id={row.orderId}
                  data-unread={String(row.totalUnread)}
                  className={cn(
                    'flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded px-0.5 py-0.5 text-[10px]',
                    active && 'bg-bg-surface2/80'
                  )}
                >
                  <span className="text-text-primary min-w-0 flex-1 truncate font-medium">
                    {universalInboxOrderLabelRu(row.orderId)}
                    {row.totalUnread > 0 ? (
                      <span
                        className="bg-accent-primary text-text-inverse ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold leading-none"
                        data-testid={`${prefix}-universal-inbox-order-unread-${row.orderId}`}
                        aria-label={`${row.totalUnread} непрочитанных`}
                      >
                        {unreadLabel}
                      </span>
                    ) : null}
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    <Link
                      href={chatHref}
                      className="text-accent-primary font-medium hover:underline"
                      data-testid={`${prefix}-universal-inbox-po-chat-link`}
                    >
                      Чат
                    </Link>
                    <span className="text-text-muted select-none" aria-hidden>
                      ·
                    </span>
                    <Link
                      href={calendarRow.trackingHref}
                      className="text-accent-primary font-medium hover:underline"
                      data-testid={`${prefix}-universal-inbox-po-calendar-tracking-link`}
                      title="Открыть трекинг заказа"
                    >
                      Трекинг
                    </Link>
                    <span className="text-text-muted select-none" aria-hidden>
                      →
                    </span>
                    <Link
                      href={calendarRow.calendarHref}
                      className="text-accent-primary font-medium hover:underline"
                      data-testid={`${prefix}-universal-inbox-po-calendar-link`}
                      data-pc-task={calendarRow.pcTaskId}
                      title="Календарь · chain-status pcTask"
                    >
                      Календарь
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : summaryLoaded ? (
          <p
            className="text-text-muted text-[10px]"
            data-testid={`${prefix}-universal-inbox-po-empty`}
          >
            Заказы появятся после оформления матрицы
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Universal inbox на /messages: PG unread по заказам + notification center активного order. */
export function PlatformCoreCommsUniversalInboxStrip(props: Props) {
  return (
    <Suspense fallback={null}>
      <UniversalInboxInner {...props} />
    </Suspense>
  );
}
