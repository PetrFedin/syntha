'use client';

import Link from 'next/link';
import Image from 'next/image';
import { notFound, useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES, shopB2bOrderHref } from '@/lib/routes';
import { tid } from '@/lib/ui/test-ids';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import {
  getCatalogBrandBySlug,
  PLATFORM_CORE_CONNECTED_BRAND_SLUG,
} from '@/lib/data/catalog-brands';
import {
  getPlatformCoreCollectionLabel,
  resolvePageCollectionId,
} from '@/lib/platform-core-hub-matrix';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

type Props = {
  brandSlug: string;
};

export function ShopB2bPartnerBrandDetailCorePage({ brandSlug }: Props) {
  const searchParams = useSearchParams();
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: ['operational', 'allocation'],
    actorRole: 'shop',
  });
  const brand = getCatalogBrandBySlug(brandSlug);
  if (!brand) notFound();
  if (brand.slug !== PLATFORM_CORE_CONNECTED_BRAND_SLUG) notFound();

  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const collectionLabel = getPlatformCoreCollectionLabel(collectionId);
  const connected = true;
  const showroomHref = `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`;
  const matrixHref = `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`;

  return (
    <CabinetPageContent
      maxWidth="4xl"
      className="space-y-6 px-4 py-6 pb-24 sm:px-6"
      data-testid={tid.page('shop-b2b-partner-detail')}
    >
      <PlatformCoreListChrome
        highlightRole="shop"
        pillarId="sample_collection"
        entityLabel={`${brand.name} · ${collectionLabel}`}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.shop.b2bPartners}>Все партнёры</Link>
          </Button>
          {connected ? (
            <Button size="sm" asChild>
              <Link href={matrixHref}>Матрица</Link>
            </Button>
          ) : null}
        </div>
        <Card>
          <CardContent className="flex flex-row items-start gap-4 pt-6">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt=""
                width={48}
                height={48}
                className="rounded-full border object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <CardDescription>{brand.description}</CardDescription>
              <p className="text-text-muted mt-2 text-xs">
                {brand.countryOfOrigin} · {brand.segment}
              </p>
            </div>
            <Badge variant={connected ? 'default' : 'secondary'}>
              {connected ? 'Активен' : 'Профиль'}
            </Badge>
          </CardContent>
          {connected ? (
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={showroomHref}>Витрина</Link>
              </Button>
              {spineOrderId ? (
                <Button variant="outline" asChild>
                  <Link href={shopB2bOrderHref(spineOrderId)}>Текущий заказ</Link>
                </Button>
              ) : null}
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-text-secondary text-sm">
                Запрос доступа к лайншиту — через каталог партнёров.
              </p>
              <Button className="mt-3" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bPartnersDiscover}>Discover брендов</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
