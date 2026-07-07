'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShopB2bToolHeader } from '@/components/shop/ShopB2bToolHeader';
import { ROUTES } from '@/lib/routes';

const budgetData = {
  season: 'Осень-Зима 2024',
  budgetPlan: 10000000,
  budgetFact: 8250000,
  skuCount: 120,
  itemCount: 3500,
  forecastRevenue: 24750000,
  forecastSellOut: 85,
  seasonalShare: 70,
  otherShare: 30,
};

const brandsData = [
  {
    name: 'Syntha',
    budgetPlan: 4000000,
    budgetFact: 3500000,
    skuCount: 50,
    itemCount: 1500,
    forecastRevenue: 10500000,
    forecastSellOut: 88,
  },
  {
    name: 'A.P.C.',
    budgetPlan: 3000000,
    budgetFact: 2750000,
    skuCount: 40,
    itemCount: 1200,
    forecastRevenue: 8250000,
    forecastSellOut: 82,
  },
  {
    name: 'Acne Studios',
    budgetPlan: 3000000,
    budgetFact: 2000000,
    skuCount: 30,
    itemCount: 800,
    forecastRevenue: 6000000,
    forecastSellOut: 85,
  },
];

export default function B2BBudgetSeasonPage({
  params: paramsPromise,
}: {
  params: Promise<{ season: string }>;
}) {
  const params = use(paramsPromise);
  const seasonName = decodeURIComponent(params.season).replace('-', ' ');

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <TooltipProvider>
        <div className="space-y-6">
          <ShopB2bToolHeader
            backHref={ROUTES.shop.b2bBudget}
            titleVisual="semibold"
            title={
              <>
                Детализация бюджета: <span className="capitalize">{seasonName}</span>
              </>
            }
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Сводка по брендам</CardTitle>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Экспорт
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Бюджет (План/Факт)</TableHead>
                    <TableHead>Кол-во SKU</TableHead>
                    <TableHead>Кол-во штук</TableHead>
                    <TableHead>Прогноз выручки</TableHead>
                    <TableHead>Прогноз Sell-Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandsData.map((item) => {
                    const budgetProgress = (item.budgetFact / item.budgetPlan) * 100;
                    return (
                      <TableRow key={item.name}>
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex w-40 flex-col gap-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.budgetFact.toLocaleString('ru-RU')} ₽</span>
                              <span>{item.budgetPlan.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <Progress value={budgetProgress} />
                            <p className="text-right text-xs font-medium">
                              {budgetProgress.toFixed(1)}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.skuCount}</TableCell>
                        <TableCell>{item.itemCount.toLocaleString('ru-RU')}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {item.forecastRevenue.toLocaleString('ru-RU')} ₽
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Прогноз на основе AI-модели</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex cursor-help items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                {item.forecastSellOut}%
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Прогнозируемый процент распродажи</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </CabinetPageContent>
  );
}
