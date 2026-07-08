'use client';

import { fetchWorkshop2HubBatchScores } from '@/lib/production/workshop2-hub-batch-readiness';

import { Fragment, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowDownAZ,
  CircleAlert,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SquareSplitHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Workshop2ArticleDateFlip } from '@/components/brand/production/workshop2-article-date-flip';
import { Workshop2ArticleFacetPopover } from '@/components/brand/production/workshop2-article-facet-popover';
import type { Workshop2EditArticlePayload } from '@/components/brand/production/Workshop2CreateArticleDialog';
import {
  COLLECTION_STEP_BY_ID,
  READINESS_HELP,
  WORKSHOP2_AUDIENCE_FILTER_TITLE,
  WORKSHOP2_CAT_L1_FILTER_TITLE,
  WORKSHOP2_CAT_L2_FILTER_TITLE,
  WORKSHOP2_CAT_L3_FILTER_TITLE,
} from '@/components/brand/production/workshop2-tab-content-constants';
import type {
  Workshop2CollectionListItem,
  Workshop2CollectionMetrics,
} from '@/components/brand/production/workshop2-tab-content-model';
import {
  ensureFacetSelectionSet,
  workshop2ArticleDeletable,
  workshop2ArticleStageBucket,
} from '@/components/brand/production/workshop2-tab-content-utils';
import {
  articleMatchesWorkshop2CategoryFacets,
  collectWorkshop2AudienceOptions,
  collectWorkshop2CategoryL1Options,
  collectWorkshop2CategoryL2Options,
  collectWorkshop2CategoryL3Options,
} from '@/lib/production/workshop2-article-category-facets';
import { findHandbookLeafById, getHandbookCategoryLeaves } from '@/lib/production/category-catalog';
import {
  WORKSHOP2_PIPELINE_SAMPLES_LANE_START_INDEX,
  WORKSHOP2_PIPELINE_STEP_IDS,
  resolveWorkshop2ArticleFlowSkuKey,
  workshop2PipelineLaneForStepId,
  workshop2PipelineLaneLabelRu,
} from '@/lib/production/workshop2-collection-metrics';
import {
  aggregateSkuDoneCount,
  getSkuCurrentProcessStepId,
  type CollectionSkuFlowDoc,
} from '@/lib/production/unified-sku-flow-store';
import { isWorkshop2InternalArticleCodeValid } from '@/lib/production/local-collection-inventory';
import { cn } from '@/lib/utils';

export type Workshop2TabContentArticlesPanelNotesTarget = {
  collectionId: string;
  articleId: string;
  sku: string;
  draft: string;
};

export type Workshop2TabContentArticlesPanelEditTarget = Workshop2EditArticlePayload & {
  collectionId: string;
  displayName: string;
};

