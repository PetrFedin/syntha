'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';
import { ROUTES } from '@/lib/routes';

type BlockedRow = { articleId: string; reasons: string[] };

type Props = {
  collectionId: string;
  articleIds: string[];
  disabled?: boolean;
  onMessage?: (msg: string | null) => void;
};

/** Wave 14: «Опубликовать витрину» — readiness gate + bulk-showroom только для ready. */
export function Workshop2HubShowroomPublishButton({
  collectionId,
  articleIds,
  disabled,
  onMessage,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [blocked, setBlocked] = useState<BlockedRow[]>([]);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [passportBlocked, setPassportBlocked] = useState<boolean | null>(null);
  const [passportMessageRu, setPassportMessageRu] = useState<string | null>(null);

  const runPassportGate = useCallback(async () => {
    try {
      const gate = await fetchBrandScReleaseGateCheck(collectionId);
      setPassportBlocked(gate.blocked);
      setPassportMessageRu(gate.blocked ? gate.messageRu : null);
    } catch {
      setPassportBlocked(true);
      setPassportMessageRu('Release gate: material passport — проверка недоступна.');
    }
  }, [collectionId]);

  const runReadiness = useCallback(async () => {
    if (!articleIds.length) return;
    setChecking(true);
    onMessage?.(null);
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(collectionId)}/publish-showroom-readiness`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleIds }),
        }
      );
      const json = (await res.json()) as {
        ready?: boolean;
        blocked?: BlockedRow[];
        passedArticleIds?: string[];
        messageRu?: string;
      };
      setReady(Boolean(json.ready));
      setBlocked(Array.isArray(json.blocked) ? json.blocked : []);
      setPassedIds(Array.isArray(json.passedArticleIds) ? json.passedArticleIds : []);
      onMessage?.(json.messageRu ?? null);
    } catch {
      setReady(false);
      setBlocked([]);
      onMessage?.('Проверка витрины: сеть недоступна');
    } finally {
      setChecking(false);
    }
  }, [articleIds, collectionId, onMessage]);

  useEffect(() => {
    if (articleIds.length > 0) {
      void runReadiness();
      void runPassportGate();
    }
  }, [articleIds, runReadiness, runPassportGate]);

  const runPublish = async () => {
    const ids = ready ? articleIds : passedIds.length ? passedIds : articleIds;
    if (!ids.length) return;
    setBusy(true);
    onMessage?.(null);
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(collectionId)}/bulk-showroom-publish`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleIds: ids }),
        }
      );
      const json = (await res.json()) as {
        messageRu?: string;
        passed?: number;
        blocked?: unknown[];
        code?: string;
      };
      if (res.status === 409 && json.code === 'material_passport_release_gate') {
        setPassportBlocked(true);
        setPassportMessageRu(json.messageRu ?? 'Release gate: material passport не завершён.');
      }
      setPublished(res.ok && (json.blocked?.length ?? 0) === 0);
      onMessage?.(
        json.messageRu ??
          (res.ok ? `Опубликовано в витрину: ${json.passed ?? 0}` : 'Ошибка публикации витрины')
      );
      if (res.ok) void runReadiness();
    } catch {
      onMessage?.('Публикация витрины: сеть недоступна');
    } finally {
      setBusy(false);
    }
  };

  const canPublish =
    ready === true && passportBlocked === false && !checking && !busy && articleIds.length > 0;
  const shopShowroomHref = `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`;
  const brandLinesheetsHref = `/brand/linesheets?collection=${encodeURIComponent(collectionId)}`;

  return (
    <div
      className="flex flex-col gap-1.5"
      data-testid="brand-sc-publish-hub"
      data-audit-legacy="workshop2-hub-showroom-publish"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-7 gap-1 text-[10px]"
          disabled={disabled || !canPublish || busy}
          data-testid="brand-sc-publish-button"
          onClick={() => void runPublish()}
        >
          <Store className="h-3 w-3" aria-hidden />
          {busy ? 'Публикация…' : 'Опубликовать витрину'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={checking || busy}
          data-testid="brand-sc-publish-readiness-button"
          onClick={() => void runReadiness()}
        >
          {checking ? 'Проверка…' : 'Проверить gates'}
        </Button>
        {published ? (
          <>
            <Link
              href={shopShowroomHref}
              className="text-[10px] font-medium text-indigo-700 underline underline-offset-2"
              data-testid="brand-sc-publish-shop-showroom-link"
            >
              Витрина магазина →
            </Link>
            <Link
              href={brandLinesheetsHref}
              className="text-[10px] font-medium text-indigo-700 underline underline-offset-2"
              data-testid="brand-sc-publish-linesheets-link"
              data-audit-legacy="workshop2-hub-b2b-linesheet-link"
            >
              Лайншиты →
            </Link>
          </>
        ) : null}
      </div>
      {passportBlocked ? (
        <p
          className="rounded border border-rose-200/80 bg-rose-50/70 px-2 py-1.5 text-[10px] text-rose-950"
          data-testid="brand-sc-release-gate-block-publish-hint"
        >
          {passportMessageRu ??
            'Release gate: material passport не завершён — publish заблокирован.'}
        </p>
      ) : null}
      {blocked.length > 0 ? (
        <ul className="max-h-24 overflow-y-auto rounded border border-amber-200/80 bg-amber-50/60 px-2 py-1.5 text-[10px] text-amber-950">
          {blocked.map((row) => (
            <li key={row.articleId} className="mb-1 last:mb-0">
              <span className="font-semibold">{row.articleId}</span>
              {': '}
              {row.reasons.join(' · ')}
            </li>
          ))}
        </ul>
      ) : ready === true ? (
        <p className="text-[10px] text-emerald-800">
          Все артикулы прошли showroom gate — можно публиковать.
        </p>
      ) : null}
    </div>
  );
}
