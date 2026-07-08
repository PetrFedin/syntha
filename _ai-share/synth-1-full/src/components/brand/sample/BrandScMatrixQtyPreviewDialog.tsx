'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { parseOperationalOrderV1DetailResponse } from '@/lib/order/operational-order-dto.schema';
import { mapOperationalItemsToForecastLines } from '@/lib/integrations/spine/spine-production-forecast-lines';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

type PreviewRow = { articleId: string; qty: number };

/** Read-only preview qty в матрице магазина (cross-role, brand peer). */
export function BrandScMatrixQtyPreviewDialog({
  collectionId,
  demoOrderId = '',
  triggerTestId = 'brand-sc-matrix-qty-preview-open',
}: {
  collectionId: string;
  demoOrderId?: string;
  triggerTestId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const orderFallback = demoOrderId.startsWith('__') ? '' : demoOrderId;
  const { activeOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: orderFallback,
    resolveFrom: ['allocation', 'operational'],
    actorRole: 'brand',
  });

  const loadPreview = useCallback(async () => {
    setLoadState('loading');
    try {
      if (!activeOrderId) {
        const pubRes = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const pubJson = (await pubRes.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string }>;
        };
        const articles =
          pubJson.ok && Array.isArray(pubJson.articles)
            ? pubJson.articles
                .map((a) => a.articleId?.trim())
                .filter((id): id is string => Boolean(id))
            : [];
        setRows(articles.map((articleId) => ({ articleId, qty: 0 })));
        setLoadState('ready');
        return;
      }

      if (isIntegrationImportedWholesaleOrderId(activeOrderId)) {
        const opRes = await fetch(
          `/api/b2b/v1/operational-orders/${encodeURIComponent(activeOrderId)}`,
          { headers: { ...b2bV1SynthaActorRoleHeaders('brand') }, cache: 'no-store' }
        );
        const parsed = parseOperationalOrderV1DetailResponse(await opRes.json());
        if (!parsed.success) {
          setRows([]);
          setLoadState('error');
          return;
        }
        const byArticle: Record<string, number> = {};
        for (const line of mapOperationalItemsToForecastLines(parsed.data.data.order.items ?? [])) {
          byArticle[line.articleId] = (byArticle[line.articleId] ?? 0) + line.qty;
        }
        setRows(Object.entries(byArticle).map(([articleId, qty]) => ({ articleId, qty })));
        setLoadState('ready');
        return;
      }

      const res = await fetch(`/api/workshop2/b2b/orders/${encodeURIComponent(activeOrderId)}`, {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        ok?: boolean;
        order?: { lines?: Array<{ articleId?: string; qty?: number }> };
      };
      if (!json.ok || !json.order?.lines) {
        setRows([]);
        setLoadState('error');
        return;
      }
      const byArticle: Record<string, number> = {};
      for (const line of json.order.lines) {
        if (!line.articleId) continue;
        byArticle[line.articleId] = (byArticle[line.articleId] ?? 0) + (line.qty ?? 0);
      }
      setRows(Object.entries(byArticle).map(([articleId, qty]) => ({ articleId, qty })));
      setLoadState('ready');
    } catch {
      setRows([]);
      setLoadState('error');
    }
  }, [activeOrderId, collectionId]);

  useEffect(() => {
    if (!open) return;
    void loadPreview();
  }, [open, loadPreview]);

  const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[9px] font-bold uppercase"
          data-testid={triggerTestId}
        >
          Preview qty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-testid="brand-sc-matrix-qty-preview-dialog">
        <DialogHeader>
          <DialogTitle className="text-sm">Preview qty · матрица магазина</DialogTitle>
          <DialogDescription className="text-xs">
            Read-only снимок количеств по активному заказу ({collectionId}
            {activeOrderId ? ` · ${activeOrderId}` : ''}).
          </DialogDescription>
        </DialogHeader>
        {loadState === 'loading' ? (
          <p className="text-text-muted text-xs" data-testid="brand-sc-matrix-qty-preview-loading">
            Загрузка…
          </p>
        ) : loadState === 'error' ? (
          <p className="text-xs text-destructive" data-testid="brand-sc-matrix-qty-preview-error">
            Preview недоступен — нет данных заказа.
          </p>
        ) : (
          <div className="space-y-2" data-testid="brand-sc-matrix-qty-preview-body">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] tabular-nums">
                Σ {totalQty} ед.
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {rows.length} арт.
              </Badge>
            </div>
            <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
              {rows.map((row) => (
                <li
                  key={row.articleId}
                  className="flex items-center justify-between gap-2 rounded border px-2 py-1"
                  data-testid={`brand-sc-matrix-qty-preview-row-${row.articleId}`}
                >
                  <span className="font-mono text-[10px]">{row.articleId}</span>
                  <span className="tabular-nums">{row.qty > 0 ? row.qty : '—'}</span>
                </li>
              ))}
              {rows.length === 0 ? (
                <li className="text-text-muted text-[11px]">
                  Нет строк — опубликуйте витрину или оформите заказ.
                </li>
              ) : null}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
