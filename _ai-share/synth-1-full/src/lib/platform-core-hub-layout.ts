import { cn } from '@/lib/utils';

/** Общие токены hub: быстрый вход ↔ матрица готовности (один DOM, responsive). */
export const platformCoreHubLayout = {
  sectionLabel: 'text-text-muted text-[11px] font-semibold uppercase tracking-wide',
  sectionStack: 'space-y-2 md:space-y-3',
  /** Строка карточки роли / столпа в быстром входе. */
  quickCardRow: 'min-h-[2.5rem] md:min-h-[2.75rem]',
  /** Заголовок столбца матрицы ≈ подпись «Выберите роль». */
  matrixHeadRow: 'h-[2.35rem] min-h-[2.35rem] align-middle py-0.5',
  /** Строка роли в матрице — score + «разделы» в одну линию. */
  matrixBodyRow: 'h-[2.5rem] min-h-[2.5rem] align-middle',
  matrixFootRow: 'h-[2.5rem] min-h-[2.5rem] align-middle',
  /** Lead под «Оценка готовности» — та же вертикаль, что helper + 1 ряд карточек. */
  readinessModeLead: 'min-h-[2.5rem] text-xs leading-relaxed md:min-h-[2.75rem]',
  /**
   * Базовый отступ после hero (только business / узкий экран).
   */
  quickEntryAfterBanner: 'mt-5 md:mt-6',
  /**
   * С audit-колонкой: отступ = прелюдия матрицы до строк Цех/Поставщик.
   */
  quickEntryAfterBannerWithAudit:
    'md:mt-[calc(0.875rem+0.5rem+2.75rem+0.5rem+0.75rem+2.35rem+5rem+0.5rem)]',
  /** Планировщик: горизонтальный скролл табов/фильтров на iPhone. */
  plannerToolbarRow:
    'flex flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] max-md:snap-x max-md:snap-mandatory max-md:scroll-px-1 [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible',
  /** Кнопки задачи планировщика — touch target. */
  plannerTaskActionBtn:
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 py-1.5 text-[11px] font-semibold',
} as const;

export function hubSectionLabelClassName(className?: string): string {
  return cn(platformCoreHubLayout.sectionLabel, className);
}
