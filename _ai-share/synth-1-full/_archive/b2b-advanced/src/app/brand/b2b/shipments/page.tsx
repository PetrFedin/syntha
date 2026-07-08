'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, ArrowLeft, Send } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getB2BLinks } from '@/lib/data/entity-links';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';

/** JOOR/Zalando: ASN (Advanced Shipping Notice) со стороны бренда — создание отгрузок, статусы. */
const MOCK_ASN = [
  {
    id: 'ASN-1',
    orderId: 'B2B-0012',
    partner: 'Podium (Москва)',
    status: 'В пути',
    sentAt: '2025-03-12',
  },
  { id: 'ASN-2', orderId: 'B2B-0011', partner: 'ЦУМ', status: 'Доставлено', sentAt: '2025-03-08' },
];

export default function ShipmentsPage() {
  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.b2bOrders}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
            <Truck className="h-6 w-6" /> Отгрузки (<AcronymWithTooltip abbr="ASN" />)
          </h1>
          <p className="text-text-secondary mt-0.5 text-sm">
            Advanced Shipping Notice: создание отгрузки, уведомление ритейлера, трекинг.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Действия</CardTitle>
          <CardDescription>
            Отправить ASN по заказу — ритейлер увидит статус в «Карте поставок»
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" /> Создать ASN по заказу
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Отгрузки</CardTitle>
          <CardDescription>История ASN по заказам</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_ASN.map((s) => (
              <li
                key={s.id}
                className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{s.id}</p>
                  <p className="text-text-secondary text-xs">
                    Заказ {s.orderId} · {s.partner} · {s.sentAt}
                  </p>
                </div>
                <Badge variant="outline">{s.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getB2BLinks()} title="B2B заказы, логистика, партнёры" />
    </CabinetPageContent>
  );
}
