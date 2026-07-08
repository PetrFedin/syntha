'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Share2, ArrowRightLeft, Database, Globe, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';

/**
 * Integration Hub (Connective Tissue) UI
 * Управление связкой стока B2B и B2C, а также внешними маркетплейсами.
 */

export default function IntegrationHubPage() {
  const [activeTab, setActiveTab] = useState('internal');

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-12 py-6 pb-16 pb-24 sm:px-6">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="flex-1">
          <h1 className="font-headline text-sm font-bold">Integration Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            «Соединительная ткань» платформы: синхронизация B2B/B2C стоков и внешних маркетплейсов.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Синхронизировать всё
          </Button>
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Auto-Rebalance: ON
          </Button>
        </div>
      </header>

      <Tabs defaultValue="internal" className="w-full" onValueChange={setActiveTab}>
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'grid max-w-[400px] grid-cols-2')}>
          <TabsTrigger
            value="internal"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Внутренний сток
          </TabsTrigger>
          <TabsTrigger
            value="external"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            <Globe className="h-4 w-4" />
            Маркетплейсы (<AcronymWithTooltip abbr="API" />)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className={cn(cabinetSurface.cabinetProfileTabPanel, 'pt-6')}>
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  B2B Reservoir (Wholesale)
                </CardTitle>
                <CardDescription>Складские остатки для оптовых заказов и шоурума.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm">Общий остаток B2B</span>
                  <span className="text-base font-bold">14,200 ед.</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-blue-500/5 p-3 text-blue-600">
                  <span className="text-sm font-medium">Резерв под заказы</span>
                  <span className="font-bold">3,120 ед.</span>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  Переместить в B2C (Marketroom)
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-green-500" />
                  B2C Reservoir (Retail)
                </CardTitle>
                <CardDescription>Остатки для прямых продаж клиентам (Marketroom).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm">Общий остаток B2C</span>
                  <span className="text-base font-bold">5,840 ед.</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-500/5 p-3 text-green-600">
                  <span className="text-sm font-medium">Доступно к продаже</span>
                  <span className="font-bold">5,400 ед.</span>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Вернуть в B2B (Опт)
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Логи перемещения стока</CardTitle>
              <CardDescription>История перераспределения товаров между каналами.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата и Время</TableHead>
                    <TableHead>
                      Товар (<AcronymWithTooltip abbr="SKU" />)
                    </TableHead>
                    <TableHead>Откуда {'->'} Куда</TableHead>
                    <TableHead>Кол-во</TableHead>
                    <TableHead>Причина</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs text-muted-foreground">
                      2025-03-08 14:22
                    </TableCell>
                    <TableCell className="font-mono text-xs">TSH-BLK-M-001</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        B2B
                      </Badge>
                      <span className="mx-1">→</span>
                      <Badge variant="outline" className="text-[10px] text-green-600">
                        B2C
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">+100</TableCell>
                    <TableCell className="text-xs">Safety stock refill (Auto)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external" className={cn(cabinetSurface.cabinetProfileTabPanel, 'pt-6')}>
          <div className="grid gap-3 md:grid-cols-3">
            {['Wildberries', 'Ozon', 'Amazon'].map((mp) => (
              <Card key={mp}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold">{mp}</CardTitle>
                  <Badge variant="outline" className="border-green-600/30 text-green-600">
                    CONNECTED
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm font-black">
                    2,410{' '}
                    <span className="text-xs font-normal text-muted-foreground">SKU active</span>
                  </div>
                  <p className="flex items-center gap-1 text-[10px] italic text-muted-foreground">
                    <Zap className="h-3 w-3 text-amber-500" />
                    Последняя синхронизация: 5 мин. назад
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Настройки <AcronymWithTooltip abbr="API" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-800">Ошибка синхронизации (Lamoda)</p>
                <p className="text-xs text-amber-700">
                  Некорректный токен доступа API. Автоматическая выгрузка стоков приостановлена.
                </p>
              </div>
              <Button size="sm" className="ml-auto bg-amber-500 hover:bg-amber-600">
                Обновить токен
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
