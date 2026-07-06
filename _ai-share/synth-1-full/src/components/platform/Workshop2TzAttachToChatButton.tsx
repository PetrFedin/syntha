'use client';

import { useState } from 'react';
import { attachWorkshop2TzBundleToArticleChat } from '@/lib/platform-core-ports/tz-client';

type Props = {
  collectionId: string;
  articleId: string;
  testId?: string;
};

/** Core: прикрепить ZIP ТЗ в contextual chat артикула (без тупика). */
export function Workshop2TzAttachToChatButton({
  collectionId,
  articleId,
  testId = 'brand-w2-tz-attach-chat-btn',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runAttach() {
    setBusy(true);
    setMessage(null);
    const result = await attachWorkshop2TzBundleToArticleChat({ collectionId, articleId });
    if (result.ok) {
      setMessage('Пакет ТЗ отправлен в чат артикула.');
    } else {
      setMessage(result.message ?? 'Не удалось прикрепить ТЗ.');
    }
    setBusy(false);
  }

  return (
    <span className="inline-flex max-w-md flex-col gap-0.5">
      <button
        type="button"
        data-testid={testId}
        disabled={busy}
        onClick={() => void runAttach()}
        className="text-accent-primary text-left font-medium hover:underline disabled:opacity-50"
      >
        {busy ? 'Отправка в чат…' : 'Отправить ТЗ в чат →'}
      </button>
      {message ? (
        <span
          className="text-text-muted text-[10px] leading-snug"
          data-testid={`${testId}-status`}
          role="status"
        >
          {message}
        </span>
      ) : null}
    </span>
  );
}
