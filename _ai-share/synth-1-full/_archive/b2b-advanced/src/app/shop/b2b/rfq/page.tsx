'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { withShopB2bCoreLegacyGuard } from '@/app/shop/b2b/shop-b2b-core-legacy-guard';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import type { RfqRequest, RfqStatus } from '@/lib/rf-market/rfq';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2bRfqCrossRoleLinks } from '@/lib/data/entity-links';

/** Alibaba/OroCommerce: RFQ — запрос котировок от поставщиков */
const MOCK_RFQS: RfqRequest[] = [
  {
    id: 'rfq1',
    buyerId: 'b1',
    buyerName: 'Сеть «Мода»',
    title: 'Запрос цен на джинсовую ткань',
    lines: [
      {
        id: 'rl1',
        description: 'Деним 12 oz, индиго',
        quantity: 3000,
        unit: 'м',
        requestedDelivery: '2026-04-15',
      },
    ],
    supplierIds: ['sup1', 'sup4'],
    status: 'quotes_received',
    currency: 'RUB',
    quoteDeadline: '2026-03-20',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-11',
  },
  {
    id: 'rfq2',
    buyerId: 'b1',
    buyerName: 'Сеть «Мода»',
    title: 'Фурнитура: молнии, пуговицы',
    lines: [
      { id: 'rl2', description: 'Молния металл 5 см', quantity: 10000, unit: 'шт' },
      { id: 'rl3', description: 'Пуговицы 4-дырки', quantity: 15000, unit: 'шт' },
    ],
    supplierIds: ['sup2'],
    status: 'sent',
    currency: 'RUB',
    quoteDeadline: '2026-03-25',
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10',
  },
];

function StatusBadge({ status }: { status: RfqStatus }) {
  const map: Record<RfqStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    draft: { label: 'Черновик', variant: 'secondary' },
    sent: { label: 'Отправлен', variant: 'outline' },
    quotes_received: { label: 'Котировки получены', variant: 'default' },
    closed: { label: 'Закрыт', variant: 'secondary' },
    converted: { label: 'В заказ', variant: 'default' },
  };
  const c = map[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function RfqPageContent() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Витрина байера: котировки по материалам и услугам; ответы поставщиков можно сопоставить с производственным хабом и брендовым RFQ." />

      <Card className="bg-bg-surface2/50 mb-6 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Связь ролей</CardTitle>
          <CardDescription>
            Ответы поставщиков здесь дополняют контур бренда (материалы, реестр поставщиков) и
            factory — удобно проверять условия перед переносом в B2B-заказ.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Мои запросы котировок</CardTitle>
          <CardDescription>
            Создайте RFQ, выберите поставщиков и получите предложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MOCK_RFQS.map((r) => (
            <div
              key={r.id}
              className="border-border-default flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-text-secondary mt-1 text-xs">
                  {r.lines.length} позиций · Дедлайн котировок: {r.quoteDeadline}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`${ROUTES.shop.b2bRfq}/${r.id}`}>Подробнее</Link>
                </Button>
                {r.status === 'quotes_received' && (
                  <Button size="sm" asChild>
                    <Link href={`${ROUTES.shop.b2bRfq}/${r.id}/compare`}>Сравнить и выбрать</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={ROUTES.shop.b2bRfqCreate}>
            <Plus className="mr-2 h-4 w-4" /> Создать RFQ
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bSupplierDiscovery}>Найти поставщиков</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bTenders}>Тендеры</Link>
        </Button>
      </div>

      <RelatedModulesBlock
        links={getShopB2bRfqCrossRoleLinks()}
        title="Бренд, factory, следующие шаги"
        className="mt-8"
      />
    </CabinetPageContent>
  );
}

export default withShopB2bCoreLegacyGuard(ROUTES.shop.b2bRfq, RfqPageContent);
