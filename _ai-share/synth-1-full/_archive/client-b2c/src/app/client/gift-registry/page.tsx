'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Share2 } from 'lucide-react';
import type { GiftRegistry, GiftRegistryItem } from '@/lib/gift-registry';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';

const MOCK_REGISTRY: GiftRegistry = {
  id: 'gr1',
  ownerUserId: 'u1',
  eventType: 'wedding',
  eventDate: '2026-06-15',
  title: 'Свадьба Марии и Ивана',
  description: 'Подарки для нашего праздника',
  createdAt: '2026-03-01T10:00:00Z',
  visibility: 'network',
  syncPurchasedAcrossNetwork: true,
  items: [
    {
      id: 'i1',
      productId: 'p1',
      title: 'Плед кашемир',
      priceRub: 15000,
      quantity: 1,
      status: 'wished',
    },
    {
      id: 'i2',
      productId: 'p2',
      title: 'Набор полотенец',
      priceRub: 4500,
      quantity: 2,
      status: 'purchased',
      purchasedByOrderId: 'ORD-1001',
      purchasedByLabel: 'Гость',
    },
    {
      id: 'i3',
      productId: 'p3',
      title: 'Ваза керамика',
      priceRub: 8900,
      quantity: 1,
      status: 'wished',
    },
  ],
};

const statusLabels: Record<GiftRegistryItem['status'], string> = {
  wished: 'В списке',
  reserved: 'Зарезервировано',
  purchased: 'Куплено',
};

export default function ClientGiftRegistryPage() {
  const links = [
    { label: 'Мои заказы', href: '/brand/pre-orders', entityType: 'order' as const },
    { label: 'Каталог', href: '/shop/b2b/matrix', entityType: 'product' as const },
    { label: 'Клиентская база (бренд)', href: '/brand/customers', entityType: 'partner' as const },
  ];

  return (
    <div className="container max-w-3xl space-y-6 py-6 pb-24">
      <ClientCabinetSectionHeader description="Свадьба, ДР, юбилей — отметьте «куплено» по всей сети. РФ." />

      <Card className="border-amber-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-amber-600" />
            {MOCK_REGISTRY.title}
          </CardTitle>
          <CardDescription>
            {MOCK_REGISTRY.eventDate} · Синхронизация по сети включена
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Share2 className="h-3.5 w-3.5" /> Поделиться
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Добавить подарок
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-amber-200 bg-amber-50/30">
        <CardContent className="py-6 text-center">
          <p className="text-sm font-medium text-amber-900">Создать новый список подарков</p>
          <p className="mt-1 text-xs text-amber-700">
            Свадьба, День рождения, юбилей — пригласите гостей и отметьте купленное.
          </p>
          <Button size="sm" className="mt-3 gap-1">
            <Plus className="h-3.5 w-3.5" /> Создать список
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Подарки в списке</CardTitle>
          <CardDescription>
            Гости могут купить из списка — статус «Куплено» обновится по всей сети магазинов.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_REGISTRY.items.map((item) => (
              <li
                key={item.id}
                className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-text-secondary text-xs">
                    {item.priceRub != null ? `${item.priceRub.toLocaleString('ru-RU')} ₽` : ''} ·{' '}
                    {statusLabels[item.status]}
                    {item.purchasedByLabel && ` · ${item.purchasedByLabel}`}
                  </p>
                </div>
                <Badge
                  variant={item.status === 'purchased' ? 'default' : 'outline'}
                  className="text-[10px]"
                >
                  {statusLabels[item.status]}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-text-muted mt-3 text-xs">
            API: создание списка, добавление позиций, отметка «куплено» из заказа — при подключении
            бэкенда.
          </p>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={links} />
    </div>
  );
}
