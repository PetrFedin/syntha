'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Calendar, Eye, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { B2BIntegrationStatusWidget } from '@/components/b2b/B2BIntegrationStatusWidget';
import { BrandIntegrationsSpineStatusStrip } from '@/components/integrations/BrandIntegrationsSpineStatusStrip';
import { getB2BLinks } from '@/lib/data/entity-links';
import { RegistryPageHeader } from '@/components/design-system';

/** Brand · B2B · вовлечённость партнёров — связана с реестром заказов и inbound-каналами. */
export default function BrandB2BEngagementPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Вовлечённость партнёров"
        leadPlain="Активность шоурума, лайншитов и кампаний по подключённым B2B-каналам. Сигналы связаны с оптовым реестром и столпом коммуникаций."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.b2bOrders} aria-label="Назад к заказам">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap justify-end gap-1">
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.integrationsWebhooks}>Webhooks</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.b2bOrders}>Оптовый реестр</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.integrationsCentric}>PLM</Link>
            </Button>
          </div>
        }
      />

      <BrandIntegrationsSpineStatusStrip />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Eye className="h-4 w-4" /> Визиты за период
            </CardTitle>
            <CardDescription>Просмотры шоурума, лайншита и лукбука по партнёрам.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
            <p className="text-text-secondary text-xs">
              Данные появятся после синхронизации подключённых каналов.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <TrendingUp className="h-4 w-4" /> Активность
            </CardTitle>
            <CardDescription>Открытия кампаний, скачивания, добавления в заказ.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
            <p className="text-text-secondary text-xs">События агрегируются из inbound webhook и реестра.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">Связанные разделы</CardTitle>
          <CardDescription>
            Вовлечённость не дублирует реестр заказов — переходите к операционным данным и событиям.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5 rounded-lg" asChild>
            <Link href={ROUTES.brand.b2bOrders}>
              <ShoppingCart className="h-3.5 w-3.5" /> Оптовый реестр
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" asChild>
            <Link href={ROUTES.brand.tradeShows}>
              <Calendar className="h-3.5 w-3.5" /> Выставки и события
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" asChild>
            <Link href={ROUTES.brand.integrationsWebhooks}>Inbound webhooks</Link>
          </Button>
        </CardContent>
      </Card>

      <B2BIntegrationStatusWidget settingsHref={ROUTES.brand.integrationsWebhooks} />
      <RelatedModulesBlock title="B2B и партнёры" links={getB2BLinks().slice(0, 6)} />
    </CabinetPageContent>
  );
}
