'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATALOG_BRANDS } from '@/lib/data/catalog-brands';
import {
  catalogBrandToShopB2bPartnership,
  type ShopB2bPartnership,
} from '@/lib/shop/shop-b2b-partnerships';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { useShopB2bPartnerships } from '@/hooks/use-shop-b2b-partnerships';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { ShopB2bPartnerInviteRequestPanel } from '@/components/shop/ShopB2bPartnerInviteRequestPanel';

function mergePartnersDisplay(
  partnerships: ShopB2bPartnership[],
  collectionId: string,
  source: 'pg' | 'fallback' | null
): ShopB2bPartnership[] {
  const connected = partnerships.filter((p) => p.status === 'connected');
  const requested = partnerships.filter((p) => p.status === 'requested');
  const reservedIds = new Set([...connected, ...requested].map((p) => p.brandId));
  const profileFromCatalog = CATALOG_BRANDS.filter((b) => !reservedIds.has(b.id)).map((brand) =>
    catalogBrandToShopB2bPartnership(brand, {
      status: 'profile',
      source: source ?? 'fallback',
      collectionId,
    })
  );
  const profileFromApi = partnerships.filter((p) => p.status === 'profile');
  const profileIds = new Set(profileFromCatalog.map((p) => p.brandId));
  const extraProfile = profileFromApi.filter((p) => !profileIds.has(p.brandId));
  return [...connected, ...requested, ...profileFromCatalog, ...extraProfile];
}

type Props = {
  collectionId: string;
};

export function ShopB2bPartnersDiscoverGrid({ collectionId }: Props) {
  const { partnerships, source, loadState, refresh } = useShopB2bPartnerships({
    enabled: true,
    collectionId,
  });

  const displayPartners = useMemo(
    () => mergePartnersDisplay(partnerships, collectionId, source),
    [partnerships, collectionId, source]
  );
  const connectedPartners = displayPartners.filter((p) => p.status === 'connected');

  return (
    <div
      data-testid="shop-sc-partners-panel"
      data-audit-legacy="shop-b2b-partners-discover"
      className={hubGadget.root}
    >
      <p
        className={hubGadget.muted}
        data-testid="shop-sc-partners-source-note"
        data-audit-legacy="partners-discover-source-note"
      >
        {loadState === 'loading'
          ? 'Загрузка…'
          : loadState === 'error'
            ? 'PG недоступен · показан каталог'
            : `${connectedPartners.length} подключён · ${getPlatformCoreCollectionLabel(collectionId)}${source === 'pg' ? ' · PG' : source === 'fallback' ? ' · каталог' : ''}`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {displayPartners.map((brand) => {
          const connected = brand.status === 'connected';
          const requested = brand.status === 'requested';
          return (
            <Card
              key={brand.brandId}
              className="overflow-hidden"
              data-testid={`shop-sc-partners-card-${brand.brandId}`}
              data-audit-legacy={`partners-discover-card-${brand.brandId}`}
            >
              <div className="relative h-36 w-full bg-bg-surface2">
                {brand.coverImage ? (
                  <Image
                    src={brand.coverImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{brand.name}</p>
                    <p className="text-xs text-white/80">{brand.segment}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={connected ? 'default' : requested ? 'outline' : 'secondary'}>
                      {connected ? 'Подключён' : requested ? 'Заявка' : 'Профиль'}
                    </Badge>
                    {(connected || requested) && brand.source === 'pg' ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-900"
                        data-testid={`shop-sc-partners-source-pg-${brand.brandId}`}
                      >
                        PG
                      </Badge>
                    ) : !connected && source === 'fallback' ? (
                      <Badge
                        variant="outline"
                        className="text-[9px]"
                        data-testid={`shop-sc-partners-source-fallback-${brand.brandId}`}
                      >
                        Каталог
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <CardContent className="space-y-3 pt-3">
                <p className="text-text-secondary text-xs">
                  {brand.countryOfOrigin} · {brand.categories.slice(0, 2).join(', ')}
                  {brand.orderCount > 0 ? ` · ${brand.orderCount} заказ(ов) W2` : null}
                </p>
                {brand.collectionIds.length > 0 ? (
                  <div
                    className="flex flex-wrap gap-1"
                    data-testid={`shop-sc-partners-collections-${brand.brandId}`}
                    data-audit-legacy={`partners-discover-collections-${brand.brandId}`}
                  >
                    {brand.collectionIds.map((cid) => (
                      <Badge
                        key={cid}
                        variant={cid === collectionId ? 'default' : 'outline'}
                        className="text-[9px]"
                        data-testid={`shop-sc-partners-live-pg-collection-${brand.brandId}-${cid}`}
                      >
                        {getPlatformCoreCollectionLabel(cid)}
                        {!connected && brand.source === 'pg' ? ' · live PG' : null}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {connected ? (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link
                        href={brand.showroomHref}
                        data-testid={`shop-sc-partners-showroom-${brand.brandId}`}
                        data-audit-legacy={`partners-discover-showroom-${brand.brandId}`}
                      >
                        Витрина
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={brand.matrixHref}
                        data-testid={`shop-sc-partners-matrix-${brand.brandId}`}
                        data-audit-legacy={`partners-discover-matrix-${brand.brandId}`}
                      >
                        Матрица
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ShopB2bPartnerInviteRequestPanel
                    brandId={brand.brandId}
                    brandName={brand.name}
                    status={brand.status}
                    collectionId={collectionId}
                    onPartnershipChange={refresh}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
