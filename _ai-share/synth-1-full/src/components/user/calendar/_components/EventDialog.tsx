import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarEvent, Layer, Visibility, EventType } from '@/lib/types/calendar';
import { LAYERS } from '../constants';
import { ParticipantPicker } from './ParticipantPicker';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calendarMessagesHrefFromThreadChatId } from '@/lib/platform-core-calendar-thread-link';

interface EventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  draft: Partial<CalendarEvent>;
  setDraft: (draft: Partial<CalendarEvent>) => void;
  onSave: () => void;
  onDelete?: () => void;
  currentRole: string;
  /** Участник с pending — показать Принять/Отклонить вместо редактирования */
  onAccept?: () => void;
  onReject?: () => void;
  isPendingInvitee?: boolean;
}

export function EventDialog({
  isOpen,
  onOpenChange,
  mode,
  draft,
  setDraft,
  onSave,
  onDelete,
  currentRole,
  onAccept,
  onReject,
  isPendingInvitee = false,
}: EventDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const participants = draft.participants ?? [];
  const readOnly = isPendingInvitee;
  const threadOwnerRole = (draft.ownerRole ?? currentRole) as CalendarEvent['ownerRole'];
  const threadMessagesHref =
    draft.targetChatId && threadOwnerRole
      ? calendarMessagesHrefFromThreadChatId(draft.targetChatId, threadOwnerRole)
      : undefined;
  const isPlatformB2bEvent = draft.calendarId === 'workshop2-b2b';
  const platformEventReadOnly = isPlatformB2bEvent || readOnly;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isPlatformB2bEvent
              ? 'Событие цепочки'
              : mode === 'create'
                ? 'Новое событие'
                : 'Редактирование события'}
          </DialogTitle>
          <DialogDescription>
            {isPlatformB2bEvent
              ? 'Слот из оптовых заказов и производства — редактирование недоступно.'
              : 'Заполните детали события для календаря.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div key="title" className="grid gap-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) =>
                !platformEventReadOnly && setDraft({ ...draft, title: e.target.value })
              }
              placeholder="Название события"
              readOnly={platformEventReadOnly}
            />
          </div>
          <div key="description" className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={draft.description ?? ''}
              onChange={(e) =>
                !platformEventReadOnly && setDraft({ ...draft, description: e.target.value })
              }
              placeholder="Описание события"
              readOnly={platformEventReadOnly}
            />
          </div>
          {threadMessagesHref ? (
            <div className="border-border-subtle bg-bg-surface2/80 rounded-md border p-2 text-xs">
              <p className="text-text-secondary mb-1">Переписка по этому событию</p>
              <Link
                href={threadMessagesHref}
                data-testid="calendar-event-thread-link"
                className="text-accent-primary font-medium underline underline-offset-2"
              >
                Открыть чат
              </Link>
            </div>
          ) : null}
          {(draft.linkedPinId || draft.sketchPageUrl) && (
            <div className="border-accent-primary/20 bg-accent-primary/10 text-accent-primary rounded-md border p-2 text-xs">
              {draft.linkedPinId ? (
                <p className="font-mono text-[11px]">
                  Метка скетча:{' '}
                  <span className="text-accent-primary">{draft.linkedPinId.slice(0, 12)}…</span>
                </p>
              ) : null}
              {draft.sketchPageUrl ? (
                <p className="mt-1">
                  <Link
                    href={draft.sketchPageUrl}
                    className="text-accent-primary font-medium underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть страницу со скетчем
                  </Link>
                </p>
              ) : null}
            </div>
          )}
          <div key="dates" className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="start">Начало</Label>
              <Input
                id="start"
                type="datetime-local"
                value={draft.startAt}
                onChange={(e) => !readOnly && setDraft({ ...draft, startAt: e.target.value })}
                readOnly={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">Конец</Label>
              <Input
                id="end"
                type="datetime-local"
                value={draft.endAt}
                onChange={(e) => !readOnly && setDraft({ ...draft, endAt: e.target.value })}
                readOnly={readOnly}
              />
            </div>
          </div>
          <div key="meta" className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="layer">Слой</Label>
              <Select
                value={draft.layer}
                onValueChange={(v: Layer) => setDraft({ ...draft, layer: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Слой" />
                </SelectTrigger>
                <SelectContent>
                  {LAYERS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility">Видимость</Label>
              <Select
                value={draft.visibility}
                onValueChange={(v: Visibility) => setDraft({ ...draft, visibility: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Видимость" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="personal" value="personal">
                    Личное
                  </SelectItem>
                  <SelectItem key="internal" value="internal">
                    Внутреннее
                  </SelectItem>
                  <SelectItem key="partial" value="partial">
                    Частичное
                  </SelectItem>
                  <SelectItem key="public" value="public">
                    Публичное
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div key="participants" className="grid gap-2">
            <Label>Участники</Label>
            <ParticipantPicker
              participants={participants}
              onChange={(p) => !readOnly && setDraft({ ...draft, participants: p })}
              currentUserId={user?.uid ?? ''}
              currentOrgId={user?.activeOrganizationId ?? undefined}
              disabled={readOnly}
            />
          </div>
          {currentRole === 'brand' && (
            <div key="mystery" className="flex items-center space-x-2">
              <Switch
                id="is-mystery"
                checked={draft.isMystery}
                onCheckedChange={(checked) => setDraft({ ...draft, isMystery: checked })}
              />
              <Label htmlFor="is-mystery">Mystery Event (Скрытые детали)</Label>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {isPlatformB2bEvent ? (
            <div className="flex w-full justify-end gap-2">
              {threadMessagesHref ? (
                <Button
                  type="button"
                  data-testid="calendar-event-chat-button"
                  data-href={threadMessagesHref}
                  onClick={() => {
                    onOpenChange(false);
                    router.push(threadMessagesHref);
                  }}
                >
                  Чат
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Закрыть
              </Button>
            </div>
          ) : isPendingInvitee && onAccept && onReject ? (
            <div className="flex w-full gap-2 sm:justify-end">
              <Button variant="outline" onClick={onReject}>
                Отклонить
              </Button>
              <Button onClick={onAccept}>Принять</Button>
            </div>
          ) : (
            <>
              {mode === 'edit' && onDelete && (
                <Button key="delete" variant="destructive" onClick={onDelete}>
                  Удалить
                </Button>
              )}
              <div key="actions" className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Отмена
                </Button>
                <Button onClick={onSave} data-testid="calendar-event-save-btn">
                  Сохранить
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
