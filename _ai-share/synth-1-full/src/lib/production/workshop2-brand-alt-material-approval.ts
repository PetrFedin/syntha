import { ROUTES } from '@/lib/routes';
import {
  buildSupplierAltMaterialApprovalKey,
  type SupplierAltMaterialApprovalStatus,
} from '@/lib/production/workshop2-supplier-alt-material-approval';

export type BrandAltMaterialApprovalAction = 'approve' | 'reject';

export type BrandAltMaterialPendingItem = {
  key: string;
  primary: string;
  alternative: string;
  status: 'pending';
};

export const BRAND_ALT_MATERIAL_APPROVAL_API_PATH =
  '/api/brand/merch/supplier-bom/alt-material-approval';

export function parseSupplierAltMaterialApprovalKey(key: string): {
  primary: string;
  alternative: string;
} | null {
  const idx = key.indexOf('::');
  if (idx <= 0) return null;
  const primary = key.slice(0, idx).trim();
  const alternative = key.slice(idx + 2).trim();
  if (!primary || !alternative) return null;
  return { primary, alternative };
}

export function listPendingBrandAltMaterialApprovals(
  approvals: Record<string, SupplierAltMaterialApprovalStatus>
): BrandAltMaterialPendingItem[] {
  return Object.entries(approvals)
    .filter(([, status]) => status === 'pending')
    .map(([key]) => {
      const parsed = parseSupplierAltMaterialApprovalKey(key);
      if (!parsed) return null;
      return {
        key,
        primary: parsed.primary,
        alternative: parsed.alternative,
        status: 'pending' as const,
      };
    })
    .filter((row): row is BrandAltMaterialPendingItem => row !== null);
}

export function brandCanDecideAltMaterialApproval(input: {
  action: BrandAltMaterialApprovalAction;
  currentStatus: SupplierAltMaterialApprovalStatus | null | undefined;
}): boolean {
  if (input.action !== 'approve' && input.action !== 'reject') return false;
  return input.currentStatus === 'pending';
}

export function brandAltMaterialApprovalActionRu(action: BrandAltMaterialApprovalAction): string {
  return action === 'approve' ? 'согласовать' : 'отклонить';
}

export function buildSupplierDevBomCabinetHref(input: {
  collectionId: string;
  articleId?: string;
}): string {
  const params = new URLSearchParams({
    pillar: 'development',
    collection: input.collectionId.trim(),
  });
  const articleId = input.articleId?.trim();
  if (articleId) params.set('article', articleId);
  return `${ROUTES.factory.supplierCoreCabinet}?${params.toString()}`;
}

export function brandAltMaterialDecisionKey(primary: string, alternative: string): string {
  return buildSupplierAltMaterialApprovalKey(primary, alternative);
}
