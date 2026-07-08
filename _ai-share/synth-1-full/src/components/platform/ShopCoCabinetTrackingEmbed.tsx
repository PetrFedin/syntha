'use client';

import dynamic from 'next/dynamic';

const PlatformCoreB2bOrderDetailFacts = dynamic(
  () =>
    import('@/components/platform/PlatformCoreB2bOrderDetailFacts').then((m) => ({
      default: m.PlatformCoreB2bOrderDetailFacts,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="text-text-muted text-xs" data-testid="shop-co-cabinet-tracking-embed-loading">
        Загрузка трекинга…
      </p>
    ),
  }
);

type Props = {
  orderId: string;
  operationalStatus?: string | null;
  trackingNumberPreview?: string | null;
};

/** CO cabinet · buyer tracking-only (facts + chain mini, без столпа OP). */
export function ShopCoCabinetTrackingEmbed({
  orderId,
  operationalStatus,
  trackingNumberPreview,
}: Props) {
  return (
    <div data-testid="shop-co-cabinet-tracking-embed-root">
      <PlatformCoreB2bOrderDetailFacts
        orderId={orderId}
        variant="shop"
        embedSurface="cabinetTracking"
        operationalStatus={operationalStatus}
        trackingNumberPreview={trackingNumberPreview}
      />
    </div>
  );
}
