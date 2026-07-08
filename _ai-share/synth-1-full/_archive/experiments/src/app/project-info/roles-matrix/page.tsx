import Link from 'next/link';
import { ArrowLeft, TableProperties } from 'lucide-react';
import { CABINET_SIDEBAR_NAMING_PROPOSALS } from '@/lib/data/cabinet-sidebar-naming-proposals';
import {
  CABINET_SIDEBAR_CLUSTERS_FULL,
  findClustersUsedInMultipleThemes,
  groupCabinetRowsByCoveragePhase,
  ROLE_HUB_CABINET_COLUMNS,
  ROLE_HUB_MATRIX_CABINET_ROWS,
  ROLE_HUB_OVERLAPS,
} from '@/lib/data/role-hub-matrix';
import { cn } from '@/lib/utils';
import { CoverageThemesBlock } from './coverage-themes-block';
import { MatrixMarkLegend } from './matrix-mark-legend';

const coverageGroups = groupCabinetRowsByCoveragePhase(ROLE_HUB_MATRIX_CABINET_ROWS);
const clusterDuplicates = findClustersUsedInMultipleThemes(ROLE_HUB_MATRIX_CABINET_ROWS);

export const metadata = {
  title: 'Матрица ролей — Syntha',
  description: 'Сравнение кластеров навигации кабинетов по ролям',
};

function ClusterChips({ names }: { names: readonly string[] }) {
  if (!names.length) {
    return <span className="text-xs text-slate-400">—</span>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {names.map((n) => (
        <li
          key={n}
          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-left text-[11px] leading-snug text-slate-800"
        >
          {n}
        </li>
      ))}
    </ul>
  );
}

const SIDEBAR_ROW_COUNT = Math.max(
  ...ROLE_HUB_CABINET_COLUMNS.map((c) => CABINET_SIDEBAR_CLUSTERS_FULL[c.id].length)
);

export default function RolesMatrixPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-16 pt-8">
      <div className="container mx-auto max-w-[100rem] px-4">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Link
            href="/project-info"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />О проекте
          </Link>
        </div>

        <div className="mb-8 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
            <TableProperties className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 md:text-2xl">
              Матрица кабинетов по ролям
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              <strong className="font-semibold text-slate-800">Столбцы</strong> — профили кабинетов
              участников (бренд, магазин, дистрибьютор, производство, поставщик); профиль платформы
              Syntha HQ здесь не выводится.{' '}
              <strong className="font-semibold text-slate-800">Строки</strong> — разделы сайдбара
              (справочник) или темы покрытия (матрица ниже). В ячейке: значок ● / ◑ / — и
              привязанные к теме кластеры меню. Если к теме не привязан ни один кластер для роли, в
              ячейке только «—» без ●/◑.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
          <p className="font-bold text-slate-900">Значки в ячейках</p>
          <MatrixMarkLegend />
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            B2C (<code className="rounded bg-slate-100 px-1.5 py-0.5">/client</code>) и кабинет
            платформы Syntha HQ не включены.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="mb-3 text-base font-black uppercase tracking-wider text-slate-900">
            Разделы сайдбара: строки × профили в столбцах
          </h2>
          <p className="mb-4 max-w-3xl text-sm text-slate-600">
            Каждая строка — порядковый пункт верхнего уровня в боковом меню; в столбце профиля —
            название кластера на этой позиции (если пунктов меньше — ячейка пустая).
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="sticky left-0 z-20 w-12 min-w-[3rem] border-r border-slate-200 bg-slate-100 px-2 py-3 text-center text-xs font-bold text-slate-500">
                    №
                  </th>
                  {ROLE_HUB_CABINET_COLUMNS.map((col) => (
                    <th
                      key={col.id}
                      className="min-w-[11rem] px-3 py-3 align-bottom text-xs font-black uppercase leading-tight text-slate-900"
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
                {Array.from({ length: SIDEBAR_ROW_COUNT }).map((_, i) => (
                  <tr
                    key={i}
                    className={cn('border-b border-slate-100', i % 2 === 1 && 'bg-slate-50/60')}
                  >
                    <td
                      className={cn(
                        'sticky left-0 z-10 border-r border-slate-200 px-2 py-2.5 text-center text-xs tabular-nums text-slate-500',
                        i % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                      )}
                    >
                      {i + 1}
                    </td>
                    {ROLE_HUB_CABINET_COLUMNS.map((col) => {
                      const list = CABINET_SIDEBAR_CLUSTERS_FULL[col.id];
                      const label = list[i];
                      return (
                        <td key={col.id} className="px-3 py-2.5 align-top text-slate-800">
                          {label ? (
                            <span className="leading-snug">{label}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-base font-black uppercase tracking-wider text-slate-900">
            Темы покрытия: строки × профили в столбцах
          </h2>
          <CoverageThemesBlock groups={coverageGroups} duplicates={clusterDuplicates} />
        </section>

        <section className="mb-12 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-sm md:p-8">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-950">
            Предложения по унификации названий кластеров
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-950/80">
            Черновик для согласования: что привести к одной логике в сайдбарах (не влияет на
            навигацию до рефакторинга).
          </p>
          <div className="mt-6 space-y-5">
            {CABINET_SIDEBAR_NAMING_PROPOSALS.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border border-amber-200/60 bg-white/90 p-4 text-sm shadow-sm md:p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800/70">
                  {p.id}
                </p>
                <p className="mt-2 font-semibold text-slate-900">{p.problem}</p>
                <p className="mt-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Сейчас: </span>
                  {p.current}
                </p>
                <p className="mt-2 text-slate-800">
                  <span className="font-semibold text-emerald-800">Предложение: </span>
                  {p.proposal.replace(/\*\*(.+?)\*\*/g, '$1')}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{p.rationale}</p>
                <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">В коде: </span>
                  {p.migrationHint}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-violet-200 bg-violet-50/80 p-6 shadow-sm md:p-8">
          <h2 className="text-base font-black uppercase tracking-wider text-violet-900">
            Пересечения между ролями
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-violet-950/90">
            {ROLE_HUB_OVERLAPS.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
