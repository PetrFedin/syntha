import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import {
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import {
  BRAND_ALT_MATERIAL_APPROVAL_API_PATH,
  buildSupplierDevBomCabinetHref,
} from '@/lib/production/workshop2-brand-alt-material-approval';
import type { SupplierAltMaterialRow } from '@/lib/platform-core-supplier-materials-reference';
import {
  formatSupplierAltMaterialApprovalStatusRu,
  type SupplierAltMaterialApprovalStatus,
} from '@/lib/production/workshop2-supplier-alt-material-approval';

/** Wave XW — supplier alt-material PG approval + brand dev BOM strip cross-link (sup dev 4.1). */
export const WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API = '/api/workshop2/supplier/alt-material-approval';
export const WAVE_XW_BRAND_ALT_MATERIAL_APPROVAL_API = BRAND_ALT_MATERIAL_APPROVAL_API_PATH;

export const WAVE_XW_ALT_MATERIALS_NOTE_RU =
  'Замены из поля substitutes в BOM досье · отправка на согласование бренду через PG (без localStorage).';

export const WAVE_XW_SUP_BOM_ALT_STRIP_LABEL_RU = 'Согласование альтернатив';
export const WAVE_XW_SUP_BOM_ALT_EMPTY_RU =
  'В substitutes BOM нет пар primary→alternative — задайте замены в ТЗ бренда.';
export const WAVE_XW_SUP_BOM_ALT_UNTRACKED_RU = (pairCount: number) =>
  `${pairCount} пар · без решений в PG`;

export const WAVE_XW_SUP_BOM_BRAND_ALT_LINK_RU = 'Согласование у бренда →';
export const WAVE_XW_SUP_BOM_WORKSPACE_LINK_RU = 'Рабочий экран альтернатив →';
export const WAVE_XW_BRAND_SUP_CABINET_LINK_RU = 'BOM поставщика →';

export const SUP_DEV_BOM_BRAND_ALT_MATERIAL_LINK_TESTID = 'sup-dev-bom-brand-alt-material-link';
export const MATERIALS_ALT_MATERIALS_NAV_TESTID = 'materials-alt-materials-nav';
export const MATERIALS_ALT_MATERIALS_CATALOG_LINK_TESTID = 'materials-alt-materials-catalog-link';
export const MATERIALS_ALT_MATERIALS_CABINET_LINK_TESTID = 'materials-alt-materials-cabinet-link';
export const MATERIALS_ALT_MATERIALS_BRAND_BOM_LINK_TESTID = 'materials-alt-materials-brand-bom-link';
export const MATERIALS_ALT_MATERIALS_NOTE_TESTID = 'materials-alt-materials-note';

export type SupplierAltMaterialAction = 'submit' | 'approve' | 'reject';

export function buildBrandDevBomAltMaterialApprovalHref(input?: {
  collectionId?: string;
  articleId?: string;
}): string {
  return buildBrandSupplierBomSession(input).bomHref;
}

export function buildSupplierDevBomCabinetAltMaterialHref(input: {
  collectionId: string;
  articleId?: string;
}): string {
  return buildSupplierDevBomCabinetHref(input);
}

export function buildMaterialsAltMaterialsCatalogHref(input: {
  collectionId: string;
  articleId: string;
}): string {
  return factoryMaterialsCatalogHrefForDemo({
    collectionId: input.collectionId.trim(),
    demoArticleId: input.articleId.trim(),
    demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
    factoryId: PLATFORM_CORE_DEMO.factoryId,
  });
}

export function buildMaterialsAltMaterialsWorkspaceHref(input: {
  collectionId: string;
  articleId: string;
}): string {
  return factoryMaterialsHrefForDemo({
    collectionId: input.collectionId.trim(),
    demoArticleId: input.articleId.trim(),
    demoOrderId: PLATFORM_CORE_DEMO.demoOrderId,
    factoryId: PLATFORM_CORE_DEMO.factoryId,
  });
}

export function countSupplierAltMaterialPairs(rows: readonly SupplierAltMaterialRow[]): number {
  return rows.reduce((sum, row) => sum + row.alternatives.length, 0);
}

export function supplierCanActAltMaterialApproval(input: {
  action: SupplierAltMaterialAction;
  currentStatus: SupplierAltMaterialApprovalStatus | null | undefined;
}): boolean {
  const status = input.currentStatus ?? null;
  if (input.action === 'submit') {
    return status === null || status === 'rejected';
  }
  if (input.action === 'approve') {
    return status === null || status === 'pending';
  }
  if (input.action === 'reject') {
    return status === null || status === 'pending' || status === 'approved';
  }
  return false;
}

export const WAVE_XW_SUP_ALT_SUBMIT_LABEL_RU = 'На согласование';
export const WAVE_XW_SUP_ALT_APPROVE_LABEL_RU = 'Согласовать';
export const WAVE_XW_SUP_ALT_REJECT_LABEL_RU = 'Отклонить';

export function supplierAltMaterialActionRu(action: SupplierAltMaterialAction): string {
  if (action === 'submit') return 'на согласование';
  if (action === 'approve') return 'согласовать';
  return 'отклонить';
}

export function brandAltMaterialNotificationTitleRu(input: {
  actor: 'supplier' | 'brand';
  status: SupplierAltMaterialApprovalStatus;
}): string {
  const statusRu = formatSupplierAltMaterialApprovalStatusRu(input.status);
  if (input.actor === 'supplier' && input.status === 'pending') {
    return 'Поставщик отправил альтернативу материала';
  }
  if (input.actor === 'supplier') {
    return `Поставщик · альтернатива · ${statusRu}`;
  }
  return `Решение бренда по альтернативе · ${statusRu}`;
}
