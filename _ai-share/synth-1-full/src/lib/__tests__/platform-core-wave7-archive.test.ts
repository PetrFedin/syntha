import fs from 'node:fs';
import path from 'node:path';
import { PLATFORM_CORE_WAVE7_RETAIL_CRM_ARCHIVE_PATHS } from '@/lib/platform-core-wave7-retail-crm-archive';

const SRC = path.join(__dirname, '..', '..');

describe('platform-core-wave7-retail-crm-archive', () => {
  it('archived peer strip files exist under _archive', () => {
    for (const rel of PLATFORM_CORE_WAVE7_RETAIL_CRM_ARCHIVE_PATHS) {
      expect(fs.existsSync(path.join(SRC, rel))).toBe(true);
    }
  });

  it('stubs gate on isPlatformCoreArticleSpineMode', () => {
    const stubs = [
      'components/platform/BrandScCabinetRetailPeerStrip.tsx',
      'components/platform/BrandCoRegistryRetailOnboardingStrip.tsx',
      'components/platform/ShopDevelopmentBridgeGreenfieldCrmStrip.tsx',
    ];
    for (const rel of stubs) {
      const text = fs.readFileSync(path.join(SRC, rel), 'utf8');
      expect(text).toContain('isPlatformCoreArticleSpineMode');
      expect(text).toContain('_archive/platform-core-legacy/components/platform/retail-crm');
    }
  });
});
