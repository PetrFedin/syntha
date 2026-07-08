'use client';

import Link from 'next/link';
import type { BrandTechPackCrossLink } from '@/lib/production/workshop2-techpack-export-session';

export function BrandWorkshop2TechPackCrossLinksStrip({
  links,
  compact = false,
}: {
  links: BrandTechPackCrossLink[];
  compact?: boolean;
}) {
  return (
    <div
      className="border-border-default space-y-2 rounded-lg border bg-muted/30 p-3"
      data-testid="brand-techpack-cross-links-strip"
    >
      <p className="text-text-primary text-[11px] font-semibold">P1 · сквозные связи (5×4)</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.id} className="text-xs leading-snug">
            <Link
              href={link.href}
              className="font-medium text-primary underline-offset-2 hover:underline"
              data-testid={`brand-techpack-cross-link-${link.id}`}
            >
              {link.labelRu}
            </Link>
            {!compact ? (
              <>
                <span className="text-text-muted ml-1 text-[10px]">· {link.pillarRu}</span>
                <p className="text-text-muted mt-0.5 text-[10px]">{link.summaryRu}</p>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
