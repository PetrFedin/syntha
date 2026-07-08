'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  failedCount: number;
  totalCount: number;
  active: boolean;
};

/** Wave VD: фильтр очереди — только PO с ошибкой ERP / journal-only. */
export function MfrOpHandoffFailedPoFilterStrip({ failedCount, totalCount, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (on: boolean) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (on) sp.set('failedPo', '1');
      else sp.delete('failedPo');
      router.replace(`${pathname}?${sp.toString()}#handoff-queue`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  if (totalCount === 0) return null;

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-2"
      data-testid="mfr-op-handoff-failed-po-filter"
    >
      <span className={hubGadget.muted}>Показать:</span>
      <Button
        type="button"
        size="sm"
        variant={active ? 'default' : 'outline'}
        className={cn('h-6 px-2 text-[9px]', active && 'font-semibold')}
        onClick={() => setFilter(!active)}
        data-testid="mfr-op-handoff-failed-po-filter-toggle"
      >
        {active ? 'Только ошибки ERP' : 'Все серии'}
      </Button>
      <span
        className="text-text-muted text-[9px]"
        data-testid="mfr-op-handoff-failed-po-filter-count"
      >
        {active
          ? `${failedCount} из ${totalCount} · фильтр ERP`
          : `${totalCount} серий · ошибок ERP: ${failedCount}`}
      </span>
    </div>
  );
}
