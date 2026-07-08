'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ROUTES,
  shopB2bMatrixArticleHref,
  shopB2bOrdersCollectionRegistryHref,
} from '@/lib/routes';
import { SHOP_MATRIX_SIZE_RUN_FIX_MATRIX_LINK_RU } from '@/lib/b2b/shop-matrix-size-run-cart-validation';
import {
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_CHECKOUT_TESTID,
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_HINT_RU,
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_RU,
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_TESTID,
  readShopMatrixDraftAutosaveFailSession,
  shopMatrixDraftAutosaveFailMatrixHref,
} from '@/lib/b2b/shop-matrix-draft-autosave-wave-xt';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ShopCoCheckoutInventoryReserveBadge } from '@/components/shop/b2b/ShopCoCheckoutInventoryReserveBadge';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';
import { invalidateClientChainOverviewCache } from '@/components/platform/usePlatformCoreChainOverview';
import { useB2BState } from '@/providers/b2b-state';
import { tid } from '@/lib/ui/test-ids';
import {
  checkoutWorkshop2Cart,
  fetchWorkshop2CartCheckoutPreflight,
  resolveCheckoutCartSession,
} from '@/lib/b2b/workshop2-cart-bridge';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { useShopMatrixTierPricing } from '@/hooks/use-shop-matrix-tier-pricing';
import { ShopCoreBuyerSwitcher } from '@/components/shop/ShopCoreBuyerSwitcher';
import { ShopCoCheckoutMonetizationPeerStrip } from '@/components/platform/ShopCoCheckoutMonetizationPeerStrip';
import {
  isShopGreenfieldBuyer,
  ShopCoCheckoutGreenfieldReadinessStrip,
  shopGreenfieldPostCheckoutRegistryHref,
} from '@/components/shop/b2b/ShopCoCheckoutGreenfieldReadinessStrip';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { ShopCoCheckoutPaymentIntentStrip } from '@/components/shop/b2b/ShopCoCheckoutPaymentIntentStrip';
import { ShopCoCheckoutPostPaymentStrip } from '@/components/shop/b2b/ShopCoCheckoutPostPaymentStrip';
import { resolveShopCheckoutPostCreateNavigationHref } from '@/lib/platform/wave-yq-shop-checkout-payment';
import { ShopCoGoldenPathStrip } from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { PlatformCoreShopCoGoldenPathStrip } from '@/components/platform/peers/PlatformCoreShopCoGoldenPathStrip';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE } from '@/lib/platform/wave-yk-shop-co-golden-path';

function readB2bCartSessionCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)b2b_cart_session=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]).trim() : undefined;
}

