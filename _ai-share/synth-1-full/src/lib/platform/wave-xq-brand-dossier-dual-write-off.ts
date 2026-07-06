import { buildBrandOpAttachTzPoSession } from '@/lib/fashion/brand-op-attach-tz-po-session';
import {
  BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR,
  brandDossierFactoryDiffViewerHref,
} from '@/lib/production/mfr-dossier-comments-wave-xn';

/** Wave XQ · phase1-dossier PG-only in Platform Core (fail-closed localStorage dual-write). */

export const WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_RU =
  'Platform Core: досье и ТЗ только в PostgreSQL — офлайн-кэш localStorage отключён. При потере сети сохранение блокируется до восстановления PG.';

export const WORKSHOP2_PHASE1_DOSSIER_CORE_OFFLINE_BLOCKED_BANNER_TESTID =
  'workshop2-phase1-dossier-core-offline-blocked-banner';

export const BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID =
  'brand-dossier-diff-attach-tz-po-cross-strip';

export const BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID =
  'brand-op-attach-tz-po-diff-viewer-link';

export const BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_PEER_LABEL_RU = 'Прикрепить ТЗ к PO →';

export const BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LABEL_RU = 'Сверка ТЗ ↔ PO';

export type BrandDossierDiffAttachTzPoCrossLinks = {
  diffViewerHref: string;
  attachTzPoHref: string;
  attachTzPdfPeerHref: string;
  attachTzPoFromDiffHref: string;
};

/** Cross-link inline factory diff viewer ↔ attach TZ to PO peer strip (Wave XQ). */
export function buildBrandDossierDiffAttachTzPoCrossLinks(input: {
  collectionId: string;
  articleId: string;
  orderId?: string;
  productionOrderId?: string;
  factoryId?: string;
}): BrandDossierDiffAttachTzPoCrossLinks {
  const session = buildBrandOpAttachTzPoSession(input);
  const diffViewerHref = brandDossierFactoryDiffViewerHref(input.collectionId, input.articleId);
  return {
    diffViewerHref,
    attachTzPoHref: session.attachTzPoHref,
    attachTzPdfPeerHref: session.attachTzPdfPeerHref,
    attachTzPoFromDiffHref: `${diffViewerHref.split('#')[0]}#${BRAND_DOSSIER_FACTORY_DIFF_PANEL_ANCHOR}`,
  };
}
