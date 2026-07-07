'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileSpreadsheet, TrendingUp, Package, Target, Download, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { withShopB2bCoreLegacyGuard } from '@/app/shop/b2b/shop-b2b-core-legacy-guard';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import {
  exportToCsv,
  type SalesByBrandRow,
  type TopSkuRow,
  type SellThroughRow,
  type PlanFactRow,
} from '@/lib/b2b/partner-reports-data';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePartnerReports } from '@/hooks/use-partner-reports';

const SEASON_OPTIONS = ['', 'SS26', 'FW25'];
const BRAND_OPTIONS = ['', 'Syntha Lab', 'Nordic Wool'];

/** JOOR/FashioNexus: аналитика и отчёты для партнёра. Фильтры в URL, инфраструктура под API. */
function PartnerReportsPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParamsNonNull();
  const [season, setSeason] = useState('');
  const [brand, setBrand] = useState('');
  useEffect(() => {
    setSeason(searchParams.get('season') ?? '');
    setBrand(searchParams.get('brand') ?? '');
  }, [searchParams]);
  const filters = { season: season || undefined, brand: brand || undefined };
  const { salesByBrand, topSku, sellThrough, planFact, loading, error, refetch } =
    usePartnerReports(filters);

  const updateUrl = (s: string, b: string) => {
    const p = new URLSearchParams();
    if (s) p.set('season', s);
    if (b) p.set('brand', b);
    const q = p.toString();
    router.replace(q ? `${ROUTES.shop.b2bReports}?${q}` : ROUTES.shop.b2bReports, {
      scroll: false,
    });
  };

  const exportSalesByBrand = () => {
    exportToCsv<SalesByBrandRow>(
      salesByBrand,
      [
        { key: 'brand', header: 'Бренд' },
        { key: 'revenue', header: 'Выручка' },
        { key: 'cost', header: 'Себестоимость' },
        { key: 'margin', header: 'Маржа %' },
        { key: 'units', header: 'Шт' },
        { key: 'season', header: 'Сезон' },
      ],
      'partner-sales-by-brand.csv'
    );
    toast({ title: 'Экспорт', description: 'Продажи по брендам сохранены в CSV.' });
  };

  const exportTopSku = () => {
    exportToCsv<TopSkuRow>(
      topSku,
      [
        { key: 'sku', header: 'Артикул' },
        { key: 'name', header: 'Наименование' },
        { key: 'brand', header: 'Бренд' },
        { key: 'category', header: 'Категория' },
        { key: 'unitsSold', header: 'Продано шт' },
        { key: 'revenue', header: 'Выручка' },
        { key: 'sellThroughPct', header: 'Sell-through %' },
        { key: 'season', header: 'Сезон' },
      ],
      'partner-top-sku.csv'
    );
    toast({ title: 'Экспорт', description: 'Топ SKU сохранён в CSV.' });
  };

  const exportSellThrough = () => {
    exportToCsv<SellThroughRow>(
      sellThrough,
      [
        { key: 'sku', header: 'Артикул' },
        { key: 'name', header: 'Наименование' },
        { key: 'brand', header: 'Бренд' },
        { key: 'purchased', header: 'Закуплено' },
        { key: 'sold', header: 'Продано' },
        { key: 'sellThroughPct', header: 'Sell-through %' },
        { key: 'season', header: 'Сезон' },
      ],
      'partner-sell-through.csv'
    );
    toast({ title: 'Экспорт', description: 'Sell-through сохранён в CSV.' });
  };

  const exportPlanFact = () => {
    exportToCsv<PlanFactRow>(
      planFact,
      [
        { key: 'brand', header: 'Бренд' },
        { key: 'season', header: 'Сезон' },
        { key: 'planAmount', header: 'План ₽' },
        { key: 'factAmount', header: 'Факт ₽' },
        { key: 'planUnits', header: 'План шт' },
        { key: 'factUnits', header: 'Факт шт' },
        { key: 'fulfillmentPct', header: 'Выполнение %' },
      ],
      'partner-plan-fact.csv'
    );
    toast({ title: 'Экспорт', description: 'План/факт закупок сохранён в CSV.' });
  };

  const exportAll = () => {
    exportToCsv<SalesByBrandRow>(
      salesByBrand,
      [
        { key: 'brand', header: 'Бренд' },
        { key: 'revenue', header: 'Выручка' },
        { key: 'cost', header: 'Себестоимость' },
        { key: 'margin', header: 'Маржа %' },
        { key: 'units', header: 'Шт' },
        { key: 'season', header: 'Сезон' },
      ],
      'partner-sales-by-brand.csv'
    );
    exportToCsv<TopSkuRow>(
      topSku,
      [
        { key: 'sku', header: 'Артикул' },
        { key: 'name', header: 'Наименование' },
        { key: 'brand', header: 'Бренд' },
        { key: 'category', header: 'Категория' },
        { key: 'unitsSold', header: 'Продано шт' },
        { key: 'revenue', header: 'Выручка' },
        { key: 'sellThroughPct', header: 'Sell-through %' },
        { key: 'season', header: 'Сезон' },
      ],
      'partner-top-sku.csv'
    );
    exportToCsv<SellThroughRow>(
      sellThrough,
      [
        { key: 'sku', header: 'Артикул' },
        { key: 'name', header: 'Наименование' },
        { key: 'brand', header: 'Бренд' },
        { key: 'purchased', header: 'Закуплено' },
        { key: 'sold', header: 'Продано' },
        { key: 'sellThroughPct', header: 'Sell-through %' },
        { key: 'season', header: 'Сезон' },
      ],
      'partner-sell-through.csv'
    );
    exportToCsv<PlanFactRow>(
      planFact,
      [
        { key: 'brand', header: 'Бренд' },
        { key: 'season', header: 'Сезон' },
        { key: 'planAmount', header: 'План ₽' },
        { key: 'factAmount', header: 'Факт ₽' },
        { key: 'planUnits', header: 'План шт' },
        { key: 'factUnits', header: 'Факт шт' },
        { key: 'fulfillmentPct', header: 'Выполнение %' },
      ],
      'partner-plan-fact.csv'
    );
    toast({ title: 'Экспорт', description: 'Все отчёты экспортированы в CSV (4 файла).' });
  };

  function TableSkeleton({ rows = 4 }: { rows?: number }) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-bg-surface2 h-10 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6">
      <div className="mb-6 flex flex-col gap-4">
        <ShopB2bContentHeader
          lead="Продажи по брендам, топ SKU, sell-through, план/факт закупок. Экспорт в CSV."
          trailing={
            <>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => refetch()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={exportAll}
                disabled={loading}
              >
                <FileSpreadsheet className="h-4 w-4" /> Экспорт всех в CSV
              </Button>
            </>
          }
        />
        <ShopAnalyticsSegmentErpStrip />
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-text-secondary text-xs font-medium uppercase">Сезон</label>
          <select
            value={season}
            onChange={(e) => {
              const v = e.target.value;
              setSeason(v);
              updateUrl(v, brand);
            }}
            className="border-border-default rounded-md border bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Все сезоны</option>
            {SEASON_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="text-text-secondary text-xs font-medium uppercase">Бренд</label>
          <select
            value={brand}
            onChange={(e) => {
              const v = e.target.value;
              setBrand(v);
              updateUrl(season, v);
            }}
            className="border-border-default rounded-md border bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Все бренды</option>
            {BRAND_OPTIONS.filter(Boolean).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Повторить
            </Button>
          </div>
        )}
      </div>

      {/* Продажи по брендам */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Продажи по брендам
            </CardTitle>
            <CardDescription>Выручка, себестоимость, маржа %, единицы</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={exportSalesByBrand} disabled={loading}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Бренд</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                  <TableHead className="text-right">Себестоимость</TableHead>
                  <TableHead className="text-right">Маржа %</TableHead>
                  <TableHead className="text-right">Шт</TableHead>
                  <TableHead>Сезон</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByBrand.map((r) => (
                  <TableRow key={r.brand}>
                    <TableCell className="font-medium">{r.brand}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.revenue.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell className="text-text-secondary text-right tabular-nums">
                      {r.cost.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {r.margin}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.units}</TableCell>
                    <TableCell>{r.season}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Топ SKU */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Топ SKU
            </CardTitle>
            <CardDescription>По объёму продаж и выручке</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={exportTopSku} disabled={loading}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Бренд</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead className="text-right">Продано</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                  <TableHead className="text-right">Sell-through %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSku.map((r) => (
                  <TableRow key={r.sku}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.brand}</TableCell>
                    <TableCell className="text-text-secondary">{r.category}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.unitsSold}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.revenue.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={r.sellThroughPct >= 80 ? 'font-medium text-emerald-600' : ''}
                      >
                        {r.sellThroughPct}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sell-through по артикулам */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">Sell-through по артикулам</CardTitle>
            <CardDescription>Закуплено / продано / %</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={exportSellThrough} disabled={loading}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Бренд</TableHead>
                  <TableHead className="text-right">Закуплено</TableHead>
                  <TableHead className="text-right">Продано</TableHead>
                  <TableHead className="text-right">Sell-through %</TableHead>
                  <TableHead>Сезон</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellThrough.map((r) => (
                  <TableRow key={r.sku}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.brand}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.purchased}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.sold}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={r.sellThroughPct} className="h-2 w-12" />
                        <span
                          className={
                            r.sellThroughPct >= 80 ? 'font-medium text-emerald-600' : 'tabular-nums'
                          }
                        >
                          {r.sellThroughPct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{r.season}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* План/факт закупок */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" /> План / факт закупок
            </CardTitle>
            <CardDescription>Выполнение плана закупок по брендам</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={exportPlanFact} disabled={loading}>
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Бренд</TableHead>
                  <TableHead>Сезон</TableHead>
                  <TableHead className="text-right">План ₽</TableHead>
                  <TableHead className="text-right">Факт ₽</TableHead>
                  <TableHead className="text-right">План шт</TableHead>
                  <TableHead className="text-right">Факт шт</TableHead>
                  <TableHead className="text-right">Выполнение %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planFact.map((r) => (
                  <TableRow key={`${r.brand}-${r.season}`}>
                    <TableCell className="font-medium">{r.brand}</TableCell>
                    <TableCell>{r.season}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.planAmount.toLocaleString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.factAmount.toLocaleString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.planUnits}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.factUnits}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={r.fulfillmentPct} className="h-2 w-14" />
                        <span
                          className={
                            r.fulfillmentPct >= 90 ? 'font-medium text-emerald-600' : 'tabular-nums'
                          }
                        >
                          {r.fulfillmentPct}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="border-border-subtle mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-reports-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analyticsFootfall} data-testid="shop-b2b-reports-footfall-link">
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrderAnalytics}>Аналитика заказов</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bMarginReport}>Маржа по брендам</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bAnalytics}>Аналитика B2B</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Мои заказы</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, аналитика, fulfillment"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}

export default withShopB2bCoreLegacyGuard(ROUTES.shop.b2bReports, PartnerReportsPageContent);
