import 'server-only';

import { createHash } from 'node:crypto';

import {
  getWorkshop2DevelopmentStatus,
  type Workshop2DevelopmentStep,
} from '@/lib/server/workshop2-development-status';

export type ShopDevelopmentProgressSnapshot = {
  collectionId: string;
  articleCount: number;
  sampleQueueCount: number;
  steps: Workshop2DevelopmentStep[];
  demoArticleId: string;
  workshop2Href: string;
};

export type ShopDevelopmentProgressResult = {
  snapshot: ShopDevelopmentProgressSnapshot;
  versionToken: string;
  changesSince: string[];
};

function buildVersionPayload(snapshot: ShopDevelopmentProgressSnapshot): string {
  return JSON.stringify({
    collectionId: snapshot.collectionId,
    articleCount: snapshot.articleCount,
    sampleQueueCount: snapshot.sampleQueueCount,
    steps: snapshot.steps.map((s) => ({ id: s.id, done: s.done })),
  });
}

export function buildShopDevelopmentVersionToken(
  snapshot: ShopDevelopmentProgressSnapshot
): string {
  return createHash('sha256').update(buildVersionPayload(snapshot)).digest('hex').slice(0, 16);
}

export function diffShopDevelopmentProgress(
  previous: Pick<
    ShopDevelopmentProgressSnapshot,
    'articleCount' | 'sampleQueueCount' | 'steps'
  > | null,
  current: ShopDevelopmentProgressSnapshot
): string[] {
  if (!previous) return [];

  const changes: string[] = [];
  if (previous.articleCount !== current.articleCount) {
    changes.push(`Артикулов в разработке: ${previous.articleCount} → ${current.articleCount}`);
  }
  if (previous.sampleQueueCount !== current.sampleQueueCount) {
    changes.push(
      `Образцов у производства: ${previous.sampleQueueCount} → ${current.sampleQueueCount}`
    );
  }

  const prevById = new Map(previous.steps.map((s) => [s.id, s]));
  for (const step of current.steps) {
    const prev = prevById.get(step.id);
    if (!prev) continue;
    if (prev.done !== step.done) {
      changes.push(step.done ? `✓ ${step.labelRu}` : `↺ ${step.labelRu}`);
    }
  }

  return changes;
}

export async function getShopDevelopmentProgress(input: {
  collectionId: string;
  sinceToken?: string;
  sinceSnapshot?: Pick<
    ShopDevelopmentProgressSnapshot,
    'articleCount' | 'sampleQueueCount' | 'steps'
  > | null;
}): Promise<ShopDevelopmentProgressResult> {
  const status = await getWorkshop2DevelopmentStatus(input.collectionId);
  const snapshot: ShopDevelopmentProgressSnapshot = {
    collectionId: status.collectionId,
    articleCount: status.articleCount,
    sampleQueueCount: status.sampleQueueCount,
    steps: status.steps,
    demoArticleId: status.demoArticleId,
    workshop2Href: status.workshop2Href,
  };
  const versionToken = buildShopDevelopmentVersionToken(snapshot);

  let changesSince: string[] = [];
  if (input.sinceSnapshot) {
    changesSince = diffShopDevelopmentProgress(input.sinceSnapshot, snapshot);
  } else if (input.sinceToken && input.sinceToken !== versionToken) {
    changesSince = ['Прогресс разработки обновился с прошлого визита.'];
  }

  return { snapshot, versionToken, changesSince };
}
