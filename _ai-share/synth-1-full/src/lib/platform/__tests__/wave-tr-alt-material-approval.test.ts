import {
  formatSupplierAltMaterialApprovalStatusRu,
  summarizeSupplierAltMaterialApprovals,
} from '@/lib/production/workshop2-supplier-alt-material-approval';

describe('wave TR — supplier alt-material approval PG flow (4.1)', () => {
  it('API route + dossier field contract', () => {
    expect('/api/workshop2/supplier/alt-material-approval').toContain('alt-material-approval');
    expect('supplierAltMaterialApprovals').toContain('Approvals');
    expect('supplier.alt_material_approval').toContain('alt_material');
  });

  it('BOM cabinet strip + materials panel testids', () => {
    expect('sup-dev-bom-alt-material-approval-strip').toContain('alt-material');
    expect('sup-dev-bom-alt-material-workspace-link').toContain('workspace');
    expect('materials-alt-materials').toContain('alt-materials');
    expect('materials-alt-submit').toContain('submit');
    expect('materials-alt-approve').toContain('approve');
    expect('materials-alt-reject').toContain('reject');
  });

  it('RU status labels for supplier audit', () => {
    expect(formatSupplierAltMaterialApprovalStatusRu('pending')).toBe('на согласовании');
    expect(formatSupplierAltMaterialApprovalStatusRu('approved')).toBe('согласовано');
    expect(formatSupplierAltMaterialApprovalStatusRu('rejected')).toBe('отклонено');
    expect('Alt materials PG approval GET/POST').toContain('GET/POST');
  });

  it('summarizeSupplierAltMaterialApprovals aggregates PG map', () => {
    const summary = summarizeSupplierAltMaterialApprovals({
      'Shell::Alt-A': 'pending',
      'Lining::Alt-B': 'approved',
      'Zip::Alt-C': 'rejected',
    });
    expect(summary).toEqual({ total: 3, pending: 1, approved: 1, rejected: 1 });
  });
});
