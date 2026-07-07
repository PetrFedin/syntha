'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  SHOP_PRODUCTION_VISIBILITY_LABELS_RU,
  type ShopProductionVisibility,
} from '@/lib/platform-core-shop-production-visibility';
import { shopB2bTrackingOrderHref } from '@/lib/routes';

type Props = {
  orderId: string;
};

/** Компактно: что магазин видит в трекинге. */
export function BrandShopProductionDisclosurePreviewStrip({ orderId }: Props) {
  const oid = orderId.trim();
  const [visibility, setVisibility] = useState<ShopProductionVisibility>('milestones');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!oid) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetch(
      `/api/workshop2/b2b/orders/${encodeURIComponent(oid)}/shop-production-visibility`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          ok?: boolean;
          visibility?: ShopProductionVisibility;
        };
      })
      .then((json) => {
        if (cancelled || !json?.ok) return;
        setVisibility(json.visibility ?? 'milestones');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [oid]);

  if (!oid || loading) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-violet-200/50 bg-violet-50/20 px-2.5 py-1.5 text-[11px]"
      data-testid="brand-co-shop-disclosure-preview-strip"
    >
      <span className="text-text-secondary">
        Магазин видит: <strong>{SHOP_PRODUCTION_VISIBILITY_LABELS_RU[visibility]}</strong>
      </span>
      <Link
        href={shopB2bTrackingOrderHref(oid)}
        data-testid="brand-co-shop-disclosure-preview-tracking-link"
        className="text-accent-primary shrink-0 font-medium hover:underline"
      >
        Трекинг →
      </Link>
    </div>
  );
}
