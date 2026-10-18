import test from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationProjector } from '../src/runtime/notification-projector.mjs';

test('notification projector starts immediately, avoids overlap and schedules after completion', async () => {
  const timers = createFakeTimers();
  let calls = 0;
  let releaseFirst;
  const notifications = {
    projectPending() {
      calls += 1;
      if (calls === 1) return new Promise((resolve) => { releaseFirst = resolve; });
      return Promise.resolve([]);
    },
  };
  const projector = createNotificationProjector({
    notifications,
    intervalMs: 100,
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
    clock: advancingClock(),
    logger: { error() {} },
  });

  assert.equal(projector.start(), true);
  assert.equal(projector.start(), false);
  await flush();
  assert.equal(calls, 1);
  assert.equal(timers.size(), 0, 'next cycle must not be scheduled while projection is running');
  assert.equal((await projector.runOnce()).status, 'skipped');

  releaseFirst([]);
  await flush();
  assert.equal(timers.size(), 1);
  await timers.runNext();
  await flush();
  assert.equal(calls, 2);
  assert.equal(timers.size(), 1);
  assert.equal(projector.snapshot().consecutiveFailures, 0);
  await projector.stop();
  assert.equal(timers.size(), 0);
});

test('notification projector logs a failure and recovers on the next cycle', async () => {
  const timers = createFakeTimers();
  const errors = [];
  let calls = 0;
  const projector = createNotificationProjector({
    notifications: {
      async projectPending() {
        calls += 1;
        if (calls === 1) throw Object.assign(new Error('database unavailable'), { code: 'DB_DOWN' });
        return [];
      },
    },
    intervalMs: 100,
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
    clock: advancingClock(),
    logger: { error(...args) { errors.push(args); } },
  });

  projector.start();
  await flush();
  assert.equal(projector.snapshot().consecutiveFailures, 1);
  assert.equal(projector.snapshot().lastError.code, 'DB_DOWN');
  assert.equal(errors.length, 1);
  await timers.runNext();
  await flush();
  assert.equal(calls, 2);
  assert.equal(projector.snapshot().consecutiveFailures, 0);
  assert.equal(projector.snapshot().lastError, null);
  assert.ok(projector.snapshot().lastSuccessAt);
  await projector.stop();
});

test('notification projector stop waits for the active projection and prevents rescheduling', async () => {
  const timers = createFakeTimers();
  let release;
  const projector = createNotificationProjector({
    notifications: { projectPending: () => new Promise((resolve) => { release = resolve; }) },
    intervalMs: 100,
    setTimeoutImpl: timers.setTimeoutImpl,
    clearTimeoutImpl: timers.clearTimeoutImpl,
    clock: advancingClock(),
    logger: { error() {} },
  });
  projector.start();
  await flush();
  let stopped = false;
  const stop = projector.stop().then(() => { stopped = true; });
  await flush();
  assert.equal(stopped, false);
  release([]);
  await stop;
  assert.equal(stopped, true);
  assert.equal(timers.size(), 0);
  assert.equal(projector.snapshot().started, false);
  assert.equal(projector.snapshot().running, false);
});

function createFakeTimers() {
  const queue = [];
  let sequence = 0;
  function setTimeoutImpl(callback, delay) {
    const handle = { id: ++sequence, callback, delay, unref() {} };
    queue.push(handle);
    return handle;
  }
  function clearTimeoutImpl(handle) {
    const index = queue.findIndex((candidate) => candidate.id === handle.id);
    if (index >= 0) queue.splice(index, 1);
  }
  async function runNext() {
    const handle = queue.shift();
    assert.ok(handle, 'expected a scheduled projector cycle');
    handle.callback();
    await flush();
  }
  return { setTimeoutImpl, clearTimeoutImpl, runNext, size: () => queue.length };
}

function advancingClock() {
  let tick = 0;
  return () => `2026-08-06T21:00:${String(tick++).padStart(2, '0')}.000Z`;
}

async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
}
