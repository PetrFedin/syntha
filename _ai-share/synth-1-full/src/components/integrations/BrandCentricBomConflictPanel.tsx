'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

type Props = {
  collectionId?: string;
  articleId?: string;
  compact?: boolean;
};

type BomImportResult = {
  conflicts: Array<{
    materialName: string;
    kind: string;
    centricValue?: string;
    synthaValue?: string;
  }>;
  centricLineCount: number;
  synthaLineCount: number;
  hasBlockingConflicts: boolean;
};

/** Wave B2 · Centric BOM vs W2 dossier conflict panel (столп 1 development). */
export function BrandCentricBomConflictPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
  compact = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BomImportResult | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const runCompare = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const styleId = `CENTRIC-BOM-${articleId}`;
      const res = await fetch('/api/integrations/v1/centric/bom/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleId,
          collectionId,
          articleId,
          lines: [
            { materialName: 'Main fabric SS27', consumption: 1.8, unit: 'm' },
            { materialName: 'Lining', consumption: 1.2, unit: 'm' },
            { materialName: 'PLM-only trim', consumption: 0.5, unit: 'pcs' },
          ],
        }),
      });
      const json = (await res.json()) as { data?: { result?: BomImportResult } };
      if (!res.ok || !json.data?.result) {
        setMsg('BOM compare failed');
        setResult(null);
        return;
      }
      setResult(json.data.result);
      setMsg(
        json.data.result.conflicts.length === 0
          ? 'BOM совпадает с досье'
          : `${json.data.result.conflicts.length} расхождений · thread обновлён`
      );
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 px-1 text-xs"
        data-testid="brand-dev-centric-bom-strip"
      >
        <Badge variant="outline" className="text-[9px]">
          PLM · BOM
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px]"
          disabled={busy}
          onClick={() => void runCompare()}
          data-testid="brand-dev-centric-bom-compare-btn"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Сверить с досье'}
        </Button>
        {result ? (
          <Badge
            variant={result.hasBlockingConflicts ? 'destructive' : 'secondary'}
            className="text-[9px]"
            data-testid="brand-dev-centric-bom-conflict-count"
          >
            {result.conflicts.length} Δ
          </Badge>
        ) : null}
      </div>
    );
  }

  return (
    <Card data-testid="brand-centric-bom-conflict-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-black uppercase">PLM · BOM · сверка</CardTitle>
        <CardDescription>
          Wave B2 · inbound BOM vs досье Syntha · расхождения → thread артикула (E1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button type="button" size="sm" disabled={busy} onClick={() => void runCompare()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Импорт и сверка BOM
        </Button>
        {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
        {result && result.conflicts.length > 0 ? (
          <ul className="space-y-1.5" data-testid="brand-centric-bom-conflict-list">
            {result.conflicts.map((c) => (
              <li
                key={`${c.materialName}-${c.kind}`}
                className="flex items-start gap-2 rounded border border-amber-100 bg-amber-50/50 px-2 py-1.5 text-xs"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                <span>
                  <strong>{c.materialName}</strong> · {c.kind}
                  {c.centricValue ? ` · PLM ${c.centricValue}` : ''}
                  {c.synthaValue ? ` · Syntha ${c.synthaValue}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
