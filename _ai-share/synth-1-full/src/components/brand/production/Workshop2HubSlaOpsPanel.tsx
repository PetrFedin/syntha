'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SlaPayload = {
  ackEdoP99Ms?: number | null;
  ackMarkingP99Ms?: number | null;
  b2b3dErrorRate?: number;
  probeLastOkAt?: string | null;
  sloOk?: boolean;
  labelRu?: string;
  sloTargets?: { ackP99Ms: number; b2b3dErrorRatePct: number; labelRu?: string };
};

/** Wave 53: read-only ops SLA panel из GET /api/workshop2/ops/sla-dashboard. */
export function Workshop2HubSlaOpsPanel({ compact = false }: { compact?: boolean }) {
  const [payload, setPayload] = useState<SlaPayload | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/workshop2/ops/sla-dashboard', { cache: 'no-store' });
    if (!res.ok) {
      setError(true);
      return;
    }
    setError(false);
    setPayload((await res.json()) as SlaPayload);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (compact) {
    return (
      <div
        className="border-border-subtle bg-bg-surface2/60 flex min-w-0 max-w-full flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs max-md:flex-nowrap max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden"
        data-testid="workshop2-hub-sla-ops-panel"
      >
        {error ? (
          <span className="text-destructive shrink-0">Панель SLA недоступна</span>
        ) : payload ? (
          <>
            <Badge variant={payload.sloOk ? 'default' : 'destructive'} className="shrink-0 text-[9px]">
              SLO {payload.sloOk ? 'в норме' : 'нарушен'}
            </Badge>
            <span className="text-text-muted shrink-0 tabular-nums">
              ошибки 3D {payload.b2b3dErrorRate ?? 0}%
            </span>
            {payload.probeLastOkAt ? (
              <span className="text-text-muted shrink-0 text-[10px]">
                проверка {payload.probeLastOkAt.slice(0, 10)}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-text-muted shrink-0">SLA…</span>
        )}
      </div>
    );
  }

  return (
    <Card data-testid="workshop2-hub-sla-ops-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">SLA операций</CardTitle>
        <CardDescription>
          ACK p99, доля ошибок 3D, heartbeat проверки — метрики journal_only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {error && <p className="text-destructive">Не удалось загрузить панель SLA.</p>}
        {payload && (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant={payload.sloOk ? 'default' : 'destructive'}>
                SLO: {payload.sloOk ? 'в норме' : 'нарушен'}
              </Badge>
            </div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2">
              <dt className="text-muted-foreground">ЭДО ACK p99</dt>
              <dd>{payload.ackEdoP99Ms ?? '—'} мс</dd>
              <dt className="text-muted-foreground">ЧЗ ACK p99</dt>
              <dd>{payload.ackMarkingP99Ms ?? '—'} мс</dd>
              <dt className="text-muted-foreground">Доля ошибок 3D</dt>
              <dd>{payload.b2b3dErrorRate ?? 0}%</dd>
              <dt className="text-muted-foreground">Последняя проверка</dt>
              <dd>{payload.probeLastOkAt ?? '—'}</dd>
            </dl>
            <p className="text-muted-foreground text-xs">{payload.labelRu}</p>
            {payload.sloTargets?.labelRu && (
              <p className="text-muted-foreground text-xs">{payload.sloTargets.labelRu}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
