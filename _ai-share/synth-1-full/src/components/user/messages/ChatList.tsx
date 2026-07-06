import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Pin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chat as ChatConversation } from '@/lib/types';
import { ID } from './types';

interface ChatListProps {
  visibleChats: ChatConversation[];
  activeChatId: ID;
  onSwitchChat: (id: ID) => void;
  onOpenCreateChat: () => void;
  chatQuery: string;
  setChatQuery: (q: string) => void;
  unreadCountByChat: Record<ID, number>;
  typingUsers: Record<ID, string[]>;
  currentUser: string;
  slimCore?: boolean;
  threadSearchTestId?: string;
  className?: string;
  listTestId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  visibleChats,
  activeChatId,
  onSwitchChat,
  onOpenCreateChat,
  chatQuery,
  setChatQuery,
  unreadCountByChat,
  typingUsers,
  currentUser,
  slimCore = false,
  threadSearchTestId,
  className,
  listTestId,
}) => {
  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col gap-2 overflow-hidden border border-slate-100 bg-white shadow-sm transition-all',
        slimCore ? 'w-52 rounded-lg p-2' : 'w-64 gap-3 rounded-2xl p-4',
        className
      )}
      data-testid={listTestId}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {slimCore ? 'Треды' : 'Conversations'}
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'rounded-lg border border-slate-100 bg-slate-50 text-indigo-600 shadow-sm transition-all hover:bg-slate-900 hover:text-white',
            slimCore ? 'h-9 min-h-11 w-9 min-w-11' : 'h-7 w-7'
          )}
          onClick={onOpenCreateChat}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="group relative">
        <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
        <Input
          data-testid={threadSearchTestId}
          className={cn(
            'rounded-lg border-transparent bg-slate-100 pl-8 text-[10px] font-bold shadow-inner transition-all placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white',
            slimCore ? 'h-11 min-h-11 text-xs' : 'h-8'
          )}
          placeholder={slimCore ? 'Поиск тредов…' : 'ПОИСК КОНТАКТОВ…'}
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          aria-label={slimCore ? 'Поиск тредов' : 'Поиск контактов'}
        />
      </div>

      <ScrollArea className="-mx-2 flex-1 px-2">
        <div className="space-y-1.5">
          {visibleChats.map((c) => {
            const unread = unreadCountByChat[c.id] ?? 0;
            const isActive = c.id === activeChatId;

            const otherParticipants = c.participants?.filter((p) => p.id !== currentUser) || [];
            const isAnyOnline = otherParticipants.some((p) => p.isOnline);
            const statusColor =
              otherParticipants.length === 1
                ? otherParticipants[0].isOnline
                  ? 'bg-emerald-500'
                  : 'bg-slate-300'
                : isAnyOnline
                  ? 'bg-emerald-500'
                  : 'bg-slate-300';

            return (
              <div
                key={c.id}
                className="group/chat-item relative w-full overflow-hidden transition-all"
              >
                <button
                  type="button"
                  data-chat-id={slimCore ? c.id : undefined}
                  data-testid={slimCore ? 'platform-core-comms-thread-item' : undefined}
                  className={cn(
                    'relative flex w-full min-w-0 items-center gap-3 rounded-xl border p-2.5 text-left transition-all',
                    slimCore && 'min-h-11',
                    isActive
                      ? 'border-indigo-100 bg-indigo-50 shadow-sm'
                      : 'border-transparent bg-transparent hover:bg-slate-50'
                  )}
                  onClick={() => onSwitchChat(c.id)}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      className={cn(
                        'border-2 border-white shadow-sm ring-1 ring-slate-100',
                        slimCore ? 'h-7 w-7' : 'h-9 w-9'
                      )}
                    >
                      <AvatarFallback className="bg-slate-100 text-[10px] font-bold uppercase text-slate-400">
                        {c.title[0]}
                      </AvatarFallback>
                      <AvatarImage src={typeof c.avatar === 'string' ? c.avatar : undefined} />
                    </Avatar>
                    <span
                      className={cn(
                        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm',
                        statusColor
                      )}
                    />
                    {unread > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white shadow-lg ring-2 ring-white">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="mb-0.5 flex items-baseline justify-between gap-1.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p
                          className={cn(
                            'truncate text-[11px] font-bold uppercase leading-none tracking-tight',
                            isActive ? 'text-indigo-700' : 'text-slate-900'
                          )}
                        >
                          {c.title}
                        </p>
                        <div className="flex gap-0.5">
                          {c.isPinned && (
                            <Pin className="h-2 w-2 shrink-0 rotate-45 text-indigo-400" />
                          )}
                          {c.isStarred && (
                            <Star className="h-2 w-2 shrink-0 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-[7px] font-bold uppercase tabular-nums text-slate-300">
                        {c.time}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center overflow-hidden">
                      {typingUsers[c.id] && typingUsers[c.id].length > 0 ? (
                        <div className="flex w-full min-w-0 animate-pulse items-center gap-1">
                          <div className="flex shrink-0 gap-0.5">
                            <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400" />
                          </div>
                          <span className="truncate text-[9px] font-bold uppercase tracking-widest text-indigo-600">
                            Typing...
                          </span>
                        </div>
                      ) : (
                        <p className="w-full truncate text-[9px] font-bold uppercase tracking-tight text-slate-400 opacity-60">
                          {c.subtitle || 'NO UPDATES'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
};
