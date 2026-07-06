'use client';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  shouldPersistWorkshop2ClientOverlayToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';
import type { RangePlannerTier } from '@/lib/production/workshop2-range-planner-bridge';
import { rangePlannerOverlayConflictSummaryRu } from '@/lib/production/wave-xg-brand-range-planner';

export const RANGE_PLANNER_TIER_LABEL_RU: Record<RangePlannerTier, string> = {
  core: 'Базовый',
  trend: 'Тренд',
  novelty: 'Новинки',
};
import type {
  DevelopmentStatusRangePlannerPayload,
  RangePlannerPgSnapshot,
} from '@/lib/production/workshop2-range-planner-pg';

export const WORKSHOP2_RANGE_PLANNER_OVERLAY_STORAGE_KEY =
  'synth.brand.workshop2RangePlannerOverlay.v1';

const STORAGE_KEY = WORKSHOP2_RANGE_PLANNER_OVERLAY_STORAGE_KEY;

export const WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API =
  '/api/workshop2/range-planner/bulk-tier-assign' as const;

export type RangePlannerOverlayTier = {
  id: RangePlannerTier;
  budget: number;
  targetMargin: number;
  planSkuCount: number;
  pgSkuCount: number;
  budgetFromPg?: boolean;
};

export type RangePlannerOverlayDoc = {
  v: 1;
  collectionId: string;
  tiers: RangePlannerOverlayTier[];
  dataSource: RangePlannerPgSnapshot['dataSource'];
  tiersFromPg: boolean;
  budgetFromPg: boolean;
  articleCount: number;
  syncedFromPgAt: string;
};

export type RangePlannerOverlayMap = Record<string, RangePlannerOverlayDoc>;

function safeSegment(id: string): string {
  return id.replace(/:/g, '_');
}

export function workshop2RangePlannerOverlayKey(collectionId: string): string {
  return safeSegment(collectionId.trim());
}

export function loadWorkshop2RangePlannerOverlayMap(): RangePlannerOverlayMap {
  if (typeof window === 'undefined') return {};
  if (!shouldUseLocalStorageClientFallbackInCore()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as RangePlannerOverlayMap;
  } catch {
    return {};
  }
}

export function saveWorkshop2RangePlannerOverlayMap(map: RangePlannerOverlayMap): boolean {
  if (typeof window === 'undefined') return true;
  if (!shouldPersistWorkshop2ClientOverlayToLocalStorage()) return true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

export function overlayDocFromPgSnapshot(snapshot: RangePlannerPgSnapshot): RangePlannerOverlayDoc {
  return {
    v: 1,
    collectionId: snapshot.collectionId,
    tiers: snapshot.tiers.map((row) => ({
      id: row.id,
      budget: row.budget,
      targetMargin: row.targetMargin,
      planSkuCount: row.planSkuCount,
      pgSkuCount: row.pgSkuCount,
      ...(row.budgetFromPg ? { budgetFromPg: true } : {}),
    })),
    dataSource: snapshot.dataSource,
    tiersFromPg: snapshot.tiersFromPg,
    budgetFromPg: snapshot.budgetFromPg,
    articleCount: snapshot.articleCount,
    syncedFromPgAt: new Date().toISOString(),
  };
}

export function syncRangePlannerOverlayFromPgSnapshot(snapshot: RangePlannerPgSnapshot): boolean {
  const key = workshop2RangePlannerOverlayKey(snapshot.collectionId);
  const map = loadWorkshop2RangePlannerOverlayMap();
  const doc = overlayDocFromPgSnapshot(snapshot);
  map[key] = doc;
  const savedLocal = saveWorkshop2RangePlannerOverlayMap(map);
  if (isPlatformCoreMode()) {
    void persistRangePlannerOverlayToServer(doc);
  }
  return savedLocal;
}

/** Wave S · PG persist overlay (core mode — без dual-write как SoT). */
export async function persistRangePlannerOverlayToServer(
  doc: RangePlannerOverlayDoc
): Promise<'pg' | 'local' | 'error'> {
  if (!isPlatformCoreMode()) return 'local';
  try {
    const res = await fetch('/api/brand/range-planner/overlay', {
      method: 'PUT',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionId: doc.collectionId, overlay: doc }),
    });
    if (!res.ok) return 'error';
    const json = (await res.json()) as { storageMode?: string };
    return json.storageMode === 'postgres' || json.storageMode === 'pg' ? 'pg' : 'local';
  } catch {
    return 'error';
  }
}

