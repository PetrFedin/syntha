/**
 * Block C / Wave 46 (#68): offline PUT queue для PWA инспектора — capture → flush → PG.
 */
import type { Workshop2InspectorReportDto } from '@/lib/production/workshop2-inspector-report-client';

export type Workshop2InspectorOfflineQueueEntry = {
  id: string;
  collectionId: string;
  articleId: string;
  sampleOrderId: string;
  checkedItemIds: string[];
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
};

export type Workshop2InspectorOfflineFlushFailureReason = 'network' | 'http' | 'pg_unavailable';

export type Workshop2InspectorOfflineFlushResult =
  | { ok: true; report: Workshop2InspectorReportDto; entryId: string }
  | {
      ok: false;
      entryId: string;
      reason: Workshop2InspectorOfflineFlushFailureReason;
      status?: number;
    };

const MAX_ATTEMPTS = 5;
const RETRY_BASE_MS = 400;

type SaveFn = (input: {
  collectionId: string;
  articleId: string;
  sampleOrderId: string;
  checkedItemIds: string[];
  offlineReplay?: boolean;
}) => Promise<{ ok: boolean; report?: Workshop2InspectorReportDto; status?: number }>;

/** In-memory store (Jest + SSR); в браузере — sessionStorage fallback. */
let memoryQueue: Workshop2InspectorOfflineQueueEntry[] = [];

const QUEUE_STORAGE_KEY = 'synth.w2.inspectorOfflineQueue.v1';
const IDB_NAME = 'synth.w2.inspectorOfflineQueue';
const IDB_STORE = 'queue';

let idbHydrated = false;

async function openInspectorQueueDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return null;
  return new Promise((resolve) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function persistQueueToIndexedDb(
  entries: Workshop2InspectorOfflineQueueEntry[]
): Promise<void> {
  const db = await openInspectorQueueDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.clear();
    for (const entry of entries) store.put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}

/** Wave 2 #68: hydrate queue from IndexedDB (browser PWA). */
export async function hydrateWorkshop2InspectorOfflineQueueFromIndexedDb(): Promise<number> {
  if (idbHydrated || typeof indexedDB === 'undefined') return memoryQueue.length;
  idbHydrated = true;
  const db = await openInspectorQueueDb();
  if (!db) return memoryQueue.length;
  const entries = await new Promise<Workshop2InspectorOfflineQueueEntry[]>((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).getAll();
    req.onsuccess = () =>
      resolve(
        Array.isArray(req.result) ? (req.result as Workshop2InspectorOfflineQueueEntry[]) : []
      );
    req.onerror = () => resolve([]);
  });
  db.close();
  if (entries.length) {
    memoryQueue = entries;
    saveQueueToSessionStorage(entries);
  }
  return memoryQueue.length;
}

function saveQueueToSessionStorage(entries: Workshop2InspectorOfflineQueueEntry[]): void {
  memoryQueue = entries;
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
}

function loadQueueFromBrowser(): Workshop2InspectorOfflineQueueEntry[] {
  if (typeof sessionStorage === 'undefined') return [...memoryQueue];
  try {
    const raw = sessionStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [...memoryQueue];
    const parsed = JSON.parse(raw) as Workshop2InspectorOfflineQueueEntry[];
    memoryQueue = Array.isArray(parsed) ? parsed : memoryQueue;
    return [...memoryQueue];
  } catch {
    return [...memoryQueue];
  }
}

function saveQueueToBrowser(entries: Workshop2InspectorOfflineQueueEntry[]): void {
  saveQueueToSessionStorage(entries);
  if (typeof indexedDB !== 'undefined') {
    void persistQueueToIndexedDb(entries);
  }
}

