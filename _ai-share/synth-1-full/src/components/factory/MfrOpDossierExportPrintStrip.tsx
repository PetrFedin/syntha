'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  describeWorkshop2TzExportBundleFailure,
  downloadWorkshop2TzExportBundleApi,
  saveWorkshop2TzExportBundleBlob,
} from '@/lib/production/workshop2-tz-export-api-client';
import {
  buildMfrDossierExportPrintHref,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_BTN_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_EXPORT_BTN_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STATUS_TESTID,
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID,
  WAVE_XU_MFR_EXPORT_DOWNLOAD_BUSY_RU,
  WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU,
  WAVE_XU_MFR_EXPORT_PRINT_BADGE_RU,
  WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU,
  WAVE_XU_MFR_EXPORT_STATUS_NETWORK_RU,
  WAVE_XU_MFR_EXPORT_STATUS_OK_RU,
} from '@/lib/platform/wave-xu-mfr-tz-export-print';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  className?: string;
};

/** Wave XU · OP dossier TZ export + print e2e strip (RU labels, export-print route). */
export function MfrOpDossierExportPrintStrip({ collectionId, articleId, orderId, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const printHref = buildMfrDossierExportPrintHref(articleId, { collectionId, orderId });

  const runExport = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const result = await downloadWorkshop2TzExportBundleApi({ collectionId, articleId });
      if (result.ok) {
        saveWorkshop2TzExportBundleBlob(result.blob, result.filename);
        setStatus(WAVE_XU_MFR_EXPORT_STATUS_OK_RU);
      } else {
        setStatus(describeWorkshop2TzExportBundleFailure(result));
      }
    } catch {
      setStatus(WAVE_XU_MFR_EXPORT_STATUS_NETWORK_RU);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        'border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/60 px-3 py-2 text-xs',
        className
      )}
      data-testid={WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID}
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        {WAVE_XU_MFR_EXPORT_PRINT_BADGE_RU}
      </Badge>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        disabled={busy}
        data-testid={WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_EXPORT_BTN_TESTID}
        onClick={() => void runExport()}
      >
        <Download className="mr-1 h-3.5 w-3.5" aria-hidden />
        {busy ? WAVE_XU_MFR_EXPORT_DOWNLOAD_BUSY_RU : WAVE_XU_MFR_EXPORT_DOWNLOAD_LABEL_RU}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        data-testid={WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_BTN_TESTID}
        asChild
      >
        <Link href={printHref}>
          <Printer className="mr-1 h-3.5 w-3.5" aria-hidden />
          {WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU}
        </Link>
      </Button>
      {status ? (
        <span
          className="text-text-muted text-[10px]"
          data-testid={WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STATUS_TESTID}
          role="status"
        >
          {status}
        </span>
      ) : null}
    </div>
  );
}
