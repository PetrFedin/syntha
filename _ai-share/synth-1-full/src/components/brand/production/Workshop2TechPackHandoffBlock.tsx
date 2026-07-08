'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Workshop2TechPackHandoffRow } from '@/components/brand/production/Workshop2TechPackHandoffRow';
import { Workshop2TechPackHandoffReadiness } from '@/components/brand/production/Workshop2TechPackHandoffReadiness';
import type {
  Workshop2FactoryHandoffChannel,
  Workshop2Phase1TechPackAttachment,
  Workshop2TechPackFactoryHandoff,
  Workshop2TechPackHandoffStatus,
  Workshop2TzActionLogPayload,
} from '@/lib/production/workshop2-dossier-phase1.types';
import {
  W2_TZ_HINT_FOUR_SECTION_SIGNOFFS,
  W2_TZ_HINT_PRODUCTION_EDIT,
} from '@/lib/production/workshop2-tz-rbac-hints';
import { workshop2TechPackCanonicalWizardHintRu } from '@/lib/production/workshop2-tech-pack-canonical-summary';
import { cn } from '@/lib/utils';

function newId() {
  return globalThis.crypto.randomUUID();
}

const CHANNELS: { id: Workshop2FactoryHandoffChannel; label: string }[] = [
  { id: 'portal', label: 'Портал B2B' },
  { id: 'email', label: 'Email' },
  { id: 'edi', label: 'EDI / API' },
  { id: 'zip_download', label: 'ZIP / скачивание' },
  { id: 'other', label: 'Другое' },
];

const STATUSES: { id: Workshop2TechPackHandoffStatus; label: string }[] = [
  { id: 'draft', label: 'Черновик' },
  { id: 'sent', label: 'Отправлено' },
  { id: 'acknowledged', label: 'Принято к рассмотрению' },
  { id: 'accepted', label: 'Принято в работу' },
  { id: 'rejected', label: 'Отклонено' },
  { id: 'amendment_requested', label: 'Нужны правки' },
];

