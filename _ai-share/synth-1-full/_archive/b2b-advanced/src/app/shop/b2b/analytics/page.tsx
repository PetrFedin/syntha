'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { SkuAnalytics } from '@/components/brand/sku-analytics';
import { CustomerBrandMatrix } from '@/components/brand/customer-brand-matrix';
import { products as allMockProducts } from '@/lib/products';
import { isDemoBrandName } from '@/lib/data/demo-platform-brands';
import {
  BarChart,
  Smile,
  Frown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Filter,
  Search,
  Camera,
  FileOutput,
  Sparkles,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { fullCategoryStructure } from '@/lib/categories';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { Combobox } from '@/components/ui/combobox';
import { ShopB2bToolHeader } from '@/components/shop/ShopB2bToolHeader';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const abcData = [
  {
    sku: 'SYN-K001-BLK',
    product: 'Кашемировый свитер',
    abc: 'A',
    xyz: 'X',
    revenueShare: 25,
    salesStability: 'Стабильный',
    season: 'FW24',
    brand: 'Syntha Lab',
    category: 'Трикотаж',
    audience: 'Унисекс',
  },
  {
    sku: 'SYN-C004-BEI',
    product: 'Легендарный тренч',
    abc: 'A',
    xyz: 'Y',
    revenueShare: 20,
    salesStability: 'Колеблющийся',
    season: 'FW24',
    brand: 'Syntha Lab',
    category: 'Верхняя одежда',
    audience: 'Женский',
  },
  {
    sku: 'NW-K001-BLK',
    product: 'Кашемировый лонгслив',
    abc: 'B',
    xyz: 'X',
    revenueShare: 12,
    salesStability: 'Стабильный',
    season: 'SS24',
    brand: 'Nordic Wool',
    category: 'Трикотаж',
    audience: 'Женский',
  },
  {
    sku: 'NW-SCF-02',
    product: 'Шерстяной платок',
    abc: 'B',
    xyz: 'X',
    revenueShare: 10,
    salesStability: 'Стабильный',
    season: 'SS24',
    brand: 'Nordic Wool',
    category: 'Аксессуары',
    audience: 'Мужской',
  },
  {
    sku: 'SYN-S011-BLK',
    product: 'Кожаные пенни-лоферы',
    abc: 'C',
    xyz: 'Z',
    revenueShare: 5,
    salesStability: 'Случайный',
    season: 'FW24',
    brand: 'Syntha Lab',
    category: 'Обувь',
    audience: 'Мужской',
  },
];

const initialSellThroughData = [
  { brand: 'Syntha Lab', sellThrough: 85, margin: 65.2, season: 'FW24' },
  { brand: 'Nordic Wool', sellThrough: 88, margin: 68.0, season: 'SS24' },
];

const initialMarketComparisonData = [
  {
    brand: 'Syntha Lab',
    yourMargin: 65.2,
    yourSellThrough: 85,
    marketMargin: 62.5,
    marketSellThrough: 80,
    season: 'FW24',
  },
  {
    brand: 'Nordic Wool',
    yourMargin: 68.0,
    yourSellThrough: 85,
    marketMargin: 67.0,
    marketSellThrough: 85,
    season: 'SS24',
  },
];

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

const returnsData = [
  { name: 'Не подошел размер', value: 60, fill: 'hsl(var(--chart-1))' },
  { name: 'Не понравилось качество', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Отличается цвет', value: 15, fill: 'hsl(var(--chart-3))' },
];

import { withShopB2bCoreLegacyGuard } from '@/app/shop/b2b/shop-b2b-core-legacy-guard';

function B2BAnalyticsPageContent() {
  const allBrandProducts = useMemo(
    () => allMockProducts.filter((p) => isDemoBrandName(p.brand)),
    []
  );
  const [selectedSkuId, setSelectedSkuId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  const [sellThroughData, setSellThroughData] = useState(initialSellThroughData);
  const [marketComparisonData, setMarketComparisonData] = useState(initialMarketComparisonData);

  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [category1Filter, setCategory1Filter] = useState('all');
  const [category2Filter, setCategory2Filter] = useState('all');
  const [category3Filter, setCategory3Filter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [skuFilter, setSkuFilter] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set initial selected SKU once data is loaded
    if (allBrandProducts.length > 0 && !selectedSkuId) {
      setSelectedSkuId(allBrandProducts[0].id);
    }
  }, [allBrandProducts, selectedSkuId]);

  const filteredAbcData = useMemo(() => {
    if (!mounted) return [];
    return abcData.filter((item) => {
      const product = allBrandProducts.find((p) => p.sku === item.sku);
      const seasonMatch = seasonFilter === 'all' || item.season === seasonFilter;
      const brandMatch = brandFilter === 'all' || item.brand === brandFilter;
      const searchMatch =
        searchQuery === '' ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch =
        category1Filter === 'all' ||
        (product?.category === category1Filter &&
          (category2Filter === 'all' || product?.subcategory === category2Filter));
      const audienceMatch = audienceFilter === 'all' || item.audience === audienceFilter;

      return seasonMatch && brandMatch && searchMatch && categoryMatch && audienceMatch;
    });
  }, [
    allBrandProducts,
    seasonFilter,
    brandFilter,
    searchQuery,
    category1Filter,
    category2Filter,
    category3Filter,
    audienceFilter,
    mounted,
  ]);

  const filteredSellThroughData = useMemo(() => {
    if (!mounted) return [];
    return sellThroughData.filter((item) => {
      const seasonMatch = seasonFilter === 'all' || item.season === seasonFilter;
      const brandMatch = brandFilter === 'all' || item.brand === brandFilter;
      return seasonMatch && brandMatch;
    });
  }, [sellThroughData, seasonFilter, brandFilter, mounted]);

  const filteredMarketComparisonData = useMemo(() => {
    if (!mounted) return [];
    return marketComparisonData.filter((item) => {
      const seasonMatch = seasonFilter === 'all' || item.season === seasonFilter;
      const brandMatch = brandFilter === 'all' || item.brand === brandFilter;
      return seasonMatch && brandMatch;
    });
  }, [marketComparisonData, seasonFilter, brandFilter, mounted]);

  useEffect(() => {
    if (mounted) {
      const generateRandomData = () => {
        const newSellThrough = initialSellThroughData.map((item) => ({
          ...item,
          sellThrough: 75 + Math.floor(Math.random() * 15),
          margin: 60 + Math.floor(Math.random() * 10),
        }));

        const newMarketComparison = initialMarketComparisonData.map((item) => ({
          ...item,
          yourMargin: 60 + Math.floor(Math.random() * 10),
          yourSellThrough: 75 + Math.floor(Math.random() * 15),
        }));

        setSellThroughData(newSellThrough);
        setMarketComparisonData(newMarketComparison);
      };
      generateRandomData();
    }
  }, [mounted]);

  const seasons = useMemo(() => ['all', ...new Set(abcData.map((d) => d.season))], []);
  const brands = useMemo(() => ['all', ...new Set(abcData.map((d) => d.brand))], []);
  const audiences = useMemo(() => ['all', 'Женский', 'Мужской', 'Унисекс'], []);

  const category1Options = useMemo(() => ['all', ...Object.keys(fullCategoryStructure)], []);
  const category2Options = useMemo(() => {
    if (
      category1Filter === 'all' ||
      !fullCategoryStructure[category1Filter as keyof typeof fullCategoryStructure]
    )
      return [];
    return [
      'all',
      ...Object.keys(fullCategoryStructure[category1Filter as keyof typeof fullCategoryStructure]),
    ];
  }, [category1Filter]);

  const category3Options = useMemo(() => {
    if (
      category1Filter === 'all' ||
      category2Filter === 'all' ||
      !fullCategoryStructure[category1Filter as keyof typeof fullCategoryStructure]?.[
        category2Filter as keyof (typeof fullCategoryStructure)[keyof typeof fullCategoryStructure]
      ]
    )
      return [];
    const subCat =
      fullCategoryStructure[category1Filter as keyof typeof fullCategoryStructure]?.[
        category2Filter as keyof (typeof fullCategoryStructure)[keyof typeof fullCategoryStructure]
      ];
    return subCat ? ['all', ...Object.keys(subCat)] : [];
  }, [category1Filter, category2Filter]);

  if (!mounted) {
    return null; // Or a loading spinner
  }

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <ShopAnalyticsSegmentErpStrip />
      <ShopB2bToolHeader
        title="Аналитика закупок"
        titleVisual="headline"
        description="Глубокий анализ SKU для принятия решений о закупках."
        trailing={
          <>
            <Button
              variant="outline"
              className="border-accent-primary/20 text-accent-primary hover:bg-accent-primary/10"
            >
              <Camera className="mr-2 h-4 w-4" /> AI Discovery: Поиск по фото
            </Button>
            <Button variant="outline" className="border-border-default">
              <FileOutput className="mr-2 h-4 w-4" /> B2C Auto-Content
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Фильтры</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a === 'all' ? 'Вся аудитория' : a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b === 'all' ? 'Все бренды' : b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'all' ? 'Все сезоны' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={category1Filter}
              onValueChange={(v) => {
                setCategory1Filter(v);
                setCategory2Filter('all');
                setCategory3Filter('all');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Категория 1..." />
              </SelectTrigger>
              <SelectContent>
                {category1Options.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'all' ? 'Все категории' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={category2Filter}
              onValueChange={(v) => {
                setCategory2Filter(v);
                setCategory3Filter('all');
              }}
              disabled={category1Filter === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Категория 2..." />
              </SelectTrigger>
              <SelectContent>
                {category2Options.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'all' ? 'Все' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={category3Filter}
              onValueChange={setCategory3Filter}
              disabled={category2Filter === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Категория 3..." />
              </SelectTrigger>
              <SelectContent>
                {category3Options.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'all' ? 'Все' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ABC/XYZ-анализ</CardTitle>
            <CardDescription>
              Классификация товаров по вкладу в выручку и стабильности спроса.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>ABC</TableHead>
                  <TableHead>XYZ</TableHead>
                  <TableHead>Доля в выручке</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAbcData.map((item) => {
                  const product = allBrandProducts.find((p) => p.sku === item.sku);
                  return (
                    <TableRow
                      key={item.sku}
                      onClick={() => setSelectedSkuId(product?.id)}
                      className={cn('cursor-pointer', selectedSkuId === product?.id && 'bg-muted')}
                    >
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.abc === 'A'
                              ? 'default'
                              : item.abc === 'B'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {item.abc}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.xyz}</Badge>
                      </TableCell>
                      <TableCell>{item.revenueShare}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Эффективность брендов</CardTitle>
            <CardDescription>
              Анализ Sell-Through и маржинальности по брендам за выбранный период.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Бренд</TableHead>
                  <TableHead>Sell-Through</TableHead>
                  <TableHead>Средняя маржа</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellThroughData.map((item) => (
                  <TableRow key={item.brand}>
                    <TableCell className="font-medium">{item.brand}</TableCell>
                    <TableCell>{item.sellThrough}%</TableCell>
                    <TableCell>{item.margin.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <SkuAnalytics
        brandProducts={allBrandProducts}
        initialSku={selectedSkuId}
        onSkuChange={setSelectedSkuId}
      />

      <Card>
        <CardHeader>
          <CardTitle>Сравнение с рынком</CardTitle>
          <CardDescription>Сравнение ваших показателей со средними по платформе.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бренд</TableHead>
                <TableHead>Ваша маржа</TableHead>
                <TableHead>Средняя по рынку</TableHead>
                <TableHead>Ваш Sell-Through</TableHead>
                <TableHead>Средний по рынку</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMarketComparisonData.map((item) => (
                <TableRow key={item.brand}>
                  <TableCell className="font-medium">{item.brand}</TableCell>
                  <TableCell
                    className={
                      item.yourMargin > item.marketMargin ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {item.yourMargin.toFixed(1)}%
                  </TableCell>
                  <TableCell>{item.marketMargin.toFixed(1)}%</TableCell>
                  <TableCell
                    className={
                      item.yourSellThrough > item.marketSellThrough
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {item.yourSellThrough}%
                  </TableCell>
                  <TableCell>{item.marketSellThrough}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {lostSizesData.map((item) => (
                  <TableRow key={item.product}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.requests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
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
              <RechartsBar dataKey="value" layout="vertical" radius={5}>
                {returnsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RechartsBar>
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="border-border-subtle mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-analytics-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analyticsFootfall} data-testid="shop-b2b-analytics-footfall-link">
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>
    </CabinetPageContent>
  );
}

export default withShopB2bCoreLegacyGuard(ROUTES.shop.b2bAnalytics, B2BAnalyticsPageContent);
