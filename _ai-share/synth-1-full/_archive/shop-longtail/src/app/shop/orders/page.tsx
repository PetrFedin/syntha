'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { WidgetCard } from '@/components/ui/widget-card';
import { SectionHeader } from '@/components/ui/section-header';
import { RecentOrders } from '@/components/shop';
import { ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <SectionHeader
        icon={ShoppingBag}
        title="Розничные заказы"
        description="Все заказы, поступившие от клиентов через платформу Syntha."
      />
      <WidgetCard title="Заказы" description="Список заказов">
        <RecentOrders />
      </WidgetCard>
    </CabinetPageContent>
  );
}
