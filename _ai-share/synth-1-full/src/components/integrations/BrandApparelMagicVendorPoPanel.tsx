'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck } from 'lucide-react';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

/** Wave D6 · ERP vendor PO import (brand · pillar 4 setup). */
export function BrandApparelMagicVendorPoPanel() {
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: ['allocation', 'operational', 'handoff'],
    actorRole: 'brand',
    factoryId: PLATFORM_CORE_DEMO.factoryId,
  });
  const [busy, setBusy] = useState(false);
  const [vendorPoId, setVendorPoId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const importVendorPo = async () => {
    if (!spineOrderId) {
      setMsg('Нет активного B2B-заказа для vendor PO');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/integrations/v1/apparel-magic/vendor-po/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          b2bOrderId: spineOrderId,
          productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
        }),
      });
      const json = (await res.json()) as { data?: { vendorPo?: { vendorPoId: string } } };
      if (!res.ok) {
        setMsg('Vendor PO import failed');
        return;
      }
      setVendorPoId(json.data?.vendorPo?.vendorPoId ?? null);
      setMsg('Vendor PO → закупка поставщика (после handoff — auto)');
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card data-testid="brand-am-vendor-po-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4" aria-hidden />
          ERP · vendor PO
        </CardTitle>
        <CardDescription className="text-xs">
          Столп «Настройка» · vendor PO в procurement
          {spineOrderId ? (
            <>
              {' '}
              · заказ <code className="text-[10px]">{spineOrderId}</code>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {vendorPoId ? (
          <Badge variant="secondary" className="text-[10px]">
            {vendorPoId}
          </Badge>
        ) : null}
        {msg ? <p className="text-text-secondary text-xs">{msg}</p> : null}
        <Button size="sm" disabled={busy || !spineOrderId} onClick={() => void importVendorPo()}>
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Импорт vendor PO
        </Button>
      </CardContent>
    </Card>
  );
}
