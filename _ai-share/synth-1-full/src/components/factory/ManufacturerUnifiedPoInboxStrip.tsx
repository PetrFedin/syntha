'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { useFactoryHandoffQueueSse } from '@/hooks/use-factory-handoff-queue-sse';
import { pickOrderProductionSnapshot } from '@/lib/platform-core-pillar-snapshot.types';
import {
  factoryHandoffQueueHrefForDemo,
  getPlatformCoreDemo,
} from '@/lib/platform-core-hub-matrix';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import { ChevronRight } from 'lucide-react';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  factoryMessagesB2bOrderContextHref,
  factoryProductionOrdersOrderContextHref,
  factoryMessagesRoleHref,
} from '@/lib/routes';

type HandoffQueueItem = {
  b2bOrderId?: string;
  productionOrderId: string;
  articleId?: string;
};

type Props = {
  compact?: boolean;
  /** Core cabinet notifications aside — section rows. */
  minimalChrome?: boolean;
};

/** Comms hub — unified PO inbox: все PO из production handoff queue (не только snapshot ≤3). */
export function ManufacturerUnifiedPoInboxStrip({
  compact = false,
  minimalChrome = false,
}: Props) {
  const demo = usePlatformCoreDemoContext();
  const { collectionId, factoryId, demoOrderId: fallbackOrderId } = demo;
  const w2Fallback = fallbackOrderId.startsWith('__') ? '' : fallbackOrderId;

  const { activeOrderId: orderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: w2Fallback,
    collectionId,
    resolveFrom: ['w2_registry', 'handoff', 'allocation'],
    factoryId,
  });

  const cabinetOrderId = resolvePlatformCoreCabinetOrderId(
    orderId,
    getPlatformCoreDemo(collectionId).demoOrderId
  );

  const { tick: handoffTick, sseConnected } = useFactoryHandoffQueueSse(factoryId, Boolean(factoryId));

  const { snapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'manufacturer',
    pillarVariant: 'manufacturer',
    wholesaleOrderId: orderId || undefined,
    factoryId,
    reloadNonce: handoffTick,
  });

  const op = pickOrderProductionSnapshot(snapshot);
  const snapshotItems = op?.handoffItems ?? [];
  const [queueItems, setQueueItems] = useState<HandoffQueueItem[]>(snapshotItems);

  useEffect(() => {
    if (!factoryId.trim()) return;
    let cancelled = false;
    void fetch(
      `/api/workshop2/factory/production-handoff-queue?factoryId=${encodeURIComponent(factoryId)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          items?: Array<{
            b2bOrderId?: string;
            productionOrderId?: string;
            articleId?: string;
          }>;
        };
      })
      .then((json) => {
        if (cancelled || !json?.items?.length) return;
        setQueueItems(
          json.items.flatMap((item) => {
            const productionOrderId = item.productionOrderId?.trim();
            if (!productionOrderId) return [];
            return [
              {
                productionOrderId,
                b2bOrderId: item.b2bOrderId?.trim(),
                articleId: item.articleId?.trim(),
              },
            ];
          })
        );
      })
      .catch(() => {
        /* fallback snapshot */
      });
    return () => {
      cancelled = true;
    };
  }, [factoryId, handoffTick]);

  const handoffItems = queueItems.length > 0 ? queueItems : snapshotItems;
  const queueCount = handoffItems.length;
  const handoffQueueHref = factoryHandoffQueueHrefForDemo({ ...demo, demoOrderId: cabinetOrderId });
  const inboxHref = factoryMessagesRoleHref('manufacturer');

  if (queueCount === 0) return null;

  if (minimalChrome) {
    const visible = handoffItems.slice(0, 3);
    return (
      <section className="space-y-2" data-testid="mfr-cm-unified-po-inbox-strip">
        <p className={hubSectionLabelClassName()}>PO inbox · {queueCount}</p>
        <nav className={pillarInsight.sectionList}>
          {visible.map((item) => (
            <Link
              key={item.productionOrderId}
              href={
                item.b2bOrderId
                  ? factoryProductionOrdersOrderContextHref(item.b2bOrderId, { factoryId })
                  : handoffQueueHref
              }
              data-testid={`mfr-cm-unified-po-link-${item.productionOrderId}`}
              className={pillarInsight.sectionRow}
            >
              <span className={pillarInsight.sectionRowLabel}>{item.productionOrderId}</span>
              <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
            </Link>
          ))}
        </nav>
        {queueCount > visible.length ? (
          <Link
            href={handoffQueueHref}
            className="text-accent-primary inline-flex min-h-10 items-center text-[11px] font-medium hover:underline"
          >
            Вся очередь ({queueCount})
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-indigo-50/40 px-3 py-2 text-xs"
      data-testid="mfr-cm-unified-po-inbox-strip"
      data-handoff-sse-live={sseConnected ? '1' : '0'}
    >
      <Badge variant="outline" className="text-[11px] uppercase">
        PO inbox
      </Badge>
      <span className="text-text-secondary">
        {queueCount} в очереди{compact ? '' : ' — все PO в comms и prod-orders'}.
      </span>
      {handoffItems.slice(0, compact ? 3 : 5).map((item) => (
        <Link
          key={item.productionOrderId}
          href={
            item.b2bOrderId
              ? factoryProductionOrdersOrderContextHref(item.b2bOrderId, { factoryId })
              : handoffQueueHref
          }
          data-testid={`mfr-cm-unified-po-link-${item.productionOrderId}`}
          className="text-accent-primary font-medium hover:underline"
        >
          {item.productionOrderId}
        </Link>
      ))}
      <Link
        href={handoffQueueHref}
        data-testid="mfr-cm-unified-po-handoff-queue-link"
        className="text-accent-primary font-medium hover:underline"
      >
        Очередь ({queueCount}) →
      </Link>
      {queueCount > 3 ? (
        <Link
          href={factoryProductionOrdersOrderContextHref(cabinetOrderId, { factoryId })}
          data-testid="mfr-cm-unified-po-all-orders-link"
          className="text-accent-primary font-medium hover:underline"
        >
          Все PO →
        </Link>
      ) : null}
      <Link
        href={factoryMessagesB2bOrderContextHref(cabinetOrderId, { role: 'manufacturer' })}
        data-testid="mfr-cm-unified-po-order-chat-link"
        className="text-accent-primary font-medium hover:underline"
      >
        Чат PO
      </Link>
      <Link
        href={inboxHref}
        data-testid="mfr-cm-unified-po-inbox-more"
        className="text-accent-primary font-medium hover:underline"
      >
        Все треды →
      </Link>
    </div>
  );
}
