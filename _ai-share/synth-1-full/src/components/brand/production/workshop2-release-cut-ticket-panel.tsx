'use client';

import { useState } from 'react';
import { Scissors } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import { useToast } from '@/hooks/use-toast';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  postWorkshop2Event,
  saveWorkshop2DossierToApi,
} from '@/lib/production/workshop2-api-client';
import {
  appendWorkshop2CutTicket,
  advanceWorkshop2CutTicketStatus,
  buildWorkshop2SupplyOpsMirror,
  evaluateWorkshop2CutTicketBulkPoGate,
} from '@/lib/production/workshop2-supply-ops-dossier-persist';
import { collectWorkshop2SupplyOpsCreatedEvents } from '@/lib/production/workshop2-supply-ops-domain-events';
import {
  getNextWorkshop2CutTicketStatus,
  labelWorkshop2CutTicketStatusRu,
  listWorkshop2CutTicketStatusOrder,
} from '@/lib/production/workshop2-cut-ticket-status-machine';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

type Props = {
  dossier: Workshop2DossierPhase1 | null;
  collectionId?: string;
  articleId?: string;
  onDossierChange?: (next: Workshop2DossierPhase1) => void;
};

/** Cut ticket: read-only mirror + issue / advance (supply-ops persist, fail-closed gates). */
export function Workshop2ReleaseCutTicketPanel({
  dossier,
  collectionId,
  articleId,
  onDossierChange,
}: Props) {
  const { ref } = useArticleWorkspace();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const cid = collectionId ?? ref.collectionId;
  const aid = articleId ?? String(ref.articleId);

  const persistDossier = async (
    next: Workshop2DossierPhase1,
    prev: Workshop2DossierPhase1 | null
  ) => {
    if (!cid || !aid) return;
    setBusy(true);
    try {
      const api = await saveWorkshop2DossierToApi({
        collectionId: cid,
        articleId: aid,
        dossier: next,
      });
      if (api.ok) {
        onDossierChange?.(next);
        const events = collectWorkshop2SupplyOpsCreatedEvents({
          collectionId: cid,
          articleId: aid,
          previous: prev,
          next,
        });
        for (const ev of events) {
          void postWorkshop2Event({
            collectionId: cid,
            articleId: aid,
            eventType: ev.type,
            eventPayload: ev.payload,
          });
        }
      } else {
        toast({
          title: 'Досье не сохранено',
          description: api.reason ?? 'PG недоступен',
          variant: 'destructive',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  if (!dossier) {
    return (
      <p className="text-text-secondary text-sm" data-testid="workshop2-release-cut-panel-empty">
        Досье не загружено — cut ticket недоступен.
      </p>
    );
  }

  const mirror = buildWorkshop2SupplyOpsMirror(dossier);
  const gate = evaluateWorkshop2CutTicketBulkPoGate(dossier);
  const tickets = dossier.cutTickets ?? [];
  const rolls = dossier.fabricRolls ?? [];
  const dyes = dossier.garmentDyeOps ?? [];

  const handleIssueCutTicket = async () => {
    const ticketNo = `CT-${String(tickets.length + 1).padStart(3, '0')}`;
    const next = appendWorkshop2CutTicket(dossier, {
      ticketNo,
      qty: 1,
      status: 'draft',
    });
    await persistDossier(next, dossier);
    toast({
      title: 'Техкарта раскроя создана',
      description: `${ticketNo} · черновик`,
    });
  };

  const handleAdvanceTicket = async (ticketId: string) => {
    const { dossier: next, ok, messageRu } = advanceWorkshop2CutTicketStatus(dossier, ticketId);
    if (!ok) {
      toast({ title: 'Переход недоступен', description: messageRu, variant: 'destructive' });
      return;
    }
    await persistDossier(next, dossier);
    const t = next.cutTickets?.find((x) => x.id === ticketId);
    toast({
      title: 'Статус техкарты раскроя',
      description: t ? labelWorkshop2CutTicketStatusRu(t.status) : 'Обновлено',
    });
  };

  return (
    <div
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      data-testid="workshop2-release-cut-panel"
    >
      <p className="text-text-primary flex items-center gap-1.5 text-sm font-semibold">
        <Scissors className="h-4 w-4 text-indigo-500" />
        Техкарта раскроя · Рулон-партия
      </p>
      <p className="text-text-secondary text-[11px]">{workshop2PgMirrorStr(mirror, 'hintRu')}</p>

      {mirror.cutTicketGateRequired ? (
        <Badge
          variant={mirror.blockerBulkPo ? 'destructive' : 'outline'}
          data-testid="workshop2-cut-ticket-gate-chip"
        >
          {mirror.blockerBulkPo
            ? 'Гейт: техкарта раскроя обязательна (WORKSHOP2_CUT_TICKET_REQUIRED)'
            : 'Гейт техкарты: OK'}
        </Badge>
      ) : null}

      {gate ? (
        <p className="text-[11px] text-rose-800" data-testid="workshop2-cut-ticket-gate-message">
          {gate.messageRu}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-8 text-[11px]"
          disabled={busy || !cid}
          data-testid="workshop2-cut-ticket-issue-btn"
          onClick={() => void handleIssueCutTicket()}
        >
          Выдать cut ticket
        </Button>
      </div>

      <div className="rounded-md border border-slate-100 bg-slate-50/80 p-2">
        <p className="text-text-muted mb-1 text-[10px] font-semibold uppercase">Статусная машина</p>
        <ol className="flex flex-wrap gap-1 text-[10px]">
          {listWorkshop2CutTicketStatusOrder().map((st, i) => (
            <li key={st} className="flex items-center gap-1">
              <span className="rounded border bg-white px-1.5 py-0.5">
                {labelWorkshop2CutTicketStatusRu(st)}
              </span>
              {i < listWorkshop2CutTicketStatusOrder().length - 1 ? (
                <span className="text-text-muted">→</span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {tickets.length === 0 ? (
        <p className="text-text-muted text-[11px]">Техкарты раскроя не созданы.</p>
      ) : (
        <ul className="space-y-2 text-[11px]" data-testid="workshop2-cut-ticket-list">
          {tickets.map((t) => {
            const nextSt = getNextWorkshop2CutTicketStatus(t.status);
            return (
              <li key={t.id} className="space-y-1.5 rounded border px-2 py-1.5">
                <div>
                  <span className="font-mono font-semibold">{t.ticketNo}</span>
                  {' · '}
                  <Badge variant="outline">{labelWorkshop2CutTicketStatusRu(t.status)}</Badge>
                  {t.qty ? ` · qty ${t.qty}` : ''}
                </div>
                {nextSt ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-[10px]"
                    disabled={busy}
                    data-testid={`workshop2-cut-ticket-advance-${t.id}`}
                    onClick={() => void handleAdvanceTicket(t.id)}
                  >
                    → {labelWorkshop2CutTicketStatusRu(nextSt)}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-text-secondary text-[10px]">
        Roll-lot: {rolls.length} · Garment dye: {dyes.length}
      </p>
    </div>
  );
}
