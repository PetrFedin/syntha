'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { ROUTES } from '@/lib/routes';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Search,
  ShoppingCart,
  BarChart as BarChartIcon,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  BarChart as RechartsBarChart,
  Cell,
} from 'recharts';

const lostSalesData = [
  { query: 'белая футболка oversize', count: 128, status: 'Нет в ассортименте' },
  { query: 'черные джинсы скинни', count: 92, status: 'Нет в ассортименте' },
  { query: 'платье на выпускной', count: 78, status: 'Нет в ассортименте' },
  { query: 'льняной костюм', count: 65, status: 'Нет в ассортименте' },
];

const lostSizesData = [
  { product: 'Кашемировый свитер', size: 'M', requests: 45 },
  { product: 'Классические брюки', size: '42', requests: 32 },
  { product: 'Джинсовая куртка', size: 'L', requests: 28 },
];

const salesData = [
  { date: '2024-07-01', revenue: 250000 },
  { date: '2024-07-08', revenue: 280000 },
  { date: '2024-07-15', revenue: 310000 },
  { date: '2024-07-22', revenue: 290000 },
  { date: '2024-07-29', revenue: 350000 },
];

const returnsData = [
  { name: 'Не подошел размер', value: 60, fill: 'hsl(var(--chart-1))' },
  { name: 'Не понравилось качество', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Отличается цвет', value: 15, fill: 'hsl(var(--chart-3))' },
];

const chartConfig = {
  total: {
    label: 'Всего',
    color: 'hsl(var(--chart-1))',
  },
};

export default function ShopAnalyticsPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <ShopAnalyticsSegmentErpStrip />
      <header>
        <h1 className="font-headline text-base font-bold">Аналитика розничных продаж</h1>
        <p className="text-muted-foreground">
          Анализируйте розничные продажи, чтобы принимать верные решения о закупках.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Выручка (B2C)"
          value="1,250,000 ₽"
          description="+10% к прошлому месяцу"
          icon={DollarSign}
        />
        <StatCard
          title="Прибыль (B2C)"
          value="375,000 ₽"
          description="Маржинальность 30%"
          icon={BarChartIcon}
        />
        <StatCard
          title="Заказы (B2C)"
          value="152"
          description="+22 заказа за месяц"
          icon={ShoppingCart}
        />
        <StatCard
          title="Новые клиенты"
          value="+88"
          description="Всего 1,230 клиентов"
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика выручки</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={salesData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(val) =>
                  new Date(val).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                }
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(val) => `${Number(val) / 1000}k`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-1))"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Причины возвратов</CardTitle>
          <CardDescription>
            Общий процент возвратов по вашим розничным продажам: 8%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="aspect-auto h-[250px] w-full">
            <RechartsBarChart layout="vertical" data={returnsData} margin={{ left: 120 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                width={120}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => `${value}%`} />}
              />
              <Bar dataKey="value" layout="vertical" radius={5}>
                {returnsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" /> Упущенные продажи
          </CardTitle>
          <CardDescription>
            Товары, которые пользователи искали, но не нашли в вашем ассортименте.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Поисковый запрос</TableHead>
                <TableHead>Кол-во запросов</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lostSalesData.map((item) => (
                <TableRow key={item.query}>
                  <TableCell className="font-medium">{item.query}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Найти у брендов
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> "Потерянные" размеры
          </CardTitle>
          <CardDescription>
            Размеры, которые закончились и которые чаще всего запрашивают клиенты.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Кол-во запросов "Сообщить о наличии"</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lostSizesData.map((item) => (
                <TableRow key={item.product}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.requests}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm">
                      <TrendingUp className="mr-2 h-4 w-4" /> Заказать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="border-border-subtle mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-retail-analytics-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.b2bMarginAnalysis}
            data-testid="shop-retail-analytics-margin-hub-link"
          >
            Хаб маржи (B2B)
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.b2bAnalytics} data-testid="shop-retail-analytics-b2b-link">
            Аналитика закупок (B2B)
          </Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
