'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { fetchBrandPackRules } from '@/lib/fashion/brand-pack-rules-store';
import { buildBrandPackRulesSession } from '@/lib/fashion/brand-pack-rules-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId?: string;
  orderId?: string;
};

/** PG case-pack count → honest CTA shop matrix prepack apply. */
export function BrandPackRulesPrepackMatrixHonestyStrip({ collectionId, orderId }: Props) {
  const session = useMemo(
    () => buildBrandPackRulesSession({ collectionId, orderId }),
    [collectionId, orderId]
  );
  const [casePackSkus, setCasePackSkus] = useState(0);
  const [moqSkus, setMoqSkus] = useState(0);
  const [storageMode, setStorageMode] = useState('demo');

  useEffect(() => {
    void fetchBrandPackRules(session.collectionId).then((res) => {
      const rows = res.rows ?? [];
      setCasePackSkus(rows.filter((row) => row.casePack != null && row.casePack > 0).length);
      setMoqSkus(rows.filter((row) => row.moq != null && row.moq > 0).length);
      setStorageMode(res.storageMode ?? 'demo');
    });
  }, [session.collectionId]);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-pack-rules-prepack-matrix-honesty-strip">
      <Badge variant="outline" data-testid={`brand-pack-rules-prepack-source-${storageMode}`}>
        {storageMode === 'pg' ? 'PG pack rules' : `${storageMode} pack rules`}
      </Badge>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <span className="text-text-secondary text-[10px]" data-testid="brand-pack-rules-prepack-case-count">
        {casePackSkus} SKU case pack · {moqSkus} MOQ
      </span>
      <Link
        href={session.shopMatrixPrepackHref}
        data-testid="brand-pack-rules-prepack-matrix-apply-link"
        className={hubGadget.goldenLink}
      >
        Shop pre-pack apply
      </Link>
    </div>
  );
}
