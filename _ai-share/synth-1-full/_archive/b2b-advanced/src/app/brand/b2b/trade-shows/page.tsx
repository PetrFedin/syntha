'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { getRelatedLinks } from '@/lib/data/integration-modules';

/** JOOR, FashionGo: Market Week / Trade Show — CPM, МФН и др. события. */
export default function BrandB2BTradeShowsPage() {
  const links = getRelatedLinks('trade-show').map((l) => ({ label: l.label, href: l.href }));

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-700 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Market Week / Trade Show"
        leadPlain="CPM, МФН и др. события. Календарь выставок, инвайты байерам, заказы с события."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Calendar className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              JOOR
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              FashionGo
            </Badge>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Ближайшие события</CardTitle>
          <CardDescription>CPM, МФН, сезонные показы.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="border-border-subtle bg-bg-surface2 flex items-center gap-2 rounded-lg border p-3">
              <MapPin className="text-text-muted size-4" />
              <span>CPM Moscow — 15–18.04.2026</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href={ROUTES.shop.b2bCollaborativeOrder}>Collaborative Order</Link>
          </Button>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={links} title="Связанные модули" />
    </CabinetPageContent>
  );
}
