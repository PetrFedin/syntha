/**
 * Material physical test logs → dossier PG mirror.
 */
import type { PhysicalTestLog } from '@/lib/types/material-testing';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

export function buildWorkshop2MaterialPhysicalTestLogsFromDossier(
  dossier: Workshop2DossierPhase1,
  opts?: { materialId?: string }
): PhysicalTestLog[] {
  const logs = dossier.materialPhysicalTestLogs ?? [];
  const materialId = opts?.materialId?.trim();
  if (!materialId) return logs;
  return logs.filter((row) => row.materialId === materialId);
}

export function buildWorkshop2MaterialPhysicalTestMirror(
  dossier: Workshop2DossierPhase1
): NonNullable<Workshop2DossierPhase1['materialPhysicalTestMirror']> {
  const logs = dossier.materialPhysicalTestLogs ?? [];
  const failedCount = logs.filter((l) => !l.isPass).length;
  const state = logs.length === 0 ? 'empty' : failedCount > 0 ? 'blocked' : 'ready';
  return {
    mirroredAt: new Date().toISOString(),
    logCount: logs.length,
    failedCount,
    state,
    hintRu:
      state === 'empty'
        ? 'Нет записей material testing — добавьте shrinkage/pilling/colorfastness.'
        : state === 'blocked'
          ? `${failedCount} тест(ов) не пройдено — обновите статусы.`
          : `${logs.length} тест(ов) в журнале.`,
  };
}

export function persistWorkshop2MaterialPhysicalTestMirrorToDossier(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    materialPhysicalTestMirror: buildWorkshop2MaterialPhysicalTestMirror(dossier),
  };
}

export function appendWorkshop2MaterialPhysicalTestLog(input: {
  dossier: Workshop2DossierPhase1;
  log: PhysicalTestLog;
}): Workshop2DossierPhase1 {
  const prev = [...(input.dossier.materialPhysicalTestLogs ?? [])];
  const idx = prev.findIndex((row) => row.id === input.log.id);
  if (idx >= 0) prev[idx] = input.log;
  else prev.push(input.log);
  return persistWorkshop2MaterialPhysicalTestMirrorToDossier({
    ...input.dossier,
    materialPhysicalTestLogs: prev,
  });
}
