'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { pickOrderProductionSnapshot } from '@/lib/platform-core-pillar-snapshot.types';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { BrandOrderShipmentSpineStrip } from '@/components/integrations/BrandOrderShipmentSpineStrip';
import { BrandAllocationSpinePanel } from '@/components/integrations/BrandAllocationSpinePanel';
import { BrandCollectionAllocationQueueBadge } from '@/components/integrations/BrandCollectionAllocationQueueBadge';
import {
  brandB2bOrderHref,
  brandB2bOrdersProductionRegistryHref,
} from '@/lib/platform-core-routes';
import { brandOpFactoryProductionOrderPeerHref } from '@/lib/platform-core-baseline-peer-hrefs';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { getPlatformCoreDemo } from '@/lib/platform-core-demo-context';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PillarInsightHeader } from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { usePlatformCoreHubAuditLegacyAttrs } from '@/hooks/use-platform-core-hub-audit-legacy-attrs';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isPlatformCoreTwoRoleBaseline } from '@/lib/platform-core-article-spine';
import { formatPlatformCoreWmsReserveBrandBadgeRu } from '@/lib/platform-core-wms-reserve-copy';
import { BrandOpCabinetSpinePeerStrip } from '@/components/platform/BrandOpCabinetSpinePeerStrip';
import { BrandOpChainSseDedupStrip } from '@/components/platform/BrandOpChainSseDedupStrip';
import { BrandOrderProductionWorkflowPanel } from '@/components/platform/BrandOrderProductionWorkflowPanel';
import { BRAND_OP_CABINET_SSE_DEDUP_STRIP_TESTID } from '@/lib/platform-core-ports/fashion/brand-op-wave-vq';
import { buildBrandOpChainMaterialsSupplierPatchHref } from '@/lib/platform-core-ports/fashion/brand-op-wave-xm';
import { WAVE_WZ_OP_NO_ORDER_RU } from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { cn } from '@/lib/utils';

type Props = {
  compact?: boolean;
  minimalChrome?: boolean;
};

const OP_RESOLVE_BRAND = ['w2_registry', 'handoff', 'allocation', 'operational'] as const;

