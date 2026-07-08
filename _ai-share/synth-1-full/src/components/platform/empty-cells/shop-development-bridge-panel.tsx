'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { ROUTES, brandDevelopmentCabinetHref } from '@/lib/platform-core-routes';
import { ShopDevelopmentBridgeGreenfieldCrmStrip } from '@/components/platform/ShopDevelopmentBridgeGreenfieldCrmStrip';
import { ShopDevelopmentBridgeAssortmentWishlistStrip } from '@/components/platform/ShopDevelopmentBridgeAssortmentWishlistStrip';
import { ShopDevelopmentBridgePeerStrip } from '@/components/platform/ShopDevelopmentBridgePeerStrip';
import { requestShopDevelopmentSample } from '@/lib/platform-core-ports/legacy/shop/shop-buyer-assortment-wishlist-client';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import { platformCoreW2PrefetchHandlers } from '@/lib/platform-core-w2-prefetch';
import { PlatformCoreStepProgressStrip } from '@/components/platform/PlatformCoreStepProgressStrip';
import { PLATFORM_CORE_PG_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';
import {
  readShopDevelopmentVisitStore,
  writeShopDevelopmentVisitStore,
} from '@/lib/platform-core-ports/b2b/shop-development-visit-store';
import type { ShopDevelopmentProgressSnapshot } from '@/lib/platform-core-ports/legacy/server/shop-development-progress-server';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

export default function ShopDevelopmentBridge({
  demo,
  hideLead = true,
  embedCrossRole = false,
}: {
  demo: PlatformCoreDemoContext;
  hideLead?: boolean;
  embedCrossRole?: boolean;
}) {
  const { collectionId } = demo;
  const { buyerId } = useShopCoreBuyerId();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSampleArticleId] = useState('demo-ss27-01');
  const [sampleMsg, setSampleMsg] = useState<string | null>(null);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [visitChanges, setVisitChanges] = useState<string[]>([]);
  const [progressSnapshot, setProgressSnapshot] = useState<ShopDevelopmentProgressSnapshot | null>(
    null
  );
  const [progressLoading, setProgressLoading] = useState(false);
  const devSnap = usePillarSnapshot({
    collectionId,
    pillarId: 'development',
    roleId: 'shop',
  });
  const sampleSnap = usePillarSnapshot({
    collectionId,
    pillarId: 'sample_collection',
    roleId: 'shop',
  });
  const devStatus =
    devSnap.snapshot?.pillarId === 'development' && 'development' in devSnap.snapshot
      ? devSnap.snapshot.development.status
      : null;
  const sampleStatus =
    sampleSnap.snapshot?.pillarId === 'sample_collection' &&
    'sampleCollection' in sampleSnap.snapshot
      ? sampleSnap.snapshot.sampleCollection.status
      : null;
  const loadState =
    devSnap.loading || sampleSnap.loading
      ? ('loading' as const)
      : devSnap.error && sampleSnap.error
        ? ('error' as const)
        : ('ready' as const);
  const devSteps = devStatus?.steps ?? [];
  const articleCount = devStatus?.articleCount ?? null;
  const readyForBuyers = sampleStatus?.readyForBuyers ?? null;

  const brandW2Href = devStatus?.workshop2Href ?? brandDevelopmentCabinetHref(collectionId);
  const shopShowroomHref =
    sampleStatus?.shopShowroomHref ??
    `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`;
  const colLabel = getPlatformCoreCollectionLabel(collectionId);

  const loadDevelopmentProgress = useCallback(
    async (commitVisit: boolean) => {
      setProgressLoading(true);
      const visit = readShopDevelopmentVisitStore(collectionId);
      const params = new URLSearchParams({ collection: collectionId });
      if (visit?.versionToken) params.set('sinceToken', visit.versionToken);
      if (visit?.snapshot) params.set('sinceSnapshot', JSON.stringify(visit.snapshot));
      try {
        const res = await fetch(`/api/shop/b2b/development-progress?${params}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          setVisitChanges([]);
          setProgressSnapshot(null);
          return;
        }
        const json = (await res.json()) as {
          ok?: boolean;
          snapshot?: ShopDevelopmentProgressSnapshot;
          versionToken?: string;
          changesSince?: string[];
        };
        if (json.ok && json.snapshot) {
          setProgressSnapshot(json.snapshot);
          setVisitChanges(json.changesSince ?? []);
          if (commitVisit && json.versionToken) {
            writeShopDevelopmentVisitStore(collectionId, {
              versionToken: json.versionToken,
              snapshot: {
                articleCount: json.snapshot.articleCount,
                sampleQueueCount: json.snapshot.sampleQueueCount,
                steps: json.snapshot.steps,
              },
              visitedAt: new Date().toISOString(),
            });
          }
        }
      } finally {
        setProgressLoading(false);
      }
    },
    [collectionId]
  );

  useEffect(() => {
    void loadDevelopmentProgress(false);
  }, [loadDevelopmentProgress]);

  useEffect(() => {
    if (!previewOpen) return;
    void loadDevelopmentProgress(true);
    setSampleMsg(null);
  }, [previewOpen, loadDevelopmentProgress]);

  const requestPreviewSample = async () => {
    setSampleMsg(null);
    setSampleBusy(true);
    try {
      const { messageRu } = await requestShopDevelopmentSample({
        buyerId,
        collectionId,
        articleId: previewSampleArticleId,
      });
      setSampleMsg(messageRu ?? 'Запрос отправлен бренду.');
    } finally {
      setSampleBusy(false);
    }
  };

  const previewSteps = progressSnapshot?.steps ?? devSteps;
  const previewArticleCount = progressSnapshot?.articleCount ?? articleCount;

  return (
    <section data-testid="shop-development-bridge" className="min-w-0 space-y-2">
      <Card className={cn(hubGadget.pillarCard, 'border-sky-200/60')}>
        <CardContent className={cn(hubGadget.pillarBody, 'space-y-2 text-xs')}>
          {hideLead ? null : <p className="font-semibold">Разработка ведёт бренд · {colLabel}</p>}
          {loadState === 'loading' ? (
            <p className="text-text-muted">Загрузка…</p>
          ) : loadState === 'error' ? (
            <p className="text-text-muted">{PLATFORM_CORE_PG_UNAVAILABLE_RU}</p>
          ) : (
            <>
              {articleCount != null ? (
                <p className="text-text-secondary">
                  {articleCount} артикул(ов) в разработке
                  {readyForBuyers ? (
                    <Badge variant="secondary" className="ml-1.5 text-[10px]">
                      Коллекция для байеров
                    </Badge>
                  ) : null}
                </p>
              ) : null}
              {devSteps.length > 0 ? (
                <PlatformCoreStepProgressStrip
                  steps={devSteps}
                  testId="shop-development-bridge-steps"
                  variant="horizontal"
                />
              ) : null}
              {visitChanges.length > 0 ? (
                <Badge
                  variant="outline"
                  className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
                  data-testid="shop-development-bridge-visit-diff-badge"
                >
                  {visitChanges.length} изменений с прошлого визита
                </Badge>
              ) : null}
            </>
          )}
          <div className={cn(hubGadget.ctaRow, 'min-w-0')}>
            <Button
              type="button"
              variant="link"
              className={cn(hubGadget.ctaLink, 'min-h-11 justify-start md:min-h-0')}
              data-testid="shop-development-bridge-brand-w2-preview"
              onClick={() => setPreviewOpen(true)}
            >
              Превью техпака →
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-md"
          data-testid="shop-development-bridge-dossier-preview-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-sm">Техпак бренда · {colLabel}</DialogTitle>
            <DialogDescription className="text-xs">
              Только просмотр прогресса разработки. Редактирование ТЗ доступно только бренду.
            </DialogDescription>
          </DialogHeader>
          {loadState === 'loading' ? (
            <p className="text-text-muted text-xs">Загрузка…</p>
          ) : loadState === 'error' ? (
            <p className="text-text-muted text-xs">{PLATFORM_CORE_PG_UNAVAILABLE_RU}</p>
          ) : progressLoading ? (
            <p className="text-text-muted text-xs">Загрузка снимка…</p>
          ) : (
            <div className="space-y-2">
              {visitChanges.length > 0 ? (
                <ul
                  className="list-inside list-disc space-y-0.5 text-[11px] text-sky-900"
                  data-testid="shop-development-bridge-visit-diff"
                >
                  {visitChanges.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              {previewArticleCount != null ? (
                <p className="text-text-secondary text-xs">
                  {previewArticleCount} артикул(ов) ·{' '}
                  {readyForBuyers ? 'опубликовано для байеров' : 'ещё не для витрины'}
                </p>
              ) : null}
              {previewSteps.length > 0 ? (
                <PlatformCoreStepProgressStrip
                  steps={previewSteps}
                  testId="shop-development-bridge-preview-steps"
                  variant="vertical"
                />
              ) : (
                <p className="text-text-muted text-xs">
                  Нет шагов development-status для коллекции.
                </p>
              )}
              <div className="border-border-subtle bg-bg-surface2/40 space-y-2 rounded-md border p-2">
                <p className="text-text-secondary text-[11px]">
                  Запрос образца по артикулу{' '}
                  <span className="font-mono">{previewSampleArticleId}</span> — уведомление уйдёт
                  бренду.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={sampleBusy}
                  data-testid="shop-dev-bridge-request-sample-preview-btn"
                  onClick={() => void requestPreviewSample()}
                >
                  Запросить образец
                </Button>
                {sampleMsg ? (
                  <p
                    className="text-[11px] text-emerald-800"
                    data-testid="shop-dev-bridge-request-sample-msg"
                  >
                    {sampleMsg}
                  </p>
                ) : null}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-2 sm:justify-start">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={brandW2Href} {...platformCoreW2PrefetchHandlers}>
                Открыть W2 бренда
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={shopShowroomHref} {...platformCoreW2PrefetchHandlers}>
                Витрина
              </Link>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShopDevelopmentBridgePeerStrip collectionId={collectionId} readyForBuyers={readyForBuyers} />
      <ShopDevelopmentBridgeGreenfieldCrmStrip collectionId={collectionId} />
      <ShopDevelopmentBridgeAssortmentWishlistStrip collectionId={collectionId} />

      {embedCrossRole ? null : (
        <RolePillarCrossRoleLinks roleId="shop" pillarId="development" variant="compact" />
      )}
    </section>
  );
}
