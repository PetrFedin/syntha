'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RegistryPageHeader } from '@/components/design-system';

import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { ROUTES } from '@/lib/routes';

const CampaignsContent = dynamic(
  () => import('@/app/brand/marketing/campaigns/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const ContentFactoryContent = dynamic(
  () => import('@/app/brand/marketing/content-factory/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const TrendSentimentContent = dynamic(
  () => import('@/app/brand/marketing/trend-sentiment/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

export default function BrandMarketingHubPage() {
  const [tab, setTab] = useState('campaigns');

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-4 py-6 pb-24 sm:px-6">
      <RegistryPageHeader
        title="Маркетинг"
        leadPlain="Кампании, контент-фабрика и сигнал трендов в едином workflow-центре."
        actions={
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href={ROUTES.brand.media}>Медиа</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        {/* cabinetSurface v1 */}
        <TabsList className={cabinetSurface.tabsList}>
          <TabsTrigger value="campaigns" className={cn(cabinetSurface.tabsTrigger, 'h-7')}>
            Кампании
          </TabsTrigger>
          <TabsTrigger value="factory" className={cn(cabinetSurface.tabsTrigger, 'h-7')}>
            Контент-фабрика
          </TabsTrigger>
          <TabsTrigger value="trends" className={cn(cabinetSurface.tabsTrigger, 'h-7')}>
            Тренды и sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="campaigns"
          className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
        >
          {tab === 'campaigns' && <CampaignsContent />}
        </TabsContent>
        <TabsContent value="factory" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'factory' && <ContentFactoryContent />}
        </TabsContent>
        <TabsContent value="trends" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'trends' && <TrendSentimentContent />}
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
