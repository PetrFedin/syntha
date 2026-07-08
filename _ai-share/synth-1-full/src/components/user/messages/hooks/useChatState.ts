import React from 'react';
import { useSearchParams } from 'next/navigation';
import { initialConversations, mockChatHistories } from '@/lib/data/messages-data';
import {
  fetchBrandPgContextualMessages,
  fetchPgContextualThreads,
  postBrandPgContextualMessage,
} from '@/lib/brand/brand-pg-contextual-chat-client';
import type { PgContextualThreadsCabinet } from '@/lib/server/pg-contextual-message-threads-handler';
import {
  buildPgB2bOrderChatId,
  isBrandPgContextChatId,
  mapBrandPgThreadsToChats,
  parseBrandPgContextChatId,
  type BrandPgThreadRow,
} from '@/lib/brand/brand-messages-pg-threads';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import { appendUniqueContextualChatPlaceholder } from '@/lib/communications/dedupe-contextual-chat-conversations';
import { postPlatformCoreCommsContextualThread } from '@/lib/communications/platform-core-comms-contextual-thread-client';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { mergePlatformCoreB2bInboxChats } from '@/lib/platform-core-b2b-inbox-merge';
import {
  usePlatformCoreB2bInboxOrderIds,
  type PlatformCoreB2bInboxCabinet,
} from '@/hooks/use-platform-core-b2b-inbox-order-ids';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { usePlatformCoreB2bRegistryPoll } from '@/hooks/use-platform-core-b2b-registry-poll';
import { usePgContextualActorId } from '@/hooks/use-pg-contextual-actor-id';
import { markPgChatSeen } from '@/lib/communications/pg-contextual-read-state';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { Chat as ChatConversation, ChatMessage, UserRole } from '@/lib/types';
import { ID } from '../types';
import { canInteract } from '@/lib/interaction-policy';
import {
  STAGE_PREFERRED_CHAT_ID,
  matrixContextChatId,
  matrixContextChatRow,
  matrixContextMessages,
} from '@/lib/production/stages-comm-demo';
import {
  ACADEMY_ENROLLMENT_EVENT,
  buildAcademyChatsForCourse,
  getAcademyChatSeedMessages,
  getAcademyChatsForDeepLink,
  getEnrolledCourseIds,
  resolveCourseTitleForAcademy,
} from '@/lib/academy/academy-course-chats';

function resolvePgThreadsCabinet(role: UserRole): PgContextualThreadsCabinet | null {
  if (role === 'brand') return 'brand';
  if (role === 'shop' || role === 'b2b') return 'shop';
  if (role === 'manufacturer' || role === 'supplier') return 'factory';
  return null;
}

