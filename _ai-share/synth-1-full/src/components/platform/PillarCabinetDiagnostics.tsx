'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { WAVE_ZE_DIAGNOSTICS_AUDIT_HINT_RU } from '@/lib/platform-core-ports/platform/wave-ze-hub-diagnostics-ru';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * L3 diagnostics — collapsed для operator; md+ open только при hub «Аудит».
 * Без аудита insight-cards не разворачиваются above the fold на iPad/MacBook.
 */
export function PillarCabinetDiagnostics({ children, className }: Props) {
  const auditUi = usePlatformCoreAuditUi();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setOpen(auditUi && mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [auditUi]);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      data-testid="pillar-cabinet-diagnostics"
      data-audit-expanded={auditUi ? '1' : '0'}
      className={cn(
        'border-border-subtle/70 bg-bg-surface/50 group rounded-xl border border-dashed',
        className
      )}
    >
      <summary
        className={cn(
          'text-text-primary flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[13px] font-medium',
          '[&::-webkit-details-marker]:hidden',
          auditUi ? 'md:hidden' : ''
        )}
      >
        <span>
          {auditUi ? 'Диагностика столпа' : 'Статус столпа'}
          <span className="text-text-muted ml-1 text-[11px] font-normal">
            · {auditUi ? WAVE_ZE_DIAGNOSTICS_AUDIT_HINT_RU : 'шаги цепочки'}
          </span>
        </span>
        <ChevronRight
          className="text-text-muted h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
          aria-hidden
        />
      </summary>
      <div className={cn('px-2 pb-2 pt-0', auditUi && 'md:p-0')}>{children}</div>
    </details>
  );
}
