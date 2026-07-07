'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ShoppingCart,
  FileEdit,
  Package,
  Image,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';
import {
  archiveMessageFromB2bShape,
  useArchiveIntegrationAction,
  type ArchiveIntegrationMessage,
} from '@/hooks/use-archive-integration-action';

type FashionCloudJsonResult = {
  success?: boolean;
  error?: string;
  errors?: string[];
  processed?: number;
  synced?: number;
};

export default function BrandIntegrationsFashionCloudPage() {
  const runArchiveAction = useArchiveIntegrationAction();
  const [orders, setOrders] = useState<
    Array<{ id: string; orderNumber?: string; status?: string }>
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [drafts, setDrafts] = useState<Array<{ id: string; orderNumber?: string }>>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [stockMsg, setStockMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [catalogMsg, setCatalogMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const importOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/b2b/fashion-cloud/orders?limit=20');
      const data = res.ok ? await res.json() : [];
      setOrders(Array.isArray(data) ? (data as typeof orders) : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const importDrafts = async () => {
    setDraftsLoading(true);
    try {
      const res = await fetch('/api/b2b/fashion-cloud/draft-orders');
      const data = res.ok ? await res.json() : [];
      setDrafts(Array.isArray(data) ? (data as typeof drafts) : []);
    } catch {
      setDrafts([]);
    } finally {
      setDraftsLoading(false);
    }
  };

  const bulkUpsertStock = useCallback(async () => {
    await runArchiveAction({
      setMsg: setStockMsg,
      setLoading: setStockLoading,
      work: async () => {
        const res = await fetch('/api/b2b/fashion-cloud/stock-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stock: [
              { gtin: '04012345678901', quantity: 100 },
              { gtin: '04012345678902', quantity: 50 },
            ],
          }),
        });
        const data = (await res.json()) as FashionCloudJsonResult;
        return archiveMessageFromB2bShape(data, { kind: 'processed' });
      },
    });
  }, [runArchiveAction]);

  const syncCatalog = useCallback(async () => {
    await runArchiveAction({
      setMsg: setCatalogMsg,
      setLoading: setCatalogLoading,
      work: async () => {
        const res = await fetch('/api/b2b/fashion-cloud/catalog-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            products: [
              {
                id: 'demo-1',
                gtin: '04012345678901',
                name: 'Demo Product',
                options: [
                  { name: 'color', value: 'black', sort: 0 },
                  { name: 'size', value: 'M', sort: 1 },
                ],
                media: [
                  { type: 'image', url: 'https://example.com/photo.jpg', alt: 'Front', sort: 0 },
                  { type: 'video', url: 'https://example.com/video.mp4', sort: 1 },
                ],
              },
            ],
          }),
        });
        const data = (await res.json()) as FashionCloudJsonResult;
        return archiveMessageFromB2bShape(data, { kind: 'synced' });
      },
    });
  }, [runArchiveAction]);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Fashion Cloud"
        leadPlain="Импорт заказов и drafts, stock bulk upsert, каталог с options и media (фото, видео, 3D)."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.integrations} aria-label="Назад к интеграциям">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <ShoppingCart className="h-4 w-4" /> Импорт заказов
            </CardTitle>
            <CardDescription>
              Загрузка заказов из Fashion Cloud в раздел B2B заказов.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={importOrders} disabled={ordersLoading}>
                {ordersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Загрузить заказы
              </Button>
              <Link href={ROUTES.brand.b2bOrders}>
                <Button variant="ghost" size="sm">
                  B2B заказы
                </Button>
              </Link>
            </div>
            {orders.length > 0 && (
              <ul className="divide-y rounded-md border text-sm">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center justify-between px-3 py-2">
                    <span>{o.orderNumber ?? o.id}</span>
                    {o.status && <Badge variant="secondary">{o.status}</Badge>}
                  </li>
                ))}
                {orders.length > 5 && (
                  <li className="text-text-secondary px-3 py-2">… ещё {orders.length - 5}</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <FileEdit className="h-4 w-4" /> Draft orders
            </CardTitle>
            <CardDescription>Черновики заказов из Fashion Cloud (или webhook).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" onClick={importDrafts} disabled={draftsLoading}>
              {draftsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Загрузить черновики
            </Button>
            {drafts.length > 0 && (
              <ul className="divide-y rounded-md border text-sm">
                {drafts.slice(0, 5).map((d) => (
                  <li key={d.id} className="px-3 py-2">
                    {d.orderNumber ?? d.id}
                  </li>
                ))}
                {drafts.length > 5 && (
                  <li className="text-text-secondary px-3 py-2">… ещё {drafts.length - 5}</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Package className="h-4 w-4" /> Stock bulk upsert
            </CardTitle>
            <CardDescription>Массовая выгрузка остатков в Fashion Cloud.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={bulkUpsertStock} disabled={stockLoading}>
              {stockLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Выгрузить остатки
            </Button>
            {stockMsg && (
              <span className={stockMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {stockMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {stockMsg.text}
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Image className="h-4 w-4" /> Каталог: options + media
            </CardTitle>
            <CardDescription>
              Расширение каталога — опции (размер, цвет) и медиа (фото, видео, 3D).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={syncCatalog} disabled={catalogLoading}>
              {catalogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Синхронизировать каталог
            </Button>
            {catalogMsg && (
              <span className={catalogMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {catalogMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {catalogMsg.text}
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Webhook</CardTitle>
            <CardDescription>
              URL для приёма событий от Fashion Cloud:{' '}
              <code className="rounded bg-muted px-1 text-xs">
                POST /api/b2b/fashion-cloud/webhook
              </code>
              . Настройте его в панели Fashion Cloud при необходимости.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={ROUTES.brand.b2bOrders}>
          <Button variant="outline" size="sm">
            B2B заказы
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsJoor}>
          <Button variant="ghost" size="sm">
            JOOR
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsNuOrder}>
          <Button variant="ghost" size="sm">
            NuOrder
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsSparkLayer}>
          <Button variant="ghost" size="sm">
            SparkLayer
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsColect}>
          <Button variant="ghost" size="sm">
            Colect
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsZedonk}>
          <Button variant="ghost" size="sm">
            Zedonk
          </Button>
        </Link>
      </div>
    </CabinetPageContent>
  );
}
