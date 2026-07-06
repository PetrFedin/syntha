'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types & Constants
import { chatGroupConfig, ROLE_PERMISSIONS } from './constants';

// Hooks
import { useChatState } from './hooks/useChatState';
import { useMessageActions } from './hooks/useMessageActions';
import { useTaskActions } from './hooks/useTaskActions';
import { useAIActions } from './hooks/useAIActions';
import { useRecording } from './hooks/useRecording';

// Components
import { AlertsFabric } from './AlertsFabric';
import { MessagesHeader } from './MessagesHeader';
import { GroupRail } from './GroupRail';
import { ChatList } from './ChatList';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { TaskHub } from './TaskHub';

// Dialogs
import { ConfirmDialog } from './Dialogs/ConfirmDialog';
import { CreateChatDialog } from './Dialogs/CreateChatDialog';
import { TaskEditDialog } from './Dialogs/TaskEditDialog';
import { SUPPLY_AND_STUDIO_STEP_IDS } from '@/lib/production/stages-comm-demo';
import {
  useBrandCommunicationsUnread,
  useShopCommunicationsUnread,
} from '@/lib/communications/use-communications-unread';
import { usePgCommunicationsUnread } from '@/lib/communications/use-pg-communications-unread';
import { PlatformCoreB2bMessageTemplates } from '@/components/platform/PlatformCoreB2bMessageTemplates';
import { PlatformCoreEntityThreadTemplatePicker } from '@/components/platform/PlatformCoreEntityThreadTemplatePicker';
import { parseSynthaOverlayContext } from '@/lib/communications/syntha-overlay-context';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import type { ChatMessage } from '@/lib/types';
import type { ID } from './types';

