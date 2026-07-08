'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { buildBrandSupplierBomSession } from '@/lib/platform-core-ports/fashion/brand-supplier-bom-workspace';
import {
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix';

import { factorySupplierMessagesWorkshop2ArticleContextHref } from '@/lib/platform-core-extended-routes';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import {
  formatDossierMaterialPreviewLine,
  type Workshop2DossierMaterialPreview,
} from '@/lib/platform-core-ports/dossier-material-preview';
import { PLATFORM_CORE_BOM_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import {
  estimateSupplierMaterialNeed,
  formatSupplierMaterialNeedRu,
} from '@/lib/platform-core-supplier-forecast';
import { SupplierBomDrawer } from '@/components/platform/SupplierBomDrawer';
import { RolePillarCrossRoleLinks } from '@/components/platform/RolePillarCrossRoleLinks';
import { SupplierDevCabinetSpinePeerStrip } from '@/components/factory/supplier/SupplierDevCabinetSpinePeerStrip';
import { SupDevBomMfrDevPeerStrip } from '@/components/factory/supplier/SupDevBomMfrDevPeerStrip';
import { SupDevBomAltMaterialApprovalStrip } from '@/components/factory/supplier/SupDevBomAltMaterialApprovalStrip';
import { SupDevBomBrandFeedStrip } from '@/components/factory/supplier/SupDevBomBrandFeedStrip';
import { SupDevBomBrandDevPeerStrip } from '@/components/factory/supplier/SupDevBomBrandDevPeerStrip';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';
import { SupEmptyScLinesheetNotifyStrip } from '@/components/platform/empty-cells/SupEmptyScLinesheetNotifyStrip';

type PublishedArticleRow = {
  articleId: string;
  title?: string;
};

async function fetchPublishedArticles(collectionId: string): Promise<PublishedArticleRow[]> {
  const res = await fetch(
    `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
    { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as {
    ok?: boolean;
    articles?: Array<{ articleId?: string; id?: string; title?: string; name?: string }>;
  };
  if (!json.ok || !Array.isArray(json.articles)) return [];
  return json.articles.flatMap((row) => {
    const articleId = (row.articleId ?? row.id ?? '').trim();
    if (!articleId) return [];
    return [
      {
        articleId,
        title: row.title?.trim() || row.name?.trim() || articleId,
      },
    ];
  });
}

function BomPreviewLine({
  preview,
  orderQty,
}: {
  preview: Workshop2DossierMaterialPreview;
  orderQty?: number | null;
}) {
  const need =
    orderQty && orderQty > 0 ? estimateSupplierMaterialNeed({ preview, orderQty }) : null;
  return (
    <li>
      {formatDossierMaterialPreviewLine(preview)}
      {need ? (
        <span
          className="text-text-muted ml-1"
          data-testid={`supplier-bom-weighted-${preview.name.replace(/\s+/g, '-').slice(0, 24)}`}
        >
          · {formatSupplierMaterialNeedRu(need)}
        </span>
      ) : null}
    </li>
  );
}

export function SupplierBomPreview({
  demo,
  compact = false,
  hideLead = false,
  embedCrossRole = false,
}: {
  demo: PlatformCoreDemoContext;
  compact?: boolean;
  hideLead?: boolean;
  embedCrossRole?: boolean;
}) {
  const { collectionId, demoArticleId, factoryId } = demo;
  const [catalogArticles, setCatalogArticles] = useState<PublishedArticleRow[]>([]);
  const [pickedArticleId, setPickedArticleId] = useState(demoArticleId);
  const [orderQty, setOrderQty] = useState<number | null>(null);

  const { activeOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: demo.demoOrderId,
    collectionId,
    resolveFrom: ['w2_registry', 'allocation'],
    actorRole: 'supplier',
    factoryId,
    enabled: true,
  });

  useEffect(() => {
    setPickedArticleId(demoArticleId);
  }, [demoArticleId, collectionId]);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedArticles(collectionId).then((rows) => {
      if (!cancelled) setCatalogArticles(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  useEffect(() => {
    const orderId = activeOrderId.trim();
    if (!orderId) {
      setOrderQty(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          ok?: boolean;
          order?: { lines?: Array<{ qty?: number }> };
        };
      })
      .then((json) => {
        if (cancelled || !json?.ok || !json.order) return;
        const qty = (json.order.lines ?? []).reduce((sum, line) => sum + (line.qty ?? 0), 0);
        setOrderQty(qty > 0 ? qty : null);
      })
      .catch(() => {
        if (!cancelled) setOrderQty(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeOrderId]);

  const { snapshot, loading } = usePillarSnapshot({
    collectionId,
    pillarId: 'development',
    roleId: 'supplier',
    articleId: pickedArticleId,
    factoryId,
  });
  const dev =
    snapshot?.pillarId === 'development' && 'development' in snapshot ? snapshot.development : null;
  const previews: Workshop2DossierMaterialPreview[] = dev?.bomMaterialPreviews ?? [];
  const articleId = dev?.status.demoArticleId ?? pickedArticleId;
  const materialsWorkspaceHref = factoryMaterialsHrefForDemo({
    ...demo,
    demoArticleId: articleId,
  });
  const bomDevelopmentHref = dev?.status.supplierBomHref ?? materialsWorkspaceHref;
  const procurementHref = factoryMaterialsProcurementHrefForDemo({
    ...demo,
    demoArticleId: articleId,
  });
  const brandBomHref = buildBrandSupplierBomSession({ collectionId, articleId }).bomHref;

  const catalogPicker = useMemo(() => {
    if (catalogArticles.length <= 1) return null;
    return (
      <label className="text-text-secondary flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium">Артикул коллекции</span>
        <select
          data-testid="supplier-catalog-article-picker"
          className="border-border-subtle bg-bg-surface rounded-md border px-2 py-1 text-xs"
          value={pickedArticleId}
          onChange={(e) => setPickedArticleId(e.target.value)}
        >
          {catalogArticles.map((row) => (
            <option key={row.articleId} value={row.articleId}>
              {row.title ?? row.articleId}
            </option>
          ))}
        </select>
      </label>
    );
  }, [catalogArticles, pickedArticleId]);

  if (compact) {
    const preview = previews.slice(0, 2);
    return (
      <section data-testid="supplier-sample-collection-workspace" className="space-y-1.5">
        <Card data-testid="supplier-bom-preview-mini" className="border-amber-200/60">
          <CardContent className="space-y-1.5 p-3 text-xs">
            {catalogPicker}
            <p className="font-semibold">
              Состав материалов · {articleId}
              {previews.length > 0 ? (
                <span
                  className="text-text-muted ml-1 font-normal"
                  data-testid="supplier-bom-completeness-pct"
                >
                  · {previews.length} поз.
                  {orderQty ? ` · заказ ${orderQty} ед.` : ''}
                </span>
              ) : null}
            </p>
            {loading ? (
              <p className="text-text-muted">Загрузка BOM…</p>
            ) : preview.length > 0 ? (
              <ul className="text-text-secondary list-inside list-disc">
                {preview.map((p) => (
                  <BomPreviewLine key={p.name} preview={p} orderQty={orderQty} />
                ))}
                {previews.length > 2 ? (
                  <li className="text-text-muted list-none">+{previews.length - 2} поз.</li>
                ) : null}
              </ul>
            ) : (
              <p className="text-text-muted">{PLATFORM_CORE_BOM_UNAVAILABLE_RU}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {previews.length > 0 ? (
                <SupplierBomDrawer
                  collectionId={collectionId}
                  articleId={articleId}
                  orderQty={orderQty ?? undefined}
                  previewCount={previews.length}
                  testId="supplier-bom-preview-mini-drawer"
                />
              ) : null}
              <Link
                href={bomDevelopmentHref}
                data-testid="supplier-bom-preview-mini-link"
                className="text-accent-primary font-medium hover:underline"
              >
                BOM · материалы →
              </Link>
              <Link
                href={brandBomHref}
                data-testid="sup-dev-bom-brand-peer-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Brand BOM peer →
              </Link>
              <Link
                href={materialsWorkspaceHref}
                data-testid="supplier-dev-materials-workspace-link"
                className="text-accent-primary font-medium hover:underline"
              >
                Материалы →
              </Link>
            </div>
          </CardContent>
        </Card>
        <SupEmptyScLinesheetNotifyStrip collectionId={collectionId} articleId={articleId} />
        <SupplierDevCabinetSpinePeerStrip
          collectionId={collectionId}
          articleId={articleId}
          orderId={activeOrderId || undefined}
        />
        <SupDevBomAltMaterialApprovalStrip collectionId={collectionId} articleId={articleId} />
        <SupDevBomBrandFeedStrip collectionId={collectionId} articleId={articleId} />
        <SupDevBomBrandDevPeerStrip collectionId={collectionId} articleId={articleId} />
        <SupDevBomMfrDevPeerStrip collectionId={collectionId} articleId={articleId} />
        {embedCrossRole ? (
          <RolePillarCrossRoleLinks
            roleId="supplier"
            pillarId="sample_collection"
            variant="compact"
          />
        ) : null}
      </section>
    );
  }

  return (
    <section data-testid="supplier-sample-collection-workspace" className="space-y-2">
      <Card data-testid="supplier-bom-preview" className="border-amber-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Состав материалов образца</CardTitle>
          {hideLead ? null : (
            <CardDescription className="text-xs">
              <PlatformCoreTerm term="BOM" /> из досье · {articleId}
              {orderQty ? ` · вес по заказу ${orderQty} ед.` : ''}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {catalogPicker}
          {loading ? (
            <p className="text-text-muted">Загрузка BOM…</p>
          ) : previews.length > 0 ? (
            <ul className="list-inside list-disc">
              {previews.slice(0, 5).map((p) => (
                <BomPreviewLine key={p.name} preview={p} orderQty={orderQty} />
              ))}
            </ul>
          ) : (
            <p className="text-text-muted">{PLATFORM_CORE_BOM_UNAVAILABLE_RU}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {previews.length > 0 ? (
              <SupplierBomDrawer
                collectionId={collectionId}
                articleId={articleId}
                orderQty={orderQty ?? undefined}
                previewCount={previews.length}
                testId="supplier-bom-expand-drawer"
              />
            ) : null}
            <Link
              href={procurementHref}
              className="text-accent-primary font-medium hover:underline"
            >
              Закупка под заказ →
            </Link>
            <Link
              href={brandBomHref}
              data-testid="sup-dev-bom-brand-peer-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Brand BOM peer →
            </Link>
            <Link
              href={materialsWorkspaceHref}
              data-testid="supplier-dev-materials-workspace-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Рабочий экран материалов →
            </Link>
            <Link
              href={factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId)}
              data-testid="sup-cm-article-chat-link"
              data-audit-legacy="supplier-bom-rfq-chat-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Уточнение через чат →
            </Link>
          </div>
        </CardContent>
      </Card>
      <SupDevBomAltMaterialApprovalStrip collectionId={collectionId} articleId={articleId} />
      <SupDevBomBrandFeedStrip collectionId={collectionId} articleId={articleId} />
      <SupDevBomBrandDevPeerStrip collectionId={collectionId} articleId={articleId} />
      <SupDevBomMfrDevPeerStrip collectionId={collectionId} articleId={articleId} />
      {embedCrossRole ? (
        <RolePillarCrossRoleLinks
          roleId="supplier"
          pillarId="sample_collection"
          variant="compact"
        />
      ) : null}
    </section>
  );
}
