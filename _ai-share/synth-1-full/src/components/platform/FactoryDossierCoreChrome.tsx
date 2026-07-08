'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, MessageSquare, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  ROUTES,
  factoryCoreOrderProductionCabinetHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryProductionHandoffQueueHref,
  factoryProductionOrdersOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/platform-core-routes';
import {
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  getPlatformCoreDemoByArticleId,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { brandDevelopmentArticleHref } from '@/lib/platform-core-routes';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';
import { buildOrderSectionCommsMessagesHref } from '@/lib/platform-core-comms-section-groups';
import { PlatformCoreChromeShell } from '@/components/platform/usePlatformCoreChainOverview';
import { PlatformCoreContextBar } from '@/components/platform/PlatformCoreContextBar';
import { PlatformCoreRolePillarStrip } from '@/components/platform/PlatformCoreRolePillarStrip';
import { PlatformCoreDossierSampleQueueCard } from '@/components/platform/PlatformCoreDossierSampleQueueCard';
import { FactoryDossierTechPackAckPanel } from '@/components/platform/FactoryDossierTechPackAckPanel';
import { ManufacturerDevDossierCommentPeerStrip } from '@/components/factory/ManufacturerDevDossierCommentPeerStrip';
import { ManufacturerDevDossierAnnotationPanel } from '@/components/factory/ManufacturerDevDossierAnnotationPanel';
import { MfrDevDossierProductionSpinePeerStrip } from '@/components/factory/MfrDevDossierProductionSpinePeerStrip';
import { MfrOpDossierCoSpinePeerStrip } from '@/components/factory/MfrOpDossierCoSpinePeerStrip';
import { MfrDevSamplePhotoDamStubStrip } from '@/components/factory/MfrDevSamplePhotoDamStubStrip';
import { MfrOpDossierExportPrintStrip } from '@/components/factory/MfrOpDossierExportPrintStrip';
import { MfrOpDossierAttachTzPdfPoPeerStrip } from '@/components/factory/MfrOpDossierAttachTzPdfPoPeerStrip';
import { ManufacturerArticleAttachTzPeerStrip } from '@/components/factory/ManufacturerArticleAttachTzPeerStrip';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { MfrDevDossierPgSourceStrip } from '@/components/factory/MfrDevDossierPgSourceStrip';
import type { FactoryDossierResolveSource } from '@/lib/platform-core-ports/factory-dossier';

type Props = {
  children: ReactNode;
  articleId?: string;
  /** SKU из PG-досье для экспорта ТЗ (честная метка, не mock). */
  exportArticleSku?: string;
  /** Wave YA · honest dossier source (PG vs legacy localStorage). */
  dossierSource?: FactoryDossierResolveSource;
  dossierCollectionId?: string;
};

type ChainDossierMeta = {
  dossierVersionAtHandoff?: number;
  dossierChangedSinceHandoff?: boolean;
  productionOrderId?: string;
  handedOff?: boolean;
};

function FactoryDossierCoreChromeInner({
  children,
  articleId,
  exportArticleSku,
  dossierSource,
  dossierCollectionId,
}: Props) {
  const searchParams = useSearchParams();
  const productionPillar = searchParams.get('pillar') === 'order_production';
  const pillarId: CoreHubPillarId = productionPillar ? 'order_production' : 'development';
  const demo = articleId ? getPlatformCoreDemoByArticleId(articleId) : null;
  const urlOrderId = searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || '';
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: urlOrderId,
    resolveFrom: ['handoff', 'allocation'],
    factoryId: demo?.factoryId ?? PLATFORM_CORE_DEMO.factoryId,
  });
  const orderId = urlOrderId || spineOrderId;
  const [chainMeta, setChainMeta] = useState<ChainDossierMeta | null>(null);

  const articleChatHref =
    demo && articleId
      ? factoryMessagesWorkshop2ArticleContextHref(demo.collectionId, articleId, {
          role: 'manufacturer',
        })
      : null;

  const cabinetBackHref = demo
    ? productionPillar
      ? factoryCoreOrderProductionCabinetHref(demo.collectionId)
      : `${ROUTES.factory.productionCoreCabinet}?pillar=development&collection=${encodeURIComponent(demo.collectionId)}`
    : ROUTES.factory.productionCoreCabinet;

  useEffect(() => {
    if (!productionPillar || !orderId) {
      setChainMeta(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/chain-status`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          chain?: ChainDossierMeta & {
            dossierDiff?: {
              dossierVersionAtHandoff?: number;
              dossierChangedSinceHandoff?: boolean;
            };
          };
        };
        if (!cancelled && json.ok && json.chain) {
          setChainMeta({
            productionOrderId: json.chain.productionOrderId,
            handedOff: json.chain.handedOff,
            dossierVersionAtHandoff: json.chain.dossierDiff?.dossierVersionAtHandoff ?? undefined,
            dossierChangedSinceHandoff:
              json.chain.dossierDiff?.dossierChangedSinceHandoff ?? undefined,
          });
        }
      } catch {
        if (!cancelled) setChainMeta(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productionPillar, orderId]);

  const brandW2ArticleHref =
    demo && articleId
      ? brandDevelopmentArticleHref(demo.collectionId, articleId, { section: 'overview' })
      : null;
  const panelTestId = productionPillar ? 'factory-dossier-core-chrome' : 'mfr-dev-dossier-panel';
  const workspaceBackLabel = productionPillar ? 'Кабинет · выпуск' : 'Кабинет · производство';

  return (
    <div
      className={hubCabinet.listChrome}
      data-testid={panelTestId}
      data-audit-legacy={productionPillar ? undefined : 'factory-dossier-core-chrome'}
    >
      {exportArticleSku?.trim() ? (
        <p className="text-text-secondary text-xs" data-testid="factory-dossier-export-sku">
          SKU в экспорте ТЗ: {exportArticleSku.trim()}
        </p>
      ) : null}
      <PlatformCoreContextBar
        roleId="manufacturer"
        pillarId={pillarId}
        entityLabel={articleId}
        orderId={orderId}
        showDemoIdStrip={Boolean(demo)}
        showWorkspaceBack
        workspaceBackHref={cabinetBackHref}
        workspaceBackLabel={workspaceBackLabel}
      />
      {!isPlatformCoreMode() ? (
        <div className="lg:hidden">
          <PlatformCoreRolePillarStrip roleId="manufacturer" activePillarId={pillarId} />
        </div>
      ) : null}
      {demo && articleId ? (
        <FactoryDossierTechPackAckPanel
          collectionId={demo.collectionId}
          articleId={articleId}
          surface={productionPillar ? 'inline' : 'inline'}
        />
      ) : null}
      {!productionPillar && demo ? (
        <>
          {articleId && dossierSource ? (
            <MfrDevDossierPgSourceStrip
              collectionId={dossierCollectionId ?? demo.collectionId}
              articleId={articleId}
              source={dossierSource}
            />
          ) : null}
          <div
            className={cn(
              hubGadget.goldenPath,
              hubCabinet.workspaceTableScroll,
              'max-md:flex-nowrap'
            )}
            data-testid="mfr-dev-dossier-context-strip"
          >
            {brandW2ArticleHref ? (
              <>
                <Link
                  href={brandW2ArticleHref}
                  data-testid="mfr-dev-dossier-brand-w2-link"
                  className={hubGadget.goldenLink}
                >
                  ТЗ бренда
                </Link>
                <span className={hubGadget.goldenSep} aria-hidden>
                  ·
                </span>
              </>
            ) : null}
            <Link
              href={factoryMaterialsHrefForDemo(demo)}
              data-testid="mfr-dev-dossier-materials-link"
              className={hubGadget.goldenLink}
            >
              Материалы / BOM
            </Link>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={`${ROUTES.factory.productionCoreCabinet}?pillar=development&collection=${encodeURIComponent(demo.collectionId)}`}
              data-testid="mfr-dev-dossier-cabinet-link"
              className={hubGadget.goldenLink}
            >
              Кабинет
            </Link>
          </div>
          {articleId ? (
            <ManufacturerDevDossierCommentPeerStrip
              collectionId={demo.collectionId}
              articleId={articleId}
            />
          ) : null}
          {articleId ? (
            <ManufacturerDevDossierAnnotationPanel
              collectionId={demo.collectionId}
              articleId={articleId}
              factoryId={demo.factoryId ?? PLATFORM_CORE_DEMO.factoryId}
              orderId={orderId || undefined}
            />
          ) : null}
          {articleId ? (
            <MfrDevDossierProductionSpinePeerStrip
              factoryId={demo.factoryId ?? PLATFORM_CORE_DEMO.factoryId}
              collectionId={demo.collectionId}
              articleId={articleId}
            />
          ) : null}
          {articleId ? (
            <ManufacturerArticleAttachTzPeerStrip
              collectionId={demo.collectionId}
              articleId={articleId}
            />
          ) : null}
          {articleId ? (
            <MfrDevSamplePhotoDamStubStrip
              collectionId={demo.collectionId}
              articleId={articleId}
              orderId={orderId || undefined}
              factoryId={demo.factoryId ?? PLATFORM_CORE_DEMO.factoryId}
            />
          ) : null}
        </>
      ) : null}
      {productionPillar && demo && orderId ? (
        isPlatformCoreMode() ? (
          <MfrOpDossierCoSpinePeerStrip
            factoryId={demo.factoryId ?? PLATFORM_CORE_DEMO.factoryId}
            collectionId={demo.collectionId}
            orderId={orderId}
          />
        ) : (
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
            data-testid="mfr-op-dossier-context-strip"
          >
            <Link
              href={factoryProductionOrdersOrderContextHref(orderId, {
                factoryId: demo.factoryId,
              })}
              data-testid="mfr-op-dossier-prod-orders-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Заказы цеха
            </Link>
            <Link
              href={factoryProductionHandoffQueueHref(orderId, {
                factoryId: demo.factoryId,
                collectionId: demo.collectionId,
              })}
              data-testid="mfr-op-dossier-handoff-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Очередь передачи
            </Link>
            <Link
              href={factoryMaterialsProcurementHrefForDemo(demo)}
              data-testid="mfr-op-dossier-procurement-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Закупка
            </Link>
            <Link
              href={shopB2bTrackingOrderHref(orderId)}
              data-testid="mfr-op-dossier-shop-tracking-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Трекинг магазина
            </Link>
            <Link
              href={buildOrderSectionCommsMessagesHref({
                roleId: 'manufacturer',
                orderId,
                collectionId: demo.collectionId,
                sectionId: 'mfr-op-dossier',
                pillarId: 'order_production',
              })}
              data-testid="mfr-op-dossier-order-chat-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Чат заказа
            </Link>
          </div>
        )
      ) : null}
      {productionPillar && chainMeta?.dossierVersionAtHandoff != null ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            data-testid="mfr-op-dossier-version-badge"
            className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-800"
          >
            Зафиксировано v{chainMeta.dossierVersionAtHandoff} при передаче бренда
          </Badge>
          {chainMeta.dossierChangedSinceHandoff ? (
            <Badge
              variant="outline"
              data-testid="mfr-op-dossier-changed-badge"
              className="border-amber-200 bg-amber-50 text-[9px] text-amber-900"
            >
              Бренд изменил ТЗ после передачи
            </Badge>
          ) : null}
        </div>
      ) : null}
      {productionPillar && demo && articleId ? (
        <MfrOpDossierExportPrintStrip
          collectionId={demo.collectionId}
          articleId={articleId}
          orderId={orderId || undefined}
        />
      ) : null}
      {productionPillar && demo && articleId && orderId ? (
        <MfrOpDossierAttachTzPdfPoPeerStrip
          orderId={orderId}
          collectionId={demo.collectionId}
          articleId={articleId}
          productionOrderId={chainMeta?.productionOrderId ?? PLATFORM_CORE_DEMO.productionOrderId}
          factoryId={demo.factoryId ?? PLATFORM_CORE_DEMO.factoryId}
        />
      ) : null}
      <div
        className={hubCabinet.workspaceStickyActions}
        data-testid="mfr-dev-dossier-actions-strip"
      >
        {articleChatHref ? (
          <Link
            href={articleChatHref}
            className={cn(
              hubCabinet.workspacePrimaryBtn,
              'text-accent-primary border-border-default inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white text-xs font-semibold hover:underline'
            )}
            data-testid="mfr-dev-dossier-article-chat-link"
            data-audit-legacy="factory-dossier-article-chat-link"
          >
            <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
            Чат по артикулу
          </Link>
        ) : null}
        {!productionPillar ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(hubCabinet.workspacePrimaryBtn, 'text-[10px] font-semibold')}
            data-testid="mfr-op-dossier-print-btn"
            onClick={() => window.print()}
          >
            <Printer className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
            Печать ТЗ
          </Button>
        ) : null}
        {productionPillar && articleId && demo ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(hubCabinet.workspacePrimaryBtn, 'text-[10px] font-semibold')}
            data-testid="mfr-op-shop-floor-bundle-btn"
            asChild
          >
            <a
              href={`/api/workshop2/factory/dossier/${encodeURIComponent(articleId)}/shop-floor-bundle?collectionId=${encodeURIComponent(demo.collectionId)}${orderId ? `&orderId=${encodeURIComponent(orderId)}` : ''}`}
              download
            >
              <Download className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
              Комплект для цеха
            </a>
          </Button>
        ) : null}
      </div>
      {articleId && !productionPillar ? (
        <div className="min-w-0" data-testid="factory-dossier-sample-queue-slot">
          <PlatformCoreDossierSampleQueueCard
            articleId={articleId}
            orderId={orderId || undefined}
          />
        </div>
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function FactoryDossierCoreChrome({
  children,
  articleId,
  exportArticleSku,
  dossierSource,
  dossierCollectionId,
}: Props) {
  if (!isPlatformCoreMode()) return <>{children}</>;

  const collectionId =
    dossierCollectionId ??
    (articleId ? getPlatformCoreDemoByArticleId(articleId).collectionId : undefined);

  return (
    <PlatformCoreChromeShell collectionId={collectionId}>
      <FactoryDossierCoreChromeInner
        articleId={articleId}
        exportArticleSku={exportArticleSku}
        dossierSource={dossierSource}
        dossierCollectionId={dossierCollectionId}
      >
        {children}
      </FactoryDossierCoreChromeInner>
    </PlatformCoreChromeShell>
  );
}
