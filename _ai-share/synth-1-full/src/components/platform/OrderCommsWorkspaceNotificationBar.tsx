'use client';

import { useSearchParams } from 'next/navigation';
import { CommsNotificationCenterStrip } from '@/components/platform/CommsNotificationCenterStrip';
import { PlatformCoreRegistryStreamHealthStrip } from '@/components/platform/PlatformCoreRegistryStreamHealthStrip';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

export type OrderCommsNotificationVariant = 'shop' | 'brand' | 'manufacturer' | 'supplier';

function testIdPrefix(variant: OrderCommsNotificationVariant): string {
  if (variant === 'shop') return 'shop-cm';
  if (variant === 'brand') return 'brand-cm';
  if (variant === 'supplier') return 'sup-cm';
  return 'mfr-cm';
}

function cabinetVariant(
  variant: OrderCommsNotificationVariant
): 'shop' | 'brand' | 'manufacturer' | 'supplier' {
  return variant;
}

type Props = {
  variant: OrderCommsNotificationVariant;
};

/** Unified notification center strip for order-comms workspaces (P2 comms pillar). */
export function OrderCommsWorkspaceNotificationBar({ variant }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    '';

  if (!orderId) {
    return (
      <p
        className="text-text-muted text-xs"
        data-testid={`${testIdPrefix(variant)}-workspace-notification-missing-order`}
      >
        Укажите `?order=` для центра уведомлений.
      </p>
    );
  }

  return (
    <div
      className="mb-3 space-y-2"
      data-testid={`${testIdPrefix(variant)}-workspace-notification-bar`}
    >
      <CommsNotificationCenterStrip
        variant={cabinetVariant(variant)}
        collectionId={collectionId}
        orderId={orderId}
        orderScoped
      />
      {variant === 'brand' || variant === 'shop' ? (
        <PlatformCoreRegistryStreamHealthStrip
          variant={variant}
          orderId={orderId}
          testIdPrefix={`${testIdPrefix(variant)}-order`}
        />
      ) : null}
    </div>
  );
}