export type Workshop2TabContentArticlesPanelProps = {
  cols: Workshop2CollectionListItem[];
  w2col: string;
  metricsByCollectionId: Record<string, Workshop2CollectionMetrics>;
  getSkuFlowDoc: (collectionId: string) => CollectionSkuFlowDoc;
  getArticlePipelineProgress: (
    collectionId: string,
    articleId: string,
    skuForFlowKey?: string
  ) => { done: number; total: number; pct: number };
  articleListSort: 'sku' | 'added';
  setArticleListSort: Dispatch<SetStateAction<'sku' | 'added'>>;
  articleFacetAudience: Set<string>;
  setArticleFacetAudience: Dispatch<SetStateAction<Set<string>>>;
  articleFacetL1: Set<string>;
  setArticleFacetL1: Dispatch<SetStateAction<Set<string>>>;
  articleFacetL2: Set<string>;
  setArticleFacetL2: Dispatch<SetStateAction<Set<string>>>;
  articleFacetL3: Set<string>;
  setArticleFacetL3: Dispatch<SetStateAction<Set<string>>>;
  articleSkuFilter: string;
  setArticleSkuFilter: Dispatch<SetStateAction<string>>;
  articlePanelStageFilter: string | null;
  setArticlePanelStageFilter: Dispatch<SetStateAction<string | null>>;
  nextStepsCollectionId: string | null;
  setNextStepsCollectionId: Dispatch<SetStateAction<string | null>>;
  highlightArticleId: string | null;
  articleRowRefs: MutableRefObject<Map<string, HTMLLIElement>>;
  openArticle: (collectionId: string, row: { id: string; internalArticleCode?: string }) => void;
  setBulkCol: Dispatch<SetStateAction<{ id: string; displayName: string } | null>>;
  setBulkText: Dispatch<SetStateAction<string>>;
  setBulkOpen: Dispatch<SetStateAction<boolean>>;
  setArticleDialogCol: Dispatch<SetStateAction<{ id: string; displayName: string } | null>>;
  setArticleEditTarget: Dispatch<SetStateAction<Workshop2TabContentArticlesPanelEditTarget | null>>;
  setArticleNotesTarget: Dispatch<
    SetStateAction<Workshop2TabContentArticlesPanelNotesTarget | null>
  >;
  appendWorkshop2Activity: (message: string, actor: string) => void;
  createdByLabel: string;
  onRemoveWorkshop2Article: (collectionId: string, articleId: string) => void;
  setArchiveConfirm: Dispatch<
    SetStateAction<{ id: string; displayName: string; isSs27: boolean } | null>
  >;
};

