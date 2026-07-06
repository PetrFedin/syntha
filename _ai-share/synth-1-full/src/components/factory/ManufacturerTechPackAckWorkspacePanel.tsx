'use client';

import { FactoryDossierTechPackAckPanel } from '@/components/platform/FactoryDossierTechPackAckPanel';
import { MfrOpHandoffQueueCoSpinePeerStrip } from '@/components/factory/MfrOpHandoffQueueCoSpinePeerStrip';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId?: string;
  articleId: string;
};

/** Manufacturer handoff workspace tab · factory-ack (single golden owner: peer strip + ack panel). */
export function ManufacturerTechPackAckWorkspacePanel({
  factoryId,
  collectionId,
  orderId,
  articleId,
}: Props) {
  return (
    <div className="space-y-4" data-testid="manufacturer-handoff-techpack-ack-panel">
      <MfrOpHandoffQueueCoSpinePeerStrip
        factoryId={factoryId}
        collectionId={collectionId}
        orderId={orderId}
      />
      <FactoryDossierTechPackAckPanel
        collectionId={collectionId}
        articleId={articleId}
        surface="workspace"
      />
    </div>
  );
}
