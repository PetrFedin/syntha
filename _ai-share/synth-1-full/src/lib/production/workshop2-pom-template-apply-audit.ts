/**
 * Аудит применения шаблона POM в досье (persist в PUT).
 */
import type {
  Workshop2DossierPhase1,
  Workshop2PomTemplateApplyRecord,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { mergeWorkshop2PomTemplateIntoDossier } from '@/lib/production/workshop2-pom-template-apply';
import type { Workshop2PomTemplateRow } from '@/lib/production/workshop2-reference-seeds';

function uid(): string {
  return `pom-apply-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function appendWorkshop2PomTemplateApplyWithAudit(input: {
  dossier: Workshop2DossierPhase1;
  categoryLeafId: string;
  template: Workshop2PomTemplateRow;
  mode?: 'replace' | 'merge';
  appliedBy?: string;
}): { dossier: Workshop2DossierPhase1; record: Workshop2PomTemplateApplyRecord } | null {
  const mode = input.mode ?? 'merge';
  const before = input.dossier.productionModel?.measurements?.length ?? 0;
  const next = mergeWorkshop2PomTemplateIntoDossier(input.dossier, input.template, mode);
  if (!next) return null;
  const after = next.productionModel?.measurements?.length ?? 0;
  const added = Math.max(0, after - before);
  const record: Workshop2PomTemplateApplyRecord = {
    id: uid(),
    appliedAt: new Date().toISOString(),
    categoryLeafId: input.categoryLeafId.trim(),
    mode,
    templateLabel: input.template.label || input.template.leafId,
    addedMeasurementCount: added,
    totalMeasurements: after,
  };
  const log = [record, ...(next.pomTemplateApplyLog ?? [])].slice(0, 40);
  return {
    dossier: {
      ...next,
      pomTemplateApplyLog: log,
      updatedAt: record.appliedAt,
      updatedBy: input.appliedBy?.slice(0, 200) || next.updatedBy,
    },
    record,
  };
}
