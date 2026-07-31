import { invariant } from '../core/errors.mjs';

export function createPostgresAuthStore({ pool } = {}) {
  invariant(pool && typeof pool.connect === 'function', 'POSTGRES_POOL_REQUIRED', 'PostgreSQL pool is required');
  return Object.freeze({
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await work(view(client));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  });
}

function view(client) {
  return Object.freeze({
    async getUser(id) {
      const result = await client.query('SELECT * FROM auth_users WHERE id = $1', [id]);
      return userFromRow(result.rows[0]);
    },
    async getUserByEmail(emailNormalized) {
      const result = await client.query('SELECT * FROM auth_users WHERE email_normalized = $1', [emailNormalized]);
      return userFromRow(result.rows[0]);
    },
    async insertUser(user) {
      try {
        await client.query(
          `INSERT INTO auth_users
             (id, email, email_normalized, display_name, password_hash, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [user.id, user.email, user.emailNormalized, user.displayName, user.passwordHash, user.status, user.createdAt, user.updatedAt],
        );
      } catch (error) {
        if (error?.code === '23505') invariant(false, 'AUTH_USER_ALREADY_EXISTS', 'User already exists', { email: user.emailNormalized });
        throw error;
      }
    },
    async getSessionByTokenHash(tokenHash) {
      const result = await client.query('SELECT * FROM auth_sessions WHERE token_hash = $1', [tokenHash]);
      return sessionFromRow(result.rows[0]);
    },
    async insertSession(session) {
      try {
        await client.query(
          `INSERT INTO auth_sessions
             (id, user_id, token_hash, status, created_at, expires_at, revoked_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [session.id, session.userId, session.tokenHash, session.status, session.createdAt, session.expiresAt, session.revokedAt],
        );
      } catch (error) {
        if (error?.code === '23505') invariant(false, 'AUTH_SESSION_ALREADY_EXISTS', 'Session already exists');
        throw error;
      }
    },
    async saveSession(session) {
      const result = await client.query(
        `UPDATE auth_sessions
            SET status = $2, revoked_at = $3
          WHERE id = $1`,
        [session.id, session.status, session.revokedAt],
      );
      invariant(result.rowCount === 1, 'AUTH_SESSION_NOT_FOUND', 'Session not found', { sessionId: session.id });
    },
  });
}

function userFromRow(row) {
  if (!row) return undefined;
  return Object.freeze({
    id: row.id,
    email: row.email,
    emailNormalized: row.email_normalized,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    status: row.status,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  });
}
function sessionFromRow(row) {
  if (!row) return undefined;
  return Object.freeze({
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    status: row.status,
    createdAt: iso(row.created_at),
    expiresAt: iso(row.expires_at),
    revokedAt: row.revoked_at ? iso(row.revoked_at) : null,
  });
}
function iso(value) { return value?.toISOString?.() ?? value; }
