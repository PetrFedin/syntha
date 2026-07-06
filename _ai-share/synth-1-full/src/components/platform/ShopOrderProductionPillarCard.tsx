'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
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
import { WAVE_WZ_SHOP_OP_WIP_BADGE_PREFIX_RU } from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU, shopCoCabinetTrackingEmbedAnchorHref } from '@/lib/platform-core-ports/platform/wave-xy-shop-co-tracking-embed';
import { shouldSuppressHubCabinetChainStatusBadge } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  compact?: boolean;
  minimalChrome?: boolean;
};

/** Shop hub · order_production — read-only WIP + chain steps + calendar ↔ tracking peers. */
export function ShopOrderProductionPillarCard({
  compact = false,
  minimalChrome = false,
}: Props) {
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

  if (loading && !op) {
    return <PlatformCorePillarInsightSkeleton testId="shop-op-cabinet-skeleton" />;
  }

  if (!hasActiveOrder) {
    return (
      <p className="text-text-muted text-xs" data-testid="shop-op-cabinet-empty">
        Нет активного заказа для трекинга производства.
      </p>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {!minimalChrome ? (
          <PlatformCorePillarNotificationCenterCompact
            variant="shop"
            compact
            collectionId={collectionId}
            orderId={cabinetOrderId}
            orderScoped
          />
        ) : null}
        <div className={hubGadget.goldenPath} data-testid="shop-op-cabinet-co-tracking-dedup">
          <Link
            href={shopCoCabinetTrackingEmbedAnchorHref(collectionId, cabinetOrderId)}
            className={hubGadget.goldenLink}
            data-testid="shop-op-cabinet-co-tracking-dedup-link"
          >
            {WAVE_XY_SHOP_OP_CO_TRACKING_DEDUP_LINK_RU}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card
      data-testid="shop-op-cabinet-panel"
      data-chain-sse-live={sseConnected ? '1' : '0'}
      className={hubGadget.pillarCard}
    >
      <CardContent className={hubGadget.pillarBody}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          {!minimalChrome ? (
            <PillarInsightHeader
              icon={Package}
              title="Трекинг PO"
              subtitle={formatWholesaleOrderDisplayId(cabinetOrderId)}
            />
          ) : null}
          {!minimalChrome && !suppressChainBadge ? (
            <PlatformCoreChainStatusRefreshBadge
              sseConnected={sseConnected}
              enabled={chainPushEnabled && pollOrderIds.length > 0}
              sseTestId="shop-op-cabinet-sse-live-badge"
              pollTestId="shop-op-cabinet-poll-badge"
            />
          ) : null}
        </div>
      {productionOrderId ? (
        <Badge variant="outline" className={hubGadget.metaBadge} data-testid="shop-op-cabinet-po-badge">
          PO {productionOrderId}
        </Badge>
      ) : null}
      {trackingPreview?.wipLabelRu ? (
        <Badge
          variant="outline"
          className="border-indigo-200 bg-indigo-50 text-[9px] text-indigo-900"
          data-testid="shop-op-cabinet-wip-badge"
        >
          {WAVE_WZ_SHOP_OP_WIP_BADGE_PREFIX_RU} {trackingPreview.wipLabelRu}
        </Badge>
      ) : null}
      {trackingPreview?.deliveryLabel && !compact ? (
        <Badge
          variant="outline"
          className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
          data-testid="shop-op-cabinet-delivery-badge"
        >
          ETA · {trackingPreview.deliveryLabel}
        </Badge>
      ) : null}
      {chainSteps.length > 0 ? (
        <ul className="space-y-1" data-testid="shop-op-cabinet-chain-steps">
          {chainSteps.map((step) => (
            <li
              key={step.id}
              className="flex items-start gap-1.5 text-xs"
              data-testid={`shop-op-cabinet-chain-step-${step.id}`}
              data-done={step.done ? 'true' : 'false'}
            >
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span>{step.labelRu}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <ShopCoTrackingEtaPeekStrip
        orderId={cabinetOrderId}
        variant="cabinet"
        trackingNumberPreview={trackingPreview?.trackingNumber}
      />
      {!minimalChrome ? (
        <ShopOpCabinetSpinePeerStrip collectionId={collectionId} orderId={cabinetOrderId} />
      ) : null}
      </CardContent>
    </Card>
  );
}
