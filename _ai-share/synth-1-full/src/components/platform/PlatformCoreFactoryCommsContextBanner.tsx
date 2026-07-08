'use client';

/**
 * Панель контекста PO / артикула на экранах цеха и поставщика (core).
 *
 * Предпочитайте {@link CommunicationsEntityContextBanner} с `variant="manufacturer"|"supplier"`
 * — там же единый {@link CommunicationsArtifactPolicyStrip} без дубля.
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Factory, MessageSquare, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import { shopB2bOrderHref, brandB2bOrderHandoffContextHref, ROUTES } from '@/lib/platform-core-routes';
import { factoryCalendarB2bOrderContextHref, factoryMessagesB2bOrderContextHref, factoryMessagesWorkshop2ArticleContextHref, factorySupplierCalendarB2bOrderContextHref } from '@/lib/platform-core-extended-routes'
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { parseSynthaOverlayContext } from '@/lib/platform-core-ports/communications/syntha-overlay-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

type Props = {
  variant: 'manufacturer' | 'supplier';
  className?: string;
  /** Только id заказа — без ряда CTA (cross-role в ListChrome). */
  slim?: boolean;
};

function parseWorkshop2ArticleFromUrl(searchParams: URLSearchParams): {
  collectionId: string | null;
  articleId: string | null;
} {
  const contextType = searchParams.get('contextType')?.trim() || '';
  const contextId = searchParams.get('contextId')?.trim() || '';
  if (contextType !== 'workshop2_article' || !contextId) {
    return { collectionId: null, articleId: null };
  }
  const sep = contextId.indexOf(':');
  if (sep <= 0) return { collectionId: null, articleId: null };
  const collectionId = contextId.slice(0, sep).trim() || null;
  const articleId = contextId.slice(sep + 1).trim() || null;
  return { collectionId, articleId };
}

function factoryCalendarRoleContextHref(orderId: string | null, role: FactoryMessagesRole): string {
  const layers = role === 'supplier' ? 'tasks,orders,logistics' : 'tasks,orders,production';
  const sp = new URLSearchParams({ role, layers });
  if (orderId) {
    sp.set('order', orderId);
    sp.set('orderId', orderId);
  }
  const base = role === 'supplier' ? EXTENDED_ROUTES.factory.calendar : EXTENDED_ROUTES.factory.productionCalendar;
  return `${base}?${sp.toString()}`;
}

/** Контекст B2B / артикула на экранах сообщений цеха/поставщика (core). */
export function PlatformCoreFactoryCommsContextBanner({ variant, className, slim = false }: Props) {
  const searchParams = useSearchParams();
  const demo = usePlatformCoreDemoContext();
  const ctx = parseSynthaOverlayContext(searchParams);
  const w2Ctx = parseWorkshop2ArticleFromUrl(searchParams);
  const coreMode = isPlatformCoreMode();
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: ['handoff'],
    factoryId: demo.factoryId,
  });
  let orderId = ctx.orderId?.trim() || (coreMode ? spineOrderId : '');
  const collectionId =
    ctx.collectionId?.trim() ||
    w2Ctx.collectionId ||
    (coreMode ? PLATFORM_CORE_DEMO.collectionId : '');
  const articleId =
    ctx.articleId?.trim() || w2Ctx.articleId || (coreMode ? PLATFORM_CORE_DEMO.demoArticleId : '');
  if (
    coreMode &&
    !orderId &&
    !w2Ctx.articleId &&
    !ctx.articleId?.trim() &&
    !ctx.contextType?.trim()
  ) {
    orderId = PLATFORM_CORE_DEMO.demoOrderId;
  }
  const roleOpt = { role: variant };

  if (!orderId && !articleId) return null;

  const dossierHref = articleId ? `/factory/production/dossier/${articleId}` : null;
  const demoCtx = {
    ...PLATFORM_CORE_DEMO,
    collectionId: collectionId || PLATFORM_CORE_DEMO.collectionId,
    demoArticleId: articleId || PLATFORM_CORE_DEMO.demoArticleId,
    demoOrderId: orderId || '',
  };
  const materialsHref =
    variant === 'supplier'
      ? orderId
        ? factoryMaterialsProcurementHrefForDemo(demoCtx)
        : factoryMaterialsHrefForDemo(demoCtx)
      : null;
  const chatHref = orderId
    ? factoryMessagesB2bOrderContextHref(orderId, roleOpt)
    : collectionId && articleId
      ? factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, roleOpt)
      : null;
  const calendarHref =
    coreMode && orderId
      ? variant === 'supplier'
        ? factorySupplierCalendarB2bOrderContextHref(orderId)
        : factoryCalendarB2bOrderContextHref(orderId)
      : factoryCalendarRoleContextHref(orderId || null, variant);
  const bannerTestId = variant === 'supplier' ? 'sup-cm-banner' : 'mfr-cm-banner';

  return (
    <div
      className={cn(o.panel, 'border-border-default/80 rounded-lg px-3 py-2 shadow-sm', className)}
      data-testid={bannerTestId}
      data-audit-legacy="platform-core-factory-comms-context-banner"
      data-variant={variant}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Package className="text-accent-primary size-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <div className="text-text-muted text-[9px] font-black uppercase tracking-[0.18em]">
              {variant === 'supplier' ? 'Контекст поставки' : 'Контекст производственного заказа'}
            </div>
            {orderId ? (
              <div className="text-text-primary truncate font-mono text-[11px] font-semibold">
                {orderId}
              </div>
            ) : (
              <div className="text-text-primary truncate text-[11px] font-semibold">
                <span className="font-mono">{collectionId}</span>
                {' · '}
                <span className="font-mono">{articleId}</span>
              </div>
            )}
          </div>
        </div>
        {slim ? null : (
          <div className="flex flex-wrap gap-1.5">
            {orderId ? (
              <>
                <Link
                  href={shopB2bOrderHref(orderId)}
                  className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
                >
                  <Package className="size-3 opacity-70" aria-hidden />
                  Заказ магазина
                </Link>
                <Link
                  href={brandB2bOrderHandoffContextHref(orderId)}
                  data-testid="mfr-cm-handoff-brand-link"
                  className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
                >
                  <Factory className="size-3 opacity-70" aria-hidden />
                  Передача в цех · бренд
                </Link>
              </>
            ) : null}
            {chatHref ? (
              <Link
                href={chatHref}
                className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
              >
                <MessageSquare className="size-3 opacity-70" aria-hidden />
                Чат
              </Link>
            ) : null}
            <Link
              href={calendarHref}
              className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
            >
              <Calendar className="size-3 opacity-70" aria-hidden />
              Календарь
            </Link>
            {dossierHref && variant === 'manufacturer' ? (
              <Link
                href={dossierHref}
                className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
              >
                Досье
              </Link>
            ) : null}
            {materialsHref ? (
              <Link
                href={materialsHref}
                className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
              >
                Материалы
              </Link>
            ) : null}
            {variant === 'manufacturer' ? (
              <>
                <Link
                  href={factoryHandoffQueueHrefForDemo(demoCtx)}
                  className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
                >
                  Очередь передачи в производство
                </Link>
                {orderId ? (
                  <Link
                    href={factoryMaterialsProcurementHrefForDemo(demoCtx)}
                    data-testid="manufacturer-to-supplier-procurement"
                    className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
                  >
                    Закупка · поставщик
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href={EXTENDED_ROUTES.factory.supplierCoreCabinet}
                className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-semibold"
              >
                Мой кабинет
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
