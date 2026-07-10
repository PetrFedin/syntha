'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { ShopCoTrackingEtaPeekStrip } from '@/components/platform/ShopCoTrackingEtaPeekStrip';
import { ShopOpCabinetSpinePeerStrip } from '@/components/platform/ShopOpCabinetSpinePeerStrip';
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

/** Shop · order_production: компактный статус, timeline и один следующий шаг. */
export function ShopOrderProductionPillarCard({ compact = false, minimalChrome = false }: Props) {
  const demo = usePlatformCoreDemoContext();
  const auditUi = usePlatformCoreAuditUi();
  const suppressChainBadge = shouldSuppressHubCabinetChainStatusBadge({ compact, auditUi });
  const { collectionId, demoOrderId: fallbackOrderId } = demo;
  const w2Fallback = fallbackOrderId.startsWith('__') ? '' : fallbackOrderId;

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
    reloadNonce: chainPollTick,
  });

  const op = pickOrderProductionSnapshot(snapshot);
  const chainSteps = op?.chainSteps ?? [];
  const productionOrderId = op?.productionOrderId ?? null;
  const trackingPreview = op?.trackingPreview ?? null;
  const completedSteps = chainSteps.filter((step) => step.done).length;
  const nextStep = chainSteps.find((step) => !step.done) ?? null;
  const trackingHref = shopCoCabinetTrackingEmbedAnchorHref(collectionId, cabinetOrderId);

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
                title="Исполнение заказа"
                subtitle={formatWholesaleOrderDisplayId(cabinetOrderId)}
              />
            ) : (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">Исполнение заказа</p>
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
            Выполнено {completedSteps} из {chainSteps.length || '—'} этапов
          </span>
          {trackingPreview?.deliveryLabel ? (
            <span className="text-[11px] text-text-muted">ETA {trackingPreview.deliveryLabel}</span>
          ) : null}
        </div>

        {nextStep ? (
          <div className="flex items-start gap-2 rounded-md bg-amber-50/70 px-2.5 py-2 text-[11px] text-amber-950">
            <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="font-medium">Следующий этап</p>
              <p className="truncate">{nextStep.labelRu}</p>
            </div>
          </div>
        ) : null}

        {chainSteps.length > 0 ? (
          <ol className="grid gap-1 md:grid-cols-2" data-testid="shop-op-cabinet-chain-steps">
            {chainSteps.map((step) => (
              <li
                key={step.id}
                className="border-border-subtle flex min-h-8 items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px]"
                data-testid={`shop-op-cabinet-chain-step-${step.id}`}
                data-done={step.done ? 'true' : 'false'}
              >
                {step.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                )}
                <span className="min-w-0 truncate">{step.labelRu}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[11px] text-text-muted">Этапы исполнения ещё не опубликованы брендом.</p>
        )}

        <ShopCoTrackingEtaPeekStrip
          orderId={cabinetOrderId}
          variant="cabinet"
          trackingNumberPreview={trackingPreview?.trackingNumber}
        />

        <Link
          href={trackingHref}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-accent-primary px-3 text-[12px] font-semibold text-accent-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          data-testid="shop-op-primary-tracking-action"
        >
          Открыть трекинг и приёмку
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>

        {!minimalChrome ? (
          <ShopOpCabinetSpinePeerStrip collectionId={collectionId} orderId={cabinetOrderId} />
        ) : null}
      </CardContent>
    </Card>
  );
}
