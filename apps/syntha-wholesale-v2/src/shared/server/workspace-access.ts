import { headers } from 'next/headers';

import type { CommercialOperationsPermission } from '@/modules/commercial-execution';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';

export async function requireWorkspaceAccess(permission: CommercialOperationsPermission) {
  const incoming = await headers();
  const requestHeaders = new Headers();
  incoming.forEach((value, key) => requestHeaders.set(key, value));

  return requireCommercialApiAccess(
    new Request('http://syntha.internal/workspace', { headers: requestHeaders }),
    permission,
  );
}
