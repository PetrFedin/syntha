'use client';

import { Progress } from '@/components/ui/progress';

type Props = {
  confirmed: number;
  total: number;
  busy?: boolean;
};

/** Прогресс bulk-confirm материалов (Wave TX). */
export function SupplierBulkConfirmProgressStrip({ confirmed, total, busy = false }: Props) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((confirmed / safeTotal) * 100));

  return (
    <div
      className="space-y-1.5 rounded-md border border-sky-200/80 bg-sky-50/40 px-2 py-2"
      data-testid="sup-op-bulk-confirm-progress-strip"
    >
      <p className="text-[10px] font-semibold text-sky-950">
        {busy ? 'Подтверждение строк BOM…' : 'Bulk-confirm · прогресс'}
      </p>
      <Progress value={pct} className="h-1.5" data-testid="sup-op-bulk-confirm-progress-bar" />
      <p className="text-[10px] text-sky-900" data-testid="sup-op-bulk-confirm-progress-label">
        {confirmed} / {total} строк · {pct}%
      </p>
    </div>
  );
}
