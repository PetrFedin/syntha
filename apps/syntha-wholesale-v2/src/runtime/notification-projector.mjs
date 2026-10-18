import { invariant } from '../core/errors.mjs';

export function createNotificationProjector({
  notifications,
  intervalMs = 1_000,
  clock = () => new Date().toISOString(),
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
  logger = console,
} = {}) {
  invariant(notifications && typeof notifications.projectPending === 'function', 'NOTIFICATION_PROJECTOR_SERVICE_REQUIRED', 'Notification service is required');
  invariant(Number.isInteger(intervalMs) && intervalMs >= 10, 'NOTIFICATION_PROJECTOR_INTERVAL_INVALID', 'Notification projection interval must be an integer of at least 10ms', { intervalMs });
  invariant(typeof setTimeoutImpl === 'function' && typeof clearTimeoutImpl === 'function', 'NOTIFICATION_PROJECTOR_TIMER_INVALID', 'Notification projector timers are required');

  let started = false;
  let running = false;
  let timer = null;
  let activeRun = Promise.resolve(Object.freeze({ status: 'idle' }));
  let lastStartedAt = null;
  let lastCompletedAt = null;
  let lastSuccessAt = null;
  let lastError = null;
  let consecutiveFailures = 0;

  async function runOnce() {
    if (running) return Object.freeze({ status: 'skipped', reason: 'already-running' });
    running = true;
    lastStartedAt = clock();
    activeRun = (async () => {
      try {
        const results = await notifications.projectPending();
        lastSuccessAt = clock();
        lastError = null;
        consecutiveFailures = 0;
        return Object.freeze({ status: 'succeeded', projectedEventCount: results.length, results });
      } catch (error) {
        consecutiveFailures += 1;
        lastError = serializeError(error);
        logger.error?.('Syntha V2 notification projection failed', lastError);
        return Object.freeze({ status: 'failed', error: lastError });
      } finally {
        lastCompletedAt = clock();
        running = false;
      }
    })();
    return activeRun;
  }

  async function cycle() {
    if (!started) return;
    await runOnce();
    if (!started) return;
    timer = setTimeoutImpl(() => {
      timer = null;
      void cycle();
    }, intervalMs);
    timer?.unref?.();
  }

  function start() {
    if (started) return false;
    started = true;
    void cycle();
    return true;
  }

  async function stop() {
    started = false;
    if (timer) {
      clearTimeoutImpl(timer);
      timer = null;
    }
    await activeRun;
  }

  function snapshot() {
    return Object.freeze({
      started,
      running,
      intervalMs,
      lastStartedAt,
      lastCompletedAt,
      lastSuccessAt,
      lastError,
      consecutiveFailures,
    });
  }

  return Object.freeze({ start, stop, runOnce, snapshot });
}

function serializeError(error) {
  return Object.freeze({
    name: error?.name ?? 'Error',
    code: error?.code ?? 'NOTIFICATION_PROJECTION_FAILED',
    message: error?.message ?? 'Notification projection failed',
  });
}
