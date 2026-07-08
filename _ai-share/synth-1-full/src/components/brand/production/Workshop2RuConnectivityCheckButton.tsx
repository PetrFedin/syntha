'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlugZap } from 'lucide-react';
import {
  buildWorkshop2SetupConnectivityRows,
  type Workshop2SetupConnectivityRow,
} from '@/lib/production/workshop2-setup-connectivity-summary';

const ROW_CLASS: Record<Workshop2SetupConnectivityRow['status'], string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  fail: 'border-rose-200 bg-rose-50 text-rose-900',
  warn: 'border-amber-200 bg-amber-50 text-amber-950',
};

/** Wave 17: setup «Проверить связность» — probes + investor-readiness + SS27 UAT (reuse existing APIs). */
export function Workshop2RuConnectivityCheckButton() {
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Workshop2SetupConnectivityRow[] | null>(null);
  const [summaryRu, setSummaryRu] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setBusy(true);
    try {
      const [probesRes, readinessRes, uatRes] = await Promise.all([
        fetch('/api/workshop2/integration-probes', { cache: 'no-store' }),
        fetch('/api/workshop2/investor-readiness', { cache: 'no-store' }),
        fetch('/api/workshop2/uat/ss27-checklist', { cache: 'no-store' }),
      ]);

      const probes = probesRes.ok ? ((await probesRes.json()) as Record<string, unknown>) : null;
      const readiness = readinessRes.ok
        ? ((await readinessRes.json()) as Record<string, unknown>)
        : null;
      const uat = uatRes.ok ? ((await uatRes.json()) as Record<string, unknown>) : null;

      const built = await buildWorkshop2SetupConnectivityRows({ probes, readiness, uat });
      setRows(built.rows);
      setSummaryRu(built.summaryRu);
    } catch {
      setRows([
        {
          id: 'fetch_failed',
          labelRu: 'Сеть / dev-сервер',
          status: 'fail',
          detailRu: 'Не удалось вызвать probes, investor-readiness или ss27-checklist.',
        },
      ]);
      setSummaryRu('Проверка связности не выполнена — запустите npm run dev.');
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="space-y-3" data-testid="workshop2-setup-connectivity-check">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-[11px]"
          disabled={busy}
          onClick={() => void runCheck()}
          data-testid="workshop2-setup-connectivity-run"
        >
          {busy ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <PlugZap className="mr-1 h-3.5 w-3.5" aria-hidden />
          )}
          Проверить связность
        </Button>
        {summaryRu ? (
          <span className="text-[11px] text-slate-600">{summaryRu}</span>
        ) : (
          <span className="text-[11px] text-slate-500">
            integration-probes · investor-readiness · ss27-checklist
          </span>
        )}
      </div>
      {rows ? (
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] ${ROW_CLASS[row.status]}`}
              data-testid={`workshop2-setup-connectivity-${row.id}`}
            >
              <span className="font-semibold">
                {row.status === 'ok' ? '✓' : row.status === 'warn' ? '!' : '✗'}
              </span>{' '}
              {row.labelRu}
              {row.detailRu ? <span className="opacity-90"> — {row.detailRu}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
