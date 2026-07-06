'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { UnifiedOrderTracking } from '@/lib/integrations/spine/order-tracking.types';
import {
  SUP_CM_LOGISTICS_ETA_BADGE_TESTID,
  SUP_CM_LOGISTICS_ETA_HONEST_HINT_TESTID,
  SUP_CM_LOGISTICS_ETA_MAP_ROUTE_TESTID,
  SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID,
  SUP_CM_LOGISTICS_ETA_STRIP_TESTID,
  SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID,
  buildSupplierLogisticsEtaMapStub,
  formatSupplierLogisticsDeliveryWindowLabel,
  supCmLogisticsEtaBadgeRu,
  supCmLogisticsEtaHonestHintRu,
  supCmLogisticsEtaLoadingRu,
} from '@/lib/fashion/supplier-logistics-wave-vo';
import {
  WAVE_YO_SUP_CM_LOGISTICS_ETA_COMPACT_ATTR,
  supCmLogisticsEtaCompactTitleRu,
} from '@/lib/fashion/supplier-comms-wave-yo';
import { shopB2bTrackingOrderHref } from '@/lib/routes';

type Props = {
  orderId: string;
};

/** Компактный ETA + map overlay stub на delivery window (RU, без внешних map API). */
export function SupCmLogisticsEtaMapOverlayStrip({ orderId }: Props) {
  const [deliveryLabel, setDeliveryLabel] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const mapStub = useMemo(() => buildSupplierLogisticsEtaMapStub(orderId), [orderId]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/integrations/v1/orders/${encodeURIComponent(orderId)}/tracking`, {
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { data?: UnifiedOrderTracking };
      })
      .then((json) => {
        if (cancelled) return;
        setDeliveryLabel(formatSupplierLogisticsDeliveryWindowLabel(json?.data?.deliveryWindow));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const trackingHref = shopB2bTrackingOrderHref(orderId);

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border border-dashed bg-bg-surface2/50 px-3 py-2 text-xs"
      data-testid={SUP_CM_LOGISTICS_ETA_STRIP_TESTID}
      {...{ [WAVE_YO_SUP_CM_LOGISTICS_ETA_COMPACT_ATTR]: '1' }}
      title={supCmLogisticsEtaCompactTitleRu()}
    >
      {loaded ? (
        deliveryLabel ? (
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
            data-testid={SUP_CM_LOGISTICS_ETA_BADGE_TESTID}
          >
            {supCmLogisticsEtaBadgeRu(deliveryLabel)}
          </Badge>
        ) : (
          <span className="text-text-muted text-[10px]" data-testid={SUP_CM_LOGISTICS_ETA_HONEST_HINT_TESTID}>
            {supCmLogisticsEtaHonestHintRu()}
          </span>
        )
      ) : (
        <span className="text-text-muted text-[10px]">{supCmLogisticsEtaLoadingRu()}</span>
      )}

      <div
        className="border-border-subtle flex items-center gap-1.5 rounded border bg-bg-surface px-2 py-1"
        data-testid={SUP_CM_LOGISTICS_ETA_MAP_STUB_TESTID}
        title={`${mapStub.originRu} → ${mapStub.destinationRu}`}
      >
        <svg
          viewBox="0 0 72 20"
          className="h-4 w-[4.5rem] shrink-0 text-accent-primary"
          aria-hidden
          data-testid={SUP_CM_LOGISTICS_ETA_MAP_ROUTE_TESTID}
        >
          <circle cx="6" cy="10" r="3" fill="currentColor" opacity="0.35" />
          <path
            d="M9 10 H54"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 2"
            fill="none"
          />
          <circle cx="66" cy="10" r="3" fill="currentColor" />
        </svg>
        <span className="text-text-secondary text-[9px] tabular-nums">{mapStub.routeLabelRu}</span>
      </div>

      <Link
        href={trackingHref}
        className="text-accent-primary text-[10px] underline-offset-2 hover:underline"
        data-testid={SUP_CM_LOGISTICS_ETA_TRACKING_LINK_TESTID}
      >
        Трекинг →
      </Link>
    </div>
  );
}
