'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const MOCK_AGENTS = [
  { id: '1', name: 'Иван Петров', deals: 12, volume: 2400000, commission: 72000, paid: true },
  { id: '2', name: 'Мария Сидорова', deals: 8, volume: 1800000, commission: 54000, paid: false },
];

export default function CommissionsPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6 pb-16">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
          <DollarSign className="h-6 w-6 text-emerald-600" /> Sub-Agent Commission Dash
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Прозрачный расчёт комиссий торговых представителей
        </p>
      </header>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" /> Представители
          </CardTitle>
          <CardDescription>Сделки, объём и комиссия 3% от объёма</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_AGENTS.map((a) => (
              <li
                key={a.id}
                className="bg-bg-surface2 border-border-default flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="font-bold">{a.name}</p>
                  <p className="text-text-secondary text-[11px]">
                    {a.deals} сделок · {a.volume.toLocaleString()} ₽
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-600">
                    {a.commission.toLocaleString()} ₽
                  </span>
                  <Badge variant={a.paid ? 'secondary' : 'default'}>
                    {a.paid ? 'Выплачено' : 'К выплате'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.home}>Кабинет</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.orders}>Заказы</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.vmi}>VMI</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
