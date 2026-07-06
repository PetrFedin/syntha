/**
 * Wave XN — mfr dev dossier: comment-only annotations (read-only ТЗ, PG journal).
 */
import { ROUTES, factoryMessagesWorkshop2ArticleContextHref } from '@/lib/routes';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';

export const WAVE_XN_MFR_DOSSIER_COMMENTS_API = '/api/workshop2/factory/dossier/comments';

export const WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX = 'mfr-xn-comment-';

export const WAVE_XN_MFR_DOSSIER_ANNOTATION_PANEL_TESTID = 'mfr-dev-dossier-annotation-panel';
export const WAVE_XN_MFR_DOSSIER_ANNOTATION_PEER_STRIP_TESTID =
  'mfr-dev-dossier-annotation-peer-strip';
export const WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID = 'mfr-dev-dossier-comment-peer-strip';
export const WAVE_XN_MFR_DOSSIER_ANNOTATION_INPUT_TESTID = 'mfr-dev-dossier-annotation-input';
export const WAVE_XN_MFR_DOSSIER_ANNOTATION_SUBMIT_TESTID = 'mfr-dev-dossier-annotation-submit';
export const WAVE_XN_MFR_DOSSIER_ANNOTATION_LIST_TESTID = 'mfr-dev-dossier-annotation-list';
export const WAVE_XN_MFR_DOSSIER_ANNOTATION_EMPTY_TESTID = 'mfr-dev-dossier-annotation-empty';

export const WAVE_XN_MFR_DOSSIER_COMMENT_SAVED_RU = 'Комментарий цеха сохранён (journal PG).';
export const WAVE_XN_MFR_DOSSIER_COMMENT_EMPTY_RU = 'Комментариев цеха пока нет.';
export const WAVE_XN_MFR_DOSSIER_COMMENT_REQUIRED_RU = 'Текст комментария обязателен.';
export const WAVE_XN_MFR_DOSSIER_READ_ONLY_HINT_RU = 'Комментарий к ТЗ (read-only) · journal PG';
export const WAVE_XN_MFR_DOSSIER_INPUT_PLACEHOLDER_RU = 'Замечание технолога цеха…';
export const WAVE_XN_MFR_DOSSIER_SUBMIT_LABEL_RU = 'Добавить комментарий';
export const WAVE_XN_MFR_DOSSIER_SUBMIT_BUSY_RU = 'Сохранение…';

export const WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU = 'Комментарий в чат';
export const WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU = 'Очередь образцов';
export const WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU = 'Материалы';
export const WAVE_XN_MFR_DOSSIER_PEER_HANDOFF_RU = 'Очередь передачи';
export const WAVE_XN_MFR_DOSSIER_PEER_ARTICLE_CHAT_RU = 'Чат по артикулу';

export function buildMfrDossierCommentsApiHref(collectionId: string, articleId: string): string {
  const qs = new URLSearchParams({
    collectionId: collectionId.trim(),
    articleId: articleId.trim(),
  });
  return `${WAVE_XN_MFR_DOSSIER_COMMENTS_API}?${qs.toString()}`;
}

export function buildMfrDossierAnnotationHandoffHref(input: {
  collectionId: string;
  factoryId?: string;
  orderId?: string;
}): string {
  if (input.orderId?.trim()) {
    return manufacturerHandoffFeatureHref('handoff', {
      factoryId: input.factoryId ?? 'fact-1',
      collectionId: input.collectionId,
      orderId: input.orderId,
    });
  }
  return manufacturerHandoffFeatureHref('handoff', {
    factoryId: input.factoryId ?? 'fact-1',
    collectionId: input.collectionId,
  });
}

export function buildMfrDossierAnnotationChatHref(collectionId: string, articleId: string): string {
  return factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
    role: 'manufacturer',
  });
}

export function buildMfrDossierCommentMaterialsHref(collectionId: string): string {
  return `${ROUTES.factory.productionMaterials}?collection=${encodeURIComponent(collectionId.trim())}`;
}

export function isWaveXnMfrDossierCommentId(commentId: string): boolean {
  return commentId.startsWith(WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX);
}

export {
  BRAND_DOSSIER_DIFF_VIEWER_PEER_LABEL_RU,
  BRAND_DOSSIER_FACTORY_DIFF_MFR_COMMENTS_LINK_TESTID,
  BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR,
  FACTORY_DOSSIER_COMMENTS_API_PATH,
  MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID,
  MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR,
  MFR_DEV_DOSSIER_ANNOTATION_PANEL_TESTID,
  MFR_DEV_DOSSIER_ANNOTATION_PEER_STRIP_TESTID,
  MFR_DOSSIER_COMMENT_PEER_LABEL_RU,
  MFR_DOSSIER_COMMENTS_WAVE_XN_MIGRATION,
  brandDossierFactoryDiffViewerHref,
  buildMfrDossierCommentsPeerHrefs,
  factoryDossierCommentsApiPath,
  mfrDevDossierAnnotationPanelHref,
} from '@/lib/production/mfr-dossier-comments-wave-xn';

export const WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU = 'Сверка ТЗ бренд ↔ цех' as const;
export const WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID =
  'mfr-dev-dossier-comment-brand-diff-link' as const;
