'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Package } from 'lucide-react';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { shopB2bTrackingOrderHref } from '@/lib/platform-core-routes';
import { factorySupplierMessagesB2bOrderContextHref, factorySupplierMessagesWorkshop2ArticleContextHref } from '@/lib/platform-core-extended-routes';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemo,
} from '@/lib/platform-core-hub-matrix';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { Badge } from '@/components/ui/badge';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';
import { SupplierProcurementSpineStrip } from '@/components/integrations/SupplierProcurementSpineStrip';
import type { SupplierProcurementBomLine } from '@/lib/platform-core-pillar-snapshot.types';
import { cn } from '@/lib/utils';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  PillarInsightHeader,
  PillarInsightSteps,
} from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { usePlatformCoreHubAuditLegacyAttrs } from '@/hooks/use-platform-core-hub-audit-legacy-attrs';
import { formatPlatformCoreWmsReserveCabinetLongRu } from '@/lib/platform-core-wms-reserve-copy';
import { SupplierOpCabinetSpineNavStrip } from '@/components/factory/supplier/SupplierOpCabinetSpineNavStrip';
import { SupplierOpHandoffReadSpinePeerStrip } from '@/components/factory/supplier/SupplierOpHandoffReadSpinePeerStrip';
import { SupplierPartialShipConfirmStrip } from '@/components/factory/supplier/SupplierPartialShipConfirmStrip';

function isBomLineFilled(line: SupplierProcurementBomLine): boolean {
  if (!line.materialName?.trim()) return false;
  return (line.yieldPerUnit ?? line.consumption ?? line.quantity ?? 0) > 0;
}

const linkClass = 'text-accent-primary text-[10px] font-medium hover:underline';