export function resetWorkshop2InspectorOfflineQueueForTests(): void {
  memoryQueue = [];
  idbHydrated = false;
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function listWorkshop2InspectorOfflineQueue(): Workshop2InspectorOfflineQueueEntry[] {
  return loadQueueFromBrowser();
}

export function workshop2InspectorOfflineQueueDepth(): number {
  return listWorkshop2InspectorOfflineQueue().length;
}

function entryKey(input: {
  collectionId: string;
  articleId: string;
  sampleOrderId: string;
}): string {
  return `${input.collectionId}::${input.articleId}::${input.sampleOrderId}`;
}

export function enqueueWorkshop2InspectorOfflinePut(input: {
  collectionId: string;
  articleId: string;
  sampleOrderId: string;
  checkedItemIds: string[];
}): Workshop2InspectorOfflineQueueEntry {
  const queue = listWorkshop2InspectorOfflineQueue();
  const key = entryKey(input);
  const existing = queue.find((e) => entryKey(e) === key);
  const enqueuedAt = new Date().toISOString();
  if (existing) {
    const next = queue.map((e) =>
      entryKey(e) === key
        ? { ...e, checkedItemIds: [...input.checkedItemIds], enqueuedAt, attempts: e.attempts }
        : e
    );
    saveQueueToBrowser(next);
    return next.find((e) => entryKey(e) === key)!;
  }
  const entry: Workshop2InspectorOfflineQueueEntry = {
    id: `iq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    collectionId: input.collectionId,
    articleId: input.articleId,
    sampleOrderId: input.sampleOrderId,
    checkedItemIds: [...input.checkedItemIds],
    enqueuedAt,
    attempts: 0,
  };
  saveQueueToBrowser([...queue, entry]);
  return entry;
}

export function removeWorkshop2InspectorOfflineEntry(entryId: string): void {
  saveQueueToBrowser(listWorkshop2InspectorOfflineQueue().filter((e) => e.id !== entryId));
}

function classifyFlushFailure(status?: number): Workshop2InspectorOfflineFlushFailureReason {
  if (status === 503 || status === 502) return 'pg_unavailable';
  if (status && status >= 400) return 'http';
  return 'network';
}

/** Flush queue with exponential backoff between entries (online recovery). */
export async function flushWorkshop2InspectorOfflineQueue(input: {
  save: SaveFn;
  maxEntries?: number;
}): Promise<{
  flushed: number;
  failed: number;
  results: Workshop2InspectorOfflineFlushResult[];
}> {
  const queue = listWorkshop2InspectorOfflineQueue();
  const slice = queue.slice(0, input.maxEntries ?? queue.length);
  const results: Workshop2InspectorOfflineFlushResult[] = [];
  let flushed = 0;
  let failed = 0;

  for (const entry of slice) {
    if (entry.attempts >= MAX_ATTEMPTS) {
      failed += 1;
      results.push({
        ok: false,
        entryId: entry.id,
        reason: 'pg_unavailable',
        status: 503,
      });
      continue;
    }
    const delay = RETRY_BASE_MS * Math.pow(2, Math.min(entry.attempts, 4));
    if (delay > 0 && typeof window !== 'undefined') {
      await new Promise((r) => setTimeout(r, delay));
    }
    const res = await input.save({
      collectionId: entry.collectionId,
      articleId: entry.articleId,
      sampleOrderId: entry.sampleOrderId,
      checkedItemIds: entry.checkedItemIds,
      offlineReplay: true,
    });
    if (res.ok && res.report) {
      removeWorkshop2InspectorOfflineEntry(entry.id);
      flushed += 1;
      results.push({ ok: true, report: res.report, entryId: entry.id });
      continue;
    }
    const reason = classifyFlushFailure(res.status);
    const nextQueue = listWorkshop2InspectorOfflineQueue().map((e) =>
      e.id === entry.id
        ? {
            ...e,
            attempts: e.attempts + 1,
            lastError: reason,
          }
        : e
    );
    saveQueueToBrowser(nextQueue);
    failed += 1;
    results.push({ ok: false, entryId: entry.id, reason, status: res.status });
  }

  return { flushed, failed, results };
}

export function shouldEnqueueWorkshop2InspectorOffline(input: {
  online?: boolean;
  saveOk: boolean;
  status?: number;
}): boolean {
  if (input.saveOk) return false;
  if (input.online === false) return true;
  return input.status === 503 || input.status === 502 || input.status === 0;
}
