'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';
import {
  getAgentBrands,
  getSelectedAgentBrandId,
  setSelectedAgentBrandId,
  getAgentCommissionForBrand,
} from '@/lib/b2b/agent-context';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { UserCircle, Percent, FileText, ShoppingCart, BarChart3, Filter } from 'lucide-react';
import { ReplenishmentRecommendationsBlock } from '@/components/b2b/ReplenishmentRecommendationsBlock';

export default function AgentCabinetPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bAgentCabinet} />;
  }

  const brands = getAgentBrands();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(getSelectedAgentBrandId());
  }, []);

  const handleSwitchBrand = (brandId: string) => {
    setSelectedAgentBrandId(brandId);
    setSelectedId(brandId);
  };

  const selected = selectedId ? (brands.find((b) => b.id === selectedId) ?? brands[0]) : brands[0];
  const commission = selected
    ? getAgentCommissionForBrand(selected.id)
    : { percent: 0, amountYtd: 0 };

  const totalRevenue = brands.reduce((s, b) => s + b.revenueYtd, 0);
  const totalCommission = brands.reduce(
    (s, b) => s + Math.round((b.revenueYtd * b.commissionPercent) / 100),
    0
  );
  const totalOrders = brands.reduce((s, b) => s + b.ordersCountYtd, 0);

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader lead="Агентский кабинет: один вход, несколько брендов — переключение контекста, комиссии и отчёты." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Текущий бренд</CardTitle>
          <CardDescription>
            Выберите бренд — заказы, отчёты и комиссии ниже считаются по нему.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <Button
                key={b.id}
                variant={selectedId === b.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSwitchBrand(b.id)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" /> Сводный отчёт по брендам
          </CardTitle>
          <CardDescription>
            Объём (выручка), комиссия и количество заказов по каждому бренду. Мультиканальность и
            мультибренд для агента.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border-default border-b">
                  <th className="py-2 text-left font-medium">Бренд</th>
                  <th className="py-2 text-right font-medium">Объём (выручка)</th>
                  <th className="py-2 text-right font-medium">Комиссия</th>
                  <th className="py-2 text-right font-medium">Заказов</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => {
                  const comm = getAgentCommissionForBrand(b.id);
                  return (
                    <tr key={b.id} className="border-border-subtle border-b">
                      <td className="py-2 font-medium">{b.name}</td>
                      <td className="py-2 text-right">
                        {(b.revenueYtd / 1_000_000).toFixed(2)} млн ₽
                      </td>
                      <td className="py-2 text-right">{(comm.amountYtd / 1000).toFixed(0)}k ₽</td>
                      <td className="py-2 text-right">{b.ordersCountYtd}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-border-default border-t-2 font-semibold">
                  <td className="py-2">Итого</td>
                  <td className="py-2 text-right">{(totalRevenue / 1_000_000).toFixed(2)} млн ₽</td>
                  <td className="py-2 text-right">{(totalCommission / 1000).toFixed(0)}k ₽</td>
                  <td className="py-2 text-right">{totalOrders}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> Быстрые фильтры заказов по бренду
          </CardTitle>
          <CardDescription>Перейти к списку заказов с фильтром по бренду.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href={ROUTES.shop.b2bOrders}>Все заказы</Link>
          </Button>
          {brands.map((b) => (
            <Button key={b.id} variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href={`${ROUTES.shop.b2bOrders}?brand=${encodeURIComponent(b.name)}`}>
                Заказы · {b.name}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {selected && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Percent className="h-4 w-4" /> Комиссии · {selected.name}
              </CardTitle>
              <CardDescription>Мок: комиссия агента по выбранному бренду.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                Ставка: <strong>{selected.commissionPercent}%</strong>
              </p>
              <p className="text-sm">
                Комиссия с выручки с начала года:{' '}
                <strong>{(commission.amountYtd / 1000).toFixed(0)}k ₽</strong>
              </p>
              <p className="text-text-secondary text-xs">
                Выручка по бренду (YTD): {(selected.revenueYtd / 1_000_000).toFixed(2)} млн ₽ ·
                Заказов: {selected.ordersCountYtd}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Отчёты по бренду
              </CardTitle>
              <CardDescription>Ссылки на заказы и аналитику по {selected.name}.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`${ROUTES.shop.b2bOrders}?brand=${encodeURIComponent(selected.name)}`}>
                  Заказы по бренду
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.shop.b2bOrderAnalytics}>Аналитика заказов</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.shop.b2bCreateOrder}>Создать заказ</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Сводный заказ агента</CardTitle>
          <CardDescription>
            Один драфт с позициями по разным брендам. MOV/MOQ проверяются по каждому бренду.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={ROUTES.shop.b2bAgentConsolidatedOrder}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Открыть сводный заказ
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <ReplenishmentRecommendationsBlock brandId={selected?.name} maxItems={5} compact />
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bCatalog}>B2B каталог</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Заказы</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, матрица, каталог"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
