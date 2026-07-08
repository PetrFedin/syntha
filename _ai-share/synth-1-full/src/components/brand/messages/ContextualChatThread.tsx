'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ContextualMessage } from '@/app/api/messages/contextual/route';
import { useContextualChatPoll } from '@/lib/communications/use-contextual-chat-poll';
import { useContextualChatSse } from '@/lib/communications/use-contextual-chat-sse';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

interface ContextualChatThreadProps {
  contextType: string;
  contextId: string;
  className?: string;
}

function renderMessageBody(message: string) {
  const linkRe = /\[📎 ([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(message)) !== null) {
    if (match.index > last) {
      parts.push(message.slice(last, match.index));
    }
    const label = match[1];
    const href = match[2];
    parts.push(
      <a
        key={`${match.index}-${href}`}
        href={href}
        className="text-accent-primary font-medium underline"
        data-testid="contextual-chat-attachment-link"
        download
      >
        📎 {label}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < message.length) parts.push(message.slice(last));
  return parts.length ? parts : message;
}

export function ContextualChatThread({
  contextType,
  contextId,
  className,
}: ContextualChatThreadProps) {
  const [messages, setMessages] = useState<ContextualMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/messages/contextual?contextType=${encodeURIComponent(contextType)}&contextId=${encodeURIComponent(contextId)}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = (await res.json()) as { messages?: ContextualMessage[] };
        setMessages(data.messages ?? []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contextType, contextId]);

  useEffect(() => {
    setIsLoading(true);
    void fetchMessages();
  }, [fetchMessages]);

  const { live: sseLive } = useContextualChatSse(contextType, contextId, () => {
    void fetchMessages();
  });

  const { polling } = useContextualChatPoll(
    contextType,
    contextId,
    () => {
      void fetchMessages();
    },
    sseLive ? 45_000 : 15_000
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages/contextual', {
        method: 'POST',
        headers: buildWorkshop2ApiRequestHeaders(),
        body: JSON.stringify({
          contextType,
          contextId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { message: ContextualMessage };
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={cn(
        'bg-bg-surface border-border-default flex h-full flex-col overflow-hidden rounded-md border',
        className
      )}
      data-testid="contextual-chat-thread"
    >
      <div className="border-border-default flex items-center gap-2 border-b px-3 py-1.5">
        <RefreshCw
          className={cn('h-3 w-3', sseLive || polling ? 'text-emerald-600' : 'text-text-muted')}
          aria-hidden
        />
        {sseLive ? (
          <span
            className="text-[10px] font-medium text-emerald-700"
            data-testid="contextual-chat-sse-live-badge"
          >
            live · SSE
          </span>
        ) : (
          <span className="text-text-muted text-[10px]">
            {polling ? 'обновление каждые 15 с' : 'ожидание контекста'}
          </span>
        )}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="text-text-muted h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-text-muted flex h-full items-center justify-center text-sm">
            Нет сообщений. Напишите первым!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-text-primary text-xs font-medium">{msg.sender}</span>
                <span className="text-text-muted text-xs">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className="bg-bg-surface2 text-text-primary rounded-md rounded-tl-none p-3 text-sm"
                data-testid={
                  msg.message.includes('[📎 ')
                    ? 'contextual-chat-message-with-attachment'
                    : undefined
                }
              >
                {renderMessageBody(msg.message)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-border-default bg-bg-surface border-t p-3">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
