import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildShopBuyerCrmProfile,
  resolveShopBuyerDefaultSegmentKey,
  type ShopBuyerCrmProfile,
} from '@/lib/b2b/shop-buyer-crm-profile';
import { listBrandCrmSegmentsServer } from '@/lib/server/brand-crm-segments-repository';
import { normalizeShopCoreBuyerId } from '@/lib/order/shop-core-buyer-context';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memory = new Map<string, ShopBuyerCrmProfile>();
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-buyer-crm-profiles.json');
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as ShopBuyerCrmProfile[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.buyerId) memory.set(row.buyerId, row);
      }
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memory.values()], null, 2));
  } catch {
    /* best effort */
  }
}

async function resolveSegmentByKey(segmentKey: string) {
  const { segments } = await listBrandCrmSegmentsServer();
  return segments.find((s) => s.segmentKey === segmentKey) ?? segments[0] ?? null;
}

async function upsertPgProfile(
  buyerId: string,
  segmentKey: string,
  onboardingNoteRu?: string
): Promise<ShopBuyerCrmProfile | null> {
  const segment = await resolveSegmentByKey(segmentKey);
  if (!segment) return null;

  await ensureWorkshop2PgSchema();
  const assignedAt = new Date();
  const note =
    onboardingNoteRu ??
    (buyerId === 'shop2'
      ? 'Greenfield buyer: сегмент и прайс-лист назначены брендом — первый заказ через витрину.'
      : null);
  await getWorkshop2PgPool().query(
    `INSERT INTO shop_buyer_crm_profiles
       (buyer_id, segment_key, assigned_price_tier, net_term_days, first_order_discount_pct, onboarding_note_ru, assigned_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (buyer_id) DO UPDATE SET
       segment_key = EXCLUDED.segment_key,
       assigned_price_tier = EXCLUDED.assigned_price_tier,
       net_term_days = EXCLUDED.net_term_days,
       first_order_discount_pct = EXCLUDED.first_order_discount_pct,
       onboarding_note_ru = COALESCE(EXCLUDED.onboarding_note_ru, shop_buyer_crm_profiles.onboarding_note_ru),
       updated_at = EXCLUDED.updated_at`,
    [
      buyerId,
      segment.segmentKey,
      segment.defaultPriceTier,
      segment.defaultNetTermDays,
      segment.firstOrderDiscountPct ?? null,
      note,
      assignedAt,
    ]
  );

  return buildShopBuyerCrmProfile({
    buyerId,
    segment,
    onboardingNoteRu: note ?? undefined,
    assignedAt: assignedAt.toISOString(),
  });
}

async function readPgProfile(buyerId: string): Promise<ShopBuyerCrmProfile | null> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    buyer_id: string;
    segment_key: string;
    assigned_at: Date;
    onboarding_note_ru: string | null;
  }>(
    `SELECT buyer_id, segment_key, assigned_at, onboarding_note_ru
     FROM shop_buyer_crm_profiles
     WHERE buyer_id = $1`,
    [buyerId]
  );
  const row = res.rows[0];
  if (!row) return null;
  const segment = await resolveSegmentByKey(row.segment_key);
  if (!segment) return null;
  return buildShopBuyerCrmProfile({
    buyerId: row.buyer_id,
    segment,
    onboardingNoteRu: row.onboarding_note_ru ?? undefined,
    assignedAt: row.assigned_at.toISOString(),
  });
}

async function ensureMemoryProfile(buyerId: string): Promise<ShopBuyerCrmProfile | null> {
  hydrateFileIfNeeded();
  const cached = memory.get(buyerId);
  if (cached) return cached;

  const segmentKey = resolveShopBuyerDefaultSegmentKey(buyerId);
  const segment = await resolveSegmentByKey(segmentKey);
  if (!segment) return null;

  const profile = buildShopBuyerCrmProfile({
    buyerId,
    segment,
    onboardingNoteRu:
      buyerId === 'shop2'
        ? 'Greenfield buyer: сегмент и прайс-лист назначены брендом — первый заказ через витрину.'
        : undefined,
  });
  memory.set(buyerId, profile);
  persistFile();
  return profile;
}

export function clearShopBuyerCrmProfilesMemoryForTests(): void {
  memory.clear();
  fileHydrated = false;
}

export async function getShopBuyerCrmProfileServer(input?: { buyerId?: string }): Promise<{
  profile: ShopBuyerCrmProfile | null;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const buyerId = normalizeShopCoreBuyerId(input?.buyerId);

  if (isWorkshop2PostgresEnabled()) {
    try {
      let profile = await readPgProfile(buyerId);
      if (!profile) {
        profile = await upsertPgProfile(buyerId, resolveShopBuyerDefaultSegmentKey(buyerId));
      }
      return { profile, storageMode: 'pg' };
    } catch {
      /* fall through */
    }
  }

  const profile = await ensureMemoryProfile(buyerId);
  const storageMode = canUseDiskPersistence() && fs.existsSync(STORE_FILE) ? 'file' : 'memory';
  return { profile, storageMode: profile ? storageMode : 'demo' };
}

/** Brand-side explicit segment assign → shop buyer CRM profile (PG or file/memory). */
export async function assignShopBuyerCrmProfileServer(input: {
  buyerId?: string;
  segmentKey: string;
  onboardingNoteRu?: string;
}): Promise<{
  profile: ShopBuyerCrmProfile | null;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const buyerId = normalizeShopCoreBuyerId(input.buyerId);
  const segmentKey = input.segmentKey.trim();
  if (!segmentKey) return { profile: null, storageMode: 'demo' };

  const defaultNote =
    input.onboardingNoteRu ??
    (buyerId === 'shop2'
      ? 'Greenfield buyer: сегмент и прайс-лист назначены брендом — первый заказ через витрину.'
      : undefined);

  if (isWorkshop2PostgresEnabled()) {
    try {
      const profile = await upsertPgProfile(buyerId, segmentKey, defaultNote);
      if (profile) return { profile, storageMode: 'pg' };
    } catch {
      /* fall through */
    }
  }

  const segment = await resolveSegmentByKey(segmentKey);
  if (!segment) return { profile: null, storageMode: 'demo' };

  hydrateFileIfNeeded();
  const profile = buildShopBuyerCrmProfile({
    buyerId,
    segment,
    onboardingNoteRu: defaultNote,
    assignedAt: new Date().toISOString(),
  });
  memory.set(buyerId, profile);
  persistFile();
  const storageMode = canUseDiskPersistence() && fs.existsSync(STORE_FILE) ? 'file' : 'memory';
  return { profile, storageMode };
}
