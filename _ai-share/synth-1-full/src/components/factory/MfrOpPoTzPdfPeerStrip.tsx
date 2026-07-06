'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  buildMfrDossierExportPrintHref,
  buildMfrTzPdfBundleApiHref,
  MFR_OP_PO_TZ_PDF_DOSSIER_PRINT_LINK_TESTID,
  MFR_OP_PO_TZ_PDF_DOWNLOAD_LINK_TESTID,
  MFR_OP_PO_TZ_PDF_PEER_LINK_TESTID,
  MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID,
  WAVE_XU_MFR_PO_TZ_PDF_DOWNLOAD_LABEL_RU,
  WAVE_XU_MFR_PO_TZ_PDF_DOSSIER_PRINT_LABEL_RU,
  WAVE_XU_MFR_PO_TZ_PDF_PEER_BADGE_RU,
  WAVE_XU_MFR_PO_TZ_PDF_PEER_HINT_RU,
} from '@/lib/platform/wave-xu-mfr-tz-export-print';
import { factoryProductionDossierContextHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId: string;
  factoryId?: string;
};

/** Mfr production orders · PO record TZ PDF peer (brand attach UN/UY cross-link). */
export function MfrOpPoTzPdfPeerStrip({
  orderId,
  collectionId,
  articleId,
  productionOrderId,
}: Props) {
  const tzPdfHref = buildMfrTzPdfBundleApiHref(collectionId, articleId);
  const exportPrintHref = buildMfrDossierExportPrintHref(articleId, {
    collectionId,
    orderId,
  });
  const dossierHref = factoryProductionDossierContextHref(articleId, {
    collectionId,
    orderId,
  });

  return (
    <div
      id="mfr-op-po-tz-pdf-peer"
      className={cn(
        hubGadget.goldenPath,
        hubCabinet.workspaceTableScroll,
        'border-border-subtle max-md:flex-nowrap rounded-md border bg-bg-surface2/50 px-3 py-2'
      )}
      data-testid={MFR_OP_PO_TZ_PDF_PEER_STRIP_TESTID}
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        {WAVE_XU_MFR_PO_TZ_PDF_PEER_BADGE_RU}
      </Badge>
      <span className="text-text-muted text-[9px]">{WAVE_XU_MFR_PO_TZ_PDF_PEER_HINT_RU}</span>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link
        href={dossierHref}
        data-testid={MFR_OP_PO_TZ_PDF_PEER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        PO {productionOrderId}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <a
        href={tzPdfHref}
        data-testid={MFR_OP_PO_TZ_PDF_DOWNLOAD_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_XU_MFR_PO_TZ_PDF_DOWNLOAD_LABEL_RU}
      </a>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link
        href={exportPrintHref}
        data-testid={MFR_OP_PO_TZ_PDF_DOSSIER_PRINT_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {WAVE_XU_MFR_PO_TZ_PDF_DOSSIER_PRINT_LABEL_RU}
      </Link>
    </div>
  );
}
