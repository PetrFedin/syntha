'use client';

import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTableClusterDisplay } from '@/lib/data/role-hub-matrix-table-unification';
import type { RoleHubId } from '@/lib/data/role-hub-matrix';
import {
  getClusterSharingHintForPartialMark,
  type ClusterMultiThemeEntry,
} from '@/lib/data/role-hub-matrix';
import {
  isNavInventoryLineLowRfRu,
  navInventoryLineIsCore,
  navInventoryLineText,
  type NavSubsectionItem,
} from '@/lib/data/role-hub-matrix-nav-details';
import { cn } from '@/lib/utils';

const TITLE_RF_RU_LOW =
  'Для типичного РФ часто не обязательно: можно не тратить ресурсы и не перегружать команду и продукт — уточнить под стратегию и юрисдикцию';

export function markClass(m: string) {
  if (m === '●') return 'text-emerald-600';
  if (m === '◑') return 'text-amber-600';
  return 'text-slate-400';
}

/** Кластеры в таблице тем: унифицированные подписи красным (только отображение). */
export function MatrixClusterChips({
  rowId,
  roleId,
  names,
  /** В строке «analytics» у бренда, магазина и дистрибьютора — чипы в одну линию. */
  singleRow = false,
  /** Вертикальная укладка чипов (редко). */
  stackVertical = false,
}: {
  rowId: string;
  roleId: RoleHubId;
  names: readonly string[];
  singleRow?: boolean;
  stackVertical?: boolean;
}) {
  if (!names.length) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const items = getTableClusterDisplay(rowId, roleId, names);
  return (
    <ul
      className={cn(
        'flex gap-1',
        stackVertical && 'flex-col',
        singleRow ? 'flex-nowrap overflow-x-auto' : !stackVertical && 'flex-wrap content-start'
      )}
    >
      {items.map((item, i) => (
        <li
          key={`${item.label}-${i}`}
          className={cn(
            'rounded border px-1.5 py-0.5 text-left text-[11px] leading-snug',
            item.isUnified
              ? 'border-red-300 bg-red-50 font-medium text-red-900'
              : 'border-slate-200 bg-slate-50 text-slate-800'
          )}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function MatrixCell({
  rowId,
  roleId,
  mark,
  clusterNames,
  navSubsections,
  clusterDuplicates,
  /** Уровень 1: названия подразделов («Подразделы в навигации»). */
  navDetailsOpen = false,
  /** Уровень 2: краткая детализация по каждому подразделу («Детализация подразделов»). */
  navBreakdownOpen = false,
  /** Уровень 3: полные списки («Информация, метрики и функции»). */
  navInventoryOpen = false,
}: {
  rowId: string;
  roleId: RoleHubId;
  mark: string;
  clusterNames: readonly string[];
  /** Подразделы внутри кластера (см. role-hub-matrix-nav-details). */
  navSubsections?: readonly NavSubsectionItem[];
  /** Пересечения кластеров по темам — для подсказки у значка ◑. */
  clusterDuplicates?: readonly ClusterMultiThemeEntry[];
  navDetailsOpen?: boolean;
  navBreakdownOpen?: boolean;
  navInventoryOpen?: boolean;
}) {
  const showNavList = Boolean(navSubsections?.length && navDetailsOpen);

  const partialHint = useMemo(() => {
    if (mark !== '◑') return null;
    return getClusterSharingHintForPartialMark(
      rowId,
      roleId,
      clusterNames,
      clusterDuplicates ?? []
    );
  }, [mark, rowId, roleId, clusterNames, clusterDuplicates]);

  const body = (
    <div className="flex h-full min-h-0 w-full flex-1 items-stretch gap-2">
      <div className="flex w-6 shrink-0 flex-col items-center pt-0.5">
        <span
          className={cn('text-center text-lg font-bold leading-none sm:text-xl', markClass(mark))}
          title={mark === '◑' ? undefined : 'Покрытие в навигации'}
        >
          {mark}
        </span>
      </div>
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col gap-2',
          showNavList && 'justify-between'
        )}
      >
        <div className="min-w-0 shrink-0">
          <MatrixClusterChips
            rowId={rowId}
            roleId={roleId}
            names={clusterNames}
            singleRow={
              rowId === 'analytics' &&
              (roleId === 'brand' || roleId === 'shop' || roleId === 'distributor')
            }
          />
        </div>
        {showNavList ? (
          <ul className="flex w-full min-w-0 shrink-0 flex-col gap-1.5 text-left text-[10px] leading-snug text-slate-600">
            {navSubsections!.map((item) => (
              <li key={item.label} className="list-none">
                <span className="font-medium text-slate-700">{item.label}</span>
                {navBreakdownOpen && !navInventoryOpen && item.detailsBrief?.length ? (
                  <ul className="mt-0.5 list-inside list-disc pl-0.5 text-[9px] text-slate-600">
                    {item.detailsBrief.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {navBreakdownOpen &&
                !navInventoryOpen &&
                !item.detailsBrief?.length &&
                (item.details?.length || item.detailsInventory?.some((g) => g?.length)) ? (
                  <p className="mt-0.5 pl-0.5 text-[9px] italic text-slate-400">
                    Полный перечень — на шаге «Информация, метрики и функции»
                  </p>
                ) : null}
                {navInventoryOpen && item.detailsBrief?.length && item.detailsInventory?.length ? (
                  <div className="mt-0.5 flex flex-col gap-1.5 pl-0.5">
                    {item.detailsBrief.map((brief, bi) => {
                      const inv = item.detailsInventory![bi];
                      if (!inv?.length) return null;
                      return (
                        <div key={`${item.label}-${brief}`} className="min-w-0">
                          <div className="text-[9px] font-medium text-slate-600">{brief}</div>
                          <ul className="mt-0.5 list-inside list-disc text-[9px] text-slate-500">
                            {inv.map((d, di) => {
                              const text = navInventoryLineText(d);
                              const core = navInventoryLineIsCore(d);
                              const lowRf = isNavInventoryLineLowRfRu(rowId, d);
                              return (
                                <li
                                  key={`${brief}-${di}`}
                                  className={cn(
                                    core && !lowRf && 'font-medium text-blue-700',
                                    lowRf && 'font-medium text-red-600'
                                  )}
                                  title={
                                    lowRf
                                      ? TITLE_RF_RU_LOW
                                      : core
                                        ? 'Сильная продуктовая фича (ядро подпункта)'
                                        : undefined
                                  }
                                >
                                  {text}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {navInventoryOpen &&
                (!item.detailsBrief?.length || !item.detailsInventory?.length) &&
                item.details?.length ? (
                  <ul className="mt-0.5 list-inside list-disc pl-0.5 text-[9px] text-slate-500">
                    {item.details.map((d) => {
                      const lowRf = isNavInventoryLineLowRfRu(rowId, d);
                      return (
                        <li
                          key={d}
                          className={cn(lowRf && 'font-medium text-red-600')}
                          title={lowRf ? TITLE_RF_RU_LOW : undefined}
                        >
                          {d}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );

  if (mark === '◑' && partialHint) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-full min-h-0 w-full min-w-0 cursor-help rounded-sm outline-none">
            {body}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="max-w-md whitespace-pre-line text-sm leading-snug"
        >
          {partialHint}
        </TooltipContent>
      </Tooltip>
    );
  }

  return body;
}
