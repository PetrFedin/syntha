'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  assignBrandShopBuyerCrmSegment,
  fetchBrandShopBuyerCrmAssignment,
} from '@/lib/b2b/brand-crm-shop-buyer-assign-store';
import { fetchBrandCrmSegments } from '@/lib/b2b/brand-crm-segments-store';
import type { BrandCrmSegmentObject } from '@/lib/b2b/brand-crm-segment-object';
import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
import { SHOP_CORE_BUYER_PRESETS } from '@/lib/order/shop-core-buyer-context';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { shopB2bCheckoutCollectionHref, shopB2bOrdersCollectionRegistryHref } from '@/lib/routes';

type Props = {
  collectionId: string;
};

/** Brand CRM · assign segment + pricelist tier to shop buyer (greenfield onboarding). */
export function BrandCrmShopBuyerAssignPanel({ collectionId }: Props) {
  const [buyerId, setBuyerId] = useState('shop2');
  const [segmentKey, setSegmentKey] = useState('retail');
  const [segments, setSegments] = useState<BrandCrmSegmentObject[]>([]);
  const [profile, setProfile] = useState<ShopBuyerCrmProfile | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tierSynced, setTierSynced] = useState<boolean | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [segRes, profileRes] = await Promise.all([
      fetchBrandCrmSegments(),
      fetchBrandShopBuyerCrmAssignment(buyerId),
    ]);
    setSegments(segRes.segments);
    setProfile(profileRes.profile);
    setStorageMode(profileRes.storageMode);
    if (profileRes.profile?.segmentKey) setSegmentKey(profileRes.profile.segmentKey);
    else if (segRes.segments[0]?.segmentKey) setSegmentKey(segRes.segments[0].segmentKey);
    setLoading(false);
  }, [buyerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const shopMonetization = buildShopShowroomBuySession({ collectionId });
  const registryHref = `${shopB2bOrdersCollectionRegistryHref()}?buyer=${encodeURIComponent(buyerId)}`;
  const checkoutHref = shopB2bCheckoutCollectionHref(collectionId);

  const handleAssign = async () => {
    setAssigning(true);
    setMessage(null);
    const result = await assignBrandShopBuyerCrmSegment({
      buyerId,
      segmentKey,
      collectionId,
      syncTierToShop: true,
    });
    setAssigning(false);
    if (!result.ok || !result.profile) {
      setMessage('Не удалось назначить сегмент — проверьте PG/core:bootstrap.');
      setTierSynced(null);
      return;
    }
    setProfile(result.profile);
    setStorageMode(result.storageMode);
    setTierSynced(result.tierSync?.shopSynced === true);
    setMessage(result.messageRu ?? 'Сегмент назначен.');
  };

  return (
    <Card data-testid="brand-crm-shop-buyer-assign-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Магазин · назначение сегмента</CardTitle>
        <CardDescription>
          Онбординг с нуля: назначьте сегмент и прайс-лист shop2 до первого оформления заказа.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <p className="text-text-muted text-[10px] font-semibold uppercase">Байер</p>
            <Select value={buyerId} onValueChange={setBuyerId}>
              <SelectTrigger className="h-9 w-[14rem]" data-testid="brand-crm-shop-buyer-assign-buyer-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOP_CORE_BUYER_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.labelRu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-text-muted text-[10px] font-semibold uppercase">Сегмент</p>
            <Select value={segmentKey} onValueChange={setSegmentKey}>
              <SelectTrigger className="h-9 w-[14rem]" data-testid="brand-crm-shop-buyer-assign-segment-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {segments.map((segment) => (
                  <SelectItem key={segment.segmentKey} value={segment.segmentKey}>
                    {segment.nameRu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={assigning || loading || !segmentKey}
            data-testid="brand-crm-shop-buyer-assign-submit"
            onClick={() => void handleAssign()}
          >
            {assigning ? 'Назначение…' : 'Назначить сегмент'}
          </Button>
        </div>

        {loading ? (
          <p className="text-text-muted text-xs">Загрузка профиля…</p>
        ) : profile ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" data-testid="brand-crm-shop-buyer-assign-current-segment">
              {profile.segmentNameRu}
            </Badge>
            <Badge variant="outline" data-testid="brand-crm-shop-buyer-assign-current-tier">
              {profile.priceTier}
            </Badge>
            {storageMode ? (
              <Badge variant="outline" className="text-[9px]" data-testid="brand-crm-shop-buyer-assign-source">
                {storageMode}
              </Badge>
            ) : null}
            {profile.assignedAt ? (
              <span className="text-text-muted text-[10px]" data-testid="brand-crm-shop-buyer-assign-assigned-at">
                {new Date(profile.assignedAt).toLocaleString('ru-RU')}
              </span>
            ) : null}
            {tierSynced === true ? (
              <Badge
                variant="secondary"
                className="text-[9px]"
                data-testid="brand-crm-shop-buyer-assign-tier-synced"
              >
                tier → матрица магазина
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-text-muted text-xs">Профиль не назначен — выберите сегмент и нажмите «Назначить».</p>
        )}

        {message ? (
          <p className="text-text-secondary text-xs" data-testid="brand-crm-shop-buyer-assign-message">
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 text-[10px]">
            <Link href={registryHref} data-testid="brand-crm-shop-buyer-assign-shop-registry-link">
              Реестр магазина
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-[10px]">
            <Link href={checkoutHref} data-testid="brand-crm-shop-buyer-assign-shop-checkout-link">
              Оформление магазина
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-8 text-[10px]">
            <Link href={shopMonetization.showroomHref} data-testid="brand-crm-shop-buyer-assign-shop-showroom-link">
              Шоурум магазина
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
