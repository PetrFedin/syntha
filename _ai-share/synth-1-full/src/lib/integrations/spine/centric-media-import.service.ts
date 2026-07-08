/**
 * Wave B3 · F-P2-MEDIA — Centric PXM Asset.Url → linesheet / showroom hero.
 */
import 'server-only';

import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { upsertExternalRef } from './integration-external-refs-persistence.file';
import {
  upsertCentricPxmMedia,
  type CentricPxmAsset,
  type CentricPxmMediaRecord,
} from './centric-pxm-media-persistence.file';

export type CentricMediaImportPayload = {
  styleId: string;
  collectionId: string;
  articleId: string;
  heroUrl?: string;
  assets?: CentricPxmAsset[];
};

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80';

export async function importCentricPxmMedia(
  payload: CentricMediaImportPayload,
  organizationId?: string
): Promise<CentricPxmMediaRecord> {
  const org = organizationId?.trim() || 'org-brand-001';
  const heroUrl = payload.heroUrl?.trim() || DEFAULT_HERO;
  const assets: CentricPxmAsset[] = payload.assets?.length
    ? payload.assets
    : [
        { assetId: `${payload.styleId}-hero`, url: heroUrl, kind: 'hero', mimeType: 'image/jpeg' },
        {
          assetId: `${payload.styleId}-linesheet`,
          url: heroUrl,
          kind: 'linesheet',
          mimeType: 'image/jpeg',
        },
      ];

  const record = upsertCentricPxmMedia({
    collectionId: payload.collectionId,
    articleId: payload.articleId,
    centricStyleId: payload.styleId,
    heroUrl,
    assets,
    importedAt: new Date().toISOString(),
  });

  upsertExternalRef({
    platform: 'centric',
    externalId: `${payload.styleId}:PXM`,
    externalRevision: 'media',
    synthaEntityType: 'article',
    synthaEntityId: payload.articleId,
    lastSyncedAt: new Date().toISOString(),
    syncDirection: 'inbound',
  });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId: `${payload.collectionId}:${payload.articleId}`,
    message: `Centric PXM · ${assets.length} asset(s) · hero для linesheet/showroom.`,
  });

  return record;
}
