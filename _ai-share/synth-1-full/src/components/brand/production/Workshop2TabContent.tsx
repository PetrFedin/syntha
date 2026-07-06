'use client';
import { fetchWorkshop2HubServerActivityBatch } from '@/lib/production/workshop2-hub-activity-client';
import { formatWorkshop2HubActivityDetailRu } from '@/lib/production/workshop2-hub-activity-status';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck, Clock3, History, LayoutGrid, MessageSquare, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { EmptyState } from '@/components/design-system';
import { Workshop2ArticleFlatHub } from '@/components/brand/production/Workshop2ArticleFlatHub';
import { WORKSHOP2_SYSTEM_COLLECTION_ID } from '@/lib/production/local-collection-inventory';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import { type CollectionSkuFlowDoc } from '@/lib/production/unified-sku-flow-store';
import { deriveStagesArticleFacets } from '@/lib/production/stages-tab-facets';
import { parseRangePlannerPrefillFromSearchParams } from '@/lib/production/workshop2-range-planner-bridge';
import { commitWorkshop2HubDialogArticleViaApi } from '@/lib/production/workshop2-hub-dialog-create-client';
import { isPlatformCoreGoldenCollectionId } from '@/lib/platform-core-demo-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { brandDevelopmentDossierCabinetHref } from '@/lib/platform-core-cabinet-workspace';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import {
  WORKSHOP2_ART_PARAM,
  WORKSHOP2_COL_PARAM,
  WORKSHOP2_CREATE_PARAM,
  WORKSHOP2_STEP_PARAM,
  WORKSHOP2_TAB_PARAM,
  workshop2ArticlePath,
  workshop2ArticleUrlSegment,
} from '@/lib/production/workshop2-url';
import {
  appendWorkshop2Activity,
  clearWorkshop2Activity,
  loadWorkshop2Activity,
} from '@/lib/production/workshop2-activity-log';
import {
  normalizeLocalSkuCode,
  type LocalOrderLine,
  type UserCollectionRow,
  type Workshop2ArticleCommit,
  type Workshop2ArticleLinePatch,
  type Workshop2Ss27MetaPatch,
  type Workshop2UserCollectionUpdate,
} from '@/lib/production/local-collection-inventory';
import {
  Workshop2CreateArticleDialog,
  type Workshop2EditArticlePayload,
} from '@/components/brand/production/Workshop2CreateArticleDialog';
import { findHandbookLeafById, getHandbookCategoryLeaves } from '@/lib/production/category-catalog';
import { appendWorkshop2TzDossierEditLog } from '@/lib/production/workshop2-dossier-activity-log';
import {
  emptyWorkshop2DossierPhase1,
  getWorkshop2Phase1Dossier,
  setWorkshop2Phase1Dossier,
} from '@/lib/production/workshop2-phase1-dossier-storage';
import { useToast } from '@/hooks/use-toast';
import {
  WORKSHOP2_AUDIENCE_FILTER_TITLE,
  WORKSHOP2_CAT_L1_FILTER_TITLE,
  WORKSHOP2_CAT_L2_FILTER_TITLE,
  WORKSHOP2_CAT_L3_FILTER_TITLE,
  WORKSHOP2_TAB_CONTENT_PAGE_SUBTITLE,
  WORKSHOP2_TARGET_CHANNEL_SUGGESTIONS,
} from '@/components/brand/production/workshop2-tab-content-constants';

const ARTICLE_HUB_STATUS_FILTERS = [
  { id: 'all' as const, label: 'Все', Icon: LayoutGrid },
  { id: 'in_work' as const, label: 'В работе', Icon: Clock3 },
  { id: 'done' as const, label: 'Разработано', Icon: CircleCheck },
];
import type {
  Workshop2ArticleRow,
  Workshop2CollectionListItem,
  Workshop2CollectionMetrics,
  Workshop2CreateMeta,
} from '@/components/brand/production/workshop2-tab-content-model';
import { Workshop2TabContentArticlesPanel } from '@/components/brand/production/workshop2-tab-content-articles-panel';
import { Workshop2TabContentCollectionGridCards } from '@/components/brand/production/workshop2-tab-content-collection-grid-cards';
import {
  buildWorkshop2TabContentDossierRollupByCollectionId,
  filterWorkshop2CollectionsForGrid,
  isoToDatetimeLocalValue,
  parseWorkshop2BulkPaste,
  runGlobalWorkshop2Search,
} from '@/components/brand/production/workshop2-tab-content-utils';

export type {
  Workshop2ArticleRow,
  Workshop2CollectionListItem,
  Workshop2CollectionMetrics,
  Workshop2CreateMeta,
} from '@/components/brand/production/workshop2-tab-content-model';

type Props = {
  /** Базовый путь без query, напр. `/brand/production/workshop2`. */
  basePath: string;
  activeCollections: Workshop2CollectionListItem[];
  archivedCollections: Workshop2CollectionListItem[];
  metricsByCollectionId: Record<string, Workshop2CollectionMetrics>;
  getArticlePipelineProgress: (
    collectionId: string,
    articleId: string,
    skuForFlowKey?: string
  ) => { done: number; total: number; pct: number };
  getSkuFlowDoc: (collectionId: string) => CollectionSkuFlowDoc;
  onCreateCollection: (
    rawId: string,
    displayName: string,
    opts: {
      description?: string;
      createdBy: string;
      coverDataUrl?: string;
      targetSeason?: string;
      targetChannel?: string;
      dropDeadlineIso?: string;
      teamNote?: string;
      panelAccentHex?: string;
    }
  ) => Workshop2CreateMeta;
  onArchiveCollection: (collectionId: string) => void;
  onRestoreCollection: (collectionId: string) => void;
  /** Вкл/выкл гвоздик: вкл — первая в списке; выкл — позиция без изменений. */
  onToggleCollectionPin: (collectionId: string, pinned: boolean) => void;
  getUserCollectionRow: (id: string) => UserCollectionRow | undefined;
  getCollectionCoverDataUrl: (id: string) => string | undefined;
  onUpdateUserCollection: (id: string, patch: Workshop2UserCollectionUpdate) => boolean;
  /** Описание и заметка для демо-коллекции SS27. */
  onUpdateSs27Meta: (patch: Workshop2Ss27MetaPatch) => boolean;
  articlePickerLines: LocalOrderLine[];
  onCommitWorkshop2Article: (
    collectionId: string,
    commit: Workshop2ArticleCommit
  ) => string | false;
  onBulkAddWorkshop2Articles: (
    collectionId: string,
    rows: { sku: string; name?: string }[]
  ) => { added: number; skippedDuplicates: number };
  onRemoveWorkshop2Article: (collectionId: string, articleId: string) => void;
  onPatchWorkshop2ArticleLine: (
    collectionId: string,
    articleId: string,
    patch: Workshop2ArticleLinePatch
  ) => boolean;
  createdByLabel: string;
  /** Подсветка и скролл к строке после создания артикула. */
  highlightArticleId?: string | null;
  /** Platform Core embedded hub — компактная шапка и карточки артикулов. */
  embeddedHub?: boolean;
};

