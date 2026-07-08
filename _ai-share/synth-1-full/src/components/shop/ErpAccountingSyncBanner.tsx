'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import type { ErpAccountingSyncStatus } from '@/lib/b2b/erp-accounting-sync-service';
import { cn } from '@/lib/utils';

const CLIENT_FALLBACK: ErpAccountingSyncStatus = {
  lastSuccessAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  systemLabel: '1С / УТ',
  pendingInQueue: 0,
  lastError: null,
  health: 'ok',
  connectorId: 'b2b-platform',
  lastSyncJobCompletedAt: null,
};

type Props = {
  className?: string;
  settingsHref?: string;
  /** На странице настроек синка — скрыть ссылку «Синхронизация». */
  hideSettingsLink?: boolean;
};

/** Блок доверия: последний обмен с учётом; данные с GET `/api/shop/erp-sync-status`. */
export function ErpAccountingSyncBanner({
  className,
  settingsHref = LEGACY_ROUTES.shop.b2bShopifySync,
  hideSettingsLink = false,
}: Props) {
  const [status, setStatus] = useState<ErpAccountingSyncStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/shop/erp-sync-status')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: unknown) => {
        const s = data as ErpAccountingSyncStatus;
        if (!cancelled && s?.lastSuccessAt) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setStatus(CLIENT_FALLBACK);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const s = status ?? CLIENT_FALLBACK;
  const time = new Date(s.lastSuccessAt).toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const health = s.health ?? 'ok';
  const borderHealth =
    health === 'error'
      ? 'border-rose-300/90 bg-rose-50/50'
      : health === 'degraded'
        ? 'border-amber-200/80 bg-amber-50/40'
        : '';

  return (
    <div
      className={cn(
        'border-border-subtle bg-bg-surface2/90 text-text-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px]',
        failed && 'border-amber-200/80 bg-amber-50/40',
        !failed && borderHealth,
        className
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <p>
          {!status && !failed ? (
            <span className="text-text-muted">Загрузка статуса учёта…</span>
          ) : (
            <>
              <span className="text-text-primary font-semibold">Учёт:</span> последний успешный
              обмен с {s.systemLabel} — {time}
              {s.pendingInQueue > 0 ? ` · в очереди: ${s.pendingInQueue}` : null}
            </>
          )}
        </p>
        {s.connectorId || s.syncDurationMs != null || s.lastSyncJobCompletedAt ? (
          <p className="text-text-muted text-[10px]">
            {s.connectorId ? <>Коннектор: {s.connectorId}</> : null}
            {s.connectorId && s.syncDurationMs != null ? ' · ' : null}
            {s.syncDurationMs != null ? `цикл: ${s.syncDurationMs} мс` : null}
            {(s.connectorId || s.syncDurationMs != null) && s.lastSyncJobCompletedAt ? ' · ' : null}
            {s.lastSyncJobCompletedAt ? (
              <>
                job:{' '}
                {new Date(s.lastSyncJobCompletedAt).toLocaleString('ru-RU', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </>
            ) : null}
          </p>
        ) : null}
        {(s.domainOutboxPending ?? 0) > 0 || (s.domainOutboxFailed ?? 0) > 0 ? (
          <p className="text-text-muted text-[10px]">
            Outbox: ожидает {s.domainOutboxPending ?? 0}
            {(s.domainOutboxFailed ?? 0) > 0 ? ` · с ошибкой: ${s.domainOutboxFailed}` : null}
          </p>
        ) : null}
        {s.lastError ? (
          <p className="text-[10px] text-amber-800 dark:text-amber-200">
            Последняя ошибка: {s.lastError}
          </p>
        ) : null}
      </div>
      {!hideSettingsLink ? (
        <Link
          href={settingsHref}
          className="text-accent-primary shrink-0 text-[9px] font-black uppercase tracking-widest hover:underline"
        >
          Синхронизация
        </Link>
      ) : null}
    </div>
  );
}
