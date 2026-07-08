'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { month: 'Январь', revenue: 12860000 },
  { month: 'Февраль', revenue: 15305000 },
  { month: 'Март', revenue: 11237000 },
  { month: 'Апрель', revenue: 9873000 },
  { month: 'Май', revenue: 14209000 },
  { month: 'Июнь', revenue: 16214000 },
];

const chartConfig = {
  revenue: {
    label: 'Выручка',
    color: 'hsl(var(--chart-1))',
  },
};

export function DistributorSalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Обзор оптовых продаж (B2B)</CardTitle>
        <CardDescription>Это график вашей оптовой выручки за последние 6 месяцев.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${Number(value) / 1000000}M ₽`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="var(--color-revenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
