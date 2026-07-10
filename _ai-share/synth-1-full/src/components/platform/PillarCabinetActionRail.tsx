'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PillarCabinetAction } from '@/lib/platform-core-ports/legacy/pillar-cabinet-primary-actions';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  primary: PillarCabinetAction;
  secondary?: PillarCabinetAction;
  workspace?: PillarCabinetAction;
  onPrefetch?: (href: string) => void;
  className?: string;
  /** inline — above fold на mobile/iPad; rail — compact sticky actions on desktop. */
  variant?: 'inline' | 'rail';
};

function prefetchProps(href: string, onPrefetch?: (href: string) => void) {
  return onPrefetch
    ? { onMouseEnter: () => onPrefetch(href), onFocus: () => onPrefetch(href) }
    : {};
}

/** Один явный primary action; secondary/workspace не конкурируют с ним визуально. */
export function PillarCabinetActionRail({
  primary,
  secondary,
  workspace,
  onPrefetch,
  className,
  variant = 'rail',
}: Props) {
  const isInline = variant === 'inline';

  return (
    <aside
      data-testid="pillar-cabinet-action-rail"
      className={cn(
        'flex flex-col gap-1.5',
        isInline ? 'pt-0' : cn('max-lg:pt-1 lg:sticky lg:top-3', hubCabinet.shellActionRail),
        className
      )}
    >
      <Link
        href={primary.href}
        data-testid={primary.testId ?? 'role-pillar-primary-cta'}
        className={hubCabinet.primaryCta}
        {...prefetchProps(primary.href, onPrefetch)}
      >
        <span className="truncate">{primary.label}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </Link>

      {secondary ? (
        <Link
          href={secondary.href}
          data-testid={secondary.testId ?? 'role-pillar-secondary-cta'}
          className="text-text-primary hover:bg-bg-surface2 border-border-subtle inline-flex h-8 w-full items-center justify-center rounded-md border px-2.5 text-[11px] font-medium transition-colors"
          {...prefetchProps(secondary.href, onPrefetch)}
        >
          <span className="truncate">{secondary.label}</span>
        </Link>
      ) : null}

      {workspace ? (
        <Link
          href={workspace.href}
          data-testid={workspace.testId ?? 'role-pillar-workspace-cta'}
          className="text-text-muted hover:text-text-primary inline-flex h-7 w-full items-center justify-center px-2 text-[10px] font-medium transition-colors hover:underline"
          {...prefetchProps(workspace.href, onPrefetch)}
        >
          <span className="truncate">{workspace.label}</span>
        </Link>
      ) : null}
    </aside>
  );
}
