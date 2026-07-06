import { brandW2ProductionTzHref, factoryProductionDossierHref } from '@/lib/routes';

/** Wave XN — factory dossier comment-only annotations (read-only TZ, PG journal). */
export const FACTORY_DOSSIER_COMMENTS_API_PATH =
  '/api/workshop2/factory/dossier/comments' as const;

export const MFR_DOSSIER_COMMENTS_WAVE_XN_MIGRATION =
  '068_wave_xn_factory_dossier_comments_stub' as const;

export const MFR_DEV_DOSSIER_ANNOTATION_PANEL_TESTID = 'mfr-dev-dossier-annotation-panel' as const;
export const MFR_DEV_DOSSIER_ANNOTATION_PEER_STRIP_TESTID =
  'mfr-dev-dossier-annotation-peer-strip' as const;
export const MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID =
  'mfr-dev-dossier-annotation-brand-diff-link' as const;
export const BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID =
  'brand-dossier-factory-diff-mfr-comments-link' as const;

export const BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR = 'brand-dossier-factory-diff' as const;
export const MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR = 'mfr-dev-dossier-annotation' as const;

export const MFR_DOSSIER_COMMENT_PEER_LABEL_RU = 'Комментарий к ТЗ (read-only)' as const;
export const BRAND_DOSSIER_DIFF_VIEWER_PEER_LABEL_RU = 'Сверка ТЗ бренд ↔ цех' as const;

export function factoryDossierCommentsApiPath(collectionId: string, articleId: string): string {
  const params = new URLSearchParams({
    collectionId: collectionId.trim(),
    articleId: articleId.trim(),
  });
  return `${FACTORY_DOSSIER_COMMENTS_API_PATH}?${params.toString()}`;
}

/** Brand W2 article · scroll to inline factory diff panel (Wave UN viewer). */
export function brandDossierFactoryDiffViewerHref(collectionId: string, articleId: string): string {
  return `${brandW2ProductionTzHref(collectionId, articleId)}#${BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR}`;
}

/** Factory dev dossier · scroll to comment-only annotation panel. */
export function mfrDevDossierAnnotationPanelHref(
  articleId: string,
  opts?: { collectionId?: string }
): string {
  const base = factoryProductionDossierHref(articleId, opts);
  return `${base}#${MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR}`;
}

export function buildMfrDossierCommentsPeerHrefs(input: {
  collectionId: string;
  articleId: string;
}): {
  brandDiffViewerHref: string;
  factoryAnnotationHref: string;
} {
  const { collectionId, articleId } = input;
  return {
    brandDiffViewerHref: brandDossierFactoryDiffViewerHref(collectionId, articleId),
    factoryAnnotationHref: mfrDevDossierAnnotationPanelHref(articleId, { collectionId }),
  };
}
