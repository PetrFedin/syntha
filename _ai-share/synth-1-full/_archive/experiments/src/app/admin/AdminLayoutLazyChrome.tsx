'use client';

import dynamic from 'next/dynamic';
import { Shield } from 'lucide-react';

export { Shield as AdminHubIcon };

function SidebarSkeleton() {
  return <div className="mx-3 my-4 h-24 animate-pulse rounded-md bg-muted/40" aria-hidden />;
}

/** adminNavGroups + HubSidebar — отдельный chunk от admin layout shell. */
export const AdminLayoutSidebarPanel = dynamic(
  () =>
    import('./AdminLayoutSidebarPanel').then((m) => ({
      default: m.AdminLayoutSidebarPanel,
    })),
  { ssr: false, loading: SidebarSkeleton }
);

export const AdminMobileSidebarSheet = dynamic(
  () =>
    import('./AdminMobileSidebarSheet').then((m) => ({
      default: m.AdminMobileSidebarSheet,
    })),
  { ssr: false }
);
