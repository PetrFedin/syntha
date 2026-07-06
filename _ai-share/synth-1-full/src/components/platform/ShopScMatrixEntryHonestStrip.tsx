'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { shopB2bTrackingOrderHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
};

/** Matrix entry · published badge + tracking when article deep-linked from showroom. */
export function ShopScMatrixEntryHonestStrip({ collectionId, articleId, orderId }: Props) {
  const [published, setPublished] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { ok?: boolean; articles?: { articleId?: string }[] };
        if (cancelled) return;
        const ids = json.ok ? (json.articles ?? []).map((a) => a.articleId) : [];
        setPublished(ids.includes(articleId));
      } catch {
        if (!cancelled) setPublished(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  return (
    <span className="contents">
      {published != null ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Badge
            variant={published ? 'secondary' : 'outline'}
            className="text-[9px] font-semibold uppercase"
            data-testid={`shop-sc-matrix-entry-published-${published ? 'yes' : 'no'}`}
          >
            {published ? 'Опубликовано' : 'Черновик'}
          </Badge>
        </>
      ) : null}
      {orderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={shopB2bTrackingOrderHref(orderId)}
            data-testid="shop-sc-matrix-entry-tracking-link"
            className={hubGadget.goldenLink}
          >
            Трекинг
          </Link>
        </>
      ) : null}
    </span>
  );
}