export function Workshop2TabContentArticlesPanel({
  cols,
  w2col,
  metricsByCollectionId,
  getSkuFlowDoc,
  getArticlePipelineProgress,
  articleListSort,
  setArticleListSort,
  articleFacetAudience,
  setArticleFacetAudience,
  articleFacetL1,
  setArticleFacetL1,
  articleFacetL2,
  setArticleFacetL2,
  articleFacetL3,
  setArticleFacetL3,
  articleSkuFilter,
  setArticleSkuFilter,
  articlePanelStageFilter,
  setArticlePanelStageFilter,
  nextStepsCollectionId,
  setNextStepsCollectionId,
  highlightArticleId,
  articleRowRefs,
  openArticle,
  setBulkCol,
  setBulkText,
  setBulkOpen,
  setArticleDialogCol,
  setArticleEditTarget,
  setArticleNotesTarget,
  appendWorkshop2Activity,
  createdByLabel,
  onRemoveWorkshop2Article,
  setArchiveConfirm,
}: Workshop2TabContentArticlesPanelProps) {
  const open = w2col ? cols.find((c) => c.id === w2col) : undefined;
  if (!open) return null;
  const rowsSorted = [...open.articleRows].sort((a, b) => {
    if (articleListSort === 'sku') {
      return a.sku.localeCompare(b.sku, 'ru', { sensitivity: 'base' });
    }
    const ta = a.addedAtIso ? new Date(a.addedAtIso).getTime() : 0;
    const tb = b.addedAtIso ? new Date(b.addedAtIso).getTime() : 0;
    return tb - ta;
  });
  const facetSourceRows = open.articleRows;
  const selectedL1 = articleFacetL1.size === 1 ? [...articleFacetL1][0] : undefined;
  const selectedL2 = articleFacetL2.size === 1 ? [...articleFacetL2][0] : undefined;
  const audienceOpts = collectWorkshop2AudienceOptions(facetSourceRows);
  const l1Opts = collectWorkshop2CategoryL1Options(facetSourceRows);
  const l2Opts = collectWorkshop2CategoryL2Options(facetSourceRows, selectedL1);
  const l3Opts = collectWorkshop2CategoryL3Options(facetSourceRows, selectedL1, selectedL2);
  const facAud = ensureFacetSelectionSet(articleFacetAudience);
  const facL1 = ensureFacetSelectionSet(articleFacetL1);
  const facL2 = ensureFacetSelectionSet(articleFacetL2);
  const facL3 = ensureFacetSelectionSet(articleFacetL3);
  const facetFiltered = rowsSorted.filter((r) =>
    articleMatchesWorkshop2CategoryFacets(r, {
      audience: facAud,
      l1: facL1,
      l2: facL2,
      l3: facL3,
    })
  );
  const q = articleSkuFilter.trim().toLowerCase();
  const filteredRows =
    q.length > 0
      ? facetFiltered.filter(
          (r) =>
            r.sku.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.commentPreview?.toLowerCase().includes(q)
        )
      : facetFiltered;
  const panelMetrics = metricsByCollectionId[open.id] ?? {
    status: 'draft' as const,
    progressPct: 0,
    articleCount: 0,
  };
  const flowDoc = getSkuFlowDoc(open.id);
  const articleIds = rowsSorted.map((r) => r.id);
  return (
    <div className="mt-4 w-full min-w-0">
      <Card
        className={cn(
          'border-accent-primary/20 w-full bg-white',
          open.panelAccentHex ? 'border-l-[5px]' : ''
        )}
        style={open.panelAccentHex ? { borderLeftColor: open.panelAccentHex } : undefined}
      >
        <CardHeader className="space-y-0 pb-2">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0">
              <CardTitle className="text-sm uppercase tracking-tight">
                Артикулы · {open.displayName}
              </CardTitle>
              <CardDescription className="hidden text-xs sm:block">
                Слева — разработка и ТЗ по каталогу, справа — сэмплы и выпуск. Клик по столбцу
                подсвечивает артикулы, у которых по матрице открыт этот этап.
              </CardDescription>
            </div>
            <div
              className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-w-0 flex-wrap items-end gap-1.5 sm:gap-2">
                <Workshop2ArticleFacetPopover
                  label="Аудитория"
                  compactLabel="Ауд"
                  title={WORKSHOP2_AUDIENCE_FILTER_TITLE}
                  options={audienceOpts}
                  selected={articleFacetAudience}
                  onSelectedChange={setArticleFacetAudience}
                  triggerId={`w2-art-aud-${open.id}`}
                />
                <Workshop2ArticleFacetPopover
                  label="Ур. 1"
                  compactLabel="1"
                  title={WORKSHOP2_CAT_L1_FILTER_TITLE}
                  options={l1Opts}
                  selected={articleFacetL1}
                  onSelectedChange={setArticleFacetL1}
                  triggerId={`w2-art-l1-${open.id}`}
                />
                <Workshop2ArticleFacetPopover
                  label="Ур. 2"
                  compactLabel="2"
                  title={WORKSHOP2_CAT_L2_FILTER_TITLE}
                  options={l2Opts}
                  selected={articleFacetL2}
                  onSelectedChange={setArticleFacetL2}
                  triggerId={`w2-art-l2-${open.id}`}
                />
                <Workshop2ArticleFacetPopover
                  label="Ур. 3"
                  compactLabel="3"
                  title={WORKSHOP2_CAT_L3_FILTER_TITLE}
                  options={l3Opts}
                  selected={articleFacetL3}
                  onSelectedChange={setArticleFacetL3}
                  triggerId={`w2-art-l3-${open.id}`}
                />
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-text-primary h-9 min-h-9 w-9 shrink-0 p-0 sm:w-auto sm:px-2"
                      aria-label="Сбросить фильтры"
                      onClick={() => {
                        setArticleFacetAudience(new Set());
                        setArticleFacetL1(new Set());
                        setArticleFacetL2(new Set());
                        setArticleFacetL3(new Set());
                      }}
                    >
                      <RotateCcw className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />
                      <span className="hidden text-[9px] font-bold uppercase sm:inline">
                        Сбросить фильтр
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="sm:hidden">
                    Сбросить фильтры
                  </TooltipContent>
                </Tooltip>
                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-text-primary h-9 min-h-9 w-9 shrink-0 p-0 sm:hidden"
                          aria-label="Сортировка списка"
                        >
                          <ArrowDownAZ className="h-4 w-4" aria-hidden />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="sm:hidden">
                      Сортировка
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent align="end" className="w-44 p-1">
                    <button
                      type="button"
                      className={cn(
                        'hover:bg-bg-surface2 w-full rounded-md px-2 py-1.5 text-left text-[11px] font-medium',
                        articleListSort === 'sku' && 'bg-accent-primary/10 text-accent-primary'
                      )}
                      onClick={() => setArticleListSort('sku')}
                    >
                      SKU A→Я
                    </button>
                    <button
                      type="button"
                      className={cn(
                        'hover:bg-bg-surface2 w-full rounded-md px-2 py-1.5 text-left text-[11px] font-medium',
                        articleListSort === 'added' && 'bg-accent-primary/10 text-accent-primary'
                      )}
                      onClick={() => setArticleListSort('added')}
                    >
                      Дата добавления
                    </button>
                  </PopoverContent>
                </Popover>
                <div className="hidden shrink-0 flex-col gap-0.5 sm:flex">
                  <Label
                    htmlFor={`w2-art-sort-${open.id}`}
                    className="text-text-secondary whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide"
                  >
                    Сортировка
                  </Label>
                  <select
                    id={`w2-art-sort-${open.id}`}
                    value={articleListSort}
                    onChange={(e) =>
                      setArticleListSort(e.target.value === 'added' ? 'added' : 'sku')
                    }
                    className="border-border-default text-text-primary h-9 w-[7.5rem] cursor-pointer rounded-md border bg-white px-1.5 text-[10px] font-semibold"
                  >
                    <option value="sku">SKU A→Я</option>
                    <option value="added">Дата добавления</option>
                  </select>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 min-h-9 w-9 shrink-0 p-0 sm:w-auto sm:gap-1 sm:px-2"
                      data-testid="brand-w2-bulk-import-btn"
                      aria-label="Массовый импорт"
                      onClick={() => {
                        setBulkCol({ id: open.id, displayName: open.displayName });
                        setBulkText('');
                        setBulkOpen(true);
                      }}
                    >
                      <Upload className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="hidden text-[10px] font-bold uppercase sm:inline">
                        Массово
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="sm:hidden">
                    Массовый импорт
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 min-h-9 w-9 shrink-0 p-0 sm:w-auto sm:px-3"
                      aria-label="Создать артикул"
                      onClick={() => {
                        setArticleEditTarget(null);
                        setArticleDialogCol({ id: open.id, displayName: open.displayName });
                      }}
                    >
                      <Plus className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="hidden text-[10px] font-bold uppercase sm:inline">
                        Создать артикул
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="sm:hidden">
                    Создать артикул
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full min-w-0 space-y-3">
          {nextStepsCollectionId === open.id ? (
            <div
              className="rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-[11px] text-emerald-950"
              role="status"
            >
              <p className="mb-1.5 text-[12px] font-bold">Что дальше</p>
              <ul className="mb-2 list-disc space-y-0.5 pl-4">
                <li>Добавьте первый артикул (кнопка выше).</li>
                <li>При желании загрузите обложку карточки коллекции в списке слева.</li>
                <li>Закрепите подборку гвоздиком, если она главная сейчас.</li>
              </ul>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 text-[10px]"
                onClick={() => setNextStepsCollectionId(null)}
              >
                Понятно, скрыть
              </Button>
            </div>
          ) : null}
          <div className="border-accent-primary/20 bg-accent-primary/10 w-full min-w-0 space-y-2 rounded-lg border px-3 py-2.5">
            <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-text-primary shrink-0 text-[11px] font-semibold">
                Общая готовность
              </span>
              <span className="text-accent-primary shrink-0 text-lg font-black tabular-nums leading-none">
                {panelMetrics.progressPct}%
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-text-muted hover:text-accent-primary focus-visible:ring-accent-primary shrink-0 rounded-full p-0.5 focus:outline-none focus-visible:ring-2"
                    aria-label="Как считается готовность"
                  >
                    <CircleAlert className="h-4 w-4" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[260px] text-[11px] leading-snug">
                  {READINESS_HELP}
                </TooltipContent>
              </Tooltip>
            </div>
            {rowsSorted.length === 0 ? null : (
              <div
                className="border-accent-primary/20 w-full min-w-0 rounded-md border bg-white/80 p-1.5"
                data-testid="brand-dev-w2-hub-gates-strip"
              >
                <div className="max-md:overflow-x-auto max-md:pb-0.5">
                  <div className="flex flex-wrap items-end gap-1 max-md:flex-nowrap">
                    {WORKSHOP2_PIPELINE_STEP_IDS.map((sid, idx) => {
                      const step = COLLECTION_STEP_BY_ID.get(sid);
                      const n = articleIds.length;
                      const done = aggregateSkuDoneCount(flowDoc, articleIds, sid);
                      const fillPct = n ? Math.round((done / n) * 100) : 0;
                      const active = articlePanelStageFilter === sid;
                      const split = WORKSHOP2_PIPELINE_SAMPLES_LANE_START_INDEX;
                      const showLaneSep =
                        idx === split && split > 0 && split < WORKSHOP2_PIPELINE_STEP_IDS.length;
                      const laneHint = idx < split ? 'Разработка и ТЗ' : 'Сэмплы и выпуск';
                      return (
                        <Fragment key={sid}>
                          {showLaneSep ? (
                            <div
                              className="flex h-11 w-1 shrink-0 flex-col items-center justify-end px-0.5"
                              role="separator"
                              aria-orientation="vertical"
                              aria-label="Разработка и ТЗ · сэмплы и выпуск"
                            >
                              <div className="bg-border-default h-9 w-px" />
                            </div>
                          ) : null}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  'flex h-11 w-8 shrink-0 flex-col items-stretch justify-end rounded-sm border px-0.5 pb-0.5 transition-colors',
                                  active
                                    ? 'border-accent-primary bg-accent-primary/15 shadow-sm'
                                    : 'border-border-default/90 hover:border-border-default hover:bg-bg-surface2 bg-white'
                                )}
                                aria-pressed={active}
                                aria-label={`${step?.title ?? sid}: закрыли этап ${done} из ${n}`}
                                onClick={() =>
                                  setArticlePanelStageFilter((prev) => (prev === sid ? null : sid))
                                }
                              >
                                <div className="bg-border-subtle/90 relative mx-auto mt-1 flex h-7 w-5 flex-1 overflow-hidden rounded-sm">
                                  <div
                                    className="bg-accent-primary absolute bottom-0 left-0 right-0 transition-all"
                                    style={{ height: `${fillPct}%` }}
                                  />
                                </div>
                                <span className="text-text-secondary text-center text-[8px] font-bold tabular-nums">
                                  {idx + 1}
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[260px] text-[11px] leading-snug"
                            >
                              <p className="font-semibold">{step?.title ?? sid}</p>
                              <p className="text-text-secondary">{laneHint}</p>
                              <p className="text-text-secondary">
                                Закрыли этап: {done}/{n} арт.
                              </p>
                              <p className="text-text-secondary mt-1">
                                Повторный клик снимает подсветку строк.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
                {WORKSHOP2_PIPELINE_SAMPLES_LANE_START_INDEX > 0 &&
                WORKSHOP2_PIPELINE_SAMPLES_LANE_START_INDEX < WORKSHOP2_PIPELINE_STEP_IDS.length ? (
                  <div className="text-text-muted mt-1.5 flex w-full min-w-0 flex-wrap justify-between gap-x-2 gap-y-0.5 text-[9px] leading-tight">
                    <span>Разработка: этапы 1–{WORKSHOP2_PIPELINE_SAMPLES_LANE_START_INDEX}</span>
                    <span className="text-right">
                      Сэмплы и выпуск: этапы {WORKSHOP2_PIPELINE_SAMPLES_LANE_START_INDEX + 1}–
                      {WORKSHOP2_PIPELINE_STEP_IDS.length}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
            {articlePanelStageFilter ? (
              <p className="text-accent-primary/90 text-[10px]">
                Подсветка ·{' '}
                {workshop2PipelineLaneForStepId(articlePanelStageFilter) === 'development'
                  ? 'контур разработки'
                  : 'контур сэмплов'}
                : артикулы, у которых по матрице текущий открытый этап — «
                {COLLECTION_STEP_BY_ID.get(articlePanelStageFilter)?.title ??
                  articlePanelStageFilter}
                ».
              </p>
            ) : null}
          </div>

          {rowsSorted.length >= 10 ? (
            <div className="relative">
              <Search
                className="text-text-muted pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                aria-hidden
              />
              <Input
                value={articleSkuFilter}
                onChange={(e) => setArticleSkuFilter(e.target.value)}
                placeholder="Поиск по SKU, названию…"
                className="h-9 pl-8 text-xs"
                aria-label="Поиск по списку артикулов"
              />
            </div>
          ) : null}

          {rowsSorted.length === 0 ? (
            <p className="text-text-secondary py-4 text-center text-sm">
              В подборке пока нет артикулов.
            </p>
          ) : filteredRows.length === 0 ? (
            <p className="text-text-secondary py-4 text-center text-sm">
              {facetFiltered.length === 0 && rowsSorted.length > 0
                ? 'Нет артикулов по выбранным фильтрам аудитории и категорий.'
                : 'Ничего не найдено.'}
            </p>
          ) : (
            <ul className="divide-border-subtle border-border-subtle divide-y overflow-hidden rounded-xl border">
              {filteredRows.map((row) => {
                const flowSkuKey = resolveWorkshop2ArticleFlowSkuKey(flowDoc, row);
                const prog = getArticlePipelineProgress(open.id, row.id, row.sku);
                const stagesIdle = prog.total > 0 && prog.done === 0;
                const isHighlight = highlightArticleId === row.id;
                const currentStepId = getSkuCurrentProcessStepId(
                  flowDoc,
                  flowSkuKey,
                  WORKSHOP2_PIPELINE_STEP_IDS
                );
                const stageHighlight =
                  articlePanelStageFilter !== null && currentStepId === articlePanelStageFilter;
                const stageBucket = workshop2ArticleStageBucket(
                  flowDoc,
                  flowSkuKey,
                  WORKSHOP2_PIPELINE_STEP_IDS
                );
                const deletable = workshop2ArticleDeletable(
                  flowDoc,
                  flowSkuKey,
                  WORKSHOP2_PIPELINE_STEP_IDS,
                  prog
                );
                const pipelineLane = workshop2PipelineLaneForStepId(currentStepId);
                const openArticleAriaLabel = (() => {
                  const base = row.name?.trim()
                    ? `Открыть артикул ${row.sku}, ${row.name.trim()}`
                    : `Открыть артикул ${row.sku}`;
                  if (prog.total === 0) return `${base}. Этапы по матрице не заданы.`;
                  return `${base}. Готовность по этапам ${prog.pct}%, ${prog.done} из ${prog.total}. Текущий контур: ${workshop2PipelineLaneLabelRu(pipelineLane)}.`;
                })();
                return (
                  <li
                    key={row.id}
                    ref={(node) => {
                      if (node) articleRowRefs.current.set(row.id, node);
                      else articleRowRefs.current.delete(row.id);
                    }}
                    className="flex min-w-0 flex-col md:flex-row md:items-stretch md:gap-2"
                  >
                    <button
                      type="button"
                      aria-label={openArticleAriaLabel}
                      className={cn(
                        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-3 text-left transition-colors max-md:min-h-11 md:flex-row md:items-stretch md:justify-between md:gap-2',
                        'hover:bg-accent-primary/10 active:bg-accent-primary/15',
                        isHighlight && 'bg-amber-50/90 ring-2 ring-inset ring-amber-200/90',
                        stageHighlight &&
                          'bg-accent-primary/10 ring-accent-primary/40 ring-2 ring-inset'
                      )}
                      onClick={() => openArticle(open.id, row)}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-text-primary font-mono text-[12px] font-bold">
                            {row.sku}
                          </p>
                          {isWorkshop2InternalArticleCodeValid(row.internalArticleCode) ? (
                            <span className="border-border-default text-text-secondary rounded border bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums">
                              id {row.internalArticleCode}
                            </span>
                          ) : null}
                          {row.articleOrigin === 'new' ? (
                            <Badge
                              variant="secondary"
                              className="h-5 border-emerald-200 bg-emerald-100 px-1.5 text-[8px] font-black uppercase text-emerald-900"
                            >
                              New
                            </Badge>
                          ) : row.articleOrigin === 'base' ? (
                            <Badge
                              variant="outline"
                              className="border-border-default text-text-primary h-5 px-1.5 text-[8px] font-black uppercase"
                            >
                              Base
                            </Badge>
                          ) : null}
                          {stageBucket === 'not_started' ? (
                            <Badge
                              variant="secondary"
                              className="bg-bg-surface2 text-text-primary border-border-default h-5 px-1.5 text-[8px] font-semibold normal-case"
                            >
                              Ещё не начат
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="h-5 border-amber-200 bg-amber-50 px-1.5 text-[8px] font-semibold normal-case text-amber-900"
                            >
                              В работе
                            </Badge>
                          )}
                          {prog.total > 0 ? (
                            <Badge
                              variant="outline"
                              title="По матрице этапов: текущий открытый этап — контур разработки (до supply-path) или сэмплов (от supply-path)"
                              className={cn(
                                'h-5 px-1.5 text-[8px] font-bold normal-case',
                                pipelineLane === 'development'
                                  ? 'border-indigo-200 bg-indigo-50 text-indigo-950'
                                  : 'border-teal-200 bg-teal-50 text-teal-950'
                              )}
                            >
                              {workshop2PipelineLaneLabelRu(pipelineLane)}
                            </Badge>
                          ) : null}
                          {row.attachmentCount ? (
                            <span
                              className="text-text-secondary inline-flex items-center gap-0.5 text-[9px]"
                              title={`Вложений: ${row.attachmentCount}`}
                            >
                              <Paperclip className="h-3 w-3 shrink-0" aria-hidden />
                              <span className="tabular-nums">{row.attachmentCount}</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="border-border-subtle/90 mt-0.5 w-full border-t pt-1.5 min-[400px]:hidden">
                          <Workshop2ArticleDateFlip
                            addedAtIso={row.addedAtIso}
                            updatedAtIso={row.updatedAtIso}
                          />
                        </div>
                      </div>
                      <div className="border-border-subtle hidden w-[6.75rem] shrink-0 flex-col justify-center border-l px-2 text-right md:flex">
                        <Workshop2ArticleDateFlip
                          addedAtIso={row.addedAtIso}
                          updatedAtIso={row.updatedAtIso}
                        />
                      </div>
                      <div className="border-border-subtle flex w-full shrink-0 flex-row items-center justify-between gap-2 border-t pt-2 md:w-[7.5rem] md:min-w-[7rem] md:flex-col md:items-end md:justify-center md:gap-1.5 md:border-l md:border-t-0 md:pl-2 md:pr-1 md:pt-0">
                        {prog.total === 0 ? (
                          <span className="text-text-secondary w-full break-words text-right text-[9px] font-semibold leading-tight">
                            Нет этапов
                          </span>
                        ) : stagesIdle ? (
                          <span className="text-text-secondary w-full break-words text-right text-[9px] font-semibold leading-tight">
                            Этапы не начаты
                          </span>
                        ) : (
                          <span className="text-accent-primary text-lg font-black tabular-nums leading-none max-md:text-base">
                            {prog.pct}%
                          </span>
                        )}
                        <Progress
                          value={prog.pct}
                          className="h-1.5 w-full max-md:max-w-[8rem]"
                          aria-label={
                            prog.total === 0
                              ? 'Прогресс по этапам не задан'
                              : `Закрыто этапов по матрице коллекции: ${prog.done} из ${prog.total}, ${prog.pct}%`
                          }
                        />
                        <span className="text-text-muted text-right text-[8px] uppercase leading-tight tracking-tighter">
                          Этапы {prog.done}/{prog.total}
                        </span>
                      </div>
                    </button>
                    <div className="border-border-subtle bg-bg-surface2/80 relative z-[1] flex w-full min-w-0 shrink-0 flex-row items-center justify-end gap-1 border-t py-2 pl-2 pr-3 md:w-[6rem] md:min-w-[6rem] md:flex-col md:gap-1 md:border-l md:border-t-0 md:py-2 md:pr-1">
                      <div className="flex flex-row items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-text-secondary hover:text-accent-primary h-9 min-h-11 w-9 min-w-11 shrink-0 p-0 md:h-7 md:min-h-7 md:w-7 md:min-w-7"
                          aria-label="Заметки по артикулу"
                          title="Заметки по артикулу (локально в браузере)"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setArticleNotesTarget({
                              collectionId: open.id,
                              articleId: row.id,
                              sku: row.sku,
                              draft: row.workshopComment ?? '',
                            });
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-text-secondary hover:text-accent-primary h-9 min-h-11 w-9 min-w-11 shrink-0 p-0 md:h-7 md:min-h-7 md:w-7 md:min-w-7"
                              aria-label="Редактировать артикул"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setArticleDialogCol(null);
                                const leafFromRow = row.categoryLeafId?.trim();
                                const validLeaf =
                                  leafFromRow && findHandbookLeafById(leafFromRow)
                                    ? leafFromRow
                                    : (getHandbookCategoryLeaves()[0]?.leafId ?? '');
                                setArticleEditTarget({
                                  collectionId: open.id,
                                  displayName: open.displayName,
                                  articleId: row.id,
                                  sku: row.sku,
                                  name: row.name,
                                  comment: row.workshopComment ?? '',
                                  categoryLeafId: validLeaf,
                                  workshopAttachments: row.workshopAttachments?.length
                                    ? row.workshopAttachments.map((a) => ({ ...a }))
                                    : [],
                                  workshopTags: row.workshopTags?.length
                                    ? [...row.workshopTags]
                                    : undefined,
                                  workshopLineSeason: row.workshopLineSeason?.trim() ?? '',
                                });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px] text-[11px]">
                            Как при «Создать артикул»: название, категория, комментарий, файлы
                          </TooltipContent>
                        </Tooltip>
                        {deletable ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 min-h-11 w-9 min-w-11 shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-800 md:h-7 md:min-h-7 md:w-7 md:min-w-7"
                                aria-label={`Удалить артикул ${row.sku} из подборки`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (
                                    !globalThis.confirm(
                                      `Удалить артикул ${row.sku} из подборки? Данные исчезнут из этого браузера.`
                                    )
                                  ) {
                                    return;
                                  }
                                  appendWorkshop2Activity(
                                    `Удалён артикул ${row.sku} · коллекция «${open.displayName}»`,
                                    createdByLabel
                                  );
                                  onRemoveWorkshop2Article(open.id, row.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-[11px]">
                              Удалить из подборки
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                      </div>
                      {!deletable ? (
                        <div className="border-border-subtle/80 flex flex-col gap-1 border-t pt-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-0.5 px-1 text-[8px] font-bold uppercase leading-tight"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  appendWorkshop2Activity(
                                    `Запрос деления задач · ${row.sku} · «${open.displayName}»`,
                                    createdByLabel
                                  );
                                }}
                              >
                                <SquareSplitHorizontal className="h-3 w-3 shrink-0" aria-hidden />
                                Деление
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[200px] text-[11px]">
                              Зафиксировано в истории. Разбиение задач по этапам подключим в модуле
                              изделия.
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-text-secondary hover:text-text-primary h-7 px-1 text-[8px] font-semibold"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setArchiveConfirm({
                                id: open.id,
                                displayName: open.displayName,
                                isSs27: open.kind === 'ss27',
                              });
                            }}
                          >
                            Архив коллекции
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
