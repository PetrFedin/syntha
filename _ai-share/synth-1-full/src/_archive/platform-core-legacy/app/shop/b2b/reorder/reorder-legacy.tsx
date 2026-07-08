'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, TrendingUp, TrendingDown, Minus, Package } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { mockB2BOrders } from '@/lib/order-data';
import {
  getReorderLinesWithSellThrough,
  getReorderLinesByOrder,
} from '@/lib/b2b/reorder-sellthrough';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';

export function ShopB2bReorderLegacyPage() {
  const searchParams = useSearchParamsNonNull();
  const copyFrom = searchParams.get('copyFrom') ?? '';

  const allLines = getReorderLinesWithSellThrough();
  const ordersWithLines = Array.from(new Set(allLines.map((l) => l.orderId))).map((id) => {
    const order = mockB2BOrders.find((o) => o.order === id);
    return {
      orderId: id,
      brand: order?.brand ?? '',
      status: order?.status,
      lines: getReorderLinesByOrder(id),
    };
  });

  const highlightOrderId =
    copyFrom && ordersWithLines.some((o) => o.orderId === copyFrom) ? copyFrom : null;

  return (
    <ShopB2bNuOrderScope className="pb-24">
      <ShopB2bContentHeader
        backHref={ROUTES.shop.b2bOrders}
        lead="Повтор заказа из истории с подсказками по sell-through (мок)."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" /> Заказы и подсказки по продажам
          </CardTitle>
          <CardDescription>
            Выберите заказ и посмотрите, как шли продажи по артикулам. Рекомендуемое кол-во к
            повторному заказу рассчитано по sell-through (мок).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ordersWithLines.map(({ orderId, brand, status, lines }) => (
            <div
              key={orderId}
              className={
                highlightOrderId === orderId
                  ? 'border-accent-primary/30 bg-accent-primary/10 rounded-xl border-2 p-4'
                  : 'border-border-default rounded-xl border p-4'
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{orderId}</span>
                  <span className="text-text-secondary">{brand}</span>
                  {status && <Badge variant="secondary">{status}</Badge>}
                </div>
                <Button size="sm" asChild>
                  <Link href={`${ROUTES.shop.b2bMatrix}?mode=reorder&copyFrom=${orderId}`}>
                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Reorder
                  </Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border-default border-b">
                      <th className="py-2 text-left font-medium">Артикул / Товар</th>
                      <th className="py-2 text-right font-medium">Заказывали</th>
                      <th className="py-2 text-right font-medium">Продано (мок)</th>
                      <th className="py-2 text-right font-medium">Sell-through</th>
                      <th className="py-2 text-right font-medium">Рекомендация</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={`${l.orderId}-${l.sku}`} className="border-border-subtle border-b">
                        <td className="py-2">
                          <span className="font-mono text-xs">{l.sku}</span>
                          <span className="text-text-secondary block max-w-[180px] truncate">
                            {l.productName}
                          </span>
                        </td>
                        <td className="py-2 text-right">{l.previousQty}</td>
                        <td className="py-2 text-right">{l.soldQty}</td>
                        <td className="py-2 text-right">
                          <span
                            className={
                              l.sellThroughRate >= 0.8
                                ? 'text-emerald-600'
                                : l.sellThroughRate < 0.5
                                  ? 'text-amber-600'
                                  : 'text-text-secondary'
                            }
                          >
                            {Math.round(l.sellThroughRate * 100)}%
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-semibold">{l.suggestedQty}</span>
                          {l.hint === 'increase' && (
                            <TrendingUp className="ml-1 inline h-3.5 w-3.5 text-emerald-500" />
                          )}
                          {l.hint === 'decrease' && (
                            <TrendingDown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />
                          )}
                          {l.hint === 'same' && (
                            <Minus className="text-text-muted ml-1 inline h-3.5 w-3.5" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Мои заказы</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bMatrix}>Матрица заказа</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bCatalog}>
            <Package className="mr-1 h-3.5 w-3.5" /> Каталог
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bSizeFinder}>Подбор размера</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, матрица, каталог"
        className="mt-6"
      />
    </ShopB2bNuOrderScope>
  );
}
