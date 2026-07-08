'use client';

import type { ReactNode } from 'react';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  /** Stable test id for registry/matrix tables. */
  testId?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Canonical list/table chrome for Platform Core registries.
 * Domain grids (wholesale matrix, range board) keep custom layouts; tabular lists use this shell.
 */
export function PlatformCoreDataTable({ testId, children, className }: Props) {
  return (
    <div
      className={cn(hubCabinet.listChrome, 'overflow-x-auto', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
