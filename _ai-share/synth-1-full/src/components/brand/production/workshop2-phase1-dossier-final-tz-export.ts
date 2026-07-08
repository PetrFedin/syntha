import type { HandbookCategoryLeaf } from '@/lib/production/category-handbook-leaves';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  buildWorkshop2FinalTzSpecDocumentHtml,
  type Workshop2FinalTzSpecExportContext,
} from '@/lib/production/workshop2-final-tz-spec-export';
import type { WorkshopTzReadinessPhase } from '@/lib/production/workshop2-tz-section-readiness';

type FactorySendHubPreview = {
  firstUnmet: unknown;
  lastHandoff?: {
    brandDispatchedAt?: string;
    factoryReceivedAt?: string;
  } | null;
};

export type BuildWorkshop2Phase1DossierFinalTzExportContextInput = {
  skuDraft: string;
  nameDraft: string;
  currentLeaf: HandbookCategoryLeaf;
  currentPhase: WorkshopTzReadinessPhase;
  preflightOk: boolean;
  preflightIssueCount: number;
  sectionSignoffsFull: number;
  gateLifecycleState: string;
  exportLanguage: 'ru' | 'ru_en' | 'ru_zh';
};

export function buildWorkshop2Phase1DossierFinalTzExportContext(
  input: BuildWorkshop2Phase1DossierFinalTzExportContextInput
): Workshop2FinalTzSpecExportContext {
  return {
    articleSku: input.skuDraft,
    articleName: input.nameDraft,
    pathLabel: input.currentLeaf.pathLabel,
    l2Name: input.currentLeaf.l2Name,
    tzPhase: input.currentPhase,
    categoryLeafId: input.currentLeaf.leafId,
    measurementsLeaf: input.currentLeaf,
    preflightOk: input.preflightOk,
    preflightIssueCount: input.preflightIssueCount,
    sectionSignoffsFull: input.sectionSignoffsFull,
    gateLifecycleState: input.gateLifecycleState,
    exportLanguage: input.exportLanguage,
  };
}

export type BuildWorkshop2Phase1DossierFinalTzAssignmentChainInput = {
  dossier: Workshop2DossierPhase1;
  skuDraft: string;
  nameDraft: string;
  pathLabel: string;
  preflightOk: boolean;
  factorySendHubPreview: FactorySendHubPreview;
};

export function buildWorkshop2Phase1DossierFinalTzAssignmentChain({
  dossier,
  skuDraft,
  nameDraft,
  pathLabel,
  preflightOk,
  factorySendHubPreview,
}: BuildWorkshop2Phase1DossierFinalTzAssignmentChainInput) {
  const lastExport = dossier.finalTzDocumentLastExport;
  const dossierUpdatedAt = dossier.updatedAt ?? '';
  const checklistReady = preflightOk && !factorySendHubPreview.firstUnmet;
  const docCurrent =
    lastExport != null &&
    lastExport.dossierUpdatedAtSnapshot === dossierUpdatedAt &&
    lastExport.articleSkuSnapshot === skuDraft.trim() &&
    lastExport.articleNameSnapshot === nameDraft.trim() &&
    lastExport.pathLabelSnapshot === pathLabel;
  const handoff = factorySendHubPreview.lastHandoff;
  const handoffClosed = Boolean(handoff?.brandDispatchedAt && handoff?.factoryReceivedAt);
  return {
    checklistReady,
    lastExport: Boolean(lastExport),
    docCurrent,
    handoffClosed,
  };
}

export function buildWorkshop2Phase1DossierLastProductionExportBadge(
  productionTzLastExport: Workshop2DossierPhase1['productionTzLastExport']
) {
  const last = productionTzLastExport;
  if (!last) return null;
  let at = last.exportedAt;
  try {
    at = new Date(last.exportedAt).toLocaleString('ru-RU');
  } catch {
    /* noop */
  }
  return {
    statusLabel: last.status === 'ready_for_factory' ? 'Готово к передаче' : 'Черновик',
    statusClass:
      last.status === 'ready_for_factory'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border-amber-200 bg-amber-50 text-amber-900',
    score: last.score,
    blockers: last.blockersCount,
    warnings: last.warningsCount,
    at,
  };
}

export function buildWorkshop2Phase1DossierFinalTzSpecDocumentHtml(
  dossier: Workshop2DossierPhase1,
  exportContext: Workshop2FinalTzSpecExportContext
): string {
  return buildWorkshop2FinalTzSpecDocumentHtml(dossier, exportContext);
}

export function estimateWorkshop2Phase1DossierJsonUtf8Bytes(
  dossier: Workshop2DossierPhase1
): number {
  try {
    return new Blob([JSON.stringify(dossier)]).size;
  } catch {
    return 0;
  }
}
