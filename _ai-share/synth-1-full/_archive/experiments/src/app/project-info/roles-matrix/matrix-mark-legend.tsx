'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PARTIAL_CLUSTER_HINT =
  'Сценарии темы развёрнуты внутри кластера сайдбара (часто общего с другими темами), а не как отдельный верхний пункт меню под эту строку. Значок относится к конкретной ячейке, не ко всему столбцу роли.';

export function MatrixMarkLegend() {
  return (
    <TooltipProvider delayDuration={200}>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        <li className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg font-bold text-emerald-600">
            ●
          </span>
          <span>Отдельный кластер в сайдбаре</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg font-bold text-amber-600">
            ◑
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="min-w-0 max-w-none cursor-help rounded-sm text-left text-inherit underline decoration-slate-400 decoration-dotted underline-offset-[3px] transition-colors hover:text-slate-900 hover:decoration-slate-600"
              >
                Сценарии внутри кластера сайдбара
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-md text-sm leading-snug">
              {PARTIAL_CLUSTER_HINT}
            </TooltipContent>
          </Tooltip>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-400">
            —
          </span>
          <span>Нет в типовой навигации или нет привязки кластеров к теме для этой роли</span>
        </li>
      </ul>
    </TooltipProvider>
  );
}