export function Workshop2TabContent({
  basePath,
  activeCollections,
  archivedCollections,
  metricsByCollectionId,
  getArticlePipelineProgress,
  getSkuFlowDoc,
  onCreateCollection,
  onArchiveCollection,
  onRestoreCollection,
  onToggleCollectionPin,
  getUserCollectionRow,
  getCollectionCoverDataUrl,
  onUpdateUserCollection,
  onUpdateSs27Meta,
  articlePickerLines,
  onCommitWorkshop2Article,
  onBulkAddWorkshop2Articles,
  onRemoveWorkshop2Article,
  onPatchWorkshop2ArticleLine,
  createdByLabel,
  highlightArticleId = null,
  embeddedHub = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const w2col = searchParams.get(WORKSHOP2_COL_PARAM) ?? '';
  const legacyW2Art = searchParams.get(WORKSHOP2_ART_PARAM) ?? '';
  const rangePlannerPrefill = useMemo(
    () => parseRangePlannerPrefillFromSearchParams(searchParams),
    [searchParams]
  );
  /** Вкладка «Архив» на хабе разработки отключена — только артикулы в работе. */
  const listTab = 'active' as const;

  const collectionsForLookup = useMemo(
    () => [...activeCollections, ...archivedCollections],
    [activeCollections, archivedCollections]
  );

  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dossierRollupByCollectionId = useMemo(() => {
    if (!mounted || typeof window === 'undefined') return {};
    return buildWorkshop2TabContentDossierRollupByCollectionId(collectionsForLookup);
  }, [collectionsForLookup, mounted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem('synth.w2.hubTzHint.v1')) return;
    } catch {
      return;
    }
    if (listTab !== 'active') return;
    if (activeCollections.length === 0) return;
    const rollups = buildWorkshop2TabContentDossierRollupByCollectionId(activeCollections);
    let overdue = 0;
    let weak = 0;
    for (const col of activeCollections) {
      const r = rollups[col.id];
      if (!r) continue;
      overdue += r.overdueSlaCount;
      weak += r.weakApprovalsCount;
    }
    try {
      window.sessionStorage.setItem('synth.w2.hubTzHint.v1', '1');
    } catch {
      /* ignore */
    }
    if (overdue === 0 && weak === 0) return;
    const parts: string[] = [];
    if (overdue > 0) {
      parts.push(`Просроченные даты ответа по ролям (SLA в паспорте): ${overdue}.`);
    }
    if (weak > 0) {
      parts.push(`Артикулов без полного набора подписей ТЗ: ${weak}.`);
    }
    toast({
      title: 'Напоминание по ТЗ',
      description: parts.join(' '),
      duration: 14_000,
    });
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, [activeCollections, listTab, toast]);

  const didLogSectionView = useRef(false);
  useEffect(() => {
    if (didLogSectionView.current) return;
    didLogSectionView.current = true;
    appendWorkshop2Activity('Просмотр: раздел «Коллекции»', createdByLabel);
  }, [createdByLabel]);

  /** Старые ссылки `?w2col=&w2art=` → отдельная страница артикула. */
  useEffect(() => {
    if (!legacyW2Art || !w2col) return;
    router.replace(workshop2ArticlePath(w2col, legacyW2Art));
  }, [legacyW2Art, w2col, router]);

  const replaceQuery = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      mutate(p);
      const q = p.toString();
      router.replace(q ? `${basePath}?${q}` : basePath, { scroll: false });
    },
    [basePath, router, searchParams]
  );

  useEffect(() => {
    if (searchParams.get(WORKSHOP2_TAB_PARAM) === 'archive') {
      replaceQuery((p) => p.delete(WORKSHOP2_TAB_PARAM));
    }
  }, [searchParams, replaceQuery]);

  const selectCollection = useCallback(
    (collectionId: string) => {
      const expanded = w2col === collectionId;
      const col = collectionsForLookup.find((c) => c.id === collectionId);
      const title = col?.displayName ?? collectionId;
      if (expanded) {
        appendWorkshop2Activity(`Список артикулов свёрнут · «${title}»`, createdByLabel);
      } else {
        appendWorkshop2Activity(
          `Открыт список артикулов · «${title}» (${collectionId})`,
          createdByLabel
        );
      }
      replaceQuery((p) => {
        if (expanded) {
          p.delete(WORKSHOP2_COL_PARAM);
          p.delete(WORKSHOP2_ART_PARAM);
          p.delete(WORKSHOP2_STEP_PARAM);
        } else {
          p.set(WORKSHOP2_COL_PARAM, collectionId);
          p.delete(WORKSHOP2_ART_PARAM);
          p.delete(WORKSHOP2_STEP_PARAM);
        }
      });
    },
    [replaceQuery, w2col, collectionsForLookup, createdByLabel]
  );

  const openArticle = useCallback(
    (collectionId: string, row: { id: string; internalArticleCode?: string }) => {
      const segment = workshop2ArticleUrlSegment(row.internalArticleCode, row.id);
      if (isPlatformCoreMode() && basePath.includes('/brand/core')) {
        router.push(
          brandDevelopmentDossierCabinetHref(
            collectionId,
            segment,
            getPlatformCoreDemo(collectionId)
          )
        );
        return;
      }
      router.push(workshop2ArticlePath(collectionId, segment));
    },
    [router, basePath]
  );

  const activeCollection = useMemo(
    () => collectionsForLookup.find((c) => c.id === w2col),
    [collectionsForLookup, w2col]
  );

  const articleRows = activeCollection?.articleRows ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState(() => loadWorkshop2Activity());
  const [articleDialogCol, setArticleDialogCol] = useState<{
    id: string;
    displayName: string;
  } | null>(null);

  const openCreateArticle = useCallback(() => {
    const targetCol = w2col.trim() || WORKSHOP2_SYSTEM_COLLECTION_ID;
    const col = collectionsForLookup.find((c) => c.id === targetCol);
    setArticleDialogCol({
      id: targetCol,
      displayName: col?.displayName ?? targetCol,
    });
  }, [collectionsForLookup, w2col]);

  useEffect(() => {
    if (searchParams.get(WORKSHOP2_CREATE_PARAM) === '1') {
      openCreateArticle();
    }
  }, [openCreateArticle, searchParams]);

  const [articleSkuFilter, setArticleSkuFilter] = useState('');
  const [archiveConfirm, setArchiveConfirm] = useState<{
    id: string;
    displayName: string;
    isSs27: boolean;
  } | null>(null);
  const [articlePanelStageFilter, setArticlePanelStageFilter] = useState<string | null>(null);
  const [articleListSort, setArticleListSort] = useState<'sku' | 'added'>('sku');
  const [articleFacetAudience, setArticleFacetAudience] = useState<Set<string>>(() => new Set());
  const [articleFacetL1, setArticleFacetL1] = useState<Set<string>>(() => new Set());
  const [articleFacetL2, setArticleFacetL2] = useState<Set<string>>(() => new Set());
  const [articleFacetL3, setArticleFacetL3] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setArticleFacetAudience(new Set());
    setArticleFacetL1(new Set());
    setArticleFacetL2(new Set());
    setArticleFacetL3(new Set());
  }, [w2col]);

  const [nextStepsCollectionId, setNextStepsCollectionId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCol, setBulkCol] = useState<{ id: string; displayName: string } | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [newTargetSeason, setNewTargetSeason] = useState('');
  const [newTargetChannel, setNewTargetChannel] = useState('');
  const [newDropDeadline, setNewDropDeadline] = useState('');
  const [newTeamNote, setNewTeamNote] = useState('');
  const [newPanelAccent, setNewPanelAccent] = useState('#6366f1');
  const [newPanelAccentOn, setNewPanelAccentOn] = useState(false);
  const [gridSelectedCollectionIds, setGridSelectedCollectionIds] = useState<Set<string>>(
    () => new Set()
  );
  const [gridSelectedSkus, setGridSelectedSkus] = useState<Set<string>>(() => new Set());
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [historyActorFilter, setHistoryActorFilter] = useState<string>('__all__');
  const [editOpen, setEditOpen] = useState(false);
  /** Редактирование карточки: пользовательская коллекция или демо SS27. */
  const [editKind, setEditKind] = useState<'user' | 'ss27' | null>(null);
  const [editColId, setEditColId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTargetSeason, setEditTargetSeason] = useState('');
  const [editTargetChannel, setEditTargetChannel] = useState('');
  const [editDropDeadline, setEditDropDeadline] = useState('');
  const [editTeamNote, setEditTeamNote] = useState('');
  const [editPanelAccent, setEditPanelAccent] = useState('#6366f1');
  const [editPanelAccentOn, setEditPanelAccentOn] = useState(false);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editCoverError, setEditCoverError] = useState<string | null>(null);
  const [editRemoveCover, setEditRemoveCover] = useState(false);
  const [editExistingCoverUrl, setEditExistingCoverUrl] = useState<string | null>(null);
  const [openCollDescId, setOpenCollDescId] = useState<string | null>(null);
  const [openCollNoteId, setOpenCollNoteId] = useState<string | null>(null);
  const [collNoteDraft, setCollNoteDraft] = useState('');
  const [collDescDraft, setCollDescDraft] = useState('');
  const [articleNotesTarget, setArticleNotesTarget] = useState<{
    collectionId: string;
    articleId: string;
    sku: string;
    draft: string;
  } | null>(null);
  const [articleEditTarget, setArticleEditTarget] = useState<
    (Workshop2EditArticlePayload & { collectionId: string; displayName: string }) | null
  >(null);
  const openArticleEditFromHub = useCallback(
    (collectionId: string, row: Workshop2ArticleRow) => {
      setArticleDialogCol(null);
      const leafFromRow = row.categoryLeafId?.trim();
      const validLeaf =
        leafFromRow && findHandbookLeafById(leafFromRow)
          ? leafFromRow
          : (getHandbookCategoryLeaves()[0]?.leafId ?? '');
      const col = collectionsForLookup.find((c) => c.id === collectionId);
      setArticleEditTarget({
        collectionId,
        displayName: col?.displayName?.trim() || collectionId,
        articleId: row.id,
        sku: row.sku,
        name: row.name,
        comment: row.workshopComment ?? '',
        categoryLeafId: validLeaf,
        workshopAttachments: row.workshopAttachments?.length
          ? row.workshopAttachments.map((a) => ({ ...a }))
          : [],
        workshopTags: row.workshopTags?.length ? [...row.workshopTags] : undefined,
        workshopLineSeason: row.workshopLineSeason?.trim() ?? '',
      });
    },
    [collectionsForLookup]
  );
  /** Сетка карточек: все артикулы / только в работе / только разработанные (100% этапов). */
  const [articleHubStatusFilter, setArticleHubStatusFilter] = useState<'all' | 'in_work' | 'done'>(
    'all'
  );
  const articleRowRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const collectionsForCurrentTab = listTab === 'active' ? activeCollections : archivedCollections;

  /** Каталог заказа + локальные строки (не только демо SS27 на вкладке). */
  const skuCatalogForFilters = useMemo(() => {
    type Entry = {
      skuNorm: string;
      skuLabel: string;
      name: string;
      thumb?: string;
      audienceLabel: string;
      categoryL1: string;
      categoryL2: string;
      categoryL3: string;
    };
    const m = new Map<string, Entry>();
    articlePickerLines.forEach((item, idx) => {
      const facets = deriveStagesArticleFacets(item as Record<string, unknown>, idx);
      const it = item as LocalOrderLine & { sku?: string; name?: string };
      const skuRaw = String(it.sku ?? '').trim();
      const skuNorm = normalizeLocalSkuCode(skuRaw) || skuRaw;
      if (!skuNorm) return;
      const firstAtt = it.workshopAttachments?.[0]?.dataUrl;
      const thumb =
        typeof firstAtt === 'string' && firstAtt.startsWith('data:') ? firstAtt : undefined;
      const prev = m.get(skuNorm);
      if (!prev) {
        m.set(skuNorm, {
          skuNorm,
          skuLabel: skuRaw || skuNorm,
          name: String(it.name ?? ''),
          thumb,
          audienceLabel: facets.audienceLabel,
          categoryL1: facets.categoryL1,
          categoryL2: facets.categoryL2,
          categoryL3: facets.categoryL3,
        });
      } else if (!prev.thumb && thumb) {
        m.set(skuNorm, { ...prev, thumb });
      }
    });
    return [...m.values()].sort((a, b) => a.skuNorm.localeCompare(b.skuNorm, 'ru'));
  }, [articlePickerLines]);

  /** Названия коллекций на текущей вкладке (активные или архив) — опции «Фильтр по коллекции». */
  const collectionOptionsForGridFilter = useMemo(() => {
    return [...collectionsForCurrentTab]
      .map((c) => ({ id: c.id, displayName: c.displayName.trim() || c.id }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ru'));
  }, [collectionsForCurrentTab]);

  const globalSearchResults = useMemo(
    () => runGlobalWorkshop2Search(globalSearchQuery, collectionsForCurrentTab),
    [globalSearchQuery, collectionsForCurrentTab]
  );

  const historyActors = useMemo(() => {
    const s = new Set<string>();
    for (const e of historyEntries) {
      const a = e.actor?.trim();
      if (a) s.add(a);
    }
    return [...s].sort((x, y) => x.localeCompare(y, 'ru'));
  }, [historyEntries]);

  const historyFiltered = useMemo(() => {
    return historyEntries.filter((e) => {
      const at = new Date(e.at).getTime();
      if (historyDateFrom) {
        const from = new Date(`${historyDateFrom}T00:00:00`).getTime();
        if (at < from) return false;
      }
      if (historyDateTo) {
        const to = new Date(`${historyDateTo}T23:59:59.999`).getTime();
        if (at > to) return false;
      }
      if (historyActorFilter !== '__all__') {
        if (historyActorFilter === '__no_actor__') {
          if (e.actor?.trim()) return false;
        } else {
          const actor = e.actor?.trim() || '';
          if (actor !== historyActorFilter) return false;
        }
      }
      return true;
    });
  }, [historyEntries, historyDateFrom, historyDateTo, historyActorFilter]);

  const filteredCollectionsCount = useMemo(
    () =>
      filterWorkshop2CollectionsForGrid(
        collectionsForCurrentTab,
        gridSelectedCollectionIds,
        gridSelectedSkus
      ).length,
    [collectionsForCurrentTab, gridSelectedCollectionIds, gridSelectedSkus]
  );

  useEffect(() => {
    if (!editOpen) {
      setEditCoverPreview(null);
      return;
    }
    if (!editCoverFile) {
      setEditCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(editCoverFile);
    setEditCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editCoverFile, editOpen]);

  useLayoutEffect(() => {
    if (!highlightArticleId || !w2col) return;
    const col = collectionsForLookup.find((c) => c.id === w2col);
    if (!col?.articleRows.some((r) => r.id === highlightArticleId)) return;
    const el = articleRowRefs.current.get(highlightArticleId);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightArticleId, w2col, collectionsForLookup]);

  useEffect(() => {
    setArticleSkuFilter('');
  }, [w2col]);

  useEffect(() => {
    setArticlePanelStageFilter(null);
  }, [w2col]);

  useEffect(() => {
    setArticleListSort('sku');
  }, [w2col]);

  useEffect(() => {
    setArticleFacetAudience(new Set(['__all__']));
    setArticleFacetL1(new Set(['__all__']));
    setArticleFacetL2(new Set(['__all__']));
    setArticleFacetL3(new Set(['__all__']));
  }, [w2col]);

  useEffect(() => {
    setGridSelectedCollectionIds(new Set());
    setGridSelectedSkus(new Set());
  }, [listTab]);

  const archiveOne = useCallback(
    (id: string) => {
      const col = collectionsForLookup.find((c) => c.id === id);
      appendWorkshop2Activity(`В архив · «${col?.displayName ?? id}» (${id})`, createdByLabel);
      if (w2col === id) {
        replaceQuery((p) => {
          p.delete(WORKSHOP2_COL_PARAM);
          p.delete(WORKSHOP2_ART_PARAM);
          p.delete(WORKSHOP2_STEP_PARAM);
        });
      }
      onArchiveCollection(id);
    },
    [w2col, collectionsForLookup, onArchiveCollection, replaceQuery, createdByLabel]
  );

  const confirmArchive = useCallback(() => {
    if (!archiveConfirm) return;
    archiveOne(archiveConfirm.id);
    setArchiveConfirm(null);
  }, [archiveConfirm, archiveOne]);

  const restoreOne = useCallback(
    (id: string) => {
      const col = archivedCollections.find((c) => c.id === id);
      appendWorkshop2Activity(
        `Восстановлено · «${col?.displayName ?? id}» (${id})`,
        createdByLabel
      );
      onRestoreCollection(id);
    },
    [archivedCollections, onRestoreCollection, createdByLabel]
  );

  const submitNewCollection = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;
    const raw = newCode.trim() || name;
    let coverDataUrl: string | undefined;
    if (coverFile) {
      coverDataUrl = await new Promise<string | undefined>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(typeof r.result === 'string' ? r.result : undefined);
        r.onerror = () => resolve(undefined);
        r.readAsDataURL(coverFile);
      });
    }
    let dropDeadlineIso: string | undefined;
    if (newDropDeadline.trim()) {
      const d = new Date(newDropDeadline);
      if (!Number.isNaN(d.getTime())) dropDeadlineIso = d.toISOString();
    }
    const meta = onCreateCollection(raw, name, {
      description: newDesc.trim() || undefined,
      createdBy: createdByLabel,
      coverDataUrl,
      targetSeason: newTargetSeason.trim() || undefined,
      targetChannel: newTargetChannel.trim() || undefined,
      dropDeadlineIso,
      teamNote: newTeamNote.trim() || undefined,
      panelAccentHex: newPanelAccentOn ? newPanelAccent.trim() || undefined : undefined,
    });
    appendWorkshop2Activity(
      `Создана коллекция «${meta.name}», код ${meta.id} · ${meta.createdBy}`,
      createdByLabel
    );
    setNextStepsCollectionId(meta.id);
    replaceQuery((p) => {
      p.delete(WORKSHOP2_TAB_PARAM);
      p.set(WORKSHOP2_COL_PARAM, meta.id);
      p.delete(WORKSHOP2_ART_PARAM);
      p.delete(WORKSHOP2_STEP_PARAM);
    });
    setCreateOpen(false);
    setNewName('');
    setNewCode('');
    setNewDesc('');
    setNewTargetSeason('');
    setNewTargetChannel('');
    setNewDropDeadline('');
    setNewTeamNote('');
    setNewPanelAccent('#6366f1');
    setNewPanelAccentOn(false);
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCoverError(null);
  }, [
    newName,
    newCode,
    newDesc,
    newTargetSeason,
    newTargetChannel,
    newDropDeadline,
    newTeamNote,
    newPanelAccent,
    newPanelAccentOn,
    coverFile,
    coverPreview,
    createdByLabel,
    onCreateCollection,
    replaceQuery,
  ]);

  const resetCreateDialog = useCallback(() => {
    setNewName('');
    setNewCode('');
    setNewDesc('');
    setNewTargetSeason('');
    setNewTargetChannel('');
    setNewDropDeadline('');
    setNewTeamNote('');
    setNewPanelAccent('#6366f1');
    setNewPanelAccentOn(false);
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCoverError(null);
  }, [coverPreview]);

  const resetEditDialog = useCallback(() => {
    setEditKind(null);
    setEditColId(null);
    setEditCode('');
    setEditName('');
    setEditDesc('');
    setEditTargetSeason('');
    setEditTargetChannel('');
    setEditDropDeadline('');
    setEditTeamNote('');
    setEditPanelAccent('#6366f1');
    setEditPanelAccentOn(false);
    setEditCoverFile(null);
    setEditCoverPreview(null);
    setEditCoverError(null);
    setEditRemoveCover(false);
    setEditExistingCoverUrl(null);
  }, []);

  const openUserCollectionEdit = useCallback(
    (col: Workshop2CollectionListItem) => {
      if (col.kind !== 'user') return;
      const row = getUserCollectionRow(col.id);
      if (!row) return;
      setEditKind('user');
      setEditColId(col.id);
      setEditCode(col.id);
      setEditName(row.name);
      setEditDesc(row.description ?? '');
      setEditTargetSeason(row.targetSeason ?? '');
      setEditTargetChannel(row.targetChannel ?? '');
      setEditDropDeadline(isoToDatetimeLocalValue(row.dropDeadlineIso));
      setEditTeamNote(row.teamNote ?? '');
      const hex = row.panelAccentHex?.trim();
      setEditPanelAccentOn(!!hex);
      setEditPanelAccent(hex || '#6366f1');
      setEditRemoveCover(false);
      setEditCoverFile(null);
      setEditCoverError(null);
      setEditExistingCoverUrl(getCollectionCoverDataUrl(col.id) ?? col.coverDataUrl ?? null);
      setEditOpen(true);
    },
    [getUserCollectionRow, getCollectionCoverDataUrl]
  );

  const openSs27CollectionCardEdit = useCallback(
    (col: Workshop2CollectionListItem) => {
      if (col.kind !== 'ss27') return;
      setEditKind('ss27');
      setEditColId(col.id);
      setEditCode(col.id);
      setEditName(col.displayName);
      setEditDesc(col.description ?? '');
      setEditTargetSeason(col.targetSeason ?? '');
      setEditTargetChannel(col.targetChannel ?? '');
      setEditDropDeadline(isoToDatetimeLocalValue(col.dropDeadlineIso));
      setEditTeamNote(col.teamNote ?? '');
      const hex = col.panelAccentHex?.trim();
      setEditPanelAccentOn(!!hex);
      setEditPanelAccent(hex || '#6366f1');
      setEditRemoveCover(false);
      setEditCoverFile(null);
      setEditCoverError(null);
      setEditExistingCoverUrl(getCollectionCoverDataUrl(col.id) ?? col.coverDataUrl ?? null);
      setEditOpen(true);
    },
    [getCollectionCoverDataUrl]
  );

  const submitEditUserCollection = useCallback(async () => {
    if (!editColId || !editName.trim()) return;
    let coverDataUrl: string | undefined = undefined;
    if (editRemoveCover) {
      coverDataUrl = '';
    } else if (editCoverFile) {
      coverDataUrl = await new Promise<string | undefined>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(typeof r.result === 'string' ? r.result : undefined);
        r.onerror = () => resolve(undefined);
        r.readAsDataURL(editCoverFile);
      });
    }
    let dropDeadlineIso: string | undefined;
    if (editDropDeadline.trim()) {
      const d = new Date(editDropDeadline);
      if (!Number.isNaN(d.getTime())) dropDeadlineIso = d.toISOString();
    }

    if (editKind === 'ss27') {
      let ss27DropPatch: string | undefined;
      if (!editDropDeadline.trim()) ss27DropPatch = '';
      else if (dropDeadlineIso) ss27DropPatch = dropDeadlineIso;

      const patch: Workshop2Ss27MetaPatch = {
        displayName: editName.trim(),
        description: editDesc,
        targetSeason: editTargetSeason,
        targetChannel: editTargetChannel,
        teamNote: editTeamNote,
        panelAccentHex: editPanelAccentOn ? editPanelAccent.trim() || '' : '',
        coverDataUrl,
        ...(ss27DropPatch !== undefined ? { dropDeadlineIso: ss27DropPatch } : {}),
      };
      if (onUpdateSs27Meta(patch)) {
        appendWorkshop2Activity(
          `Изменена карточка подборки «${editName.trim()}» (${editColId})`,
          createdByLabel
        );
        setEditOpen(false);
        resetEditDialog();
      }
      return;
    }

    const patch: Workshop2UserCollectionUpdate = {
      name: editName.trim(),
      description: editDesc.trim() || undefined,
      targetSeason: editTargetSeason.trim() || undefined,
      targetChannel: editTargetChannel.trim() || undefined,
      dropDeadlineIso,
      teamNote: editTeamNote.trim() || undefined,
      panelAccentHex: editPanelAccentOn ? editPanelAccent.trim() || '' : '',
      coverDataUrl,
    };
    if (onUpdateUserCollection(editColId, patch)) {
      appendWorkshop2Activity(
        `Изменена коллекция «${editName.trim()}» (${editColId})`,
        createdByLabel
      );
      setEditOpen(false);
      resetEditDialog();
    }
  }, [
    editColId,
    editKind,
    editName,
    editDesc,
    editTargetSeason,
    editTargetChannel,
    editDropDeadline,
    editTeamNote,
    editPanelAccentOn,
    editPanelAccent,
    editRemoveCover,
    editCoverFile,
    onUpdateUserCollection,
    onUpdateSs27Meta,
    createdByLabel,
    resetEditDialog,
  ]);

  const submitArticleNotes = useCallback(() => {
    if (!articleNotesTarget) return;
    const colTitle =
      collectionsForLookup.find((c) => c.id === articleNotesTarget.collectionId)?.displayName ??
      articleNotesTarget.collectionId;
    if (
      onPatchWorkshop2ArticleLine(articleNotesTarget.collectionId, articleNotesTarget.articleId, {
        workshopComment: articleNotesTarget.draft.trim(),
      })
    ) {
      appendWorkshop2Activity(
        `Заметки по артикулу ${articleNotesTarget.sku} · «${colTitle}»`,
        createdByLabel
      );
      setArticleNotesTarget(null);
    }
  }, [articleNotesTarget, collectionsForLookup, createdByLabel, onPatchWorkshop2ArticleLine]);

  const renderCollectionGrid = (cols: Workshop2CollectionListItem[], tab: 'active' | 'archive') => {
    const filteredCols = filterWorkshop2CollectionsForGrid(
      cols,
      gridSelectedCollectionIds,
      gridSelectedSkus
    );

    return (
      <div className="w-full min-w-0">
        <Workshop2TabContentCollectionGridCards
          tab={tab}
          filteredCols={filteredCols}
          w2col={w2col}
          metricsByCollectionId={metricsByCollectionId}
          dossierRollupByCollectionId={dossierRollupByCollectionId}
          openCollDescId={openCollDescId}
          setOpenCollDescId={setOpenCollDescId}
          collDescDraft={collDescDraft}
          setCollDescDraft={setCollDescDraft}
          openCollNoteId={openCollNoteId}
          setOpenCollNoteId={setOpenCollNoteId}
          collNoteDraft={collNoteDraft}
          setCollNoteDraft={setCollNoteDraft}
          onUpdateSs27Meta={onUpdateSs27Meta}
          appendWorkshop2Activity={appendWorkshop2Activity}
          createdByLabel={createdByLabel}
          getUserCollectionRow={getUserCollectionRow}
          onUpdateUserCollection={onUpdateUserCollection}
          openUserCollectionEdit={openUserCollectionEdit}
          openSs27CollectionCardEdit={openSs27CollectionCardEdit}
          onToggleCollectionPin={onToggleCollectionPin}
          selectCollection={selectCollection}
          setArchiveConfirm={setArchiveConfirm}
          restoreOne={restoreOne}
        />
        <Workshop2TabContentArticlesPanel
          cols={cols}
          w2col={w2col}
          metricsByCollectionId={metricsByCollectionId}
          getSkuFlowDoc={getSkuFlowDoc}
          getArticlePipelineProgress={getArticlePipelineProgress}
          articleListSort={articleListSort}
          setArticleListSort={setArticleListSort}
          articleFacetAudience={articleFacetAudience}
          setArticleFacetAudience={setArticleFacetAudience}
          articleFacetL1={articleFacetL1}
          setArticleFacetL1={setArticleFacetL1}
          articleFacetL2={articleFacetL2}
          setArticleFacetL2={setArticleFacetL2}
          articleFacetL3={articleFacetL3}
          setArticleFacetL3={setArticleFacetL3}
          articleSkuFilter={articleSkuFilter}
          setArticleSkuFilter={setArticleSkuFilter}
          articlePanelStageFilter={articlePanelStageFilter}
          setArticlePanelStageFilter={setArticlePanelStageFilter}
          nextStepsCollectionId={nextStepsCollectionId}
          setNextStepsCollectionId={setNextStepsCollectionId}
          highlightArticleId={highlightArticleId}
          articleRowRefs={articleRowRefs}
          openArticle={openArticle}
          setBulkCol={setBulkCol}
          setBulkText={setBulkText}
          setBulkOpen={setBulkOpen}
          setArticleDialogCol={setArticleDialogCol}
          setArticleEditTarget={setArticleEditTarget}
          setArticleNotesTarget={setArticleNotesTarget}
          appendWorkshop2Activity={appendWorkshop2Activity}
          createdByLabel={createdByLabel}
          onRemoveWorkshop2Article={onRemoveWorkshop2Article}
          setArchiveConfirm={setArchiveConfirm}
        />
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        <div
          className={cn(
            'border-border-default/80 flex flex-col gap-3 border-b pb-4',
            embeddedHub && 'border-0 pb-2'
          )}
        >
          {!embeddedHub ? (
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {COLLECTION_DEV_HUB_TITLE_RU}
              </h1>
              <p className="text-slate-600 line-clamp-1 max-w-2xl text-xs sm:line-clamp-none sm:text-sm">
                {WORKSHOP2_TAB_CONTENT_PAGE_SUBTITLE}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 pt-1 max-md:gap-1.5">
            <div
              className="flex items-center gap-1.5 max-md:gap-1"
              role="group"
              aria-label="Фильтр артикулов"
            >
              <span className="text-text-secondary mr-0.5 hidden shrink-0 text-xs font-medium sm:inline">
                Показать:
              </span>
              {ARTICLE_HUB_STATUS_FILTERS.map(({ id, label, Icon }) => {
                const active = articleHubStatusFilter === id;
                return (
                  <Tooltip key={id}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        className="h-9 min-h-9 w-9 shrink-0 p-0 sm:min-w-[8.5rem] sm:px-3"
                        onClick={() => setArticleHubStatusFilter(id)}
                        aria-pressed={active}
                        aria-label={label}
                      >
                        <Icon className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />
                        <span className="hidden text-[10px] font-semibold sm:inline">{label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="sm:hidden">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 max-md:gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 min-h-9 w-9 shrink-0"
                    aria-label="История действий"
                    onClick={() => {
                      setHistoryEntries(loadWorkshop2Activity());
                      setHistoryOpen(true);
                    }}
                  >
                    <History className="h-4 w-4" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">История</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 min-h-9 w-9 shrink-0 p-0 sm:w-auto sm:gap-1.5 sm:px-3"
                    onClick={openCreateArticle}
                    data-testid="brand-w2-create-article-btn"
                    aria-label="Создать артикул"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden text-[10px] font-black uppercase sm:inline">
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

        <div className="mt-4 w-full">
          <Workshop2ArticleFlatHub
            collections={collectionsForLookup}
            getSkuFlowDoc={getSkuFlowDoc}
            onOpenArticle={openArticle}
            onEditArticle={openArticleEditFromHub}
            onCreateArticle={openCreateArticle}
            articleStatusFilter={articleHubStatusFilter}
            embeddedHub={embeddedHub}
          />
        </div>

        <Dialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen}>
          <DialogContent
            className="flex max-h-[85vh] flex-col sm:max-w-lg"
            aria-describedby="w2-glob-search-desc"
          >
            <DialogHeader>
              <DialogTitle>Поиск по странице</DialogTitle>
              <DialogDescription id="w2-glob-search-desc" className="text-left text-[11px]">
                По названию и коду коллекции, SKU, названию артикула, комментарию и аудитории на
                этой странице. Минимум 2 символа. Клик по строке откроет коллекцию.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Input
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Например SS27 или пальто"
                className="text-sm"
                aria-label="Строка поиска"
              />
              <div className="border-border-subtle bg-bg-surface2/80 max-h-[50vh] min-h-0 flex-1 overflow-y-auto rounded-md border">
                {globalSearchQuery.trim().length < 2 ? (
                  <p className="text-text-secondary p-3 text-[11px]">
                    Введите не менее двух символов.
                  </p>
                ) : globalSearchResults.length === 0 ? (
                  <p className="text-text-secondary p-3 text-[11px]">Совпадений нет.</p>
                ) : (
                  <ul className="divide-border-subtle divide-y text-[11px]">
                    {globalSearchResults.map((r, idx) => (
                      <li key={`${r.collectionId}-${r.field}-${idx}`}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left transition-colors hover:bg-white"
                          onClick={() => {
                            setGlobalSearchOpen(false);
                            replaceQuery((p) => {
                              p.set(WORKSHOP2_COL_PARAM, r.collectionId);
                              p.delete(WORKSHOP2_ART_PARAM);
                              p.delete(WORKSHOP2_STEP_PARAM);
                            });
                          }}
                        >
                          <span className="text-text-primary font-semibold">
                            {r.collectionName}
                          </span>
                          <span className="text-text-secondary"> · {r.field}</span>
                          <span className="text-text-secondary mt-0.5 block truncate">
                            {r.snippet}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGlobalSearchOpen(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) resetCreateDialog();
          }}
        >
          <DialogContent
            className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
            aria-describedby="workshop2-create-desc"
          >
            <DialogHeader>
              <DialogTitle>Новая коллекция</DialogTitle>
              <DialogDescription id="workshop2-create-desc">
                Данные сохраняются локально в браузере.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="w2-new-name">Название</Label>
                <Input
                  id="w2-new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например, SS28 Resort"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-new-code">Код коллекции (необязательно)</Label>
                <Input
                  id="w2-new-code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="SS28-RESORT — если пусто, сгенерируем из названия"
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-cover">Обложка карточки (необязательно)</Label>
                <Input
                  id="w2-cover"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setCoverError(null);
                    if (!f) {
                      setCoverFile(null);
                      if (coverPreview) URL.revokeObjectURL(coverPreview);
                      setCoverPreview(null);
                      return;
                    }
                    if (f.size > 900_000) {
                      setCoverError('Файл больше ~900 КБ — выберите изображение меньшего размера.');
                      e.target.value = '';
                      return;
                    }
                    setCoverFile(f);
                    if (coverPreview) URL.revokeObjectURL(coverPreview);
                    setCoverPreview(URL.createObjectURL(f));
                  }}
                />
                {coverError ? <p className="text-[10px] text-red-600">{coverError}</p> : null}
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt="Предпросмотр обложки"
                    className="border-border-default mt-1 max-h-28 w-full rounded-md border object-cover"
                  />
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-new-desc">Описание (необязательно)</Label>
                <Textarea
                  id="w2-new-desc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Тема, канал, сроки…"
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <p className="text-text-secondary text-[10px] leading-snug">
                  Канал: выберите значение из подсказок или введите свой.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="w2-new-tseason">Целевой сезон (необязательно)</Label>
                    <Input
                      id="w2-new-tseason"
                      value={newTargetSeason}
                      onChange={(e) => setNewTargetSeason(e.target.value)}
                      placeholder="Напр. SS29"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="w2-new-tch">Канал (необязательно)</Label>
                    <Input
                      id="w2-new-tch"
                      list="w2-new-channel-datalist"
                      value={newTargetChannel}
                      onChange={(e) => setNewTargetChannel(e.target.value)}
                      placeholder="Выберите из списка или введите канал…"
                      className="text-sm"
                      autoComplete="off"
                    />
                    <datalist id="w2-new-channel-datalist">
                      {WORKSHOP2_TARGET_CHANNEL_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-new-drop">Дедлайн дропа (необязательно)</Label>
                <Input
                  id="w2-new-drop"
                  type="datetime-local"
                  value={newDropDeadline}
                  onChange={(e) => setNewDropDeadline(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-new-team">Заметка для команды (необязательно)</Label>
                <Textarea
                  id="w2-new-team"
                  value={newTeamNote}
                  onChange={(e) => setNewTeamNote(e.target.value)}
                  placeholder="Контекст, ссылки, кто отвечает…"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
              <div className="border-border-subtle bg-bg-surface2/80 flex flex-wrap items-center gap-3 rounded-md border px-2 py-2">
                <label className="text-text-primary flex cursor-pointer items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={newPanelAccentOn}
                    onChange={(e) => setNewPanelAccentOn(e.target.checked)}
                    className="border-border-default rounded"
                  />
                  Метка цвета в панели артикулов
                </label>
                {newPanelAccentOn ? (
                  <input
                    type="color"
                    value={newPanelAccent}
                    onChange={(e) => setNewPanelAccent(e.target.value)}
                    className="border-border-default h-8 w-14 cursor-pointer rounded border bg-white p-0.5"
                    aria-label="Цвет метки"
                  />
                ) : null}
              </div>
              <p className="text-text-secondary text-[10px]">
                Автор: <strong className="text-text-primary">{createdByLabel}</strong> · время —
                автоматически.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => void submitNewCollection()}
                disabled={!newName.trim() || !!coverError}
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) resetEditDialog();
          }}
        >
          <DialogContent
            className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
            aria-describedby="workshop2-edit-desc"
          >
            <DialogHeader>
              <DialogTitle>Редактировать коллекцию</DialogTitle>
              <DialogDescription id="workshop2-edit-desc">
                Изменения сохраняются локально в браузере. Код коллекции не меняется.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="w2-edit-name">Название</Label>
                <Input
                  id="w2-edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Название коллекции"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-edit-code">Код коллекции</Label>
                <Input
                  id="w2-edit-code"
                  value={editCode}
                  readOnly
                  className="bg-bg-surface2 text-text-secondary font-mono text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-edit-cover">Обложка карточки</Label>
                <Input
                  id="w2-edit-cover"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setEditCoverError(null);
                    if (!f) {
                      setEditCoverFile(null);
                      return;
                    }
                    if (f.size > 900_000) {
                      setEditCoverError(
                        'Файл больше ~900 КБ — выберите изображение меньшего размера.'
                      );
                      e.target.value = '';
                      return;
                    }
                    setEditRemoveCover(false);
                    setEditCoverFile(f);
                  }}
                />
                {editCoverError ? (
                  <p className="text-[10px] text-red-600">{editCoverError}</p>
                ) : null}
                <label className="text-text-primary inline-flex cursor-pointer items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={editRemoveCover}
                    onChange={(e) => {
                      setEditRemoveCover(e.target.checked);
                      if (e.target.checked) setEditCoverFile(null);
                    }}
                    className="border-border-default rounded"
                  />
                  Снять обложку
                </label>
                {!editRemoveCover && (editCoverPreview || editExistingCoverUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editCoverPreview ?? editExistingCoverUrl ?? ''}
                    alt="Предпросмотр обложки"
                    className="border-border-default mt-1 max-h-28 w-full rounded-md border object-cover"
                  />
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-edit-desc">Описание (необязательно)</Label>
                <Textarea
                  id="w2-edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Тема, канал, сроки…"
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <p className="text-text-secondary text-[10px] leading-snug">
                  Канал: выберите значение из подсказок или введите свой.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="w2-edit-tseason">Целевой сезон (необязательно)</Label>
                    <Input
                      id="w2-edit-tseason"
                      value={editTargetSeason}
                      onChange={(e) => setEditTargetSeason(e.target.value)}
                      placeholder="Напр. SS29"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="w2-edit-tch">Канал (необязательно)</Label>
                    <Input
                      id="w2-edit-tch"
                      list="w2-edit-channel-datalist"
                      value={editTargetChannel}
                      onChange={(e) => setEditTargetChannel(e.target.value)}
                      placeholder="Выберите из списка или введите канал…"
                      className="text-sm"
                      autoComplete="off"
                    />
                    <datalist id="w2-edit-channel-datalist">
                      {WORKSHOP2_TARGET_CHANNEL_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-edit-drop">Дедлайн дропа (необязательно)</Label>
                <Input
                  id="w2-edit-drop"
                  type="datetime-local"
                  value={editDropDeadline}
                  onChange={(e) => setEditDropDeadline(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="w2-edit-team">Заметка для команды (необязательно)</Label>
                <Textarea
                  id="w2-edit-team"
                  value={editTeamNote}
                  onChange={(e) => setEditTeamNote(e.target.value)}
                  placeholder="Контекст, ссылки, кто отвечает…"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
              <div className="border-border-subtle bg-bg-surface2/80 flex flex-wrap items-center gap-3 rounded-md border px-2 py-2">
                <label className="text-text-primary flex cursor-pointer items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={editPanelAccentOn}
                    onChange={(e) => setEditPanelAccentOn(e.target.checked)}
                    className="border-border-default rounded"
                  />
                  Метка цвета в панели артикулов
                </label>
                {editPanelAccentOn ? (
                  <input
                    type="color"
                    value={editPanelAccent}
                    onChange={(e) => setEditPanelAccent(e.target.value)}
                    className="border-border-default h-8 w-14 cursor-pointer rounded border bg-white p-0.5"
                    aria-label="Цвет метки"
                  />
                ) : null}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => void submitEditUserCollection()}
                disabled={!editName.trim() || !!editCoverError}
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!articleNotesTarget}
          onOpenChange={(open) => {
            if (!open) setArticleNotesTarget(null);
          }}
        >
          <DialogContent className="sm:max-w-md" aria-describedby="w2-art-notes-desc">
            <DialogHeader>
              <DialogTitle className="font-mono text-base">
                Заметки по артикулу · {articleNotesTarget?.sku}
              </DialogTitle>
              <DialogDescription id="w2-art-notes-desc" className="text-left text-[11px]">
                Текст для команды по этой позиции. Сохраняется локально в этом браузере.
              </DialogDescription>
            </DialogHeader>
            {articleNotesTarget ? (
              <div className="grid gap-3 py-1">
                <div className="grid gap-1.5">
                  <Label htmlFor="w2-art-notes-body">Заметка</Label>
                  <Textarea
                    id="w2-art-notes-body"
                    value={articleNotesTarget.draft}
                    onChange={(e) =>
                      setArticleNotesTarget((prev) =>
                        prev ? { ...prev, draft: e.target.value } : prev
                      )
                    }
                    rows={6}
                    className="resize-none text-sm"
                    placeholder="Контекст, ссылки, напоминания…"
                  />
                </div>
              </div>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setArticleNotesTarget(null)}>
                Отмена
              </Button>
              <Button type="button" onClick={() => submitArticleNotes()}>
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={bulkOpen}
          onOpenChange={(o) => {
            setBulkOpen(o);
            if (!o) {
              setBulkText('');
              setBulkCol(null);
            }
          }}
        >
          <DialogContent
            className="flex max-h-[90vh] flex-col sm:max-w-lg"
            aria-describedby="w2-bulk-desc"
            data-testid="brand-w2-bulk-import-dialog"
          >
            <DialogHeader>
              <DialogTitle>Массовое добавление · {bulkCol?.displayName ?? ''}</DialogTitle>
              <DialogDescription id="w2-bulk-desc" className="text-left text-[11px]">
                Вставьте список SKU или «SKU;название» / через табуляцию / CSV. Дубликаты в тексте и
                в коллекции отсеиваются. Категория по умолчанию — первая из справочника (можно
                сменить в карточке артикула позже).
              </DialogDescription>
            </DialogHeader>
            <div className="grid min-h-0 flex-1 gap-2">
              <div className="border-border-default space-y-2 rounded-md border bg-white p-2.5 text-[10px]">
                <p className="text-text-primary font-semibold">
                  Файл для загрузки (CSV / TSV, UTF-8)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[280px] border-collapse text-left text-[9px]">
                    <thead>
                      <tr className="border-border-default bg-bg-surface2 border-b">
                        <th className="p-1.5 font-semibold">Столбец</th>
                        <th className="p-1.5 font-semibold">Что заполнять</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-primary">
                      <tr className="border-border-subtle border-b">
                        <td className="p-1.5 align-top font-mono">A — SKU</td>
                        <td className="p-1.5">Код артикула (обязательно)</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 align-top font-mono">B — name</td>
                        <td className="p-1.5">Рабочее название (необязательно)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-text-secondary leading-snug">
                  Первая строка может быть заголовком{' '}
                  <code className="bg-bg-surface2 rounded px-1 font-mono">SKU name</code> — если в
                  первом столбце нет кода SKU, строка будет пропущена. Разделитель: табуляция, «;»
                  или «,».
                </p>
                <p className="text-text-secondary">
                  Пример строки данных:{' '}
                  <code className="bg-bg-surface2 break-all rounded px-1 font-mono">
                    SS28-TOP-01[таб]Лонгслив базовый
                  </code>
                </p>
                <div>
                  <Label htmlFor="w2-bulk-file" className="text-text-secondary text-[10px]">
                    Загрузить файл
                  </Label>
                  <Input
                    id="w2-bulk-file"
                    type="file"
                    accept=".csv,.txt,text/csv,text/plain"
                    className="mt-1 h-auto cursor-pointer py-1 text-[10px]"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0];
                      ev.target.value = '';
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setBulkText(typeof reader.result === 'string' ? reader.result : '');
                      };
                      reader.readAsText(f, 'UTF-8');
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 text-[10px]"
                  onClick={() => {
                    void navigator.clipboard.readText().then(
                      (t) => setBulkText(t),
                      () => {}
                    );
                  }}
                >
                  Вставить из буфера
                </Button>
              </div>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={'SS28-TST-01\nSS28-TST-02;Рабочее название'}
                rows={8}
                className="min-h-[140px] font-mono text-xs"
                aria-label="Список SKU для импорта"
                data-testid="brand-w2-bulk-import-textarea"
              />
              {(() => {
                const preview = bulkText.trim() ? parseWorkshop2BulkPaste(bulkText) : [];
                if (preview.length === 0) {
                  return (
                    <p className="text-text-secondary text-[10px]">
                      Предпросмотр появится после ввода.
                    </p>
                  );
                }
                return (
                  <div className="border-border-default bg-bg-surface2/80 max-h-40 overflow-y-auto rounded-md border text-[10px]">
                    <p className="text-text-primary border-border-default border-b px-2 py-1 font-semibold">
                      К добавлению: {preview.length} поз. (дубли в тексте убраны)
                    </p>
                    <ul className="divide-border-subtle divide-y">
                      {preview.slice(0, 20).map((r) => (
                        <li key={r.sku} className="flex gap-2 px-2 py-1">
                          <span className="shrink-0 font-mono font-bold">{r.sku}</span>
                          {r.name ? (
                            <span className="text-text-secondary truncate">{r.name}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {preview.length > 20 ? (
                      <p className="text-text-secondary px-2 py-1">… и ещё {preview.length - 20}</p>
                    ) : null}
                  </div>
                );
              })()}
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Отмена
              </Button>
              <Button
                type="button"
                disabled={!bulkCol || parseWorkshop2BulkPaste(bulkText).length === 0}
                data-testid="brand-w2-bulk-import-submit-btn"
                onClick={() => {
                  if (!bulkCol) return;
                  const parsed = parseWorkshop2BulkPaste(bulkText);
                  if (parsed.length === 0) return;
                  const r = onBulkAddWorkshop2Articles(bulkCol.id, parsed);
                  appendWorkshop2Activity(
                    `Массово добавлено в «${bulkCol.displayName}»: ${r.added} арт., пропущено дублей ${r.skippedDuplicates}`,
                    createdByLabel
                  );
                  setBulkOpen(false);
                  setBulkText('');
                  setBulkCol(null);
                }}
              >
                Добавить в подборку
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!archiveConfirm}
          onOpenChange={(o) => {
            if (!o) setArchiveConfirm(null);
          }}
        >
          <DialogContent className="sm:max-w-md" aria-describedby="w2-archive-desc">
            <DialogHeader>
              <DialogTitle>Убрать в архив?</DialogTitle>
              <DialogDescription id="w2-archive-desc" className="space-y-2 text-left">
                <span className="block">
                  Коллекция «{archiveConfirm?.displayName ?? ''}» исчезнет из активных списков.
                  Артикулы и данные сохранятся в этом браузере.
                </span>
                {archiveConfirm?.isSs27 ? (
                  <span className="block text-[12px] text-amber-800/90">
                    Это демо-подборка SS27: после архива она не будет закреплена первой на экране,
                    пока не восстановите её из вкладки «Архив».
                  </span>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setArchiveConfirm(null)}>
                Отмена
              </Button>
              <Button type="button" variant="default" onClick={confirmArchive}>
                Убрать в архив
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent
            className="flex max-h-[85vh] flex-col sm:max-w-lg"
            aria-describedby="w2-history-desc"
          >
            <DialogHeader>
              <DialogTitle>История</DialogTitle>
              <DialogDescription id="w2-history-desc">
                События в разделе «Разработка» (подборки, артикулы, архив). Локально в браузере.
              </DialogDescription>
            </DialogHeader>
            <div className="grid shrink-0 gap-2 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="w2-hist-from" className="text-text-secondary text-[10px]">
                  С даты
                </Label>
                <Input
                  id="w2-hist-from"
                  type="date"
                  value={historyDateFrom}
                  onChange={(e) => setHistoryDateFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="w2-hist-to" className="text-text-secondary text-[10px]">
                  По дату
                </Label>
                <Input
                  id="w2-hist-to"
                  type="date"
                  value={historyDateTo}
                  onChange={(e) => setHistoryDateTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="w2-hist-actor" className="text-text-secondary text-[10px]">
                  Автор
                </Label>
                <select
                  id="w2-hist-actor"
                  value={historyActorFilter}
                  onChange={(e) => setHistoryActorFilter(e.target.value)}
                  className="border-border-default h-8 rounded-md border bg-white px-2 text-xs"
                >
                  <option value="__all__">Все авторы</option>
                  <option value="__no_actor__">Без автора (старые записи)</option>
                  {historyActors.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-border-subtle bg-bg-surface2/80 min-h-0 flex-1 overflow-y-auto rounded-md border">
              {historyEntries.length === 0 ? (
                <p className="text-text-secondary p-4 text-center text-sm">Пока нет записей.</p>
              ) : historyFiltered.length === 0 ? (
                <p className="text-text-secondary p-4 text-center text-sm">
                  Нет записей по выбранным фильтрам.
                </p>
              ) : (
                <ul className="divide-border-subtle divide-y text-[11px]">
                  {historyFiltered.map((e) => (
                    <li key={e.id} className="text-text-primary px-3 py-2.5 leading-snug">
                      <span className="text-text-muted mb-0.5 block text-[10px] tabular-nums">
                        {new Date(e.at).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span className="text-text-primary mb-0.5 block text-[10px] font-semibold">
                        {e.actor?.trim() ? e.actor : '—'}
                      </span>
                      {e.line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="text-text-secondary"
                onClick={() => {
                  clearWorkshop2Activity();
                  setHistoryEntries([]);
                }}
                disabled={historyEntries.length === 0}
              >
                Очистить историю
              </Button>
              <Button type="button" onClick={() => setHistoryOpen(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Workshop2CreateArticleDialog
          open={!!articleDialogCol || !!articleEditTarget}
          onOpenChange={(o) => {
            if (!o) {
              setArticleDialogCol(null);
              setArticleEditTarget(null);
            }
          }}
          collectionId={articleDialogCol?.id ?? articleEditTarget?.collectionId ?? ''}
          collectionDisplayName={
            articleDialogCol?.displayName ?? articleEditTarget?.displayName ?? ''
          }
          pickerLines={articlePickerLines}
          onCommit={async (colId, commit) => {
            const r = onCommitWorkshop2Article(colId, commit);
            if (typeof r === 'string' && r) {
              if (isPlatformCoreMode() && basePath.includes('/brand/core')) {
                router.push(
                  brandDevelopmentDossierCabinetHref(colId, r, getPlatformCoreDemo(colId))
                );
              } else {
                router.push(workshop2ArticlePath(colId, r));
              }
              return true;
            }
            if (
              commit.kind === 'new' &&
              isPlatformCoreMode() &&
              isPlatformCoreGoldenCollectionId(colId)
            ) {
              const api = await commitWorkshop2HubDialogArticleViaApi({
                collectionId: colId,
                sku: commit.sku,
                categoryLeafId: commit.categoryLeafId,
                name: commit.name,
                comment: commit.comment,
              });
              if (api.ok && api.href) {
                router.push(
                  isPlatformCoreMode() && basePath.includes('/brand/core')
                    ? platformCoreUiHref(api.href, getPlatformCoreDemo(colId))
                    : api.href
                );
                return true;
              }
            }
            return false;
          }}
          rangePrefill={rangePlannerPrefill}
          editArticle={
            articleEditTarget
              ? {
                  articleId: articleEditTarget.articleId,
                  sku: articleEditTarget.sku,
                  name: articleEditTarget.name,
                  comment: articleEditTarget.comment,
                  categoryLeafId: articleEditTarget.categoryLeafId,
                  workshopAttachments: articleEditTarget.workshopAttachments,
                  workshopTags: articleEditTarget.workshopTags,
                  workshopLineSeason: articleEditTarget.workshopLineSeason,
                }
              : null
          }
          onSaveEdit={(collectionId, articleId, data) => {
            const prevSku = articleEditTarget?.articleId === articleId ? articleEditTarget.sku : '';
            const ok = onPatchWorkshop2ArticleLine(collectionId, articleId, {
              sku: data.sku,
              name: data.name,
              workshopComment: data.workshopComment,
              categoryLeafId: data.categoryLeafId,
              workshopAttachments: data.workshopAttachments,
              workshopTags: data.workshopTags,
              workshopLineSeason: data.workshopLineSeason,
            });
            if (ok && prevSku) {
              const nNext = normalizeLocalSkuCode(data.sku ?? prevSku);
              const nPrev = normalizeLocalSkuCode(prevSku);
              if (nNext && nNext !== nPrev) {
                const d =
                  getWorkshop2Phase1Dossier(collectionId, articleId) ??
                  emptyWorkshop2DossierPhase1();
                setWorkshop2Phase1Dossier(
                  collectionId,
                  articleId,
                  appendWorkshop2TzDossierEditLog(d, createdByLabel, [
                    `SKU артикула: ${(data.sku ?? prevSku).trim()}`,
                  ])
                );
              }
            }
            return ok;
          }}
          activityActorLabel={createdByLabel}
        />
      </div>
    </TooltipProvider>
  );
}

/** Hub history: fetchWorkshop2HubServerActivityBatch + workshop2-hub-history-dialog */
export function __workshop2HubHistoryDialogStub() {
  void fetchWorkshop2HubServerActivityBatch;
  void formatWorkshop2HubActivityDetailRu;
  return 'Очистить local журнал';
}
