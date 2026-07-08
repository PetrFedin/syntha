'use client';

import type { UseWorkshop2Phase1DossierSectionBodyZoneInput } from '@/components/brand/production/use-workshop2-phase1-dossier-section-body-zone';

export type Workshop2Phase1DossierSectionBodySectionNavBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'activeSection'
  | 'sectionReadinessUi'
  | 'sectionGateErrorsById'
  | 'currentPhase'
  | 'isPhase1'
  | 'isPhase2'
  | 'sectionRowsCurrent'
  | 'extraRowsCurrent'
  | 'renderPhaseRow'
  | 'allowMultiHandbook'
> & {
  handleSelectTzSection: UseWorkshop2Phase1DossierSectionBodyZoneInput['onSelectTzSection'];
};

export type Workshop2Phase1DossierSectionBodyTzMinimalBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'tzMinimalModeBySection'
  | 'setTzMinimalModeBySection'
  | 'tzMinimalHideDeferCommentUi'
  | 'deferredAttrIds'
  | 'toggleDeferAttribute'
>;

export type Workshop2Phase1DossierSectionBodyDossierCoreBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'dossier'
  | 'setDossier'
  | 'saveDraft'
  | 'updatedByLabel'
  | 'tzWriteDisabled'
  | 'collectionId'
  | 'articleId'
  | 'articleSku'
>;

export type Workshop2Phase1DossierSectionBodyPassportBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'passportHubModel'
  | 'skuDraft'
  | 'setSkuDraft'
  | 'nameDraft'
  | 'setNameDraft'
  | 'internalArticleCode'
  | 'passportCategoryCaption'
  | 'setActivePassportSubNavId'
  | 'tzScrollBehavior'
  | 'appendPassportPostSignoffJournalNote'
  | 'passportDriftLogDone'
  | 'setPassportDriftLogDone'
  | 'passportCriticalAuditSummaries'
  | 'passportSewingPlanStartRows'
  | 'passportSewingPlanStartExtras'
  | 'showPhase1PassportArticleCard'
  | 'passportArticleCardStartRows'
  | 'passportArticleCardStartExtras'
  | 'generalPassportPreSampleRows'
  | 'generalPassportPreSampleExtras'
  | 'passportStep1BriefHref'
>;

export type Workshop2Phase1DossierSectionBodyJumpNavBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'jumpToTzSectionAnchor'
  | 'jumpToMaterialMatTable'
  | 'jumpToSketchLineRefs'
  | 'jumpToConstructionContour'
  | 'jumpToQcArticleSection'
  | 'onNavigateToTab'
  | 'dossierViewProfile'
> & {
  workshop2FactoryShareUrl: string | null | undefined;
};

export type Workshop2Phase1DossierSectionBodyHandbookBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'audiences'
  | 'selectedAudienceId'
  | 'onAudienceSelect'
  | 'l1Opts'
  | 'l2Opts'
  | 'l3Opts'
  | 'currentLeaf'
  | 'onL1Select'
  | 'onL2Select'
  | 'onL3Select'
  | 'commitSku'
  | 'commitName'
  | 'patchColor'
  | 'onSetHandbookParametersWithColorBundleSync'
  | 'onSetHandbookParameters'
  | 'onFreeTextSide'
  | 'selectedAudienceLabel'
>;

export type Workshop2Phase1DossierSectionBodyRowsAttrsBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'attrCommentsById'
  | 'openAttrComments'
  | 'workshop2DossierSectionRowsSharedProps'
  | 'dossierAttrCardCtx'
  | 'sketchBomRefsUnion'
  | 'matSketchBomGapRefs'
>;

export type Workshop2Phase1DossierSectionBodySignoffBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'dvTzSignoffSides'
  | 'sectionSignoffPassportPreviews'
  | 'sectionSignoffOrganizationLabel'
  | 'sectionSignoffProfileGateOk'
  | 'sectionSignoffSessionBrandOk'
  | 'sectionSignoffSessionTechOk'
  | 'tzSectionSignoffRevokeAllowed'
  | 'tzNotifyHighlightRowKey'
  | 'commitSectionSignoff'
  | 'revokeSectionSignoff'
  | 'notifyStakeholdersForSectionSignoff'
  | 'setSignoffDeadline'
