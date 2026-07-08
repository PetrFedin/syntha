'use client';

/**
 * Сайдбар admin layout — adminNavGroups в отдельном chunk.
 */
import { HubSidebarLazy } from '@/components/hub/HubSidebarLazy';
import { adminNavGroups } from '@/lib/data/admin-navigation-normalized';
import { ROUTES } from '@/lib/routes';

type AdminLayoutSidebarPanelProps = {
  onNavigate?: () => void;
};

export function AdminLayoutSidebarPanel({ onNavigate }: AdminLayoutSidebarPanelProps) {
  return (
    <HubSidebarLazy
      groups={adminNavGroups}
      basePath={ROUTES.admin.home}
      ariaLabel="Меню администратора"
      accentClass="text-amber-600"
      activeBgClass="bg-text-primary"
      onNavigate={onNavigate}
    />
  );
}
