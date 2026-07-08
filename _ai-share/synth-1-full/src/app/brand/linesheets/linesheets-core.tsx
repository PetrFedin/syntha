'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { workshop2CollectionLinesheetPdfHref } from '@/lib/production/workshop2-collection-linesheet-pdf-href';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import {
  PLATFORM_CORE_LINESETS_UNAVAILABLE_RU,
  platformCoreLinesheetEmptyMessageRu,
} from '@/lib/platform-core-user-messages';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreEmptyChainCollection } from '@/lib/platform-core-demo-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { parseOperationalOrderV1DetailResponse } from '@/lib/order/operational-order-dto.schema';
import { mapOperationalItemsToForecastLines } from '@/lib/integrations/spine/spine-production-forecast-lines';
import type { PublishedShowroomArticle } from '@/components/platform/PlatformCorePublishedShowroom';
import { ShowroomArticlePxmMediaBadge } from '@/components/integrations/ShowroomArticlePxmMediaBadge';
import { BrandCentricMediaImportPanel } from '@/components/integrations/BrandCentricMediaImportPanel';
import { BrandLinesheetGenPanel } from '@/components/integrations/BrandLinesheetGenPanel';
import { Workshop2HubShowroomPublishButton } from '@/components/brand/production/Workshop2HubShowroomPublishButton';
import { BrandScPublishAuditLog } from '@/components/brand/sample/BrandScPublishAuditLog';
import { BrandScReleaseGateBlockStrip } from '@/components/brand/sample/BrandScReleaseGateBlockStrip';
import { BrandScCabinetGoldenPathStrip } from '@/components/brand/sample/BrandScCabinetGoldenPathStrip';
import { BrandScLinesheetsRetailPeerStrip } from '@/components/platform/BrandScLinesheetsRetailPeerStrip';
import { BrandScCrossMatrixOpenShopStrip } from '@/components/platform/BrandScCrossMatrixOpenShopStrip';
import { PlatformCorePublishedArticlesReadPathBadge } from '@/components/platform/PlatformCorePublishedArticlesReadPathBadge';
import {
  BRAND_SC_LINESET_PDF_EMPTY_API_TESTID,
  BRAND_SC_LINESET_PDF_EMPTY_DISABLED_TESTID,
  BRAND_SC_LINESET_PDF_EMPTY_HINT_TESTID,
  brandScLinesheetPdfEmptyUiHintRu,
} from '@/lib/b2b/brand-sc-linesheet-readpath';
import { BRAND_SC_SYNDICATION_WD_AUDIT_BADGE_TESTID } from '@/lib/production/brand-sc-syndication-wd';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import { BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH } from '@/lib/production/brand-linesheet-syndication';
import { BrandScLinesheetSyndicationPanel } from '@/components/platform/BrandScLinesheetSyndicationPanel';

