'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CutoverPayload = {
  cutoverReady?: boolean;
  humanSignoffRequired?: boolean;
  humanSignoffGateOk?: boolean;
  wave51ProdCutoverReady?: boolean;
  wave52ProdLiveReady?: boolean;
  wave55FreezeReady?: boolean;
  probes?: { id: string; labelRu: string; ok: boolean; score?: number; hintRu?: string }[];
};

/** Wave 51: read-only cutover dashboard из GET /api/workshop2/cutover-dashboard. */
export function Workshop2HubCutoverDashboardPanel() {
  const [payload, setPayload] = useState<CutoverPayload | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/workshop2/cutover-dashboard', { cache: 'no-store' });
    if (!res.ok) {
      setError(true);
      return;
    }
    setError(false);
    setPayload((await res.json()) as CutoverPayload);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card data-testid="workshop2-hub-cutover-dashboard">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cutover dashboard</CardTitle>
        <CardDescription>
          Staging→prod: wave probes + human signoff (fail-closed без demo mode).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {error && <p className="text-destructive">Не удалось загрузить cutover dashboard.</p>}
        {payload && (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant={payload.cutoverReady ? 'default' : 'secondary'}>
                cutoverReady: {payload.cutoverReady ? 'да' : 'нет'}
              </Badge>
              <Badge variant={payload.wave52ProdLiveReady ? 'default' : 'outline'}>
                wave52: {payload.wave52ProdLiveReady ? 'ok' : '—'}
              </Badge>
              <Badge variant={payload.wave55FreezeReady ? 'default' : 'outline'}>
                wave55 freeze: {payload.wave55FreezeReady ? 'ok' : '—'}
              </Badge>
              {payload.humanSignoffRequired && (
                <Badge variant={payload.humanSignoffGateOk ? 'default' : 'destructive'}>
                  signoff: {payload.humanSignoffGateOk ? 'ok' : 'требуется'}
                </Badge>
              )}
            </div>
            <ul className="space-y-1">
              {(payload.probes ?? []).map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-2">
                  <span>{p.labelRu}</span>
                  <span className={p.ok ? 'text-emerald-600' : 'text-muted-foreground'}>
                    {p.ok ? '✓' : '—'}
                    {p.score != null ? ` (${p.score})` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
