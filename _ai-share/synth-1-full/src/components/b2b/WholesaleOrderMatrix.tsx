'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  fetchWorkshop2CartSession,
  mapWorkshop2CartLinesToCartItems,
  resolveCheckoutCartSession,
  upsertWorkshop2CartLine,
} from '@/lib/b2b/workshop2-cart-bridge';
import {
  WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE,
  fetchWorkshop2MatrixProducts,
} from '@/lib/b2b/workshop2-b2b-matrix-catalog';
import {
  groupShopMatrixBulkPasteByArticle,
  parseShopMatrixBulkPaste,
} from '@/lib/b2b/shop-matrix-bulk-paste';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  ShoppingBag,
  BarChart3,
  Save,
  FileCheck,
  Grid3X3,
  RefreshCcw,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  X,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES, shopB2bCheckoutCollectionHref } from '@/lib/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import allProductsData from '@/lib/products';
import { cn } from '@/lib/cn';
import { JOOR_DELIVERY_WINDOWS, getMoqForProduct } from '@/lib/b2b/joor-constants';
import { getATS, isOverATS } from '@/lib/b2b/ats-inventory';
import { getCurrentPriceTier, getPriceForTier, PRICE_TIER_LABELS } from '@/lib/b2b/price-tiers';
import { getPriceWithPromotions } from '@/lib/b2b/price-lists';
import { getCreditForCurrentPartner } from '@/lib/b2b/credit-check';
import {
  runPreflightCheck,
  getRealtimeLineBlock,
  getOrderRulesForBrand,
} from '@/lib/b2b/order-rules';
import { getCurrentBuyerRights, getProductsVisibleToBuyer } from '@/lib/b2b/buyer-rights';
import { getRecommendedSize, getSizeUpWarningMessage } from '@/lib/b2b/size-fit';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import type { Product } from '@/lib/types';

// Sub-components
import { OrderAnalyticsTab } from './order/OrderAnalyticsTab';
import { OrderReplenishTab } from './order/OrderReplenishTab';
import { OrderAllocationTab } from './order/OrderAllocationTab';

interface WholesaleOrderMatrixProps {
  onClose: () => void;
  activeRetailer?: any;
  /** NuOrder-style: начальный режим заказа из URL (order-mode → matrix?mode=pre_order) */
  initialOrderMode?: 'buy_now' | 'reorder' | 'pre_order';
  /** NuORDER: привязка к событию (eventId из URL create-order → matrix) */
  initialEventId?: string;
  /** SparkLayer: ценовой уровень из URL/партнёра */
  initialPriceTier?: 'retail_a' | 'retail_b' | 'outlet';
  /** Территория партнёра для отображения в шапке */
  initialTerritory?: string;
  /** PIM / Fashion Cloud: бренд из query (?brand=) */
  pimBrandContext?: string;
  /** Контекст коллекции при открытии из explorer */
  collectionId?: string;
}

