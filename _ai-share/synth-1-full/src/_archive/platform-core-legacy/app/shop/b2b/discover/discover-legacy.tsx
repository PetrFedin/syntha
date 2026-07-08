'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Store, UserPlus, Cloud, Package } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { getSyndicationStatus } from '@/lib/b2b/content-syndication';

/** Legacy Discover: каталог брендов для ритейлеров, поиск поставщиков, запрос доступа. */
const MOCK_BRANDS = [
  {
    id: '1',
    name: 'Syntha Lab',
    slug: 'syntha-lab',
    category: 'Премиум outerwear',
    country: 'РФ',
    status: 'partner' as const,
  },
  {
    id: '2',
    name: 'Nordic Wool',
    slug: 'nordic-wool',
    category: 'Трикотаж и шерсть',
    country: 'РФ',
    status: 'partner' as const,
  },
];

export function ShopB2bDiscoverLegacyPage() {
  const [q, setQ] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    const s = getSyndicationStatus();
    setLastSynced(s.lastSyncedAt);
  }, []);

  const lastSyncedFormatted = lastSynced
    ? new Date(lastSynced).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader
        lead="Каталог брендов для закупки, поиск поставщиков. Запрос доступа — в разделе «Подать заявку». Синхронизация с PIM — при подключении интеграции."
        trailing={
          lastSyncedFormatted ? (
            <div className="text-text-secondary flex items-center gap-2 text-xs">
              <Cloud className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
              <span>Обновлено: {lastSyncedFormatted}</span>
              <Button variant="ghost" size="sm" className="text-accent-primary h-7" asChild>
                <Link href={LEGACY_ROUTES.shop.b2bCatalog}>
                  <Package className="mr-1 h-3 w-3" /> B2B-каталог
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Поиск брендов</CardTitle>
          <CardDescription>По названию, категории, стране</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Поиск бренда..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <ul className="space-y-3">
            {MOCK_BRANDS.map((b) => (
              <li
                key={b.id}
                className="border-border-default flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Store className="text-text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-text-secondary text-xs">
                      {b.category} · {b.country}
                    </p>
                  </div>
                </div>
                {b.status === 'partner' ? (
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link
                        href={`${ROUTES.shop.b2bCreateOrder}?brand=${encodeURIComponent(b.name)}`}
                      >
                        Заказать
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`${ROUTES.shop.b2bPartners}/${b.slug}`}>В карточку</Link>
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" asChild>
                    <Link
                      href={`${LEGACY_ROUTES.shop.b2bApply}?brandId=${encodeURIComponent(b.id)}&brandName=${encodeURIComponent(b.name)}`}
                    >
                      Запросить доступ
                    </Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bCatalog}>
            <Package className="mr-1 h-3 w-3" /> B2B Каталог (PIM)
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bApply}>
            <UserPlus className="mr-1 h-3 w-3" /> Подать заявку
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bPartners}>Мои бренды</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getShopB2BHubLinks()} title="Партнёры, заявка, заказы" />
    </CabinetPageContent>
  );
}