export function SupplierProcurementPillarCard({
  compact = false,
  minimalChrome = false,
}: {
  /** Hub — только шаги и CTA без дублей spine/чата. */
  compact?: boolean;
  minimalChrome?: boolean;
}) {
  const demo = usePlatformCoreDemoContext();
  const auditLegacy = usePlatformCoreHubAuditLegacyAttrs();
  const { collectionId, demoArticleId, factoryId, demoOrderId } = demo;
  const w2Fallback = demoOrderId.startsWith('__') ? '' : demoOrderId;
  const [spineReloadNonce, setSpineReloadNonce] = useState(0);
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: w2Fallback,
    collectionId,
    resolveFrom: ['w2_registry', 'handoff', 'allocation'],
    actorRole: 'supplier',
    factoryId,
    reloadNonce: spineReloadNonce,
  });
  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled('supplier');
  const pollOrderIds = spineOrderId.trim() ? [spineOrderId] : [];
  const { tick: chainPollTick, sseConnected } = usePlatformCoreChainStatusPoll(
    chainPushEnabled && pollOrderIds.length > 0,
    pollOrderIds
  );

  useEffect(() => {
    setSpineReloadNonce(chainPollTick);
  }, [chainPollTick]);

  const { snapshot, loading: snapshotLoading } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'supplier',
    factoryId,
    wholesaleOrderId: spineOrderId || undefined,
    reloadNonce: spineReloadNonce + chainPollTick,
  });

  const live =
    snapshot?.pillarId === 'order_production' && 'supplierProcurement' in snapshot
      ? snapshot.supplierProcurement
      : null;

  const displayOrderId = live?.orderId ?? '';
  const productionOrderId = live?.productionOrderId ?? demo.productionOrderId;
  const isSpineOrder = isIntegrationImportedWholesaleOrderId(displayOrderId);
  const canonicalDemoOrderId = getPlatformCoreDemo(collectionId).demoOrderId;
  const cabinetOrderId = resolvePlatformCoreCabinetOrderId(displayOrderId, canonicalDemoOrderId);
  const demoWithOrder = { ...demo, demoOrderId: cabinetOrderId };

  const bomLines = live?.bomLines ?? [];
  const chainSteps = live?.chainSteps ?? [];
  const poReady = live?.poReady ?? null;
  const poQty = live?.poQty ?? 0;
  const centricRfqId = live?.procurementSpine?.centricRfq?.rfqId ?? null;
  const handoffQueueCount = live?.handoffQueueCount ?? null;

  const bomFilled = useMemo(() => bomLines.filter(isBomLineFilled).length, [bomLines]);
  const bomTotal = bomLines.length;
  const bomPct = bomTotal > 0 ? Math.round((bomFilled / bomTotal) * 100) : 0;
  const procurementPct = poReady || bomTotal > 0 ? bomPct : 0;
  const materialsSuppliedDone =
    chainSteps.find((s) => s.id === 'materials_supplied')?.done === true;
  const inventoryReservedDone =
    chainSteps.find((s) => s.id === 'inventory_reserved')?.done === true;

  if (compact && snapshotLoading && !live) {
    return <PlatformCorePillarInsightSkeleton testId="sup-op-pillar-insight-skeleton" />;
  }

  return (
    <Card
      data-testid="sup-op-cabinet-panel"
      {...auditLegacy('supplier-procurement-pillar-card')}
      className={cn(compact ? hubGadget.pillarCard : 'border-amber-200/50')}
    >
      <CardContent className={cn(compact ? hubGadget.pillarBody : 'space-y-2 p-3')}>
        {compact && !minimalChrome ? (
          <PillarInsightHeader
            icon={Package}
            title="Закупка материалов"
            subtitle="BOM, PO и поставка под серию производства."
          />
        ) : null}
        {compact && !minimalChrome && cabinetOrderId ? (
          <PlatformCorePillarNotificationCenterCompact
            variant="supplier"
            compact
            collectionId={collectionId}
            orderId={cabinetOrderId}
            orderScoped
          />
        ) : null}
        {compact && !minimalChrome && cabinetOrderId ? (
          <SupplierOpCabinetSpineNavStrip demo={demo} orderId={cabinetOrderId} />
        ) : null}
        {!compact ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled
            sseTestId="sup-op-cabinet-sse-live-badge"
            pollTestId="sup-op-cabinet-poll-badge"
            sseLegacyTestId="sup-op-chain-sse-live-badge"
          />
        ) : null}
        {!compact && isSpineOrder && live ? (
          <SupplierProcurementSpineStrip
            orderId={displayOrderId}
            procurement={live.procurementSpine}
            reloadNonce={spineReloadNonce + chainPollTick}
            compact
            onAckSuccess={() => setSpineReloadNonce((n) => n + 1)}
          />
        ) : null}
        {poReady != null || bomTotal > 0 ? (
          compact ? (
            <div className={hubGadget.statRow} data-testid="supplier-procurement-bom-progress">
              <span className={hubGadget.stat}>
                <strong>
                  {bomFilled}/{bomTotal || '—'}
                </strong>{' '}
                BOM
                {poQty > 0 ? ` · ${poQty} ед.` : ''}
              </span>
              <Badge variant="outline" className={hubGadget.metaBadge}>
                {procurementPct}%
              </Badge>
            </div>
          ) : (
            <div
              className="space-y-1.5"
              data-testid="supplier-procurement-bom-progress"
              data-audit-section="sup-op-bom-po"
              data-po-qty={poQty}
              data-bom-filled={bomFilled}
              data-bom-total={bomTotal}
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span>
                  <PlatformCoreTerm term="BOM" /> под <PlatformCoreTerm term="PO" />
                </span>
                <span
                  className={cn(
                    procurementPct >= 100 ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  {poQty > 0 ? `${poQty} ед.` : 'без серии'} · {bomFilled}/{bomTotal || '—'} строк
                </span>
              </div>
              <Progress
                value={procurementPct}
                className="h-2 bg-slate-100"
                indicatorClassName={procurementPct >= 100 ? 'bg-emerald-600' : 'bg-amber-500'}
              />
              <p className="text-[11px] text-muted-foreground">
                {poQty > 0 && bomFilled === bomTotal && bomTotal > 0
                  ? 'BOM готов к расчёту потребности под серию'
                  : poReady
                    ? 'Дозаполните спецификацию в досье или дождитесь серии производственного заказа'
                    : 'Ожидание передачи в производство от бренда'}
              </p>
            </div>
          )
        ) : null}
        {chainSteps.length > 0 && !(compact && minimalChrome) ? (
          compact ? (
            <PillarInsightSteps steps={chainSteps} testId="sup-op-chain-steps" />
          ) : (
            <ul
              className="space-y-1.5 border-t border-amber-100/80 pt-2"
              data-testid="sup-op-chain-steps"
              data-audit-legacy="supplier-procurement-chain-steps"
            >
              {chainSteps.map((step) => (
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
                  {step.id === 'materials_supplied' && step.done ? (
                    <Link
                      href={factorySupplierMessagesB2bOrderContextHref(displayOrderId)}
                      data-testid="sup-op-chain-brand-chat-link"
                      className={linkClass}
                    >
                      Чат бренду
                    </Link>
                  ) : null}
                  {step.id === 'materials_supplied' && !step.done && poReady ? (
                    <Link
                      href={factoryMaterialsProcurementHrefForDemo(demoWithOrder, {
                        role: 'supplier',
                      })}
                      data-testid="sup-op-chain-procurement-link"
                      className={linkClass}
                    >
                      Подтвердить поставку
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )
        ) : null}
        {chainSteps.some((s) => s.id === 'inventory_reserved') ? (
          <Badge
            variant="outline"
            data-testid="sup-op-cabinet-wms-reserve-badge"
            data-reserve-sse-live={sseConnected ? '1' : '0'}
            className={cn(
              compact ? 'h-4 px-1.5 text-[9px]' : 'h-4 px-1.5 text-[9px]',
              inventoryReservedDone
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            )}
          >
            {formatPlatformCoreWmsReserveCabinetLongRu(inventoryReservedDone, 'supplier')}
          </Badge>
        ) : null}
        {chainSteps.some((s) => s.id === 'materials_supplied') && !compact ? (
          <Badge
            variant="outline"
            data-testid="sup-op-chain-materials-badge"
            className={
              materialsSuppliedDone
                ? 'h-4 border-emerald-200 bg-emerald-50 px-1.5 text-[9px] text-emerald-800'
                : 'h-4 border-amber-200 bg-amber-50 px-1.5 text-[9px] text-amber-800'
            }
          >
            {materialsSuppliedDone ? 'Материалы подтверждены' : 'Ожидает подтверждение поставщика'}
          </Badge>
        ) : null}
        {!compact ? (
          <div
            className="flex flex-wrap items-center gap-2"
            data-testid="sup-op-handoff-read-strip"
          >
            {centricRfqId ? (
              <Badge
                variant="outline"
                data-testid="sup-op-centric-rfq-badge"
                className="h-4 border-violet-200 bg-violet-50 px-1.5 text-[9px] text-violet-900"
              >
                PLM · RFQ · {centricRfqId}
              </Badge>
            ) : null}
            {displayOrderId ? (
              <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                Заказ {formatWholesaleOrderDisplayId(displayOrderId)}
              </Badge>
            ) : null}
            {handoffQueueCount != null && handoffQueueCount > 0 ? (
              <Badge
                variant="outline"
                data-testid="sup-op-handoff-read-queue-count"
                data-audit-legacy="sup-op-handoff-queue-count"
                className="h-4 border-amber-200 bg-amber-50 px-1.5 text-[9px] text-amber-900"
              >
                <Package className="mr-0.5 inline h-3 w-3" aria-hidden />
                Очередь передачи · {handoffQueueCount}
              </Badge>
            ) : null}
          </div>
        ) : null}
        {!compact && displayOrderId ? (
          <SupplierOpHandoffReadSpinePeerStrip
            collectionId={collectionId}
            articleId={demoArticleId}
            orderId={displayOrderId}
            factoryId={factoryId}
          />
        ) : null}
        {poReady && productionOrderId && displayOrderId && !materialsSuppliedDone && !compact ? (
          <SupplierPartialShipConfirmStrip
            collectionId={collectionId}
            articleId={demoArticleId}
            orderId={displayOrderId}
            productionOrderId={productionOrderId}
            defaultQty={bomTotal > 0 ? bomTotal : undefined}
          />
        ) : null}
        {poReady != null && !compact ? (
          <p className="flex flex-wrap items-start gap-x-2 gap-y-1 text-xs">
            {poReady ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span>
              {poReady
                ? `Производственный заказ ${productionOrderId} в очереди — можно подтверждать поставку`
                : 'Ожидание передачи в производство от бренда'}
            </span>
            {poReady && productionOrderId && displayOrderId ? (
              <Link
                href={factoryHandoffQueueHrefForDemo(demoWithOrder)}
                data-testid="sup-op-handoff-read-po-link"
                className={linkClass}
              >
                Очередь · {productionOrderId}
              </Link>
            ) : null}
          </p>
        ) : null}
        <div className={compact ? undefined : 'space-y-1.5 border-t border-amber-100/80 pt-2'}>
          {compact && !minimalChrome ? (
            <div className={hubGadget.goldenPath} data-testid="sup-op-cabinet-cta-production">
              <Link
                href={factoryMaterialsProcurementHrefForDemo(demoWithOrder, { role: 'supplier' })}
                data-testid="sup-op-cabinet-procurement-link"
                className={hubGadget.goldenLink}
              >
                Закупка
              </Link>
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
              <Link
                href={factoryHandoffQueueHrefForDemo(demoWithOrder)}
                data-testid="sup-op-cabinet-handoff-link"
                data-audit-legacy="sup-op-handoff-read-queue-link"
                className={hubGadget.goldenLink}
              >
                Очередь
              </Link>
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
              <Link
                href={shopB2bTrackingOrderHref(cabinetOrderId)}
                data-testid="sup-op-cabinet-tracking-link"
                className={hubGadget.goldenLink}
              >
                Трекинг
              </Link>
            </div>
          ) : !compact ? (
            <div
              className="flex flex-wrap gap-x-3 gap-y-1"
              data-testid="sup-op-cabinet-cta-production"
            >
              <Link
                href={factoryMaterialsProcurementHrefForDemo(demoWithOrder, { role: 'supplier' })}
                data-testid="sup-op-cabinet-procurement-link"
                className={linkClass}
              >
                Закупка
              </Link>
              <Link
                href={factoryHandoffQueueHrefForDemo(demoWithOrder)}
                data-testid="sup-op-cabinet-handoff-link"
                data-audit-legacy="sup-op-handoff-read-queue-link"
                className={linkClass}
              >
                Очередь
              </Link>
              <Link
                href={shopB2bTrackingOrderHref(cabinetOrderId)}
                data-testid="sup-op-cabinet-tracking-link"
                className={linkClass}
              >
                Трекинг
              </Link>
              <>
                <Link
                  href={factorySupplierMessagesWorkshop2ArticleContextHref(
                    collectionId,
                    demoArticleId
                  )}
                  data-testid="sup-op-cabinet-article-chat-link"
                  className={linkClass}
                >
                  Чат · артикул
                </Link>
                {displayOrderId ? (
                  <Link
                    href={factorySupplierMessagesB2bOrderContextHref(displayOrderId)}
                    data-testid="sup-op-cabinet-brand-chat-link"
                    className={linkClass}
                  >
                    Чат бренду
                  </Link>
                ) : null}
              </>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
