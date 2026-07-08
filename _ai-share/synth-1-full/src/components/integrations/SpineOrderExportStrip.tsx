'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Upload } from 'lucide-react';
import { ROUTES, shopB2bWorkingOrderOrderContextHref } from '@/lib/routes';
import {
  integrationPlatformLabelRu,
  isIntegrationImportedWholesaleOrderId,
} from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  orderId: string;
  variant?: 'brand' | 'shop';
  reloadNonce?: number;
  onExportDone?: () => void;
};

/** Wave C2 · export + working order links on order detail (pillar 3). */
export function SpineOrderExportStrip({
  orderId,
  variant = 'shop',
  reloadNonce = 0,
  onExportDone,
}: Props) {
  const [exportId, setExportId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [versionCount, setVersionCount] = useState(0);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const loadWorkingOrder = async () => {
    if (!isIntegrationImportedWholesaleOrderId(orderId)) {
      setLoadState('idle');
      return;
    }
    setLoadState('loading');
    try {
      const res = await fetch(`/api/integrations/v1/working-order/${encodeURIComponent(orderId)}`, {
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        data?: {
          export?: { externalExportId?: string; platform?: string } | null;
          versions?: unknown[];
        };
      };
      if (res.ok) {
        setExportId(json.data?.export?.externalExportId ?? null);
        setPlatform(json.data?.export?.platform ?? null);
        setVersionCount(json.data?.versions?.length ?? 0);
      }
    } catch {
      /* keep prior state */
    } finally {
      setLoadState('ready');
    }
  };

  useEffect(() => {
    void loadWorkingOrder();
  }, [orderId, reloadNonce]);

  const reExport = async () => {
    if (!platform || (platform !== 'joor' && platform !== 'nuorder')) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      const path =
        platform === 'joor'
          ? '/api/integrations/v1/joor/orders/export'
          : '/api/integrations/v1/nuorder/orders/export';
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wholesaleOrderId: orderId, forceReexport: true }),
      });
      const json = (await res.json()) as {
        data?: { export?: { externalExportId?: string } };
        error?: { message?: string };
      };
      if (res.ok) {
        setExportId(json.data?.export?.externalExportId ?? exportId);
        setExportMsg('Экспорт повторно отправлен во внешний канал.');
        await loadWorkingOrder();
        onExportDone?.();
      } else {
        setExportMsg(json.error?.message ?? 'Не удалось выполнить export.');
      }
    } catch {
      setExportMsg('Ошибка сети при export.');
    } finally {
      setExportBusy(false);
    }
  };

  if (!isIntegrationImportedWholesaleOrderId(orderId)) return null;
  if (loadState === 'loading') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Экспорт…
      </span>
    );
  }

  const canReExport =
    variant === 'brand' && (platform === 'joor' || platform === 'nuorder') && Boolean(exportId);

  return (
    <div
      className="space-y-1.5 rounded-md border border-sky-200/70 bg-sky-50/50 px-2 py-1.5 text-xs"
      data-testid="spine-order-export-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Upload className="h-3.5 w-3.5 text-sky-700" aria-hidden />
        {exportId ? (
          <Badge variant="secondary" className="text-[9px]" data-testid="spine-export-id-badge">
            {integrationPlatformLabelRu(platform ?? '')} · {exportId}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Экспорт после подтверждения брендом</span>
        )}
        {versionCount > 0 ? (
          <Badge variant="outline" className="text-[9px]">
            Рабочий заказ · {versionCount} верс.
          </Badge>
        ) : null}
        <Link
          href={shopB2bWorkingOrderOrderContextHref(orderId)}
          className="text-accent-primary font-medium hover:underline"
          data-testid="spine-working-order-link"
        >
          Рабочий заказ
        </Link>
        <Link href={ROUTES.shop.b2bMatrix} className="text-muted-foreground hover:underline">
          Matrix
        </Link>
        {canReExport ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            disabled={exportBusy}
            onClick={() => void reExport()}
            data-testid="spine-order-reexport-btn"
          >
            {exportBusy ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
            )}
            Повторный экспорт
          </Button>
        ) : null}
      </div>
      {exportMsg ? (
        <p className="text-[10px] text-muted-foreground" data-testid="spine-export-message">
          {exportMsg}
        </p>
      ) : null}
    </div>
  );
}
