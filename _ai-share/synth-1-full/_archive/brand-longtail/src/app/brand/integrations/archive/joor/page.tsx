'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Package,
  DollarSign,
  ShoppingCart,
  Shirt,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BrandSpineWholesaleImportCard } from '@/components/integrations/BrandSpineWholesaleImportCard';
import { ROUTES } from '@/lib/routes';
import { jsonAs } from '@/lib/json';
import {
  archiveMessageFromB2bShape,
  useArchiveIntegrationAction,
  type ArchiveIntegrationMessage,
} from '@/hooks/use-archive-integration-action';

type JoorActionResponse = {
  success?: boolean;
  error?: string;
  processed?: number;
  count?: number;
  synced?: number;
};

export default function BrandIntegrationsJoorPage() {
  const runArchiveAction = useArchiveIntegrationAction();
  const [inventoryMsg, setInventoryMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [priceTypes, setPriceTypes] = useState<
    Array<{ id: string; name?: string; currency_code?: string }>
  >([]);
  const [priceTypesLoading, setPriceTypesLoading] = useState(false);
  const [pricesMsg, setPricesMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      orderNumber: string;
      status: string;
      partnerName?: string;
      createdAt: string;
      total?: number;
      currency?: string;
    }>
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [stylesMsg, setStylesMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [customersMsg, setCustomersMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [customersLoading, setCustomersLoading] = useState(false);

  const pushInventory = useCallback(async () => {
    await runArchiveAction({
      setMsg: setInventoryMsg,
      setLoading: setInventoryLoading,
      work: async () => {
        const res = await fetch('/api/b2b/joor/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                sku: 'DEMO-SKU-01',
                quantity: 100,
                availableDate: new Date().toISOString().slice(0, 10),
              },
            ],
            overwrite: false,
          }),
        });
        const data = jsonAs<JoorActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'processed' });
      },
    });
  }, [runArchiveAction]);

  const loadPriceTypes = async () => {
    setPriceTypesLoading(true);
    try {
      const res = await fetch('/api/b2b/joor/price-types');
      const data = res.ok ? await res.json() : [];
      setPriceTypes(
        Array.isArray(data)
          ? jsonAs<Array<{ id: string; name?: string; currency_code?: string }>>(data)
          : []
      );
    } catch {
      setPriceTypes([]);
    } finally {
      setPriceTypesLoading(false);
    }
  };

  const upsertPrices = useCallback(async () => {
    await runArchiveAction({
      setMsg: setPricesMsg,
      setLoading: setPricesLoading,
      work: async () => {
        const res = await fetch('/api/b2b/joor/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prices: [
              {
                sku_identifier: 'DEMO-SKU-01',
                price_type_name: 'Wholesale',
                price_type_currency_code: 'RUB',
                wholesale_value: 5000,
                retail_value: 9900,
              },
            ],
          }),
        });
        const data = jsonAs<JoorActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'count', label: 'Обновлено' });
      },
    });
  }, [runArchiveAction]);

  const importOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/b2b/archive/joor/orders?limit=20');
      const data = res.ok ? await res.json() : [];
      setOrders(
        Array.isArray(data)
          ? jsonAs<
              Array<{
                id: string;
                orderNumber: string;
                status: string;
                partnerName?: string;
                createdAt: string;
                total?: number;
                currency?: string;
              }>
            >(data)
          : []
      );
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const syncStyles = useCallback(async () => {
    await runArchiveAction({
      setMsg: setStylesMsg,
      setLoading: setStylesLoading,
      work: async () => {
        const res = await fetch('/api/b2b/joor/sync-styles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            styles: [{ style_identifier: 'DEMO-STYLE-01', name: 'Demo Style' }],
          }),
        });
        const data = jsonAs<JoorActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'synced' });
      },
    });
  }, [runArchiveAction]);

  const syncCustomers = useCallback(async () => {
    await runArchiveAction({
      setMsg: setCustomersMsg,
      setLoading: setCustomersLoading,
      work: async () => {
        const res = await fetch('/api/b2b/joor/sync-customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customers: [{ name: 'Demo Partner', email: 'partner@example.com' }],
          }),
        });
        const data = jsonAs<JoorActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'synced' });
      },
    });
  }, [runArchiveAction]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.integrations}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">JOOR</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Остатки (v2), цены (v4), импорт заказов, синхрон стилей и клиентов.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Inventory v2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Package className="h-4 w-4" /> Остатки (Inventory v2)
            </CardTitle>
            <CardDescription>
              Выгрузка остатков по складам и датам. Overwrite или Update.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={pushInventory} disabled={inventoryLoading}>
              {inventoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Синхронизировать с JOOR
            </Button>
            {inventoryMsg && (
              <span className={inventoryMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {inventoryMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {inventoryMsg.text}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Prices v4 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <DollarSign className="h-4 w-4" /> Цены (Prices v4)
            </CardTitle>
            <CardDescription>
              Типы цен и массовое обновление по SKU, валютам, клиентам.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPriceTypes}
                disabled={priceTypesLoading}
              >
                {priceTypesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Типы цен JOOR
              </Button>
              <Button size="sm" onClick={upsertPrices} disabled={pricesLoading}>
                {pricesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Выгрузить цены в JOOR
              </Button>
            </div>
            {priceTypes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {priceTypes.slice(0, 10).map((t) => (
                  <Badge key={t.id} variant="secondary">
                    {t.name ?? t.id} {t.currency_code ?? ''}
                  </Badge>
                ))}
                {priceTypes.length > 10 && (
                  <Badge variant="outline">+{priceTypes.length - 10}</Badge>
                )}
              </div>
            )}
            {pricesMsg && (
              <p className={pricesMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {pricesMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {pricesMsg.text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Orders import */}
        <BrandSpineWholesaleImportCard
          platform="joor"
          archiveListLabel="Загрузить из JOOR (archive GET)"
          onLoadArchive={importOrders}
          archiveLoading={ordersLoading}
          archiveCount={orders.length}
        />
        {orders.length > 0 ? (
          <ul className="divide-y rounded-md border text-sm">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-2">
                <span>
                  {o.orderNumber} — {o.partnerName ?? '—'}
                </span>
                <Badge variant="secondary">{o.status}</Badge>
                {o.total != null && (
                  <span>
                    {o.currency ?? ''} {o.total}
                  </span>
                )}
              </li>
            ))}
            {orders.length > 5 && (
              <li className="px-3 py-2 text-slate-500">… ещё {orders.length - 5}</li>
            )}
          </ul>
        ) : null}

        {/* Styles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Shirt className="h-4 w-4" /> Стили / продукты
            </CardTitle>
            <CardDescription>Синхрон стилей и лайншитов в JOOR (bulk).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={syncStyles} disabled={stylesLoading}>
              {stylesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Синхрон стилей в JOOR
            </Button>
            {stylesMsg && (
              <span className={stylesMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {stylesMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {stylesMsg.text}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Users className="h-4 w-4" /> Клиенты / партнёры
            </CardTitle>
            <CardDescription>
              Синхрон контактов и правил (sales rep, warehouse, скидки).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={syncCustomers} disabled={customersLoading}>
              {customersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Синхрон партнёров в JOOR
            </Button>
            {customersMsg && (
              <span className={customersMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                {customersMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {customersMsg.text}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={ROUTES.brand.b2bOrders}>
          <Button variant="outline" size="sm">
            B2B заказы
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsCentric}>
          <Button variant="ghost" size="sm">
            Centric PLM
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsNuOrder}>
          <Button variant="ghost" size="sm">
            NuOrder
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsFashionCloud}>
          <Button variant="ghost" size="sm">
            Fashion Cloud
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
    </div>
  );
}
