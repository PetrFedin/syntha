'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { Factory } from 'lucide-react';
import { HubSidebarHeaderGate } from '@/components/hub/HubSidebarHeaderGate';
import { FactoryProductionLayoutSidebarPanel } from '@/app/factory/production/FactoryProductionLayoutSidebarPanel';
import { ROUTES } from '@/lib/routes';

/** Desktop aside MFR hub — отдельный chunk от factory production layout shell. */
export function FactoryProductionSidebarChrome() {
  return (
    <>
      <HubSidebarHeaderGate
        href={EXTENDED_ROUTES.factory.production}
        icon={Factory}
        title="Кабинет производства"
        badge="Производство"
        badgeClass="bg-emerald-50 text-emerald-600"
        iconBgClass="bg-emerald-900"
      />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        <FactoryProductionLayoutSidebarPanel />
      </div>
    </>
  );
}
