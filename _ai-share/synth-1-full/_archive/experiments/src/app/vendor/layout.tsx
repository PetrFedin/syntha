import React from 'react';
import Link from 'next/link';
import { Factory, FileText, LayoutDashboard, Settings } from 'lucide-react';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-canvas flex h-screen">
      {/* Sidebar */}
      <aside className="bg-bg-surface border-border-default flex w-64 flex-col border-r">
        <div className="border-border-default text-accent-primary flex items-center gap-2 border-b p-4">
          <Factory className="h-6 w-6" />
          <span className="text-text-primary text-lg font-bold">Vendor Portal</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/vendor"
            className="text-text-primary bg-bg-surface2 hover:bg-bg-surface2/80 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
          >
            <LayoutDashboard className="text-text-muted h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/vendor"
            className="text-text-secondary hover:text-text-primary hover:bg-bg-surface2/50 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
          >
            <FileText className="text-text-muted h-4 w-4" />
            Tech Packs
          </Link>
          <Link
            href="/vendor"
            className="text-text-secondary hover:text-text-primary hover:bg-bg-surface2/50 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
          >
            <Settings className="text-text-muted h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border-default bg-bg-surface flex h-14 shrink-0 items-center justify-between border-b px-6">
          <h1 className="text-text-primary text-sm font-semibold">Factory Workspace</h1>
          <div className="flex items-center gap-2">
            <div className="bg-accent-soft text-accent-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              F1
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
