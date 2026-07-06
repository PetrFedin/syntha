import { cn } from '@/lib/utils';

/** Hub header: компактные вкладки (~25% меньше базового h-9). */
export const PLATFORM_CORE_HEADER_CONTROL_BTN =
  'inline-flex h-7 sm:h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-2 text-[10px] font-semibold leading-none transition-all';

export function platformCoreHeaderControlBtnClass(active: boolean): string {
  return cn(
    PLATFORM_CORE_HEADER_CONTROL_BTN,
    'min-w-[2.5rem]',
    active ? 'btn-tab-active' : 'btn-tab-inactive-light'
  );
}

/** Hub-вкладки «Продукт» / «Аудит». */
export const PLATFORM_CORE_HEADER_HUB_TAB_BTN = cn(
  PLATFORM_CORE_HEADER_CONTROL_BTN,
  'min-w-[3.25rem] sm:min-w-[3.5rem]'
);

export function platformCoreHeaderHubTabClass(active: boolean): string {
  return cn(PLATFORM_CORE_HEADER_HUB_TAB_BTN, active ? 'btn-tab-active' : 'btn-tab-inactive-light');
}

/** Иконка mobile hub-menu — компактная, в тон вкладкам. */
export const PLATFORM_CORE_HEADER_ICON_BTN =
  'relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md';

/** Горизонтальный свайп на iPhone — без переноса строк. */
export const PLATFORM_CORE_HORIZONTAL_SCROLL =
  'flex flex-nowrap items-center gap-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
