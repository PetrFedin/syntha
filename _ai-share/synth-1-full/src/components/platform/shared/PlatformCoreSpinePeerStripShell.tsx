'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

export type PlatformCoreSpinePeerLink = {
  href: string;
  label: string;
  testId: string;
};

type Props = {
  /** Stable e2e anchor for the strip container. */
  testId: string;
  links: readonly PlatformCoreSpinePeerLink[];
};

/** Shared golden-path peer strip chrome — links only differ by role/pillar config. */
export function PlatformCoreSpinePeerStripShell({ testId, links }: Props) {
  if (links.length === 0) return null;

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid={testId}
    >
      {links.map((link, index) => (
        <Fragment key={link.testId}>
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link href={link.href} data-testid={link.testId} className={hubGadget.goldenLink}>
            {link.label}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
