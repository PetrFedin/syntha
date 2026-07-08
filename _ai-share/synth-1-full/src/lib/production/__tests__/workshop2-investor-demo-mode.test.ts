/**
 * Investor demo mode env parsing + env-check payload.
 */
import {
  buildWorkshop2InvestorDemoEnvCheck,
  isWorkshop2InvestorDemoMode,
} from '@/lib/production/workshop2-investor-demo-mode';
import { buildWorkshop2InvestorDemoBrief } from '@/lib/production/workshop2-investor-demo-brief';

describe('workshop2 investor demo mode env', () => {
  it.each(['true', 'TRUE', '1', 'yes', 'YES'])('isWorkshop2InvestorDemoMode accepts %s', (flag) => {
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: flag })).toBe(true);
  });

  it('isWorkshop2InvestorDemoMode rejects empty and falsey strings', () => {
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: '' })).toBe(false);
    expect(isWorkshop2InvestorDemoMode({ WORKSHOP2_INVESTOR_DEMO_MODE: 'false' })).toBe(false);
    expect(isWorkshop2InvestorDemoMode({})).toBe(false);
  });

  it('buildWorkshop2InvestorDemoEnvCheck exposes raw + demoModeComputed', () => {
    const check = buildWorkshop2InvestorDemoEnvCheck({
      WORKSHOP2_INVESTOR_DEMO_MODE: 'yes',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
      E2E: 'true',
    });
    expect(check.WORKSHOP2_INVESTOR_DEMO_MODE).toBe('yes');
    expect(check.demoModeComputed).toBe(true);
  });

  it('brief demoMode follows env-check demoModeComputed', () => {
    const brief = buildWorkshop2InvestorDemoBrief({
      WORKSHOP2_INVESTOR_DEMO_MODE: '1',
      WORKSHOP2_UNIT_TESTS_PASSING: 'true',
    });
    expect(brief.demoMode).toBe(true);
    expect(brief.investorDemoMode).toBe(true);
  });
});
