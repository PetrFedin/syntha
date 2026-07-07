'use client';

import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { MAIN_GROUP_ORDER, MAIN_GROUP_META, type ClientMeMainGroup } from './client-me-tab-model';

export function ClientMeMainGroupStrip({
  activeGroup,
  onSelectGroup,
}: {
  activeGroup: ClientMeMainGroup;
  onSelectGroup: (g: ClientMeMainGroup) => void;
}) {
  return (
    <div
      className={cn(
        cabinetSurface.groupTabList,
        'mb-0.5 !h-auto min-h-8 w-full flex-wrap gap-0.5 py-0.5'
      )}
      data-testid="user-cabinet-main-groups"
      role="tablist"
      aria-label="Разделы профиля"
    >
      {MAIN_GROUP_ORDER.map((g) => {
        const meta = MAIN_GROUP_META[g];
        const Icon = meta.icon;
        const active = activeGroup === g;
        return (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelectGroup(g)}
            className={cn(
              cabinetSurface.groupTabButton,
              'inline-flex min-h-8 max-w-full items-center gap-1.5 px-2.5 py-1.5 sm:px-3',
              active && cabinetSurface.groupTabButtonActive
            )}
          >
            <Icon className={cn('size-3 shrink-0', meta.iconColor)} aria-hidden />
            <span className="max-w-[10rem] text-left text-[9px] leading-tight sm:max-w-[13rem] sm:text-[10px] md:max-w-none">
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
