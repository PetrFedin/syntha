'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { ShopCoTrackingEtaPeekStrip } from '@/components/platform/ShopCoTrackingEtaPeekStrip';
import { ShopOpCabinetSpinePeerStrip } from '@/components/platform/ShopOpCabinetSpinePeerStrip';
import { ShopOrderProductionReceivingPanel } from '@/components/platform/ShopOrderProductionReceivingPanel';
import { ShopOrderProductionClaimPanel } from '@/components/platform/ShopOrderProductionClaimPanel';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { PillarInsightHeader } from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { pickOrderProductionSnapshot } from '@/lib/platform-core-pillar-snapshot.types';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import {
  WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU,
  shopCoCabinetTrackingEmbedAnchorHref,
} from '@/lib/platform-core-ports/platform/wave-xy-shop-co-tracking-embed';
import { shouldSuppressHubCabinetChainStatusBadge } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  compact?: boolean;
  minimalChrome?: boolean;
};

type TimelineStage = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  active: boolean;
};

function buildTimeline(op: ReturnType<typeof pickOrderProductionSnapshot>): TimelineStage[] {
  const qcStatus = op?.qcStatus ?? 'not_started';
  const packingStatus = op?.packingStatus ?? 'not_started';
  const shipmentStatus = op?.shipmentStatus ?? 'not_ready';
  const acceptanceStatus = op?.acceptanceStatus ?? 'pending';
  const closeoutStatus = op?.closeoutStatus ?? 'open';

  return [
    {
      id: 'qc',
      label: 'QC',
      detail: qcStatus === 'passed' || qcStatus === 'waived' ? 'Проверка завершена' : 'Ожидает завершения',
      done: qcStatus === 'passed' || qcStatus === 'waived',
      active: qcStatus === 'in_progress' || qcStatus === 'failed',
    },
    {
      id: 'packing',
      label: 'Packing',
      detail: packingStatus === 'issued' ? 'Упаковка и документы готовы' : 'Подготовка упаковки',
      done: packingStatus === 'issued',
      active: packingStatus === 'in_progress' || packingStatus === 'ready',
    },
    {
      id: 'shipping',
      label: 'Shipping',
      detail:
        shipmentStatus === 'delivered'
          ? 'Поставка доставлена'
          : shipmentStatus === 'dispatched' || shipmentStatus === 'partially_delivered'
            ? 'Поставка в пути'
            : 'Ожидает отгрузки',
      done: shipmentStatus === 'delivered',
      active: shipmentStatus === 'dispatched' || shipmentStatus === 'partially_delivered',
    },
    {
      id: 'receiving',
      label: 'Receiving',
      detail:
        ['dispatched', 'partially_delivered', 'delivered'].includes(shipmentStatus)
          ? 'Приёмка доступна магазину'
          : 'Ожидает отправки',
      done: acceptanceStatus !== 'pending',
      active:
        acceptanceStatus === 'pending' &&
        ['dispatched', 'partially_delivered', 'delivered'].includes(shipmentStatus),
    },
    {
      id: 'acceptance',
      label: 'Acceptance',
      detail:
        acceptanceStatus === 'accepted'
          ? 'Принято без расхождений'
          : acceptanceStatus === 'accepted_with_discrepancy'
            ? 'Принято с расхождениями'
            : acceptanceStatus === 'rejected'
              ? 'Поставка отклонена'
              : 'Решение не принято',
      done: acceptanceStatus === 'accepted',
      active: acceptanceStatus === 'accepted_with_discrepancy' || acceptanceStatus === 'rejected',
    },
    {
      id: 'closeout',
      label: 'Closeout',
      detail:
        closeoutStatus === 'closed'
          ? 'Заказ закрыт'
          : closeoutStatus === 'ready_to_close'
            ? 'Готов к закрытию'
            : closeoutStatus === 'blocked'
              ? 'Закрытие заблокировано'
              : 'Ожидает завершения',
      done: closeoutStatus === 'closed',
      active: closeoutStatus === 'ready_to_close' || closeoutStatus === 'blocked',
    },
  ];
}

