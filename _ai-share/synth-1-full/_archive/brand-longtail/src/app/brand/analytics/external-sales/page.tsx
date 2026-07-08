'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Link2, Upload, CheckCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { RegistryPageHeader } from '@/components/design-system';

/** Интеграция результатов продаж закупленных коллекций на других площадках — свод на платформе. */
const MOCK_EXTERNAL = [
  {
    id: '1',
    collection: 'FW26 Основная',
    retailer: 'Демо-магазин · Москва 1',
    channel: 'Свой сайт',
    sales: '1 240 000 ₽',
    units: 312,
    integration: 'api',
    period: '30 дн.',
  },
  {
    id: '2',
    collection: 'FW26 Основная',
    retailer: 'Демо-магазин · Москва 2',
    channel: 'Магазины',
    sales: '2 100 000 ₽',
    units: 480,
    integration: 'upload',
    period: '30 дн.',
  },
  {
    id: '3',
    collection: 'FW26 Основная',
    retailer: 'Демо-магазин · СПб',
    channel: 'Маркетплейс (демо)',
    sales: '890 000 ₽',
    units: 220,
    integration: 'api',
    period: '30 дн.',
  },
  {
    id: '4',
    collection: 'FW26 Techwear',
    retailer: 'Демо-магазин · Москва 1',
    channel: 'Маркетплейс (демо)',
    sales: '420 000 ₽',
    units: 95,
    integration: 'api',
    period: '30 дн.',
  },
  {
    id: '5',
    collection: 'SS25 Остатки',
    retailer: 'Демо-магазин · Москва 2',
    channel: 'Маркетплейс (демо)',
    sales: '180 000 ₽',
    units: 88,
    integration: 'upload',
    period: '30 дн.',
  },
];

const channelLabel = (integration: string) =>
  integration === 'api' ? 'Интеграция (API)' : 'Загрузка вручную';

export default function ExternalSalesPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Продажи на других площадках"
        leadPlain="Интеграция результатов продаж закупленных у вас коллекций: ритейлеры отчитывают продажи с своего сайта и внешних каналов (маркетплейсы, офлайн). Все данные сводятся на платформе для полного анализа."
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.analyticsBi} aria-label="Назад к BI">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Продажи по каналам ритейлеров</CardTitle>
              <CardDescription>
                Коллекция, партнёр, канал продаж, выручка и способ поступления данных (API или
                загрузка)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" /> Запросить отчёт у партнёра
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Коллекция</TableHead>
                <TableHead>Партнёр</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead className="text-right">Продажи</TableHead>
                <TableHead className="text-right">Ед.</TableHead>
                <TableHead>Поступление данных</TableHead>
                <TableHead>Период</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_EXTERNAL.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.collection}</TableCell>
                  <TableCell>{row.retailer}</TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell className="text-right font-semibold">{row.sales}</TableCell>
                  <TableCell className="text-right">{row.units}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.integration === 'api' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {row.integration === 'api' ? (
                        <CheckCircle className="mr-1 inline h-3 w-3" />
                      ) : (
                        <Upload className="mr-1 inline h-3 w-3" />
                      )}
                      {channelLabel(row.integration)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary text-sm">{row.period}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-accent-primary/20 bg-accent-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4" /> Сведение данных на платформе
          </CardTitle>
          <CardDescription>
            Все каналы (B2B отгрузки, Маркетрум, Аутлет, продажи партнёров на внешних витринах и
            своём сайте) сводятся в единую отчётность. Откройте «Сводную аналитику» для полного
            анализа.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="text-xs">
              B2B заказы
            </Badge>
            <Badge variant="outline" className="text-xs">
              Маркетрум
            </Badge>
            <Badge variant="outline" className="text-xs">
              Аутлет
            </Badge>
            <Badge variant="outline" className="text-xs">
              Сайты партнёров
            </Badge>
            <Badge variant="outline" className="text-xs">
              Маркетплейс (демо) A
            </Badge>
            <Badge variant="outline" className="text-xs">
              Маркетплейс (демо) B
            </Badge>
            <Badge variant="outline" className="text-xs">
              Маркетплейс (демо) C
            </Badge>
          </div>
          <Button className="mt-4" asChild>
            <Link href={ROUTES.brand.analyticsUnified}>Перейти в сводную аналитику</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsPlatformSales}>Маркетрум и Аутлет</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsUnified}>Полный анализ</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getAnalyticsLinks()} title="BI, платформа, 360°" />
    </CabinetPageContent>
  );
}
