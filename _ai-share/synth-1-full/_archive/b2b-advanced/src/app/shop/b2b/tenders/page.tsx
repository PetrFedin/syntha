'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gavel, Search, FileText, Clock } from 'lucide-react';
import { B2BModulePage } from '@/components/shop/B2BModulePage';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2bTendersCrossRoleLinks } from '@/lib/data/entity-links';

const MOCK_TENDERS = [
  {
    id: 't1',
    title: 'Пошив партии SS26 — knitwear',
    buyer: 'Сеть «Мода»',
    deadline: '2026-04-01',
    status: 'Приём заявок',
  },
  {
    id: 't2',
    title: 'Фурнитура и упаковка (микс SKU)',
    buyer: 'Платформа Syntha',
    deadline: '2026-03-28',
    status: 'Торги',
  },
];

/** B2B-Center: тендеры и аукционы закупок. */
export default function B2BTendersPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <B2BModulePage
        title="Тендеры B2B"
        description="Конкурентные закупки на площадке: заявки, сроки, связь с RFQ и кабинетом бренда как заказчика."
        moduleId="tenders"
        icon={Gavel}
        phase={1}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Активные тендеры</CardTitle>
            <CardDescription>
              Демо-лоты: подача заявок, сравнение условий, переход в исполнение заказа.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-3">
              {MOCK_TENDERS.map((t) => (
                <li
                  key={t.id}
                  className="border-border-default flex flex-col gap-2 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{t.title}</h3>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                    <p className="text-text-secondary mt-1 text-xs">Заказчик: {t.buyer}</p>
                    <p className="text-text-muted mt-0.5 flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" /> Дедлайн заявок: {t.deadline}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={ROUTES.shop.b2bRfq}>К котировкам / RFQ</Link>
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-text-secondary text-sm">
              После выбора победителя условия можно перенести в B2B-заказ и отследить исполнение в
              Fulfillment и у бренда.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bSupplierDiscovery}>
                  <Search className="mr-1 h-3 w-3" /> Поиск поставщиков
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bRfq}>
                  <FileText className="mr-1 h-3 w-3" /> RFQ
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.shop.b2bFulfillmentDashboard}>Fulfillment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <RelatedModulesBlock
          links={getShopB2bTendersCrossRoleLinks()}
          title="Бренд, factory и исполнение"
          className="mt-2"
        />
      </B2BModulePage>
    </CabinetPageContent>
  );
}