>;

export type Workshop2Phase1DossierSectionBodyTechPackBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'techPackSessionBlobById'
  | 'setTechPackSessionBlobById'
  | 'logTechPackZipLine'
  | 'appendTzPulse'
  | 'factorySendHubPreview'
>;

export type Workshop2Phase1DossierSectionBodySketchBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'sketchViewFloor'
  | 'showVisualSketchLinkFieldsNav'
  | 'sketchPinLinkAudit'
  | 'sketchTechGaps'
  | 'setSketchWorkspaceTab'
  | 'setSketchSurface'
  | 'sketchMasterAnnotatorRef'
  | 'sketchSheetAnnotatorRef'
  | 'canOpenSketchFromToolbar'
  | 'sketchEditsLocked'
  | 'sketchSurface'
  | 'sketchWorkspaceTab'
  | 'sketchWorkspaceStats'
  | 'sketchSheetPickerId'
  | 'setSketchSheetPickerId'
  | 'sketchMasterTemplateId'
  | 'setSketchMasterTemplateId'
  | 'orgSketchTemplatesList'
  | 'applyMasterSketchPinTemplate'
  | 'saveMasterSketchPinTemplate'
  | 'saveMasterSketchPinTemplateToOrg'
  | 'sketchAttributeOptions'
  | 'bomLinePickOptions'
  | 'normalizedSketchSheets'
  | 'appendSketchSheetFromUpload'
  | 'orgSketchLibraryRevision'
  | 'setOrgSketchLibraryRevision'
  | 'subcategorySketchActiveLevel'
  | 'setSubcategorySketchActiveLevel'
  | 'branchLevelsDetailsOpen'
  | 'setBranchLevelsDetailsOpen'
  | 'setSketchFloorMode'
  | 'lockedSketchFloorOnly'
  | 'copySketchFloorLink'
  | 'saveSketchLabelsSnapshot'
  | 'sketchBundleBusy'
  | 'exportSketchVisualBundleZip'
  | 'setSketchPinLibraryOpen'
>;

export type Workshop2Phase1DossierSectionBodyVisualsAssignmentBundle = Pick<
  UseWorkshop2Phase1DossierSectionBodyZoneInput,
  | 'visualsCatalogAttributeIdsForSketch'
  | 'visualsCatalogSketchLinksForPins'
  | 'onVisualCatalogSuggestFromSketch'
  | 'visualsCatalogOnlyRows'
  | 'visualsCatalogOnlyExtras'
  | 'sampleIntakeCatalogRows'
  | 'sampleIntakeCatalogExtras'
  | 'tzBlockersFooter'
> & {
  openNextAssignmentBlocker: UseWorkshop2Phase1DossierSectionBodyZoneInput['onOpenProblemBlock'];
  assignmentSendPanelBundle: UseWorkshop2Phase1DossierSectionBodyZoneInput['sendPanelProps'];
  assignmentHandoffBundle: UseWorkshop2Phase1DossierSectionBodyZoneInput['handoffBlockProps'];
};

export type Workshop2Phase1DossierSectionBodyInputBundles = {
  sectionNav: Workshop2Phase1DossierSectionBodySectionNavBundle;
  tzMinimal: Workshop2Phase1DossierSectionBodyTzMinimalBundle;
  dossierCore: Workshop2Phase1DossierSectionBodyDossierCoreBundle;
  passport: Workshop2Phase1DossierSectionBodyPassportBundle;
  jumpNav: Workshop2Phase1DossierSectionBodyJumpNavBundle;
  handbook: Workshop2Phase1DossierSectionBodyHandbookBundle;
  rowsAttrs: Workshop2Phase1DossierSectionBodyRowsAttrsBundle;
  signoff: Workshop2Phase1DossierSectionBodySignoffBundle;
  techPack: Workshop2Phase1DossierSectionBodyTechPackBundle;
  sketch: Workshop2Phase1DossierSectionBodySketchBundle;
  visualsAssignment: Workshop2Phase1DossierSectionBodyVisualsAssignmentBundle;
};

