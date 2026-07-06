import { emptyWorkshop2DossierPhase1 } from '../workshop2-phase1-dossier-storage';
import {
  applySupplierAltMaterialApproval,
  buildSupplierAltMaterialApprovalKey,
  formatSupplierAltMaterialApprovalStatusRu,
  readSupplierAltMaterialApproval,
  summarizeSupplierAltMaterialApprovals,
} from '../workshop2-supplier-alt-material-approval';

describe('workshop2-supplier-alt-material-approval', () => {
  it('builds stable approval keys', () => {
    expect(buildSupplierAltMaterialApprovalKey('Shell', 'Alt-A')).toBe('Shell::Alt-A');
  });

  it('formats RU status labels', () => {
    expect(formatSupplierAltMaterialApprovalStatusRu('approved')).toBe('согласовано');
  });

  it('summarizes approval map', () => {
    expect(
      summarizeSupplierAltMaterialApprovals({
        'A::B': 'pending',
        'C::D': 'approved',
      })
    ).toEqual({ total: 2, pending: 1, approved: 1, rejected: 0 });
  });

  it('persists approval status on dossier', () => {
    const dossier = emptyWorkshop2DossierPhase1();
    const next = applySupplierAltMaterialApproval({
      dossier,
      primary: 'Shell',
      alternative: 'Alt-A',
      status: 'pending',
    });
    expect(readSupplierAltMaterialApproval(next, 'Shell', 'Alt-A')).toBe('pending');
    const approved = applySupplierAltMaterialApproval({
      dossier: next,
      primary: 'Shell',
      alternative: 'Alt-A',
      status: 'approved',
    });
    expect(readSupplierAltMaterialApproval(approved, 'Shell', 'Alt-A')).toBe('approved');
  });
});
