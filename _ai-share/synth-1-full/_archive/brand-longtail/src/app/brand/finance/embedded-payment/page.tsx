'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowLeft, Settings, Shield, DollarSign } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getB2BLinks } from '@/lib/data/entity-links';

export default function BrandEmbeddedPaymentPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.finance}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
            <CreditCard className="h-6 w-6" /> JOOR Pay (Embedded Payment)
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Настройка приёма платежей от байеров внутри платформы. Кредитные лимиты, статусы оплат и
            связка с заказами.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <Settings className="h-4 w-4" /> Статус интеграции
          </CardTitle>
          <CardDescription>
            Платёжная связка для B2B: байеры оплачивают заказы в разделе «Оплата (JOOR Pay)»,
            кредитный лимит обновляется в реальном времени.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-600">Активна</Badge>
            <span className="text-sm text-slate-600">
              Оплаты записываются в credit-store; лимит и «ожидает оплаты» пересчитываются после
              каждой оплаты.
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Для продакшена: подключите эквайринг (ЮKassa, банк, СБП, «Мир») и при экспорте — Stripe
            или аналог; замените мок recordPayment на вызов API списания с лимита и обновления
            статуса заказа.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <Shield className="h-4 w-4" /> Кредитные лимиты
          </CardTitle>
          <CardDescription>
            Управление лимитами по партнёрам. Сейчас лимит задаётся константой; при API — настройка
            по партнёру и пересчёт used после оплат.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href={ROUTES.brand.retailers}>Партнёры и лимиты</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <DollarSign className="h-4 w-4" /> Связь с заказами
          </CardTitle>
          <CardDescription>
            Оплаченные суммы отображаются на карточке заказа и в разделе «Финансы партнёра» у
            байера.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href={ROUTES.brand.b2bOrders}>B2B заказы</Link>
          </Button>
        </CardContent>
      </Card>

      <RelatedModulesBlock title="Финансы и B2B" links={getB2BLinks().slice(0, 8)} />
    </div>
  );
}
