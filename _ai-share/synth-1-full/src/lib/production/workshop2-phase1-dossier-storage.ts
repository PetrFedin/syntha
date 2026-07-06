/**
 * Досье фазы 1 в localStorage: один объект на пару (collectionId, articleId).
 * Ключ хранилища фиксирован; внутри — map storageKey → Workshop2DossierPhase1.
 */
import type {
  Workshop2DossierPhase1,
  Workshop2PassportProductionBrief,
} from './workshop2-dossier-phase1.types';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export const WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY = 'synth.brand.workshop2Phase1Dossier.v1';

const STORAGE_KEY = WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY;

export type Workshop2Phase1DossierMap = Record<string, Workshop2DossierPhase1>;

function safeSegment(id: string): string {
  return id.replace(/:/g, '_');
}

/** Стабильный ключ записи в map (не URI — только для объекта в JSON). */
export function workshop2Phase1DossierStorageKey(collectionId: string, articleId: string): string {
  return `${safeSegment(collectionId)}::${safeSegment(articleId)}`;
}

export function emptyWorkshop2DossierPhase1(): Workshop2DossierPhase1 {
  return { schemaVersion: 1, assignments: [] };
}

export function loadWorkshop2Phase1DossierMap(): Workshop2Phase1DossierMap {
  if (typeof window === 'undefined') return {};
  if (!shouldUseLocalStorageClientFallbackInCore()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Workshop2Phase1DossierMap;
  } catch {
    return {};
  }
}

/** @returns false при переполнении quota / приватном режиме */
export function saveWorkshop2Phase1DossierMap(map: Workshop2Phase1DossierMap): boolean {
  if (typeof window === 'undefined') return true;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

export function getWorkshop2Phase1Dossier(
  collectionId: string,
  articleId: string
): Workshop2DossierPhase1 | undefined {
  const key = workshop2Phase1DossierStorageKey(collectionId, articleId);
  return loadWorkshop2Phase1DossierMap()[key];
}

/** @returns false если запись в localStorage не удалась (quota и т.п.) */
export function setWorkshop2Phase1Dossier(
  collectionId: string,
  articleId: string,
  dossier: Workshop2DossierPhase1
): boolean {
  const key = workshop2Phase1DossierStorageKey(collectionId, articleId);
  const map = loadWorkshop2Phase1DossierMap();
  map[key] = dossier;
  return saveWorkshop2Phase1DossierMap(map);
}

export function removeWorkshop2Phase1Dossier(collectionId: string, articleId: string): void {
  const key = workshop2Phase1DossierStorageKey(collectionId, articleId);
  const map = loadWorkshop2Phase1DossierMap();
  if (!(key in map)) return;
  delete map[key];
  saveWorkshop2Phase1DossierMap(map);
}

const DEFAULT_PASSPORT_MOQ_MAX_PIECES = 1;

/** Эффективный лимит образцов для UI и табеля мерок (минимум 1). */
export function effectiveMoqTargetMaxPieces(
  brief: Workshop2PassportProductionBrief | undefined
): number {
  const raw = brief?.moqTargetMaxPieces;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 1) {
    return Math.floor(raw);
  }
  return DEFAULT_PASSPORT_MOQ_MAX_PIECES;
}

/** При загрузке из localStorage подставляет дефолт MOQ, если поле не задано. */
export function withWorkshop2PassportMoqDefaultApplied(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  const brief = dossier.passportProductionBrief;
  if (brief?.moqTargetMaxPieces != null) return dossier;
  return {
    ...dossier,
    passportProductionBrief: {
      ...(brief ?? {}),
      moqTargetMaxPieces: DEFAULT_PASSPORT_MOQ_MAX_PIECES,
    },
  };
}

/** Оценка размера JSON досье в UTF-8 байтах (dev banner / persist guard). */
export function estimateWorkshop2Phase1DossierJsonUtf8Bytes(
  dossier: Workshop2DossierPhase1
): number {
  return new TextEncoder().encode(JSON.stringify(dossier)).length;
}
