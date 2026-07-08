'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import DynamicPricingEngine from '@/components/brand/pricing/DynamicPricingEngine';
import { CommercialTermsMatrix } from '@/components/brand/commercial-terms-matrix';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';

import { DollarSign, Handshake, BarChart3, TrendingDown, Percent } from 'lucide-react';

const PriceComparisonContent = dynamic(
  () => import('@/app/brand/pricing/price-comparison/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const ElasticityContent = dynamic(
  () => import('@/app/brand/pricing/elasticity/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const MarkdownContent = dynamic(
  () => import('@/app/brand/pricing/markdown/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

export default function BrandPricingPage() {
  const [tab, setTab] = useState('pricing');
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Ценообразование"
        leadPlain="Динамические цены B2C, коммерческие условия B2B, сравнение каналов и markdown."
      />
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'flex-wrap')}>
          <TabsTrigger value="pricing" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <DollarSign className="h-3 w-3 shrink-0" /> Ценообразование
          </TabsTrigger>
          <TabsTrigger
            value="price-comparison"
            className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}
          >
            <BarChart3 className="h-3 w-3 shrink-0" /> Сравнение цен
          </TabsTrigger>
          <TabsTrigger value="elasticity" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <TrendingDown className="h-3 w-3 shrink-0" /> Эластичность
          </TabsTrigger>
          <TabsTrigger value="markdown" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <Percent className="h-3 w-3 shrink-0" /> Оптимизация скидок
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className={cabinetSurface.cabinetProfileTabPanel}>
          <Tabs defaultValue="dynamic" className="space-y-4">
            <TabsList className={cn(cabinetSurface.tabsList, 'w-fit flex-wrap')}>
              <TabsTrigger
                value="dynamic"
                className={cn(cabinetSurface.tabsTrigger, 'h-9 gap-2 px-4')}
              >
                <DollarSign className="h-4 w-4 shrink-0" /> B2C Dynamic Pricing
              </TabsTrigger>
              <TabsTrigger
                value="wholesale"
                className={cn(cabinetSurface.tabsTrigger, 'h-9 gap-2 px-4')}
              >
                <Handshake className="h-4 w-4 shrink-0" /> B2B Commercial Terms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dynamic" className={cabinetSurface.cabinetProfileTabPanel}>
              <DynamicPricingEngine />
            </TabsContent>

            <TabsContent value="wholesale" className={cabinetSurface.cabinetProfileTabPanel}>
              <CommercialTermsMatrix />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="price-comparison" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'price-comparison' && <PriceComparisonContent />}
        </TabsContent>

        <TabsContent value="elasticity" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'elasticity' && <ElasticityContent />}
        </TabsContent>

        <TabsContent value="markdown" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'markdown' && <MarkdownContent />}
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
