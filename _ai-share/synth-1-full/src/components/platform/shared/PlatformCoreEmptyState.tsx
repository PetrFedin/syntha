import type { ReactNode } from 'react';
import Link from 'next/link';

import {
  getPlatformCoreContainerRole,
  getPlatformCoreTypographyRole,
} from '@/lib/platform-core-ui-density-contract';

type PlatformCoreEmptyStateProps = {
  title: string;
  reason: string;
  nextActionLabel: string;
  nextActionHref?: string;
  nextAction?: ReactNode;
  meta?: string;
};

/**
 * Canonical compact empty state for Platform Core.
 *
 * Rule: explain why the surface is empty and provide exactly one next action.
 * No hero spacing, decorative illustration or competing actions.
 */
export function PlatformCoreEmptyState({
  title,
  reason,
  nextActionLabel,
  nextActionHref,
  nextAction,
  meta,
}: PlatformCoreEmptyStateProps) {
  const container = getPlatformCoreContainerRole('compact_card');
  const titleTypography = getPlatformCoreTypographyRole('card_title');
  const bodyTypography = getPlatformCoreTypographyRole('body');
  const metaTypography = getPlatformCoreTypographyRole('meta');
  const buttonTypography = getPlatformCoreTypographyRole('button');

  const action =
    nextAction ??
    (nextActionHref ? (
      <Link
        href={nextActionHref}
        className="inline-flex h-8 max-w-full items-center justify-center rounded-md border border-neutral-300 px-2.5 text-neutral-900 transition-colors hover:bg-neutral-50"
        style={{
          fontSize: buttonTypography?.fontSize,
          lineHeight: buttonTypography?.lineHeight,
          fontWeight: buttonTypography?.fontWeight,
        }}
      >
        <span className="truncate">{nextActionLabel}</span>
      </Link>
    ) : (
      <span
        className="inline-flex h-8 max-w-full items-center justify-center rounded-md border border-neutral-200 px-2.5 text-neutral-500"
        style={{
          fontSize: buttonTypography?.fontSize,
          lineHeight: buttonTypography?.lineHeight,
          fontWeight: buttonTypography?.fontWeight,
        }}
      >
        <span className="truncate">{nextActionLabel}</span>
      </span>
    ));

  return (
    <div
      className="flex min-w-0 flex-col gap-2 bg-white text-neutral-950 sm:flex-row sm:items-center sm:justify-between"
      style={{
        padding: container?.padding,
        borderRadius: container?.radius,
        border: container?.border,
      }}
      data-platform-core-empty-state="canonical"
    >
      <div className="min-w-0">
        <div
          className="truncate"
          style={{
            fontSize: titleTypography?.fontSize,
            lineHeight: titleTypography?.lineHeight,
            fontWeight: titleTypography?.fontWeight,
          }}
        >
          {title}
        </div>
        <p
          className="mt-0.5 max-w-2xl text-neutral-600"
          style={{
            fontSize: bodyTypography?.fontSize,
            lineHeight: bodyTypography?.lineHeight,
            fontWeight: bodyTypography?.fontWeight,
          }}
        >
          {reason}
        </p>
        {meta ? (
          <p
            className="mt-0.5 text-neutral-500"
            style={{
              fontSize: metaTypography?.fontSize,
              lineHeight: metaTypography?.lineHeight,
              fontWeight: metaTypography?.fontWeight,
            }}
          >
            {meta}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 shrink-0">{action}</div>
    </div>
  );
}
