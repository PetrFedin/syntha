'use client';

import dynamic from 'next/dynamic';
import { CabinetDesktopOnly } from '@/components/layout/CabinetDesktopOnly';

function AdminDesktopSidebarPlaceholder() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-hidden>
      <div className="border-border-subtle mx-2 mb-2 h-20 animate-pulse rounded-md bg-muted/40" />
      <div className="mx-3 my-4 h-24 animate-pulse rounded-md bg-muted/40" />
    </div>
  );
}

const AdminDesktopSidebar = dynamic(
  () =>
    import('./AdminSidebarChrome').then((m) => ({
      default: m.AdminSidebarChrome,
    })),
  { ssr: false, loading: AdminDesktopSidebarPlaceholder }
);

/** Admin desktop sidebar — header + nav в одном chunk (только ≥ lg). */
export function AdminDesktopSidebarGate() {
  return (
    <CabinetDesktopOnly>
      <AdminDesktopSidebar />
    </CabinetDesktopOnly>
  );
}
