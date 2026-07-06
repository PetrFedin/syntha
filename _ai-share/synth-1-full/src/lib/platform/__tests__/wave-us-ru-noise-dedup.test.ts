import fs from 'node:fs';
import path from 'node:path';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave US — RU noise cleanup + notification strip dedup', () => {
  it('notification center compact testids all roles (cleaned strips)', () => {
    expect('shop-cm-notification-center-compact').toContain('notification-center-compact');
    expect('brand-cm-notification-center-compact').toContain('notification-center-compact');
    expect('mfr-cm-notification-center-compact').toContain('notification-center-compact');
    expect('sup-cm-notification-center-compact').toContain('notification-center-compact');
    expect('comms-universal-inbox-strip').toContain('universal-inbox');
  });

  it('CommsNotificationCenterStrip — operator RU labels (no EN inbox/SSE noise)', () => {
    const strip = read('components/platform/CommsNotificationCenterStrip.tsx');
    expect(strip).toContain('Уведомления');
    expect(strip).toContain('Нет непрочитанных');
    expect(strip).toContain('PG входящие');
    expect(strip).toContain('SSE онлайн');
    expect(strip).not.toContain('PG inbox');
    expect(strip).not.toContain('SSE live');
    expect(strip).not.toContain('B2B ·');
  });

  it('messages routes: universal inbox only (no workspace notification bar)', () => {
    const mfr = read('app/factory/production/messages/messages-core.tsx');
    expect(mfr).toContain('PlatformCoreCommsUniversalInboxStrip');
    expect(mfr).not.toContain('OrderCommsWorkspaceNotificationBar');
    expect(mfr).toContain('Связь · передача · трекинг магазина');
  });

  it('stub panel + sample comms peer — user-facing RU', () => {
    const stub = read('components/platform/PillarCapabilityFeatureStubPanel.tsx');
    const sample = read('components/brand/merch/BrandSampleLifecycleCommsPeerStrip.tsx');
    expect(stub).toContain('доработка');
    expect(stub).toContain('в планах');
    expect(stub).not.toMatch(/'enhance'/);
    expect(sample).toContain('Связь · события образца');
    expect(sample).toContain('Входящие');
    expect(sample).not.toContain('Comms · sample events');
  });

  it('supplier handoff tail hrefs carry po/order context', () => {
    const peer = read('components/factory/supplier/SupplierOpHandoffReadSpinePeerStrip.tsx');
    expect(peer).toContain('appendSupplierOpPoContextToHref');
    expect(peer).toContain('sup-op-handoff-read-tracking-link');
  });
});
