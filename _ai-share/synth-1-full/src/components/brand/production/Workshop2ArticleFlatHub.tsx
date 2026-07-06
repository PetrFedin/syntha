'use client';

import { fetchWorkshop2LiveIntegrationProbes } from '@/lib/production/workshop2-live-integration-probes-client';
import { summarizeWorkshop2HubIntegrationHealthChip } from '@/lib/production/workshop2-hub-integration-health';
import { fetchWorkshop2HubBatchScores } from '@/lib/production/workshop2-hub-batch-readiness';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState, FilterToolbar } from '@/components/design-system';
import { CircleCheck, Package, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isWorkshop2InternalArticleCodeValid } from '@/lib/production/local-collection-inventory';
import {
  resolveWorkshop2ArticleFlowSkuKey,
  skuPipelineStepProgress,
} from '@/lib/production/workshop2-collection-metrics';
import {
  getWorkshop2HubCardFinalization,
  type Workshop2HubCardFinalization,
} from '@/lib/production/workshop2-hub-card-finalization';
import { loadWorkshop2Phase1DossierMap } from '@/lib/production/workshop2-phase1-dossier-storage';
import {
  collectWorkshop2CategoryL1Options,
  collectWorkshop2CategoryL2Options,
  collectWorkshop2CategoryL3Options,
  enrichWorkshop2ArticleRowFacets,
} from '@/lib/production/workshop2-article-category-facets';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { CollectionSkuFlowDoc } from '@/lib/production/unified-sku-flow-store';
import type { Workshop2ArticleRow, Workshop2CollectionListItem } from './Workshop2TabContent';

const W2_HUB_FILTER_SELECT =
  'border-border-default text-text-primary h-9 w-full min-w-0 rounded-md border bg-background px-1.5 text-[11px] transition-colors focus:outline-none focus-visible:border-accent-primary/40 focus-visible:ring-1 focus-visible:ring-accent-primary/20 sm:h-8';

const W2_HUB_FILTER_INPUT =
  'h-9 min-w-0 text-xs focus-visible:border-accent-primary/40 focus-visible:ring-1 focus-visible:ring-accent-primary/20 sm:h-8';

/** Не дублировать в «аудитория · сезон» то же, что в названии подборки/её целевом сезоне. */
function lineSeasonLabelForCard(
  season: string | undefined,
  collectionId: string,
  collectionName: string,
  collectionTargetSeason?: string
): string {
  const s = season?.trim();
  if (!s) return '';
  if (s === collectionId) return '';
  const ts = collectionTargetSeason?.trim();
  if (ts && s.toLowerCase() === ts.toLowerCase()) return '';
  if (collectionName) {
    const n = collectionName.trim();
    if (s.toLowerCase() === n.toLowerCase()) return '';
    // «Подборка SS27» / похожие подписи: не повторяем тот же код в строке с аудиторией.
    if (n.toLowerCase().includes(s.toLowerCase()) && s.length >= 4) return '';
  }
  return s;
}

/** Подпись «группы» в хабе из целевого канала подборки (карточка коллекции). */
function hubGroupTagFromTargetChannel(targetChannel: string | undefined): string | undefined {
  const t = targetChannel?.trim();
  if (!t) return undefined;
  return t.startsWith('#') ? t : `#${t}`;
}

/**
 * Аудитория в карточке хаба: всегда показываем выбранный сегмент; если не задана — «—».
 * «Каталог» из снапшота не показываем как подпись; пытаемся вывести сегмент по модели / SKU.
 */
function audienceLineForFlatHubCard(row: Workshop2ArticleRow): string {
  const raw = row.audienceLabel?.trim() || '';
  if (raw && raw.toLowerCase() !== 'каталог') return raw;
  const n = (row.name ?? '').toLowerCase();
  if (/\bмужск/.test(n)) return 'Мужское';
  if (/\bженск/.test(n)) return 'Женское';
  if (/\bунисекс/.test(n)) return 'Унисекс';
  if (/\bдетск|мальчик|девочк|малыш|новорожд/.test(n)) return 'Детское';
  if (/плать|сарафан|юбк/i.test(n)) return 'Женское';
  const skuU = (row.sku ?? '').toUpperCase();
  if (/-W-/.test(skuU)) return 'Женское';
  if (/-M-/.test(skuU)) return 'Мужское';
  return '—';
}

