'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

/**
 * Единый баннер контекста для сообщений и календаря (ядро №3): B2B-заказ + опционально коллекция/артикул/этап (ядро №1).
 *
 * Варианты: `brand` | `shop` | `manufacturer` | `supplier` — последние два делегируют панель цеха
 * в {@link PlatformCoreFactoryCommsContextBanner} и добавляют {@link CommunicationsArtifactPolicyStrip} один раз.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Factory, MessageSquare, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import {
  brandB2bOrderHref,
  brandCalendarB2bOrderContextHref,
  brandMessagesB2bOrderContextHref,
  brandMessagesWorkshop2ArticleContextHref,
  brandProductsMatrixB2bOrderContextHref,
  brandProductionOperationsB2bOrderContextHref,
  brandWorkshop2ArticleCardHref,
  shopB2bOrderHref,
  shopB2bMatrixOrderContextHref,
  shopB2bSelectionBuilderOrderContextHref,
  shopB2bWhiteboardOrderContextHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
  brandProductionFloorHref,
  ROUTES,
  type FactoryMessagesRole,
} from '@/lib/routes';
import {
  brandCalendarTasksSynthaOverlayHref,
  brandMessagesSynthaOverlayHref,
  hasCommunicationsUrlContext,
  parseSynthaOverlayContext,
  shopCalendarTasksSynthaOverlayHref,
  shopMessagesSynthaOverlayHref,
} from '@/lib/communications/syntha-overlay-context';
import { buildStagesMatrixHrefForArticle } from '@/lib/production/stages-url';
import { CommunicationsArtifactPolicyStrip } from '@/components/brand/communications/CommunicationsArtifactPolicyStrip';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';
import { PlatformCoreFactoryCommsContextBanner } from '@/components/platform/PlatformCoreFactoryCommsContextBanner';

export type CommunicationsEntityContextVariant = 'brand' | 'shop' | 'manufacturer' | 'supplier';

function isFactoryCommsVariant(
  variant: CommunicationsEntityContextVariant
): variant is FactoryMessagesRole {
  return variant === 'manufacturer' || variant === 'supplier';
}

/** manufacturer | supplier — делегирует в {@link PlatformCoreFactoryCommsContextBanner} + единая политика артефактов. */
function CommunicationsFactoryEntityContextBanner({
  variant,
  className,
  showArtifactPolicy = true,
  platformCoreWorkspace = false,
}: {
  variant: FactoryMessagesRole;
  className?: string;
  showArtifactPolicy?: boolean;
  platformCoreWorkspace?: boolean;
}) {
  const searchParams = useSearchParams();
  const hasUrlContext = hasCommunicationsUrlContext(searchParams);
  const policyStrip =
    showArtifactPolicy && !hasUrlContext ? (
      <CommunicationsArtifactPolicyStrip className="-mx-1 rounded-lg" />
    ) : null;

  return (
    <div className={cn('space-y-2', className)}>
      {hasUrlContext ? null : (
        <PlatformCoreFactoryCommsContextBanner variant={variant} slim={platformCoreWorkspace} />
      )}
      {policyStrip}
    </div>
  );
}

