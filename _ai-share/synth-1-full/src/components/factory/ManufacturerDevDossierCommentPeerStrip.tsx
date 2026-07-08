'use client';

import Link from 'next/link';
import { PLATFORM_CORE_B2B_MESSAGE_TEMPLATES } from '@/lib/communications/platform-core-b2b-message-templates';
import {
  WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID,
  WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU,
  WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU,
  WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU,
  WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU,
  brandDossierFactoryDiffViewerHref,
  buildMfrDossierCommentMaterialsHref,
} from '@/lib/platform/wave-xn-mfr-dossier-comments';
import { factoryMessagesWorkshop2ArticleContextHref } from '@/lib/routes';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Mfr dev dossier · comment-only annotation via chat template (read-only TZ). */
export function ManufacturerDevDossierCommentPeerStrip({ collectionId, articleId }: Props) {
  const template = PLATFORM_CORE_B2B_MESSAGE_TEMPLATES.find((t) => t.id === 'article-tz');
  const body =
    template?.buildBody({ collectionId, articleId }) ??
    `Комментарий к ТЗ (read-only) · ${articleId} · ${collectionId}`;
  const chatHref = `${factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
    role: 'manufacturer',
  })}&prefill=${encodeURIComponent(body.slice(0, 120))}`;

  const sampleQueueHref = manufacturerHandoffFeatureHref('sample-queue', {
    collectionId,
    articleId,
  });
  const materialsHref = buildMfrDossierCommentMaterialsHref(collectionId);
  const brandDiffHref = brandDossierFactoryDiffViewerHref(collectionId, articleId);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_XN_MFR_DOSSIER_COMMENT_PEER_STRIP_TESTID}
    >
      <Link
        href={brandDiffHref}
        data-testid={WAVE_XN_MFR_DOSSIER_COMMENT_BRAND_DIFF_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_XN_MFR_DOSSIER_PEER_BRAND_DIFF_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={chatHref}
        data-testid="mfr-dev-dossier-comment-chat-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_XN_MFR_DOSSIER_PEER_CHAT_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={sampleQueueHref}
        data-testid="mfr-dev-dossier-comment-sample-queue-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_XN_MFR_DOSSIER_PEER_SAMPLE_QUEUE_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={materialsHref}
        data-testid="mfr-dev-dossier-comment-materials-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_XN_MFR_DOSSIER_PEER_MATERIALS_RU}
      </Link>
    </div>
  );
}
