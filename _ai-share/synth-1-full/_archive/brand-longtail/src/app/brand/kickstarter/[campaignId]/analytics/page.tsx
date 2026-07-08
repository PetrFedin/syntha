'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { use, useEffect, useState, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { kickstarterProjects } from '@/lib/kickstarter';
import { StatCard } from '@/components/stat-card';
import {
  Users,
  Eye,
  Target,
  Percent,
  DollarSign,
  ChevronLeft,
  Loader2,
  Factory,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

const generateDailyData = (base: number) => {
  return Array.from({ length: 15 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (15 - i));
    return {
      date: date.toISOString().split('T')[0],
      views: Math.floor(base * (0.5 + Math.random() * 0.8) * (i + 1)),
      orders: Math.floor(base * 0.05 * (0.5 + Math.random() * 0.8) * (i + 1)),
    };
  });
};

const ordersBySizeData = [
  { size: 'XS', value: 2, fill: 'hsl(var(--chart-1))' },
  { size: 'S', value: 8, fill: 'hsl(var(--chart-2))' },
  { size: 'M', value: 18, fill: 'hsl(var(--chart-3))' },
  { size: 'L', value: 10, fill: 'hsl(var(--chart-4))' },
  { size: 'XL', value: 4, fill: 'hsl(var(--chart-5))' },
];

const ordersByRegionData = [
  { region: 'RU', value: 60, fill: 'hsl(var(--chart-1))' },
  { region: 'KZ', value: 20, fill: 'hsl(var(--chart-2))' },
  { region: 'AE', value: 18, fill: 'hsl(var(--chart-3))' },
  { region: 'EU', value: 10, fill: 'hsl(var(--chart-4))' },
];

const trafficSourcesData = [
  { source: 'Syntha Главная', value: 45, fill: 'hsl(var(--chart-1))' },
  { source: 'Соц. сети', value: 25, fill: 'hsl(var(--chart-2))' },
  { source: 'Email', value: 15, fill: 'hsl(var(--chart-3))' },
  { source: 'Прямые', value: 15, fill: 'hsl(var(--chart-4))' },
];

export default function CampaignAnalyticsPage({
  params: paramsPromise,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const params = use(paramsPromise);
  const [project, setProject] = useState(
    kickstarterProjects.find((p) => p.id === params.campaignId)
  );
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      const data = generateDailyData(project.targetQuantity);
      setDailyData(data);
      setTotalViews(data.reduce((acc, day) => acc + day.views, 0));
    }
  }, [project]);

  if (!project) {
    notFound();
  }

  const handleSendToProduction = () => {
    toast({
      title: 'Заказ отправлен на производство',
      description: 'Данные по предзаказу переданы на выбранную фабрику (симуляция).',
    });
  };

  const conversionRate = totalViews > 0 ? (project.currentQuantity / totalViews) * 100 : 0;

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Аналитика кампании"
        leadPlain={project.title}
        eyebrow={
          <Button variant="outline" size="icon" asChild>
            <Link href={ROUTES.brand.kickstarter} aria-label="Назад к кампаниям">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          project.status === 'successful' ? (
            <Button onClick={handleSendToProduction}>
              <Factory className="mr-2 h-4 w-4" />
              Отправить на производство
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Suspense
          fallback={
            <Card className="h-24">
              <CardContent className="p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </CardContent>
            </Card>
          }
        >
          <StatCard
            title="Всего просмотров"
            value={totalViews.toLocaleString('ru-RU')}
            description="+15% за неделю"
            icon={Eye}
          />
        </Suspense>
        <Suspense
          fallback={
            <Card className="h-24">
              <CardContent className="p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </CardContent>
            </Card>
          }
        >
          <StatCard
            title="Предзаказы"
            value={project.currentQuantity.toString()}
            description={`${((project.currentQuantity / project.targetQuantity) * 100).toFixed(0)}% от цели`}
            icon={Target}
          />
        </Suspense>
        <Suspense
          fallback={
            <Card className="h-24">
              <CardContent className="p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </CardContent>
            </Card>
          }
        >
          <StatCard
            title="Конверсия"
            value={`${conversionRate.toFixed(2)}%`}
            description="в предзаказ"
            icon={Percent}
          />
        </Suspense>
        <Suspense
          fallback={
            <Card className="h-24">
              <CardContent className="p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </CardContent>
            </Card>
          }
        >
          <StatCard
            title="Собрано средств"
            value={`${project.currentRevenue.toLocaleString('ru-RU')} ₽`}
            description="от всех предзаказов"
            icon={DollarSign}
          />
        </Suspense>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика просмотров и предзаказов</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <AreaChart data={dailyData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(val) =>
                  new Date(val).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
                }
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="hsl(var(--chart-1))"
                tickFormatter={(val) => `${Number(val) / 1000}k`}
              />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => `${Number(value).toLocaleString('ru-RU')}`}
                  />
                }
              />
              <Area
                yAxisId="left"
                dataKey="views"
                name="Просмотры"
                type="monotone"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.1}
                stroke="hsl(var(--chart-1))"
              />
              <Area
                yAxisId="right"
                dataKey="orders"
                name="Заказы"
                type="monotone"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.1}
                stroke="hsl(var(--chart-2))"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Предзаказы по размерам</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <RechartsBarChart data={ordersBySizeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="size" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Заказы">
                  {ordersBySizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>География предзаказов</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <div className="relative h-full w-full overflow-hidden rounded-md">
              <Image
                src="https://i.imgur.com/gKjGZAn.png"
                alt="Карта предзаказов"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Источники трафика</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <ChartContainer config={{}} className="aspect-square h-[250px]">
              <PieChart>
                <Tooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                <Pie data={trafficSourcesData} dataKey="value" nameKey="source" innerRadius={50}>
                  {trafficSourcesData.map((entry, index) => (
                    <Cell key={`cell-${entry.source}-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="source"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: keyof typeof trafficSourcesData) =>
                      trafficSourcesData.find((d) => d.source === value)?.source
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col justify-center">
              {trafficSourcesData.map((entry) => (
                <div key={entry.source} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></div>
                    <span className="text-sm text-muted-foreground">{entry.source}</span>
                  </div>
                  <span className="font-semibold">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
