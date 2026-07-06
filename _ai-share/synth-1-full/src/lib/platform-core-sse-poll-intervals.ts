/** Единые интервалы poll fallback для Platform Core realtime hooks (5.7). */
export const PLATFORM_CORE_SSE_POLL_INTERVALS = {
  sseDownVisibleMs: 15_000,
  sseDownHiddenMs: 45_000,
  sseUpVisibleMs: 60_000,
  sseUpHiddenMs: 120_000,
} as const;

export function platformCoreSsePollIntervalMs(
  sseConnected: boolean,
  visible = typeof document !== 'undefined' && document.visibilityState === 'visible'
): number {
  if (visible) {
    return sseConnected
      ? PLATFORM_CORE_SSE_POLL_INTERVALS.sseUpVisibleMs
      : PLATFORM_CORE_SSE_POLL_INTERVALS.sseDownVisibleMs;
  }
  return sseConnected
    ? PLATFORM_CORE_SSE_POLL_INTERVALS.sseUpHiddenMs
    : PLATFORM_CORE_SSE_POLL_INTERVALS.sseDownHiddenMs;
}
