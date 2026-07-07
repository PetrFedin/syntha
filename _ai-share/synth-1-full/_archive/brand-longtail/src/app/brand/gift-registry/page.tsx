'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getGiftRegistryLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { Gift, ArrowLeft, Users } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

const MOCK_REGISTRIES = [
  {
    id: 'gr1',
    name: 'Свадьба Анны и Михаила',
    owner: 'Анна К.',
    eventDate: '2026-05-15',
    itemsTotal: 12,
    itemsClaimed: 5,
    status: 'active',
  },
  {
    id: 'gr2',
    name: 'День рождения ребёнка',
    owner: 'Ольга С.',
    eventDate: '2026-04-20',
    itemsTotal: 8,
    itemsClaimed: 8,
    status: 'fulfilled',
  },
];

export default function GiftRegistryManagerPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Gift Registry Manager"
        leadPlain="Списки подарков: создание и редактирование реестров (свадьба, день рождения), товары из каталога, отображение гостям. Связь с заказами и CRM."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.home} aria-label="Назад в кабинет">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Gift className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.client.giftRegistry}>Список подарков (клиент)</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.preOrders}>Розничные заказы</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.customerIntelligence}>CRM</Link>
            </Button>
          </div>
        }
      />

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" /> Реестры подарков
          </CardTitle>
          <CardDescription>
            Созданные списки, дата события, сколько позиций выкуплено. При API — привязка к заказам
            и уведомления.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_REGISTRIES.map((r) => (
              <li
                key={r.id}
                className="border-border-default bg-bg-surface2 flex items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-text-secondary text-[11px]">
                    Владелец: {r.owner} · Событие:{' '}
                    {new Date(r.eventDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-xs">
                    {r.itemsClaimed}/{r.itemsTotal} выкуплено
                  </span>
                  <Badge
                    variant={r.status === 'fulfilled' ? 'default' : 'secondary'}
                    className="text-[9px]"
                  >
                    {r.status === 'fulfilled' ? 'Завершён' : 'Активен'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-3 gap-2" disabled title="При API">
            <Gift className="h-4 w-4" /> Создать реестр
          </Button>
          <p className="text-text-secondary mt-2 text-[11px]">
            Импорт контента из 1С/Excel: при API — выгрузка реестров и заказов по ним.
          </p>
        </CardContent>
      </Card>

      <RelatedModulesBlock
        links={getGiftRegistryLinks()}
        title="Клиентский список подарков, заказы, CRM"
      />
    </CabinetPageContent>
  );
}
