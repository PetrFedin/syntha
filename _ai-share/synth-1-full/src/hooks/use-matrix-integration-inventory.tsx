'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { IntegrationPlatform } from '@/lib/integrations/spine/integration-platform';
import {
  integrationPlatformLabelRu,
  integrationPlatformShortLabelRu,
} from '@/lib/integrations/spine/integration-ui-utils';

export type MatrixAtsCell = {
  sku: string;
  ats: number;
  preBook?: number;
  openToSell?: number;
  sourcePlatform: IntegrationPlatform;
};

type Props = {
  /** По умолчанию NuOrder F-NU-ATS; можно joor / apparel_magic / aims360 */
  platform?: IntegrationPlatform;
  skus: string[];
};

/** Столп 3 · shop matrix — колонка ATS из `/api/integrations/v1/:platform/inventory`. */
export function useMatrixIntegrationInventory(platform: IntegrationPlatform, skus: string[]) {
  const [cells, setCells] = useState<MatrixAtsCell[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (!skus.length) {
      setCells([]);
      setLoadState('idle');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(`/api/integrations/v1/${platform}/inventory`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('inventory failed');
        const json = (await res.json()) as {
          data?: { items?: MatrixAtsCell[] };
        };
        if (!cancelled) {
          setCells(json.data?.items ?? []);
          setLoadState('ready');
        }
      } catch {
        if (!cancelled) {
          setCells([]);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [platform, skus.join('|')]);

  const bySku = useMemo(() => {
    const m = new Map<string, MatrixAtsCell>();
    for (const c of cells) m.set(c.sku, c);
    return m;
  }, [cells]);

  return { bySku, loadState, platform };
}

type AtsBadgeProps = {
  sku: string;
  cell?: MatrixAtsCell;
  platform: IntegrationPlatform;
};

export function MatrixIntegrationAtsBadge({ sku, cell, platform }: AtsBadgeProps) {
  if (!cell) {
    return (
      <Badge variant="outline" className="text-[9px]" data-testid={`matrix-ats-missing-${sku}`}>
        ATS —
      </Badge>
    );
  }

  const channelTag = integrationPlatformShortLabelRu(platform);
  const label =
    platform === 'aims360' && cell.openToSell != null
      ? `${channelTag} OTS ${cell.openToSell}`
      : platform === 'nuorder' && cell.preBook != null
        ? `${channelTag} ATS ${cell.ats} · PB ${cell.preBook}`
        : `${channelTag} ATS ${cell.ats}`;

  return (
    <Badge
      variant="secondary"
      className="text-[9px] font-bold uppercase"
      data-testid={`matrix-ats-${sku}`}
      title={`${integrationPlatformLabelRu(platform)} · наличие`}
    >
      {label}
    </Badge>
  );
}