function LinesheetUnpublishButton({
  collectionId,
  articleId,
  onDone,
}: {
  collectionId: string;
  articleId: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unpublish() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/showroom`,
        {
          method: 'PUT',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ published: false, updatedBy: 'brand-linesheets-core' }),
        }
      );
      if (!res.ok) {
        setError('Не удалось снять с публикации');
        return;
      }
      onDone();
    } catch {
      setError('Не удалось снять с публикации');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5 max-md:w-full max-md:items-stretch">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          'h-7 text-[9px] font-bold uppercase max-md:min-h-11 max-md:w-full max-md:text-[10px]'
        )}
        disabled={busy}
        data-testid={`brand-sc-linesheets-unpublish-${articleId}`}
        data-audit-legacy={`brand-linesheet-unpublish-${articleId}`}
        onClick={() => void unpublish()}
      >
        {busy ? '…' : 'Снять с витрины'}
      </Button>
      {error ? <span className="text-[9px] text-destructive">{error}</span> : null}
    </div>
  );
}

function LinesheetsPublishedArticlesList({
  collectionId,
  onDataChange,
}: {
  collectionId: string;
  onDataChange?: () => void;
}) {
  const [articles, setArticles] = useState<PublishedShowroomArticle[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [matrixQtyByArticle, setMatrixQtyByArticle] = useState<Record<string, number>>({});
  const demoOrderId = getPlatformCoreDemo(collectionId).demoOrderId;
  const coreMode = isPlatformCoreMode();
  const orderFallback = demoOrderId.startsWith('__') ? '' : demoOrderId;
  const { activeOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: orderFallback,
    resolveFrom: ['allocation', 'operational'],
    actorRole: 'brand',
  });

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
          setArticles(json.articles);
          setLoadState('ready');
        } else {
          setArticles([]);
          setLoadState('error');
        }
      } catch {
        if (!cancelled) {
          setArticles([]);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (!activeOrderId) {
      setMatrixQtyByArticle({});
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        if (isIntegrationImportedWholesaleOrderId(activeOrderId)) {
          const opRes = await fetch(
            `/api/b2b/v1/operational-orders/${encodeURIComponent(activeOrderId)}`,
            {
              headers: { ...b2bV1SynthaActorRoleHeaders('brand') },
              cache: 'no-store',
            }
          );
          const parsed = parseOperationalOrderV1DetailResponse(await opRes.json());
          if (cancelled) return;
          if (!parsed.success) {
            setMatrixQtyByArticle({});
            return;
          }
          const byArticle: Record<string, number> = {};
          for (const line of mapOperationalItemsToForecastLines(
            parsed.data.data.order.items ?? []
          )) {
            byArticle[line.articleId] = (byArticle[line.articleId] ?? 0) + line.qty;
          }
          setMatrixQtyByArticle(byArticle);
          return;
        }

        const res = await fetch(`/api/workshop2/b2b/orders/${encodeURIComponent(activeOrderId)}`, {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        });
        const json = (await res.json()) as {
          ok?: boolean;
          order?: { lines?: Array<{ articleId?: string; qty?: number }> };
        };
        if (cancelled || !json.ok || !json.order?.lines) {
          if (!cancelled) setMatrixQtyByArticle({});
          return;
        }
        const byArticle: Record<string, number> = {};
        for (const line of json.order.lines) {
          if (!line.articleId || !(line.qty ?? 0)) continue;
          byArticle[line.articleId] = (byArticle[line.articleId] ?? 0) + (line.qty ?? 0);
        }
        if (!cancelled) setMatrixQtyByArticle(byArticle);
      } catch {
        if (!cancelled) setMatrixQtyByArticle({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, activeOrderId]);

  if (loadState === 'loading') {
    return <p className="text-text-secondary text-center text-sm">Загрузка артикулов…</p>;
  }

  if (loadState === 'error') {
    return (
      <Card
        className="p-8 text-center"
        data-testid="brand-sc-linesheets-error"
        data-audit-legacy="brand-linesheets-core-error"
      >
        <p className="text-text-secondary text-sm">{PLATFORM_CORE_LINESETS_UNAVAILABLE_RU}</p>
      </Card>
    );
  }

  if (articles.length === 0) {
    const w2Href = `${ROUTES.brand.productionWorkshop2}?w2col=${encodeURIComponent(collectionId)}`;
    const showroomHref = `${ROUTES.brand.showroom}?collection=${encodeURIComponent(collectionId)}`;
    return (
      <Card
        className="space-y-3 p-8 text-center"
        data-testid="brand-sc-linesheets-empty"
        data-audit-legacy="brand-linesheets-core-empty"
      >
        <p className="text-text-secondary text-sm" data-testid="brand-sc-linesheets-empty-copy">
          {platformCoreLinesheetEmptyMessageRu(collectionId)}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link
              href={w2Href}
              data-testid="brand-sc-linesheets-empty-w2-link"
              data-audit-legacy="brand-linesheets-empty-w2-link"
            >
              {COLLECTION_DEV_HUB_TITLE_RU}
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link
              href={showroomHref}
              data-testid="brand-sc-linesheets-empty-showroom-link"
              data-audit-legacy="brand-linesheets-empty-showroom-link"
            >
              Витрина бренда
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        data-testid="brand-sc-linesheets-list"
        data-audit-legacy="brand-linesheets-core-list"
        className={cn(coreMode && 'hidden lg:block')}
      >
        <CardContent className={cn('p-0', coreMode && hubCabinet.workspaceTableScroll)}>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-bg-surface2/80 border-border-subtle border-b">
                <th className="text-text-muted px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                  Артикул
                </th>
                <th className="text-text-muted px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                  Название
                </th>
                <th className="text-text-muted px-4 py-2 text-right text-[9px] font-bold uppercase tracking-widest">
                  Опт
                </th>
                <th className="text-text-muted px-4 py-2 text-right text-[9px] font-bold uppercase tracking-widest">
                  Мин. партия
                </th>
                <th className="text-text-muted px-4 py-2 text-right text-[9px] font-bold uppercase tracking-widest">
                  Preview qty
                </th>
                <th className="text-text-muted px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                  Магазин
                </th>
                <th className="text-text-muted px-4 py-2 text-right text-[9px] font-bold uppercase tracking-widest">
                  Публикация
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {articles.map((article) => (
                <tr
                  key={`${article.collectionId}:${article.articleId}`}
                  data-testid={`brand-sc-linesheets-article-${article.articleId}`}
                  data-audit-legacy={`brand-linesheet-article-${article.articleId}`}
                >
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[9px] font-black uppercase">
                      {article.articleId}
                    </Badge>
                    <div className="mt-1">
                      <ShowroomArticlePxmMediaBadge
                        pxmSource={
                          (article as PublishedShowroomArticle & { pxmSource?: boolean }).pxmSource
                        }
                        pxmAssetCount={
                          (article as PublishedShowroomArticle & { pxmAssetCount?: number })
                            .pxmAssetCount
                        }
                      />
                    </div>
                  </td>
                  <td className="text-text-primary px-4 py-3 text-[11px] font-bold uppercase">
                    {article.name}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {article.wholesalePriceRub.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="text-text-muted px-4 py-3 text-right tabular-nums">
                    {article.moq ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant="outline"
                      className={
                        (matrixQtyByArticle[article.articleId] ?? 0) > 0
                          ? 'h-4 border-sky-200 bg-sky-50 px-1.5 text-[9px] tabular-nums text-sky-900'
                          : 'border-border-subtle bg-bg-surface2/80 text-text-muted h-4 px-1.5 text-[9px] tabular-nums'
                      }
                      data-testid={`brand-sc-linesheets-preview-qty-${article.articleId}`}
                      data-audit-legacy={`brand-linesheet-preview-qty-${article.articleId}`}
                    >
                      {(matrixQtyByArticle[article.articleId] ?? 0) > 0
                        ? matrixQtyByArticle[article.articleId]
                        : '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <Link
                        href={`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(article.collectionId)}`}
                        data-testid={`brand-sc-linesheets-matrix-link-${article.articleId}`}
                        data-audit-legacy={`brand-linesheet-matrix-link-${article.articleId}`}
                        className="text-accent-primary inline-flex items-center gap-1 text-[10px] font-semibold hover:underline"
                      >
                        <ShoppingBag className="h-3 w-3" aria-hidden />
                        Матрица
                      </Link>
                      {(matrixQtyByArticle[article.articleId] ?? 0) > 0 ? (
                        <Badge
                          variant="outline"
                          className="h-4 border-sky-200 bg-sky-50 px-1.5 text-[9px] tabular-nums text-sky-900"
                          data-testid={`brand-sc-linesheets-matrix-qty-${article.articleId}`}
                          data-audit-legacy={`brand-linesheet-matrix-qty-${article.articleId}`}
                        >
                          В матрице: {matrixQtyByArticle[article.articleId]} ед.
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LinesheetUnpublishButton
                      collectionId={article.collectionId}
                      articleId={article.articleId}
                      onDone={() => {
                        load();
                        onDataChange?.();
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {coreMode ? (
        <div
          className={cn('grid lg:hidden', hubCabinet.workspaceCardGrid)}
          data-testid="brand-sc-linesheets-card-grid"
        >
          {articles.map((article) => (
            <Card
              key={`card-${article.collectionId}:${article.articleId}`}
              data-testid={`brand-sc-linesheets-card-${article.articleId}`}
            >
              <CardContent className="space-y-2 p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[9px] font-black uppercase">
                    {article.articleId}
                  </Badge>
                  <ShowroomArticlePxmMediaBadge
                    pxmSource={
                      (article as PublishedShowroomArticle & { pxmSource?: boolean }).pxmSource
                    }
                    pxmAssetCount={
                      (article as PublishedShowroomArticle & { pxmAssetCount?: number })
                        .pxmAssetCount
                    }
                  />
                </div>
                <p className="text-text-primary text-[11px] font-bold uppercase">{article.name}</p>
                <p className="text-text-secondary tabular-nums">
                  Опт {article.wholesalePriceRub.toLocaleString('ru-RU')} ₽
                  {article.moq ? ` · MOQ ${article.moq}` : ''}
                </p>
                <Badge
                  variant="outline"
                  className={
                    (matrixQtyByArticle[article.articleId] ?? 0) > 0
                      ? 'border-sky-200 bg-sky-50 text-sky-900'
                      : 'border-border-subtle bg-bg-surface2/80 text-text-muted'
                  }
                  data-testid={`brand-sc-linesheets-preview-qty-${article.articleId}`}
                >
                  Preview:{' '}
                  {(matrixQtyByArticle[article.articleId] ?? 0) > 0
                    ? matrixQtyByArticle[article.articleId]
                    : '—'}
                </Badge>
                <Link
                  href={`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(article.collectionId)}`}
                  data-testid={`brand-sc-linesheets-matrix-link-${article.articleId}`}
                  className="text-accent-primary inline-flex min-h-11 items-center gap-1 text-[10px] font-semibold hover:underline"
                >
                  <ShoppingBag className="h-3 w-3" aria-hidden />
                  Матрица
                </Link>
                <LinesheetUnpublishButton
                  collectionId={article.collectionId}
                  articleId={article.articleId}
                  onDone={() => {
                    load();
                    onDataChange?.();
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}

function LinesheetsBatchUnpublishRollbackPanel({
  collectionId,
  publishedArticleIds,
  onDone,
}: {
  collectionId: string;
  publishedArticleIds: string[];
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState<'idle' | 'unpublish' | 'rollback'>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  async function runAction(action: 'unpublish' | 'rollback') {
    setBusy(action);
    setNotice(null);
    try {
      const res = await fetch(BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH, {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          collectionId,
          articleIds: publishedArticleIds,
          shopBuyerId: 'shop1',
        }),
      });
      const json = (await res.json()) as { messageRu?: string };
      setNotice(json.messageRu ?? (res.ok ? 'Готово.' : 'Операция не выполнена.'));
      if (res.ok) onDone?.();
    } catch {
      setNotice('Batch unpublish rollback недоступен (offline).');
    } finally {
      setBusy('idle');
    }
  }

  if (publishedArticleIds.length === 0) return null;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3"
      data-testid="brand-sc-linesheets-batch-unpublish-rollback"
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 text-[10px] font-bold uppercase"
        disabled={busy !== 'idle'}
        data-testid="brand-sc-linesheets-batch-unpublish-btn"
        onClick={() => void runAction('unpublish')}
      >
        {busy === 'unpublish' ? '…' : 'Batch unpublish'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 text-[10px] font-bold uppercase"
        disabled={busy !== 'idle'}
        data-testid="brand-sc-linesheets-batch-rollback-btn"
        onClick={() => void runAction('rollback')}
      >
        {busy === 'rollback' ? '…' : 'Rollback'}
      </Button>
      {notice ? <span className="text-text-secondary text-[10px]">{notice}</span> : null}
    </div>
  );
}

function LinesheetsBatchPublishPanel({
  collectionId,
  onDataChange,
}: {
  collectionId: string;
  onDataChange?: () => void;
}) {
  const [articleIds, setArticleIds] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready'>('loading');
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/development-status`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { status?: { articleIds?: string[] } };
        if (cancelled) return;
        setArticleIds(Array.isArray(json.status?.articleIds) ? json.status!.articleIds! : []);
      } catch {
        if (!cancelled) setArticleIds([]);
      } finally {
        if (!cancelled) setLoadState('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, reloadNonce]);

  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 space-y-2 rounded-lg border px-4 py-3"
      data-testid="brand-sc-linesheets-batch-publish"
    >
      <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
        Batch publish · витрина
      </p>
      <BrandScReleaseGateBlockStrip collectionId={collectionId} compact />
      {loadState === 'loading' ? (
        <p className="text-text-muted text-[10px]">Загрузка артикулов W2…</p>
      ) : articleIds.length === 0 ? (
        <p className="text-text-muted text-[10px]">Нет артикулов в разработке — создайте в W2.</p>
      ) : (
        <Workshop2HubShowroomPublishButton
          collectionId={collectionId}
          articleIds={articleIds}
          onMessage={() => {
            setReloadNonce((n) => n + 1);
            onDataChange?.();
          }}
        />
      )}
      <BrandScPublishAuditLog collectionId={collectionId} reloadNonce={reloadNonce} />
    </div>
  );
}

