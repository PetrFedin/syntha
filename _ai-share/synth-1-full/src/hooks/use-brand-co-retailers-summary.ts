'use client';

import { useEffect, useState } from 'react';

export type BrandCoRetailerSummary = {
  retailerId: string;
  displayNameRu: string;
  orderCount: number;
};

/** PG summary ритейлеров коллекции — для picker «Магазины» и дедупа section list. */
export function useBrandCoRetailersSummary(collectionId: string | null | undefined) {
  const [retailers, setRetailers] = useState<BrandCoRetailerSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cid = collectionId?.trim();
    if (!cid) {
      setRetailers([]);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    void (async () => {
      try {
        const res = await fetch(
          `/api/brand/retailers/b2b-orders-summary?collectionId=${encodeURIComponent(cid)}`
        );
        const json = (await res.json()) as {
          ok?: boolean;
          rows?: BrandCoRetailerSummary[];
        };
        if (!cancelled && json.ok && Array.isArray(json.rows)) {
          setRetailers(json.rows.filter((r) => r.orderCount > 0));
        } else if (!cancelled) {
          setRetailers([]);
        }
      } catch {
        if (!cancelled) setRetailers([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  return {
    retailers,
    loaded,
    multiBuyer: retailers.length > 1,
    activeCount: retailers.length,
  };
}
