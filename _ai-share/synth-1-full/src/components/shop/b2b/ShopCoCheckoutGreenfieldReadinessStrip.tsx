'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { fetchShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile-store';
import { fetchShopPricelistTierSync } from '@/lib/b2b/brand-pricelist-tier-sync-store';
import { parsePriceTierId } from '@/lib/b2b/price-tiers';
import { ShopBuyerPricelistTierSyncBadge } from '@/components/shop/b2b/ShopBuyerPricelistTierSyncBadge';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** Greenfield monetization gate: CRM assign + tier sync before first checkout. */
export function ShopCoCheckoutGreenfieldReadinessStrip({ buyerId, collectionId }: Props) {
  const [crmReady, setCrmReady] = useState<boolean | null>(null);
  const [tierSynced, setTierSynced] = useState<boolean | null>(null);
  const [priceTier, setPriceTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const profileRes = await fetchShopBuyerCrmProfile(buyerId);
      if (cancelled) return;
      const profile = profileRes.profile;
      setCrmReady(Boolean(profile?.assignedAt));
      setPriceTier(profile?.priceTier ?? null);

      const tierId = parsePriceTierId(profile?.priceTier);
      if (!tierId) {
        setTierSynced(false);
        setLoading(false);
        return;
      }
      const syncRes = await fetchShopPricelistTierSync(collectionId);
      if (cancelled) return;
      const row = syncRes.rows?.find((r) => r.tierId === tierId);
      setTierSynced(row?.shopSynced === true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [buyerId, collectionId]);

  const assignHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const ready = crmReady === true && tierSynced === true;

  return (
    <div
      className="border-border-subtle mb-3 space-y-2 rounded-md border bg-bg-surface2/40 px-3 py-2"
      data-testid="shop-co-checkout-greenfield-readiness-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          Готовность нового магазина
        </span>
        {loading ? (
          <Badge variant="outline" className="text-[9px]">
            Проверка…
          </Badge>
        ) : ready ? (
          <Badge variant="secondary" className="text-[9px]" data-testid="shop-co-checkout-greenfield-ready">
            Готово · можно оформлять
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[9px]" data-testid="shop-co-checkout-greenfield-pending">
            Нужно назначение в CRM бренда
          </Badge>
        )}
      </div>

      {!loading ? (
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <Badge
            variant={crmReady ? 'secondary' : 'outline'}
            data-testid="shop-co-checkout-greenfield-crm-ready"
          >
            CRM {crmReady ? '✓' : '—'}
          </Badge>
          {priceTier ? (
            <ShopBuyerPricelistTierSyncBadge
              collectionId={collectionId}
              priceTier={priceTier}
              testIdPrefix="shop-co-checkout-greenfield"
            />
          ) : (
            <Badge variant="outline" data-testid="shop-co-checkout-greenfield-tier-pending">
              Синхронизация тира —
            </Badge>
          )}
        </div>
      ) : null}

      {!loading && !ready ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="h-7 text-[10px]">
            <Link href={assignHref} data-testid="shop-co-checkout-greenfield-brand-assign-link">
              Назначение в CRM бренда
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function isShopGreenfieldBuyer(buyerId: string): boolean {
  return buyerId.trim() === 'shop2';
}

export function shopGreenfieldPostCheckoutRegistryHref(input: {
  orderId: string;
  buyerId: string;
  collectionId: string;
}): string {
  const params = new URLSearchParams();
  params.set('order', input.orderId.trim());
  params.set('buyer', input.buyerId.trim());
  params.set('collection', input.collectionId.trim());
  return `/shop/b2b/orders?${params.toString()}`;
}
