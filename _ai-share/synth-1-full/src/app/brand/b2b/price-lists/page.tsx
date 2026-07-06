'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { WidgetCard } from '@/components/ui/widget-card';
import { EmptyStateB2B } from '@/components/ui/empty-state-b2b';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPriceLists } from '@/lib/b2b/price-lists';
import { getCustomerGroups } from '@/lib/b2b/customer-groups';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getB2BLinks } from '@/lib/data/entity-links';
import { DollarSign, Users } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  BrandPricelistShopSyncPanel,
  BrandPricelistTiersPanel,
  BrandPricelistVersionsPanel,
} from '@/components/brand/b2b/BrandPricelistWorkspacePanels';
import {
  BrandPricelistGoldenPathStrip,
  brandPricelistGoldenPathStepFromFeature,
} from '@/components/brand/b2b/BrandPricelistGoldenPathStrip';
import { BrandCoPricelistCoPeerStrip } from '@/components/platform/BrandCoPricelistCoPeerStrip';
import { BrandPricelistTierSyncHonestyStrip } from '@/components/brand/b2b/BrandPricelistTierSyncHonestyStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { useSearchParams } from 'next/navigation';

const CustomerGroupsContent = dynamic(() => import('@/app/brand/b2b/customer-groups/page'), {
  ssr: false,
});

function PriceListsWorkspaceBody() {
  const searchParams = useSearchParams();
  const groupFilter = searchParams.get('group');
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId = searchParams.get('order')?.trim() || undefined;
  const ctx = { collectionId, orderId, role: 'brand' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-pricelist');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-pricelist"
      ctx={ctx}
      crossLinksTitle="Tier → shop matrix → landed margin"
    >
      <div className="mb-4 space-y-2">
        <BrandPricelistGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={brandPricelistGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandCoPricelistCoPeerStrip collectionId={collectionId} orderId={orderId} />
        <BrandPricelistTierSyncHonestyStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'versions' ? (
        <BrandPricelistVersionsPanel groupFilter={groupFilter} collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'tiers' ? (
        <BrandPricelistTiersPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'shop-sync' ? (
        <BrandPricelistShopSyncPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function PriceListsLegacyPage() {
  const searchParams = useSearchParamsNonNull();
  const [tab, setTab] = useState<'price-lists' | 'groups'>('price-lists');
  const groupFilter = searchParams.get('group');
  const lists = getPriceLists();
  const groups = getCustomerGroups();
  const filtered = groupFilter
    ? lists.filter((pl) => pl.customerGroupIds?.includes(groupFilter as never))
    : lists;

  return (
    <>
      <RegistryPageHeader
        title="Прайс-листы и группы клиентов"
        leadPlain="Прайс-листы по сегментам и группы покупателей для B2B."
      />
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'price-lists' | 'groups')}
        className="space-y-6"
      >
        <TabsList
          className={cn(cabinetSurface.tabsList, 'h-auto min-h-9 w-full shadow-inner sm:w-fit')}
        >
          <TabsTrigger value="price-lists" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <DollarSign className="h-3 w-3" /> Прайс-листы
          </TabsTrigger>
          <TabsTrigger value="groups" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <Users className="h-3 w-3" /> Группы клиентов
          </TabsTrigger>
        </TabsList>
        <TabsContent value="price-lists" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="flex flex-wrap gap-2">
            <Button variant={!groupFilter ? 'default' : 'outline'} size="sm" asChild>
              <Link href={ROUTES.brand.priceLists}>Все</Link>
            </Button>
            {groups.map((g) => (
              <Button key={g.id} variant={groupFilter === g.id ? 'default' : 'outline'} size="sm" asChild>
                <Link href={`${ROUTES.brand.priceLists}?group=${g.id}`}>{g.nameRu}</Link>
              </Button>
            ))}
          </div>
          <WidgetCard title="Прайс-листы" description="Активные по каналу и группе клиентов.">
            {filtered.length === 0 ? (
              <EmptyStateB2B icon={DollarSign} title="Нет прайсов" description="Нет прайсов для группы." />
            ) : (
              filtered.map((pl) => (
                <div key={pl.id} className="border-border-subtle mb-2 rounded-xl border p-4">
                  <p className="font-medium">{pl.name}</p>
                  <p className="text-text-secondary text-xs">
                    {pl.channel} · {pl.validFrom} – {pl.validTo}
                  </p>
                  {pl.customerGroupIds?.length ? (
                    <div className="mt-2 flex gap-1">
                      {pl.customerGroupIds.map((gid) => (
                        <Badge key={gid} variant="outline" className="text-[9px]">
                          {groups.find((g) => g.id === gid)?.nameRu ?? gid}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </WidgetCard>
          <RelatedModulesBlock links={getB2BLinks()} title="B2B" />
        </TabsContent>
        <TabsContent value="groups" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'groups' && <CustomerGroupsContent />}
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function PriceListsPage() {
  const core = isPlatformCoreMode();

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      {core ? (
        <>
          <RegistryPageHeader
            title="Прайс-листы · tier"
            leadPlain="Onfinity-style versions → tiers → shop matrix sync."
          />
          <Suspense fallback={null}>
            <PriceListsWorkspaceBody />
          </Suspense>
          <RelatedModulesBlock links={getB2BLinks()} title="B2B" />
        </>
      ) : (
        <PriceListsLegacyPage />
      )}
    </CabinetPageContent>
  );
}
