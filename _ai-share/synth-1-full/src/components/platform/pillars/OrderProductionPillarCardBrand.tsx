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
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandB2bOrdersProductionRegistryHref,
  brandMessagesB2bOrderContextHref,
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
import {
  formatPlatformCoreWmsReserveBrandBadgeRu,
  formatPlatformCoreWmsReserveCabinetLongRu,
} from '@/lib/platform-core-wms-reserve-copy';
import { BrandOpCabinetSpinePeerStrip } from '@/components/platform/BrandOpCabinetSpinePeerStrip';
import { BrandOpChainSseDedupStrip } from '@/components/platform/BrandOpChainSseDedupStrip';
import { BRAND_OP_CABINET_SSE_DEDUP_STRIP_TESTID } from '@/lib/platform-core-ports/fashion/brand-op-wave-vq';
import { buildBrandOpChainMaterialsSupplierPatchHref } from '@/lib/platform-core-ports/fashion/brand-op-wave-xm';
import {
  WAVE_WZ_OP_NO_ORDER_RU,
} from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { cn } from '@/lib/utils';

type Props = {
  /** @deprecated Hub всегда compact; prop сохранён для совместимости. */
  compact?: boolean;
  minimalChrome?: boolean;
};

const linkClass = 'text-accent-primary text-xs font-medium hover:underline';

const OP_RESOLVE_BRAND = ['w2_registry', 'handoff', 'allocation', 'operational'] as const;

