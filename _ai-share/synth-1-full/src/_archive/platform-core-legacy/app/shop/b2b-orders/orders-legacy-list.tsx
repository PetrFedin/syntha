// @ts-nocheck — legacy dynamic-import surface; not on Platform Core golden path.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockB2BOrders } from '@/lib/order-data';
import { ROUTES } from '@/lib/routes';

/** Легаси-путь `/shop/b2b-orders` (до канона `/shop/b2b/orders`). */
export function ShopB2bOrdersLegacyListPage() {
  const [orders] = useState(mockB2BOrders);

  const statusVariant = (status: string) => {
    if (status === 'Черновик') return 'secondary' as const;
    if (status === 'Требует внимания') return 'destructive' as const;
    return 'outline' as const;
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">B2B заказы (легаси-путь)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted mb-4 text-xs">
            Устаревший URL. Канонический реестр:{' '}
            <Link href={ROUTES.shop.b2bOrders} className="font-semibold underline">
              /shop/b2b/orders
            </Link>
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заказ</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.order}>
                  <TableCell>
                    <Link
                      href={`/shop/b2b-orders/${encodeURIComponent(o.order)}`}
                      className="font-medium underline"
                    >
                      {o.order}
                    </Link>
                  </TableCell>
                  <TableCell>{o.brand}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {o.amount?.toLocaleString('ru-RU')} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href={ROUTES.shop.b2bOrders}>Перейти в канонический реестр</Link>
          </Button>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
