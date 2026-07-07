'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { PackageCheck, ArrowLeft, Store, RotateCcw } from 'lucide-react';

const MOCK_PICKUPS = [
  { id: 'p1', orderId: 'ORD-2026-001', customer: 'Иван П.', status: 'ready', items: 2 },
  { id: 'p2', orderId: 'ORD-2026-003', customer: 'Алексей В.', status: 'awaiting', items: 1 },
];

export default function ShopBopisPage() {
  return (
    <CabinetPageContent maxWidth="2xl" className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={ROUTES.shop.home}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold uppercase">
          <Store className="h-6 w-6" /> BOPIS — выдача заказов
        </h1>
      </div>
      <p className="text-text-secondary text-sm">
        Заказы, оформленные онлайн и выбранные для самовывоза в этом магазине. Подтвердите выдачу
        или примите возврат.
      </p>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PackageCheck className="h-5 w-5" /> К выдаче
          </CardTitle>
          <CardDescription>Готовые к выдаче клиенту</CardDescription>
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
                    {p.customer} · {p.items} поз.
                  </p>
                </div>
                <Badge
                  variant={p.status === 'ready' ? 'default' : 'outline'}
                  className="text-[9px]"
                >
                  {p.status === 'ready' ? 'Готов' : 'Ожидает'}
                </Badge>
                {p.status === 'ready' && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px]">
                    Выдать
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RotateCcw className="h-5 w-5" /> Возврат в магазине
          </CardTitle>
          <CardDescription>Принять возврат по заказу с самовывозом</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Оформить возврат
          </Button>
        </CardContent>
      </Card>

      <p className="text-text-secondary text-[11px]">
        Управление со стороны бренда:{' '}
        <Link href={ROUTES.brand.bopis} className="text-accent-primary hover:underline">
          BOPIS Hub
        </Link>
      </p>
    </CabinetPageContent>
  );
}
