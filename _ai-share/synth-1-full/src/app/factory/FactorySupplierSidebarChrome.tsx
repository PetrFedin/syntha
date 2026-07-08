'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { Warehouse } from 'lucide-react';
import { HubSidebarHeaderGate } from '@/components/hub/HubSidebarHeaderGate';
import { FactorySupplierLayoutSidebarPanel } from '@/app/factory/supplier/FactorySupplierLayoutSidebarPanel';
import { ROUTES } from '@/lib/routes';

/** Desktop aside supplier hub — отдельный chunk от factory supplier layout shell. */
export function FactorySupplierSidebarChrome() {
  return (
    <>
      <HubSidebarHeaderGate
        href={EXTENDED_ROUTES.factory.supplier}
        icon={Warehouse}
        title="Кабинет поставщика"
        badge="Поставщик"
        badgeClass="bg-emerald-50 text-emerald-600"
        iconBgClass="bg-emerald-900"
      />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        <FactorySupplierLayoutSidebarPanel />
      </div>
    </>
  );
}
