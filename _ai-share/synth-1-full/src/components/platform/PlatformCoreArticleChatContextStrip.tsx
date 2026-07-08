'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CommunicationsEntityContextVariant } from '@/components/brand/communications/CommunicationsEntityContextBanner';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  parseSynthaOverlayContext,
  parseWorkspaceThreadContext,
} from '@/lib/platform-core-ports/communications/syntha-overlay-context';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { brandDevelopmentSamplePeerHref } from '@/lib/platform-core-brand-sample-peer';
import { brandOrderCommsTabHref } from '@/lib/platform-core-ports/b2b/brand-collection-order-hrefs';
import { brandProductionOpsFeatureHref } from '@/lib/platform-core-ports/brand-production-handoff';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import {
  brandDevelopmentArticleHref,
  brandMessagesWorkshop2ArticleContextHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factoryProductionDossierContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  ROUTES,
  shopMessagesWorkshop2ArticleContextHref,
} from '@/lib/platform-core-routes';

type Props = {
  variant: CommunicationsEntityContextVariant;
};

function articleChatStripTestId(variant: CommunicationsEntityContextVariant): string {
  if (variant === 'brand') return 'brand-cm-article-context-strip';
  if (variant === 'shop') return 'shop-cm-article-context-strip';
  if (variant === 'supplier') return 'sup-cm-article-context-strip';
  return 'mfr-cm-article-context-strip';
}

