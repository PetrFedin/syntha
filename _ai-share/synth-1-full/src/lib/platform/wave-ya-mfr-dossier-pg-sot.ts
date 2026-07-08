/**
 * Wave YA — mfr factory dossier: PG SoT in core (no localStorage priority) + honest source badges.
 */
import { brandDossierFactoryDiffViewerHref } from '@/lib/production/mfr-dossier-comments-wave-xn';
import type { FactoryDossierResolveSource } from '@/lib/production/workshop2-resolve-factory-dossier';

export const WAVE_YA_MFR_DOSSIER_PG_SOT_MIGRATION = '069_wave_ya_mfr_dossier_pg_sot' as const;

export const WAVE_YA_MFR_DOSSIER_SOURCE_STRIP_TESTID = 'mfr-dev-dossier-source-strip' as const;
export const WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID =
  'mfr-dev-dossier-source-pg-badge' as const;
export const WAVE_YA_MFR_DOSSIER_SOURCE_LS_BADGE_TESTID =
  'mfr-dev-dossier-source-ls-badge' as const;
export const WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_TESTID =
  'mfr-dev-dossier-read-only-badge' as const;
export const WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LINK_TESTID =
  'mfr-dev-dossier-brand-diff-peer-link' as const;

export const WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU = 'Источник · PostgreSQL' as const;
export const WAVE_YA_MFR_DOSSIER_SOURCE_LS_BADGE_RU = 'Источник · localStorage (legacy)' as const;
export const WAVE_YA_MFR_DOSSIER_READ_ONLY_BADGE_RU = 'ТЗ read-only' as const;
export const WAVE_YA_MFR_DOSSIER_BRAND_DIFF_PEER_LABEL_RU = 'Сверка ТЗ бренд ↔ цех' as const;

export function buildMfrDevDossierBrandDiffPeerHref(
  collectionId: string,
  articleId: string
): string {
  return brandDossierFactoryDiffViewerHref(collectionId, articleId);
}

export function labelMfrDossierSourceBadgeRu(source: FactoryDossierResolveSource): string {
  return source === 'postgres'
    ? WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_RU
    : WAVE_YA_MFR_DOSSIER_SOURCE_LS_BADGE_RU;
}

export function mfrDossierSourceBadgeTestId(source: FactoryDossierResolveSource): string {
  return source === 'postgres'
    ? WAVE_YA_MFR_DOSSIER_SOURCE_PG_BADGE_TESTID
    : WAVE_YA_MFR_DOSSIER_SOURCE_LS_BADGE_TESTID;
}
