import type { ReactNode } from 'react';

import { getPlatformCoreTypographyRole } from '@/lib/platform-core-ui-density-contract';

type PlatformCoreSectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  meta?: ReactNode;
};

/**
 * Canonical compact section header for visible Platform Core surfaces.
 *
 * Rule: one section header may expose one primary action. Additional controls
 * must be secondary and should not compete with the lifecycle next action.
 */
export function PlatformCoreSectionHeader({
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryActions,
  meta,
}: PlatformCoreSectionHeaderProps) {
  const sectionTitle = getPlatformCoreTypographyRole('section_title');
  const body = getPlatformCoreTypographyRole('body');
  const metaTypography = getPlatformCoreTypographyRole('meta');

  return (
    <div className="flex items-start justify-between gap-4" data-platform-core-section-header="canonical">
      <div className="min-w-0">
        {eyebrow ? (
          <div
            className="mb-1 uppercase tracking-wide text-neutral-500"
            style={{
              fontSize: metaTypography?.fontSize,
              lineHeight: metaTypography?.lineHeight,
              fontWeight: metaTypography?.fontWeight,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          className="text-neutral-950"
          style={{
            fontSize: sectionTitle?.fontSize,
            lineHeight: sectionTitle?.lineHeight,
            fontWeight: sectionTitle?.fontWeight,
          }}
        >
          {title}
        </div>
        {description ? (
          <p
            className="mt-1 max-w-3xl text-neutral-600"
            style={{
              fontSize: body?.fontSize,
              lineHeight: body?.lineHeight,
              fontWeight: body?.fontWeight,
            }}
          >
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-2">{meta}</div> : null}
      </div>
      {(primaryAction || secondaryActions) && (
        <div className="flex shrink-0 items-center gap-2">
          {secondaryActions ? <div className="flex items-center gap-2">{secondaryActions}</div> : null}
          {primaryAction ? <div>{primaryAction}</div> : null}
        </div>
      )}
    </div>
  );
}
