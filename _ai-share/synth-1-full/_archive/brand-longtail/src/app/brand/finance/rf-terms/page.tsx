'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Gift } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { getRelatedLinks } from '@/lib/data/integration-modules';
import { RegistryPageHeader } from '@/components/design-system';

/** Net terms, First order discount, НДС (РФ). Faire-style: 30/60 дней отсрочки, автоскидка на первый заказ. */
export default function BrandFinanceRfTermsPage() {
  const netTermsLinks = getRelatedLinks('net-terms').map((l) => ({ label: l.label, href: l.href }));

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-700 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Условия для РФ (Net terms, скидки)"
        leadPlain="Отсрочка платежа 30/60 дней для оптовиков (Faire), автоскидка на первый заказ, НДС."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CreditCard className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              Net terms
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              First order
            </Badge>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Net terms / Отсрочка
            </CardTitle>
            <CardDescription>
              30/60 дней для оптовиков. Кредитный лимит по партнёру.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm">
              Настройка лимитов и сроков отсрочки платежа.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href={ROUTES.brand.integrationsErpPlm}>1С синхронизация</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-4 w-4" /> First order discount
            </CardTitle>
            <CardDescription>
              Автоматическая скидка на первый заказ нового партнёра.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm">
              Процент или фикс. скидка при первом заказе.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href={ROUTES.brand.buyerApplications}>Анкета онбординга</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <RelatedModulesBlock links={netTermsLinks} title="Связанные модули" />
    </CabinetPageContent>
  );
}
