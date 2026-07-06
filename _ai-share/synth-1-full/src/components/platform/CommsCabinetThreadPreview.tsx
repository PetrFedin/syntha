'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  commsCabinetRolePrefix,
  commsCabinetThreadWorkspaceHref,
  type CommsCabinetVariant,
} from '@/lib/platform-core-ports/communications/comms-cabinet-thread-nav';
import {
  commsCabinetThreadRowKey,
  COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY,
} from '@/lib/platform-core-ports/communications/comms-cabinet-thread-keys';
import { commsHubThreadLabel } from '@/lib/platform-core-ports/communications/comms-hub-inbox-rows';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/platform-core-ports/b2b-order-lifecycle';
import { useCommsSectionContextAutoThread } from '@/hooks/use-comms-section-context-auto-thread';
import { useCommsHubMergedThreads } from '@/hooks/use-comms-hub-merged-threads';
import { useCommsCabinetThreadMessages } from '@/hooks/use-comms-cabinet-thread-messages';
import { useCommsCabinetSplitSelectionOptional } from '@/components/platform/CommsCabinetSplitProvider';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';

type Props = {
  variant: CommsCabinetVariant;
  collectionId: string;
  orderId: string;
  disabled?: boolean;
  className?: string;
};

/** lg+ split panel: live preview of selected thread (messages + open CTA). */
export function CommsCabinetThreadPreview({
  variant,
  collectionId,
  orderId,
  disabled,
  className,
}: Props) {
  const prefix = commsCabinetRolePrefix(variant);
  const splitSelection = useCommsCabinetSplitSelectionOptional();
  const selectedThreadKey = splitSelection?.selectedThreadKey ?? null;
  const sectionContextRow = useCommsSectionContextAutoThread({
    variant,
    collectionId,
    orderId,
    disabled,
    enabled: !disabled,
  });
  const { loaded, mergedThreads, poByOrderId } = useCommsHubMergedThreads({
    variant,
    collectionId,
    orderId,
    disabled,
  });

  const activeOrder = orderId.trim();
  const selectedThread = useMemo(() => {
    if (!selectedThreadKey || selectedThreadKey === COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY) {
      return null;
    }
    return mergedThreads.find((t) => commsCabinetThreadRowKey(t) === selectedThreadKey) ?? null;
  }, [mergedThreads, selectedThreadKey]);

  const fallbackThread =
    mergedThreads.find(
      (t) =>
        t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE &&
        t.contextId?.trim() === activeOrder
    ) ??
    mergedThreads.find((t) => t.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE) ??
    mergedThreads[0] ??
    null;

  const thread = selectedThread ?? fallbackThread;
  const sectionContextActive =
    selectedThreadKey === COMMS_CABINET_SECTION_CONTEXT_THREAD_KEY && Boolean(sectionContextRow);

  const href = sectionContextActive
    ? sectionContextRow?.href ?? null
    : thread
      ? commsCabinetThreadWorkspaceHref(variant, thread)
      : null;
  const label = sectionContextActive
    ? (sectionContextRow?.label ?? 'Контекст раздела')
    : thread
      ? commsHubThreadLabel(thread, poByOrderId)
      : 'Чат';

  const { messages, loading: messagesLoading } = useCommsCabinetThreadMessages(
    sectionContextActive ? undefined : thread?.contextType,
    sectionContextActive ? undefined : thread?.contextId?.trim()
  );

  const previewFallback =
    thread?.lastMessagePreview?.trim() ||
    (loaded ? 'Треды появятся после первого сообщения' : 'Загрузка…');

  return (
    <section
      className={cn('hidden min-w-0 flex-col lg:flex', className)}
      data-testid="comms-cabinet-thread-preview"
    >
      <p className={hubSectionLabelClassName()}>Превью треда</p>
      <div className="border-border-subtle bg-bg-surface1 flex min-h-[12rem] flex-1 flex-col rounded-xl border p-3">
        <div className="mb-2 flex items-start gap-2">
          <MessageSquare className="text-text-muted mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-text-primary truncate text-[13px] font-semibold leading-snug">
              {label}
            </p>
            {thread?.messageCount ? (
              <p className="text-text-muted text-[11px]">
                {thread.messageCount}{' '}
                {thread.messageCount === 1 ? 'сообщение' : 'сообщений'}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
          data-testid={`${prefix}-thread-preview-messages`}
        >
          {messagesLoading ? (
            <p className="text-text-muted text-[11px]">Загрузка сообщений…</p>
          ) : messages.length > 0 ? (
            messages.map((m) => (
              <div
                key={String(m.id)}
                className="bg-bg-surface2/80 rounded-lg px-2.5 py-2"
                data-testid={`${prefix}-thread-preview-message`}
              >
                <p className="text-text-muted text-[11px] font-medium">{m.user}</p>
                <p className="text-text-secondary text-[13px] leading-relaxed">{m.text}</p>
                {m.time ? (
                  <p className="text-text-muted mt-0.5 text-[11px] tabular-nums">{m.time}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-text-secondary text-[13px] leading-relaxed">{previewFallback}</p>
          )}
        </div>

        {href ? (
          <Button size="sm" className="mt-3 w-full shrink-0" asChild>
            <Link href={href} data-testid={`${prefix}-thread-preview-open`}>
              Открыть чат
            </Link>
          </Button>
        ) : (
          <p
            className="text-text-muted mt-3 shrink-0 text-[11px]"
            data-testid={`${prefix}-thread-preview-empty`}
          >
            Выберите тред слева
          </p>
        )}
      </div>
    </section>
  );
}
