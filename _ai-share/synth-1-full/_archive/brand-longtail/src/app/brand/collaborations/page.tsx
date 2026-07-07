'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Brand, Product } from '@/lib/types';
import { brands } from '@/lib/placeholder-data';
import CollaborationInsights from '@/components/brand/collaboration-insights';
import CollaborationProjects from '@/components/brand/collaboration-projects';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Store, Package } from 'lucide-react';
import { fetchWithHttpDeadline } from '@/lib/http/http-fetch-deadline';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';
import { RegistryPageHeader } from '@/components/design-system';
import { PlatformCorePlaceholderSurfaceDisclaimer } from '@/components/platform/PlatformCorePlaceholderSurfaceDisclaimer';

export default function CollaborationsPage() {
  const synthaBrand =
    brands.find((b) => b.slug?.includes('syntha') || b.id?.includes('syntha')) || brands[0];
  const [brand] = useState<Brand>(synthaBrand!);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetchWithHttpDeadline('/data/products.json');
        const products = (await response.json()) as Product[];
        setAllProducts(products);
      } catch (error) {
        console.error('Failed to fetch products for collaborations page:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
        <RegistryPageHeader
          title="Коллаборации"
          leadPlain="Партнёрства с брендами, совместные коллекции и AI-аналитика синергии."
        />
        <div className="space-y-4 duration-500 animate-in fade-in">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </CabinetPageContent>
    );
  }

  if (!brand) return <div className="p-4 text-center">Бренд не найден.</div>;

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Коллаборации"
        leadPlain="Находите партнёров и создавайте уникальные проекты с помощью AI-аналитики. Связь с Retailers и B2B заказами."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Users className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              Retailers
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              B2B
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.retailers}>
                <Store className="mr-1 size-3" /> Retailers
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bOrders}>
                <Package className="mr-1 size-3" /> {B2B_ORDERS_REGISTRY_LABEL}
              </Link>
            </Button>
          </div>
        }
      />
      <PlatformCorePlaceholderSurfaceDisclaimer route="/brand/collaborations" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <CollaborationInsights brand={brand} allProducts={allProducts} />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <CollaborationProjects brandId={brand.id} />
        </div>
      </div>
    </CabinetPageContent>
  );
}
