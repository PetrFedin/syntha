'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const MOCK_LAST_PURCHASE = { name: 'Cyber Parka', orderId: '4501', date: '2 дня назад' };
const MOCK_RECOMMENDATIONS = [
  { id: '1', name: 'Cargo Pants', reason: 'Дополняет образ', price: '9 500 ₽' },
  { id: '2', name: 'Neural Tee', reason: 'Базовая пара', price: '4 500 ₽' },
  { id: '3', name: 'Overshirt', reason: 'Слой под парку', price: '12 000 ₽' },
];

export default function StyleMePage() {
  return (
    <CabinetPageContent maxWidth="2xl">
      <ClientCabinetSectionHeader iconClassName="text-accent-primary" />

      <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
        <CardHeader>
          <CardTitle className="text-sm">Ваша последняя покупка</CardTitle>
          <CardDescription>Рекомендации составлены на основе этой вещи</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-bold">{MOCK_LAST_PURCHASE.name}</p>
          <p className="text-text-secondary text-[11px]">
            Заказ #{MOCK_LAST_PURCHASE.orderId} · {MOCK_LAST_PURCHASE.date}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShoppingBag className="h-4 w-4" /> Рекомендуем докупить
          </CardTitle>
          <CardDescription>Составят полный образ с вашей паркой</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_RECOMMENDATIONS.map((r) => (
              <li
                key={r.id}
                className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-text-secondary text-[11px]">{r.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{r.price}</span>
                  <Button size="sm" variant="outline" className="rounded-lg text-[10px]" asChild>
                    <Link href={ROUTES.marketroom}>
                      В каталог <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.client.home}>В кабинет</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.marketroom}>Marketroom</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.client.profileWardrobe}>Гардероб</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