export default function MessagesPage({
  initialRole,
  slimCore = false,
}: {
  initialRole?: string;
  /** Platform Core: hide AI/widgets/recording and legacy Intelligence OS chrome. */
  slimCore?: boolean;
}) {
  const brandUnread = useBrandCommunicationsUnread();
  const shopUnread = useShopCommunicationsUnread();
  const factoryUnread = usePgCommunicationsUnread('factory', slimCore);
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const urlCommContextApplied = React.useRef(false);
  const chatState = useChatState(initialRole);
  const unreadByChat = React.useMemo(() => {
    const role = initialRole ?? chatState.currentRole;
    if (role === 'shop' || role === 'b2b') return shopUnread.unreadByChat;
    if (role === 'manufacturer' || role === 'supplier') return factoryUnread.unreadByChat;
    return brandUnread.unreadByChat;
  }, [
    initialRole,
    chatState.currentRole,
    brandUnread.unreadByChat,
    shopUnread.unreadByChat,
    factoryUnread.unreadByChat,
  ]);
  const {
    currentRole,
    setCurrentRole,
    chats,
    setChats,
    activeChatId,
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
    switchChat,
  } = chatState;

  React.useEffect(() => {
    if (urlCommContextApplied.current) return;
    const q = searchParams.get('q')?.trim() || '';
    const sku = searchParams.get('sku')?.trim() || '';
    const season = searchParams.get('season')?.trim() || '';
    const order = searchParams.get('order')?.trim() || '';
    const orderId = searchParams.get('orderId')?.trim() || '';
    const step = searchParams.get('stagesStep')?.trim() || '';
    const msgLine = [q, sku, season, order, orderId, step].filter(Boolean).join(' ').trim();
    if (!msgLine && !q) return;
    if (q) setChatQuery((prev) => (prev.trim() ? prev : q));
    if (!slimCore && msgLine) setChatQuery((prev) => (prev.trim() ? prev : msgLine));
    if (msgLine) setMsgSearch((prev) => (prev.trim() ? prev : msgLine));
    urlCommContextApplied.current = true;
  }, [searchParams, setChatQuery, setMsgSearch, slimCore]);

  const { toggleStar, togglePin, deleteMessage, addReaction } = useMessageActions(
    activeChatId,
    setMessages,
    'Petr'
  );
  const { taskThreads, taskStages, saveTask, updateTask, setTaskStatus } = useTaskActions(
    'user_petr',
    setMessages
  );
  const { isAiProcessing, processAiCorrection } = useAIActions(
    chatState.composerText,
    chatState.setComposerText
  );
  const { recording, startRecording, stopRecording } = useRecording();
  const showAiChrome = !slimCore;
  const showRecording = !slimCore;

  const feedRootRef = React.useRef<HTMLDivElement>(null);
  const [isAlertVisible, setIsAlertVisible] = React.useState(true);
  const [createChatOpen, setCreateChatOpen] = React.useState(false);
  const [tasksHubOpen, setTasksHubOpen] = React.useState(false);
  const [taskEditOpen, setTaskEditOpen] = React.useState(false);
  const [taskEditing, setTaskEditing] = React.useState<any>(null);
  const [mobileCommsPane, setMobileCommsPane] = React.useState<'list' | 'chat'>('list');

  const handleSwitchChat = React.useCallback(
    (id: ID) => {
      switchChat(id);
      if (slimCore) setMobileCommsPane('chat');
    },
    [switchChat, slimCore]
  );

  const handleMobileBackToList = React.useCallback(() => {
    setMobileCommsPane('list');
  }, []);

  React.useEffect(() => {
    if (!slimCore) return;
    const hasDeepLink =
      Boolean(searchParams.get('contextType')?.trim()) ||
      Boolean(searchParams.get('contextId')?.trim()) ||
      Boolean(searchParams.get('order')?.trim()) ||
      Boolean(searchParams.get('orderId')?.trim()) ||
      Boolean(searchParams.get('chat')?.trim());
    if (hasDeepLink) setMobileCommsPane('chat');
  }, [slimCore, searchParams]);

  const [productionPhase] = React.useState(65);
  const [riskLevel] = React.useState(15);

  const stagesStepParam = searchParams.get('stagesStep') || '';

  const cmThreadSearchTestId = React.useMemo(() => {
    const role = initialRole ?? currentRole;
    if (role === 'shop' || role === 'b2b') return 'shop-cm-thread-search';
    if (role === 'supplier') return 'sup-cm-thread-search';
    if (role === 'manufacturer') return 'mfr-cm-thread-search';
    return 'brand-cm-thread-search';
  }, [initialRole, currentRole]);

  const entityTemplatePickerVariant = React.useMemo((): 'brand' | 'shop' | 'manufacturer' | 'supplier' => {
    const role = initialRole ?? currentRole;
    if (role === 'shop' || role === 'b2b') return 'shop';
    if (role === 'supplier') return 'supplier';
    if (role === 'manufacturer') return 'manufacturer';
    return 'brand';
  }, [initialRole, currentRole]);

  const entityPickerContext = React.useMemo(() => {
    const overlay = parseSynthaOverlayContext(searchParams);
    const collectionId =
      resolvePageCollectionId({ collection: searchParams.get('collection') }) ||
      overlay.collectionId ||
      PLATFORM_CORE_DEMO.collectionId;
    const orderId =
      searchParams.get('order')?.trim() ||
      searchParams.get('orderId')?.trim() ||
      overlay.orderId ||
      undefined;
    const articleId =
      searchParams.get('article')?.trim() ||
      searchParams.get('articleId')?.trim() ||
      overlay.articleId ||
      undefined;
    return { collectionId, orderId, articleId };
  }, [searchParams]);

  const visibleChats = React.useMemo(() => {
    const raw = chatQuery.trim().toLowerCase();
    const tokens = raw ? raw.split(/\s+/).filter(Boolean) : [];
    let list = chats.filter((c) => {
      const blob = `${c.title} ${c.subtitle ?? ''}`.toLowerCase();
      const fromMatrix = Boolean(stagesStepParam && searchParams.get('sku')?.trim());
      const matchesSearch =
        tokens.length === 0 ||
        (fromMatrix
          ? tokens.some((t) => t.length > 1 && blob.includes(t))
          : tokens.every((t) => blob.includes(t)));
      const matchesGroup = activeGroup === 'all' || c.type === activeGroup;
      return matchesSearch && matchesGroup;
    });
    if (SUPPLY_AND_STUDIO_STEP_IDS.has(stagesStepParam)) {
      const isRetailish = (c: (typeof chats)[number]) =>
        c.type === 'client' ||
        (c.type === 'b2b_orders' &&
          (c.partnerProfile === 'shop' ||
            /podium|цум|ритейл|магазин/i.test(`${c.title} ${c.subtitle ?? ''}`)));
      list = [...list.filter((c) => !isRetailish(c)), ...list.filter((c) => isRetailish(c))];
    }
    return list;
  }, [chats, chatQuery, activeGroup, stagesStepParam, searchParams]);

  const groupedMessages = React.useMemo(() => {
    // Basic grouping logic for now
    return [{ day: 'Сегодня', items: messages }];
  }, [messages]);

  const availableGroups = React.useMemo(() => {
    const permissions = ROLE_PERMISSIONS[currentRole] || [];
    return Object.entries(chatGroupConfig).filter(
      ([key]) => permissions.includes(key) || ['all', 'starred', 'archived', 'team'].includes(key)
    );
  }, [currentRole]);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden border bg-white font-sans text-slate-900 duration-700 animate-in fade-in',
        slimCore
          ? 'border-border-subtle max-h-[min(72vh,640px)] min-h-[360px] gap-2 rounded-lg p-2 shadow-sm max-md:max-h-[min(72vh,640px)] max-md:min-h-[min(60vh,520px)]'
          : 'h-[calc(100vh-2rem)] min-h-[700px] gap-3 rounded-xl border-slate-200 p-4 shadow-sm'
      )}
      data-testid={slimCore ? 'platform-core-comms-inbox-shell' : undefined}
    >
      <TooltipProvider>
        {!slimCore && (
          <AlertsFabric isVisible={isAlertVisible} onClose={() => setIsAlertVisible(false)} />
        )}

        <MessagesHeader
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          userStatus="online"
          setUserStatus={() => {}}
          riskLevel={riskLevel}
          onOpenTeam={() => {}}
          onOpenRiskDetails={() => {}}
          onOpenTasksHub={() => setTab('tasks')}
          onOpenSettings={() => {}}
          onOpenCreateChat={() => setCreateChatOpen(true)}
          slimCore={slimCore}
        />

        <div className={cn('flex min-h-0 min-w-0 flex-1', slimCore ? 'gap-1.5' : 'gap-3')}>
          <GroupRail
            availableGroups={availableGroups}
            activeGroup={activeGroup as any}
            setActiveGroup={setActiveGroup as any}
            slimCore={slimCore}
            className={slimCore ? 'max-md:hidden' : undefined}
          />

          <ChatList
            visibleChats={visibleChats}
            activeChatId={activeChatId}
            onSwitchChat={handleSwitchChat}
            onOpenCreateChat={() => setCreateChatOpen(true)}
            chatQuery={chatQuery}
            setChatQuery={setChatQuery}
            unreadCountByChat={unreadByChat}
            typingUsers={{}}
            currentUser="user_petr"
            slimCore={slimCore}
            threadSearchTestId={slimCore ? cmThreadSearchTestId : undefined}
            listTestId={slimCore ? 'platform-core-comms-thread-list' : undefined}
            className={cn(
              slimCore && 'max-md:w-full max-md:max-w-none max-md:flex-1',
              slimCore && mobileCommsPane === 'chat' && 'max-md:hidden'
            )}
          />

          <main
            data-testid={slimCore ? 'platform-core-comms-chat-pane' : undefined}
            className={cn(
              'relative flex min-w-0 flex-1 flex-col overflow-hidden border bg-slate-50/30 shadow-inner transition-all',
              slimCore ? 'rounded-lg border-border-subtle' : 'rounded-2xl border-slate-100',
              slimCore && mobileCommsPane === 'list' && 'max-md:hidden',
              slimCore && 'max-md:w-full'
            )}
          >
            {activeChat && (
              <ChatHeader
                activeChat={activeChat}
                isSummarizing={false}
                onGenerateSummary={() => {}}
                onOpenCallSetup={() => {}}
                onOpenParticipants={() => {}}
                onOpenArchive={() => {}}
                onOpenSettings={() => {}}
                slimCore={slimCore}
                showMobileBack={slimCore && mobileCommsPane === 'chat'}
                onMobileBack={handleMobileBackToList}
              />
            )}

            <div className="relative flex min-h-0 flex-1 flex-col bg-white">
              {tab === 'tasks' ? (
                <TaskHub
                  chatTasks={messages.filter((m) => m.type === 'task')}
                  currentUser="user_petr"
                  onOpenCreateTask={() => {
                    const draft: ChatMessage = {
                      id: Date.now(),
                      user: 'user_petr',
                      chatId: activeChatId,
                      text: '',
                      time: new Date().toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      type: 'task',
                      status: 'pending',
                      priority: 'medium',
                    };
                    setTaskEditing(draft);
                    setTaskEditOpen(true);
                  }}
                  onOpenEditTask={(m) => {
                    setTaskEditing(m);
                    setTaskEditOpen(true);
                  }}
                />
              ) : (
                <>
                  <MessageList
                    grouped={groupedMessages}
                    currentUser="user_petr"
                    currentUserName="Petr"
                    activeChat={activeChat}
                    msgSearch={msgSearch}
                    unreadDividerMsgId={null}
                    unreadCountActiveChat={0}
                    feedRootRef={feedRootRef}
                    onOpenEditTask={(m) => {
                      setTaskEditing(m);
                      setTaskEditOpen(true);
                    }}
                    onOpenTaskProcess={() => {}}
                    onTogglePin={togglePin}
                    onToggleStar={toggleStar}
                    onAddReaction={addReaction}
                    onDeleteMessage={deleteMessage}
                    onForwardMessage={() => {}}
                    onReplyToMessage={() => {}}
                    onScrollToMessage={() => {}}
                    onOpenCreateTask={(initial) => {
                      const draft: ChatMessage = {
                        id: initial?.id ?? Date.now(),
                        user: 'user_petr',
                        chatId: activeChatId,
                        text: initial?.text ?? '',
                        time: new Date().toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        type: 'task',
                        status: 'pending',
                        priority: 'medium',
                        ...initial,
                      } as ChatMessage;
                      setTaskEditing(draft);
                      setTaskEditOpen(true);
                    }}
                    setReminderEditing={() => {}}
                    setReminderOpen={() => {}}
                  />
                  {slimCore ? (
                    <>
                      <PlatformCoreB2bMessageTemplates
                        draftText={chatState.composerText}
                        onInsert={(text) => chatState.setComposerText(text)}
                      />
                      <PlatformCoreEntityThreadTemplatePicker
                        variant={entityTemplatePickerVariant}
                        collectionId={entityPickerContext.collectionId}
                        orderId={entityPickerContext.orderId}
                        articleId={entityPickerContext.articleId}
                        onInsert={(text) => chatState.setComposerText(text)}
                      />
                    </>
                  ) : null}
                  <Composer
                    activeChat={activeChat}
                    composerText={chatState.composerText}
                    setComposerText={chatState.setComposerText}
                    isPrivate={chatState.isPrivate}
                    setIsPrivate={chatState.setIsPrivate}
                    onSendMessage={chatState.onSendMessage}
                    onSmartReply={() => {}}
                    onOpenNegotiation={() => {}}
                    onStartRecording={showRecording ? startRecording : () => {}}
                    onStopRecording={showRecording ? stopRecording : () => {}}
                    recording={showRecording ? recording : false}
                    isAiProcessing={showAiChrome ? isAiProcessing : false}
                    onProcessAiCorrection={showAiChrome ? processAiCorrection : () => {}}
                    onFileClick={() => {}}
                    onUnarchiveChat={() => {}}
                    slimCore={slimCore}
                    onAttachProduct={
                      slimCore
                        ? undefined
                        : () =>
                            chatState.setComposerText((prev) =>
                              prev
                                ? `${prev}\n[Обсуждаю товар — прикрепите из каталога]`
                                : '[Обсуждаю товар — прикрепите из каталога]'
                            )
                    }
                  />
                </>
              )}
            </div>
          </main>
        </div>

        <CreateChatDialog
          open={createChatOpen}
          onOpenChange={setCreateChatOpen}
          currentRole={currentRole}
          onCreate={(name, group, opts) => {
            const newChat: any = {
              id: `chat_${Date.now()}`,
              title: name,
              type: group,
              participantsCount: 1,
              ...(opts?.linkOrderId && { linkOrderId: opts.linkOrderId }),
              ...(opts?.linkCollectionId && { linkCollectionId: opts.linkCollectionId }),
            };
            setChats((prev) => [...prev, newChat]);
          }}
        />

        <TaskEditDialog
          open={taskEditOpen}
          onOpenChange={(o) => {
            setTaskEditOpen(o);
            if (!o) setTaskEditing(null);
          }}
          task={taskEditing}
          currentUser="user_petr"
          participants={(activeChat?.participants ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role,
          }))}
          onSave={(t) => {
            const exists = messages.some((m) => m.id === t.id);
            if (exists) updateTask(t);
            else saveTask(t);
          }}
        />
      </TooltipProvider>
    </div>
  );
}
