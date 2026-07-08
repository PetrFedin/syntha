'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { BrandApparelMagicVendorPoPanel } from '@/components/integrations/BrandApparelMagicVendorPoPanel';
import { BrandSpineWholesaleImportCard } from '@/components/integrations/BrandSpineWholesaleImportCard';
import { MatrixIntegrationAtsBadge, useMatrixIntegrationInventory } from '@/hooks/use-matrix-integration-inventory';

const DEMO_SKUS = ['SS27-M-COAT-01', 'SS27-W-DRS-02'];

export default function BrandIntegrationsApparelMagicPage() {
  const [orders, setOrders] = useState<Array<{ id: string; status: string }>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { bySku } = useMatrixIntegrationInventory('apparel_magic', DEMO_SKUS);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/b2b/archive/apparel-magic/orders?limit=20');
      const data = res.ok
        ? ((await res.json()) as Array<{ id: string; status: string }>)
        : [];
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.integrations}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Apparel Magic</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Wave D · wholesale import + F-AM-ATP для матрицы (столп 3–4).
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <BrandSpineWholesaleImportCard
          platform="apparel_magic"
          archiveListLabel="Загрузить AM archive"
          onLoadArchive={loadOrders}
          archiveLoading={ordersLoading}
          archiveCount={orders.length}
        />

        <BrandApparelMagicVendorPoPanel />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Package className="h-4 w-4" /> ATP demo (F-AM-ATP)
            </CardTitle>
            <CardDescription>Available-to-promise cells для shop matrix.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {DEMO_SKUS.map((sku) => (
              <MatrixIntegrationAtsBadge
                key={sku}
                sku={sku}
                cell={bySku.get(sku)}
                platform="apparel_magic"
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={ROUTES.brand.b2bOrders}>
          <Button variant="outline" size="sm">
            B2B заказы
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsNuOrder}>
          <Button variant="ghost" size="sm">
            NuOrder
          </Button>
        </Link>
      </div>
    </div>
  );
}
