'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  text: string;
  at: string;
};

type SessionMeta = {
  sessionId: string;
  taskId: string;
  taskTitle: string;
  status: string;
};

function formatAgentStatusLabel(status: string, running: boolean): string {
  if (running || status === 'streaming' || status === 'running' || status === 'starting') {
    return 'В работе';
  }
  if (status === 'done') return 'Готово';
  if (status === 'error') return 'Ошибка';
  if (status === 'offline') return 'Офлайн';
  if (status === 'connecting') return 'Подключение…';
  return status;
}

type Props = {
  sessionId: string | null;
  taskTitle?: string;
  onClose: () => void;
  layout?: 'float' | 'dock';
  onStatusChange?: (status: string) => void;
};

export function PlatformCoreAgentChat({
  sessionId,
  taskTitle,
  onClose,
  layout = 'float',
  onStatusChange,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meta, setMeta] = useState<SessionMeta | null>(null);
  const [status, setStatus] = useState<string>('connecting');
  const scrollRef = useRef<HTMLDivElement>(null);

  const poll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const r = await fetch(`/api/dev/platform-core/planner/session/${sessionId}`, {
        cache: 'no-store',
      });
      if (!r.ok) return;
      const j = (await r.json()) as {
        messages: ChatMessage[];
        meta: SessionMeta | null;
        status: string;
      };
      setMessages(j.messages);
      setMeta(j.meta);
      setStatus(j.status);
      onStatusChange?.(j.status);
    } catch {
      setStatus('offline');
      onStatusChange?.('offline');
    }
  }, [sessionId, onStatusChange]);

  useEffect(() => {
    if (!sessionId) return;
    void poll();
    const id = window.setInterval(() => void poll(), 1500);
    return () => window.clearInterval(id);
  }, [sessionId, poll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (!sessionId) return null;

  const title = meta?.taskTitle ?? taskTitle ?? 'Задача агента';
  const running = status === 'running' || status === 'streaming' || status === 'starting';
  const statusLabel = formatAgentStatusLabel(status, running);

  return (
    <div
      data-testid="planner-agent-chat"
      className={cn(
        'border-border-subtle flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm',
        layout === 'float' &&
          'fixed bottom-4 right-4 z-50 h-[min(480px,70vh)] w-[min(400px,92vw)] shadow-2xl',
        layout === 'dock' && 'h-full min-h-[420px]'
      )}
    >
      <header className="border-border-subtle flex items-start justify-between gap-2 border-b px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-text-primary text-[12px] font-semibold">Агент</p>
          <p className="text-text-muted truncate text-[10px]">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
              running && 'bg-blue-100 text-blue-800',
              status === 'done' && 'bg-emerald-100 text-emerald-800',
              status === 'error' && 'bg-red-100 text-red-800',
              !running && status !== 'done' && status !== 'error' && 'bg-slate-100 text-slate-600'
            )}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            className="text-text-muted hover:text-text-primary text-lg leading-none"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {messages.length === 0 ? (
          <p className="text-text-muted py-8 text-center text-[11px]">
            {running ? 'Агент сканирует репозиторий… ответ появится здесь' : 'Ожидание ответа агента…'}
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.at}-${i}`}
              className={cn(
                'rounded-lg px-2.5 py-2 text-[11px] leading-relaxed',
                m.role === 'user' && 'bg-accent-primary/10 ml-2',
                m.role === 'assistant' && 'bg-slate-50 mr-1',
                m.role === 'system' && 'border border-amber-200/80 bg-amber-50/80 text-amber-950'
              )}
            >
              <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
