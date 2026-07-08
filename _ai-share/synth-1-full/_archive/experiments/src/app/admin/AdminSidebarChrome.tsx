'use client';

import { Shield } from 'lucide-react';
import { HubSidebarHeaderGate } from '@/components/hub/HubSidebarHeaderGate';
import { AdminLayoutSidebarPanel } from '@/app/admin/AdminLayoutSidebarPanel';
import { ROUTES } from '@/lib/routes';

/** Desktop aside: header + nav — отдельный chunk от admin layout shell. */
export function AdminSidebarChrome() {
  return (
    <>
      <HubSidebarHeaderGate
        href={ROUTES.admin.home}
        icon={Shield}
        title="Админ-центр"
        badge="HQ"
        badgeClass="bg-amber-50 text-amber-600"
        iconBgClass="bg-text-primary"
      />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        <AdminLayoutSidebarPanel />
      </div>
    </>
  );
}
