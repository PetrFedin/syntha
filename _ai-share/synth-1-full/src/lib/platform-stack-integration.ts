/**
 * Platform stack integration — maps 10 infrastructure capabilities to Platform Core
 * pillars, roles, sections. Used by health probes and agent routing hints.
 *
 * Backend mirror: app/platform/stack_registry.py
 */

export type StackCapabilityId =
  | 'postgresql'
  | 'sqlalchemy'
  | 'alembic'
  | 'jwt_auth'
  | 'users'
  | 'product_catalog'
  | 'image_upload'
  | 'firebase_auth'
  | 'payments'
  | 'ai_module';

export type CoreHubPillarId =
  | 'development'
  | 'sample_collection'
  | 'collection_order'
  | 'order_production'
  | 'comms';

export type CoreChainRoleId = 'brand' | 'shop' | 'manufacturer' | 'supplier';

export type StackCapabilityMeta = {
  title: string;
  pillars: CoreHubPillarId[];
  roles: CoreChainRoleId[];
  sectionIds: string[];
  agentIds: string[];
  backendPaths: string[];
  frontendPaths: string[];
  envKeys: string[];
};

export const PLATFORM_STACK_CAPABILITIES: Record<StackCapabilityId, StackCapabilityMeta> = {
  postgresql: {
    title: 'PostgreSQL',
    pillars: ['development', 'sample_collection', 'collection_order', 'order_production', 'comms'],
    roles: ['brand', 'shop', 'manufacturer', 'supplier'],
    sectionIds: [
      'brand-dev-pg-sync',
      'shop-co-registry',
      'brand-co-registry',
      'mfr-op-handoff-queue',
    ],
    agentIds: [],
    backendPaths: ['app/db/session.py'],
    frontendPaths: ['src/lib/server/workshop2-pg-pool.ts', 'db/migrations/'],
    envKeys: ['DATABASE_URL', 'WORKSHOP2_DATABASE_URL'],
  },
  sqlalchemy: {
    title: 'SQLAlchemy',
    pillars: ['development', 'sample_collection', 'collection_order', 'order_production'],
    roles: ['brand', 'shop', 'manufacturer', 'supplier'],
    sectionIds: ['brand-dev-dossier', 'brand-sc-linesheets', 'shop-co-matrix'],
    agentIds: ['architecture_guard'],
    backendPaths: ['app/db/models/', 'app/db/repositories/'],
    frontendPaths: [],
    envKeys: ['DATABASE_URL'],
  },
  alembic: {
    title: 'Alembic',
    pillars: ['development', 'order_production'],
    roles: ['brand', 'manufacturer'],
    sectionIds: ['brand-dev-pg-sync', 'mfr-op-dossier'],
    agentIds: ['architecture_guard', 'tech_debt'],
    backendPaths: ['alembic/', 'app/db/migrations/'],
    frontendPaths: ['db/migrations/'],
    envKeys: ['DATABASE_URL'],
  },
  jwt_auth: {
    title: 'JWT Auth',
    pillars: ['comms'],
    roles: ['brand', 'shop', 'manufacturer', 'supplier'],
    sectionIds: ['brand-cm-order-chat', 'shop-cm-order-chat', 'mfr-cm-order', 'sup-cm-order'],
    agentIds: [],
    backendPaths: ['app/core/security.py', 'app/api/v1/endpoints/auth.py'],
    frontendPaths: ['src/lib/auth/', 'src/lib/syntha-api-mode.ts'],
    envKeys: ['SECRET_KEY'],
  },
  users: {
    title: 'Users',
    pillars: ['comms', 'collection_order'],
    roles: ['brand', 'shop', 'manufacturer', 'supplier'],
    sectionIds: ['brand-co-retailers', 'shop-sc-partners'],
    agentIds: [],
    backendPaths: ['app/db/models/core.py', 'app/db/repositories/user.py'],
    frontendPaths: ['src/lib/auth/dev-auth-bootstrap.ts'],
    envKeys: ['AUTH_USE_DB'],
  },
  product_catalog: {
    title: 'Product Catalog',
    pillars: ['development', 'sample_collection', 'collection_order'],
    roles: ['brand', 'shop'],
    sectionIds: [
      'brand-dev-w2-hub',
      'brand-sc-linesheets',
      'brand-sc-showroom',
      'shop-sc-showroom',
      'shop-co-matrix',
      'shop-co-checkout',
    ],
    agentIds: ['product_architect', 'market_intelligence', 'content', 'lookbook'],
    backendPaths: ['app/api/v1/endpoints/product.py', 'app/api/v1/endpoints/showrooms.py'],
    frontendPaths: ['src/app/api/b2b/', 'src/lib/b2b/integrations/catalog-summary-source.ts'],
    envKeys: ['SHOPIFY_SHOP_URL'],
  },
  image_upload: {
    title: 'Image Upload',
    pillars: ['development', 'sample_collection'],
    roles: ['brand', 'manufacturer', 'supplier'],
    sectionIds: ['brand-dev-w2-hub', 'brand-dev-dossier', 'mfr-dev-dossier', 'sup-dev-bom'],
    agentIds: ['creative', 'lookbook', 'stylist'],
    backendPaths: ['app/api/v1/endpoints/dam.py', 'app/api/v1/endpoints/ingestion.py'],
    frontendPaths: ['src/lib/firebase/config.ts', 'docs/W2_TECHPACK_PILOT.md'],
    envKeys: ['MEDIA_UPLOAD_DIR'],
  },
  firebase_auth: {
    title: 'Firebase Auth',
    pillars: ['comms'],
    roles: ['brand', 'shop'],
    sectionIds: ['brand-cm-cabinet', 'shop-cm-cabinet'],
    agentIds: [],
    backendPaths: ['app/api/v1/endpoints/auth.py'],
    frontendPaths: ['src/lib/firebase/config.ts', 'src/lib/firebase/firebase-env.ts'],
    envKeys: ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  },
  payments: {
    title: 'Stripe / ЮKassa',
    pillars: ['collection_order'],
    roles: ['brand', 'shop'],
    sectionIds: ['shop-co-checkout', 'brand-co-detail'],
    agentIds: ['risk', 'order_anomaly'],
    backendPaths: ['app/api/v1/endpoints/fintech.py', 'app/integrations/yukassa.py'],
    frontendPaths: [
      'src/lib/production/workshop2-yukassa-stub.ts',
      'src/lib/production/workshop2-stripe-stub.ts',
    ],
    envKeys: ['YUKASSA_SHOP_ID', 'YUKASSA_SECRET_KEY', 'STRIPE_SECRET_KEY'],
  },
  ai_module: {
    title: 'AI (Ollama / OpenAI)',
    pillars: ['development', 'sample_collection', 'collection_order'],
    roles: ['brand', 'shop'],
    sectionIds: ['brand-dev-range', 'shop-sc-matrix-entry', 'shop-co-buyer-tracking'],
    agentIds: [
      'orchestrator',
      'content',
      'market_intelligence',
      'product_architect',
      'ai_module_curator',
      'lookbook',
      'stylist',
    ],
    backendPaths: ['app/ai/llm_client.py', 'app/api/v1/endpoints/ai_routes.py', 'app/agents/'],
    frontendPaths: ['src/lib/b2b/ai/'],
    envKeys: ['LLM_PROVIDER', 'OLLAMA_BASE_URL', 'OPENAI_API_KEY'],
  },
};

