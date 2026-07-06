'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { findHandbookLeafById, getHandbookCategoryLeaves } from '@/lib/production/category-catalog';
import {
  calculateDossierReadiness,
  dossierPulseWarningsForSection,
  type DossierSection,
} from '@/lib/production/dossier-readiness-engine';
import {
  buildWorkshop2ProductionPreflightSnapshot,
  getW2ProductionPreflightScoreBand,
  type W2ProductionPreflightIssue,
} from '@/lib/production/workshop2-production-preflight';
import {
  formatWorkshop2InternalArticleCodePlaceholder,
  isWorkshop2InternalArticleCodeValid,
  normalizeLocalSkuCode,
} from '@/lib/production/local-collection-inventory';
import { appendWorkshop2TzDossierEditLog } from '@/lib/production/workshop2-dossier-activity-log';
import {
  W2_ARTICLE_SECTION_DOM,
  WORKSHOP2_ARTICLE_PANE_PARAM,
  WORKSHOP2_DOSSIER_SECTION_PARAM,
  WORKSHOP2_DOSSIER_VIEW_PARAM,
  WORKSHOP2_STEP_PARAM,
  isWorkshop2ArticlePaneAssignmentLegacy,
  parseWorkshop2ArticlePaneParam,
  workshop2ArticleHref,
  workshop2ArticlePath,
  workshop2ArticleUrlSegment,
  workshop2CollectionListHref,
  resolveWorkshop2W2SecOperationalDeepLink,
} from '@/lib/production/workshop2-url';
import {
  defaultSketchExportSurfaceForDossierView,
  persistWorkshop2DossierViewPreference,
  resolveWorkshop2DossierViewFromWorkspaceUrl,
  type Workshop2DossierViewProfile,
} from '@/lib/production/workshop2-dossier-view-infrastructure';
import { W2_VISUALS_SKETCH_ANCHOR_ID } from '@/lib/production/workshop2-material-bom-sketch-strip';
import { Workshop2DossierViewProvider } from '@/components/brand/production/workshop2-dossier-view-context';
import { Workshop2CreateArticleDialog } from '@/components/brand/production/Workshop2CreateArticleDialog';
import {
  isSs27FullTzDemoAutoMergeEnabled,
  isSs27MenCoatFullTzDemoArticle,
} from '@/lib/production/workshop2-ss27-demo-full-tz-dossier';
import { ROUTES } from '@/lib/routes';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import { setWorkshop2ArticleBreadcrumbLabel } from '@/lib/production/w2-article-breadcrumb-override';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import {
  W2_ARTICLE_MAIN_TAB_STRIP,
  w2ArticleMainTabMeta,
} from '@/lib/production/workshop-article-main-tab-labels';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  appendWorkshop2ArticleActivity,
  buildWorkshop2ArticleProductionHistory,
} from '@/lib/production/workshop2-activity-log';
import {
  filterW2MainTabsForCreationMode,
  resolveArticleCreationMode,
  resolveW2MainTabForCreationMode,
  type ArticleCreationMode,
} from '@/lib/platform-core-article-spine';
import { cn } from '@/lib/utils';
import type {
  LocalOrderLine,
  Workshop2ArticleCommit,
  Workshop2ArticleLinePatch,
} from '@/lib/production/local-collection-inventory';
import type { Workshop2CollectionListItem } from '@/components/brand/production/Workshop2TabContent';
import {
  ArticleWorkspaceProvider,
  useArticleWorkspace,
} from '@/components/brand/production/article-workspace-context';
import { useAuth } from '@/providers/auth-provider';
import { flushW2NextStepFeedbackToServer } from '@/lib/production/workshop2-dossier-metrics-ingest';
import {
  buildW2NextStepMlSnapshot,
  w2ReadNextStepMlBuffer,
  w2UpsertNextStepMlBuffer,
} from '@/lib/production/workshop2-dossier-next-step-telemetry';
import {
  Workshop2ArticleWorkspaceTabPanels,
  type Workshop2ArticleWorkspaceMainTab,
} from '@/components/brand/production/Workshop2ArticleWorkspaceTabPanels';
import {
  PassportTzExtraAssigneeCard,
  W2PassportTzStagesPick,
} from '@/components/brand/production/workshop2-article-workspace-passport-tz-widgets';
import { useWorkshop2TzDueNotifications } from '@/hooks/use-workshop2-tz-due-notifications';
import { useRbac } from '@/hooks/useRbac';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  emptyWorkshop2DossierPhase1,
  getWorkshop2Phase1Dossier,
  setWorkshop2Phase1Dossier,
} from '@/lib/production/workshop2-phase1-dossier-storage';
import { mergeSs27DemoDossierIfNeeded } from '@/lib/production/workshop2-ss27-demo-full-tz-dossier';
import { WORKSHOP2_TZ_DIGITAL_SIGNOFF_DEFAULT_CAPABILITIES } from '@/lib/production/workshop2-tz-digital-signoff';
import { buildWorkshop2VisualGateItems } from '@/lib/production/workshop2-visual-section-warnings';
import { exportTzHandoffPdfOnly } from '@/lib/production/sketch-visual-bundle-export';
import { fetchWorkshop2HandoffReadiness } from '@/lib/production/workshop2-sample-api-client';
import { summarizeWorkshop2WorkspaceHandoffFromApiPayload } from '@/lib/production/workshop2-workspace-handoff-api-parity';
import { Workshop2ArticleWorkspaceDossierSkeleton } from '@/components/brand/production/workshop2-article-workspace-dossier-skeleton';
import { Workshop2WorkspaceHeaderDataModeBadge } from '@/components/brand/production/Workshop2WorkspaceHeaderDataModeBadge';
import { Workshop2DossierPersistButton } from '@/components/brand/production/Workshop2DossierPersistButton';
import { prefetchWorkshop2ArticleTabChunks } from '@/components/brand/production/workshop2-tab-panel-chunk-boundary';
import type {
  Workshop2DossierPhase1,
  Workshop2PassportVisualSource,
  Workshop2TzSignatoryBindings,
  Workshop2TzSignatoryExtraRow,
  Workshop2TzSignoffStageId,
} from '@/lib/production/workshop2-dossier-phase1.types';
import {
  getWorkshopTzBrandSignatoryPickerOptions,
  getWorkshopTzSignatoryPickerOptions,
  normalizeWorkshopTzSignatoryBindings,
  WORKSHOP2_TZ_EXTRA_ROLE_PRESET_BUTTON_LABEL_RU,
  WORKSHOP2_TZ_EXTRA_ROLE_PRESET_DEFS,
  workshop2TzExtraRowFromPreset,
  workshopTzAssigneeOrganizationName,
  workshopTzLabelsMatch,
  workshopTzSelectedStageIds,
  workshopTzSignStagesFromSelection,
  type Workshop2TzExtraRolePresetId,
} from '@/lib/production/workshop2-tz-signatory-options';
import {
  buildWorkshop2OverviewModel,
  toWorkshop2OverviewBundleSnapshot,
  WORKSHOP2_DOSSIER_SECTION_GUIDANCE,
} from '@/lib/production/workshop2-overview-model';
import {
  workshop2PipelineLaneForArticleMainTab,
  workshop2PipelineLaneLabelRu,
  type Workshop2ArticleMainTab,
} from '@/lib/production/workshop2-collection-metrics';
import { isSketchFloorInSearch } from '@/lib/production/sketch-floor-url';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  parseWorkshop2DossierSection,
  WORKSHOP2_DEFAULT_TZ_SIGNOFF_REVOKERS,
  W2_OVERVIEW_DECISION_ROW_MIN,
  W2_OVERVIEW_KPI_TILE_INTERACTIVE,
  W2_OVERVIEW_OPEN_BTN_CLASS,
  W2_PASSPORT_TZ_STAGE_DEFS,
  W2_PASSPORT_TZ_STAGE_ORDER,
  W2_PIPELINE_LANE_TILE_BORDER,
  W2_PULSE_SECTION_LABEL_RU,
  W2_ROUTE_HELP_INFO_BTN_CLASS,
  W2_TZ_PASSPORT_CONTINUE_BTN_CLASS,
} from '@/components/brand/production/workshop2-article-workspace-ui-constants';

const Workshop2Phase1DossierPanel = dynamic(
  () =>
    import('@/components/brand/production/Workshop2Phase1DossierPanel').then((m) => ({
      default: m.Workshop2Phase1DossierPanel,
    })),
  { loading: () => <p className="text-text-secondary px-1 text-sm">Загрузка ТЗ…</p> }
);

const Workshop2DfmCheckPanel = dynamic(
  () =>
    import('@/components/brand/production/workshop2-dfm-check-panel').then((m) => ({
      default: m.Workshop2DfmCheckPanel,
    })),
  { loading: () => null, ssr: false }
);

const Workshop2ContractorMatchmaker = dynamic(
  () =>
    import('@/components/brand/production/workshop2-contractor-matchmaker').then((m) => ({
      default: m.Workshop2ContractorMatchmaker,
    })),
  { loading: () => null, ssr: false }
);

type MainTab = Workshop2ArticleMainTab;

type Props = {
  collectionId: string;
  articleId: string;
  createdByLabel: string;
  /** Предприятие подписанта (рядом с ФИО в подтверждениях секций ТЗ). */
  sectionSignoffOrganizationLabel?: string;
  activeCollections: Workshop2CollectionListItem[];
  archivedCollections: Workshop2CollectionListItem[];
  getArticlePipelineProgress: (
    collectionId: string,
    articleId: string
  ) => { done: number; total: number; pct: number };
  onPatchWorkshop2ArticleLine: (
    collectionId: string,
    articleId: string,
    patch: Workshop2ArticleLinePatch
  ) => boolean;
  articlePickerLines: LocalOrderLine[];
  onCommitWorkshop2Article: (
    collectionId: string,
    commit: Workshop2ArticleCommit
  ) => string | false;
  /** Platform Core Wave 8b: режим из inventory line (strip в BrandDevelopmentArticleWorkspace). */
  articleCreationModeOverride?: ArticleCreationMode;
};

type StageUiStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'ready_for_review'
  | 'approved'
  | 'handed_off';

// DossierSummary imported from dossier-readiness-engine

type RouteStageMeta = {
  id: MainTab;
  label: string;
  owner: string;
  status: StageUiStatus;
  pct: number;
  blocker?: string;
};

type OpenTabOpts = { dossierSection?: DossierSection };
type OpenTabWithFlashOpts = OpenTabOpts & {
  articleFlashId?: string | null;
  /** После смены вкладки: проскроллить к элементу и обновить hash (ТЗ / операционка). */
  scrollDomId?: string;
};

type DossierFlashState = null | { mode: 'main' } | { mode: 'section'; section: DossierSection };

/** Секции для сводки «что не заполнено» в диалоге «Пульс артикула». */
const W2_ARTICLE_PULSE_SECTION_ORDER: readonly DossierSection[] = [
  'general',
  'visuals',
  'material',
  'construction',
  'assignment',
];

/** Подписи секций для pre-flight в «Пульсе артикула». */
const W2_PULSE_PREFLIGHT_SECTION_LABEL_RU: Record<W2ProductionPreflightIssue['section'], string> = {
  passport: 'Паспорт',
  visuals: 'Визуал',
  materials: 'Материалы',
  construction: 'Конструкция',
  sketch: 'Скетч',
  handoff: 'Передача',
};

