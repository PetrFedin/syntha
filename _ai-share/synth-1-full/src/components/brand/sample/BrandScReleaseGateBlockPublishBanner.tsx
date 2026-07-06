'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';
import {
  BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU,
  BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_TESTID,
} from '@/lib/production/wave-wq-release-gate-block-publish';

type Props = {
  collectionId: string;
};

/** Wave WQ · RU banner when passport blocks SC publish (showroom / linesheet). */
export function BrandScReleaseGateBlockPublishBanner({ collectionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(true);
  const [messageRu, setMessageRu] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const gate = await fetchBrandScReleaseGateCheck(collectionId);
      setBlocked(gate.blocked);
      setMessageRu(gate.messageRu);
    } catch {
      setBlocked(true);
      setMessageRu(BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (loading || !blocked) return null;

  return (
    <p
      className="rounded border border-rose-200/80 bg-rose-50/70 px-2 py-1.5 text-[10px] text-rose-950"
      data-testid={BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_TESTID}
    >
      {messageRu || BRAND_SC_RELEASE_GATE_BLOCK_PUBLISH_BANNER_RU}
    </p>
  );
}
