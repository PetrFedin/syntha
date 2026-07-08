'use client';

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { HandbookCheckSnapshot } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-check-snapshot';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isPlatformCoreGoldenCollectionId } from '@/lib/platform-core-demo-context';
import { shouldPersistPhase1DossierOfflineDualWrite } from '@/lib/production/workshop2-pg-read-path-policy';
import { loadWorkshop2DossierFromApi } from '@/lib/production/workshop2-api-client';
import {
  emptyWorkshop2DossierPhase1,
  getWorkshop2Phase1Dossier,
  setWorkshop2Phase1Dossier,
  withWorkshop2PassportMoqDefaultApplied,
} from '@/lib/production/workshop2-phase1-dossier-storage';
import { setWorkshop2ServerDossierVersion } from '@/lib/production/workshop2-dossier-version-sync';
import { isSs27MenCoatFullTzDemoArticle } from '@/lib/production/workshop2-ss27-demo-full-tz-dossier';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

function normalizeHydratedDossier(
  raw: Workshop2DossierPhase1,
  collectionId: string,
  articleId: string,
  articleSku: string,
  tzWriteDisabled: boolean
): Workshop2DossierPhase1 {
  let normalized = withWorkshop2PassportMoqDefaultApplied(raw);
  if (
    isSs27MenCoatFullTzDemoArticle(collectionId, { id: articleId, sku: articleSku }) &&
    normalized.passportProductionBrief?.moqTargetMaxPieces === 120
  ) {
    normalized = {
      ...normalized,
      passportProductionBrief: {
        ...(normalized.passportProductionBrief ?? {}),
        moqTargetMaxPieces: 1,
      },
    };
  }
  const moqPatched =
    normalized.passportProductionBrief?.moqTargetMaxPieces !==
    raw.passportProductionBrief?.moqTargetMaxPieces;
  if (moqPatched && !tzWriteDisabled && shouldPersistPhase1DossierOfflineDualWrite()) {
    setWorkshop2Phase1Dossier(collectionId, articleId, normalized);
  }
  return normalized;
}

/** Загрузка фазы 1: в Platform Core golden — API-first; иначе localStorage. */
export function useWorkshop2Phase1DossierHydrateFromStorage(p: {
  collectionId: string;
  articleId: string;
  articleSku: string;
  dossierHydrateKey: number;
  tzWriteDisabled: boolean;
  setDossierInternal: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  lastPersistedDossierRef: MutableRefObject<Workshop2DossierPhase1 | null>;
  setHandbookCheckSnapshot: Dispatch<SetStateAction<HandbookCheckSnapshot | null>>;
}) {
  const {
    collectionId,
    articleId,
    articleSku,
    dossierHydrateKey,
    tzWriteDisabled,
    setDossierInternal,
    lastPersistedDossierRef,
    setHandbookCheckSnapshot,
  } = p;

  useEffect(() => {
    let cancelled = false;
    const coreGolden = isPlatformCoreMode() && isPlatformCoreGoldenCollectionId(collectionId);

    void (async () => {
      if (coreGolden) {
        const loaded = await loadWorkshop2DossierFromApi(collectionId, articleId);
        if (cancelled) return;
        if (loaded.ok) {
          setWorkshop2ServerDossierVersion(loaded.data.version);
          const normalized = normalizeHydratedDossier(
            loaded.data.dossier,
            collectionId,
            articleId,
            articleSku,
            tzWriteDisabled
          );
          if (!tzWriteDisabled && shouldPersistPhase1DossierOfflineDualWrite()) {
            setWorkshop2Phase1Dossier(collectionId, articleId, normalized);
          }
          setDossierInternal(normalized);
          lastPersistedDossierRef.current = normalized;
          setHandbookCheckSnapshot(null);
          return;
        }
        const empty = emptyWorkshop2DossierPhase1();
        setDossierInternal(empty);
        lastPersistedDossierRef.current = empty;
        setHandbookCheckSnapshot(null);
        return;
      }

      const raw =
        getWorkshop2Phase1Dossier(collectionId, articleId) ?? emptyWorkshop2DossierPhase1();
      const normalized = normalizeHydratedDossier(
        raw,
        collectionId,
        articleId,
        articleSku,
        tzWriteDisabled
      );
      setDossierInternal(normalized);
      lastPersistedDossierRef.current = normalized;
      setHandbookCheckSnapshot(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [articleSku, collectionId, articleId, dossierHydrateKey, tzWriteDisabled]);
}
