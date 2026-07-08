'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingCart, Building2, Layers, Loader2, Truck } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { BrandZedonkConsolidatedImportButton } from '@/components/integrations/BrandZedonkConsolidatedImportButton';
import { BrandSpineWholesaleImportCard } from '@/components/integrations/BrandSpineWholesaleImportCard';
import { BrandZedonkStyleEnrichPanel } from '@/components/integrations/BrandZedonkStyleEnrichPanel';
import { RegistryPageHeader } from '@/components/design-system';

export default function BrandIntegrationsZedonkPage() {
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      orderNumber: string;
      status: string;
      partnerName?: string;
      brandId?: string;
      total?: number;
      currency?: string;
    }>
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [brands, setBrands] = useState<Array<{ id: string; name?: string }>>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [consolidated, setConsolidated] = useState<
    Array<{ id: string; total?: number; brandOrders?: unknown[] }>
  >([]);
  const [consolidatedLoading, setConsolidatedLoading] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingMsg, setTrackingMsg] = useState<string | null>(null);

  const syncTracking = async () => {
    const wholesaleOrderId = trackingOrderId.trim();
    if (!wholesaleOrderId) return;
    setTrackingBusy(true);
    setTrackingMsg(null);
    try {
      const res = await fetch('/api/integrations/v1/zedonk/tracking/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wholesaleOrderId,
          trackingNumber: trackingNumber.trim() || `ZD-${Date.now()}`,
          carrier: 'Zedonk Logistics',
          status: 'in_transit',
        }),
      });
      setTrackingMsg(res.ok ? 'Tracking синхронизирован в shop spine' : 'Ошибка sync');
    } catch {
      setTrackingMsg('Ошибка сети');
    } finally {
      setTrackingBusy(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/b2b/archive/zedonk/orders?limit=20');
      const data = res.ok ? await res.json() : [];
      setOrders(Array.isArray(data) ? (data as typeof orders) : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadBrands = async () => {
    setBrandsLoading(true);
    try {
      const res = await fetch('/api/b2b/archive/zedonk/brands');
      const data = res.ok ? await res.json() : [];
      setBrands(Array.isArray(data) ? (data as typeof brands) : []);
    } catch {
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  const loadConsolidated = async () => {
    setConsolidatedLoading(true);
    try {
      const res = await fetch('/api/b2b/archive/zedonk/consolidated-orders?limit=20');
      const data = res.ok ? await res.json() : [];
      setConsolidated(Array.isArray(data) ? (data as typeof consolidated) : []);
    } catch {
      setConsolidated([]);
    } finally {
      setConsolidatedLoading(false);
    }
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Zedonk"
        leadPlain="Приём заказов из Zedonk (и при необходимости из JOOR/NuOrder через него). Multi-brand / agent — сводные заказы и список брендов при появлении API."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.integrations} aria-label="Назад к интеграциям">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        <BrandZedonkStyleEnrichPanel />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <ShoppingCart className="h-4 w-4" /> Приём заказов
            </CardTitle>
            <CardDescription>
              Заказы из Zedonk (и из JOOR/NuOrder через Zedonk) в раздел B2B заказов.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadOrders} disabled={ordersLoading}>
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
                    <span>
                      {o.orderNumber} — {o.partnerName ?? '—'}
                    </span>
                    {o.brandId && <Badge variant="outline">{o.brandId}</Badge>}
                    <Badge variant="secondary">{o.status}</Badge>
                    {o.total != null && (
                      <span>
                        {o.currency ?? ''} {o.total}
                      </span>
                    )}
                  </li>
                ))}
                {orders.length > 5 && (
                  <li className="text-text-secondary px-3 py-2">… ещё {orders.length - 5}</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <BrandSpineWholesaleImportCard
          platform="zedonk"
          archiveListLabel="Загрузить заказы (archive GET)"
          onLoadArchive={loadOrders}
          archiveLoading={ordersLoading}
          archiveCount={orders.length}
        />

        <Card data-testid="brand-zedonk-tracking-sync-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Truck className="h-4 w-4" /> F-TRACKING · отгрузка
            </CardTitle>
            <CardDescription>
              Wave D2: tracking → `/shop/b2b/tracking?order={'{wholesaleOrderId}'}` (INT-* после
              handoff).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="wholesaleOrderId (INT-ZEDONK-…)"
              value={trackingOrderId}
              onChange={(e) => setTrackingOrderId(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" disabled={trackingBusy} onClick={() => void syncTracking()}>
              {trackingBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sync tracking
            </Button>
            {trackingMsg ? <p className="text-xs text-emerald-700">{trackingMsg}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Building2 className="h-4 w-4" /> Multi-brand — список брендов
            </CardTitle>
            <CardDescription>Бренды в агентском кабинете. При появлении API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" onClick={loadBrands} disabled={brandsLoading}>
              {brandsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Загрузить бренды
            </Button>
            {brands.length > 0 && (
              <ul className="divide-y rounded-md border text-sm">
                {brands.slice(0, 10).map((b) => (
                  <li key={b.id} className="px-3 py-2">
                    {b.name ?? b.id}
                  </li>
                ))}
                {brands.length > 10 && (
                  <li className="text-text-secondary px-3 py-2">… ещё {brands.length - 10}</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Layers className="h-4 w-4" /> Сводные заказы агента
            </CardTitle>
            <CardDescription>
              Один драфт по разным брендам. MOV/MOQ по бренду. При появлении API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConsolidated}
              disabled={consolidatedLoading}
            >
              {consolidatedLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Загрузить сводные заказы
            </Button>
            {consolidated.length > 0 && (
              <ul className="divide-y rounded-md border text-sm">
                {consolidated.slice(0, 5).map((c) => (
                  <li key={c.id} className="space-y-2 px-3 py-2">
                    <div>
                      {c.id} {c.total != null && `· ${c.total}`} · брендов:{' '}
                      {c.brandOrders?.length ?? 0}
                    </div>
                    {c.brandOrders?.length ? (
                      <BrandZedonkConsolidatedImportButton
                        consolidatedId={c.id}
                        brandOrders={c.brandOrders as Array<{ brandId: string; orderId: string; total?: number }>}
                      />
                    ) : null}
                  </li>
                ))}
                {consolidated.length > 5 && (
                  <li className="text-text-secondary px-3 py-2">… ещё {consolidated.length - 5}</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">Конфигурация</CardTitle>
            <CardDescription>
              ZEDONK_API_BASE (или NEXT_PUBLIC_ZEDONK_API_BASE) и ZEDONK_ACCESS_TOKEN. Документация:
              api-docs.jooraccess.com (Zedonk ERP).
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
        <Link href={ROUTES.shop.b2bAgentCabinet}>
          <Button variant="outline" size="sm">
            Агентский кабинет
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsColect}>
          <Button variant="ghost" size="sm">
            Colect
          </Button>
        </Link>
      </div>
    </CabinetPageContent>
  );
}
