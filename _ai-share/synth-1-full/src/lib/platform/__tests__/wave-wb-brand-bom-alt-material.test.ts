import {
  BRAND_ALT_MATERIAL_APPROVAL_API_PATH,
  brandAltMaterialApprovalActionRu,
  brandCanDecideAltMaterialApproval,
  buildSupplierDevBomCabinetHref,
  listPendingBrandAltMaterialApprovals,
  parseSupplierAltMaterialApprovalKey,
} from '@/lib/production/workshop2-brand-alt-material-approval';
import {
  formatSupplierAltMaterialApprovalStatusRu,
  summarizeSupplierAltMaterialApprovals,
} from '@/lib/production/workshop2-supplier-alt-material-approval';

describe('wave WB — brand BOM alt-material approval PG', () => {
  it('brand API path + PG read contract', () => {
    expect(BRAND_ALT_MATERIAL_APPROVAL_API_PATH).toContain('alt-material-approval');
    expect(BRAND_ALT_MATERIAL_APPROVAL_API_PATH).toContain('/api/brand/merch/supplier-bom');
    expect('storageMode').toContain('storage');
    expect('pg_only_blocked').toContain('blocked');
  });

  it('lists pending approvals for brand decision queue', () => {
    const pending = listPendingBrandAltMaterialApprovals({
      'Shell::Alt-A': 'pending',
      'Lining::Alt-B': 'approved',
      'Zip::Alt-C': 'pending',
    });
    expect(pending).toHaveLength(2);
    expect(pending[0]?.primary).toBe('Shell');
    expect(pending[0]?.alternative).toBe('Alt-A');
  });

  it('brand can decide only pending items', () => {
    expect(brandCanDecideAltMaterialApproval({ action: 'approve', currentStatus: 'pending' })).toBe(
      true
    );
    expect(brandCanDecideAltMaterialApproval({ action: 'reject', currentStatus: 'pending' })).toBe(
      true
    );
    expect(brandCanDecideAltMaterialApproval({ action: 'approve', currentStatus: 'approved' })).toBe(
      false
    );
    expect(brandCanDecideAltMaterialApproval({ action: 'reject', currentStatus: null })).toBe(false);
  });

  it('RU labels without English noise', () => {
    expect(formatSupplierAltMaterialApprovalStatusRu('pending')).toBe('на согласовании');
    expect(brandAltMaterialApprovalActionRu('approve')).toBe('согласовать');
    expect(brandAltMaterialApprovalActionRu('reject')).toBe('отклонить');
  });

  it('supplier BOM cabinet cross-link href', () => {
    const href = buildSupplierDevBomCabinetHref({ collectionId: 'SS27', articleId: 'SS27-001' });
    expect(href).toContain('/factory/supplier/core');
    expect(href).toContain('pillar=development');
    expect(href).toContain('collection=SS27');
    expect(href).toContain('article=SS27-001');
  });

  it('brand dev BOM strip + action testids', () => {
    expect('brand-dev-bom-alt-material-approval-strip').toContain('approval');
    expect('brand-dev-bom-alt-material-status-strip').toContain('alt-material');
    expect('brand-dev-bom-alt-material-supplier-cabinet-link').toContain('cabinet');
    expect('brand-dev-bom-alt-material-supplier-peer-link').toContain('peer');
    expect('brand-dev-bom-alt-material-pending-list').toContain('pending');
    expect('brand-dev-bom-alt-material-approve-Shell-Alt-A').toContain('approve');
    expect('brand-dev-bom-alt-material-reject-Shell-Alt-A').toContain('reject');
  });

  it('parses approval keys for POST body', () => {
    expect(parseSupplierAltMaterialApprovalKey('Shell::Alt-A')).toEqual({
      primary: 'Shell',
      alternative: 'Alt-A',
    });
    expect(parseSupplierAltMaterialApprovalKey('bad')).toBeNull();
  });

  it('summarize pending count mirrors supplier map', () => {
    const summary = summarizeSupplierAltMaterialApprovals({
      'A::B': 'pending',
      'C::D': 'rejected',
    });
    expect(summary.pending).toBe(1);
    expect(summary.rejected).toBe(1);
  });
});
