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
  /** inline — above fold на mobile/iPad; rail — sticky колонка MacBook. */
  variant?: 'inline' | 'rail';
};

function prefetchProps(href: string, onPrefetch?: (href: string) => void) {
  return onPrefetch
    ? { onMouseEnter: () => onPrefetch(href), onFocus: () => onPrefetch(href) }
    : {};
}

/** lg+: sticky rail — 1 primary + до 2 secondary; mobile: inline в конце контента. */
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
        'flex flex-col gap-2',
        isInline ? 'pt-0' : cn('max-lg:pt-1 lg:sticky lg:top-3', hubCabinet.shellActionRail),
        className
      )}
    >
      {!isInline ? (
        <p className="text-text-muted hidden text-[11px] font-medium uppercase tracking-wide lg:block">
          Действия
        </p>
      ) : null}
      <Link
        href={primary.href}
        data-testid={primary.testId ?? 'role-pillar-primary-cta'}
        className={hubCabinet.primaryCta}
        {...prefetchProps(primary.href, onPrefetch)}
      >
        {primary.label}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      {secondary ? (
        <Link
          href={secondary.href}
          data-testid={secondary.testId ?? 'role-pillar-secondary-cta'}
          className="text-text-primary hover:bg-bg-surface2 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border-subtle px-3 text-[13px] font-medium transition-colors"
          {...prefetchProps(secondary.href, onPrefetch)}
        >
          {secondary.label}
        </Link>
      ) : null}
      {workspace ? (
        <Link
          href={workspace.href}
          data-testid={workspace.testId ?? 'role-pillar-workspace-cta'}
          className="text-text-secondary hover:text-text-primary inline-flex min-h-10 w-full items-center justify-center px-2 text-[11px] font-medium hover:underline"
          {...prefetchProps(workspace.href, onPrefetch)}
        >
          {workspace.label}
        </Link>
      ) : null}
    </aside>
  );
}
