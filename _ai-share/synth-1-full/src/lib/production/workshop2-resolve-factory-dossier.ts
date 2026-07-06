import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { WORKSHOP2_SYSTEM_COLLECTION_ID } from '@/lib/production/local-collection-inventory';
import {
  PLATFORM_CORE_DEMO_PRESETS,
  getPlatformCoreDemoByArticleId,
} from '@/lib/platform-core-hub-matrix';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export type FactoryDossierResolveSource = 'postgres' | 'localStorage';

export type FactoryDossierResolveResult = {
  dossier: Workshop2DossierPhase1;
  source: FactoryDossierResolveSource;
  collectionId: string;
  readOnly: true;
};

export function buildFactoryDossierCollectionCandidates(articleId: string): string[] {
  const demoCollectionIds = Object.values(PLATFORM_CORE_DEMO_PRESETS).map((p) => p.collectionId);
  const preferred = getPlatformCoreDemoByArticleId(articleId).collectionId;
  return [preferred, WORKSHOP2_SYSTEM_COLLECTION_ID, ...demoCollectionIds].filter(
    (id, idx, arr) => Boolean(id) && arr.indexOf(id) === idx
  );
}

function dedupeCollectionCandidates(articleId: string, preferredCollectionId?: string): string[] {
  const base = buildFactoryDossierCollectionCandidates(articleId);
  const preferred = preferredCollectionId?.trim();
  if (!preferred) return base;
  return [preferred, ...base.filter((id) => id !== preferred)];
}

/**
 * Factory portal dossier resolve with honest source metadata.
 * Platform Core: PG-only (fail-closed, no localStorage fallback).
 * Legacy dev: localStorage first, then PG.
 */
export async function resolveFactoryDossierWithMeta(
  articleId: string,
  options?: { collectionId?: string }
): Promise<FactoryDossierResolveResult | null> {
  const candidates = dedupeCollectionCandidates(articleId, options?.collectionId);
  const pgFirst = isPlatformCoreMode();

  for (const collectionId of candidates) {
    if (pgFirst) {
      const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
      if (record?.dossier) {
        return { dossier: record.dossier, source: 'postgres', collectionId, readOnly: true };
      }
      continue;
    }
    const local = getWorkshop2Phase1Dossier(collectionId, articleId);
    if (local) {
      return { dossier: local, source: 'localStorage', collectionId, readOnly: true };
    }
    const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
    if (record?.dossier) {
      return { dossier: record.dossier, source: 'postgres', collectionId, readOnly: true };
    }
  }
  return null;
}

export async function resolveFactoryDossier(
  articleId: string,
  options?: { collectionId?: string }
): Promise<Workshop2DossierPhase1 | null> {
  const resolved = await resolveFactoryDossierWithMeta(articleId, options);
  return resolved?.dossier ?? null;
}
