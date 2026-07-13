'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, PackageCheck, XCircle } from 'lucide-react';
import type {
  PlatformCoreAcceptanceStatus,
  PlatformCoreShipmentStatus,
} from '@/lib/platform-core-order-production-tail';
import type { OrderProductionDocumentSnapshot } from '@/lib/platform-core-pillar-snapshot.types';
import { cn } from '@/lib/utils';

type Decision = Exclude<PlatformCoreAcceptanceStatus, 'pending'>;

type Props = {
  orderId: string;
  shipmentStatus: PlatformCoreShipmentStatus;
  acceptanceStatus: PlatformCoreAcceptanceStatus;
  hasOpenClaim: boolean;
  documents: readonly OrderProductionDocumentSnapshot[];
  asnNumber?: string | null;
  eta?: string | null;
  onSaved?: () => void;
};

const DECISIONS: readonly {
  value: Decision;
  label: string;
  hint: string;
  icon: typeof CheckCircle2;
  tone: 'success' | 'warning' | 'danger';
}[] = [
  {
    value: 'accepted',
    label: 'Принять поставку',
    hint: 'Количество и состояние товара соответствуют документам.',
    icon: CheckCircle2,
    tone: 'success',
  },
  {
    value: 'accepted_with_discrepancy',
    label: 'Принять с расхождениями',
    hint: 'Поставка принята, автоматически открывается claim.',
    icon: AlertTriangle,
    tone: 'warning',
  },
  {
    value: 'rejected',
    label: 'Отклонить поставку',
    hint: 'Приёмка не подтверждена, требуется решение с брендом.',
    icon: XCircle,
    tone: 'danger',
  },
] as const;

function statusLabel(status: PlatformCoreAcceptanceStatus): string {
  switch (status) {
    case 'accepted':
      return 'Поставка принята';
    case 'accepted_with_discrepancy':
      return 'Принята с расхождениями';
    case 'rejected':
      return 'Поставка отклонена';
    default:
      return 'Ожидает решения магазина';
  }
}

export function ShopOrderProductionReceivingPanel({
  orderId,
  shipmentStatus,
  acceptanceStatus,
  hasOpenClaim,
  documents,
  asnNumber,
  eta,
  onSaved,
}: Props) {
  const [submitting, setSubmitting] = useState<Decision | null>(null);
  const [error, setError] = useState('');
  const [savedStatus, setSavedStatus] = useState<PlatformCoreAcceptanceStatus>(acceptanceStatus);
  const acceptanceAvailable = ['dispatched', 'partially_delivered', 'delivered'].includes(
    shipmentStatus
  );

  async function submit(decision: Decision) {
    setSubmitting(decision);
    setError('');
    try {
      const response = await fetch('/api/workshop2/platform-core/order-production/acceptance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId,
          acceptanceStatus: decision,
          shipmentStatus,
          idempotencyKey: `${orderId}:${decision}:${crypto.randomUUID()}`,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        messageRu?: string;
        result?: { snapshot?: { tail?: { acceptanceStatus?: PlatformCoreAcceptanceStatus } } };
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.messageRu || 'Не удалось сохранить решение по приёмке.');
      }
      setSavedStatus(payload.result?.snapshot?.tail?.acceptanceStatus ?? decision);
      onSaved?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось сохранить решение.');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <section
      className="space-y-2.5 rounded-md border border-border-subtle bg-bg-surface p-3"
      data-testid="shop-op-receiving-panel"
      aria-label="Приёмка поставки"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <PackageCheck className="h-4 w-4 text-text-muted" aria-hidden />
            <h2 className="text-[13px] font-semibold text-text-primary">Приёмка поставки</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-text-secondary">{statusLabel(savedStatus)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px] text-text-muted">
          {asnNumber ? <span className="rounded border border-border-subtle px-1.5 py-0.5">ASN {asnNumber}</span> : null}
          {eta ? <span className="rounded border border-border-subtle px-1.5 py-0.5">ETA {eta}</span> : null}
          {hasOpenClaim || savedStatus === 'accepted_with_discrepancy' ? (
            <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-amber-800">
              Claim открыт
            </span>
          ) : null}
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="grid gap-1.5 sm:grid-cols-2" data-testid="shop-op-receiving-documents">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex min-h-8 items-center gap-1.5 rounded-md border border-border-subtle px-2 py-1.5 text-[10px]"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{document.title || document.type}</span>
              {document.status ? <span className="shrink-0 text-text-muted">{document.status}</span> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-bg-surface2/60 px-2.5 py-2 text-[10px] text-text-muted">
          Документы поставки ещё не опубликованы.
        </p>
      )}

      {!acceptanceAvailable ? (
        <p className="rounded-md border border-amber-200 bg-amber-50/70 px-2.5 py-2 text-[11px] text-amber-900">
          Решение по приёмке станет доступно после подтверждения отгрузки.
        </p>
      ) : savedStatus === 'pending' ? (
        <div className="grid gap-1.5 lg:grid-cols-3">
          {DECISIONS.map((decision) => {
            const Icon = decision.icon;
            const busy = submitting === decision.value;
            return (
              <button
                key={decision.value}
                type="button"
                disabled={submitting !== null}
                onClick={() => submit(decision.value)}
                className={cn(
                  'flex min-h-[5.5rem] flex-col items-start rounded-md border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                  decision.tone === 'success' && 'border-emerald-200 hover:bg-emerald-50/60',
                  decision.tone === 'warning' && 'border-amber-200 hover:bg-amber-50/60',
                  decision.tone === 'danger' && 'border-rose-200 hover:bg-rose-50/60'
                )}
                data-testid={`shop-op-receiving-${decision.value}`}
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-text-primary">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {busy ? 'Сохранение…' : decision.label}
                </span>
                <span className="mt-1 text-[10px] leading-4 text-text-secondary">{decision.hint}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-border-subtle bg-bg-surface2/50 px-2.5 py-2 text-[11px] text-text-primary">
          Решение сохранено: {statusLabel(savedStatus)}.
        </div>
      )}

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
