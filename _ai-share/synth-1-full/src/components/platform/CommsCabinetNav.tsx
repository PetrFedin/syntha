'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreHeaderHubTabClass } from '@/lib/platform-core-header-controls';

type Tab = {
  href: string;
  label: string;
  testId: string;
  icon: typeof MessageSquare;
  badge?: ReactNode;
};

type Props = {
  tabs: Tab[];
  className?: string;
};

/** Comms cabinet: одна compact navigation row для desktop/tablet. */
export function CommsCabinetNav({ tabs, className }: Props) {
  return (
    <nav
      data-testid="comms-cabinet-nav"
      aria-label="Связь · навигация"
      className={cn(
        'border-border-subtle bg-bg-surface hidden gap-0.5 rounded-md border p-0.5 md:flex',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.testId}
            href={tab.href}
            data-testid={tab.testId}
            className={cn(
              platformCoreHeaderHubTabClass(false),
              'inline-flex h-8 min-h-0 flex-1 items-center justify-center gap-1 rounded px-2 text-[11px] font-medium normal-case tracking-normal'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{tab.label}</span>
            {tab.badge}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sticky bottom bar — compact mobile navigation без oversized buttons. */
export function CommsCabinetBottomBar({ tabs, className }: Props) {
  return (
    <nav
      data-testid="comms-cabinet-bottom-bar"
      aria-label="Связь · быстрый вход"
      className={cn(hubCabinet.commsBottomBar, 'flex md:hidden', className)}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.testId}
            href={tab.href}
            data-testid={tab.testId}
            className="text-text-primary hover:bg-bg-surface2 inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 text-[10px] font-medium transition-colors"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{tab.label}</span>
            {tab.badge}
          </Link>
        );
      })}
    </nav>
  );
}
