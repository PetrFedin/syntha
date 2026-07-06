'use client';

import { useState } from 'react';
import {
  describeWorkshop2TzExportBundleFailure,
  downloadWorkshop2TzExportBundleApi,
  saveWorkshop2TzExportBundleBlob,
} from '@/lib/platform-core-ports/tz-client';

type Props = {
  collectionId: string;
  articleId: string;
  testId?: string;
};

/** Core: скачивание ZIP ТЗ с понятным статусом при gate-блоке (без тупика). */
export function Workshop2TzExportButton({
  collectionId,
  articleId,
  testId = 'brand-w2-tz-export-btn',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runExport() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await downloadWorkshop2TzExportBundleApi({ collectionId, articleId });
      if (result.ok) {
        saveWorkshop2TzExportBundleBlob(result.blob, result.filename);
        setMessage('Пакет ТЗ скачан (ZIP).');
      } else {
        setMessage(describeWorkshop2TzExportBundleFailure(result));
      }
    } catch {
      setMessage('Сеть недоступна — повторите позже.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex max-w-md flex-col gap-0.5">
      <button
        type="button"
        data-testid={testId}
        disabled={busy}
        onClick={() => void runExport()}
        className="text-accent-primary text-left font-medium hover:underline disabled:opacity-50"
      >
        {busy ? 'Формирование пакета…' : 'Скачать пакет ТЗ →'}
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
