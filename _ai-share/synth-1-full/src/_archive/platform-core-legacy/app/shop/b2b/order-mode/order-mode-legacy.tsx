'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { Zap, RefreshCcw, Calendar, ArrowRight, Package, History, Layers } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** NuOrder-style: один экран выбора режима заказа (Buy Now / Reorder / Pre-order). */
const modes: Array<{
  id: string;
  label: string;
  description: string;
  icon: typeof Zap;
  href: string;
  iconBg: string;
  iconColor: string;
}> = [
  {
    id: 'buy_now',
    label: 'Buy Now',
    description:
      'Мгновенная отгрузка со склада. Выберите товары и оформите заказ — отгрузка в текущем цикле.',
    icon: Zap,
    href: `${ROUTES.shop.b2bMatrix}?mode=buy_now`,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'reorder',
    label: 'Reorder',
    description:
      'Повтор заказа из прошлого сезона. Скопируйте прошлый заказ и измените позиции или количество.',
    icon: RefreshCcw,
    href: LEGACY_ROUTES.shop.b2bReorder,
    iconBg: 'bg-accent-primary/15',
    iconColor: 'text-accent-primary',
  },
  {
    id: 'pre_order',
    label: 'Pre-order',
    description: 'Предзаказ на коллекцию. Дропы по сезонам — заказ до поступления товара на склад.',
    icon: Calendar,
    href: `${ROUTES.shop.b2bMatrix}?mode=pre_order`,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

export function ShopB2bOrderModeLegacyPage() {
  return (
    <ShopB2bNuOrderScope>
      <ShopB2bContentHeader lead="NuOrder-style: выберите тип заказа — один поток для каталога и матрицы." />
      <div className="grid gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.id}
              className="border-border-default hover:border-border-default transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl ${m.iconBg} flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${m.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{m.label}</CardTitle>
                      <CardDescription className="mt-0.5">{m.description}</CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={m.href}>
                      К заказу <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bCatalog}>
            <Package className="mr-1 h-3 w-3" /> Каталог
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bAssortmentPlanning}>
            <Layers className="mr-1 h-3 w-3" /> Планирование ассортимента
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrders}>
            <History className="mr-1 h-3 w-3" /> Мои заказы
          </Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Матрица, EZ Order, аналитика, выставки"
        className="mt-6"
      />
    </ShopB2bNuOrderScope>
  );
}
