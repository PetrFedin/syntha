import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

export type SupplierAltMaterialApprovalStatus = 'pending' | 'approved' | 'rejected';

export const SUPPLIER_ALT_MATERIAL_APPROVAL_STATUS_RU: Record<
  SupplierAltMaterialApprovalStatus,
  string
> = {
  pending: 'на согласовании',
  approved: 'согласовано',
  rejected: 'отклонено',
};

export type SupplierAltMaterialApprovalSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export function summarizeSupplierAltMaterialApprovals(
  approvals: Record<string, SupplierAltMaterialApprovalStatus>
): SupplierAltMaterialApprovalSummary {
  const values = Object.values(approvals);
  return {
    total: values.length,
    pending: values.filter((s) => s === 'pending').length,
    approved: values.filter((s) => s === 'approved').length,
    rejected: values.filter((s) => s === 'rejected').length,
  };
}

export function formatSupplierAltMaterialApprovalStatusRu(
  status: SupplierAltMaterialApprovalStatus
): string {
  return SUPPLIER_ALT_MATERIAL_APPROVAL_STATUS_RU[status];
}

export function buildSupplierAltMaterialApprovalKey(primary: string, alternative: string): string {
  return `${primary.trim()}::${alternative.trim()}`;
}

export function readSupplierAltMaterialApproval(
  dossier: Workshop2DossierPhase1,
  primary: string,
  alternative: string
): SupplierAltMaterialApprovalStatus | null {
  const key = buildSupplierAltMaterialApprovalKey(primary, alternative);
  return dossier.supplierAltMaterialApprovals?.[key] ?? null;
}

export function applySupplierAltMaterialApproval(input: {
  dossier: Workshop2DossierPhase1;
  primary: string;
  alternative: string;
  status: SupplierAltMaterialApprovalStatus;
}): Workshop2DossierPhase1 {
  const key = buildSupplierAltMaterialApprovalKey(input.primary, input.alternative);
  return {
    ...input.dossier,
    supplierAltMaterialApprovals: {
      ...(input.dossier.supplierAltMaterialApprovals ?? {}),
      [key]: input.status,
    },
    supplierAltMaterialApprovalsSyncedAt: new Date().toISOString(),
  };
}
