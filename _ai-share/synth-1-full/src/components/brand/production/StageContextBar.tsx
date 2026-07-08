'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Package, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  buildBackToStagesMatrixHref,
  buildStageTransitionHref,
  getCollectionStepById,
  getNextCollectionStep,
  getPreviousCollectionStep,
} from '@/lib/production/stages-url';
import { workshop2ArticleHrefForCatalogStep } from '@/lib/production/workshop2-core1-stage-routing';
import { COLLECTION_DEV_ARTICLE_LINK_RU } from '@/lib/production/collection-development-labels';
import { useProductionStageContext } from '@/hooks/use-production-stage-context';
import { shouldSuppressCabinetHubLayoutChrome } from '@/lib/platform-core-ui-surfaces';

function stepStatusRu(
  s: 'not_started' | 'in_progress' | 'done' | 'blocked' | 'skipped' | undefined
): string {
  switch (s) {
    case 'done':
      return 'Готово';
    case 'in_progress':
      return 'В работе';
    case 'blocked':
      return 'Блокировка';
    case 'skipped':
      return 'Пропущено';
    case 'not_started':
      return 'Не начато';
    default:
      return '—';
  }
}

/**
 * Сквозной контекст «коллекция → SKU → этап» + действия статуса (тот же flow-store, что матрица).
 * Вешается из layout бренд-центра; на матрице этапов и в разработке коллекции скрыт, чтобы не дублировать UI.
 */