export type ArticleHubEntry = {
  collectionId: string;
  collectionName: string;
  /** Целевой сезон подборки (если задан на карточке коллекции). */
  collectionTargetSeason?: string;
  /**
   * Визуальная группа (как тег) из `targetChannel` подборки.
   * См. карточку коллекции — поле «Канал / рынок».
   */
  hubGroupTagLabel?: string;
  row: Workshop2ArticleRow;
  progressPct: number;
  isComplete: boolean;
  hubFinalization: Workshop2HubCardFinalization;
};

function normalizedArticleModelName(name: string): string {
  const t = name.trim();
  if (t === 'Мужское пальто (шерсть)') return 'Шерстяное пальто';
  if (t === 'Платье миди (хлопок)') return 'Хлопковое платье миди';
  return t;
}

type Props = {
  /** Все подборки, по которым строим плоский список артикулов */
  collections: Workshop2CollectionListItem[];
  getSkuFlowDoc: (collectionId: string) => CollectionSkuFlowDoc;
  onOpenArticle: (collectionId: string, row: Workshop2ArticleRow) => void;
  /** Редактирование карточки (тот же диалог, что в списке по коллекции). */
  onEditArticle: (collectionId: string, row: Workshop2ArticleRow) => void;
  onCreateArticle: () => void;
  /** Какие карточки попадают в выборку до поиска/тегов: все / не завершены / 100% этапов. */
  articleStatusFilter: 'all' | 'in_work' | 'done';
  /** Platform Core embedded hub — широкие карточки, без 3 колонок в узкой рабочей области. */
  embeddedHub?: boolean;
};

function buildEntries(
  collections: Workshop2CollectionListItem[],
  getSkuFlowDoc: (collectionId: string) => CollectionSkuFlowDoc,
  dossierMap: Record<string, Workshop2DossierPhase1>
): ArticleHubEntry[] {
  const out: ArticleHubEntry[] = [];
  for (const col of collections) {
    const doc = getSkuFlowDoc(col.id);
    const hubGroupTagLabel = hubGroupTagFromTargetChannel(col.targetChannel);
    for (const row of col.articleRows) {
      const enrichedRow = enrichWorkshop2ArticleRowFacets(col.id, row, dossierMap);
      const skuKey = resolveWorkshop2ArticleFlowSkuKey(doc, enrichedRow);
      const { pct } = skuPipelineStepProgress(doc, skuKey);
      const ts = col.targetSeason?.trim();
      out.push({
        collectionId: col.id,
        collectionName: col.displayName,
        ...(ts ? { collectionTargetSeason: ts } : {}),
        ...(hubGroupTagLabel ? { hubGroupTagLabel } : {}),
        row: enrichedRow,
        progressPct: pct,
        isComplete: pct >= 100,
        hubFinalization: getWorkshop2HubCardFinalization(col.id, enrichedRow.id, dossierMap),
      });
    }
  }
  return out;
}

const ARTICLE_FILTER_ALL = '__all__' as const;

