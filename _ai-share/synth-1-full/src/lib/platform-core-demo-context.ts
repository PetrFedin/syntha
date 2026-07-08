/**
 * Demo-контекст Platform Core без импорта routes / comms / workshop2-url —
 * разрыв цикла local-collection-inventory → hub-matrix → syntha → collection-steps-catalog → routes.
 */

export type PlatformCoreDemoContext = {
  collectionId: string;
  demoOrderId: string;
  demoArticleId: string;
  factoryHubId: string;
  factoryId: string;
  productionOrderId: string;
  /** PG checkout buyer — multi-buyer cross-role / shop registry context. */
  demoBuyerId?: string;
  /** Нет PG seed — контраст с SS27/FW27 на hub. */
  emptyChain?: boolean;
};

/** Коллекция без seed для сравнения с golden path SS27. */
export const PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID = 'EMPTY27';

export const PLATFORM_CORE_DEMO: PlatformCoreDemoContext = {
  collectionId: 'SS27',
  demoOrderId: 'B2B-DEMO-SHOP1-SS27',
  demoArticleId: 'demo-ss27-01',
  demoBuyerId: 'shop1',
  factoryHubId: 'f1',
  factoryId: 'fact-1',
  productionOrderId: 'PO-B2B-B2B-DEMO-SHOP1-SS27',
};

/** PG pin ids per collection — всегда в brand/shop registry (bulk handoff e2e, shop2 buyer). */
export const PLATFORM_CORE_PINNED_B2B_ORDER_IDS: Readonly<Record<string, readonly string[]>> = {
  SS27: ['B2B-DEMO-SHOP1-SS27', 'B2B-DEMO-SHOP2-SS27'],
  FW27: ['B2B-DEMO-SHOP1-FW27'],
};

export const PLATFORM_CORE_DEMO_PRESETS: Record<string, PlatformCoreDemoContext> = {
  SS27: PLATFORM_CORE_DEMO,
  FW27: {
    collectionId: 'FW27',
    demoOrderId: 'B2B-DEMO-SHOP1-FW27',
    demoArticleId: 'demo-fw27-01',
    demoBuyerId: 'shop1',
    factoryHubId: 'f1',
    factoryId: 'fact-1',
    productionOrderId: 'PO-B2B-B2B-DEMO-SHOP1-FW27',
  },
  EMPTY27: {
    collectionId: PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID,
    demoOrderId: '__EMPTY27__',
    demoArticleId: '__EMPTY27__',
    factoryHubId: 'f1',
    factoryId: 'fact-1',
    productionOrderId: '__EMPTY27_PO__',
    emptyChain: true,
  },
};

export function isPlatformCoreEmptyChainCollection(collectionId: string): boolean {
  return collectionId.trim() === PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID;
}

/** SS27 / FW27 — golden path с PG seed (не EMPTY27). */
export function isPlatformCoreGoldenCollectionId(collectionId: string): boolean {
  const id = collectionId.trim();
  return id in PLATFORM_CORE_DEMO_PRESETS && !isPlatformCoreEmptyChainCollection(id);
}

export function isPlatformCoreEmptyChainDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): boolean {
  return demo.emptyChain === true || isPlatformCoreEmptyChainCollection(demo.collectionId);
}

/** SS27/FW27 sibling articles (demo-ss27-02…) → preset коллекции для cross-role href. */
export function resolvePlatformCoreDemoPresetForArticleId(
  articleId: string
): PlatformCoreDemoContext {
  const exact = Object.values(PLATFORM_CORE_DEMO_PRESETS).find(
    (p) => p.demoArticleId === articleId
  );
  if (exact) return exact;
  const id = articleId.trim();
  if (/^demo-ss27-\d+$/i.test(id)) return PLATFORM_CORE_DEMO_PRESETS.SS27;
  if (/^demo-fw27-\d+$/i.test(id)) return PLATFORM_CORE_DEMO_PRESETS.FW27;
  return PLATFORM_CORE_DEMO;
}

/** Коллекции golden path (кроме системной SS27), которые подтягиваются из PG при входе в W2. */
export const PLATFORM_CORE_W2_HYDRATE_COLLECTION_IDS: readonly string[] = Object.keys(
  PLATFORM_CORE_DEMO_PRESETS
).filter((id) => id !== PLATFORM_CORE_DEMO.collectionId && !isPlatformCoreEmptyChainCollection(id));

/** Доступные demo-коллекции на hub (`/platform?collection=`). */
export const PLATFORM_CORE_COLLECTION_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  available: boolean;
}> = [
  { id: 'SS27', label: 'Весна–лето 2027', available: true },
  { id: 'FW27', label: 'Осень–зима 2027', available: true },
  {
    id: PLATFORM_CORE_EMPTY_CHAIN_COLLECTION_ID,
    label: 'Пустая коллекция (без данных)',
    available: true,
  },
];

export function getPlatformCoreCollectionLabel(collectionId: string): string {
  const preset = PLATFORM_CORE_COLLECTION_PRESETS.find((p) => p.id === collectionId);
  return preset?.label ?? collectionId;
}

/** Валидный collectionId для chain-overview; неизвестный → SS27. */
export function resolvePlatformCoreCollectionId(raw: string | null | undefined): string {
  const fallback = PLATFORM_CORE_DEMO.collectionId;
  const id = raw?.trim();
  if (!id) return fallback;
  const preset = PLATFORM_CORE_COLLECTION_PRESETS.find((p) => p.id === id && p.available);
  return preset?.id ?? fallback;
}

export function getPlatformCoreDemo(collectionId?: string | null): PlatformCoreDemoContext {
  const id = resolvePlatformCoreCollectionId(collectionId);
  return PLATFORM_CORE_DEMO_PRESETS[id] ?? PLATFORM_CORE_DEMO;
}

/** Demo-контекст с подстановкой articleId (href столпов / cross-role). */
export function platformCoreDemoForArticle(
  collectionId: string,
  articleId: string
): PlatformCoreDemoContext {
  return { ...getPlatformCoreDemo(collectionId), collectionId, demoArticleId: articleId };
}

/** Коллекция со страницы: `?collection=`, `?w2col=` или явный fallback. */
export function resolvePageCollectionId(
  options: {
    collection?: string | null;
    w2col?: string | null;
    fallback?: string | null;
  } = {}
): string {
  return resolvePlatformCoreCollectionId(options.collection ?? options.w2col ?? options.fallback);
}

/** Активный wholesale из chain-overview / spine-resolver → href столпов и PO id. */
export function mergePlatformCoreDemoWithActiveOrder(
  base: PlatformCoreDemoContext,
  activeOrderId: string | undefined | null,
  activeBuyerId?: string | undefined | null
): PlatformCoreDemoContext {
  const id = activeOrderId?.trim() ?? '';
  const buyerId = activeBuyerId?.trim() ?? '';
  if ((!id || id.startsWith('__') || base.emptyChain) && !buyerId) return base;
  if (base.emptyChain) return base;
  const next: PlatformCoreDemoContext = { ...base };
  if (id && !id.startsWith('__') && id !== base.demoOrderId) {
    next.demoOrderId = id;
    next.productionOrderId = `PO-B2B-${id}`;
  }
  if (buyerId) {
    next.demoBuyerId = buyerId;
  }
  return next;
}
