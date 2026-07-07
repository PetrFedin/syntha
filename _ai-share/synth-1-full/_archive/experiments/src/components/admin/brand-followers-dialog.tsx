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
import { Users, Heart, Shirt, ShoppingCart } from 'lucide-react';
import type { Brand } from '@/lib/types';
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BrandFollowersDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  brand: Brand;
}

const generateMonthlyData = (base: number) => {
  const data = [];
  let current = base * 0.5;
  for (let i = 0; i < 12; i++) {
    const date = new Date(new Date().getFullYear(), i, 1);
    current += Math.floor(base * 0.1 * (Math.random() - 0.2));
    data.push({
      month: date.toLocaleString('ru-RU', { month: 'short' }),
      value: Math.max(0, Math.round(current)),
    });
  }
  return data;
};

export function BrandFollowersDialog({ isOpen, onOpenChange, brand }: BrandFollowersDialogProps) {
  // Mock financial data for the brand
  const followersData = {
    total: brand.followers,
    newThisMonth: Math.floor((brand.followers / 12) * (1 + Math.random())),
    likes: brand.followers * 15,
    wishlists: brand.followers * 3,
    lookbooks: Math.floor(brand.followers * 1.2),
  };

  const followersChartData = generateMonthlyData(followersData.total);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            Статистика подписчиков: {brand.name}
          </DialogTitle>
          <DialogDescription>
            Анализ вовлеченности аудитории, подписанной на бренд.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              title="Всего подписчиков"
              value={followersData.total.toLocaleString('ru-RU')}
              description={`+${followersData.newThisMonth.toLocaleString('ru-RU')} за месяц`}
              icon={Users}
            />
            <StatCard
              title="Добавлено в избранное"
              value={followersData.wishlists.toLocaleString('ru-RU')}
              description="всего"
              icon={Heart}
            />
            <StatCard
              title="Добавлено в лукбуки"
              value={followersData.lookbooks.toLocaleString('ru-RU')}
              description="всего"
              icon={Shirt}
            />
            <StatCard
              title="Лайки"
              value={followersData.likes.toLocaleString('ru-RU')}
              description="всего"
              icon={Heart}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Динамика роста подписчиков</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <AreaChart data={followersChartData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
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
                        formatter={(value) => `${Number(value).toLocaleString('ru-RU')}`}
                      />
                    }
                  />
                  <Area
                    dataKey="value"
                    name="Подписчики"
                    type="natural"
                    fill="url(#colorFollowers)"
                    stroke="hsl(var(--chart-2))"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
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
