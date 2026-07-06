'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { shopB2bOrderHref } from '@/lib/routes';
import { buildShopWorkingOrderSession } from '@/lib/b2b/shop-working-order-session';
import {
  shopWorkingOrderDiffApiPath,
  shopWorkingOrderMergeToMatrixApiPath,
  shopWorkingOrderVersionDiffLinePreview,
  SHOP_WORKING_ORDER_MERGE_BTN_RU,
  SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_FULL_RU,
  SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_PARTIAL_RU,
  SHOP_WORKING_ORDER_MERGE_NETWORK_ERROR_RU,
  type ShopWorkingOrderVersionLineDiff,
} from '@/lib/b2b/shop-working-order-version-diff';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';

type Version = {
  versionId: string;
  label: string;
  status: string;
  createdAt: string;
  lines: Array<{ productId?: string; quantity?: number }>;
};

type Props = {
  wholesaleOrderId: string;
  collectionId?: string;
};

function statusRu(status: string): string {
  if (status === 'draft') return 'черновик';
  if (status === 'confirmed') return 'подтверждена';
  if (status === 'exported') return 'экспорт';
  return status;
}

/** Wave C2 · F-WORKING-ORDER on shop pillar 3 (replaces legacy redirect). */
export function ShopWorkingOrderSpinePanel({ wholesaleOrderId, collectionId }: Props) {
  const session = buildShopWorkingOrderSession({ wholesaleOrderId, collectionId });
  const [versions, setVersions] = useState<Version[]>([]);
  const [exportId, setExportId] = useState<string | null>(null);
  const [versionDiffSummary, setVersionDiffSummary] = useState<string | null>(null);
  const [versionDiffLines, setVersionDiffLines] = useState<ShopWorkingOrderVersionLineDiff[]>([]);
  const [mergeMessage, setMergeMessage] = useState<string | null>(null);
  const [mergeMatrixHref, setMergeMatrixHref] = useState<string | null>(null);
  const [mergeMatrixLinkRu, setMergeMatrixLinkRu] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoadState('loading');
    try {
      const res = await fetch(
        `/api/integrations/v1/working-order/${encodeURIComponent(wholesaleOrderId)}`,
        { cache: 'no-store' }
      );
      const json = (await res.json()) as {
        data?: {
          versions?: Version[];
          export?: { externalExportId?: string } | null;
        };
      };
      if (res.ok && json.data) {
        setVersions(json.data.versions ?? []);
        setExportId(json.data.export?.externalExportId ?? null);
        setLoadState('ready');
        if ((json.data.versions ?? []).length >= 2) {
          try {
            const diffRes = await fetch(shopWorkingOrderDiffApiPath(wholesaleOrderId), {
              cache: 'no-store',
            });
            const diffJson = (await diffRes.json()) as {
              diff?: {
                summaryRu?: string;
                addedLines?: ShopWorkingOrderVersionLineDiff[];
                removedLines?: ShopWorkingOrderVersionLineDiff[];
                changedLines?: ShopWorkingOrderVersionLineDiff[];
              };
            };
            if (diffRes.ok && diffJson.diff?.summaryRu) {
              setVersionDiffSummary(diffJson.diff.summaryRu);
              setVersionDiffLines(shopWorkingOrderVersionDiffLinePreview(diffJson.diff));
            } else {
              setVersionDiffSummary(null);
              setVersionDiffLines([]);
            }
          } catch {
            setVersionDiffLines([]);
            /* optional diff */
          }
        } else {
          setVersionDiffSummary(null);
          setVersionDiffLines([]);
        }
      } else {
        setLoadState('error');
      }
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    if (!wholesaleOrderId.trim()) return;
    void load();
  }, [wholesaleOrderId]);

  const addVersion = async () => {
    setBusy(true);
    try {
      await fetch(`/api/integrations/v1/working-order/${encodeURIComponent(wholesaleOrderId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: `Shop edit ${new Date().toLocaleDateString('ru-RU')}` }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const mergeToMatrix = async () => {
    setBusy(true);
    setMergeMessage(null);
    setMergeMatrixHref(null);
    setMergeMatrixLinkRu(null);
    try {
      const res = await fetch(shopWorkingOrderMergeToMatrixApiPath(wholesaleOrderId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: session.collectionId,
          sessionId: `b2b-cart-wo-${Date.now()}`,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        matrixHref?: string;
        partialMerge?: boolean;
      };
      setMergeMessage(json.messageRu ?? 'Не удалось перенести в матрицу');
      if (json.matrixHref) {
        setMergeMatrixHref(json.matrixHref);
        setMergeMatrixLinkRu(
          json.partialMerge
            ? SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_PARTIAL_RU
            : SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_FULL_RU
        );
      }
    } catch {
      setMergeMessage(SHOP_WORKING_ORDER_MERGE_NETWORK_ERROR_RU);
    } finally {
      setBusy(false);
    }
  };

  if (!isIntegrationImportedWholesaleOrderId(wholesaleOrderId)) {
    return (
      <Card data-testid="shop-working-order-non-spine">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Рабочий заказ доступен для внешних оптовых заказов.
          <Link
            href={shopB2bOrderHref(wholesaleOrderId)}
            className="text-accent-primary ml-2 hover:underline"
          >
            Карточка заказа
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="shop-working-order-spine-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <FileText className="h-4 w-4" aria-hidden />
          Рабочий заказ · {formatWholesaleOrderDisplayId(wholesaleOrderId)}
        </CardTitle>
        <CardDescription>Версии редактирования и перенос в матрицу заказа</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {exportId ? (
          <Badge
            variant="secondary"
            className="text-[10px]"
            data-testid="shop-working-order-export-badge"
          >
            Экспорт · {exportId}
          </Badge>
        ) : null}
        {versionDiffSummary ? (
          <p
            className="border-border-subtle bg-bg-surface2/60 text-text-secondary rounded-md border px-2 py-1 text-[11px]"
            data-testid="shop-working-order-version-diff-summary"
          >
            {versionDiffSummary}
          </p>
        ) : null}
        {versionDiffLines.length > 0 ? (
          <ul
            className="border-border-subtle bg-bg-surface2/40 text-text-secondary space-y-1 rounded-md border px-2 py-1.5 text-[10px]"
            data-testid="shop-working-order-version-diff-lines"
          >
            {versionDiffLines.map((line) => (
              <li key={`${line.productId}-${line.fromQty}-${line.toQty}`}>
                {line.productId}: {line.fromQty} → {line.toQty}
                {line.delta !== 0 ? (
                  <span className="text-accent-primary ml-1">
                    ({line.delta > 0 ? '+' : ''}
                    {line.delta})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {mergeMessage ? (
          <p
            className="rounded-md border border-emerald-200 bg-emerald-50/80 px-2 py-1 text-[11px] text-emerald-900"
            data-testid="shop-working-order-merge-to-matrix-msg"
          >
            {mergeMessage}
          </p>
        ) : null}
        {mergeMatrixHref && mergeMatrixLinkRu ? (
          <Link
            href={mergeMatrixHref}
            className="text-accent-primary inline-flex text-[11px] font-medium hover:underline"
            data-testid="shop-working-order-merge-matrix-link"
          >
            {mergeMatrixLinkRu}
          </Link>
        ) : null}
        {loadState === 'loading' ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Загрузка версий…
          </p>
        ) : (
          <ul className="space-y-1.5 text-xs" data-testid="shop-working-order-version-list">
            {versions.map((v) => (
              <li key={v.versionId} className="rounded border px-2 py-1.5">
                <span className="font-medium">{v.label}</span>
                <span className="ml-2 text-muted-foreground">{statusRu(v.status)}</span>
                <span className="ml-2 text-muted-foreground">{v.lines.length} строк</span>
              </li>
            ))}
            {versions.length === 0 ? (
              <li className="text-muted-foreground">
                Нет версий — появятся после confirm брендом.
              </li>
            ) : null}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => void addVersion()}
            data-testid="shop-working-order-add-version-btn"
          >
            {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            Новая версия
          </Button>
          <Button
            type="button"
            size="sm"
            variant="default"
            disabled={busy || versions.length === 0}
            onClick={() => void mergeToMatrix()}
            data-testid="shop-working-order-merge-to-matrix-btn"
          >
            {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
            {SHOP_WORKING_ORDER_MERGE_BTN_RU}
          </Button>
          <Link
            href={session.matrixHref}
            className="text-accent-primary text-[11px] font-medium hover:underline"
            data-testid="shop-working-order-matrix-link"
          >
            Матрица
          </Link>
          <Link
            href={shopB2bOrderHref(wholesaleOrderId)}
            className="text-accent-primary text-[11px] hover:underline"
          >
            Карточка заказа
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
