'use client';

import type { ElementType } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

export type UserCabinetTabItem = {
  value: string;
  icon: ElementType<{ className?: string }>;
  label: string;
  count?: number;
  /** `default` — акцентный бейдж (баллы и т.п.). */
  badgeVariant?: 'default' | 'secondary';
  iconColor?: string;
};

export type UserCabinetTabsBarProps = {
  tabs: UserCabinetTabItem[];
  /** Для e2e / автоматизации горизонтального списка вкладок. */
  scrollAreaTestId?: string;
  className?: string;
};

/** Список вкладок: база `cabinetSurface` + компактная высота ряда (32px) как в плотных B2B-кабинетах. */
const tabsListScrollable = cn(
  cabinetSurface.tabsList,
  'inline-flex min-h-8 w-max min-w-full flex-nowrap items-center justify-start gap-0 p-0.5 shadow-inner'
);

const tabsTriggerCabinet = cn(
  cabinetSurface.tabsTrigger,
  'inline-flex h-8 min-h-8 shrink-0 items-center gap-1.5 px-2.5 py-0 focus-visible:ring-2 focus-visible:ring-accent-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
);

/**
 * Горизонтальный скролл основных вкладок кабинета клиента — те же классы, что в brand/admin hub.
 */
export function UserCabinetTabsBar({ tabs, scrollAreaTestId, className }: UserCabinetTabsBarProps) {
  return (
    <ScrollArea
      className={cn('w-full whitespace-nowrap pb-1', className)}
      data-testid={scrollAreaTestId}
    >
      <TabsList className={tabsListScrollable}>
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className={tabsTriggerCabinet}>
            <t.icon className={cn('size-3 shrink-0', t.iconColor)} aria-hidden />
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <Badge
                variant={t.badgeVariant === 'default' ? 'default' : 'secondary'}
                className={cn(
                  'ml-0 flex h-4 min-w-[1rem] items-center justify-center border-none px-1 text-[7px] font-bold',
                  t.badgeVariant === 'default'
                    ? 'bg-accent-primary text-text-inverse hover:bg-accent-primary/90'
                    : 'bg-bg-surface text-text-secondary hover:bg-bg-surface2'
                )}
              >
                {t.count > 999 ? '999+' : t.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
