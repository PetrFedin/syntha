/**
 * Runtime performance toggles for Node instrumentation bootstrap.
 *
 * `SYNTH_SKIP_ENTERPRISE_BOOTSTRAP` stays dev-only. Dedicated public
 * presentation hosts may explicitly opt out in production with
 * `SYNTH_PUBLIC_PRESENTATION_ONLY=1` without changing the main app contract.
 */
export function shouldSkipEnterpriseBootstrap(): boolean {
  if (process.env.SYNTH_PUBLIC_PRESENTATION_ONLY === '1') {
    return true;
  }
  if (process.env.E2E === 'true' || process.env.NEXT_PUBLIC_E2E === 'true') {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return process.env.SYNTH_SKIP_ENTERPRISE_BOOTSTRAP === '1';
}
