'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import {
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_TITLE_RU,
  WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR,
  buildSupOpCommsTailHref,
  buildSupOpTrackingTailHref,
  type SupOpProcurementHonestChainStep,
} from '@/lib/platform/wave-yj-sup-op-procurement-chain';

type Props = {
  steps: SupOpProcurementHonestChainStep[];
  orderId: string;
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
  sseConnected?: boolean;
  pollEnabled?: boolean;
};

/** RU honest chain strip: reserve → partial ship / bulk-confirm → WMS webhook → PG steps (Wave YJ). */
export function SupOpProcurementChainStepsStrip({
  steps,
  orderId,
  collectionId,
  articleId,
  productionOrderId,
  sseConnected = false,
  pollEnabled = true,
}: Props) {
  if (steps.length === 0) return null;

  const poCtx = { orderId, productionOrderId };

  return (
    <div
      className="space-y-2 rounded-md border border-emerald-200/50 bg-emerald-50/20 p-3"
      data-testid={WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID}
      {...{ [WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR]: '1' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold text-emerald-950">
          {WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_TITLE_RU}
        </p>
        <PlatformCoreChainStatusRefreshBadge
          sseConnected={sseConnected}
          enabled={pollEnabled}
          sseTestId="sup-op-chain-sse-live-badge"
          pollTestId="sup-op-chain-poll-badge"
          sseLegacyTestId="sup-op-chain-workspace-sse-badge"
        />
      </div>
      <ul className="space-y-1.5" data-testid="sup-op-chain-workspace-steps">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex flex-wrap items-start gap-x-2 gap-y-0.5 text-xs"
            data-testid={`platform-core-chain-step-${step.id}`}
            data-done={step.done ? 'true' : 'false'}
            data-honest={step.honest ? 'true' : 'false'}
          >
            {step.done ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span>{step.labelRu}</span>
            {step.id === 'materials_supplied' && step.done ? (
              <>
                <Link
                  href={buildSupOpTrackingTailHref(poCtx)}
                  data-testid="sup-op-procurement-materials-tracking-link"
                  data-comms-tail-po={productionOrderId?.trim() || undefined}
                  className="text-accent-primary text-[10px] font-medium hover:underline"
                >
                  Трекинг
                </Link>
                <Link
                  href={buildSupOpCommsTailHref({
                    orderId,
                    collectionId,
                    sectionId: 'sup-op-chain',
                    productionOrderId,
                  })}
                  data-testid="sup-op-chain-workspace-brand-chat-link"
                  data-comms-tail-po={productionOrderId?.trim() || undefined}
                  className="text-accent-primary text-[10px] font-medium hover:underline"
                >
                  Чат бренду
                </Link>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
