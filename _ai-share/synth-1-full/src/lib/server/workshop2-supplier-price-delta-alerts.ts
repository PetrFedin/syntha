import 'server-only';

import { computeSupplierPriceDeltaAlerts } from '@/lib/fashion/supplier-price-delta-alerts';
import {
  extractSupplierMaterialPriceJournalFromDossierEvents,
} from '@/lib/platform-core-supplier-material-price-journal';
import { extractSupplierMaterialPricePoints } from '@/lib/platform-core-supplier-materials-reference';
import {
  getWorkshop2ServerDossierRecord,
  listWorkshop2DossierEvents,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export async function listSupplierPriceDeltaAlertsServer(input: {
  collectionId: string;
  articleId: string;
  thresholdPct?: number;
}): Promise<{
  alerts: ReturnType<typeof computeSupplierPriceDeltaAlerts>;
  journalCount: number;
  currentCount: number;
  storageMode: 'pg' | 'file' | 'memory';
}> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const materialLines = record?.dossier?.productionModel?.materialLines ?? [];

  const events = await listWorkshop2DossierEvents({
    collectionId,
    articleId,
    limit: 40,
  });

  const journal = extractSupplierMaterialPriceJournalFromDossierEvents(
    events.map((ev) => ({
      eventType: ev.eventType,
      createdAt: ev.createdAt,
      eventPayload: ev.eventPayload ?? null,
    }))
  );
  const currentPoints = extractSupplierMaterialPricePoints(materialLines);
  const alerts = computeSupplierPriceDeltaAlerts({
    journal,
    currentPoints,
    thresholdPct: input.thresholdPct,
  });

  return {
    alerts,
    journalCount: journal.length,
    currentCount: currentPoints.length,
    storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
  };
}
