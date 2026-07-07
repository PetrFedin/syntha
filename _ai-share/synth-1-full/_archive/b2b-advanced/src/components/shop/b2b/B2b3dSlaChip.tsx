'use client';

import { useEffect, useState } from 'react';

type SlaPayload = {
  sessionCount?: number;
  avgDurationSec?: number;
  errorCount?: number;
  errorRatePct?: number;
  labelRu?: string;
};

/** Wave 49/53: read-only chip «3D SLA» для showroom + rep portal. */
export function B2b3dSlaChip() {
  const [sla, setSla] = useState<SlaPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/shop/b2b/showroom/3d-sla')
      .then(async (r) => {
        const data = (await r.json()) as SlaPayload;
        if (!cancelled) setSla(data);
      })
      .catch(() => {
        if (!cancelled) setSla(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const title =
    sla?.labelRu ??
    (sla
      ? `3D SLA: ${sla.sessionCount ?? 0} сессий, ошибки ${sla.errorRatePct ?? 0}%`
      : '3D SLA: загрузка…');

  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-1 text-xs text-muted-foreground"
      data-testid="b2b-3d-sla-chip"
      title={title}
    >
      3D SLA
      {sla?.errorRatePct != null ? `: ${sla.errorRatePct}% err` : ''}
    </span>
  );
}
