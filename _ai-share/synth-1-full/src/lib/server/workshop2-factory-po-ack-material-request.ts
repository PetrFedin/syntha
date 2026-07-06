import 'server-only';

import type { Workshop2ProductionMaterialLine } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  createWorkshop2MaterialRequisition,
  listWorkshop2MaterialRequisitions,
} from '@/lib/server/workshop2-material-requisition-repository';
import { getWorkshop2PurchaseOrderById } from '@/lib/server/workshop2-purchase-order-repository';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { WAVE_WU_MFR_PO_ACK_MATERIAL_SOURCE } from '@/lib/platform/wave-wu-mfr-auto-material-request';

/** Wave WU: auto material-request draft после factory PO ack в handoff queue. */
export async function autoCreateMaterialRequestsOnFactoryPoAck(input: {
  productionOrderId: string;
  collectionId: string;
  articleId: string;
  organizationId?: string;
  actor?: string;
  b2bOrderId?: string;
}): Promise<{ created: number; skipped: number; requisitionIds: string[] }> {
  const po = await getWorkshop2PurchaseOrderById(input.productionOrderId, input.organizationId);
  const poQty = po?.qty && po.qty > 0 ? po.qty : 1;
  const actor = input.actor?.trim() || 'factory_po_ack';

  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  const bomLines: Workshop2ProductionMaterialLine[] =
    record?.dossier?.productionModel?.materialLines?.filter((l) => l.materialName?.trim()) ?? [];

  if (bomLines.length === 0) {
    return { created: 0, skipped: 0, requisitionIds: [] };
  }

  const existing = await listWorkshop2MaterialRequisitions({
    collectionId: input.collectionId,
    articleId: input.articleId,
    organizationId: input.organizationId,
  });

  const requisitionIds: string[] = [];
  let created = 0;
  let skipped = 0;

  for (const line of bomLines) {
    const materialLabel = line.materialName!.trim();
    const matched = existing.find(
      (r) => r.materialLabel?.trim().toLowerCase() === materialLabel.toLowerCase()
    );
    if (matched) {
      skipped += 1;
      requisitionIds.push(matched.id);
      continue;
    }
    const perUnit = line.yieldPerUnit ?? line.consumption ?? 1;
    const createdReq = await createWorkshop2MaterialRequisition({
      collectionId: input.collectionId,
      articleId: input.articleId,
      organizationId: input.organizationId,
      materialLabel,
      quantity: perUnit * poQty,
      unit: line.unit,
      createdBy: actor,
      payload: {
        source: WAVE_WU_MFR_PO_ACK_MATERIAL_SOURCE,
        productionOrderId: input.productionOrderId,
        b2bOrderId: input.b2bOrderId ?? null,
      },
    });
    created += 1;
    requisitionIds.push(createdReq.id);
    existing.push(createdReq);
  }

  if (created > 0) {
    void enqueueWorkshop2DomainEvent({
      type: 'supply.material_request.updated',
      collectionId: input.collectionId,
      articleId: input.articleId,
      payload: {
        source: WAVE_WU_MFR_PO_ACK_MATERIAL_SOURCE,
        productionOrderId: input.productionOrderId,
        created,
        requisitionIds,
      },
    }).catch(() => {});
  }

  return { created, skipped, requisitionIds };
}
