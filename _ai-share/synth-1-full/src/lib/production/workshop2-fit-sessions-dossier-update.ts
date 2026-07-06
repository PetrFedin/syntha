/**
 * Fit session CRUD → dossier.fitGoldSessions + mirror.
 */
import type { FitSession } from '@/lib/production/article-workspace/types';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { persistWorkshop2FitSessionsMirrorToDossier } from '@/lib/production/workshop2-fit-sessions-dossier-persist';

export function readWorkshop2FitGoldSessionsFromDossier(
  dossier: Workshop2DossierPhase1,
  articleId?: string
): FitSession[] {
  const rows = dossier.fitGoldSessions ?? [];
  const aid = articleId?.trim();
  if (!aid) {
    return rows.map((row) => ({
      id: row.id,
      sampleType: row.sampleType,
      status: row.status,
      dateStr: row.dateStr,
      measurementsDelta: row.measurementsDelta ?? {},
      comments: row.comments ?? [],
      cadVersionId: row.cadVersionId,
      photoVaultDocumentId: row.photoVaultDocumentId,
      aiFitAnalysis: row.aiFitAnalysis,
    }));
  }
  return rows
    .filter((row) => !row.articleId || row.articleId === aid)
    .map((row) => ({
      id: row.id,
      sampleType: row.sampleType,
      status: row.status,
      dateStr: row.dateStr,
      measurementsDelta: row.measurementsDelta ?? {},
      comments: row.comments ?? [],
      cadVersionId: row.cadVersionId,
      photoVaultDocumentId: row.photoVaultDocumentId,
      aiFitAnalysis: row.aiFitAnalysis,
    }));
}

export function upsertWorkshop2FitGoldSessionOnDossier(input: {
  dossier: Workshop2DossierPhase1;
  articleId: string;
  session: FitSession;
}): Workshop2DossierPhase1 {
  const prev = [...(input.dossier.fitGoldSessions ?? [])];
  const stored = {
    ...input.session,
    articleId: input.articleId,
    createdAt: new Date().toISOString(),
  };
  const idx = prev.findIndex((row) => row.id === stored.id);
  if (idx >= 0) prev[idx] = stored;
  else prev.push(stored);
  const sessions = readWorkshop2FitGoldSessionsFromDossier(
    { ...input.dossier, fitGoldSessions: prev },
    input.articleId
  );
  return persistWorkshop2FitSessionsMirrorToDossier(
    { ...input.dossier, fitGoldSessions: prev },
    sessions
  );
}
