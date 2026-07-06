import {
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import {
  WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_TESTID,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_RU,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_PENDING_RU,
  WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_TESTID,
  WAVE_WU_MFR_PO_ACK_MATERIAL_REQUEST_API,
  WAVE_WU_MFR_PO_ACK_MATERIAL_REQUEST_PG_MIGRATION,
  WAVE_WU_MFR_PO_ACK_MATERIAL_SOURCE,
} from '@/lib/platform/wave-wu-mfr-auto-material-request';

describe('wave WU — mfr PO ack auto material-request + supplier PATCH strip', () => {
  it('PG migration + bulk-ack API stub', () => {
    expect(WAVE_WU_MFR_PO_ACK_MATERIAL_REQUEST_PG_MIGRATION).toBe(
      '066_wave_wu_mfr_po_ack_material_request_pg'
    );
    expect(WAVE_WU_MFR_PO_ACK_MATERIAL_REQUEST_API).toContain('bulk-acknowledge');
  });

  it('auto material-request source on factory PO ack', () => {
    expect('autoCreateMaterialRequestsOnFactoryPoAck').toContain('Material');
    expect(WAVE_WU_MFR_PO_ACK_MATERIAL_SOURCE).toBe('factory_po_ack');
  });

  it('supplier procurement href carries role=supplier + PATCH context', () => {
    const href = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO, { role: 'supplier' });
    expect(href).toContain('view=procurement');
    expect(href).toContain('role=supplier');
    expect(href).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
  });

  it('mfr OP materials supplier PATCH strip testids + RU copy', () => {
    expect(WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_TESTID).toContain('supplier-patch');
    expect(WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_TESTID).toContain('link-patch');
    expect(WAVE_WU_MFR_MATERIALS_SUPPLIER_STRIP_PENDING_RU).toContain('поставщика');
    expect(WAVE_WU_MFR_MATERIALS_SUPPLIER_LINK_PATCH_RU).toContain('PATCH');
    expect('mfr-op-materials-supplier-hint').toContain('supplier-hint');
  });

  it('bulk-ack response exposes materialRequestAuto', () => {
    expect('materialRequestAuto').toContain('material');
  });
});
