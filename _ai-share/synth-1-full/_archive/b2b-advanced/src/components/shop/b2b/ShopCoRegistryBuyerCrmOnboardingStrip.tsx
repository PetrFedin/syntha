'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildShopB2bPartnersSession } from '@/lib/b2b/shop-b2b-partners-workspace';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { fetchShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile-store';
import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
import { shopB2bCheckoutCollectionHref } from '@/lib/routes';
import { ShopBuyerPricelistTierSyncBadge } from '@/components/shop/b2b/ShopBuyerPricelistTierSyncBadge';
import { Percent, RefreshCw, Tag } from 'lucide-react';

type Props = {
  buyerId: string;
  collectionId: string;
  showroomHref: string;
  matrixHref: string;
};

export function ShopCoRegistryBuyerCrmOnboardingStrip({
  buyerId,
  collectionId,
  showroomHref,
  matrixHref,
}: Props) {
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

  const partners = buildShopB2bPartnersSession({ collectionId });

  return (
    <div
      className="border-border-subtle space-y-3 rounded-lg border bg-bg-surface2/40 px-4 py-4"
      data-testid="shop-co-registry-buyer-crm-onboarding"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">CRM-профиль покупателя</p>
        {storageMode ? (
          <Badge variant="outline" className="text-[9px] uppercase" data-testid="shop-co-registry-buyer-crm-source">
            {storageMode}
          </Badge>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-[10px]"
          data-testid="shop-co-registry-buyer-crm-refresh"
          onClick={() => setRefreshNonce((n) => n + 1)}
        >
          <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
          Обновить
        </Button>
      </div>

      {loading ? (
        <p className="text-text-secondary text-xs">Загрузка сегмента и условий…</p>
      ) : profile ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" data-testid="shop-co-registry-buyer-crm-segment">
              {profile.segmentNameRu}
            </Badge>
            <Badge variant="outline" data-testid="shop-co-registry-buyer-crm-tier">
              <Tag className="mr-1 h-3 w-3" aria-hidden />
              {profile.priceTier}
            </Badge>
            <Badge variant="outline" data-testid="shop-co-registry-buyer-crm-net-terms">
              Net {profile.netTermDays} дн.
            </Badge>
            {profile.firstOrderDiscountPct != null ? (
              <Badge variant="outline" data-testid="shop-co-registry-buyer-crm-discount">
                <Percent className="mr-1 h-3 w-3" aria-hidden />−{profile.firstOrderDiscountPct}%
              </Badge>
            ) : null}
            <ShopBuyerPricelistTierSyncBadge
              collectionId={collectionId}
              priceTier={profile.priceTier}
              testIdPrefix="shop-co-registry-buyer-crm"
              reloadNonce={refreshNonce}
            />
          </div>
          {profile.onboardingNoteRu ? (
            <p className="text-text-secondary text-xs leading-relaxed">{profile.onboardingNoteRu}</p>
          ) : (
            <p className="text-text-secondary text-xs leading-relaxed">
              {profile.buyerLabelRu}: сегмент «{profile.segmentNameRu}» назначен брендом — прайс-лист и
              net terms применятся при checkout.
            </p>
          )}
          <p className="text-text-muted text-[10px]" data-testid="shop-co-registry-buyer-crm-assigned-at">
            Назначено: {new Date(profile.assignedAt).toLocaleString('ru-RU')}
          </p>
        </div>
      ) : (
        <p className="text-text-secondary text-xs">CRM-сегмент временно недоступен — откройте витрину или партнёров.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link href={showroomHref} data-testid="shop-co-registry-onboarding-showroom">
            Витрина · {collectionId}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link href={matrixHref} data-testid="shop-co-registry-onboarding-matrix">
            Матрица заказа
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link href={partners.discoverHref} data-testid="shop-co-registry-onboarding-partners">
            Партнёры
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link
            href={brandCrmSegmentationFeatureHref('pricelist', collectionId)}
            data-testid="shop-co-registry-onboarding-brand-pricelist"
          >
            Прайс-лист бренда
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link href={shopB2bCheckoutCollectionHref(collectionId)} data-testid="shop-co-registry-onboarding-checkout">
            Оформление
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link href={partners.landedMarginHref} data-testid="shop-co-registry-onboarding-landed-margin">
            Landed margin
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase">
          <Link href={partners.brandCrmSegmentsHref} data-testid="shop-co-registry-onboarding-brand-crm">
            Brand CRM
          </Link>
        </Button>
      </div>
    </div>
  );
}
