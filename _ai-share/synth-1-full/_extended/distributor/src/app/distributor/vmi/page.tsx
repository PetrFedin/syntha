'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Store, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const MOCK_STORES = [
  { id: 's1', name: 'Магазин Москва Тверская', stock: 45, threshold: 50, recommend: 30 },
  { id: 's2', name: 'Магазин СПб Невский', stock: 12, threshold: 40, recommend: 50 },
  { id: 's3', name: 'Магазин Казань', stock: 80, threshold: 30, recommend: 0 },
];

export default function VMIPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6 pb-16">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
          <Package className="h-6 w-6 text-emerald-600" /> VMI — Vendor Managed Inventory
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Автопополнение полок магазинов на основе данных об их продажах
        </p>
      </header>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Store className="h-4 w-4" /> Рекомендации по дозаказу
          </CardTitle>
          <CardDescription>Остаток ниже порога — рекомендуемый объём к заказу</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_STORES.map((s) => (
              <li
                key={s.id}
                className="bg-bg-surface2 border-border-default flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-text-secondary text-[11px]">
                    Остаток: {s.stock} · Порог: {s.threshold}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {s.recommend > 0 ? (
                    <>
                      <Badge variant="destructive" className="text-[9px]">
                        Дозаказ
                      </Badge>
                      <span className="text-sm font-black">+{s.recommend} ед.</span>
                      <Button size="sm" className="rounded-lg text-[10px]">
                        Создать заказ
                      </Button>
                    </>
                  ) : (
                    <Badge variant="secondary">OK</Badge>
                  )}
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
          <Link href={ROUTES.distributor.analytics}>Аналитика</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
