'use client';

import { Badge } from '@/components/ui/badge';
import type { B2bChainSummary } from '@/hooks/use-workshop2-b2b-chain-summaries';

type Props = {
  orderStatusLabel: string;
  chain?: B2bChainSummary | null;
  /** Статус PO в очереди цеха (pending_erp / synced). */
  poQueueStatus?: string;
  className?: string;
};

/** Краткий этап цепочки для реестра (PG + chain-status). */
export function B2bChainPhaseBadge({
  orderStatusLabel,
  chain,
  poQueueStatus,
  className,
}: Props) {
  const statusLabel = chain?.orderStatusLabelRu || orderStatusLabel;

  if (poQueueStatus === 'synced') {
    return (
      <Badge
        variant="default"
        className={`bg-emerald-600/90 text-[9px] hover:bg-emerald-600/90 ${className ?? ''}`}
        data-testid={chain?.orderId ? `b2b-chain-factory-synced-${chain.orderId}` : undefined}
      >
        Принято цехом
      </Badge>
    );
  }

  if (poQueueStatus === 'pending_erp') {
    return (
      <Badge
        variant="outline"
        className={`border-amber-300 text-[9px] text-amber-800 ${className ?? ''}`}
        data-testid={chain?.orderId ? `b2b-chain-factory-pending-${chain.orderId}` : undefined}
      >
        Ожидает приёмки цеха
      </Badge>
    );
  }

  if (chain?.handedOff) {
    return (
      <Badge
        variant="default"
        className={`bg-emerald-600/90 text-[9px] hover:bg-emerald-600/90 ${className ?? ''}`}
        data-testid={chain.orderId ? `b2b-chain-po-${chain.orderId}` : undefined}
      >
        {chain.poStatusLabelRu ?? 'PO · цех'}
      </Badge>
    );
  }

  if (chain?.inventoryReserved) {
    return (
      <Badge
        variant="outline"
        className={`border-emerald-300 text-[9px] text-emerald-800 ${className ?? ''}`}
        data-testid={chain.orderId ? `b2b-chain-reserve-${chain.orderId}` : undefined}
      >
        Резерв на складе
      </Badge>
    );
  }

  if (statusLabel === 'Отправлен') {
    return (
      <Badge variant="outline" className={`border-amber-300 text-[9px] text-amber-800 ${className ?? ''}`}>
        У бренда
      </Badge>
    );
  }

  if (
    statusLabel === 'Подтверждён' ||
    statusLabel === 'Резерв / аллокация' ||
    statusLabel === 'Зарезервировано'
  ) {
    return (
      <Badge variant="outline" className={`text-[9px] ${className ?? ''}`}>
        Ожидает передачи в производство
      </Badge>
    );
  }

  return null;
}
