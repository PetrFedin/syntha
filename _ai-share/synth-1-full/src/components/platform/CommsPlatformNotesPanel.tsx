'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Paperclip, StickyNote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  createPlatformCoreNote,
  listPlatformCoreNotes,
  PLATFORM_CORE_NOTE_ASSIGNEES,
  updatePlatformCoreNoteStatus,
  type PlatformCoreNote,
} from '@/lib/platform-core-notes';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';

type Props = {
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  collectionId: string;
  orderId?: string;
  className?: string;
};

function roleIdFromVariant(variant: Props['variant']): CoreChainRoleId {
  if (variant === 'manufacturer') return 'manufacturer';
  if (variant === 'supplier') return 'supplier';
  return variant;
}

function statusBadge(note: PlatformCoreNote) {
  if (note.status === 'accepted') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-800"
        data-testid={`comms-note-status-${note.id}-accepted`}
      >
        <Check className="mr-0.5 h-3 w-3" aria-hidden />
        Принято
      </Badge>
    );
  }
  if (note.status === 'cancelled') {
    return (
      <Badge
        variant="outline"
        className="border-rose-200 bg-rose-50 text-[10px] text-rose-800"
        data-testid={`comms-note-status-${note.id}-cancelled`}
      >
        Отменена
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px]" data-testid={`comms-note-status-${note.id}-open`}>
      В работе
    </Badge>
  );
}

function formatDue(dueAt: string | null): string | null {
  if (!dueAt) return null;
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dueAt));
  } catch {
    return dueAt;
  }
}

