'use client';

type HomeAdminHubSectionProps = {
  viewRole: string;
};

/**
 * Admin B2B control hub перенесён в `_archive/experiments`.
 * Home не тянет архивные chunks — см. `src/app/admin/[[...path]]` gate.
 */
export function HomeAdminHubSection({ viewRole }: HomeAdminHubSectionProps) {
  if (viewRole !== 'admin') return null;
  return null;
}
