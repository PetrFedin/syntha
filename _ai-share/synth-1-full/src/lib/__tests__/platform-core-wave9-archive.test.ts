import fs from 'node:fs';
import path from 'node:path';
import { PLATFORM_CORE_WAVE9_MONETIZATION_MFR_ARCHIVE_PATHS } from '@/lib/platform-core-wave9-monetization-mfr-archive';

const SRC = path.join(__dirname, '..', '..');

const WAVE9_STUB_PATHS = [
  'components/platform/BrandDevInvestorReadinessStrip.tsx',
  'components/platform/BrandDevInvestorReadinessPeerStrip.tsx',
  'components/platform/BrandDevGreenfieldMonetizationSegmentStrip.tsx',
  'components/platform/ShopScCabinetB2bPeerStrip.tsx',
  'components/platform/BrandOpHandoffCoSpinePeerStrip.tsx',
  'components/platform/BrandCoPackRulesCoPeerStrip.tsx',
] as const;

describe('platform-core-wave9-monetization-mfr-archive', () => {
  it('archived peer strip files exist under _archive', () => {
    for (const rel of PLATFORM_CORE_WAVE9_MONETIZATION_MFR_ARCHIVE_PATHS) {
      expect(fs.existsSync(path.join(SRC, rel))).toBe(true);
    }
  });

  it('all six stubs gate on isPlatformCoreArticleSpineMode', () => {
    for (const rel of WAVE9_STUB_PATHS) {
      const text = fs.readFileSync(path.join(SRC, rel), 'utf8');
      expect(text).toContain('isPlatformCoreArticleSpineMode');
      expect(text).toContain('_archive/platform-core-legacy/components/platform/monetization-mfr');
    }
  });
});
