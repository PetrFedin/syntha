'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { hasCommunicationsUrlContext } from '@/lib/communications/syntha-overlay-context';
import { isWorkshop2RuMarket } from '@/lib/production/workshop2-market-profile';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type ThreadRow = {
  contextType: string;
  contextId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  messageCount: number;
  collectionId?: string;
  articleId?: string;
  workspaceHref?: string;
};

/** Не монтирует RU-баннер при URL-контексте (избегаем лишнего fetch и дубля с entity banner). */
export function BrandMessagesRuWorkspaceBannerWhenNoUrl() {
  const searchParams = useSearchParams();
  if (isPlatformCoreMode()) return null;
  if (hasCommunicationsUrlContext(searchParams)) return null;
  return <BrandMessagesRuWorkspaceBanner />;
}

/** Wave 11 RU: hub /brand/messages → contextual PG threads или подсказка workspace chat. */
export function BrandMessagesRuWorkspaceBanner() {
  const searchParams = useSearchParams();
  const hasUrlContext = hasCommunicationsUrlContext(searchParams);
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [source, setSource] = useState<'postgres' | 'memory' | 'empty'>('empty');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (hasUrlContext || !isWorkshop2RuMarket()) {
      setLoaded(true);
      return;
    }
    void fetch('/api/brand/messages/threads', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { threads?: ThreadRow[]; source?: typeof source };
      })
      .then((json) => {
        setThreads(json?.threads ?? []);
        setSource(json?.source ?? 'empty');
      })
      .finally(() => setLoaded(true));
  }, [hasUrlContext]);

  if (hasUrlContext || !isWorkshop2RuMarket() || !loaded) return null;

  return (
    <div
      className="border-border-subtle rounded-lg border bg-sky-50/80 px-3 py-2 text-[11px] text-sky-950"
      data-testid="brand-messages-ru-workspace-banner"
    >
      <p className="font-semibold">РФ: контекстный чат артикула — основной канал</p>
      <p className="text-text-secondary mt-0.5">
        Переписка по SS27/досье ведётся в workspace (contextual PG). Эта страница — сводка тредов
        {source === 'postgres' ? ' из PostgreSQL' : source === 'memory' ? ' (dev file store)' : ''}.
      </p>
      {threads.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {threads.slice(0, 5).map((t) => (
            <li key={`${t.contextType}:${t.contextId}`}>
              {t.workspaceHref ? (
                <Link
                  href={t.workspaceHref}
                  className="text-accent-primary font-medium hover:underline"
                >
                  {t.collectionId}/{t.articleId}
                </Link>
              ) : (
                <span>
                  {t.collectionId}/{t.articleId}
                </span>
              )}
              <span className="text-text-muted ml-1">
                · {t.messageCount} сообщ. · {t.lastMessagePreview.slice(0, 48)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1">
          Контекстных тредов пока нет — откройте{' '}
          <Link href={ROUTES.brand.productionWorkshop2} className="text-accent-primary underline">
            разработку коллекции
          </Link>{' '}
          и чат артикула.
        </p>
      )}
    </div>
  );
}
