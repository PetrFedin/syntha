'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { FactoryWorkshop2SampleQueuePanel } from '@/components/factory/FactoryWorkshop2SampleQueuePanel';
import { PlatformCoreDevelopmentChrome } from '@/components/platform/PlatformCoreDevelopmentChrome';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

type Props = {
  contractorId: string;
};

export function BrandFactoryDetailCorePage({ contractorId }: Props) {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <PlatformCoreDevelopmentChrome collectionId={undefined}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.factories} aria-label="К списку производств">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
            <Link href={EXTENDED_ROUTES.factory.production}>Очередь цеха</Link>
          </Button>
        </div>
        <FactoryWorkshop2SampleQueuePanel factoryId={contractorId} />
      </PlatformCoreDevelopmentChrome>
    </CabinetPageContent>
  );
}
