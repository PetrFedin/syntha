'use client';

import Link from 'next/link';
import { buildBrandOpAttachTzPoSession } from '@/lib/platform-core-ports/fashion/brand-op-attach-tz-po-session';
import {
  BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LABEL_RU,
  BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID,
  buildBrandDossierDiffAttachTzPoCrossLinks,
} from '@/lib/platform-core-ports/platform/wave-xq-brand-dossier-dual-write-off';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  collectionId: string;
  articleId: string;
  factoryId?: string;
  productionOrderId?: string;
};

/** Brand OP · compact link strip: attach TZ bundle context to production order (PO). */
export function BrandOpAttachTzPoLinkStrip({
  orderId,
  collectionId,
  articleId,
  factoryId,
  productionOrderId,
}: Props) {
  const session = buildBrandOpAttachTzPoSession({
    orderId,
    collectionId,
    articleId,
    factoryId,
    productionOrderId,
  });
  const crossLinks = buildBrandDossierDiffAttachTzPoCrossLinks({
    orderId,
    collectionId,
    articleId,
    factoryId,
    productionOrderId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-op-attach-tz-po-strip">
      <span className={hubGadget.muted}>ТЗ → PO</span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crossLinks.diffViewerHref}
        data-testid={BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_DOSSIER_ATTACH_TZ_PO_DIFF_VIEWER_LABEL_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.attachTzPoHref}
        data-testid="brand-op-attach-tz-po-link"
        className={hubGadget.goldenLink}
      >
        Прикрепить ТЗ к PO
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.attachTzPdfPeerHref}
        data-testid="brand-op-attach-tz-pdf-peer-link"
        className={hubGadget.goldenLink}
      >
        ТЗ PDF на заказе
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.poHref}
        data-testid="brand-op-attach-tz-po-order-link"
        className={hubGadget.goldenLink}
      >
        PO {session.productionOrderId}
      </Link>
    </div>
  );
}
