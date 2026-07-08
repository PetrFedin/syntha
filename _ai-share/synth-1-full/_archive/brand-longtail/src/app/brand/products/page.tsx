'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AdvancedPIM } from '@/components/brand/AdvancedPIM';
import { Database, Layers, Target, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RegistryPageHeader } from '@/components/design-system';

import { tid } from '@/lib/ui/test-ids';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { ROUTES } from '@/lib/routes';

function ProductsLoadingState() {
  return (
    <Card className="border-border-default bg-bg-surface2/70">
      <CardContent className="py-10 text-center">
        <p className="text-text-secondary text-sm font-medium">Загрузка раздела...</p>
      </CardContent>
    </Card>
  );
}

const VariantMatrixEditor = dynamic(
  () =>
    import('@/components/brand/VariantMatrixEditor').then((m) => ({
      default: m.VariantMatrixEditor,
    })),
  { ssr: false, loading: () => <ProductsLoadingState /> }
);
const SmartPlanningContent = dynamic(() => import('@/app/brand/planning/page'), {
  ssr: false,
  loading: () => <ProductsLoadingState />,
});
const CreateReadyContent = dynamic(
  () => import('@/app/brand/products/create-ready/page').then((m) => m.default),
  { ssr: false, loading: () => <ProductsLoadingState /> }
);
const ColorsContent = dynamic(() => import('@/app/brand/colors/page').then((m) => m.default), {
  ssr: false,
  loading: () => <ProductsLoadingState />,
});
const RangePlannerContent = dynamic(
  () => import('@/app/brand/range-planner/page').then((m) => m.default),
  { ssr: false, loading: () => <ProductsLoadingState /> }
);
const DigitalTwinTestingContent = dynamic(
  () => import('@/app/brand/products/digital-twin-testing/page').then((m) => m.default),
  { ssr: false, loading: () => <ProductsLoadingState /> }
);
const WeatherCollectionsContent = dynamic(
  () => import('@/app/brand/weather-collections/page').then((m) => m.default),
  { ssr: false, loading: () => <ProductsLoadingState /> }
);
const DigitalPassportContent = dynamic(
  () => import('@/app/brand/products/digital-passport/page').then((m) => m.default),
  { ssr: false, loading: () => <ProductsLoadingState /> }
);

export default function BrandProductsPage() {
  const [tab, setTab] = useState('pim');

  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-4 px-4 py-6 pb-24 sm:px-6"
      data-testid={tid.page('brand-products')}
    >
      <RegistryPageHeader
        title="Продукт"
        leadPlain="Карточки, матрица ассортимента и продуктовые потоки от планирования до цифрового паспорта."
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="h-8">
              <Link href={ROUTES.brand.planning}>Планирование</Link>
            </Button>
            <Button asChild size="sm" className="h-8">
              <Link href={ROUTES.brand.productsCreateReady}>Новая карточка</Link>
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="min-h-[200px] w-full space-y-4">
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-h-9 w-fit shadow-inner')}>
            <TabsTrigger
              value="pim"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              <Database className="size-3.5" />
              Карточки товаров
            </TabsTrigger>
            <TabsTrigger
              value="matrix"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              <Layers className="size-3.5" />
              Матрица ассортимента
            </TabsTrigger>
            <TabsTrigger
              value="planning"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              <Target className="size-3.5" />
              Планирование
            </TabsTrigger>
            <TabsTrigger
              value="create-ready"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              Карточка товара
            </TabsTrigger>
            <TabsTrigger
              value="colors"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              Цвета
            </TabsTrigger>
            <TabsTrigger
              value="range-planner"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              Планировщик ассортимента
            </TabsTrigger>
            <TabsTrigger
              value="digital-testing"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              Тест образцов
            </TabsTrigger>
            <TabsTrigger
              value="weather"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              Погодные коллекции
            </TabsTrigger>
            <TabsTrigger
              value="digital-passport"
              className={cn(
                cabinetSurface.tabsTrigger,
                'data-[state=active]:text-accent-primary h-7 gap-1.5 text-xs'
              )}
            >
              <Fingerprint className="size-3.5" />
              Цифровой паспорт
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="pim" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          <AdvancedPIM />
        </TabsContent>

        <TabsContent value="matrix" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'matrix' && <VariantMatrixEditor />}
        </TabsContent>

        <TabsContent value="planning" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
          {tab === 'planning' && <SmartPlanningContent />}
        </TabsContent>

        <TabsContent value="create-ready">
          {tab === 'create-ready' && <CreateReadyContent />}
        </TabsContent>
        <TabsContent value="colors">{tab === 'colors' && <ColorsContent />}</TabsContent>
        <TabsContent value="range-planner">
          {tab === 'range-planner' && <RangePlannerContent />}
        </TabsContent>
        <TabsContent value="digital-testing">
          {tab === 'digital-testing' && <DigitalTwinTestingContent />}
        </TabsContent>
        <TabsContent value="weather">
          {tab === 'weather' && <WeatherCollectionsContent />}
        </TabsContent>
        <TabsContent value="digital-passport">
          {tab === 'digital-passport' && <DigitalPassportContent />}
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
