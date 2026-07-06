import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import {
  WAVE_YJ_SUP_OP_BULK_CONFIRM_PROGRESS_TESTID,
  WAVE_YJ_SUP_OP_BULK_CONFIRM_STEP_RU,
  WAVE_YJ_SUP_OP_CHAIN_STEP_BULK_CONFIRM,
  WAVE_YJ_SUP_OP_CHAIN_STEP_PARTIAL_SHIP,
  WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_RESERVE,
  WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_WEBHOOK,
  WAVE_YJ_SUP_OP_PARTIAL_SHIP_STEP_RU,
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_TITLE_RU,
  WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR,
  WAVE_YJ_SUP_OP_WMS_RESERVE_STEP_RU,
  WAVE_YJ_SUP_OP_WMS_RESERVE_STRIP_TESTID,
  WAVE_YJ_SUP_OP_WMS_WEBHOOK_STEP_RU,
  buildSupOpCommsTailHref,
  buildSupOpProcurementHonestChainSteps,
  buildSupOpTrackingTailHref,
  supOpCommsTailHrefCarriesPoContext,
  waveYjSupOpProcurementChainApis,
} from '@/lib/platform/wave-yj-sup-op-procurement-chain';
import { WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API } from '@/lib/platform/wave-wi-supplier-partial-ship';

describe('wave YJ — sup-op procurement honest chain 6.9→7.5', () => {
  it('honest chain step ids + RU labels for reserve/partial/bulk/webhook', () => {
    expect(WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_RESERVE).toBe('wms_reserve');
    expect(WAVE_YJ_SUP_OP_CHAIN_STEP_PARTIAL_SHIP).toBe('partial_ship');
    expect(WAVE_YJ_SUP_OP_CHAIN_STEP_BULK_CONFIRM).toBe('bulk_confirm');
    expect(WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_WEBHOOK).toBe('wms_webhook');
    expect(WAVE_YJ_SUP_OP_WMS_RESERVE_STEP_RU).toMatch(/Резерв WMS/i);
    expect(WAVE_YJ_SUP_OP_PARTIAL_SHIP_STEP_RU).toMatch(/Частичная отгрузка/i);
    expect(WAVE_YJ_SUP_OP_BULK_CONFIRM_STEP_RU).toMatch(/bulk-confirm/i);
    expect(WAVE_YJ_SUP_OP_WMS_WEBHOOK_STEP_RU).toMatch(/webhook/i);
  });

  it('buildSupOpProcurementHonestChainSteps merges API + honest sub-steps', () => {
    const partialPath = buildSupOpProcurementHonestChainSteps({
      apiSteps: [
        { id: 'production_po', labelRu: 'PO в очереди', done: true },
        { id: 'materials_supplied', labelRu: 'Материалы', done: false },
      ],
      inventoryReservedDone: false,
      materialsSuppliedDone: false,
      showPartialShipPath: true,
      partialShipDone: false,
      bulkConfirmDone: false,
      wmsWebhookEnabled: true,
    });
    expect(partialPath.map((s) => s.id)).toEqual([
      'production_po',
      'wms_reserve',
      'partial_ship',
      'wms_webhook',
      'materials_supplied',
    ]);
    expect(partialPath.find((s) => s.id === 'partial_ship')?.honest).toBe(true);

    const bulkPath = buildSupOpProcurementHonestChainSteps({
      apiSteps: [{ id: 'production_po', labelRu: 'PO', done: true }],
      inventoryReservedDone: true,
      materialsSuppliedDone: true,
      showPartialShipPath: false,
      partialShipDone: false,
      bulkConfirmDone: true,
      wmsWebhookEnabled: false,
    });
    expect(bulkPath.map((s) => s.id)).toContain('bulk_confirm');
    expect(bulkPath.find((s) => s.id === 'wms_reserve')?.done).toBe(true);
  });

  it('procurement chain strip testids + honest chain attr', () => {
    expect(WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID).toBe('sup-op-procurement-chain-steps');
    expect(WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_TITLE_RU).toMatch(/Этапы цепочки/i);
    expect(WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR).toBe('data-procurement-honest-chain');
    expect(WAVE_YJ_SUP_OP_WMS_RESERVE_STRIP_TESTID).toContain('wms-reserve');
    expect(WAVE_YJ_SUP_OP_BULK_CONFIRM_PROGRESS_TESTID).toContain('bulk-confirm-progress');
  });

  it('comms tail hrefs carry po= query (procurement + order comms sessions)', () => {
    const po = PLATFORM_CORE_DEMO.productionOrderId;
    const chatHref = buildSupOpCommsTailHref({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      sectionId: 'sup-op-procurement',
      productionOrderId: po,
    });
    expect(supOpCommsTailHrefCarriesPoContext(chatHref, po)).toBe(true);

    const trackingHref = buildSupOpTrackingTailHref({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: po,
    });
    expect(supOpCommsTailHrefCarriesPoContext(trackingHref, po)).toBe(true);

    const comms = buildSupplierOrderCommsSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: po,
    });
    expect(comms.brandOrderHandoffHref).toContain('po=');
    expect(comms.shopTrackingHref).toContain('po=');
    expect(comms.messagesHref).toContain('po=');

    const procurement = buildSupplierProcurementSession({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      productionOrderId: po,
    });
    expect(procurement.handoffHref).toContain('po=');
    expect(procurement.shopTrackingHref).toContain('po=');
  });

  it('wave YJ procurement chain APIs', () => {
    const apis = waveYjSupOpProcurementChainApis();
    expect(apis).toContain('/api/workshop2/supplier/material-request/bulk-confirm');
    expect(apis).toContain(WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API);
    expect('SupOpProcurementChainStepsStrip').toContain('ChainStepsStrip');
  });
});
