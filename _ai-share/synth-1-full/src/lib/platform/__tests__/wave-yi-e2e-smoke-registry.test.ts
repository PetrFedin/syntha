import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YI_CORE_E2E_MAX_SPEC_NUMBER,
  WAVE_YI_CORE_E2E_MIN_SPEC_NUMBER,
  WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS,
  WAVE_YI_E2E_SMOKE_API_PROBES,
  WAVE_YI_META_E2E_SPEC,
  waveYiCoreE2eSmokeRegistryGlob,
} from '@/lib/platform/wave-yi-e2e-smoke-registry';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const E2E_DIR = path.join(PKG_ROOT, 'e2e');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

function readConfig(): string {
  return fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
}

function extractConfigSpecBasenames(configText: string): string[] {
  const matches = configText.match(/core-[^'"]+\.spec\.ts/g) ?? [];
  return matches.map((m) => m.replace(/^\*\*\//, ''));
}

describe('wave YI — E2E smoke registry (core-156…223 + core-224 meta)', () => {
  it('registry lists 68 wave specs in batch window', () => {
    expect(WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS.length).toBe(68);
    const nums = WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS.map((f) =>
      Number.parseInt(f.replace(/^core-(\d+).*/, '$1'), 10)
    );
    expect(Math.min(...nums)).toBe(WAVE_YI_CORE_E2E_MIN_SPEC_NUMBER);
    expect(Math.max(...nums)).toBe(WAVE_YI_CORE_E2E_MAX_SPEC_NUMBER);
  });

  it.each(WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS)('%s — exists on disk', (basename) => {
    expect(fs.existsSync(path.join(E2E_DIR, basename))).toBe(true);
  });

  it.each(WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS)(
    '%s — registered in playwright.core.config.ts',
    (basename) => {
      const glob = waveYiCoreE2eSmokeRegistryGlob(basename);
      expect(readConfig()).toContain(glob);
    }
  );

  it('core-224 meta spec — file + playwright.core.config.ts entry', () => {
    expect(fs.existsSync(path.join(E2E_DIR, WAVE_YI_META_E2E_SPEC))).toBe(true);
    expect(readConfig()).toContain(waveYiCoreE2eSmokeRegistryGlob(WAVE_YI_META_E2E_SPEC));
  });

  it('no duplicate spec basename entries in playwright.core.config.ts', () => {
    const basenames = extractConfigSpecBasenames(readConfig());
    const seen = new Map<string, number>();
    for (const name of basenames) {
      seen.set(name, (seen.get(name) ?? 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([name]) => name);
    expect(dupes).toEqual([]);
  });

  it('wave batch — every core-156+ e2e file on disk is in registry', () => {
    const onDisk = fs
      .readdirSync(E2E_DIR)
      .filter((f) => /^core-\d+/.test(f) && f.endsWith('.spec.ts'))
      .filter((f) => {
        const n = Number.parseInt(f.replace(/^core-(\d+).*/, '$1'), 10);
        return n >= WAVE_YI_CORE_E2E_MIN_SPEC_NUMBER && n <= WAVE_YI_CORE_E2E_MAX_SPEC_NUMBER;
      })
      .sort();
    expect(onDisk).toEqual([...WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS].sort());
  });

  it('API smoke probes — spine + recent waves wired', () => {
    expect(WAVE_YI_E2E_SMOKE_API_PROBES.length).toBeGreaterThanOrEqual(7);
    const waves = new Set(WAVE_YI_E2E_SMOKE_API_PROBES.map((p) => p.wave));
    expect(waves.has('spine')).toBe(true);
    expect(waves.has('YH')).toBe(true);
    expect(waves.has('YG')).toBe(true);
  });
});
