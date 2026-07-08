import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  syncAims360Wip,
  resolveUnifiedOrderTracking,
  syncZedonkTracking,
} from '../order-tracking.service';

describe('order-tracking spine (Wave D)', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syntha-tracking-'));

  beforeAll(() => {
    process.env.B2B_PRODUCTION_WIP_FILE = path.join(tmpDir, 'wip.json');
    process.env.B2B_ORDER_TRACKING_FILE = path.join(tmpDir, 'tracking.json');
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('AIMS360 WIP sync → unified tracking read-model', () => {
    syncAims360Wip({
      productionOrderId: 'PO-B2B-INT-JOOR-test',
      b2bOrderId: 'INT-JOOR-test',
      poStage: 'sewing',
    });
    const t = resolveUnifiedOrderTracking('INT-JOOR-test');
    expect(t.wip?.poStage).toBe('sewing');
    expect(t.wip?.steps.some((s) => s.id === 'cutting' && s.done)).toBe(true);
  });

  it('Zedonk tracking sync → shipment on GET tracking', () => {
    syncZedonkTracking({
      wholesaleOrderId: 'INT-ZEDONK-track-1',
      trackingNumber: 'ZD-12345',
      carrier: 'DHL',
      status: 'in_transit',
    });
    const t = resolveUnifiedOrderTracking('INT-ZEDONK-track-1');
    expect(t.shipment?.trackingNumber).toBe('ZD-12345');
    expect(t.shipment?.platform).toBe('zedonk');
  });
});
