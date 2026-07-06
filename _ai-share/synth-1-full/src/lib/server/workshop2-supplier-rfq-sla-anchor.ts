import 'server-only';

import { getCentricRfqByArticle } from '@/lib/integrations/spine/centric-rfq-persistence.file';
import {
  resolveSupplierRfqSlaAnchor,
  type SupplierRfqSlaAnchorSource,
} from '@/lib/fashion/supplier-rfq-sla';
import { getPlatformCoreEntityThreadTemplatesServer } from '@/lib/server/platform-core-entity-thread-templates-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';

export type SupplierRfqSlaAnchorResult = {
  rfqId: string | null;
  importedAt: string | null;
  threadCreatedAt: string | null;
  anchorAt: string | null;
  anchorSource: SupplierRfqSlaAnchorSource;
  storageMode: 'pg' | 'file' | 'memory';
};

async function resolveThreadCreatedAtFromPg(
  collectionId: string,
  articleId: string
): Promise<string | null> {
  if (!isWorkshop2PostgresEnabled()) return null;
  await ensureWorkshop2PgSchema();
  const contextId = `${collectionId}:${articleId}`;
  const res = await getWorkshop2PgPool().query<{ first_at: Date }>(
    `SELECT MIN(created_at) AS first_at
     FROM workshop2_contextual_messages
     WHERE context_type = 'workshop2_article'
       AND context_id = $1`,
    [contextId]
  );
  const first = res.rows[0]?.first_at;
  return first ? first.toISOString() : null;
}

async function resolveThreadCreatedAtFromEntityTemplates(): Promise<string | null> {
  const cfg = await getPlatformCoreEntityThreadTemplatesServer('platform-core');
  const rfqTemplates = cfg.templates
    .filter((t) => t.threadKind === 'rfq')
    .map((t) => t.createdAt)
    .filter(Boolean);
  if (!rfqTemplates.length) return null;
  return rfqTemplates.sort()[0] ?? null;
}

export async function resolveSupplierRfqSlaAnchorServer(input: {
  collectionId: string;
  articleId: string;
}): Promise<SupplierRfqSlaAnchorResult> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const centric = getCentricRfqByArticle(collectionId, articleId);

  const threadFromMessages = await resolveThreadCreatedAtFromPg(collectionId, articleId);
  const threadFromTemplates = threadFromMessages
    ? null
    : await resolveThreadCreatedAtFromEntityTemplates();
  const threadCreatedAt = threadFromMessages ?? threadFromTemplates;

  const { anchorAt, anchorSource } = resolveSupplierRfqSlaAnchor({
    importedAt: centric?.importedAt,
    threadCreatedAt,
  });

  const storageMode: SupplierRfqSlaAnchorResult['storageMode'] = isWorkshop2PostgresEnabled()
    ? 'pg'
    : centric
      ? 'file'
      : 'memory';

  return {
    rfqId: centric?.rfqId ?? null,
    importedAt: centric?.importedAt ?? null,
    threadCreatedAt,
    anchorAt,
    anchorSource,
    storageMode,
  };
}
