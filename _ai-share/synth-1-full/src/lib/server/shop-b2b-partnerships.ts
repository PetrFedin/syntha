import 'server-only';

import {
  catalogBrandToShopB2bPartnership,
  buildShopB2bPartnershipsFallback,
  type ShopB2bPartnership,
} from '@/lib/shop/shop-b2b-partnerships';
import {
  CATALOG_BRANDS,
  getCatalogBrandBySlug,
  PLATFORM_CORE_CONNECTED_BRAND_ID,
  PLATFORM_CORE_CONNECTED_BRAND_SLUG,
} from '@/lib/data/catalog-brands';
import {
  SHOP_CORE_DEMO_BUYER_ID,
  SHOP_CORE_W2_COLLECTION_IDS,
} from '@/lib/order/shop-workshop2-b2b-order-ui';
import { listWorkshop2B2bOrdersForBuyer } from '@/lib/server/workshop2-b2b-orders-repository';
import { listWorkshop2PublishedShowroomArticles } from '@/lib/server/workshop2-showroom-repository';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import {
  listShopB2bPartnershipRowsPg,
  upsertShopB2bPartnershipPg,
} from '@/lib/server/shop-b2b-partnerships-repository';

async function listPublishedShowroomCollectionIds(): Promise<string[]> {
  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ collection_id: string }>(
      `SELECT DISTINCT collection_id
       FROM workshop2_showroom_campaigns
       WHERE published = true
       ORDER BY collection_id ASC`
    );
    return res.rows.map((r) => r.collection_id);
  }

  const published: string[] = [];
  for (const collectionId of SHOP_CORE_W2_COLLECTION_IDS) {
    const articles = await listWorkshop2PublishedShowroomArticles(collectionId);
    if (articles.length) published.push(collectionId);
  }
  return published;
}

function buildConnectedFromActivity(
  brand: NonNullable<ReturnType<typeof getCatalogBrandBySlug>>,
  input: {
    buyerId: string;
    activeCollectionIds: string[];
    primaryCollectionId: string;
    orderCount: number;
  }
): ShopB2bPartnership {
  return catalogBrandToShopB2bPartnership(brand, {
    status: 'connected',
    source: 'pg',
    buyerId: input.buyerId,
    collectionIds: input.activeCollectionIds.length
      ? input.activeCollectionIds
      : [input.primaryCollectionId],
    orderCount: input.orderCount,
    collectionId: input.primaryCollectionId,
  });
}

