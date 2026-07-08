'use client';

import { Shield } from 'lucide-react';
import { HubMobileSidebarSheet } from '@/components/layout/HubMobileSidebarSheet';
import { HubSidebarHeader } from '@/components/hub/HubSidebarHeader';
import { AdminLayoutSidebarPanel } from '@/app/admin/AdminLayoutSidebarPanel';
import { ROUTES } from '@/lib/routes';

type AdminMobileSidebarSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminMobileSidebarSheet({ open, onOpenChange }: AdminMobileSidebarSheetProps) {
  const header = (
    <HubSidebarHeader
      href={ROUTES.admin.home}
      icon={Shield}
      title="Админ-центр"
      badge="HQ"
      badgeClass="bg-amber-50 text-amber-600"
      iconBgClass="bg-text-primary"
    />
  );

  return (
    <HubMobileSidebarSheet
      open={open}
      onOpenChange={onOpenChange}
      srTitle="Меню админ-центра"
      header={header}
    >
      <AdminLayoutSidebarPanel onNavigate={() => onOpenChange(false)} />
    </HubMobileSidebarSheet>
  );
}
