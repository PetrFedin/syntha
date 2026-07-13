import 'server-only';

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import type { PlatformCorePillarSnapshotPayload } from '@/lib/platform-core-pillar-snapshot.types';
import { getPlatformCorePillarSnapshotResilient } from '@/lib/server/platform-core-pillar-snapshot';
import { getPlatformCoreOrderProductionTailSnapshot } from '@/lib/server/platform-core-order-production-tail-read';

type Input = {
  collectionId: string;
  pillarId: CoreHubPillarId;
  roleId?: CoreChainRoleId;
  factoryId?: string;
  wholesaleOrderId?: string;
  articleId?: string;
  pillarVariant?: 'brand' | 'shop' | 'manufacturer';
};

function documentType(document: { type?: unknown; documentType?: unknown }): string {
  const raw = document.type ?? document.documentType;
  return typeof raw === 'string' && raw.trim() ? raw : 'document';
}

/**
 * Adds canonical Order Production tail facts to the existing pillar snapshot.
 * Legacy orders without a tail row remain valid and keep the original payload.
 */
export async function getPlatformCorePillarSnapshotEnriched(
  input: Input
): Promise<PlatformCorePillarSnapshotPayload> {
  const snapshot = await getPlatformCorePillarSnapshotResilient(input);

  if (
    snapshot.pillarId !== 'order_production' ||
    !('orderProduction' in snapshot) ||
    !snapshot.orderProduction.orderId
  ) {
    return snapshot;
  }

  const tail = await getPlatformCoreOrderProductionTailSnapshot(snapshot.orderProduction.orderId);
  if (!tail) return snapshot;

  return {
    ...snapshot,
    orderProduction: {
      ...snapshot.orderProduction,
      qcStatus: tail.qcStatus,
      packingStatus: tail.packingStatus,
      shipmentStatus: tail.shipmentStatus,
      acceptanceStatus: tail.acceptanceStatus,
      closeoutStatus: tail.closeoutStatus,
      hasOpenClaim: tail.hasOpenClaim,
      documents: tail.documents.map((document) => ({
        id: document.id,
        type: documentType(document),
        title:
          'title' in document && typeof document.title === 'string' ? document.title : undefined,
        status:
          'status' in document && typeof document.status === 'string' ? document.status : undefined,
        href:
          'href' in document && typeof document.href === 'string' ? document.href : undefined,
        issuedAt:
          'issuedAt' in document && typeof document.issuedAt === 'string'
            ? document.issuedAt
            : undefined,
      })),
    },
  };
}
