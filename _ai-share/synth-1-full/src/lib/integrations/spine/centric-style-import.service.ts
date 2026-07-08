/**
 * Centric style import (Wave B1 mock) — creates external ref + optional eligible.
 */
import 'server-only';

import { upsertExternalRef } from './integration-external-refs-persistence.file';

export type CentricStyleImportPayload = {
  styleId: string;
  styleCode?: string;
  lifecycleState?: string;
  collectionId?: string;
  articleId?: string;
};

export type CentricStyleImportResult = {
  articleId: string;
  centricStyleId: string;
  eligibleForCollection: boolean;
  warnings: string[];
};

export function importCentricStyle(payload: CentricStyleImportPayload): CentricStyleImportResult {
  const articleId = payload.articleId ?? payload.styleCode ?? payload.styleId;
  const approved = (payload.lifecycleState ?? '').trim().toLowerCase() === 'approved';
  const warnings: string[] = [];

  upsertExternalRef({
    platform: 'centric',
    externalId: payload.styleId,
    externalRevision: approved ? 'Approved' : (payload.lifecycleState ?? 'Draft'),
    synthaEntityType: 'article',
    synthaEntityId: articleId,
    lastSyncedAt: new Date().toISOString(),
    syncDirection: 'inbound',
  });

  if (payload.collectionId) {
    upsertExternalRef({
      platform: 'centric',
      externalId: payload.styleId,
      synthaEntityType: 'collection',
      synthaEntityId: payload.collectionId,
      lastSyncedAt: new Date().toISOString(),
      syncDirection: 'inbound',
    });
  }

  return {
    articleId,
    centricStyleId: payload.styleId,
    eligibleForCollection: approved,
    warnings,
  };
}
