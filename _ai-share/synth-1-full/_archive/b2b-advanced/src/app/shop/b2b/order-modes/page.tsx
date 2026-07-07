'use client';

import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { tid } from '@/lib/ui/test-ids';

const modes = [
  {
    id: 'buy-now',
    title: 'Buy Now',
    desc: 'Мгновенная отгрузка со склада',
    icon: Package,
    href: `${ROUTES.shop.b2bOrders}?mode=buy-now`,
  },
  {
    id: 'reorder',
    title: 'Reorder',
    desc: 'Повтор прошлого заказа по одному клику',
    icon: ShoppingCart,
    href: `${ROUTES.shop.b2bOrders}?mode=reorder`,
  },
  {
    id: 'pre-order',
    title: 'Pre-order',
    desc: 'Предзаказ коллекции к дате дропа',
    icon: Calendar,
    href: `${ROUTES.shop.b2bOrders}?mode=pre-order`,
  },
];

export default function OrderModesPage() {
  return (
    <ShopB2bNuOrderScope
      className="min-h-[200px] space-y-6"
      data-testid={tid.page('shop-b2b-order-modes')}
    >
      <ShopB2bContentHeader lead="Buy Now, Reorder и Pre-order в одном потоке оформления оптового заказа." />

      <Card className="border-accent-primary/20">
        <CardHeader>
          <CardTitle>Выберите режим закупки</CardTitle>
          <CardDescription>
            В корзине и при создании заказа можно переключать режим — отгрузка, повтор или
            предзаказ.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link key={mode.id} href={mode.href}>
                <Card className="border-border-subtle hover:border-accent-primary/30 hover:bg-accent-primary/10 h-full cursor-pointer transition-colors">
                  <CardContent className="pt-6">
                    <div className="bg-accent-primary/15 mb-3 flex size-12 items-center justify-center rounded-xl">
                      <Icon className="text-accent-primary size-6" />
                    </div>
                    <h3 className="font-semibold">{mode.title}</h3>
                    <p className="text-text-secondary mt-1 text-sm">{mode.desc}</p>
                    <Badge variant="outline" className="mt-3">
                      Перейти
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <RelatedModulesBlock
        title="Связанные разделы"
        className="mt-2"
        links={getShopB2BHubLinks().filter(
          (l) =>
            l.href === ROUTES.shop.b2bOrderMode ||
            l.href === ROUTES.shop.b2bMatrix ||
            l.href === ROUTES.shop.b2bOrders
        )}
      />
    </ShopB2bNuOrderScope>
  );
}
