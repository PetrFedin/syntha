'use client';

import { Briefcase } from 'lucide-react';
import { HubSidebarHeaderGate } from '@/components/hub/HubSidebarHeaderGate';
import { DistributorLayoutSidebarPanel } from '@/app/distributor/DistributorLayoutSidebarPanel';
import { ROUTES } from '@/lib/routes';

/** Desktop aside: header + nav — отдельный chunk от distributor layout shell. */
export function DistributorSidebarChrome() {
  return (
    <>
      <HubSidebarHeaderGate
        href={ROUTES.distributor.home}
        icon={Briefcase}
        title="Кабинет дистрибьютора"
        badge="Опт"
        badgeClass="bg-amber-50 text-amber-600"
        iconBgClass="bg-amber-900"
      />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        <DistributorLayoutSidebarPanel />
      </div>
    </>
  );
}
