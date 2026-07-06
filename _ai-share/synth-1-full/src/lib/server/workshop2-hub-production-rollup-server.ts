import 'server-only';

import type { Workshop2SampleOrderStatus } from '@/lib/production/workshop2-dossier-phase1.types';
import { buildWorkshop2ProductionAnalyticsSnapshot } from '@/lib/production/workshop2-production-analytics';
import {
  listWorkshop2SampleOrders,
  listWorkshop2SampleOrdersByCollection,
} from '@/lib/server/workshop2-sample-order-repository';

const STATUSES: Workshop2SampleOrderStatus[] = [
  'draft',
  'sent',
  'in_progress',
  'received',
  'approved',
  'cancelled',
];

export type Workshop2HubProductionRollupSnapshot = {
  collectionId: string | null;
  scope: 'collection' | 'multi';
  articleCount?: number;
  total: number;
  byStatus: Record<string, number>;
  avgLeadTimeDays: number | null;
  hintRu: string;
};

export function parseWorkshop2HubArticleScope(
  raw: string | null | undefined
): Array<{ collectionId: string; articleId: string }> {
  if (!raw?.trim()) return [];
  const out: Array<{ collectionId: string; articleId: string }> = [];
  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [collectionId, articleId] = trimmed.split(':');
    if (collectionId?.trim() && articleId?.trim()) {
      out.push({ collectionId: collectionId.trim(), articleId: articleId.trim() });
    }
  }
  return out;
}

export async function buildWorkshop2HubProductionRollupSnapshot(input: {
  collectionId?: string;
  articleScope?: Array<{ collectionId: string; articleId: string }>;
}): Promise<Workshop2HubProductionRollupSnapshot | null> {
  const collectionId = input.collectionId?.trim() ?? '';
  const articleScope = input.articleScope ?? [];

  if (!collectionId && articleScope.length === 0) return null;

  let orders: Awaited<ReturnType<typeof listWorkshop2SampleOrdersByCollection>> = [];
  let scopeLabel = '';

  if (articleScope.length > 0) {
    const seen = new Set<string>();
    for (const { collectionId: cid, articleId: aid } of articleScope.slice(0, 80)) {
      const key = `${cid}::${aid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const articleOrders = await listWorkshop2SampleOrders({
        collectionId: cid,
        articleId: aid,
      });
      orders.push(...articleOrders);
    }
    scopeLabel = `видимые артикулы (${articleScope.length})`;
  } else {
    orders = await listWorkshop2SampleOrdersByCollection({ collectionId });
    scopeLabel = `коллекция ${collectionId}`;
  }

  const byStatus: Record<string, number> = {};
  for (const status of STATUSES) byStatus[status] = 0;
  for (const order of orders) {
    byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
  }

  const leadSamples = orders
    .map(
      (order) =>
        buildWorkshop2ProductionAnalyticsSnapshot({
          collectionId: order.collectionId,
          articleId: order.articleId,
          statusHistory: order.statusHistory,
        }).sampleLeadTimeDays
    )
    .filter((days): days is number => days != null);
  const avgLeadTimeDays =
    leadSamples.length > 0
      ? Math.round(leadSamples.reduce((sum, days) => sum + days, 0) / leadSamples.length)
      : null;

  return {
    collectionId: collectionId || null,
    scope: articleScope.length > 0 ? 'multi' : 'collection',
    articleCount: articleScope.length > 0 ? articleScope.length : undefined,
    total: orders.length,
    byStatus,
    avgLeadTimeDays,
    hintRu: `Образцы (${scopeLabel}): ${orders.length} заказов${avgLeadTimeDays != null ? ` · ср. lead ${avgLeadTimeDays} дн.` : ''}.`,
  };
}
