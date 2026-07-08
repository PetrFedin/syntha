'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PlatformCoreThemeBridge } from '@/components/platform/PlatformCoreThemeBridge';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import {
  getPlatformCoreDemo,
  mergePlatformCoreDemoWithActiveOrder,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import type {
  CoreChainRoleId,
  CoreHubPillarId,
  PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';

export type ChainPillarSnap = {
  id: CoreHubPillarId;
  title: string;
  done: boolean;
  detailRu: string;
  primaryHref: string;
};

export type ChainRoleSnap = {
  id: CoreChainRoleId;
  label: string;
  landingHref: string;
  activePillarCount: number;
  participatesIn: CoreHubPillarId[];
};

export type PlatformCoreChainOverviewState = {
  collectionId: string;
  demoOrderId: string;
  demoArticleId: string;
  demoBuyerId?: string;
  pillars: ChainPillarSnap[];
  roles: ChainRoleSnap[];
  commsThreadCount: number;
};

export type PlatformCoreOverviewStatus = 'loading' | 'ready' | 'error';

export type PlatformCoreChainOverviewValue = {
  overview: PlatformCoreChainOverviewState | null;
  overviewStatus: PlatformCoreOverviewStatus;
  collectionId: string;
  demo: PlatformCoreDemoContext;
  pillarDone: (pillarId: CoreHubPillarId) => boolean | null;
};

const overviewCache = new Map<string, PlatformCoreChainOverviewState | null>();
const inflightRequests = new Map<
  string,
  Promise<{ overview: PlatformCoreChainOverviewState | null; status: 'ready' | 'error' }>
>();

/** Сброс client cache после checkout / confirm — hub сразу видит PG order. */
export function invalidateClientChainOverviewCache(collectionId?: string): void {
  const cid = collectionId?.trim();
  if (cid) {
    overviewCache.delete(cid);
    inflightRequests.delete(cid);
    return;
  }
  overviewCache.clear();
  inflightRequests.clear();
}

const ChainOverviewContext = createContext<PlatformCoreChainOverviewValue | null>(null);

async function fetchPlatformCoreChainOverview(
  collectionId: string
): Promise<{ overview: PlatformCoreChainOverviewState | null; status: 'ready' | 'error' }> {
  if (overviewCache.has(collectionId)) {
    const cached = overviewCache.get(collectionId) ?? null;
    return { overview: cached, status: cached ? 'ready' : 'error' };
  }

  let promise = inflightRequests.get(collectionId);
  if (!promise) {
    promise = (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/platform-core/chain-overview?collectionId=${encodeURIComponent(collectionId)}`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          overview?: PlatformCoreChainOverviewState;
        };
        const result = json.ok && json.overview ? json.overview : null;
        overviewCache.set(collectionId, result);
        return { overview: result, status: result ? 'ready' : 'error' } as const;
      } catch {
        overviewCache.set(collectionId, null);
        return { overview: null, status: 'error' } as const;
      } finally {
        inflightRequests.delete(collectionId);
      }
    })();
    inflightRequests.set(collectionId, promise);
  }

  return promise;
}

function useChainOverviewState(
  collectionId = PLATFORM_CORE_DEMO.collectionId
): PlatformCoreChainOverviewValue {
  const [overview, setOverview] = useState<PlatformCoreChainOverviewState | null>(
    () => overviewCache.get(collectionId) ?? null
  );
  const [overviewStatus, setOverviewStatus] = useState<PlatformCoreOverviewStatus>(() =>
    overviewCache.has(collectionId)
      ? overviewCache.get(collectionId)
        ? 'ready'
        : 'error'
      : 'loading'
  );

  useEffect(() => {
    let cancelled = false;
    if (!overviewCache.has(collectionId)) {
      setOverviewStatus('loading');
    }
    fetchPlatformCoreChainOverview(collectionId).then((result) => {
      if (!cancelled) {
        setOverview(result.overview);
        setOverviewStatus(result.status);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const demo = useMemo(
    () =>
      mergePlatformCoreDemoWithActiveOrder(
        getPlatformCoreDemo(collectionId),
        overview?.demoOrderId,
        overview?.demoBuyerId
      ),
    [collectionId, overview?.demoOrderId, overview?.demoBuyerId]
  );

  return useMemo(
    () => ({
      overview,
      overviewStatus,
      collectionId,
      demo,
      pillarDone: (pillarId: CoreHubPillarId): boolean | null => {
        const snap = overview?.pillars.find((p) => p.id === pillarId);
        return snap ? snap.done : null;
      },
    }),
    [overview, overviewStatus, collectionId, demo]
  );
}

export function PlatformCoreChainOverviewProvider({
  children,
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: {
  children: ReactNode;
  collectionId?: string;
}) {
  const value = useChainOverviewState(collectionId);
  return <ChainOverviewContext.Provider value={value}>{children}</ChainOverviewContext.Provider>;
}

export function usePlatformCoreChainOverview(
  collectionId = PLATFORM_CORE_DEMO.collectionId
): PlatformCoreChainOverviewValue {
  const ctx = useContext(ChainOverviewContext);
  if (ctx) return ctx;
  return useChainOverviewState(collectionId);
}

/** Demo SS27/FW27 из provider или fallback. */
export function usePlatformCoreDemoContext(): PlatformCoreDemoContext {
  return usePlatformCoreChainOverview().demo;
}

/** Единый provider chain-overview + theme bridge для всех Platform Core chrome-слоёв. */
export function PlatformCoreChromeShell({
  children,
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: {
  children: ReactNode;
  collectionId?: string;
}) {
  return (
    <PlatformCoreChainOverviewProvider collectionId={collectionId}>
      <PlatformCoreThemeBridge />
      {children}
    </PlatformCoreChainOverviewProvider>
  );
}
