import { summarizePillarCapabilityPlatformStatus } from '@/lib/platform/pillar-capability-status-summary';

describe('pillar-capability-status-summary', () => {
  it('reports registry live vs enhance counts', () => {
    const summary = summarizePillarCapabilityPlatformStatus();
    expect(summary.capabilityCount).toBeGreaterThan(20);
    expect(summary.workspaceCount).toBeGreaterThan(30);
    expect(
      summary.capabilities.live + summary.capabilities.enhance + summary.capabilities.planned
    ).toBe(summary.capabilityCount);
    expect(
      summary.workspaceFeatures.live +
        summary.workspaceFeatures.stub +
        summary.workspaceFeatures.planned
    ).toBeGreaterThan(0);
  });
});
