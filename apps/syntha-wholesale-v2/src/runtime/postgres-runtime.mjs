import { invariant } from '../core/errors.mjs';
import { createAuthService } from '../application/auth-service.mjs';
import { createCatalogService } from '../application/catalog-service.mjs';
import { createProductDevelopmentService } from '../application/product-development-service.mjs';
import { createProductSpecificationService } from '../application/product-specification-service.mjs';
import { createMeasurementService } from '../application/measurement-service.mjs';
import { createTechPackArtifactService } from '../application/tech-pack-artifact-service.mjs';
import { createPostgresReadinessService } from '../application/readiness-service.mjs';
import { createWholesalePlatform } from '../application/platform.mjs';
import { createPartnerAccessService } from '../application/partner-access-service.mjs';
import { createShowroomSelectionService } from '../application/showroom-selection-service.mjs';
import { createOrderBuilderService } from '../application/order-builder-service.mjs';
import { createNotificationService } from '../application/notification-service.mjs';
import { createWorkspaceQueryService } from '../application/workspace-query-service.mjs';
import { createPostgresAuthStore } from '../infrastructure/postgres-auth-store.mjs';
import { createPostgresCatalogStore } from '../infrastructure/postgres-catalog-store.mjs';
import { createPostgresProductSpecificationStore } from '../infrastructure/postgres-product-specification-store.mjs';
import { createPostgresMeasurementStore } from '../infrastructure/postgres-measurement-store.mjs';
import { createPostgresTechPackArtifactStore } from '../infrastructure/postgres-tech-pack-artifact-store.mjs';
import { createPostgresWholesaleStore } from '../infrastructure/postgres-store.mjs';
import { createPostgresNotificationProjectionStore } from '../infrastructure/postgres-notification-projection-store.mjs';
import { createPostgresWorkspaceReader } from '../infrastructure/postgres-workspace-reader.mjs';
import { createWholesaleHttpHandler } from '../http/api.mjs';
import { createWholesaleFetchHandler } from '../http/fetch-api.mjs';
import { createTechPackArtifactFetchHandler, createTechPackArtifactHttpHandler } from '../http/tech-pack-artifact-http.mjs';

export function createPostgresWholesaleRuntime({ pool, migrationsDir, clock, nextId, randomBytesImpl, sessionTtlMs, maxLoginFailures, loginWindowMs, loginBlockMs, revokedSessionRetentionMs } = {}) {
  invariant(pool, 'POSTGRES_POOL_REQUIRED', 'PostgreSQL pool is required');
  const store = createPostgresWholesaleStore({ pool }); const catalogStore = createPostgresCatalogStore({ pool }); const productSpecificationStore = createPostgresProductSpecificationStore({ pool }); const measurementStore = createPostgresMeasurementStore({ pool }); const techPackArtifactStore = createPostgresTechPackArtifactStore({ pool });
  const options = { store, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) };
  const auth = createAuthService({ store: createPostgresAuthStore({ pool }), ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}), ...(randomBytesImpl ? { randomBytesImpl } : {}), ...(sessionTtlMs ? { sessionTtlMs } : {}), ...(maxLoginFailures ? { maxLoginFailures } : {}), ...(loginWindowMs ? { loginWindowMs } : {}), ...(loginBlockMs ? { loginBlockMs } : {}), ...(revokedSessionRetentionMs ? { revokedSessionRetentionMs } : {}) });
  const readiness = migrationsDir ? createPostgresReadinessService({ pool, migrationsDir, ...(clock ? { clock } : {}) }) : undefined;
  const platform = createWholesalePlatform(options); const catalog = createCatalogService({ wholesaleStore: store, catalogStore, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) }); const productDevelopment = createProductDevelopmentService(options); const productSpecification = createProductSpecificationService({ store: productSpecificationStore, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) }); const measurements = createMeasurementService({ store: measurementStore, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) }); const techPackArtifacts = createTechPackArtifactService({ store: techPackArtifactStore, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) }); const partners = createPartnerAccessService(options); const collaboration = createShowroomSelectionService({ ...options, catalogReader: catalog }); const orders = createOrderBuilderService(options);
  const projectionStore = createPostgresNotificationProjectionStore({ pool }); const notifications = createNotificationService({ sourceStore: store, projectionStore, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) }); const workspace = createWorkspaceQueryService({ reader: createPostgresWorkspaceReader({ pool }) });
  const transport = { authenticate: auth.authenticate, auth, readiness, platform, catalog, productDevelopment, productSpecification, measurements, partners, collaboration, orders, notifications, workspace }; const baseHandler = createWholesaleHttpHandler(transport); const baseFetchHandler = createWholesaleFetchHandler(transport); const handler = createTechPackArtifactHttpHandler({ baseHandler, authenticate: auth.authenticate, artifactService: techPackArtifacts }); const fetchHandler = createTechPackArtifactFetchHandler({ baseHandler: baseFetchHandler, authenticate: auth.authenticate, artifactService: techPackArtifacts });
  return Object.freeze({ auth, readiness, store, catalogStore, productSpecificationStore, measurementStore, techPackArtifactStore, platform, catalog, productDevelopment, productSpecification, measurements, techPackArtifacts, partners, collaboration, orders, notifications, workspace, handler, fetchHandler });
}
