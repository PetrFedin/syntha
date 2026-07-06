import type { Workshop2SketchPinTemplate } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

/** Версия ключа localStorage — поднимать при несовместимых изменениях формата. */
export const SKETCH_ORG_TEMPLATES_STORAGE_VERSION = 1;

const MAX_ORG_TEMPLATES = 48;

export function sketchOrgTemplatesStorageKey(collectionId: string): string {
  return `w2-org-sketch-pin-templates:v${SKETCH_ORG_TEMPLATES_STORAGE_VERSION}:${collectionId.trim()}`;
}

function isPinTemplateRow(x: unknown): x is Workshop2SketchPinTemplate {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.templateId === 'string' &&
    typeof o.name === 'string' &&
    typeof o.createdAt === 'string' &&
    Array.isArray(o.annotations)
  );
}

function parseList(raw: string | null): Workshop2SketchPinTemplate[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    return j.filter(isPinTemplateRow);
  } catch {
    return [];
  }
}

/**
 * Репозиторий шаблонов «уровня коллекции».
 * Сейчас: localStorage в браузере. Замените реализацию на HTTP при появлении API.
 */
export interface SketchOrgPinTemplateRepository {
  list(collectionId: string): Promise<Workshop2SketchPinTemplate[]>;
  replaceAll(collectionId: string, items: Workshop2SketchPinTemplate[]): Promise<void>;
}

class LocalStorageSketchOrgPinTemplateRepository implements SketchOrgPinTemplateRepository {
  async list(collectionId: string): Promise<Workshop2SketchPinTemplate[]> {
    if (typeof window === 'undefined' || !collectionId.trim()) return [];
    if (!shouldUseLocalStorageClientFallbackInCore()) return [];
    return parseList(localStorage.getItem(sketchOrgTemplatesStorageKey(collectionId)));
  }

  async replaceAll(collectionId: string, items: Workshop2SketchPinTemplate[]): Promise<void> {
    if (typeof window === 'undefined' || !collectionId.trim()) return;
    if (!shouldMirrorPgClientStoreToLocalStorage()) return;
    const next = items.slice(-MAX_ORG_TEMPLATES);
    localStorage.setItem(sketchOrgTemplatesStorageKey(collectionId), JSON.stringify(next));
  }
}

const localRepo = new LocalStorageSketchOrgPinTemplateRepository();

/** Текущий адаптер; для тестов или API подмените до инициализации UI. */
let activeRepo: SketchOrgPinTemplateRepository = localRepo;

export function setSketchOrgPinTemplateRepository(repo: SketchOrgPinTemplateRepository): void {
  activeRepo = repo;
}

export function getSketchOrgPinTemplateRepository(): SketchOrgPinTemplateRepository {
  return activeRepo;
}

/** Синхронное чтение из localStorage (только клиент). */
export function readOrgSketchPinTemplatesSync(
  collectionId: string | undefined
): Workshop2SketchPinTemplate[] {
  if (typeof window === 'undefined' || !collectionId?.trim()) return [];
  if (!shouldUseLocalStorageClientFallbackInCore()) return [];
  return parseList(localStorage.getItem(sketchOrgTemplatesStorageKey(collectionId)));
}

export async function appendOrgSketchPinTemplate(
  collectionId: string,
  template: Workshop2SketchPinTemplate
): Promise<void> {
  const cur = await activeRepo.list(collectionId);
  await activeRepo.replaceAll(collectionId, [...cur, template]);
}

export async function removeOrgSketchPinTemplate(
  collectionId: string,
  templateId: string
): Promise<void> {
  const cur = await activeRepo.list(collectionId);
  await activeRepo.replaceAll(
    collectionId,
    cur.filter((t) => t.templateId !== templateId)
  );
}
