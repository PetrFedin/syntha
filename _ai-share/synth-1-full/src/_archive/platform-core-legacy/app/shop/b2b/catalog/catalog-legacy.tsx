'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Search,
  Package,
  ShoppingCart,
  ChevronRight,
  Cloud,
  RefreshCw,
  FileText,
  Factory,
  ImageIcon,
} from 'lucide-react';
import { useRbac } from '@/hooks/useRbac';
import { useNotifications } from '@/providers/notifications-provider';
import { ROUTES } from '@/lib/routes';
import { getBuyerCatalog, getSyndicationStatus, triggerSync } from '@/lib/b2b/content-syndication';
import { getCurrentBuyerRights } from '@/lib/b2b/buyer-rights';
import products from '@/lib/products';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import {
  dedupeEntityLinksByHref,
  finalizeRelatedModuleLinks,
  getShopB2bCatalogRelatedLinks,
  getSynthaThreeCoresQuickLinksForBuyer,
} from '@/lib/data/entity-links';
import { getRecommendedSize, getSizeUpWarningMessage } from '@/lib/b2b/size-fit';
import { tid } from '@/lib/ui/test-ids';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
export function ShopB2bCatalogLegacyPage() {
  const searchParams = useSearchParams();
  const { can } = useRbac();
  const { addNotification } = useNotifications();
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const [capsuleFilter, setCapsuleFilter] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [sustainabilityFilter, setSustainabilityFilter] = useState<string>('');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const canCreateOrder = can('b2b_orders', 'create');

  const catalogItems = useMemo(
    () => getBuyerCatalog(products, brandFilter || undefined, getCurrentBuyerRights()),
    [brandFilter]
  );

  const filterOptions = useMemo(() => {
    const seasons = new Set<string>();
    const capsules = new Set<string>();
    const materials = new Set<string>();
    const colors = new Set<string>();
    const sustainabilities = new Set<string>();
    catalogItems.forEach((p) => {
      if (p.season) seasons.add(p.season);
      if (p.capsule) capsules.add(p.capsule);
      if (p.material) materials.add(p.material);
      if (p.color) colors.add(p.color);
      if (p.sustainability) sustainabilities.add(p.sustainability);
    });
    return {
      seasons: Array.from(seasons).sort(),
      capsules: Array.from(capsules).sort(),
      materials: Array.from(materials).sort(),
      colors: Array.from(colors).sort(),
      sustainabilities: Array.from(sustainabilities).sort(),
    };
  }, [catalogItems]);

  const filtered = useMemo(() => {
    return catalogItems.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (seasonFilter && p.season !== seasonFilter) return false;
      if (capsuleFilter && p.capsule !== capsuleFilter) return false;
      if (materialFilter && p.material !== materialFilter) return false;
      if (colorFilter && p.color !== colorFilter && p.attributes?.color !== colorFilter)
        return false;
      if (sustainabilityFilter && p.sustainability !== sustainabilityFilter) return false;
      return true;
    });
  }, [
    catalogItems,
    search,
    seasonFilter,
    capsuleFilter,
    materialFilter,
    colorFilter,
    sustainabilityFilter,
  ]);

  useEffect(() => {
    const sku = searchParams.get('sku');
    if (sku) setSearch(sku);
  }, [searchParams]);

  useEffect(() => {
    const s = getSyndicationStatus(brandFilter || undefined);
    setLastSynced(s.lastSyncedAt);
  }, [brandFilter]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const next = await triggerSync(brandFilter || undefined);
      setLastSynced(next.lastSyncedAt);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddToCart = (item: (typeof catalogItems)[0]) => {
    addNotification({
      type: 'order',
      title: 'Добавлено в корзину',
      body: `${item.name} (${item.sku})`,
      href: ROUTES.shop.b2bCreateOrder,
    });
  };

  const lastSyncedFormatted = lastSynced
    ? new Date(lastSynced).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-6 px-4 py-6 pb-24 sm:px-6"
      data-testid={tid.page('shop-b2b-catalog')}
    >
      <ShopB2bContentHeader
        lead={
          <>
            <span>
              Fashion Cloud: каталог байера из PIM. Ассортимент, медиа, атрибуты. После выгрузки с
              валидацией брендом показываются только SKU, прошедшие контракт B2B (размерная сетка,
              состав, уход, EAN, медиа).
            </span>
            {lastSyncedFormatted ? (
              <p className="text-text-secondary mt-1 flex items-center gap-1 text-xs">
                <Cloud className="size-3" /> Последнее обновление: {lastSyncedFormatted}
              </p>
            ) : null}
          </>
        }
        trailing={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-1"
            >
              <RefreshCw className={`size-3 ${syncing ? 'animate-spin' : ''}`} />{' '}
              {syncing ? 'Синхронизация…' : 'Синхронизировать'}
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.shop.b2bOrders}>Мои заказы</Link>
            </Button>
            {canCreateOrder ? (
              <Button asChild>
                <Link href={ROUTES.shop.b2bCreateOrder}>
                  <ShoppingCart className="mr-2 size-4" /> Создать заказ
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <B2bOrderUrlContextBanner variant="shop" className="rounded-xl" />

      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-text-muted absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            data-testid="shop-b2b-catalog-search"
            placeholder="Поиск по артикулу, названию, бренду..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border-border-default h-10 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Все бренды</option>
          <option value="Syntha Lab">Syntha Lab</option>
          <option value="Nordic Wool">Nordic Wool</option>
        </select>
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="border-border-default h-10 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Сезон</option>
          {filterOptions.seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={capsuleFilter}
          onChange={(e) => setCapsuleFilter(e.target.value)}
          className="border-border-default h-10 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Капсула</option>
          {filterOptions.capsules.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          className="border-border-default h-10 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Материал</option>
          {filterOptions.materials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          className="border-border-default h-10 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Цвет</option>
          {filterOptions.colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sustainabilityFilter}
          onChange={(e) => setSustainabilityFilter(e.target.value)}
          className="border-border-default h-10 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Устойчивость</option>
          {filterOptions.sustainabilities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="hover:border-accent-primary/30 overflow-hidden transition-colors"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-[9px]">
                  {item.season || '—'}
                </Badge>
                <span className="text-text-muted text-xs font-bold">{item.sku}</span>
              </div>
              <div className="bg-bg-surface2 relative mt-2 aspect-[3/4] overflow-hidden rounded-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <CardTitle className="mt-2 text-base">{item.name}</CardTitle>
              <CardDescription>
                {item.brand} · {item.category || '—'} · MOQ {item.moq}
              </CardDescription>
              {(() => {
                const rec = getRecommendedSize({
                  productId: item.id,
                  brandName: item.brand,
                  category: item.category,
                });
                const sizeUpMsg = getSizeUpWarningMessage(item.id, item.brand, item.category);
                return (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-text-secondary text-xs font-bold">
                      Рекомендуемый размер:{' '}
                      <span className="text-accent-primary uppercase">
                        {rec.retailerSize ?? rec.size}
                      </span>
                      {rec.source === 'reviews' && ' (по отзывам)'}
                    </p>
                    {sizeUpMsg && (
                      <p className="text-[9px] font-bold text-amber-600">{sizeUpMsg}</p>
                    )}
                    <Link
                      href={ROUTES.shop.b2bSizeFinder}
                      className="text-accent-primary text-[9px] font-bold hover:underline"
                    >
                      Подбор размера / размерная сетка →
                    </Link>
                  </div>
                );
              })()}
              {item.contentChannels &&
                item.contentChannels.filter((ch) => ch.available).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.contentChannels
                      .filter((ch) => ch.available)
                      .map((ch) => (
                        <Badge
                          key={ch.channelId}
                          variant="secondary"
                          className="text-[8px] font-bold"
                        >
                          {ch.label}
                        </Badge>
                      ))}
                  </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <p className="text-lg font-bold">{item.priceFormatted}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="min-w-[100px] flex-1"
                  onClick={() => handleAddToCart(item)}
                  disabled={!canCreateOrder}
                >
                  <Package className="mr-1 size-3" /> В заказ
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link
                    href={`${ROUTES.shop.b2bMatrix}?brand=${encodeURIComponent(item.brand)}&sku=${encodeURIComponent(item.sku)}`}
                  >
                    <ChevronRight className="size-3" /> В матрицу
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" asChild>
                  <Link href={ROUTES.brand.productionTechPackStyle(String(item.id))}>
                    <FileText className="mr-1 size-3" /> Tech Pack
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" asChild>
                  <Link href={EXTENDED_ROUTES.factory.production}>
                    <Factory className="mr-1 size-3" /> Factory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-text-secondary">
            Нет товаров по запросу. Проверьте фильтр бренда или запустите синхронизацию в разделе
            бренда.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href={LEGACY_ROUTES.shop.b2bDiscover}>Discover</Link>
          </Button>
        </Card>
      )}

      <RelatedModulesBlock
        links={finalizeRelatedModuleLinks(
          dedupeEntityLinksByHref([
            ...getShopB2bCatalogRelatedLinks(),
            ...getSynthaThreeCoresQuickLinksForBuyer(),
          ])
        )}
        title="Закупка: кабинеты, B2B и ядра платформы"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
