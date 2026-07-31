import { invariant } from '../core/errors.mjs';

export function createMemoryAuthStore() {
  let state = { users: new Map(), emails: new Map(), sessions: new Map(), sessionHashes: new Map() };
  return Object.freeze({
    async transaction(work) {
      const draft = clone(state);
      const result = await work(view(draft));
      state = draft;
      return result;
    },
    snapshot() { return { users: [...state.users.values()], sessions: [...state.sessions.values()] }; },
  });
}
function clone(s) { return { users:new Map(s.users), emails:new Map(s.emails), sessions:new Map(s.sessions), sessionHashes:new Map(s.sessionHashes) }; }
function view(s) { return Object.freeze({
  getUser: async (id)=>s.users.get(id),
  getUserByEmail: async (email)=>s.users.get(s.emails.get(email)),
  insertUser: async (u)=>{ invariant(!s.users.has(u.id) && !s.emails.has(u.emailNormalized),'AUTH_USER_ALREADY_EXISTS','User already exists'); s.users.set(u.id,u); s.emails.set(u.emailNormalized,u.id); },
  getSessionByTokenHash: async (hash)=>s.sessions.get(s.sessionHashes.get(hash)),
  insertSession: async (session)=>{ invariant(!s.sessions.has(session.id) && !s.sessionHashes.has(session.tokenHash),'AUTH_SESSION_ALREADY_EXISTS','Session already exists'); s.sessions.set(session.id,session); s.sessionHashes.set(session.tokenHash,session.id); },
  saveSession: async (session)=>{ invariant(s.sessions.has(session.id),'AUTH_SESSION_NOT_FOUND','Session not found'); s.sessions.set(session.id,session); },
}); }
