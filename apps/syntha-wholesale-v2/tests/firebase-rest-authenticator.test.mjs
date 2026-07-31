import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirebaseRestAuthenticator } from '../src/http/firebase-rest-authenticator.mjs';

test('Firebase REST authenticator resolves verified user uid as actorId', async () => {
  const calls = [];
  const authenticate = createFirebaseRestAuthenticator({
    apiKey: 'api-key',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ users: [{ localId: 'uid-1', email: 'user@example.com', emailVerified: true }] }), { status: 200 });
    },
  });
  const actor = await authenticate('valid-firebase-id-token');
  assert.deepEqual(actor, { actorId: 'uid-1', email: 'user@example.com', emailVerified: true });
  assert.match(calls[0].url, /accounts:lookup\?key=api-key$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { idToken: 'valid-firebase-id-token' });
});

test('invalid, disabled and failed Firebase tokens are rejected', async () => {
  const invalid = createFirebaseRestAuthenticator({ apiKey: 'key', fetchImpl: async () => new Response('{}', { status: 400 }) });
  assert.equal(await invalid('valid-looking-token'), null);
  const disabled = createFirebaseRestAuthenticator({ apiKey: 'key', fetchImpl: async () => Response.json({ users: [{ localId: 'uid', disabled: true }] }) });
  assert.equal(await disabled('valid-looking-token'), null);
  assert.equal(await disabled('tiny'), null);
});
