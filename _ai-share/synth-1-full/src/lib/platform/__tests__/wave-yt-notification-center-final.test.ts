import fs from 'node:fs';
import path from 'node:path';
import {
  platformCoreCmCalendarNotificationDetailLinkTestId,
  platformCoreCommsNotificationDetailHref,
  WAVE_YT_E2E_SPEC,
  WAVE_YX_NOTIFICATION_CENTER_COMPACT_TESTIDS,
  WAVE_YT_PILLAR_NOTIFICATION_COMPACT_WIRES,
  WAVE_YX_PC_NOTIFICATION_DETAIL_VALUE,
  WAVE_YX_PC_NOTIFICATION_PARAM,
} from '@/lib/platform/wave-yt-notification-center-final';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YT — notification center compact all roles final (S4)', () => {
  it('notification detail href targets comms pillar with pcNotification=detail', () => {
    const href = platformCoreCommsNotificationDetailHref('shop', 'SS27', 'B2B-SS27-DEMO-001');
    expect(href).toContain('pillar=comms');
    expect(href).toContain(`${WAVE_YX_PC_NOTIFICATION_PARAM}=${WAVE_YX_PC_NOTIFICATION_DETAIL_VALUE}`);
    expect(href).toContain('collection=SS27');
    expect(href).toContain('order=B2B-SS27-DEMO-001');
  });

  it('compact notification center testids all roles', () => {
    for (const testId of WAVE_YX_NOTIFICATION_CENTER_COMPACT_TESTIDS) {
      expect(testId).toContain('notification-center-compact');
    }
  });

  it('calendar notification detail link testids all roles', () => {
    expect(platformCoreCmCalendarNotificationDetailLinkTestId('shop')).toBe(
      'shop-cm-calendar-notification-detail-link'
    );
    expect(platformCoreCmCalendarNotificationDetailLinkTestId('brand')).toBe(
      'brand-cm-calendar-notification-detail-link'
    );
    expect(platformCoreCmCalendarNotificationDetailLinkTestId('manufacturer')).toBe(
      'mfr-cm-calendar-notification-detail-link'
    );
    expect(platformCoreCmCalendarNotificationDetailLinkTestId('supplier')).toBe(
      'sup-cm-calendar-notification-detail-link'
    );
  });

  it.each(WAVE_YT_PILLAR_NOTIFICATION_COMPACT_WIRES)('$id — pillar card wires compact strip', (wire) => {
    const text = read(wire.file);
    if (wire.variant === 'all') {
      expect(text).toContain('CommsNotificationCenterStrip');
      expect(text).toContain('compact');
    } else {
      expect(text).toContain('PlatformCorePillarNotificationCenterCompact');
      const hasLiteralVariant = text.includes(`variant="${wire.variant}"`);
      const hasDynamicVariant =
        text.includes('variant={variant}') &&
        (wire.file.includes('DevelopmentPillarCard.tsx') ||
          wire.file.includes('OrderProductionPillarCard.tsx'));
      expect(hasLiteralVariant || hasDynamicVariant).toBe(true);
    }
  });

  it('prefs dedup — only inside CommsNotificationCenterStrip (wave VK/WZ)', () => {
    const center = read('components/platform/CommsNotificationCenterStrip.tsx');
    const prefs = read('components/platform/PlatformCoreShopCommsNotificationPrefsStrip.tsx');
    expect(center).toContain('PlatformCoreCommsNotificationPrefsStrip');
    expect(prefs).toContain('WAVE_WZ_COMMS_CHAIN_PUSH_COMPACT_RU');
    expect(prefs).toContain('notification-prefs-compact');
    for (const wire of WAVE_YT_PILLAR_NOTIFICATION_COMPACT_WIRES) {
      if (wire.file.endsWith('CommsPillarCard.tsx')) continue;
      const text = read(wire.file);
      expect(text).not.toContain('PlatformCoreCommsNotificationPrefsStrip');
    }
  });

  it('calendar workspace deduped — peer strip CTA, no inline notification strip', () => {
    const calendar = read('app/shop/b2b/calendar/calendar-core.tsx');
    expect(calendar).toContain('ShopCmCalendarContextPeerStrip');
    expect(calendar).not.toContain('CommsNotificationCenterStrip');
    const peer = read('components/platform/ShopCmCalendarContextPeerStrip.tsx');
    expect(peer).toContain('platformCoreCommsNotificationDetailHref');
    expect(peer).toContain('platformCoreCmCalendarNotificationDetailLinkTestId');
  });

  it('compact strip — tracking + notification detail CTAs', () => {
    const strip = read('components/platform/CommsNotificationCenterStrip.tsx');
    expect(strip).toContain('platformCoreCommsNotificationDetailHref');
    expect(strip).toContain('platformCoreCmNotificationTrackingLinkTestId');
    expect(strip).toContain('notification-detail-link');
    expect(strip).toContain('notification-events-compact');
  });

  it('event tracking strip — calendar row links to notification detail', () => {
    const eventStrip = read('components/platform/PlatformCoreCmCalendarEventTrackingStrip.tsx');
    expect(eventStrip).toContain('platformCoreCommsNotificationDetailHref');
    expect(eventStrip).toContain('cm-calendar-event-notification-detail-');
  });

  it('core-235 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_YT_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(`**/${WAVE_YT_E2E_SPEC}`);
  });
});
