import { fingerprintWorkshop2SampleRollup } from '@/lib/platform-core-sample-status-sse';

describe('platform-core-sample-status-sse', () => {
  it('fingerprint меняется при смене статусов rollup', () => {
    const base = {
      total: 2,
      byStatus: { draft: 1, sent: 1, in_progress: 0 },
      avgLeadTimeDays: 5,
    };
    const fp1 = fingerprintWorkshop2SampleRollup(base);
    const fp2 = fingerprintWorkshop2SampleRollup({
      ...base,
      byStatus: { draft: 0, sent: 1, in_progress: 1 },
      avgLeadTimeDays: 6,
    });
    expect(fp1).not.toBe(fp2);
  });
});
