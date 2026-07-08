'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/platform-core-routes';
import { useShopB2bPartnerships } from '@/hooks/use-shop-b2b-partnerships';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE } from '@/lib/platform-core-ports/b2b/workshop2-b2b-matrix-catalog';
import { resolveShopShowroomCoverHero } from '@/lib/platform-core-ports/b2b/shop-showroom-cover-hero';
import {
  B2b3dStreamPanelLazy,
  ShopScEmpty27OnboardingStrip,
  ShopShowroomCoverHeroPriorityStrip,
  ShopShowroomCoverHeroStrip,
  ShopShowroomInlineQtyControl,
  ShopShowroomPartnerLogoSourceBadge,
} from '@/components/platform/showroom';
import { shouldShowShopShowroomCoverHeroPriorityStrip } from '@/lib/platform-core-ports/b2b/shop-showroom-wave-xh';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShowroomArticleEligibleBadge } from '@/components/integrations/ShowroomArticleEligibleBadge';
import { ShopProductInventoryBadges } from '@/components/integrations/ShopProductInventoryBadges';
import { useMatrixIntegrationInventory } from '@/hooks/use-matrix-integration-inventory';
import { useWorkshop2PublishedArticleCount } from '@/hooks/use-workshop2-published-article-count';
import { PlatformCorePublishedCountSyncBadge } from '@/components/platform/PlatformCorePublishedCountSyncBadge';
import { ShopScCabinetGoldenPathStrip } from '@/components/platform/ShopScCabinetGoldenPathStrip';
import { ShopScCabinetB2bPeerStrip } from '@/components/platform/ShopScCabinetB2bPeerStrip';
import { ShopScCabinetFullShowroomHonestStrip } from '@/components/platform/ShopScCabinetFullShowroomHonestStrip';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { usePlatformCoreHubAuditLegacyAttrs } from '@/hooks/use-platform-core-hub-audit-legacy-attrs';
import { shouldShowHubCabinetPublishedCountSyncBadge } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PillarInsightHeader } from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import { PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID } from '@/lib/platform-core-demo-context';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import {
  resolveShopScGoldenPathOmitStep,
  shopScShowroomMatrixQuickAddHref,
  SHOP_SC_SHOWROOM_SECTION,
} from '@/lib/platform-core-sample-collection-section';
export function ShopShowroomMini({
  demo,
  compact = false,
  minimalChrome = false,
  sectionId,
}: {
  demo: PlatformCoreDemoContext;
  compact?: boolean;
  minimalChrome?: boolean;
  sectionId?: string | null;
}) {
  const { collectionId, demoArticleId } = demo;
  const activeSection = sectionId?.trim() ?? '';
  const isShowroomSection = !activeSection || activeSection === SHOP_SC_SHOWROOM_SECTION;
  const goldenOmitStep = resolveShopScGoldenPathOmitStep(activeSection);
  const coreMode = isPlatformCoreMode();
  const auditUi = usePlatformCoreAuditUi();
  const auditLegacy = usePlatformCoreHubAuditLegacyAttrs();
  const { buyerId } = useShopCoreBuyerId();
  const [sampleBusy, setSampleBusy] = useState(false);
  const [sampleHint, setSampleHint] = useState<string | null>(null);
  const {
    partnerships,
    source: partnersSource,
    loadState: partnersLoadState,
  } = useShopB2bPartnerships({
    enabled: true,
    collectionId,
  });
  const partner = partnerships.find((p) => p.status === 'connected') ?? partnerships[0] ?? null;
  const [publishedCount, setPublishedCount] = useState<number | null>(null);
  const [publishedLoadState, setPublishedLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [publishedReloadNonce, setPublishedReloadNonce] = useState(0);
  const { count: livePublishedCount, loading: liveCountLoading } =
    useWorkshop2PublishedArticleCount(collectionId);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [spotlightArticle, setSpotlightArticle] = useState<{
    collectionId: string;
    articleId: string;
    name: string;
    wholesalePriceRub: number;
    moq?: number;
    heroImageUrl?: string;
  } | null>(null);
  const [spotlightCartQty, setSpotlightCartQty] = useState(0);
  const matrixSku = demoArticleId?.trim() || 'SS27-M-COAT-01';
  const inventorySkus = [matrixSku];
  const { bySku: nuorderBySku } = useMatrixIntegrationInventory('nuorder', inventorySkus);
  const { bySku: joorBySku } = useMatrixIntegrationInventory('joor', inventorySkus);
  const { bySku: zedonkBySku } = useMatrixIntegrationInventory('zedonk', inventorySkus);
  const { bySku: aimsBySku } = useMatrixIntegrationInventory('aims360', inventorySkus);
  const coverHero = resolveShopShowroomCoverHero({
    dossierHeroUrl: heroPreviewUrl,
    partnerCoverUrl: partner?.coverImage,
    partnerLogoUrl: partner?.logo,
    fallbackUrl: WORKSHOP2_B2B_MATRIX_FALLBACK_IMAGE,
  });
  const showroom3dHref = platformCoreUiHref(
    `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=3d-stream`
  );

  useEffect(() => {
    let cancelled = false;
    setPublishedLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: Array<{
            articleId?: string;
            name?: string;
            wholesalePriceRub?: number;
            moq?: number;
            heroImageUrl?: string;
          }>;
        };
        if (cancelled) return;
        if (res.ok && json.ok && Array.isArray(json.articles)) {
          setPublishedCount(json.articles.length);
          const preferred =
            json.articles.find((a) => a.articleId?.trim() === demoArticleId?.trim()) ??
            json.articles[0] ??
            null;
          if (preferred?.articleId?.trim()) {
            setSpotlightArticle({
              collectionId,
              articleId: preferred.articleId.trim(),
              name: preferred.name?.trim() || preferred.articleId.trim(),
              wholesalePriceRub: preferred.wholesalePriceRub ?? 0,
              moq: preferred.moq,
              heroImageUrl: preferred.heroImageUrl?.trim(),
            });
          } else {
            setSpotlightArticle(null);
          }
          const firstHero = json.articles.find((a) => a.heroImageUrl?.trim())?.heroImageUrl?.trim();
          setHeroPreviewUrl(firstHero ?? null);
          setPublishedLoadState('ready');
          return;
        }
        setPublishedCount(null);
        setHeroPreviewUrl(null);
        setSpotlightArticle(null);
        setPublishedLoadState('error');
      } catch {
        if (!cancelled) {
          setPublishedCount(null);
          setHeroPreviewUrl(null);
          setPublishedLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, publishedReloadNonce]);

  const publishedInSync =
    livePublishedCount == null || publishedCount == null
      ? true
      : publishedCount === livePublishedCount;

  return (
    <div
      className={hubGadget.root}
      data-testid="shop-sc-cabinet-panel"
      data-section={activeSection || SHOP_SC_SHOWROOM_SECTION}
      {...auditLegacy('shop-showroom-mini')}
    >
      {!compact || coreMode ? (
        <>
          <ShopScCabinetGoldenPathStrip
            collectionId={collectionId}
            omitStep={goldenOmitStep}
            activeStep={isShowroomSection ? 'matrix' : undefined}
          />
          {coreMode && !minimalChrome ? (
            <ShopScCabinetB2bPeerStrip collectionId={collectionId} omitCheckout />
          ) : null}
        </>
      ) : null}
      {compact && !minimalChrome && auditUi ? (
        <ShopScCabinetFullShowroomHonestStrip collectionId={collectionId} />
      ) : null}
      {coreMode && compact && collectionId === PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID ? (
        <ShopScEmpty27OnboardingStrip buyerId={buyerId} collectionId={collectionId} />
      ) : null}
      <div className={hubGadget.card}>
        {coverHero ? (
          <>
            <ShopShowroomCoverHeroStrip hero={coverHero} testId="shop-sc-cabinet-hero" />
            {shouldShowShopShowroomCoverHeroPriorityStrip(coverHero.source) ? (
              <ShopShowroomCoverHeroPriorityStrip activeSource={coverHero.source} />
            ) : null}
          </>
        ) : null}
        <div className={hubGadget.cardBody}>
          {compact && partnersLoadState === 'loading' ? (
            <PlatformCorePillarInsightSkeleton testId="shop-sc-cabinet-loading" />
          ) : null}
          {compact && partnersLoadState !== 'loading' && !minimalChrome ? (
            <PillarInsightHeader
              icon={ShoppingBag}
              title="Витрина коллекции"
              subtitle="Партнёр-бренд и опубликованные артикулы перед матрицей."
            />
          ) : null}
          {compact && !minimalChrome && coreMode ? (
            <PlatformCorePillarNotificationCenterCompact
              variant="shop"
              compact
              collectionId={collectionId}
              orderId={demo.demoOrderId}
              orderScoped
            />
          ) : null}
          {partner ? (
            <div
              className={hubGadget.statRow}
              data-testid="shop-sc-cabinet-partner"
              {...auditLegacy('shop-showroom-mini-partner')}
            >
              <ShopShowroomPartnerLogoSourceBadge
                partnerName={partner.name}
                partnerLogoUrl={partner.logo}
                partnersSource={partnersSource ?? undefined}
                coverHeroSource={coverHero?.source}
                dossierHeroUsed={coverHero?.source === 'dossier'}
              />
            </div>
          ) : null}
          {publishedLoadState === 'error' ? (
            <div className="space-y-2" data-testid="shop-sc-cabinet-published-error">
              <p className={hubGadget.muted}>
                Витрина недоступна — проверьте публикацию бренда и сеть.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] font-semibold uppercase"
                  data-testid="shop-sc-cabinet-published-retry"
                  onClick={() => setPublishedReloadNonce((n) => n + 1)}
                >
                  Повторить
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-semibold uppercase"
                >
                  <Link
                    href={platformCoreUiHref(
                      `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`
                    )}
                    data-testid="shop-sc-cabinet-published-showroom-link"
                  >
                    Полная витрина →
                  </Link>
                </Button>
              </div>
            </div>
          ) : publishedLoadState === 'loading' ? (
            <p className={hubGadget.muted} data-testid="shop-sc-cabinet-published-loading">
              Загрузка…
            </p>
          ) : publishedCount != null ? (
            publishedCount === 0 ? (
              <p
                className={hubGadget.muted}
                data-testid="shop-sc-cabinet-empty"
                {...auditLegacy('shop-showroom-mini-empty')}
              >
                Витрина пуста.
              </p>
            ) : (
              <div className={hubGadget.statRow}>
                <span className={hubGadget.stat}>
                  <strong>{publishedCount}</strong> арт.
                </span>
                {shouldShowHubCabinetPublishedCountSyncBadge(auditUi, publishedInSync) ? (
                  <PlatformCorePublishedCountSyncBadge
                    liveCount={livePublishedCount}
                    referenceCount={publishedCount}
                    loading={liveCountLoading}
                    testId="shop-sc-cabinet-published-sync"
                    compact
                  />
                ) : null}
              </div>
            )
          ) : (
            <p className={hubGadget.muted}>Нет данных о публикации.</p>
          )}
          {coreMode && spotlightArticle ? (
            <ShopShowroomInlineQtyControl
              article={spotlightArticle}
              buyerId={buyerId}
              cartQty={spotlightCartQty}
              matrixHref={`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(spotlightArticle.articleId)}`}
              onCartQtyChange={setSpotlightCartQty}
            />
          ) : null}
          {coreMode && isShowroomSection && spotlightArticle ? (
            <div className="pt-2">
              <Button
                asChild
                variant="default"
                size="sm"
                className="h-8 w-full text-[10px] font-bold uppercase sm:w-auto"
              >
                <Link
                  href={shopScShowroomMatrixQuickAddHref(
                    collectionId,
                    spotlightArticle.articleId,
                    demo
                  )}
                  data-testid={`shop-sc-showroom-matrix-quick-add-${spotlightArticle.articleId}`}
                  data-audit-legacy={`shop-sc-showroom-matrix-quick-add-${spotlightArticle.articleId} shop-sc-cabinet-matrix-quick-add-cta`}
                >
                  Quick-add → матрица
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <div
        className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-2"
        data-testid="shop-sc-catalog-signals"
      >
        <ShowroomArticleEligibleBadge
          collectionId={collectionId}
          articleId={demoArticleId}
          variant="shop"
        />
        <ShopProductInventoryBadges
          sku={matrixSku}
          variant="showroom"
          nuorderBySku={nuorderBySku}
          joorBySku={joorBySku}
          aimsBySku={aimsBySku}
          zedonkBySku={zedonkBySku}
        />
      </div>
      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px] font-semibold uppercase"
          disabled={sampleBusy || !demoArticleId?.trim()}
          data-testid="shop-sc-sample-request-cta"
          onClick={() => {
            setSampleBusy(true);
            setSampleHint(null);
            void fetch('/api/shop/b2b/sample-request', {
              method: 'POST',
              headers: {
                ...buildWorkshop2ApiRequestHeaders(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                collectionId,
                articleId: demoArticleId,
                buyerId,
              }),
            })
              .then(async (res) => {
                const json = (await res.json()) as { ok?: boolean; messageRu?: string };
                setSampleHint(
                  json.messageRu ??
                    (json.ok ? 'Запрос образца отправлен бренду.' : 'Не удалось отправить запрос.')
                );
              })
              .catch(() => setSampleHint('Сеть недоступна — повторите позже.'))
              .finally(() => setSampleBusy(false));
          }}
        >
          {sampleBusy ? '…' : 'Запрос образца'}
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 text-[10px] font-semibold uppercase"
        >
          <Link href={showroom3dHref} data-testid="shop-sc-3d-stream-cta">
            3D showroom
          </Link>
        </Button>
        {sampleHint ? (
          <span className="text-text-muted text-[10px]" data-testid="shop-sc-sample-request-hint">
            {sampleHint}
          </span>
        ) : null}
      </div>
      {!compact ? (
        <div
          id="shop-sc-3d-showroom"
          className="border-border-subtle border-t pt-3"
          data-testid="shop-sc-cabinet-3d-panel"
        >
          <B2b3dStreamPanelLazy
            collectionId={collectionId}
            articleId={spotlightArticle?.articleId ?? demoArticleId}
          />
        </div>
      ) : compact && coreMode && spotlightArticle ? (
        <div className="border-border-subtle border-t pt-2" data-testid="shop-sc-compact-3d-panel">
          <B2b3dStreamPanelLazy
            collectionId={collectionId}
            articleId={spotlightArticle.articleId}
          />
        </div>
      ) : null}
    </div>
  );
}
