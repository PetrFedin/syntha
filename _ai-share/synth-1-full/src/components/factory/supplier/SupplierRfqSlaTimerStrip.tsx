'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { computeSupplierRfqSlaTimer } from '@/lib/fashion/supplier-rfq-sla';
import {
  SUP_DEV_RFQ_SLA_TIMER_THREAD_BADGE_TESTID,
  SUP_DEV_RFQ_SLA_TIMER_THREAD_STRIP_TESTID,
  supDevRfqSlaThreadLeadRu,
} from '@/lib/fashion/supplier-dev-wave-xd';
import { factorySupplierRfqInboxHref } from '@/lib/routes';

type SlaAnchorPayload = {
  rfqId?: string | null;
  importedAt?: string | null;
  threadCreatedAt?: string | null;
};

type Props = {
  collectionId: string;
  articleId: string;
  variant?: 'inline' | 'strip';
  context?: 'inbox' | 'thread';
  rfqImportedAt?: string | null;
  rfqId?: string | null;
  threadCreatedAt?: string | null;
};

/** SLA-таймер ответа на RFQ (48 ч от Centric importedAt или created_at треда). */
export function SupplierRfqSlaTimerStrip({
  collectionId,
  articleId,
  variant = 'strip',
  context = 'inbox',
  rfqImportedAt,
  rfqId,
  threadCreatedAt,
}: Props) {
  const [now, setNow] = useState(() => new Date());
  const [anchor, setAnchor] = useState<SlaAnchorPayload | null>(null);

  const { snapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'supplier',
    articleId,
    enabled: true,
  });

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (rfqImportedAt || threadCreatedAt || rfqId) return;
    let cancelled = false;
    const params = new URLSearchParams({ collectionId, articleId });
    void fetch(`/api/workshop2/supplier/rfq-sla-anchor?${params.toString()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: SlaAnchorPayload & { ok?: boolean }) => {
        if (!cancelled && json.ok !== false) setAnchor(json);
      })
      .catch(() => {
        /* anchor optional */
      });
    return () => {
      cancelled = true;
    };
  }, [articleId, collectionId, rfqId, rfqImportedAt, threadCreatedAt]);

  const centric = snapshot?.supplierProcurement?.procurementSpine?.centricRfq;
  const resolvedImportedAt = rfqImportedAt ?? anchor?.importedAt ?? null;
  const resolvedThreadCreatedAt = threadCreatedAt ?? anchor?.threadCreatedAt ?? null;
  const resolvedRfqId = rfqId ?? anchor?.rfqId ?? centric?.rfqId;

  const timer = useMemo(
    () =>
      computeSupplierRfqSlaTimer({
        rfqId: resolvedRfqId,
        importedAt: resolvedImportedAt,
        threadCreatedAt: resolvedThreadCreatedAt,
        now,
      }),
    [centric?.rfqId, now, resolvedImportedAt, resolvedRfqId, resolvedThreadCreatedAt]
  );

  const rfqHref = factorySupplierRfqInboxHref({ collectionId, articleId });
  const testIdSuffix = timer.overdue ? 'overdue' : timer.warnWindow ? 'warn' : 'ok';
  const stripTestId =
    context === 'thread'
      ? SUP_DEV_RFQ_SLA_TIMER_THREAD_STRIP_TESTID
      : 'sup-dev-rfq-sla-timer-strip';

  if (variant === 'inline') {
    return (
      <Badge
        variant={timer.overdue ? 'destructive' : timer.warnWindow ? 'secondary' : 'outline'}
        className="font-mono text-[9px] tabular-nums"
        data-testid={
          context === 'thread'
            ? `${SUP_DEV_RFQ_SLA_TIMER_THREAD_BADGE_TESTID}-${testIdSuffix}`
            : `sup-dev-rfq-sla-timer-${testIdSuffix}`
        }
      >
        <Clock className="mr-1 inline h-3 w-3" aria-hidden />
        {timer.countdownRu}
      </Badge>
    );
  }

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid={stripTestId}
    >
      <Badge
        variant={timer.overdue ? 'destructive' : timer.warnWindow ? 'secondary' : 'outline'}
        className="text-[9px] uppercase"
        data-testid={
          context === 'thread'
            ? `${SUP_DEV_RFQ_SLA_TIMER_THREAD_BADGE_TESTID}-${testIdSuffix}`
            : `sup-dev-rfq-sla-timer-badge-${testIdSuffix}`
        }
      >
        SLA 48 ч
      </Badge>
      <span className="text-text-secondary">
        {context === 'thread' ? supDevRfqSlaThreadLeadRu() : timer.labelRu}
      </span>
      <span
        className="font-mono text-[11px] tabular-nums"
        data-testid={
          context === 'thread'
            ? `sup-dev-rfq-sla-timer-thread-countdown-${testIdSuffix}`
            : `sup-dev-rfq-sla-timer-countdown-${testIdSuffix}`
        }
      >
        {timer.countdownRu}
      </span>
      <Link
        href={rfqHref}
        className="text-accent-primary text-[10px] font-medium hover:underline"
        data-testid="sup-dev-rfq-sla-timer-rfq-link"
      >
        RFQ →
      </Link>
    </div>
  );
}
