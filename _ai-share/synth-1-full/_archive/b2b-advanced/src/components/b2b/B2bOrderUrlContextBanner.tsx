'use client';

/**
 * Показывает контекст B2B-заказа при переходе с `?order=` / `?orderId=` — связка ядер: заказ ↔ рабочее место.
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, MessageSquare, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import {
  brandB2bOrderHref,
  brandProductsMatrixB2bOrderContextHref,
  brandProductionOperationsB2bOrderContextHref,
  factoryProductionDossierContextHref,
  factoryProductionHandoffQueueHref,
  shopB2bOrderHref,
  shopB2bMatrixOrderContextHref,
  shopB2bSelectionBuilderOrderContextHref,
  shopB2bWhiteboardOrderContextHref,
  shopB2bWorkingOrderOrderContextHref,
  ROUTES,
} from '@/lib/routes';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import {
  brandCalendarTasksSynthaOverlayHref,
  brandMessagesSynthaOverlayHref,
  parseSynthaOverlayContext,
  shopCalendarTasksSynthaOverlayHref,
  shopMessagesSynthaOverlayHref,
} from '@/lib/communications/syntha-overlay-context';

export function B2bOrderUrlContextBanner({
  variant,
  className,
  showWorkspaceShortcuts = true,
}: {
  variant: 'brand' | 'shop' | 'manufacturer';
  className?: string;
  /** Матрица · подборки · доска (shop) или матрица · операции цеха (brand). */
  showWorkspaceShortcuts?: boolean;
}) {
  const searchParams = useSearchParams();
  const overlayCtx = parseSynthaOverlayContext(searchParams);
  const orderId = overlayCtx.orderId?.trim() ?? '';
  const collectionId =
    overlayCtx.collectionId?.trim() ||
    searchParams.get('collection')?.trim() ||
    searchParams.get('w2col')?.trim() ||
    PLATFORM_CORE_DEMO.collectionId;
  const coreMode = isPlatformCoreMode();
  const workshop2Href = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}`;
  const articleId =
    overlayCtx.articleId?.trim() ||
    searchParams.get('article')?.trim() ||
    searchParams.get('articleId')?.trim() ||
    PLATFORM_CORE_DEMO.demoArticleId;
  const factoryId = searchParams.get('factoryId')?.trim() || PLATFORM_CORE_DEMO.factoryId;

  if (coreMode) {
    return (
      <div
        className={cn(
          o.panel,
          'border-border-default/80 flex flex-col gap-2 px-3 py-2 shadow-sm',
          className
        )}
        data-testid="platform-wholesale-order-context-banner"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-text-muted text-[9px] font-black uppercase tracking-[0.18em]">
              Wholesale spine · Platform Core
            </div>
            <div className="text-text-primary mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px]">
              <span>col: {collectionId}</span>
              <span className={orderId ? '' : 'text-amber-700'}>
                order: {orderId || '— (добавьте ?order=)'}
              </span>
            </div>
            {!orderId ? (
              <p
                className="text-amber-800 mt-1 text-[10px] font-medium"
                data-testid="platform-wholesale-order-context-cross-link-hint"
              >
                Cross-links с контекстом заказа отключены без <code>?order=</code>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
            {variant === 'shop' ? (
              <>
                <Link
                  href={shopB2bMatrixOrderContextHref(orderId || PLATFORM_CORE_DEMO.demoOrderId)}
                  className="border-border-subtle hover:bg-bg-surface2 rounded-md border px-2 py-1"
                >
                  Matrix
                </Link>
                <Link
                  href={shopB2bWorkingOrderOrderContextHref(
                    orderId || PLATFORM_CORE_DEMO.demoOrderId
                  )}
                  className="border-border-subtle hover:bg-bg-surface2 rounded-md border px-2 py-1"
                >
                  Working order
                </Link>
              </>
            ) : variant === 'manufacturer' ? (
              <>
                <Link
                  href={factoryProductionHandoffQueueHref(orderId || PLATFORM_CORE_DEMO.demoOrderId, {
                    collectionId,
                    factoryId,
                  })}
                  className="border-border-subtle hover:bg-bg-surface2 rounded-md border px-2 py-1"
                >
                  Очередь передачи
                </Link>
                <Link
                  href={factoryProductionDossierContextHref(articleId, { collectionId, orderId: orderId || undefined })}
                  className="border-border-subtle hover:bg-bg-surface2 rounded-md border px-2 py-1"
                >
                  Dossier
                </Link>
              </>
            ) : (
              <>
                <Link href={workshop2Href} className="border-border-subtle hover:bg-bg-surface2 rounded-md border px-2 py-1">
                  W2 dossier
                </Link>
                <Link
                  href={`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=techpack-gate`}
                  className="border-border-subtle hover:bg-bg-surface2 rounded-md border px-2 py-1"
                >
                  Гейт фабричного пакета
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /** Legacy cabinet — прежний overlay banner. */
  if (!orderId) return null;

  const orderHref = variant === 'brand' ? brandB2bOrderHref(orderId) : shopB2bOrderHref(orderId);
  const overlayPayload = {
    orderId,
    collectionId: overlayCtx.collectionId,
    articleId: overlayCtx.articleId,
    catalogStageId: overlayCtx.catalogStageId,
    poRef: overlayCtx.poRef,
    skuCode: overlayCtx.skuCode,
  };
  const msgHref =
    variant === 'brand'
      ? brandMessagesSynthaOverlayHref(overlayPayload)
      : shopMessagesSynthaOverlayHref(overlayPayload);
  const calHref =
    variant === 'brand'
      ? brandCalendarTasksSynthaOverlayHref(overlayPayload)
      : shopCalendarTasksSynthaOverlayHref(overlayPayload);

  const matrixBrandHref = brandProductsMatrixB2bOrderContextHref(orderId);
  const prodOpsHref = brandProductionOperationsB2bOrderContextHref(orderId);
  const matrixShopHref = shopB2bMatrixOrderContextHref(orderId);
  const selectionHref = shopB2bSelectionBuilderOrderContextHref(orderId);
  const whiteboardHref = shopB2bWhiteboardOrderContextHref(orderId);

  return (
    <div
      className={cn(
        o.panel,
        'border-border-default/80 flex flex-col gap-2 px-3 py-2 shadow-sm',
        className
      )}
      data-testid="b2b-order-url-context-banner"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Package className="text-accent-primary size-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <div className="text-text-muted text-[9px] font-black uppercase tracking-[0.18em]">
              Контекст B2B-заказа
            </div>
            <div className="text-text-primary truncate font-mono text-[11px] font-semibold">
              {orderId}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={orderHref}
            className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
          >
            <Package className="size-3 opacity-70" aria-hidden />
            Карточка
          </Link>
          <Link
            href={msgHref}
            className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
          >
            <MessageSquare className="size-3 opacity-70" aria-hidden />
            Чат
          </Link>
          <Link
            href={calHref}
            className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
          >
            <Calendar className="size-3 opacity-70" aria-hidden />
            Задачи
          </Link>
        </div>
      </div>
      {showWorkspaceShortcuts ? (
        <div
          className="border-border-default/60 flex max-w-full flex-wrap gap-x-2 gap-y-0.5 border-t pt-2 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
          data-testid="b2b-order-url-context-workspace-shortcuts"
        >
          {variant === 'brand' ? (
            coreMode ? (
              <>
                <Link
                  href={workshop2Href}
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  {COLLECTION_DEV_HUB_TITLE_RU}
                </Link>
                <span className="text-border-default" aria-hidden>
                  ·
                </span>
                <Link
                  href={ROUTES.factory.production}
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  Очередь цеха
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={matrixBrandHref}
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  Матрица SKU
                </Link>
                <span className="text-border-default" aria-hidden>
                  ·
                </span>
                <Link
                  href={prodOpsHref}
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  Операции цеха
                </Link>
              </>
            )
          ) : coreMode ? (
            <Link
              href={matrixShopHref}
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Матрица заказа
            </Link>
          ) : (
            <>
              <Link
                href={matrixShopHref}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Матрица
              </Link>
              <span className="text-border-default" aria-hidden>
                ·
              </span>
              <Link
                href={selectionHref}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Подборки
              </Link>
              <span className="text-border-default" aria-hidden>
                ·
              </span>
              <Link
                href={whiteboardHref}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Доска
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
