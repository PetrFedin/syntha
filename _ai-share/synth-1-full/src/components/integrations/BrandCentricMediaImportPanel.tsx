'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, Loader2 } from 'lucide-react';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

type Props = {
  collectionId?: string;
  articleId?: string;
  compact?: boolean;
  onImportSuccess?: () => void;
};

/** Wave B3 · Centric PXM → linesheet / showroom hero (pillar 2). */
export function BrandCentricMediaImportPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
  compact = false,
  onImportSuccess,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [assetCount, setAssetCount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const importMedia = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const styleId = `CENTRIC-${articleId}`;
      const res = await fetch('/api/integrations/v1/centric/media/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleId, collectionId, articleId }),
      });
      const json = (await res.json()) as {
        data?: { media?: { assets?: unknown[]; heroUrl?: string } };
      };
      if (!res.ok || !json.data?.media) {
        setMsg('PXM import failed');
        return;
      }
      setAssetCount(json.data.media.assets?.length ?? 0);
      setMsg('PXM hero → linesheet + showroom (published-articles overlay)');
      onImportSuccess?.();
    } catch {
      setMsg('Ошибка сети');
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 px-1 text-xs"
        data-testid="brand-sc-centric-pxm-strip"
      >
        <Badge variant="outline" className="text-[9px]">
          PLM · медиа
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px]"
          disabled={busy}
          onClick={() => void importMedia()}
          data-testid="brand-sc-centric-pxm-import-btn"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Синх. медиа'}
        </Button>
        {assetCount > 0 ? (
          <Badge
            variant="secondary"
            className="text-[9px]"
            data-testid="brand-sc-centric-pxm-count"
          >
            {assetCount} assets
          </Badge>
        ) : null}
      </div>
    );
  }

  return (
    <Card data-testid="brand-centric-pxm-import-panel">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <ImageIcon className="h-4 w-4" aria-hidden />
          PLM · медиа
        </CardTitle>
        <CardDescription>Asset → hero на linesheet и витрине магазина.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => void importMedia()}
          data-testid="brand-centric-pxm-import-btn"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Импорт PXM media
        </Button>
        {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
      </CardContent>
    </Card>
  );
}
