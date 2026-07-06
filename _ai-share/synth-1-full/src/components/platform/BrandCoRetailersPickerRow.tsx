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
import { useBrandCoRetailersSummary } from '@/hooks/use-brand-co-retailers-summary';
import { brandB2bOrdersCollectionRegistryHref, brandB2bOrdersRegistryHref, ROUTES } from '@/lib/platform-core-routes';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  className?: string;
};

/**
 * Один row «Магазины» → sheet picker вместо горизонтального фильтра партнёров.
 * Operator UI: 11px+, без multi-buyer chip strip в compact.
 */
export function BrandCoRetailersPickerRow({ collectionId, className }: Props) {
  const [open, setOpen] = useState(false);
  const { retailers, loaded, multiBuyer } = useBrandCoRetailersSummary(collectionId);

  if (!loaded || !multiBuyer) return null;

  const countLabel = `${retailers.length} магазин${retailers.length < 5 ? (retailers.length === 1 ? '' : 'а') : 'ов'}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          data-testid="brand-co-retailers-picker-row"
          className={cn(pillarInsight.sectionRow, 'w-full text-left', className)}
        >
          <span className="min-w-0 flex-1">
            <span className={pillarInsight.sectionRowLabel}>Магазины</span>
            <span className={cn(pillarInsight.sectionRowMeta, 'block')}>{countLabel}</span>
          </span>
          <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base">Сеть ритейлеров</SheetTitle>
          <SheetDescription className="text-[13px]">
            Заказы коллекции {collectionId} по партнёрам.
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-4 space-y-1" aria-label="Магазины-партнёры">
          <Link
            href={brandB2bOrdersCollectionRegistryHref()}
            className={pillarInsight.sectionRow}
            onClick={() => setOpen(false)}
            data-testid="brand-co-retailers-picker-all"
          >
            <span className={pillarInsight.sectionRowLabel}>Все заказы</span>
            <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
          </Link>
          {retailers.map((partner) => (
            <Link
              key={partner.retailerId}
              href={brandB2bOrdersRegistryHref({ partner: partner.retailerId })}
              className={pillarInsight.sectionRow}
              onClick={() => setOpen(false)}
              data-testid={`brand-co-retailers-picker-${partner.retailerId}`}
            >
              <span className="min-w-0 flex-1">
                <span className={pillarInsight.sectionRowLabel}>{partner.displayNameRu}</span>
                <span className={cn(pillarInsight.sectionRowMeta, 'block')}>
                  {partner.orderCount} заказ(ов)
                </span>
              </span>
              <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
            </Link>
          ))}
        </nav>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="text-[11px]" asChild>
            <Link href={platformCoreUiHref(ROUTES.brand.retailers)} onClick={() => setOpen(false)}>
              Управление сетью
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
