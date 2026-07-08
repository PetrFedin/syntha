'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Bell, Calendar, MessageSquare } from 'lucide-react';
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
  /** md+: горизонтальные tabs; mobile — в bottom bar карточки */
  className?: string;
};

/** Comms cabinet: desktop/tablet nav (Chat · Calendar · Notifications). */
export function CommsCabinetNav({ tabs, className }: Props) {
  return (
    <nav
      data-testid="comms-cabinet-nav"
      aria-label="Связь · навигация"
      className={cn(
        'border-border-subtle bg-bg-surface hidden gap-1 rounded-xl border p-1 md:flex',
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
              'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 px-3 text-[13px] font-medium normal-case tracking-normal'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {tab.label}
            {tab.badge}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sticky bottom bar — только iPhone. */
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
            className="text-text-primary inline-flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{tab.label}</span>
            {tab.badge}
          </Link>
        );
      })}
    </nav>
  );
}
