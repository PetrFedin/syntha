'use client';

import Link from 'next/link';
import {
  buildMfrOpDossierAttachTzPdfPoSession,
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_EXPORT_PRINT_LINK_TESTID,
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_LINK_TESTID,
  MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID,
  WAVE_XU_MFR_DOSSIER_PO_RECORD_LABEL_RU,
  WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU,
  WAVE_XU_MFR_PO_TZ_PDF_PEER_HINT_RU,
} from '@/lib/platform/wave-xu-mfr-tz-export-print';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
  factoryId?: string;
};

/** Mfr OP dossier · cross-link PO TZ PDF record (brand attach UN/UY) + export-print route. */
export function MfrOpDossierAttachTzPdfPoPeerStrip({
  orderId,
  collectionId,
  articleId,
  productionOrderId,
  factoryId,
}: Props) {
  const session = buildMfrOpDossierAttachTzPdfPoSession({
    orderId,
    collectionId,
    articleId,
    productionOrderId,
    factoryId,
  });

  return (
    <div
      className={cn(
        hubGadget.goldenPath,
        hubCabinet.workspaceTableScroll,
        'border-border-subtle bg-bg-surface2/40 rounded-md border px-2 py-1.5 max-md:flex-nowrap'
      )}
      data-testid={MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_PEER_STRIP_TESTID}
    >
      <span className="text-text-muted text-[9px] uppercase">
        {WAVE_XU_MFR_PO_TZ_PDF_PEER_HINT_RU}
      </span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.poRecordHref}
        data-testid={MFR_OP_DOSSIER_ATTACH_TZ_PDF_PO_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_XU_MFR_DOSSIER_PO_RECORD_LABEL_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.exportPrintHref}
        data-testid={MFR_OP_DOSSIER_ATTACH_TZ_PDF_EXPORT_PRINT_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU}
      </Link>
    </div>
  );
}
