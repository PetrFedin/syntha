'use client';

import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  toggleHubView,
  type PlatformCoreHubViewId,
  type PlatformCoreHubViews,
} from '@/lib/platform-core-hub-view';
import {
  PLATFORM_CORE_HEADER_ICON_BTN,
  platformCoreHeaderHubTabClass,
} from '@/lib/platform-core-header-controls';

type Props = {
  value: PlatformCoreHubViews;
  onChange: (views: PlatformCoreHubViews) => void;
};

const TOGGLE_VIEWS: { id: PlatformCoreHubViewId; label: string; testId: string }[] = [
  { id: 'business', label: 'Продукт', testId: 'platform-core-hub-view-business' },
  { id: 'audit', label: 'Аудит', testId: 'platform-core-hub-view-audit' },
];

function activeHubViewCount(views: PlatformCoreHubViews): number {
  const n = TOGGLE_VIEWS.filter((b) => views[b.id]).length;
  return n > 0 ? n : 1;
}

function hubMenuAriaLabel(views: PlatformCoreHubViews): string {
  const active = TOGGLE_VIEWS.filter((b) => views[b.id]).map((b) => b.label);
  if (active.length === 0) return 'Продукт';
  return active.join(', ');
}

function HubViewButton({
  id,
  label,
  testId,
  active,
  onToggle,
}: {
  id: PlatformCoreHubViewId;
  label: string;
  testId: string;
  active: boolean;
  onToggle: (id: PlatformCoreHubViewId) => void;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      onClick={() => onToggle(id)}
      className={cn(platformCoreHeaderHubTabClass(active), 'shrink-0')}
    >
      {label}
    </button>
  );
}

/** iPhone: иконка + счётчик. iPad / Mac: Продукт · Аудит (без «План»). */
export function PlatformCoreHubViewToggle({ value, onChange }: Props) {
  const toggle = (id: PlatformCoreHubViewId) => onChange(toggleHubView(value, id));
  const selectedCount = activeHubViewCount(value);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="platform-core-hub-view-menu"
          title={`Разделы: ${hubMenuAriaLabel(value)}`}
          className={cn(
            PLATFORM_CORE_HEADER_ICON_BTN,
            'btn-tab-active sm:hidden border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20'
          )}
          aria-label={`${hubMenuAriaLabel(value)} · открыть список`}
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span
            data-testid="platform-core-hub-view-count"
            className="bg-accent-primary absolute -right-0.5 -top-0.5 flex h-3 min-w-[0.75rem] items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none text-white"
            aria-hidden
          >
            {selectedCount}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[10rem] p-1">
          {TOGGLE_VIEWS.map(({ id, label, testId }) => (
            <DropdownMenuCheckboxItem
              key={id}
              data-testid={testId}
              checked={value[id]}
              onCheckedChange={() => toggle(id)}
              className="cursor-pointer text-[11px] font-semibold"
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        data-testid="platform-core-hub-view-toggle"
        className="hidden shrink-0 flex-nowrap items-center gap-1 sm:flex"
        role="group"
        aria-label="Показать на странице: Продукт, Аудит"
      >
        {TOGGLE_VIEWS.map(({ id, label, testId }) => (
          <HubViewButton
            key={id}
            id={id}
            label={label}
            testId={testId}
            active={value[id]}
            onToggle={toggle}
          />
        ))}
      </div>
    </>
  );
}
