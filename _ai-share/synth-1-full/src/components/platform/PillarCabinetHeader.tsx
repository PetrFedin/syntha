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

/** Единый заголовок кабинета столпа (без дублей section label + insight header). */
export function PillarCabinetHeader({ title, subtitle, lead, progress, className }: Props) {
  return (
    <header
      data-testid="pillar-cabinet-header"
      className={cn('border-border-subtle space-y-1 border-b pb-3', className)}
    >
      <h1 className={cabinetTypography.pageTitle}>{title}</h1>
      {subtitle ? <p className={cabinetTypography.caption}>{subtitle}</p> : null}
      {lead ? <p className={cabinetTypography.body}>{lead}</p> : null}
      {progress ? <div className="pt-1">{progress}</div> : null}
    </header>
  );
}
