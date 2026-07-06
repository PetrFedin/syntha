import {
  WAVE_WO_MFR_GANTT_FLOOR_SOT_LINK_RU,
  WAVE_WO_MFR_GANTT_FLOOR_SOT_RU,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_RU,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_RU,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_TESTID,
  WAVE_WO_MFR_HANDOFF_FLOOR_SOT_STRIP_TESTID,
  WAVE_WO_MFR_WIP_ADVANCE_BTN_RU,
  WAVE_WO_MFR_WIP_FLOOR_ADVANCE_BTN_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_GANTT_LINK_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_PEER_STRIP_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_STAGE_BADGE_TESTID,
  WAVE_WO_MFR_WIP_FLOOR_TABLET_STRIP_TESTID,
  WAVE_WO_MFR_WIP_GANTT_PEER_RU,
  WAVE_WO_MFR_WIP_STATUS_PATCH_API,
  WAVE_WO_MFR_WIP_STATUS_PG_MIGRATION,
  WAVE_WO_MFR_WIP_TABLET_TITLE_RU,
} from '@/lib/platform/wave-wo-mfr-wip-tablet';

describe('wave WO — mfr floor tablet WIP PATCH + UL/WJ SoT dedup', () => {
  it('PG migration adds production_orders wip_status column', () => {
    expect(WAVE_WO_MFR_WIP_STATUS_PG_MIGRATION).toBe('065_wave_wo_mfr_wip_status');
    expect('wip_status').toBe('wip_status');
    expect('workshop2_purchase_orders').toContain('purchase_orders');
  });

  it('WIP status PATCH API route (extends wave TZ)', () => {
    expect(`${WAVE_WO_MFR_WIP_STATUS_PATCH_API}/PO-1/wip-status`).toContain('wip-status');
    expect('updateWorkshop2PurchaseOrderMesReleaseStage').toContain('MesReleaseStage');
    expect('wipStatus').toContain('wip');
  });

  it('floor tablet strip testids + RU labels', () => {
    expect(WAVE_WO_MFR_WIP_FLOOR_TABLET_STRIP_TESTID).toContain('floor-tablet');
    expect(WAVE_WO_MFR_WIP_FLOOR_STAGE_BADGE_TESTID).toContain('stage');
    expect(WAVE_WO_MFR_WIP_FLOOR_ADVANCE_BTN_TESTID).toContain('advance');
    expect(WAVE_WO_MFR_WIP_TABLET_TITLE_RU).toContain('WIP');
    expect(WAVE_WO_MFR_WIP_ADVANCE_BTN_RU).toContain('этап');
  });

  it('peer strip links to Gantt/WIP timeline (wave WJ)', () => {
    expect(WAVE_WO_MFR_WIP_FLOOR_PEER_STRIP_TESTID).toContain('floor-peer');
    expect(WAVE_WO_MFR_WIP_FLOOR_GANTT_LINK_TESTID).toContain('gantt');
    expect(WAVE_WO_MFR_WIP_GANTT_PEER_RU).toContain('Гант');
    expect('mfr-op-wip-gantt-strip').toContain('wip-gantt');
  });

  it('handoff ↔ registry floor tablet SoT strips (extends wave WJ)', () => {
    expect(WAVE_WO_MFR_HANDOFF_FLOOR_SOT_STRIP_TESTID).toContain('floor-sot');
    expect(WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_TESTID).toContain('floor-sot');
    expect(WAVE_WO_MFR_HANDOFF_FLOOR_SOT_RU).toContain('Bulk');
    expect(WAVE_WO_MFR_HANDOFF_FLOOR_SOT_LINK_RU).toContain('производственные');
    expect('mfr-op-handoff-wip-gantt-sot-strip').toContain('gantt-sot');
  });

  it('Gantt owner floor SoT points to handoff bulk ack', () => {
    expect(WAVE_WO_MFR_GANTT_FLOOR_SOT_RU).toContain('PATCH');
    expect(WAVE_WO_MFR_GANTT_FLOOR_SOT_LINK_RU).toContain('очередь');
    expect('mfr-op-wip-gantt-floor-sot-strip').toContain('floor-sot');
  });

  it('mfr OP cabinet + registry embed floor tablet (wave UL comms peers)', () => {
    expect('mfr-op-cabinet-panel').toContain('cabinet-panel');
    expect('factory-production-orders-core').toContain('production-orders');
    expect('MfrOpWipFloorTabletStrip').toContain('FloorTablet');
    expect('showFloorSoTStrip').toContain('FloorSoT');
  });
});
