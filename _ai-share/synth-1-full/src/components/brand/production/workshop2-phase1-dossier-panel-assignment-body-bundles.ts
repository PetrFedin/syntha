import type { ComponentProps, Dispatch, SetStateAction } from 'react';
import { Workshop2DossierAssignmentSendPanel } from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-send-panel';
import { Workshop2TechPackHandoffBlock } from '@/components/brand/production/Workshop2TechPackHandoffBlock';
import { W2_CONSTRUCTION_SUBPAGE_ANCHORS } from '@/lib/production/workshop2-construction-dossier-anchors';
import type {
  Workshop2DossierPhase1,
  Workshop2FactoryHandoffChannel,
  Workshop2TzActionLogPayload,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';

export type Workshop2AssignmentSendPanelBundle = Omit<
  ComponentProps<typeof Workshop2DossierAssignmentSendPanel>,
  'children'
>;

export type Workshop2AssignmentHandoffBundle = ComponentProps<
  typeof Workshop2TechPackHandoffBlock
> & {
  techPackReady?: boolean;
};

export type Workshop2HandoffCommitOnServerFn = (payload: {
  revisionLabel: string;
  windowNote?: string;
  contactLabel?: string;
  channel: Workshop2FactoryHandoffChannel;
  attachmentIds: string[];
  brandDispatched: { at: string; by: string };
  factoryReceived: { at: string; by: string };
}) => Promise<boolean>;

type AssignmentHubPreview = Workshop2AssignmentSendPanelBundle['factorySendHubPreview'];
export type BuildWorkshop2AssignmentSendPanelBundleInput = {
  assignmentChain: Workshop2AssignmentSendPanelBundle['assignmentChain'];
  assignmentSendChecklistDetailsRef: Workshop2AssignmentSendPanelBundle['assignmentSendChecklistDetailsRef'];
  tzWriteDisabled: boolean;
  onOpenFinalTzWizard: () => void;
  lastProductionExportBadge: Workshop2AssignmentSendPanelBundle['lastProductionExportBadge'];
  factorySendHubPreview: Omit<AssignmentHubPreview, 'lastHandoff'> & {
    lastHandoff?: AssignmentHubPreview['lastHandoff'];
  };
  factorySendSketchPinReadiness: Workshop2AssignmentSendPanelBundle['factorySendSketchPinReadiness'];
  tzPreflight: Workshop2AssignmentSendPanelBundle['tzPreflight'];
  productionPreflight: Workshop2AssignmentSendPanelBundle['productionPreflight'];
  tzTraceRows: Workshop2AssignmentSendPanelBundle['tzTraceRows'];
  jumpToSketchLineRefs: () => void;
  jumpToTzSectionAnchor: (section: Workshop2TzSignoffSectionKey, anchorId: string) => void;
  sketchPinLinkAudit: Workshop2AssignmentSendPanelBundle['sketchPinLinkAudit'];
  onSketchPinFocus: Workshop2AssignmentSendPanelBundle['onSketchPinFocus'];
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
};

/** Пропсы панели отправки в цех — вынесены из JSX панели досье для читаемости и повторного использования. */
export function buildWorkshop2AssignmentSendPanelBundle(
  input: BuildWorkshop2AssignmentSendPanelBundleInput
): Workshop2AssignmentSendPanelBundle {
  const hub = input.factorySendHubPreview;
  return {
    assignmentChain: input.assignmentChain,
    assignmentSendChecklistDetailsRef: input.assignmentSendChecklistDetailsRef,
    tzWriteDisabled: input.tzWriteDisabled,
    onOpenFinalTzWizard: input.onOpenFinalTzWizard,
    lastProductionExportBadge: input.lastProductionExportBadge,
    factorySendHubPreview: {
      sectionSignoffsFull: hub.sectionSignoffsFull,
      blockers: hub.blockers,
      sketchReady: hub.sketchReady,
      techPackCount: hub.techPackCount,
      techPackWithBytes: hub.techPackWithBytes,
      lastHandoff: hub.lastHandoff ?? null,
      openCriticalCommentsCount: hub.openCriticalCommentsCount,
      firstUnmet: hub.firstUnmet,
    },
    factorySendSketchPinReadiness: input.factorySendSketchPinReadiness,
    tzPreflight: input.tzPreflight,
    productionPreflight: input.productionPreflight,
    tzTraceRows: input.tzTraceRows,
    jumpToSketchLineRefs: input.jumpToSketchLineRefs,
    onJumpToCadZip: () =>
      input.jumpToTzSectionAnchor('construction', W2_CONSTRUCTION_SUBPAGE_ANCHORS.patternFiles),
    sketchPinLinkAudit: input.sketchPinLinkAudit,
    onSketchPinFocus: input.onSketchPinFocus,
    collaborationMergeNote: input.dossier.collaborationMergeNote ?? '',
    onCollaborationMergeNoteChange: (next) =>
      input.setDossier((p: Workshop2DossierPhase1) => ({
        ...p,
        collaborationMergeNote: next,
      })),
    includeCompositionLabelInFactoryAssignment: Boolean(
      input.dossier.compositionLabelSpec?.includeInFactoryAssignment
    ),
  };
}

export type BuildWorkshop2AssignmentHandoffBundleInput = {
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  appendTzPulse: (action: Workshop2TzActionLogPayload) => void;
  updatedByLabel: string;
  tzWriteDisabled: boolean;
  fourTzLevelsFullySignedByAll: boolean;
  handoffBlockedByProduction: boolean;
  productionPreflightBlockerCount: number;
  commitHandoffOnServer?: Workshop2HandoffCommitOnServerFn;
};

/** Пропсы блока handoff внутри вкладки «Задание». */
export function buildWorkshop2AssignmentHandoffBundle(
  input: BuildWorkshop2AssignmentHandoffBundleInput
): Workshop2AssignmentHandoffBundle {
  return {
    handoffs: input.dossier.techPackFactoryHandoffs,
    attachments: input.dossier.techPackAttachments ?? [],
    onChangeHandoffs: (next) =>
      input.setDossier((p: Workshop2DossierPhase1) => ({
        ...p,
        techPackFactoryHandoffs: next,
      })),
    onPulse: input.appendTzPulse,
    updatedByLabel: input.updatedByLabel,
    tzWriteDisabled: input.tzWriteDisabled,
    handoffMarksUnlocked: input.fourTzLevelsFullySignedByAll && !input.handoffBlockedByProduction,
    handoffLockReason: input.handoffBlockedByProduction
      ? `Передача в handoff заблокирована: ${input.productionPreflightBlockerCount} blocker(ов) production pre-flight. Сначала закройте блокеры в «Материалы/Конструкция».`
      : null,
    techPackReady: input.fourTzLevelsFullySignedByAll,
    commitHandoffOnServer: input.commitHandoffOnServer,
  };
}
