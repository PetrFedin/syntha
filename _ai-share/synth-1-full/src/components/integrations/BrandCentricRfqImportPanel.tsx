'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck } from 'lucide-react';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

type Props = {
  collectionId?: string;
  articleId?: string;
  b2bOrderId?: string;
  productionOrderId?: string;
};

/** Wave D3 · Centric RFQ → supplier procurement + comms (pillar 4 + 5). */
export function BrandCentricRfqImportPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
  b2bOrderId: b2bOrderIdProp,
  productionOrderId = PLATFORM_CORE_DEMO.productionOrderId,
}: Props) {
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: b2bOrderIdProp?.trim() ?? '',
    resolveFrom: ['allocation', 'operational'],
    actorRole: 'brand',
  });
  const b2bOrderId = b2bOrderIdProp?.trim() || spineOrderId;
  const [busy, setBusy] = useState(false);
  const [rfqId, setRfqId] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const importRfq = async () => {
    if (!b2bOrderId) {
      setMsg('Нет активного B2B-заказа для привязки RFQ');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const id = `CENTRIC-RFQ-${articleId}-${Date.now().toString(36)}`;
      const res = await fetch('/api/integrations/v1/centric/rfq/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: id,
          styleId: `CENTRIC-${articleId}`,
          collectionId,
          articleId,
          b2bOrderId,
          productionOrderId,
          lines: [{ materialCode: 'FAB-001', qty: 120, uom: 'm' }],
        }),
      });
      const json = (await res.json()) as {
        data?: { rfqId?: string; lineCount?: number };
        error?: { messageRu?: string };
      };
      if (!res.ok) {
        setMsg(json.error?.messageRu ?? 'RFQ import failed');
        return;
      }
      setRfqId(json.data?.rfqId ?? id);
      setLineCount(json.data?.lineCount ?? 0);
      setMsg('RFQ → закупка поставщика + системное сообщение в чат');
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card data-testid="brand-centric-rfq-import-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4" aria-hidden />
          Centric RFQ → закупка
        </CardTitle>
        <CardDescription className="text-xs">
          Столп «Настройка» · импорт RFQ в procurement после handoff
          {b2bOrderId ? (
            <>
              {' '}
              · заказ <code className="text-[10px]">{b2bOrderId}</code>
            </>
          ) : (
            ' · выберите или импортируйте заказ'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rfqId ? (
          <Badge variant="secondary" className="text-[10px]">
            RFQ {rfqId} · {lineCount} строк
          </Badge>
        ) : null}
        {msg ? <p className="text-text-secondary text-xs">{msg}</p> : null}
        <Button size="sm" disabled={busy || !b2bOrderId} onClick={() => void importRfq()}>
          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Импорт RFQ
        </Button>
      </CardContent>
    </Card>
  );
}
