'use client';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  factoryId?: string;
};

/** Wave VL · attach sample photo via DAM stub POST. */
export function MfrDevSamplePhotoDamStubStrip({
  collectionId,
  articleId,
  orderId,
  factoryId = 'fact-1',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  const attach = async () => {
    setBusy(true);
    setHint(null);
    try {
      const res = await fetch('/api/workshop2/manufacturer/samples/attach-photo', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          articleId,
          orderId: orderId?.trim(),
          factoryId,
          filename: 'sample-photo-front.jpg',
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        url?: string;
      };
      setHint(json.messageRu ?? (json.ok ? 'Фото прикреплено.' : 'Не удалось прикрепить.'));
      if (json.ok && json.url) setAssetUrl(json.url);
    } catch {
      setHint('Ошибка сети при загрузке в DAM stub.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="mfr-dev-sample-photo-dam-stub-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        DAM stub
      </Badge>
      <ImagePlus className="text-accent-primary h-3.5 w-3.5" aria-hidden />
      <span className="text-text-secondary">Фото образца → DAM (stub POST)</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        disabled={busy}
        data-testid="mfr-dev-sample-photo-dam-stub-btn"
        onClick={() => void attach()}
      >
        {busy ? 'Загрузка…' : 'Прикрепить фото'}
      </Button>
      {hint ? (
        <span
          className="text-text-muted text-[10px]"
          data-testid="mfr-dev-sample-photo-dam-stub-hint"
        >
          {hint}
        </span>
      ) : null}
      {assetUrl ? (
        <span
          className="text-text-muted font-mono text-[9px]"
          data-testid="mfr-dev-sample-photo-dam-stub-url"
        >
          {assetUrl}
        </span>
      ) : null}
    </div>
  );
}
