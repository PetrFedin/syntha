'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, Map } from 'lucide-react';
import { getLiaLinks } from '@/lib/data/entity-links';
import { listLiaFeeds } from '@/lib/api';
import type { LiaStoreFeed } from '@/lib/shop/local-inventory-ads';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { ROUTES } from '@/lib/routes';

const statusLabels: Record<LiaStoreFeed['status'], string> = {
  active: 'Активен',
  paused: 'Приостановлен',
  error: 'Ошибка',
};

export default function ShopLocalInventoryAdsPage() {
  const links = getLiaLinks();
  const [feeds, setFeeds] = useState<LiaStoreFeed[]>([]);

  useEffect(() => {
    listLiaFeeds().then(setFeeds);
  }, []);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.shop.inventory}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Local Inventory Ads (LIA)</h1>
          <p className="text-text-secondary text-sm">
            Передача наличия в Google / Yandex Maps. Связь со складом, маркетингом и BOPIS.
          </p>
        </div>
      </div>

      <Card className="border-amber-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4 text-amber-600" />
            Фиды этого магазина
          </CardTitle>
          <CardDescription>
            Наличие передаётся в карты для локальной рекламы и «Где купить»
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {feeds.map((feed) => (
            <div
              key={`${feed.storeId}-${feed.channel}`}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {feed.storeName} · {feed.channel === 'google' ? 'Google' : 'Yandex'}
                </p>
                <p className="text-text-secondary text-xs">
                  {feed.itemCount} <AcronymWithTooltip abbr="SKU" /> · обновлено{' '}
                  {feed.lastSyncAt?.slice(0, 16).replace('T', ' ')}
                </p>
              </div>
              <Badge variant="default" className="text-[10px]">
                {statusLabels[feed.status]}
              </Badge>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            Настройка фидов: бренд → Маркетинг → Local Inventory Ads. API: LOCAL_INVENTORY_ADS_API.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Склад, маркетинг, BOPIS</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <Link href={l.href}>{l.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
