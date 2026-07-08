/**
 * Platform Core · EXTENDED routes (manufacturer / supplier / factory).
 *
 * Baseline-файлы (`platform-core-hub-matrix-rows.ts`, `/brand/core`, `/shop/core`)
 * НЕ импортируют этот модуль — только extended-строки за флагом
 * `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`.
 */

import { B2B_WHOLESALE_ORDER_CONTEXT_QUERY } from '@/lib/domain/cross-role-entity-ids';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

const B2B_CTX = B2B_WHOLESALE_ORDER_CONTEXT_QUERY;

/** Factory / supplier route keys — только для extended-кабинетов. */
export const ROUTES = {
  factory: {
    calendar: '/factory/calendar',
    home: '/factory',
    messages: '/factory/messages',
    production: '/factory/production',
    productionCalendar: '/factory/production/calendar',
    productionCatalog: '/factory/production/catalog',
    productionCoreCabinet: '/factory/production/core',
    productionMaterials: '/factory/production/materials',
    productionMessages: '/factory/production/messages',
    productionOrders: '/factory/production/orders',
    supplier: '/factory/supplier',
    supplierCoreCabinet: '/factory/supplier/core',
    supplierMessages: '/factory/supplier/messages',
    supplierRfqInbox: '/factory/supplier/rfq-inbox',
  },
} as const;

/** Alias для extended hub-строк и audit-секций manufacturer/supplier. */
export const PLATFORM_CORE_ROUTES = ROUTES;

export type FactoryMessagesRole = 'manufacturer' | 'supplier';

export function factoryProductionDossierHref(
  articleId: string,
  opts?: { collectionId?: string }
): string {
  const base = `/factory/production/dossier/${encodeURIComponent(articleId)}`;
  const cid = opts?.collectionId?.trim();
  return cid ? `${base}?collection=${encodeURIComponent(cid)}` : base;
}

export function factoryProductionDossierContextHref(
  articleId: string,
  opts?: { collectionId?: string; orderId?: string }
): string {
  const sp = new URLSearchParams({ pillar: 'order_production' });
  const cid = opts?.collectionId?.trim();
  if (cid) sp.set('collection', cid);
  const oid = opts?.orderId?.trim();
  if (oid) sp.set('order', oid);
  return `/factory/production/dossier/${encodeURIComponent(articleId)}?${sp.toString()}`;
}

export function factoryCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.factory.productionCoreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}

export function factorySupplierCoreOrderProductionCabinetHref(collectionId: string): string {
  return `${ROUTES.factory.supplierCoreCabinet}?pillar=order_production&collection=${encodeURIComponent(collectionId)}`;
}

export function factoryProductionOrdersOrderContextHref(
  orderId: string,
  opts?: { factoryId?: string }
): string {
  const sp = new URLSearchParams({ order: orderId });
  if (opts?.factoryId?.trim()) sp.set('factoryId', opts.factoryId.trim());
  return `${ROUTES.factory.productionOrders}?${sp.toString()}`;
}

export function factoryProductionHandoffQueueHref(
  orderId: string,
  opts?: { factoryId?: string; collectionId?: string }
): string {
  const sp = new URLSearchParams({ order: orderId });
  if (opts?.factoryId?.trim()) sp.set('factoryId', opts.factoryId.trim());
  if (opts?.collectionId?.trim()) sp.set('collection', opts.collectionId.trim());
  sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'handoff');
  return `${ROUTES.factory.production}?${sp.toString()}#handoff-queue`;
}

export function factoryMessagesB2bOrderContextHref(
  orderId: string,
  options?: { role?: FactoryMessagesRole }
): string {
  const base = `${ROUTES.factory.messages}?${b2bOrderMessagesQuery(orderId)}`;
  const roleQ = factoryMessagesRoleQuery(options?.role);
  return roleQ ? `${base}&${roleQ}` : base;
}

export function factoryMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string,
  options?: { role?: FactoryMessagesRole }
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  const base = `${ROUTES.factory.messages}?contextType=workshop2_article&contextId=${ctx}`;
  const roleQ = factoryMessagesRoleQuery(options?.role);
  return roleQ ? `${base}&${roleQ}` : base;
}

export function factoryMessagesRoleHref(role: FactoryMessagesRole): string {
  return `${ROUTES.factory.messages}?role=${role}`;
}

export function factorySupplierRfqInboxHref(input?: {
  collectionId?: string;
  articleId?: string;
}): string {
  const sp = new URLSearchParams();
  const collectionId = input?.collectionId?.trim();
  const articleId = input?.articleId?.trim();
  if (collectionId) sp.set('collection', collectionId);
  if (articleId) sp.set('article', articleId);
  const q = sp.toString();
  return q ? `${ROUTES.factory.supplierRfqInbox}?${q}` : ROUTES.factory.supplierRfqInbox;
}

export function factorySupplierMessagesB2bOrderContextHref(orderId: string): string {
  return `${ROUTES.factory.supplierMessages}?${b2bOrderMessagesQuery(orderId)}`;
}

export function factorySupplierMessagesWorkshop2ArticleContextHref(
  collectionId: string,
  articleId: string
): string {
  const ctx = encodeURIComponent(`${collectionId}:${articleId}`);
  return `${ROUTES.factory.supplierMessages}?contextType=workshop2_article&contextId=${ctx}`;
}

export function factoryCalendarB2bOrderContextHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `${ROUTES.factory.productionCalendar}?layers=tasks,orders,production&${B2B_CTX.order}=${id}`;
}

export function factorySupplierCalendarB2bOrderContextHref(orderId: string): string {
  const sp = new URLSearchParams({
    role: 'supplier',
    layers: 'tasks,orders,logistics',
  });
  sp.set(B2B_CTX.order, orderId);
  sp.set(B2B_CTX.orderId, orderId);
  return `${ROUTES.factory.calendar}?${sp.toString()}`;
}

/** Ключи `ROUTES.factory.*` — только для extended-кабинетов. */
export const PLATFORM_CORE_EXTENDED_ROUTE_KEYS = [
  'factory.production',
  'factory.productionCalendar',
  'factory.productionCatalog',
  'factory.productionCoreCabinet',
  'factory.productionMaterials',
  'factory.productionOrders',
  'factory.supplierCoreCabinet',
  'factory.supplierMessages',
  'factory.supplierRfqInbox',
] as const;

function b2bOrderMessagesQuery(orderId: string): string {
  const id = encodeURIComponent(orderId);
  return `contextType=b2b_order&contextId=${id}&${B2B_CTX.order}=${id}&${B2B_CTX.orderId}=${id}&q=${encodeURIComponent(`B2B ${orderId}`)}`;
}

function factoryMessagesRoleQuery(role?: FactoryMessagesRole): string {
  return role ? `role=${role}` : '';
}