export function ShopB2bCheckoutCorePage() {
  const embeddedCoWorkspace = usePlatformCoreEmbeddedWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buyerId } = useShopCoreBuyerId();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    collectionId,
    resolveFrom: ['w2_registry', 'operational', 'allocation'],
    actorRole: 'shop',
    buyerId,
  });
  const [cartSessionFromCookie, setCartSessionFromCookie] = useState<string | undefined>();
  useEffect(() => {
    setCartSessionFromCookie(readB2bCartSessionCookie());
  }, []);
  const cartSession = searchParams.get('cartSession')?.trim() || cartSessionFromCookie || undefined;
  const { b2bCart = [] } = useB2BState();
  const { cartTier, tierLabel, applyToCartItem } = useShopMatrixTierPricing(collectionId);
  const matrixHref = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`;
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [preflightReady, setPreflightReady] = useState<boolean | null>(null);
  const [preflightDetail, setPreflightDetail] = useState<string | null>(null);
  const [sizeRunArticleId, setSizeRunArticleId] = useState<string | null>(null);
  const [draftAutosaveFail, setDraftAutosaveFail] = useState(false);

  useEffect(() => {
    const failSession = readShopMatrixDraftAutosaveFailSession();
    const queryFail = searchParams.get('draftAutosaveFail') === '1';
    const sessionMatch = Boolean(cartSession && failSession && failSession === cartSession);
    setDraftAutosaveFail(queryFail || sessionMatch);
  }, [cartSession, searchParams]);

  useEffect(() => {
    if (!cartSession && b2bCart.length === 0) {
      setPreflightReady(false);
      setPreflightDetail('Корзина пуста — добавьте позиции в матрице.');
      return;
    }
    let cancelled = false;
    void fetchWorkshop2CartCheckoutPreflight(cartSession).then((result) => {
      if (cancelled) return;
      setPreflightReady(result.ready);
      setPreflightDetail(result.ready ? null : result.messageRu);
      setSizeRunArticleId(
        result.sizeRunViolations.length > 0
          ? (result.firstFailedSizeRunArticleId ?? result.sizeRunViolations[0]?.articleId ?? null)
          : null
      );
    });
    return () => {
      cancelled = true;
    };
  }, [cartSession, b2bCart.length, buyerId]);

  const canConfirm =
    (b2bCart.length > 0 || Boolean(cartSession)) && preflightReady === true && !checkingOut;
  const total = b2bCart.reduce((acc: number, item: { price?: number; quantity?: number }) => {
    const priced = applyToCartItem(item as Parameters<typeof applyToCartItem>[0]);
    return acc + (priced.price ?? 0) * (priced.quantity ?? 1);
  }, 0);

  const handleConfirm = () => {
    if (!canConfirm || checkingOut) return;
    void (async () => {
      setCheckingOut(true);
      setCheckoutMsg(null);
      try {
        const preflight = await fetchWorkshop2CartCheckoutPreflight(cartSession);
        if (!preflight.ready) {
          setCheckoutMsg(preflight.messageRu);
          setPreflightReady(false);
          setPreflightDetail(preflight.messageRu);
          setSizeRunArticleId(
            preflight.sizeRunViolations.length > 0
              ? (preflight.firstFailedSizeRunArticleId ??
                  preflight.sizeRunViolations[0]?.articleId ??
                  null)
              : null
          );
          return;
        }
        const resolved = await resolveCheckoutCartSession({
          items: b2bCart.map(applyToCartItem),
          collectionId,
          buyerId,
          tier: cartTier,
          sessionId: cartSession,
          preferPersistedSession: true,
        });
        if (!resolved.ok) {
          setCheckoutMsg(resolved.messageRu);
          return;
        }
        const result = await checkoutWorkshop2Cart({
          sessionId: resolved.sessionId ?? cartSession,
          buyerId,
        });
        setCheckoutMsg(result.messageRu);
        if (result.ok && result.orderId) {
          setCreatedOrderId(result.orderId);
          if (isShopGreenfieldBuyer(buyerId)) {
            void fetch('/api/shop/b2b/greenfield/onboarding', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ buyerId, collectionId, orderId: result.orderId }),
            }).catch(() => {
              /* optional PG mark */
            });
          }
          invalidateClientChainOverviewCache(collectionId);
          const nextHref = isShopGreenfieldBuyer(buyerId)
            ? shopGreenfieldPostCheckoutRegistryHref({
                orderId: result.orderId,
                buyerId,
                collectionId,
              })
            : resolveShopCheckoutPostCreateNavigationHref({
                orderId: result.orderId,
                collectionId,
              });
          router.push(nextHref);
        }
      } catch {
        setCheckoutMsg('Ошибка сети при оформлении заказа.');
      } finally {
        setCheckingOut(false);
      }
    })();
  };

  return (
    <CabinetPageContent
      maxWidth="2xl"
      className="space-y-6 max-md:pb-28"
      data-testid={tid.page('shop-b2b-checkout')}
    >
      <PlatformCoreListChrome highlightRole="shop" pillarId="collection_order">
        <div className="min-w-0" data-testid="shop-co-checkout-panel">
          {embeddedCoWorkspace ? (
            <PlatformCoreShopCoGoldenPathStrip
              collectionId={collectionId}
              orderId={spineOrderId || undefined}
              activeStep="checkout"
              className="mb-3"
            />
          ) : (
            <ShopCoGoldenPathStrip
              collectionId={collectionId}
              orderId={spineOrderId || undefined}
              activeStep="checkout"
              stripTestId={SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.checkout.strip}
              className="mb-3"
              legacyLinkTestIds={{
                matrix: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.checkout.matrix,
                registry: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.checkout.registry,
              }}
            />
          )}
          <ShopCoCheckoutMonetizationPeerStrip
            collectionId={collectionId}
            orderId={spineOrderId || undefined}
          />
          <section
            className="mb-3 space-y-2"
            data-testid="shop-co-checkout-step-partner"
            aria-label="Партнёр и условия"
          >
            <p className="text-text-muted max-md:text-[10px] max-md:font-bold max-md:uppercase max-md:tracking-widest md:hidden">
              1 · Партнёр и условия
            </p>
            {isShopGreenfieldBuyer(buyerId) ? (
              <ShopCoCheckoutGreenfieldReadinessStrip
                buyerId={buyerId}
                collectionId={collectionId}
              />
            ) : null}
            <div
              className="flex min-h-11 flex-wrap items-center gap-2"
              data-testid="shop-co-checkout-buyer-picker"
            >
              <span className="text-text-muted text-xs" data-testid="shop-co-checkout-buyer-label">
                Партнёр · оформление:
              </span>
              <ShopCoreBuyerSwitcher />
              <span
                className="border-border-subtle bg-bg-surface2 text-text-muted rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase"
                data-testid={`shop-co-checkout-cart-tier-${cartTier}`}
              >
                {tierLabel} · корзина {cartTier}
              </span>
            </div>
          </section>
          <section
            className="mb-6"
            data-testid="shop-co-checkout-step-cart"
            aria-label="Состав заказа"
          >
            <p className="text-text-muted mb-2 max-md:text-[10px] max-md:font-bold max-md:uppercase max-md:tracking-widest md:hidden">
              2 · Состав заказа
            </p>
            <Card data-testid="shop-co-checkout-form" data-audit-legacy="shop-b2b-checkout-form">
              <CardContent className="pt-6">
                {b2bCart.length === 0 ? (
                  <p className="text-text-secondary text-sm">
                    {cartSession ? (
                      <>
                        Корзина синхронизирована с матрицы (сессия W2). Подтвердите заказ или
                        вернитесь в{' '}
                        <Link
                          href={matrixHref}
                          data-testid="shop-co-checkout-empty-matrix-link"
                          className="text-accent-primary hover:underline"
                        >
                          матрицу
                        </Link>
                        .
                      </>
                    ) : (
                      <>
                        Корзина пуста. Добавьте товары в{' '}
                        <Link
                          href={matrixHref}
                          data-testid="shop-co-checkout-empty-matrix-link"
                          className="text-accent-primary hover:underline"
                        >
                          матрице заказа
                        </Link>
                        .
                      </>
                    )}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {b2bCart.map(
                      (
                        item: {
                          id?: string;
                          name?: string;
                          sku?: string;
                          quantity?: number;
                          price?: number;
                        },
                        i: number
                      ) => {
                        const priced = applyToCartItem(
                          item as Parameters<typeof applyToCartItem>[0]
                        );
                        return (
                          <li
                            key={`${item.id ?? item.sku}-${i}`}
                            className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2"
                          >
                            <span className="text-text-primary min-w-0 text-sm leading-snug">
                              {item.name ?? item.sku} × {priced.quantity ?? 1}
                            </span>
                            <span className="text-text-primary shrink-0 text-sm font-medium tabular-nums sm:text-right">
                              {((priced.price ?? 0) * (priced.quantity ?? 1)).toLocaleString(
                                'ru-RU'
                              )}{' '}
                              ₽
                            </span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                )}
                <p className="mt-3 font-semibold">Итого: {total.toLocaleString('ru-RU')} ₽</p>
                <ShopCoCheckoutPaymentIntentStrip
                  amountRub={total}
                  orderId={spineOrderId || createdOrderId || undefined}
                  collectionId={collectionId}
                />
                {createdOrderId ? (
                  <ShopCoCheckoutPostPaymentStrip
                    orderId={createdOrderId}
                    collectionId={collectionId}
                  />
                ) : null}
                <ShopCoCheckoutInventoryReserveBadge
                  collectionId={collectionId}
                  buyerId={buyerId}
                />
              </CardContent>
            </Card>
          </section>
          {sizeRunArticleId && preflightDetail ? (
            <div
              className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-sm text-amber-900"
              role="status"
              data-testid="shop-co-checkout-size-run-hint"
            >
              <p>{preflightDetail}</p>
              <Link
                href={shopB2bMatrixArticleHref(collectionId, sizeRunArticleId)}
                data-testid="shop-co-checkout-size-run-matrix-link"
                className="text-accent-primary mt-1 inline-block font-semibold hover:underline"
              >
                {SHOP_MATRIX_SIZE_RUN_FIX_MATRIX_LINK_RU}: {sizeRunArticleId}
              </Link>
            </div>
          ) : preflightDetail && !checkoutMsg ? (
            <p
              className="text-sm text-amber-900"
              role="status"
              data-testid="shop-co-checkout-preflight-block"
            >
              {preflightDetail}
            </p>
          ) : null}
          {draftAutosaveFail ? (
            <div
              className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-sm text-amber-900"
              role="alert"
              data-testid={SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_CHECKOUT_TESTID}
            >
              <p>{SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_HINT_RU}</p>
              <Link
                href={shopMatrixDraftAutosaveFailMatrixHref(
                  collectionId,
                  sizeRunArticleId ?? undefined
                )}
                data-testid={SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_TESTID}
                className="text-accent-primary mt-1 inline-block font-semibold hover:underline"
              >
                {SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_RU}
              </Link>
            </div>
          ) : null}
          {checkoutMsg ? (
            <p
              className="text-text-secondary text-sm"
              role="status"
              data-testid="shop-co-checkout-message"
            >
              {checkoutMsg}
            </p>
          ) : null}
          <section
            className={cn('mt-6', hubCabinet.workspaceStickyActions)}
            data-testid="shop-co-checkout-step-confirm"
            aria-label="Подтверждение"
          >
            <p className="text-text-muted mb-2 w-full max-md:text-[10px] max-md:font-bold max-md:uppercase max-md:tracking-widest md:hidden">
              3 · Подтверждение
            </p>
            <div data-testid="shop-co-checkout-actions" className="contents">
              <Button
                disabled={!canConfirm || checkingOut}
                onClick={handleConfirm}
                data-testid="shop-co-checkout-confirm"
                data-audit-legacy="shop-b2b-checkout-confirm"
                className={hubCabinet.workspacePrimaryBtn}
              >
                {checkingOut ? 'Оформление…' : 'Подтвердить заказ'}
              </Button>
              <Button variant="outline" asChild className={hubCabinet.workspacePrimaryBtn}>
                <Link href={matrixHref} data-testid="shop-co-checkout-back-matrix-link">
                  В матрицу
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