/** Shop · order_production: tracking, timeline, receiving, acceptance and claims. */
export function ShopOrderProductionPillarCard({ compact = false, minimalChrome = false }: Props) {
  const demo = usePlatformCoreDemoContext();
  const auditUi = usePlatformCoreAuditUi();
  const suppressChainBadge = shouldSuppressHubCabinetChainStatusBadge({ compact, auditUi });
  const { collectionId, demoOrderId: fallbackOrderId } = demo;
  const w2Fallback = fallbackOrderId.startsWith('__') ? '' : fallbackOrderId;
  const [receivingReload, setReceivingReload] = useState(0);

  const { activeOrderId: orderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: w2Fallback,
    collectionId,
    resolveFrom: ['w2_registry', 'allocation', 'operational'],
    actorRole: 'shop',
  });

  const cabinetOrderId = resolvePlatformCoreCabinetOrderId(
    orderId || w2Fallback,
    getPlatformCoreDemo(collectionId).demoOrderId
  );
  const hasActiveOrder = cabinetOrderId.trim().length > 0;
  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled('shop');
  const pollOrderIds = hasActiveOrder ? [cabinetOrderId] : [];
  const { tick: chainPollTick, sseConnected } = usePlatformCoreChainStatusPoll(
    chainPushEnabled && pollOrderIds.length > 0,
    pollOrderIds
  );

  const { snapshot, loading } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'shop',
    pillarVariant: 'shop',
    wholesaleOrderId: cabinetOrderId || undefined,
    reloadNonce: chainPollTick + receivingReload,
  });

  const op = pickOrderProductionSnapshot(snapshot);
  const productionOrderId = op?.productionOrderId ?? null;
  const trackingPreview = op?.trackingPreview ?? null;
  const trackingHref = shopCoCabinetTrackingEmbedAnchorHref(collectionId, cabinetOrderId);
  const timeline = buildTimeline(op);
  const completedTimeline = timeline.filter((stage) => stage.done).length;
  const activeStage = timeline.find((stage) => stage.active) ?? timeline.find((stage) => !stage.done) ?? null;

  if (loading && !op) {
    return <PlatformCorePillarInsightSkeleton testId="shop-op-cabinet-skeleton" />;
  }

  if (!hasActiveOrder) {
    return (
      <PlatformCoreEmptyState
        title="Нет заказа в производстве"
        reason="После подтверждения и передачи заказа брендом здесь появятся этапы исполнения, отгрузка и приёмка."
        nextActionLabel="Открыть мои заказы"
        nextActionHref="/shop/core?pillar=collection_order&section=shop-co-registry"
      />
    );
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        {!minimalChrome ? (
          <PlatformCorePillarNotificationCenterCompact
            variant="shop"
            compact
            collectionId={collectionId}
            orderId={cabinetOrderId}
            orderScoped
          />
        ) : null}
        <Link
          href={trackingHref}
          className="border-border-subtle hover:bg-bg-surface2 flex h-9 items-center justify-between gap-2 rounded-md border bg-bg-surface px-2.5 text-[11px] font-medium text-text-primary transition-colors"
          data-testid="shop-op-cabinet-co-tracking-dedup-link"
        >
          <span className="truncate">{WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <Card
      data-testid="shop-op-cabinet-panel"
      data-chain-sse-live={sseConnected ? '1' : '0'}
      className={hubGadget.pillarCard}
    >
      <CardContent className="space-y-2.5 p-3">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {!minimalChrome ? (
              <PillarInsightHeader
                icon={Package}
                title="Исполнение и приёмка заказа"
                subtitle={formatWholesaleOrderDisplayId(cabinetOrderId)}
              />
            ) : (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  Исполнение и приёмка заказа
                </p>
                <p className="truncate text-[11px] text-text-muted">
                  {formatWholesaleOrderDisplayId(cabinetOrderId)}
                </p>
              </div>
            )}
          </div>
          {!minimalChrome && !suppressChainBadge ? (
            <PlatformCoreChainStatusRefreshBadge
              sseConnected={sseConnected}
              enabled={chainPushEnabled && pollOrderIds.length > 0}
              sseTestId="shop-op-cabinet-sse-live-badge"
              pollTestId="shop-op-cabinet-poll-badge"
            />
          ) : null}
        </div>

        <div className="border-border-subtle flex flex-wrap items-center gap-1.5 rounded-md border bg-bg-surface2/50 px-2.5 py-2">
          {productionOrderId ? (
            <Badge variant="outline" className="h-5 rounded px-1.5 text-[10px] font-medium">
              PO {productionOrderId}
            </Badge>
          ) : null}
          <span className="text-[11px] text-text-secondary">
            Выполнено {completedTimeline} из {timeline.length} этапов
          </span>
          {trackingPreview?.asnNumber ? (
            <span className="text-[11px] text-text-muted">ASN {trackingPreview.asnNumber}</span>
          ) : null}
          {trackingPreview?.eta || trackingPreview?.deliveryLabel ? (
            <span className="text-[11px] text-text-muted">
              ETA {trackingPreview.eta || trackingPreview.deliveryLabel}
            </span>
          ) : null}
          {op?.hasOpenClaim ? (
            <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800">
              Claim открыт
            </span>
          ) : null}
        </div>

        {activeStage ? (
          <div className="flex items-start gap-2 rounded-md bg-amber-50/70 px-2.5 py-2 text-[11px] text-amber-950">
            <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="font-medium">Текущий этап</p>
              <p className="truncate">{activeStage.label} · {activeStage.detail}</p>
            </div>
          </div>
        ) : null}

        <section className="space-y-1.5" aria-label="Timeline поставки">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[12px] font-semibold text-text-primary">Timeline поставки</h2>
            <span className="text-[10px] text-text-muted">
              {completedTimeline}/{timeline.length}
            </span>
          </div>
          <ol className="grid gap-1 md:grid-cols-2 xl:grid-cols-3" data-testid="shop-op-cabinet-timeline">
            {timeline.map((stage) => (
              <li
                key={stage.id}
                className={`flex min-h-12 items-start gap-1.5 rounded-md border px-2 py-1.5 text-[11px] ${
                  stage.done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : stage.active
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-border-subtle bg-bg-surface'
                }`}
                data-testid={`shop-op-timeline-${stage.id}`}
                data-stage-state={stage.done ? 'done' : stage.active ? 'active' : 'pending'}
              >
                {stage.done ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className="block font-medium text-text-primary">{stage.label}</span>
                  <span className="block text-[10px] leading-4 text-text-muted">{stage.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <ShopCoTrackingEtaPeekStrip
          orderId={cabinetOrderId}
          variant="cabinet"
          trackingNumberPreview={trackingPreview?.trackingNumber}
        />

        <ShopOrderProductionReceivingPanel
          orderId={cabinetOrderId}
          shipmentStatus={op?.shipmentStatus ?? 'not_ready'}
          acceptanceStatus={op?.acceptanceStatus ?? 'pending'}
          hasOpenClaim={op?.hasOpenClaim ?? false}
          documents={op?.documents ?? []}
          asnNumber={trackingPreview?.asnNumber}
          eta={trackingPreview?.eta ?? trackingPreview?.deliveryLabel}
          onSaved={() => setReceivingReload((value) => value + 1)}
        />

        <ShopOrderProductionClaimPanel
          collectionId={collectionId}
          orderId={cabinetOrderId}
          acceptanceStatus={op?.acceptanceStatus ?? 'pending'}
          hasOpenClaim={op?.hasOpenClaim ?? false}
        />

        {!minimalChrome ? (
          <ShopOpCabinetSpinePeerStrip collectionId={collectionId} orderId={cabinetOrderId} />
        ) : null}
      </CardContent>
    </Card>
  );
}
