'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import {
  DollarSign,
  ShoppingCart,
  BarChart,
  Percent,
  ArrowUp,
  ArrowDown,
  FileText,
} from 'lucide-react';
import type { Brand } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BrandFinancialsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  brand: Brand;
}

const generateYearlyData = (baseRevenue: number) => {
  const data = [];
  let currentRevenue = baseRevenue * 0.8;
  for (let i = 0; i < 12; i++) {
    const date = new Date(new Date().getFullYear(), i, 1);
    currentRevenue *= 1 + (Math.random() * 0.2 - 0.05); // Fluctuate
    data.push({
      month: date.toLocaleString('ru-RU', { month: 'short' }),
      Выручка: Math.round(currentRevenue),
    });
  }
  return data;
};

export function BrandFinancialsDialog({ isOpen, onOpenChange, brand }: BrandFinancialsDialogProps) {
  // Mock financial data for the brand
  const financials = {
    totalRevenue: brand.followers * 150 + Math.floor(Math.random() * 500000),
    avgCheck: 12500 + Math.floor(Math.random() * 5000),
    totalOrders: Math.floor((brand.followers * 150) / 13000),
    conversionRate: 2.5 + (Math.random() - 0.5) * 1,
    transactions: [
      { id: 'tr_1', type: 'Покупка', amount: 24500, date: '2024-07-28', status: 'success' },
      { id: 'tr_2', type: 'Покупка', amount: 18500, date: '2024-07-27', status: 'success' },
      { id: 'tr_3', type: 'Возврат', amount: -18500, date: '2024-07-26', status: 'refunded' },
      { id: 'tr_4', type: 'Покупка', amount: 89000, date: '2024-07-25', status: 'success' },
    ],
  };

  const yearlyData = generateYearlyData(financials.totalRevenue / 12);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            Финансовые показатели: {brand.name}
          </DialogTitle>
          <DialogDescription>Ключевые метрики эффективности бренда на платформе.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto py-4 pr-2">
          <Tabs defaultValue="overview">
            {/* cabinetSurface v1 */}
            <TabsList className={cn(cabinetSurface.tabsList, 'mb-4 min-w-0')}>
              <TabsTrigger
                value="overview"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Обзор
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Транзакции
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Эффективность
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  title="Общая выручка"
                  value={`${financials.totalRevenue.toLocaleString('ru-RU')} ₽`}
                  description="+15% за месяц"
                  icon={DollarSign}
                />
                <StatCard
                  title="Средний чек"
                  value={`${financials.avgCheck.toLocaleString('ru-RU')} ₽`}
                  description="+3% за месяц"
                  icon={ShoppingCart}
                />
                <StatCard
                  title="Всего заказов"
                  value={financials.totalOrders.toLocaleString('ru-RU')}
                  description="+22% за месяц"
                  icon={BarChart}
                />
                <StatCard
                  title="Конверсия"
                  value={`${financials.conversionRate.toFixed(1)}%`}
                  description="-0.2 п.п. за месяц"
                  icon={Percent}
                />
              </div>
            </TabsContent>
            <TabsContent value="transactions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тип</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials.transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="flex items-center gap-2 font-medium">
                        {t.status === 'success' ? (
                          <ArrowUp className="h-4 w-4 text-primary" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        {t.type}
                      </TableCell>
                      <TableCell>{new Date(t.date).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell className="text-right font-mono">
                        {t.amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Динамика выручки за год</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px] w-full">
                    <AreaChart data={yearlyData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(v) => `${Number(v) / 1000}k`}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}
                          />
                        }
                      />
                      <Area
                        dataKey="Выручка"
                        type="natural"
                        fill="url(#colorRevenue)"
                        stroke="hsl(var(--chart-1))"
                        stackId="a"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
