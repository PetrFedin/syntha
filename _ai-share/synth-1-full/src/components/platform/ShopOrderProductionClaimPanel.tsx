'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import type { PlatformCoreAcceptanceStatus } from '@/lib/platform-core-order-production-tail';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';

type Props = {
  collectionId: string;
  orderId: string;
  acceptanceStatus: PlatformCoreAcceptanceStatus;
  hasOpenClaim: boolean;
};

function claimReason(status: PlatformCoreAcceptanceStatus): string {
  if (status === 'accepted_with_discrepancy') {
    return 'Поставка принята с расхождениями. Требуется согласовать корректирующие действия с брендом.';
  }
  if (status === 'rejected') {
    return 'Поставка отклонена. Требуется зафиксировать причину и согласовать дальнейшие действия.';
  }
  return 'По заказу открыт claim, который необходимо урегулировать до закрытия исполнения.';
}

/** Canonical compact claim surface based only on persisted Order Production facts. */
export function ShopOrderProductionClaimPanel({
  collectionId,
  orderId,
  acceptanceStatus,
  hasOpenClaim,
}: Props) {
  const commsHref = roleCoreCabinetHref({
    roleId: 'shop',
    pillarId: 'comms',
    collectionId,
    sectionId: 'shop-cm-order-chat',
    orderId,
  });

  if (!hasOpenClaim) {
    return (
      <section
        className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-2.5 py-2"
        data-testid="shop-op-claim-panel"
        data-claim-open="false"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-text-primary">Открытых claims нет</p>
          <p className="text-[10px] text-text-muted">Заказ не заблокирован претензией магазина.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="space-y-2 rounded-md border border-amber-200 bg-amber-50/60 p-2.5"
      data-testid="shop-op-claim-panel"
      data-claim-open="true"
      aria-label="Claim по поставке"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-amber-950">Claim открыт</p>
          <p className="mt-0.5 text-[10px] leading-4 text-amber-900">
            {claimReason(acceptanceStatus)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80 pt-2">
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-900">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          Обсуждение ведётся в контексте заказа
        </span>
        <Link
          href={commsHref}
          className="inline-flex h-8 items-center gap-1 rounded-md bg-amber-900 px-2.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
          data-testid="shop-op-claim-open-comms"
        >
          Открыть обсуждение
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
