'use client';

import { Fragment, useMemo, useState } from 'react';
import type { CoveragePhaseId, RoleHubId } from '@/lib/data/role-hub-matrix';
import { getNavSubsectionsForCell } from '@/lib/data/role-hub-matrix-nav-details';
import {
  getEffectiveHubMark,
  ROLE_HUB_CABINET_COLUMNS,
  ROLE_HUB_ROLE_TABLE_NOTES,
  type ClusterMultiThemeEntry,
  type RoleHubRow,
} from '@/lib/data/role-hub-matrix';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MatrixCell } from './matrix-cells';

function rowHasAnyNavDetails(row: RoleHubRow): boolean {
  for (const col of ROLE_HUB_CABINET_COLUMNS) {
    const names = row.clustersByRole[col.id];
    const d = getNavSubsectionsForCell(row.id, col.id, names);
    if (d?.length) return true;
  }
  return false;
}

/** Есть краткая детализация (уровень 2) или полная (уровень 3). */
function rowHasNavBreakdown(row: RoleHubRow): boolean {
  for (const col of ROLE_HUB_CABINET_COLUMNS) {
    const names = row.clustersByRole[col.id];
    const subs = getNavSubsectionsForCell(row.id, col.id, names);
    if (subs?.some((s) => s.detailsBrief?.length || s.details?.length)) return true;
  }
  return false;
}

/** Есть полный перечень для уровня «Информация, метрики и функции». */
function rowHasNavFullInventory(row: RoleHubRow): boolean {
  for (const col of ROLE_HUB_CABINET_COLUMNS) {
    const names = row.clustersByRole[col.id];
    const subs = getNavSubsectionsForCell(row.id, col.id, names);
    if (subs?.some((s) => s.details?.length || s.detailsInventory?.some((group) => group?.length)))
      return true;
  }
  return false;
}

type PhaseGroup = {
  phase: CoveragePhaseId;
  label: string;
  hint: string;
  rows: RoleHubRow[];
};

const ROLE_LABEL: Record<RoleHubId, string> = {
  admin: 'Syntha HQ',
  brand: 'Бренд',
  shop: 'Магазин',
  distributor: 'Дистрибьютор',
  manufacturer: 'Производство',
  supplier: 'Поставщик',
};

