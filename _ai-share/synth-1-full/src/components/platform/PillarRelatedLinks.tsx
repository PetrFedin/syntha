'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { PillarCabinetLink } from '@/lib/platform-core-ports/legacy/pillar-cabinet-sections';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';

type Props = {
  related: PillarCabinetLink[];
  overflowSections: ReadinessSubItem[];
};

/** Связанные разделы и peer-роли — max 3 inline + sheet «Ещё». */
export function PillarRelatedLinks({ related, overflowSections }: Props) {
  const [open, setOpen] = useState(false);
  const overflowCount = overflowSections.length;

  if (related.length === 0 && overflowCount === 0) return null;

  return (
    <section data-testid="pillar-cabinet-related-links" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className={hubSectionLabelClassName()}>Связанные</p>
        {overflowCount > 0 ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-text-muted h-8 px-2 text-[11px] font-medium"
                data-testid="pillar-cabinet-related-more"
              >
                Ещё {overflowCount}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-base">Все разделы</SheetTitle>
                <SheetDescription className="text-[13px]">
                  Дополнительные рабочие экраны столпа.
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-4 space-y-1">
                {overflowSections.map((section) => (
                  <Link
                    key={section.id}
                    href={section.href}
                    data-testid={`pillar-overflow-${section.id}`}
                    className={pillarInsight.sectionRow}
                    onClick={() => setOpen(false)}
                  >
                    <span className={pillarInsight.sectionRowLabel}>{section.label}</span>
                    <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
      {related.length > 0 ? (
        <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
          {related.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              data-testid={`pillar-related-${link.id}`}
              className={pillarInsight.sectionRow}
            >
              <span className={pillarInsight.sectionRowLabel}>{link.label}</span>
              <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  );
}
