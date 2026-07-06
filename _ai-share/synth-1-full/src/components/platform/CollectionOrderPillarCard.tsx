'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ROUTES,
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandB2bOrdersCollectionRegistryHref,
  brandB2bOrdersRegistryHref,
  brandMessagesB2bOrderContextHref,
  shopB2bCheckoutCollectionHref,
  shopB2bMatrixReorderHref,
  shopB2bOrderHref,
  shopB2bOrdersCollectionRegistryHref,
  shopB2bTrackingOrderHref,
  shopCalendarB2bOrderContextHref,
  shopB2bWorkingOrderOrderContextHref,
} from '@/lib/platform-core-routes';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { BrandCollectionAllocationQueueBadge } from '@/components/integrations/BrandCollectionAllocationQueueBadge';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { pickCollectionOrderSnapshot } from '@/lib/platform-core-pillar-snapshot.types';
import { shopWorkingOrderTabHref } from '@/lib/platform-core-ports/b2b/shop-collection-order-hrefs';
import {
  isIntegrationImportedWholesaleOrderId,
  formatWholesaleOrderDisplayId,
  wholesaleOrderKindLabelRu,
  mapOperationalStatusLabelRu,
} from '@/lib/integrations/spine/integration-ui-utils';
import { BrandShopProductionDisclosurePreviewStrip } from '@/components/brand/b2b/BrandShopProductionDisclosurePreviewStrip';
import { BrandB2bIntegrationsImportToolbar } from '@/components/integrations/BrandB2bIntegrationsImportToolbar';
import { CommsNotificationCenterStrip } from '@/components/platform/CommsNotificationCenterStrip';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { usePlatformCoreHubAuditLegacyAttrs } from '@/hooks/use-platform-core-hub-audit-legacy-attrs';
import {
  formatHubCabinetPartnerStorageModeSuffixRu,
  WAVE_ZE_PARTNER_COUNT_LOADING_RU,
} from '@/lib/platform-core-ports/platform/wave-ze-hub-diagnostics-ru';
import { BrandCoRegistryRetailOnboardingStrip } from '@/components/platform/BrandCoRegistryRetailOnboardingStrip';
import { BrandCoCabinetSpinePeerStrip } from '@/components/platform/BrandCoCabinetSpinePeerStrip';
import { PlatformCoreShopCoCabinetCoSpinePeerStrip } from '@/components/platform/peers/PlatformCoreShopCoCabinetCoSpinePeerStrip';
import { PlatformCoreShopCoGoldenPathStrip } from '@/components/platform/peers/PlatformCoreShopCoGoldenPathStrip';
import { PlatformCoreShopCoCabinetGreenfieldEmptyPeerStrip } from '@/components/platform/peers/PlatformCoreShopCoCabinetGreenfieldEmptyPeerStrip';
import { PlatformCoreShopCoGreenfieldRegistryStrip } from '@/components/platform/peers/PlatformCoreShopCoGreenfieldRegistryStrip';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { SHOP_CORE_BUYER_PRESETS } from '@/lib/platform-core-ports/legacy/order/shop-core-buyer-context';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  PillarInsightHeader,
  PillarInsightSteps,
} from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { cn } from '@/lib/utils';
import { canShopAmendOrder } from '@/lib/platform-core-shop-b2b-amend';
import { WAVE_WZ_CO_SPINE_CONFIRM_SLA_RU } from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import {
  BRAND_CO_CABINET_PARTNER_COUNT_LOADING_TESTID,
  BRAND_CO_CABINET_PARTNER_COUNT_TESTID,
  BRAND_CO_CABINET_PG_PARTNER_BADGE_TESTID,
  brandRetailersB2bOrdersSummaryApiPath,
  summarizeBrandCoPartnerCountPg,
} from '@/lib/platform-core-ports/b2b/brand-co-wave-yg';

type Props = {
  variant: 'brand' | 'shop';
  /** Кабинет: только шаги цепочки, без дублирующих ссылок */
  compact?: boolean;
  minimalChrome?: boolean;
};

const SPINE_RESOLVE_FROM = ['w2_registry', 'allocation', 'operational'] as const;

const ShopCoCabinetTrackingEmbed = dynamic(
  () =>
    import('@/components/platform/ShopCoCabinetTrackingEmbed').then((m) => ({
      default: m.ShopCoCabinetTrackingEmbed,
    })),
  { ssr: false }
);

