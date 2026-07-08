'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  brandAgentRepCrmSegmentsHref,
  brandAgentRepShopPortalHref,
  buildBrandAgentRepTerritoryHints,
  listBrandAgentRepNames,
  type BrandAgentRepTerritoryHint,
} from '@/lib/fashion/brand-agent-rep-oversight';
import { fetchBrandAgentRepLedgerRecords } from '@/lib/fashion/brand-agent-rep-ledger-store';
import { fetchBrandCrmSegments } from '@/lib/b2b/brand-crm-segments-store';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

type Props = {
  collectionId?: string;
};

/** Rep roster × CRM segment regions — territory map overlay. */
export function BrandAgentRepTerritoryPeerStrip({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: Props) {
  const [hints, setHints] = useState<BrandAgentRepTerritoryHint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchBrandAgentRepLedgerRecords(), fetchBrandCrmSegments()]).then(
      ([ledger, crm]) => {
        if (cancelled) return;
        const names = listBrandAgentRepNames(ledger.records);
        setHints(buildBrandAgentRepTerritoryHints(names, crm.segments, collectionId));
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const crmHref = useMemo(() => brandAgentRepCrmSegmentsHref(collectionId), [collectionId]);

  if (loading) {
    return (
      <p className="text-text-muted text-[10px]" data-testid="brand-agent-rep-territory-loading">
        Territory map…
      </p>
    );
  }

  if (!hints.length) {
    return (
      <div className={hubGadget.goldenPath} data-testid="brand-agent-rep-territory-peer-strip">
        <span className="text-text-muted text-[10px]">Нет rep в ledger для territory map.</span>
        <Link
          href={crmHref}
          data-testid="brand-agent-rep-territory-crm-link"
          className={hubGadget.goldenLink}
        >
          Сегменты CRM
        </Link>
      </div>
    );
  }

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-agent-rep-territory-peer-strip">
      {hints.map((hint, index) => (
        <span key={hint.repName} className="contents">
          {index > 0 ? (
            <span className={hubGadget.goldenSep} aria-hidden>
              ·
            </span>
          ) : null}
          <Link
            href={hint.crmSegmentHref}
            className={hubGadget.goldenLink}
            data-testid={`brand-agent-rep-territory-${hint.segmentKey}-link`}
            title={`${hint.repName} → ${hint.segmentNameRu}`}
          >
            {hint.repName}: {hint.regionLabel}
          </Link>
        </span>
      ))}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandAgentRepShopPortalHref()}
        data-testid="brand-agent-rep-territory-shop-portal-link"
        className={hubGadget.goldenLink}
      >
        Shop portal
      </Link>
      <Badge variant="outline" className="text-[9px]">
        {hints.length} rep
      </Badge>
    </div>
  );
}
