'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Package, Tag, Megaphone, Archive, RefreshCcw, FileText } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const eventIcons: { [key: string]: React.ElementType } = {
  'Листинг запрошен': Package,
  'Цена изменена': Tag,
  'Запрос на скидку': Megaphone,
  'Товар архивирован': Archive,
  'Товар восстановлен': RefreshCcw,
};

const mockHistory = [
  { event: 'Листинг запрошен', date: '2024-07-01 10:00', user: 'Демо-магазин · Москва 1' },
  { event: 'Листинг одобрен', date: '2024-07-01 14:00', user: 'Бренд "Syntha Lab"' },
  {
    event: 'Цена изменена',
    date: '2024-07-15 11:30',
    user: 'Бренд "Syntha Lab"',
    details: 'Старая цена: 22000 ₽, Новая цена: 24500 ₽',
  },
  {
    event: 'Запрос на скидку 20%',
    date: '2024-07-20 09:00',
    user: 'Демо-магазин · Москва 1',
    status: 'отклонен брендом',
  },
  {
    event: 'Товар архивирован',
    date: '2024-07-25 18:00',
    user: 'Автоматически (нет в наличии)',
    details: 'Остаток 0 более 30 дней',
  },
  { event: 'Товар восстановлен', date: '2024-07-28 12:00', user: 'Демо-магазин · Москва 1' },
  {
    event: 'Листинг запрошен (повторно)',
    date: '2024-07-28 12:01',
    user: 'Демо-магазин · Москва 1',
  },
];

export default function SkuHistoryPage({
  params: paramsPromise,
}: {
  params: Promise<{ skuId: string }>;
}) {
  const params = use(paramsPromise);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === params.skuId);
    setProduct(foundProduct);
  }, [params.skuId]);

  if (!product) {
    return null;
  }

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.shop.inventory}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">История действий: {product.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Хронология событий</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-gray-200 dark:border-gray-700">
            {mockHistory.map((item, index) => {
              const Icon = eventIcons[item.event.split(' ')[0]] || FileText;
              return (
                <li key={index} className="mb-10 ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary ring-8 ring-background">
                    <Icon className="h-3 w-3 text-secondary-foreground" />
                  </span>
                  <h3 className="mb-1 flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    {item.event}
                    {item.status && (
                      <span className="ml-3 mr-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                        {item.status}
                      </span>
                    )}
                  </h3>
                  <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    {new Date(item.date).toLocaleString('ru-RU')}
                  </time>
                  <p className="text-sm text-muted-foreground">Инициатор: {item.user}</p>
                  {item.details && (
                    <p className="mt-1 text-sm">
                      Детали: <span className="font-semibold">{item.details}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
