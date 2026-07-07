'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Factory, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  brandB2bOrderChainContextHref,
  brandB2bOrderHandoffContextHref,
  brandB2bOrdersAwaitingHandoffRegistryHref,
  brandB2bOrdersCollectionRegistryHref,
  brandMessagesB2bOrderContextHref,
  factoryProductionOrdersOrderContextHref,
  ROUTES,
  shopB2bMatrixReorderHref,
  shopB2bOrderHref,
  shopB2bOrdersCollectionRegistryHref,
  shopB2bTrackingOrderHref,
  shopB2bWorkingOrderOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/routes';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { BrandOpChainCoSpinePeerStrip } from '@/components/platform/BrandOpChainCoSpinePeerStrip';
import { BrandOpChainDossierSoTStrip } from '@/components/platform/BrandOpChainDossierSoTStrip';
import { BrandOpChainMaterialsSupplierStrip } from '@/components/platform/BrandOpChainMaterialsSupplierStrip';
import {
  BRAND_OP_CHAIN_MATERIALS_SSE_DEDUP_HINT_TESTID,
  buildBrandOpChainMaterialsSupplierPatchHref,
  brandOpChainMaterialsSseDedupHintRu,
  brandOpChainMaterialsStepLinkTestId,
} from '@/lib/fashion/brand-op-wave-xm';
import { BrandChainSpineExportChip } from '@/components/integrations/BrandChainSpineExportChip';
import {
  factoryHandoffQueueHrefForDemo,
  getPlatformCoreDemoByOrderId,
} from '@/lib/platform-core-hub-matrix';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isPlatformCorePgLogisticsWholesaleOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { B2bOrderChainPeerMirrorStrip } from '@/components/b2b/B2bOrderChainPeerMirrorStrip';
import { BrandB2bPgLogisticsTrackingStrip } from '@/components/platform/BrandB2bPgLogisticsTrackingStrip';
import { ShopOrderShipmentTrackingStrip } from '@/components/integrations/ShopOrderShipmentTrackingStrip';
import { PlatformCoreErpRetryHint } from '@/components/platform/PlatformCoreErpRetryHint';

type ChainStep = { id: string; labelRu: string; done: boolean };

type ChainPayload = {
  orderId: string;
  status: string;
  productionOrderId?: string;
  factoryId?: string;
  poStatus?: string;
  poStatusLabelRu?: string;
  erpNextRetryAt?: string;
  erpAutoRetryCount?: number;
  handedOff: boolean;
  dossierHref: string;
  steps: ChainStep[];
};

const COLLECTION_ORDER_CHAIN_STEP_IDS = new Set(['shop_sent', 'brand_confirmed']);

type Props = {
  orderId: string;
  variant: 'shop' | 'brand';
  /** Столп карточки: collection_order vs order_production (канон testids). */
  productionPillar?: boolean;
};

