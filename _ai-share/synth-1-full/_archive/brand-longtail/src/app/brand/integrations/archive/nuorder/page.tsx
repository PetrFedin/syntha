'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Package,
  Truck,
  FileEdit,
  RotateCcw,
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

type NuorderActionResponse = {
  success?: boolean;
  error?: string;
  processed?: number;
};

export default function BrandIntegrationsNuorderPage() {
  const runArchiveAction = useArchiveIntegrationAction();
  const [inventoryMsg, setInventoryMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [shipmentMsg, setShipmentMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [orderIdShipment, setOrderIdShipment] = useState('');
  const [editMsg, setEditMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [orderIdEdit, setOrderIdEdit] = useState('');
  const [replenishmentMsg, setReplenishmentMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [replenishmentLoading, setReplenishmentLoading] = useState(false);
  const [nuOrders, setNuOrders] = useState<
    Array<{ id: string; status: string; customer_name?: string; total?: number }>
  >([]);
  const [nuOrdersLoading, setNuOrdersLoading] = useState(false);

  const loadNuOrders = async () => {
    setNuOrdersLoading(true);
    try {
      const res = await fetch('/api/b2b/archive/nuorder/orders?limit=20');
      const data = res.ok
        ? ((await res.json()) as Array<{
            id: string;
            status: string;
            customer_name?: string;
            total?: number;
          }>)
        : [];
      setNuOrders(Array.isArray(data) ? data : []);
    } catch {
      setNuOrders([]);
    } finally {
      setNuOrdersLoading(false);
    }
  };

  const pushInventory = useCallback(async () => {
    await runArchiveAction({
      setMsg: setInventoryMsg,
      setLoading: setInventoryLoading,
      work: async () => {
        const res = await fetch('/api/b2b/archive/nuorder/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventory: [{ sku: 'DEMO-SKU-01', qty: 50, pre_book_qty: 20, ats_qty: 30 }],
            overwrite: false,
          }),
        });
        const data = jsonAs<NuorderActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'processed' });
      },
    });
  }, [runArchiveAction]);

  const sendShipment = useCallback(async () => {
    await runArchiveAction({
      setMsg: setShipmentMsg,
      setLoading: setShipmentLoading,
      work: async () => {
        const res = await fetch('/api/b2b/archive/nuorder/shipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderIdShipment || 'demo-order-id',
            wholesaleOrderId: orderIdShipment.startsWith('INT-') ? orderIdShipment : undefined,
            tracking_number: '1Z999AA10123456784',
            carrier: 'UPS',
            status: 'shipped',
            shipped_at: new Date().toISOString(),
          }),
        });
        const data = jsonAs<NuorderActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, {
          kind: 'literal',
          text: 'Статус отгрузки отправлен',
        });
      },
    });
  }, [runArchiveAction, orderIdShipment]);

  const updateOrder = useCallback(async () => {
    await runArchiveAction({
      setMsg: setEditMsg,
      setLoading: setEditLoading,
      work: async () => {
        const res = await fetch('/api/b2b/archive/nuorder/order-edit', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderIdEdit || 'demo-order-id',
            lines: [{ sku: 'DEMO-SKU-01', qty: 10 }],
            note: 'Amendment: quantity update',
          }),
        });
        const data = jsonAs<NuorderActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'literal', text: 'Заказ обновлён' });
      },
    });
  }, [runArchiveAction, orderIdEdit]);

  const pushReplenishment = useCallback(async () => {
    await runArchiveAction({
      setMsg: setReplenishmentMsg,
      setLoading: setReplenishmentLoading,
      work: async () => {
        const res = await fetch('/api/b2b/archive/nuorder/replenishment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ sku: 'DEMO-SKU-01', qty_suggested: 25, min_qty: 10 }],
          }),
        });
        const data = jsonAs<NuorderActionResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'processed' });
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
          <h1 className="text-2xl font-bold uppercase tracking-tight">NuOrder</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Остатки (pre-book, ATS), отгрузки, amendments, replenishment. OAuth 1.0.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Package className="h-4 w-4" /> Inventory — синхрон остатков
            </CardTitle>
            <CardDescription>
              Pre-book и ATS (available to ship). Выгрузка из ERP в NuOrder.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={pushInventory} disabled={inventoryLoading}>
              {inventoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Синхронизировать остатки с NuOrder
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

        <BrandSpineWholesaleImportCard
          platform="nuorder"
          archiveListLabel="Загрузить из NuOrder archive"
          onLoadArchive={loadNuOrders}
          archiveLoading={nuOrdersLoading}
          archiveCount={nuOrders.length}
        />
        {nuOrders.length > 0 ? (
          <ul className="divide-y rounded-md border text-sm">
            {nuOrders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-2">
                <span>{o.id}</span>
                <span>{o.status}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Truck className="h-4 w-4" /> Orders Shipments
            </CardTitle>
            <CardDescription>Отправка статусов отгрузок и трекинга в NuOrder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="text"
              placeholder="ID заказа"
              value={orderIdShipment}
              onChange={(e) => setOrderIdShipment(e.target.value)}
              className="w-48 rounded border px-2 py-1.5 text-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={sendShipment} disabled={shipmentLoading}>
                {shipmentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Отправить отгрузку
              </Button>
              {shipmentMsg && (
                <span
                  className={shipmentMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}
                >
                  {shipmentMsg.type === 'success' ? (
                    <CheckCircle2 className="mr-1 inline h-4 w-4" />
                  ) : (
                    <AlertCircle className="mr-1 inline h-4 w-4" />
                  )}
                  {shipmentMsg.text}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <FileEdit className="h-4 w-4" /> Orders Edits (amendments)
            </CardTitle>
            <CardDescription>Обновление заказов: изменение строк, отмена позиций.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="text"
              placeholder="ID заказа"
              value={orderIdEdit}
              onChange={(e) => setOrderIdEdit(e.target.value)}
              className="w-48 rounded border px-2 py-1.5 text-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={updateOrder} disabled={editLoading}>
                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Обновить заказ
              </Button>
              {editMsg && (
                <span className={editMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {editMsg.type === 'success' ? (
                    <CheckCircle2 className="mr-1 inline h-4 w-4" />
                  ) : (
                    <AlertCircle className="mr-1 inline h-4 w-4" />
                  )}
                  {editMsg.text}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <RotateCcw className="h-4 w-4" /> Replenishment
            </CardTitle>
            <CardDescription>Рекомендуемые к дозаказу позиции (опционально).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={pushReplenishment} disabled={replenishmentLoading}>
              {replenishmentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Выгрузить replenishment
            </Button>
            {replenishmentMsg && (
              <span
                className={replenishmentMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}
              >
                {replenishmentMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {replenishmentMsg.text}
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
        <Link href={ROUTES.brand.integrationsJoor}>
          <Button variant="ghost" size="sm">
            JOOR
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
