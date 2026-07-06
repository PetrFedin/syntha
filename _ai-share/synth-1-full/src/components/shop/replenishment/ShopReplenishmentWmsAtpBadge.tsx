'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  formatShopReplenishmentWmsAtpBadgeRu,
  formatShopReplenishmentWmsAtpSourceBadgeRu,
  SHOP_REPLENISHMENT_WMS_ATP_FEED_API,
  type ShopReplenishmentWmsAtpFeedSource,
} from '@/lib/platform/shop-replenishment-wms-atp-feed';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Props = {
  collectionId?: string;
  buyerId?: string;
};

type FeedPayload = {
  ok?: boolean;
  source?: ShopReplenishmentWmsAtpFeedSource;
  atpTotal?: number;
  skuCount?: number;
  wmsEnabled?: boolean;
  messageRu?: string;
};

/** Wave WG — live WMS ATP feed badge on replenishment Stock·ATP tab. */
export function ShopReplenishmentWmsAtpBadge({ collectionId, buyerId }: Props) {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<ShopReplenishmentWmsAtpFeedSource | null>(null);
  const [atpTotal, setAtpTotal] = useState(0);
  const [skuCount, setSkuCount] = useState(0);

  useEffect(() => {
    if (!collectionId?.trim()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams({ collection: collectionId, limit: '24' });
    if (buyerId?.trim()) qs.set('buyerId', buyerId.trim());

    void (async () => {
      try {
        const res = await fetch(`${SHOP_REPLENISHMENT_WMS_ATP_FEED_API}?${qs.toString()}`, {
          headers: buildWorkshop2ApiRequestHeaders({ Accept: 'application/json' }),
          cache: 'no-store',
        });
        const json = (await res.json()) as FeedPayload;
        if (cancelled) return;
        setSource(json.source ?? null);
        setAtpTotal(json.atpTotal ?? 0);
        setSkuCount(json.skuCount ?? 0);
      } catch {
        if (!cancelled) {
          setSource(null);
          setAtpTotal(0);
          setSkuCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buyerId, collectionId]);

  const liveWms = source === 'wms' || source === 'pg+wms';
  const badgeLabel = formatShopReplenishmentWmsAtpBadgeRu({
    loading,
    liveWms,
    atpTotal,
    skuCount,
  });
  const sourceLabel = formatShopReplenishmentWmsAtpSourceBadgeRu(source);

  return (
    <>
      <Badge
        variant={liveWms && atpTotal > 0 ? 'secondary' : 'outline'}
        className={
          liveWms
            ? 'border-violet-500/40 text-violet-700'
            : source === 'pg'
              ? 'border-emerald-500/40 text-emerald-700'
              : ''
        }
        data-testid="shop-replenishment-wms-atp-badge"
        data-wms-live={liveWms ? '1' : '0'}
      >
        {badgeLabel}
      </Badge>
      {sourceLabel && !loading ? (
        <Badge
          variant="outline"
          data-testid={`shop-replenishment-stock-atp-source-${source ?? 'unknown'}`}
          className={
            source === 'pg' || source === 'pg+wms'
              ? 'border-emerald-500/40 text-emerald-700'
              : source === 'wms'
                ? 'border-violet-500/40 text-violet-700'
                : ''
          }
        >
          {sourceLabel}
        </Badge>
      ) : null}
    </>
  );
}
