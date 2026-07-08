'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EntityLink } from '@/lib/platform-core-ports/legacy/data/entity-links';
import { finalizeRelatedModuleLinks } from '@/lib/platform-core-ports/legacy/data/entity-links';

export type PillarCapabilityCrossLinksStripProps = {
  title?: string;
  links: EntityLink[];
  className?: string;
  /** Компактные чипы вместо сетки карточек. */
  variant?: 'chips' | 'grid';
  testId?: string;
  /** Число отключённых cross-links без ?order= — подсказка в strip. */
  missingOrderHintCount?: number;
};

/**
 * Компактные cross-links между столпами/ролями (работает и в Platform Core).
 */
export function PillarCapabilityCrossLinksStrip({
  title = 'Связанные разделы',
  links,
  className,
  variant = 'chips',
  testId = 'pillar-capability-cross-links',
  missingOrderHintCount = 0,
}: PillarCapabilityCrossLinksStripProps) {
  const safeLinks = finalizeRelatedModuleLinks(links ?? []).filter(
    (link): link is EntityLink => typeof link.href === 'string' && link.href.length > 0
  );
  if (!safeLinks.length) return null;

  return (
    <section className={cn('border-border-subtle border-t pt-4', className)} data-testid={testId}>
      <p className="text-text-muted mb-2 text-[10px] font-black uppercase tracking-widest">
        {title}
      </p>
      {missingOrderHintCount > 0 ? (
        <p
          className="mb-2 text-[11px] font-medium text-amber-800"
          data-testid={`${testId}-order-hint`}
        >
          {missingOrderHintCount} {missingOrderHintCount === 1 ? 'связь требует' : 'связей требуют'}{' '}
          контекст заказа — добавьте <code className="text-[10px]">?order=</code> в URL
        </p>
      ) : null}
      {variant === 'chips' ? (
        <div className="flex flex-wrap gap-2">
          {safeLinks.map((link, index) =>
            link.disabled ? (
              <span
                key={`${link.href}-${index}`}
                title={link.disabledReasonRu}
                className="border-border-subtle bg-bg-surface2/50 text-text-muted inline-flex cursor-not-allowed items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold opacity-60"
                data-testid={`${testId}-item-${index}-disabled`}
              >
                <span className="truncate">{link.label}</span>
              </span>
            ) : (
              <Link
                key={`${link.href}-${index}`}
                href={link.href}
                className="border-border-subtle bg-bg-surface2/80 text-text-primary hover:border-accent-primary/40 hover:text-accent-primary inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                data-testid={`${testId}-item-${index}`}
              >
                <span className="truncate">{link.label}</span>
                <ArrowUpRight className="size-3 shrink-0 opacity-60" aria-hidden />
              </Link>
            )
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {safeLinks.map((link, index) => (
            <li key={`${link.href}-${index}`}>
              <Link
                href={link.href}
                className="border-border-subtle bg-bg-surface2/80 text-text-primary hover:border-accent-primary/30 hover:text-accent-primary group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors"
                data-testid={`${testId}-item-${index}`}
              >
                <span className="min-w-0 truncate">{link.label}</span>
                <ArrowUpRight
                  className="text-text-muted group-hover:text-accent-primary size-3.5 shrink-0"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
