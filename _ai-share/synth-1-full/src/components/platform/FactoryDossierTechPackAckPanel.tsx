'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import type { Workshop2DossierPhase1 } from '@/lib/platform-core-ports/dossier-material-preview';
import { summarizeWorkshop2FactoryHandoffBundleStatus } from '@/lib/platform-core-ports/factory-dossier';

type Props = {
  collectionId: string;
  articleId: string;
  /** inline: strip in dossier chrome; workspace: full tab panel with empty states. */
  surface?: 'inline' | 'workspace';
};

/** CTA приёмки tech pack цехом → POST handoff/factory-ack (не sample-queue acknowledge). */
export function FactoryDossierTechPackAckPanel({
  collectionId,
  articleId,
  surface = 'inline',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [handoffId, setHandoffId] = useState<string | null>(null);
  const [hintRu, setHintRu] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'none' | 'draft' | 'dispatched' | 'acknowledged' | 'error'>(
    'loading'
  );

  const load = useCallback(() => {
    let cancelled = false;
    setState('loading');
    void fetch(
      `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/dossier`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { dossier?: Workshop2DossierPhase1 };
      })
      .then((json) => {
        if (cancelled) return;
        const summary = summarizeWorkshop2FactoryHandoffBundleStatus(json?.dossier);
        if (!summary || summary.state === 'none') {
          setState('none');
          setHandoffId(null);
          setHintRu(summary?.hintRu ?? 'Нет handoff — дождитесь передачи пакета от бренда.');
          return;
        }
        setHintRu(summary.hintRu ?? null);
        if (summary.state === 'draft') {
          setState('draft');
          setHandoffId(summary.checklistRow?.handoffId ?? summary.lastRow?.handoffId ?? null);
          return;
        }
        if (summary.state === 'acknowledged') {
          setState('acknowledged');
          setHandoffId(summary.checklistRow?.handoffId ?? null);
          return;
        }
        const pending = summary.checklistRow ?? summary.lastRow;
        setHandoffId(pending?.handoffId?.trim() ?? null);
        setState(pending?.brandDispatchedAt && !pending?.factoryReceivedAt ? 'dispatched' : 'draft');
      })
      .catch(() => {
        if (!cancelled) {
          setState('error');
          setHintRu('Не удалось загрузить dossier — повторите.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [articleId, collectionId]);

  useEffect(() => load(), [load]);

  const acknowledge = async () => {
    if (!handoffId || busy) return;
    setBusy(true);
    setMessageRu(null);
    try {
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/handoff/factory-ack`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ handoffId }),
        }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (res.ok && json.ok) {
        setMessageRu('Техпак принят цехом (factory-ack).');
        setState('acknowledged');
      } else {
        setMessageRu(json.messageRu ?? `Ошибка приёмки (${res.status}).`);
      }
    } catch {
      setMessageRu('Сеть недоступна — повторите позже.');
    } finally {
      setBusy(false);
    }
  };

  if (surface === 'inline') {
    if (state === 'loading' || state === 'none' || state === 'error') return null;
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-3 py-2 text-xs"
        data-testid="factory-dossier-techpack-ack-panel"
      >
        {state === 'acknowledged' ? (
          <Badge variant="outline" className="border-emerald-300 text-emerald-800">
            ТЗ принято цехом
          </Badge>
        ) : (
          <>
            <span className="text-text-secondary">Пакет передан брендом — подтвердите приёмку ТЗ.</span>
            <Button
              type="button"
              size="sm"
              className="h-7 text-[10px] font-bold uppercase"
              disabled={busy || !handoffId}
              data-testid="factory-dossier-techpack-ack-cta"
              onClick={() => void acknowledge()}
            >
              {busy ? '…' : 'Принять ТЗ'}
            </Button>
          </>
        )}
        {messageRu ? (
          <span className="text-text-muted w-full text-[10px]" data-testid="factory-dossier-techpack-ack-msg">
            {messageRu}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Card data-testid="factory-dossier-techpack-ack-panel">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Приёмка tech pack</CardTitle>
          {state === 'acknowledged' ? (
            <Badge variant="outline" className="border-emerald-300 text-emerald-800">
              ACK
            </Badge>
          ) : state === 'dispatched' ? (
            <Badge variant="outline" className="border-amber-400 text-amber-800">
              Ожидает ACK
            </Badge>
          ) : null}
        </div>
        <CardDescription>{hintRu ?? 'Статус handoff bundles в dossier.'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {state === 'loading' ? (
          <p className="text-text-muted text-sm" data-testid="factory-dossier-techpack-ack-loading">
            Загрузка dossier…
          </p>
        ) : null}
        {state === 'acknowledged' ? (
          <p className="text-emerald-800 text-sm">ТЗ принято цехом — factory-ack записан в dossier.</p>
        ) : state === 'dispatched' ? (
          <Button
            type="button"
            size="sm"
            disabled={busy || !handoffId}
            data-testid="factory-dossier-techpack-ack-cta"
            onClick={() => void acknowledge()}
          >
            {busy ? 'Сохранение…' : 'Принять ТЗ (factory-ack)'}
          </Button>
        ) : null}
        {messageRu ? (
          <p className="text-text-muted text-xs" data-testid="factory-dossier-techpack-ack-msg">
            {messageRu}
          </p>
        ) : null}
        {handoffId ? (
          <p className="text-text-muted font-mono text-[10px]" data-testid="factory-dossier-techpack-ack-handoff-id">
            handoffId: {handoffId}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
