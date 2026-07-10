'use client';

import type { ReactNode } from 'react';
import { cabinetTypography } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  subtitle?: string;
  lead?: string;
  progress?: ReactNode;
  className?: string;
};

/** Единый compact header столпа: title + progress, затем только полезный контекст. */
export function PillarCabinetHeader({ title, subtitle, lead, progress, className }: Props) {
  return (
    <header
      data-testid="pillar-cabinet-header"
      className={cn('border-border-subtle border-b pb-2', className)}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className={cn(cabinetTypography.pageTitle, 'truncate')}>{title}</h1>
          {subtitle ? (
            <p className={cn(cabinetTypography.caption, 'mt-0.5 line-clamp-1')}>{subtitle}</p>
          ) : null}
        </div>
        {progress ? <div className="shrink-0 pt-0.5">{progress}</div> : null}
      </div>
      {lead ? (
        <p className={cn(cabinetTypography.body, 'mt-1 max-w-3xl line-clamp-2')}>{lead}</p>
      ) : null}
    </header>
  );
}
