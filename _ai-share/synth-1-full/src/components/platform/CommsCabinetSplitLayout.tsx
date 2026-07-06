'use client';

import type { ReactNode } from 'react';
import { CommsCabinetBottomBar, CommsCabinetNav } from '@/components/platform/CommsCabinetNav';
import { cn } from '@/lib/utils';

type Tab = {
  href: string;
  label: string;
  testId: string;
  icon: typeof import('lucide-react').MessageSquare;
  badge?: ReactNode;
};

type Props = {
  tabs: Tab[];
  /** iPhone bottom bar — по умолчанию tabs без «Уведомления». */
  bottomTabs?: Tab[];
  threadStrip: ReactNode;
  /** md+ под nav: группы по разделам (sidebar section). */
  groupsPanel?: ReactNode;
  /** md+ правая колонка: уведомления + PO inbox (mfr). */
  notificationsPanel?: ReactNode;
  /** lg+ между списком и уведомлениями: превью активного треда. */
  threadPreview?: ReactNode;
  /** Центральная колонка вместо threadStrip (например заметки). */
  mainPanel?: ReactNode;
  className?: string;
};

/** Comms cabinet: md+ tabs rail + thread list + optional groups/notifications; mobile — threads + bottom bar. */
export function CommsCabinetSplitLayout({
  tabs,
  bottomTabs,
  threadStrip,
  groupsPanel,
  notificationsPanel,
  threadPreview,
  mainPanel,
  className,
}: Props) {
  const centerContent = mainPanel ?? threadStrip;
  const hasAside = Boolean(notificationsPanel);
  const hasPreview = Boolean(threadPreview);

  return (
    <div className={cn('space-y-3', className)} data-testid="comms-cabinet-split">
      <div
        className={cn(
          'hidden md:grid md:items-start md:gap-4',
          hasAside && hasPreview
            ? 'md:grid-cols-[10.5rem_minmax(0,1.4fr)_minmax(0,1fr)_13.5rem]'
            : hasAside
              ? 'md:grid-cols-[10.5rem_minmax(0,1fr)_13.5rem]'
              : hasPreview
                ? 'md:grid-cols-[10.5rem_minmax(0,1fr)_minmax(0,1fr)]'
                : 'md:grid-cols-[10.5rem_minmax(0,1fr)]'
        )}
      >
        <div className="min-w-0 space-y-3">
          <CommsCabinetNav
            tabs={tabs}
            className="!flex-col !items-stretch !border-0 !bg-transparent !p-0 [&>a]:w-full [&>a]:flex-none"
          />
          {groupsPanel}
        </div>
        <div className="min-w-0 space-y-3">{centerContent}</div>
        {threadPreview}
        {notificationsPanel ? (
          <aside
            className="min-w-0 space-y-3 max-md:hidden"
            data-testid="comms-cabinet-notifications-aside"
          >
            {notificationsPanel}
          </aside>
        ) : null}
      </div>
      <div className="min-w-0 space-y-3 md:hidden">{centerContent}</div>
      <CommsCabinetBottomBar tabs={bottomTabs ?? tabs} />
    </div>
  );
}
