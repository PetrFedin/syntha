'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';

type Props = {
  orderId: string;
  brandConfirmed: boolean;
  reloadNonce?: number;
};

/** Wave C2 · compact export chip inside brand chain card (pillar 3). */
export function BrandChainSpineExportChip({ orderId, brandConfirmed, reloadNonce = 0 }: Props) {
  const [exportId, setExportId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isIntegrationImportedWholesaleOrderId(orderId) || !brandConfirmed) {
      setExportId(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/integrations/v1/working-order/${encodeURIComponent(orderId)}`,
          { cache: 'no-store' }
        );
        const json = (await res.json()) as {
          data?: { export?: { externalExportId?: string; platform?: string } | null };
        };
        if (!cancelled && res.ok) {
          setExportId(json.data?.export?.externalExportId ?? null);
          setPlatform(json.data?.export?.platform ?? null);
        }
      } catch {
        if (!cancelled) {
          setExportId(null);
          setPlatform(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, brandConfirmed, reloadNonce]);

  const reExport = async () => {
    if (!platform || (platform !== 'joor' && platform !== 'nuorder')) return;
    setBusy(true);
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
      };
      if (res.ok) setExportId(json.data?.export?.externalExportId ?? exportId);
    } finally {
      setBusy(false);
    }
  };

  if (!isIntegrationImportedWholesaleOrderId(orderId) || !brandConfirmed) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-sky-200/60 bg-sky-50/40 px-2 py-1.5"
      data-testid="brand-chain-spine-export-chip"
    >
      {exportId ? (
        <Badge variant="secondary" className="text-[9px]" data-testid="brand-chain-export-badge">
          {platform} · {exportId}
        </Badge>
      ) : (
        <span className="text-[10px] text-muted-foreground">Spine export после confirm</span>
      )}
      {exportId && (platform === 'joor' || platform === 'nuorder') ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 px-1.5 text-[10px]"
          disabled={busy}
          onClick={() => void reExport()}
          data-testid="brand-chain-reexport-btn"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-3 w-3" aria-hidden />
          )}
        </Button>
      ) : null}
    </div>
  );
}
