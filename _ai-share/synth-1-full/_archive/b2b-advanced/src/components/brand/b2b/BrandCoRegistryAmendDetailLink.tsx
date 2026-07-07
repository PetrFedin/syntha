'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { brandB2bOrderHref } from '@/lib/routes';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
};

/** Brand registry context: CTA на карточку заказа при pending amend. */
export function BrandCoRegistryAmendDetailLink({ orderId }: Props) {
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const id = orderId.trim();
    if (!id) {
      setHasPending(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/workshop2/b2b/orders/${encodeURIComponent(id)}/amendments`, {
          headers: buildWorkshop2ApiRequestHeaders(),
          cache: 'no-store',
        });
        const json = (await res.json()) as { ok?: boolean; pending?: unknown };
        if (!cancelled) setHasPending(Boolean(json.ok && json.pending));
      } catch {
        if (!cancelled) setHasPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!hasPending) return null;

  return (
    <>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandB2bOrderHref(orderId)}
        data-testid="brand-co-registry-amend-detail-link"
        className={hubGadget.goldenLink}
      >
        Заявка на изменение →
      </Link>
    </>
  );
}
