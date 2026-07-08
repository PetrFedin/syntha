'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useFactoryHandoffQueueSse } from '@/hooks/use-factory-handoff-queue-sse';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  formatMfrEmptyHandoffCountBadgeRu,
  MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID,
  mfrEmptyHandoffQueueApiHref,
} from '@/lib/platform-core-ports/platform/wave-yv-mfr-empty-pillars-final';
// wave-yv-mfr-empty-pillars-final — handoff queue count badge (dedupe SK)

type Props = {
  factoryId: string;
  testId?: string;
};

/** Read-only badge: сколько PO в очереди handoff (empty pillar CO). */
export function MfrEmptyHandoffCountBadge({
  factoryId,
  testId = MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID,
}: Props) {
  const { tick: handoffTick } = useFactoryHandoffQueueSse(Boolean(factoryId.trim()));
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!factoryId.trim()) {
      setCount(null);
      return;
    }
    let cancelled = false;
    void fetch(mfrEmptyHandoffQueueApiHref(factoryId), {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { ok?: boolean; items?: unknown[] };
      })
      .then((json) => {
        if (cancelled) return;
        setCount(json?.ok && Array.isArray(json.items) ? json.items.length : 0);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [factoryId, handoffTick]);

  if (count == null) return null;

  return (
    <Badge
      variant={count > 0 ? 'secondary' : 'outline'}
      className="text-[10px]"
      data-testid={testId}
    >
      {formatMfrEmptyHandoffCountBadgeRu(count)}
    </Badge>
  );
}
