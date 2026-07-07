'use client';

import { Briefcase } from 'lucide-react';
import { HubMobileSidebarSheet } from '@/components/layout/HubMobileSidebarSheet';
import { HubSidebarHeader } from '@/components/hub/HubSidebarHeader';
import { DistributorLayoutSidebarPanel } from '@/app/distributor/DistributorLayoutSidebarPanel';
import { ROUTES } from '@/lib/routes';

type DistributorMobileSidebarSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DistributorMobileSidebarSheet({
  open,
  onOpenChange,
}: DistributorMobileSidebarSheetProps) {
  const header = (
    <HubSidebarHeader
      href={ROUTES.distributor.home}
      icon={Briefcase}
      title="Кабинет дистрибьютора"
      badge="Опт"
      badgeClass="bg-amber-50 text-amber-600"
      iconBgClass="bg-amber-900"
    />
  );

  return (
    <HubMobileSidebarSheet
      open={open}
      onOpenChange={onOpenChange}
      srTitle="Меню кабинета дистрибьютора"
      header={header}
    >
      <DistributorLayoutSidebarPanel onNavigate={() => onOpenChange(false)} />
    </HubMobileSidebarSheet>
  );
}
