import 'server-only';

import {
  isWorkshop2RedisConfigured,
  publishWorkshop2RedisEvent,
  subscribeWorkshop2RedisRoom,
} from '@/lib/server/workshop2-redis-pubsub';
import type { Workshop2RealtimeEvent } from '@/lib/server/workshop2-realtime-hub';

const REDIS_ROOM = 'platform-core:b2b-registry';

/** In-process + optional Redis сигнал для SSE refetch реестра B2B (brand/shop). */
const listeners = new Set<(reason?: string) => void>();
let redisBridgeReady = false;
let lastBumpReason: string | undefined;

function notifyLocalListeners(reason?: string): void {
  lastBumpReason = reason?.trim() || lastBumpReason;
  for (const listener of listeners) {
    try {
      listener(reason);
    } catch {
      /* ignore */
    }
  }
}

function ensureRedisBridge(): void {
  if (redisBridgeReady || !isWorkshop2RedisConfigured()) return;
  redisBridgeReady = true;
  subscribeWorkshop2RedisRoom(REDIS_ROOM, (event: Workshop2RealtimeEvent) => {
    if (event.type !== 'B2B_REGISTRY_BUMP') return;
    notifyLocalListeners();
  });
}

export function isPlatformCoreB2bRegistryRedisEnabled(): boolean {
  return isWorkshop2RedisConfigured();
}

export function bumpPlatformCoreB2bRegistry(reason?: string): void {
  notifyLocalListeners(reason);
  if (!isWorkshop2RedisConfigured()) return;
  void publishWorkshop2RedisEvent(REDIS_ROOM, {
    type: 'B2B_REGISTRY_BUMP',
    reason,
    ts: new Date().toISOString(),
  }).catch(() => {
    /* best-effort */
  });
}

export function subscribePlatformCoreB2bRegistry(listener: (reason?: string) => void): () => void {
  ensureRedisBridge();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function peekPlatformCoreB2bRegistryLastReason(): string | undefined {
  return lastBumpReason;
}