/** PG-backed shop↔brand partnerships for Platform Core (golden path: shop1 ↔ Syntha Lab). */
export async function listShopB2bPartnerships(
  buyerId = SHOP_CORE_DEMO_BUYER_ID
): Promise<ShopB2bPartnership[]> {
  const synthaBrand = getCatalogBrandBySlug(PLATFORM_CORE_CONNECTED_BRAND_SLUG);
  if (!synthaBrand) return [];

  const [orders, publishedCollectionIds, pgRows] = await Promise.all([
    listWorkshop2B2bOrdersForBuyer(buyerId),
    listPublishedShowroomCollectionIds(),
    listShopB2bPartnershipRowsPg(buyerId),
  ]);

  const pgByBrandId = new Map(pgRows.map((r) => [r.brandId, r]));

  const orderCollectionIds = [
    ...new Set(orders.map((o) => o.collectionId?.trim()).filter(Boolean) as string[]),
  ];
  const activeCollectionIds = [
    ...new Set([...orderCollectionIds, ...publishedCollectionIds]),
  ].filter((id) => SHOP_CORE_W2_COLLECTION_IDS.includes(id));

  const primaryCollectionId =
    orderCollectionIds[0] ?? publishedCollectionIds[0] ?? SHOP_CORE_W2_COLLECTION_IDS[0] ?? 'SS27';

  const synthaActive = activeCollectionIds.length > 0 || orders.length > 0;
  const liveCollectionsForDiscover =
    publishedCollectionIds.length > 0
      ? publishedCollectionIds
      : synthaActive
        ? activeCollectionIds
        : [];
  const synthaPg = pgByBrandId.get(PLATFORM_CORE_CONNECTED_BRAND_ID);

  const results: ShopB2bPartnership[] = [];

  if (synthaActive || synthaPg?.status === 'connected') {
    const connected = buildConnectedFromActivity(synthaBrand, {
      buyerId,
      activeCollectionIds,
      primaryCollectionId,
      orderCount: orders.length,
    });
    results.push(connected);
    if (isWorkshop2PostgresEnabled() && synthaActive) {
      void upsertShopB2bPartnershipPg({
        buyerId,
        brandId: synthaBrand.id,
        brandSlug: synthaBrand.slug,
        status: 'connected',
        collectionId: primaryCollectionId,
      }).catch(() => {
        /* sync best-effort */
      });
    }
  } else if (synthaPg?.status === 'requested') {
    results.push(
      catalogBrandToShopB2bPartnership(synthaBrand, {
        status: 'requested',
        source: 'pg',
        buyerId,
        collectionIds: synthaPg.collectionId ? [synthaPg.collectionId] : [],
        orderCount: 0,
        collectionId: synthaPg.collectionId ?? primaryCollectionId,
      })
    );
  }

  const connectedIds = new Set(
    results.filter((p) => p.status === 'connected').map((p) => p.brandId)
  );

  for (const brand of CATALOG_BRANDS) {
    if (brand.id === PLATFORM_CORE_CONNECTED_BRAND_ID) continue;
    if (connectedIds.has(brand.id)) continue;

    const pg = pgByBrandId.get(brand.id);
    if (pg?.status === 'connected') {
      results.push(
        catalogBrandToShopB2bPartnership(brand, {
          status: 'connected',
          source: 'pg',
          buyerId,
          collectionIds: pg.collectionId ? [pg.collectionId] : [primaryCollectionId],
          orderCount: 0,
          collectionId: pg.collectionId ?? primaryCollectionId,
        })
      );
      connectedIds.add(brand.id);
      continue;
    }
    if (pg?.status === 'requested') {
      results.push(
        catalogBrandToShopB2bPartnership(brand, {
          status: 'requested',
          source: 'pg',
          buyerId,
          collectionIds: pg.collectionId ? [pg.collectionId] : [],
          orderCount: 0,
          collectionId: pg.collectionId ?? primaryCollectionId,
        })
      );
      continue;
    }

    results.push(
      catalogBrandToShopB2bPartnership(brand, {
        status: 'profile',
        source: isWorkshop2PostgresEnabled() ? 'pg' : 'fallback',
        buyerId,
        collectionIds:
          brand.id === PLATFORM_CORE_CONNECTED_BRAND_ID ? liveCollectionsForDiscover : [],
        orderCount: 0,
        collectionId: liveCollectionsForDiscover[0] ?? primaryCollectionId,
      })
    );
  }

  if (!results.length) {
    return buildShopB2bPartnershipsFallback(primaryCollectionId);
  }

  return results;
}

export async function requestShopB2bPartnershipAccess(input: {
  buyerId: string;
  brandId: string;
  collectionId?: string;
}): Promise<{ ok: true; partnership: ShopB2bPartnership } | { ok: false; messageRu: string }> {
  const brand = CATALOG_BRANDS.find((b) => b.id === input.brandId.trim());
  if (!brand) {
    return { ok: false, messageRu: 'Бренд не найден в каталоге.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return { ok: false, messageRu: 'PostgreSQL недоступен — запустите core:bootstrap.' };
  }

  const row = await upsertShopB2bPartnershipPg({
    buyerId: input.buyerId.trim(),
    brandId: brand.id,
    brandSlug: brand.slug,
    status: 'requested',
    collectionId: input.collectionId?.trim(),
  });

  return {
    ok: true,
    partnership: catalogBrandToShopB2bPartnership(brand, {
      status: 'requested',
      source: 'pg',
      buyerId: row.buyerId,
      collectionIds: row.collectionId ? [row.collectionId] : [],
      orderCount: 0,
      collectionId: row.collectionId ?? input.collectionId ?? 'SS27',
    }),
  };
}

export async function connectShopB2bPartnershipDemo(input: {
  buyerId: string;
  brandId: string;
  collectionId?: string;
}): Promise<{ ok: true; partnership: ShopB2bPartnership } | { ok: false; messageRu: string }> {
  const brand = CATALOG_BRANDS.find((b) => b.id === input.brandId.trim());
  if (!brand) {
    return { ok: false, messageRu: 'Бренд не найден в каталоге.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return { ok: false, messageRu: 'PostgreSQL недоступен — запустите core:bootstrap.' };
  }

  const row = await upsertShopB2bPartnershipPg({
    buyerId: input.buyerId.trim(),
    brandId: brand.id,
    brandSlug: brand.slug,
    status: 'connected',
    collectionId: input.collectionId?.trim(),
  });

  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('shop.partnership.connected');

  return {
    ok: true,
    partnership: catalogBrandToShopB2bPartnership(brand, {
      status: 'connected',
      source: 'pg',
      buyerId: row.buyerId,
      collectionIds: row.collectionId ? [row.collectionId] : [input.collectionId ?? 'SS27'],
      orderCount: 0,
      collectionId: row.collectionId ?? input.collectionId ?? 'SS27',
    }),
  };
}