export function WholesaleOrderMatrix({
  onClose,
  activeRetailer,
  initialOrderMode = 'buy_now',
  initialEventId,
  initialPriceTier,
  initialTerritory,
  pimBrandContext: _pimBrandContext,
  collectionId: _collectionId,
}: WholesaleOrderMatrixProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCurrency } = useUIState();
  const { b2bCart, setB2bCart, updateB2bOrderItemQuantity, removeB2bOrderItem } = useB2BState();
  const [activeTab, setActiveTab] = useState<
    'matrix' | 'summary' | 'analytics' | 'replenish' | 'allocation'
  >('matrix');
  const [activeDrop, setActiveDrop] = useState('Drop 1: July 2026');
  const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
  const [bulkPasteRaw, setBulkPasteRaw] = useState('');
  const [bulkPasteBusy, setBulkPasteBusy] = useState(false);
  const [bulkPasteHint, setBulkPasteHint] = useState<string | null>(null);
  /** Режим заказа: мгновенная отгрузка / повтор / предзаказ. При API — уходит в payload. */
  const [orderMode, setOrderMode] = useState<'buy_now' | 'reorder' | 'pre_order'>(initialOrderMode);
  /** Часть заказа — сэмплы на примерку (Try Before Buy). При API — в payload заказа. */
  const [tryBeforeBuy, setTryBeforeBuy] = useState(false);
  /** JOOR: заметки к заказу */
  const [orderNotes, setOrderNotes] = useState('');
  const [cartSyncing, setCartSyncing] = useState(false);
  const [cartSessionId, setCartSessionId] = useState<string | undefined>();
  const [cartSyncError, setCartSyncError] = useState<string | null>(null);
  const cartHydratedRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [w2MatrixProducts, setW2MatrixProducts] = useState<any[]>([]);
  const matrixCollectionId = (
    _collectionId ??
    searchParams.get('collectionId') ??
    searchParams.get('collection') ??
    'SS27'
  ).trim();

  useEffect(() => {
    if (!matrixCollectionId) return;
    let cancelled = false;
    void fetchWorkshop2MatrixProducts(matrixCollectionId).then((rows) => {
      if (!cancelled) setW2MatrixProducts(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [matrixCollectionId]);

  const coreMode = isPlatformCoreMode();
  const { buyerId: coreBuyerIdFromContext } = useShopCoreBuyerId();
  const coreBuyerId = coreMode ? coreBuyerIdFromContext : 'buyer-demo';
  const cartTier = orderMode === 'pre_order' ? 'prebook' : 'standard';

  useEffect(() => {
    if (coreMode && orderMode !== 'buy_now') setOrderMode('buy_now');
  }, [coreMode, orderMode]);

  useEffect(() => {
    cartHydratedRef.current = false;
    setCartSessionId(undefined);
  }, [matrixCollectionId, coreBuyerId]);

  useEffect(() => {
    if (!coreMode || w2MatrixProducts.length === 0 || cartHydratedRef.current) return;
    let cancelled = false;
    void (async () => {
      const session = await fetchWorkshop2CartSession();
      if (cancelled || !session.ok) return;
      cartHydratedRef.current = true;
      if (session.sessionId) setCartSessionId(session.sessionId);
      const hydrated = mapWorkshop2CartLinesToCartItems(
        session.lines,
        w2MatrixProducts as Product[],
        matrixCollectionId
      );
      if (hydrated.length > 0) setB2bCart(hydrated);
    })();
    return () => {
      cancelled = true;
    };
  }, [coreMode, w2MatrixProducts, matrixCollectionId, setB2bCart]);

  const persistMatrixLineQty = useCallback(
    (product: Product, size: string, quantity: number, deliveryDate: string) => {
      if (!coreMode) return;
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(() => {
        void upsertWorkshop2CartLine({
          item: { ...product, quantity, selectedSize: size, deliveryDate } as typeof product & {
            quantity: number;
            selectedSize: string;
            deliveryDate: string;
          },
          collectionId: matrixCollectionId,
          buyerId: activeRetailer?.id ?? coreBuyerId,
          tier: cartTier,
          sessionId: cartSessionId,
        }).then((r) => {
          if (r.sessionId) setCartSessionId(r.sessionId);
        });
      }, 400);
    },
    [
      coreMode,
      matrixCollectionId,
      activeRetailer?.id,
      coreBuyerId,
      cartTier,
      cartSessionId,
    ]
  );

  const goMatrixCheckout = useCallback(() => {
    if (b2bCart.length === 0 || cartSyncing) return;
    void (async () => {
      setCartSyncing(true);
      setCartSyncError(null);
      try {
        if (persistTimerRef.current) {
          clearTimeout(persistTimerRef.current);
          persistTimerRef.current = undefined;
        }
        const resolved = await resolveCheckoutCartSession({
          items: b2bCart,
          collectionId: matrixCollectionId,
          buyerId: activeRetailer?.id ?? coreBuyerId,
          tier: cartTier,
          sessionId: cartSessionId,
          preferPersistedSession: coreMode,
        });
        if (!resolved.ok) {
          setCartSyncError(resolved.messageRu);
          return;
        }
        const checkoutHref = shopB2bCheckoutCollectionHref(matrixCollectionId);
        const href = resolved.sessionId
          ? `${checkoutHref}${checkoutHref.includes('?') ? '&' : '?'}cartSession=${encodeURIComponent(resolved.sessionId)}`
          : checkoutHref;
        router.push(href);
        window.setTimeout(() => {
          if (!window.location.pathname.startsWith(ROUTES.shop.b2bCheckout)) {
            window.location.assign(href);
          }
        }, 600);
      } catch {
        setCartSyncError('Не удалось синхронизировать корзину перед оформлением.');
      } finally {
        setCartSyncing(false);
      }
    })();
  }, [
    b2bCart,
    cartSyncing,
    matrixCollectionId,
    activeRetailer?.id,
    coreBuyerId,
    cartTier,
    cartSessionId,
    coreMode,
    router,
  ]);

  /** NuORDER: eventId/priceTier/territory из URL или партнёра — показываем в шапке и уходим в payload. */
  const displayEventId = initialEventId;
  const displayPriceTier = initialPriceTier ?? getCurrentPriceTier();
  const displayTerritory = initialTerritory;

  /** NuORDER: права по территории/каналу — в матрице байер видит только доступные ему продукты. */
  const buyerRights = useMemo(() => getCurrentBuyerRights(), []);
  const legacyVisibleProducts = useMemo(
    () => getProductsVisibleToBuyer(allProductsData, buyerRights),
    [buyerRights]
  );

  const visibleProducts = useMemo(() => {
    if (coreMode) return w2MatrixProducts;
    if (w2MatrixProducts.length === 0) return legacyVisibleProducts;
    const w2Ids = new Set(w2MatrixProducts.map((p) => p.id));
    const rest = legacyVisibleProducts.filter((p: { id: string }) => !w2Ids.has(p.id));
    return [...w2MatrixProducts, ...rest];
  }, [legacyVisibleProducts, w2MatrixProducts, coreMode]);

  /** JOOR: окна доставки (дропы) — Start Ship Date / Complete Ship Date */
  const drops = JOOR_DELIVERY_WINDOWS.map((w) => w.label);
  const orderModeLabels = {
    buy_now: 'Buy Now',
    reorder: 'Reorder',
    pre_order: 'Pre-order',
  } as const;

  /** JOOR: первый продукт, по которому не набран MOQ */
  const moqViolation = useMemo(() => {
    const byProduct = new Map<string, number>();
    b2bCart.forEach((item) => {
      byProduct.set(item.id, (byProduct.get(item.id) ?? 0) + item.quantity);
    });
    for (const [id, qty] of byProduct) {
      const moq = getMoqForProduct(id);
      if (qty > 0 && qty < moq) return { productId: id, current: qty, required: moq };
    }
    return null;
  }, [b2bCart]);

  /** NuORDER: есть ли строки с qty > ATS (недостаточно остатка) */
  const atsViolations = useMemo(() => {
    return b2bCart.filter(
      (item) =>
        item.quantity > 0 && isOverATS(item.id, item.selectedSize, item.quantity, item.deliveryDate)
    );
  }, [b2bCart]);
  const hasAtsViolation = atsViolations.length > 0;

  const totals = useMemo(() => {
    return b2bCart.reduce(
      (acc, item) => ({
        units: acc.units + item.quantity,
        amount: acc.amount + item.quantity * item.price,
      }),
      { units: 0, amount: 0 }
    );
  }, [b2bCart]);

  const priceTier = initialPriceTier ?? getCurrentPriceTier();
  /** Итого с учётом ценового уровня и прайс-листов/акций (SparkLayer) */
  const totalsByTier = useMemo(() => {
    return b2bCart.reduce(
      (acc, item) => {
        const product = visibleProducts.find((p: any) => p.id === item.id);
        const tierPrice = product ? getPriceForTier(product.price, priceTier) : item.price;
        const unitPrice = product
          ? getPriceWithPromotions(product.id, tierPrice, priceTier)
          : tierPrice;
        return { units: acc.units + item.quantity, amount: acc.amount + item.quantity * unitPrice };
      },
      { units: 0, amount: 0 }
    );
  }, [b2bCart, priceTier, visibleProducts]);

  const credit = getCreditForCurrentPartner();
  const creditWarning = totalsByTier.amount > 0 && credit.wouldExceed(totalsByTier.amount);
  const creditBlocked = credit.blocked;

  /** SparkLayer: Pre-flight check для блока в табе Итого */
  const preflightItems = useMemo(() => {
    const byProduct: Record<string, number> = {};
    b2bCart.forEach((item) => {
      byProduct[item.id] = (byProduct[item.id] ?? 0) + item.quantity;
    });
    return runPreflightCheck({
      orderTotalAmount: totalsByTier.amount,
      orderTotalUnits: totalsByTier.units,
      brandName: activeRetailer?.brand || 'Syntha',
      territory: displayTerritory,
      cartByProductId: byProduct,
    });
  }, [b2bCart, totalsByTier.amount, totalsByTier.units, activeRetailer?.brand, displayTerritory]);

  const applyBulkPaste = useCallback(async () => {
    const { lines, errors } = parseShopMatrixBulkPaste(bulkPasteRaw);
    if (lines.length === 0) {
      setBulkPasteHint(errors[0] ?? 'Нет строк для импорта.');
      return;
    }
    setBulkPasteBusy(true);
    setBulkPasteHint(null);
    try {
      const grouped = groupShopMatrixBulkPasteByArticle(lines);
      let syncedArticles = 0;
      let syncedLines = 0;
      const moqNotes: string[] = [];

      for (const [articleId, articleLines] of grouped) {
        const product =
          visibleProducts.find(
            (p: Product) => p.id === articleId || p.sku?.trim() === articleId
          ) ?? ({
            id: articleId,
            name: articleId,
            sku: articleId,
            price: articleLines[0]?.qty ? 0 : 0,
            images: [],
            category: 'apparel',
          } as Product);

        for (const line of articleLines) {
          updateB2bOrderItemQuantity(product.id, line.qty, line.size, activeDrop);
        }

        if (coreMode) {
          const res = await fetch('/api/shop/b2b/cart/matrix', {
            method: 'POST',
            headers: {
              ...buildWorkshop2ApiRequestHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: cartSessionId,
              collectionId: matrixCollectionId,
              articleId,
              updates: articleLines.map((line) => ({
                colorCode: line.colorCode,
                size: line.size,
                qty: line.qty,
                wholesalePriceRub: product.price ?? undefined,
              })),
            }),
          });
          const json = (await res.json()) as {
            ok?: boolean;
            sessionId?: string;
            moqViolations?: string[];
            messageRu?: string;
          };
          if (res.ok && json.ok) {
            syncedArticles += 1;
            syncedLines += articleLines.length;
            if (json.sessionId) setCartSessionId(json.sessionId);
            if (json.moqViolations?.length) moqNotes.push(...json.moqViolations);
          } else {
            errors.push(json.messageRu ?? `Ошибка импорта ${articleId}`);
          }
        } else {
          syncedArticles += 1;
          syncedLines += articleLines.length;
        }
      }

      const hintParts = [
        syncedLines > 0 ? `Импортировано ${syncedLines} строк · ${syncedArticles} арт.` : null,
        errors.length ? errors.slice(0, 3).join(' · ') : null,
        moqNotes.length ? `MOQ: ${moqNotes.slice(0, 2).join('; ')}` : null,
      ].filter(Boolean);
      setBulkPasteHint(hintParts.join(' · ') || 'Готово.');
      if (syncedLines > 0) setIsBulkEntryOpen(false);
    } catch {
      setBulkPasteHint('Сеть недоступна — повторите импорт.');
    } finally {
      setBulkPasteBusy(false);
    }
  }, [
    bulkPasteRaw,
    visibleProducts,
    activeDrop,
    coreMode,
    cartSessionId,
    matrixCollectionId,
    updateB2bOrderItemQuantity,
  ]);

  const renderBulkEntry = () => (
    <Dialog open={isBulkEntryOpen} onOpenChange={setIsBulkEntryOpen}>
      <DialogContent className="max-w-2xl rounded-xl border-none bg-white p-3 shadow-2xl">
        <DialogHeader className="mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-text-primary flex h-12 w-12 items-center justify-center rounded-2xl text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-sm font-black uppercase tracking-tight">
                Массовый ввод заказа (Bulk edit)
              </DialogTitle>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                {coreMode
                  ? 'Массовый ввод qty по размерам (demo).'
                  : 'Вставьте список артикулов или загрузите XLS для быстрого заказа.'}
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <textarea
            className="bg-bg-surface2 focus:ring-accent-primary h-48 w-full resize-none rounded-xl border-none p-4 font-mono text-xs focus:ring-2"
            placeholder="Артикул, Размер, Количество&#10;demo-ss27-01, M, 12&#10;demo-ss27-01, L, 8..."
            value={bulkPasteRaw}
            onChange={(e) => setBulkPasteRaw(e.target.value)}
            data-testid={coreMode ? 'shop-b2b-matrix-bulk-paste-input' : undefined}
          />
          <div className="flex gap-3">
            <Button
              className="bg-text-primary h-10 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white"
              disabled={bulkPasteBusy || !bulkPasteRaw.trim()}
              data-testid={coreMode ? 'shop-b2b-matrix-bulk-paste-apply' : undefined}
              onClick={() => void applyBulkPaste()}
            >
              {bulkPasteBusy ? 'Импорт…' : 'Обработать список'}
            </Button>
            <Button
              variant="outline"
              className="border-border-default h-10 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest"
            >
              Загрузить XLS
            </Button>
          </div>
          {bulkPasteHint ? (
            <p
              className="text-text-muted text-[10px]"
              data-testid={coreMode ? 'shop-b2b-matrix-bulk-paste-hint' : undefined}
            >
              {bulkPasteHint}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-bg-surface2 fixed inset-0 z-[150] flex flex-col text-left"
      data-testid={coreMode ? 'shop-b2b-matrix-shell' : undefined}
    >
      {renderBulkEntry()}
      <div className="border-border-subtle flex h-24 items-center justify-between border-b bg-white px-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-bg-surface2 group h-12 w-12 rounded-2xl p-0"
          >
            <ChevronLeft className="text-text-muted group-hover:text-text-primary h-6 w-6 transition-colors" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-accent-primary border-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
                {coreMode ? 'B2B · PostgreSQL' : 'Order_Matrix_v1.2'}
              </Badge>
              <h2 className="text-text-primary text-base font-black uppercase tracking-tight">
                {coreMode ? 'Матрица заказа' : 'Настройка Оптового Заказа'}
              </h2>
            </div>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
              {coreMode
                ? `Коллекция: ${matrixCollectionId} · Партнёр: ${activeRetailer?.name || 'Магазин'}`
                : `Коллекция: NEURAL NOMAD FW26 • Ритейлер: ${activeRetailer?.name || 'Партнер'}`}
              {displayEventId && ` • Событие: ${displayEventId}`}
              {displayPriceTier && ` • ${PRICE_TIER_LABELS[displayPriceTier]}`}
              {displayTerritory && ` • Территория: ${displayTerritory}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="mr-6 flex flex-col items-end">
            <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
              Оценочная стоимость
            </p>
            <p className="text-text-primary text-sm font-black">
              {totals.amount.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-accent-primary text-[10px] font-bold uppercase tracking-tight">
              Всего {totals.units} ед.
            </p>
          </div>
          {orderMode === 'pre_order' && !coreMode && (
            <Link
              href={ROUTES.shop.b2bPreOrder}
              className="text-accent-primary flex items-center gap-1 text-[9px] font-bold hover:underline"
            >
              <Calendar className="h-3.5 w-3.5" /> Каталог Pre-order
            </Link>
          )}
          {!coreMode ? (
            <Button
              variant="outline"
              className="border-border-default h-12 gap-2 rounded-2xl bg-white px-6 text-[10px] font-black uppercase tracking-widest"
            >
              <Save className="h-4 w-4" /> Сохранить черновик
            </Button>
          ) : null}
          <Button
            className="bg-text-primary h-12 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-xl"
            data-order-mode={orderMode}
            data-drop={activeDrop}
            data-try-before-buy={tryBeforeBuy}
            data-testid={coreMode ? 'shop-b2b-matrix-to-checkout' : undefined}
            disabled={b2bCart.length === 0 || cartSyncing}
            onClick={() => {
              if (coreMode) {
                goMatrixCheckout();
                return;
              }
              if (b2bCart.length === 0 || cartSyncing) return;
              const checkoutHref = matrixCollectionId
                ? `${ROUTES.shop.b2bCheckout}?collection=${encodeURIComponent(matrixCollectionId)}`
                : ROUTES.shop.b2bCheckout;
              router.push(checkoutHref);
            }}
          >
            {cartSyncing ? 'Синхронизация…' : 'Подтвердить заказ'}{' '}
            {orderMode === 'pre_order' ? '(Предзаказ)' : ''}{' '}
            {tryBeforeBuy ? '· Try Before Buy' : ''} <FileCheck className="h-4 w-4" />
          </Button>
          {coreMode && cartSyncError ? (
            <p className="text-rose-700 text-[10px] font-semibold" data-testid="shop-b2b-matrix-cart-sync-error">
              {cartSyncError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="border-border-subtle flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {coreMode ? (
                <Badge className="border-emerald-200 bg-emerald-50 text-[8px] font-black uppercase text-emerald-800">
                  Заказ · {matrixCollectionId} · W2 (PostgreSQL)
                </Badge>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-text-muted ml-1 text-[8px] font-black uppercase tracking-[0.2em]">
                      Режим заказа
                    </span>
                    <div className="bg-bg-surface2 flex items-center gap-1 rounded-xl p-1">
                      {(['buy_now', 'reorder', 'pre_order'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setOrderMode(mode)}
                          className={cn(
                            'rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all',
                            orderMode === mode
                              ? 'bg-accent-primary text-white shadow-lg'
                              : 'text-text-muted hover:text-text-secondary'
                          )}
                        >
                          {orderModeLabels[mode]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-bg-surface2 mx-1 h-10 w-[1px]" />
                  <div className="flex flex-col gap-1">
                    <span className="text-text-muted ml-1 text-[8px] font-black uppercase tracking-[0.2em]">
                      Активная поставка (Drop)
                    </span>
                    <div className="bg-bg-surface2 flex items-center gap-2 rounded-xl p-1">
                      {drops.map((drop) => (
                        <button
                          key={drop}
                          onClick={() => setActiveDrop(drop)}
                          className={cn(
                            'rounded-lg px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all',
                            activeDrop === drop
                              ? 'bg-text-primary text-white shadow-lg'
                              : 'text-text-muted hover:text-text-secondary'
                          )}
                        >
                          {drop.split(':')[0].replace('Drop', 'Дроп')}
                        </button>
                      ))}
                    </div>
                  </div>
                  {orderMode === 'pre_order' && (
                    <Badge className="border-amber-200 bg-amber-100 text-[8px] font-black uppercase text-amber-800">
                      Предзаказ · Поступление по дропу
                    </Badge>
                  )}
                  <div className="bg-bg-surface2 mx-2 h-10 w-[1px]" />
                </>
              )}

              <div className="relative w-64">
                <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Фильтр каталога..."
                  className="border-border-subtle bg-bg-surface2 h-12 rounded-xl pl-12"
                />
              </div>
            </div>

            <div className="bg-bg-surface2 flex flex-wrap items-center gap-1.5 rounded-xl p-1">
              {(
                coreMode
                  ? [
                      { id: 'matrix', label: 'Матрица размеров', icon: Grid3X3 },
                      { id: 'summary', label: 'Итого', icon: ShoppingBag },
                    ]
                  : [
                      { id: 'matrix', label: 'Матрица размеров', icon: Grid3X3 },
                      { id: 'replenish', label: 'Умное пополнение', icon: RefreshCcw },
                      { id: 'allocation', label: 'Распределение', icon: MapPin },
                      { id: 'summary', label: 'Итого', icon: ShoppingBag },
                      { id: 'analytics', label: 'AI Аналитика', icon: BarChart3 },
                    ]
              ).map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'h-10 rounded-lg px-6 text-[9px] font-black uppercase tracking-widest transition-all',
                    activeTab === tab.id
                      ? 'text-text-primary bg-white shadow-sm'
                      : 'text-text-muted hover:text-text-secondary bg-transparent'
                  )}
                >
                  {tab.label}
                </Button>
              ))}
              {coreMode ? null : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10 h-10 rounded-lg text-[9px] font-black uppercase tracking-widest"
                  asChild
                >
                  <Link href={ROUTES.shop.b2bWorkingOrder}>
                    <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Working Order
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {!coreMode && moqViolation && (
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[10px] font-black uppercase tracking-tight text-amber-900">
                    Минимальный заказ (MOQ)
                  </p>
                  <p className="text-[9px] font-bold uppercase text-amber-600">
                    Нужно еще {moqViolation.required - moqViolation.current} ед. по стилю для
                    достижения MOQ ({moqViolation.required} ед.).
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-10 rounded-xl px-4 text-[9px] font-black uppercase text-amber-900 hover:bg-amber-100"
              >
                Добавить до минимума <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {!coreMode && hasAtsViolation && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-tight text-rose-900">
                  NuORDER: недостаточно остатка (ATS)
                </p>
                <p className="text-[9px] font-bold uppercase text-rose-600">
                  В {atsViolations.length} позициях запрошено больше, чем доступно к продаже.
                  Уменьшите количество или свяжитесь с брендом.
                </p>
              </div>
            </div>
          )}
          {coreMode ? null : (
            <div className="bg-bg-surface2 border-border-subtle rounded-xl border p-3">
              <label className="text-text-muted ml-1 text-[8px] font-black uppercase tracking-[0.2em]">
                Заметки к заказу
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Комментарий для бренда (сроки, склад, особые пожелания)…"
                className="border-border-default mt-1 min-h-[60px] w-full resize-y rounded-lg border bg-white p-3 text-sm"
              />
            </div>
          )}

          <div className="min-h-[500px]">
            {activeTab === 'analytics' && <OrderAnalyticsTab />}
            {activeTab === 'replenish' && <OrderReplenishTab collectionId={matrixCollectionId} />}
            {activeTab === 'allocation' && <OrderAllocationTab />}
            {activeTab === 'matrix' && (
              <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4">
                {visibleProducts.slice(0, 5).map((product: any) => {
                  const brandName = activeRetailer?.brand ?? 'Syntha';
                  const rules = getOrderRulesForBrand(brandName);
                  const qtyForProduct = b2bCart
                    .filter((item: any) => item.id === product.id)
                    .reduce((s: number, i: any) => s + i.quantity, 0);
                  const lineBlock = getRealtimeLineBlock({
                    brandName,
                    territory: displayTerritory,
                    orderTotalWithLine: totalsByTier.amount,
                    orderTotalByBrandWithLine: totalsByTier.amount,
                    qtyForProduct,
                    productId: product.id,
                    minOrderValue: rules?.minOrderValue ?? 150_000,
                  });
                  return (
                    <Card
                      key={product.id}
                      data-testid={coreMode ? `shop-b2b-matrix-row-${product.id}` : undefined}
                      className={cn(
                        'overflow-hidden rounded-xl border-none bg-white shadow-xl',
                        lineBlock.blocked && 'opacity-95 ring-1 ring-rose-200'
                      )}
                    >
                      <div className="flex h-full flex-col md:flex-row">
                        <div className="bg-bg-surface2 relative h-64 w-full shrink-0 md:w-64">
                          <img
                            src={product.images?.[0]?.url || WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute left-4 top-4">
                            <Badge className="text-text-primary border-none bg-white/90 px-3 py-1 text-[8px] font-black uppercase tracking-widest backdrop-blur-md">
                              {coreMode ? matrixCollectionId : 'FW26'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-6 flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="text-text-primary text-base font-black uppercase tracking-tight">
                                {product.name}
                              </h4>
                              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                                {product.id} • {product.category}
                              </p>
                              {(() => {
                                const brandName =
                                  activeRetailer?.brand ?? product.brand ?? 'Syntha';
                                const rec = getRecommendedSize({
                                  productId: product.id,
                                  brandName,
                                  category: product.category,
                                });
                                const sizeUpMsg = getSizeUpWarningMessage(
                                  product.id,
                                  brandName,
                                  product.category
                                );
                                return (
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <span className="text-text-secondary text-[9px] font-bold">
                                      Рекомендуемый размер:{' '}
                                      <span className="text-accent-primary uppercase">
                                        {rec.retailerSize ?? rec.size}
                                      </span>
                                    </span>
                                    {sizeUpMsg && (
                                      <span className="text-[9px] font-bold text-amber-600">
                                        · {sizeUpMsg}
                                      </span>
                                    )}
                                    <Link
                                      href={ROUTES.shop.b2bSizeFinder}
                                      className="text-accent-primary text-[9px] font-bold hover:underline"
                                    >
                                      Подбор размера →
                                    </Link>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="text-right">
                              <p className="text-text-primary text-base font-black">
                                {getPriceWithPromotions(
                                  product.id,
                                  getPriceForTier(product.price, priceTier),
                                  priceTier
                                ).toLocaleString('ru-RU')}{' '}
                                ₽
                              </p>
                              <p className="text-accent-primary text-[9px] font-bold uppercase tracking-tight">
                                {PRICE_TIER_LABELS[priceTier]} · прайс-лист
                              </p>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="grid grid-cols-6 gap-2">
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                                const cartItem = b2bCart.find(
                                  (item) =>
                                    item.id === product.id &&
                                    item.selectedSize === size &&
                                    item.deliveryDate === activeDrop
                                );
                                const quantity = cartItem?.quantity || 0;
                                const ats = getATS(product.id, size, activeDrop);
                                const overATS = isOverATS(product.id, size, quantity, activeDrop);
                                return (
                                  <div key={size} className="space-y-2">
                                    <div className="flex items-center justify-between px-2">
                                      <span className="text-text-muted text-[10px] font-black uppercase">
                                        {size}
                                      </span>
                                      <span
                                        className={cn(
                                          'text-[9px] font-bold',
                                          overATS ? 'text-rose-600' : 'text-emerald-600'
                                        )}
                                      >
                                        ATS: {ats}
                                      </span>
                                    </div>
                                    <div className="group relative">
                                      <Input
                                        type="number"
                                        min="0"
                                        value={quantity || ''}
                                        disabled={lineBlock.blocked}
                                        data-testid={
                                          coreMode
                                            ? `shop-b2b-matrix-qty-${product.id}-${size}`
                                            : undefined
                                        }
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          updateB2bOrderItemQuantity(
                                            product.id,
                                            val,
                                            size,
                                            activeDrop
                                          );
                                          persistMatrixLineQty(product, size, val, activeDrop);
                                        }}
                                        className={cn(
                                          'border-border-subtle bg-bg-surface2 text-text-primary focus:ring-accent-primary h-12 rounded-xl text-center font-black transition-all focus:ring-2',
                                          overATS && 'border-rose-300 ring-1 ring-rose-200',
                                          lineBlock.blocked && 'cursor-not-allowed opacity-60'
                                        )}
                                        placeholder="0"
                                      />
                                      {quantity > 0 && (
                                        <button
                                          onClick={() => {
                                            removeB2bOrderItem(product.id, size, activeDrop);
                                            persistMatrixLineQty(product, size, 0, activeDrop);
                                          }}
                                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                      {overATS && (
                                        <p className="mt-0.5 text-[9px] font-bold uppercase text-rose-600">
                                          Недостаточно остатка
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {!coreMode && lineBlock.reasons.length > 0 && (
                            <div
                              className={cn(
                                'mt-4 rounded-lg border px-3 py-2',
                                lineBlock.blocked
                                  ? 'border-rose-200 bg-rose-50'
                                  : 'border-amber-200 bg-amber-50'
                              )}
                            >
                              <p className="text-text-secondary mb-1 text-[9px] font-black uppercase">
                                SparkLayer: правила в реальном времени
                              </p>
                              <ul className="space-y-0.5 text-[9px] font-bold">
                                {lineBlock.reasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                              {lineBlock.blocked && (
                                <p className="mt-1 text-[9px] font-black uppercase text-rose-700">
                                  Строка заблокирована. Уменьшите количество или измените заказ.
                                </p>
                              )}
                            </div>
                          )}
                          <div className="border-border-subtle mt-8 flex items-center justify-between border-t pt-6">
                            <div className="flex gap-3">
                              {coreMode ? (
                                <Badge
                                  variant="outline"
                                  className="border-border-default h-5 rounded-md text-[10px] font-bold uppercase"
                                >
                                  W2 · {matrixCollectionId}
                                </Badge>
                              ) : (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="border-border-default h-5 rounded-md text-[10px] font-bold uppercase"
                                  >
                                    MOQ: {getMoqForProduct(product.id)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-border-default h-5 rounded-md text-[10px] font-bold uppercase"
                                  >
                                    Окно: {activeDrop}
                                  </Badge>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-text-muted text-[10px] font-black uppercase">
                                Итого по дропу:
                              </p>
                              <p className="text-text-primary text-sm font-black">
                                {(
                                  b2bCart
                                    .filter(
                                      (item) =>
                                        item.id === product.id && item.deliveryDate === activeDrop
                                    )
                                    .reduce((sum, item) => sum + item.quantity, 0) *
                                  getPriceWithPromotions(
                                    product.id,
                                    getPriceForTier(product.price, priceTier),
                                    priceTier
                                  )
                                ).toLocaleString('ru-RU')}{' '}
                                ₽
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4">
                {preflightItems.length > 0 && (
                  <Card className="border-accent-primary/30 overflow-hidden rounded-xl border-l-4 border-none bg-white shadow-sm">
                    <div className="p-4">
                      <h3 className="text-text-secondary mb-3 text-[10px] font-black uppercase tracking-widest">
                        SparkLayer: Pre-flight check
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {preflightItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-left',
                              item.status === 'ok' && 'bg-emerald-50 text-emerald-800',
                              item.status === 'warning' && 'bg-amber-50 text-amber-800',
                              item.status === 'error' && 'bg-rose-50 text-rose-800'
                            )}
                          >
                            <span
                              className={cn(
                                'h-2 w-2 shrink-0 rounded-full',
                                item.status === 'ok' && 'bg-emerald-500',
                                item.status === 'warning' && 'bg-amber-500',
                                item.status === 'error' && 'bg-rose-500'
                              )}
                            />
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tight">
                                {item.label}
                              </p>
                              <p className="text-[9px] font-bold opacity-90">{item.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
                <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl">
                  <div className="space-y-4 p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-text-primary text-sm font-black uppercase tracking-tight">
                        Итого по заказу
                      </h3>
                      <Badge className="bg-accent-primary/10 text-accent-primary rounded-full border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                        {b2bCart.length} уникальных позиций
                      </Badge>
                    </div>

                    <div className="space-y-6">
                      {b2bCart.length > 0 ? (
                        Array.from(
                          new Set(
                            b2bCart
                              .map((item) => item.deliveryDate)
                              .filter((d): d is string => typeof d === 'string' && d.length > 0)
                          )
                        ).map((drop) => (
                          <div key={drop} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <Badge className="bg-text-primary rounded-full border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                                {drop.replace('Drop', 'Дроп')}
                              </Badge>
                              <div className="bg-bg-surface2 h-px flex-1" />
                              <p className="text-text-muted text-[10px] font-black uppercase">
                                Подытог:{' '}
                                {b2bCart
                                  .filter((i) => i.deliveryDate === drop)
                                  .reduce((sum, i) => sum + i.quantity * i.price, 0)
                                  .toLocaleString('ru-RU')}{' '}
                                ₽
                              </p>
                            </div>
                            <div className="divide-border-subtle divide-y">
                              {b2bCart
                                .filter((i) => i.deliveryDate === drop)
                                .map((item, i) => (
                                  <div
                                    key={`${item.id}-${item.selectedSize}`}
                                    className="group flex items-center justify-between py-6"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-bg-surface2 border-border-subtle h-12 w-12 overflow-hidden rounded-2xl border">
                                        <img
                                          src={
                                            item.images?.[0]?.url ||
                                            WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE
                                          }
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <h4 className="text-text-primary font-black uppercase tracking-tight">
                                          {item.name}
                                        </h4>
                                        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                                          {item.selectedSize} • {item.price.toLocaleString('ru-RU')}{' '}
                                          ₽ / ед.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                      <div>
                                        <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                                          Количество
                                        </p>
                                        <p className="text-text-primary text-sm font-black">
                                          {item.quantity}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                                          Итого
                                        </p>
                                        <p className="text-accent-primary text-sm font-black">
                                          {(item.quantity * item.price).toLocaleString('ru-RU')} ₽
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeB2bOrderItem(
                                            item.id,
                                            item.selectedSize,
                                            item.deliveryDate
                                          )
                                        }
                                        className="h-10 w-10 rounded-xl text-rose-500 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                                      >
                                        <X className="h-5 w-5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-bg-surface2 border-border-default space-y-4 rounded-xl border border-dashed py-10 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                            <ShoppingBag className="text-text-muted h-8 w-8" />
                          </div>
                          <p className="text-text-muted text-[10px] font-black uppercase italic tracking-widest">
                            Ваша корзина пуста...
                          </p>
                        </div>
                      )}
                    </div>

                    {b2bCart.length > 0 && (
                      <>
                        {creditWarning && (
                          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-tight text-amber-900">
                                SparkLayer: превышение кредитного лимита
                              </p>
                              <p className="text-[9px] font-bold text-amber-700">
                                Сумма заказа {totalsByTier.amount.toLocaleString('ru-RU')} ₽
                                превышает доступный лимит (
                                {(credit.available / 1_000_000).toFixed(1)} млн ₽). Уменьшите
                                количество или свяжитесь с брендом.
                              </p>
                            </div>
                          </div>
                        )}
                        {creditBlocked && (
                          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                            <p className="text-[10px] font-black uppercase text-rose-900">
                              Кредитный лимит исчерпан. Отправка заказа недоступна.
                            </p>
                          </div>
                        )}
                        <div className="border-border-subtle flex items-end justify-between border-t pt-10">
                          <div className="space-y-4">
                            <label className="flex cursor-pointer items-center gap-3">
                              <input
                                type="checkbox"
                                checked={tryBeforeBuy}
                                onChange={(e) => setTryBeforeBuy(e.target.checked)}
                                className="border-border-default text-accent-primary h-4 w-4 rounded"
                              />
                              <span className="text-text-primary text-[10px] font-black uppercase tracking-widest">
                                Часть заказа — сэмплы на примерку (Try Before Buy)
                              </span>
                            </label>
                            <p className="text-text-secondary text-[9px]">
                              Ценовой уровень: <strong>{PRICE_TIER_LABELS[priceTier]}</strong>.
                              Кредитный лимит: {(credit.available / 1_000_000).toFixed(1)} млн ₽
                              доступно.
                            </p>
                            {tryBeforeBuy && (
                              <p className="text-accent-primary max-w-sm text-[9px]">
                                Оплата после примерки.{' '}
                                <Link href={ROUTES.client.tryBeforeYouBuy} className="underline">
                                  Подробнее
                                </Link>
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <FileCheck className="h-3 w-3" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                Условия и положения приняты
                              </span>
                            </div>
                            <p className="text-text-muted max-w-sm text-[9px] font-medium uppercase tracking-widest">
                              Подтверждая заказ, вы соглашаетесь с договором оптовой закупки и
                              графиком поставок.
                            </p>
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="text-text-muted flex items-center justify-end gap-3">
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Общий итог ({totalsByTier.units} ед.)
                              </span>
                            </div>
                            <h4 className="text-text-primary text-sm font-black tracking-tighter">
                              {totalsByTier.amount.toLocaleString('ru-RU')} ₽
                            </h4>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
