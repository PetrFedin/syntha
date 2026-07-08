'use client';

import Link from 'next/link';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';

/** Компактная навигация vendor на mobile (< lg), когда desktop sidebar скрыт. */
export function VendorMobileNavBar() {
  return (
    <nav className="border-border-default bg-bg-surface flex gap-1 overflow-x-auto border-b px-3 py-2 lg:hidden">
      {[
        { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/vendor', label: 'Tech Packs', icon: FileText },
        { href: '/vendor', label: 'Settings', icon: Settings },
      ].map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="text-text-secondary hover:text-text-primary hover:bg-bg-surface2/80 flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
        >
          <Icon className="size-3.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
