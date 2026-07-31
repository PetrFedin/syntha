import { invariant } from '../core/errors.mjs';
import { createWholesalePlatform } from '../application/platform.mjs';
import { createPartnerAccessService } from '../application/partner-access-service.mjs';
import { createShowroomSelectionService } from '../application/showroom-selection-service.mjs';
import { createOrderBuilderService } from '../application/order-builder-service.mjs';
import { createNotificationService } from '../application/notification-service.mjs';
import { createWorkspaceQueryService } from '../application/workspace-query-service.mjs';
import { createPostgresWholesaleStore } from '../infrastructure/postgres-store.mjs';
import { createPostgresNotificationProjectionStore } from '../infrastructure/postgres-notification-projection-store.mjs';
import { createPostgresWorkspaceReader } from '../infrastructure/postgres-workspace-reader.mjs';
import { createWholesaleHttpHandler } from '../http/api.mjs';
import { createWholesaleFetchHandler } from '../http/fetch-api.mjs';

export function createPostgresWholesaleRuntime({ pool, authenticate, clock, nextId } = {}) {
  invariant(pool, 'POSTGRES_POOL_REQUIRED', 'PostgreSQL pool is required');
  invariant(typeof authenticate === 'function', 'HTTP_AUTHENTICATOR_REQUIRED', 'Runtime authenticator is required');
  const store = createPostgresWholesaleStore({ pool });
  const options = { store, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) };
  const platform = createWholesalePlatform(options);
  const partners = createPartnerAccessService(options);
  const collaboration = createShowroomSelectionService(options);
  const orders = createOrderBuilderService(options);
  const projectionStore = createPostgresNotificationProjectionStore({ pool });
  const notifications = createNotificationService({ sourceStore: store, projectionStore, ...(clock ? { clock } : {}), ...(nextId ? { nextId } : {}) });
  const workspace = createWorkspaceQueryService({ reader: createPostgresWorkspaceReader({ pool }) });
  const transport = { authenticate, platform, partners, collaboration, orders, notifications, workspace };
  const handler = createWholesaleHttpHandler(transport);
  const fetchHandler = createWholesaleFetchHandler(transport);
  return Object.freeze({ store, projectionStore, platform, partners, collaboration, orders, notifications, workspace, handler, fetchHandler });
}
