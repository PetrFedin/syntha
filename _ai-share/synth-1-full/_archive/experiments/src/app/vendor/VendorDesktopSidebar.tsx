'use client';

import Link from 'next/link';
import { Factory, FileText, LayoutDashboard, Settings } from 'lucide-react';

/** Desktop vendor aside — nav в отдельном chunk (только ≥ lg). */
export function VendorDesktopSidebar() {
  return (
    <aside className="border-border-default bg-bg-surface flex w-64 flex-col border-r">
      <div className="border-border-default text-accent-primary flex items-center gap-2 border-b p-4">
        <Factory className="size-6" />
        <span className="text-text-primary text-lg font-bold">Vendor Portal</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <Link
          href="/vendor"
          className="text-text-primary bg-bg-surface2 hover:bg-bg-surface2/80 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
        >
          <LayoutDashboard className="text-text-muted size-4" />
          Dashboard
        </Link>
        <Link
          href="/vendor"
          className="text-text-secondary hover:text-text-primary hover:bg-bg-surface2/50 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
        >
          <FileText className="text-text-muted size-4" />
          Tech Packs
        </Link>
        <Link
          href="/vendor"
          className="text-text-secondary hover:text-text-primary hover:bg-bg-surface2/50 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
        >
          <Settings className="text-text-muted size-4" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}

export function VendorDesktopSidebarPlaceholder() {
  return (
    <aside
      className="border-border-default hidden w-64 shrink-0 flex-col border-r lg:flex"
      aria-hidden
    >
      <div className="border-border-default m-4 h-10 animate-pulse rounded-md bg-muted/40" />
      <div className="mx-4 space-y-2">
        <div className="h-9 animate-pulse rounded-md bg-muted/40" />
        <div className="h-9 animate-pulse rounded-md bg-muted/40" />
        <div className="h-9 animate-pulse rounded-md bg-muted/40" />
      </div>
    </aside>
  );
}
