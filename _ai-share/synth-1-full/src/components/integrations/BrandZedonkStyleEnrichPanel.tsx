'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Layers } from 'lucide-react';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

/** Wave D4 · Zedonk Z.Studio style → costing hints (pillar 1 development). */
export function BrandZedonkStyleEnrichPanel() {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const importStyle = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/integrations/v1/zedonk/styles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleId: `ZEDONK-${PLATFORM_CORE_DEMO.demoArticleId}`,
          collectionId: PLATFORM_CORE_DEMO.collectionId,
          articleId: PLATFORM_CORE_DEMO.demoArticleId,
          makeCostUsd: 38,
          freightUsd: 5.2,
          dutyPct: 10,
        }),
      });
      const json = (await res.json()) as {
        data?: { style?: { makeCostUsd?: number; freightUsd?: number; dutyPct?: number } };
      };
      if (!res.ok) {
        setMsg('Style import failed');
        return;
      }
      const s = json.data?.style;
      setHint(s ? `make $${s.makeCostUsd} · freight $${s.freightUsd} · duty ${s.dutyPct}%` : null);
      setMsg('Costing hint → досье артикула и thread');
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card data-testid="brand-zedonk-style-enrich-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <Layers className="h-4 w-4" aria-hidden />
          Агентская консолидация · costing
        </CardTitle>
        <CardDescription>
          Себестоимость make + freight + duty → досье / столп 1 development.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => void importStyle()}
            data-testid="brand-zedonk-style-import-btn"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Импорт costing hint
          </Button>
          {hint ? (
            <Badge
              variant="secondary"
              className="text-[10px]"
              data-testid="brand-zedonk-costing-hint"
            >
              {hint}
            </Badge>
          ) : null}
        </div>
        {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
      </CardContent>
    </Card>
  );
}
