'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';
import { getRelatedLinks } from '@/lib/data/integration-modules';

/** Brandboom: анкета онбординга — сбор данных о магазине при регистрации. */
export default function BrandB2BBuyerApplicationsPage() {
  const links = getRelatedLinks('buyer-onboarding').map((l) => ({ label: l.label, href: l.href }));

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-700 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Анкета онбординга"
        leadPlain="Сбор данных о магазине при регистрации (Brandboom): гео, формат, оборот, категории."
        actions={
          <Badge variant="outline" className="text-[9px]">
            Brandboom
          </Badge>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Заявки байеров</CardTitle>
          <CardDescription>Новые заявки на партнёрство с заполненной анкетой.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-text-secondary text-sm">
            Анкета собирает: название магазина, город, формат (мультибренд/монобренд), оборот,
            интересующие категории.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.financeRf}>
              <FileText className="mr-1 h-3 w-3" /> Net terms / First order
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.tradeShows}>Выставки</Link>
          </Button>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={links} title="Связанные модули" />
    </CabinetPageContent>
  );
}
