'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  BRAND_AGENT_REP_COMMISSION_DISPUTE_STORAGE_BADGE_TESTID,
  BRAND_AGENT_REP_SHOP_PORTAL_READONLY_LINK_TESTID,
  BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_LABEL,
  BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_STRIP_TESTID,
  BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_LINK_TESTID,
  BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_RU_LABEL,
  brandAgentRepShopPortalReadOnlyLinkHref,
  brandAgentRepShopRepPayoutPeerHref,
} from '@/lib/b2b/brand-agent-rep-wave-wx';
import { fetchBrandAgentRepCommissionDisputes } from '@/lib/fashion/brand-agent-rep-commission-dispute-store';

type Props = {
  collectionId?: string;
  repId?: string;
};

/** Wave WX: brand read-only shop portal link strip (RU) + dispute PG honesty + shop rep payout peer. */
export function BrandAgentRepShopPortalReadOnlyRuStrip({ collectionId, repId }: Props) {
  const [disputeCount, setDisputeCount] = useState(0);
  const [storageMode, setStorageMode] = useState<string>('…');
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBrandAgentRepCommissionDisputes();
      setDisputeCount(res.disputes.length);
      setStorageMode(res.storageMode ?? 'memory');
      setMessageRu(res.messageRu ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const readonlyHref = brandAgentRepShopPortalReadOnlyLinkHref();
  const payoutHref = brandAgentRepShopRepPayoutPeerHref({ collectionId, repId });

  return (
    <div className={hubGadget.goldenPath} data-testid={BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_STRIP_TESTID}>
      <Badge variant="outline" className="text-[9px] uppercase">
        Brand rep · WX
      </Badge>
      <Link
        href={readonlyHref}
        data-testid={BRAND_AGENT_REP_SHOP_PORTAL_READONLY_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_LABEL}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={payoutHref}
        data-testid={BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_RU_LABEL}
      </Link>
      {loading ? (
        <span className="text-text-muted text-[10px]">Загрузка споров…</span>
      ) : (
        <>
          <Badge
            variant={storageMode === 'postgres' ? 'secondary' : 'outline'}
            data-testid={BRAND_AGENT_REP_COMMISSION_DISPUTE_STORAGE_BADGE_TESTID}
          >
            Споры: {disputeCount} · {storageMode === 'postgres' ? 'PG' : storageMode}
          </Badge>
          {messageRu ? (
            <span className="text-text-muted text-[10px]" data-testid="brand-agent-rep-dispute-message-ru">
              {messageRu}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
