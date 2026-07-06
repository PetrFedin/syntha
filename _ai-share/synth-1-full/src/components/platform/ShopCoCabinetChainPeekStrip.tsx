'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { B2bOrderChainPeerMirrorStrip } from '@/components/b2b/B2bOrderChainPeerMirrorStrip';
import { PillarInsightSteps } from '@/components/platform/PillarInsightPrimitives';
import { usePlatformCoreShopTrackingChains } from '@/hooks/use-platform-core-shop-tracking-chains';
import { useShopB2bOperationalStatusMirror } from '@/hooks/use-shop-b2b-operational-status-mirror';
import { mapOperationalStatusLabelRu } from '@/lib/integrations/spine/integration-ui-utils';
import {
  SHOP_CO_CABINET_OPERATIONAL_STATUS_PG_BADGE_TESTID,
  SHOP_CO_CABINET_OPERATIONAL_STATUS_TESTID,
  shopCoOperationalStatusPgBadgeLabelRu,
} from '@/lib/platform-core-ports/b2b/brand-co-wave-yg';
import type { ChainPeerMirrorPayload } from '@/lib/platform-core-chain-peer-mirror';
import {
  shopB2bTrackingOrderHref,
  shopCalendarB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  operationalStatus?: string | null;
};

/** Кабинет shop CO: компактная цепочка выпуска + зеркало бренда (без отдельного столпа OP). */
export function ShopCoCabinetChainPeekStrip({ orderId, operationalStatus }: Props) {
  const { chains, loading } = usePlatformCoreShopTrackingChains([orderId]);
  const {
    status: mirrorStatus,
    storageMode,
    loading: mirrorLoading,
  } = useShopB2bOperationalStatusMirror(orderId);
  const chain = chains[orderId] ?? null;
  const resolvedOperationalStatus = mirrorStatus ?? operationalStatus ?? null;

  const mirrorPayload: ChainPeerMirrorPayload | null = chain
    ? {
        handedOff: chain.handedOff,
        poStatus: chain.status,
        poStatusLabelRu: chain.poStatusLabelRu,
        productionOrderId: chain.productionOrderId,
        steps: chain.steps,
      }
    : null;

  return (
    <div className="space-y-2" data-testid="shop-co-cabinet-chain-peek">
      {resolvedOperationalStatus ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
            data-testid={SHOP_CO_CABINET_OPERATIONAL_STATUS_TESTID}
          >
            Статус бренда · {mapOperationalStatusLabelRu(resolvedOperationalStatus)}
          </Badge>
          {!mirrorLoading && storageMode ? (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-900"
              data-testid={SHOP_CO_CABINET_OPERATIONAL_STATUS_PG_BADGE_TESTID}
            >
              {shopCoOperationalStatusPgBadgeLabelRu(storageMode)}
            </Badge>
          ) : null}
        </div>
      ) : null}
      {loading && !chain ? (
        <p className={hubGadget.muted} data-testid="shop-co-cabinet-chain-loading">
          Цепочка…
        </p>
      ) : null}
      {chain && chain.steps.length > 0 ? (
        <PillarInsightSteps steps={chain.steps} testId="shop-co-cabinet-production-steps" />
      ) : null}
      {mirrorPayload ? (
        <B2bOrderChainPeerMirrorStrip orderId={orderId} variant="shop" chain={mirrorPayload} />
      ) : null}
      <div className={hubGadget.goldenPath} data-testid="shop-co-cabinet-chain-links">
        <Link
          href={shopB2bTrackingOrderHref(orderId)}
          data-testid="shop-co-cabinet-chain-tracking-link"
          className={hubGadget.goldenLink}
        >
          Трекинг
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={shopCalendarB2bOrderContextHref(orderId)}
          data-testid="shop-co-cabinet-chain-calendar-link"
          className={hubGadget.goldenLink}
        >
          Календарь
        </Link>
      </div>
    </div>
  );
}