export function StageContextBar() {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearch = useSearchParams();
  const {
    parsed,
    showFlowBanner,
    canSetStageStatus,
    skuPoolMismatch,
    currentStepStatus,
    markStepStatus,
  } = useProductionStageContext();

  /** Матрица этапов и карточка разработки коллекции — без дублирования контекстной шапки. */
  const hideOnProductionSubviews = useMemo(() => {
    const p = (pathname || '').replace(/\/$/, '') || '/';
    if (p === '/brand/production/workshop2' || p.startsWith('/brand/production/workshop2/c/')) {
      return true;
    }
    if (p !== '/brand/production') return false;
    return rawSearch.get('floorTab') === 'stages';
  }, [pathname, rawSearch]);

  const stepMeta = useMemo(
    () => (parsed.stagesStep ? getCollectionStepById(parsed.stagesStep) : undefined),
    [parsed.stagesStep]
  );
  const prevStep = useMemo(
    () => (parsed.stagesStep ? getPreviousCollectionStep(parsed.stagesStep) : null),
    [parsed.stagesStep]
  );
  const nextStep = useMemo(
    () => (parsed.stagesStep ? getNextCollectionStep(parsed.stagesStep) : null),
    [parsed.stagesStep]
  );

  const prevHref = useMemo(() => {
    if (!prevStep || !canSetStageStatus) return null;
    return buildStageTransitionHref(prevStep, {
      collectionId: parsed.collectionId || undefined,
      stagesSku: parsed.stagesSku || parsed.resolvedArticleId,
      productId: parsed.productId || undefined,
      sku: parsed.skuCode || undefined,
      setStagesStepTo: prevStep.id,
    });
  }, [canSetStageStatus, parsed, prevStep]);

  const nextHref = useMemo(() => {
    if (!nextStep || !canSetStageStatus) return null;
    return buildStageTransitionHref(nextStep, {
      collectionId: parsed.collectionId || undefined,
      stagesSku: parsed.stagesSku || parsed.resolvedArticleId,
      productId: parsed.productId || undefined,
      sku: parsed.skuCode || undefined,
      setStagesStepTo: nextStep.id,
    });
  }, [canSetStageStatus, parsed, nextStep]);

  /** Сквозной deep link в карточку разработки артикула по текущему этапу каталога (если этап маппится на `w2pane`). */
  const workshop2ArticleHrefFromStage = useMemo(() => {
    const col = (parsed.collectionId || '').trim();
    const art = (parsed.resolvedArticleId || '').trim();
    const step = (parsed.stagesStep || '').trim();
    if (!col || !art || !step) return null;
    return workshop2ArticleHrefForCatalogStep(col, art, step);
  }, [parsed.collectionId, parsed.resolvedArticleId, parsed.stagesStep]);

  const articleLine = useMemo(() => {
    const code = (parsed.skuCode || '').trim();
    if (code) return code;
    const id = (parsed.stagesSku || parsed.productId || '').trim();
    return id || '';
  }, [parsed.productId, parsed.skuCode, parsed.stagesSku]);

  if (shouldSuppressCabinetHubLayoutChrome()) return null;
  if (!showFlowBanner || hideOnProductionSubviews) return null;

  const backMatrixHref = buildBackToStagesMatrixHref(parsed);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="region"
        aria-label="Контекст этапа коллекции"
        className={cn(
          'border-accent-primary/30 from-accent-primary/10 sticky top-0 z-20 mb-3 rounded-xl border bg-gradient-to-r to-white px-4 py-3 shadow-sm',
          'backdrop-blur-[2px]'
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-2.5">
            <Package className="text-accent-primary mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-accent-primary text-[9px] font-black uppercase tracking-wider">
                Контекст этапа (один артикул)
              </p>
              <p className="text-text-primary text-[13px] font-bold leading-snug">
                Артикул:{' '}
                <span className="text-accent-primary font-mono text-[12px] tracking-tight">
                  {articleLine || '—'}
                </span>
              </p>
              <div className="text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                {parsed.collectionId ? (
                  <span>
                    Коллекция:{' '}
                    <strong className="text-text-primary font-semibold">
                      {parsed.collectionId}
                    </strong>
                  </span>
                ) : null}
                {stepMeta ? (
                  <span>
                    Этап:{' '}
                    <strong className="text-text-primary font-semibold">{stepMeta.title}</strong>
                  </span>
                ) : parsed.stagesStep ? (
                  <span>
                    Этап:{' '}
                    <strong className="text-text-primary font-semibold">{parsed.stagesStep}</strong>
                  </span>
                ) : null}
                {parsed.productId ? (
                  <span className="text-text-secondary">
                    id: <span className="font-mono text-[10px]">{parsed.productId}</span>
                  </span>
                ) : null}
                {canSetStageStatus ? (
                  <Badge
                    variant="outline"
                    className="border-border-default h-5 text-[9px] font-bold uppercase"
                  >
                    Статус в матрице: {stepStatusRu(currentStepStatus)}
                  </Badge>
                ) : null}
                {canSetStageStatus && skuPoolMismatch ? (
                  <span className="text-amber-700">
                    Этого артикула нет в текущем flow-документе коллекции — проверьте коллекцию или
                    матрицу.
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-accent-primary/30 h-9 shrink-0 bg-white text-[10px] font-bold uppercase tracking-wide"
              asChild
            >
              <Link href={backMatrixHref}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />К этапам
              </Link>
            </Button>

            {workshop2ArticleHrefFromStage ? (
              <Button
                variant="outline"
                size="sm"
                className="border-accent-primary/40 h-9 shrink-0 bg-white text-[10px] font-bold uppercase tracking-wide"
                asChild
              >
                <Link href={workshop2ArticleHrefFromStage}>{COLLECTION_DEV_ARTICLE_LINK_RU}</Link>
              </Button>
            ) : null}

            {canSetStageStatus ? (
              <>
                <div className="bg-border-subtle hidden h-6 w-px sm:block" aria-hidden />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 text-[10px] font-bold uppercase tracking-wide"
                  onClick={() => markStepStatus('in_progress')}
                >
                  В работе
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 bg-emerald-600 text-[10px] font-bold uppercase tracking-wide hover:bg-emerald-700"
                  onClick={() => markStepStatus('done')}
                >
                  Готово
                </Button>
                {prevHref ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-[10px] font-bold uppercase"
                    asChild
                  >
                    <Link href={prevHref}>
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden />К прошлому этапу
                    </Link>
                  </Button>
                ) : null}
                {nextHref ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-[10px] font-bold uppercase"
                    asChild
                  >
                    <Link href={nextHref}>
                      К следующему этапу
                      <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary h-9 text-[10px] font-bold uppercase"
                  onClick={() => router.back()}
                >
                  Назад
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-9 gap-1 text-[10px] font-bold uppercase opacity-60"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Правка
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-[11px]">
                    Редактирование черновика модуля — отдельный слой персистентности (без API).
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-9 gap-1 text-[10px] font-bold uppercase opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden />
                        Сохранить
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-[11px]">
                    Сохранение полей модуля подключим к одной модели данных; статус этапа уже
                    пишется в матрицу.
                  </TooltipContent>
                </Tooltip>
              </>
            ) : null}
          </div>
        </div>
        {!parsed.stagesStep && showFlowBanner ? (
          <p className="border-accent-primary/20 text-text-secondary mt-2 border-t pt-2 text-[10px]">
            Откройте этап с доски производства — в URL появится{' '}
            <span className="font-mono">stagesStep</span>, и здесь будут кнопки статуса.
          </p>
        ) : null}
        {parsed.stagesStep && !parsed.resolvedArticleId ? (
          <p className="border-accent-primary/20 mt-2 border-t pt-2 text-[10px] text-amber-800">
            В URL нет <span className="font-mono">stagesSku</span> /{' '}
            <span className="font-mono">productId</span> — выберите артикул в матрице и перейдите «В
            модуль», чтобы менять статус этапа.
          </p>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
