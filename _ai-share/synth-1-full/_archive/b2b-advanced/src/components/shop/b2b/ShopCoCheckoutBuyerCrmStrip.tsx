'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { fetchShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile-store';
import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { ShopBuyerPricelistTierSyncBadge } from '@/components/shop/b2b/ShopBuyerPricelistTierSyncBadge';
import { Percent, RefreshCw, Tag } from 'lucide-react';

type Props = {
  collectionId: string;
};

/** Оформление · PG buyer CRM segment + pricelist assign visibility. */
export function ShopCoCheckoutBuyerCrmStrip({ collectionId }: Props) {
  const { buyerId } = useShopCoreBuyerId();
  const [profile, setProfile] = useState<ShopBuyerCrmProfile | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchShopBuyerCrmProfile(buyerId).then((res) => {
      if (cancelled) return;
      setProfile(res.profile);
      setStorageMode(res.storageMode);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [buyerId, refreshNonce]);

  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const segmentsHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return (
    <div
      className="border-border-subtle mb-3 space-y-2 rounded-md border bg-bg-surface2/40 px-3 py-2"
      data-testid="shop-co-checkout-buyer-crm-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">CRM покупателя · оформление</span>
        {storageMode ? (
          <Badge variant="outline" className="text-[9px]" data-testid="shop-co-checkout-buyer-crm-source">
            {storageMode}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[9px]"
          data-testid="shop-co-checkout-buyer-crm-refresh"
          onClick={() => setRefreshNonce((n) => n + 1)}
        >
          <RefreshCw className="mr-0.5 h-3 w-3" aria-hidden />
          Обновить
        </Button>
      </div>

      {loading ? (
        <p className="text-text-muted text-[10px]">Загрузка сегмента и прайс-листа…</p>
      ) : profile ? (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[9px]" data-testid="shop-co-checkout-buyer-crm-segment">
              {profile.segmentNameRu}
            </Badge>
            <Badge variant="outline" className="text-[9px]" data-testid="shop-co-checkout-buyer-crm-tier">
              <Tag className="mr-0.5 h-2.5 w-2.5" aria-hidden />
              {profile.priceTier}
            </Badge>
            <Badge variant="outline" className="text-[9px]" data-testid="shop-co-checkout-buyer-crm-net-terms">
              Отсрочка {profile.netTermDays} дн.
            </Badge>
            {profile.firstOrderDiscountPct != null ? (
              <Badge variant="outline" className="text-[9px]" data-testid="shop-co-checkout-buyer-crm-discount">
                <Percent className="mr-0.5 h-2.5 w-2.5" aria-hidden />−{profile.firstOrderDiscountPct}%
              </Badge>
            ) : null}
            <ShopBuyerPricelistTierSyncBadge
              collectionId={collectionId}
              priceTier={profile.priceTier}
              testIdPrefix="shop-co-checkout-buyer-crm"
              reloadNonce={refreshNonce}
            />
          </div>
          {profile.assignedAt ? (
            <p className="text-text-muted text-[10px]" data-testid="shop-co-checkout-buyer-crm-assigned-at">
              Назначено: {new Date(profile.assignedAt).toLocaleString('ru-RU')}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-text-muted text-[10px]">
          CRM-профиль недоступен — откройте прайс-лист бренда для назначения сегмента.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="h-7 text-[10px]">
          <Link href={pricelistHref} data-testid="shop-co-checkout-buyer-crm-pricelist-link">
            Прайс-лист бренда
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-7 text-[10px]">
          <Link href={segmentsHref} data-testid="shop-co-checkout-buyer-crm-segments-link">
            Сегменты CRM
          </Link>
        </Button>
      </div>
    </div>
  );
}
