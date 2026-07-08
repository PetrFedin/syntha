'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { getBnplLinks } from '@/lib/data/entity-links';
import { listBnplTransactions } from '@/lib/api';
import type { BnplTransaction } from '@/lib/shop/bnpl-gateway';
import { ROUTES } from '@/lib/routes';

const statusLabels: Record<BnplTransaction['status'], string> = {
  pending: 'Ожидает',
  approved: 'Одобрено',
  rejected: 'Отказ',
  cancelled: 'Отменено',
};

const providerLabels: Record<BnplTransaction['provider'], string> = {
  tinkoff: 'Тинькофф',
  sber: 'Сбер',
  other: 'Другое',
};

export default function ShopBnplPage() {
  const links = getBnplLinks();
  const [transactions, setTransactions] = useState<BnplTransaction[]>([]);

  useEffect(() => {
    listBnplTransactions().then(setTransactions);
  }, []);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.shop.orders}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">POS BNPL Gateway</h1>
          <p className="text-text-secondary text-sm">
            Оформление рассрочки на кассе. РФ: Тинькофф, Сбер и др. Связь с финансами, заказами и
            Compliance.
          </p>
        </div>
      </div>

      <Card className="border-emerald-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            Последние рассрочки
          </CardTitle>
          <CardDescription>Транзакции BNPL по заказам в магазине</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {tx.orderId} · {providerLabels[tx.provider]}
                </p>
                <p className="text-text-secondary text-xs">{tx.amountRub.toLocaleString('ru')} ₽</p>
              </div>
              <Badge
                variant={tx.status === 'approved' ? 'default' : 'outline'}
                className="text-[10px]"
              >
                {statusLabels[tx.status]}
              </Badge>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            API: BNPL_GATEWAY_API — офферы, заявка, статус. Compliance: 54-ФЗ, согласия.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Финансы, заказы, Compliance</CardDescription>
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
