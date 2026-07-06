'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID,
  WAVE_XU_MFR_EXPORT_PRINT_ROUTE_BACK_RU,
  WAVE_XU_MFR_EXPORT_PRINT_ROUTE_HINT_RU,
  WAVE_XU_MFR_EXPORT_PRINT_ROUTE_TITLE_RU,
  WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU,
} from '@/lib/platform/wave-xu-mfr-tz-export-print';

type Props = {
  htmlContent: string;
  backHref: string;
  autoPrint?: boolean;
};

export function MfrOpDossierExportPrintRouteClient({ htmlContent, backHref, autoPrint }: Props) {
  useEffect(() => {
    if (autoPrint) {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div
      className="mx-auto max-w-5xl space-y-3 p-4 print:p-0"
      data-testid={WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_ROUTE_TESTID}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-text-primary text-sm font-bold">{WAVE_XU_MFR_EXPORT_PRINT_ROUTE_TITLE_RU}</h1>
          <p className="text-text-muted text-xs">{WAVE_XU_MFR_EXPORT_PRINT_ROUTE_HINT_RU}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {WAVE_XU_MFR_EXPORT_PRINT_LABEL_RU}
          </Button>
          <Link href={backHref} className="text-accent-primary text-xs font-medium hover:underline">
            {WAVE_XU_MFR_EXPORT_PRINT_ROUTE_BACK_RU}
          </Link>
        </div>
      </div>
      <div
        className="border-border-subtle rounded-md border bg-white p-4 print:border-0 print:p-0"
        data-testid="mfr-op-dossier-export-print-document"
      >
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}
