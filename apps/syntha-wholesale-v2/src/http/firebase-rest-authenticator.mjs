import { invariant } from '../core/errors.mjs';

const DEFAULT_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';

export function createFirebaseRestAuthenticator({ apiKey, fetchImpl = fetch, endpoint = DEFAULT_ENDPOINT, timeoutMs = 5000 } = {}) {
  invariant(typeof apiKey === 'string' && apiKey.trim(), 'FIREBASE_API_KEY_REQUIRED', 'Firebase Web API key is required');
  invariant(typeof fetchImpl === 'function', 'FIREBASE_FETCH_REQUIRED', 'Firebase authenticator fetch implementation is required');
  invariant(Number.isInteger(timeoutMs) && timeoutMs > 0, 'FIREBASE_TIMEOUT_INVALID', 'Firebase auth timeout must be a positive integer');

  return async function authenticateFirebaseIdToken(idToken) {
    if (typeof idToken !== 'string' || idToken.length < 16 || idToken.length > 16384) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const user = payload?.users?.[0];
      if (!user?.localId || user.disabled === true) return null;
      return Object.freeze({
        actorId: user.localId,
        email: typeof user.email === 'string' ? user.email : null,
        emailVerified: user.emailVerified === true,
      });
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
}