export function useChatState(initialRole?: string) {
  const searchParams = useSearchParams();
  const pgThreadsOnly = isPlatformCoreMode();
  const [currentRole, setCurrentRole] = React.useState<UserRole>(
    (initialRole as UserRole) || 'admin'
  );
  const [pgThreadRows, setPgThreadRows] = React.useState<BrandPgThreadRow[]>([]);
  const [pgMessagesCache, setPgMessagesCache] = React.useState<Record<string, ChatMessage[]>>({});

  const [academyEnrollVersion, setAcademyEnrollVersion] = React.useState(0);

  React.useEffect(() => {
    const bump = () => setAcademyEnrollVersion((v) => v + 1);
    if (typeof window === 'undefined') return;
    window.addEventListener(ACADEMY_ENROLLMENT_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(ACADEMY_ENROLLMENT_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const conversationsWithAcademy = React.useMemo(() => {
    const enrolled = typeof window === 'undefined' ? [] : getEnrolledCourseIds();
    const extra = enrolled.flatMap((courseId) =>
      buildAcademyChatsForCourse(courseId, resolveCourseTitleForAcademy(courseId))
    );
    return [...initialConversations, ...extra];
  }, [academyEnrollVersion]);

  const filteredConversations = React.useMemo(() => {
    return conversationsWithAcademy.filter((chat) => {
      // If admin, show everything
      if (currentRole === 'admin') return true;

      // Check if current user can interact with the chat type/participants
      // Each chat has a 'type' property in our mock data which corresponds to the role it belongs to
      return canInteract(currentRole, chat.type as UserRole);
    });
  }, [currentRole, conversationsWithAcademy]);

  const spGet = React.useCallback(
    (name: string) => searchParams?.get(name) ?? null,
    [searchParams]
  );

  const chatParam = searchParams?.get('chat') ?? '';

  const withDeepLinkAcademy = React.useMemo(() => {
    const extra = getAcademyChatsForDeepLink(chatParam);
    if (extra.length === 0) return filteredConversations;
    const ids = new Set(filteredConversations.map((c) => c.id));
    return [...filteredConversations, ...extra.filter((c) => !ids.has(c.id))];
  }, [filteredConversations, chatParam, academyEnrollVersion]);

  const coreMode = isPlatformCoreMode();

  const conversationsWithMatrix = React.useMemo(() => {
    if (pgThreadsOnly || coreMode) return withDeepLinkAcademy;
    const matrixRow = matrixContextChatRow({ get: spGet });
    if (!matrixRow) return withDeepLinkAcademy;
    const rest = withDeepLinkAcademy.filter((c) => c.id !== matrixRow.id);
    return [matrixRow, ...rest];
  }, [withDeepLinkAcademy, spGet, coreMode, pgThreadsOnly]);

  const pgThreadsCabinet = React.useMemo(() => resolvePgThreadsCabinet(currentRole), [currentRole]);

  const b2bInboxCabinet = React.useMemo((): PlatformCoreB2bInboxCabinet | null => {
    if (!pgThreadsOnly) return null;
    if (currentRole === 'brand') return 'brand';
    if (currentRole === 'shop' || currentRole === 'b2b') return 'shop';
    if (currentRole === 'manufacturer') return 'manufacturer';
    if (currentRole === 'supplier') return 'supplier';
    return null;
  }, [pgThreadsOnly, currentRole]);

  const { buyerId: shopInboxBuyerId } = useShopCoreBuyerId();
  const { orderIds: b2bInboxOrderIds } = usePlatformCoreB2bInboxOrderIds(
    b2bInboxCabinet,
    b2bInboxCabinet === 'shop' ? shopInboxBuyerId : undefined
  );

  const pgThreadsReaderCabinet = pgThreadsOnly
    ? pgThreadsCabinet
    : currentRole === 'brand'
      ? 'brand'
      : null;
  const pgReaderId = usePgContextualActorId(pgThreadsReaderCabinet ?? 'brand');

  const refreshPgThreads = React.useCallback(() => {
    const cabinet = pgThreadsOnly ? pgThreadsCabinet : currentRole === 'brand' ? 'brand' : null;
    if (!cabinet) return;
    void fetchPgContextualThreads(cabinet, pgReaderId).then(({ threads }) => {
      setPgThreadRows(threads);
    });
  }, [pgThreadsOnly, currentRole, pgThreadsCabinet, pgReaderId]);

  const { tick: registryTick } = usePlatformCoreB2bRegistryPoll(
    Boolean(pgThreadsOnly && pgThreadsCabinet)
  );

  React.useEffect(() => {
    refreshPgThreads();
  }, [refreshPgThreads, registryTick]);

  const pgChats = React.useMemo(() => {
    const mapped = mapBrandPgThreadsToChats(pgThreadRows);
    if (!b2bInboxCabinet || b2bInboxOrderIds.length === 0) return mapped;
    return mergePlatformCoreB2bInboxChats(mapped, b2bInboxOrderIds, {
      placeholders: !coreMode,
    });
  }, [pgThreadRows, b2bInboxCabinet, b2bInboxOrderIds, coreMode]);

  const chatFromUrl = searchParams?.get('chat');
  const contextTypeFromUrl = searchParams?.get('contextType');
  const contextIdFromUrl = searchParams?.get('contextId');
  const orderContextIdFromUrl =
    searchParams?.get('orderId')?.trim() || searchParams?.get('order')?.trim() || '';
  const contextualChatFromUrl = React.useMemo(() => {
    const contextType = contextTypeFromUrl?.trim() || (orderContextIdFromUrl ? 'b2b_order' : '');
    const contextId = contextIdFromUrl?.trim() || orderContextIdFromUrl;
    if (!contextType || !contextId) return null;
    return `w2ctx:${contextType}:${contextId}`;
  }, [contextTypeFromUrl, contextIdFromUrl, orderContextIdFromUrl]);

  const conversationsWithPg = React.useMemo(() => {
    let merged: ChatConversation[];
    if (pgThreadsOnly) {
      merged = pgChats;
    } else if (pgChats.length === 0) {
      merged = conversationsWithMatrix;
    } else {
      const ids = new Set(pgChats.map((c) => c.id));
      const rest = conversationsWithMatrix.filter((c) => !ids.has(c.id));
      merged = [...pgChats, ...rest];
    }
    return appendUniqueContextualChatPlaceholder(merged, contextualChatFromUrl);
  }, [pgThreadsOnly, pgChats, conversationsWithMatrix, contextualChatFromUrl]);

  const [chats, setChats] = React.useState<ChatConversation[]>(filteredConversations);
  const [activeChatId, setActiveChatId] = React.useState<ID>(filteredConversations[0]?.id || '');

  React.useEffect(() => {
    setChats(conversationsWithPg);
    if (
      conversationsWithPg.length > 0 &&
      (!activeChatId || !conversationsWithPg.find((c) => c.id === activeChatId))
    ) {
      setActiveChatId(conversationsWithPg[0].id);
    }
  }, [conversationsWithPg]);

  const coreDefaultOrderChatId = React.useMemo(() => {
    if (!coreMode) return null;
    const spineHit = b2bInboxOrderIds.find((id) => isIntegrationImportedWholesaleOrderId(id));
    const orderId = spineHit ?? b2bInboxOrderIds[0];
    return orderId ? buildPgB2bOrderChatId(orderId) : null;
  }, [coreMode, b2bInboxOrderIds]);

  React.useEffect(() => {
    if (chatFromUrl && conversationsWithPg.some((c) => c.id === chatFromUrl)) {
      setActiveChatId(chatFromUrl);
      return;
    }
    if (contextualChatFromUrl && conversationsWithPg.some((c) => c.id === contextualChatFromUrl)) {
      setActiveChatId(contextualChatFromUrl);
      return;
    }
    if (
      coreMode &&
      !chatFromUrl &&
      !contextualChatFromUrl &&
      coreDefaultOrderChatId &&
      conversationsWithPg.some((c) => c.id === coreDefaultOrderChatId)
    ) {
      setActiveChatId(coreDefaultOrderChatId);
    }
  }, [chatFromUrl, contextualChatFromUrl, conversationsWithPg, coreMode, coreDefaultOrderChatId]);

  /** Из матрицы: чат по артикулу; иначе — предпочтительный канал этапа (не розница). */
  const stagesStep = searchParams?.get('stagesStep') || '';
  const stageChatAppliedRef = React.useRef('');
  const matrixChatAppliedRef = React.useRef('');
  React.useEffect(() => {
    if (pgThreadsOnly || chatFromUrl) return;
    const mid = matrixContextChatId({ get: spGet });
    if (mid && stagesStep && conversationsWithPg.some((c) => c.id === mid)) {
      const key = `${stagesStep}:${searchParams?.get('sku')?.trim() ?? ''}`;
      if (matrixChatAppliedRef.current !== key) {
        setActiveChatId(mid);
        matrixChatAppliedRef.current = key;
      }
      return;
    }
    matrixChatAppliedRef.current = '';
    if (!stagesStep) return;
    if (stageChatAppliedRef.current === stagesStep) return;
    const want = STAGE_PREFERRED_CHAT_ID[stagesStep];
    if (!want) return;
    if (conversationsWithPg.some((c) => c.id === want)) {
      setActiveChatId(want);
      stageChatAppliedRef.current = stagesStep;
    }
  }, [stagesStep, chatFromUrl, conversationsWithPg, spGet, searchParams, pgThreadsOnly]);

  const messagesForChat = React.useCallback(
    (id: ID): ChatMessage[] => {
      if (isBrandPgContextChatId(String(id))) {
        return pgMessagesCache[String(id)] ?? [];
      }
      if (!pgThreadsOnly) {
        const mid = matrixContextChatId({ get: spGet });
        if (mid && id === mid) return matrixContextMessages({ get: spGet });
      }
      const academySeed = getAcademyChatSeedMessages(String(id));
      if (academySeed?.length) return academySeed;
      return (mockChatHistories as any)[id] ?? [];
    },
    [spGet, pgMessagesCache, pgThreadsOnly]
  );

  React.useEffect(() => {
    if (!activeChatId || !isBrandPgContextChatId(String(activeChatId))) return;
    const parsed = parseBrandPgContextChatId(String(activeChatId));
    if (!parsed) return;
    const key = String(activeChatId);
    let cancelled = false;
    void fetchBrandPgContextualMessages(parsed.contextType, parsed.contextId).then((rows) => {
      if (!cancelled) {
        setPgMessagesCache((prev) => ({ ...prev, [key]: rows }));
        setMessages(rows);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  const contextualThreadEnsuredRef = React.useRef('');
  React.useEffect(() => {
    if (!coreMode || !activeChatId || !isBrandPgContextChatId(String(activeChatId))) return;
    const parsed = parseBrandPgContextChatId(String(activeChatId));
    if (!parsed) return;
    const ensureKey = `${parsed.contextType}:${parsed.contextId}`;
    if (contextualThreadEnsuredRef.current === ensureKey) return;
    contextualThreadEnsuredRef.current = ensureKey;

    if (parsed.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE) {
      const orderId = parsed.contextId.trim();
      if (!isPlatformCorePgB2bOrder(orderId)) return;
      void postPlatformCoreCommsContextualThread({ orderId, pillarId: 'comms' }).catch(() => {
        contextualThreadEnsuredRef.current = '';
      });
      return;
    }

    if (parsed.contextType === WORKSHOP2_ARTICLE_CONTEXT_TYPE) {
      const sep = parsed.contextId.indexOf(':');
      if (sep <= 0) return;
      const collectionId = parsed.contextId.slice(0, sep).trim();
      const articleId = parsed.contextId.slice(sep + 1).trim();
      if (!collectionId || !articleId) return;
      void postPlatformCoreCommsContextualThread({
        collectionId,
        articleId,
        pillarId: 'comms',
      }).catch(() => {
        contextualThreadEnsuredRef.current = '';
      });
    }
  }, [activeChatId, coreMode]);

  const [messages, setMessages] = React.useState<ChatMessage[]>(() =>
    activeChatId ? messagesForChat(activeChatId) : []
  );

  React.useEffect(() => {
    if (activeChatId) setMessages(messagesForChat(activeChatId));
  }, [activeChatId, messagesForChat]);

  const pgMarkSeenReaderId = pgThreadsReaderCabinet ? pgReaderId : undefined;

  React.useEffect(() => {
    if (!activeChatId || !isBrandPgContextChatId(String(activeChatId))) return;
    const key = String(activeChatId);
    const thread = pgThreadRows.find((t) => `w2ctx:${t.contextType}:${t.contextId}` === key);
    const seenCount = Math.max(thread?.messageCount ?? 0, messages.length);
    if (seenCount > 0) markPgChatSeen(key, seenCount, pgMarkSeenReaderId);
  }, [activeChatId, messages.length, pgThreadRows, pgMarkSeenReaderId]);

  const [chatQuery, setChatQuery] = React.useState('');
  const [msgSearch, setMsgSearch] = React.useState('');
  const [tab, setTab] = React.useState<'feed' | 'tasks' | 'archived' | 'starred'>('feed');
  const [activeGroup, setActiveGroup] = React.useState<string>('all');
  const [composerText, setComposerText] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);

  const activeChat = React.useMemo(
    () => chats.find((c) => c.id === activeChatId),
    [chats, activeChatId]
  );

  const switchChat = (nextId: ID) => {
    setActiveChatId(nextId);
    setMessages(messagesForChat(nextId));
  };

  const onSendMessage = () => {
    if (!composerText.trim()) return;
    const currentUserName = 'Petr';
    const text = composerText.trim();
    const parsed = parseBrandPgContextChatId(String(activeChatId));
    if (parsed) {
      void postBrandPgContextualMessage({
        contextType: parsed.contextType,
        contextId: parsed.contextId,
        message: text,
        sender: currentUserName,
      }).then((ok) => {
        if (!ok) return;
        const key = String(activeChatId);
        void fetchBrandPgContextualMessages(parsed.contextType, parsed.contextId).then((rows) => {
          setPgMessagesCache((prev) => ({ ...prev, [key]: rows }));
          setMessages(rows);
          refreshPgThreads();
        });
      });
      setComposerText('');
      setIsPrivate(false);
      return;
    }
    const newMessage: ChatMessage = {
      id: Date.now(),
      chatId: activeChatId,
      user: currentUserName,
      text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: 'message',
      isPrivate,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setComposerText('');
    setIsPrivate(false);
  };

  return {
    currentRole,
    setCurrentRole,
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    messages,
    setMessages,
    chatQuery,
    setChatQuery,
    msgSearch,
    setMsgSearch,
    tab,
    setTab,
    activeGroup,
    setActiveGroup,
    activeChat,
    composerText,
    setComposerText,
    isPrivate,
    setIsPrivate,
    onSendMessage,
    switchChat,
  };
}
