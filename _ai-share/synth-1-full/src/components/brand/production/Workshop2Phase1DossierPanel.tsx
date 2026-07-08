'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type SetStateAction,
} from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import * as LucideIcons from 'lucide-react';
import {
  getHandbookAudiencesWorkshop2,
  getHandbookCategoryLeaves,
  findHandbookLeafById,
} from '@/lib/production/category-catalog';
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import type { DossierSection } from '@/lib/production/dossier-readiness-engine';
import { W2_TZ_HINT_PRODUCTION_EDIT_SIGN_REVOKE } from '@/lib/production/workshop2-tz-rbac-hints';
import type {
  Workshop2DossierPhase1,
  Workshop2Phase1AttributeAssignment,
  Workshop2Phase1AttributeValue,
  Workshop2PassportDeadlineCriticality,
  Workshop2PassportPlannedLaunchType,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { W2_MATERIAL_SUBPAGE_ANCHORS } from '@/lib/production/workshop2-material-bom-check';
import { parseMatRowsFromDossier } from '@/lib/production/workshop2-material-mat-rows';
import { passportCheckpointTitleClass } from '@/lib/production/workshop2-passport-check';
import { W2_CONSTRUCTION_SUBPAGE_ANCHORS } from '@/lib/production/workshop2-construction-dossier-anchors';
import { useAuth } from '@/providers/auth-provider';
import { W2_ARTICLE_SECTION_DOM } from '@/lib/production/workshop2-url';
import { useWorkshop2DossierView } from '@/components/brand/production/workshop2-dossier-view-context';
import { useWorkshop2B2bDossierEditLock } from '@/hooks/use-workshop2-b2b-dossier-edit-lock';
import { type Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';
import { WORKSHOP2_TZ_DIGITAL_SIGNOFF_DEFAULT_CAPABILITIES } from '@/lib/production/workshop2-tz-digital-signoff';
import { useToast } from '@/hooks/use-toast';
import { useRbac } from '@/hooks/useRbac';
import type { CategorySketchAnnotatorHandle } from '@/components/brand/production/CategorySketchAnnotator';
import {
  createEmptySketchSheet,
  defaultExtraSketchSheetTitle,
  MAX_SKETCH_SHEETS,
  normalizeSketchSheets,
} from '@/lib/production/workshop2-sketch-sheets';
import {
  isWorkshop2TzSectionTabDoneForUi,
  W2_SECTION_SIGNOFF_PCT_THRESHOLD,
} from '@/components/brand/production/Workshop2TzSectionTabIndicator';
import { isWorkshop2TzSectionFullySigned } from '@/lib/production/workshop2-tz-signoff-complete';
import { workshop2TzSectionSignoffByLabelMeaningful } from '@/lib/production/workshop2-tz-signoff-actor';
import { useWorkshop2Phase1DossierTzTraceAndPreflight } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-trace-and-preflight';
import {
  downloadWorkshop2FinalTzSpecHtmlFile,
  openWorkshop2FinalTzSpecPrintWindow,
} from '@/lib/production/workshop2-final-tz-spec-export';
import { isSketchFloorOnlyRole } from '@/lib/production/sketch-floor-rbac';
import { getWorkshopTzSectionForAttribute as getSectionForAttr } from '@/lib/production/workshop2-tz-section-readiness';
import { type Workshop2TzGateCommentLike } from '@/lib/production/workshop2-tz-gates';
import { WORKSHOP_FIELD_LABEL_CLASS } from '@/components/brand/production/workshop2-phase1-dossier-panel-ui-constants';
import { buildWorkshop2TzDigitalSignoffRows } from '@/components/brand/production/workshop2-phase1-dossier-panel-build-tz-digital-signoff-rows';
import { useWorkshop2Phase1DossierAudienceAndAttributeRows } from '@/components/brand/production/use-workshop2-phase1-dossier-audience-and-attribute-rows';
import { useWorkshop2Phase1DossierSketchSheetsToolbar } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-sheets-toolbar';
import { useWorkshop2Phase1DossierBranchSlotSketchUi } from '@/components/brand/production/use-workshop2-phase1-dossier-branch-slot-sketch-ui';
import { useWorkshop2Phase1DossierAttrGroupUi } from '@/components/brand/production/use-workshop2-phase1-dossier-attr-group-ui';
import { useWorkshop2Phase1DossierSketchFloorMode } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-floor-mode';
import { useWorkshop2Phase1DossierPassportSubnavScrollSpy } from '@/components/brand/production/use-workshop2-phase1-dossier-passport-subnav-scroll-spy';
import { useWorkshop2Phase1DossierSketchVisualCatalogHighlights } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-visual-catalog-highlights';
import { useWorkshop2Phase1DossierMainColumnFlash } from '@/components/brand/production/use-workshop2-phase1-dossier-main-column-flash';
import { useWorkshop2Phase1DossierPanelTailZone } from '@/components/brand/production/use-workshop2-phase1-dossier-panel-tail-zone';
import { buildWorkshop2Phase1DossierPanelTailInput } from '@/components/brand/production/workshop2-phase1-dossier-panel-tail-bundles';
import { useWorkshop2Phase1DossierTzMinimalDeferZone } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-minimal-defer-zone';
import { useWorkshop2Phase1DossierFieldDeferralActions } from '@/components/brand/production/use-workshop2-phase1-dossier-field-deferral';
import {
  registerWorkshop2Phase1TechPackSessionBlobSetter,
  useWorkshop2Phase1DossierTechPackBlobResetOnArticleChange,
} from '@/components/brand/production/use-workshop2-phase1-dossier-tech-pack-blob-reset-on-article-change';
import { useWorkshop2Phase1DossierTzScrollBehavior } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-scroll-behavior';
import { useWorkshop2Phase1DossierCoreState } from '@/components/brand/production/use-workshop2-phase1-dossier-core-state';
import { useWorkshop2Phase1DossierPassportDriftLogResetOnArticleId } from '@/components/brand/production/use-workshop2-phase1-dossier-passport-drift-log-reset-on-article-id';
import { useWorkshop2Phase1DossierAttrCommentsController } from '@/components/brand/production/use-workshop2-phase1-dossier-attr-comments-controller';
import { useWorkshop2Phase1DossierSketchWorkspaceState } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-workspace-state';
import { useWorkshop2Phase1DossierFinalTzWizardController } from '@/components/brand/production/use-workshop2-phase1-dossier-final-tz-wizard-controller';
import { useWorkshop2Phase1DossierTzSignoffZone } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-signoff-zone';
import { useWorkshop2Phase1DossierActiveSectionRows } from '@/components/brand/production/use-workshop2-phase1-dossier-active-section-rows';
import { useWorkshop2Phase1DossierMaterialBomZone } from '@/components/brand/production/use-workshop2-phase1-dossier-material-bom-zone';
import { useWorkshop2Phase1DossierHandbookControlZone } from '@/components/brand/production/use-workshop2-phase1-dossier-handbook-control-zone';
import { useWorkshop2Phase1DossierLeafCatalogSyncEffects } from '@/components/brand/production/use-workshop2-phase1-dossier-leaf-catalog-sync-effects';
import { useWorkshop2Phase1DossierMaterialComplianceSessionHydrate } from '@/components/brand/production/use-workshop2-phase1-dossier-material-compliance-session-hydrate';
import { useWorkshop2Phase1DossierW2SessionMetricRecordEffects } from '@/components/brand/production/use-workshop2-phase1-dossier-w2-session-metric-record-effects';
import { useWorkshop2Phase1DossierHandbookCheckReportZone } from '@/components/brand/production/use-workshop2-phase1-dossier-handbook-check-report-zone';
import { useWorkshop2Phase1DossierW2MetricsFlushContextZone } from '@/components/brand/production/use-workshop2-phase1-dossier-w2-metrics-flush-context-zone';
import { useWorkshop2Phase1DossierPulseSlotLayoutEffect } from '@/components/brand/production/use-workshop2-phase1-dossier-pulse-slot-layout-effect';
import { useWorkshop2Phase1DossierPassportAuditViewFactoryUrl } from '@/components/brand/production/use-workshop2-phase1-dossier-passport-audit-view-url';
import { useWorkshop2Phase1DossierSketchPinReadiness } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-pin-readiness';
import { useWorkshop2Phase1DossierTzDigitalSignCallbacks } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-digital-sign-callbacks';
import { stampDossierAfterFinalTzExport } from '@/components/brand/production/workshop2-phase1-dossier-panel-stamp-final-tz-export';
import { useWorkshop2Phase1DossierJournalCommitZone } from '@/components/brand/production/use-workshop2-phase1-dossier-journal-commit-zone';
import { useWorkshop2Phase1DossierContinueStepZone } from '@/components/brand/production/use-workshop2-phase1-dossier-continue-step-zone';
import { useWorkshop2Phase1DossierSketchPinLibraryZone } from '@/components/brand/production/use-workshop2-phase1-dossier-sketch-pin-library-zone';
import { useWorkshop2Phase1DossierHandbookMutationsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-handbook-mutations-zone';
import { useWorkshop2Phase1DossierMatCatalogDerivedZone } from '@/components/brand/production/use-workshop2-phase1-dossier-mat-catalog-derived-zone';
import { useWorkshop2Phase1DossierMaterialSketchNavZone } from '@/components/brand/production/use-workshop2-phase1-dossier-material-sketch-nav-zone';
import { useWorkshop2Phase1DossierPanelShellZone } from '@/components/brand/production/use-workshop2-phase1-dossier-panel-shell-zone';
import { useWorkshop2Phase1DossierTzActiveSectionZone } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-active-section-zone';
import { useWorkshop2Phase1DossierViewNavZone } from '@/components/brand/production/use-workshop2-phase1-dossier-view-nav-zone';
import { useWorkshop2Phase1DossierSaveDraftZone } from '@/components/brand/production/use-workshop2-phase1-dossier-save-draft-zone';
import { useWorkshop2Phase1DossierRouteUrlsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-route-urls-zone';
import { passportManualFieldLabelClass } from '@/components/brand/production/workshop2-phase1-dossier-panel-signoff-format';
import {
  WorkshopInlineHintIcon,
  WorkshopLabelWithHint,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-field-hints';
import { HandbookMultiSelectPopover } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-multi-select';
import { resolvedHandbookDisplayLabel } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-display-label';
import { clampSampleBasePieceQtyToCap } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-mutations';
import { collectWorkshop2Phase1LinkedAttributeIdsForLeaf } from '@/components/brand/production/workshop2-phase1-dossier-panel-sketch-linked-attribute-ids';
import { exportSketchVisualZipWithGates } from '@/components/brand/production/workshop2-phase1-dossier-panel-export-sketch-visual-zip';
import { useWorkshop2Phase1DossierSectionSignoffCallbacks } from '@/components/brand/production/use-workshop2-phase1-dossier-section-signoff-callbacks';
import { type HandbookCheckSnapshot } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-check-snapshot';
import { useWorkshop2Phase1DossierAttrCardContext } from '@/components/brand/production/workshop2-phase1-dossier-panel-use-attr-card-context';
import { useWorkshop2Phase1DossierPassportHubZone } from '@/components/brand/production/use-workshop2-phase1-dossier-passport-hub-zone';
import { useWorkshop2Phase1DossierSectionRowsOrchestration } from '@/components/brand/production/use-workshop2-phase1-dossier-section-rows-orchestration';
import {
  useWorkshop2SampleIntakeCatalogExtras,
  useWorkshop2SampleIntakeCatalogRows,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-use-sample-intake-catalog';
import { useWorkshop2Phase1DossierHandbookWarningsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-handbook-warnings-zone';
import { useWorkshop2Phase1DossierSectionReadinessZone } from '@/components/brand/production/use-workshop2-phase1-dossier-section-readiness-zone';
import { useWorkshop2Phase1DossierPassportPartitionsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-passport-partitions-zone';
import { useWorkshop2Phase1DossierVisualsCatalogZone } from '@/components/brand/production/use-workshop2-phase1-dossier-visuals-catalog-zone';
import { useWorkshop2Phase1DossierTzSampleReadinessZone } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-sample-readiness-zone';
import { useWorkshop2Phase1DossierTzNotifyActionsZone } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-notify-actions-zone';
import { useWorkshop2Phase1DossierFinalTzExportZone } from '@/components/brand/production/use-workshop2-phase1-dossier-final-tz-export-zone';
import { useWorkshop2Phase1DossierTzGatesZone } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-gates-zone';
import { useWorkshop2Phase1DossierSendHandoffZone } from '@/components/brand/production/use-workshop2-phase1-dossier-send-handoff-zone';
import { useWorkshop2HandoffCommit } from '@/lib/production/use-workshop2-handoff-commit';
import { useSearchParams } from 'next/navigation';
import { SECTION_LABEL_BY_ID } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';
import type { Workshop2Phase1DossierPanelProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-props';
import { useWorkshop2Phase1DossierFactoryPinToast } from '@/components/brand/production/use-workshop2-phase1-dossier-factory-pin-toast';
import { useWorkshop2Phase1DossierJumpAnchors } from '@/components/brand/production/use-workshop2-phase1-dossier-jump-anchors';

export type { Workshop2DossierPanelVariant } from '@/components/brand/production/workshop2-phase1-dossier-panel-props';

export function Workshop2Phase1DossierPanel({
  collectionId,
  articleId,
  internalArticleCode,
  articleSku,
  articleName,
  categoryLeafId,
  updatedByLabel,
  sectionSignoffOrganizationLabel = '',
  onPatchArticleLine,
  onBack,
  onPreviousStep,
  variant = 'phase1',
  onContinueToNextStep,
  onContinueToStep3,
  onFinishWorkshop,
  onNavigateToTab,
  focusDossierSection,
  flashDossier,
  tzSignoffRevokerLabels,
  tzDigitalSignoffCapabilities,
  dossierHydrateKey = 0,
  onOpenPulse,
  pulseSlotRef,
  onRequestClosePulse,
  onTzSpecPreviewHtml,
  onArticleLineDraftsChange,
  dossierCommentsBridgeRef,
  tzBlockCommentMetricKeys,
  onTzBlockCommentMetrics,
}: Workshop2Phase1DossierPanelProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  useWorkshop2Phase1DossierFactoryPinToast(toast);
  const { w2MetricsSkuRef, w2DossierMetricsCtx } =
    useWorkshop2Phase1DossierW2MetricsFlushContextZone({
      appUserUid: user?.uid,
      orgId: user?.activeOrganizationId,
    });
  const { role, can } = useRbac();

  const { profile: dossierViewProfile, setProfile: setDossierViewProfileFromCtx } =
    useWorkshop2DossierView();
  const b2bDossierEditLock = useWorkshop2B2bDossierEditLock(collectionId, articleId);
  /** Нет права production:edit или B2B handoff lock — досье только для чтения. */
  const tzWriteDisabled = !can('production', 'edit') || b2bDossierEditLock.locked;
  const lockedSketchFloorOnly = isSketchFloorOnlyRole(role);

  const { sketchViewFloor, sketchEditsLocked, setSketchFloorMode, copySketchFloorLink } =
    useWorkshop2Phase1DossierSketchFloorMode({
      lockedSketchFloorOnly,
      tzWriteDisabled,
      toast,
    });

  const isPhase1 = variant === 'phase1';
  const isPhase2 = variant === 'phase2';
  const isPhase3 = variant === 'phase3';

  const { visualsShareAbsoluteUrl, buildRouteHandoffAbsoluteUrl, passportStep1BriefHref } =
    useWorkshop2Phase1DossierRouteUrlsZone({
      collectionId,
      articleId,
      internalArticleCode,
    });

  const tzScrollBehavior = useWorkshop2Phase1DossierTzScrollBehavior();

  const {
    activeSection,
    setActiveSection,
    handleSelectTzSection,
    jumpToTzSectionAnchor,
    jumpToBrandNotesAttribute,
  } = useWorkshop2Phase1DossierTzActiveSectionZone({
    tzScrollBehavior,
    onNavigateToTab,
    isPhase1,
    focusDossierSection,
    dossierHydrateKey,
  });

  const { dossierMainColumnFlash } = useWorkshop2Phase1DossierMainColumnFlash({
    flashDossier,
    activeSection,
  });

  const { sketchVisualCatalogHighlightSet, onVisualCatalogSuggestFromSketch } =
    useWorkshop2Phase1DossierSketchVisualCatalogHighlights(activeSection);

  const {
    jumpToMaterialMatTable,
    jumpToConstructionContour,
    jumpToSketchLineRefs,
    jumpToQcArticleSection,
    jumpToTzSectionAnchorFromPulse,
  } = useWorkshop2Phase1DossierJumpAnchors({
    jumpToTzSectionAnchor,
    onNavigateToTab,
    onRequestClosePulse,
  });

  const { setActivePassportSubNavId } = useWorkshop2Phase1DossierPassportSubnavScrollSpy({
    activeSection,
    dossierHydrateKey,
  });

  const [passportDriftLogDone, setPassportDriftLogDone] = useState(false);
  useWorkshop2Phase1DossierPassportDriftLogResetOnArticleId(articleId, setPassportDriftLogDone);

  useWorkshop2Phase1DossierTechPackBlobResetOnArticleChange(collectionId, articleId);

  const {
    dossier,
    setDossier,
    setDossierInternal,
    dossierLatestRef,
    savedHint,
    saveError,
    setSaveError,
    persist,
    lastPersistedDossierRef,
    dossierMetricsFooterLine,
    setDossierMetricsTick,
    skuDraft,
    setSkuDraft,
    nameDraft,
    setNameDraft,
    handbookCheckSnapshot,
    setHandbookCheckSnapshot,
  } = useWorkshop2Phase1DossierCoreState({
    collectionId,
    articleId,
    articleSku,
    articleName,
    updatedByLabel,
    tzWriteDisabled,
    toast,
    isPhase1,
    dossierHydrateKey,
    w2DossierMetricsCtx,
    w2MetricsSkuRef,
    onArticleLineDraftsChange,
  });

  const searchParams = useSearchParams();
  const wholesaleOrderId =
    searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || undefined;

  const applyCommittedServerDossier = useCallback(
    ({ dossier: next }: { version: number; dossier: Workshop2DossierPhase1 }) => {
      setDossierInternal(next);
      lastPersistedDossierRef.current = next;
    },
    [lastPersistedDossierRef, setDossierInternal]
  );

  const { commitHandoffOnServer } = useWorkshop2HandoffCommit({
    collectionId,
    articleId,
    updatedByLabel,
    orderId: wholesaleOrderId,
    toast,
    applyCommittedServerDossier,
  });

  const { attrCommentsById, openAttrComments, postMainTrailAttrComments, setAttrCommentOnlyOpen } =
    useWorkshop2Phase1DossierAttrCommentsController({
      dossier,
      setDossier,
      updatedByLabel,
      dossierCommentsBridgeRef,
      tzBlockCommentMetricKeys,
      onTzBlockCommentMetrics,
    });

  const [handbookCheckReportExpanded, setHandbookCheckReportExpanded] = useState(true);
  const {
    deferredAttrIds,
    tzMinimalModeBySection,
    setTzMinimalModeBySection,
    tzMinimalHideDeferCommentUi,
    tzNotifyHighlightRowKey,
    setTzNotifyHighlightRowKey,
  } = useWorkshop2Phase1DossierTzMinimalDeferZone({
    isPhase1,
    activeSection,
    dossier,
    collectionId,
    articleId,
    setHandbookCheckSnapshot,
  });

  const { pinnedAttrGroups, collapsedAttrGroups, toggleAttrGroupPinned, toggleAttrGroupCollapsed } =
    useWorkshop2Phase1DossierAttrGroupUi(activeSection);

  const leaves = useMemo(() => getHandbookCategoryLeaves(), []);
  const audiences = useMemo(() => getHandbookAudiencesWorkshop2(), []);

  const currentLeaf = useMemo(() => {
    const t = categoryLeafId?.trim();
    if (t && findHandbookLeafById(t)) return findHandbookLeafById(t)!;
    return leaves[0]!;
  }, [categoryLeafId, leaves]);

  const {
    sketchWorkspaceTab,
    setSketchWorkspaceTab,
    sketchSurface,
    setSketchSurface,
    sketchSheetPickerId,
    setSketchSheetPickerId,
    sketchMasterAnnotatorRef,
    sketchSheetAnnotatorRef,
    sketchBundleBusy,
    sketchPinLibraryOpen,
    setSketchPinLibraryOpen,
    techPackSessionBlobById,
    setTechPackSessionBlobById,
    sketchSnapshotDiffA,
    setSketchSnapshotDiffA,
    sketchSnapshotDiffB,
    setSketchSnapshotDiffB,
    sketchSnapshotDiffSummary,
    setSketchSnapshotDiffSummary,
    sketchMasterTemplateId,
    setSketchMasterTemplateId,
    orgSketchLibraryRevision,
    setOrgSketchLibraryRevision,
    appendSketchSheetFromUpload,
    exportSketchVisualBundleZip,
  } = useWorkshop2Phase1DossierSketchWorkspaceState({
    setDossier,
    dossier,
    currentLeaf,
    dossierViewProfile,
    skuDraft,
    toast,
  });

  const { normalizedSketchSheets, canOpenSketchFromToolbar } =
    useWorkshop2Phase1DossierSketchSheetsToolbar({
      leafId: currentLeaf.leafId,
      sketchSheets: dossier.sketchSheets,
      categorySketchImageDataUrl: dossier.categorySketchImageDataUrl,
      sketchSheetPickerId,
      setSketchSheetPickerId,
      sketchSurface,
      setSketchSurface,
      setSketchWorkspaceTab,
    });

  const {
    subcategorySketchActiveLevel,
    setSubcategorySketchActiveLevel,
    branchLevelsDetailsOpen,
    setBranchLevelsDetailsOpen,
  } = useWorkshop2Phase1DossierBranchSlotSketchUi(currentLeaf.leafId);

  const { tzTraceRows, tzPreflight, productionPreflight, handoffBlockedByProduction } =
    useWorkshop2Phase1DossierTzTraceAndPreflight({
      dossier,
      techPackSessionBlobById,
      attrCommentsById,
      articleSkuDraft: skuDraft,
      articleNameDraft: nameDraft,
    });

  const {
    passportCriticalAuditSummaries,
    dossierViewUiCaps,
    dvTzSignoffSides,
    showVisualSketchExportSurfacesNav,
    showVisualSketchLinkFieldsNav,
    workshop2FactoryShareUrl,
  } = useWorkshop2Phase1DossierPassportAuditViewFactoryUrl({
    tzActionLog: dossier.tzActionLog,
    dossierViewProfile,
    collectionId,
    internalArticleCode,
    articleId,
  });

  const {
    sketchWorkspaceStats,
    sketchPinLinkAudit,
    factorySendSketchPinReadiness,
    jumpSketchFocusPin,
  } = useWorkshop2Phase1DossierSketchPinReadiness({
    leafId: currentLeaf.leafId,
    categorySketchAnnotations: dossier.categorySketchAnnotations,
    sketchSheets: dossier.sketchSheets,
    subcategorySketchSlots: dossier.subcategorySketchSlots,
    dossierViewProfile,
    showVisualSketchLinkFieldsNav,
    jumpToSketchLineRefs,
    sketchMasterAnnotatorRef,
  });

  const {
    selectedAudienceId,
    selectedAudienceLabel,
    passportCategoryCaption,
    effectiveAudienceId,
    baseRows,
    leafPhase1Ids,
    leafPhase2Ids,
    leafPhase3Ids,
    baseRowsPhase2,
    baseRowsPhase3,
    linkedMatComposition,
    linkedMatCompositionPhase2,
    linkedMatCompositionPhase3,
    leafRowPolicy,
    rowsToShow,
    rowsToShowPhase2,
    rowsToShowPhase3,
    baseAttributeIdSet,
    extraIds,
    extraRows,
    customAssignments,
  } = useWorkshop2Phase1DossierAudienceAndAttributeRows({
    dossierSelectedAudienceId: dossier.selectedAudienceId,
    dossierAssignments: dossier.assignments,
    audiences,
    leaves,
    currentLeaf,
  });

  const { appendPassportPostSignoffJournalNote, logTechPackZipLine, appendTzPulse } =
    useWorkshop2Phase1DossierJournalCommitZone({
      collectionId,
      articleId,
      lastPersistedDossierRef,
      w2DossierMetricsCtx,
      setDossierMetricsTick,
      setSaveError,
      toast,
      updatedByLabel,
      tzWriteDisabled,
      setDossierInternal,
    });

  const {
    matAttrDef,
    matAttrForLeaf,
    matLabelById,
    bomLinePickOptions,
    matRequiredUnset,
    sketchAttributeOptions,
    sketchTechGaps,
    visualGateOpenCountGlobal,
    expectedScaleId,
    dimensionLabels,
  } = useWorkshop2Phase1DossierMatCatalogDerivedZone({
    currentLeaf,
    dossier,
    isPhase1,
    leafPhase1Ids,
    baseRows,
  });

  useWorkshop2Phase1DossierLeafCatalogSyncEffects({
    tzWriteDisabled,
    currentLeaf,
    setDossierInternal,
  });

  const { saveDraft } = useWorkshop2Phase1DossierSaveDraftZone({
    setSaveError,
    persist,
    dossierLatestRef,
  });

  const {
    saveSketchLabelsSnapshot,
    restoreSketchLabelsFromSnapshot,
    saveMasterSketchPinTemplate,
    applyMasterSketchPinTemplate,
    deleteSketchPinTemplateById,
    saveMasterSketchPinTemplateToOrg,
    deleteOrgSketchPinTemplateById,
    sketchSnapshotsNewestFirst,
    orgSketchTemplatesList,
  } = useWorkshop2Phase1DossierSketchPinLibraryZone({
    collectionId,
    currentLeafId: currentLeaf.leafId,
    dossier,
    setDossier,
    updatedByLabel,
    toast,
    sketchMasterTemplateId,
    setSketchMasterTemplateId,
    orgSketchLibraryRevision,
    setOrgSketchLibraryRevision,
    setSketchPinLibraryOpen,
  });

  /** «Следующее» / «Готово»: проверки только на шаге 1, затем сохранение и переход. */
  const { handleContinue } = useWorkshop2Phase1DossierContinueStepZone({
    dossier,
    isPhase1,
    isPhase2,
    isPhase3,
    matLabelById,
    linkedMatComposition,
    linkedMatCompositionPhase2,
    leafPhase1Ids,
    leafPhase2Ids,
    matAttrDef,
    setSaveError,
    persist,
    onContinueToNextStep,
    onContinueToStep3,
    onFinishWorkshop,
  });

  const {
    onSetHandbookParameters,
    onSetHandbookParametersWithColorBundleSync,
    onFreeTextSide,
    l1Opts,
    l2Opts,
    l3Opts,
    onAudienceSelect,
    onL1Select,
    onL2Select,
    onL3Select,
    commitSku,
    commitName,
    applyMatRows,
    applyMatSoloParts,
    patchColor,
  } = useWorkshop2Phase1DossierHandbookMutationsZone({
    leaves,
    currentLeaf,
    effectiveAudienceId,
    selectedAudienceId,
    dossier,
    setDossier,
    onPatchArticleLine,
    updatedByLabel,
    articleSku,
    skuDraft,
    setSkuDraft,
    articleName,
    nameDraft,
    setNameDraft,
    linkedMatComposition,
  });

  const allowMultiHandbook = isPhase1 || isPhase2 || isPhase3;

  const attributeIdsLinkedOnSketch = useMemo(
    () => collectWorkshop2Phase1LinkedAttributeIdsForLeaf(dossier, currentLeaf.leafId),
    [currentLeaf.leafId, dossier.categorySketchAnnotations, dossier.sketchSheets]
  );

  const { toggleDeferAttribute, deferGroupSetAll } =
    useWorkshop2Phase1DossierFieldDeferralActions(setDossier);

  const dossierAttrCardCtx = useWorkshop2Phase1DossierAttrCardContext({
    activeSection,
    currentLeaf,
    dossier,
    setDossier,
    setDossierInternal,
    collectionId,
    articleId,
    techPackSessionBlobById,
    setTechPackSessionBlobById,
    skuDraft,
    allowMultiHandbook,
    onSetHandbookParameters,
    onFreeTextSide,
    patchColor,
    isPhase1,
    tzMinimalHideDeferCommentUi,
    tzWriteDisabled,
    deferredAttrIds,
    toggleDeferAttribute,
    attrCommentsById,
    openAttrComments,
    sketchVisualCatalogHighlightSet,
    attributeIdsLinkedOnSketch,
    logTechPackZipLine,
    appendTzPulse,
    updatedByLabel,
  });

  const { renderPhaseRow, workshop2DossierSectionRowsSharedProps } =
    useWorkshop2Phase1DossierSectionRowsOrchestration({
      activeSection,
      currentLeaf,
      tzMinimalModeBySection,
      collapsedAttrGroups,
      pinnedAttrGroups,
      toggleAttrGroupPinned,
      toggleAttrGroupCollapsed,
      deferGroupSetAll,
      isPhase1,
      dossier,
      dossierAttrCardCtx,
      allowMultiHandbook,
      patchColor,
      deferredAttrIds,
      toggleDeferAttribute,
      attrCommentsById,
      openAttrComments,
      onSetHandbookParametersWithColorBundleSync,
      onSetHandbookParameters,
      onFreeTextSide,
      applyMatRows,
      applyMatSoloParts,
      currentLeafL2Name: currentLeaf.l2Name,
      linkedMatComposition,
      linkedMatCompositionPhase2,
      linkedMatCompositionPhase3,
      matAttrDef,
      matAttrForLeaf,
      matRequiredUnset,
    });

  const { currentPhase, phaseRowsCurrent, sectionRowsCurrent, extraRowsCurrent } =
    useWorkshop2Phase1DossierActiveSectionRows({
      isPhase1,
      isPhase2,
      isPhase3,
      rowsToShow,
      rowsToShowPhase2,
      rowsToShowPhase3,
      extraRows,
      activeSection,
    });

  const {
    visualsCatalogOnlyRows,
    visualsCatalogOnlyExtras,
    visualsCatalogAttributeIdsForSketch,
    visualsCatalogSketchLinksForPins,
  } = useWorkshop2Phase1DossierVisualsCatalogZone({
    isPhase1,
    isPhase2,
    isPhase3,
    rowsToShow,
    rowsToShowPhase2,
    rowsToShowPhase3,
    extraRows,
  });

  const {
    generalPassportStartRows,
    generalPassportPreSampleRows,
    passportArticleCardStartRows,
    passportSewingPlanStartRows,
    passportArticleCardStartExtras,
    passportSewingPlanStartExtras,
    showPhase1PassportArticleCard,
    generalPassportPreSampleExtras,
  } = useWorkshop2Phase1DossierPassportPartitionsZone({
    phaseRowsCurrent,
    extraRows,
    isPhase1,
  });

  /** Атрибуты каталога секции «приёмка» (таможня после образца) — не в карточке паспорта, UI в «Задание». */
  const sampleIntakeCatalogRows = useWorkshop2SampleIntakeCatalogRows({
    isPhase1,
    isPhase2,
    isPhase3,
    rowsToShow,
    rowsToShowPhase2,
    rowsToShowPhase3,
    baseRows,
    baseRowsPhase2,
    baseRowsPhase3,
    currentLeaf,
    selectedAudienceId,
  });

  const sampleIntakeCatalogExtras = useWorkshop2SampleIntakeCatalogExtras(extraRows, isPhase1);

  const { passportHubModel } = useWorkshop2Phase1DossierPassportHubZone({
    dossier,
    skuDraft,
    nameDraft,
    selectedAudienceId,
    currentLeaf,
    generalPassportStartRows,
    generalPassportPreSampleRows,
    currentPhase,
  });

  const { handbookWarnings } = useWorkshop2Phase1DossierHandbookWarningsZone({
    dossier,
    currentLeaf,
    expectedScaleId,
    dimensionLabels,
    leafPhase1Ids,
  });

  const { sectionReadiness, sectionReadinessUi, sectionWarningsById } =
    useWorkshop2Phase1DossierSectionReadinessZone({
      dossier,
      phaseRowsCurrent,
      currentPhase,
      techPackSessionBlobById,
      currentLeaf,
      skuDraft,
      nameDraft,
      handbookWarnings,
    });

  const { tzCoreFieldsFillPctGate, tzGateSnapshot, sectionGateErrorsById, factorySendHubPreview } =
    useWorkshop2Phase1DossierTzGatesZone({
      dossier,
      techPackSessionBlobById,
      attrCommentsById: attrCommentsById as Record<string, Workshop2TzGateCommentLike[]>,
      sectionReadinessUi,
      activeCategoryLeafId: currentLeaf.leafId,
      sectionWarningsById,
    });

  const {
    tzRevokeDeniedHint,
    tzRevokersEffective,
    tzDigitalSignoffRows,
    tzDigitalSignoffRowsGated,
    tzSignoffBlockHint,
    activeSectionSignGateMeets,
    fourTzLevelsFullySignedByAll,
    allSectionSignoffPairsDone,
    signTzDigitalRow,
    revokeTzDigitalRow,
    tzSectionSignoffRevokeAllowed,
    sectionSignoffProfileGateOk,
    sectionSignoffPassportPreviews,
    sectionSignoffSessionBrandOk,
    sectionSignoffSessionTechOk,
    commitSectionSignoff,
    revokeSectionSignoff,
  } = useWorkshop2Phase1DossierTzSignoffZone({
    dossier,
    setDossier,
    persist,
    toast,
    tzWriteDisabled,
    updatedByLabel,
    sectionSignoffOrganizationLabel,
    tzSignoffRevokerLabels,
    tzDigitalSignoffCapabilities,
    activeSection,
    setActiveSection,
    sectionReadinessUi,
    sectionWarningsById,
    sectionGateErrorsById,
    tzGateSnapshot,
    collectionId,
    articleId,
    articleSku,
  });

  const [exportLanguage, setExportLanguage] = useState<'ru' | 'ru_en' | 'ru_zh'>('ru');

  const {
    finalTzSpecDocumentHtml,
    factoryPackDocumentHtml,
    factoryPackReleaseGate,
    finalTzAssignmentChain,
    lastProductionExportBadge,
    phase1DossierJsonUtf8Bytes,
  } = useWorkshop2Phase1DossierFinalTzExportZone({
    dossier,
    onTzSpecPreviewHtml,
    skuDraft,
    nameDraft,
    currentLeaf,
    currentPhase,
    preflightOk: tzPreflight.ok,
    preflightIssueCount: tzPreflight.issues.length,
    sectionSignoffsFull: tzGateSnapshot.sectionSignoffsFull,
    gateLifecycleState: tzGateSnapshot.state,
    exportLanguage,
    pathLabel: currentLeaf.pathLabel,
    factorySendHubPreview,
    articleId,
    collectionId,
  });

  const { postMainTrailFinalWizard, setFinalTzWizardOpen } =
    useWorkshop2Phase1DossierFinalTzWizardController({
      dossier,
      tzWriteDisabled,
      updatedByLabel,
      skuDraft,
      nameDraft,
      pathLabel: currentLeaf.pathLabel,
      persist,
      toast,
      finalTzSpecDocumentHtml,
      factoryPackDocumentHtml,
      factoryPackReleaseGate,
      phase1DossierJsonUtf8Bytes,
      exportLanguage,
      setExportLanguage,
    });

  const { dossierNavPrimarySections, dossierNavSecondarySections } =
    useWorkshop2Phase1DossierViewNavZone({
      dossierViewProfile,
      isPhase1,
      activeSection,
      setActiveSection,
    });

  useWorkshop2Phase1DossierMaterialComplianceSessionHydrate({
    isPhase1,
    collectionId,
    articleId,
    dossierHydrateKey,
    setDossierInternal,
  });

  const {
    materialBomHubModel,
    materialSketchBomStripModel,
    materialBomExportInput,
    sketchBomRefsUnion,
    matSketchBomGapRefs,
    materialCategoryNotes,
  } = useWorkshop2Phase1DossierMaterialBomZone({
    currentPhase,
    leafPhase1Ids,
    leafPhase2Ids,
    leafPhase3Ids,
    matRequiredForPhase1: Boolean(matAttrDef?.requiredForPhase1),
    matRequiredForPhase2: Boolean(matAttrDef?.requiredForPhase2),
    dossier,
    linkedMatComposition,
    linkedMatCompositionPhase2,
    linkedMatCompositionPhase3,
    matLabelById,
    sectionReadinessMaterialPct: sectionReadiness.material.pct,
    currentLeaf,
    skuDraft,
    nameDraft,
    articleId,
  });

  const { materialMatHint, openSketchFromMaterialHubForPulse } =
    useWorkshop2Phase1DossierMaterialSketchNavZone({
      currentLeafL2Name: currentLeaf.l2Name,
      setActiveSection,
      tzScrollBehavior,
      onRequestClosePulse,
    });

  useWorkshop2Phase1DossierPulseSlotLayoutEffect({
    pulseSlotRef,
    dossier,
    setDossier,
    updatedByLabel,
    normalizedSketchSheets,
    skuDraft,
    nameDraft,
    currentLeaf,
    visualsShareAbsoluteUrl,
    sketchViewFloor,
    currentPhase,
    dossierViewProfile,
    onNavigateToTab,
    buildRouteHandoffAbsoluteUrl,
    sectionReadinessConstructionPct: sectionReadiness.construction.pct,
    materialBomHubModel,
    materialMatHint,
    materialCategoryNotes,
    materialSketchBomStripModel,
    materialBomExportInput,
    tzWriteDisabled,
    sketchBomRefsUnion,
    matSketchBomGapRefs,
    collectionId,
    articleId,
    jumpToTzSectionAnchorFromPulse,
    onRequestClosePulse,
    openSketchFromMaterialHubForPulse,
    jumpToQcArticleSection,
    tzMinimalModeBySection,
    setTzMinimalModeBySection,
  });

  const { allTzDigitalSignoffsDone, tzReadyForSample } =
    useWorkshop2Phase1DossierTzSampleReadinessZone({
      dossier,
      sectionReadiness,
      isPhase1,
      allSectionSignoffPairsDone,
      handbookWarnings,
    });

  const { handbookCheckClean, stageBoardHandbookWarnings } =
    useWorkshop2Phase1DossierHandbookCheckReportZone({
      handbookCheckSnapshot,
      activeSection,
      setHandbookCheckReportExpanded,
    });

  const {
    notifyResponsibleForTzRow,
    notifyStakeholdersForSectionSignoff,
    setSignoffDeadline,
    jumpToTzSignoffsAreaFooter,
  } = useWorkshop2Phase1DossierTzNotifyActionsZone({
    setTzNotifyHighlightRowKey,
    toast,
    setDossier,
    persist,
    updatedByLabel,
    isPhase1,
    dossier,
    sectionReadinessUi,
    setActiveSection,
  });

  useWorkshop2Phase1DossierW2SessionMetricRecordEffects({
    collectionId,
    articleId,
    passportHubModel,
    visualGateOpenCountGlobal,
    isPhase1,
    tzReadyForSample,
    setDossierMetricsTick,
  });

  const { runHandbookCheck } = useWorkshop2Phase1DossierHandbookControlZone({
    dossier,
    currentLeaf,
    skuDraft,
    nameDraft,
    handbookWarnings,
    sectionReadinessUi,
    selectedAudienceLabel,
    activeSection,
    setHandbookCheckSnapshot,
  });

  const assignmentSendChecklistDetailsRef = useRef<HTMLDetailsElement | null>(null);

  const { openNextAssignmentBlocker, assignmentSendPanelBundle, assignmentHandoffBundle } =
    useWorkshop2Phase1DossierSendHandoffZone({
      activeSection,
      setActiveSection,
      onOpenFinalTzWizard: () => setFinalTzWizardOpen(true),
      setAttrCommentOnlyOpen,
      openAttrComments,
      assignmentChain: finalTzAssignmentChain,
      assignmentSendChecklistDetailsRef,
      tzWriteDisabled,
      lastProductionExportBadge,
      factorySendHubPreview,
      factorySendSketchPinReadiness,
      tzPreflight,
      productionPreflight,
      tzTraceRows,
      jumpToSketchLineRefs,
      jumpToTzSectionAnchor,
      sketchPinLinkAudit,
      onSketchPinFocus: jumpSketchFocusPin,
      dossier,
      setDossier,
      appendTzPulse,
      updatedByLabel,
      fourTzLevelsFullySignedByAll,
      handoffBlockedByProduction,
      productionPreflightBlockerCount: productionPreflight.blockers.length,
      commitHandoffOnServer,
    });

  const {
    internalArticleCodeDisplayForRibbon,
    showCompactPassportContextRibbon,
    asideHasContent,
    hideTzGlobalRoleSignoffBlock,
    showTzRightAside,
    showFooterTzSignoffShortcut,
    showRollbackButton,
    handleRollbackToDevelopment,
    tzBlockersFooter,
  } = useWorkshop2Phase1DossierPanelShellZone({
    isPhase1,
    activeSection,
    dossierViewUiCaps,
    dossierViewProfile,
    handbookCheckSnapshot,
    dossier,
    setDossier,
    internalArticleCode,
    toast,
    onOpenPulse,
    productionPreflightIssues: productionPreflight.issues,
  });

  const { panelRoot } = useWorkshop2Phase1DossierPanelTailZone(
    buildWorkshop2Phase1DossierPanelTailInput({
      sectionBodyFlat: {
        activeSection,
        sectionReadinessUi,
        sectionGateErrorsById,
        currentPhase,
        isPhase1,
        isPhase2,
        sectionRowsCurrent,
        extraRowsCurrent,
        renderPhaseRow,
        allowMultiHandbook,
        handleSelectTzSection,
        tzMinimalModeBySection,
        setTzMinimalModeBySection,
        tzMinimalHideDeferCommentUi,
        deferredAttrIds,
        toggleDeferAttribute,
        dossier,
        setDossier,
        saveDraft,
        updatedByLabel,
        tzWriteDisabled,
        collectionId,
        articleId,
        articleSku,
        passportHubModel,
        skuDraft,
        setSkuDraft,
        nameDraft,
        setNameDraft,
        internalArticleCode,
        passportCategoryCaption,
        setActivePassportSubNavId,
        tzScrollBehavior,
        appendPassportPostSignoffJournalNote,
        passportDriftLogDone,
        setPassportDriftLogDone,
        passportCriticalAuditSummaries,
        passportSewingPlanStartRows,
        passportSewingPlanStartExtras,
        showPhase1PassportArticleCard,
        passportArticleCardStartRows,
        passportArticleCardStartExtras,
        generalPassportPreSampleRows,
        generalPassportPreSampleExtras,
        passportStep1BriefHref,
        jumpToTzSectionAnchor,
        jumpToMaterialMatTable,
        jumpToSketchLineRefs,
        jumpToConstructionContour,
        jumpToQcArticleSection,
        onNavigateToTab,
        dossierViewProfile,
        workshop2FactoryShareUrl,
        audiences,
        selectedAudienceId,
        onAudienceSelect,
        l1Opts,
        l2Opts,
        l3Opts,
        currentLeaf,
        onL1Select,
        onL2Select,
        onL3Select,
        commitSku,
        commitName,
        patchColor,
        onSetHandbookParametersWithColorBundleSync,
        onSetHandbookParameters,
        onFreeTextSide,
        selectedAudienceLabel,
        attrCommentsById,
        openAttrComments,
        workshop2DossierSectionRowsSharedProps,
        dossierAttrCardCtx,
        sketchBomRefsUnion,
        matSketchBomGapRefs,
        dvTzSignoffSides,
        sectionSignoffPassportPreviews,
        sectionSignoffOrganizationLabel,
        sectionSignoffProfileGateOk,
        sectionSignoffSessionBrandOk,
        sectionSignoffSessionTechOk,
        tzSectionSignoffRevokeAllowed,
        tzNotifyHighlightRowKey,
        commitSectionSignoff,
        revokeSectionSignoff,
        notifyStakeholdersForSectionSignoff,
        setSignoffDeadline,
        techPackSessionBlobById,
        setTechPackSessionBlobById,
        logTechPackZipLine,
        appendTzPulse,
        factorySendHubPreview,
        sketchViewFloor,
        showVisualSketchLinkFieldsNav,
        sketchPinLinkAudit,
        sketchTechGaps,
        setSketchWorkspaceTab,
        setSketchSurface,
        sketchMasterAnnotatorRef,
        sketchSheetAnnotatorRef,
        canOpenSketchFromToolbar,
        sketchEditsLocked,
        sketchSurface,
        sketchWorkspaceTab,
        sketchWorkspaceStats,
        sketchSheetPickerId,
        setSketchSheetPickerId,
        sketchMasterTemplateId,
        setSketchMasterTemplateId,
        orgSketchTemplatesList,
        applyMasterSketchPinTemplate,
        saveMasterSketchPinTemplate,
        saveMasterSketchPinTemplateToOrg,
        sketchAttributeOptions,
        bomLinePickOptions,
        normalizedSketchSheets,
        appendSketchSheetFromUpload,
        orgSketchLibraryRevision,
        setOrgSketchLibraryRevision,
        subcategorySketchActiveLevel,
        setSubcategorySketchActiveLevel,
        branchLevelsDetailsOpen,
        setBranchLevelsDetailsOpen,
        setSketchFloorMode,
        lockedSketchFloorOnly,
        copySketchFloorLink,
        saveSketchLabelsSnapshot,
        sketchBundleBusy,
        exportSketchVisualBundleZip,
        setSketchPinLibraryOpen,
        visualsCatalogAttributeIdsForSketch,
        visualsCatalogSketchLinksForPins,
        onVisualCatalogSuggestFromSketch,
        visualsCatalogOnlyRows,
        visualsCatalogOnlyExtras,
        sampleIntakeCatalogRows,
        sampleIntakeCatalogExtras,
        tzBlockersFooter,
        openNextAssignmentBlocker,
        assignmentSendPanelBundle,
        assignmentHandoffBundle,
      },
      dossierViewProfile,
      dossierNavPrimarySections,
      dossierNavSecondarySections,
      sectionWarningsById,
      setDossierViewProfileFromCtx,
      asideHasContent,
      showTzRightAside,
      dossierMainColumnFlash,
      stageBoardHandbookWarnings,
      tzRevokeDeniedHint,
      jumpToBrandNotesAttribute,
      showCompactPassportContextRibbon,
      internalArticleCodeDisplayForRibbon,
      sketchPinLibrary: {
        sketchPinLibraryOpen,
        setSketchPinLibraryOpen,
        sketchSnapshotsNewestFirst,
        sketchSnapshotDiffA,
        sketchSnapshotDiffB,
        setSketchSnapshotDiffA,
        setSketchSnapshotDiffB,
        sketchSnapshotDiffSummary,
        setSketchSnapshotDiffSummary,
        restoreSketchLabelsFromSnapshot,
        dossier,
        deleteSketchPinTemplateById,
        collectionId,
        orgSketchTemplatesList,
        deleteOrgSketchPinTemplateById,
      },
      rightAside: {
        showTzRightAside,
        panel: {
          hideTzGlobalRoleSignoffBlock,
          allTzDigitalSignoffsDone,
          activeSectionSignGateMeets,
          tzDigitalSignoffRows,
          tzDigitalSignoffRowsGated,
          tzSignoffBlockHint,
          notifyResponsibleForTzRow,
          tzNotifyHighlightRowKey,
          updatedByLabel,
          tzRevokersEffective,
          signTzDigitalRow,
          revokeTzDigitalRow,
          handbookCheckSnapshot,
          handbookCheckReportExpanded,
          setHandbookCheckReportExpanded,
        },
      },
      postMainTrail: {
        persist: {
          updatedAtIso: dossier.updatedAt,
          savedHint,
          saveError,
          metricsFooterLine: dossierMetricsFooterLine,
        },
        footer: {
          onBack,
          onPreviousStep,
          isPhase1,
          isPhase3,
          activeSection,
          saveDraft,
          runHandbookCheck,
          handbookCheckClean,
          showFooterTzSignoffShortcut,
          allSectionSignoffPairsDone,
          allTzDigitalSignoffsDone,
          jumpToTzSignoffsAreaFooter,
          handleContinue,
        },
        finalWizard: postMainTrailFinalWizard,
        attrComments: postMainTrailAttrComments,
      },
      showRollbackButton,
      handleRollbackToDevelopment,
      dossier,
    })
  );

  return panelRoot;
}