function Workshop2ArticleWorkspaceScreen({
  collectionId,
  article,
  collection,
  createdByLabel,
  sectionSignoffOrganizationLabel,
  categoryLeafId,
  categoryPath,
  getArticlePipelineProgress,
  onPatchWorkshop2ArticleLine,
  listHref,
  mainTab,
  setMainTab,
  replaceStepQuery,
  w2step,
  goOverview,
  dossierSectionQuery,
  dossierViewProfile,
  sketchFloorInUrl,
  articlePickerLines,
  onCommitWorkshop2Article,
  articleCreationMode,
}: {
  collectionId: string;
  article: Workshop2CollectionListItem['articleRows'][number];
  collection: Workshop2CollectionListItem;
  createdByLabel: string;
  sectionSignoffOrganizationLabel: string;
  categoryLeafId: string;
  categoryPath: string;
  getArticlePipelineProgress: Props['getArticlePipelineProgress'];
  onPatchWorkshop2ArticleLine: Props['onPatchWorkshop2ArticleLine'];
  listHref: string;
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  replaceStepQuery: (mutate: (p: URLSearchParams) => void) => void;
  w2step: string;
  goOverview: () => void;
  dossierSectionQuery: string | null;
  dossierViewProfile: Workshop2DossierViewProfile;
  sketchFloorInUrl: boolean;
  articlePickerLines: LocalOrderLine[];
  onCommitWorkshop2Article: (
    collectionId: string,
    commit: Workshop2ArticleCommit
  ) => string | false;
  articleCreationMode: ArticleCreationMode;
}) {
  const { bundle, dossier, setDossier } = useArticleWorkspace();
  const [dossierHydrateKey, setDossierHydrateKey] = useState(0);
  const { role } = useRbac();
  const creationMode = articleCreationMode;
  const visibleTabs = useMemo(() => {
    const roleFiltered = W2_ARTICLE_MAIN_TAB_STRIP.filter((t) => {
      if (role === 'designer') return t.id === 'tz' || t.id === 'fit' || t.id === 'supply';
      if (role === 'manufacturer')
        return (
          t.id === 'tz' ||
          t.id === 'plan' ||
          t.id === 'release' ||
          t.id === 'qc' ||
          t.id === 'stock'
        );
      return true;
    });
    return filterW2MainTabsForCreationMode(roleFiltered, creationMode);
  }, [role, creationMode]);
  const [signatoriesDialogOpen, setSignatoriesDialogOpen] = useState(false);
  const [pulseDialogOpen, setPulseDialogOpen] = useState(false);
  const [tzPreviewHtml, setTzPreviewHtml] = useState('');
  const [tzPreviewOpen, setTzPreviewOpen] = useState(false);
  const [tzLineDrafts, setTzLineDrafts] = useState<{ sku: string; name: string } | null>(null);
  const closePulseDialog = useCallback(() => {
    setPulseDialogOpen(false);
  }, []);
  const onArticleLineDraftsChange = useCallback((drafts: { sku: string; name: string }) => {
    setTzLineDrafts(drafts);
  }, []);
  const pulseSlotRef = useRef<{
    renderVisualHub?: () => ReactNode;
    renderMaterialBomHub?: () => ReactNode;
    renderTzMinimalControls?: () => ReactNode;
  }>({});
  const [passportVisualIndex, setPassportVisualIndex] = useState(0);
  const [dossierSectionHelpId, setDossierSectionHelpId] = useState<DossierSection | null>(null);
  const [articleHistoryOpen, setArticleHistoryOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [articleEditOpen, setArticleEditOpen] = useState(false);
  const leaf = useMemo(() => findHandbookLeafById(categoryLeafId), [categoryLeafId]);
  const articleDisplayName = useMemo(() => {
    const name = (article.name ?? '').trim();
    if (name === 'Мужское пальто (шерсть)') return 'Шерстяное пальто';
    if (name === 'Платье миди (хлопок)') return 'Хлопковое платье миди';
    return name;
  }, [article.name]);

  const articleUrlSegment = useMemo(
    () => workshop2ArticleUrlSegment(article.internalArticleCode, article.id),
    [article.internalArticleCode, article.id]
  );

  const isFullTzDemoArticle = useMemo(
    () => isSs27MenCoatFullTzDemoArticle(collectionId, { id: article.id, sku: article.sku }),
    [collectionId, article.id, article.sku]
  );
  const fullTzDemoAutoMergeEnabled = isSs27FullTzDemoAutoMergeEnabled();

  useWorkshop2TzDueNotifications({
    dossier,
    leaf: leaf ?? null,
    collectionId,
    articleId: article.id,
    articleSku: article.sku,
  });

  const tzSignoffRevokerLabels = useMemo(
    () =>
      Array.from(
        new Set<string>(
          [...WORKSHOP2_DEFAULT_TZ_SIGNOFF_REVOKERS, createdByLabel.trim()].filter(
            (s) => s.length > 0
          )
        )
      ),
    [createdByLabel]
  );

  const lineTzBindings = article.workshopTzSignatoryBindings;

  const setDossierViewProfile = useCallback(
    (next: Workshop2DossierViewProfile) => {
      persistWorkshop2DossierViewPreference(next);
      replaceStepQuery((p) => {
        if (next === 'full') {
          p.delete(WORKSHOP2_DOSSIER_VIEW_PARAM);
        } else {
          p.set(WORKSHOP2_DOSSIER_VIEW_PARAM, next);
        }
      });
    },
    [replaceStepQuery]
  );

  useEffect(() => {
    setTzLineDrafts(null);
  }, [article.id]);

  useEffect(() => {
    if (mainTab !== 'tz') {
      setTzPreviewHtml('');
      setTzPreviewOpen(false);
    }
  }, [mainTab]);

  useEffect(() => {
    let raw = getWorkshop2Phase1Dossier(collectionId, article.id) ?? null;
    const demoMerged = fullTzDemoAutoMergeEnabled
      ? mergeSs27DemoDossierIfNeeded(
          collectionId,
          { id: article.id, sku: article.sku },
          raw,
          leaf ?? null,
          createdByLabel
        )
      : null;

    if (demoMerged) {
      setWorkshop2Phase1Dossier(collectionId, article.id, demoMerged);
      raw = demoMerged;
    }
    if (raw) {
      const lineB = normalizeWorkshopTzSignatoryBindings(lineTzBindings);
      const dossierB = normalizeWorkshopTzSignatoryBindings(raw.tzSignatoryBindings);
      if (lineB && !dossierB) {
        const merged: Workshop2DossierPhase1 = {
          ...raw,
          tzSignatoryBindings: lineB,
          updatedAt: new Date().toISOString(),
          updatedBy: createdByLabel.slice(0, 120),
        };
        setWorkshop2Phase1Dossier(collectionId, article.id, merged);
        raw = merged;
      }
      const leafAud = leaf?.audienceId?.trim();
      let defaultAudienceId = leafAud;
      let defaultUnisex = raw.isUnisex;

      const skuUpper = (article.sku || '').trim().toUpperCase();
      if (skuUpper.includes('-M-')) {
        defaultAudienceId = 'men';
      } else if (skuUpper.includes('-W-')) {
        defaultAudienceId = 'women';
      } else if (skuUpper.includes('-U-')) {
        defaultAudienceId = 'men'; // Унисекс обычно базируется на мужской шкале
        defaultUnisex = true;
      } else if (skuUpper.includes('-B-')) {
        defaultAudienceId = 'boys';
      } else if (skuUpper.includes('-G-')) {
        defaultAudienceId = 'girls';
      } else if (skuUpper.includes('-N-')) {
        defaultAudienceId = 'newborn';
      }

      const needsAudienceUpdate = defaultAudienceId && !String(raw.selectedAudienceId ?? '').trim();
      const needsUnisexUpdate = defaultUnisex !== raw.isUnisex;

      if (needsAudienceUpdate || needsUnisexUpdate) {
        const merged: Workshop2DossierPhase1 = {
          ...raw,
          ...(needsAudienceUpdate ? { selectedAudienceId: defaultAudienceId } : {}),
          ...(needsUnisexUpdate ? { isUnisex: defaultUnisex } : {}),
          updatedAt: new Date().toISOString(),
          updatedBy: createdByLabel.slice(0, 120),
        };
        setWorkshop2Phase1Dossier(collectionId, article.id, merged);
        raw = merged;
      }
    }
    setDossier(raw);
  }, [
    article.id,
    article.sku,
    collectionId,
    createdByLabel,
    dossierHydrateKey,
    fullTzDemoAutoMergeEnabled,
    leaf,
    lineTzBindings,
    mainTab,
  ]);

  const signatoryOptions = useMemo(() => getWorkshopTzSignatoryPickerOptions(), []);
  const brandSignatoryOptions = useMemo(() => getWorkshopTzBrandSignatoryPickerOptions(), []);
  const signatoryByGroup = useMemo(() => {
    const m = new Map<string, typeof signatoryOptions>();
    for (const o of signatoryOptions) {
      const arr = m.get(o.group) ?? [];
      arr.push(o);
      m.set(o.group, arr);
    }
    return m;
  }, [signatoryOptions]);
  const brandSignatoryByGroup = useMemo(() => {
    const m = new Map<string, typeof brandSignatoryOptions>();
    for (const o of brandSignatoryOptions) {
      const arr = m.get(o.group) ?? [];
      arr.push(o);
      m.set(o.group, arr);
    }
    return m;
  }, [brandSignatoryOptions]);
  const signatorySelectChildren = useMemo(
    () => (
      <>
        <option value="">Не закреплять</option>
        {Array.from(signatoryByGroup.entries()).map(([group, opts]) => (
          <optgroup key={group} label={group}>
            {opts.map((o) => (
              <option key={`${group}-${o.value}`} value={o.value}>
                {o.label}
                {o.sublabel ? ` — ${o.sublabel}` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </>
    ),
    [signatoryByGroup]
  );
  const brandSignatorySelectChildren = useMemo(
    () => (
      <>
        <option value="">Не закреплять</option>
        {Array.from(brandSignatoryByGroup.entries()).map(([group, opts]) => (
          <optgroup key={group} label={group}>
            {opts.map((o) => (
              <option key={`${group}-${o.value}`} value={o.value}>
                {o.label}
                {o.sublabel ? ` — ${o.sublabel}` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </>
    ),
    [brandSignatoryByGroup]
  );

  const passportTzBindings = useMemo((): Workshop2TzSignatoryBindings => {
    const fromDossier = dossier?.tzSignatoryBindings;
    const fromLine = lineTzBindings;
    return {
      ...fromLine,
      ...fromDossier,
    };
  }, [dossier?.tzSignatoryBindings, lineTzBindings]);

  const passportTzSignerRowsOrdered = useMemo(() => {
    const adminName = (dossier?.passportProductionBrief?.articleCardOwnerName ?? '').trim();
    const rank = (role: 'designer' | 'technologist' | 'manager') =>
      role === 'designer' ? 0 : role === 'technologist' ? 1 : 2;

    const bases = [
      {
        id: 'w2-passport-tz-des',
        role: 'designer' as const,
        label: 'Дизайн',
        valueKey: 'designerDisplayLabel' as const,
        stages: passportTzBindings.designerSignStages,
      },
      {
        id: 'w2-passport-tz-tech',
        role: 'technologist' as const,
        label: 'Технолог',
        valueKey: 'technologistDisplayLabel' as const,
        stages: passportTzBindings.technologistSignStages,
      },
      {
        id: 'w2-passport-tz-mgr',
        role: 'manager' as const,
        label: 'Менеджер',
        valueKey: 'managerDisplayLabel' as const,
        stages: passportTzBindings.managerSignStages,
      },
    ] as const;

    type Item =
      | { admin: boolean; kind: 'base'; row: (typeof bases)[number]; assignee: string }
      | { admin: boolean; kind: 'extra'; ex: Workshop2TzSignatoryExtraRow; assignee: string };

    const items: Item[] = [];
    for (const row of bases) {
      const assignee = passportTzBindings[row.valueKey]?.trim() ?? '';
      const admin = Boolean(assignee && adminName && workshopTzLabelsMatch(assignee, adminName));
      items.push({ admin, kind: 'base', row, assignee });
    }
    for (const ex of passportTzBindings.extraAssigneeRows ?? []) {
      const assignee = ex.assigneeDisplayLabel?.trim() ?? '';
      const admin = Boolean(assignee && adminName && workshopTzLabelsMatch(assignee, adminName));
      items.push({ admin, kind: 'extra', ex, assignee });
    }

    const admins = items
      .filter((i) => i.admin)
      .sort((a, b) => {
        if (a.kind === 'base' && b.kind === 'base') return rank(a.row.role) - rank(b.row.role);
        if (a.kind === 'base') return -1;
        if (b.kind === 'base') return 1;
        return 0;
      });
    const non = items.filter((i) => !i.admin);
    const nonB = non
      .filter((i): i is Extract<Item, { kind: 'base' }> => i.kind === 'base')
      .sort((a, b) => rank(a.row.role) - rank(b.row.role));
    const nonX = non.filter((i): i is Extract<Item, { kind: 'extra' }> => i.kind === 'extra');
    return [...admins, ...nonB, ...nonX];
  }, [dossier?.passportProductionBrief?.articleCardOwnerName, passportTzBindings]);

  /** Снять исполнителя или удалить доп. роль крестиком может только администратор карточки SKU (ФИО в «Админ»). */
  const articleCardAdministratorName = (
    dossier?.passportProductionBrief?.articleCardOwnerName ?? ''
  ).trim();
  const canRemovePassportTzRoleRows = useMemo(
    () =>
      Boolean(
        articleCardAdministratorName &&
        workshopTzLabelsMatch(createdByLabel, articleCardAdministratorName)
      ),
    [articleCardAdministratorName, createdByLabel]
  );

  const tzSignatoryListScrollRef = useRef<HTMLDivElement>(null);
  const prevTzExtrasCountRef = useRef<number | null>(null);
  const tzExtrasLen = passportTzBindings.extraAssigneeRows?.length ?? 0;
  useEffect(() => {
    if (
      prevTzExtrasCountRef.current !== null &&
      tzExtrasLen > prevTzExtrasCountRef.current &&
      tzSignatoryListScrollRef.current
    ) {
      const el = tzSignatoryListScrollRef.current;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    prevTzExtrasCountRef.current = tzExtrasLen;
  }, [tzExtrasLen]);

  const persistTzBindings = useCallback(
    (patch: Partial<Workshop2TzSignatoryBindings>) => {
      const base = dossier ?? emptyWorkshop2DossierPhase1();
      const prevBind: Workshop2TzSignatoryBindings = { ...(base.tzSignatoryBindings ?? {}) };
      const nextRaw: Workshop2TzSignatoryBindings = { ...prevBind, ...patch };
      const nextB = normalizeWorkshopTzSignatoryBindings(nextRaw);
      const merged: Workshop2DossierPhase1 = {
        ...base,
        updatedAt: new Date().toISOString(),
        updatedBy: createdByLabel.slice(0, 120),
      };
      if (nextB) merged.tzSignatoryBindings = nextB;
      else delete merged.tzSignatoryBindings;
      setDossier(merged);
      setWorkshop2Phase1Dossier(collectionId, article.id, merged);
      onPatchWorkshop2ArticleLine(collectionId, article.id, {
        workshopTzSignatoryBindings: nextB ?? null,
      });
      setDossierHydrateKey((k) => k + 1);
    },
    [article.id, collectionId, createdByLabel, dossier, onPatchWorkshop2ArticleLine]
  );

  const setRoleSignStagesBulk = useCallback(
    (role: 'designer' | 'technologist' | 'manager', ids: Workshop2TzSignoffStageId[]) => {
      let finalIds = ids;
      if (role === 'technologist') {
        const required = ['tz', 'sample', 'supply'] as Workshop2TzSignoffStageId[];
        finalIds = Array.from(new Set([...ids, ...required]));
      }
      const field =
        role === 'designer'
          ? 'designerSignStages'
          : role === 'technologist'
            ? 'technologistSignStages'
            : 'managerSignStages';
      persistTzBindings({
        [field]: workshopTzSignStagesFromSelection(finalIds, W2_PASSPORT_TZ_STAGE_ORDER),
      });
    },
    [persistTzBindings]
  );

  const updateCardAdministrator = useCallback(
    (name: string) => {
      const base = dossier ?? emptyWorkshop2DossierPhase1();
      const brief = { ...(base.passportProductionBrief ?? {}) };
      const t = name.trim();
      if (t) brief.articleCardOwnerName = t;
      else delete brief.articleCardOwnerName;
      delete brief.articleCardOwnerRole;
      const merged: Workshop2DossierPhase1 = {
        ...base,
        passportProductionBrief: Object.keys(brief).length ? brief : undefined,
        updatedAt: new Date().toISOString(),
        updatedBy: createdByLabel.slice(0, 120),
      };
      setDossier(merged);
      setWorkshop2Phase1Dossier(collectionId, article.id, merged);
    },
    [article.id, collectionId, createdByLabel, dossier]
  );

  const toggleCardAdminForAssignee = useCallback(
    (assigneeLabel: string | undefined, checked: boolean) => {
      const t = assigneeLabel?.trim() ?? '';
      const cur = (dossier?.passportProductionBrief?.articleCardOwnerName ?? '').trim();
      if (checked) {
        if (t) updateCardAdministrator(t);
        return;
      }
      if (cur && workshopTzLabelsMatch(cur, t)) {
        updateCardAdministrator('');
      }
    },
    [dossier?.passportProductionBrief?.articleCardOwnerName, updateCardAdministrator]
  );

  const setExtraRowSignStagesBulk = useCallback(
    (rowId: string, ids: Workshop2TzSignoffStageId[]) => {
      const rows = [...(passportTzBindings.extraAssigneeRows ?? [])];
      const idx = rows.findIndex((r) => r.rowId === rowId);
      if (idx < 0) return;
      rows[idx] = {
        ...rows[idx]!,
        signStages: workshopTzSignStagesFromSelection(ids, W2_PASSPORT_TZ_STAGE_ORDER),
      };
      persistTzBindings({ extraAssigneeRows: rows });
    },
    [passportTzBindings.extraAssigneeRows, persistTzBindings]
  );

  /** Снять снятия этапов: все закреплённые роли участвуют на всех этапах маршрута. */
  const clearSignStageExclusionsForAllRoles = useCallback(() => {
    const extras = passportTzBindings.extraAssigneeRows;
    const nextExtras =
      extras && extras.length > 0
        ? extras.map((r) => {
            const { signStages: _drop, ...rest } = r;
            return rest;
          })
        : undefined;
    persistTzBindings({
      designerSignStages: undefined,
      technologistSignStages: undefined,
      managerSignStages: undefined,
      ...(nextExtras && nextExtras.length > 0 ? { extraAssigneeRows: nextExtras } : {}),
    });
  }, [passportTzBindings.extraAssigneeRows, persistTzBindings]);

  const addExtraTzRoleRow = useCallback(() => {
    const row: Workshop2TzSignatoryExtraRow = {
      rowId: `w2-tz-extra-${Date.now().toString(36)}`,
      roleTitle: 'Роль',
    };
    persistTzBindings({
      extraAssigneeRows: [...(passportTzBindings.extraAssigneeRows ?? []), row],
    });
  }, [passportTzBindings.extraAssigneeRows, persistTzBindings]);

  const addExtraTzRoleFromPreset = useCallback(
    (presetId: Workshop2TzExtraRolePresetId) => {
      const row = workshop2TzExtraRowFromPreset(presetId);
      persistTzBindings({
        extraAssigneeRows: [...(passportTzBindings.extraAssigneeRows ?? []), row],
      });
    },
    [passportTzBindings.extraAssigneeRows, persistTzBindings]
  );

  const removeExtraTzRoleRow = useCallback(
    (rowId: string) => {
      if (!canRemovePassportTzRoleRows) return;
      const rows = passportTzBindings.extraAssigneeRows ?? [];
      const victim = rows.find((r) => r.rowId === rowId);
      const adminName = (dossier?.passportProductionBrief?.articleCardOwnerName ?? '').trim();
      const victimLabel = victim?.assigneeDisplayLabel?.trim() ?? '';
      if (victimLabel && adminName && workshopTzLabelsMatch(victimLabel, adminName)) return;
      const next = rows.filter((r) => r.rowId !== rowId);
      persistTzBindings({ extraAssigneeRows: next.length ? next : undefined });
    },
    [
      canRemovePassportTzRoleRows,
      dossier?.passportProductionBrief?.articleCardOwnerName,
      passportTzBindings.extraAssigneeRows,
      persistTzBindings,
    ]
  );

  const patchExtraRowTitle = useCallback(
    (rowId: string, title: string) => {
      const rows = (passportTzBindings.extraAssigneeRows ?? []).map((r) =>
        r.rowId === rowId ? { ...r, roleTitle: title } : r
      );
      persistTzBindings({ extraAssigneeRows: rows });
    },
    [passportTzBindings.extraAssigneeRows, persistTzBindings]
  );

  const patchExtraRowAssignee = useCallback(
    (rowId: string, value: string) => {
      const rows = (passportTzBindings.extraAssigneeRows ?? []).map((r) =>
        r.rowId === rowId ? { ...r, assigneeDisplayLabel: value.trim() || undefined } : r
      );
      persistTzBindings({ extraAssigneeRows: rows });
    },
    [passportTzBindings.extraAssigneeRows, persistTzBindings]
  );

  const dossierReadiness = useMemo(() => calculateDossierReadiness(dossier, leaf), [dossier, leaf]);
  const dossierSummary = dossierReadiness.summary ?? {
    exists: false,
    visualsReady: false,
    materialReady: false,
    measurementsReady: false,
    approvalsReady: false,
    warnings: [] as string[],
    readyForSample: false,
  };
  const productionPreflightPulse = useMemo(() => {
    if (!dossier) return null;
    const sku = (tzLineDrafts?.sku ?? article.sku ?? '').trim();
    const name = (tzLineDrafts?.name ?? articleDisplayName ?? '').trim();
    return buildWorkshop2ProductionPreflightSnapshot(dossier, {
      articleSkuDraft: sku,
      articleNameDraft: name,
    });
  }, [dossier, article.sku, articleDisplayName, tzLineDrafts]);
  const overviewModel = useMemo(
    () =>
      buildWorkshop2OverviewModel({
        dossier,
        leaf,
        bundle: toWorkshop2OverviewBundleSnapshot(bundle),
      }),
    [bundle, dossier, leaf]
  );
  const { user } = useAuth();
  const w2MlMetricsCtx = useMemo(
    () => ({
      appUserUid: user?.uid ?? null,
      orgId: user?.activeOrganizationId ?? null,
      sku: article.sku,
    }),
    [user?.uid, user?.activeOrganizationId, article.sku]
  );
  const mlNavSeqRef = useRef<{ snapshotHash: string; seq: number }>({ snapshotHash: '', seq: 0 });
  const prevMainNavRef = useRef<{ tab: MainTab; section: string | null } | null>(null);
  useEffect(() => {
    prevMainNavRef.current = null;
    mlNavSeqRef.current = { snapshotHash: '', seq: 0 };
  }, [article.id]);
  const bundleSnapForMl = useMemo(() => toWorkshop2OverviewBundleSnapshot(bundle), [bundle]);
  const warningsDigest = dossierSummary.warnings.join('\u0001');

  useEffect(() => {
    if (typeof window === 'undefined' || !dossier) return;
    const snap = buildW2NextStepMlSnapshot({
      warnings: dossierSummary.warnings,
      model: overviewModel,
      bundle: bundleSnapForMl,
    });
    const buf = w2UpsertNextStepMlBuffer(collectionId, article.id, snap);
    if (buf.snapshotHash !== mlNavSeqRef.current.snapshotHash) {
      mlNavSeqRef.current = { snapshotHash: buf.snapshotHash, seq: 0 };
    }
  }, [article.id, bundleSnapForMl, collectionId, dossier, overviewModel, warningsDigest]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sec = dossierSectionQuery;
    const prev = prevMainNavRef.current;
    prevMainNavRef.current = { tab: mainTab, section: sec };
    if (!prev) return;
    if (prev.tab === mainTab && prev.section === sec) return;

    const buf = w2ReadNextStepMlBuffer(collectionId, article.id);
    if (!buf) return;
    if (buf.snapshotHash !== mlNavSeqRef.current.snapshotHash) {
      mlNavSeqRef.current = { snapshotHash: buf.snapshotHash, seq: 0 };
    }
    mlNavSeqRef.current.seq += 1;
    const seq = mlNavSeqRef.current.seq;
    flushW2NextStepFeedbackToServer(
      collectionId,
      article.id,
      {
        sku: article.sku,
        buffer: buf,
        mainTab,
        dossierSection: sec,
        navigationSeq: seq,
      },
      w2MlMetricsCtx
    );
  }, [article.id, article.sku, collectionId, dossierSectionQuery, mainTab, w2MlMetricsCtx]);

  const focusDossierSection = useMemo(
    () => parseWorkshop2DossierSection(dossierSectionQuery),
    [dossierSectionQuery]
  );

  const pulseWarnings = useMemo(
    () =>
      dossierPulseWarningsForSection(
        dossierReadiness,
        mainTab === 'tz' ? focusDossierSection : null
      ),
    [dossierReadiness, focusDossierSection, mainTab]
  );

  const pulseScore = productionPreflightPulse?.score ?? 0;
  const pulseHandoffOk = Boolean(
    productionPreflightPulse?.canSendToFactory && dossierReadiness.overall.readyForHandoff
  );
  const pulseScoreBand = productionPreflightPulse
    ? getW2ProductionPreflightScoreBand(productionPreflightPulse.score)
    : null;
  const pulsePreflightBySection = useMemo((): Record<string, W2ProductionPreflightIssue[]> => {
    if (!productionPreflightPulse) return {};
    const map: Record<string, W2ProductionPreflightIssue[]> = {};
    for (const issue of productionPreflightPulse.issues) {
      const k = issue.section;
      if (!map[k]) map[k] = [];
      map[k]!.push(issue);
    }
    return map;
  }, [productionPreflightPulse]);

  const dossierSectionHelp =
    dossierSectionHelpId !== null ? WORKSHOP2_DOSSIER_SECTION_GUIDANCE[dossierSectionHelpId] : null;

  const articleProductionHistory = useMemo(
    () =>
      buildWorkshop2ArticleProductionHistory({
        collectionId,
        articleId: article.id,
        articleSku: article.sku,
        dossierUpdatedAt: dossier?.updatedAt,
        dossierUpdatedBy: dossier?.updatedBy,
        inventoryAddedAt: article.addedAtIso,
        inventoryUpdatedAt: article.updatedAtIso,
        inventoryActor: article.createdInWorkshop2By,
      }),
    [
      collectionId,
      article.id,
      article.sku,
      article.addedAtIso,
      article.updatedAtIso,
      article.createdInWorkshop2By,
      dossier?.updatedAt,
      dossier?.updatedBy,
    ]
  );

  const passportUpdatedDisplay = useMemo(() => {
    const stamps = [dossier?.updatedAt, article.addedAtIso, article.updatedAtIso].filter(
      (x): x is string => Boolean(x)
    );
    if (stamps.length === 0) return null;
    const maxIso = stamps.reduce((a, b) => (a > b ? a : b));
    return new Date(maxIso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [dossier?.updatedAt, article.addedAtIso, article.updatedAtIso]);

  const passportSketchSlides = useMemo(() => {
    if (!dossier) return [];
    const slides: { src: string; alt: string }[] = [];
    if (dossier.categorySketchImageDataUrl) {
      slides.push({
        src: dossier.categorySketchImageDataUrl,
        alt: 'Основной эскиз в паспорте артикула',
      });
    }
    const slots = [...(dossier.subcategorySketchSlots ?? [])].sort((a, b) => a.level - b.level);
    for (const slot of slots) {
      if (slot.imageDataUrl) {
        slides.push({
          src: slot.imageDataUrl,
          alt: `Эскиз уровня ${slot.level}`,
        });
      }
    }
    for (const sheet of dossier.sketchSheets ?? []) {
      if (sheet.imageDataUrl) {
        const t = sheet.title?.trim() || sheet.viewKind || 'лист';
        slides.push({
          src: sheet.imageDataUrl,
          alt: `Скетч-лист: ${t}`,
        });
      }
    }
    return slides;
  }, [dossier]);

  const passportReferenceSlides = useMemo(() => {
    if (!dossier) return [];
    const slides: { src: string; alt: string }[] = [];
    for (const ref of dossier.visualReferences ?? []) {
      if (ref.previewDataUrl && ref.mimeType?.startsWith('image/')) {
        slides.push({
          src: ref.previewDataUrl,
          alt: ref.title?.trim() ? ref.title : 'Визуальный референс',
        });
      }
    }
    return slides;
  }, [dossier]);

  const passportGeneratedSlides = useMemo(() => {
    if (!dossier) return [];
    const urls = dossier.passportGeneratedImageDataUrls ?? [];
    return urls.filter(Boolean).map((src, i) => ({
      src,
      alt: `Сгенерированное фото ${i + 1}`,
    }));
  }, [dossier]);

  const passportVisualSource: Workshop2PassportVisualSource =
    dossier?.passportVisualSource ?? 'sketch';

  const passportVisualSlides = useMemo(() => {
    if (passportVisualSource === 'reference') return passportReferenceSlides;
    if (passportVisualSource === 'generated') return passportGeneratedSlides;
    return passportSketchSlides;
  }, [
    passportVisualSource,
    passportReferenceSlides,
    passportGeneratedSlides,
    passportSketchSlides,
  ]);

  const updatePassportVisualSource = useCallback(
    (next: Workshop2PassportVisualSource) => {
      setDossier((prev) => {
        const base = prev ?? emptyWorkshop2DossierPhase1();
        const merged: Workshop2DossierPhase1 = {
          ...base,
          passportVisualSource: next,
          updatedAt: new Date().toISOString(),
          updatedBy: createdByLabel.slice(0, 120),
        };
        setWorkshop2Phase1Dossier(collectionId, article.id, merged);
        return merged;
      });
    },
    [article.id, collectionId, createdByLabel]
  );

  useEffect(() => {
    setPassportVisualIndex((i) => {
      const n = passportVisualSlides.length;
      if (n === 0) return 0;
      return Math.min(i, n - 1);
    });
  }, [passportVisualSlides]);

  const [articleSectionFlashId, setArticleSectionFlashId] = useState<string | null>(null);
  const [dossierFlash, setDossierFlash] = useState<DossierFlashState>(null);
  const articleFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dossierFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulseArticleFlash = useCallback((id: string | null) => {
    if (articleFlashTimerRef.current) {
      clearTimeout(articleFlashTimerRef.current);
      articleFlashTimerRef.current = null;
    }
    setArticleSectionFlashId(id);
    if (id !== null) {
      articleFlashTimerRef.current = setTimeout(() => {
        setArticleSectionFlashId(null);
        articleFlashTimerRef.current = null;
      }, 3000);
    }
  }, []);

  const pulseDossierFlash = useCallback((next: DossierFlashState) => {
    if (dossierFlashTimerRef.current) {
      clearTimeout(dossierFlashTimerRef.current);
      dossierFlashTimerRef.current = null;
    }
    setDossierFlash(next);
    if (next !== null) {
      dossierFlashTimerRef.current = setTimeout(() => {
        setDossierFlash(null);
        dossierFlashTimerRef.current = null;
      }, 3000);
    }
  }, []);

  const defaultOperationalFlashId = useCallback((tab: MainTab): string | null => {
    switch (tab) {
      case 'supply':
        return W2_ARTICLE_SECTION_DOM.supply;
      case 'fit':
        return W2_ARTICLE_SECTION_DOM.fit;
      case 'plan':
        return W2_ARTICLE_SECTION_DOM.planPo;
      case 'release':
        return W2_ARTICLE_SECTION_DOM.release;
      case 'qc':
        return W2_ARTICLE_SECTION_DOM.qc;
      case 'stock':
        return W2_ARTICLE_SECTION_DOM.stock;
      default:
        return null;
    }
  }, []);

  const openTab = useCallback(
    (tab: MainTab, opts?: OpenTabOpts) => {
      if (tab === 'overview') {
        setMainTab('tz');
        replaceStepQuery((p) => {
          p.delete(WORKSHOP2_STEP_PARAM);
          p.delete(WORKSHOP2_DOSSIER_SECTION_PARAM);
          p.delete(WORKSHOP2_ARTICLE_PANE_PARAM);
        });
        return;
      }
      setMainTab(tab);
      replaceStepQuery((p) => {
        if (tab === 'tz') {
          if (opts?.dossierSection) {
            p.set(WORKSHOP2_DOSSIER_SECTION_PARAM, opts.dossierSection);
          } else {
            p.delete(WORKSHOP2_DOSSIER_SECTION_PARAM);
          }
          p.set(WORKSHOP2_ARTICLE_PANE_PARAM, 'tz');
          return;
        }
        p.delete(WORKSHOP2_DOSSIER_SECTION_PARAM);
        p.set(WORKSHOP2_ARTICLE_PANE_PARAM, tab);
      });
    },
    [replaceStepQuery, setMainTab]
  );

  const scrollToDomIdInWorkspace = useCallback((domId: string, delayMs: number) => {
    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      const el = document.getElementById(domId);
      const reduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}#${domId}`);
    }, delayMs);
  }, []);

  const openTabWithFlash = useCallback(
    (tab: MainTab, opts?: OpenTabWithFlashOpts) => {
      openTab(
        tab,
        opts?.dossierSection != null ? { dossierSection: opts.dossierSection } : undefined
      );
      const effective = tab === 'overview' ? 'tz' : tab;
      if (effective === 'tz') {
        pulseArticleFlash(null);
        if (opts?.dossierSection != null) {
          pulseDossierFlash({ mode: 'section', section: opts.dossierSection });
        } else {
          pulseDossierFlash({ mode: 'main' });
        }
        if (opts?.scrollDomId) {
          scrollToDomIdInWorkspace(opts.scrollDomId, 180);
        }
      } else {
        pulseDossierFlash(null);
        const flashId =
          opts?.articleFlashId != null ? opts.articleFlashId : defaultOperationalFlashId(effective);
        pulseArticleFlash(flashId);
        if (opts?.scrollDomId) {
          scrollToDomIdInWorkspace(opts.scrollDomId, 220);
        }
      }
    },
    [
      openTab,
      pulseArticleFlash,
      pulseDossierFlash,
      defaultOperationalFlashId,
      scrollToDomIdInWorkspace,
    ]
  );

  /** Deep link: `?w2pane=fit#w2article-section-fit` после гидрации вкладки. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const paneRaw = parseWorkshop2ArticlePaneParam(
      new URLSearchParams(window.location.search).get(WORKSHOP2_ARTICLE_PANE_PARAM)
    );
    if (!paneRaw || paneRaw === 'overview' || paneRaw === 'tz') return;
    if (mainTab !== (paneRaw as MainTab)) return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }, 280);
    return () => window.clearTimeout(t);
  }, [article.id, collectionId, mainTab]);

  const goToTzSection = useCallback(
    (section: DossierSection) => {
      openTabWithFlash('tz', { dossierSection: section });
    },
    [openTabWithFlash]
  );

  const { toast } = useToast();
  const [handoffPdfBusy, setHandoffPdfBusy] = useState(false);
  const [dossierFetchPending, setDossierFetchPending] = useState(false);
  const [handoffApiChip, setHandoffApiChip] = useState<{ hintRu: string; state: string } | null>(
    null
  );

  useEffect(() => {
    if (!collectionId || !article.id) return;
    setDossierFetchPending(true);
    void fetchWorkshop2HandoffReadiness(collectionId, String(article.id), categoryLeafId)
      .then((payload) => {
        if (!payload) return;
        const chip = summarizeWorkshop2WorkspaceHandoffFromApiPayload(payload);
        setHandoffApiChip({ hintRu: chip.hintRu ?? '', state: chip.state });
      })
      .finally(() => setDossierFetchPending(false));
  }, [collectionId, article.id, categoryLeafId]);
  const exportHandoffPdfFromWorkspace = useCallback(async () => {
    if (!dossier || !leaf) return;
    const openVisualGates = buildWorkshop2VisualGateItems(dossier, leaf).length;
    if (openVisualGates > 0) {
      const ok = window.confirm(
        `Визуальный контур не закрыт (${openVisualGates} ${openVisualGates === 1 ? 'пункт' : 'пункта'}). PDF может не отражать согласованный минимум. Продолжить?`
      );
      if (!ok) return;
    }
    setHandoffPdfBusy(true);
    try {
      await exportTzHandoffPdfOnly({
        dossier,
        leafId: leaf.leafId,
        pathLabel: leaf.pathLabel,
        articleSku: (article.sku || '').trim(),
        articlePageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        exportSurface: defaultSketchExportSurfaceForDossierView(dossierViewProfile),
      });
      toast({
        title: 'Скачан PDF',
        description: 'Паспорт визуала: общий скетч и листы одним файлом.',
      });
    } catch {
      toast({ title: 'Не удалось сформировать PDF', variant: 'destructive' });
    } finally {
      setHandoffPdfBusy(false);
    }
  }, [dossier, leaf, article.sku, dossierViewProfile, toast]);

  useEffect(() => {
    const l = (article.sku && article.sku.trim()) || 'Артикул';
    setWorkshop2ArticleBreadcrumbLabel(l);
    return () => setWorkshop2ArticleBreadcrumbLabel(null);
  }, [article.id, article.sku]);

  const articleSectionMeta = useMemo(
    () => w2ArticleMainTabMeta(mainTab === 'overview' ? 'tz' : mainTab),
    [mainTab]
  );

  const stripActiveTab = mainTab === 'overview' ? 'tz' : mainTab;

  return (
    <div className="space-y-6">
      <div className="border-border-subtle/80 space-y-3 border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-text-primary text-xl font-bold tracking-tight sm:text-2xl">
            {articleSectionMeta.title}
          </h1>
        </div>
        <div className="min-w-0">
          <div
            className="border-border-subtle bg-bg-surface2 grid min-h-9 w-full grid-cols-3 gap-0.5 rounded-xl border p-1 sm:grid-cols-[repeat(var(--w2-tabs),minmax(0,1fr))]"
            role="tablist"
            aria-label="Разделы артикула"
            style={{ '--w2-tabs': visibleTabs.length } as CSSProperties}
          >
            {visibleTabs.map((t) => {
              const active = stripActiveTab === t.id;
              const prefetchTab =
                t.id === 'tz' || t.id === 'plan' || t.id === 'release' ? t.id : null;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  data-testid={`w2-article-tab-${t.id}`}
                  aria-selected={active}
                  onMouseEnter={() => {
                    if (prefetchTab) prefetchWorkshop2ArticleTabChunks(prefetchTab);
                  }}
                  onFocus={() => {
                    if (prefetchTab) prefetchWorkshop2ArticleTabChunks(prefetchTab);
                  }}
                  onClick={() => openTab(t.id)}
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'h-8 min-h-8 w-full min-w-0 max-w-full justify-center px-1.5 text-center text-[10px] font-semibold !normal-case leading-tight !tracking-tight',
                    active &&
                      'bg-bg-surface text-accent-primary ring-border-subtle shadow-sm ring-1'
                  )}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Card className="border-border-subtle overflow-hidden border bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="sm:divide-border-subtle grid min-h-0 sm:grid-cols-[minmax(0,8.25rem)_1fr] sm:divide-x">
            <div className="border-border-subtle bg-bg-surface2/50 flex min-w-0 flex-col gap-3 border-b p-3 sm:border-b-0 sm:py-4">
              <p className="text-text-muted text-center text-[8px] font-semibold sm:text-left">
                Превью паспорта
              </p>
              <Select
                value={passportVisualSource}
                onValueChange={(v) =>
                  updatePassportVisualSource(v as Workshop2PassportVisualSource)
                }
              >
                <SelectTrigger
                  className="border-border-default text-text-primary h-8 w-full bg-white text-[10px] sm:max-w-[11rem]"
                  aria-label="Источник изображения в паспорте"
                >
                  <SelectValue placeholder="Источник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sketch" className="text-xs">
                    Эскиз
                  </SelectItem>
                  <SelectItem value="reference" className="text-xs">
                    Референс
                  </SelectItem>
                  <SelectItem value="generated" className="text-xs">
                    Сгенерированное
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="border-border-default text-text-muted group-hover:bg-accent-primary/10 relative mx-auto flex min-h-44 w-full max-w-[8.25rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-white transition-colors sm:mx-0 sm:max-w-full">
                {passportVisualSlides.length > 0 ? (
                  <>
                    <img
                      src={passportVisualSlides[passportVisualIndex]!.src}
                      alt={passportVisualSlides[passportVisualIndex]!.alt}
                      className="h-full w-full object-contain p-2"
                    />
                    {passportVisualSlides.length > 1 ? (
                      <>
                        <button
                          type="button"
                          aria-label="Предыдущее изображение"
                          className="border-border-default text-text-primary hover:text-text-primary absolute left-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow-sm transition-colors hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPassportVisualIndex(
                              (i) =>
                                (i - 1 + passportVisualSlides.length) % passportVisualSlides.length
                            );
                          }}
                        >
                          <LucideIcons.ChevronLeft className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          aria-label="Следующее изображение"
                          className="border-border-default text-text-primary hover:text-text-primary absolute right-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow-sm transition-colors hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPassportVisualIndex((i) => (i + 1) % passportVisualSlides.length);
                          }}
                        >
                          <LucideIcons.ChevronRight className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="text-text-secondary pointer-events-none absolute bottom-1 left-0 right-0 text-center text-[9px] font-medium tabular-nums">
                          {passportVisualIndex + 1} / {passportVisualSlides.length}
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 px-2 text-center">
                    <LucideIcons.ImageOff className="h-7 w-7 opacity-25" aria-hidden />
                    <span className="text-text-muted text-[9px] font-medium leading-snug">
                      {passportVisualSource === 'sketch'
                        ? 'Нет эскиза'
                        : passportVisualSource === 'reference'
                          ? 'Нет референса'
                          : 'Нет сгенер. фото'}
                    </span>
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 left-1/2 z-20 h-8 -translate-x-1/2 text-[10px] opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  onClick={() =>
                    openTabWithFlash(
                      'tz',
                      passportVisualSource === 'sketch'
                        ? {
                            dossierSection: 'construction',
                            scrollDomId: W2_VISUALS_SKETCH_ANCHOR_ID,
                          }
                        : {
                            dossierSection: 'general',
                            scrollDomId: 'w2-passport-design-intent',
                          }
                    )
                  }
                >
                  ИЗМЕНИТЬ
                </Button>
              </div>
            </div>

            <div className="relative grid min-h-0 min-w-0 grid-cols-1 gap-3 p-4 pt-4 sm:grid-cols-2 sm:items-start sm:gap-4 sm:p-5">
              <div className="relative min-w-0 space-y-1 pr-1 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-text-primary min-w-0 text-lg font-bold tracking-tight sm:text-xl">
                    <span className="text-accent-primary font-mono font-black">{article.sku}</span>
                  </h2>
                  <Workshop2WorkspaceHeaderDataModeBadge />
                  <Workshop2DossierPersistButton
                    busy={false}
                    disabled
                    title="workspace"
                    onClick={() => {}}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    onClick={() => setArticleEditOpen(true)}
                    title="Редактировать"
                    aria-label="Редактировать"
                  >
                    <LucideIcons.PencilLine className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                <p className="text-text-secondary text-[11px]">
                  <span className="text-text-muted">Бренд: </span>
                  <span className="text-text-primary font-medium">Ваш бренд</span>
                </p>
                {articleDisplayName && articleDisplayName !== article.sku ? (
                  <p className="text-text-primary text-sm font-semibold leading-snug">
                    {articleDisplayName}
                  </p>
                ) : null}
                <p className="text-text-secondary text-sm">
                  {categoryPath ? (
                    <>
                      <LucideIcons.Tag
                        className="text-text-muted mr-1 inline h-3.5 w-3.5 align-text-bottom"
                        aria-hidden
                      />
                      {categoryPath}
                    </>
                  ) : (
                    'Категория: уточните в ТЗ'
                  )}
                </p>
              </div>
              <div
                className="text-left sm:justify-self-end sm:text-right"
                title={
                  isWorkshop2InternalArticleCodeValid(article.internalArticleCode)
                    ? undefined
                    : 'Формат: 6 цифр от 100000. Номер присваивается при сохранении строки в инвентаре разработки коллекции.'
                }
              >
                <div className="mb-1 flex items-center justify-end gap-2">
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[9px] text-emerald-600"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                    Multiplayer (Yjs)
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex h-5 items-center gap-1 border-indigo-200 bg-indigo-50/50 px-1.5 text-[9px] font-semibold text-indigo-700 hover:bg-indigo-100"
                    onClick={() => setVersionHistoryOpen(true)}
                    title="Управление версиями ТЗ"
                  >
                    <LucideIcons.History className="h-3 w-3" />
                    {dossier?.dossierVersionLabel || `v${dossier?.dossierVersion || 1}`}
                  </Button>
                </div>
                <p className="text-text-muted text-[8px] font-semibold">Внутренний артикул</p>
                <p
                  className={cn(
                    'text-text-primary font-mono text-[10px] font-medium tabular-nums',
                    isWorkshop2InternalArticleCodeValid(article.internalArticleCode)
                      ? 'text-text-primary'
                      : 'text-text-muted'
                  )}
                >
                  id{' '}
                  {isWorkshop2InternalArticleCodeValid(article.internalArticleCode)
                    ? article.internalArticleCode
                    : formatWorkshop2InternalArticleCodePlaceholder()}
                </p>
              </div>
              <div className="border-border-subtle col-span-1 border-t pt-3 sm:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Workshop2DfmCheckPanel
                    articleDescription={`Артикул: ${article.sku}\nНазвание: ${articleDisplayName}\nКатегория: ${categoryPath}`}
                    photoUrl={passportVisualSlides[passportVisualIndex]?.src}
                  />
                  <Workshop2ContractorMatchmaker
                    articleDescription={`Артикул: ${article.sku}\nНазвание: ${articleDisplayName}\nКатегория: ${categoryPath}`}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      cabinetSurface.tabsTrigger,
                      'h-9 min-h-9 shrink-0 justify-center gap-1.5 px-3 text-xs font-semibold'
                    )}
                    onClick={() => setSignatoriesDialogOpen(true)}
                  >
                    <LucideIcons.PenLine
                      className="text-accent-primary h-3.5 w-3.5 shrink-0"
                      aria-hidden
                    />
                    Подписанты
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      cabinetSurface.tabsTrigger,
                      'h-9 min-h-9 shrink-0 justify-center gap-1.5 px-3 text-xs font-semibold',
                      pulseHandoffOk
                        ? 'border-emerald-500/90 bg-emerald-50/85 text-emerald-950 shadow-[0_0_0_1px_rgba(16,185,129,0.22)]'
                        : pulseScore < 60
                          ? 'border-rose-400/90 bg-rose-50/80 text-rose-950 shadow-[0_0_0_1px_rgba(244,63,94,0.18)]'
                          : 'border-amber-400/85 bg-amber-50/75 text-amber-950'
                    )}
                    title={`Готовность к передаче (pre-flight): ${pulseScore}/100${
                      pulseScoreBand ? ` · ${pulseScoreBand.label}` : ''
                    }. Сводка ТЗ: ${dossierReadiness.overall.pct}%.${
                      pulseHandoffOk ? ' Артикул готов к передаче по порогам.' : ''
                    }`}
                    onClick={() => setPulseDialogOpen(true)}
                  >
                    <LucideIcons.Activity
                      className="text-accent-primary h-3.5 w-3.5 shrink-0"
                      aria-hidden
                    />
                    Пульс {pulseScore}%
                    {pulseHandoffOk ? (
                      <span className="rounded bg-emerald-600 px-1 py-0 text-[9px] font-bold leading-none text-white">
                        OK
                      </span>
                    ) : null}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      cabinetSurface.tabsTrigger,
                      'h-9 min-h-9 shrink-0 justify-center gap-1.5 px-3 text-xs font-semibold'
                    )}
                    disabled={!tzPreviewHtml.trim()}
                    title={
                      tzPreviewHtml.trim()
                        ? 'Просмотр собранного ТЗ как в финальном HTML'
                        : 'Откройте вкладку ТЗ, чтобы сформировать предпросмотр'
                    }
                    onClick={() => setTzPreviewOpen(true)}
                  >
                    <LucideIcons.FileText
                      className="text-accent-primary h-3.5 w-3.5 shrink-0"
                      aria-hidden
                    />
                    Предварительно ТЗ
                  </Button>
                  <div className="ml-auto flex min-w-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                    {passportUpdatedDisplay ? (
                      <p className="text-text-muted text-right text-[9px] tabular-nums">
                        Обновлено {passportUpdatedDisplay}
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-text-muted h-9 min-h-9 gap-1 px-3 text-xs"
                      onClick={() => setArticleHistoryOpen(true)}
                    >
                      <LucideIcons.Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      История
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={signatoriesDialogOpen}
        onOpenChange={(open) => {
          setSignatoriesDialogOpen(open);
        }}
      >
        <DialogContent
          ariaTitle="Управление ролями и подписями"
          className="flex max-h-[min(90vh,600px)] max-w-lg flex-col gap-0 overflow-hidden bg-slate-50 p-0"
        >
          <DialogHeader className="border-b bg-white px-5 py-4">
            <DialogTitle className="text-text-primary flex items-center gap-2 text-lg">
              <LucideIcons.Users className="text-accent-primary h-5 w-5" />
              Подписанты ТЗ
            </DialogTitle>
            <DialogDescription className="text-text-secondary mt-1.5 text-xs">
              Закрепите ответственных за разделы ТЗ. Их подписи будут фиксироваться в финальном
              документе.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/50 px-5 py-2">
            <div className="flex items-center gap-4 text-[10px] font-medium text-amber-900/80">
              <span className="flex items-center gap-1">
                <LucideIcons.CheckSquare className="h-3 w-3" /> Паспорт{' '}
                {dossierReadiness.sections.general.pct}%
              </span>
              <span className="flex items-center gap-1">
                <LucideIcons.CheckSquare className="h-3 w-3" /> Материалы{' '}
                {dossierReadiness.sections.material.pct}%
              </span>
              <span className="flex items-center gap-1">
                <LucideIcons.CheckSquare className="h-3 w-3" /> Конструкция{' '}
                {dossierReadiness.sections.construction.pct}%
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] text-amber-900 hover:bg-amber-100/50"
              onClick={clearSignStageExclusionsForAllRoles}
            >
              Сбросить ограничения этапов
            </Button>
          </div>

          <div
            ref={tzSignatoryListScrollRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5"
          >
            {passportTzSignerRowsOrdered.map((entry) => {
              if (entry.kind === 'extra') {
                const ex = entry.ex;
                const exAssignee = ex.assigneeDisplayLabel?.trim() ?? '';
                const adm = dossier?.passportProductionBrief?.articleCardOwnerName?.trim() ?? '';
                const extraRowIsCardAdmin = Boolean(
                  exAssignee && adm && workshopTzLabelsMatch(exAssignee, adm)
                );
                return (
                  <PassportTzExtraAssigneeCard
                    key={ex.rowId}
                    ex={ex}
                    signatorySelectChildren={signatorySelectChildren}
                    articleCardOwnerName={
                      dossier?.passportProductionBrief?.articleCardOwnerName?.trim() ?? ''
                    }
                    onPatchTitle={(title) => patchExtraRowTitle(ex.rowId, title)}
                    onPatchAssignee={(value) => patchExtraRowAssignee(ex.rowId, value)}
                    onStagesChange={(ids) => setExtraRowSignStagesBulk(ex.rowId, ids)}
                    onRemove={() => removeExtraTzRoleRow(ex.rowId)}
                    toggleCardAdminForAssignee={toggleCardAdminForAssignee}
                    canRemoveRow={canRemovePassportTzRoleRows && !extraRowIsCardAdmin}
                  />
                );
              }
              const row = entry.row;
              const assignee = passportTzBindings[row.valueKey]?.trim() ?? '';
              const adminName =
                dossier?.passportProductionBrief?.articleCardOwnerName?.trim() ?? '';
              const adminOn = Boolean(
                assignee && adminName && workshopTzLabelsMatch(assignee, adminName)
              );
              const showClearBaseAssignee =
                Boolean(assignee) && canRemovePassportTzRoleRows && !adminOn;
              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`${row.id}-dlg`}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-800"
                    >
                      {row.label}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {assignee && (
                        <button
                          type="button"
                          disabled={!assignee}
                          title="Сделать администратором карточки"
                          aria-pressed={adminOn}
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase transition-colors',
                            adminOn
                              ? 'bg-accent-primary text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                          )}
                          onClick={() =>
                            toggleCardAdminForAssignee(assignee || undefined, !adminOn)
                          }
                        >
                          Админ
                        </button>
                      )}
                      {showClearBaseAssignee && (
                        <button
                          type="button"
                          className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          onClick={() => persistTzBindings({ [row.valueKey]: undefined })}
                          aria-label={`Убрать ${row.label}`}
                        >
                          <LucideIcons.Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      id={`${row.id}-dlg`}
                      className="focus:ring-accent-primary h-8 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-1"
                      value={passportTzBindings[row.valueKey] ?? ''}
                      onChange={(e) =>
                        persistTzBindings({
                          [row.valueKey]: e.target.value.trim() || undefined,
                        })
                      }
                    >
                      {brandSignatorySelectChildren}
                    </select>
                    <W2PassportTzStagesPick
                      idPrefix={`${row.id}-dlg`}
                      selectedIds={workshopTzSelectedStageIds(
                        row.stages,
                        W2_PASSPORT_TZ_STAGE_ORDER
                      )}
                      disabledIds={
                        row.role === 'technologist' ? ['tz', 'sample', 'supply'] : undefined
                      }
                      onChange={(ids) => setRoleSignStagesBulk(row.role, ids)}
                    />
                  </div>
                  {assignee ? (
                    <p className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                      <LucideIcons.Building2 className="h-3 w-3" />
                      {workshopTzAssigneeOrganizationName(assignee) || 'Организация не указана'}
                    </p>
                  ) : null}
                </div>
              );
            })}

            <div className="flex flex-col items-center justify-center gap-3 pt-4">
              <span className="relative flex w-full items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="h-px flex-1 bg-slate-200"></span>
                <span className="px-3">Добавить роль</span>
                <span className="h-px flex-1 bg-slate-200"></span>
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {WORKSHOP2_TZ_EXTRA_ROLE_PRESET_DEFS.map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    onClick={() => addExtraTzRoleFromPreset(p.id)}
                  >
                    + {WORKSHOP2_TZ_EXTRA_ROLE_PRESET_BUTTON_LABEL_RU[p.id]}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-accent-primary hover:border-accent-primary hover:bg-accent-primary/5 h-7 border-slate-200 bg-white px-2.5 text-[10px] font-semibold"
                  onClick={addExtraTzRoleRow}
                >
                  <LucideIcons.Plus className="mr-1 h-3 w-3" />
                  Своя роль
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center border-t bg-white px-5 py-3 sm:justify-between">
            <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
              Изменения сохраняются автоматически
            </span>
            <Button
              type="button"
              onClick={() => setSignatoriesDialogOpen(false)}
              className="px-8 font-semibold"
            >
              Готово
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pulseDialogOpen} onOpenChange={setPulseDialogOpen}>
        <DialogContent
          ariaTitle="Пульс артикула"
          className="max-h-[min(92vh,720px)] max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <DialogHeader className="border-border-subtle space-y-1 border-b px-4 py-3">
            <DialogTitle className="text-text-primary text-base">Пульс артикула</DialogTitle>
            <DialogDescription className="text-text-secondary text-xs leading-relaxed">
              {mainTab === 'tz' && focusDossierSection ? (
                <>
                  Сейчас в фокусе раздел{' '}
                  <span className="text-text-primary font-medium">
                    {W2_PULSE_SECTION_LABEL_RU[focusDossierSection]}
                  </span>
                  : ниже — общая сводка по артикулу; блок «Замечания движка» отфильтрован по этому
                  разделу.
                </>
              ) : (
                <>
                  Сводка готовности к передаче, pre-flight производства и обязательных полей по
                  разделам ТЗ.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(78vh,620px)] space-y-4 overflow-y-auto px-4 py-3">
            <div
              className={cn(
                'rounded-lg border px-3 py-2 text-[11px] leading-snug',
                pulseHandoffOk
                  ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
                  : 'border-amber-200 bg-amber-50/85 text-amber-950'
              )}
            >
              <p className="text-text-primary font-semibold">
                Готовность к передаче (pre-flight): {pulseScore}/100
                {pulseScoreBand ? (
                  <>
                    {' '}
                    · <span className={pulseScoreBand.tone}>{pulseScoreBand.label}</span>
                  </>
                ) : null}
              </p>
              <p className="text-text-secondary mt-0.5">
                Блокеров: {productionPreflightPulse?.blockers.length ?? 0} · предупреждений:{' '}
                {productionPreflightPulse?.warnings.length ?? 0} · сводка заполнения ТЗ:{' '}
                {dossierReadiness.overall.pct}% · ворота handoff:{' '}
                {dossierReadiness.overall.readyForHandoff ? 'пройдены' : 'не пройдены'}
                {pulseHandoffOk ? ' · артикул готов к передаче по порогам.' : '.'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-text-primary text-[11px] font-semibold">
                Обязательное по разделам ТЗ
              </p>
              <div className="space-y-2">
                {W2_ARTICLE_PULSE_SECTION_ORDER.map((sec) => {
                  const block = dossierReadiness.sections[sec];
                  if (!block) return null;
                  const label = W2_PULSE_SECTION_LABEL_RU[sec];
                  const missing =
                    block.warnings.length > 0
                      ? block.warnings
                      : block.pct < 100
                        ? [
                            `Заполнение ${block.pct}% — доведите раздел до 100% или закройте обязательные пункты.`,
                          ]
                        : [];
                  if (missing.length === 0 && block.pct >= 100) {
                    return (
                      <div
                        key={sec}
                        className="rounded-md border border-emerald-100 bg-emerald-50/50 px-2.5 py-1.5 text-[10px] text-emerald-900"
                      >
                        <span className="font-semibold">{label}</span> — ок ({block.pct}%)
                      </div>
                    );
                  }
                  return (
                    <div
                      key={sec}
                      className="rounded-md border border-amber-100 bg-amber-50/40 px-2.5 py-1.5 text-[10px] text-amber-950"
                    >
                      <div className="text-text-primary font-semibold">
                        {label} · {block.pct}%
                      </div>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 pl-0.5">
                        {missing.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {productionPreflightPulse && productionPreflightPulse.issues.length > 0 ? (
              <div className="space-y-2">
                <p className="text-text-primary text-[11px] font-semibold">
                  Pre-flight производства
                </p>
                <div className="space-y-2">
                  {(
                    Object.keys(pulsePreflightBySection) as W2ProductionPreflightIssue['section'][]
                  ).map((secKey) => {
                    const list = pulsePreflightBySection[secKey];
                    if (!list?.length) return null;
                    return (
                      <div
                        key={secKey}
                        className="border-border-subtle bg-bg-surface2/40 rounded-md border px-2.5 py-1.5"
                      >
                        <p className="text-text-primary text-[10px] font-semibold">
                          {W2_PULSE_PREFLIGHT_SECTION_LABEL_RU[secKey]}
                        </p>
                        <ul className="text-text-secondary mt-1 list-inside list-disc space-y-0.5 pl-0.5 text-[10px]">
                          {list.map((issue) => (
                            <li key={issue.id}>
                              <span
                                className={
                                  issue.severity === 'blocker'
                                    ? 'font-semibold text-rose-800'
                                    : 'font-medium text-amber-900'
                                }
                              >
                                {issue.label}:
                              </span>{' '}
                              {issue.detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-text-primary text-[11px] font-semibold">
                Замечания движка готовности
                {mainTab === 'tz' && focusDossierSection ? (
                  <span className="text-text-muted font-normal">
                    {' '}
                    (только «{W2_PULSE_SECTION_LABEL_RU[focusDossierSection]}»)
                  </span>
                ) : null}
              </p>
              {pulseWarnings.length > 0 ? (
                <ul className="text-text-secondary list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed">
                  {pulseWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-secondary text-center text-xs">
                  {mainTab === 'tz' && focusDossierSection
                    ? 'Для этого раздела замечаний нет.'
                    : 'Замечаний нет.'}
                </p>
              )}
            </div>

            {mainTab === 'tz' ? (
              <div className="space-y-2">
                {pulseSlotRef.current?.renderTzMinimalControls?.()}
                <details className="border-border-subtle rounded-lg border bg-white/60 px-2 py-1.5 text-[11px]">
                  <summary className="text-text-primary cursor-pointer select-none font-semibold">
                    Хабы визуала и материалов
                  </summary>
                  <div className="mt-2 space-y-4">
                    {pulseSlotRef.current?.renderVisualHub?.()}
                    {pulseSlotRef.current?.renderMaterialBomHub?.()}
                  </div>
                </details>
              </div>
            ) : (
              <p className="text-text-muted text-[10px]">
                Хабы визуала и BOM доступны на вкладке «Техническое задание».
              </p>
            )}
          </div>
          <DialogFooter className="border-border-subtle border-t px-4 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => setPulseDialogOpen(false)}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tzPreviewOpen} onOpenChange={setTzPreviewOpen}>
        <DialogContent
          ariaTitle="Предварительный просмотр ТЗ"
          className="flex max-h-[min(92vh,800px)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        >
          <DialogHeader className="border-border-subtle shrink-0 border-b px-4 py-3">
            <DialogTitle className="text-text-primary text-base">Предварительно ТЗ</DialogTitle>
            <DialogDescription className="text-text-secondary text-xs">
              Сводный HTML так же, как при финальном экспорте. Прокрутите документ целиком — все
              уровни карточки, попавшие в сборку.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 bg-slate-100 p-2">
            {tzPreviewHtml.trim() ? (
              <iframe
                title="Предпросмотр ТЗ"
                className="h-[min(72vh,640px)] w-full rounded-md border border-slate-200 bg-white"
                sandbox=""
                srcDoc={tzPreviewHtml}
              />
            ) : (
              <p className="text-text-muted p-4 text-center text-sm">
                Откройте вкладку «Техническое задание», чтобы собрать предпросмотр.
              </p>
            )}
          </div>
          <DialogFooter className="border-border-subtle shrink-0 border-t px-4 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => setTzPreviewOpen(false)}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mainTab === 'tz' ? (
        <Workshop2DossierViewProvider
          profile={dossierViewProfile}
          setProfile={setDossierViewProfile}
        >
          <div className="mt-2 min-w-0 space-y-2">
            <Workshop2Phase1DossierPanel
              collectionId={collectionId}
              articleId={article.id}
              internalArticleCode={article.internalArticleCode}
              articleSku={article.sku}
              articleName={articleDisplayName}
              categoryLeafId={categoryLeafId}
              updatedByLabel={createdByLabel}
              sectionSignoffOrganizationLabel={sectionSignoffOrganizationLabel}
              focusDossierSection={focusDossierSection}
              flashDossier={dossierFlash}
              variant={w2step === '3' ? 'phase3' : w2step === '2' ? 'phase2' : 'phase1'}
              onNavigateToTab={openTabWithFlash}
              onBack={w2step === '1' ? goOverview : undefined}
              onPreviousStep={
                w2step === '2'
                  ? () => replaceStepQuery((p) => p.delete(WORKSHOP2_STEP_PARAM))
                  : w2step === '3'
                    ? () =>
                        replaceStepQuery((p) => {
                          p.set(WORKSHOP2_STEP_PARAM, '2');
                        })
                    : undefined
              }
              onContinueToNextStep={
                w2step === '1'
                  ? () =>
                      replaceStepQuery((p) => {
                        p.set(WORKSHOP2_STEP_PARAM, '2');
                      })
                  : undefined
              }
              onContinueToStep3={
                w2step === '2'
                  ? () =>
                      replaceStepQuery((p) => {
                        p.set(WORKSHOP2_STEP_PARAM, '3');
                      })
                  : undefined
              }
              onFinishWorkshop={w2step === '3' ? goOverview : undefined}
              onPatchArticleLine={(patch) =>
                onPatchWorkshop2ArticleLine(collectionId, article.id, patch)
              }
              tzSignoffRevokerLabels={tzSignoffRevokerLabels}
              tzDigitalSignoffCapabilities={WORKSHOP2_TZ_DIGITAL_SIGNOFF_DEFAULT_CAPABILITIES}
              dossierHydrateKey={dossierHydrateKey}
              onOpenPulse={() => setPulseDialogOpen(true)}
              pulseSlotRef={pulseSlotRef}
              onRequestClosePulse={closePulseDialog}
              onTzSpecPreviewHtml={setTzPreviewHtml}
              onArticleLineDraftsChange={onArticleLineDraftsChange}
            />
          </div>
        </Workshop2DossierViewProvider>
      ) : (
        <div className="mt-4 min-w-0">
          <Workshop2ArticleWorkspaceTabPanels
            tab={mainTab as Workshop2ArticleWorkspaceMainTab}
            flashSectionId={articleSectionFlashId}
            dossier={dossier}
            categoryLeafId={categoryLeafId}
            articleUrlSegment={articleUrlSegment}
          />
        </div>
      )}

      <Dialog
        open={dossierSectionHelpId !== null}
        onOpenChange={(open) => {
          if (!open) setDossierSectionHelpId(null);
        }}
      >
        <DialogContent ariaTitle={dossierSectionHelp?.headline ?? 'Секция ТЗ'} className="max-w-md">
          {dossierSectionHelp && dossierSectionHelpId ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-text-primary text-base">
                  {dossierSectionHelp.headline}
                </DialogTitle>
                <DialogDescription className="text-text-secondary">
                  {dossierSectionHelp.purpose}
                </DialogDescription>
              </DialogHeader>
              <div>
                <p className="text-text-secondary mb-2 text-[10px] font-semibold">
                  На что обратить внимание
                </p>
                <ul className="text-text-primary list-disc space-y-1.5 pl-4 text-sm">
                  {dossierSectionHelp.essentials.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={W2_OVERVIEW_OPEN_BTN_CLASS}
                  onClick={() => setDossierSectionHelpId(null)}
                >
                  Закрыть
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={W2_OVERVIEW_OPEN_BTN_CLASS}
                  onClick={() => {
                    goToTzSection(dossierSectionHelpId);
                    setDossierSectionHelpId(null);
                  }}
                >
                  Открыть &gt;
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={articleHistoryOpen} onOpenChange={setArticleHistoryOpen}>
        <DialogContent
          ariaTitle="История изменений артикула"
          className="flex max-h-[min(80vh,560px)] max-w-lg flex-col gap-0 p-0 sm:max-w-lg"
        >
          <DialogHeader className="border-border-subtle space-y-1 border-b px-4 py-3">
            <DialogTitle className="text-text-primary text-base">История</DialogTitle>
            <DialogDescription className="text-text-secondary text-xs">
              <span className="text-text-primary font-mono font-semibold">{article.sku}</span> —
              локальные правки коллекции, ТЗ и строки артикула.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {articleProductionHistory.length === 0 ? (
              <p className="text-text-secondary text-sm">
                Пока нет зафиксированных событий по этому SKU.
              </p>
            ) : (
              <ul className="divide-border-subtle divide-y">
                {articleProductionHistory.map((row) => (
                  <li
                    key={row.id}
                    className="text-text-primary py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-text-muted text-[9px] font-semibold">{row.scope}</span>
                      <time
                        dateTime={row.at}
                        className="text-text-secondary text-[11px] font-medium tabular-nums"
                      >
                        {new Date(row.at).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <p className="text-text-primary mt-1.5 text-[13px] font-semibold leading-snug">
                      {row.summary}
                    </p>
                    {row.actor ? (
                      <p className="text-text-secondary mt-1 text-[11px]">
                        <span className="text-text-secondary font-medium">Кто:</span> {row.actor}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter className="border-border-subtle mt-2 border-t pt-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setArticleHistoryOpen(false)}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-900">
              <LucideIcons.History className="h-5 w-5 text-indigo-500" />
              Версионирование ТЗ (Досье)
            </DialogTitle>
            <DialogDescription>
              Текущая активная версия:{' '}
              <strong>{dossier?.dossierVersionLabel || `v${dossier?.dossierVersion || 1}`}</strong>.
              Вы можете зафиксировать текущее состояние лекал и ТЗ для производства, создав новую
              версию.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <ul className="relative ml-3 space-y-4 border-l border-slate-200">
                {(
                  dossier?.versionHistorySnapshots || [
                    {
                      version: 1,
                      label: 'v1 - Первый сэмпл',
                      at: new Date().toISOString(),
                      by: createdByLabel,
                    },
                  ]
                ).map((v: any, idx: number, arr: any[]) => (
                  <li key={v.version} className="relative pl-6">
                    <div
                      className={cn(
                        'absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border-2 border-white',
                        idx === arr.length - 1 ? 'bg-indigo-500' : 'bg-slate-300'
                      )}
                    ></div>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        idx === arr.length - 1 ? 'text-indigo-900' : 'text-slate-700'
                      )}
                    >
                      {v.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Зафиксировал(а) {v.by} ·{' '}
                      {new Date(v.at).toLocaleString('ru-RU', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
              <h4 className="text-sm font-semibold text-indigo-900">Создать новую версию</h4>
              <Input
                placeholder="Название версии (например: v2 - Корректировка посадки)"
                className="h-8 bg-white text-xs"
              />
              <Button
                size="sm"
                className="h-8 w-full bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                onClick={() => {
                  toast({
                    title: 'Интеграция',
                    description:
                      'Создание снимков отключено. ТЗ версионируется автоматически в БД.',
                    variant: 'destructive',
                  });
                }}
              >
                Сохранить снимок как новую версию
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Workshop2CreateArticleDialog
        open={articleEditOpen}
        onOpenChange={setArticleEditOpen}
        collectionId={collectionId}
        collectionDisplayName={collection.displayName}
        pickerLines={articlePickerLines}
        onCommit={(colId, commit) => Boolean(onCommitWorkshop2Article(colId, commit))}
        editArticle={{
          articleId: article.id,
          sku: article.sku,
          name: article.name,
          comment: article.workshopComment ?? '',
          categoryLeafId: categoryLeafId,
          workshopAttachments: article.workshopAttachments?.map((a) => ({ ...a })) ?? [],
          workshopTags: article.workshopTags,
          workshopLineSeason: article.workshopLineSeason?.trim() ?? '',
        }}
        onSaveEdit={(colId, artId, data) => {
          const ok = onPatchWorkshop2ArticleLine(colId, artId, {
            name: data.name,
            sku: data.sku,
            workshopComment: data.workshopComment,
            categoryLeafId: data.categoryLeafId,
            workshopAttachments: data.workshopAttachments,
            workshopTags: data.workshopTags,
            workshopLineSeason: data.workshopLineSeason,
          });
          if (ok) {
            const nNext = normalizeLocalSkuCode(data.sku ?? article.sku);
            const nPrev = normalizeLocalSkuCode(article.sku);
            if (nNext && nPrev && nNext !== nPrev) {
              const d = getWorkshop2Phase1Dossier(colId, artId) ?? emptyWorkshop2DossierPhase1();
              const withLog = appendWorkshop2TzDossierEditLog(d, createdByLabel, [
                `SKU артикула: ${(data.sku ?? article.sku ?? '').trim()}`,
              ]);
              setWorkshop2Phase1Dossier(colId, artId, withLog);
              setDossier(withLog);
              setDossierHydrateKey((k) => k + 1);
            }
          }
          return ok;
        }}
        activityActorLabel={createdByLabel}
      />
    </div>
  );
}


function findWorkshop2InventoryLineForArticle(
  lines: LocalOrderLine[],
  articleId: string
): LocalOrderLine | undefined {
  return lines.find((l) => l.id === articleId);
}

function resolveWorkshop2ArticleCreationMode(
  article: { articleCreationMode?: unknown; id?: string } | null | undefined,
  lines: LocalOrderLine[],
  articleId: string
) {
  const line = findWorkshop2InventoryLineForArticle(lines, articleId);
  return resolveArticleCreationMode(line ?? article ?? null);
}

export function Workshop2ArticleWorkspace({
  collectionId,
  articleId,
  createdByLabel,
  sectionSignoffOrganizationLabel = '',
  activeCollections,
  archivedCollections,
  getArticlePipelineProgress,
  onPatchWorkshop2ArticleLine,
  articlePickerLines,
  onCommitWorkshop2Article,
  articleCreationModeOverride,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ?? '';
  const query = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const { role } = useRbac();
  /** Wave V — вкладка только из `w2pane` (E2E deep link `?w2pane=fit`). */
  const w2paneQueryValue = query.get(WORKSHOP2_ARTICLE_PANE_PARAM);
  const paneFromUrl = useMemo(
    () => parseWorkshop2ArticlePaneParam(w2paneQueryValue),
    [w2paneQueryValue]
  );
  const collections = useMemo(
    () => [...activeCollections, ...archivedCollections],
    [activeCollections, archivedCollections]
  );

  const collection = useMemo(
    () => collections.find((c) => c.id === collectionId),
    [collections, collectionId]
  );

  const article = useMemo(
    () =>
      collection?.articleRows.find(
        (a) =>
          a.id === articleId ||
          (isWorkshop2InternalArticleCodeValid(a.internalArticleCode) &&
            a.internalArticleCode === articleId)
      ),
    [collection, articleId]
  );

  const articleCreationMode = useMemo(
    () =>
      articleCreationModeOverride ??
      (article
        ? resolveWorkshop2ArticleCreationMode(article, articlePickerLines, article.id)
        : resolveArticleCreationMode(null)),
    [articleCreationModeOverride, article, articlePickerLines, article?.id]
  );

  const mainTab = useMemo((): MainTab => {
    const fromUrl = !paneFromUrl ? 'tz' : paneFromUrl === 'overview' ? 'tz' : (paneFromUrl as MainTab);
    return resolveW2MainTabForCreationMode(fromUrl, articleCreationMode) as MainTab;
  }, [paneFromUrl, articleCreationMode]);

  /** В адресной строке — внутренний 6-значный номер, если уже выдан; старые ссылки по line id остаются рабочими. */
  useEffect(() => {
    if (!article) return;
    const seg = workshop2ArticleUrlSegment(article.internalArticleCode, article.id);
    if (articleId === seg) return;
    const nextPath = workshop2ArticlePath(collectionId, seg);
    if (pathname !== nextPath) {
      const q = query.toString();
      router.replace(q ? `${nextPath}?${q}` : nextPath, { scroll: false });
    }
  }, [article, articleId, collectionId, pathname, query, router]);

  const articleOpenLogKey = useRef('');
  useEffect(() => {
    if (!collection || !article) return;
    const key = `${collectionId}:${article.id}`;
    if (articleOpenLogKey.current === key) return;
    articleOpenLogKey.current = key;
    appendWorkshop2ArticleActivity(
      collectionId,
      article.id,
      `Открыт артикул ${article.sku} · коллекция «${collection.displayName}»`,
      createdByLabel
    );
  }, [collection, article, collectionId, createdByLabel]);

  const w2step = query.get(WORKSHOP2_STEP_PARAM) ?? '1';

  const dossierViewQueryKey = query.toString();
  const dossierViewProfile = useMemo(
    () =>
      resolveWorkshop2DossierViewFromWorkspaceUrl(query.get(WORKSHOP2_DOSSIER_VIEW_PARAM), role),
    [dossierViewQueryKey, role]
  );

  const replaceStepQuery = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(queryString);
      mutate(p);
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : (pathname ?? ''), { scroll: false });
    },
    [pathname, router, queryString]
  );

  const listHref = workshop2CollectionListHref(collectionId);

  const syncMainTabToUrl = useCallback(
    (tab: MainTab, opts?: { dossierSection?: string; clearPane?: boolean }) => {
      replaceStepQuery((p) => {
        if (tab === 'tz' && opts?.clearPane) {
          p.delete(WORKSHOP2_STEP_PARAM);
          p.delete(WORKSHOP2_DOSSIER_SECTION_PARAM);
          p.delete(WORKSHOP2_ARTICLE_PANE_PARAM);
          return;
        }
        if (tab === 'tz') {
          if (opts?.dossierSection) {
            p.set(WORKSHOP2_DOSSIER_SECTION_PARAM, opts.dossierSection);
          } else {
            p.delete(WORKSHOP2_DOSSIER_SECTION_PARAM);
          }
          p.set(WORKSHOP2_ARTICLE_PANE_PARAM, 'tz');
          return;
        }
        p.delete(WORKSHOP2_DOSSIER_SECTION_PARAM);
        p.set(WORKSHOP2_ARTICLE_PANE_PARAM, tab);
      });
    },
    [replaceStepQuery]
  );

  const setMainTab = useCallback(
    (tab: MainTab) => {
      syncMainTabToUrl(tab === 'overview' ? 'tz' : tab, { clearPane: tab === 'overview' });
    },
    [syncMainTabToUrl]
  );

  const goOverview = useCallback(() => {
    syncMainTabToUrl('tz', { clearPane: true });
  }, [syncMainTabToUrl]);

  const w2secParam = query.get(WORKSHOP2_DOSSIER_SECTION_PARAM);

  /** Скрытые вкладки (buy_or_import) → ТЗ. */
  useEffect(() => {
    if (!article || !w2paneQueryValue) return;
    const fromUrl = w2paneQueryValue === 'overview' ? 'tz' : w2paneQueryValue;
    const resolved = resolveW2MainTabForCreationMode(fromUrl, articleCreationMode);
    if (fromUrl !== resolved) {
      syncMainTabToUrl(resolved as MainTab);
    }
  }, [article, articleCreationMode, syncMainTabToUrl, w2paneQueryValue]);

  /** Нормализация deep link: `?w2sec=…` без `w2pane`, legacy `?w2pane=assignment`. */
  useEffect(() => {
    if (!article) return;
    const operational = resolveWorkshop2W2SecOperationalDeepLink(w2secParam);
    if (operational && !w2paneQueryValue && articleCreationMode === 'full_production') {
      syncMainTabToUrl('plan');
      if (typeof window !== 'undefined') {
        const { pathname: p, search } = window.location;
        window.history.replaceState(null, '', `${p}${search}#${operational.scrollHash}`);
      }
      return;
    }

    const secFromQuery = parseWorkshop2DossierSection(w2secParam);

    if (isWorkshop2ArticlePaneAssignmentLegacy(w2paneQueryValue)) {
      syncMainTabToUrl('tz', { dossierSection: secFromQuery ?? 'assignment' });
      return;
    }

    if (w2paneQueryValue) return;

    if (!secFromQuery) return;
    syncMainTabToUrl('tz', { dossierSection: secFromQuery });
  }, [article?.id, articleCreationMode, collectionId, syncMainTabToUrl, w2paneQueryValue, w2secParam]);

  const articleWorkspaceRef = useMemo(
    () =>
      article ? { collectionId, articleId: article.id } : { collectionId, articleId: articleId },
    [collectionId, article?.id, articleId]
  );

  if (!collection) {
    return (
      <Card className="border-amber-100 bg-amber-50/40">
        <CardContent className="space-y-3 pt-6">
          <CardDescription className="text-sm text-amber-950">
            Коллекция не найдена (возможно, архив или другой браузер).
          </CardDescription>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href={ROUTES.brand.productionWorkshop2}>{COLLECTION_DEV_HUB_TITLE_RU}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!article) {
    return (
      <Card className="border-amber-100 bg-amber-50/40">
        <CardContent className="space-y-3 pt-6">
          <CardDescription className="text-sm text-amber-950">
            Артикул не найден в этой коллекции.
          </CardDescription>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href={listHref}>К подборке</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const categoryLeafId = (() => {
    const t = article.categoryLeafId?.trim();
    if (t && findHandbookLeafById(t)) return t;
    return getHandbookCategoryLeaves()[0]?.leafId ?? '';
  })();

  const leaf = findHandbookLeafById(categoryLeafId);
  const categoryPath = leaf ? `${leaf.l1Name} · ${leaf.l2Name} · ${leaf.l3Name}` : '';

  return (
    <ArticleWorkspaceProvider articleRef={articleWorkspaceRef!}>
      <Workshop2ArticleWorkspaceScreen
        collectionId={collectionId}
        article={article}
        collection={collection}
        createdByLabel={createdByLabel}
        sectionSignoffOrganizationLabel={sectionSignoffOrganizationLabel}
        categoryLeafId={categoryLeafId}
        categoryPath={categoryPath}
        getArticlePipelineProgress={getArticlePipelineProgress}
        onPatchWorkshop2ArticleLine={onPatchWorkshop2ArticleLine}
        listHref={listHref}
        mainTab={mainTab}
        setMainTab={setMainTab}
        replaceStepQuery={replaceStepQuery}
        w2step={w2step}
        goOverview={goOverview}
        dossierSectionQuery={query.get(WORKSHOP2_DOSSIER_SECTION_PARAM)}
        dossierViewProfile={dossierViewProfile}
        sketchFloorInUrl={isSketchFloorInSearch(query.toString())}
        articlePickerLines={articlePickerLines}
        onCommitWorkshop2Article={onCommitWorkshop2Article}
        articleCreationMode={articleCreationMode}
      />
    </ArticleWorkspaceProvider>
  );
}
