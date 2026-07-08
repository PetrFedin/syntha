/**
 * Категории L1–L3 и аудитория для фильтров хаба W2 — только из фактических артикулов.
 */

import { findHandbookLeafById } from '@/lib/production/category-catalog';
import {
  loadWorkshop2Phase1DossierMap,
  workshop2Phase1DossierStorageKey,
} from '@/lib/production/workshop2-phase1-dossier-storage';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

export type Workshop2CategoryFacetRow = {
  audienceLabel?: string;
  categoryL1?: string;
  categoryL2?: string;
  categoryL3?: string;
  categoryLeafId?: string;
  id?: string;
};

function normalizeFacetLabel(value: string | undefined): string | null {
  const t = value?.trim();
  if (!t || t === '—') return null;
  return t;
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ru'));
}

/** Все L1, встречающиеся среди переданных артикулов. */
export function collectWorkshop2CategoryL1Options(
  rows: readonly Workshop2CategoryFacetRow[]
): string[] {
  const out: string[] = [];
  for (const row of rows) {
    const l1 = normalizeFacetLabel(row.categoryL1);
    if (l1) out.push(l1);
  }
  return sortedUnique(out);
}

/** L2: при выбранном L1 — только в этой ветке; иначе все L2 из артикулов. */
export function collectWorkshop2CategoryL2Options(
  rows: readonly Workshop2CategoryFacetRow[],
  selectedL1?: string
): string[] {
  const l1Pick = selectedL1?.trim() || '';
  const out: string[] = [];
  for (const row of rows) {
    const l1 = normalizeFacetLabel(row.categoryL1) ?? '';
    if (l1Pick && l1 !== l1Pick) continue;
    const l2 = normalizeFacetLabel(row.categoryL2);
    if (l2) out.push(l2);
  }
  return sortedUnique(out);
}

/** L3: каскад по L1/L2; без выбора — все L3 из артикулов. */
export function collectWorkshop2CategoryL3Options(
  rows: readonly Workshop2CategoryFacetRow[],
  selectedL1?: string,
  selectedL2?: string
): string[] {
  const l1Pick = selectedL1?.trim() || '';
  const l2Pick = selectedL2?.trim() || '';
  const out: string[] = [];
  for (const row of rows) {
    const l1 = normalizeFacetLabel(row.categoryL1) ?? '';
    const l2 = normalizeFacetLabel(row.categoryL2) ?? '';
    if (l1Pick && l1 !== l1Pick) continue;
    if (l2Pick && l2 !== l2Pick) continue;
    const l3 = normalizeFacetLabel(row.categoryL3);
    if (l3) out.push(l3);
  }
  return sortedUnique(out);
}

export function collectWorkshop2AudienceOptions(
  rows: readonly Workshop2CategoryFacetRow[]
): string[] {
  const out: string[] = [];
  for (const row of rows) {
    const aud = normalizeFacetLabel(row.audienceLabel);
    if (aud && aud.toLowerCase() !== 'каталог') out.push(aud);
  }
  return sortedUnique(out);
}

/** Синхронизирует L1–L3 с categoryLeafId строки или досье (после правок в карточке). */
export function enrichWorkshop2ArticleRowFacets<T extends Workshop2CategoryFacetRow>(
  collectionId: string,
  row: T,
  dossierMap?: Record<string, Workshop2DossierPhase1>
): T {
  const map = dossierMap ?? (typeof window !== 'undefined' ? loadWorkshop2Phase1DossierMap() : {});
  const articleId = row.id?.trim();
  const dossierLeaf =
    articleId && collectionId
      ? map[workshop2Phase1DossierStorageKey(collectionId, articleId)]?.categoryLeafId?.trim()
      : undefined;
  const rowLeaf = row.categoryLeafId?.trim();
  const effectiveId =
    dossierLeaf && findHandbookLeafById(dossierLeaf)
      ? dossierLeaf
      : rowLeaf && findHandbookLeafById(rowLeaf)
        ? rowLeaf
        : null;
  if (!effectiveId) return row;
  const leaf = findHandbookLeafById(effectiveId);
  if (!leaf) return row;
  if (
    row.categoryLeafId === leaf.leafId &&
    row.categoryL1 === leaf.l1Name &&
    row.categoryL2 === leaf.l2Name &&
    row.categoryL3 === leaf.l3Name &&
    row.audienceLabel === leaf.audienceName
  ) {
    return row;
  }
  return {
    ...row,
    categoryLeafId: leaf.leafId,
    audienceLabel: leaf.audienceName,
    categoryL1: leaf.l1Name,
    categoryL2: leaf.l2Name,
    categoryL3: leaf.l3Name,
  };
}

export function enrichWorkshop2ArticleRows<T extends Workshop2CategoryFacetRow>(
  collectionId: string,
  rows: readonly T[],
  dossierMap?: Record<string, Workshop2DossierPhase1>
): T[] {
  return rows.map((row) => enrichWorkshop2ArticleRowFacets(collectionId, row, dossierMap));
}

/** Фильтр по аудитории и L1–L3 (мультивыбор — OR внутри оси, AND между осями). */
export function articleMatchesWorkshop2CategoryFacets(
  row: Workshop2CategoryFacetRow,
  facets: {
    audience?: ReadonlySet<string>;
    l1?: ReadonlySet<string>;
    l2?: ReadonlySet<string>;
    l3?: ReadonlySet<string>;
  }
): boolean {
  const aud = normalizeFacetLabel(row.audienceLabel) ?? '';
  const l1 = normalizeFacetLabel(row.categoryL1) ?? '';
  const l2 = normalizeFacetLabel(row.categoryL2) ?? '';
  const l3 = normalizeFacetLabel(row.categoryL3) ?? '';
  if (facets.audience?.size && !facets.audience.has(aud)) return false;
  if (facets.l1?.size && !facets.l1.has(l1)) return false;
  if (facets.l2?.size && !facets.l2.has(l2)) return false;
  if (facets.l3?.size && !facets.l3.has(l3)) return false;
  return true;
}