export function CollectionOrderPillarCard({
  variant,
  compact = false,
  minimalChrome = false,
}: Props) {
  const { collectionId, demoOrderId } = usePlatformCoreDemoContext();
  const auditUi = usePlatformCoreAuditUi();
  const auditLegacy = usePlatformCoreHubAuditLegacyAttrs();
  const { buyerId } = useShopCoreBuyerId();
  const [importReloadNonce, setImportReloadNonce] = useState(0);
  const [brandPartnerFilter, setBrandPartnerFilter] = useState<string>('all');
  const [retailerSummaries, setRetailerSummaries] = useState<
    { retailerId: string; displayNameRu: string; orderCount: number }[]
  >([]);
  const [partnerCountLoading, setPartnerCountLoading] = useState(false);
  const [partnerStorageMode, setPartnerStorageMode] = useState<string | null>(null);
  const activePartnerCount = retailerSummaries.length;
  const partnerPgSummary = summarizeBrandCoPartnerCountPg(retailerSummaries);
  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${collectionId}`);

  useEffect(() => {
    if (variant !== 'brand') return;
    let cancelled = false;
    setPartnerCountLoading(true);
    void (async () => {
      try {
        const res = await fetch(brandRetailersB2bOrdersSummaryApiPath(collectionId));
        const json = (await res.json()) as {
          ok?: boolean;
          storageMode?: string;
          rows?: { retailerId: string; displayNameRu: string; orderCount: number }[];
        };
        if (!cancelled && json.ok && Array.isArray(json.rows)) {
          setRetailerSummaries(json.rows.filter((r) => r.orderCount > 0));
          setPartnerStorageMode(json.storageMode ?? null);
        }
      } catch {
        if (!cancelled) {
          setRetailerSummaries([]);
          setPartnerStorageMode(null);
        }
      } finally {
        if (!cancelled) setPartnerCountLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variant, importReloadNonce]);

  const w2Fallback = demoOrderId.startsWith('__') ? '' : demoOrderId;

  const {
    activeOrderId: resolvedOrderId,
    spineMeta: resolvedSpineMeta,
    resolving,
  } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: w2Fallback,
    collectionId,
    resolveFrom: SPINE_RESOLVE_FROM,
    actorRole: variant,
    buyerId: variant === 'shop' ? buyerId : undefined,
    partnerId:
      variant === 'brand' && brandPartnerFilter !== 'all' ? brandPartnerFilter : undefined,
    reloadNonce: importReloadNonce,
  });

  const hasActiveOrder = Boolean(resolvedOrderId.trim());
  const showroomHref = platformCoreUiHref(
    `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`
  );
  const registryHref =
    variant === 'shop'
      ? shopB2bOrdersCollectionRegistryHref(hasActiveOrder ? resolvedOrderId : undefined)
      : brandB2bOrdersRegistryHref({
          order: hasActiveOrder ? resolvedOrderId : null,
          partner: brandPartnerFilter !== 'all' ? brandPartnerFilter : null,
        });

  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled(variant);
  const { tick: chainPollTick, sseConnected } = usePlatformCoreChainStatusPoll(
    chainPushEnabled && Boolean(resolvedOrderId),
    [resolvedOrderId]
  );

  const { snapshot, loading: snapshotLoading } = usePillarSnapshot({
    collectionId,
    pillarId: 'collection_order',
    roleId: variant,
    wholesaleOrderId: resolvedOrderId,
    reloadNonce: chainPollTick,
  });

  const co = pickCollectionOrderSnapshot(snapshot);
  const steps = co?.chainSteps ?? [];
  const orderQty = co?.orderQty ?? null;
  const orderTotalRub = co?.orderTotalRub ?? null;
  const exportReady = co?.exportReady ?? false;
  const trackingNumber = co?.trackingNumber ?? null;

  const collectionLabel = getPlatformCoreCollectionLabel(collectionId);
  const shopSentDone = steps.find((s) => s.id === 'shop_sent')?.done === true;
  const brandConfirmedDone = steps.find((s) => s.id === 'brand_confirmed')?.done === true;
  const awaitingBrandConfirm = variant === 'brand' && shopSentDone && !brandConfirmedDone;
  const canShopAmend = canShopAmendOrder({
    variant,
    chainSteps: steps,
  });
  const canShopPostConfirmBulk =
    variant === 'shop' && brandConfirmedDone && hasActiveOrder && resolvedOrderId;
  const panelTestId = variant === 'brand' ? 'brand-co-cabinet-panel' : 'shop-co-cabinet-panel';
  const showNavStrips = compact && !minimalChrome;
  const shopOpCabinetLegacy =
    variant === 'shop' && compact && brandConfirmedDone ? 'shop-op-cabinet-panel' : undefined;
  const isSpineActive = isIntegrationImportedWholesaleOrderId(resolvedOrderId);

  if (compact && snapshotLoading && !co) {
    return <PlatformCorePillarInsightSkeleton testId={`${variant}-co-pillar-insight-skeleton`} />;
  }

  return (
    <Card
      data-testid={panelTestId}
      {...auditLegacy(shopOpCabinetLegacy ?? 'collection-order-pillar-card')}
      data-active-order-id={hasActiveOrder ? resolvedOrderId : undefined}
      data-spine-order={isSpineActive ? 'true' : 'false'}
      className={cn(compact ? hubGadget.pillarCard : 'border-blue-200/50')}
    >
      {!compact ? (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <ShoppingCart className="h-4 w-4 text-blue-600" aria-hidden />
            Коллекция → заказ
          </CardTitle>
          <CardDescription className="text-xs">
            {variant === 'shop'
              ? `Оптовый заказ после шоурума · ${collectionLabel}.`
              : 'Приём и согласование оптовых заказов от ритейлеров.'}
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={compact ? hubGadget.pillarBody : 'space-y-3'}>
        {compact && !minimalChrome ? (
          <PillarInsightHeader
            icon={ShoppingCart}
            title="Коллекция → заказ"
            subtitle={
              variant === 'shop'
                ? `Оптовый заказ после шоурума · ${collectionLabel}.`
                : 'Приём и согласование оптовых заказов.'
            }
          />
        ) : null}
        {!compact ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled={chainPushEnabled && hasActiveOrder}
            sseTestId={
              variant === 'brand'
                ? 'brand-co-cabinet-sse-live-badge'
                : 'shop-co-cabinet-sse-live-badge'
            }
            pollTestId={
              variant === 'brand' ? 'brand-co-cabinet-poll-badge' : 'shop-co-cabinet-poll-badge'
            }
          />
        ) : null}
        {!resolving && !hasActiveOrder ? (
          <p
            className={hubGadget.muted}
            data-testid={
              variant === 'shop'
                ? 'shop-co-cabinet-empty-onboarding'
                : 'brand-co-cabinet-empty-onboarding'
            }
          >
            {variant === 'shop'
              ? 'Нет заказов — витрина → матрица → оформление.'
              : 'Нет заказа — ждите оформление от магазина.'}
          </p>
        ) : null}
        {compact && variant === 'shop' && !hasActiveOrder && !resolving && !minimalChrome ? (
          <>
            <PlatformCoreShopCoGreenfieldRegistryStrip buyerId={buyerId} collectionId={collectionId} />
            <PlatformCoreShopCoCabinetGreenfieldEmptyPeerStrip buyerId={buyerId} collectionId={collectionId} />
          </>
        ) : null}
        {hasActiveOrder && isSpineActive && !(compact && minimalChrome) ? (
          <Badge
            variant="outline"
            className={
              compact ? hubGadget.metaBadge : 'border-sky-200 bg-sky-50 text-[11px] text-sky-900'
            }
            data-testid="co-spine-active-order-badge"
          >
            {wholesaleOrderKindLabelRu(resolvedOrderId)} ·{' '}
            {formatWholesaleOrderDisplayId(resolvedOrderId)}
            {resolvedSpineMeta?.status
              ? ` · ${mapOperationalStatusLabelRu(resolvedSpineMeta.status)}`
              : ''}
            {exportReady ? ' · экспорт ✓' : ''}
            {trackingNumber && !compact ? ` · ${trackingNumber}` : ''}
          </Badge>
        ) : null}
        {hasActiveOrder && steps.length > 0 && !(compact && minimalChrome) ? (
          compact ? (
            <PillarInsightSteps
              steps={steps}
              testId={variant === 'brand' ? 'brand-co-chain-hub-steps' : 'shop-co-chain-hub-steps'}
            />
          ) : (
            <ul
              className="space-y-1.5"
              data-testid={
                variant === 'brand' ? 'brand-co-chain-hub-steps' : 'shop-co-chain-hub-steps'
              }
            >
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-start gap-2 text-xs"
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
                </li>
              ))}
            </ul>
          )
        ) : null}
        {awaitingBrandConfirm && !(compact && minimalChrome) ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-[10px] text-amber-800"
              data-testid="collection-order-sla-badge"
            >
              {isSpineActive ? WAVE_WZ_CO_SPINE_CONFIRM_SLA_RU : 'Ожидает подтверждения бренда'}
            </Badge>
            <Link
              href={brandB2bOrderHref(resolvedOrderId)}
              className="text-accent-primary text-[10px] font-semibold hover:underline"
              data-testid="collection-order-confirm-link"
            >
              Подтвердить заказ →
            </Link>
            <Link
              href={brandMessagesB2bOrderContextHref(resolvedOrderId)}
              className="text-accent-primary text-[10px] font-semibold hover:underline"
              data-testid="collection-order-chat-notify-link"
            >
              Чат →
            </Link>
          </div>
        ) : null}
        {variant === 'brand' && brandConfirmedDone && !compact ? (
          <Link
            href={brandB2bOrderHandoffContextHref(resolvedOrderId)}
            className="text-accent-primary text-[10px] font-semibold hover:underline"
            data-testid="collection-order-handoff-link"
          >
            Передача в производство →
          </Link>
        ) : null}
        {variant === 'brand' && !compact ? (
          <BrandCollectionAllocationQueueBadge reloadNonce={chainPollTick} />
        ) : null}
        {orderQty != null && orderQty > 0 ? (
          compact && variant === 'shop' ? (
            <span className={hubGadget.stat} data-testid="shop-collection-order-cart-qty-badge">
              <strong>{orderQty}</strong> ед.
              {orderTotalRub != null ? ` · ${orderTotalRub.toLocaleString('ru-RU')} ₽` : ''}
            </span>
          ) : (
            <p
              className="text-text-secondary text-[11px] tabular-nums"
              data-testid="collection-order-qty-summary"
            >
              Заказ: <strong>{orderQty}</strong> ед.
              {orderTotalRub != null ? <> · {orderTotalRub.toLocaleString('ru-RU')} ₽</> : null}
            </p>
          )
        ) : null}
        {showNavStrips && variant === 'brand' && hasActiveOrder ? (
          <div className={hubGadget.goldenPath} data-testid="brand-co-cabinet-cta-orders">
            <Link
              href={registryHref}
              data-testid="brand-co-cabinet-registry-link"
              className={hubGadget.goldenLink}
            >
              Реестр
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={brandB2bOrderHref(resolvedOrderId)}
              data-testid="brand-co-cabinet-order-link"
              className={hubGadget.goldenLink}
            >
              Карточка
            </Link>
          </div>
        ) : null}
        {compact && variant === 'brand' && !minimalChrome && partnerCountLoading ? (
          <Badge
            variant="outline"
            className="border-border-subtle text-text-muted text-[11px]"
            data-testid={BRAND_CO_CABINET_PARTNER_COUNT_LOADING_TESTID}
          >
            {WAVE_ZE_PARTNER_COUNT_LOADING_RU}
          </Badge>
        ) : null}
        {compact && variant === 'brand' && !minimalChrome && !partnerCountLoading && activePartnerCount > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-sky-200 bg-sky-50 text-[11px] text-sky-800"
              data-testid={BRAND_CO_CABINET_PARTNER_COUNT_TESTID}
            >
              {activePartnerCount} партнёр(ов)
            </Badge>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800"
              data-testid={BRAND_CO_CABINET_PG_PARTNER_BADGE_TESTID}
            >
              {partnerPgSummary.pgLabel}
              {formatHubCabinetPartnerStorageModeSuffixRu(partnerStorageMode, auditUi)}
            </Badge>
          </div>
        ) : null}
        {compact && variant === 'brand' && !minimalChrome && retailerSummaries.length > 1 ? (
          <div
            className="flex flex-wrap items-center gap-1.5 text-[11px]"
            data-testid="brand-co-cabinet-partner-filter"
          >
            <button
              type="button"
              className={cn(
                'rounded px-1.5 py-0.5 font-medium',
                brandPartnerFilter === 'all'
                  ? 'bg-sky-100 text-sky-900'
                  : 'text-accent-primary hover:underline'
              )}
              data-testid="brand-co-cabinet-partner-all"
              onClick={() => setBrandPartnerFilter('all')}
            >
              Все
            </button>
            {retailerSummaries.map((partner) => (
              <button
                key={partner.retailerId}
                type="button"
                className={cn(
                  'rounded px-1.5 py-0.5 font-medium',
                  brandPartnerFilter === partner.retailerId
                    ? 'bg-sky-100 text-sky-900'
                    : 'text-accent-primary hover:underline'
                )}
                data-testid={`brand-co-cabinet-partner-${partner.retailerId}`}
                onClick={() => setBrandPartnerFilter(partner.retailerId)}
              >
                {partner.displayNameRu}
              </button>
            ))}
          </div>
        ) : null}
        {compact && variant === 'shop' && hasActiveOrder && !minimalChrome ? (
          <PlatformCorePillarNotificationCenterCompact
            variant="shop"
            compact
            collectionId={collectionId}
            orderId={resolvedOrderId}
            orderScoped
          />
        ) : null}
        {compact && variant === 'brand' && hasActiveOrder && !minimalChrome ? (
          <PlatformCorePillarNotificationCenterCompact
            variant="brand"
            compact
            collectionId={collectionId}
            orderId={resolvedOrderId}
            orderScoped
          />
        ) : null}
        {compact && variant === 'brand' && hasActiveOrder && !minimalChrome ? (
          <BrandCoRegistryRetailOnboardingStrip
            collectionId={collectionId}
            orderId={resolvedOrderId}
          />
        ) : null}
        {showNavStrips && variant === 'shop' && hasActiveOrder ? (
          <div className={hubGadget.goldenPath} data-testid="shop-co-cabinet-cta-orders">
            <Link
              href={shopB2bOrdersCollectionRegistryHref(resolvedOrderId)}
              data-testid="shop-collection-order-registry-link"
              className={hubGadget.goldenLink}
            >
              Реестр
            </Link>
            {canShopAmend ? (
              <>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={shopB2bMatrixReorderHref(collectionId, resolvedOrderId)}
                  data-testid="shop-co-cabinet-amend-link"
                  className={hubGadget.goldenLink}
                >
                  Изменить
                </Link>
              </>
            ) : null}
            {canShopPostConfirmBulk ? (
              <>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
                <Link
                  href={shopWorkingOrderTabHref('bulk', resolvedOrderId, collectionId)}
                  data-testid="shop-co-cabinet-working-order-amend-link"
                  className={hubGadget.goldenLink}
                >
                  Рабочий заказ
                </Link>
              </>
            ) : null}
          </div>
        ) : null}
        {showNavStrips && variant === 'brand' && hasActiveOrder && brandConfirmedDone ? (
          <BrandCoCabinetSpinePeerStrip collectionId={collectionId} orderId={resolvedOrderId} />
        ) : null}
        {showNavStrips && variant === 'shop' && hasActiveOrder ? (
          <PlatformCoreShopCoGoldenPathStrip
            collectionId={collectionId}
            orderId={resolvedOrderId}
            className="mb-1"
          />
        ) : null}
        {showNavStrips && variant === 'shop' && hasActiveOrder ? (
          <PlatformCoreShopCoCabinetCoSpinePeerStrip collectionId={collectionId} orderId={resolvedOrderId} />
        ) : null}
        {compact && variant === 'shop' && !minimalChrome && brandConfirmedDone && hasActiveOrder ? (
          <ShopCoCabinetTrackingEmbed
            orderId={resolvedOrderId}
            operationalStatus={resolvedSpineMeta?.status ?? null}
            trackingNumberPreview={trackingNumber}
          />
        ) : null}
        {!compact && variant === 'brand' && hasActiveOrder ? (
          <div className="space-y-1.5">
            <div
              className="flex flex-wrap gap-x-3 gap-y-1 text-xs"
              data-testid="brand-co-cabinet-cta-orders-full"
            >
              <Link
                href={brandB2bOrdersCollectionRegistryHref(resolvedOrderId)}
                data-testid="brand-co-cabinet-registry-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Реестр
              </Link>
              <Link
                href={brandB2bOrderHref(resolvedOrderId)}
                data-testid="brand-co-cabinet-order-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Карточка
              </Link>
              <Link
                href={ROUTES.brand.retailers}
                data-testid="brand-co-retailers-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Ритейлеры
              </Link>
              {activePartnerCount != null && activePartnerCount > 0 ? (
                <>
                  <Badge
                    variant="outline"
                    className="border-sky-200 bg-sky-50 text-[11px] text-sky-800"
                    data-testid={BRAND_CO_CABINET_PARTNER_COUNT_TESTID}
                  >
                    {activePartnerCount} партнёр(ов)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800"
                    data-testid={BRAND_CO_CABINET_PG_PARTNER_BADGE_TESTID}
                  >
                    {partnerPgSummary.pgLabel}
                  </Badge>
                </>
              ) : null}
            </div>
            {retailerSummaries.length > 0 ? (
              <div
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
                data-testid="brand-co-cabinet-partner-filter"
              >
                <span className="text-text-muted">Реестр по магазину:</span>
                <Link
                  href={brandB2bOrdersRegistryHref()}
                  className="text-accent-primary font-medium hover:underline"
                  data-testid="brand-co-cabinet-partner-all"
                >
                  Все
                </Link>
                {retailerSummaries.map((partner) => (
                  <Link
                    key={partner.retailerId}
                    href={brandB2bOrdersRegistryHref({ partner: partner.retailerId })}
                    data-testid={`brand-co-cabinet-partner-${partner.retailerId}`}
                    className="text-accent-primary font-medium hover:underline"
                  >
                    {partner.displayNameRu}
                  </Link>
                ))}
              </div>
            ) : null}
            <div
              className="flex flex-wrap gap-x-3 gap-y-1 text-xs"
              data-testid="brand-co-cabinet-cta-peer"
            >
              <Link
                href={shopB2bCheckoutCollectionHref(collectionId)}
                data-testid="brand-pillar-to-shop-checkout"
                className="text-accent-primary font-medium hover:underline"
              >
                UAT · оформление
              </Link>
            </div>
            <BrandShopProductionDisclosurePreviewStrip orderId={resolvedOrderId} />
            <BrandB2bIntegrationsImportToolbar
              compact
              className="flex flex-wrap items-center gap-1.5 pt-1"
              onImported={() => setImportReloadNonce((n) => n + 1)}
            />
          </div>
        ) : null}
        {!compact && variant === 'shop' && hasActiveOrder ? (
          <div
            className="flex flex-wrap gap-3 text-xs"
            data-testid="shop-co-cabinet-cta-orders-full"
          >
            <Link href={matrixHref} className="text-accent-primary font-medium hover:underline">
              Матрица · {collectionLabel}
            </Link>
            <Link
              href={`${shopB2bOrderHref(resolvedOrderId)}?collection=${encodeURIComponent(collectionId)}`}
              className="text-accent-primary font-medium hover:underline"
            >
              Заказ · {collectionLabel}
            </Link>
          </div>
        ) : null}
        {!compact && variant === 'brand' && hasActiveOrder ? (
          <div
            className="flex flex-wrap gap-3 text-xs"
            data-testid="brand-co-cabinet-cta-orders-extra"
          >
            <Link
              href={ROUTES.brand.retailers}
              className="text-accent-primary font-medium hover:underline"
            >
              Ритейлеры
            </Link>
            <Link
              href={brandB2bOrderHref(resolvedOrderId)}
              data-testid="brand-co-chain-order-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Оптовый заказ · {collectionLabel}
            </Link>
            <Link
              href={`/brand/linesheets?collection=${encodeURIComponent(collectionId)}`}
              className="text-accent-primary font-medium hover:underline"
            >
              Линейки
            </Link>
            <Link
              href={matrixHref}
              className="text-accent-primary font-medium hover:underline"
              data-testid="brand-pillar-to-shop-matrix"
            >
              Матрица (магазин)
            </Link>
            <Link
              href={shopB2bCheckoutCollectionHref(collectionId)}
              data-testid="brand-pillar-to-shop-checkout-full"
              className="text-accent-primary font-medium hover:underline"
            >
              Оформление (магазин)
            </Link>
            {SHOP_CORE_BUYER_PRESETS.filter((p) => p.id !== 'shop1').map((preset) => (
              <Link
                key={preset.id}
                href={shopB2bCheckoutCollectionHref(collectionId, { buyerId: preset.id })}
                data-testid={`brand-pillar-to-shop-checkout-${preset.id}`}
                className="text-accent-primary font-medium hover:underline"
              >
                Оформление · {preset.cityRu ?? preset.id}
              </Link>
            ))}
          </div>
        ) : !compact && !hasActiveOrder && !resolving ? (
          <div className="flex flex-wrap gap-3 text-xs">
            {variant === 'shop' ? (
              <>
                <Link
                  href={showroomHref}
                  className="text-accent-primary font-medium hover:underline"
                >
                  Витрина · {collectionLabel}
                </Link>
                <Link href={matrixHref} className="text-accent-primary font-medium hover:underline">
                  Матрица · {collectionLabel}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.brand.retailers}
                  className="text-accent-primary font-medium hover:underline"
                >
                  Ритейлеры
                </Link>
                <Link
                  href={`/brand/linesheets?collection=${encodeURIComponent(collectionId)}`}
                  className="text-accent-primary font-medium hover:underline"
                >
                  Линейки
                </Link>
              </>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
