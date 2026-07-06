'use client';

import {
  loadUnifiedSkuFlowDoc,
  saveUnifiedSkuFlowDoc,
  type CollectionSkuFlowDoc,
} from '@/lib/production/unified-sku-flow-store';
import type { BrandTaskRecord, ProductionDataPort, TechPackDraftV1 } from './port';
import { loadTechPackDraft, saveTechPackDraft as persistTechPack } from './tech-pack-draft-store';
import { loadBrandTasksWithMode, persistBrandTasks } from './brand-tasks-client';
import { loadFloorTabDraftWithMode, persistFloorTabDraft } from './floor-tab-draft-client';
import type { FloorTabScope } from './port';

export class LocalStorageProductionDataPort implements ProductionDataPort {
  async getSkuFlow(collectionKey: string): Promise<CollectionSkuFlowDoc> {
    return loadUnifiedSkuFlowDoc(collectionKey);
  }

  async saveSkuFlow(collectionKey: string, doc: CollectionSkuFlowDoc): Promise<void> {
    saveUnifiedSkuFlowDoc(collectionKey, doc);
  }

  async getTechPackDraft(styleId: string): Promise<TechPackDraftV1 | null> {
    return loadTechPackDraft(styleId);
  }

  async saveTechPackDraft(draft: TechPackDraftV1): Promise<void> {
    persistTechPack(draft);
  }

  async listTasks(): Promise<BrandTaskRecord[]> {
    const { tasks } = await loadBrandTasksWithMode();
    return tasks;
  }

  async saveTasks(tasks: BrandTaskRecord[]): Promise<void> {
    await persistBrandTasks(tasks);
  }

  async getFloorTabDraft(scope: FloorTabScope): Promise<unknown | null> {
    const { draft } = await loadFloorTabDraftWithMode(scope);
    return draft;
  }

  async saveFloorTabDraft(scope: FloorTabScope, payload: unknown): Promise<void> {
    await persistFloorTabDraft(scope, payload);
  }
}

let singleton: ProductionDataPort | null = null;

export function getProductionDataPort(): ProductionDataPort {
  if (!singleton) singleton = new LocalStorageProductionDataPort();
  return singleton;
}

/** Для тестов / будущего внедрения API */
export function setProductionDataPort(port: ProductionDataPort): void {
  singleton = port;
}
