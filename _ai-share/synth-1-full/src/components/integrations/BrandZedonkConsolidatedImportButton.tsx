'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Layers } from 'lucide-react';

type Props = {
  consolidatedId: string;
  brandOrders: Array<{ brandId: string; orderId: string; total?: number; source?: string }>;
};

/** Столп 3 · агентская консолидация → child orders в operational registry. */
export function BrandZedonkConsolidatedImportButton({ consolidatedId, brandOrders }: Props) {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const runImport = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/integrations/v1/zedonk/consolidated/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consolidatedId, brandOrders }),
      });
      const json = (await res.json()) as {
        data?: { result?: { imported?: unknown[] } };
      };
      if (!res.ok) {
        setMsg('Ошибка импорта');
        return;
      }
      setCount(json.data?.result?.imported?.length ?? 0);
      setMsg('Дочерние заказы добавлены в реестр B2B');
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid={`zedonk-consolidated-import-${consolidatedId}`}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => void runImport()}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Импорт консолидации
      </Button>
      {count > 0 ? (
        <Badge variant="secondary" className="text-[9px]">
          {count} заказов
        </Badge>
      ) : null}
      {msg ? <span className="text-[10px] text-muted-foreground">{msg}</span> : null}
    </div>
  );
}
