'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

type Props = {
  collectionId: string;
};

export function BrandSampleLifecycleHandoffPanel({ collectionId }: Props) {
  const goldHref = ROUTES.brand.productionGoldSample;

  return (
    <div className="space-y-4" data-testid="brand-sample-lifecycle-handoff-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Передача · столпы 1→2→3</CardTitle>
          <CardDescription>
            Gold sample approval — дальше release и shop showroom в golden path.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={goldHref}>Gold sample approval</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