export function BrandLineSheetsCorePage() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const coreMode = isPlatformCoreMode();
  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);
  const [scReloadNonce, setScReloadNonce] = useState(0);
  const bumpScReload = useCallback(() => setScReloadNonce((n) => n + 1), []);
  const [pgArticleCount, setPgArticleCount] = useState<number | null>(null);
  const [w2ArticleCount, setW2ArticleCount] = useState<number | null>(null);
  const [publishedArticleIds, setPublishedArticleIds] = useState<string[]>([]);
  const [pgLoadState, setPgLoadState] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    let cancelled = false;
    setPgLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string }>;
        };
        if (cancelled) return;
        setPgArticleCount(json.ok ? (json.articles?.length ?? 0) : 0);
        setPublishedArticleIds(
          json.ok
            ? (json.articles ?? []).map((a) => String(a.articleId ?? '').trim()).filter(Boolean)
            : []
        );
      } catch {
        if (!cancelled) setPgArticleCount(null);
      } finally {
        if (!cancelled) setPgLoadState('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, scReloadNonce]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/development-status`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { status?: { articleIds?: string[] } };
        if (cancelled) return;
        const ids = Array.isArray(json.status?.articleIds) ? json.status!.articleIds! : [];
        setW2ArticleCount(ids.length);
      } catch {
        if (!cancelled) setW2ArticleCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, scReloadNonce]);

  const downloadLabel = emptyChain
    ? 'PDF · пустая коллекция'
    : pgLoadState === 'loading'
      ? 'Скачать PDF…'
      : pgArticleCount != null && pgArticleCount > 0
        ? `PDF · ${pgArticleCount} арт.`
        : 'PDF после публикации';
  const pdfReady =
    !emptyChain && pgLoadState === 'ready' && pgArticleCount != null && pgArticleCount > 0;

  return (
    <CabinetPageContent maxWidth="full" className="pb-safe w-full space-y-6">
      <PlatformCoreListChrome
        highlightRole="brand"
        pillarId="sample_collection"
        pageCollectionId={collectionId}
      >
        <div data-testid="brand-sc-linesheets-panel" className="space-y-4">
          <div className={cn(hubGadget.goldenPath, 'items-center')}>
            <Badge
              variant="outline"
              className={hubGadget.chip}
              data-testid="brand-sc-linesheets-mode-label"
            >
              Лайншиты
            </Badge>
            <BrandScCabinetGoldenPathStrip
              collectionId={collectionId}
              testIdVariant="linesheets"
              omitStep="linesheets"
              omitMatrixPrefillCta={publishedArticleIds.length > 0}
            />
            {pdfReady ? (
              <a
                href={workshop2CollectionLinesheetPdfHref(collectionId)}
                data-testid="brand-sc-linesheets-pdf-link"
                data-audit-legacy="brand-linesheet-pdf-download"
                className={hubGadget.goldenLink + ' inline-flex items-center gap-1 text-[10px]'}
              >
                <Download className="h-3 w-3" aria-hidden />
                {downloadLabel}
              </a>
            ) : (
              <span
                className="text-text-muted inline-flex items-center gap-1 text-[10px]"
                data-testid={BRAND_SC_LINESET_PDF_EMPTY_DISABLED_TESTID}
                data-audit-legacy="brand-sc-linesheets-pdf-disabled"
              >
                <Download className="h-3 w-3" aria-hidden />
                {downloadLabel}
              </span>
            )}
            {!pdfReady && coreMode ? (
              <>
                <span
                  className="text-text-muted text-[10px] leading-snug"
                  data-testid={BRAND_SC_LINESET_PDF_EMPTY_HINT_TESTID}
                  data-audit-legacy="brand-sc-linesheets-empty-pdf-hint"
                >
                  {brandScLinesheetPdfEmptyUiHintRu(collectionId)}
                </span>
                <span className="sr-only" data-testid={BRAND_SC_LINESET_PDF_EMPTY_API_TESTID}>
                  {brandScLinesheetPdfEmptyUiHintRu(collectionId)}
                </span>
              </>
            ) : null}
            {coreMode ? (
              <PlatformCorePublishedArticlesReadPathBadge collectionId={collectionId} />
            ) : null}
            {pgLoadState === 'ready' && pgArticleCount != null && w2ArticleCount != null ? (
              <Badge
                variant="outline"
                className={
                  pgArticleCount === w2ArticleCount
                    ? 'border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-[10px] text-amber-900'
                }
                data-testid="brand-sc-linesheets-published-sync"
              >
                {pgArticleCount}/{w2ArticleCount}
              </Badge>
            ) : null}
          </div>
          {coreMode ? (
            <BrandScLinesheetsRetailPeerStrip
              collectionId={collectionId}
              omitMatrixPrefillCta={publishedArticleIds.length > 0}
            />
          ) : null}
          {coreMode && publishedArticleIds.length > 0 ? (
            <BrandScCrossMatrixOpenShopStrip
              collectionId={collectionId}
              articleIds={publishedArticleIds}
              variant="strip"
            />
          ) : null}
          {coreMode ? (
            <>
              <LinesheetsBatchPublishPanel
                collectionId={collectionId}
                onDataChange={bumpScReload}
              />
              <BrandScLinesheetSyndicationPanel
                collectionId={collectionId}
                articleIds={publishedArticleIds}
                onDone={bumpScReload}
              />
              <LinesheetsBatchUnpublishRollbackPanel
                collectionId={collectionId}
                publishedArticleIds={publishedArticleIds}
                onDone={bumpScReload}
              />
              <div data-testid={BRAND_SC_SYNDICATION_WD_AUDIT_BADGE_TESTID}>
                <BrandScPublishAuditLog collectionId={collectionId} reloadNonce={scReloadNonce} />
              </div>
            </>
          ) : null}
          {!coreMode ? (
            <>
              <BrandCentricMediaImportPanel
                collectionId={collectionId}
                articleId={getPlatformCoreDemo(collectionId).demoArticleId}
                compact
              />
              <BrandLinesheetGenPanel collectionId={collectionId} compact />
              <LinesheetsBatchPublishPanel
                collectionId={collectionId}
                onDataChange={bumpScReload}
              />
            </>
          ) : null}
          <LinesheetsPublishedArticlesList
            collectionId={collectionId}
            onDataChange={bumpScReload}
          />
        </div>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
