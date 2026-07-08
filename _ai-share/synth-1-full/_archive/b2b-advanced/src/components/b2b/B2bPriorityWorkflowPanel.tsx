'use client';

/**
 * Панель приоритетных рабочих направлений в духе JOOR / NuOrder: плотные секции,
 * чёткая иерархия, спокойные поверхности — без «стартап-украшательств».
 * См. `src/design/JOOR_ORACLE_ENTERPRISE_UI.md`, `operational-layout-contract`.
 */
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import type {
  PriorityWorkflowGroup,
  PriorityWorkflowVariant,
} from '@/lib/data/b2b-priority-workflow-groups';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

const VARIANT_ACCENT: Record<PriorityWorkflowVariant, string> = {
  production: 'border-l-slate-600',
  commerce: 'border-l-blue-600',
  execution: 'border-l-slate-400',
  overlay: 'border-l-amber-600/90',
  cross: 'border-l-violet-600',
  rf: 'border-l-emerald-700',
  differentiator: 'border-l-indigo-600',
};

export type B2bPriorityWorkflowPanelProps = {
  groups: PriorityWorkflowGroup[];
  /** Заголовок панели */
  title?: string;
  lead?: string;
  className?: string;
};

export function B2bPriorityWorkflowPanel({
  groups,
  title = 'Рабочие направления',
  lead = 'Компактная навигация по ядрам: ТЗ → отшив, оптовый контур, исполнение; чаты и календарь — надстройка.',
  className,
}: B2bPriorityWorkflowPanelProps) {
  if (isPlatformCoreMode()) return null;
  const visible = groups.filter((g) => g.links.length > 0);
  if (!visible.length) return null;

  return (
    <section
      className={cn(o.panel, 'overflow-hidden shadow-none', className)}
      data-testid="b2b-priority-workflow-panel"
    >
      <header className="border-border-default/80 bg-bg-surface2/50 border-b px-4 py-3">
        <h2 className="text-text-primary text-[11px] font-black uppercase tracking-[0.22em]">
          {title}
        </h2>
        {lead ? <p className="text-text-muted mt-1.5 text-xs leading-snug">{lead}</p> : null}
      </header>

      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((group) => (
          <div
            key={group.id}
            className={cn(
              'border-border-default/90 flex min-h-0 flex-col rounded-lg border bg-white',
              'border-l-[3px] py-2.5 pl-3 pr-2.5',
              VARIANT_ACCENT[group.variant]
            )}
          >
            <div className="mb-2 min-w-0">
              <h3 className="text-text-primary text-[10px] font-black uppercase tracking-[0.18em]">
                {group.title}
              </h3>
              {group.subtitle ? (
                <p className="text-text-muted mt-0.5 text-[10px] leading-tight">{group.subtitle}</p>
              ) : null}
            </div>
            <ul className="flex min-w-0 flex-col gap-1">
              {group.links.map((link, i) => (
                <li key={`${group.id}-${String(link.href)}-${i}`}>
                  <Link
                    href={link.href}
                    className="text-text-primary hover:bg-bg-surface2/90 hover:text-accent-primary group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold leading-tight transition-colors"
                  >
                    <span className="min-w-0 flex-1 truncate">{link.label}</span>
                    <ArrowUpRight
                      className="text-text-muted group-hover:text-accent-primary size-3 shrink-0 opacity-70"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
