'use client';

import { CommsNotificationCenterStrip } from '@/components/platform/CommsNotificationCenterStrip';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';

type Variant = 'shop' | 'brand' | 'manufacturer' | 'supplier';

type Props = {
  variant: Variant;
  compact?: boolean;
  minimalChrome?: boolean;
  collectionId?: string;
  orderId?: string;
  orderScoped?: boolean;
};

/** Hub pillar card — единый compact notification center (wave YT · prefs dedupe внутри strip). */
export function PlatformCorePillarNotificationCenterCompact({
  variant,
  compact = false,
  minimalChrome = false,
  collectionId: collectionIdProp,
  orderId: orderIdProp,
  orderScoped = false,
}: Props) {
  const demo = usePlatformCoreDemoContext();
  const collectionId = collectionIdProp ?? demo.collectionId;
  const orderId = resolvePlatformCoreCabinetOrderId(
    orderIdProp ?? demo.demoOrderId,
    getPlatformCoreDemo(collectionId).demoOrderId
  );

  if (!compact || minimalChrome || !orderId.trim()) return null;

  return (
    <CommsNotificationCenterStrip
      variant={variant}
      collectionId={collectionId}
      orderId={orderId}
      compact
      orderScoped={orderScoped}
    />
  );
}
