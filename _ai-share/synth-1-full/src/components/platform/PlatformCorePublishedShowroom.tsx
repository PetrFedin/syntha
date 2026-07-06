'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, FileText } from 'lucide-react';
import {
  ROUTES,
  brandMessagesWorkshop2ArticleContextHref,
  shopB2bCheckoutCollectionHref,
  shopB2bOrdersCollectionRegistryHref,
  shopMessagesWorkshop2ArticleContextHref,
} from '@/lib/platform-core-routes';
import {
  getPlatformCoreCollectionLabel,
  PLATFORM_CORE_COLLECTION_PRESETS,
} from '@/lib/platform-core-hub-matrix';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE } from '@/lib/platform-core-ports/b2b/workshop2-b2b-matrix-catalog';
import { ShowroomArticleEligibleBadge } from '@/components/integrations/ShowroomArticleEligibleBadge';
import { ShowroomArticlePxmMediaBadge } from '@/components/integrations/ShowroomArticlePxmMediaBadge';
import { ShopArticleInventoryBadges } from '@/components/integrations/ShopArticleInventoryBadges';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { useB2BState } from '@/providers/b2b-state';
import type { CartItem } from '@/lib/types';
import { upsertWorkshop2CartLine } from '@/lib/platform-core-ports/b2b/workshop2-cart-bridge';
import {
  SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU,
  SHOP_SHOWROOM_AUTO_INGEST_API_PATH,
} from '@/lib/platform-core-ports/brand-linesheet-syndication';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { PlatformCorePublishedCountSyncBadge } from '@/components/platform/PlatformCorePublishedCountSyncBadge';
import { ShopScCabinetGoldenPathStrip } from '@/components/platform/ShopScCabinetGoldenPathStrip';
import {
  ShopShowroomCoverHeroPriorityStrip,
  ShopShowroomCoverHeroStrip,
  ShopShowroomInlineQtyControl,
  ShopShowroomPartnerLogoSourceBadge,
} from '@/components/platform/showroom';
import { resolveShopShowroomCoverHero } from '@/lib/platform-core-ports/b2b/shop-showroom-cover-hero';
import {
  SHOP_SHOWROOM_ELIGIBLE_FILTER_EMPTY_RU,
  SHOP_SHOWROOM_ELIGIBLE_FILTER_HINT_RU,
  shopShowroomMatrixHrefWithCarry,
} from '@/lib/platform-core-ports/b2b/shop-showroom-eligible-for-matrix';
import {
  buildShopShowroomEligibleFilterApiUrl,
  SHOP_SHOWROOM_ELIGIBLE_FILTER_COUNTS_TESTID,
  shopShowroomEligibleFilterHintVisible,
  shopShowroomEligibleFilterToggleLabel,
  shouldShowShopShowroomCoverHeroPriorityStrip,
} from '@/lib/platform-core-ports/b2b/shop-showroom-wave-xh';
import { useShopB2bPartnerships } from '@/hooks/use-shop-b2b-partnerships';
import { useWorkshop2PublishedArticleCount } from '@/hooks/use-workshop2-published-article-count';
import { BrandScCabinetGoldenPathStrip } from '@/components/brand/sample/BrandScCabinetGoldenPathStrip';
import { BrandScCrossMatrixOpenShopStrip } from '@/components/platform/BrandScCrossMatrixOpenShopStrip';
import { PlatformCorePublishedArticlesReadPathBadge } from '@/components/platform/PlatformCorePublishedArticlesReadPathBadge';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { cn } from '@/lib/utils';
import {
  parseShopShowroomInlineSize,
  type ShopShowroomInlineSize,
} from '@/lib/platform-core-ports/b2b/shop-showroom-inline-qty';

