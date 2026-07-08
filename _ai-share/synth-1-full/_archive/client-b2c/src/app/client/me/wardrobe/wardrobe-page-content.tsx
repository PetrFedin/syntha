'use client';

import { RegistryPageHeader } from '@/components/design-system';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';
import AiWardrobeAssistant from '@/components/wardrobe/ai-wardrobe-assistant';
import { AiPersonalLookbook } from '@/components/u/ai-personal-lookbook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Shirt } from 'lucide-react';
import { useUIState } from '@/providers/ui-state';
import type { Product } from '@/lib/types';
import { OmniChannelBridge } from '@/components/loyalty/omni-bridge';
import { CircularHub } from '@/components/loyalty/circular-hub';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export function WardrobePageContent() {
  const { manualWardrobe } = useUIState();
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/data/products.json');
        const allProducts = (await response.json()) as Product[];
        setPurchasedProducts(allProducts.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch products for wardrobe', error);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <RegistryPageHeader
        title="Мой гардероб"
        leadPlain="Покупки Syntha и вещи, добавленные вручную, в одном рабочем контуре с AI-ассистентом."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link href={ROUTES.client.profileWithTab('smart-wardrobe')}>AI-гардероб</Link>
            </Button>
            <Button size="sm" className="h-8" asChild>
              <Link href={ROUTES.client.profileWithTab('looks')}>Лукборды</Link>
            </Button>
          </>
        }
      />

      <div className="mb-12">
        <AiPersonalLookbook />
      </div>

      <div className="mb-12">
        <OmniChannelBridge />
      </div>

      <div className="mb-12">
        <CircularHub />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <main className="lg:col-span-3">
          <Tabs defaultValue="purchased">
            <TabsList className={cn(cabinetSurface.tabsList, 'mb-6 w-full flex-wrap')}>
              <TabsTrigger value="purchased" className={cabinetSurface.tabsTrigger}>
                Покупки на Syntha ({purchasedProducts.length})
              </TabsTrigger>
              <TabsTrigger value="added" className={cabinetSurface.tabsTrigger}>
                Добавленные вручную ({manualWardrobe.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="purchased">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {purchasedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="added">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {manualWardrobe.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                <Card className="flex min-h-[400px] flex-col items-center justify-center border-2 border-dashed bg-muted/50 transition-colors hover:border-primary">
                  <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                    <Shirt className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold">Добавить вещь</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Загрузите фото вашей одежды, чтобы AI мог давать более точные рекомендации.
                    </p>
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Загрузить фото
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <AiWardrobeAssistant wardrobe={[...purchasedProducts, ...manualWardrobe]} />
          </div>
        </aside>
      </div>
    </div>
  );
}
