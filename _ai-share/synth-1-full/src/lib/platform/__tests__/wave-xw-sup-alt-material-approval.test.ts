import {
  BRAND_ALT_MATERIAL_APPROVAL_API_PATH,
  buildSupplierDevBomCabinetHref,
} from '@/lib/production/workshop2-brand-alt-material-approval';
import {
  MATERIALS_ALT_MATERIALS_BRAND_BOM_LINK_TESTID,
  MATERIALS_ALT_MATERIALS_CABINET_LINK_TESTID,
  MATERIALS_ALT_MATERIALS_CATALOG_LINK_TESTID,
  MATERIALS_ALT_MATERIALS_NAV_TESTID,
  MATERIALS_ALT_MATERIALS_NOTE_TESTID,
  SUP_DEV_BOM_BRAND_ALT_MATERIAL_LINK_TESTID,
  WAVE_XW_ALT_MATERIALS_NOTE_RU,
  WAVE_XW_BRAND_ALT_MATERIAL_APPROVAL_API,
  WAVE_XW_BRAND_SUP_CABINET_LINK_RU,
  WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API,
  WAVE_XW_SUP_ALT_APPROVE_LABEL_RU,
  WAVE_XW_SUP_ALT_REJECT_LABEL_RU,
  WAVE_XW_SUP_ALT_SUBMIT_LABEL_RU,
  WAVE_XW_SUP_BOM_ALT_EMPTY_RU,
  WAVE_XW_SUP_BOM_ALT_STRIP_LABEL_RU,
  WAVE_XW_SUP_BOM_BRAND_ALT_LINK_RU,
  brandAltMaterialNotificationTitleRu,
  buildBrandDevBomAltMaterialApprovalHref,
  buildMaterialsAltMaterialsCatalogHref,
  buildSupplierDevBomCabinetAltMaterialHref,
  countSupplierAltMaterialPairs,
  supplierAltMaterialActionRu,
  supplierCanActAltMaterialApproval,
} from '@/lib/platform/wave-xw-sup-alt-material-approval';

describe('wave XW — supplier alt-material approval PG + brand strip link', () => {
  it('API paths + PG contract', () => {
    expect(WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API).toBe('/api/workshop2/supplier/alt-material-approval');
    expect(WAVE_XW_BRAND_ALT_MATERIAL_APPROVAL_API).toBe(BRAND_ALT_MATERIAL_APPROVAL_API_PATH);
    expect('storageMode').toContain('storage');
    expect('pg_only_blocked').toContain('blocked');
  });

  it('bidirectional brand ↔ supplier BOM cabinet hrefs', () => {
    const brandHref = buildBrandDevBomAltMaterialApprovalHref({
      collectionId: 'SS27',
      articleId: 'SS27-001',
    });
    expect(brandHref).toContain('/brand/suppliers/rfq');
    expect(brandHref).toContain('pcf=bom');

    const cabinetHref = buildSupplierDevBomCabinetAltMaterialHref({
      collectionId: 'SS27',
      articleId: 'SS27-001',
    });
    expect(cabinetHref).toBe(
      buildSupplierDevBomCabinetHref({ collectionId: 'SS27', articleId: 'SS27-001' })
    );
    expect(cabinetHref).toContain('/factory/supplier/core');
    expect(cabinetHref).toContain('pillar=development');
  });

  it('materials workspace nav + catalog href', () => {
    const catalogHref = buildMaterialsAltMaterialsCatalogHref({
      collectionId: 'SS27',
      articleId: 'SS27-001',
    });
    expect(catalogHref).toContain('/factory/production/catalog');
    expect(catalogHref).toContain('collection=SS27');
  });

  it('supplier can act on alt-material states', () => {
    expect(supplierCanActAltMaterialApproval({ action: 'submit', currentStatus: null })).toBe(true);
    expect(supplierCanActAltMaterialApproval({ action: 'submit', currentStatus: 'pending' })).toBe(
      false
    );
    expect(supplierCanActAltMaterialApproval({ action: 'approve', currentStatus: 'pending' })).toBe(
      true
    );
    expect(supplierCanActAltMaterialApproval({ action: 'reject', currentStatus: 'approved' })).toBe(
      true
    );
    expect(supplierCanActAltMaterialApproval({ action: 'approve', currentStatus: 'approved' })).toBe(
      false
    );
  });

  it('RU labels without English noise', () => {
    expect(WAVE_XW_SUP_BOM_ALT_STRIP_LABEL_RU).toBe('Согласование альтернатив');
    expect(WAVE_XW_SUP_BOM_ALT_EMPTY_RU).toMatch(/substitutes/i);
    expect(WAVE_XW_SUP_ALT_SUBMIT_LABEL_RU).toBe('На согласование');
    expect(WAVE_XW_SUP_ALT_APPROVE_LABEL_RU).toBe('Согласовать');
    expect(WAVE_XW_SUP_ALT_REJECT_LABEL_RU).toBe('Отклонить');
    expect(WAVE_XW_BRAND_SUP_CABINET_LINK_RU).toMatch(/BOM поставщика/);
    expect(WAVE_XW_SUP_BOM_BRAND_ALT_LINK_RU).toMatch(/бренда/i);
    expect(supplierAltMaterialActionRu('submit')).toBe('на согласование');
    expect(WAVE_XW_ALT_MATERIALS_NOTE_RU).toMatch(/PG/);
  });

  it('brand notification titles for supplier decisions', () => {
    expect(
      brandAltMaterialNotificationTitleRu({ actor: 'supplier', status: 'pending' })
    ).toMatch(/Поставщик отправил/);
    expect(
      brandAltMaterialNotificationTitleRu({ actor: 'supplier', status: 'approved' })
    ).toMatch(/согласовано/i);
    expect(
      brandAltMaterialNotificationTitleRu({ actor: 'brand', status: 'rejected' })
    ).toMatch(/бренда/i);
  });

  it('counts substitute pairs for cabinet strip', () => {
    expect(
      countSupplierAltMaterialPairs([
        { primary: 'Shell', alternatives: ['Alt-A', 'Alt-B'] },
        { primary: 'Zip', alternatives: ['Alt-Z'] },
      ])
    ).toBe(3);
  });

  it('wave XW testids for cross-link e2e', () => {
    expect(SUP_DEV_BOM_BRAND_ALT_MATERIAL_LINK_TESTID).toContain('brand-alt-material');
    expect(MATERIALS_ALT_MATERIALS_NAV_TESTID).toContain('alt-materials');
    expect(MATERIALS_ALT_MATERIALS_CATALOG_LINK_TESTID).toContain('catalog');
    expect(MATERIALS_ALT_MATERIALS_CABINET_LINK_TESTID).toContain('cabinet');
    expect(MATERIALS_ALT_MATERIALS_BRAND_BOM_LINK_TESTID).toContain('brand-bom');
    expect(MATERIALS_ALT_MATERIALS_NOTE_TESTID).toContain('note');
    expect('brand-dev-bom-alt-material-supplier-cabinet-link').toContain('cabinet');
    expect('sup-dev-bom-alt-material-approval-strip').toContain('alt-material');
  });
});
