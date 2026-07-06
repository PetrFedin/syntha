import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import type { BrandDossierFactoryDiffRow } from '@/lib/fashion/brand-dossier-factory-diff-stub';
import { buildBrandDossierDiffAttachTzPoCrossLinks } from '@/lib/platform/wave-xq-brand-dossier-dual-write-off';
import { BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR } from '@/lib/production/mfr-dossier-comments-wave-xn';

/**
 * Wave YL — brand dossier inline diff vs factory side-by-side viewer polish.
 * Compact RU mode, locked badge ↔ attach TZ cross-links, dedupe UN/VQ duplicate strips.
 */

export const WAVE_YL_BRAND_DOSSIER_DIFF_COMPACT_PANEL_TESTID =
  'brand-dossier-factory-diff-panel-compact';

export const WAVE_YL_BRAND_OP_DOSSIER_LOCKED_CROSS_STRIP_TESTID =
  'brand-op-dossier-locked-cross-strip';

export const WAVE_YL_BRAND_OP_DOSSIER_LOCKED_DIFF_LINK_TESTID =
  'brand-op-dossier-locked-diff-link';

export const WAVE_YL_BRAND_OP_DOSSIER_LOCKED_ATTACH_TZ_LINK_TESTID =
  'brand-op-dossier-locked-attach-tz-link';

export const WAVE_YL_DIFF_READ_ONLY_BADGE_RU = 'Сверка';
export const WAVE_YL_DIFF_LOADING_RU = 'Загрузка…';
export const WAVE_YL_DIFF_STUB_RU = 'демо';
export const WAVE_YL_DIFF_LIVE_RU = 'В эфире';
export const WAVE_YL_DIFF_BRAND_COL_RU = 'Бренд';
export const WAVE_YL_DIFF_FACTORY_COL_RU = 'Цех';
export const WAVE_YL_DIFF_MATCH_RU = 'Совпадает';
export const WAVE_YL_DIFF_LOCKED_DIFF_LINK_RU = 'Сверка ТЗ ↔ цех';
export const WAVE_YL_DIFF_LOCKED_ATTACH_TZ_RU = 'ТЗ → PO';

export type BrandDossierDiffViewerContext = 'brand-dev' | 'brand-op';

export function summarizeBrandDossierFactoryDiffCompactRu(
  rows: readonly BrandDossierFactoryDiffRow[]
): string {
  const mismatches = rows.filter((r) => !r.matched).length;
  if (mismatches === 0) {
    return `${rows.length} полей · OK`;
  }
  return `${mismatches} ≠ из ${rows.length}`;
}

export function brandDossierFactoryDiffMismatchBadgeCompactRu(mismatchCount: number): string {
  return mismatchCount > 0 ? `${mismatchCount} ≠` : WAVE_YL_DIFF_MATCH_RU;
}

/** Wave UN/VQ attach TZ cross-strip lives on W2 dev; on brand OP — PDF peer strip + locked badge peers. */
export function shouldOmitBrandDossierDiffAttachTzCrossStrip(
  context: BrandDossierDiffViewerContext
): boolean {
  return context === 'brand-op';
}

/** Inline diff summary on dossier card duplicates side-by-side panel on brand OP. */
export function shouldOmitBrandOpDossierInlineDiffSummary(
  context: BrandDossierDiffViewerContext
): boolean {
  return context === 'brand-op';
}

/** Legacy compact strip from wave TO — superseded by inline panel (wave UN+). */
export function shouldMountBrandDossierFactoryDiffLegacyStrip(): boolean {
  return false;
}

export type BrandOpDossierLockedBadgeCrossLinks = {
  diffViewerHref: string;
  attachTzPoHref: string;
  attachTzPdfPeerHref: string;
  diffViewerAnchor: typeof BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR;
};

export function buildBrandOpDossierLockedBadgeCrossLinks(input: {
  collectionId: string;
  articleId: string;
  orderId: string;
  productionOrderId?: string;
  factoryId?: string;
}): BrandOpDossierLockedBadgeCrossLinks {
  const crossLinks = buildBrandDossierDiffAttachTzPoCrossLinks(input);
  const session = buildBrandOpAttachTzPoSession(input);
  return {
    diffViewerHref: crossLinks.diffViewerHref,
    attachTzPoHref: session.attachTzPoHref,
    attachTzPdfPeerHref: session.attachTzPdfPeerHref,
    diffViewerAnchor: BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR,
  };
}