/** Baseline Brand Order Production: hub insight в compact и рабочий workflow в полном режиме. */
export function OrderProductionPillarCardBrand({
  compact = false,
  minimalChrome = false,
}: Props) {
  const demo = usePlatformCoreDemoContext();
  const auditLegacy = usePlatformCoreHubAuditLegacyAttrs();
  const { demoOrderId: fallbackOrderId, factoryId, collectionId, demoArticleId } = demo;
  const w2Fallback = fallbackOrderId.startsWith('__') ? '' : fallbackOrderId;
  const [spineReload, setSpineReload] = useState(0);

  const { activeOrderId: orderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: w2Fallback,
    collectionId,
    resolveFrom: OP_RESOLVE_BRAND,
    actorRole: 'brand',
    factoryId,
    reloadNonce: spineReload,
  });

  const canonicalDemoOrderId = getPlatformCoreDemo(collectionId).demoOrderId;
  const cabinetOrderId = resolvePlatformCoreCabinetOrderId(
    orderId || w2Fallback,
    canonicalDemoOrderId
  );
  const demoWithOrder = { ...demo, demoOrderId: cabinetOrderId };
  const hasActiveOrder = orderId.trim().length > 0;
  const isSpineActive = isIntegrationImportedWholesaleOrderId(orderId);
  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled('brand');
  const pollOrderIds = orderId.trim() ? [orderId] : [];
  const chainPollEnabled = chainPushEnabled && pollOrderIds.length > 0;
  const { tick: chainPollTick, sseConnected } = usePlatformCoreChainStatusPoll(
    chainPollEnabled,
    pollOrderIds
  );

  useEffect(() => {
    setSpineReload(chainPollTick);
  }, [chainPollTick]);

  const { snapshot, loading: snapshotLoading } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'brand',
    pillarVariant: 'brand',
    wholesaleOrderId: orderId || undefined,
    factoryId,
    reloadNonce: chainPollTick,
  });
  const op = pickOrderProductionSnapshot(snapshot);
  const chainSteps = op?.chainSteps ?? [];
  const productionOrderId = op?.productionOrderId ?? undefined;
  const bomLineCount = op?.bomLineCount ?? null;
  const materialsSuppliedDone =
    chainSteps.find((step) => step.id === 'materials_supplied')?.done === true;
  const inventoryReservedDone =
    chainSteps.find((step) => step.id === 'inventory_reserved')?.done === true;
  const coreSlim = isPlatformCoreMode();
  const twoRoleBaseline = isPlatformCoreTwoRoleBaseline();

  if (compact && snapshotLoading && !op) {
    return <PlatformCorePillarInsightSkeleton testId="brand-op-pillar-insight-skeleton" />;
  }

  return (
    <Card
      data-testid="brand-op-cabinet-panel"
      {...auditLegacy('order-production-pillar-card')}
      data-variant="brand"
      data-active-order-id={orderId}
      data-spine-order={isSpineActive ? 'true' : 'false'}
      className={cn(compact ? hubGadget.pillarCard : 'border-border-subtle shadow-none')}
    >
      <CardContent className={cn(compact ? hubGadget.pillarBody : 'space-y-2.5 p-3')}>
        {compact && !minimalChrome ? (
          <PillarInsightHeader
            icon={Package}
            title="Заказ → производство"
            subtitle={
              twoRoleBaseline
                ? 'Исполнение опта: передача, PO и статус серии.'
                : 'Передача, PO и статус серии у цеха.'
            }
          />
        ) : null}

        {compact && !minimalChrome && hasActiveOrder ? (
          <PlatformCorePillarNotificationCenterCompact
            variant="brand"
            compact
            collectionId={collectionId}
            orderId={cabinetOrderId}
            orderScoped
          />
        ) : null}

        {!compact && !minimalChrome ? (
          <div className="flex justify-end">
            <PlatformCoreChainStatusRefreshBadge
              sseConnected={sseConnected}
              enabled={chainPollEnabled}
              sseTestId="brand-op-cabinet-sse-live-badge"
              pollTestId="brand-op-cabinet-poll-badge"
              sseLegacyTestId="brand-op-chain-sse-live-badge"
            />
          </div>
        ) : null}

        {compact ? (
          <ul
            className="space-y-1.5"
            data-testid="brand-op-cabinet-chain-steps"
            data-audit-legacy="brand-op-chain-steps"
          >
            {!hasActiveOrder && chainSteps.length === 0 ? (
              <li className="text-[10px] text-muted-foreground">
                {WAVE_WZ_OP_NO_ORDER_RU}
              </li>
            ) : null}
            {chainSteps.map((step) => (
              <li
                key={step.id}
                className="flex flex-wrap items-start gap-x-2 gap-y-0.5 text-xs"
                data-testid={`platform-core-chain-step-${step.id}`}
                data-done={step.done ? 'true' : 'false'}
              >
                {step.done ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                )}
                <span>{step.labelRu}</span>
                {step.id === 'materials_supplied' && !twoRoleBaseline ? (
                  <Link
                    href={buildBrandOpChainMaterialsSupplierPatchHref({
                      orderId: cabinetOrderId,
                      productionOrderId,
                      collectionId: demoWithOrder.collectionId,
                      articleId: demoWithOrder.demoArticleId,
                    })}
                    className="text-accent-primary text-[10px] font-medium hover:underline"
                  >
                    {step.done ? 'Закупка' : 'Закупка →'}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : hasActiveOrder ? (
          <BrandOrderProductionWorkflowPanel
            collectionId={collectionId}
            orderId={cabinetOrderId}
            articleId={demoArticleId}
            productionOrderId={productionOrderId}
            chainSteps={chainSteps}
          />
        ) : (
          <p className="rounded-md border border-border-subtle bg-bg-surface2/50 px-2.5 py-2 text-[11px] text-text-muted">
            {WAVE_WZ_OP_NO_ORDER_RU}
          </p>
        )}

        {hasActiveOrder && compact ? (
          <p className="text-text-muted text-[10px]" data-testid="brand-op-cabinet-sot-strip">
            Полные факты в{' '}
            <Link href={brandB2bOrderHref(cabinetOrderId)} className="font-medium text-accent-primary hover:underline">
              карточке заказа
            </Link>
            {' · '}
            <Link
              href={brandB2bOrdersProductionRegistryHref(cabinetOrderId)}
              className="font-medium text-accent-primary hover:underline"
            >
              реестре
            </Link>
          </p>
        ) : null}

        {hasActiveOrder && compact && coreSlim ? (
          <BrandOpChainSseDedupStrip
            orderId={cabinetOrderId}
            sseConnected={sseConnected}
            stripTestId={BRAND_OP_CABINET_SSE_DEDUP_STRIP_TESTID}
            chainLinkTestId="brand-op-cabinet-sse-dedup-chain-link"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-1.5">
          {productionOrderId ? (
            <Link
              href={brandOpFactoryProductionOrderPeerHref(cabinetOrderId, { factoryId })}
              className="inline-flex"
              data-testid="brand-op-po-id-badge"
            >
              <Badge variant="outline" className={compact ? hubGadget.metaBadge : 'h-5 rounded px-1.5 text-[10px]'}>
                PO {productionOrderId}
              </Badge>
            </Link>
          ) : null}

          {compact ? <BrandCollectionAllocationQueueBadge reloadNonce={chainPollTick} /> : null}

          {chainSteps.some((step) => step.id === 'inventory_reserved') && !compact ? (
            <Badge
              variant="outline"
              data-testid="brand-op-cabinet-wms-reserve-badge"
              className={cn(
                'h-5 rounded px-1.5 text-[10px]',
                inventoryReservedDone
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              )}
            >
              {formatPlatformCoreWmsReserveBrandBadgeRu(inventoryReservedDone)}
            </Badge>
          ) : null}

          {bomLineCount != null && bomLineCount > 0 && !compact ? (
            <Badge
              variant="outline"
              data-testid="brand-op-bom-preview-badge"
              className={cn(
                'h-5 rounded px-1.5 text-[10px]',
                materialsSuppliedDone || !chainSteps.some((step) => step.id === 'materials_supplied')
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              )}
            >
              BOM {bomLineCount}
              {chainSteps.some((step) => step.id === 'materials_supplied')
                ? materialsSuppliedDone
                  ? ' · материалы ✓'
                  : ' · материалы…'
                : ''}
            </Badge>
          ) : null}
        </div>

        {isSpineActive && !compact ? (
          <div className="space-y-2 border-t border-border-subtle pt-2" data-testid="brand-op-spine-strips">
            <BrandAllocationSpinePanel orderId={orderId} />
            <BrandOrderShipmentSpineStrip orderId={orderId} />
          </div>
        ) : null}

        {!compact && hasActiveOrder && !minimalChrome ? (
          <div className="border-t border-border-subtle pt-2" data-testid="brand-op-cabinet-cta-strip">
            <BrandOpCabinetSpinePeerStrip orderId={cabinetOrderId} collectionId={collectionId} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