/** Inbox заметок столпа «Связь»: назначение, срок, уведомление, вложение, статус. */
export function CommsPlatformNotesPanel({ variant, collectionId, orderId, className }: Props) {
  const roleId = roleIdFromVariant(variant);
  const testPrefix =
    variant === 'brand'
      ? 'brand-cm-notes'
      : variant === 'shop'
        ? 'shop-cm-notes'
        : variant === 'manufacturer'
          ? 'mfr-cm-notes'
          : 'sup-cm-notes';

  const [notes, setNotes] = useState<PlatformCoreNote[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [assigneeId, setAssigneeId] = useState(PLATFORM_CORE_NOTE_ASSIGNEES[0].id);
  const [dueAt, setDueAt] = useState('');
  const [notify, setNotify] = useState(true);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(null);

  const reload = useCallback(() => {
    setNotes(listPlatformCoreNotes(collectionId, roleId));
  }, [collectionId, roleId]);

  useEffect(() => {
    reload();
    const onChange = () => reload();
    window.addEventListener('platform-core-notes-changed', onChange);
    return () => window.removeEventListener('platform-core-notes-changed', onChange);
  }, [reload]);

  const openCount = useMemo(() => notes.filter((n) => n.status === 'open').length, [notes]);

  function onAttachFile(file: File | null) {
    if (!file) {
      setAttachmentName(null);
      setAttachmentDataUrl(null);
      return;
    }
    if (file.size > 512_000) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentName(file.name);
      setAttachmentDataUrl(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const assignee = PLATFORM_CORE_NOTE_ASSIGNEES.find((a) => a.id === assigneeId);
    createPlatformCoreNote({
      collectionId,
      roleId,
      title,
      body,
      assigneeId,
      assigneeLabel: assignee?.label,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      notify,
      attachmentName,
      attachmentDataUrl,
      sourceLabel: orderId ? `Заказ · ${orderId}` : null,
    });
    setTitle('');
    setBody('');
    setDueAt('');
    setAttachmentName(null);
    setAttachmentDataUrl(null);
    reload();
  }

  return (
    <div
      className={cn('space-y-4', className)}
      data-testid={`${testPrefix}-panel`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StickyNote className="text-text-muted h-4 w-4" aria-hidden />
          <p className="text-text-primary text-[13px] font-semibold">Заметки</p>
          {openCount > 0 ? (
            <span
              className="bg-accent-primary inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
              data-testid={`${testPrefix}-open-badge`}
            >
              {openCount}
            </span>
          ) : null}
        </div>
        <p className="text-text-muted text-[11px]">Со всей платформы · один inbox</p>
      </div>

      <form
        onSubmit={onCreate}
        className="border-border-subtle space-y-2 rounded-xl border bg-bg-surface p-3"
        data-testid={`${testPrefix}-create-form`}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок заметки"
          className="h-9 text-[13px]"
          data-testid={`${testPrefix}-title-input`}
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Описание, контекст, шаги…"
          rows={3}
          className="text-[13px]"
          data-testid={`${testPrefix}-body-input`}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-text-muted block text-[11px]">
            Кому
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="border-border-subtle mt-1 h-9 w-full rounded-md border bg-bg-surface px-2 text-[13px]"
              data-testid={`${testPrefix}-assignee-select`}
            >
              {PLATFORM_CORE_NOTE_ASSIGNEES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-text-muted block text-[11px]">
            Срок реализации
            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="mt-1 h-9 text-[13px]"
              data-testid={`${testPrefix}-due-input`}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-text-secondary inline-flex items-center gap-1.5 text-[12px]">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              data-testid={`${testPrefix}-notify-checkbox`}
            />
            Уведомить исполнителя
          </label>
          <label className="text-text-secondary inline-flex cursor-pointer items-center gap-1.5 text-[12px]">
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
            <span>Файл</span>
            <input
              type="file"
              className="sr-only"
              onChange={(e) => onAttachFile(e.target.files?.[0] ?? null)}
              data-testid={`${testPrefix}-file-input`}
            />
          </label>
          {attachmentName ? (
            <span className="text-text-muted text-[11px]">{attachmentName}</span>
          ) : null}
        </div>
        <Button type="submit" size="sm" className="h-9" data-testid={`${testPrefix}-submit`}>
          Добавить заметку
        </Button>
      </form>

      <ul className="space-y-2" data-testid={`${testPrefix}-list`}>
        {notes.length === 0 ? (
          <li className="text-text-muted py-6 text-center text-[13px] italic">Нет заметок</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="border-border-subtle rounded-xl border bg-bg-surface p-3"
              data-testid={`${testPrefix}-item-${note.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-text-primary text-[13px] font-medium">{note.title}</p>
                  {note.body ? (
                    <p className="text-text-secondary whitespace-pre-wrap text-[12px] leading-relaxed">
                      {note.body}
                    </p>
                  ) : null}
                  <p className="text-text-muted text-[11px]">
                    {note.assigneeLabel}
                    {formatDue(note.dueAt) ? ` · до ${formatDue(note.dueAt)}` : ''}
                    {note.notify ? ' · уведомление' : ''}
                  </p>
                  {note.sourceLabel ? (
                    <p className="text-text-muted text-[10px]">Источник: {note.sourceLabel}</p>
                  ) : null}
                  {note.attachmentName && note.attachmentDataUrl ? (
                    <a
                      href={note.attachmentDataUrl}
                      download={note.attachmentName}
                      className="text-accent-primary inline-flex items-center gap-1 text-[11px] underline"
                      data-testid={`${testPrefix}-attachment-${note.id}`}
                    >
                      <Paperclip className="h-3 w-3" aria-hidden />
                      {note.attachmentName}
                    </a>
                  ) : null}
                  {note.sourceHref ? (
                    <Link href={note.sourceHref} className="text-accent-primary text-[11px] underline">
                      Перейти к контексту
                    </Link>
                  ) : null}
                </div>
                {statusBadge(note)}
              </div>
              {note.status === 'open' ? (
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    onClick={() => {
                      updatePlatformCoreNoteStatus(collectionId, roleId, note.id, 'accepted');
                      reload();
                    }}
                    data-testid={`${testPrefix}-accept-${note.id}`}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" aria-hidden />
                    Принято
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 border-rose-200 text-rose-800 hover:bg-rose-50"
                    onClick={() => {
                      updatePlatformCoreNoteStatus(collectionId, roleId, note.id, 'cancelled');
                      reload();
                    }}
                    data-testid={`${testPrefix}-cancel-${note.id}`}
                  >
                    <X className="mr-1 h-3.5 w-3.5" aria-hidden />
                    Отменить
                  </Button>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
