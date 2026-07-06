'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  BRAND_CO_REGISTRY_AMEND_QUEUE_COUNT_TESTID,
  BRAND_CO_REGISTRY_AMEND_QUEUE_EMPTY_RU,
  BRAND_CO_REGISTRY_AMEND_QUEUE_STRIP_TESTID,
  BRAND_CO_REGISTRY_AMEND_QUEUE_SUMMARY_RU,
  brandCoRegistryAmendDetailHref,
  brandCoRegistryAmendmentsApiPath,
} from '@/lib/b2b/brand-co-registry-amend-wl';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  partner?: string;
  reloadNonce?: number;
};

type PendingRow = {
  orderId: string;
  amendmentId: string;
  noteRu?: string;
};

export function BrandCoRegistryAmendQueueStrip({ collectionId, partner, reloadNonce = 0 }: Props) {
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          brandCoRegistryAmendmentsApiPath(collectionId, partner),
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as { ok?: boolean; pending?: PendingRow[] };
        if (!cancelled) {
          setPending(json.ok && Array.isArray(json.pending) ? json.pending : []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setPending([]);
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, partner, reloadNonce]);

  if (!loaded) return null;

  return (
    <div
      className={hubGadget.goldenPath + ' mb-3'}
      data-testid={BRAND_CO_REGISTRY_AMEND_QUEUE_STRIP_TESTID}
    >
      <span className="text-text-secondary text-[11px] font-medium">
        {BRAND_CO_REGISTRY_AMEND_QUEUE_SUMMARY_RU}
      </span>
      <Badge
        variant="outline"
        className="border-amber-200 bg-amber-50 text-[10px] text-amber-900"
        data-testid={BRAND_CO_REGISTRY_AMEND_QUEUE_COUNT_TESTID}
      >
        {pending.length}
      </Badge>
      {pending.length === 0 ? (
        <span className="text-text-muted text-[11px]">{BRAND_CO_REGISTRY_AMEND_QUEUE_EMPTY_RU}</span>
      ) : (
        pending.slice(0, 3).map((row) => (
          <Fragment key={`${row.orderId}:${row.amendmentId}`}>
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
            <Link
              href={brandCoRegistryAmendDetailHref(row.orderId)}
              data-testid="brand-co-registry-amend-detail-link"
              className={hubGadget.goldenLink}
            >
              {row.orderId} →
            </Link>
          </Fragment>
        ))
      )}
    </div>
  );
}
