'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { attachWorkshop2TzBundleToArticleChat } from '@/lib/production/workshop2-tz-attach-to-chat-client';
import { attachFactoryCommsEntityThreadTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz-store';

type Props = {
  variant: 'manufacturer' | 'supplier';
};

/** Compose strip: attach TZ / BOM export from dossier into contextual chat. */
export function FactoryCommsAttachTzComposeStrip({ variant }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = getPlatformCoreDemo(collectionId);
  const articleId =
    searchParams.get('articleId')?.trim() ||
    searchParams.get('article')?.trim() ||
    demo.demoArticleId;
  const [busy, setBusy] = useState<'tz' | 'bom' | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  if (!collectionId || !articleId) return null;

  const attachTz = async () => {
    setBusy('tz');
    setHint(null);
    if (variant === 'manufacturer') {
      const res = await attachWorkshop2TzBundleToArticleChat({ collectionId, articleId });
      setHint(res.ok ? 'ТЗ прикреплено к чату артикула' : (res.message ?? 'Не удалось прикрепить'));
    } else {
      const res = await attachFactoryCommsEntityThreadTz({
        variant: 'supplier',
        collectionId,
        articleId,
        threadKind: 'bom',
      });
      setHint(res.ok ? 'BOM прикреплён к треду' : 'Не удалось прикрепить BOM');
    }
    setBusy(null);
  };

  const attachBom = async () => {
    setBusy('bom');
    setHint(null);
    const res = await attachFactoryCommsEntityThreadTz({
      variant,
      collectionId,
      articleId,
      threadKind: 'bom',
    });
    setHint(res.ok ? 'BOM прикреплён к треду' : 'Не удалось прикрепить BOM');
    setBusy(null);
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/60 px-2 py-1.5 text-[11px]"
      data-testid="factory-comms-attach-tz-compose-strip"
      data-comms-variant={variant}
    >
      <Paperclip className="h-3 w-3 text-emerald-700" aria-hidden />
      <span className="text-text-secondary">
        Dossier · {collectionId}/{articleId}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        disabled={busy != null}
        onClick={() => void attachTz()}
        data-testid="factory-comms-attach-tz-compose-cta"
      >
        {busy === 'tz' ? '…' : variant === 'supplier' ? 'Attach BOM' : 'Attach TZ'}
      </Button>
      {variant === 'manufacturer' ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={busy != null}
          onClick={() => void attachBom()}
          data-testid="factory-comms-attach-bom-compose-cta"
        >
          {busy === 'bom' ? '…' : 'Attach BOM'}
        </Button>
      ) : null}
      {hint ? (
        <span className="text-text-muted" data-testid="factory-comms-attach-tz-compose-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
