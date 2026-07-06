import 'server-only';
import { EventEmitter } from 'node:events';
import {
  isWorkshop2RedisConfigured,
  publishWorkshop2RedisEvent,
  subscribeWorkshop2RedisRoom,
} from '@/lib/server/workshop2-redis-pubsub';

export type Workshop2PresenceEditor = {
  actorId: string;
  actorLabel: string;
  since: string;
};

/** Realtime-события workshop2 для комнаты dossier/article. */
export type Workshop2RealtimeEvent =
  | {
      type: 'DOSSIER_UPDATED';
      collectionId: string;
      articleId: string;
      version: number;
      updatedAt: string;
      updatedBy?: string;
    }
  | {
      type: 'EVENT_APPENDED';
      collectionId: string;
      articleId: string;
      eventId: string;
      eventType: string;
      version: number;
      createdAt: string;
      createdBy?: string;
    }
  | {
      type: 'PRESENCE';
      collectionId: string;
      articleId: string;
      editors: Workshop2PresenceEditor[];
    }
  | { type: 'ping'; ts: string }
  | { type: 'CHAIN_STATUS_BUMP'; orderIds?: string[]; ts: string }
  | { type: 'B2B_REGISTRY_BUMP'; reason?: string; ts: string }
  | { type: 'COMMS_INBOX_BUMP'; reason?: string; ts: string }
  | { type: 'DEVELOPMENT_STATUS_BUMP'; collectionIds?: string[]; ts: string }
  | {
      type: 'CONTEXTUAL_MESSAGE_APPENDED';
      contextType: string;
      contextId: string;
      messageId: string;
      sender: string;
      createdAt: string;
    }
  | { type: 'HANDOFF_QUEUE_BUMP'; factoryId?: string; ts: string }
  | {
      type: 'COMMS_NOTIFICATION_PREFS_BUMP';
      role?: string;
      scopeKey?: string;
      ts: string;
    };

export function workshop2RealtimeRoomKey(collectionId: string, articleId: string): string {
  return `workshop2:${collectionId}:${articleId}`;
}

export function workshop2ContextualRoomKey(contextType: string, contextId: string): string {
  return `contextual:${contextType.trim()}:${contextId.trim()}`;
}

type RoomListener = (event: Workshop2RealtimeEvent) => void;

/**
 * In-process pub/sub для SSE; при REDIS_URL — дублирует в Redis для multi-instance.
 */
class Workshop2RealtimeHub {
  private emitter = new EventEmitter();
  private subscriberCounts = new Map<string, number>();
  private redisUnsubs = new Map<string, () => void>();
  /** room → actorId → presence */
  private presenceByRoom = new Map<string, Map<string, Workshop2PresenceEditor>>();

  constructor() {
    this.emitter.setMaxListeners(200);
  }

  subscribe(room: string, listener: RoomListener): () => void {
    this.emitter.on(room, listener);
    this.subscriberCounts.set(room, (this.subscriberCounts.get(room) ?? 0) + 1);

    if (isWorkshop2RedisConfigured() && !this.redisUnsubs.has(room)) {
      const redisUnsub = subscribeWorkshop2RedisRoom(room, (event) => {
        this.emitter.emit(room, event);
      });
      this.redisUnsubs.set(room, redisUnsub);
    }

    return () => {
      this.emitter.off(room, listener);
      const n = (this.subscriberCounts.get(room) ?? 1) - 1;
      if (n <= 0) {
        this.subscriberCounts.delete(room);
        const ru = this.redisUnsubs.get(room);
        if (ru) {
          ru();
          this.redisUnsubs.delete(room);
        }
      } else {
        this.subscriberCounts.set(room, n);
      }
    };
  }

  publish(room: string, event: Workshop2RealtimeEvent): void {
    this.emitter.emit(room, event);
    if (isWorkshop2RedisConfigured() && event.type !== 'ping') {
      void publishWorkshop2RedisEvent(room, event).catch((e) => {
        console.warn('[workshop2-realtime] redis publish', e);
      });
    }
  }

