'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { useMemo } from 'react';
import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { getAgentBrands } from '@/lib/b2b/agent-context';
import { useShopB2BOperationalOrdersList } from '@/hooks/use-b2b-operational-orders-list';
import { getWholesaleOrderIdFromB2BOrder } from '@/lib/domain/cross-role-entity-ids';
import { Filter } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import {
  dedupeEntityLinksByHref,
  finalizeRelatedModuleLinks,
  getShopB2BHubLinks,
  getShopB2bOrdersCrossRoleLinks,
} from '@/lib/data/entity-links';
import { OrderRecommendationsBlock } from '@/components/b2b/OrderRecommendationsBlock';
import { OrderChatBot } from '@/components/b2b/OrderChatBot';
import { tid } from '@/lib/ui/test-ids';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import { getSynthaThreeCoresFullMatrixGroups } from '@/lib/syntha-priority-cores';

export function ShopB2bOrdersLegacyPage() {
  const searchParams = useSearchParams();
  const brandFilter = searchParams.get('brand') ?? '';
  const brands = getAgentBrands();
  const operationalOrders = useShopB2BOperationalOrdersList();
  const listOrders = useMemo(
    () =>
      operationalOrders.map((o) => ({
        orderId: getWholesaleOrderIdFromB2BOrder(o),
        brand: o.brand,
        status: o.status,
        amount: o.amount,
        paymentStatus: o.paymentStatus,
      })),
    [operationalOrders]
  );
  const filteredOrders = useMemo(
    () => (brandFilter ? listOrders.filter((o) => o.brand === brandFilter) : listOrders),
    [listOrders, brandFilter]
  );

  return (
    <ShopB2bNuOrderScope className="space-y-6" data-testid={tid.page('shop-b2b-orders')}>
      <ShopB2bContentHeader lead="Список заказов; фильтр по бренду для агента — один вход, несколько брендов." />
      <ShopAnalyticsSegmentErpStrip />

      <B2bPriorityWorkflowPanel
        title="Связка направлений: ТЗ → B2B → команды"
        lead="То же, что у бренда: вертикаль исполнения, оптовый контур, надстройка коммуникаций, горизонталь ролей."
        groups={getSynthaThreeCoresFullMatrixGroups()}
      />

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
            <Filter className="h-4 w-4" /> Фильтр по бренду
          </CardTitle>
          <CardDescription>
            Быстрый фильтр заказов по бренду (мультибренд для агента).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!brandFilter ? 'default' : 'outline'}
              size="sm"
              className="rounded-lg text-[10px] font-black uppercase"
              asChild
            >
              <Link href={ROUTES.shop.b2bOrders}>Все</Link>
            </Button>
            {brands.map((b) => (
              <Button
                key={b.id}
                variant={brandFilter === b.name ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg text-[10px] font-black uppercase"
                asChild
              >
                <Link href={`${ROUTES.shop.b2bOrders}?brand=${encodeURIComponent(b.name)}`}>
                  {b.name}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <OrderRecommendationsBlock orderLineCount={filteredOrders.length * 3} />

      <div className="grid gap-4 md:grid-cols-[1fr,280px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заказы</CardTitle>
            <CardDescription>
              {brandFilter ? `Бренд: ${brandFilter}` : 'Все бренды'} · {filteredOrders.length}{' '}
              заказ(ов)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <p className="text-text-secondary text-sm">Нет заказов по выбранному фильтру.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border-default border-b">
                      <th className="py-2 text-left font-medium">ID заказа опта</th>
                      <th className="py-2 text-left font-medium">Бренд</th>
                      <th className="py-2 text-left font-medium">Статус</th>
                      <th className="py-2 text-right font-medium">Сумма</th>
                      <th className="py-2 text-left font-medium">Оплата</th>
                      <th className="whitespace-nowrap py-2 text-right font-medium">Быстро</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.orderId} className="border-border-subtle border-b">
                        <td className="py-2 font-mono">
                          <Link
                            className="text-accent-primary hover:underline"
                            href={ROUTES.shop.b2bOrder(o.orderId)}
                          >
                            {o.orderId}
                          </Link>
                        </td>
                        <td className="py-2">{o.brand}</td>
                        <td className="py-2">
                          <Badge variant="secondary" className="text-[9px]">
                            {o.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-right font-medium">{o.amount}</td>
                        <td className="text-text-secondary py-2 text-[10px]">
                          {o.paymentStatus ?? '—'}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex flex-wrap justify-end gap-x-2 gap-y-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            <Link
                              className="text-accent-primary hover:underline"
                              href={`${LEGACY_ROUTES.shop.b2bPayment}?orderId=${encodeURIComponent(o.orderId)}`}
                            >
                              Оплата
                            </Link>
                            <Link
                              className="text-accent-primary hover:underline"
                              href={ROUTES.shop.b2bTracking}
                            >
                              Трек
                            </Link>
                            <Link
                              className="text-accent-primary hover:underline"
                              href={ROUTES.shop.b2bClaims}
                            >
                              Претензия
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <OrderChatBot defaultCollapsed={true} className="h-fit md:sticky md:top-24" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bAgentCabinet}>Агентский кабинет</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bFinance}>Финансы партнёра</Link>
        </Button>
      </div>

      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-orders-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analyticsFootfall} data-testid="shop-b2b-orders-footfall-link">
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>

      <RelatedModulesBlock
        links={finalizeRelatedModuleLinks(
          dedupeEntityLinksByHref([...getShopB2bOrdersCrossRoleLinks(), ...getShopB2BHubLinks()])
        )}
        title="Связанные кабинеты и B2B-модули"
        className="mt-6"
      />
    </ShopB2bNuOrderScope>
  );
}
