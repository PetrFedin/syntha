'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { BrandOpHandoffInventoryPeerStrip } from '@/components/platform/BrandOpHandoffInventoryPeerStrip';
import { BrandOpHandoffCoSpinePeerStrip } from '@/components/platform/BrandOpHandoffCoSpinePeerStrip';
import { BrandOpOperationsHandoffPeerStrip } from '@/components/platform/BrandOpOperationsHandoffPeerStrip';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { brandProductionQcBlocksHandoffCount } from '@/lib/brand-production/qc-gate';
import type { BrandProductionState } from '@/lib/brand-production';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { Factory, Truck } from 'lucide-react';

type Props = {
  state: BrandProductionState;
  selectedCollectionId: string;
  orderId?: string;
  factoryId?: string;
};

export function BrandProductionHandoffPanel({
  state,
  selectedCollectionId,
  orderId,
  factoryId = PLATFORM_CORE_DEMO.factoryId,
}: Props) {
  const resolvedOrderId =
    orderId?.trim() || state.b2bOrderRefs.find((r) => r.status !== 'cancelled')?.orderRef;
  const session = buildBrandProductionHandoffSession({
    orderId: resolvedOrderId,
    collectionId: selectedCollectionId,
    factoryId,
  });
  const refsForCollection = state.b2bOrderRefs.filter(
    (r) =>
      state.articles.some(
        (a) => a.collectionId === selectedCollectionId && a.sku === r.articleSku
      ) || !selectedCollectionId
  );
  const { sseConnected } = usePlatformCoreChainStatusPoll(Boolean(resolvedOrderId), [
    resolvedOrderId ?? '',
  ]);
  const manufacturerQcHref = manufacturerHandoffFeatureHref('qc-gate', {
    factoryId,
    collectionId: selectedCollectionId,
    orderId: resolvedOrderId,
  });
  const manufacturerAckHref = manufacturerHandoffFeatureHref('techpack-ack', {
    factoryId,
    collectionId: selectedCollectionId,
    orderId: resolvedOrderId,
  });
  const qcBlocksHandoff = useMemo(() => brandProductionQcBlocksHandoffCount(state), [state]);

  return (
    <div className="space-y-4" data-testid="brand-production-handoff-panel">
      {resolvedOrderId ? (
        <>
          <BrandOpOperationsHandoffPeerStrip
            orderId={resolvedOrderId}
            collectionId={selectedCollectionId}
            factoryId={factoryId}
            activeFeature="handoff"
          />
          <BrandOpHandoffInventoryPeerStrip
            orderId={resolvedOrderId}
            collectionId={selectedCollectionId}
            factoryId={factoryId}
          />
          <BrandOpHandoffCoSpinePeerStrip
            orderId={resolvedOrderId}
            collectionId={selectedCollectionId}
            factoryId={factoryId}
          />
        </>
      ) : null}
      {qcBlocksHandoff > 0 ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
          data-testid="brand-op-qc-gate-blocks-handoff"
        >
          <p className="text-destructive font-medium">
            Передача в цех заблокирована: {qcBlocksHandoff} инспекций QC не пройдены (fail/rework).
          </p>
          <p className="text-text-secondary mt-1 text-xs">
            Закройте контроль качества перед handoff — API вернёт 409.
          </p>
          <Button size="sm" variant="outline" className="mt-2 h-7" asChild>
            <Link href={session.qcGateTabHref} data-testid="brand-production-handoff-qc-tab-link">
              Открыть контроль качества
            </Link>
          </Button>
        </div>
      ) : null}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Factory className="h-4 w-4" />
            <CardTitle className="text-base">Передача → очередь цеха</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase">
              {refsForCollection.length} B2B-ссылок
            </Badge>
            {resolvedOrderId ? (
              <PlatformCoreChainStatusRefreshBadge
                sseConnected={sseConnected}
                enabled
                sseTestId="brand-production-handoff-chain-sse-live-badge"
                pollTestId="brand-production-handoff-chain-poll-badge"
              />
            ) : null}
            {qcBlocksHandoff > 0 ? (
              <Badge variant="destructive" className="text-[10px] uppercase" data-testid="brand-production-handoff-qc-block-badge">
                QC блок: {qcBlocksHandoff}
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            W2: подтверждённый B2B → очередь передачи цеха → техкарта раскроя → контроль качества.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link
              href={session.factoryQueueHref}
              data-testid="brand-production-handoff-factory-queue-link"
            >
              Очередь цеха
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.cutTicketTabHref}>Техкарта раскроя</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.qcGateTabHref} data-testid="brand-production-handoff-qc-tab-link">
              Контроль качества
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={manufacturerQcHref} data-testid="brand-production-handoff-manufacturer-qc-link">
              КК производства
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={manufacturerAckHref} data-testid="brand-production-handoff-factory-ack-link">
              Подтверждение ТЗ
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.factoryOrdersHref}>Заказы цеха</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Truck className="h-4 w-4" />
            <CardTitle className="text-base">Магазин · трекинг и заказы</CardTitle>
          </div>
          <CardDescription>Трекинг и рабочий заказ после передачи.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {resolvedOrderId ? (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.shopTrackingHref}>Трекинг магазина</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.shopWorkingOrderHref}>Рабочий заказ</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={session.shopOrderCommsHref}>Чат по заказу</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href={session.manufacturerOrderCommsHref}>Чат с производством</Link>
              </Button>
            </>
          ) : (
            <p className="text-text-secondary text-sm">
              Укажите `?order=` в URL или подтвердите B2B на вкладке «Операции».
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
