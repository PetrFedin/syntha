'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { TrendingUp, Bell, Package, Calendar } from 'lucide-react';
import { getProductLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';

const MOCK_DROPS = [
  {
    id: 'd1',
    name: 'SS26 Drop 2',
    brand: 'Synth Brand',
    date: '15.04.2026',
    slots: 50,
    reserved: 12,
    minAmount: 50000,
  },
  {
    id: 'd2',
    name: 'FW26 Early Bird',
    brand: 'Synth Brand',
    date: '01.08.2026',
    slots: 30,
    reserved: 8,
    minAmount: 100000,
  },
];

export default function FashionInvestingPage() {
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());

  const toggleNotify = (id: string) => {
    setSubscribed((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <SectionInfoCard
        title="Fashion Social Investing"
        description="Инвестиции в дропы брендов: подписка на уведомления о старте, резерв слотов. Связь с предзаказами и B2B."
        icon={TrendingUp}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Дропы
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.preOrders}>Предзаказы</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Fashion Social Investing</h1>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Предстоящие дропы
          </CardTitle>
          <CardDescription>
            Подпишитесь на уведомление о старте или оставьте заявку на участие
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_DROPS.map((d) => (
              <li
                key={d.id}
                className="bg-bg-surface2 border-border-default flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="font-bold">{d.name}</p>
                  <p className="text-text-secondary text-[11px]">
                    {d.brand} · <Calendar className="inline h-3 w-3" /> {d.date}
                  </p>
                  <p className="text-text-secondary mt-1 text-[10px]">
                    Слотов: {d.reserved}/{d.slots} · мин. сумма {d.minAmount.toLocaleString()} ₽
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={subscribed.has(d.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleNotify(d.id)}
                    className="gap-1 rounded-lg text-[10px]"
                  >
                    <Bell className="h-3.5 w-3.5" />{' '}
                    {subscribed.has(d.id) ? 'Уведомление включено' : 'Уведомить о старте'}
                  </Button>
                  <Button size="sm" className="rounded-lg text-[10px]" asChild>
                    <Link href={`${ROUTES.brand.b2bOrders}?drop=${d.id}`}>Участвовать</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.preOrders}>Предзаказы</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.b2bOrders}>{B2B_ORDERS_REGISTRY_LABEL}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.finance}>Финансы</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getProductLinks()} />
    </CabinetPageContent>
  );
}
