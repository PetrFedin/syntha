'use client';

import {
  useWorkshop2Phase1DossierRenderPhaseRow,
  type UseWorkshop2Phase1DossierRenderPhaseRowParams,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-use-render-phase-row';
import { useWorkshop2Phase1DossierSectionRowsSharedBundle } from '@/components/brand/production/workshop2-phase1-dossier-panel-use-section-rows-shared';
import type { Workshop2DossierSectionRowsSharedBundle } from '@/components/brand/production/workshop2-phase1-dossier-panel-section-rows';
import type { Workshop2DossierAttributeCardContextProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-attribute-card';
import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import type { DossierSection } from '@/lib/production/dossier-readiness-engine';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2AttrComment } from '@/components/brand/production/workshop2-phase1-dossier-panel-attr-comments-dialog';

export type UseWorkshop2Phase1DossierSectionRowsOrchestrationInput =
  UseWorkshop2Phase1DossierRenderPhaseRowParams & {
    activeSection: DossierSection;
    currentLeaf: HandbookCategoryLeaf;
    tzMinimalModeBySection: Record<'general' | 'visuals' | 'material' | 'construction', boolean>;
    collapsedAttrGroups: ReadonlySet<string>;
    pinnedAttrGroups: ReadonlySet<string>;
    toggleAttrGroupPinned: (groupName: string) => void;
    toggleAttrGroupCollapsed: (groupName: string) => void;
    deferGroupSetAll: (ids: readonly string[], nextChecked: boolean) => void;
    isPhase1: boolean;
    allowMultiHandbook: boolean;
    patchColor: (u: {
      handbook?: { parameterId: string; displayLabel: string } | null;
      freeText?: string;
    }) => void;
    deferredAttrIds: ReadonlySet<string>;
    toggleDeferAttribute: (attributeId: string) => void;
    attrCommentsById: Record<string, Workshop2AttrComment[] | undefined>;
    openAttrComments: (attributeId: string) => void;
    onSetHandbookParametersWithColorBundleSync: (
      id: string,
      parts: { parameterId: string; displayLabel: string }[]
    ) => void;
    onSetHandbookParameters: (
      attributeId: string,
      parts: { parameterId: string; displayLabel: string }[]
    ) => void;
    onFreeTextSide: (attributeId: string, text: string) => void;
  };

/** renderPhaseRow + section rows shared bundle — единая orchestration zone (sectionBodies). */
export function useWorkshop2Phase1DossierSectionRowsOrchestration(
  input: UseWorkshop2Phase1DossierSectionRowsOrchestrationInput
): {
  renderPhaseRow: Workshop2DossierSectionRowsSharedBundle['renderPhaseRow'];
  workshop2DossierSectionRowsSharedProps: Workshop2DossierSectionRowsSharedBundle;
} {
  const {
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
    currentLeafL2Name,
    linkedMatComposition,
    linkedMatCompositionPhase2,
    linkedMatCompositionPhase3,
    matAttrDef,
    matAttrForLeaf,
    matRequiredUnset,
  } = input;

  const renderPhaseRow = useWorkshop2Phase1DossierRenderPhaseRow({
    applyMatRows,
    applyMatSoloParts,
    dossier,
    dossierAttrCardCtx,
    currentLeafL2Name,
    linkedMatComposition,
    linkedMatCompositionPhase2,
    linkedMatCompositionPhase3,
    matAttrDef,
    matAttrForLeaf,
    matRequiredUnset,
  });

  const workshop2DossierSectionRowsSharedProps = useWorkshop2Phase1DossierSectionRowsSharedBundle({
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
    renderPhaseRow,
  });

  return { renderPhaseRow, workshop2DossierSectionRowsSharedProps };
}
