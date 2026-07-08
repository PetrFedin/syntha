import type { ReactNode } from 'react';

import { getPlatformCoreContainerRole, getPlatformCoreTypographyRole } from '@/lib/platform-core-ui-density-contract';

type PlatformCoreEmptyStateProps = {
  title: string;
  reason: string;
  nextActionLabel: string;
  nextActionHref?: string;
  nextAction?: ReactNode;
  meta?: string;
};

/**
 * Canonical empty state for Platform Core visible surfaces.
 *
 * Rule: an empty state must explain why the surface is empty and provide exactly
 * one next action. Otherwise it becomes visual noise.
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
      <a
        href={nextActionHref}
        className="inline-flex h-9 items-center rounded-lg border border-neutral-300 px-3 text-neutral-900 hover:bg-neutral-50"
        style={{
          fontSize: buttonTypography?.fontSize,
          lineHeight: buttonTypography?.lineHeight,
          fontWeight: buttonTypography?.fontWeight,
        }}
      >
        {nextActionLabel}
      </a>
    ) : (
      <span
        className="inline-flex h-9 items-center rounded-lg border border-neutral-200 px-3 text-neutral-500"
        style={{
          fontSize: buttonTypography?.fontSize,
          lineHeight: buttonTypography?.lineHeight,
          fontWeight: buttonTypography?.fontWeight,
        }}
      >
        {nextActionLabel}
      </span>
    ));

  return (
    <div
      className="flex items-start justify-between gap-4 bg-white text-neutral-950"
      style={{
        padding: container?.padding,
        borderRadius: container?.radius,
        border: container?.border,
        minHeight: container?.minHeight,
      }}
      data-platform-core-empty-state="canonical"
    >
      <div className="min-w-0 space-y-1">
        <div
          style={{
            fontSize: titleTypography?.fontSize,
            lineHeight: titleTypography?.lineHeight,
            fontWeight: titleTypography?.fontWeight,
          }}
        >
          {title}
        </div>
        <p
          className="max-w-2xl text-neutral-600"
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
            className="text-neutral-500"
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
      <div className="shrink-0">{action}</div>
    </div>
  );
}