/** Baseline brand order→production pillar — без factory/extended imports. */
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
  const pillarReloadNonce = chainPollTick;

  useEffect(() => {
    setSpineReload(pillarReloadNonce);
  }, [pillarReloadNonce]);

  const { snapshot, loading: snapshotLoading } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'brand',
    pillarVariant: 'brand',
    wholesaleOrderId: orderId || undefined,
    factoryId,
    reloadNonce: pillarReloadNonce,
  });
  const op = pickOrderProductionSnapshot(snapshot);
  const chainSteps = op?.chainSteps ?? [];
  const productionOrderId = op?.productionOrderId ?? undefined;
  const bomLineCount = op?.bomLineCount ?? null;

  const materialsSuppliedDone =
    chainSteps.find((s) => s.id === 'materials_supplied')?.done === true;
  const inventoryReservedDone =
    chainSteps.find((s) => s.id === 'inventory_reserved')?.done === true;
  const steps = chainSteps;

  const panelTestId = 'brand-op-cabinet-panel';
  const coreSlim = isPlatformCoreMode();
  const twoRoleBaseline = isPlatformCoreTwoRoleBaseline();

  if (compact && snapshotLoading && !op) {
    return (
      <PlatformCorePillarInsightSkeleton testId="brand-op-pillar-insight-skeleton" />
    );
  }

  return (
    <Card
      data-testid={panelTestId}
      {...auditLegacy('order-production-pillar-card')}
      data-variant="brand"
      data-active-order-id={orderId}
      data-spine-order={isSpineActive ? 'true' : 'false'}
      className={cn(compact ? hubGadget.pillarCard : 'border-amber-200/50')}
    >
      <CardContent className={cn(compact ? hubGadget.pillarBody : 'space-y-2 p-3')}>
        {compact && !minimalChrome ? (
          <PillarInsightHeader
            icon={Package}
            title="Заказ → производство"
            subtitle={
              twoRoleBaseline
                ? 'Исполнение опта: передача в цех, PO и статус серии.'
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
        {!compact ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled={chainPollEnabled}
            sseTestId="brand-op-cabinet-sse-live-badge"
            pollTestId="brand-op-cabinet-poll-badge"
            sseLegacyTestId="brand-op-chain-sse-live-badge"
          />
        ) : null}
        {!(compact && minimalChrome) ? (
          <ul
            className="space-y-1.5"
            data-testid="brand-op-cabinet-chain-steps"
            data-audit-legacy="brand-op-chain-steps"
          >
            {!hasActiveOrder && steps.length === 0 ? (
              <li className="text-[10px] text-muted-foreground">
                {compact ? 'Нет активного заказа.' : WAVE_WZ_OP_NO_ORDER_RU}
              </li>
            ) : null}
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex flex-wrap items-start gap-x-2 gap-y-0.5 text-xs"
                data-testid={`platform-core-chain-step-${step.id}`}
                data-done={step.done ? 'true' : 'false'}
              >
                {step.done ? (
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                ) : (
                  <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                <span>{step.labelRu}</span>
                {step.id === 'materials_supplied' && !twoRoleBaseline ? (
                  <Link
                    href={buildBrandOpChainMaterialsSupplierPatchHref({
                      orderId: cabinetOrderId,
                      productionOrderId: productionOrderId ?? undefined,
                      collectionId: demoWithOrder.collectionId,
                      articleId: demoWithOrder.demoArticleId,
                    })}
                    data-testid={
                      step.done
                        ? 'brand-op-cabinet-materials-step-link'
                        : 'brand-op-cabinet-materials-pending-link'
                    }
                    className="text-accent-primary text-[10px] font-medium hover:underline"
                  >
                    {step.done ? 'Закупка' : 'Закупка →'}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {hasActiveOrder && compact ? (
          <p className="text-text-muted text-[10px]" data-testid="brand-op-cabinet-sot-strip">
            Hub insight · полные факты в{' '}
            <Link
              href={brandB2bOrderHref(cabinetOrderId)}
              className="text-accent-primary font-medium hover:underline"
              data-testid="brand-op-cabinet-order-detail-sot-link"
            >
              карточке заказа
            </Link>
            {' · '}список в{' '}
            <Link
              href={brandB2bOrdersProductionRegistryHref(cabinetOrderId)}
              className="text-accent-primary font-medium hover:underline"
              data-testid="brand-op-cabinet-registry-sot-link"
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
        {productionOrderId ? (
          <Link
            href={brandOpFactoryProductionOrderPeerHref(cabinetOrderId, { factoryId })}
            className="inline-flex"
            data-testid="brand-op-po-id-badge"
          >
            <Badge
              variant="outline"
              className={
                compact
                  ? hubGadget.metaBadge
                  : 'h-4 border-emerald-200 bg-emerald-50 px-1.5 font-mono text-[9px] text-emerald-900 hover:bg-emerald-100'
              }
            >
              PO {productionOrderId}
            </Badge>
          </Link>
        ) : null}
        {compact ? (
          <BrandCollectionAllocationQueueBadge reloadNonce={chainPollTick} />
        ) : null}
        {chainSteps.some((s) => s.id === 'inventory_reserved') && !compact ? (
          <Badge
            variant="outline"
            data-testid="brand-op-cabinet-wms-reserve-badge"
            className={
              compact
                ? hubGadget.metaBadge
                : inventoryReservedDone
                  ? 'h-4 border-emerald-200 bg-emerald-50 px-1.5 text-[9px] text-emerald-800'
                  : 'h-4 border-amber-200 bg-amber-50 px-1.5 text-[9px] text-amber-800'
            }
          >
            {formatPlatformCoreWmsReserveBrandBadgeRu(inventoryReservedDone)}
          </Badge>
        ) : null}
        {bomLineCount != null && bomLineCount > 0 && !compact ? (
          <Badge
            variant="outline"
            data-testid="brand-op-bom-preview-badge"
            className={
              materialsSuppliedDone || !chainSteps.some((s) => s.id === 'materials_supplied')
                ? 'h-4 border-emerald-200 bg-emerald-50 px-1.5 text-[9px] text-emerald-800'
                : 'h-4 border-amber-200 bg-amber-50 px-1.5 text-[9px] text-amber-800'
            }
          >
            BOM {bomLineCount}
            {chainSteps.some((s) => s.id === 'materials_supplied')
              ? materialsSuppliedDone
                ? ' · материалы ✓'
                : ' · материалы…'
              : ''}
          </Badge>
        ) : null}
        {isSpineActive && !compact ? (
          <div
            className="space-y-2 border-t border-amber-100/80 pt-2"
            data-testid="brand-op-spine-strips"
          >
            <BrandAllocationSpinePanel orderId={orderId} />
            <BrandOrderShipmentSpineStrip orderId={orderId} />
          </div>
        ) : null}
        <div className={compact ? undefined : 'space-y-1.5 border-t border-amber-100/80 pt-2'}>
          {hasActiveOrder && !minimalChrome ? (
            <div data-testid="brand-op-cabinet-cta-strip">
              <BrandOpCabinetSpinePeerStrip orderId={cabinetOrderId} collectionId={collectionId} />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