function PlatformCoreArticleChatContextStripInner({ variant }: Props) {
  const searchParams = useSearchParams();
  const demo = usePlatformCoreDemoContext();
  const contextType = searchParams.get('contextType')?.trim() || '';
  const w2 = parseWorkspaceThreadContext(searchParams);
  const ctx = parseSynthaOverlayContext(searchParams);
  const collectionId =
    w2.collectionId ||
    ctx.collectionId?.trim() ||
    (isPlatformCoreMode() ? demo.collectionId || PLATFORM_CORE_DEMO.collectionId : '');
  const articleId =
    w2.articleId ||
    ctx.articleId?.trim() ||
    (isPlatformCoreMode() && contextType !== 'b2b_order'
      ? demo.demoArticleId || PLATFORM_CORE_DEMO.demoArticleId
      : '');

  const isBrandOrShop = variant === 'brand' || variant === 'shop';
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: isBrandOrShop ? ['allocation', 'operational'] : ['handoff'],
    actorRole: variant === 'brand' ? 'brand' : variant === 'shop' ? 'shop' : undefined,
    factoryId: !isBrandOrShop ? demo.factoryId : undefined,
  });

  const articleContextActive =
    contextType === 'workshop2_article' ||
    Boolean(w2.collectionId && w2.articleId) ||
    (isPlatformCoreMode() && contextType !== 'b2b_order' && Boolean(articleId));

  if (!articleContextActive || !collectionId || !articleId) return null;

  const linkClass = 'text-accent-primary text-xs font-medium hover:underline';
  const stripTestId = articleChatStripTestId(variant);
  const orderId = ctx.orderId?.trim() || spineOrderId;
  const demoCtx = {
    ...PLATFORM_CORE_DEMO,
    ...demo,
    collectionId,
    demoArticleId: articleId,
    demoOrderId: orderId,
  };

  if (variant === 'brand') {
    const factoryDossierHref = factoryProductionDossierContextHref(articleId, {
      collectionId,
      orderId,
    });
    const sampleHandoffHref = brandDevelopmentSamplePeerHref(collectionId, articleId);
    const supplierMaterialsHref = factoryMaterialsHrefForDemo(demoCtx);
    const w2Href = brandDevelopmentArticleHref(collectionId, articleId);
    const investorHref = brandDevelopmentArticleHref(collectionId, articleId, {
      section: 'overview',
    });
    const productionOpsHref = brandProductionOpsFeatureHref(
      orderId || demo.demoOrderId || PLATFORM_CORE_DEMO.demoOrderId,
      'qc-gate'
    );
    const orderCommsHref = orderId
      ? brandOrderCommsTabHref('chat', orderId, collectionId)
      : ROUTES.brand.messages;

    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1" data-testid={stripTestId}>
        <Link
          href={platformCoreUiHref(
            brandMessagesWorkshop2ArticleContextHref(collectionId, articleId),
            demoCtx
          )}
          data-testid="brand-cm-article-chat-link"
          className={linkClass}
        >
          Чат · артикул
        </Link>
        <Link
          href={platformCoreUiHref(w2Href, demoCtx)}
          data-testid="brand-cm-article-w2-link"
          className={linkClass}
        >
          W2 · карточка
        </Link>
        <Link
          href={platformCoreUiHref(factoryDossierHref, demoCtx)}
          data-testid="brand-cm-article-dossier-link"
          className={linkClass}
        >
          Досье цеха
        </Link>
        <Link
          href={platformCoreUiHref(sampleHandoffHref, demoCtx)}
          data-testid="brand-cm-article-sample-link"
          className={linkClass}
        >
          Образец в цех
        </Link>
        <Link
          href={platformCoreUiHref(supplierMaterialsHref, demoCtx)}
          data-testid="brand-cm-article-supplier-bom-link"
          className={linkClass}
        >
          BOM поставщика
        </Link>
        <Link
          href={platformCoreUiHref(investorHref, demoCtx)}
          data-testid="brand-cm-article-investor-summary-link"
          className={linkClass}
        >
          Сводка для инвестора
        </Link>
        {orderId ? (
          <Link
            href={platformCoreUiHref(orderCommsHref, demoCtx)}
            data-testid="brand-cm-article-order-comms-link"
            className={linkClass}
          >
            Чат по заказу
          </Link>
        ) : null}
        <Link
          href={platformCoreUiHref(productionOpsHref, demoCtx)}
          data-testid="brand-cm-article-production-ops-link"
          className={linkClass}
        >
          Production QC
        </Link>
      </div>
    );
  }

  if (variant === 'shop') {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1" data-testid={stripTestId}>
        <Link
          href={platformCoreUiHref(
            shopMessagesWorkshop2ArticleContextHref(collectionId, articleId),
            demoCtx
          )}
          data-testid="shop-cm-article-chat-link"
          className={linkClass}
        >
          Чат · артикул
        </Link>
        <Link
          href={platformCoreUiHref(
            `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`,
            demoCtx
          )}
          data-testid="shop-cm-article-showroom-link"
          className={linkClass}
        >
          Витрина
        </Link>
        <Link
          href={platformCoreUiHref(
            `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`,
            demoCtx
          )}
          data-testid="shop-cm-article-matrix-link"
          className={linkClass}
        >
          Матрица
        </Link>
      </div>
    );
  }

  if (variant === 'manufacturer') {
    const dossierHref = factoryProductionDossierContextHref(articleId, { collectionId, orderId });
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1" data-testid={stripTestId}>
        <Link
          href={factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
            role: 'manufacturer',
          })}
          data-testid="mfr-cm-article-chat-link"
          className={linkClass}
        >
          Чат · артикул
        </Link>
        <Link href={dossierHref} data-testid="mfr-cm-article-dossier-link" className={linkClass}>
          Досье
        </Link>
        <Link
          href={factoryMaterialsHrefForDemo(demoCtx)}
          data-testid="mfr-cm-article-materials-link"
          className={linkClass}
        >
          Материалы
        </Link>
        <Link
          href={factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId)}
          data-testid="mfr-cm-article-supplier-chat-link"
          className={linkClass}
        >
          Чат · поставщик
        </Link>
        <Link
          href={factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' })}
          data-testid="mfr-cm-article-order-chat-link"
          className={linkClass}
        >
          Чат · заказ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1" data-testid={stripTestId}>
      <Link
        href={factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId)}
        data-testid="sup-cm-article-chat-link"
        className={linkClass}
      >
        Чат · артикул
      </Link>
      <Link
        href={factoryMaterialsHrefForDemo(demoCtx)}
        data-testid="sup-cm-article-materials-dev-link"
        className={linkClass}
      >
        BOM · разработка
      </Link>
      <Link
        href={factoryMaterialsProcurementHrefForDemo(demoCtx, { role: 'supplier' })}
        data-testid="sup-cm-article-procurement-link"
        className={linkClass}
      >
        Закупка
      </Link>
      <Link
        href={factoryHandoffQueueHrefForDemo(demoCtx)}
        data-testid="sup-cm-article-handoff-link"
        className={linkClass}
      >
        Очередь передачи
      </Link>
      <Link
        href={factorySupplierMessagesB2bOrderContextHref(orderId)}
        data-testid="sup-cm-article-order-chat-link"
        className={linkClass}
      >
        Чат · заказ
      </Link>
    </div>
  );
}

/** Peer-ссылки столпа «Разработка» с экрана чата по артикулу W2. */
export function PlatformCoreArticleChatContextStrip(props: Props) {
  return (
    <Suspense fallback={null}>
      <PlatformCoreArticleChatContextStripInner {...props} />
    </Suspense>
  );
}
