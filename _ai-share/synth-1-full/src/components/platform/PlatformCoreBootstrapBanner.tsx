'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePlatformCoreChainOverview } from '@/components/platform/usePlatformCoreChainOverview';
import { isCabinetPathname } from '@/lib/platform-core-ports/legacy/layout/cabinet-route-match';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { isSynthaEmbedClient } from '@/lib/platform-core-ports/legacy/syntha-embed';
import { cn } from '@/lib/utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type Props = {
  collectionId?: string;
};

type HealthSnapshot = {
  pgReachable?: boolean;
  demoSeeded?: boolean;
  messageRu?: string;
};

/**
 * Индикатор bootstrap PG/seed — иконка в правом верхнем углу; детали в диалоге по клику.
 * Пропадает, когда PG + demo SS27 + chain-overview в порядке.
 */
export function PlatformCoreBootstrapBanner({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
}: Props) {
  const pathname = usePathname();
  const { overview, overviewStatus } = usePlatformCoreChainOverview(collectionId);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [prepBusy, setPrepBusy] = useState(false);
  const [prepMsg, setPrepMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/workshop2/platform-core/health', {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      const json = (await res.json()) as HealthSnapshot;
      setHealth(json);
      return json;
    } catch {
      setHealth({ pgReachable: false, demoSeeded: false });
      return null;
    }
  }, []);

  useEffect(() => {
    void loadHealth();
    const id = window.setInterval(() => void loadHealth(), 8000);
    return () => window.clearInterval(id);
  }, [loadHealth]);

  useEffect(() => {
    if (health === null && overviewStatus === 'loading') return;
    const pgReachable = health?.pgReachable === true;
    const demoSeeded = health?.demoSeeded === true;
    const overviewReady = overviewStatus === 'ready' && overview != null;
    if ((pgReachable && demoSeeded && overviewReady) || (overviewReady && demoSeeded)) {
      setOpen(false);
    }
  }, [health, overview, overviewStatus]);

  const onRefresh = async () => {
    await loadHealth();
    window.location.reload();
  };

  const onPrepPg = async () => {
    setPrepBusy(true);
    setPrepMsg(null);
    try {
      const r = await fetch('/api/dev/platform-core/prep', { method: 'POST' });
      const j = (await r.json()) as { ok: boolean; message?: string };
      setPrepMsg(j.message ?? (j.ok ? 'Запущено' : 'Ошибка'));
      window.setTimeout(() => void loadHealth(), 15000);
      window.setTimeout(() => void loadHealth(), 45000);
    } catch {
      setPrepMsg('Не удалось запустить prep — OrbStack должен быть Running');
    } finally {
      setPrepBusy(false);
    }
  };

  if (isSynthaEmbedClient()) return null;
  /** Platform Core (:3001): demo/offline без иконки bootstrap PG. */
  if (isPlatformCoreMode()) return null;
  if (health === null && overviewStatus === 'loading') return null;

  const pgReachable = health?.pgReachable === true;
  const demoSeeded = health?.demoSeeded === true;
  const overviewReady = overviewStatus === 'ready' && overview != null;

  if (pgReachable && demoSeeded && overviewReady) return null;
  if (overviewReady && demoSeeded) return null;

  const noData = health != null && !pgReachable;
  const noSeed = pgReachable && !demoSeeded;
  const variant = noData ? 'no-pg' : noSeed ? 'no-seed' : 'overview-error';

  const title = noData
    ? 'Нет подключения к данным (PostgreSQL :5433)'
    : noSeed
      ? 'Стартовая коллекция не инициализирована'
      : 'Сводка цепочки временно недоступна';

  const description = noData ? (
    <>
      Запустите <strong>OrbStack</strong> (иконка в меню macOS → Running), затем подключите
      PostgreSQL. Без :5433 заказы и чаты не обновляются.
    </>
  ) : noSeed ? (
    <>PostgreSQL доступен — нужна однократная загрузка demo SS27 (bootstrap).</>
  ) : (
    <>Сводка цепочки не ответила — обновите через минуту.</>
  );

  const topOffset = isCabinetPathname(pathname) ? 'top-3' : 'top-12';

  return (
    <>
      <button
        type="button"
        role="alert"
        data-testid="platform-core-bootstrap-banner"
        data-variant={variant}
        aria-label={title}
        aria-expanded={open}
        className={cn(
          'fixed right-3 z-[60] flex h-9 w-9 items-center justify-center rounded-full border shadow-md transition-all',
          'border-amber-400/80 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
          !open && 'animate-pulse',
          topOffset
        )}
        onClick={() => setOpen(true)}
      >
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ariaTitle={title}
          data-testid="platform-core-bootstrap-dialog"
          className="max-w-md border-amber-200/80"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
              {title}
            </DialogTitle>
            <DialogDescription className="text-left text-xs leading-relaxed text-amber-900/90">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <button
              type="button"
              data-testid="bootstrap-refresh"
              className="rounded-md border border-amber-400/80 bg-white px-3 py-1 font-semibold hover:bg-amber-100/50"
              onClick={() => void onRefresh()}
            >
              Проверить подключение
            </button>
            {process.env.NODE_ENV === 'development' && (noData || noSeed) ? (
              <button
                type="button"
                data-testid="bootstrap-prep-pg"
                disabled={prepBusy}
                className="rounded-md bg-amber-800 px-3 py-1 font-semibold text-white disabled:opacity-50"
                onClick={() => void onPrepPg()}
              >
                {prepBusy ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Подключаю…
                  </span>
                ) : noData ? (
                  'Подключить PostgreSQL'
                ) : (
                  'Загрузить demo (bootstrap)'
                )}
              </button>
            ) : null}
            <Link
              href="/platform"
              className="font-medium text-amber-900 underline underline-offset-2"
              onClick={() => setOpen(false)}
            >
              Обновить hub
            </Link>
          </div>

          {prepMsg ? <p className="text-[10px] text-amber-900/90">{prepMsg}</p> : null}

          {process.env.NODE_ENV === 'development' ? (
            <p className="text-[10px] text-amber-900/70">
              Терминал: <code className="rounded bg-amber-100/80 px-1">npm run db:core:up</code>
              {' → '}
              <code className="rounded bg-amber-100/80 px-1">npm run core:bootstrap</code>
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