export async function fetchRangePlannerOverlayFromServer(
  collectionId: string
): Promise<RangePlannerOverlayDoc | null> {
  const cid = collectionId.trim();
  if (!cid || !isPlatformCoreMode()) return null;
  try {
    const res = await fetch(
      `/api/brand/range-planner/overlay?collectionId=${encodeURIComponent(cid)}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    );
    const json = (await res.json()) as { overlay?: RangePlannerOverlayDoc | null };
    if (!res.ok || !json.overlay) return null;
    if (shouldPersistWorkshop2ClientOverlayToLocalStorage()) {
      const key = workshop2RangePlannerOverlayKey(cid);
      const map = loadWorkshop2RangePlannerOverlayMap();
      map[key] = json.overlay;
      saveWorkshop2RangePlannerOverlayMap(map);
    }
    return json.overlay;
  } catch {
    return null;
  }
}

export type RangePlannerOverlayConflictTier = {
  tierId: RangePlannerTier;
  labelRu: string;
  pgSkuCount: number;
  localPgSkuCount: number;
  planSkuCount: number;
  localPlanSkuCount: number;
};

export type RangePlannerOverlayConflict = {
  hasConflict: boolean;
  summaryRu: string;
  tiers: RangePlannerOverlayConflictTier[];
  syncedFromPgAt?: string;
};

/** Сравнение PG snapshot vs локальный overlay — banner при расхождении tier counts. */
export function detectRangePlannerOverlayConflict(
  snapshot: RangePlannerPgSnapshot | null | undefined,
  overlay: RangePlannerOverlayDoc | undefined
): RangePlannerOverlayConflict {
  if (!snapshot?.tiersFromPg || !overlay?.tiersFromPg) {
    return { hasConflict: false, summaryRu: '', tiers: [] };
  }
  if (snapshot.collectionId.trim() !== overlay.collectionId.trim()) {
    return { hasConflict: false, summaryRu: '', tiers: [] };
  }
  const tiers: RangePlannerOverlayConflictTier[] = [];
  for (const tier of snapshot.tiers) {
    const local = overlay.tiers.find((t) => t.id === tier.id);
    if (!local) continue;
    if (local.pgSkuCount !== tier.pgSkuCount || local.planSkuCount !== tier.planSkuCount) {
      tiers.push({
        tierId: tier.id,
        labelRu: RANGE_PLANNER_TIER_LABEL_RU[tier.id] ?? tier.id,
        pgSkuCount: tier.pgSkuCount,
        localPgSkuCount: local.pgSkuCount,
        planSkuCount: tier.planSkuCount,
        localPlanSkuCount: local.planSkuCount,
      });
    }
  }
  if (tiers.length === 0) {
    return { hasConflict: false, summaryRu: '', tiers: [] };
  }
  const tierLabels = tiers.map(
    (row) => RANGE_PLANNER_TIER_LABEL_RU[row.tierId] ?? row.tierId
  );
  return {
    hasConflict: true,
    summaryRu: rangePlannerOverlayConflictSummaryRu(tierLabels),
    tiers,
    syncedFromPgAt: overlay.syncedFromPgAt,
  };
}

/** Overlay годен для hub/stats только если совпадает коллекция и tiers пришли из PG. */
export function isRangePlannerOverlayAuthoritative(
  doc: RangePlannerOverlayDoc | undefined,
  collectionId: string
): doc is RangePlannerOverlayDoc {
  if (!doc) return false;
  const cid = collectionId.trim();
  if (!cid || doc.collectionId.trim() !== cid) return false;
  return doc.tiersFromPg === true && Boolean(doc.syncedFromPgAt?.trim());
}

export function getRangePlannerOverlayForCollection(
  collectionId: string,
  opts?: { authoritativeOnly?: boolean }
): RangePlannerOverlayDoc | undefined {
  const key = workshop2RangePlannerOverlayKey(collectionId);
  const doc = loadWorkshop2RangePlannerOverlayMap()[key];
  if (opts?.authoritativeOnly && !isRangePlannerOverlayAuthoritative(doc, collectionId)) {
    return undefined;
  }
  return doc;
}

/** Подтягивает development-status и синхронизирует tier overlay в localStorage. */
export async function syncRangePlannerOverlayFromDevelopmentStatus(
  collectionId: string
): Promise<RangePlannerOverlayDoc | null> {
  const cid = collectionId.trim();
  if (!cid) return null;
  const res = await fetch(
    `/api/workshop2/collections/${encodeURIComponent(cid)}/development-status`,
    { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
  );
  const json = (await res.json()) as {
    ok?: boolean;
    status?: DevelopmentStatusRangePlannerPayload;
  };
  if (!res.ok || !json.ok || !json.status?.rangePlanner) return null;
  const doc = overlayDocFromPgSnapshot(json.status.rangePlanner);
  const key = workshop2RangePlannerOverlayKey(cid);
  const map = loadWorkshop2RangePlannerOverlayMap();
  map[key] = doc;
  saveWorkshop2RangePlannerOverlayMap(map);
  if (isPlatformCoreMode()) {
    await persistRangePlannerOverlayToServer(doc);
  }
  return doc;
}
