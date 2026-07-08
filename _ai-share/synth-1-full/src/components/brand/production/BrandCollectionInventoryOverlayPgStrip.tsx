'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_TESTID,
  BRAND_COLLECTION_INVENTORY_OVERLAY_LOADING_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_MERGE_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_TESTID,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_RU,
  BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_TESTID,
  BRAND_COLLECTION_INVENTORY_OVERLAY_STRIP_TESTID,
  buildBrandCollectionInventoryLedgerWmsHref,
} from '@/lib/platform/wave-yb-brand-inventory-overlay-pg';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
  overlayCount: number;
  persistMode: 'postgres' | 'localStorage' | 'unavailable';
  pgUnavailable: boolean;
  loading?: boolean;
};

/** Wave YB: PG overlay badge + cross-link to brand inventory ledger WMS reserve strip. */
export function BrandCollectionInventoryOverlayPgStrip({
  collectionId,
  orderId,
  overlayCount,
  persistMode,
  pgUnavailable,
  loading = false,
}: Props) {
  const [coreMode, setCoreMode] = useState(false);

  useEffect(() => {
    setCoreMode(isPlatformCoreMode());
  }, []);

  if (!coreMode) return null;

  const ledgerHref = buildBrandCollectionInventoryLedgerWmsHref({
    collectionId,
    orderId,
  });

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 mb-4 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid={BRAND_COLLECTION_INVENTORY_OVERLAY_STRIP_TESTID}
    >
      {loading ? (
        <span className="text-text-muted inline-flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          {BRAND_COLLECTION_INVENTORY_OVERLAY_LOADING_RU}
        </span>
      ) : persistMode === 'postgres' && !pgUnavailable ? (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-900"
          data-testid={BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_TESTID}
        >
          {BRAND_COLLECTION_INVENTORY_OVERLAY_PG_BADGE_RU}
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-[10px] text-amber-900"
          data-testid={BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_TESTID}
        >
          {BRAND_COLLECTION_INVENTORY_OVERLAY_PG_UNAVAILABLE_RU}
        </Badge>
      )}
      <span className="text-text-secondary">{BRAND_COLLECTION_INVENTORY_OVERLAY_MERGE_RU}</span>
      <Badge variant="secondary" className="text-[10px]">
        overlay: {overlayCount}
      </Badge>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={ledgerHref}
        data-testid={BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_COLLECTION_INVENTORY_OVERLAY_LEDGER_LINK_RU}
      </Link>
    </div>
  );
}