function formatFinalizedAtTooltip(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

void fetchWorkshop2HubBatchScores;
export function Workshop2ArticleFlatHub({
  /** fetchWorkshop2LiveIntegrationProbes + summarizeWorkshop2HubIntegrationHealthChip */

  collections,
  getSkuFlowDoc,
  onOpenArticle,
  onEditArticle,
  onCreateArticle,
  articleStatusFilter,
  embeddedHub = false,
}: Props) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<Set<string>>(() => new Set());
  const [articleFilter, setArticleFilter] = useState<string>(ARTICLE_FILTER_ALL);
  const [catL1, setCatL1] = useState('');
  const [catL2, setCatL2] = useState('');
  const [catL3, setCatL3] = useState('');
  /** Перечитываем досье/бандл с диска после возврата на хаб или фокуса окна. */
  const [hubCardStateDigest, setHubCardStateDigest] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setHubCardStateDigest((n) => n + 1);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => setHubCardStateDigest((n) => n + 1);
    const onVis = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', bump);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const allEntries = useMemo(() => {
    const dossierMap = typeof window !== 'undefined' ? loadWorkshop2Phase1DossierMap() : {};
    return buildEntries(collections, getSkuFlowDoc, dossierMap);
  }, [collections, getSkuFlowDoc, hubCardStateDigest]);

  const scopeEntries = useMemo(() => {
    if (articleStatusFilter === 'all') return allEntries;
    if (articleStatusFilter === 'in_work') return allEntries.filter((e) => !e.isComplete);
    return allEntries.filter((e) => e.isComplete);
  }, [allEntries, articleStatusFilter]);

  const facetRows = useMemo(() => allEntries.map((e) => e.row), [allEntries]);

  const l1Options = useMemo(() => collectWorkshop2CategoryL1Options(facetRows), [facetRows]);

  const l2Options = useMemo(
    () => collectWorkshop2CategoryL2Options(facetRows, catL1),
    [facetRows, catL1]
  );

  const l3Options = useMemo(
    () => collectWorkshop2CategoryL3Options(facetRows, catL1, catL2),
    [facetRows, catL1, catL2]
  );

  const articleOptions = useMemo(() => {
    return scopeEntries
      .map((e) => ({
        value: `${e.collectionId}::${e.row.id}`,
        label: `${e.row.sku} — ${(e.row.name || '').trim() || 'без названия'}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [scopeEntries]);

  useEffect(() => {
    setCatL2('');
    setCatL3('');
  }, [catL1]);
  useEffect(() => {
    setCatL3('');
  }, [catL2]);

  const allScopeTags = useMemo(() => {
    const s = new Set<string>();
    for (const e of scopeEntries) {
      for (const t of e.row.workshopTags ?? []) s.add(t);
    }
    return [...s].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [scopeEntries]);

  const toggleTag = (t: string) => {
    setTagFilter((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const narrowed = scopeEntries.filter((e) => {
      if (articleFilter !== ARTICLE_FILTER_ALL) {
        if (`${e.collectionId}::${e.row.id}` !== articleFilter) return false;
      }
      if (catL1 && (e.row.categoryL1?.trim() || '') !== catL1) return false;
      if (catL2 && (e.row.categoryL2?.trim() || '') !== catL2) return false;
      if (catL3 && (e.row.categoryL3?.trim() || '') !== catL3) return false;
      return true;
    });
    const tagPick = (e: (typeof scopeEntries)[number]) => {
      if (tagFilter.size === 0) return true;
      const tags = e.row.workshopTags ?? [];
      for (const t of tagFilter) {
        if (tags.includes(t)) return true;
      }
      return false;
    };
    const withTags = tagFilter.size === 0 ? narrowed : narrowed.filter((e) => tagPick(e));
    if (!q) return withTags;
    return withTags.filter((e) => {
      const r = e.row;
      const hay = [
        r.sku,
        r.name,
        r.internalArticleCode,
        r.audienceLabel,
        r.categoryL1,
        r.categoryL2,
        r.categoryL3,
        r.season,
        r.workshopLineSeason,
        e.collectionName,
        e.hubGroupTagLabel,
        ...(r.workshopTags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [scopeEntries, search, tagFilter, articleFilter, catL1, catL2, catL3]);

  const emptyHubCopy = useMemo(() => {
    if (allEntries.length === 0) {
      return {
        title: 'Пока нет артикулов',
        description:
          'Создайте карточку — откроется досье: ТЗ и этапы до принятого образца. Данные хранятся в этом браузере.',
        showCreate: true,
      } as const;
    }
    if (scopeEntries.length === 0) {
      if (articleStatusFilter === 'in_work') {
        return {
          title: 'Нет артикулов в работе',
          description: 'Все выбранные артикулы с этапами 100% — откройте «Все» или «Разработано».',
          showCreate: false,
        } as const;
      }
      if (articleStatusFilter === 'done') {
        return {
          title: 'Нет разработанных артикулов',
          description:
            'Пока ни у кого не закрыты все этапы по матрице — откройте «Все» или «В работе».',
          showCreate: false,
        } as const;
      }
    }
    return {
      title: 'Ничего не найдено',
      description: 'Измените поиск, теги или фильтры категорий.',
      showCreate: false,
    } as const;
  }, [allEntries.length, scopeEntries.length, articleStatusFilter]);

  return (
    <div className="w-full min-w-0 max-w-none space-y-4" data-testid="workshop2-article-flat-hub">
      <FilterToolbar className="border-border-default bg-bg-surface2/70 flex flex-col gap-1.5 p-1.5 sm:p-2">
        <div
          className={cn(
            'grid w-full min-w-0 gap-1.5',
            embeddedHub
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
              : 'grid-cols-2 sm:grid-cols-5'
          )}
        >
          <div className="col-span-2 flex min-w-0 flex-col gap-0.5 sm:col-span-1">
            <span className="text-text-secondary text-[8px] font-semibold uppercase leading-none">
              Поиск
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SKU, название…"
              className={cn(W2_HUB_FILTER_INPUT)}
              aria-label="Поиск по артикулам"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 sm:col-span-1">
            <Label
              htmlFor="w2-hub-art"
              className="text-text-secondary text-[8px] font-semibold uppercase leading-none"
              title="Один артикул из списка"
            >
              Артикул
            </Label>
            <select
              id="w2-hub-art"
              className={W2_HUB_FILTER_SELECT}
              value={articleFilter}
              onChange={(e) => setArticleFilter(e.target.value)}
            >
              <option value={ARTICLE_FILTER_ALL}>Все</option>
              {articleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 sm:col-span-1">
            <Label
              htmlFor="w2-hub-l1"
              className="text-text-secondary text-[8px] font-semibold uppercase leading-none"
              title="Категория, уровень 1"
            >
              Ур.1
            </Label>
            <select
              id="w2-hub-l1"
              className={W2_HUB_FILTER_SELECT}
              value={catL1}
              onChange={(e) => setCatL1(e.target.value)}
            >
              <option value="">Все</option>
              {l1Options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 sm:col-span-1">
            <Label
              htmlFor="w2-hub-l2"
              className="text-text-secondary text-[8px] font-semibold uppercase leading-none"
              title="Категория, уровень 2"
            >
              Ур.2
            </Label>
            <select
              id="w2-hub-l2"
              className={W2_HUB_FILTER_SELECT}
              value={catL2}
              onChange={(e) => setCatL2(e.target.value)}
              disabled={l2Options.length === 0}
            >
              <option value="">Все</option>
              {l2Options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 sm:col-span-1">
            <Label
              htmlFor="w2-hub-l3"
              className="text-text-secondary text-[8px] font-semibold uppercase leading-none"
              title="Категория, уровень 3"
            >
              Ур.3
            </Label>
            <select
              id="w2-hub-l3"
              className={W2_HUB_FILTER_SELECT}
              value={catL3}
              onChange={(e) => setCatL3(e.target.value)}
              disabled={l3Options.length === 0}
            >
              <option value="">Все</option>
              {l3Options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        {allScopeTags.length > 0 ? (
          <div className="border-border-subtle flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-dotted pt-2">
            <span className="text-text-secondary shrink-0 text-[8px] font-semibold uppercase">
              Теги
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
              {allScopeTags.map((t) => {
                const on = tagFilter.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={cn(
                      'hover:border-accent-primary/50 rounded border px-1.5 py-0.5 text-[9px] font-medium transition-colors',
                      on
                        ? 'border-accent-primary/60 bg-accent-primary/15 text-text-primary'
                        : 'border-border-subtle text-text-secondary bg-white/80'
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {tagFilter.size > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-text-secondary h-7 shrink-0 px-2 text-[9px] font-medium"
                onClick={() => setTagFilter(new Set())}
              >
                Сбросить теги
              </Button>
            ) : null}
          </div>
        ) : null}
      </FilterToolbar>

      {filtered.length === 0 ? (
        <EmptyState title={emptyHubCopy.title} description={emptyHubCopy.description}>
          {emptyHubCopy.showCreate ? (
            <Button
              type="button"
              size="sm"
              onClick={onCreateArticle}
              className="text-[10px] font-black uppercase"
            >
              Создать артикул
            </Button>
          ) : null}
        </EmptyState>
      ) : (
        <ul
          className={cn(
            'grid w-full gap-3',
            embeddedHub
              ? 'grid-cols-1 xl:grid-cols-2'
              : 'mx-auto max-w-[70rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {filtered.map((e) => (
            <li key={`${e.collectionId}-${e.row.id}`} className="min-w-0">
              <ArticleCard
                entry={e}
                embeddedHub={embeddedHub}
                onOpen={() => onOpenArticle(e.collectionId, e.row)}
                onEdit={() => onEditArticle(e.collectionId, e.row)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ArticleCard({
  entry,
  embeddedHub = false,
  onOpen,
  onEdit,
}: {
  entry: ArticleHubEntry;
  embeddedHub?: boolean;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const {
    row,
    collectionId,
    collectionName,
    collectionTargetSeason,
    progressPct,
    isComplete,
    hubFinalization,
  } = entry;
  const seasonRaw =
    row.workshopLineSeason?.trim() ||
    row.season?.trim() ||
    lineSeasonLabelForCard(
      row.workshopLineSeason?.trim() || row.season,
      collectionId,
      collectionName,
      collectionTargetSeason
    ) ||
    '';
  const seasonDisplay = seasonRaw || '—';
  const thumb = row.articleThumbDataUrl;
  const displayName = normalizedArticleModelName(row.name ?? '') || '—';
  const idChip =
    isWorkshop2InternalArticleCodeValid(row.internalArticleCode) && row.internalArticleCode
      ? `id ${row.internalArticleCode}`
      : null;

  const pathParts = [row.categoryL1, row.categoryL2, row.categoryL3]
    .map((p) => p?.trim())
    .filter((p) => Boolean(p) && p !== '-' && p !== '—') as string[];
  const pathCatLine = pathParts.length > 0 ? pathParts.join(' · ') : '—';
  const progressLabel = `${isComplete ? 100 : progressPct}%`;
  const statusLabel = isComplete ? 'Разработано' : 'В работе';
  const audienceLine = audienceLineForFlatHubCard(row);

  return (
    <article
      className={cn(
        'border-border-default hover:border-accent-primary/40 group flex w-full min-w-0 items-stretch gap-3 rounded-xl border bg-white p-3 shadow-sm transition-colors sm:gap-4 sm:p-4',
        embeddedHub && 'max-w-none'
      )}
      data-testid="workshop2-article-flat-hub-card"
    >
      <div className="bg-bg-surface2 border-border-subtle flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <Package className="text-text-muted h-6 w-6" aria-hidden />
        )}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="text-text-primary hover:bg-accent-primary/5 focus-visible:ring-accent-primary/40 min-w-0 flex-1 space-y-1 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        aria-label={`Открыть карточку ${row.sku}`}
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-sm font-bold leading-tight">{row.sku}</span>
          {idChip ? (
            <span className="text-text-secondary font-mono text-xs font-medium tabular-nums">{idChip}</span>
          ) : null}
        </div>
        <p className="text-text-primary line-clamp-2 text-sm font-semibold leading-snug">{displayName}</p>
        <p className="text-text-secondary text-xs leading-snug" title="Аудитория · категория L1–L3">
          {audienceLine} · {pathCatLine}
        </p>
        <p className="text-text-muted text-[11px] leading-snug">
          {collectionName} · сезон {seasonDisplay}
        </p>
        {row.workshopTags && row.workshopTags.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {row.workshopTags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-text-primary h-5 max-w-full truncate px-1.5 py-0 text-[10px] font-medium"
                title={t}
              >
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </button>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch py-0.5">
        <span
          className={cn(
            'text-right text-xs font-semibold tabular-nums whitespace-nowrap',
            hubFinalization.finalized || isComplete ? 'text-emerald-800' : 'text-text-secondary'
          )}
        >
          {statusLabel} · {progressLabel}
        </span>
        <div className="flex items-center gap-1.5">
          {hubFinalization.finalized ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex text-emerald-600"
                  aria-label={
                    hubFinalization.finalizedAtIso
                      ? `Карточка финализирована: ${formatFinalizedAtTooltip(hubFinalization.finalizedAtIso)}`
                      : 'Карточка финализирована'
                  }
                >
                  <CircleCheck className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[16rem] text-left text-[11px]">
                {hubFinalization.finalizedAtIso
                  ? `Карточка финализирована: ${formatFinalizedAtTooltip(hubFinalization.finalizedAtIso)}`
                  : 'Сэмпл принят в коллекцию и проставлены финальные подтверждения ТЗ (дизайнер, технолог, менеджер).'}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Редактировать карточку"
            title="Редактировать карточку"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

// data-testid="workshop2-hub-development-path-chip" summarizeWorkshop2ArticleDevelopmentStateDisplay

// backendStatus === 'pg_disabled' || backendStatus === 'offline'
