'use client';

import { useCallback, useEffect, useState } from 'react';

/** Wave 57/58: offline pack → IndexedDB queue → replay cart POST when online. */
export const WORKSHOP2_B2B_OFFLINE_QUEUE_KEY = 'b2b-offline-queue';
const IDB_NAME = 'b2b-offline-db';
const IDB_VERSION = 1;
const IDB_STORE = 'queue';

export type Workshop2B2bOfflineQueueItem = {
  id: string;
  createdAt: string;
  kind: 'cart_line' | 'cart_submit';
  repId: string;
  payload: Record<string, unknown>;
};

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function idbReadAll(): Promise<Workshop2B2bOfflineQueueItem[]> {
  if (typeof indexedDB === 'undefined') return readLegacyLocalQueue();
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result ?? []) as Workshop2B2bOfflineQueueItem[]);
    req.onerror = () => reject(req.error);
  });
}

async function idbWriteAll(items: Workshop2B2bOfflineQueueItem[]): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    writeLegacyLocalQueue(items);
    return;
  }
  const db = await openOfflineDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const clearReq = store.clear();
    clearReq.onsuccess = () => {
      for (const item of items) store.put(item);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function readLegacyLocalQueue(): Workshop2B2bOfflineQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WORKSHOP2_B2B_OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Workshop2B2bOfflineQueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeLegacyLocalQueue(items: Workshop2B2bOfflineQueueItem[]): void {
  localStorage.setItem(WORKSHOP2_B2B_OFFLINE_QUEUE_KEY, JSON.stringify(items));
}

async function migrateLegacyQueueToIdb(): Promise<void> {
  const legacy = readLegacyLocalQueue();
  if (!legacy.length || typeof indexedDB === 'undefined') return;
  const existing = await idbReadAll();
  if (existing.length === 0) {
    await idbWriteAll(legacy);
    localStorage.removeItem(WORKSHOP2_B2B_OFFLINE_QUEUE_KEY);
  }
}

export async function getWorkshop2B2bOfflineQueueCount(): Promise<number> {
  await migrateLegacyQueueToIdb();
  const items = await idbReadAll();
  return items.length;
}

/** Sync read for legacy callers — prefers IDB count after microtask (best-effort). */
export function getWorkshop2B2bOfflineQueueCountSync(): number {
  return readLegacyLocalQueue().length;
}

type Props = {
  repId: string;
  brandId?: string;
  onQueueChange?: (count: number) => void;
};

/** Fetches offline-pack, stores actions in IndexedDB queue; replays when navigator.onLine. */
export function B2bRepOfflineSyncClient({ repId, brandId, onQueueChange }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [toastRu, setToastRu] = useState<string | null>(null);

  const notify = useCallback(
    async (count?: number) => {
      const n = count ?? (await getWorkshop2B2bOfflineQueueCount());
      setQueueCount(n);
      onQueueChange?.(n);
    },
    [onQueueChange]
  );

  const replayQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const queue = await idbReadAll();
    if (!queue.length) {
      await notify(0);
      return;
    }
    setSyncing(true);
    const remaining: Workshop2B2bOfflineQueueItem[] = [];
    for (const item of queue) {
      const url =
        item.kind === 'cart_submit'
          ? '/api/shop/b2b/orders/submit'
          : '/api/shop/b2b/cart/lines';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repId, ...item.payload }),
        });
        if (!res.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    await idbWriteAll(remaining);
    const synced = queue.length - remaining.length;
    if (synced > 0) {
      setToastRu(`Синхронизировано ${synced} действий из очереди офлайн.`);
      window.setTimeout(() => setToastRu(null), 4000);
    }
    await notify(remaining.length);
    setSyncing(false);
  }, [notify, repId]);

  const prefetchOfflinePack = useCallback(async () => {
    const qs = new URLSearchParams({ repId });
    if (brandId) qs.set('brandId', brandId);
    try {
      const res = await fetch(`/api/shop/b2b/rep/offline-pack?${qs.toString()}`);
      if (!res.ok) return;
      const json = (await res.json()) as { pack?: Record<string, unknown> };
      if (!json.pack) return;
      const queue = await idbReadAll();
      queue.push({
        id: `pack-${Date.now()}`,
        createdAt: new Date().toISOString(),
        kind: 'cart_line',
        repId,
        payload: { offlinePack: json.pack, brandId },
      });
      await idbWriteAll(queue);
      await notify(queue.length);
    } catch {
      /* offline — queue stays as-is */
    }
  }, [brandId, notify, repId]);

  useEffect(() => {
    void migrateLegacyQueueToIdb().then(() => notify());
    void prefetchOfflinePack();
  }, [notify, prefetchOfflinePack]);

  useEffect(() => {
    const onOnline = () => void replayQueue();
    window.addEventListener('online', onOnline);
    if (navigator.onLine) void replayQueue();
    return () => window.removeEventListener('online', onOnline);
  }, [replayQueue]);

  if (queueCount === 0 && !toastRu && !syncing) return null;

  return (
    <div
      className="border-sky-200 bg-sky-50 text-sky-950 mb-3 rounded-lg border px-3 py-2 text-xs"
      data-testid="b2b-rep-offline-queue-banner"
      role="status"
    >
      <span className="font-semibold">Офлайн очередь</span>
      {' — '}
      {syncing
        ? 'Синхронизация…'
        : `${queueCount} действий в IndexedDB (b2b-offline-db v1). При online — replay cart API.`}
      {toastRu ? (
        <span className="mt-1 block font-medium text-emerald-800" data-testid="b2b-rep-offline-sync-toast">
          {toastRu}
        </span>
      ) : null}
    </div>
  );
}
