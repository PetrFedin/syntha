import 'server-only';

import type { Workshop2B2bCartSession } from '@/lib/production/workshop2-b2b-wave23-parity';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopB2bPartnerSessionRecord = {
  sessionId: string;
  buyerEmail: string;
  tier: Workshop2B2bCartSession['tier'];
  inviteToken?: string;
  acceptedAt: string;
};

const memory = new Map<string, ShopB2bPartnerSessionRecord>();

/** Sync peek for request-scoped resolver (memory warmed by persist/get). */
export function peekShopB2bPartnerSessionMemory(
  sessionId: string
): ShopB2bPartnerSessionRecord | null {
  const sid = sessionId.trim();
  if (!sid) return null;
  return memory.get(sid) ?? null;
}

export async function persistShopB2bPartnerSessionServer(input: {
  sessionId: string;
  buyerEmail: string;
  tier: Workshop2B2bCartSession['tier'];
  inviteToken?: string;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' }> {
  const sessionId = input.sessionId.trim();
  const buyerEmail = input.buyerEmail.trim();
  if (!sessionId || !buyerEmail) return { ok: false, storageMode: 'memory' };

  const record: ShopB2bPartnerSessionRecord = {
    sessionId,
    buyerEmail,
    tier: input.tier,
    inviteToken: input.inviteToken?.trim(),
    acceptedAt: new Date().toISOString(),
  };
  memory.set(sessionId, record);

  if (!isWorkshop2PostgresEnabled()) return { ok: true, storageMode: 'memory' };

  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO shop_b2b_partner_sessions
       (session_id, buyer_email, tier, invite_token, accepted_at, updated_at)
     VALUES ($1, $2, $3, $4, $5::timestamptz, NOW())
     ON CONFLICT (session_id) DO UPDATE SET
       buyer_email = EXCLUDED.buyer_email,
       tier = EXCLUDED.tier,
       invite_token = COALESCE(EXCLUDED.invite_token, shop_b2b_partner_sessions.invite_token),
       accepted_at = EXCLUDED.accepted_at,
       updated_at = NOW()`,
    [sessionId, buyerEmail, input.tier, input.inviteToken ?? null, record.acceptedAt]
  );
  return { ok: true, storageMode: 'postgres' };
}

export async function getShopB2bPartnerSessionServer(sessionId: string): Promise<{
  record: ShopB2bPartnerSessionRecord | null;
  storageMode: 'postgres' | 'memory';
}> {
  const sid = sessionId.trim();
  if (!sid) return { record: null, storageMode: 'memory' };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      session_id: string;
      buyer_email: string;
      tier: Workshop2B2bCartSession['tier'];
      invite_token: string | null;
      accepted_at: Date;
    }>(
      `SELECT session_id, buyer_email, tier, invite_token, accepted_at
       FROM shop_b2b_partner_sessions WHERE session_id = $1`,
      [sid]
    );
    const row = res.rows[0];
    if (!row) return { record: memory.get(sid) ?? null, storageMode: 'postgres' };
    const record: ShopB2bPartnerSessionRecord = {
      sessionId: row.session_id,
      buyerEmail: row.buyer_email,
      tier: row.tier,
      inviteToken: row.invite_token ?? undefined,
      acceptedAt: row.accepted_at.toISOString(),
    };
    memory.set(sid, record);
    return { record, storageMode: 'postgres' };
  }

  return { record: memory.get(sid) ?? null, storageMode: 'memory' };
}
