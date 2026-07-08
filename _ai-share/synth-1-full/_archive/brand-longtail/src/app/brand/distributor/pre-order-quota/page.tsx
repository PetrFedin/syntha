'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, TrendingUp } from 'lucide-react';
import { PreOrderQuotaBadges } from '@/components/brand/SectionBadgeCta';
import { B2BIntegrationStatusWidget } from '@/components/b2b/B2BIntegrationStatusWidget';
import { getPreOrderQuotaLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import {
  listPreOrderQuotaCampaigns,
  type PreOrderQuotaCampaign,
} from '@/lib/distributor/pre-order-quota';
import { RegistryPageHeader } from '@/components/design-system';

export default function PreOrderQuotaPage() {
  const [campaigns, setCampaigns] = useState<PreOrderQuotaCampaign[]>([]);

  useEffect(() => {
    listPreOrderQuotaCampaigns().then(setCampaigns);
  }, []);

  const campaign = campaigns[0];

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Pre-Order Quota"
        leadPlain="Распределение дефицитных артикулов между дилерами по KPI. Связь с Pre-order, B2B заказами и планированием. При API — публикация квот, блокировка сверх лимита."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.distributors} aria-label="Назад к дистрибьюторам">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Package className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <PreOrderQuotaBadges />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> {campaign?.title ?? 'Pre-Order Quota'}
          </CardTitle>
          <CardDescription>
            Квоты по артикулам и дистрибьюторам. KPI влияет на долю при дефиците.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!campaign && <p className="text-text-secondary text-sm">Загрузка квот...</p>}
          {campaign?.skuQuotas?.map((sq) => (
            <div
              key={sq.skuId}
              className="border-border-subtle bg-bg-surface2 rounded-xl border p-3"
            >
              <p className="font-medium">
                {sq.skuName ?? sq.skuId} · всего {sq.totalUnits} шт
              </p>
              <ul className="text-text-secondary mt-2 text-sm">
                {sq.allocated.map((a, i) => (
                  <li key={i}>
                    Д{a.distributorId}: {a.units} шт
                    {a.kpiScore != null ? ` (KPI ${a.kpiScore})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {campaign && (
            <Badge variant="outline" className="text-[10px]">
              {campaign.status}
            </Badge>
          )}
          <p className="text-text-muted text-xs">
            API: PRE_ORDER_QUOTA_API — кампании, распределение, публикация.
          </p>
        </CardContent>
      </Card>
      <B2BIntegrationStatusWidget settingsHref={ROUTES.brand.integrations} />
      <RelatedModulesBlock
        links={getPreOrderQuotaLinks()}
        title="Pre-order, B2B заказы, планирование"
      />
    </CabinetPageContent>
  );
}
