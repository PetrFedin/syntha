'use client';

import Link from 'next/link';
import {
  factoryProductionDossierHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
} from '@/lib/routes';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Supplier dev BOM · brand W2 + mfr dossier + article comms peers. */
export function SupDevBomMfrDevPeerStrip({ collectionId, articleId }: Props) {
  const brandW2Href = workshop2ArticleHref(collectionId, articleId, { w2sec: 'material' });
  const mfrDossierHref = factoryProductionDossierHref(articleId, { collectionId });
  const commsHref = factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId);

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-dev-bom-mfr-dev-peer-strip">
      <Link
        href={brandW2Href}
        data-testid="sup-dev-bom-brand-w2-link"
        className={hubGadget.goldenLink}
      >
        Brand W2
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={mfrDossierHref}
        data-testid="sup-dev-bom-mfr-dossier-link"
        className={hubGadget.goldenLink}
      >
        Mfr dossier
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={commsHref}
        data-testid="sup-dev-bom-article-comms-link"
        className={hubGadget.goldenLink}
      >
        Article comms
      </Link>
    </div>
  );
}
