'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Layers, ArrowUpRight } from 'lucide-react';
import { B2BModulePage } from '@/components/shop/B2BModulePage';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2bSupplierDiscoveryCrossRoleLinks } from '@/lib/data/entity-links';

const MOCK_SUPPLIERS = [
  {
    id: 's1',
    name: 'Текстиль Про',
    region: 'Иваново',
    category: 'Ткани',
    moq: 'от 500 м',
    tag: 'GOTS',
  },
  {
    id: 's2',
    name: 'Фурнитура 44',
    region: 'Москва',
    category: 'Металл / молнии',
    moq: 'от 1000 шт',
    tag: 'ISO',
  },
  {
    id: 's3',
    name: 'Крой Сервис',
    region: 'Калуга',
    category: 'Контрактное шитьё',
    moq: 'от 300 изд.',
    tag: 'CMT',
  },
];

/** Supl.biz: поиск поставщиков по гео и категориям (РФ). */
export default function B2BSupplierDiscoveryPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <B2BModulePage
        title="Поиск поставщиков"
        description="Матчинг по региону и категории; дальше — RFQ или тендер, плюс зеркало реестра материалов в кабинете бренда."
        moduleId="supplier-discovery"
        icon={Search}
        phase={1}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фильтры поиска</CardTitle>
            <CardDescription>По региону, категории, MOQ, сертификатам (демо).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input placeholder="Поиск по названию, категории..." className="pl-9" />
              </div>
              <Button type="button">Искать</Button>
            </div>
            <div className="text-text-secondary flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Регион
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" /> Категория
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.shop.b2bRfq}>Создать RFQ</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.shop.b2bTenders}>Тендеры B2B</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результаты (демо)</CardTitle>
            <CardDescription>
              Выберите поставщика и перейдите в RFQ с префиллом профиля.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {MOCK_SUPPLIERS.map((s) => (
                <li
                  key={s.id}
                  className="border-border-subtle flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      <Badge variant="secondary">{s.tag}</Badge>
                    </div>
                    <p className="text-text-secondary mt-1 text-xs">
                      {s.region} · {s.category} · MOQ {s.moq}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0" asChild>
                    <Link href={ROUTES.shop.b2bRfq}>
                      В RFQ <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <RelatedModulesBlock
          links={getShopB2bSupplierDiscoveryCrossRoleLinks()}
          title="Бренд, factory, fulfillment"
          className="mt-2"
        />
      </B2BModulePage>
    </CabinetPageContent>
  );
}