  publishDossierUpdated(input: {
    collectionId: string;
    articleId: string;
    version: number;
    updatedAt: string;
    updatedBy?: string;
  }): void {
    const room = workshop2RealtimeRoomKey(input.collectionId, input.articleId);
    this.publish(room, {
      type: 'DOSSIER_UPDATED',
      collectionId: input.collectionId,
      articleId: input.articleId,
      version: input.version,
      updatedAt: input.updatedAt,
      updatedBy: input.updatedBy,
    });
  }

  publishEventAppended(input: {
    collectionId: string;
    articleId: string;
    eventId: string;
    eventType: string;
    version: number;
    createdAt: string;
    createdBy?: string;
  }): void {
    const room = workshop2RealtimeRoomKey(input.collectionId, input.articleId);
    this.publish(room, {
      type: 'EVENT_APPENDED',
      collectionId: input.collectionId,
      articleId: input.articleId,
      eventId: input.eventId,
      eventType: input.eventType,
      version: input.version,
      createdAt: input.createdAt,
      createdBy: input.createdBy,
    });
  }

  /** Регистрация редактора в комнате (SSE connect). */
  touchPresence(
    collectionId: string,
    articleId: string,
    editor: { actorId: string; actorLabel: string }
  ): void {
    const room = workshop2RealtimeRoomKey(collectionId, articleId);
    let map = this.presenceByRoom.get(room);
    if (!map) {
      map = new Map();
      this.presenceByRoom.set(room, map);
    }
    const existing = map.get(editor.actorId);
    map.set(editor.actorId, {
      actorId: editor.actorId,
      actorLabel: editor.actorLabel,
      since: existing?.since ?? new Date().toISOString(),
    });
    this.publishPresence(collectionId, articleId);
  }

  /** Снятие presence при disconnect SSE. */
  leavePresence(collectionId: string, articleId: string, actorId: string): void {
    const room = workshop2RealtimeRoomKey(collectionId, articleId);
    const map = this.presenceByRoom.get(room);
    if (!map) return;
    map.delete(actorId);
    if (map.size === 0) this.presenceByRoom.delete(room);
    this.publishPresence(collectionId, articleId);
  }

  listPresence(collectionId: string, articleId: string): Workshop2PresenceEditor[] {
    const room = workshop2RealtimeRoomKey(collectionId, articleId);
    const map = this.presenceByRoom.get(room);
    if (!map) return [];
    return [...map.values()];
  }

  private publishPresence(collectionId: string, articleId: string): void {
    const room = workshop2RealtimeRoomKey(collectionId, articleId);
    this.publish(room, {
      type: 'PRESENCE',
      collectionId,
      articleId,
      editors: this.listPresence(collectionId, articleId),
    });
  }

  roomSubscriberCount(room: string): number {
    return this.subscriberCounts.get(room) ?? 0;
  }

  publishContextualMessageAppended(input: {
    contextType: string;
    contextId: string;
    messageId: string;
    sender: string;
    createdAt: string;
  }): void {
    const room = workshop2ContextualRoomKey(input.contextType, input.contextId);
    this.publish(room, {
      type: 'CONTEXTUAL_MESSAGE_APPENDED',
      contextType: input.contextType.trim(),
      contextId: input.contextId.trim(),
      messageId: input.messageId,
      sender: input.sender,
      createdAt: input.createdAt,
    });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __workshop2RealtimeHub: Workshop2RealtimeHub | undefined;
}

export function getWorkshop2RealtimeHub(): Workshop2RealtimeHub {
  if (!globalThis.__workshop2RealtimeHub) {
    globalThis.__workshop2RealtimeHub = new Workshop2RealtimeHub();
  }
  return globalThis.__workshop2RealtimeHub;
}
