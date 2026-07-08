'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getBopisLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Store, RotateCcw } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

const MOCK_PICKUPS = [
  {
    id: 'p1',
    orderId: 'ORD-2026-001',
    store: 'Москва, Тверская',
    customer: 'Иван П.',
    status: 'ready',
    createdAt: '2026-03-11T10:00:00',
  },
  {
    id: 'p2',
    orderId: 'ORD-2026-002',
    store: 'СПб, Невский',
    customer: 'Мария К.',
    status: 'picked',
    createdAt: '2026-03-11T09:30:00',
  },
  {
    id: 'p3',
    orderId: 'ORD-2026-003',
    store: 'Москва, Тверская',
    customer: 'Алексей В.',
    status: 'awaiting',
    createdAt: '2026-03-11T11:00:00',
  },
];

const MOCK_RETURNS = [
  {
    id: 'r1',
    orderId: 'ORD-2026-001',
    store: 'Москва, Тверская',
    reason: 'Размер не подошёл',
    status: 'accepted',
    at: '2026-03-10T14:00:00',
  },
];

export default function BopisHubPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="BOPIS: выдача и возвраты в магазине"
        leadPlain="Заказы на выдачу в точке самовывоза и возвраты по BOPIS-заказам (мок)."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.home} aria-label="Назад в кабинет">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<Store className="size-6 shrink-0 text-muted-foreground" aria-hidden />}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border-default rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-5 w-5" /> Заказы на выдачу
            </CardTitle>
            <CardDescription>Готовы к выдаче в магазине или ожидают клиента</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {MOCK_PICKUPS.map((p) => (
                <li
                  key={p.id}
                  className="bg-bg-surface2 border-border-subtle flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold">{p.orderId}</p>
                    <p className="text-text-secondary text-[11px]">
                      {p.store} · {p.customer}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.status === 'picked'
                        ? 'secondary'
                        : p.status === 'ready'
                          ? 'default'
                          : 'outline'
                    }
                    className="text-[9px]"
                  >
                    {p.status === 'picked' ? 'Выдан' : p.status === 'ready' ? 'Готов' : 'Ожидает'}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border-default rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RotateCcw className="h-5 w-5" /> Возвраты в магазине
            </CardTitle>
            <CardDescription>Принятые в точке выдачи возвраты по BOPIS-заказам</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {MOCK_RETURNS.map((r) => (
                <li
                  key={r.id}
                  className="bg-bg-surface2 border-border-subtle flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold">{r.orderId}</p>
                    <p className="text-text-secondary text-[11px]">
                      {r.store} · {r.reason}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    {r.status === 'accepted' ? 'Принят' : r.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="text-text-secondary mt-2 text-[11px]">
              При API: синхронизация с кассой/складом и возвратами B2B.
            </p>
          </CardContent>
        </Card>
      </div>

      <RelatedModulesBlock links={getBopisLinks()} title="Склад, возвраты, BOPIS в магазине" />
    </CabinetPageContent>
  );
}
