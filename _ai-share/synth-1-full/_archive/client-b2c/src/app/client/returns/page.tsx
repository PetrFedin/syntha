'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';

export default function ClientReturnsPage() {
  return (
    <div className="container max-w-4xl space-y-6 py-6 pb-24">
      <ClientCabinetSectionHeader />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Мои возвраты
          </CardTitle>
          <CardDescription>Список возвратов будет доступен после подключения API.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-sm">
            Связанные разделы:{' '}
            <Link href={ROUTES.client.orders} className="text-accent-primary underline">
              Мои заказы
            </Link>
            ,{' '}
            <Link href={ROUTES.client.tryBeforeYouBuy} className="text-accent-primary underline">
              Try Before You Buy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
