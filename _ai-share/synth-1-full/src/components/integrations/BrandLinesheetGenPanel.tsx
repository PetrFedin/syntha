'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileSpreadsheet } from 'lucide-react';

type Props = {
  collectionId: string;
  compact?: boolean;
  reloadNonce?: number;
};

type LinesheetSnapshot = {
  articleCount: number;
  pxmOverlayCount: number;
  pdfHref: string;
  generatedAt?: string;
  linesheetId?: string;
};

/** Wave D4 · P2-LINESHEET-GEN (pillar 2 sample_collection · brand linesheets). */
export function BrandLinesheetGenPanel({ collectionId, compact = false, reloadNonce = 0 }: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LinesheetSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/integrations/v1/linesheet/${encodeURIComponent(collectionId)}`,
          { cache: 'no-store' }
        );
        const json = (await res.json()) as { data?: { linesheet?: LinesheetSnapshot | null } };
        if (!cancelled && res.ok && json.data?.linesheet) {
          setResult(json.data.linesheet);
        }
      } catch {
        /* no snapshot yet */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, reloadNonce]);

  const generate = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/integrations/v1/linesheet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId }),
      });
      const json = (await res.json()) as {
        data?: {
          linesheet?: LinesheetSnapshot;
        };
      };
      if (res.ok && json.data?.linesheet) setResult(json.data.linesheet);
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 text-xs"
        data-testid="brand-sc-linesheet-gen-strip"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px]"
          disabled={busy}
          onClick={() => void generate()}
          data-testid="brand-sc-linesheet-gen-btn"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Gen linesheet'}
        </Button>
        {result ? (
          <Badge variant="secondary" className="text-[9px]">
            {result.articleCount} art · PXM {result.pxmOverlayCount}
          </Badge>
        ) : null}
        {result?.pdfHref ? (
          <Link href={result.pdfHref} className="text-accent-primary hover:underline">
            PDF
          </Link>
        ) : null}
        {result?.generatedAt ? (
          <span className="text-[9px] text-muted-foreground">
            {new Date(result.generatedAt).toLocaleDateString('ru-RU')}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Card data-testid="brand-linesheet-gen-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          Linesheet generate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => void generate()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generate from published + PXM
        </Button>
        {result ? (
          <p className="text-xs text-muted-foreground">
            {result.articleCount} articles · PXM overlay {result.pxmOverlayCount} ·{' '}
            <Link href={result.pdfHref} className="text-accent-primary hover:underline">
              PDF
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
