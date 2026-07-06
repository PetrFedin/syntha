'use client';

import { useEffect, useState } from 'react';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { shopB2bOperationalStatusApiPath } from '@/lib/order/shop-b2b-operational-status';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type Result = {
  status: string | null;
  loading: boolean;
  storageMode: string | null;
};

/** Live PG mirror badge for shop CO cabinet (Wave TS). */
export function useShopB2bOperationalStatusMirror(
  orderId: string,
  reloadNonce = 0
): Result {
  const [status, setStatus] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const core = isPlatformCoreMode();
  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(core && Boolean(orderId.trim()));

  useEffect(() => {
    const id = orderId.trim();
    if (!id || !core) {
      setStatus(null);
      setStorageMode(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(shopB2bOperationalStatusApiPath(id), { cache: 'no-store' });
        const json = (await res.json()) as {
          ok?: boolean;
          status?: string | null;
          storageMode?: string;
        };
        if (cancelled) return;
        if (json.ok) {
          setStatus(json.status ?? null);
          setStorageMode(json.storageMode ?? null);
        } else {
          setStatus(null);
          setStorageMode(null);
        }
      } catch {
        if (!cancelled) {
          setStatus(null);
          setStorageMode(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, core, reloadNonce, registryTick]);

  return { status, loading, storageMode };
}
