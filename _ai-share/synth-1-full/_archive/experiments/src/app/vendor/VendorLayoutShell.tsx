'use client';

import { VendorDesktopSidebarGate } from '@/app/vendor/VendorDesktopSidebarGate';
import { VendorMobileNavBar } from '@/app/vendor/VendorMobileNavBar';

/** Vendor portal shell — sidebar lazy + mobile nav bar. */
export function VendorLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-canvas flex h-screen">
      <VendorDesktopSidebarGate />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-border-default bg-bg-surface flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
          <h1 className="text-text-primary text-sm font-semibold">Factory Workspace</h1>
          <div className="bg-accent-soft text-accent-primary flex size-8 items-center justify-center rounded-full text-xs font-bold">
            F1
          </div>
        </header>
        <VendorMobileNavBar />
        <div className="flex-1 overflow-auto p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
