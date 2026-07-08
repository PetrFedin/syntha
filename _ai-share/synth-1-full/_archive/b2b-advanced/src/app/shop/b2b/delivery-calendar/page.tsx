'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { ShopB2bDeliveryCalendarCore } from '@/components/shop/b2b/ShopB2bDeliveryCalendarCore';

/** Shop · столп 3/5 · календарь окон поставки (spine + W2, без mock-каналов). */
export default function B2BDeliveryCalendarPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Окна поставки по коллекциям и оптовым заказам: даты отгрузки, дедлайны отмены и связь с реестром и коммуникациями." />
      <ShopAnalyticsSegmentErpStrip />
      <ShopB2bDeliveryCalendarCore />

      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.b2bOrders} data-testid="shop-b2b-delivery-calendar-orders-link">
            Оптовый реестр
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-delivery-calendar-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-b2b-delivery-calendar-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>

      <RelatedModulesBlock
        title="Связанные разделы"
        links={getShopB2BHubLinks().filter((l) =>
          [ROUTES.shop.b2bCreateOrder, ROUTES.shop.b2bCollectionTerms, ROUTES.shop.b2bOrders].includes(
            l.href as string
          )
        )}
      />
    </CabinetPageContent>
  );
}