export function CoverageThemesBlock({
  groups,
  duplicates,
}: {
  groups: PhaseGroup[];
  duplicates: ClusterMultiThemeEntry[];
}) {
  const [focusRole, setFocusRole] = useState<RoleHubId | 'all'>('all');
  const [showDupOnly, setShowDupOnly] = useState(false);
  /** Уровень 1: названия подразделов в ячейках. */
  const [navOpenByRowId, setNavOpenByRowId] = useState<Record<string, boolean>>({});
  /** Уровень 2: «Детализация подразделов» — открывает доступ к уровню 3 (сама по себе списки не раскрывает). */
  const [navBreakdownByRowId, setNavBreakdownByRowId] = useState<Record<string, boolean>>({});
  /** Уровень 3: полный перечень данных, метрик и функций под каждым подразделом. */
  const [navInventoryByRowId, setNavInventoryByRowId] = useState<Record<string, boolean>>({});

  const rowIdsWithDup = useMemo(() => {
    const s = new Set<string>();
    for (const d of duplicates) {
      for (const t of d.themes) s.add(t.id);
    }
    return s;
  }, [duplicates]);

  const visibleGroups = useMemo(() => {
    if (!showDupOnly) return groups;
    return groups
      .map((g) => ({
        ...g,
        rows: g.rows.filter((r) => rowIdsWithDup.has(r.id)),
      }))
      .filter((g) => g.rows.length > 0);
  }, [groups, showDupOnly, rowIdsWithDup]);

  let globalIdx = 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div>
        <p className="mb-4 max-w-3xl text-sm text-slate-600">
          <strong className="font-semibold text-slate-800">Процесс:</strong> слева в «Тема / раздел»
          —<strong className="font-semibold text-slate-800"> сценарий по цепочке ценности</strong>{' '}
          (как в данных: <code className="rounded bg-slate-100 px-1 text-xs">area</code>); группы
          фаз идут{' '}
          <strong className="font-semibold text-slate-700">
            сверху вниз по операционному потоку
          </strong>{' '}
          (материалы и продукт → производство → логистика → партнёры и маркетинг → аналитика и ИИ →
          коммуникации как сквозной слой). Чипы в ячейках — точки входа в{' '}
          <strong className="font-semibold text-slate-700">навигацию кабинета</strong> (канон:{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">CABINET_SIDEBAR_CLUSTERS_FULL</code>
          ); красные чипы — унифицированные подписи для согласования. Разверните{' '}
          <strong className="font-semibold text-slate-700">подразделы</strong> по строке — шаги
          процесса по роли (
          <code className="rounded bg-slate-100 px-1 text-xs">role-hub-matrix-nav-details</code>
          ). Три шага по порядку (1 → 2 → 3): следующий уровень неактивен, пока не раскрыт
          предыдущий. В теме «org» дополнительные пункты{' '}
          <strong className="text-red-700">красным</strong> — реже актуальны для РФ или ближе к
          западной юр. модели (см. данные в{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">
            ROLE_HUB_ORG_DETAIL_LINES_NOT_TYPICAL_RF_RU
          </code>
          ). При пустых кластерах для роли — «—». Syntha HQ в этой таблице не показывается.
        </p>

        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Фокус на роли
            </span>
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-900"
              value={focusRole}
              onChange={(e) => setFocusRole(e.target.value as RoleHubId | 'all')}
            >
              <option value="all">Все столбцы</option>
              {ROLE_HUB_CABINET_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={showDupOnly}
              onChange={(e) => setShowDupOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>Только темы с пересечением кластеров</span>
          </label>
        </div>

        {focusRole !== 'all' && ROLE_HUB_ROLE_TABLE_NOTES[focusRole]?.length ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
              {ROLE_LABEL[focusRole]} — заметки к колонке
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-xs leading-relaxed text-slate-600">
              {ROLE_HUB_ROLE_TABLE_NOTES[focusRole]!.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="sticky left-0 z-20 min-w-[220px] max-w-[320px] border-r border-slate-200 bg-slate-100 px-3 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-700">
                  Тема / раздел
                </th>
                {ROLE_HUB_CABINET_COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    className={cn(
                      'min-w-[10.5rem] px-2 py-3 align-bottom text-xs font-black uppercase leading-tight text-slate-900 transition-opacity',
                      focusRole !== 'all' && focusRole !== col.id && 'opacity-40'
                    )}
                  >
                    <span className="block">{col.label}</span>
                    <span className="mt-1 block text-[10px] font-normal font-semibold normal-case text-slate-500">
                      {col.hint}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleGroups.map((group) => (
                <Fragment key={group.phase}>
                  <tr className="border-b border-slate-200 bg-indigo-50/90">
                    <td
                      colSpan={1 + ROLE_HUB_CABINET_COLUMNS.length}
                      className="px-3 py-2.5 text-left"
                    >
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900">
                        {group.label}
                      </span>
                      <span className="ml-2 text-xs font-normal text-indigo-800/80">
                        {group.hint}
                      </span>
                    </td>
                  </tr>
                  {group.rows.map((row) => {
                    const idx = globalIdx++;
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          'border-b border-slate-100',
                          idx % 2 === 1 && 'bg-slate-50/60'
                        )}
                      >
                        <td
                          className={cn(
                            'sticky left-0 z-10 max-w-[320px] border-r border-slate-200 px-3 py-3 align-top shadow-[4px_0_12px_-4px_rgba(15,23,42,0.12)]',
                            idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                          )}
                        >
                          <div className="font-semibold leading-snug text-slate-900">
                            {row.area}
                          </div>
                          {rowHasAnyNavDetails(row) ? (
                            <div className="mt-2 flex flex-col gap-1 border-l-2 border-slate-200 pl-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setNavOpenByRowId((prev) => {
                                    const nextOpen = !prev[row.id];
                                    if (!nextOpen) {
                                      setNavBreakdownByRowId((b) => ({ ...b, [row.id]: false }));
                                      setNavInventoryByRowId((i) => ({ ...i, [row.id]: false }));
                                    }
                                    return { ...prev, [row.id]: nextOpen };
                                  })
                                }
                                className="block w-full text-left text-[10px] font-medium text-slate-600 hover:text-slate-900"
                                aria-expanded={Boolean(navOpenByRowId[row.id])}
                              >
                                <span className="mr-1 inline-block w-3 text-slate-500" aria-hidden>
                                  {navOpenByRowId[row.id] ? '▼' : '▶'}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                  1.
                                </span>{' '}
                                Подразделы в навигации
                              </button>
                              {rowHasNavBreakdown(row) ? (
                                <button
                                  type="button"
                                  disabled={!navOpenByRowId[row.id]}
                                  title={
                                    !navOpenByRowId[row.id]
                                      ? 'Сначала раскройте уровень 1'
                                      : undefined
                                  }
                                  onClick={() =>
                                    setNavBreakdownByRowId((prev) => {
                                      const next = !prev[row.id];
                                      if (!next) {
                                        setNavInventoryByRowId((i) => ({ ...i, [row.id]: false }));
                                      }
                                      return { ...prev, [row.id]: next };
                                    })
                                  }
                                  className={cn(
                                    'block w-full pl-3 text-left text-[10px] font-medium',
                                    navOpenByRowId[row.id]
                                      ? 'text-slate-600 hover:text-slate-900'
                                      : 'cursor-not-allowed text-slate-400'
                                  )}
                                  aria-expanded={Boolean(navBreakdownByRowId[row.id])}
                                >
                                  <span className="mr-1 inline-block w-3" aria-hidden>
                                    {!navOpenByRowId[row.id]
                                      ? '▶'
                                      : navBreakdownByRowId[row.id]
                                        ? '▼'
                                        : '▶'}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                    2.
                                  </span>{' '}
                                  Детализация подразделов
                                </button>
                              ) : null}
                              {rowHasNavFullInventory(row) ? (
                                <button
                                  type="button"
                                  disabled={!navOpenByRowId[row.id] || !navBreakdownByRowId[row.id]}
                                  title={
                                    !navOpenByRowId[row.id]
                                      ? 'Сначала раскройте уровень 1'
                                      : !navBreakdownByRowId[row.id]
                                        ? 'Сначала раскройте уровень 2'
                                        : undefined
                                  }
                                  onClick={() =>
                                    setNavInventoryByRowId((prev) => ({
                                      ...prev,
                                      [row.id]: !prev[row.id],
                                    }))
                                  }
                                  className={cn(
                                    'block w-full pl-6 text-left text-[10px] font-medium',
                                    navOpenByRowId[row.id] && navBreakdownByRowId[row.id]
                                      ? 'text-slate-700 hover:text-slate-950'
                                      : 'cursor-not-allowed text-slate-400'
                                  )}
                                  aria-expanded={Boolean(navInventoryByRowId[row.id])}
                                >
                                  <span className="mr-1 inline-block w-3" aria-hidden>
                                    {!navOpenByRowId[row.id] || !navBreakdownByRowId[row.id]
                                      ? '▶'
                                      : navInventoryByRowId[row.id]
                                        ? '▼'
                                        : '▶'}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                    3.
                                  </span>{' '}
                                  Информация, метрики и функции
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                        {ROLE_HUB_CABINET_COLUMNS.map((col) => (
                          <td
                            key={col.id}
                            className={cn(
                              'h-full px-2 py-3 align-top transition-opacity',
                              focusRole !== 'all' && focusRole !== col.id && 'opacity-40'
                            )}
                          >
                            {/* Не задавать display:flex на <td> — ломает table-layout, столбцы могут схлопнуться в одну колонку. */}
                            <div className="flex h-full min-h-0 flex-col">
                              <MatrixCell
                                rowId={row.id}
                                roleId={col.id}
                                mark={getEffectiveHubMark(row, col.id)}
                                clusterNames={row.clustersByRole[col.id]}
                                navSubsections={getNavSubsectionsForCell(
                                  row.id,
                                  col.id,
                                  row.clustersByRole[col.id]
                                )}
                                navDetailsOpen={Boolean(navOpenByRowId[row.id])}
                                navBreakdownOpen={Boolean(
                                  navOpenByRowId[row.id] && navBreakdownByRowId[row.id]
                                )}
                                navInventoryOpen={Boolean(
                                  navOpenByRowId[row.id] &&
                                  navBreakdownByRowId[row.id] &&
                                  navInventoryByRowId[row.id]
                                )}
                                clusterDuplicates={duplicates}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {duplicates.length > 0 ? (
          <div className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 text-sm shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wide text-amber-950">
              Один кластер — несколько тем (для проверки логики)
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-amber-950/85">
              Ниже пары «роль — кластер», которые встречаются более чем в одной строке-теме. Такие
              пересечения допустимы, если сценарии разные; иначе стоит перераспределить кластеры в
              данных матрицы.
            </p>
            <ul className="mt-4 space-y-3">
              {duplicates.map((d) => (
                <li
                  key={`${d.roleId}-${d.cluster}`}
                  className="rounded-lg border border-amber-200/60 bg-white/90 px-3 py-2 text-slate-800"
                >
                  <span className="font-semibold text-slate-900">{ROLE_LABEL[d.roleId]}</span>
                  <span className="text-slate-500"> — </span>
                  <span className="font-medium">{d.cluster}</span>
                  <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
                    {d.themes.map((t) => (
                      <li key={t.id}>
                        <code className="rounded bg-slate-100 px-1">{t.id}</code>
                        {' — '}
                        {t.area}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showDupOnly && visibleGroups.every((g) => g.rows.length === 0) ? (
          <p className="mt-4 text-sm text-slate-500">
            Нет тем с пересечением кластеров по текущим данным.
          </p>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
