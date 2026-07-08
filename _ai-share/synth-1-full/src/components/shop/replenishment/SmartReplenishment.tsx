'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ShoppingCart,
  RefreshCcw,
  TrendingUp,
  Package,
  Truck,
  Info,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Factory,
  BarChart3,
  Layers,
  FileText,
  Settings2,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { products as allProducts } from '@/lib/products';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type Props = {
  collectionId?: string;
  orderId?: string;
};

export default function SmartReplenishment({ collectionId, orderId }: Props) {
  const { toast } = useToast();
  const session = useMemo(
    () => buildShopReplenishmentSession({ collectionId, orderId }),
    [collectionId, orderId]
  );

  const replenishmentAlerts = useMemo(() => {
    return allProducts.slice(5, 9).map((p, i) => {
      const stock = Math.round(Math.random() * 15);
      const sellThrough = Math.round(Math.random() * 30 + 65);
      return {
        ...p,
        currentStock: stock,
        suggestedQty: Math.round((sellThrough / 10) * 10),
        sellThrough,
        daysUntilOut: Math.max(1, Math.round(stock / 2)),
        urgency: stock < 5 ? 'critical' : 'medium',
      };
    });
  }, []);

  const handleCreateOrders = () => {
    toast({
      title: 'Заказы на пополнение созданы',
      description: '4 черновика заказов отправлены брендам на согласование.',
    });
  };

  return (
    <div className="space-y-10 duration-500 animate-in fade-in">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 border-none bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            B2B Inventory Intelligence
          </Badge>
          <h1 className="text-text-primary text-sm font-black uppercase leading-none tracking-tight">
            Умное <span className="italic text-amber-500">пополнение</span>
          </h1>
          <p className="text-text-secondary mt-4 max-w-xl font-medium">
            AI анализирует ваши POS-данные и остатки, чтобы предотвратить упущенную выгоду. Система
            сама предложит, что и когда дозаказать.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-border-default text-text-secondary hover:bg-bg-surface2 h-12 rounded-xl"
            asChild
          >
            <Link href={session.rulesHref}>Правила авто-заказа</Link>
          </Button>
          <Button
            variant="outline"
            className="border-border-default text-text-secondary hover:bg-bg-surface2 h-12 rounded-xl"
            asChild
          >
            <Link href={session.stockAtpHref}>Stock · ATP</Link>
          </Button>
          <Button
            className="bg-text-primary h-12 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-xl transition-all hover:bg-amber-600"
            asChild
          >
            <Link href={session.matrixHref} onClick={handleCreateOrders}>
              <Package className="mr-2 inline h-4 w-4" />
              Заказать пополнение ({replenishmentAlerts.length})
            </Link>
          </Button>
        </div>
      </header>

      <div className={hubGadget.goldenPath} data-testid="shop-replenishment-cross-links-strip">
        <span className="text-text-muted shrink-0 text-xs">Столп 3 · связи</span>
        <span className={hubGadget.goldenSep}>·</span>
        <Link href={session.orderCommsHref} className={hubGadget.goldenLink}>
          Order tracking
        </Link>
        <span className={hubGadget.goldenSep}>·</span>
        <Link href={session.landedMarginHref} className={hubGadget.goldenLink}>
          Landed margin
        </Link>
        <span className={hubGadget.goldenSep}>·</span>
        <Link href={session.collaborativeApprovalsHref} className={hubGadget.goldenLink}>
          Совместный заказ
        </Link>
        <span className={hubGadget.goldenSep}>·</span>
        <Link href={session.inventoryOverviewHref} className={hubGadget.goldenLink}>
          Inventory
        </Link>
        <span className={hubGadget.goldenSep}>·</span>
        <Link href={session.platformMarketroomHref} className={hubGadget.goldenLink}>
          Platform marketroom
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        {/* Left: Alerts Feed */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-text-muted flex items-center gap-2 text-sm font-black uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Срочно требуется сток
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-text-muted text-[9px] font-black uppercase">
                  Критично (&lt; 3 дн)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-text-muted text-[9px] font-black uppercase">
                  Средне (&lt; 7 дн)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {replenishmentAlerts.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  'group overflow-hidden rounded-xl border-none bg-white shadow-xl transition-all duration-500 hover:-translate-y-1',
                  item.urgency === 'critical' ? 'ring-2 ring-rose-500/20' : ''
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-bg-surface2 relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl">
                      <Image
                        src={item.images[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.urgency === 'critical' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-rose-500/10 backdrop-blur-[1px]">
                          <AlertTriangle className="h-6 w-6 text-rose-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-muted mb-0.5 text-[9px] font-black uppercase">
                            {item.brand}
                          </p>
                          <h4 className="text-sm font-black uppercase leading-none tracking-tight">
                            {item.name}
                          </h4>
                        </div>
                        <Badge
                          className={cn(
                            'border-none px-2 py-0.5 text-[9px] font-black uppercase',
                            item.urgency === 'critical'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                          )}
                        >
                          {item.urgency === 'critical' ? 'Critical' : 'Alert'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <p className="text-text-muted text-[8px] font-black uppercase">
                            Текущий сток
                          </p>
                          <p className="text-text-primary text-base font-black">
                            {item.currentStock} <span className="text-[10px]">ед.</span>
                          </p>
                        </div>
                        <div className="border-border-subtle space-y-1 border-x px-6">
                          <p className="text-text-muted text-[8px] font-black uppercase">
                            Sell-Through
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-black text-emerald-600">
                              {item.sellThrough}%
                            </p>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-text-muted text-[8px] font-black uppercase">
                            Хватит на
                          </p>
                          <p
                            className={cn(
                              'text-base font-black',
                              item.daysUntilOut < 3 ? 'text-rose-500' : 'text-amber-500'
                            )}
                          >
                            {item.daysUntilOut} дн.
                          </p>
                        </div>
                      </div>
                      <div className="border-border-subtle flex items-center gap-3 border-t pt-2">
                        <div className="flex items-center gap-1.5">
                          <Activity className="text-accent-primary h-3 w-3" />
                          <span className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                            Live API Stock:
                          </span>
                          <span className="text-accent-primary text-[9px] font-bold">
                            Sync Active
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <span className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                            Target Sell-through:
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600">95%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-bg-surface2 border-border-subtle flex w-48 flex-col items-center justify-center gap-2 rounded-2xl border p-4">
                      <p className="text-text-muted text-[8px] font-black uppercase">
                        Рекомендация AI
                      </p>
                      <div className="text-center">
                        <p className="text-accent-primary text-sm font-black">
                          +{item.suggestedQty}
                        </p>
                        <p className="text-text-muted text-[9px] font-bold uppercase">ед. товара</p>
                      </div>
                      <Button
                        size="sm"
                        className="text-accent-primary border-accent-primary/20 hover:bg-accent-primary h-8 w-full rounded-xl border bg-white text-[9px] font-black uppercase transition-all hover:text-white"
                        asChild
                      >
                        <Link href={session.matrixHref}>В корзину B2B</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Stats & Trends */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="bg-text-primary group relative overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
            <Zap className="absolute -right-4 -top-4 h-32 w-32 text-white opacity-[0.03] transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10 space-y-4">
              <header className="space-y-2">
                <Badge className="border-none bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                  Автоматический режим
                </Badge>
                <h3 className="text-sm font-black uppercase italic leading-none tracking-tight">
                  Стратегия <br /> пополнения
                </h3>
              </header>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-text-muted">Inventory Health</span>
                    <span>74%</span>
                  </div>
                  <Progress value={74} className="h-1.5 rounded-full bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-text-muted mb-1 text-[8px] font-black uppercase">
                      Lost Revenue Risk
                    </p>
                    <p className="text-sm font-black text-rose-400">1.2M ₽</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-text-muted mb-1 text-[8px] font-black uppercase">
                      In Transit
                    </p>
                    <p className="text-accent-primary text-sm font-black">450 ед.</p>
                  </div>
                </div>
              </div>

              <Button
                className="text-text-primary h-10 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 transition-all hover:bg-amber-500 hover:text-white"
                asChild
              >
                <Link href={session.stockAtpHref}>
                  View Full Report <ArrowUpRight className="ml-2 inline h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Truck className="text-accent-primary h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-widest">Ближайшие поставки</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 'ORD-992',
                  brand: 'Syntha Lab',
                  status: 'In Transit',
                  date: 'Сегодня',
                  color: 'text-accent-primary',
                },
                {
                  id: 'ORD-987',
                  brand: 'Nordic Wool',
                  status: 'Processing',
                  date: '12 фев',
                  color: 'text-amber-500',
                },
                {
                  id: 'ORD-985',
                  brand: 'Studio 29',
                  status: 'Ready to Ship',
                  date: '15 фев',
                  color: 'text-emerald-500',
                },
              ].map((ship) => (
                <div
                  key={ship.id}
                  className="border-border-subtle hover:border-accent-primary/20 group flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all"
                >
                  <div>
                    <p className="text-text-primary text-[10px] font-black uppercase">
                      {ship.brand}
                    </p>
                    <p className="text-text-muted text-[9px] font-bold uppercase">
                      {ship.id} • {ship.date}
                    </p>
                  </div>
                  <div className={cn('text-[9px] font-black uppercase', ship.color)}>
                    {ship.status}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="text-text-muted hover:text-accent-primary w-full text-[10px] font-black uppercase tracking-widest"
            >
              Все поставки <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
