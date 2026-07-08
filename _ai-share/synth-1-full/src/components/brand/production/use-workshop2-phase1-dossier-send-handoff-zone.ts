'use client';

import { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useWorkshop2Phase1DossierSendHandoffBundles } from '@/components/brand/production/use-workshop2-phase1-dossier-send-handoff-bundles';
import type {
  BuildWorkshop2AssignmentHandoffBundleInput,
  BuildWorkshop2AssignmentSendPanelBundleInput,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-body-bundles';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2TzSignoffSectionKey } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffCommitOnServerFn } from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-body-bundles';

export type UseWorkshop2Phase1DossierSendHandoffZoneInput = {
  activeSection: Workshop2TzSignoffSectionKey;
  setActiveSection: (id: Workshop2TzSignoffSectionKey) => void;
  onOpenFinalTzWizard: () => void;
  setAttrCommentOnlyOpen: (v: boolean) => void;
  openAttrComments: (anchorId: string) => void;
  assignmentChain: BuildWorkshop2AssignmentSendPanelBundleInput['assignmentChain'];
  assignmentSendChecklistDetailsRef: BuildWorkshop2AssignmentSendPanelBundleInput['assignmentSendChecklistDetailsRef'];
  tzWriteDisabled: boolean;
  lastProductionExportBadge: BuildWorkshop2AssignmentSendPanelBundleInput['lastProductionExportBadge'];
  factorySendHubPreview: BuildWorkshop2AssignmentSendPanelBundleInput['factorySendHubPreview'];
  factorySendSketchPinReadiness: BuildWorkshop2AssignmentSendPanelBundleInput['factorySendSketchPinReadiness'];
  tzPreflight: BuildWorkshop2AssignmentSendPanelBundleInput['tzPreflight'];
  productionPreflight: BuildWorkshop2AssignmentSendPanelBundleInput['productionPreflight'];
  tzTraceRows: BuildWorkshop2AssignmentSendPanelBundleInput['tzTraceRows'];
  jumpToSketchLineRefs: () => void;
  jumpToTzSectionAnchor: BuildWorkshop2AssignmentSendPanelBundleInput['jumpToTzSectionAnchor'];
  sketchPinLinkAudit: BuildWorkshop2AssignmentSendPanelBundleInput['sketchPinLinkAudit'];
  onSketchPinFocus: BuildWorkshop2AssignmentSendPanelBundleInput['onSketchPinFocus'];
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  appendTzPulse: BuildWorkshop2AssignmentHandoffBundleInput['appendTzPulse'];
  updatedByLabel: string;
  fourTzLevelsFullySignedByAll: boolean;
  handoffBlockedByProduction: boolean;
  productionPreflightBlockerCount: number;
  commitHandoffOnServer?: Workshop2HandoffCommitOnServerFn;
};

/** Send/handoff input bundles + keyboard nav zone (sectionBodies assignment). */
export function useWorkshop2Phase1DossierSendHandoffZone(
  input: UseWorkshop2Phase1DossierSendHandoffZoneInput
) {
  const sendInput = useMemo(
    (): BuildWorkshop2AssignmentSendPanelBundleInput => ({
      assignmentChain: input.assignmentChain,
      assignmentSendChecklistDetailsRef: input.assignmentSendChecklistDetailsRef,
      tzWriteDisabled: input.tzWriteDisabled,
      onOpenFinalTzWizard: input.onOpenFinalTzWizard,
      lastProductionExportBadge: input.lastProductionExportBadge,
      factorySendHubPreview: input.factorySendHubPreview,
      factorySendSketchPinReadiness: input.factorySendSketchPinReadiness,
      tzPreflight: input.tzPreflight,
      productionPreflight: input.productionPreflight,
      tzTraceRows: input.tzTraceRows,
      jumpToSketchLineRefs: input.jumpToSketchLineRefs,
      jumpToTzSectionAnchor: input.jumpToTzSectionAnchor,
      sketchPinLinkAudit: input.sketchPinLinkAudit,
      onSketchPinFocus: input.onSketchPinFocus,
      dossier: input.dossier,
      setDossier: input.setDossier,
    }),
    [
      input.assignmentChain,
      input.assignmentSendChecklistDetailsRef,
      input.tzWriteDisabled,
      input.onOpenFinalTzWizard,
      input.lastProductionExportBadge,
      input.factorySendHubPreview,
      input.factorySendSketchPinReadiness,
      input.tzPreflight,
      input.productionPreflight,
      input.tzTraceRows,
      input.jumpToSketchLineRefs,
      input.jumpToTzSectionAnchor,
      input.sketchPinLinkAudit,
      input.onSketchPinFocus,
      input.dossier,
      input.setDossier,
    ]
  );

  const handoffInput = useMemo(
    (): BuildWorkshop2AssignmentHandoffBundleInput => ({
      dossier: input.dossier,
      setDossier: input.setDossier,
      appendTzPulse: input.appendTzPulse,
      updatedByLabel: input.updatedByLabel,
      tzWriteDisabled: input.tzWriteDisabled,
      fourTzLevelsFullySignedByAll: input.fourTzLevelsFullySignedByAll,
      handoffBlockedByProduction: input.handoffBlockedByProduction,
      productionPreflightBlockerCount: input.productionPreflightBlockerCount,
      commitHandoffOnServer: input.commitHandoffOnServer,
    }),
    [
      input.dossier,
      input.setDossier,
      input.appendTzPulse,
      input.updatedByLabel,
      input.tzWriteDisabled,
      input.fourTzLevelsFullySignedByAll,
      input.handoffBlockedByProduction,
      input.productionPreflightBlockerCount,
      input.commitHandoffOnServer,
    ]
  );

  const openNextBlocker = useMemo(
    () => ({
      factorySendHubPreview: input.factorySendHubPreview,
      tzPreflight: input.tzPreflight,
      jumpToSketchLineRefs: input.jumpToSketchLineRefs,
      jumpToTzSectionAnchor: input.jumpToTzSectionAnchor,
      setAttrCommentOnlyOpen: input.setAttrCommentOnlyOpen,
      openAttrComments: input.openAttrComments,
    }),
    [
      input.factorySendHubPreview,
      input.tzPreflight,
      input.jumpToSketchLineRefs,
      input.jumpToTzSectionAnchor,
      input.setAttrCommentOnlyOpen,
      input.openAttrComments,
    ]
  );

  return useWorkshop2Phase1DossierSendHandoffBundles({
    activeSection: input.activeSection,
    setActiveSection: input.setActiveSection,
    sendInput,
    handoffInput,
    openNextBlocker,
  });
}
