'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Clock, CheckCircle2, FileText, ShoppingCart } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ROUTES } from '@/lib/routes';
import { getPartnerFinanceRollup } from '@/lib/b2b/partner-finance-rollup';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';

export default function PartnerFinancePage() {
  const rollup = getPartnerFinanceRollup();
  const {
    credit,
    awaitingPayment,
    paidThisPeriod,
    ordersByStatus,
    ordersAwaitingPayment,
    recentOrders,
  } = rollup;

  const formatMoney = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Заказы по статусам, кредитный лимит, ожидаемые и оплаченные платежи, корпоративная оплата и документы." />
      <ShopAnalyticsSegmentErpStrip />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
              <CreditCard className="text-accent-primary h-4 w-4" /> Кредитный лимит
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-text-primary text-2xl font-black">{formatMoney(credit.available)}</p>
            <p className="text-text-secondary text-xs">доступно из {formatMoney(credit.limit)}</p>
            <p className="text-text-muted text-[10px]">использовано {formatMoney(credit.used)}</p>
            {credit.blocked && (
              <Badge variant="destructive" className="mt-2 text-[9px] font-black">
                Лимит исчерпан
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-border-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
              <Clock className="h-4 w-4 text-amber-600" /> Ожидает оплаты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-black text-amber-700">{formatMoney(awaitingPayment)}</p>
            <p className="text-text-secondary text-xs">{ordersAwaitingPayment.length} заказ(ов)</p>
          </CardContent>
        </Card>

        <Card className="border-border-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Оплачено за период
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-black text-emerald-700">{formatMoney(paidThisPeriod)}</p>
            <p className="text-text-secondary text-xs">мок: все оплаченные</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заказы по статусам</CardTitle>
            <CardDescription>Количество заказов в каждом статусе.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <Badge key={status} variant="secondary" className="text-[10px] font-bold">
                  {status}: {count}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 rounded-lg" asChild>
              <Link href={ROUTES.shop.b2bOrders}>
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Все заказы
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ожидающие оплаты</CardTitle>
            <CardDescription>Заказы с неоплаченной или просроченной суммой.</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersAwaitingPayment.length === 0 ? (
              <p className="text-text-secondary text-sm">Нет заказов, ожидающих оплаты.</p>
            ) : (
              <ul className="space-y-2">
                {ordersAwaitingPayment.map((o) => (
                  <li
                    key={o.order}
                    className="border-border-subtle flex items-center justify-between border-b py-2 last:border-0"
                  >
                    <span className="font-mono text-sm">{o.order}</span>
                    <span className="font-bold text-amber-700">{o.amount}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {o.paymentStatus}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="mt-4 rounded-lg" asChild>
              <Link href={ROUTES.shop.b2bPayment}>
                <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Оплатить онлайн
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Последние заказы</CardTitle>
          <CardDescription>Недавние заказы (без черновиков).</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-text-secondary text-sm">Нет подтверждённых заказов.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border-default border-b">
                    <th className="py-2 text-left font-medium">Заказ</th>
                    <th className="py-2 text-left font-medium">Бренд</th>
                    <th className="py-2 text-right font-medium">Сумма</th>
                    <th className="py-2 text-left font-medium">Статус</th>
                    <th className="py-2 text-left font-medium">Оплата</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.order} className="border-border-subtle border-b">
                      <td className="py-2">
                        <Link
                          href={ROUTES.shop.b2bOrders}
                          className="text-accent-primary font-mono hover:underline"
                        >
                          {o.order}
                        </Link>
                      </td>
                      <td className="text-text-secondary py-2">{o.brand}</td>
                      <td className="py-2 text-right font-medium">{o.amount}</td>
                      <td className="py-2">
                        <Badge variant="secondary" className="text-[9px]">
                          {o.status}
                        </Badge>
                      </td>
                      <td className="text-text-secondary py-2 text-[10px]">
                        {o.paymentStatus ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border-border-subtle mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-finance-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analyticsFootfall} data-testid="shop-b2b-finance-footfall-link">
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild className="rounded-xl">
          <Link href={ROUTES.shop.b2bPayment}>
            <CreditCard className="mr-2 h-4 w-4" /> Оплата заказов
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href={ROUTES.shop.b2bDocuments}>
            <FileText className="mr-2 h-4 w-4" /> Документы
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href={ROUTES.shop.b2bOrders}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Мои заказы
          </Link>
        </Button>
      </div>

      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, оплата, документы"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
