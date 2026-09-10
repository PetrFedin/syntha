import { shouldSkipEnterpriseBootstrap } from '@/lib/runtime/dev-bootstrap-flags';

const env = { ...process.env };

describe('dev-bootstrap-flags', () => {
  afterEach(() => {
    process.env = { ...env };
  });

  it('never skips in production from the legacy dev flag alone', () => {
    process.env.NODE_ENV = 'production';
    process.env.SYNTH_SKIP_ENTERPRISE_BOOTSTRAP = '1';
    delete process.env.SYNTH_PUBLIC_PRESENTATION_ONLY;
    delete process.env.E2E;
    delete process.env.NEXT_PUBLIC_E2E;
    expect(shouldSkipEnterpriseBootstrap()).toBe(false);
  });

  it('skips in production for an explicit public presentation-only host', () => {
    process.env.NODE_ENV = 'production';
    process.env.SYNTH_PUBLIC_PRESENTATION_ONLY = '1';
    delete process.env.E2E;
    delete process.env.NEXT_PUBLIC_E2E;
    expect(shouldSkipEnterpriseBootstrap()).toBe(true);
  });

  it('does not skip in production when presentation-only is disabled', () => {
    process.env.NODE_ENV = 'production';
    process.env.SYNTH_PUBLIC_PRESENTATION_ONLY = '0';
    delete process.env.SYNTH_SKIP_ENTERPRISE_BOOTSTRAP;
    delete process.env.E2E;
    delete process.env.NEXT_PUBLIC_E2E;
    expect(shouldSkipEnterpriseBootstrap()).toBe(false);
  });

  it('skips in production when E2E=true (Playwright prod webServer)', () => {
    process.env.NODE_ENV = 'production';
    process.env.E2E = 'true';
    expect(shouldSkipEnterpriseBootstrap()).toBe(true);
  });

  it('skips in production when NEXT_PUBLIC_E2E=true', () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_E2E = 'true';
    expect(shouldSkipEnterpriseBootstrap()).toBe(true);
  });

  it('skips in dev when SYNTH_SKIP_ENTERPRISE_BOOTSTRAP=1', () => {
    process.env.NODE_ENV = 'development';
    process.env.SYNTH_SKIP_ENTERPRISE_BOOTSTRAP = '1';
    expect(shouldSkipEnterpriseBootstrap()).toBe(true);
  });

  it('does not skip in dev without flag', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SYNTH_SKIP_ENTERPRISE_BOOTSTRAP;
    expect(shouldSkipEnterpriseBootstrap()).toBe(false);
  });
});