const sectionIndex = new Map<string, StackCapabilityId[]>();
for (const [capId, meta] of Object.entries(PLATFORM_STACK_CAPABILITIES) as [
  StackCapabilityId,
  StackCapabilityMeta,
][]) {
  for (const sid of meta.sectionIds) {
    const list = sectionIndex.get(sid) ?? [];
    list.push(capId);
    sectionIndex.set(sid, list);
  }
}

export function getCapabilitiesForSection(sectionId: string): StackCapabilityId[] {
  return sectionIndex.get(sectionId) ?? [];
}

export function getAgentsForPillarRole(pillar: CoreHubPillarId, role: CoreChainRoleId): string[] {
  const agents = new Set<string>();
  for (const meta of Object.values(PLATFORM_STACK_CAPABILITIES)) {
    if (!meta.pillars.includes(pillar) || !meta.roles.includes(role)) continue;
    meta.agentIds.forEach((a) => agents.add(a));
  }
  return [...agents];
}

export function probePlatformStackEnv(env: Record<string, string | undefined> = process.env): {
  ollama: { configured: boolean; url: string };
  postgres: { configured: boolean };
  firebase: { configured: boolean };
  yukassa: { configured: boolean };
  stripe: { configured: boolean };
  openai: { configured: boolean };
} {
  return {
    ollama: {
      configured: Boolean(env.OLLAMA_BASE_URL?.trim() || env.LLM_PROVIDER === 'ollama'),
      url: env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    },
    postgres: {
      configured: Boolean(env.DATABASE_URL?.includes('postgresql') || env.WORKSHOP2_DATABASE_URL),
    },
    firebase: {
      configured: Boolean(env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim()),
    },
    yukassa: {
      configured: Boolean(env.YUKASSA_SHOP_ID?.trim() && env.YUKASSA_SECRET_KEY?.trim()),
    },
    stripe: {
      configured: Boolean(env.STRIPE_SECRET_KEY?.trim()),
    },
    openai: {
      configured: Boolean(env.OPENAI_API_KEY?.trim()),
    },
  };
}
