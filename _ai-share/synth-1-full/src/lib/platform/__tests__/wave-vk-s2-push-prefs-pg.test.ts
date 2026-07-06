import fs from 'node:fs';
import path from 'node:path';

const SRC = path.join(process.cwd(), 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave VK S2 — chain-status push prefs PG (comms pillar)', () => {
  it('PUT bumps hub SSE on prefs change', () => {
    const route = read('app/api/platform-core/comms/notification-prefs/route.ts');
    expect(route).toContain('bumpPlatformCoreCommsNotificationPrefs');
    expect(route).toContain('putPlatformCoreCommsNotificationPrefsServer');
    const hub = read('lib/server/platform-core-comms-notification-prefs-hub.ts');
    expect(hub).toContain('COMMS_NOTIFICATION_PREFS_BUMP');
  });

  it('fail-closed LS read/write in core mode (wave SW/UK)', () => {
    const prefs = read('lib/platform-core-comms-notification-prefs.ts');
    expect(prefs).toContain('shouldUseLocalStorageClientFallbackInCore');
    expect(prefs).toContain('shouldMirrorPgClientStoreToLocalStorage');
    expect(prefs).toContain('loadPlatformCoreCommsNotificationPrefs');
    expect(prefs).not.toMatch(/readPlatformCoreCommsNotificationPrefs\([^)]*\)[\s\S]*core mode/);
  });

  it('comms pillar cards gate chain-status badge from PG prefs', () => {
    const card = read('components/platform/CommsPillarCard.tsx');
    expect(card).toContain('usePlatformCoreChainStatusPushEnabled');
    expect(card).toContain('enabled={chainPushEnabled}');
    const hook = read('hooks/use-platform-core-chain-status-push-enabled.ts');
    expect(hook).toContain('loadPlatformCoreCommsNotificationPrefs');
    expect(hook).toContain('usePlatformCoreCommsNotificationPrefsPoll');
  });

  it('prefs strip loads from PG API + SSE poll refetch all roles', () => {
    const strip = read('components/platform/PlatformCoreShopCommsNotificationPrefsStrip.tsx');
    expect(strip).toContain('loadPlatformCoreCommsNotificationPrefs');
    expect(strip).toContain('persistPlatformCoreCommsNotificationPrefs');
    expect(strip).toContain('usePlatformCoreCommsNotificationPrefsPoll');
    expect(strip).toContain('shop-cm');
    expect(strip).toContain('brand-cm');
    expect(strip).toContain('mfr-cm');
    expect(strip).toContain('sup-cm');
    expect(strip).toContain('notification-pref-chain-push');
  });

  it('postgres table + storageMode contract', () => {
    const server = read('lib/server/platform-core-comms-notification-prefs-server.ts');
    expect(server).toContain('platform_core_comms_notification_prefs');
    expect(server).toContain("storageMode: 'postgres'");
  });
});
