import {
  platformCoreSsePollIntervalMs,
  PLATFORM_CORE_SSE_POLL_INTERVALS,
} from '@/lib/platform-core-sse-poll-intervals';

describe('platform-core-sse-poll-intervals', () => {
  it('uses faster poll when SSE is down', () => {
    expect(platformCoreSsePollIntervalMs(false, true)).toBe(
      PLATFORM_CORE_SSE_POLL_INTERVALS.sseDownVisibleMs
    );
    expect(platformCoreSsePollIntervalMs(true, true)).toBe(
      PLATFORM_CORE_SSE_POLL_INTERVALS.sseUpVisibleMs
    );
  });
});
