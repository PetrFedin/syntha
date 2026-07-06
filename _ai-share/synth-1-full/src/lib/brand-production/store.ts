/**
 * Хранилище без API: localStorage. Те же сущности ожидаются от REST/GraphQL.
 */

import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';
import type {
  ArticleEntity,
  BrandProductionState,
  IntegrationConfigEntity,
  ProductionRole,
} from './types';
import { createSeedState } from './seed';
import { canMoveToPoStage, canMoveArticleToWarehouse } from './lifecycle-rules';
import { ARTICLE_LIFECYCLE_ORDER, type ArticleLifecycleStage } from './types';

const STORAGE_KEY = 'brand_production_unified_v1';

function hasConfirmedPOForArticle(state: BrandProductionState, articleId: string): boolean {
  return state.purchaseOrders.some(
    (po) =>
      ['confirmed', 'in_production', 'completed'].includes(po.status) &&
      po.lines.some((l) => l.articleId === articleId)
  );
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadBrandProductionState(): BrandProductionState {
  if (typeof window === 'undefined') return createSeedState();
  if (!shouldUseLocalStorageClientFallbackInCore()) return createSeedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as BrandProductionState;
  } catch {
    return createSeedState();
  }
}

export function saveBrandProductionState(state: BrandProductionState): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetBrandProductionToSeed(): BrandProductionState {
  const seed = createSeedState();
  saveBrandProductionState(seed);
  return seed;
}

function pushAudit(
  state: BrandProductionState,
  entityType: string,
  entityId: string,
  action: string,
  fromValue?: string,
  toValue?: string,
  meta?: Record<string, unknown>
): void {
  state.auditLog.unshift({
    id: generateId('audit'),
    at: new Date().toISOString(),
    userId: state.currentUserId,
    userLabel: state.currentUserLabel,
    entityType,
    entityId,
    action,
    fromValue,
    toValue,
    meta,
  });
  state.auditLog = state.auditLog.slice(0, 500);
}

export function setArticleLifecycleStage(
  state: BrandProductionState,
  articleId: string,
  next: ArticleLifecycleStage
): { ok: boolean; error?: string; state: BrandProductionState } {
  const art = state.articles.find((a) => a.id === articleId);
  if (!art) return { ok: false, error: 'Артикул не найден', state };

  const prev = art.lifecycleStage;
  if (
    ARTICLE_LIFECYCLE_ORDER.indexOf(next) < ARTICLE_LIFECYCLE_ORDER.indexOf(prev) &&
    next !== prev
  ) {
    return { ok: false, error: 'Откат этапа — только через API администратора.', state };
  }

  if (next === 'po') {
    const c = canMoveToPoStage(art);
    if (!c.allowed) return { ok: false, error: c.reason, state };
  }
  if (
    next === 'manufacturing' ||
    ARTICLE_LIFECYCLE_ORDER.indexOf(next) > ARTICLE_LIFECYCLE_ORDER.indexOf('po')
  ) {
    if (ARTICLE_LIFECYCLE_ORDER.indexOf(next) >= ARTICLE_LIFECYCLE_ORDER.indexOf('manufacturing')) {
      if (!hasConfirmedPOForArticle(state, articleId)) {
        return {
          ok: false,
          error: 'Нельзя перейти в производство без подтверждённого PO по артикулу.',
          state,
        };
      }
    }
  }
  if (next === 'warehouse') {
    const po = state.purchaseOrders.find((p) => p.lines.some((l) => l.articleId === articleId));
    const w = canMoveArticleToWarehouse(art, po, state.qcInspections);
    if (!w.allowed) return { ok: false, error: w.reason, state };
  }

  const nextState: BrandProductionState = {
    ...state,
    articles: state.articles.map((a) =>
      a.id === articleId
        ? { ...a, lifecycleStage: next, b2bReady: next === 'b2b_ready' ? true : a.b2bReady }
        : a
    ),
  };
  pushAudit(nextState, 'Article', articleId, 'lifecycle_change', prev, next);
  saveBrandProductionState(nextState);
  return { ok: true, state: nextState };
}

export function updateIntegrationConfig(
  state: BrandProductionState,
  patch: Partial<IntegrationConfigEntity>
): BrandProductionState {
  const next: BrandProductionState = {
    ...state,
    integration: { ...state.integration, ...patch },
  };
  pushAudit(
    next,
    'Integration',
    'config',
    'update',
    undefined,
    undefined,
    patch as Record<string, unknown>
  );
  saveBrandProductionState(next);
  return next;
}

export function setCurrentRole(
  state: BrandProductionState,
  role: ProductionRole
): BrandProductionState {
  const next = { ...state, currentRole: role };
  saveBrandProductionState(next);
  return next;
}

export function exportPOToCsvRows(state: BrandProductionState, poId: string): string[][] {
  const po = state.purchaseOrders.find((p) => p.id === poId);
  if (!po) return [];
  const rows: string[][] = [['PO', 'Артикул', 'Название', 'Дроп', 'Размер', 'Кол-во']];
  for (const line of po.lines) {
    const art = state.articles.find((a) => a.id === line.articleId);
    for (const [size, qty] of Object.entries(line.sizeBreakdown)) {
      rows.push([
        po.code,
        art?.sku ?? line.articleId,
        art?.name ?? '',
        line.dropId,
        size,
        String(qty),
      ]);
    }
  }
  return rows;
}