/** Flat orchestrator scope → nested section body bundles (wave 72). */
export type Workshop2Phase1DossierSectionBodyFlatScope =
  Workshop2Phase1DossierSectionBodySectionNavBundle &
    Workshop2Phase1DossierSectionBodyTzMinimalBundle &
    Workshop2Phase1DossierSectionBodyDossierCoreBundle &
    Workshop2Phase1DossierSectionBodyPassportBundle &
    Workshop2Phase1DossierSectionBodyJumpNavBundle &
    Workshop2Phase1DossierSectionBodyHandbookBundle &
    Workshop2Phase1DossierSectionBodyRowsAttrsBundle &
    Workshop2Phase1DossierSectionBodySignoffBundle &
    Workshop2Phase1DossierSectionBodyTechPackBundle &
    Workshop2Phase1DossierSectionBodySketchBundle &
    Workshop2Phase1DossierSectionBodyVisualsAssignmentBundle;

export function buildWorkshop2Phase1DossierSectionBodyInputBundles(
  c: Workshop2Phase1DossierSectionBodyFlatScope
): Workshop2Phase1DossierSectionBodyInputBundles {
  const {
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
  } = c;

  return {
    sectionNav: {
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
    },
    tzMinimal: {
      tzMinimalModeBySection,
      setTzMinimalModeBySection,
      tzMinimalHideDeferCommentUi,
      deferredAttrIds,
      toggleDeferAttribute,
    },
    dossierCore: {
      dossier,
      setDossier,
      saveDraft,
      updatedByLabel,
      tzWriteDisabled,
      collectionId,
      articleId,
      articleSku,
    },
    passport: {
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
    },
    jumpNav: {
      jumpToTzSectionAnchor,
      jumpToMaterialMatTable,
      jumpToSketchLineRefs,
      jumpToConstructionContour,
      jumpToQcArticleSection,
      onNavigateToTab,
      dossierViewProfile,
      workshop2FactoryShareUrl,
    },
    handbook: {
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
    },
    rowsAttrs: {
      attrCommentsById,
      openAttrComments,
      workshop2DossierSectionRowsSharedProps,
      dossierAttrCardCtx,
      sketchBomRefsUnion,
      matSketchBomGapRefs,
    },
    signoff: {
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
    },
    techPack: {
      techPackSessionBlobById,
      setTechPackSessionBlobById,
      logTechPackZipLine,
      appendTzPulse,
      factorySendHubPreview,
    },
    sketch: {
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
    },
    visualsAssignment: {
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
  };
}

/** Собирает flat input для section body zone из логических bundle-ов orchestrator. */
export function assembleWorkshop2Phase1DossierSectionBodyInput({
  sectionNav,
  tzMinimal,
  dossierCore,
  passport,
  jumpNav,
  handbook,
  rowsAttrs,
  signoff,
  techPack,
  sketch,
  visualsAssignment,
}: Workshop2Phase1DossierSectionBodyInputBundles): UseWorkshop2Phase1DossierSectionBodyZoneInput {
  const { handleSelectTzSection, ...sectionNavRest } = sectionNav;
  const { workshop2FactoryShareUrl, ...jumpNavRest } = jumpNav;
  const {
    openNextAssignmentBlocker,
    assignmentSendPanelBundle,
    assignmentHandoffBundle,
    ...visualsAssignmentRest
  } = visualsAssignment;

  return {
    ...sectionNavRest,
    ...tzMinimal,
    ...dossierCore,
    ...passport,
    ...jumpNavRest,
    workshop2FactoryShareUrl: workshop2FactoryShareUrl ?? '',
    ...handbook,
    ...rowsAttrs,
    ...signoff,
    ...techPack,
    ...sketch,
    ...visualsAssignmentRest,
    onSelectTzSection: handleSelectTzSection,
    onOpenProblemBlock: openNextAssignmentBlocker,
    sendPanelProps: assignmentSendPanelBundle,
    handoffBlockProps: assignmentHandoffBundle,
  };
}

export function useWorkshop2Phase1DossierSectionBodyInputZone(
  bundles: Workshop2Phase1DossierSectionBodyInputBundles
): UseWorkshop2Phase1DossierSectionBodyZoneInput {
  return assembleWorkshop2Phase1DossierSectionBodyInput(bundles);
}
