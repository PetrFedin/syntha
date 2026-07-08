'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePlatformCoreChainOverview } from '@/components/platform/usePlatformCoreChainOverview';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { isPlatformCoreEmptyChainCollection } from '@/lib/platform-core-hub-matrix';
import {
  formatReadinessScore,
  getPlatformCoreReadinessMatrix,
  summarizePlatformCoreReadiness,
} from '@/lib/platform-core-readiness-audit';

type Props = {
  collectionId: string;
};

type HealthPayload = {
  pgReachable?: boolean;
  pgConfigured?: boolean;
};

/** E2E ширина: 46 тестов core-02, без полного prod-контура. */
const E2E_COVERAGE_SCORE = 7.2;

/** Prod вне scope Platform Core demo. */
const PROD_READINESS_SCORE = 4.5;

/** Связность PG: ручная оценка интеграции сквозь роли (не avg ячеек). */
function pgIntegrationScore(liveChain: boolean): number {
  return liveChain ? 7.4 : 6;
}

function buildScorecardRows(
  staticAll: number,
  liveAll: number,
  staticActive: number,
  liveActive: number,
  liveChain: boolean
) {
  return [
    {
      label: 'Матрица 5×4 (все ячейки)',
      staticScore: staticAll,
      liveScore: liveAll,
      note: 'Включая empty-bridge; ручной аудит, не телеметрия',
    },
    {
      label: 'Активные workspace',
      staticScore: staticActive,
      liveScore: liveActive,
      note: 'Только столпы с полноценным экраном роли',
    },
    {
      label: 'Связность данных (PG)',
      staticScore: 6,
      liveScore: pgIntegrationScore(liveChain),
      note: 'Списки B2B из API; бренд W2 и границы localStorage — слабее',
    },
    {
      label: 'E2E покрытие core',
      staticScore: E2E_COVERAGE_SCORE,
      liveScore: E2E_COVERAGE_SCORE,
      note: '46 тестов hub/cabinets/golden; не полный prod',
    },
    {
      label: 'Готовность к prod',
      staticScore: PROD_READINESS_SCORE,
      liveScore: PROD_READINESS_SCORE,
      note: 'Вне scope core demo',
    },
  ];
}

/** Оценка 5×4 из матрицы ячеек — без «красивых» захардкоженных итогов. */
export function PlatformCoreReadinessScorecard({ collectionId }: Props) {
  const { overviewStatus } = usePlatformCoreChainOverview(collectionId);
  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);
  const [pgReachable, setPgReachable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/workshop2/platform-core/health', {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        });
        const json = (await res.json()) as HealthPayload;
        if (!cancelled) setPgReachable(json.pgReachable === true);
      } catch {
        if (!cancelled) setPgReachable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveChain = !emptyChain && pgReachable === true && overviewStatus === 'ready';

  const staticSummary = useMemo(() => {
    const cells = getPlatformCoreReadinessMatrix(collectionId, { liveChain: false });
    return summarizePlatformCoreReadiness(cells, 'static');
  }, [collectionId]);

  const liveSummary = useMemo(() => {
    const cells = getPlatformCoreReadinessMatrix(collectionId, { liveChain: true });
    return summarizePlatformCoreReadiness(cells, 'live');
  }, [collectionId]);

  const rows = buildScorecardRows(
    staticSummary.allCellsAvg,
    liveSummary.allCellsAvg,
    staticSummary.activeCellsAvg,
    liveSummary.activeCellsAvg,
    liveChain
  );

  const overallStatic = staticSummary.allCellsAvg;
  const overallLive = liveSummary.allCellsAvg;

  return (
    <section
      data-testid="platform-core-readiness-scorecard"
      className="border-border-subtle rounded-xl border bg-white p-4"
    >
      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
        Оценка готовности · 5 столпов × 4 роли
      </p>
      <p className="text-text-secondary mt-1 text-xs leading-relaxed">
        {liveChain
          ? `Живая PG-цепочка · ${collectionId} — средняя по всем ячейкам ${formatReadinessScore(overallLive)}/10 (ручной аудит).`
          : emptyChain
            ? 'Пустая коллекция — контраст без данных. Переключитесь на основную коллекцию для оценки с базой данных.'
            : `Статический hub — ${formatReadinessScore(overallStatic)}/10 по всем ячейкам (ручной аудит).`}
      </p>
      <table className="mt-3 w-full text-left text-[11px]">
        <thead>
          <tr className="text-text-muted border-border-subtle border-b">
            <th className="py-1 pr-2 font-semibold">Критерий</th>
            <th className="w-12 py-1 text-center font-semibold">Стат.</th>
            <th className="w-12 py-1 text-center font-semibold">PG</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-border-subtle/60 border-b last:border-0">
              <td className="text-text-primary py-1.5 pr-2">
                <span className="font-medium">{row.label}</span>
                <span className="text-text-muted block text-[10px]">{row.note}</span>
              </td>
              <td className="text-text-muted py-1.5 text-center font-mono">
                {formatReadinessScore(row.staticScore)}
              </td>
              <td
                className={
                  liveChain
                    ? 'py-1.5 text-center font-mono font-semibold text-emerald-700'
                    : 'text-text-muted py-1.5 text-center font-mono'
                }
              >
                {formatReadinessScore(row.liveScore)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="text-text-primary pt-2 font-bold">Итого (все ячейки)</td>
            <td className="text-text-muted pt-2 text-center font-mono font-bold">
              {formatReadinessScore(overallStatic)}
            </td>
            <td
              className={
                liveChain
                  ? 'pt-2 text-center font-mono font-bold text-emerald-700'
                  : 'text-text-muted pt-2 text-center font-mono font-bold'
              }
            >
              {formatReadinessScore(overallLive)}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