export function CommunicationsEntityContextBanner({
  variant,
  className,
  showWorkspaceShortcuts = true,
  showArtifactPolicy = true,
  platformCoreWorkspace = false,
}: {
  variant: CommunicationsEntityContextVariant;
  className?: string;
  showWorkspaceShortcuts?: boolean;
  /** Политика «чат не заменяет ТЗ/PO» под баннером. */
  showArtifactPolicy?: boolean;
  /** Рабочий экран столпа «Связь» с ListChrome — без дубля CTA и shortcuts. */
  platformCoreWorkspace?: boolean;
}) {
  const searchParams = useSearchParams();
  const ctx = parseSynthaOverlayContext(searchParams);
  const hasUrlContext = hasCommunicationsUrlContext(searchParams);
  const coreMode = isPlatformCoreMode();
  const urlOrderId = ctx.orderId?.trim() || '';
  const goldenFallback = PLATFORM_CORE_DEMO.demoOrderId.startsWith('__')
    ? ''
    : PLATFORM_CORE_DEMO.demoOrderId;
  const pinGoldenOrder =
    coreMode &&
    goldenFallback.startsWith('B2B-DEMO-') &&
    !urlOrderId &&
    (searchParams.get('contextType')?.trim() || '') !== 'workshop2_article';
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: pinGoldenOrder ? goldenFallback : '',
    resolveFrom: urlOrderId || pinGoldenOrder ? [] : ['allocation', 'operational'],
    actorRole: variant === 'brand' ? 'brand' : 'shop',
  });

  if (isFactoryCommsVariant(variant)) {
    return (
      <CommunicationsFactoryEntityContextBanner
        variant={variant}
        className={className}
        showArtifactPolicy={showArtifactPolicy && !platformCoreWorkspace}
        platformCoreWorkspace={platformCoreWorkspace}
      />
    );
  }
  const slimWorkspace = platformCoreWorkspace && coreMode;
  const workspaceShortcuts = showWorkspaceShortcuts && !slimWorkspace && !coreMode;
  const orderId = urlOrderId || (coreMode ? (pinGoldenOrder ? goldenFallback : spineOrderId) : '');
  const hasProduction =
    variant === 'brand' && Boolean(ctx.collectionId?.trim() && ctx.articleId?.trim());
  const hasBrandShopContext = Boolean(orderId || hasProduction);
  const policyStrip =
    showArtifactPolicy && !hasUrlContext && !slimWorkspace ? (
      <CommunicationsArtifactPolicyStrip
        className={cn(
          '-mx-1 rounded-lg',
          !hasBrandShopContext && 'mt-2',
          !hasBrandShopContext && className
        )}
      />
    ) : null;

  if (!hasBrandShopContext) {
    return policyStrip;
  }

  const orderHref = variant === 'brand' ? brandB2bOrderHref(orderId) : shopB2bOrderHref(orderId);
  const overlayPayload = {
    orderId: orderId || undefined,
    collectionId: ctx.collectionId,
    articleId: ctx.articleId,
    catalogStageId: ctx.catalogStageId,
    poRef: ctx.poRef,
    skuCode: ctx.skuCode,
  };
  const useCoreOrderCommsHrefs = coreMode && Boolean(orderId);
  const msgHref = useCoreOrderCommsHrefs
    ? variant === 'brand'
      ? brandMessagesB2bOrderContextHref(orderId)
      : shopMessagesB2bOrderContextHref(orderId)
    : variant === 'brand'
      ? brandMessagesSynthaOverlayHref(overlayPayload)
      : shopMessagesSynthaOverlayHref(overlayPayload);
  const calHref = useCoreOrderCommsHrefs
    ? variant === 'brand'
      ? brandCalendarB2bOrderContextHref(orderId)
      : shopCalendarB2bOrderContextHref(orderId)
    : variant === 'brand'
      ? brandCalendarTasksSynthaOverlayHref(overlayPayload)
      : shopCalendarTasksSynthaOverlayHref(overlayPayload);

  const matrixBrandHref = brandProductsMatrixB2bOrderContextHref(orderId);
  const prodOpsHref = brandProductionOperationsB2bOrderContextHref(orderId);
  const matrixShopHref = shopB2bMatrixOrderContextHref(orderId);
  const selectionHref = shopB2bSelectionBuilderOrderContextHref(orderId);
  const whiteboardHref = shopB2bWhiteboardOrderContextHref(orderId);

  const collectionId = ctx.collectionId?.trim() ?? '';
  const articleSeg = ctx.articleId?.trim() ?? '';
  const stagesStep = ctx.catalogStageId?.trim() ?? '';
  const matrixArticleHref =
    collectionId && articleSeg
      ? buildStagesMatrixHrefForArticle(collectionId, articleSeg, stagesStep || undefined)
      : null;
  const workshop2Href =
    collectionId && articleSeg ? brandWorkshop2ArticleCardHref(collectionId, articleSeg) : null;
  const floorStagesHref =
    collectionId && articleSeg
      ? brandProductionFloorHref('stages', { collectionId, stagesSku: articleSeg })
      : collectionId
        ? brandProductionFloorHref('stages', { collectionId })
        : null;
  const workshop2FallbackHref = `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${PLATFORM_CORE_DEMO.collectionId}`;
  const factoryDossierHref = articleSeg ? `/factory/production/dossier/${articleSeg}` : null;

  return (
    <div className={cn('space-y-2', className)}>
      {orderId ? (
        <div
          className={cn(
            o.panel,
            'border-border-default/80 flex flex-col gap-2 px-3 py-2 shadow-sm',
            !hasProduction && 'rounded-lg'
          )}
          data-testid={variant === 'brand' ? 'brand-cm-banner' : 'shop-cm-banner'}
          data-audit-legacy="b2b-order-url-context-banner"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Package className="text-accent-primary size-4 shrink-0" aria-hidden />
              <div className="min-w-0">
                <div className="text-text-muted text-[9px] font-semibold uppercase tracking-wide">
                  {slimWorkspace ? 'Заказ' : 'Контекст B2B-заказа'}
                </div>
                <div className="text-text-primary truncate font-mono text-[11px] font-semibold">
                  {orderId}
                </div>
              </div>
            </div>
            {slimWorkspace ? null : (
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
                  Календарь
                </Link>
              </div>
            )}
          </div>
          {workspaceShortcuts ? (
            <div
              className="border-border-default/60 flex max-w-full flex-wrap gap-x-2 gap-y-0.5 border-t pt-2 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
              data-testid="b2b-order-url-context-workspace-shortcuts"
            >
              {variant === 'brand' ? (
                coreMode ? (
                  <>
                    <Link
                      href={workshop2Href ?? workshop2FallbackHref}
                      className="underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {COLLECTION_DEV_HUB_TITLE_RU}
                    </Link>
                    <span className="text-border-default" aria-hidden>
                      ·
                    </span>
                    <Link
                      href={EXTENDED_ROUTES.factory.production}
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
      ) : null}

      {hasProduction ? (
        <div
          className={cn(
            o.panel,
            'border-border-default/80 flex flex-col gap-2 px-3 py-2 shadow-sm'
          )}
          data-testid="communications-production-context-banner"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Factory className="text-accent-primary size-4 shrink-0" aria-hidden />
              <div className="min-w-0">
                <div className="text-text-muted text-[9px] font-black uppercase tracking-[0.18em]">
                  {coreMode ? 'Разработка · коллекция и артикул' : 'Ядро №1 · коллекция и артикул'}
                </div>
                <div className="text-text-primary truncate text-[11px] font-semibold">
                  <span className="font-mono">{collectionId}</span>
                  {' · '}
                  <span className="font-mono">{articleSeg}</span>
                  {stagesStep ? (
                    <>
                      {' '}
                      · этап <span className="font-mono">{stagesStep}</span>
                    </>
                  ) : null}
                  {ctx.poRef ? (
                    <>
                      {' '}
                      · PO <span className="font-mono">{ctx.poRef}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            {!platformCoreWorkspace ? (
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={
                    coreMode && collectionId && articleSeg
                      ? brandMessagesWorkshop2ArticleContextHref(collectionId, articleSeg)
                      : brandMessagesSynthaOverlayHref({
                          collectionId: ctx.collectionId,
                          articleId: ctx.articleId,
                          catalogStageId: ctx.catalogStageId,
                          poRef: ctx.poRef,
                          skuCode: ctx.skuCode,
                        })
                  }
                  className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                >
                  <MessageSquare className="size-3 opacity-70" aria-hidden />
                  Чат
                </Link>
                <Link
                  href={
                    coreMode && collectionId && articleSeg
                      ? (workshop2Href ?? workshop2FallbackHref)
                      : brandCalendarTasksSynthaOverlayHref({
                          collectionId: ctx.collectionId,
                          articleId: ctx.articleId,
                          catalogStageId: ctx.catalogStageId,
                          poRef: ctx.poRef,
                          skuCode: ctx.skuCode,
                        })
                  }
                  className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                >
                  <Calendar className="size-3 opacity-70" aria-hidden />
                  {coreMode ? 'Досье W2' : 'Задачи'}
                </Link>
                {!coreMode && matrixArticleHref ? (
                  <Link
                    href={matrixArticleHref}
                    className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                  >
                    Матрица
                  </Link>
                ) : null}
                {!coreMode && workshop2Href ? (
                  <Link
                    href={workshop2Href}
                    className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                  >
                    {COLLECTION_DEV_HUB_TITLE_RU}
                  </Link>
                ) : null}
                {coreMode && factoryDossierHref ? (
                  <Link
                    href={factoryDossierHref}
                    data-testid={variant === 'brand' ? 'brand-cm-article-dossier-link' : undefined}
                    className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                  >
                    Досье цеха
                  </Link>
                ) : null}
                {!coreMode && floorStagesHref ? (
                  <Link
                    href={floorStagesHref}
                    className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
                  >
                    Пол цеха
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {policyStrip}
    </div>
  );
}