function HandoffDisabledWrap({
  disabled,
  hint,
  children,
}: {
  disabled: boolean;
  hint: string | null;
  children: ReactNode;
}) {
  if (!disabled || !hint) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex max-w-full">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-xs leading-snug">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

export function Workshop2TechPackHandoffBlock({
  handoffs,
  attachments,
  onChangeHandoffs,
  onPulse,
  updatedByLabel,
  tzWriteDisabled,
  handoffMarksUnlocked,
  handoffLockReason,
  blockTitle = 'Фиксация пакета для фабрики',
  commitHandoffOnServer,
}: {
  handoffs: Workshop2TechPackFactoryHandoff[] | undefined;
  attachments: Workshop2Phase1TechPackAttachment[];
  onChangeHandoffs: (next: Workshop2TechPackFactoryHandoff[]) => void;
  onPulse: (action: Workshop2TzActionLogPayload) => void;
  updatedByLabel: string;
  tzWriteDisabled: boolean;
  /** Паспорт, визуал, материалы и конструкция подписаны брендом и технологом — доступны отметки «передано / получено». */
  handoffMarksUnlocked: boolean;
  /** Доп. причина блокировки отметок handoff (например, production pre-flight blocker). */
  handoffLockReason?: string | null;
  /** Заголовок внутри хаба отправки (родитель задаёт единый сценарий). */
  blockTitle?: string;
  /** Server commit + B2B order sync (Platform Core P0 spine). */
  commitHandoffOnServer?: (payload: {
    revisionLabel: string;
    windowNote?: string;
    contactLabel?: string;
    channel: Workshop2FactoryHandoffChannel;
    attachmentIds: string[];
    brandDispatched: { at: string; by: string };
    factoryReceived: { at: string; by: string };
  }) => Promise<boolean>;
}) {
  /** Записи в досье; история внизу показывается только когда «передача» разрешена условиями ТЗ. */
  const storedList = handoffs ?? [];
  const visibleHistoryList = handoffMarksUnlocked ? storedList : [];
  const [rev, setRev] = useState('R1');
  const [windowNote, setWindowNote] = useState('');
  const [contact, setContact] = useState('');
  const [channel, setChannel] = useState<Workshop2FactoryHandoffChannel>('zip_download');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [brandDispatcherOrg, setBrandDispatcherOrg] = useState('');
  const [brandDispatcherBy, setBrandDispatcherBy] = useState('');
  const [factoryReceiverOrg, setFactoryReceiverOrg] = useState('');
  const [factoryReceiverBy, setFactoryReceiverBy] = useState('');
  const [brandDispatched, setBrandDispatched] = useState<{ at: string; by: string } | null>(null);
  const [factoryReceived, setFactoryReceived] = useState<{ at: string; by: string } | null>(null);
  const [committingHandoff, setCommittingHandoff] = useState(false);

  useEffect(() => {
    setBrandDispatcherBy((b) => (b.trim() ? b : updatedByLabel.trim()));
  }, [updatedByLabel]);

  /** При первом появлении вложений — всё в пакет (пока список не обнуляли вручную). */
  const prevAttachmentCount = useRef(0);
  useEffect(() => {
    const n = attachments.length;
    if (n > 0 && prevAttachmentCount.current === 0) {
      const next: Record<string, boolean> = {};
      for (const a of attachments) next[a.attachmentId] = true;
      setPicked(next);
    }
    prevAttachmentCount.current = n;
  }, [attachments]);

  const ids = useMemo(() => attachments.map((a) => a.attachmentId), [attachments]);

  const pickedCount = useMemo(
    () => ids.reduce((n, id) => n + (picked[id] ? 1 : 0), 0),
    [ids, picked]
  );

  const togglePick = useCallback((id: string, v: boolean) => {
    setPicked((p) => ({ ...p, [id]: v }));
  }, []);

  const selectAllAttachments = useCallback(() => {
    if (tzWriteDisabled) return;
    const next: Record<string, boolean> = {};
    for (const id of ids) next[id] = true;
    setPicked(next);
  }, [ids, tzWriteDisabled]);

  const clearAttachmentPicks = useCallback(() => {
    if (tzWriteDisabled) return;
    setPicked({});
  }, [tzWriteDisabled]);

  const resetHandoffDraftMarks = useCallback(() => {
    setBrandDispatched(null);
    setFactoryReceived(null);
    setFactoryReceiverOrg('');
    setFactoryReceiverBy('');
    const label = rev.trim() || 'R1';
    const bump = /^R\s*(\d+)$/i.exec(label);
    setRev(bump ? `R${Number(bump[1]) + 1}` : 'R2');
  }, [rev]);

  const recordSend = useCallback(async () => {
    if (tzWriteDisabled || committingHandoff) return;
    if (!handoffMarksUnlocked) return;
    if (!brandDispatched || !factoryReceived) return;
    const aIds = ids.filter((id) => picked[id]);
    if (aIds.length === 0) return;

    const payload = {
      revisionLabel: rev.trim() || 'R1',
      windowNote: windowNote.trim() || undefined,
      contactLabel: contact.trim() || undefined,
      channel,
      attachmentIds: aIds,
      brandDispatched,
      factoryReceived,
    };

    if (commitHandoffOnServer) {
      setCommittingHandoff(true);
      try {
        const ok = await commitHandoffOnServer(payload);
        if (!ok) return;
        resetHandoffDraftMarks();
      } finally {
        setCommittingHandoff(false);
      }
      return;
    }

    const hid = newId();
    const verifiedTechPackAuditAtSend = attachments
      .filter((a) => aIds.includes(a.attachmentId) && a.canonicalSource === 'object_store_verified')
      .map((a) => ({
        attachmentId: a.attachmentId,
        remoteObjectKey: a.remoteObjectKey?.trim() || undefined,
        integritySha256Full: a.integritySha256Full?.trim().toLowerCase() || undefined,
        remoteSyncedAt: a.remoteSyncedAt?.trim() || undefined,
        objectStoreEtag: a.objectStoreEtag?.trim() || undefined,
      }));
    const row: Workshop2TechPackFactoryHandoff = {
      handoffId: hid,
      createdAt: new Date().toISOString(),
      createdBy: updatedByLabel.slice(0, 200),
      brandDispatchedAt: brandDispatched.at,
      brandDispatchedBy: brandDispatched.by,
      factoryReceivedAt: factoryReceived.at,
      factoryReceivedBy: factoryReceived.by,
      packageRevisionLabel: rev.trim() || 'R1',
      windowNote: windowNote.trim() || undefined,
      contactLabel: contact.trim() || undefined,
      channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
      attachmentIds: aIds,
      ...(verifiedTechPackAuditAtSend.length > 0 ? { verifiedTechPackAuditAtSend } : {}),
    };
    onChangeHandoffs([...storedList, row]);
    resetHandoffDraftMarks();
    const label = row.packageRevisionLabel.trim() || 'R1';
    const act: Workshop2TzActionLogPayload = {
      type: 'tech_pack_handoff',
      handoffId: hid,
      detail:
        `Передача пакета (${row.packageRevisionLabel}, ${CHANNELS.find((c) => c.id === channel)?.label}): вложений ${aIds.length}. ${windowNote.trim() ? `Окно/сроки: ${windowNote.trim()}.` : ''}`.trim(),
    };
    onPulse(act);
  }, [
    brandDispatched,
    channel,
    commitHandoffOnServer,
    committingHandoff,
    contact,
    factoryReceived,
    handoffMarksUnlocked,
    ids,
    onChangeHandoffs,
    onPulse,
    picked,
    resetHandoffDraftMarks,
    rev,
    storedList,
    tzWriteDisabled,
    updatedByLabel,
    windowNote,
    attachments,
  ]);

  const updateStatus = (hid: string, status: Workshop2TechPackHandoffStatus) => {
    if (tzWriteDisabled) return;
    const next = storedList.map((h) => (h.handoffId === hid ? { ...h, status } : h));
    onChangeHandoffs(next);
    onPulse({
      type: 'tech_pack_factory_response',
      handoffId: hid,
      detail: `Статус передачи ${hid.slice(0, 8)}… → ${STATUSES.find((s) => s.id === status)?.label ?? status}`,
    });
  };

  const saveFactoryComment = (hid: string, comment: string, by: string) => {
    if (tzWriteDisabled) return;
    const t = new Date().toISOString();
    const next = storedList.map((h) =>
      h.handoffId === hid
        ? { ...h, factoryComment: comment, factoryResponseAt: t, factoryResponseBy: by }
        : h
    );
    onChangeHandoffs(next);
    onPulse({
      type: 'tech_pack_factory_response',
      handoffId: hid,
      detail: `Комментарий стороны производства: ${comment} (${by || 'аноним'})`,
    });
  };

  const hasVisibleHandoffHistory = visibleHistoryList.length > 0;
  const draftMarksIdle = !brandDispatched && !factoryReceived;

  const canonicalHintRu = useMemo(
    () => workshop2TechPackCanonicalWizardHintRu(attachments),
    [attachments]
  );

  const brandMarkDisabled =
    tzWriteDisabled ||
    !handoffMarksUnlocked ||
    Boolean(brandDispatched) ||
    !brandDispatcherOrg.trim() ||
    !brandDispatcherBy.trim();
  const brandMarkHint: string | null = brandMarkDisabled
    ? tzWriteDisabled
      ? W2_TZ_HINT_PRODUCTION_EDIT
      : !handoffMarksUnlocked
        ? (handoffLockReason ?? W2_TZ_HINT_FOUR_SECTION_SIGNOFFS)
        : brandDispatched
          ? 'Уже отмечено как «бренд передал» для этой попытки. Сбросьте отметки ниже, если нужно заново.'
          : 'Заполните наименование бренда и ФИО передающего.'
    : null;

  const factoryMarkDisabled =
    tzWriteDisabled ||
    !handoffMarksUnlocked ||
    Boolean(factoryReceived) ||
    !factoryReceiverOrg.trim() ||
    !factoryReceiverBy.trim();
  const factoryMarkHint: string | null = factoryMarkDisabled
    ? tzWriteDisabled
      ? W2_TZ_HINT_PRODUCTION_EDIT
      : !handoffMarksUnlocked
        ? (handoffLockReason ?? W2_TZ_HINT_FOUR_SECTION_SIGNOFFS)
        : factoryReceived
          ? 'Уже отмечено как «производство получило». Сбросьте отметки ниже, если нужно заново.'
          : 'Заполните организацию и ФИО на стороне производства.'
    : null;

  const attachAllDisabled = tzWriteDisabled || ids.length === 0;
  const attachAllHint: string | null = attachAllDisabled
    ? tzWriteDisabled
      ? W2_TZ_HINT_PRODUCTION_EDIT
      : 'Нет вложений для выбора.'
    : null;

  const attachClearDisabled = tzWriteDisabled || pickedCount === 0;
  const attachClearHint: string | null = attachClearDisabled
    ? tzWriteDisabled
      ? W2_TZ_HINT_PRODUCTION_EDIT
      : 'Не выбрано ни одного вложения — нечего снимать.'
    : null;
  const handoffReadyPickedCount = ids.reduce((n, id) => n + (picked[id] ? 1 : 0), 0);
  const handoffCommitDisabled =
    tzWriteDisabled ||
    committingHandoff ||
    !handoffMarksUnlocked ||
    !brandDispatched ||
    !factoryReceived ||
    handoffReadyPickedCount === 0;
  const handoffCommitHint = handoffCommitDisabled
    ? committingHandoff
      ? 'Фиксация на сервере…'
      : tzWriteDisabled
        ? W2_TZ_HINT_PRODUCTION_EDIT
        : !handoffMarksUnlocked
          ? (handoffLockReason ?? W2_TZ_HINT_FOUR_SECTION_SIGNOFFS)
          : !brandDispatched
            ? 'Сначала отметьте «Бренд: передано».'
            : !factoryReceived
              ? 'Сначала отметьте «Производство: получено».'
              : 'Выберите минимум одно вложение для передачи.'
    : null;
  const handoffPrimaryStatusTone = handoffCommitDisabled
    ? 'border-amber-200/90 bg-amber-50/80 text-amber-950'
    : 'border-emerald-200/90 bg-emerald-50/80 text-emerald-900';
  const handoffPrimaryStatusText = !handoffMarksUnlocked
    ? 'Сначала подпишите секции ТЗ: паспорт, визуал, материалы, конструкция.'
    : !brandDispatched
      ? 'Отметьте передачу со стороны бренда.'
      : !factoryReceived
        ? 'Отметьте получение со стороны производства.'
        : handoffReadyPickedCount === 0
          ? 'Выберите вложения для передачи.'
          : 'Готово к фиксации. Нажмите «Зафиксировать передачу».';

  return (
    <div className="border-border-subtle space-y-3 rounded-md border bg-zinc-50/70 p-3">
      <div>
        <h3 className="text-text-primary text-sm font-semibold">{blockTitle}</h3>
        <p className="text-text-secondary mt-0.5 text-[11px] leading-snug">
          Заполните ревизию, отметки сторон и состав вложений. Затем зафиксируйте передачу.
        </p>
        <p
          className="text-text-secondary mt-2 rounded-md border border-indigo-200/80 bg-indigo-50/60 px-2 py-1.5 text-[10px] leading-snug text-indigo-950"
          role="note"
          data-testid="w2-tech-pack-canonical-hint"
        >
          {canonicalHintRu}
        </p>
      </div>
      {attachments.length === 0 ? (
        <p className="text-text-secondary text-xs">
          Сначала добавьте вложения в «Конструкция» (лекала/CAD).
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Ревизия пакета</Label>
              <Input
                className="h-8 text-xs"
                value={rev}
                onChange={(e) => setRev(e.target.value)}
                disabled={tzWriteDisabled}
              />
            </div>
            <div>
              <Label className="text-xs">Канал</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as Workshop2FactoryHandoffChannel)}
                disabled={tzWriteDisabled}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Окно / сроки (текст)</Label>
            <Input
              className="h-8 text-xs"
              value={windowNote}
              onChange={(e) => setWindowNote(e.target.value)}
              placeholder="напр. cut week 12, ответ до …"
              disabled={tzWriteDisabled}
            />
          </div>
          <div>
            <Label className="text-xs">Контакт на стороне фабрики (подпись)</Label>
            <Input
              className="h-8 text-xs"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={tzWriteDisabled}
            />
          </div>
          <div className="space-y-1.5 rounded-md border border-dashed border-zinc-300/80 bg-white/70 px-2 py-2">
            <p
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-[10px] font-medium leading-snug',
                handoffPrimaryStatusTone
              )}
              role="status"
            >
              {handoffPrimaryStatusText}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px]">Кто передаёт (бренд)</Label>
                <Input
                  className="h-8 text-xs"
                  value={brandDispatcherOrg}
                  onChange={(e) => setBrandDispatcherOrg(e.target.value)}
                  placeholder="Наименование бренда"
                  disabled={tzWriteDisabled || !handoffMarksUnlocked || Boolean(brandDispatched)}
                />
                <Input
                  className="h-8 text-xs"
                  value={brandDispatcherBy}
                  onChange={(e) => setBrandDispatcherBy(e.target.value)}
                  placeholder="ФИО"
                  disabled={tzWriteDisabled || !handoffMarksUnlocked || Boolean(brandDispatched)}
                />
                <HandoffDisabledWrap disabled={brandMarkDisabled} hint={brandMarkHint}>
                  <Button
                    type="button"
                    size="sm"
                    variant={brandDispatched ? 'secondary' : 'outline'}
                    className="h-8 w-fit text-xs"
                    disabled={brandMarkDisabled}
                    onClick={() =>
                      setBrandDispatched({
                        at: new Date().toISOString(),
                        by: `${brandDispatcherOrg.trim().slice(0, 120)} · ${brandDispatcherBy
                          .trim()
                          .slice(0, 120)}`,
                      })
                    }
                  >
                    Бренд: передано
                  </Button>
                </HandoffDisabledWrap>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px]">Кто принял (производство)</Label>
                <Input
                  className="h-8 text-xs"
                  value={factoryReceiverOrg}
                  onChange={(e) => setFactoryReceiverOrg(e.target.value)}
                  placeholder="Наименование организации"
                  disabled={tzWriteDisabled || !handoffMarksUnlocked || Boolean(factoryReceived)}
                />
                <Input
                  className="h-8 text-xs"
                  value={factoryReceiverBy}
                  onChange={(e) => setFactoryReceiverBy(e.target.value)}
                  placeholder="ФИО"
                  disabled={tzWriteDisabled || !handoffMarksUnlocked || Boolean(factoryReceived)}
                />
                <HandoffDisabledWrap disabled={factoryMarkDisabled} hint={factoryMarkHint}>
                  <Button
                    type="button"
                    size="sm"
                    variant={factoryReceived ? 'secondary' : 'outline'}
                    className="h-8 w-fit text-xs"
                    disabled={factoryMarkDisabled}
                    onClick={() =>
                      setFactoryReceived({
                        at: new Date().toISOString(),
                        by: `${factoryReceiverOrg.trim().slice(0, 120)} · ${factoryReceiverBy
                          .trim()
                          .slice(0, 120)}`,
                      })
                    }
                  >
                    Производство: получено
                  </Button>
                </HandoffDisabledWrap>
              </div>
            </div>
            {handoffMarksUnlocked ? (
              <details className="border-border-subtle/80 bg-bg-surface2/40 rounded-md border px-2 py-1.5">
                <summary className="text-text-secondary cursor-pointer list-none text-[10px] font-semibold [&::-webkit-details-marker]:hidden">
                  Детали черновика передачи
                </summary>
                <div className="text-text-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px]">
                  {brandDispatched ? (
                    <span>
                      Бренд: {new Date(brandDispatched.at).toLocaleString('ru-RU')} ·{' '}
                      {brandDispatched.by}
                    </span>
                  ) : (
                    <span>Бренд: не отмечен</span>
                  )}
                  <span className="text-border-default hidden sm:inline">|</span>
                  {factoryReceived ? (
                    <span>
                      Производство: {new Date(factoryReceived.at).toLocaleString('ru-RU')} ·{' '}
                      {factoryReceived.by}
                    </span>
                  ) : (
                    <span>Производство: не отмечено</span>
                  )}
                </div>
              </details>
            ) : null}
            {draftMarksIdle && hasVisibleHandoffHistory ? (
              <p className="text-text-muted text-[9px] leading-snug">
                Строка выше — только про <span className="font-medium">следующую</span> попытку
                передачи. После фиксации пакета отметки сбрасываются; уже сохранённые передачи
                перечислены ниже (R1…).
              </p>
            ) : null}
            {!tzWriteDisabled && handoffMarksUnlocked && (brandDispatched || factoryReceived) ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-fit px-2 text-[10px] font-medium"
                onClick={() => {
                  setBrandDispatched(null);
                  setFactoryReceived(null);
                }}
              >
                Сбросить отметки
              </Button>
            ) : null}
            <Workshop2TechPackHandoffReadiness
              handoffMarksUnlocked={handoffMarksUnlocked}
              brandDispatched={Boolean(brandDispatched)}
              factoryReceived={Boolean(factoryReceived)}
              selectedAttachmentsCount={handoffReadyPickedCount}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-text-secondary text-[10px]">Включить в пакет</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-text-secondary tabular-nums">
                {pickedCount}/{ids.length}
              </span>
              <HandoffDisabledWrap disabled={attachAllDisabled} hint={attachAllHint}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-[10px]"
                  disabled={attachAllDisabled}
                  onClick={selectAllAttachments}
                >
                  Все
                </Button>
              </HandoffDisabledWrap>
              <HandoffDisabledWrap disabled={attachClearDisabled} hint={attachClearHint}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-[10px]"
                  disabled={attachClearDisabled}
                  onClick={clearAttachmentPicks}
                >
                  Снять
                </Button>
              </HandoffDisabledWrap>
            </div>
          </div>
          <ul className="max-h-32 space-y-1 overflow-y-auto pr-1">
            {attachments.map((a) => (
              <li key={a.attachmentId} className="flex items-center gap-2 text-[11px]">
                <HandoffDisabledWrap
                  disabled={tzWriteDisabled}
                  hint={tzWriteDisabled ? W2_TZ_HINT_PRODUCTION_EDIT : null}
                >
                  <Checkbox
                    checked={Boolean(picked[a.attachmentId])}
                    disabled={tzWriteDisabled}
                    onCheckedChange={(v) => togglePick(a.attachmentId, v === true)}
                  />
                </HandoffDisabledWrap>
                <span className="min-w-0 truncate">{a.fileName}</span>
              </li>
            ))}
          </ul>
          <div className="pt-1">
            <HandoffDisabledWrap disabled={handoffCommitDisabled} hint={handoffCommitHint}>
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs"
                disabled={handoffCommitDisabled}
                onClick={() => void recordSend()}
              >
                {committingHandoff ? 'Фиксация…' : 'Зафиксировать передачу'}
              </Button>
            </HandoffDisabledWrap>
          </div>
        </div>
      )}

      {hasVisibleHandoffHistory ? (
        <div className="space-y-2 border-t border-dashed pt-2">
          <p className="text-text-primary text-[10px] font-semibold">История передач</p>
          <p className="text-text-muted text-[9px] leading-snug">
            «Бренд передал» / «Производство приняло» здесь — из записи ревизии пакета (архив), а не
            из неактивных кнопок выше.
          </p>
          <ul className="space-y-3">
            {visibleHistoryList.map((h) => (
              <Workshop2TechPackHandoffRow
                key={h.handoffId}
                row={h}
                attachments={attachments}
                statuses={STATUSES}
                onStatus={updateStatus}
                onSaveFactoryComment={saveFactoryComment}
                tzWriteDisabled={tzWriteDisabled}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
