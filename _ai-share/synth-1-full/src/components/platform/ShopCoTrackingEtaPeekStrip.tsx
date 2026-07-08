'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { UnifiedOrderTracking } from '@/lib/integrations/spine/order-tracking.types';
import { shopB2bOrderHref, shopB2bTrackingOrderHref } from '@/lib/platform-core-routes';
import {
  WAVE_WZ_SHOP_ETA_HANDOFF_HINT_RU,
  WAVE_WZ_SHOP_ETA_PREFIX_RU,
} from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  variant: 'cabinet' | 'detail';
  trackingNumberPreview?: string | null;
  /** Скрыть навигационные ссылки (embed уже рендерит nav). */
  hideNavLinks?: boolean;
};

/** Hub/detail ETA peek — delivery window from tracking API + link to buyer tracking. */
export function ShopCoTrackingEtaPeekStrip({
  orderId,
  variant,
  trackingNumberPreview,
  hideNavLinks = false,
}: Props) {
  const [deliveryLabel, setDeliveryLabel] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const testIdPrefix = variant === 'cabinet' ? 'shop-op-cabinet' : 'shop-co-detail';

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
        const window = json?.data?.deliveryWindow;
        setDeliveryLabel(window?.label ?? window?.estimatedDelivery ?? null);
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
  const etaLabel =
    deliveryLabel ?? (trackingNumberPreview?.trim() ? `ТТН ${trackingNumberPreview.trim()}` : null);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={`${testIdPrefix}-eta-peek-strip`}
      data-audit-legacy={variant === 'cabinet' ? 'shop-op-cabinet-eta-peek' : undefined}
    >
      {loaded ? (
        etaLabel ? (
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
            data-testid={`${testIdPrefix}-eta-badge`}
            data-audit-legacy={variant === 'cabinet' ? 'shop-op-cabinet-po-badge' : undefined}
          >
            {deliveryLabel ? `${WAVE_WZ_SHOP_ETA_PREFIX_RU} ${deliveryLabel}` : etaLabel}
          </Badge>
        ) : (
          <span className={hubGadget.muted} data-testid={`${testIdPrefix}-eta-honest-hint`}>
            {WAVE_WZ_SHOP_ETA_HANDOFF_HINT_RU}
          </span>
        )
      ) : (
        <span className={hubGadget.muted}>Срок…</span>
      )}
      {!hideNavLinks ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={trackingHref}
            data-testid={`${testIdPrefix}-eta-tracking-link`}
            className={hubGadget.goldenLink}
          >
            Трекинг →
          </Link>
          {variant === 'detail' ? (
            <>
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
              <Link
                href={`${shopB2bOrderHref(orderId)}#shop-co-buyer-tracking`}
                data-testid="shop-co-detail-tracking-anchor-link"
                className={hubGadget.goldenLink}
              >
                PO strip
              </Link>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