export function B2bOrderChainStatusCard({ orderId, variant, productionPillar = false }: Props) {
  const [chain, setChain] = useState<ChainPayload | null>(null);
  const [chainLoaded, setChainLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [handoffFailed, setHandoffFailed] = useState(false);
  const { tick: chainPollTick, sseConnected } = usePlatformCoreChainStatusPoll(true, [orderId]);

  const load = async () => {
    setChainLoaded(false);
    try {
      const res = await fetch(
        `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/chain-status`,
        {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        }
      );
      const json = (await res.json()) as { ok?: boolean; chain?: ChainPayload };
      if (json.ok && json.chain) setChain(json.chain);
      else setChain(null);
    } catch {
      setChain(null);
    } finally {
      setChainLoaded(true);
    }
  };

  useEffect(() => {
    void load();
  }, [orderId, chainPollTick]);

  const confirmOrder = async () => {
    setBusy(true);
    setMessage(null);
    setHandoffFailed(false);
    try {
      const res = await fetch(
        `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/confirm-order`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (json.ok) {
        setMessage(json.messageRu ?? 'Заказ подтверждён.');
        await load();
      } else {
        setHandoffFailed(true);
        setMessage(json.messageRu ?? 'Не удалось подтвердить заказ.');
      }
    } catch {
      setHandoffFailed(true);
      setMessage('Ошибка сети. Проверьте подключение и повторите попытку.');
    } finally {
      setBusy(false);
    }
  };

  const handoff = async () => {
    setBusy(true);
    setMessage(null);
    setHandoffFailed(false);
    try {
      const res = await fetch(
        `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/confirm-production-handoff`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (json.ok) {
        setMessage(json.messageRu ?? 'Передача в производство подтверждена.');
        await load();
      } else {
        setHandoffFailed(true);
        setMessage(
          json.messageRu ??
            (res.status >= 500
              ? 'Сервер временно недоступен. Повторите передачу в производство.'
              : 'Не удалось подтвердить передачу в производство.')
        );
      }
    } catch {
      setHandoffFailed(true);
      setMessage('Ошибка сети. Проверьте подключение и повторите попытку.');
    } finally {
      setBusy(false);
    }
  };

  const retryErp = async () => {
    setBusy(true);
    setMessage(null);
    setHandoffFailed(false);
    try {
      const res = await fetch(
        `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/retry-production-erp`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (json.ok) {
        setMessage(json.messageRu ?? 'Повтор синхронизации ERP выполнен.');
        await load();
      } else {
        setHandoffFailed(true);
        setMessage(json.messageRu ?? 'Не удалось повторить синхронизацию ERP.');
      }
    } catch {
      setHandoffFailed(true);
      setMessage('Ошибка сети при повторе ERP.');
    } finally {
      setBusy(false);
    }
  };

  const messagesHref =
    variant === 'shop'
      ? shopMessagesB2bOrderContextHref(orderId)
      : brandMessagesB2bOrderContextHref(orderId);

  const handoffDone = Boolean(chain?.handedOff);
  const demo = getPlatformCoreDemoByOrderId(orderId);
  const brandConfirmedDone = chain?.steps?.find((s) => s.id === 'brand_confirmed')?.done === true;
  const materialsSuppliedStep = chain?.steps?.find((s) => s.id === 'materials_supplied');
  const materialsSuppliedDone = materialsSuppliedStep?.done === true;
  const hasMaterialsStep = Boolean(materialsSuppliedStep);
  const visibleSteps = productionPillar
    ? (chain?.steps ?? [])
    : (chain?.steps ?? []).filter((s) => COLLECTION_ORDER_CHAIN_STEP_IDS.has(s.id));
  const collectionId = demo.collectionId;
  const coreSlim = isPlatformCoreMode();
  const shopMatrixHref = collectionId
    ? `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`
    : null;

  return (
    <Card
      id="production-handoff"
      data-testid={
        variant === 'brand'
          ? productionPillar
            ? 'brand-op-chain-status-card'
            : 'brand-co-chain-card'
          : 'shop-co-chain-card'
      }
      data-audit-legacy={
        variant === 'brand' ? 'brand-order-chain-status-card' : 'shop-op-order-status-chain-card'
      }
      data-variant={variant}
      data-chain-handoff={!chainLoaded ? 'loading' : handoffDone ? 'done' : 'pending'}
      className="scroll-mt-24 border-indigo-200/50"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Цепочка заказа</CardTitle>
        {!coreSlim ? (
          <CardDescription className="text-text-muted text-[10px]">
            {variant === 'shop' ? 'Оптовый заказ' : 'Подтверждение · передача'}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {variant === 'brand' ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled
            sseTestId={
              productionPillar ? 'brand-op-chain-sse-live-badge' : 'brand-co-chain-sse-live-badge'
            }
            pollTestId={
              productionPillar ? 'brand-op-chain-poll-badge' : 'brand-co-chain-poll-badge'
            }
            sseLegacyTestId="brand-order-handoff-sse-live-badge"
          />
        ) : null}
        {variant === 'shop' ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled
            sseTestId="shop-co-chain-sse-live-badge"
            pollTestId="shop-co-chain-poll-badge"
            sseLegacyTestId="shop-op-order-status-sse-live-badge"
          />
        ) : null}
        {variant === 'brand' && productionPillar ? <BrandOpChainDossierSoTStrip /> : null}
        {variant === 'brand' && productionPillar && collectionId ? (
          <BrandOpChainCoSpinePeerStrip orderId={orderId} collectionId={collectionId} />
        ) : null}
        {variant === 'brand' && productionPillar && hasMaterialsStep ? (
          <>
            <p
              className={hubGadget.muted}
              data-testid={BRAND_OP_CHAIN_MATERIALS_SSE_DEDUP_HINT_TESTID}
            >
              {brandOpChainMaterialsSseDedupHintRu()}
            </p>
            <BrandOpChainMaterialsSupplierStrip
              orderId={orderId}
              materialsDone={materialsSuppliedDone}
              productionOrderId={chain?.productionOrderId}
              collectionId={collectionId}
            />
          </>
        ) : null}
        {variant === 'shop' && chain && !handoffDone ? (
          <p
            className={hubGadget.muted}
            data-testid="shop-co-chain-awaiting-handoff"
            data-audit-legacy="shop-op-order-status-awaiting-handoff"
          >
            {!brandConfirmedDone ? 'Ожидает подтверждение бренда' : 'Ожидает передачи в производство'}
          </p>
        ) : null}
        {coreSlim && !productionPillar && chain ? (
          <B2bOrderChainPeerMirrorStrip orderId={orderId} variant={variant} chain={chain} />
        ) : null}
        {coreSlim && variant === 'brand' && brandConfirmedDone && !productionPillar ? (
          <BrandB2bPgLogisticsTrackingStrip orderId={orderId} />
        ) : null}
        {coreSlim && variant === 'shop' && isPlatformCorePgLogisticsWholesaleOrderId(orderId) ? (
          <ShopOrderShipmentTrackingStrip wholesaleOrderId={orderId} />
        ) : null}
        {variant === 'brand' && !productionPillar ? (
          <div className={hubGadget.goldenPath} data-testid="brand-co-chain-context-strip">
            <Link
              href={brandB2bOrdersCollectionRegistryHref(orderId)}
              data-testid="brand-co-detail-registry-link"
              className={hubGadget.goldenLink}
            >
              Реестр
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            {!handoffDone ? (
              <Link
                href={brandB2bOrderHandoffContextHref(orderId)}
                data-testid="brand-co-detail-handoff-link"
                className={hubGadget.goldenLink}
              >
                Передача
              </Link>
            ) : (
              <Link
                href={factoryHandoffQueueHrefForDemo(demo)}
                data-testid="brand-co-detail-factory-queue-link"
                data-audit-legacy="brand-co-chain-factory-queue-link"
                className={hubGadget.goldenLink}
              >
                Очередь цеха
              </Link>
            )}
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={brandB2bOrderChainContextHref(orderId)}
              data-testid="brand-co-chain-full-link"
              className={hubGadget.goldenLink}
            >
              Полная цепочка
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={ROUTES.brand.retailers}
              data-testid="brand-co-chain-retailers-link"
              className={hubGadget.goldenLink}
            >
              Ритейлеры
            </Link>
          </div>
        ) : null}
        {variant === 'shop' && !productionPillar ? (
          <div className={hubGadget.goldenPath} data-testid="shop-co-chain-context-strip">
            <Link
              href={shopB2bOrdersCollectionRegistryHref(orderId)}
              data-testid="shop-co-detail-registry-link"
              className={hubGadget.goldenLink}
            >
              Реестр
            </Link>
            {shopMatrixHref ? (
              <>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={shopMatrixHref}
                  data-testid="shop-co-detail-matrix-link"
                  className={hubGadget.goldenLink}
                >
                  Матрица
                </Link>
              </>
            ) : null}
          </div>
        ) : null}
        {variant === 'brand' && productionPillar ? (
          <div
            className={cn(
              hubGadget.goldenPath,
              hubCabinet.workspaceTableScroll,
              'max-md:flex-nowrap'
            )}
            data-testid="brand-order-handoff-context-strip"
          >
            {!handoffDone ? (
              <Link
                href={brandB2bOrdersAwaitingHandoffRegistryHref()}
                data-testid="brand-handoff-strip-registry-link"
                className={hubGadget.goldenLink}
              >
                Реестр
              </Link>
            ) : (
              <>
                <Link
                  href={factoryHandoffQueueHrefForDemo(demo)}
                  data-testid="brand-op-handoff-factory-queue-link"
                  data-audit-legacy="brand-handoff-strip-factory-queue"
                  className={hubGadget.goldenLink}
                >
                  Очередь цеха
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={factoryProductionOrdersOrderContextHref(orderId, {
                    factoryId: chain?.factoryId ?? demo.factoryId,
                  })}
                  data-testid="brand-op-handoff-prod-orders-link"
                  data-audit-legacy="brand-handoff-strip-prod-orders"
                  className={hubGadget.goldenLink}
                >
                  Заказы цеха
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={shopB2bTrackingOrderHref(orderId)}
                  data-testid="brand-handoff-strip-shop-tracking"
                  className={hubGadget.goldenLink}
                >
                  Трекинг
                </Link>
              </>
            )}
          </div>
        ) : null}
        {variant === 'brand' && chain && !handoffDone && !productionPillar && !coreSlim ? (
          <p className={hubGadget.muted} data-testid="brand-b2b-handoff-awaiting">
            Подтвердите и передайте в цех
          </p>
        ) : null}
        {variant === 'brand' &&
        isIntegrationImportedWholesaleOrderId(orderId) &&
        brandConfirmedDone ? (
          <BrandChainSpineExportChip
            orderId={orderId}
            brandConfirmed={brandConfirmedDone}
            reloadNonce={chainPollTick}
          />
        ) : null}
        <ul
          className="space-y-1.5"
          data-testid={
            variant === 'shop'
              ? productionPillar
                ? 'platform-core-shop-chain-steps'
                : 'shop-co-chain-steps'
              : variant === 'brand'
                ? productionPillar
                  ? 'platform-core-brand-chain-steps'
                  : 'brand-co-chain-steps'
                : undefined
          }
          data-audit-legacy={
            variant === 'brand' && !productionPillar ? 'platform-core-brand-chain-steps' : undefined
          }
        >
          {visibleSteps.map((step) => (
            <li
              key={step.id}
              data-testid={`b2b-chain-step-${step.id}`}
              data-done={step.done ? 'true' : 'false'}
              className="flex flex-wrap items-start gap-x-2 gap-y-0.5 text-xs"
            >
              {step.done ? (
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                  aria-hidden
                />
              ) : (
                <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span className={step.done ? 'text-text-primary' : 'text-text-muted'}>
                {step.labelRu}
              </span>
              {variant === 'brand' &&
              productionPillar &&
              step.id === 'materials_supplied' ? (
                <Link
                  href={buildBrandOpChainMaterialsSupplierPatchHref({
                    orderId,
                    productionOrderId: chain?.productionOrderId,
                    collectionId,
                  })}
                  data-testid={brandOpChainMaterialsStepLinkTestId(step.done)}
                  className="text-accent-primary text-[10px] font-medium hover:underline"
                >
                  {step.done ? 'Закупка' : 'Закупка →'}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'flex flex-wrap gap-2',
            variant === 'brand' && productionPillar && coreSlim && hubCabinet.workspaceStickyActions
          )}
          data-testid={
            variant === 'brand' && productionPillar ? 'brand-op-handoff-wizard-actions' : undefined
          }
        >
          {variant === 'brand' && !brandConfirmedDone && !handoffDone ? (
            <Button
              size="sm"
              variant="default"
              disabled={busy}
              onClick={() => void confirmOrder()}
              data-testid="brand-b2b-confirm-order"
              className={productionPillar && coreSlim ? hubCabinet.workspacePrimaryBtn : undefined}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
              Подтвердить заказ
            </Button>
          ) : null}
          {variant === 'brand' ? (
            <Button
              size="sm"
              variant={brandConfirmedDone && !handoffDone ? 'default' : 'outline'}
              disabled={busy || handoffDone || !brandConfirmedDone}
              onClick={() => void handoff()}
              data-testid="brand-b2b-confirm-production-handoff"
              className={productionPillar && coreSlim ? hubCabinet.workspacePrimaryBtn : undefined}
            >
              <Factory className="mr-1 h-3.5 w-3.5" aria-hidden />
              {handoffDone ? 'Передан в цех' : 'Передать в производство'}
            </Button>
          ) : null}
          <Button size="sm" variant="outline" asChild>
            <Link
              href={messagesHref}
              data-testid={
                variant === 'brand'
                  ? 'brand-co-detail-chat-link'
                  : variant === 'shop'
                    ? 'shop-co-detail-chat-link'
                    : undefined
              }
            >
              <MessageSquare className="mr-1 h-3.5 w-3.5" aria-hidden />
              Чат
            </Link>
          </Button>
          {variant === 'shop' && !productionPillar ? (
            <Button size="sm" variant="outline" asChild>
              <Link
                href={shopB2bTrackingOrderHref(orderId)}
                data-testid="shop-co-detail-tracking-link"
                data-audit-legacy="shop-order-chain-tracking-link"
              >
                Трекинг
              </Link>
            </Button>
          ) : null}
          {variant === 'brand' &&
          productionPillar &&
          (chain?.handedOff || chain?.productionOrderId) &&
          !(productionPillar && handoffDone) ? (
            <Button size="sm" variant="outline" asChild>
              <Link
                href={factoryHandoffQueueHrefForDemo(getPlatformCoreDemoByOrderId(orderId))}
                data-testid="brand-b2b-factory-queue-link"
              >
                <Factory className="mr-1 h-3.5 w-3.5" aria-hidden />
                Очередь цеха
              </Link>
            </Button>
          ) : null}
          {chain?.handedOff &&
          chain.productionOrderId &&
          variant === 'brand' &&
          !(coreSlim && productionPillar) ? (
            <Link
              href={factoryProductionOrdersOrderContextHref(orderId, {
                factoryId: chain.factoryId,
              })}
              data-testid="brand-b2b-production-order-link"
              className="text-accent-primary self-center text-xs font-medium hover:underline"
            >
              {chain.productionOrderId} · {chain.factoryId ?? 'цех'}
              {chain.poStatusLabelRu ? ` · ${chain.poStatusLabelRu}` : ''}
            </Link>
          ) : null}
          {variant === 'shop' && !productionPillar && !handoffDone && collectionId ? (
            isIntegrationImportedWholesaleOrderId(orderId) ? (
              <Link
                href={shopB2bWorkingOrderOrderContextHref(orderId)}
                data-testid="shop-co-chain-working-order-link"
                className="text-accent-primary self-center text-[10px] font-medium hover:underline"
              >
                Рабочий заказ
              </Link>
            ) : (
              <Link
                href={shopB2bMatrixReorderHref(collectionId, orderId)}
                data-testid="shop-co-chain-amend-matrix-link"
                className="text-accent-primary self-center text-[10px] font-medium hover:underline"
              >
                Изменить в матрице
              </Link>
            )
          ) : null}
        </div>
        {message ? (
          <p
            className={
              handoffFailed
                ? 'rounded-md border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs text-rose-800'
                : 'text-text-muted text-xs'
            }
            data-testid={handoffFailed ? 'brand-b2b-handoff-error' : 'brand-b2b-handoff-message'}
            role={handoffFailed ? 'alert' : undefined}
          >
            {message}
          </p>
        ) : null}
        {variant === 'brand' && handoffFailed ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => void handoff()}
            data-testid="brand-b2b-handoff-retry"
          >
            Повторить передачу
          </Button>
        ) : null}
        {variant === 'brand' &&
        chain?.handedOff &&
        (chain.poStatus === 'error' || chain.poStatus === 'pending_erp') ? (
          <>
            {chain.poStatus === 'pending_erp' ? (
              <p className="text-text-muted text-xs" data-testid="brand-b2b-erp-pending-hint">
                Серия в очереди цеха. ERP-синхронизация — после приёмки производством.
              </p>
            ) : null}
            {chain.poStatus === 'error' ? (
              <PlatformCoreErpRetryHint
                erpNextRetryAt={chain.erpNextRetryAt}
                erpAutoRetryCount={chain.erpAutoRetryCount}
                testId="brand-b2b-erp-auto-retry-hint"
              />
            ) : null}
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void retryErp()}
              data-testid="brand-b2b-erp-retry"
            >
              Повторить ERP
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