function cartUnitsForArticle(cart: CartItem[], articleId: string): number {
  return cart
    .filter((item) => {
      const ext = item as CartItem & { articleId?: string };
      const id = item.id?.trim() ?? '';
      return id === articleId || ext.articleId?.trim() === articleId;
    })
    .reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

function shopShowroomMatrixHref(
  collectionId: string,
  articleId: string,
  opts?: { carryQty?: number; carrySize?: string }
): string {
  return shopShowroomMatrixHrefWithCarry(collectionId, articleId, opts);
}

export type PublishedShowroomArticle = {
  collectionId: string;
  articleId: string;
  name: string;
  wholesalePriceRub: number;
  moq?: number;
  heroImageUrl?: string;
  sku?: string;
  pxmSource?: boolean;
  pxmAssetCount?: number;
};

type Props = {
  variant: 'brand' | 'shop';
  collectionId: string;
  /** Wave XA: deep-link from partners catalog with eligibleOnly=1 */
  initialEligibleFilterActive?: boolean;
};

export function PlatformCorePublishedShowroom({
  variant,
  collectionId,
  initialEligibleFilterActive = false,
}: Props) {
  const slimChrome = isPlatformCoreMode();
  const router = useRouter();
  const { buyerId } = useShopCoreBuyerId();
  const { b2bCart, setB2bCart } = useB2BState();
  const [publishedArticles, setPublishedArticles] = useState<PublishedShowroomArticle[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [eligibleFilterActive, setEligibleFilterActive] = useState(initialEligibleFilterActive);
  const [eligibleArticleIds, setEligibleArticleIds] = useState<Set<string> | null>(null);
  const [eligibleFilterHintRu, setEligibleFilterHintRu] = useState<string | null>(null);
  const [eligibleCounts, setEligibleCounts] = useState<{
    published: number;
    eligible: number;
  } | null>(null);
  const [eligibleFilterLoading, setEligibleFilterLoading] = useState(false);
  const { partnerships, source: partnersSource } = useShopB2bPartnerships({
    enabled: variant === 'shop',
    collectionId,
  });
  const partner = partnerships.find((p) => p.status === 'connected') ?? partnerships[0] ?? null;
  const [autoIngestNotice, setAutoIngestNotice] = useState<string | null>(null);
  const [syndicationNotificationTitle, setSyndicationNotificationTitle] = useState<string | null>(
    null
  );
  const { count: livePublishedCount, loading: liveCountLoading } =
    useWorkshop2PublishedArticleCount(collectionId);
  const cartQtyByArticle = useMemo(() => {
    if (variant !== 'shop') return new Map<string, number>();
    return new Map(
      publishedArticles.map((article) => [
        article.articleId,
        cartUnitsForArticle(b2bCart, article.articleId),
      ])
    );
  }, [b2bCart, publishedArticles, variant]);

  const setShopCartQty = useCallback(
    (article: PublishedShowroomArticle, qty: number, size: ShopShowroomInlineSize = 'M') => {
      setB2bCart((prev) => {
        const idx = prev.findIndex(
          (item) => item.id === article.articleId && item.selectedSize === size
        );
        const cartItem: CartItem = {
          id: article.articleId,
          slug: article.articleId,
          name: article.name,
          brand: article.collectionId,
          price: article.wholesalePriceRub,
          description: article.name,
          category: 'apparel',
          sustainability: [],
          sku: article.articleId,
          color: '',
          season: article.collectionId,
          quantity: qty,
          selectedSize: size,
          images: article.heroImageUrl
            ? [
                {
                  id: `${article.articleId}-hero`,
                  url: article.heroImageUrl,
                  alt: article.name,
                  hint: '',
                },
              ]
            : [],
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: qty };
          return next;
        }
        return [...prev, cartItem];
      });
    },
    [setB2bCart]
  );

  const shopCollectionCoverHero = useMemo(() => {
    if (variant !== 'shop') return null;
    const dossierHero = publishedArticles.find((a) => a.heroImageUrl?.trim())?.heroImageUrl;
    return resolveShopShowroomCoverHero({
      dossierHeroUrl: dossierHero,
      partnerCoverUrl: partner?.coverImage,
      partnerLogoUrl: partner?.logo,
    });
  }, [publishedArticles, partner?.coverImage, partner?.logo, variant]);

  const visibleArticles = useMemo(() => {
    if (variant !== 'shop' || !eligibleFilterActive || !eligibleArticleIds) {
      return publishedArticles;
    }
    return publishedArticles.filter((article) => eligibleArticleIds.has(article.articleId));
  }, [eligibleArticleIds, eligibleFilterActive, publishedArticles, variant]);

  useEffect(() => {
    if (initialEligibleFilterActive) {
      setEligibleFilterActive(true);
    }
  }, [initialEligibleFilterActive]);

  useEffect(() => {
    if (variant !== 'shop' || !collectionId?.trim()) {
      setEligibleArticleIds(null);
      setEligibleFilterHintRu(null);
      return;
    }
    let cancelled = false;
    setEligibleFilterLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          buildShopShowroomEligibleFilterApiUrl(collectionId, buyerId, {
            eligibleOnly: eligibleFilterActive,
          }),
          { cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string; eligibleForMatrix?: boolean }>;
          eligibleCount?: number;
          publishedCount?: number;
          messageRu?: string;
        };
        if (cancelled) return;
        if (!res.ok || !json.ok || !Array.isArray(json.articles)) {
          setEligibleArticleIds(null);
          setEligibleCounts(null);
          return;
        }
        const ids = new Set(
          json.articles
            .filter((row) => row.eligibleForMatrix === true)
            .map((row) => row.articleId?.trim())
            .filter(Boolean) as string[]
        );
        setEligibleArticleIds(ids);
        setEligibleCounts({
          published: json.publishedCount ?? json.articles.length,
          eligible: json.eligibleCount ?? ids.size,
        });
        setEligibleFilterHintRu(json.messageRu ?? SHOP_SHOWROOM_ELIGIBLE_FILTER_HINT_RU);
      } catch {
        if (!cancelled) {
          setEligibleArticleIds(null);
          setEligibleCounts(null);
        }
      } finally {
        if (!cancelled) setEligibleFilterLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buyerId, collectionId, eligibleFilterActive, variant]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: PublishedShowroomArticle[];
        };
        if (cancelled) return;
        if (json.ok && Array.isArray(json.articles)) {
          setPublishedArticles(json.articles);
          setLoadState('ready');
        } else {
          setPublishedArticles([]);
          setLoadState('error');
        }
      } catch {
        if (!cancelled) {
          setPublishedArticles([]);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  useEffect(() => {
    return load();
  }, [load]);

  useEffect(() => {
    if (variant !== 'shop' || !slimChrome || !collectionId.trim()) return;
    let cancelled = false;
    void (async () => {
      try {
        const [ingestRes, ntfRes] = await Promise.all([
          fetch(
            `${SHOP_SHOWROOM_AUTO_INGEST_API_PATH}?collection=${encodeURIComponent(collectionId)}&buyerId=${encodeURIComponent(buyerId)}`,
            { cache: 'no-store' }
          ),
          fetch(`/api/platform-core/notification-events?role=shop&limit=8`, { cache: 'no-store' }),
        ]);
        if (cancelled) return;
        const ingestJson = (await ingestRes.json()) as { journal?: unknown[]; messageRu?: string };
        if (Array.isArray(ingestJson.journal) && ingestJson.journal.length > 0) {
          setAutoIngestNotice(ingestJson.messageRu ?? SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU);
        }
        const ntfJson = (await ntfRes.json()) as {
          events?: Array<{ titleRu?: string; collectionId?: string }>;
        };
        const syndicationEvent = ntfJson.events?.find(
          (e) =>
            e.collectionId === collectionId &&
            (e.titleRu?.includes('Лайншит') || e.titleRu?.includes('syndication'))
        );
        if (syndicationEvent?.titleRu) setSyndicationNotificationTitle(syndicationEvent.titleRu);
      } catch {
        /* best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buyerId, collectionId, slimChrome, variant]);

  const collectionHref = (id: string) =>
    variant === 'shop'
      ? `${ROUTES.shop.b2bShowroom}?collection=${id}`
      : `${ROUTES.brand.showroom}?collection=${id}`;

  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`);
  const linesheetHref = `/brand/linesheets?collection=${encodeURIComponent(collectionId)}`;
  const brandShowroomHref = platformCoreUiHref(`${ROUTES.brand.showroom}?collection=${encodeURIComponent(collectionId)}`);
  const shopShowroomHref = platformCoreUiHref(`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`);
  const sectionPrefix = variant === 'shop' ? 'shop-sc-showroom' : 'brand-sc-showroom';
  const panelTestId = `${sectionPrefix}-panel`;
  const missingCollection = !collectionId?.trim();

  return (
    <div
      className="space-y-4"
      data-testid={panelTestId}
      data-audit-legacy={`${variant}-showroom-core`}
    >
      {variant === 'shop' && missingCollection ? (
        <Card
          className="border-border-subtle bg-bg-surface2/80"
          data-testid="shop-sc-showroom-no-collection-banner"
        >
          <CardContent className="text-text-secondary py-3 text-[11px]">
            Нужен параметр <code className="text-[10px]">collection</code>.
            <Link
              href={platformCoreUiHref(`${ROUTES.shop.b2bShowroom}?collection=SS27`)}
              className="text-accent-primary ml-2 font-medium hover:underline"
            >
              SS27
            </Link>
          </CardContent>
        </Card>
      ) : null}
      {variant === 'shop' && loadState !== 'loading' ? (
        <div
          className={cn(hubGadget.goldenPath, 'items-center')}
          data-testid="shop-sc-showroom-context-strip"
        >
          <Badge
            variant="outline"
            className={hubGadget.chip}
            data-testid="shop-sc-showroom-mode-label"
          >
            Витрина
          </Badge>
          <ShopScCabinetGoldenPathStrip collectionId={collectionId} omitStep="showroom" />
          {slimChrome
            ? PLATFORM_CORE_COLLECTION_PRESETS.filter((p) => p.available).map((preset) => (
                <Link
                  key={preset.id}
                  href={collectionHref(preset.id)}
                  className={
                    collectionId === preset.id
                      ? 'text-accent-primary text-[10px] font-semibold'
                      : 'text-text-muted text-[10px] font-medium hover:underline'
                  }
                  data-testid={`shop-sc-showroom-season-${preset.id}`}
                >
                  {preset.label}
                </Link>
              ))
            : null}
          <PlatformCorePublishedCountSyncBadge
            liveCount={livePublishedCount}
            referenceCount={publishedArticles.length}
            loading={liveCountLoading}
            testId="shop-sc-showroom-published-sync"
          />
        </div>
      ) : null}
      {variant === 'shop' && slimChrome && (autoIngestNotice || syndicationNotificationTitle) ? (
        <div className="border-border-subtle bg-bg-surface2/50 space-y-1 rounded-lg border px-3 py-2">
          {autoIngestNotice ? (
            <p
              className="text-text-secondary text-[10px] leading-snug"
              data-testid="shop-sc-showroom-auto-ingest-notice"
            >
              {autoIngestNotice}
            </p>
          ) : null}
          {syndicationNotificationTitle ? (
            <p
              className="text-text-muted text-[10px] font-medium"
              data-testid="shop-sc-showroom-syndication-notification"
            >
              PG · {syndicationNotificationTitle}
            </p>
          ) : null}
        </div>
      ) : null}
      {variant === 'shop' && slimChrome && shopCollectionCoverHero ? (
        <div className="space-y-2">
          <ShopShowroomCoverHeroStrip
            hero={shopCollectionCoverHero}
            testId="shop-sc-showroom-cover-hero"
            heightClass="h-12 md:h-20"
          />
          <ShopShowroomPartnerLogoSourceBadge
            partnerName={partner?.name}
            partnerLogoUrl={partner?.logo}
            partnersSource={partnersSource ?? undefined}
            dossierHeroUsed={shopCollectionCoverHero.source === 'dossier'}
            coverHeroSource={shopCollectionCoverHero.source}
          />
          {shouldShowShopShowroomCoverHeroPriorityStrip(shopCollectionCoverHero.source) ? (
            <ShopShowroomCoverHeroPriorityStrip activeSource={shopCollectionCoverHero.source} />
          ) : null}
        </div>
      ) : null}
      {variant === 'shop' && loadState === 'ready' ? (
        <div
          className={cn(hubGadget.goldenPath, 'items-center')}
          data-testid="shop-sc-showroom-eligible-filter-strip"
        >
          <Button
            type="button"
            size="sm"
            variant={eligibleFilterActive ? 'default' : 'outline'}
            className="h-7 text-[10px] font-semibold"
            data-testid="shop-sc-showroom-eligible-filter-toggle"
            aria-pressed={eligibleFilterActive}
            onClick={() => setEligibleFilterActive((prev) => !prev)}
          >
            {shopShowroomEligibleFilterToggleLabel({
              published: eligibleCounts?.published,
              eligible: eligibleCounts?.eligible ?? eligibleArticleIds?.size,
              filterActive: eligibleFilterActive,
            })}
          </Button>
          {eligibleCounts ? (
            <span
              className="text-text-muted text-[10px] tabular-nums"
              data-testid={SHOP_SHOWROOM_ELIGIBLE_FILTER_COUNTS_TESTID}
            >
              {eligibleCounts.eligible}/{eligibleCounts.published} eligible
            </span>
          ) : null}
          {eligibleFilterLoading ? (
            <span
              className="text-text-muted text-[10px]"
              data-testid="shop-sc-showroom-eligible-filter-loading"
            >
              Загрузка eligible…
            </span>
          ) : null}
          {eligibleFilterHintRu && shopShowroomEligibleFilterHintVisible(eligibleFilterActive) ? (
            <span
              className="text-text-muted text-[10px]"
              data-testid="shop-sc-showroom-eligible-filter-hint"
            >
              {eligibleFilterHintRu}
            </span>
          ) : null}
        </div>
      ) : null}
      {variant === 'brand' && loadState !== 'loading' ? (
        <div
          className={cn(hubGadget.goldenPath, 'items-center')}
          data-testid="brand-sc-unified-audit-path"
          data-audit-legacy="brand-sc-showroom-context-strip"
        >
          <Badge
            variant="outline"
            className={hubGadget.chip}
            data-testid="brand-sc-showroom-mode-label"
          >
            Витрина
          </Badge>
          <BrandScCabinetGoldenPathStrip
            collectionId={collectionId}
            omitStep="showroom"
            omitMatrixPrefillCta={publishedArticles.length > 0}
          />
          {slimChrome
            ? PLATFORM_CORE_COLLECTION_PRESETS.filter((p) => p.available).map((preset) => (
                <Link
                  key={preset.id}
                  href={collectionHref(preset.id)}
                  className={
                    collectionId === preset.id
                      ? 'text-accent-primary text-[10px] font-semibold'
                      : 'text-text-muted text-[10px] font-medium hover:underline'
                  }
                  data-testid={`brand-sc-showroom-season-${preset.id}`}
                >
                  {preset.label}
                </Link>
              ))
            : null}
          <PlatformCorePublishedCountSyncBadge
            liveCount={livePublishedCount}
            referenceCount={publishedArticles.length}
            loading={liveCountLoading}
            testId="brand-sc-showroom-published-sync"
            compact
          />
        </div>
      ) : null}
      {variant === 'brand' && slimChrome ? (
        <div className="flex flex-wrap items-center gap-2">
          {publishedArticles.length > 0 ? (
            <BrandScCrossMatrixOpenShopStrip
              collectionId={collectionId}
              articleIds={publishedArticles.map((article) => article.articleId)}
              variant="btn-only"
            />
          ) : null}
          <PlatformCorePublishedArticlesReadPathBadge collectionId={collectionId} />
        </div>
      ) : null}
      {!slimChrome ? (
        <Card
          className="mb-2"
          data-testid={`${sectionPrefix}-collection-chip`}
          data-audit-legacy={`${variant}-showroom-core-collection`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {getPlatformCoreCollectionLabel(collectionId)}
            </CardTitle>
            <CardDescription className="text-text-muted text-[11px]">
              Опубликованные артикулы коллекции.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PLATFORM_CORE_COLLECTION_PRESETS.filter((p) => p.available).map((preset) => (
              <Button
                key={preset.id}
                variant={collectionId === preset.id ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg text-[10px] font-semibold"
                asChild
              >
                <Link href={collectionHref(preset.id)}>{preset.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {loadState === 'loading' ? (
        <p
          className="text-text-secondary text-center text-sm"
          data-testid={`${sectionPrefix}-loading`}
        >
          Загрузка витрины…
        </p>
      ) : null}
      {loadState === 'error' ? (
        <Card
          className="p-8 text-center"
          data-testid={`${sectionPrefix}-error`}
          data-audit-legacy={`${variant}-showroom-core-error`}
        >
          <p className="text-text-secondary text-sm">
            Витрина коллекции пока пуста или ещё не опубликована брендом.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            data-testid={`${sectionPrefix}-retry`}
            onClick={() => {
              load();
            }}
          >
            Повторить
          </Button>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleArticles.map((article) => (
          <Card
            key={`${article.collectionId}:${article.articleId}`}
            data-testid={`${sectionPrefix}-article-${article.articleId}`}
            data-audit-legacy={`${variant}-showroom-article-${article.articleId}`}
            className="border-border-subtle overflow-hidden"
          >
            <div className="bg-bg-surface2 relative aspect-[4/3] w-full">
              <Image
                src={article.heroImageUrl?.trim() || WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE}
                alt={article.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-testid={`${sectionPrefix}-hero-${article.articleId}`}
                data-audit-legacy={`${variant}-showroom-hero-${article.articleId}`}
                unoptimized={Boolean(article.heroImageUrl?.startsWith('data:'))}
              />
            </div>
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[9px] font-semibold">
                  {article.articleId}
                </Badge>
                <ShowroomArticleEligibleBadge
                  collectionId={article.collectionId}
                  articleId={article.articleId}
                  variant={variant}
                />
                <ShowroomArticlePxmMediaBadge
                  pxmSource={article.pxmSource}
                  pxmAssetCount={article.pxmAssetCount}
                />
                {variant === 'shop' && article.sku ? (
                  <ShopArticleInventoryBadges sku={article.sku} />
                ) : null}
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">
                {article.name}
              </CardTitle>
              <CardDescription>
                Опт {article.wholesalePriceRub.toLocaleString('ru-RU')} ₽
                {article.moq ? (
                  <span
                    data-testid={`shop-sc-showroom-moq-${article.articleId}`}
                    data-audit-legacy={`shop-showroom-moq-${article.articleId}`}
                  >
                    {` · мин. заказ ${article.moq} шт.`}
                  </span>
                ) : null}
                {variant === 'shop' && (cartQtyByArticle.get(article.articleId) ?? 0) > 0 ? (
                  <span
                    className="text-accent-primary font-semibold"
                    data-testid={`shop-sc-showroom-cart-qty-${article.articleId}`}
                    data-audit-legacy={`shop-showroom-cart-qty-${article.articleId}`}
                  >
                    {` · в корзине ${cartQtyByArticle.get(article.articleId)} ед.`}
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4 pt-0">
              {variant === 'shop' ? (
                <ShopShowroomInlineQtyControl
                  article={article}
                  buyerId={buyerId}
                  cartQty={cartQtyByArticle.get(article.articleId) ?? 0}
                  buildMatrixHref={(qty, size) =>
                    shopShowroomMatrixHref(article.collectionId, article.articleId, {
                      carryQty: qty,
                      carrySize: size,
                    })
                  }
                  onCartQtyChange={(qty, size) => setShopCartQty(article, qty, size)}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                {variant === 'shop' ? (
                  <>
                    <Button
                      size="sm"
                      className="min-h-11 rounded-lg text-[10px] font-black"
                      data-testid={`shop-sc-showroom-matrix-quick-add-${article.articleId}`}
                      data-audit-legacy={`shop-sc-showroom-matrix-quick-add-${article.articleId} shop-sc-matrix-entry-link-${article.articleId} shop-sc-showroom-matrix-link-${article.articleId}`}
                      onClick={() => {
                        const existingQty = cartQtyByArticle.get(article.articleId) ?? 0;
                        const qty = existingQty > 0 ? existingQty : Math.max(1, article.moq ?? 1);
                        const selectedSize = parseShopShowroomInlineSize('M');
                        const matrixHref = shopShowroomMatrixHref(
                          article.collectionId,
                          article.articleId,
                          existingQty > 0
                            ? { carryQty: existingQty, carrySize: selectedSize }
                            : { carryQty: qty, carrySize: selectedSize }
                        );
                        if (existingQty > 0) {
                          router.push(matrixHref);
                          return;
                        }
                        const cartItem = {
                          id: article.articleId,
                          slug: article.articleId,
                          name: article.name,
                          brand: article.collectionId,
                          price: article.wholesalePriceRub,
                          description: article.name,
                          category: 'apparel',
                          sustainability: [],
                          sku: article.articleId,
                          color: '',
                          season: article.collectionId,
                          quantity: qty,
                          selectedSize,
                          images: article.heroImageUrl
                            ? [
                                {
                                  id: `${article.articleId}-hero`,
                                  url: article.heroImageUrl,
                                  alt: article.name,
                                  hint: '',
                                },
                              ]
                            : [],
                        } satisfies CartItem;
                        setB2bCart((prev) => {
                          const idx = prev.findIndex(
                            (item) =>
                              item.id === article.articleId && item.selectedSize === selectedSize
                          );
                          if (idx >= 0) {
                            const next = [...prev];
                            next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
                            return next;
                          }
                          return [...prev, cartItem];
                        });
                        void upsertWorkshop2CartLine({
                          item: cartItem,
                          collectionId: article.collectionId,
                          buyerId,
                        }).finally(() => {
                          router.push(matrixHref);
                        });
                      }}
                    >
                      <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> + в матрицу
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11 rounded-lg text-[10px] font-black"
                      asChild
                    >
                      <Link
                        href={shopB2bOrdersCollectionRegistryHref()}
                        data-testid={`shop-sc-showroom-orders-link-${article.articleId}`}
                      >
                        Оптовые заказы
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11 rounded-lg text-[10px] font-black"
                      asChild
                    >
                      <Link
                        href={shopMessagesWorkshop2ArticleContextHref(
                          article.collectionId,
                          article.articleId
                        )}
                        data-testid={`shop-sc-showroom-article-chat-link-${article.articleId}`}
                        data-audit-legacy={`shop-showroom-article-chat-link-${article.articleId}`}
                      >
                        Вопрос по артикулу
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="min-h-11 rounded-lg text-[10px] font-black"
                      asChild
                    >
                      <Link href={`/brand/linesheets?collection=${article.collectionId}`}>
                        <FileText className="mr-1.5 h-3.5 w-3.5" /> Лайншит
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-[10px] font-black"
                      asChild
                    >
                      <Link
                        href={platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(article.collectionId)}`)}
                        data-testid={`brand-sc-showroom-matrix-link-${article.articleId}`}
                        data-audit-legacy={`brand-showroom-matrix-link-${article.articleId}`}
                      >
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Матрица магазина
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-[10px] font-black"
                      asChild
                    >
                      <Link
                        href={brandMessagesWorkshop2ArticleContextHref(
                          article.collectionId,
                          article.articleId
                        )}
                        data-testid={`brand-sc-showroom-article-chat-link-${article.articleId}`}
                        data-audit-legacy={`brand-showroom-article-chat-link-${article.articleId}`}
                      >
                        Чат артикула
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loadState === 'ready' &&
      variant === 'shop' &&
      eligibleFilterActive &&
      publishedArticles.length > 0 &&
      visibleArticles.length === 0 ? (
        <Card className="p-6 text-center" data-testid="shop-sc-showroom-eligible-filter-empty">
          <p className="text-text-secondary text-sm">{SHOP_SHOWROOM_ELIGIBLE_FILTER_EMPTY_RU}</p>
        </Card>
      ) : null}

      {loadState === 'ready' && publishedArticles.length === 0 ? (
        <Card
          className="p-8 text-center"
          data-testid={`${sectionPrefix}-empty-state`}
          data-audit-legacy={`${variant}-showroom-empty-state`}
        >
          {variant === 'shop' ? (
            <div
              className="mx-auto max-w-md space-y-3 text-left"
              data-testid="shop-sc-showroom-empty-onboarding"
            >
              <p className="text-text-primary text-sm font-medium">
                Коллекция {getPlatformCoreCollectionLabel(collectionId)} пока не открыта
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                Артикулы появятся после публикации брендом. Пока можно подключить партнёра или
                перейти в матрицу другой коллекции — без ручного seed.
              </p>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button
                  asChild
                  size="sm"
                  className="min-h-11 w-full text-[10px] font-bold uppercase sm:w-auto"
                >
                  <Link
                    href={ROUTES.shop.b2bPartnersDiscover}
                    data-testid="shop-sc-showroom-empty-partners-link"
                  >
                    Каталог партнёров
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full text-[10px] font-bold uppercase sm:w-auto"
                >
                  <Link
                    href={platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=SS27`)}
                    data-testid="shop-sc-showroom-empty-matrix-link"
                  >
                    Матрица SS27
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full text-[10px] font-bold uppercase sm:w-auto"
                >
                  <Link
                    href={platformCoreUiHref(`${ROUTES.shop.b2bShowroom}?collection=SS27`)}
                    data-testid="shop-sc-showroom-empty-showroom-link"
                  >
                    Витрина SS27
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">
              Нет опубликованных артикулов для {getPlatformCoreCollectionLabel(collectionId)}.
            </p>
          )}
        </Card>
      ) : null}

      {!isPlatformCoreMode() ? (
        <div className="flex flex-wrap gap-2" data-testid={`${sectionPrefix}-footer-cta`}>
          <Button variant="outline" size="sm" asChild>
            <Link
              href={platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${collectionId}`)}
              data-testid={`${sectionPrefix}-footer-matrix-link`}
            >
              {variant === 'shop' ? 'Матрица' : 'Матрица магазина'}
            </Link>
          </Button>
          {variant === 'shop' ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={shopB2bCheckoutCollectionHref(collectionId)}
                data-testid="shop-sc-showroom-footer-checkout-link"
              >
                Оформление
              </Link>
            </Button>
          ) : null}
          {variant === 'brand' ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/brand/linesheets?collection=${collectionId}`}
                data-testid="brand-sc-showroom-footer-linesheets-link"
              >
                Лайншиты
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
