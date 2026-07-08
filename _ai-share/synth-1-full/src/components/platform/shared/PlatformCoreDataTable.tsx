'use client';

import type { ReactNode } from 'react';

import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import {
  getPlatformCoreContainerRole,
  getPlatformCoreTypographyRole,
} from '@/lib/platform-core-ui-density-contract';
import { cn } from '@/lib/utils';

import { PlatformCoreEmptyState } from './PlatformCoreEmptyState';

type Props = {
  /** Stable test id for registry/matrix tables. */
  testId?: string;
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyReason?: string;
  emptyNextActionLabel?: string;
  emptyNextActionHref?: string;
};

/**
 * Canonical list/table chrome for Platform Core registries.
 *
 * Domain grids (wholesale matrix, range board) may keep custom layouts, but tabular
 * lists should use this shell so spacing, typography and empty states stay aligned
 * with the Platform Core density contract.
 */
export function PlatformCoreDataTable({
  testId,
  children,
  className,
  title,
  description,
  toolbar,
  isEmpty = false,
  emptyTitle = 'Нет данных',
  emptyReason = 'Для этого раздела пока нет записей, которые можно показать.',
  emptyNextActionLabel = 'Перейти к следующему шагу',
  emptyNextActionHref,
}: Props) {
  const tableShell = getPlatformCoreContainerRole('table_shell');
  const sectionTitle = getPlatformCoreTypographyRole('section_title');
  const body = getPlatformCoreTypographyRole('body');

  if (isEmpty) {
    return (
      <PlatformCoreEmptyState
        title={emptyTitle}
        reason={emptyReason}
        nextActionLabel={emptyNextActionLabel}
        nextActionHref={emptyNextActionHref}
      />
    );
  }

  return (
    <div
      className={cn(hubCabinet.listChrome, 'overflow-hidden bg-white', className)}
      data-testid={testId}
      style={{ border: tableShell?.border, borderRadius: tableShell?.radius }}
    >
      {(title || description || toolbar) && (
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3">
          <div className="min-w-0">
            {title ? (
              <div
                style={{
                  fontSize: sectionTitle?.fontSize,
                  lineHeight: sectionTitle?.lineHeight,
                  fontWeight: sectionTitle?.fontWeight,
                }}
              >
                {title}
              </div>
            ) : null}
            {description ? (
              <p
                className="mt-1 text-neutral-600"
                style={{
                  fontSize: body?.fontSize,
                  lineHeight: body?.lineHeight,
                  fontWeight: body?.fontWeight,
                }}
              >
                {description}
              </p>
            ) : null}
          </div>
          {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
