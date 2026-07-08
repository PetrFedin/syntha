'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { shopB2bOrderHref } from '@/lib/routes';

/** Shop order detail — canonical collection_order; legacy op pillar → buyer-tracking hash. */
export function useShopOrderDetailLegacyPillarRedirect(orderId: string): void {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pillarParam = searchParams.get('pillar');
    const hashRaw = typeof window !== 'undefined' ? window.location.hash : '';
    const legacyHash = hashRaw === '#order-production';
    if (pillarParam !== 'order_production' && !legacyHash) return;
    const hash = !hashRaw || legacyHash ? '#shop-co-buyer-tracking' : hashRaw;
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('pillar');
    const qs = sp.toString();
    router.replace(`${shopB2bOrderHref(orderId)}${qs ? `?${qs}` : ''}${hash}`, { scroll: false });
  }, [orderId, router, searchParams]);
}
